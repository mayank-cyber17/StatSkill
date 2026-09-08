"""
GET /api/v1/learning-video?topic=<course title>

Public endpoint (no auth required) that:
  1. Validates the topic string
  2. Calls YouTubeVideoService to find the best embeddable video
  3. Returns structured video metadata OR a graceful fallback search URL
  4. Never raises 5xx — course pages must never break because of video search failure
"""

import logging
import urllib.parse
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from app.services.youtube_service import YouTubeVideoService

router = APIRouter()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Simple per-IP rate limiter (in-memory, resets on process restart)
# ---------------------------------------------------------------------------
import time
_rate_store: dict = {}   # {ip: {"count": int, "window_start": float}}
_RATE_LIMIT = 120        # requests per hour per IP
_RATE_WINDOW = 3600      # 1 hour window


def _check_rate_limit(ip: str) -> bool:
    """Return True if the IP is within the allowed rate limit."""
    now = time.time()
    entry = _rate_store.get(ip)
    if not entry or (now - entry["window_start"]) > _RATE_WINDOW:
        _rate_store[ip] = {"count": 1, "window_start": now}
        return True
    if entry["count"] >= _RATE_LIMIT:
        return False
    entry["count"] += 1
    return True


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.get("")
async def get_learning_video(
    request: Request,
    topic: str = Query(..., min_length=3, max_length=200, description="Course/topic name to search for"),
):
    """
    Search for the best educational YouTube video for the given topic.
    Returns video metadata on success, or a fallback search URL if no video is found.
    This endpoint never returns a 5xx error so frontend course pages are never broken.
    """
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(client_ip):
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limited",
                "message": "Too many requests. Please try again later.",
                "videoId": None,
                "fallbackSearchUrl": _youtube_search_url(topic),
            }
        )

    try:
        service = YouTubeVideoService()
        result = await service.search_video(topic)

        if result:
            return {
                "success": True,
                "cached": False,   # service logs cache hits; we expose this for debugging
                **result,
            }
        else:
            # Graceful fallback: no video found or API key missing
            return {
                "success": False,
                "topic": topic,
                "videoId": None,
                "fallbackSearchUrl": _youtube_search_url(topic),
                "message": "No suitable video found. Use the search link to find videos manually.",
            }

    except Exception as exc:
        logger.error(f"[learning-video] unexpected error for topic {topic!r}: {exc}", exc_info=True)
        return {
            "success": False,
            "topic": topic,
            "videoId": None,
            "fallbackSearchUrl": _youtube_search_url(topic),
            "message": "Video search temporarily unavailable.",
        }


def _youtube_search_url(topic: str) -> str:
    query = urllib.parse.quote_plus(f"{topic} tutorial")
    return f"https://www.youtube.com/results?search_query={query}"
