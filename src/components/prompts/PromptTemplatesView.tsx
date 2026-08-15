import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Save,
  CheckCircle,
  Sliders,
  FileCode,
  Sparkles,
  RefreshCw,
  Layers,
  Code2,
} from 'lucide-react';
import { PromptConfig } from '../../types/assessment';

export const PromptTemplatesView: React.FC = () => {
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'promptB' | 'promptC' | 'promptA'>('promptB');

  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to update prompts');
      const updated = await res.json();
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mx-auto mb-3" />
        Loading GenAI prompt templates and model configuration...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              GenAI Prompt Architecture & LLM Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              System Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure LLM inference parameters and inspect the multi-stage prompts (Prompt A, Prompt B, Prompt C) powering the research assessment pipeline.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Prompt configuration saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model & Inference Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sliders className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              LLM Model & Inference Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* LLM Provider / Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Primary LLM Engine
              </label>
              <select
                id="llm-provider-select"
                value={config.llmProvider}
                onChange={e => setConfig({ ...config, llmProvider: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended Default)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                <option value="claude-sonnet-4.6">Claude Sonnet 4.6 (Compatible Endpoint)</option>
              </select>
              <p className="text-[10px] text-slate-500">
                Processed server-side via official @google/genai SDK.
              </p>
            </div>

            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Sampling Temperature
                </label>
                <span className="text-xs font-mono text-indigo-300">{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.temperature}
                onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0 (Deterministic)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Max Generation Tokens
              </label>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={config.maxTokens}
                onChange={e => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                Sufficient for Python synthesis and JSON structured reasoning.
              </p>
            </div>
          </div>
        </div>

        {/* Prompt Template Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('promptB')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'promptB'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Prompt B: EIPE Code Generation (Step 6)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promptC')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'promptC'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Prompt C: HIGH vs LOW Evaluation (Step 8)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('promptA')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'promptA'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Prompt A: Complexity Guidelines (Step 3)
            </button>
          </div>

          {/* Active Tab Textarea */}
          {activeTab === 'promptB' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">
                  Prompt B System Instructions & Few-Shot Templates
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Variables: {'{{ORIGINAL_CODE}}, {{STUDENT_EXPLANATION}}, {{QUESTION}}'}
                </span>
              </div>
              <textarea
                rows={12}
                value={config.promptBCodeGen}
                onChange={e => setConfig({ ...config, promptBCodeGen: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Instructs the model to reconstruct executable Python code based strictly on what the student described, without hallucinating omitted details.
              </p>
            </div>
          )}

          {activeTab === 'promptC' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">
                  Prompt C High vs Low Understanding Evaluator
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Variables: {'{{ORIGINAL_CODE}}, {{STUDENT_EXPLANATION}}, {{TEST_RESULTS}}'}
                </span>
              </div>
              <textarea
                rows={12}
                value={config.promptCHighLow}
                onChange={e => setConfig({ ...config, promptCHighLow: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[11px] text-slate-400">
                Evaluates whether the student's response captures conceptual and algorithmic intent (HIGH) or merely recites line-by-line syntax (LOW).
              </p>
            </div>
          )}

          {activeTab === 'promptA' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">
                  Prompt A / AST Complexity Rubric
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Integrated with Tree-sitter heuristic scoring engine
                </span>
              </div>
              <textarea
                rows={12}
                value={config.promptAComplexity}
                onChange={e => setConfig({ ...config, promptAComplexity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            id="btn-save-prompts"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Prompt Architecture Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
