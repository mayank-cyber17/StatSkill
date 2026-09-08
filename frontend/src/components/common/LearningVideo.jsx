import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { learningVideoAPI } from "../../services/api"
import {
  Play, ExternalLink, RefreshCw, TvMinimalPlay, Loader2,
  ChevronRight, Clock, Tv2
} from "lucide-react"

/**
 * LearningVideo — Smart YouTube video discovery component
 *
 * Props:
 *   topic        {string}  required — course/topic name fed to backend search
 *   lessonTitle  {string}  optional — shown as the video sub-title
 *   className    {string}  optional — extra Tailwind classes for the wrapper
 */
export default function LearningVideo({ topic, lessonTitle, className = "" }) {
  const [altIndex, setAltIndex] = useState(-1)   // -1 = primary video
  const [iframeKey, setIframeKey] = useState(0)  // force iframe remount on "find another"

  const { data: res, isLoading, isError, refetch } = useQuery({
    queryKey: ["learning-video", topic],
    queryFn: () => learningVideoAPI.getVideo(topic),
    enabled: !!topic,
    staleTime: 1000 * 60 * 60,  // 1 hour — matches backend TTL
    retry: 1,
  })

  const payload = res?.data || null
  const hasVideo = payload?.videoId != null

  // Resolve which video to show (primary or an alternative)
  const alternatives = payload?.alternatives || []
  const activeVideo =
    altIndex === -1
      ? payload
      : alternatives[altIndex] ?? payload

  const handleFindAnother = () => {
    const nextIdx = altIndex + 1
    if (nextIdx < alternatives.length) {
      setAltIndex(nextIdx)
      setIframeKey((k) => k + 1)
    } else {
      // Cycled through all alternatives — refetch from backend
      setAltIndex(-1)
      setIframeKey((k) => k + 1)
      refetch()
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`relative aspect-video bg-surface-950 rounded-none flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/60 to-surface-950/80 pointer-events-none rounded-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
          <div className="text-center space-y-1">
            <div className="text-sm font-semibold text-white">Finding Best Video...</div>
            <div className="text-xs text-slate-400">Searching YouTube for "{topic}"</div>
          </div>
          {/* Animated shimmer bars */}
          <div className="w-64 space-y-2 mt-2">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500/30 rounded-full animate-shimmer w-3/4" />
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500/20 rounded-full animate-shimmer w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error or no video found — fallback UI ─────────────────────────────────
  if (isError || !hasVideo) {
    const fallbackUrl =
      payload?.fallbackSearchUrl ||
      `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial")}`

    return (
      <div className={`relative aspect-video bg-surface-950 flex flex-col items-center justify-center gap-4 p-6 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-900/60 to-surface-950/80 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center">
            <TvMinimalPlay className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-1">
              {isError ? "Video Search Unavailable" : "No Video Found"}
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              {isError
                ? "The video discovery service is temporarily unavailable."
                : `No embeddable video found for "${topic}".`}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <TvMinimalPlay className="w-3.5 h-3.5" />
              Search on YouTube
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <button
              onClick={() => { setAltIndex(-1); refetch() }}
              className="btn btn-ghost btn-sm w-full sm:w-auto flex items-center justify-center gap-2 text-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Video found — embed player ────────────────────────────────────────────
  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* IFrame wrapper — aspect-video forces 16:9 */}
      <div className="relative aspect-video bg-black">
        <iframe
          key={iframeKey}
          src={activeVideo.embedUrl}
          title={activeVideo.title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* Video meta-info bar */}
      <div className="bg-surface-900/90 backdrop-blur-md border-t border-white/10 px-4 py-3 space-y-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white leading-snug line-clamp-2">
              {activeVideo.title}
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Tv2 className="w-3 h-3" />
                {activeVideo.channelTitle}
              </span>
              {activeVideo.durationFormatted && activeVideo.durationFormatted !== "Unknown" && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeVideo.durationFormatted}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={activeVideo.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 border border-white/10 py-1.5 px-3"
          >
            <ExternalLink className="w-3 h-3" />
            Watch on YouTube
          </a>

          {(alternatives.length > 0 || true) && (
            <button
              onClick={handleFindAnother}
              className="btn btn-ghost btn-sm text-[11px] text-brand-300 hover:text-white flex items-center gap-1.5 border border-brand-500/20 py-1.5 px-3"
            >
              <RefreshCw className="w-3 h-3" />
              Find Another Video
              {alternatives.length > 0 && altIndex < alternatives.length - 1 && (
                <span className="text-[10px] text-slate-500">
                  ({alternatives.length - altIndex - 1} more)
                </span>
              )}
            </button>
          )}

          <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            AI-matched video
          </div>
        </div>
      </div>

      {/* Lesson sub-title strip (optional) */}
      {lessonTitle && (
        <div className="bg-surface-800/60 border-t border-white/5 px-4 py-2 text-[11px] text-slate-400 flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-brand-400 shrink-0" />
          <span className="truncate">{lessonTitle}</span>
        </div>
      )}
    </div>
  )
}
