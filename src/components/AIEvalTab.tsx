import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Quote, 
  RefreshCw, 
  BookOpen, 
  HeartHandshake, 
  SunMedium, 
  Activity, 
  Briefcase,
  History
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { AIEvaluationResult, Habit, LifeDimension } from '../types';

interface AIEvalTabProps {
  evaluation: AIEvaluationResult | null;
  evaluationsHistory: Record<string, AIEvaluationResult>;
  selectedDate: string;
  habits: Habit[];
  onSelectDate: (date: string) => void;
  onRunEvaluation: (userNotes?: string) => Promise<void>;
  isLoading: boolean;
}

export const AIEvalTab: React.FC<AIEvalTabProps> = ({
  evaluation,
  evaluationsHistory,
  selectedDate,
  habits,
  onSelectDate,
  onRunEvaluation,
  isLoading,
}) => {
  const [userNotes, setUserNotes] = useState<string>('');

  // Radar chart data preparation
  const radarData = (evaluation?.dimensions || [
    { name: 'Education', score: 70 },
    { name: 'Religion', score: 85 },
    { name: 'Health', score: 65 },
    { name: 'Social', score: 75 },
    { name: 'Career', score: 80 },
  ]).map(d => ({
    dimension: d.name,
    score: d.score,
    fullMark: 100,
  }));

  const dimensionIcons: Record<string, any> = {
    Education: BookOpen,
    Social: HeartHandshake,
    Religion: SunMedium,
    Health: Activity,
    Career: Briefcase,
  };

  const getStatusBadge = (status: 'optimal' | 'needs_attention' | 'warning') => {
    switch (status) {
      case 'optimal':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Optimal
          </span>
        );
      case 'needs_attention':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Focus Gap
          </span>
        );
      case 'warning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Friction Alert
          </span>
        );
      default:
        return null;
    }
  };

  const historyDates = Object.keys(evaluationsHistory).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Trigger */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Gemini 3.8 Flash Engine
              </span>
              <span className="text-xs text-slate-400">Date: {selectedDate}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 tracking-tight">
              5-Dimension AI Life Judgement & Routine Score
            </h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Synthesizes your daily habit execution across <span className="text-indigo-300 font-semibold">Education, Religion, Health, Social, and Career</span>. Delivers a ruthlessly honest executive verdict, dimensional scores, and tomorrow's highest-leverage actions.
            </p>

            {/* Custom Notes / Reflections Input */}
            <div className="mt-4">
              <input
                id="ai-user-reflections-input"
                type="text"
                placeholder="Optional: Add your reflections, friction points, or deep work focus today..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="ai-evaluate-day-btn"
              onClick={() => onRunEvaluation(userNotes)}
              disabled={isLoading}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating Routine with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{evaluation ? 'Re-Evaluate Today' : 'Judge Today\'s Routine'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Analysis Display */}
      {evaluation ? (
        <div className="space-y-6">
          {/* Top Score & Verdict Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score & Grade Card */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Daily Routine Score
              </span>
              <div className="my-4 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {evaluation.overallScore}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase">out of 100</span>
                </div>
                {/* Grade Badge */}
                <div className="absolute -bottom-2 px-3 py-1 rounded-lg bg-indigo-600 text-white font-black text-sm tracking-wider shadow-lg shadow-indigo-600/40 border border-white/20">
                  Grade {evaluation.grade}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Calculated across {habits.length} daily habits & life metrics
              </p>
              {evaluation.aiGenerated && (
                <span className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> Live Gemini 3.8 AI Judgement
                </span>
              )}
            </div>

            {/* Verdict Card */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-400" /> Executive Verdict
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{evaluation.date}</span>
                </div>
                <p className="text-base text-slate-100 font-medium leading-relaxed">
                  "{evaluation.verdict}"
                </p>
              </div>

              {/* Stoic Quote */}
              {evaluation.stoicQuote && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                  <Quote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 italic">
                    {evaluation.stoicQuote}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 5-Dimension Radar Chart & Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5D Radar Graphic (Recharts) */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">5D Life Dimension Balance</h3>
                  <p className="text-xs text-slate-400">Radial alignment across core pillars</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val}/100`, 'Score']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dimensional Verdict Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Pillar Judgements & Bottlenecks
              </h3>
              {evaluation.dimensions.map((dim) => {
                const Icon = dimensionIcons[dim.name] || Activity;
                return (
                  <div
                    key={dim.name}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{dim.name}</span>
                          <span className="text-xs font-extrabold text-indigo-400 font-mono">
                            {dim.score}%
                          </span>
                        </div>
                        {getStatusBadge(dim.status)}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {dim.feedback}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tomorrow's Action Items */}
          {evaluation.actionItems && evaluation.actionItems.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tomorrow's 3 Highest-Leverage Directives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {evaluation.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Evaluations Selector */}
          {historyDates.length > 1 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Historical Life OS Judgements:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {historyDates.map(date => (
                  <button
                    key={date}
                    onClick={() => onSelectDate(date)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      date === selectedDate
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {date} ({evaluationsHistory[date].overallScore}pts)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No Judgement Generated for {selectedDate}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click the "Judge Today's Routine" button above to evaluate your daily consistency across Education, Religion, Health, Social, and Career.
          </p>
          <button
            onClick={() => onRunEvaluation(userNotes)}
            disabled={isLoading}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Daily Judgement</span>
          </button>
        </div>
      )}
    </div>
  );
};
