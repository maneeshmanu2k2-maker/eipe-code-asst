import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart2,
  Filter,
  PlusCircle,
  ArrowUpRight,
  Search,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Assessment, Submission, UserProfile } from '../../types/assessment';

interface TeacherDashboardProps {
  assessments: Assessment[];
  submissions: Submission[];
  users: UserProfile[];
  onSelectSubmission: (submission: Submission) => void;
  onCreateAssessment: () => void;
  onTakeAssessment: (assessment: Assessment) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  assessments,
  submissions,
  users,
  onSelectSubmission,
  onCreateAssessment,
  onTakeAssessment,
}) => {
  const [filterAssessment, setFilterAssessment] = useState<string>('ALL');
  const [filterComplexity, setFilterComplexity] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate high-level statistics
  const totalAssessments = assessments.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalSubmissions = submissions.length;

  const passedCount = submissions.filter(s => s.testPassStatus).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const failRate = 100 - passRate;

  const highLevelCount = submissions.filter(s => s.understandingLevel === 'HIGH').length;
  const highLevelRate = totalSubmissions > 0 ? Math.round((highLevelCount / totalSubmissions) * 100) : 0;
  const lowLevelRate = totalSubmissions > 0 ? 100 - highLevelRate : 0;

  const avgConfidence = totalSubmissions > 0
    ? Math.round((submissions.reduce((acc, s) => acc + s.confidence, 0) / totalSubmissions) * 100)
    : 0;

  // Chart Data: Outcome Distribution
  const outcomeData = [
    { name: 'PASS + HIGH (Correct)', value: submissions.filter(s => s.finalOutcome === 'CORRECT — PASS + HIGH').length, color: '#10b981' },
    { name: 'PASS + LOW (Incorrect)', value: submissions.filter(s => s.finalOutcome === 'INCORRECT — PASS + LOW').length, color: '#f59e0b' },
    { name: 'FAIL (Incorrect)', value: submissions.filter(s => s.finalOutcome === 'INCORRECT — FAIL').length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  // Complexity Breakdown Data
  const complexityData = ['SIMPLE', 'MODERATE', 'COMPLEX'].map(c => {
    const subset = submissions.filter(s => s.complexityClassification === c);
    return {
      complexity: c,
      'PASS + HIGH': subset.filter(s => s.finalOutcome === 'CORRECT — PASS + HIGH').length,
      'PASS + LOW': subset.filter(s => s.finalOutcome === 'INCORRECT — PASS + LOW').length,
      'FAIL': subset.filter(s => s.finalOutcome === 'INCORRECT — FAIL').length,
    };
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter(s => {
    if (filterAssessment !== 'ALL' && s.assessmentId !== filterAssessment) return false;
    if (filterComplexity !== 'ALL' && s.complexityClassification !== filterComplexity) return false;
    if (filterOutcome !== 'ALL' && s.finalOutcome !== filterOutcome) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = s.studentName.toLowerCase().includes(q);
      const matchTitle = s.assessmentTitle.toLowerCase().includes(q);
      const matchResponse = s.studentResponse.toLowerCase().includes(q);
      if (!matchStudent && !matchTitle && !matchResponse) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Teacher & Research Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Faculty Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated evaluation metrics across code complexity bands, AST metrics, and high vs low conceptual comprehension.
          </p>
        </div>

        <button
          onClick={onCreateAssessment}
          id="btn-teacher-create-assessment"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Assessment
        </button>
      </div>

      {/* 8-Card Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Assessments</div>
          <div className="text-xl font-bold text-white mt-1">{totalAssessments}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Students</div>
          <div className="text-xl font-bold text-white mt-1">{totalStudents}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Submissions</div>
          <div className="text-xl font-bold text-indigo-300 mt-1">{totalSubmissions}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">PASS Rate</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{passRate}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">FAIL Rate</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{failRate}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">HIGH-Level</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{highLevelRate}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">LOW-Level</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{lowLevelRate}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Confidence</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{avgConfidence}%</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: Research Outcome Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Final Outcome Distribution (Research Logic)
            </h3>
            <span className="text-[11px] text-slate-400">
              {totalSubmissions} Total Attempts
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {outcomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No submissions recorded yet.</div>
            )}
          </div>
        </div>

        {/* Bar: Performance by Code Complexity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Comprehension by Code Complexity (AST Bands)
            </h3>
            <span className="text-[11px] text-slate-400">
              Simple vs Moderate vs Complex
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complexityData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                <XAxis dataKey="complexity" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                <Bar dataKey="PASS + HIGH" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PASS + LOW" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="FAIL" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Assessments Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Configured Assessments ({assessments.length})
            </h3>
            <p className="text-xs text-slate-400">
              Assigned Python snippets, AST classifications, and unit test suites.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assessments.map(asmt => (
            <div
              key={asmt.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asmt.complexity.classification === 'COMPLEX'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : asmt.complexity.classification === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {asmt.complexity.classification} ({asmt.complexity.complexityScore.toFixed(1)}/10)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {asmt.unitTests.length} Tests
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{asmt.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{asmt.generatedQuestion}"
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {submissions.filter(s => s.assessmentId === asmt.id).length} submissions
                </span>
                <button
                  onClick={() => onTakeAssessment(asmt)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Test Run <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions & Audits Table with Multi-Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              Student Submissions & 9-Step Pipeline Logs ({filteredSubmissions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Detailed assessment records with complete research audit trails.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student or task..."
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Assessment Filter */}
            <select
              value={filterAssessment}
              onChange={e => setFilterAssessment(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Assessments</option>
              {assessments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>

            {/* Complexity Filter */}
            <select
              value={filterComplexity}
              onChange={e => setFilterComplexity(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Complexities</option>
              <option value="SIMPLE">SIMPLE</option>
              <option value="MODERATE">MODERATE</option>
              <option value="COMPLEX">COMPLEX</option>
            </select>

            {/* Outcome Filter */}
            <select
              value={filterOutcome}
              onChange={e => setFilterOutcome(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Outcomes</option>
              <option value="CORRECT — PASS + HIGH">PASS + HIGH</option>
              <option value="INCORRECT — PASS + LOW">PASS + LOW</option>
              <option value="INCORRECT — FAIL">FAIL</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-semibold uppercase text-[10px]">
                <th className="p-3">Student</th>
                <th className="p-3">Assessment</th>
                <th className="p-3">Complexity</th>
                <th className="p-3">Unit Tests</th>
                <th className="p-3">Comprehension</th>
                <th className="p-3">Final Outcome</th>
                <th className="p-3">Human Grade</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No submissions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-medium text-slate-100">
                      {sub.studentName}
                    </td>
                    <td className="p-3 text-slate-300 max-w-[200px] truncate">
                      {sub.assessmentTitle}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.complexityClassification === 'COMPLEX'
                            ? 'bg-rose-500/20 text-rose-300'
                            : sub.complexityClassification === 'MODERATE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {sub.complexityClassification}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold ${sub.testPassStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sub.unitTestResults.testsPassed} / {sub.unitTestResults.testsTotal}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-semibold ${
                          sub.understandingLevel === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {sub.understandingLevel} ({(sub.confidence * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.finalOutcome === 'CORRECT — PASS + HIGH'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : sub.finalOutcome === 'INCORRECT — PASS + LOW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {sub.finalOutcome}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {sub.humanGrade ? (
                        <span className="text-indigo-300 font-mono text-[11px]">
                          ✓ {sub.humanGrade.humanOutcome.split(' — ')[1] || sub.humanGrade.grade}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Not annotated</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectSubmission(sub)}
                        id={`btn-view-submission-${sub.id}`}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Audit Pipeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
