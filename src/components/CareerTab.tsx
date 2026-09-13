import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Cpu, 
  Layers, 
  Cloud, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Terminal, 
  Plus, 
  BookMarked,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { CareerMilestone, CareerPillar, EngineeringLevel } from '../types';

interface CareerTabProps {
  milestones: CareerMilestone[];
  onToggleMilestone: (id: string) => void;
  onIncrementCount: (id: string) => void;
  onOpenCoachModal: (initialPrompt?: string) => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  milestones,
  onToggleMilestone,
  onIncrementCount,
  onOpenCoachModal,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EngineeringLevel>('senior');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');

  const pillarConfig: Record<CareerPillar, { label: string; icon: any; color: string; badgeBg: string; textCol: string }> = {
    dsa: {
      label: 'DSA & Algorithms',
      icon: Code2,
      color: 'from-blue-500 to-indigo-500',
      badgeBg: 'bg-blue-500/10 border-blue-500/30',
      textCol: 'text-blue-400',
    },
    system_design: {
      label: 'System Design',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      textCol: 'text-purple-400',
    },
    fullstack: {
      label: 'Full-Stack Mastery',
      icon: Layers,
      color: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      textCol: 'text-emerald-400',
    },
    cloud_devops: {
      label: 'Cloud & DevOps',
      icon: Cloud,
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
      textCol: 'text-amber-400',
    },
  };

  const levelLabels: Record<EngineeringLevel, { title: string; subtitle: string; badge: string }> = {
    junior: {
      title: 'Junior Engineer (L3)',
      subtitle: 'Code execution, basic DSA, clean syntax, Git workflow',
      badge: 'Level 1',
    },
    mid: {
      title: 'Mid-Level Engineer (L4)',
      subtitle: 'Autonomous feature delivery, design patterns, testing, CI/CD',
      badge: 'Level 2',
    },
    senior: {
      title: 'Senior Engineer (L5)',
      subtitle: 'Distributed systems, high-scale architecture, mentorship, reliability',
      badge: 'Level 3',
    },
    lead: {
      title: 'Staff / Principal (L6+)',
      subtitle: 'Multi-team tech strategy, org-wide RFCs, zero-downtime reliability',
      badge: 'Level 4',
    },
  };

