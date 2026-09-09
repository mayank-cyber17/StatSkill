"""
YouTube Video Discovery Service
- Searches YouTube Data API v3 for the best educational video for a given topic
- Uses an in-memory TTL cache (no Redis dependency) keyed by normalized topic
- Falls back through 3 progressively simplified queries before giving up
- Ranks results by educational quality, duration, and keyword relevance
"""

import re
import time
import logging
from typing import Optional
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Simple in-memory TTL cache  (thread-safe for single-process uvicorn)
# ---------------------------------------------------------------------------
_cache: dict = {}              # {normalized_topic: {"data": ..., "expires_at": float}}
_CACHE_TTL = 3600              # 1 hour
_CACHE_MAX_SIZE = 500


def _cache_get(key: str) -> Optional[dict]:
    entry = _cache.get(key)
    if entry and time.time() < entry["expires_at"]:
        return entry["data"]
    if entry:
        _cache.pop(key, None)
    return None


def _cache_set(key: str, data: dict) -> None:
    if len(_cache) >= _CACHE_MAX_SIZE:
        oldest = min(_cache, key=lambda k: _cache[k]["expires_at"])
        _cache.pop(oldest, None)
    _cache[key] = {"data": data, "expires_at": time.time() + _CACHE_TTL}


# ---------------------------------------------------------------------------
# Duration helpers
# ---------------------------------------------------------------------------
_ISO_DURATION_RE = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", re.IGNORECASE)


def _parse_iso_duration(iso: str) -> int:
    """Convert ISO 8601 duration (PT1H12M34S) to total seconds."""
    m = _ISO_DURATION_RE.match(iso or "")
    if not m:
        return 0
    h, mn, s = (int(x or 0) for x in m.groups())
    return h * 3600 + mn * 60 + s


def _format_duration(seconds: int) -> str:
    if seconds <= 0:
        return "Unknown"
    h, rem = divmod(seconds, 3600)
    mn, s = divmod(rem, 60)
    if h:
        return f"{h}h {mn}m"
    return f"{mn}m {s}s"


# ---------------------------------------------------------------------------
# Query generation
# ---------------------------------------------------------------------------
EDUCATIONAL_KEYWORDS = [
    "tutorial", "course", "lecture", "learn", "explained",
    "introduction", "beginner", "guide", "masterclass", "training"
]

CREDIBLE_CHANNEL_KEYWORDS = [
    "university", "academy", "institute", "official", "freecodecamp",
    "khan", "edx", "coursera", "mit", "stanford", "nptel", "udemy",
    "programming", "tech", "data", "analytics", "statistics"
]


def _extract_video_id(text: str) -> Optional[str]:
    """Extract YouTube video ID if the input is a URL or direct 11-character ID."""
    text = text.strip()
    # Direct 11-character ID
    if re.match(r"^[a-zA-Z0-9_-]{11}$", text):
        return text
    # youtube.com/watch?v=ID
    m = re.search(r"(?:v=|\/embed\/|\/v\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})", text)
    if m:
        return m.group(1)
    return None


def _generate_queries(topic: str) -> list:
    topic = topic.strip()
    # Strip leading lesson/chapter numbers like "1. ", "Lesson 2: ", "L1 - "
    clean = re.sub(r"^\s*(\d+[\.\:\-]\s*|lesson\s*\d+[\.\:\-]?\s*|l\d+[\.\:\-]\s*)", "", topic, flags=re.IGNORECASE).strip()
    clean = re.sub(r"\s*\([^)]*\)", "", clean).strip()
    if not clean:
        clean = topic

    queries = [
        f"{clean} tutorial",
        f"{clean} full course",
    ]
    words = [w for w in clean.split() if len(w) > 2][:4]
    if words:
        short = " ".join(words)
        if short.lower() != clean.lower():
            queries.append(f"{short} tutorial explained")
    queries.append(clean)
    return list(dict.fromkeys(queries))



# ---------------------------------------------------------------------------
# Video scoring / ranking
# ---------------------------------------------------------------------------
def _score_video(snippet: dict, content_details: dict, topic: str) -> float:
    score = 0.0
    title = (snippet.get("title") or "").lower()
    description = (snippet.get("description") or "").lower()
    channel = (snippet.get("channelTitle") or "").lower()
    topic_words = set(topic.lower().split())

    if any(kw in title for kw in EDUCATIONAL_KEYWORDS):
        score += 30

    title_words = set(re.findall(r"\w+", title))
    overlap = len(topic_words & title_words) / max(len(topic_words), 1)
    score += overlap * 20

    if any(kw in channel for kw in CREDIBLE_CHANNEL_KEYWORDS):
        score += 15

    duration_secs = _parse_iso_duration(content_details.get("duration", ""))
    if 300 <= duration_secs <= 1800:
        score += 20
    elif 1800 < duration_secs <= 7200:
        score += 12
    elif duration_secs < 120:
        score -= 25
    elif duration_secs > 14400:
        score -= 5

    desc_words = set(re.findall(r"\w+", description))
    desc_overlap = len(topic_words & desc_words) / max(len(topic_words), 1)
    score += desc_overlap * 10

    non_edu = ["trailer", "review", "vlog", "gameplay", "music", "song", "movie"]
    if any(kw in title for kw in non_edu):
        score -= 20

    return max(score, 0.0)


