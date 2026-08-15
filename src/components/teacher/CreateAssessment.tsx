import React, { useState } from 'react';
import {
  Sparkles,
  Activity,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCode,
  Sliders,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Assessment, ASTAnalysis, UnitTest } from '../../types/assessment';
import { AstVisualizerModal } from '../ast/AstVisualizerModal';
import { CodeViewer } from '../common/CodeViewer';

interface CreateAssessmentProps {
  onAssessmentCreated: (assessment: Assessment) => void;
  onCancel: () => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Discount with 50% Cap (Simple)',
    code: `def calculate_discount(price, discount):
    if discount > 50:
        discount = 50

    return price - (price * discount / 100)
`,
    expected: 'Calculates price minus percentage discount, capping the maximum discount at 50%.',
    tests: [
      { id: 'ut-1', name: 'Nominal 20% discount', assertionCode: 'assert calculate_discount(100, 20) == 80.0', isRequired: true },
      { id: 'ut-2', name: 'Zero percent discount', assertionCode: 'assert calculate_discount(100, 0) == 100.0', isRequired: true },
      { id: 'ut-3', name: '50% maximum cap limit', assertionCode: 'assert calculate_discount(100, 75) == 50.0', isRequired: true },
    ],
  },
  {
    name: 'Binary Search (Moderate)',
    code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1
`,
    expected: 'Performs logarithmic search on sorted array returning matching index or -1.',
    tests: [
      { id: 'ut-bs-1', name: 'Element at middle', assertionCode: 'assert binary_search([1, 3, 5, 7, 9], 5) == 2', isRequired: true },
      { id: 'ut-bs-2', name: 'Missing target', assertionCode: 'assert binary_search([1, 3, 5, 7, 9], 4) == -1', isRequired: true },
      { id: 'ut-bs-3', name: 'First element target', assertionCode: 'assert binary_search([2, 4, 6, 8], 2) == 0', isRequired: true },
    ],
  },
  {
    name: 'Recursive Node Pruning (Complex)',
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def prune_tree(root, min_val):
    if root is None:
        return None
        
    root.left = prune_tree(root.left, min_val)
    root.right = prune_tree(root.right, min_val)
    
    if root.val < min_val and root.left is None and root.right is None:
        return None
        
    return root
`,
    expected: 'Recursively prunes leaf nodes in binary tree that are strictly less than threshold min_val.',
    tests: [
      { id: 'ut-tr-1', name: 'Prune single leaf below min', assertionCode: 'assert prune_tree(TreeNode(3), 5) is None', isRequired: true },
      { id: 'ut-tr-2', name: 'Retain leaf above min', assertionCode: 'assert prune_tree(TreeNode(10), 5).val == 10', isRequired: true },
    ],
  },
];

