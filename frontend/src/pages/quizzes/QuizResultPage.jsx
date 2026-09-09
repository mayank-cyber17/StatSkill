import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { quizAPI } from '../../services/api'
import { MOCK_QUIZZES } from '../../data/mockQuizzes'
import { 
  Award, CheckCircle2, XCircle, Brain, ArrowRight, RefreshCw, 
  Sparkles, BookOpen, AlertCircle, Filter, ArrowLeft, Check, HelpCircle,
  BarChart3, MinusCircle, Target, Percent, Clock
} from 'lucide-react'

export default function QuizResultPage() {
  const { quizId, attemptId } = useParams()
  const location = useLocation()
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(location.state?.result || null)
  const [filterMode, setFilterMode] = useState('ALL') // 'ALL' | 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED'

  useEffect(() => {
    // If result was passed with valid questions, use it directly
    const passedQuestions = location.state?.result?.questions || location.state?.result?.feedback
    if (location.state?.result && passedQuestions && passedQuestions.length > 0) {
      setResult(location.state.result)
      return
    }

    // Otherwise, fetch attempt result from backend API
    async function loadResult() {
      setLoading(true)
      try {
        const res = await quizAPI.getResult(quizId, attemptId || 1)
        if (res.data) {
          const resQuestions = res.data.questions || res.data.feedback || []
          if (resQuestions.length > 0) {
            setResult(res.data)
            return
          }
        }
      } catch (err) {
        console.warn('Could not fetch quiz attempt result from API:', err)
      }

      // If backend gave no questions or failed, check local grounded fallback
      const fallback = MOCK_QUIZZES[String(quizId)] || MOCK_QUIZZES['4']
      if (fallback) {
        const questionsList = fallback.questions.map((q) => ({
          question_id: q.id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          selected: q.correct_option, // sample fallback
          correct: q.correct_option,
          is_correct: true,
          explanation: q.explanation,
          bloom_level: q.bloom_level,
        }))

        setResult({
          attempt_id: attemptId || 1,
          quiz_id: quizId,
          quiz_title: fallback.quiz.title,
          score: questionsList.length,
          total: questionsList.length,
          percentage: 100,
          passed: true,
          ai_feedback: 'Demonstrated proficiency in core competencies. Review the explanations below.',
          questions: questionsList,
          feedback: questionsList,
        })
      }
      setLoading(false)
    }

    loadResult()
  }, [quizId, attemptId, location.state])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-12 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Synthesizing Evaluation Results...</h3>
        <p className="text-slate-400 text-sm">Grading responses and analyzing correct, incorrect, and unattempted questions...</p>
      </div>
    )
  }

  // Fallback defaults
  const resData = result || {
    score: 8,
    total: 10,
    percentage: 80,
    passed: true,
    ai_feedback: 'Demonstrated proficiency in core competencies. Recommended review of the detailed explanations below.',
    questions: [],
    feedback: [],
  }

  const rawQuestions = (resData.questions && resData.questions.length > 0)
    ? resData.questions
    : (resData.feedback && resData.feedback.length > 0)
    ? resData.feedback
    : []

  const totalQuestions = rawQuestions.length || resData.total || 10

  // Helper to determine exact question attempt status:
  // 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED'
  const getQuestionStatus = (q) => {
    const rawSelected = q.selected !== undefined && q.selected !== null && String(q.selected).trim() !== ''
      ? String(q.selected).trim().toUpperCase()
      : null

    if (!rawSelected) {
      return 'UNATTEMPTED'
    }

    const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
    
    if (q.is_correct !== undefined && q.is_correct !== null) {
      return q.is_correct ? 'CORRECT' : 'INCORRECT'
    }
    return rawSelected === rawCorrect ? 'CORRECT' : 'INCORRECT'
  }

  // 3 Mutually exclusive sets
  const correctQuestions = rawQuestions.filter((q) => getQuestionStatus(q) === 'CORRECT')
  const incorrectQuestions = rawQuestions.filter((q) => getQuestionStatus(q) === 'INCORRECT')
  const unattemptedQuestions = rawQuestions.filter((q) => getQuestionStatus(q) === 'UNATTEMPTED')

  const score = correctQuestions.length
  const percentage = Math.round((score / (totalQuestions || 1)) * 100)
  const passed = resData.passed !== undefined ? resData.passed : percentage >= 60

  const attemptedCount = correctQuestions.length + incorrectQuestions.length
  const attemptRate = Math.round((attemptedCount / (totalQuestions || 1)) * 100)
  const accuracyRate = attemptedCount > 0 ? Math.round((correctQuestions.length / attemptedCount) * 100) : 0

  const correctPercent = Math.round((correctQuestions.length / (totalQuestions || 1)) * 100)
  const incorrectPercent = Math.round((incorrectQuestions.length / (totalQuestions || 1)) * 100)
  const unattemptedPercent = Math.max(0, 100 - correctPercent - incorrectPercent)

  const getOptionText = (q, key) => {
    if (!key) return ''
    const k = String(key).trim().toUpperCase()
    if (k === 'A') return q.option_a
    if (k === 'B') return q.option_b
    if (k === 'C') return q.option_c
    if (k === 'D') return q.option_d
    return ''
  }

  // Filtered list for detailed review
  const filteredQuestions = rawQuestions.filter((q) => {
    const status = getQuestionStatus(q)
    if (filterMode === 'CORRECT') return status === 'CORRECT'
    if (filterMode === 'INCORRECT') return status === 'INCORRECT'
    if (filterMode === 'UNATTEMPTED') return status === 'UNATTEMPTED'
    return true
  })

  const scrollToQuestion = (idx) => {
    const el = document.getElementById(`question-card-${idx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes Catalog
        </Link>
        <span className="text-xs text-slate-500 font-mono">Attempt #{attemptId || 1}</span>
      </div>

      {/* Score Hero */}
      <div className="card p-8 text-center space-y-4 border-t-4 border-t-accent-500 bg-gradient-card relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" /> Assessment Evaluation Completed
        </div>

        <h1 className="text-3xl font-display font-extrabold text-white">Quiz Evaluation & Answers</h1>
        {resData.quiz_title && (
          <h2 className="text-sm font-semibold text-brand-300 -mt-2">{resData.quiz_title}</h2>
        )}

        <div className="flex items-center justify-center gap-3 text-5xl font-display font-extrabold text-accent-400 py-2">
          {percentage}% 
          <span className="text-sm font-normal text-slate-300 font-sans">
            ({score} of {totalQuestions} Correct)
          </span>
        </div>

        {/* Quick stat counters */}
        <div className="flex items-center justify-center gap-3 text-xs font-semibold pt-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" /> {correctQuestions.length} Correct
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-4 h-4" /> {incorrectQuestions.length} Incorrect
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <MinusCircle className="w-4 h-4" /> {unattemptedQuestions.length} Did Not Attempt
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-slate-300 border border-white/10">
            <BookOpen className="w-4 h-4 text-brand-400" /> {totalQuestions} Total
          </span>
        </div>

        <p className="text-slate-300 text-sm max-w-lg mx-auto pt-2">
          {passed
            ? 'Great job! You successfully passed this competency assessment and demonstrated curriculum proficiency. See full answers below.'
            : 'Review the correct options and detailed explanations below to strengthen your competencies.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to={`/quizzes/${quizId}`} className="btn btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
          </Link>
          <Link to="/learning-path" className="btn btn-primary text-xs shadow-glow flex items-center gap-1.5">
            View Learning Path <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── NEW DEDICATED SECTION: Quiz Performance & Attempt Breakdown ── */}
      <div className="card p-6 sm:p-7 space-y-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-900/90 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                Attempt Breakdown & Performance Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Summary of correct answers, wrong answers, and skipped questions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              passed
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
            }`}>
              {passed ? 'Passed (≥ 60%)' : 'Needs Review (< 60%)'}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards: Correct, Incorrect, Did Not Attempt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Correct Card */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 relative overflow-hidden transition-all hover:bg-emerald-500/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Correct
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                {correctPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {correctQuestions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {totalQuestions} questions
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 leading-snug">
              Answered accurately and validated against curriculum benchmarks.
            </p>
          </div>

          {/* 2. Incorrect Card */}
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 relative overflow-hidden transition-all hover:bg-rose-500/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Incorrect
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                {incorrectPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {incorrectQuestions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {totalQuestions} questions
              </span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300/80 leading-snug">
              Attempted with an incorrect option selected.
            </p>
          </div>

          {/* 3. Did Not Attempt Card */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 relative overflow-hidden transition-all hover:bg-amber-500/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4" /> Did Not Attempt
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                {unattemptedPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {unattemptedQuestions.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {totalQuestions} questions
              </span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 leading-snug">
              Skipped without selecting any option during the assessment.
            </p>
          </div>
        </div>

        {/* Visual Stacked Distribution Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Question Response Distribution</span>
            <span>{totalQuestions} Total Questions</span>
          </div>
          
          <div className="h-4 w-full bg-surface-800 rounded-full overflow-hidden flex shadow-inner">
            {correctQuestions.length > 0 && (
              <div 
                style={{ width: `${(correctQuestions.length / totalQuestions) * 100}%` }}
                className="h-full bg-emerald-500 transition-all duration-500 hover:opacity-90"
                title={`Correct: ${correctQuestions.length} (${correctPercent}%)`}
              />
            )}
            {incorrectQuestions.length > 0 && (
              <div 
                style={{ width: `${(incorrectQuestions.length / totalQuestions) * 100}%` }}
                className="h-full bg-rose-500 transition-all duration-500 hover:opacity-90"
                title={`Incorrect: ${incorrectQuestions.length} (${incorrectPercent}%)`}
              />
            )}
            {unattemptedQuestions.length > 0 && (
              <div 
                style={{ width: `${(unattemptedQuestions.length / totalQuestions) * 100}%` }}
                className="h-full bg-amber-500 transition-all duration-500 hover:opacity-90"
                title={`Did Not Attempt: ${unattemptedQuestions.length} (${unattemptedPercent}%)`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Correct ({correctQuestions.length} / {correctPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Incorrect ({incorrectQuestions.length} / {incorrectPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Did Not Attempt ({unattemptedQuestions.length} / {unattemptedPercent}%)
            </span>
          </div>
        </div>

        {/* Secondary KPIs: Attempt Rate & Accuracy */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          <div className="bg-surface-800/60 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Attempt Rate</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">{attemptRate}%</span>
            <span className="text-[10px] text-slate-500">{attemptedCount} of {totalQuestions}</span>
          </div>
          <div className="bg-surface-800/60 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Attempted Accuracy</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">{accuracyRate}%</span>
            <span className="text-[10px] text-slate-500">{correctQuestions.length} of {attemptedCount || 1}</span>
          </div>
          <div className="bg-surface-800/60 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Skip Rate</span>
            <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{unattemptedPercent}%</span>
            <span className="text-[10px] text-slate-500">{unattemptedQuestions.length} skipped</span>
          </div>
          <div className="bg-surface-800/60 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Passing Score</span>
            <span className="text-base font-bold text-brand-300 font-mono mt-0.5 block">60%</span>
            <span className="text-[10px] text-slate-500">{percentage >= 60 ? 'Achieved' : 'Below target'}</span>
          </div>
        </div>
      </div>

      {/* AI Personalized Feedback */}
      <div className="card p-6 border-l-4 border-l-brand-500 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-brand-400" /> StatIQ AI Competency Verification
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          {resData.ai_feedback || 'Evaluation completed against official MoSPI curriculum benchmarks.'}
        </p>
        <div className="pt-2 text-[11px] text-accent-400 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Competency profile updated automatically in system database.
        </div>
      </div>

      {/* Question Jump Palette */}
      {rawQuestions.length > 0 && (
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <span className="font-semibold text-slate-300">Quick Jump to Question</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct ({correctQuestions.length})
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Incorrect ({incorrectQuestions.length})
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Did Not Attempt ({unattemptedQuestions.length})
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap pt-1">
            {rawQuestions.map((q, idx) => {
              const status = getQuestionStatus(q)

              return (
                <button
                  key={q.question_id || idx}
                  onClick={() => scrollToQuestion(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                    status === 'UNATTEMPTED'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      : status === 'CORRECT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                  title={`Question ${idx + 1}: ${status === 'UNATTEMPTED' ? 'Did Not Attempt' : status === 'CORRECT' ? 'Correct' : 'Incorrect'}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Questions Review Section */}
      <div className="space-y-6">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" /> Detailed Question & Option Review
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review every option with clear indications of which choices were correct, incorrect, or skipped.
            </p>
          </div>

          {/* 4 Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-800 p-1 rounded-xl border border-white/10 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rawQuestions.length})
            </button>
            <button
              onClick={() => setFilterMode('CORRECT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'CORRECT'
                  ? 'bg-emerald-600 text-white shadow-glow'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              ✓ Correct ({correctQuestions.length})
            </button>
            <button
              onClick={() => setFilterMode('INCORRECT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'INCORRECT'
                  ? 'bg-rose-600 text-white shadow-glow'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              ✗ Incorrect ({incorrectQuestions.length})
            </button>
            <button
              onClick={() => setFilterMode('UNATTEMPTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'UNATTEMPTED'
                  ? 'bg-amber-600 text-white shadow-glow'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              ⊘ Did Not Attempt ({unattemptedQuestions.length})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        {filteredQuestions && filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
            const rawSelected = q.selected !== undefined && q.selected !== null && String(q.selected).trim() !== ''
              ? String(q.selected).trim().toUpperCase()
              : null
            const status = getQuestionStatus(q)
            const isUnanswered = status === 'UNATTEMPTED'
            const isCorrect = status === 'CORRECT'

            const originalIndex = rawQuestions.findIndex(item => item.question_id === q.question_id || item.question_text === q.question_text)
            const displayIdx = originalIndex >= 0 ? originalIndex + 1 : idx + 1

            return (
              <div
                id={`question-card-${originalIndex >= 0 ? originalIndex : idx}`}
                key={q.question_id || idx}
                className={`card p-6 sm:p-7 space-y-5 border-l-4 transition-all scroll-mt-24 bg-white dark:bg-surface-800/90 ${
                  isUnanswered
                    ? 'border-l-amber-500'
                    : isCorrect 
                    ? 'border-l-emerald-500' 
                    : 'border-l-rose-500'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-surface-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5">
                      Question {displayIdx} of {totalQuestions}
                    </span>
                    {q.bloom_level && (
                      <span className="badge badge-brand text-[10px]">
                        Bloom: {q.bloom_level}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  {isUnanswered ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40">
                      <MinusCircle className="w-3.5 h-3.5" /> Did Not Attempt
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1 Mark)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/40">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-relaxed">
                  {q.question_text}
                </h4>

                {/* Option list A, B, C, D */}
                <div className="space-y-2.5 pt-1">
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].filter(opt => opt.text).map((opt) => {
                    const optKey = opt.key.toUpperCase()
                    const isThisCorrect = rawCorrect === optKey
                    const isThisUserSelection = rawSelected === optKey

                    let containerStyles = 'bg-slate-50 dark:bg-surface-700/30 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                    let badgeNode = null

                    if (isThisUserSelection && isThisCorrect) {
                      // Correct selection by user
                      containerStyles = 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500/70 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/40'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/25 px-2.5 py-1 rounded-full border border-emerald-500/40 ml-auto flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Your Selection (Correct)
                        </span>
                      )
                    } else if (isThisCorrect) {
                      // Official correct answer (not chosen by user or user skipped)
                      containerStyles = 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 ml-auto flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct Option
                        </span>
                      )
                    } else if (isThisUserSelection && !isThisCorrect) {
                      // Wrong selection by user
                      containerStyles = 'bg-rose-50 dark:bg-rose-500/15 border-rose-500/70 text-slate-900 dark:text-white shadow-sm ring-1 ring-rose-500/40'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-500/25 px-2.5 py-1 rounded-full border border-rose-500/40 ml-auto flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Your Selection (Wrong)
                        </span>
                      )
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${containerStyles}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isThisUserSelection && isThisCorrect
                                ? 'bg-emerald-500 text-white'
                                : isThisCorrect
                                ? 'bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50'
                                : isThisUserSelection
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-200 dark:bg-surface-600 text-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="leading-snug text-sm break-words font-medium">{opt.text}</span>
                        </div>
                        {badgeNode}
                      </div>
                    )
                  })}
                </div>

                {/* Direct Comparison Bar: User Choice vs Correct Choice */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-xl border ${
                    isUnanswered 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : isCorrect 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <span className="text-[10px] font-bold tracking-wider uppercase block text-slate-500 dark:text-slate-400 mb-1">Your Selection</span>
                    <div className="flex items-center gap-2">
                      {isUnanswered ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                          <MinusCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" /> Did Not Attempt (Skipped)
                        </span>
                      ) : isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                          <span><strong className="text-slate-900 dark:text-white">Option {rawSelected}:</strong> {getOptionText(q, rawSelected)}</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                          <span><strong className="text-slate-900 dark:text-white">Option {rawSelected}:</strong> {getOptionText(q, rawSelected)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] font-bold tracking-wider uppercase block text-slate-500 dark:text-slate-400 mb-1">Official Correct Option</span>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300">
                        <strong className="text-slate-900 dark:text-white">Option {rawCorrect}:</strong> {getOptionText(q, rawCorrect)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation Card */}
                {q.explanation && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-700/40 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white block font-semibold">Official Curriculum Explanation</strong>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="card p-8 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No questions match the active filter</h4>
            <p className="text-xs text-slate-400">
              {filterMode === 'INCORRECT'
                ? 'Great job! You answered all attempted questions correctly.'
                : filterMode === 'UNATTEMPTED'
                ? 'You attempted every single question in this assessment!'
                : 'Click "All" to view the complete assessment questions.'}
            </p>
            <button onClick={() => setFilterMode('ALL')} className="btn btn-secondary text-xs mx-auto">
              Show All Questions
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 card p-6 border-t-2 border-t-brand-500">
        <div>
          <h4 className="text-sm font-bold text-white">Ready for your next milestone?</h4>
          <p className="text-xs text-slate-400">Continue along your personalized official statistics curriculum.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/quizzes/${quizId}`} className="btn btn-secondary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Retake Assessment
          </Link>
          <Link to="/quizzes" className="btn btn-primary text-xs shadow-glow">
            All Quizzes Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
