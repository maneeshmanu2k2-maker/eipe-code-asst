import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  BookOpen,
  FlaskConical,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ResearchMetrics } from '../../types/assessment';

export const ResearchEvaluationView: React.FC = () => {
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/research/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load metrics:', err);
        setLoading(false);
      });
  }, []);

  const handleExportData = () => {
    if (!metrics) return;
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eipe-research-metrics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !metrics) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mx-auto mb-3" />
        Computing comparative research metrics across 3 assessment paradigms...
      </div>
    );
  }

  const { baseline, standardGenAI, proposedExtended } = metrics;

  // Comparison Bar Chart Data
  const chartData = [
    {
      metric: 'Human Agreement',
      Baseline: Number((baseline.humanAgreementRate * 100).toFixed(1)),
      'Standard GenAI': Number((standardGenAI.humanAgreementRate * 100).toFixed(1)),
      'Proposed Extended': Number((proposedExtended.humanAgreementRate * 100).toFixed(1)),
    },
    {
      metric: 'Accuracy',
      Baseline: Number((baseline.accuracy * 100).toFixed(1)),
      'Standard GenAI': Number((standardGenAI.accuracy * 100).toFixed(1)),
      'Proposed Extended': Number((proposedExtended.accuracy * 100).toFixed(1)),
    },
    {
      metric: 'Precision',
      Baseline: Number((baseline.precision * 100).toFixed(1)),
      'Standard GenAI': Number((standardGenAI.precision * 100).toFixed(1)),
      'Proposed Extended': Number((proposedExtended.precision * 100).toFixed(1)),
    },
    {
      metric: 'Recall',
      Baseline: Number((baseline.recall * 100).toFixed(1)),
      'Standard GenAI': Number((standardGenAI.recall * 100).toFixed(1)),
      'Proposed Extended': Number((proposedExtended.recall * 100).toFixed(1)),
    },
    {
      metric: 'F1 Score',
      Baseline: Number((baseline.f1Score * 100).toFixed(1)),
      'Standard GenAI': Number((standardGenAI.f1Score * 100).toFixed(1)),
      'Proposed Extended': Number((proposedExtended.f1Score * 100).toFixed(1)),
    },
  ];

  // Radar chart data for conceptual depth
  const radarData = [
    { subject: 'Agreement', A: baseline.humanAgreementRate * 100, B: standardGenAI.humanAgreementRate * 100, C: proposedExtended.humanAgreementRate * 100 },
    { subject: 'Accuracy', A: baseline.accuracy * 100, B: standardGenAI.accuracy * 100, C: proposedExtended.accuracy * 100 },
    { subject: 'F1 Score', A: baseline.f1Score * 100, B: standardGenAI.f1Score * 100, C: proposedExtended.f1Score * 100 },
    { subject: 'High-Level Det.', A: baseline.highLevelDetectionRate * 100, B: standardGenAI.highLevelDetectionRate * 100, C: proposedExtended.highLevelDetectionRate * 100 },
    { subject: 'Low-Level Filter', A: baseline.lowLevelDetectionRate * 100, B: standardGenAI.lowLevelDetectionRate * 100, C: proposedExtended.lowLevelDetectionRate * 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Research Evaluation & Comparative Analysis
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Empirical Study
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing Baseline, Standard GenAI Code Generation, and our Proposed Extended Framework for Explain-in-Plain-English Assessment.
          </p>
        </div>

        <button
          onClick={handleExportData}
          id="btn-export-research-dataset"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Evaluation Dataset JSON
        </button>
      </div>

      {/* Research Paper Abstract Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Research Paper Synopsis
        </div>
        <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
          “Improving Automated Assessment of Code Comprehension using GenAI: Extending Code Generation Based Grading for Explain-in-Plain-English Questions to Complex Code”
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Automated assessment of student code comprehension via Explain-in-Plain-English (EIPE) questions has historically suffered when relying solely on unit test execution of GenAI-reconstructed code. A student who copies code syntax line-by-line produces code that passes unit tests, yet lacks conceptual understanding (<span className="text-amber-300 font-semibold">PASS + LOW</span>). Our proposed extended pipeline incorporates Tree-sitter AST complexity classification and Prompt C understanding level evaluation to accurately award credit only to <span className="text-emerald-300 font-semibold">PASS + HIGH</span>.
        </p>
      </div>

      {/* 3-Way Paradigm Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Baseline Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Method 1: Baseline
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
              Keyword/Regex
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-300">{baseline.methodName}</h3>
          <p className="text-xs text-slate-400">
            Keyword matching and surface-level similarity without code execution.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Human Agreement:</span>
              <span className="font-bold text-slate-300">{(baseline.humanAgreementRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accuracy:</span>
              <span className="font-bold text-slate-300">{(baseline.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">F1 Score:</span>
              <span className="font-bold text-slate-300">{baseline.f1Score.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Low-Level Detection:</span>
              <span className="font-bold">{(baseline.lowLevelDetectionRate * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Standard GenAI Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Method 2: Standard GenAI
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
              Unit Test Only
            </span>
          </div>
          <h3 className="text-base font-bold text-indigo-200">{standardGenAI.methodName}</h3>
          <p className="text-xs text-slate-400">
            Synthesizes code from explanation and checks test passes, failing to differentiate PASS+LOW.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Human Agreement:</span>
              <span className="font-bold text-indigo-300">{(standardGenAI.humanAgreementRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Accuracy:</span>
              <span className="font-bold text-indigo-300">{(standardGenAI.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">F1 Score:</span>
              <span className="font-bold text-indigo-300">{standardGenAI.f1Score.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Low-Level Detection:</span>
              <span className="font-bold">{(standardGenAI.lowLevelDetectionRate * 100).toFixed(0)}% (Overcredited)</span>
            </div>
          </div>
        </div>

        {/* Proposed Extended Card */}
        <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Method 3: Proposed Extended
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Our Research
            </span>
          </div>
          <h3 className="text-base font-bold text-white">{proposedExtended.methodName}</h3>
          <p className="text-xs text-slate-300">
            AST complexity aware + Prompt C dual classification separating behavioral & conceptual understanding.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Human Agreement:</span>
              <span className="font-bold text-emerald-400">{(proposedExtended.humanAgreementRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Accuracy:</span>
              <span className="font-bold text-emerald-400">{(proposedExtended.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">F1 Score:</span>
              <span className="font-bold text-emerald-400">{proposedExtended.f1Score.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Low-Level Filter Accuracy:</span>
              <span className="font-bold">{(proposedExtended.lowLevelDetectionRate * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparative Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Comparative Performance Metrics (%)
            </h3>
            <span className="text-[11px] text-slate-400">N = {metrics.totalSubmissionsAnalyzed} Evaluated Submissions</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
                <XAxis dataKey="metric" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                <Bar dataKey="Baseline" fill="#64748b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Standard GenAI" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Proposed Extended" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Multi-Dimensional Capability Radar
            </h3>
            <span className="text-[11px] text-slate-400">Qualitative & Quantitative Span</span>
          </div>

          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={85}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" domain={[0, 100]} />
                <Radar name="Baseline" dataKey="A" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                <Radar name="Standard GenAI" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Radar name="Proposed Extended" dataKey="C" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Statistical Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          Full Research Evaluation Benchmark Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-semibold uppercase text-[10px]">
                <th className="p-3">Methodology / Architecture</th>
                <th className="p-3">AST Aware</th>
                <th className="p-3">Human Agreement</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1 Score</th>
                <th className="p-3">High-Level Det.</th>
                <th className="p-3">Low-Level Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-sans font-medium text-slate-200">{baseline.methodName}</td>
                <td className="p-3 text-slate-500">No</td>
                <td className="p-3 text-slate-300">{(baseline.humanAgreementRate * 100).toFixed(1)}%</td>
                <td className="p-3 text-slate-300">{(baseline.accuracy * 100).toFixed(1)}%</td>
                <td className="p-3 text-slate-300">{baseline.precision.toFixed(2)}</td>
                <td className="p-3 text-slate-300">{baseline.recall.toFixed(2)}</td>
                <td className="p-3 text-slate-300">{baseline.f1Score.toFixed(2)}</td>
                <td className="p-3 text-slate-400">{(baseline.highLevelDetectionRate * 100).toFixed(0)}%</td>
                <td className="p-3 text-slate-400">{(baseline.lowLevelDetectionRate * 100).toFixed(0)}%</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-sans font-medium text-indigo-300">{standardGenAI.methodName}</td>
                <td className="p-3 text-slate-500">No</td>
                <td className="p-3 text-indigo-300">{(standardGenAI.humanAgreementRate * 100).toFixed(1)}%</td>
                <td className="p-3 text-indigo-300">{(standardGenAI.accuracy * 100).toFixed(1)}%</td>
                <td className="p-3 text-indigo-300">{standardGenAI.precision.toFixed(2)}</td>
                <td className="p-3 text-indigo-300">{standardGenAI.recall.toFixed(2)}</td>
                <td className="p-3 text-indigo-300">{standardGenAI.f1Score.toFixed(2)}</td>
                <td className="p-3 text-indigo-300">{(standardGenAI.highLevelDetectionRate * 100).toFixed(0)}%</td>
                <td className="p-3 text-amber-400 font-bold">{(standardGenAI.lowLevelDetectionRate * 100).toFixed(0)}% (Defect)</td>
              </tr>
              <tr className="hover:bg-indigo-950/40 bg-indigo-950/20 font-bold">
                <td className="p-3 font-sans text-emerald-300">{proposedExtended.methodName}</td>
                <td className="p-3 text-emerald-400">Yes (Tree-sitter)</td>
                <td className="p-3 text-emerald-400">{(proposedExtended.humanAgreementRate * 100).toFixed(1)}%</td>
                <td className="p-3 text-emerald-400">{(proposedExtended.accuracy * 100).toFixed(1)}%</td>
                <td className="p-3 text-emerald-400">{proposedExtended.precision.toFixed(2)}</td>
                <td className="p-3 text-emerald-400">{proposedExtended.recall.toFixed(2)}</td>
                <td className="p-3 text-emerald-400">{proposedExtended.f1Score.toFixed(2)}</td>
                <td className="p-3 text-emerald-400">{(proposedExtended.highLevelDetectionRate * 100).toFixed(0)}%</td>
                <td className="p-3 text-emerald-400">{(proposedExtended.lowLevelDetectionRate * 100).toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
