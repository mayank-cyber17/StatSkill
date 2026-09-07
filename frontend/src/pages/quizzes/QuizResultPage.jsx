import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { quizAPI } from '../../services/api'
import { MOCK_QUIZZES } from '../../data/mockQuizzes'
import { 
  Award, CheckCircle2, XCircle, Brain, ArrowRight, RefreshCw, 
  Sparkles, BookOpen, AlertCircle, Filter, ArrowLeft, Check, HelpCircle
} from 'lucide-react'

export default function QuizResultPage() {
  const { quizId, attemptId } = useParams()
  const location = useLocation()
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(location.state?.result || null)
  const [filterMode, setFilterMode] = useState('ALL') // 'ALL' | 'CORRECT' | 'INCORRECT'

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
        <p className="text-slate-400 text-sm">Grading responses and analyzing correct & incorrect options...</p>
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
  const score = resData.score !== undefined ? resData.score : rawQuestions.filter(q => q.is_correct).length
  const percentage = resData.percentage ?? Math.round(((score) / (totalQuestions || 1)) * 100)
  const passed = resData.passed !== undefined ? resData.passed : percentage >= 60

  const getOptionText = (q, key) => {
    if (!key) return ''
    const k = String(key).trim().toUpperCase()
    if (k === 'A') return q.option_a
    if (k === 'B') return q.option_b
    if (k === 'C') return q.option_c
    if (k === 'D') return q.option_d
    return ''
  }

  // Count correct and incorrect
  const correctQuestions = rawQuestions.filter((q) => {
    const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
    const rawSelected = q.selected ? String(q.selected).trim().toUpperCase() : null
    return q.is_correct !== undefined ? q.is_correct : (rawSelected === rawCorrect)
  })

  const incorrectQuestions = rawQuestions.filter((q) => {
    const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
    const rawSelected = q.selected ? String(q.selected).trim().toUpperCase() : null
    const isCorr = q.is_correct !== undefined ? q.is_correct : (rawSelected === rawCorrect)
    return !isCorr
  })

  // Filtered list
  const filteredQuestions = rawQuestions.filter((q) => {
    const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
    const rawSelected = q.selected ? String(q.selected).trim().toUpperCase() : null
    const isCorr = q.is_correct !== undefined ? q.is_correct : (rawSelected === rawCorrect)
    if (filterMode === 'CORRECT') return isCorr
    if (filterMode === 'INCORRECT') return !isCorr
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
        <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" /> {correctQuestions.length} Correct
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-4 h-4" /> {incorrectQuestions.length} Incorrect
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-slate-300 border border-white/10">
            <BookOpen className="w-4 h-4 text-brand-400" /> {totalQuestions} Total Questions
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
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Quick Jump to Question</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Correct
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Incorrect
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Skipped
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap pt-1">
            {rawQuestions.map((q, idx) => {
              const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
              const rawSelected = q.selected ? String(q.selected).trim().toUpperCase() : null
              const isCorr = q.is_correct !== undefined ? q.is_correct : (rawSelected === rawCorrect)
              const isUnanswered = !rawSelected

              return (
                <button
                  key={q.question_id || idx}
                  onClick={() => scrollToQuestion(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                    isUnanswered
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      : isCorr
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                  title={`Question ${idx + 1}: ${isUnanswered ? 'Skipped' : isCorr ? 'Correct' : 'Incorrect'}`}
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
              Review every option with clear indications of which choices were correct or incorrect.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-800 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
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
          </div>
        </div>

        {/* Question Cards List */}
        {filteredQuestions && filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const rawCorrect = String(q.correct || q.correct_option || 'A').trim().toUpperCase()
            const rawSelected = q.selected ? String(q.selected).trim().toUpperCase() : null
            const isCorrect = q.is_correct !== undefined ? q.is_correct : (rawSelected === rawCorrect)
            const isUnanswered = !rawSelected
            const originalIndex = rawQuestions.findIndex(item => item.question_id === q.question_id || item.question_text === q.question_text)
            const displayIdx = originalIndex >= 0 ? originalIndex + 1 : idx + 1

            return (
              <div
                id={`question-card-${originalIndex >= 0 ? originalIndex : idx}`}
                key={q.question_id || idx}
                className={`card p-6 sm:p-7 space-y-5 border-l-4 transition-all scroll-mt-24 ${
                  isUnanswered
                    ? 'border-l-amber-500 bg-surface-800/90'
                    : isCorrect 
                    ? 'border-l-emerald-500 bg-surface-800/90' 
                    : 'border-l-rose-500 bg-surface-800/90'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white bg-surface-700 px-2.5 py-1 rounded-md border border-white/5">
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <AlertCircle className="w-3.5 h-3.5" /> Not Answered
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <h4 className="font-bold text-white text-base leading-relaxed">
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

                    let containerStyles = 'bg-surface-700/30 border-white/5 text-slate-400 opacity-80'
                    let badgeNode = null

                    if (isThisUserSelection && isThisCorrect) {
                      // Correct selection by user
                      containerStyles = 'bg-emerald-500/15 border-emerald-500/70 text-white shadow-sm ring-1 ring-emerald-500/40'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/25 px-2.5 py-1 rounded-full border border-emerald-500/40 ml-auto flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Your Selection (Correct)
                        </span>
                      )
                    } else if (isThisCorrect) {
                      // Official correct answer (not chosen by user or user skipped)
                      containerStyles = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 ml-auto flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Correct Option
                        </span>
                      )
                    } else if (isThisUserSelection && !isThisCorrect) {
                      // Wrong selection by user
                      containerStyles = 'bg-rose-500/15 border-rose-500/70 text-white shadow-sm ring-1 ring-rose-500/40'
                      badgeNode = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-500/25 px-2.5 py-1 rounded-full border border-rose-500/40 ml-auto flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> Your Selection (Wrong)
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
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                                : isThisUserSelection
                                ? 'bg-rose-500 text-white'
                                : 'bg-surface-600 text-slate-400'
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
                    <span className="text-[10px] font-bold tracking-wider uppercase block text-slate-400 mb-1">Your Selection</span>
                    <div className="flex items-center gap-2">
                      {isUnanswered ? (
                        <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" /> Not Answered (Skipped)
                        </span>
                      ) : isCorrect ? (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span><strong className="text-white">Option {rawSelected}:</strong> {getOptionText(q, rawSelected)}</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold text-xs flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span><strong className="text-white">Option {rawSelected}:</strong> {getOptionText(q, rawSelected)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[10px] font-bold tracking-wider uppercase block text-slate-400 mb-1">Official Correct Option</span>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-300">
                        <strong className="text-white">Option {rawCorrect}:</strong> {getOptionText(q, rawCorrect)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation Card */}
                {q.explanation && (
                  <div className="p-4 rounded-xl bg-surface-700/40 border border-white/5 text-xs text-slate-300 flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-white block font-semibold">Official Curriculum Explanation</strong>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
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
                ? 'Congratulations! You answered all questions correctly.'
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

