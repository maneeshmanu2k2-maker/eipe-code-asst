import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { Assessment, Submission } from '../../types/assessment';
import { CodeViewer } from '../common/CodeViewer';

interface TakeAssessmentProps {
  assessment: Assessment;
  studentName: string;
  studentId: string;
  onSubmitSuccess: (submission: Submission) => void;
  onCancel: () => void;
}

const SAMPLE_EXPLANATIONS: Record<string, { high: string; low: string; weak: string }> = {
  'asmt-001': {
    high: 'This function calculates the final price of an item after applying a percentage discount. It also ensures that the discount rate cannot exceed 50 percent, capping any higher input at 50%.',
    low: 'Line 1 defines calculate_discount with price and discount. If discount is greater than 50, discount becomes 50. Then it multiplies price times discount divided by 100, and subtracts that from price to return it.',
    weak: 'The function takes a price and a discount and calculates how much discount to subtract from the price.',
  },
  'asmt-002': {
    high: 'This function performs binary search to find a target value within a sorted list. It tracks left and right pointers, repeatedly inspects the midpoint, and halves the remaining search interval until found or returning -1.',
    low: 'Sets left to 0 and right to len(arr) - 1. In a while loop while left <= right, calculates mid. If arr[mid] == target returns mid, else adjusts left or right by 1, and returns -1 at the end.',
    weak: 'It loops through a list to see if a number is inside and returns -1 if not found.',
  },
  'asmt-003': {
    high: 'TreeNode represents a binary tree node. prune_tree recursively trims leaf nodes whose values are below min_val in post-order traversal, while collect_values performs pre-order traversal to gather remaining node values into a list.',
    low: 'TreeNode has init with val, left, right. prune_tree calls itself on left and right, then checks if val < min_val and left is None and right is None to return None. collect_values adds root.val plus left list plus right list.',
    weak: 'It cleans up a tree and lists the numbers.',
  },
};

export const TakeAssessment: React.FC<TakeAssessmentProps> = ({
  assessment,
  studentName,
  studentId,
  onSubmitSuccess,
  onCancel,
}) => {
  const [studentResponse, setStudentResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStepIndex, setPipelineStepIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samples = SAMPLE_EXPLANATIONS[assessment.id] || {
    high: `This code implements ${assessment.title.toLowerCase()}, handling the core algorithmic transformation and ensuring required constraints are enforced.`,
    low: `The function takes inputs, checks conditions line by line, performs calculations, and returns the result.`,
    weak: `It processes data and returns an answer.`,
  };

  const wordCount = studentResponse.trim().split(/\s+/).filter(Boolean).length;

  const PIPELINE_STEPS = [
    'Parsing Python Code Structure...',
    'Analyzing Tree-sitter AST & Cyclomatic Metrics...',
    'Classifying Code Complexity Band...',
    'Synthesizing Python Code from Plain-English Response (GenAI Prompt B)...',
    'Executing Code in Sandboxed Environment against Unit Tests...',
    'Evaluating HIGH-Level vs LOW-Level Conceptual Understanding (GenAI Prompt C)...',
    'Synthesizing Final Assessment Grade & Feedback...',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentResponse.trim()) {
      setErrorMsg('Please write an explanation before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setPipelineStepIndex(0);

    // Animate pipeline stages
    const stepInterval = setInterval(() => {
      setPipelineStepIndex(prev => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch('/api/submissions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          studentId,
          studentName,
          studentResponse,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Evaluation failed');
      }

      const submission: Submission = await res.json();
      setPipelineStepIndex(PIPELINE_STEPS.length);
      setTimeout(() => {
        onSubmitSuccess(submission);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Failed to submit response.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Assessment Task
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                assessment.complexity.classification === 'COMPLEX'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : assessment.complexity.classification === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {assessment.complexity.classification}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1">{assessment.title}</h1>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
          Student: <span className="text-slate-100 font-semibold">{studentName}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Code Viewer Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Python Code Snippet
          </span>
          <span className="text-slate-400 font-normal lowercase">Read and analyze the code below</span>
        </div>
        <CodeViewer code={assessment.originalCode} title={assessment.title} />
      </div>

      {/* EIPE Question Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-800/60 rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          Question for Assessment
        </div>
        <div className="text-base md:text-lg font-bold text-white">
          {assessment.generatedQuestion}
        </div>
        <p className="text-xs text-slate-300">
          Explain what the code achieves conceptually in plain English. <strong className="text-indigo-200">You do not need to write Python code.</strong>
        </p>
      </div>

      {/* Response Box & Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Your Plain-English Explanation <span className="text-rose-400">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {wordCount} words
            </span>
          </div>

          <textarea
            id="student-eipe-response-input"
            rows={6}
            value={studentResponse}
            onChange={e => setStudentResponse(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your plain-English explanation here. Focus on the main algorithmic purpose, how the steps connect, and any boundary conditions..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed disabled:opacity-50"
            required
          />

          {/* Quick Pre-fills for Testing Research Pipeline */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Presets (Demonstrates Research Outcomes):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                id="btn-prefill-high"
                onClick={() => setStudentResponse(samples.high)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/70 text-xs font-medium transition-colors cursor-pointer"
              >
                High-Level Explanation (PASS + HIGH)
              </button>
              <button
                type="button"
                id="btn-prefill-low"
                onClick={() => setStudentResponse(samples.low)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/70 text-xs font-medium transition-colors cursor-pointer"
              >
                Low-Level Line-by-Line (PASS + LOW)
              </button>
              <button
                type="button"
                id="btn-prefill-weak"
                onClick={() => setStudentResponse(samples.weak)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/70 text-xs font-medium transition-colors cursor-pointer"
              >
                Incomplete Explanation (FAIL)
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel & Return
          </button>

          <button
            type="submit"
            id="btn-submit-eipe-answer"
            disabled={isSubmitting || !studentResponse.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Evaluating Assessment Pipeline...' : 'Submit Explanation for Assessment'}
          </button>
        </div>
      </form>

      {/* Multi-Stage Pipeline Live Execution Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Automated Assessment Pipeline</h3>
              <p className="text-xs text-slate-400">
                Executing multi-stage GenAI code generation, sandboxed unit testing, and comprehension classification.
              </p>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="space-y-2.5">
              {PIPELINE_STEPS.map((step, idx) => {
                const isCurrent = idx === pipelineStepIndex;
                const isDone = idx < pipelineStepIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 shadow-sm'
                        : isDone
                        ? 'bg-slate-950/60 border border-slate-800 text-slate-300'
                        : 'opacity-40 text-slate-500'
                    }`}
                  >
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[11px] text-slate-500">
              Running isolated Python sandbox and dual-stage Gemini evaluator...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
