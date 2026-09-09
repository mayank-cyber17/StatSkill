import React, { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { learningVideoAPI } from "../../services/api"
import {
  Play, ExternalLink, RefreshCw, TvMinimalPlay, Loader2,
  ChevronRight, Clock, Tv2, Search, Sparkles, Video, CheckCircle2, ListVideo
} from "lucide-react"

/**
 * LearningVideo — Interactive YouTube video discovery & player component
 *
 * Props:
 *   topic        {string}  required — default topic/course name
 *   lessonTitle  {string}  optional — current active lesson title
 *   className    {string}  optional — extra styling wrapper classes
 */
export default function LearningVideo({ topic, lessonTitle, className = "" }) {
  // Use activeTopic state so user can search for any topic on YouTube directly
  const [activeTopic, setActiveTopic] = useState(lessonTitle || topic || "")
  const [searchInput, setSearchInput] = useState(lessonTitle || topic || "")
  const [altIndex, setAltIndex] = useState(-1)   // -1 = primary video
  const [iframeKey, setIframeKey] = useState(0)  // force iframe remount on video change
  const [showAlternatives, setShowAlternatives] = useState(false)

  // Sync with prop changes when user navigates lessons
  useEffect(() => {
    const nextTopic = lessonTitle || topic || ""
    setActiveTopic(nextTopic)
    setSearchInput(nextTopic)
    setAltIndex(-1)
    setIframeKey((k) => k + 1)
  }, [topic, lessonTitle])

  const { data: res, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["learning-video", activeTopic],
    queryFn: () => learningVideoAPI.getVideo(activeTopic),
    enabled: !!activeTopic && activeTopic.trim().length > 0,
    staleTime: 1000 * 60 * 30,  // 30 mins
    retry: 1,
  })

  const payload = res?.data || null
  const hasVideo = payload?.videoId != null
  const alternatives = payload?.alternatives || []

  // Resolve which video to show
  const activeVideo =
    altIndex === -1
      ? payload
      : alternatives[altIndex] ?? payload

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    const trimmed = searchInput.trim()
    if (!trimmed) return
    setActiveTopic(trimmed)
    setAltIndex(-1)
    setIframeKey((k) => k + 1)
  }

  const handleSelectVideo = (index) => {
    setAltIndex(index)
    setIframeKey((k) => k + 1)
  }

  const handleFindAnother = () => {
    const nextIdx = altIndex + 1
    if (nextIdx < alternatives.length) {
      setAltIndex(nextIdx)
      setIframeKey((k) => k + 1)
    } else {
      setAltIndex(-1)
      setIframeKey((k) => k + 1)
      refetch()
    }
  }

  // Quick suggestion chips based on current context
  const suggestionChips = [
    lessonTitle && lessonTitle !== activeTopic ? { label: "Current Lesson", query: lessonTitle } : null,
    topic && topic !== activeTopic ? { label: "Course Overview", query: topic } : null,
    { label: "Hands-on Tutorial", query: `${activeTopic} tutorial practical` },
    { label: "Full Course", query: `${activeTopic} complete course` },
  ].filter(Boolean)

  const embedUrl = activeVideo?.videoId
    ? `https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&playsinline=1`
    : activeVideo?.embedUrl

  return (
    <div className={`relative flex flex-col bg-surface-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* ── Search & Topic Bar ── */}
      <div className="bg-surface-950/90 border-b border-white/10 p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Interactive Learning Video
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                Search any topic on YouTube to play related video
              </span>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search topic or paste YouTube link..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-800 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isFetching || !searchInput.trim()}
              className="btn btn-primary btn-sm text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0 shadow-glow disabled:opacity-50"
            >
              {isLoading || isFetching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Suggestion Chips */}
        {suggestionChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quick Topics:</span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchInput(chip.query)
                  setActiveTopic(chip.query)
                  setAltIndex(-1)
                }}
                className="px-2.5 py-1 rounded-md bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white border border-white/5 text-[11px] font-medium transition-all flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-brand-400" />
                <span className="truncate max-w-[180px]">{chip.query}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Video Display Area ── */}
      {isLoading || isFetching ? (
        <div className="relative aspect-video bg-surface-950 flex flex-col items-center justify-center gap-4 p-6">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/60 to-surface-950/80 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
            <div>
              <div className="text-sm font-semibold text-white">Searching YouTube...</div>
              <div className="text-xs text-slate-400 mt-0.5">Finding best educational video for "{activeTopic}"</div>
            </div>
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-brand-500/60 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      ) : !hasVideo || isError ? (
        <div className="relative aspect-video bg-surface-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-slate-400">
            <TvMinimalPlay className="w-7 h-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-white">No Direct Embed Found for "{activeTopic}"</h4>
            <p className="text-xs text-slate-400">
              Try searching with simpler terms above, or open the related search directly on YouTube.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeTopic + " tutorial")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <Youtube className="w-3.5 h-3.5" /> Search on YouTube <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => {
                setActiveTopic("Python for Data Analysis")
                setSearchInput("Python for Data Analysis")
              }}
              className="btn btn-secondary btn-sm text-xs"
            >
              Load Recommended Video
            </button>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={activeVideo.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {/* ── Video Metadata & Alternative Controls Bar ── */}
      {hasVideo && activeVideo && (
        <div className="bg-surface-900/95 border-t border-white/10 p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                {activeVideo.title}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Tv2 className="w-3.5 h-3.5 text-brand-400" />
                  {activeVideo.channelTitle}
                </span>
                {activeVideo.durationFormatted && activeVideo.durationFormatted !== "Unknown" && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {activeVideo.durationFormatted}
                  </span>
                )}
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Verified Educational Video
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 py-1 px-3"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Watch on YouTube
              </a>

              {alternatives.length > 0 && (
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className={`btn btn-sm text-xs flex items-center gap-1.5 py-1 px-3 border transition-colors ${
                    showAlternatives
                      ? "bg-brand-500 text-white border-brand-400"
                      : "btn-ghost text-brand-300 border-brand-500/30 hover:bg-brand-500/10"
                  }`}
                >
                  <ListVideo className="w-3.5 h-3.5" />
                  Related Videos ({alternatives.length + 1})
                </button>
              )}

              <button
                onClick={handleFindAnother}
                className="btn btn-ghost btn-sm text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 py-1 px-2.5"
                title="Cycle to next video"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Next
              </button>
            </div>
          </div>

          {/* Alternative Videos Selector Dropdown */}
          {showAlternatives && alternatives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 grid sm:grid-cols-3 gap-2.5">
              {/* Primary Video option */}
              <button
                onClick={() => handleSelectVideo(-1)}
                className={`p-2 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                  altIndex === -1
                    ? "bg-brand-500/20 border-brand-500/60 ring-1 ring-brand-500"
                    : "bg-surface-800/80 border-white/5 hover:bg-surface-700/80"
                }`}
              >
                <img
                  src={payload.thumbnail}
                  alt={payload.title}
                  className="w-16 h-10 object-cover rounded shrink-0 bg-surface-950"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-white line-clamp-1 block">
                    {payload.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {payload.channelTitle}
                  </span>
                  {altIndex === -1 && (
                    <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider block mt-0.5">
                      Now Playing
                    </span>
                  )}
                </div>
              </button>

              {/* Alternatives */}
              {alternatives.map((alt, idx) => (
                <button
                  key={alt.videoId || idx}
                  onClick={() => handleSelectVideo(idx)}
                  className={`p-2 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    altIndex === idx
                      ? "bg-brand-500/20 border-brand-500/60 ring-1 ring-brand-500"
                      : "bg-surface-800/80 border-white/5 hover:bg-surface-700/80"
                  }`}
                >
                  <img
                    src={alt.thumbnail}
                    alt={alt.title}
                    className="w-16 h-10 object-cover rounded shrink-0 bg-surface-950"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-white line-clamp-1 block">
                      {alt.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {alt.channelTitle}
                    </span>
                    {altIndex === idx && (
                      <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider block mt-0.5">
                        Now Playing
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Lesson Subtitle strip */}
          {lessonTitle && (
            <div className="bg-surface-800/60 rounded-lg px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-2 border border-white/5">
              <ChevronRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">Active Curriculum Module: <strong className="text-white">{lessonTitle}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