export const CreateAssessment: React.FC<CreateAssessmentProps> = ({
  onAssessmentCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [pythonCode, setPythonCode] = useState(PRESET_TEMPLATES[0].code);
  const [expectedBehavior, setExpectedBehavior] = useState(PRESET_TEMPLATES[0].expected);
  const [maxMarks, setMaxMarks] = useState(10);
  const [teacherNotes, setTeacherNotes] = useState('Benchmark question for code comprehension study.');
  const [unitTests, setUnitTests] = useState<UnitTest[]>(PRESET_TEMPLATES[0].tests);

  const [astAnalysis, setAstAnalysis] = useState<ASTAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trigger AST Analysis
  const handleAnalyzeAST = async () => {
    if (!pythonCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter Python code to analyze.' });
      return;
    }
    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/ast/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode }),
      });
      if (!res.ok) throw new Error('AST analysis failed');
      const data: ASTAnalysis = await res.json();
      setAstAnalysis(data);
      setStatusMessage({
        type: 'success',
        text: `AST Parsed: Classified as ${data.classification} (Complexity Score: ${data.complexityScore}/10)`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to analyze AST' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate Unit Tests via Gemini
  const handleGenerateTests = async () => {
    if (!pythonCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter Python code first.' });
      return;
    }
    setIsGeneratingTests(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/assessments/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode, expectedBehavior }),
      });
      if (!res.ok) throw new Error('Failed to generate tests');
      const tests: UnitTest[] = await res.json();
      if (tests.length > 0) {
        setUnitTests(tests);
        setStatusMessage({ type: 'success', text: `Generated ${tests.length} unit tests via GenAI.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error generating unit tests' });
    } finally {
      setIsGeneratingTests(false);
    }
  };

  const handleAddUnitTest = () => {
    const newTest: UnitTest = {
      id: `ut-${Date.now()}`,
      name: `Test ${unitTests.length + 1}`,
      assertionCode: 'assert function_name(args) == expected',
      description: 'Custom test case',
      isRequired: true,
    };
    setUnitTests([...unitTests, newTest]);
  };

  const handleUpdateUnitTest = (index: number, updated: Partial<UnitTest>) => {
    const copy = [...unitTests];
    copy[index] = { ...copy[index], ...updated };
    setUnitTests(copy);
  };

  const handleDeleteUnitTest = (index: number) => {
    setUnitTests(unitTests.filter((_, i) => i !== index));
  };

  const handleLoadPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.name);
    setPythonCode(preset.code);
    setExpectedBehavior(preset.expected);
    setUnitTests(preset.tests);
    setAstAnalysis(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pythonCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Title and Python code snippet are required.' });
      return;
    }
    if (unitTests.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please provide at least one unit test.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalCode: pythonCode,
          expectedBehavior,
          unitTests,
          maxMarks,
          teacherNotes,
          tags: astAnalysis ? [astAnalysis.classification, `${astAnalysis.stats.functionsCount} Functions`] : ['Python'],
        }),
      });

      if (!res.ok) throw new Error('Failed to save assessment');
      const saved: Assessment = await res.json();
      onAssessmentCreated(saved);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save assessment' });
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Code Assessment</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Teacher Studio
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Author Python code snippet, run Tree-sitter AST analysis, and configure unit tests for student EIPE comprehension grading.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Load Preset:</span>
          <div className="flex gap-1.5 overflow-x-auto">
            {PRESET_TEMPLATES.map((p, i) => (
              <button
                key={i}
                type="button"
                id={`load-preset-${i}`}
                onClick={() => handleLoadPreset(p)}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-800 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Fields Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Code & AST (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assessment Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="assessment-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Discount Calculator with Cap Enforcement"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Python Code Editor Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Python Code Snippet <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  id="btn-analyse-code-ast"
                  onClick={handleAnalyzeAST}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyzing AST...' : 'Analyse Code AST'}
                </button>
              </div>

              <textarea
                id="assessment-code-input"
                rows={10}
                value={pythonCode}
                onChange={e => setPythonCode(e.target.value)}
                placeholder="def my_function(x):\n    # paste Python code here\n    return x"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                required
              />

              <p className="text-[11px] text-slate-400">
                The Python code will be analyzed with Tree-sitter to compute cyclomatic metrics and generate the tailored EIPE question.
              </p>
            </div>

            {/* Live AST Complexity Display */}
            {astAnalysis && (
              <div className="border-t border-slate-800 pt-2">
                <AstVisualizerModal analysis={astAnalysis} />
              </div>
            )}

            {/* Unit Test Suite Builder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Unit Test Suite ({unitTests.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tests executed in secure sandbox against student-generated code.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    id="btn-ai-generate-tests"
                    onClick={handleGenerateTests}
                    disabled={isGeneratingTests}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingTests ? 'animate-spin' : ''}`} />
                    {isGeneratingTests ? 'Synthesizing Tests...' : 'Generate Unit Tests (AI)'}
                  </button>
                  <button
                    type="button"
                    id="btn-add-unit-test"
                    onClick={handleAddUnitTest}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Test
                  </button>
                </div>
              </div>

              {unitTests.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No unit tests added yet. Click "Generate Unit Tests" or "Add Test" to begin.
                </div>
              ) : (
                <div className="space-y-3">
                  {unitTests.map((test, idx) => (
                    <div
                      key={test.id}
                      className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={test.name}
                          onChange={e => handleUpdateUnitTest(idx, { name: e.target.value })}
                          placeholder="Test Name, e.g. Zero Boundary Case"
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-medium text-xs w-2/3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={test.isRequired}
                              onChange={e => handleUpdateUnitTest(idx, { isRequired: e.target.checked })}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            Required
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDeleteUnitTest(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete test"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={test.assertionCode}
                          onChange={e => handleUpdateUnitTest(idx, { assertionCode: e.target.value })}
                          placeholder="assert calculate_discount(100, 20) == 80.0"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 font-mono text-indigo-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata & Notes (1 col) */}
          <div className="space-y-6">
            {/* Expected Behavior */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Expected Behavior / Reference
              </label>
              <textarea
                rows={4}
                value={expectedBehavior}
                onChange={e => setExpectedBehavior(e.target.value)}
                placeholder="Describe what the correct algorithm accomplishes and key boundary conditions..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Used by GenAI for context evaluation and test generation.
              </p>
            </div>

            {/* Assessment Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Grading Configuration
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Maximum Marks</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxMarks}
                  onChange={e => setMaxMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Optional Teacher Notes</label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={e => setTeacherNotes(e.target.value)}
                  placeholder="Notes for research auditing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <button
                type="submit"
                id="btn-save-assessment"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Assessment...' : 'Save Assessment'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
