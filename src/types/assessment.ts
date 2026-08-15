export type ComplexityClassification = 'SIMPLE' | 'MODERATE' | 'COMPLEX';

export type UnderstandingLevel = 'HIGH' | 'LOW';

export type FinalOutcome = 
  | 'CORRECT — PASS + HIGH'
  | 'INCORRECT — PASS + LOW'
  | 'INCORRECT — FAIL';

export interface ASTStats {
  functionsCount: number;
  classesCount: number;
  loopsCount: number;
  conditionalsCount: number;
  variablesCount: number;
  functionCallsCount: number;
  importsCount: number;
  statementsCount: number;
  maxNestingDepth: number;
  hasRecursion: boolean;
  cyclomaticComplexity: number;
  recursionFunctions: string[];
  detectedFunctions: { name: string; params: string[]; docstring?: string; lineStart: number; lineEnd: number }[];
  detectedClasses: { name: string; methods: string[]; lineStart: number; lineEnd: number }[];
  syntaxNodeCounts: Record<string, number>;
}

export interface ASTAnalysis {
  complexityScore: number; // e.g. 7.5 / 10
  classification: ComplexityClassification;
  explanation: string;
  indicators: string[];
  recommendedQuestion: string;
  stats: ASTStats;
}

export interface UnitTest {
  id: string;
  name: string;
  assertionCode: string; // e.g. "assert calculate_discount(100, 20) == 80.0"
  description?: string;
  isRequired: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  originalCode: string;
  expectedBehavior: string;
  unitTests: UnitTest[];
  maxMarks: number;
  teacherNotes?: string;
  complexity: ASTAnalysis;
  generatedQuestion: string;
  createdBy: string;
  createdAt: string;
  tags?: string[];
}

export interface PipelineStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  summary?: string;
  data?: any;
  durationMs?: number;
  timestamp?: string;
}

export interface CodeGenResult {
  generatedCode: string;
  explanationSummary: string;
  assumptions: string[];
  confidence: number;
  reconstructionSufficiency: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  aiModelUsed?: string;
}

export interface SingleTestExecution {
  testId: string;
  name: string;
  assertionCode: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput?: string;
  errorMessage?: string;
  executionTimeMs: number;
}

export interface SandboxExecutionResult {
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  executionTime: number; // in seconds
  rawStdout: string;
  rawStderr: string;
  errorMessage?: string;
  tests: SingleTestExecution[];
}

export interface HighLowEvaluation {
  level: UnderstandingLevel;
  confidence: number;
  reasoningSummary: string;
  evidence: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface HumanGrade {
  grade: 'CORRECT' | 'INCORRECT';
  understandingLevel: UnderstandingLevel;
  humanOutcome: FinalOutcome;
  notes?: string;
  evaluatorName?: string;
  gradedAt?: string;
}

export interface Submission {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  studentId: string;
  studentName: string;
  originalCode: string;
  complexityScore: number;
  complexityClassification: ComplexityClassification;
  generatedQuestion: string;
  studentResponse: string;
  generatedCode: string;
  codeGenDetails?: CodeGenResult;
  unitTestResults: SandboxExecutionResult;
  testPassStatus: boolean;
  understandingLevel: UnderstandingLevel;
  confidence: number;
  highLowDetails: HighLowEvaluation;
  finalOutcome: FinalOutcome;
  humanGrade?: HumanGrade;
  timestamp: string;
  pipelineLog: PipelineStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatarInitials: string;
}

export interface PromptConfig {
  promptAComplexity: string;
  promptBCodeGen: string;
  promptCHighLow: string;
  llmProvider: string;
  temperature: number;
  maxTokens?: number;
}

export interface ResearchMethodStats {
  methodName: string;
  humanAgreementRate: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  highLevelDetectionRate: number;
  lowLevelDetectionRate: number;
}

export interface ResearchMetrics {
  totalSubmissionsAnalyzed: number;
  baseline: ResearchMethodStats;
  standardGenAI: ResearchMethodStats;
  proposedExtended: ResearchMethodStats;
  confusionMatrix: {
    truePassHigh: number;
    truePassLow: number;
    trueFail: number;
    falsePassHigh: number;
    falsePassLow: number;
    falseFail: number;
  };
}
