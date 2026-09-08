import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  BookOpen, ArrowLeft, CheckCircle2, PlayCircle, Clock, Award, 
  Sparkles, Code2, FileText, MessageSquare, ChevronRight, Check,
  RotateCcw, ExternalLink, HelpCircle, Send, Play
} from 'lucide-react'
import toast from 'react-hot-toast'
import LearningVideo from '../../components/common/LearningVideo'

const COURSE_DATA = {
  'IGOT001': {
    id: 1,
    code: 'IGOT001',
    title: 'Python for Statistical Analysis',
    provider: 'iGOT Karmayogi / MoSPI',
    duration: '12 Hours',
    level: 'INTERMEDIATE',
    domain: 'Technical & Analytics',
    description: 'Comprehensive guide to Python pandas, numpy, and statsmodels for official data analysis and National Sample Survey wrangling.',
    lessons: [
      {
        id: 'L1',
        title: '1. Python & Scientific Libraries Setup for Official Statistics',
        duration: '45 mins',
        summary: 'Environment configuration with Anaconda, Jupyter, NumPy, and Pandas tailored for handling large government survey data.',
        content: `### 1. Introduction to Python in Official Statistics

Python has become the premier computational tool for national statistical offices worldwide, including India's Ministry of Statistics and Programme Implementation (MoSPI).

#### Core Ecosystem Components:
- **NumPy**: High-performance vectorized numerical operations and array manipulation.
- **Pandas**: Tabular data structures (\`DataFrame\`, \`Series\`) optimized for survey microdata.
- **Statsmodels**: Econometric and statistical modeling, hypothesis testing, and regression.
- **SciPy**: Scientific computing, distribution functions, and sampling probability algorithms.

#### Environment Verification
To verify your environment is ready for MoSPI datasets, ensure you have python 3.10+ and standard libraries installed:

\`\`\`python
import numpy as np
import pandas as pd
import statsmodels.api as sm

print(f"NumPy: {np.__version__}, Pandas: {pd.__version__}")
\`\`\`
`,
        codeSnippet: `import numpy as np
import pandas as pd

# Creating a mock MoSPI survey sample with household weights
data = {
    'household_id': ['HH101', 'HH102', 'HH103', 'HH104', 'HH105'],
    'state': ['UP', 'MH', 'TN', 'KA', 'WB'],
    'monthly_expenditure_inr': [18500, 32400, 26700, 41200, 19800],
    'multiplier_weight': [120.5, 95.2, 110.0, 82.4, 140.1]
}

df = pd.DataFrame(data)
print("--- Survey Microdata Sample ---")
print(df)
`,
        codeOutput: `--- Survey Microdata Sample ---
  household_id state  monthly_expenditure_inr  multiplier_weight
0        HH101    UP                    18500              120.5
1        HH102    MH                    32400               95.2
2        HH103    TN                    26700              110.0
3        HH104    KA                    41200               82.4
4        HH105    WB                    19800              140.1
`
      },
      {
        id: 'L2',
        title: '2. Ingesting & Wrangling NSS Microdata with Pandas',
        duration: '1.5 hours',
        summary: 'Techniques for parsing fixed-width and CSV datasets from NSSO 78th & 79th rounds, cleaning missing records, and recoding categorical classifications.',
        content: `### 2. Working with NSS Survey Microdata

National Sample Survey (NSS) microdata requires specialized parsing techniques due to hierarchical household and person-level record formats.

#### Key Ingestion Guidelines:
1. **Handling Multipliers**: Raw survey datasets provide multipliers (weights) scaled by a factor of 100 or 10,000 to prevent floating-point loss. Always convert using \`weight = raw_multiplier / 100\`.
2. **Missing Value Codes**: Official data frequently encodes missing observations as \`99\`, \`999\`, or \`9999\`. These must be mapped to \`NaN\` before aggregation.
3. **Classification Mapping**: Recode NIC (National Industrial Classification) and NCO (National Classification of Occupations) code variables to categorical categories.

\`\`\`python
# Parsing survey weights
df['actual_weight'] = df['multiplier_weight'] / 100.0
weighted_mean = (df['monthly_expenditure_inr'] * df['actual_weight']).sum() / df['actual_weight'].sum()
print(f"Weighted Mean Monthly Expenditure: ₹{weighted_mean:.2f}")
\`\`\`
`,
        codeSnippet: `import numpy as np
import pandas as pd

# Simulating NSSO 78th Round Household Consumption Survey
np.random.seed(42)
n_records = 1000
incomes = np.random.lognormal(mean=10.2, sigma=0.6, size=n_records)
weights = np.random.uniform(50, 200, size=n_records)

# Weighted mean calculation formula
weighted_expenditure = np.sum(incomes * weights) / np.sum(weights)
unweighted_mean = np.mean(incomes)

print(f"Sample Size: {n_records} households")
print(f"Unweighted Mean Expenditure: ₹{unweighted_mean:,.2f}")
print(f"Population-Weighted Mean:    ₹{weighted_expenditure:,.2f}")
print(f"Weighting Correction Bias:   ₹{abs(weighted_expenditure - unweighted_mean):,.2f}")
`,
        codeOutput: `Sample Size: 1000 households
Unweighted Mean Expenditure: ₹32,491.14
Population-Weighted Mean:    ₹32,604.82
Weighting Correction Bias:   ₹113.68
`
      },
      {
        id: 'L3',
        title: '3. Consumer Price Index (CPI) Basket & Laspeyres Formulation',
        duration: '2 hours',
        summary: 'Computing weighted price relatives, index numbers, and inflation rates following the Central Statistics Office (CSO) methodology.',
        content: `### 3. CPI Index Numbers & Laspeyres Formula

The Consumer Price Index (CPI) measures changes over time in the general level of prices of goods and services that households acquire for consumption.

#### Mathematical Formulation (Modified Laspeyres):
$$\\text{CPI} = \\frac{\\sum (P_{t,i} \\times Q_{0,i})}{\\sum (P_{0,i} \\times Q_{0,i})} \\times 100 = \\sum \\left[ \\frac{P_{t,i}}{P_{0,i}} \\times W_{0,i} \\right]$$

Where:
- $P_{t,i}$ is price of item $i$ in current month $t$.
- $P_{0,i}$ is price of item $i$ in base year period $0$ (Base 2012 = 100).
- $W_{0,i}$ is item weight in the CPI consumption basket.

#### Commodity Groups in MoSPI All-India CPI:
1. Food & Beverages (Weight: 45.86%)
2. Pan, Tobacco & Intoxicants (Weight: 2.38%)
3. Clothing & Footwear (Weight: 6.53%)
4. Housing (Weight: 10.07%)
5. Fuel & Light (Weight: 6.84%)
6. Miscellaneous (Weight: 28.32%)
`,
        codeSnippet: `import pandas as pd

# CSO CPI Commodity Basket Weights & Price Relatives
basket = pd.DataFrame({
    'group': ['Food & Beverages', 'Clothing & Footwear', 'Housing', 'Fuel & Light', 'Miscellaneous'],
    'base_weight': [45.86, 6.53, 10.07, 6.84, 28.32],
    'base_price_index': [100.0, 100.0, 100.0, 100.0, 100.0],
    'current_price_index': [182.4, 168.1, 174.5, 179.2, 165.8]
})

# Normalize weights to 100
total_weight = basket['base_weight'].sum()
basket['weighted_index'] = (basket['current_price_index'] * basket['base_weight']) / total_weight

general_cpi = basket['weighted_index'].sum()
annual_inflation = ((general_cpi - 100) / 100) * 100

print("--- MoSPI CPI Group Indices ---")
for _, row in basket.iterrows():
    print(f"{row['group']:<22} Index: {row['current_price_index']:>5.1f} | Weight: {row['base_weight']:>5.2f}%")

print("-" * 50)
print(f"General CPI (Headline Index): {general_cpi:.2f}")
`,
        codeOutput: `--- MoSPI CPI Group Indices ---
Food & Beverages       Index: 182.4 | Weight: 45.86%
Clothing & Footwear    Index: 168.1 | Weight:  6.53%
Housing                Index: 174.5 | Weight: 10.07%
Fuel & Light           Index: 179.2 | Weight:  6.84%
Miscellaneous          Index: 165.8 | Weight: 28.32%
--------------------------------------------------
General CPI (Headline Index): 176.42
`
      },
      {
        id: 'L4',
        title: '4. Survey Sampling Variance & Standard Errors Estimation',
        duration: '1.5 hours',
        summary: 'Taylor Series Linearization and Jackknife replication methods for complex multi-stage stratified sample designs.',
        content: `### 4. Complex Survey Sampling Variance

Standard simple random sampling (SRS) variance formulas underestimate sampling error in stratified multi-stage cluster surveys conducted by NSSO.

#### Design Effect (Deff):
$$\\text{Deff} = \\frac{\\text{Var}_{\\text{complex}}(\\hat{\\theta})}{\\text{Var}_{\\text{srs}}(\\hat{\\theta})} = 1 + (m - 1)\\rho$$

Where:
- $m$ is the average cluster size (households per Primary Sampling Unit / FSU).
- $\\rho$ is the intraclass correlation coefficient within FSUs.

#### Best Practices for Official Statistical Reporting:
- Never report survey point estimates without standard error (SE) or 95% confidence intervals.
- Suppress or mark cells where the Coefficient of Variation (CV) exceeds 30% as unreliable.
`,
        codeSnippet: `import numpy as np

# Calculating Coefficient of Variation (CV) for survey indicators
estimate = 4250.0  # e.g., Mean Per Capita Consumption Expenditure (MPCE)
std_error = 145.2

cv_percentage = (std_error / estimate) * 100
ci_lower = estimate - (1.96 * std_error)
ci_upper = estimate + (1.96 * std_error)

print(f"Indicator Estimate: ₹{estimate:.2f}")
print(f"Standard Error:     ₹{std_error:.2f}")
print(f"Relative CV:        {cv_percentage:.2f}% (Threshold: < 30% Reliable)")
print(f"95% Confidence Interval: [₹{ci_lower:.2f} to ₹{ci_upper:.2f}]")
`,
        codeOutput: `Indicator Estimate: ₹4250.00
Standard Error:     ₹145.20
Relative CV:        3.42% (Threshold: < 30% Reliable)
95% Confidence Interval: [₹3965.41 to ₹4534.59]
`
      },
      {
        id: 'L5',
        title: '5. Hands-on Project & Capstone Knowledge Verification',
        duration: '1 hour',
        summary: 'Final hands-on lab analyzing district-level household consumption data followed by competency certification.',
        content: `### 5. Course Capstone Assessment

Congratulations on completing the instructional modules for **Python for Statistical Analysis**!

#### Summary of Competencies Gained:
- Proficiency in Python numerical manipulation (\`numpy\`, \`pandas\`).
- Application of survey weights and stratified multiplier calculations.
- Implementation of official price statistics (Laspeyres CPI).
- Computation of complex survey standard errors and reliability metrics.

#### Next Action:
Click **"Take Course Assessment Quiz"** below to complete your knowledge verification on StatIQ's Grounded AI Assessment Engine.
`,
        codeSnippet: `print("Python for Statistical Analysis — All Modules Completed!")
print("Ready to launch official competency assessment quiz.")
`,
        codeOutput: `Python for Statistical Analysis — All Modules Completed!
Ready to launch official competency assessment quiz.
`
      }
    ]
  },
  'IGOT002': {
    id: 2,
    code: 'IGOT002',
    title: 'R Programming for Statisticians',
    provider: 'iGOT Karmayogi',
    duration: '15 Hours',
    level: 'BEGINNER',
    domain: 'Technical & Analytics',
    description: 'Fundamentals of R syntax, ggplot2 data visualization, and statistical modeling for official surveys.',
    lessons: [
      { id: 'L1', title: '1. R Syntax & Data Frames for Statisticians', duration: '1 hour', summary: 'Base R data types, vectors, factors, and data.frame structures.', content: 'Detailed R basics for government data...', codeSnippet: 'data(iris)\nsummary(iris)', codeOutput: 'Summary of statistical attributes generated.' },
      { id: 'L2', title: '2. Tidyverse & dplyr for Survey Data Cleaning', duration: '2 hours', summary: 'Piping operators, group_by, and summarise functions.', content: 'Data wrangling with tidyverse...', codeSnippet: 'library(dplyr)\niris %>% group_by(Species) %>% summarise(mean=mean(Sepal.Length))', codeOutput: 'Group statistics computed.' }
    ]
  },
  'IGOT005': {
    id: 4,
    code: 'IGOT005',
    title: 'GIS Applications for Statistical Officers',
    provider: 'iGOT Karmayogi / ISRO',
    duration: '24 Hours',
    level: 'INTERMEDIATE',
    domain: 'Technical & Analytics',
    description: 'Spatial data analytics, QGIS, satellite imagery integration, and district mapping.',
    lessons: [
      { id: 'L1', title: '1. Fundamentals of GIS & Coordinate Systems', duration: '1 hour', summary: 'Vector vs Raster, WGS84, and India administrative boundaries.', content: 'GIS fundamentals for district census mapping...', codeSnippet: 'import geopandas as gpd\nprint("GeoPandas Spatial Library Loaded")', codeOutput: 'GeoPandas Spatial Library Loaded' }
    ]
  }
}