# ---------------------------------------------------------------------------
# Main service class
# ---------------------------------------------------------------------------
class YouTubeVideoService:
    YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
    YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
    MAX_SEARCH_RESULTS = 10

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.YOUTUBE_API_KEY

    def _normalize(self, topic: str) -> str:
        return re.sub(r"\s+", " ", topic.strip().lower())

    async def search_video(self, topic: str) -> Optional[dict]:
        normalized = self._normalize(topic)

        cached = _cache_get(normalized)
        if cached is not None:
            logger.info(f"[YouTube] cache hit for: {normalized!r}")
            return cached

        # Check if topic itself is a direct YouTube URL or 11-char video ID
        direct_id = _extract_video_id(topic)
        if direct_id:
            logger.info(f"[YouTube] Direct video ID detected: {direct_id}")
            result = await self._fetch_direct_video(direct_id, topic)
            if result:
                _cache_set(normalized, result)
                return result

        queries = _generate_queries(topic)
        logger.info(f"[YouTube] searching for: {topic!r} with {len(queries)} queries")

        if self.api_key and self.api_key not in ("", "YOUR_YOUTUBE_API_KEY_HERE"):
            async with httpx.AsyncClient(timeout=10.0) as client:
                for i, query in enumerate(queries):
                    try:
                        result = await self._search_and_rank(client, query, topic)
                        if result:
                            _cache_set(normalized, result)
                            logger.info(f"[YouTube] found on query #{i+1}: {result['videoId']!r}")
                            return result
                    except httpx.HTTPStatusError as exc:
                        status = exc.response.status_code
                        if status in (400, 403):
                            logger.warning(
                                f"[YouTube] API key error ({status}) — falling back to educational library"
                            )
                            break
                        logger.error(f"[YouTube] query #{i+1} HTTP {status}: {exc}")
                    except Exception as exc:
                        logger.error(f"[YouTube] query #{i+1} failed: {exc}")

        # Fallback to curated educational catalog so user's video player never shows broken UI
        fallback = self._get_educational_fallback(topic)
        if fallback:
            _cache_set(normalized, fallback)
            return fallback

        logger.warning(f"[YouTube] no suitable video found for: {topic!r}")
        return None

    async def _fetch_direct_video(self, video_id: str, original_topic: str) -> dict:
        title = original_topic
        channel = "YouTube"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json")
                if resp.status_code == 200:
                    data = resp.json()
                    title = data.get("title", original_topic)
                    channel = data.get("author_name", "YouTube")
        except Exception:
            pass

        return {
            "topic": original_topic,
            "videoId": video_id,
            "title": title,
            "channelTitle": channel,
            "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
            "durationSeconds": 900,
            "durationFormatted": "Curated Video",
            "youtubeUrl": f"https://www.youtube.com/watch?v={video_id}",
            "embedUrl": f"https://www.youtube-nocookie.com/embed/{video_id}?rel=0&modestbranding=1",
            "score": 100.0,
            "alternatives": [],
        }

    def _get_educational_fallback(self, topic: str) -> dict:
        t = topic.lower()
        if any(w in t for w in ["survey", "sample", "sampling", "strata", "cluster", "nss", "deff"]):
            best_id = "xxpc-HPKN28"
            title = "Sampling Methods: Simple Random, Stratified, Cluster, Systematic"
            channel = "Dr Nic's Maths and Stats"
            alt = [
                {"videoId": "pTuj57uXWiI", "title": "Stratified Sampling vs Cluster Sampling", "channelTitle": "Khan Academy"},
                {"videoId": "qBigTkBLU6g", "title": "Introduction to Survey Sampling Methodology", "channelTitle": "Statistics Learning"}
            ]
        elif any(w in t for w in ["wrangl", "clean", "pandas", "data frame", "dataframe", "csv"]):
            best_id = "bDhvCp3_lYw"
            title = "Data Cleaning in Pandas | Complete Python Tutorial"
            channel = "Alex The Analyst"
            alt = [
                {"videoId": "vmEHCJofslg", "title": "Pandas Full Course: Data Analysis with Python", "channelTitle": "freeCodeCamp.org"},
                {"videoId": "WcDaZ67TVRo", "title": "Data Analysis with Python for Excel Users", "channelTitle": "freeCodeCamp.org"}
            ]
        elif any(w in t for w in ["regress", "econometric", "ols", "linear", "model"]):
            best_id = "PaFPbb8v0o4"
            title = "StatQuest: Linear Models Pt.1 - Linear Regression"
            channel = "StatQuest with Josh Starmer"
            alt = [
                {"videoId": "nk2CQITm_ei", "title": "Multiple Regression in Python and Statsmodels", "channelTitle": "DataCamp"},
                {"videoId": "0oc49DyA3hU", "title": "Hypothesis Testing Statistics Problems & Examples", "channelTitle": "The Organic Chemistry Tutor"}
            ]
        elif any(w in t for w in ["index", "cpi", "wpi", "deflator", "national account", "gdp", "macro"]):
            best_id = "2VbO9k8XW9Q"
            title = "Understanding Inflation and Consumer Price Index (CPI) | Economics",
            channel = "Khan Academy"
            alt = [
                {"videoId": "WcDaZ67TVRo", "title": "Economic Data Analysis with Python", "channelTitle": "freeCodeCamp.org"}
            ]
        elif any(w in t for w in ["machine learning", "ai", "predict", "classifier", "neural"]):
            best_id = "i_LwzRVP7bg"
            title = "Machine Learning for Everybody – Full Course"
            channel = "freeCodeCamp.org"
            alt = [
                {"videoId": "Gv9_4yMHFhI", "title": "Machine Learning Explained", "channelTitle": "StatQuest with Josh Starmer"}
            ]
        else:
            best_id = "r-uOLxNrNk8"
            title = "Data Analysis with Python - Full Course for Beginners"
            channel = "freeCodeCamp.org"
            alt = [
                {"videoId": "WcDaZ67TVRo", "title": "Data Analysis with Python for Excel Users", "channelTitle": "freeCodeCamp.org"},
                {"videoId": "vmEHCJofslg", "title": "Pandas Full Course for Data Science", "channelTitle": "freeCodeCamp.org"}
            ]

        def _fmt(item):
            vid = item["videoId"]
            return {
                "videoId": vid,
                "title": item["title"],
                "channelTitle": item["channelTitle"],
                "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
                "durationSeconds": 1800,
                "durationFormatted": "Curated",
                "youtubeUrl": f"https://www.youtube.com/watch?v={vid}",
                "embedUrl": f"https://www.youtube-nocookie.com/embed/{vid}?rel=0&modestbranding=1",
                "score": 85.0,
            }

        return {
            "topic": topic,
            **_fmt({"videoId": best_id, "title": title, "channelTitle": channel}),
            "alternatives": [_fmt(a) for a in alt],
        }


    async def _search_and_rank(self, client, query: str, original_topic: str) -> Optional[dict]:
        search_resp = await client.get(
            self.YOUTUBE_SEARCH_URL,
            params={
                "part": "snippet",
                "q": query,
                "type": "video",
                "videoEmbeddable": "true",
                "videoSyndicated": "true",
                "safeSearch": "strict",
                "relevanceLanguage": "en",
                "order": "relevance",
                "maxResults": self.MAX_SEARCH_RESULTS,
                "key": self.api_key,
            },
        )
        search_resp.raise_for_status()
        search_data = search_resp.json()

        items = search_data.get("items", [])
        if not items:
            return None

        video_ids = [it["id"]["videoId"] for it in items if it.get("id", {}).get("videoId")]
        if not video_ids:
            return None

        videos_resp = await client.get(
            self.YOUTUBE_VIDEOS_URL,
            params={
                "part": "contentDetails,status",
                "id": ",".join(video_ids),
                "key": self.api_key,
            },
        )
        videos_resp.raise_for_status()
        details_map = {v["id"]: v for v in videos_resp.json().get("items", [])}

        candidates = []
        for item in items:
            vid_id = item.get("id", {}).get("videoId")
            if not vid_id:
                continue
            detail = details_map.get(vid_id, {})
            status = detail.get("status", {})
            if not status.get("embeddable", True):
                continue
            content_details = detail.get("contentDetails", {})
            snippet = item.get("snippet", {})
            score = _score_video(snippet, content_details, original_topic)
            candidates.append((score, vid_id, snippet, content_details))

        if not candidates:
            return None

        candidates.sort(key=lambda x: x[0], reverse=True)

        def _build(score, vid_id, snippet, content_details):
            dur_secs = _parse_iso_duration(content_details.get("duration", ""))
            thumb = (
                snippet.get("thumbnails", {}).get("high", {}).get("url")
                or snippet.get("thumbnails", {}).get("default", {}).get("url")
                or f"https://i.ytimg.com/vi/{vid_id}/hqdefault.jpg"
            )
            return {
                "videoId": vid_id,
                "title": snippet.get("title", ""),
                "channelTitle": snippet.get("channelTitle", ""),
                "thumbnail": thumb,
                "durationSeconds": dur_secs,
                "durationFormatted": _format_duration(dur_secs),
                "youtubeUrl": f"https://www.youtube.com/watch?v={vid_id}",
                "embedUrl": f"https://www.youtube-nocookie.com/embed/{vid_id}?rel=0&modestbranding=1",
                "score": round(score, 1),
            }

        best = _build(*candidates[0])
        alternatives = [_build(*c) for c in candidates[1:3]]

        return {
            "topic": original_topic,
            **best,
            "alternatives": alternatives,
        }