  // Filter milestones by level and pillar
  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      if (m.level !== selectedLevel) return false;
      if (selectedPillar !== 'all' && m.pillar !== selectedPillar) return false;
      return true;
    });
  }, [milestones, selectedLevel, selectedPillar]);

  // Calculations
  const levelStats = useMemo(() => {
    const totalInLevel = milestones.filter(m => m.level === selectedLevel).length;
    const completedInLevel = milestones.filter(m => m.level === selectedLevel && m.completed).length;
    const percentage = totalInLevel > 0 ? Math.round((completedInLevel / totalInLevel) * 100) : 0;
    return { total: totalInLevel, completed: completedInLevel, percentage };
  }, [milestones, selectedLevel]);

  const overallStats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [milestones]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Engineering Career OS
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Overall Progress: {overallStats.percentage}% ({overallStats.completed}/{overallStats.total} milestones)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2 tracking-tight">
              Software Engineering Competency Roadmap
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Systematic progression across 4 essential pillars: DSA, System Design, Full-Stack Mastery, and Cloud/DevOps. Progress from Junior to Staff Principal.
            </p>
          </div>

          {/* Quick AI Coaching Trigger */}
          <div className="flex items-center gap-2">
            <button
              id="career-ai-mentor-btn"
              onClick={() => onOpenCoachModal(`Give me an actionable study plan to reach ${levelLabels[selectedLevel].title} in 90 days.`)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Career Mentor</span>
            </button>
          </div>
        </div>

        {/* Overall Roadmap Progress Bar */}
        <div className="mt-4 w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${overallStats.percentage}%` }}
          />
        </div>
      </div>

      {/* Engineering Level Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(['junior', 'mid', 'senior', 'lead'] as EngineeringLevel[]).map((lvl) => {
          const isSelected = selectedLevel === lvl;
          const info = levelLabels[lvl];
          const totalInLvl = milestones.filter(m => m.level === lvl).length;
          const completedInLvl = milestones.filter(m => m.level === lvl && m.completed).length;
          const pct = totalInLvl > 0 ? Math.round((completedInLvl / totalInLvl) * 100) : 0;

          return (
            <button
              key={lvl}
              id={`career-level-tab-${lvl}`}
              onClick={() => setSelectedLevel(lvl)}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {info.badge}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {completedInLvl}/{totalInLvl} done
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white tracking-tight">{info.title}</h3>
              <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{info.subtitle}</p>

              <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Pillar Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Focus Pillar:
          </span>
          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              selectedPillar === 'all'
                ? 'bg-slate-800 border-indigo-500 text-white font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Pillars
          </button>
          {(['dsa', 'system_design', 'fullstack', 'cloud_devops'] as CareerPillar[]).map(pillar => {
            const cfg = pillarConfig[pillar];
            const Icon = cfg.icon;
            const isSelected = selectedPillar === pillar;
            return (
              <button
                key={pillar}
                onClick={() => setSelectedPillar(pillar)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-slate-800 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cfg.textCol}`} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filteredMilestones.length}</span> milestones for {levelLabels[selectedLevel].title}
        </div>
      </div>

      {/* Milestones Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMilestones.map((milestone) => {
          const cfg = pillarConfig[milestone.pillar];
          const Icon = cfg.icon;

          return (
            <div
              key={milestone.id}
              id={`milestone-card-${milestone.id}`}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                milestone.completed
                  ? 'bg-slate-900/50 border-emerald-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle Completion */}
                <button
                  id={`milestone-toggle-${milestone.id}`}
                  onClick={() => onToggleMilestone(milestone.id)}
                  className="mt-0.5 flex-shrink-0 transition-transform active:scale-95 focus:outline-none"
                  title={milestone.completed ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {milestone.completed ? (
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center ring-2 ring-emerald-400/30">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg border-2 border-slate-600 hover:border-indigo-400 flex items-center justify-center bg-slate-950 transition-colors">
                      <Circle className="w-3.5 h-3.5 text-transparent hover:text-indigo-400/30" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${cfg.badgeBg} ${cfg.textCol} flex items-center gap-1`}>
                      <Icon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>

                    {milestone.targetCount && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {milestone.currentCount || 0}/{milestone.targetCount} count
                      </span>
                    )}

                    {milestone.completed && (
                      <span className="text-[10px] font-bold text-emerald-400 ml-auto flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                  </div>

                  <h3 className={`mt-1.5 text-sm font-bold tracking-tight ${
                    milestone.completed ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'
                  }`}>
                    {milestone.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Topics Chips */}
                  {milestone.topics && milestone.topics.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {milestone.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions footer: Increment count if numerical milestone */}
                  {milestone.targetCount && milestone.targetCount > 1 && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Progress: {milestone.currentCount || 0} of {milestone.targetCount} units
                      </span>
                      <button
                        onClick={() => onIncrementCount(milestone.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log +1 Completed</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested AI Prompts for SWE Growth */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI Senior Engineering Mentor Queries
        </h3>
        <p className="text-xs text-slate-400">
          Click any query below to consult the AI Principal Engineering Mentor:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              title: 'System Design Interview Playbook',
              prompt: 'How should I structure a 45-minute Senior System Design interview? Outline the step-by-step framework from requirements to deep dive.',
            },
            {
              title: 'Staff Engineer RFC Writing',
              prompt: 'How do I author a persuasive Architectural RFC for migrating a legacy monolith to event-driven microservices?',
            },
            {
              title: 'Dynamic Programming Mastery',
              prompt: 'Give me the top 5 mental models for solving 2D Dynamic Programming and Interval DP problems efficiently.',
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onOpenCoachModal(item.prompt)}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {item.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