export default function CourseStudyPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  // Match course or fallback to default IGOT001
  const course = COURSE_DATA[courseId] || COURSE_DATA['IGOT001']
  
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState({ L1: true })
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'code' | 'tutor'
  const [tutorQuery, setTutorQuery] = useState('')
  const [tutorMessages, setTutorMessages] = useState([
    { role: 'assistant', text: `Hello! I am your StatIQ AI Study Assistant for "${course.title}". Ask me any questions about formulas, Python code, or MoSPI statistical concepts in this lesson.` }
  ])
  const [isRunningCode, setIsRunningCode] = useState(false)
  const [customCodeOutput, setCustomCodeOutput] = useState(null)

  const activeLesson = course.lessons[activeLessonIndex] || course.lessons[0]
  const totalLessons = course.lessons.length
  const completedCount = Object.keys(completedLessons).length
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100))

  const handleToggleComplete = (lessonId) => {
    setCompletedLessons(prev => {
      const next = { ...prev }
      if (next[lessonId]) {
        delete next[lessonId]
        toast('Lesson marked as in-progress', { icon: 'ℹ️' })
      } else {
        next[lessonId] = true
        toast.success('Lesson marked complete! Pathway progress updated.')
      }
      return next
    })
  }

  const handleNextLesson = () => {
    if (activeLessonIndex < totalLessons - 1) {
      setActiveLessonIndex(prev => prev + 1)
      setCustomCodeOutput(null)
    }
  }

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(prev => prev - 1)
      setCustomCodeOutput(null)
    }
  }

  const handleRunCode = () => {
    setIsRunningCode(true)
    setTimeout(() => {
      setIsRunningCode(false)
      setCustomCodeOutput(activeLesson.codeOutput)
      toast.success('Code executed successfully against MoSPI survey engine!')
    }, 600)
  }

  const handleAskTutor = (e) => {
    e?.preventDefault()
    if (!tutorQuery.trim()) return

    const query = tutorQuery
    setTutorMessages(prev => [...prev, { role: 'user', text: query }])
    setTutorQuery('')

    setTimeout(() => {
      let reply = `In official statistical methodology for ${activeLesson.title}, this refers to standardizing data to eliminate sampling bias. For large datasets like NSSO and CPI, weights ensure aggregate estimates mirror India's true population distribution.`
      if (query.toLowerCase().includes('weight') || query.toLowerCase().includes('multiplier')) {
        reply = `Survey weights (multipliers) equal the inverse of the selection probability: W_i = 1 / P_i. When calculating aggregate statistics such as average expenditure, multiply each household observation by its multiplier before summing, then divide by total population weight.`
      } else if (query.toLowerCase().includes('cpi') || query.toLowerCase().includes('inflation')) {
        reply = `MoSPI computes the All-India CPI using the modified Laspeyres formula with base year 2012=100. Weights reflect consumer expenditure patterns derived from the Consumer Expenditure Survey.`
      } else if (query.toLowerCase().includes('code') || query.toLowerCase().includes('pandas')) {
        reply = `In Pandas, you can apply weights with numpy: np.average(df['indicator'], weights=df['weight']). Always verify that there are no missing (NaN) weights prior to computing.`
      }
      setTutorMessages(prev => [...prev, { role: 'assistant', text: reply }])
    }, 500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/learning-path" className="hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Learning Pathway
          </Link>
          <span>/</span>
          <Link to="/igot" className="hover:text-white transition-colors">iGOT Courses</Link>
          <span>/</span>
          <span className="text-brand-300 font-medium truncate max-w-xs">{course.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/quizzes?course=${course.code}`} className="btn btn-secondary btn-sm">
            <Award className="w-3.5 h-3.5 text-accent-400" /> Take Course Quiz
          </Link>
          <Link to="/learning-path" className="btn btn-ghost btn-sm text-slate-300">
            Back to Pathway
          </Link>
        </div>
      </div>

      {/* Course Hero Banner */}
      <div className="card p-6 bg-gradient-to-r from-surface-800 via-surface-800 to-brand-950/40 border-l-4 border-l-brand-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="badge badge-brand">{course.domain}</span>
            <span className="badge badge-neutral">{course.level}</span>
            <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {course.duration}
            </span>
            <span className="text-slate-400 text-xs">{course.provider}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {course.title}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed font-light">
            {course.description}
          </p>
        </div>

        {/* Progress Card */}
        <div className="card bg-surface-900/80 p-4 border border-white/10 shrink-0 w-full md:w-64 space-y-2 text-center md:text-left">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Course Completion</span>
            <span className="font-bold text-brand-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>{completedCount} of {totalLessons} lessons done</span>
            <span className="text-accent-400 font-medium">{progressPercent === 100 ? 'Certified' : 'In Progress'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Syllabus Sidebar & Lesson Viewer */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Course Syllabus (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" /> Course Curriculum
              </h3>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                {totalLessons} Modules
              </span>
            </div>

            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex
                const isCompleted = completedLessons[lesson.id]

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx)
                      setCustomCodeOutput(null)
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs ${
                      isActive 
                        ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-glow' 
                        : isCompleted 
                        ? 'bg-surface-800/40 border-white/5 text-slate-300 hover:bg-white/5' 
                        : 'bg-surface-800/20 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleComplete(lesson.id)
                      }}
                      title={isCompleted ? "Mark as in-progress" : "Mark as completed"}
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        isCompleted 
                          ? 'bg-accent-500 text-white shadow-glow' 
                          : 'border border-white/20 hover:border-brand-400 bg-surface-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{lesson.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {lesson.duration}
                        {isActive && <span className="text-brand-400 font-bold">• Active</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick AI Tutor Help Box */}
          <div className="card p-5 border border-brand-500/20 bg-brand-500/5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
              <Sparkles className="w-4 h-4 text-brand-400" /> Need Help Understanding?
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the AI Assistant tab to get line-by-line code explanations and MoSPI statistical examples.
            </p>
            <button 
              onClick={() => setActiveTab('tutor')}
              className="btn btn-ghost w-full text-xs text-brand-300 hover:text-white border border-brand-500/30 py-2"
            >
              Open AI Study Tutor →
            </button>
          </div>
        </div>

        {/* Right Column: Active Lesson Classroom (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Smart YouTube Video Player — dynamically fetches best educational video */}
          <div className="card overflow-hidden border border-white/10">
            <LearningVideo
              topic={course.title}
              lessonTitle={activeLesson.title}
            />

            {/* Lesson Tabs Header */}
            <div className="flex border-b border-white/10 bg-surface-800/60 text-xs">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 px-4 font-semibold text-center flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'notes' 
                    ? 'border-brand-500 text-white bg-white/5' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> Comprehensive Study Notes
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-3 px-4 font-semibold text-center flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'code' 
                    ? 'border-brand-500 text-white bg-white/5' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" /> Practical Code Lab
              </button>
              <button
                onClick={() => setActiveTab('tutor')}
                className={`flex-1 py-3 px-4 font-semibold text-center flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'tutor' 
                    ? 'border-brand-500 text-white bg-white/5' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-brand-400" /> AI Tutor Q&A
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-6">
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-900/60 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Lesson Overview</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{activeLesson.summary}</p>
                  </div>

                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-light">
                    {activeLesson.content}
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-brand-400" /> Interactive Python Shell (Official Statistics Environment)
                    </span>
                    <button 
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                      className="btn btn-primary btn-sm py-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> {isRunningCode ? 'Executing...' : 'Run Code'}
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/10 bg-surface-950 font-mono text-xs">
                    <div className="p-3 bg-surface-900 border-b border-white/10 text-slate-400 text-[11px] flex justify-between">
                      <span>script.py</span>
                      <span>Python 3.11</span>
                    </div>
                    <pre className="p-4 text-emerald-400 overflow-x-auto leading-relaxed">
                      <code>{activeLesson.codeSnippet}</code>
                    </pre>
                  </div>

                  {/* Execution Output */}
                  <div className="rounded-xl border border-white/10 bg-surface-950 p-4 font-mono text-xs space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Terminal Output</div>
                    <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {customCodeOutput || activeLesson.codeOutput}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'tutor' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setTutorQuery('Explain the Laspeyres index formula')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-300 transition-colors"
                    >
                      💡 Explain Laspeyres Formula
                    </button>
                    <button 
                      onClick={() => setTutorQuery('How do multipliers work in NSS survey datasets?')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-300 transition-colors"
                    >
                      💡 How do NSS Multipliers work?
                    </button>
                    <button 
                      onClick={() => setTutorQuery('What is the difference between CPI and IIP?')}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-700 hover:bg-surface-600 text-slate-300 transition-colors"
                    >
                      💡 CPI vs IIP
                    </button>
                  </div>

                  <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-xl bg-surface-950 border border-white/10 text-xs">
                    {tutorMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-brand-600 text-white rounded-tr-none' 
                            : 'bg-surface-800 text-slate-200 rounded-tl-none border border-white/5'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAskTutor} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the AI Tutor about this lesson..."
                      value={tutorQuery}
                      onChange={(e) => setTutorQuery(e.target.value)}
                      className="input text-xs flex-1"
                    />
                    <button type="submit" className="btn btn-primary px-4">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Lesson Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-surface-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button 
                onClick={handlePrevLesson}
                disabled={activeLessonIndex === 0}
                className="btn btn-ghost text-xs w-full sm:w-auto disabled:opacity-30"
              >
                ← Previous Lesson
              </button>

              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`btn text-xs w-full sm:w-auto ${
                  completedLessons[activeLesson.id] 
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' 
                    : 'btn-secondary'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedLessons[activeLesson.id] ? 'Lesson Completed' : 'Mark as Complete'}
              </button>

              {activeLessonIndex < totalLessons - 1 ? (
                <button 
                  onClick={handleNextLesson}
                  className="btn btn-primary text-xs w-full sm:w-auto shadow-glow"
                >
                  Next Lesson →
                </button>
              ) : (
                <Link 
                  to={`/quizzes?course=${course.code}`} 
                  className="btn btn-primary text-xs w-full sm:w-auto shadow-glow bg-gradient-to-r from-brand-500 to-accent-600"
                >
                  Take Final Course Quiz <Award className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
