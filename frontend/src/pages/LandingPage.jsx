import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, Route, Zap, Shield, BarChart3, GraduationCap, 
  Sparkles, CheckCircle2, ArrowRight, Award, Layers, Users, BookOpen
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-900 text-white selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-surface-900/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">Stat<span className="text-brand-400">IQ</span></span>
              <span className="block text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Official Statistical System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="btn btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary text-sm shadow-glow">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            AI-Enabled Skill Intelligence & Personalized Learning for <span className="text-gradient">India's Statistical System</span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Automated competency assessment, AI skill-gap detection, personalized iGOT Karmayogi & NSSTA TPAC pathways, and instant MCQ quiz generation from official learning materials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto shadow-glow">
              Start Competency Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-auto">
              Explore Portal
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-display font-bold text-brand-400 mb-1">10,000+</div>
              <div className="text-xs text-slate-400">Official Statisticians</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-display font-bold text-accent-400 mb-1">50+</div>
              <div className="text-xs text-slate-400">iGOT Karmayogi Courses</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-display font-bold text-purple-400 mb-1">100%</div>
              <div className="text-xs text-slate-400">AI MCQ Grounding</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-display font-bold text-warn-400 mb-1">4 Domains</div>
              <div className="text-xs text-slate-400">Competency Mapping</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="py-20 bg-surface-800/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Core Platform Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Engineered specifically for Ministry of Statistics and Programme Implementation (MoSPI), CSO, NSSO, and State Bureaus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-glow p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">AI Competency Assessment</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Evaluates existing skills against 4 predefined domains: Statistical Methodologies, Technical & Data Analytics, Digital Governance, and Behavioral Competencies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-glow p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Personalized Pathways</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Recommends tailored learning trajectories integrating iGOT Karmayogi modules and NSSTA TPAC national training calendar programs based on job roles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-glow p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Grounded AI Quiz Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                RAG-powered LLM pipeline transforms uploaded PDF/DOCX/PPTX materials into validated MCQs with zero hallucination guarantee and instant feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Competency Domains Preview */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-display font-bold text-white mb-4">Official Statistical System Competency Framework</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">Mapped strictly according to Ministry guidelines and modern data requirements.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 border-l-4 border-l-blue-500">
            <h4 className="font-bold text-white text-base mb-2">Statistical Methods</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Survey Design & Sampling</li>
              <li>• National Accounts Statistics</li>
              <li>• Consumer Price Index (CPI)</li>
              <li>• Labour & Agricultural Stats</li>
              <li>• SDG Indicators Framework</li>
            </ul>
          </div>
          <div className="card p-6 border-l-4 border-l-purple-500">
            <h4 className="font-bold text-white text-base mb-2">Technical & Analytics</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Python, R & SQL</li>
              <li>• SPSS, SAS & Stata</li>
              <li>• GIS & Spatial Analytics</li>
              <li>• Machine Learning & AI</li>
              <li>• Cloud Computing & Open Data</li>
            </ul>
          </div>
          <div className="card p-6 border-l-4 border-l-emerald-500">
            <h4 className="font-bold text-white text-base mb-2">Digital Governance</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Cybersecurity Compliance</li>
              <li>• Data Privacy & DPDP Act</li>
              <li>• Digital Public Infrastructure</li>
              <li>• Metadata Standards</li>
              <li>• Government Cloud Systems</li>
            </ul>
          </div>
          <div className="card p-6 border-l-4 border-l-amber-500">
            <h4 className="font-bold text-white text-base mb-2">Managerial & Behavioral</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Leadership for Officers</li>
              <li>• Technical Communication</li>
              <li>• Project & Capacity Mgmt</li>
              <li>• Ethics in Official Stats</li>
              <li>• Change Management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-surface-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 StatIQ Platform | Capacity Building Platform</div>
          <div className="flex gap-6 text-slate-400">
            <span>MoSPI Aligned</span>
            <span>iGOT Karmayogi Integrated</span>
            <span>NSSTA TPAC Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
