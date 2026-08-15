import React from 'react';
import {
  Activity,
  Layers,
  Repeat,
  GitBranch,
  Box,
  Hash,
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { ASTAnalysis } from '../../types/assessment';

interface AstVisualizerModalProps {
  analysis: ASTAnalysis;
  onClose?: () => void;
  isModal?: boolean;
}

export const AstVisualizerModal: React.FC<AstVisualizerModalProps> = ({
  analysis,
  onClose,
  isModal = false,
}) => {
  const { complexityScore, classification, explanation, indicators, stats } = analysis;

  const content = (
    <div className="space-y-6">
      {/* Header Metric Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Tree-sitter AST Complexity Engine
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  classification === 'COMPLEX'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : classification === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {classification}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Complexity Score: {complexityScore.toFixed(1)} / 10.0
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">{explanation}</p>
          </div>

          {/* Gauge Bar */}
          <div className="w-full sm:w-44 space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Scale</span>
              <span className="font-mono text-white font-bold">{complexityScore}/10</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  classification === 'COMPLEX'
                    ? 'bg-rose-500'
                    : classification === 'MODERATE'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(complexityScore * 10, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0 Simple</span>
              <span>10.0 Complex</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of AST Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-indigo-400 mb-1">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.functionsCount}</div>
          <div className="text-[11px] text-slate-400">Functions</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-purple-400 mb-1">
            <Box className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.classesCount}</div>
          <div className="text-[11px] text-slate-400">Classes</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-sky-400 mb-1">
            <Repeat className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.loopsCount}</div>
          <div className="text-[11px] text-slate-400">Loops</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-amber-400 mb-1">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.conditionalsCount}</div>
          <div className="text-[11px] text-slate-400">Conditionals</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-emerald-400 mb-1">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.maxNestingDepth}</div>
          <div className="text-[11px] text-slate-400">Max Nesting Depth</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-center">
          <div className="flex justify-center text-rose-400 mb-1">
            <Hash className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-white">{stats.cyclomaticComplexity}</div>
          <div className="text-[11px] text-slate-400">Cyclomatic Index</div>
        </div>
      </div>

      {/* Breakdown Details & Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Indicators List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Syntactic Explainability Indicators
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {indicators.map((ind, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recursion & Structure Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Structure & Recursion Detection
          </h4>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Recursive Calls:</span>
                <span className={`font-semibold ${stats.hasRecursion ? 'text-rose-400' : 'text-slate-300'}`}>
                  {stats.hasRecursion ? `Yes (${stats.recursionFunctions.join(', ')})` : 'No Recursion'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Statements Count:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.statementsCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 mb-1">Generated EIPE Question:</div>
              <div className="font-medium text-indigo-300 bg-indigo-950/50 p-2 rounded border border-indigo-800/50 italic">
                "{analysis.recommendedQuestion}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">Tree-sitter Python AST Inspector</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
};
