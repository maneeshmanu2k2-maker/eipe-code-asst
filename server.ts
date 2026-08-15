import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { analyzePythonCode } from './server/astParser';
import { executeInSandbox } from './server/sandbox';
import {
  generateCodeFromStudentExplanation,
  evaluateHighLowUnderstanding,
  generateUnitTestsWithAI,
} from './server/geminiService';
import {
  getAllAssessments,
  getAssessmentById,
  saveAssessment,
  deleteAssessment,
  getAllSubmissions,
  getSubmissionById,
  saveSubmission,
  updateSubmissionHumanGrade,
  getPromptConfig,
  updatePromptConfig,
  getAllUsers,
  calculateResearchMetrics,
} from './server/storage';
import {
  Assessment,
  FinalOutcome,
  PipelineStep,
  Submission,
} from './src/types/assessment';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Users
  app.get('/api/users', (req, res) => {
    res.json(getAllUsers());
  });

  // AST Analysis Endpoint
  app.post('/api/ast/analyze', (req, res) => {
    try {
      const { code } = req.body;
      if (typeof code !== 'string') {
        return res.status(400).json({ error: 'Field "code" is required.' });
      }
      const analysis = analyzePythonCode(code);
      res.json(analysis);
    } catch (err: any) {
      console.error('AST Analysis error:', err);
      res.status(500).json({ error: err?.message || 'AST parsing failed' });
    }
  });

  // AI Unit Test Generation Endpoint
  app.post('/api/assessments/generate-tests', async (req, res) => {
    try {
      const { code, expectedBehavior } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Code is required.' });
      }
      const tests = await generateUnitTestsWithAI(code, expectedBehavior || '');
      res.json(tests);
    } catch (err: any) {
      console.error('Generate tests error:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate unit tests' });
    }
  });

  // Assessments CRUD
  app.get('/api/assessments', (req, res) => {
    res.json(getAllAssessments());
  });

  app.get('/api/assessments/:id', (req, res) => {
    const assessment = getAssessmentById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(assessment);
  });

  app.post('/api/assessments', (req, res) => {
    try {
      const { title, originalCode, expectedBehavior, unitTests, maxMarks, teacherNotes, tags, createdBy } = req.body;
      if (!title || !originalCode) {
        return res.status(400).json({ error: 'Title and code are required.' });
      }

      const complexity = analyzePythonCode(originalCode);
      const newAssessment: Assessment = {
        id: req.body.id || `asmt-${Date.now()}`,
        title,
        originalCode,
        expectedBehavior: expectedBehavior || '',
        unitTests: Array.isArray(unitTests) ? unitTests : [],
        maxMarks: Number(maxMarks) || 10,
        teacherNotes: teacherNotes || '',
        complexity,
        generatedQuestion: complexity.recommendedQuestion,
        createdBy: createdBy || 'Teacher',
        createdAt: new Date().toISOString(),
        tags: Array.isArray(tags) ? tags : [],
      };

      const saved = saveAssessment(newAssessment);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('Save assessment error:', err);
      res.status(500).json({ error: err?.message || 'Failed to save assessment' });
    }
  });

  app.delete('/api/assessments/:id', (req, res) => {
    const deleted = deleteAssessment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json({ success: true });
  });

  // Submissions & 9-Step Assessment Pipeline Evaluation
  app.get('/api/submissions', (req, res) => {
    let list = getAllSubmissions();
    const { assessmentId, studentId } = req.query;
    if (assessmentId) {
      list = list.filter(s => s.assessmentId === assessmentId);
    }
    if (studentId) {
      list = list.filter(s => s.studentId === studentId);
    }
    res.json(list);
  });

  app.get('/api/submissions/:id', (req, res) => {
    const sub = getSubmissionById(req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(sub);
  });

  // CORE ASSESSMENT PIPELINE EXECUTION
  app.post('/api/submissions/evaluate', async (req, res) => {
    try {
      const {
        assessmentId,
        studentId,
        studentName,
        studentResponse,
      } = req.body;

      if (!assessmentId || !studentResponse || !studentResponse.trim()) {
        return res.status(400).json({ error: 'Assessment ID and student response are required.' });
      }

      const assessment = getAssessmentById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found.' });
      }

      const promptConfig = getPromptConfig();
      const pipelineLog: PipelineStep[] = [];

      // Step 1: Original Code
      const step1Start = Date.now();
      pipelineLog.push({
        stepNumber: 1,
        title: 'Original Python Code Ingestion',
        description: 'Validated code snippet structure and test suite',
        status: 'completed',
        summary: `${assessment.title} (${assessment.originalCode.split('\n').length} lines)`,
        data: { originalCode: assessment.originalCode },
        durationMs: Date.now() - step1Start,
        timestamp: new Date().toISOString(),
      });

      // Step 2: AST Analysis
      const step2Start = Date.now();
      const ast = analyzePythonCode(assessment.originalCode);
      pipelineLog.push({
        stepNumber: 2,
        title: 'Tree-sitter AST Parsing',
        description: 'Analyzed AST syntax nodes, functions, loops, and cyclomatic complexity',
        status: 'completed',
        summary: `Cyclomatic Complexity: ${ast.stats.cyclomaticComplexity}, Functions: ${ast.stats.functionsCount}, Nesting: ${ast.stats.maxNestingDepth}`,
        data: ast,
        durationMs: Date.now() - step2Start,
        timestamp: new Date().toISOString(),
      });

      // Step 3: Complexity Classification
      const step3Start = Date.now();
      pipelineLog.push({
        stepNumber: 3,
        title: 'Complexity Classification',
        description: 'Classified code complexity band based on metrics',
        status: 'completed',
        summary: `Band: ${ast.classification} (Score: ${ast.complexityScore}/10)`,
        data: { score: ast.complexityScore, classification: ast.classification, indicators: ast.indicators },
        durationMs: Date.now() - step3Start,
        timestamp: new Date().toISOString(),
      });

      // Step 4: Generated EIPE Question
      const step4Start = Date.now();
      const question = ast.recommendedQuestion;
      pipelineLog.push({
        stepNumber: 4,
        title: 'EIPE Question Generation',
        description: 'Generated pedagogical question tailored to complexity band',
        status: 'completed',
        summary: `Question: "${question}"`,
        data: { question },
        durationMs: Date.now() - step4Start,
        timestamp: new Date().toISOString(),
      });

      // Step 5: Student Response
      const step5Start = Date.now();
      pipelineLog.push({
        stepNumber: 5,
        title: 'Student EIPE Response',
        description: 'Captured natural-language plain-English explanation',
        status: 'completed',
        summary: `Length: ${studentResponse.split(/\s+/).length} words`,
        data: { response: studentResponse, studentName: studentName || 'Student' },
        durationMs: Date.now() - step5Start,
        timestamp: new Date().toISOString(),
      });

      // Step 6: GenAI Code Generation (Prompt B)
      const step6Start = Date.now();
      const codeGenResult = await generateCodeFromStudentExplanation(
        assessment.originalCode,
        studentResponse,
        question,
        promptConfig.llmProvider,
        promptConfig.promptBCodeGen
      );
      pipelineLog.push({
        stepNumber: 6,
        title: 'GenAI Code Generation (Prompt B)',
        description: "Synthesized executable Python representing the student's stated understanding",
        status: 'completed',
        summary: `Confidence: ${(codeGenResult.confidence * 100).toFixed(0)}%, Reconstruction: ${codeGenResult.reconstructionSufficiency}`,
        data: codeGenResult,
        durationMs: Date.now() - step6Start,
        timestamp: new Date().toISOString(),
      });

      // Step 7: Sandbox Execution & Unit Testing
      const step7Start = Date.now();
      const sandboxResults = await executeInSandbox(
        codeGenResult.generatedCode,
        assessment.unitTests
      );
      const testPassed = sandboxResults.status === 'PASSED';
      pipelineLog.push({
        stepNumber: 7,
        title: 'Secure Sandbox Unit Test Execution',
        description: 'Executed synthesized Python in isolated sandbox against teacher unit tests',
        status: testPassed ? 'completed' : 'failed',
        summary: `${sandboxResults.testsPassed} / ${sandboxResults.testsTotal} tests passed (${testPassed ? 'PASS' : 'FAIL'}) in ${sandboxResults.executionTime}s`,
        data: sandboxResults,
        durationMs: Date.now() - step7Start,
        timestamp: new Date().toISOString(),
      });

      // Step 8: HIGH/LOW Understanding Classification (Prompt C)
      const step8Start = Date.now();
      const highLowResult = await evaluateHighLowUnderstanding(
        assessment.originalCode,
        studentResponse,
        codeGenResult.generatedCode,
        testPassed,
        sandboxResults.testsPassed,
        sandboxResults.testsTotal,
        ast.classification,
        promptConfig.llmProvider,
        promptConfig.promptCHighLow
      );
      pipelineLog.push({
        stepNumber: 8,
        title: 'HIGH vs LOW Understanding Evaluation (Prompt C)',
        description: 'Classified conceptual understanding vs mechanical syntax restatements',
        status: 'completed',
        summary: `Level: ${highLowResult.level} (Confidence: ${(highLowResult.confidence * 100).toFixed(0)}%)`,
        data: highLowResult,
        durationMs: Date.now() - step8Start,
        timestamp: new Date().toISOString(),
      });

      // Step 9: Final Grade Synthesis (Research Rule)
      // IF generated_code FAILS unit tests: FINAL OUTCOME = INCORRECT — FAIL
      // ELSE IF generated_code PASSES unit tests:
      //    IF EIPE level = HIGH: FINAL OUTCOME = CORRECT — PASS + HIGH
      //    ELSE IF EIPE level = LOW: FINAL OUTCOME = INCORRECT — PASS + LOW
      const step9Start = Date.now();
      let finalOutcome: FinalOutcome = 'INCORRECT — FAIL';

      if (!testPassed) {
        finalOutcome = 'INCORRECT — FAIL';
      } else if (highLowResult.level === 'HIGH') {
        finalOutcome = 'CORRECT — PASS + HIGH';
      } else {
        finalOutcome = 'INCORRECT — PASS + LOW';
      }

      pipelineLog.push({
        stepNumber: 9,
        title: 'Final Grade Synthesis',
        description: 'Computed final assessment verdict according to research grading logic',
        status: 'completed',
        summary: finalOutcome,
        data: { finalOutcome, testPassed, level: highLowResult.level },
        durationMs: Date.now() - step9Start,
        timestamp: new Date().toISOString(),
      });

      // Build Submission Record
      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        studentId: studentId || 'user-student-1',
        studentName: studentName || 'Alex Chen',
        originalCode: assessment.originalCode,
        complexityScore: ast.complexityScore,
        complexityClassification: ast.classification,
        generatedQuestion: question,
        studentResponse,
        generatedCode: codeGenResult.generatedCode,
        codeGenDetails: codeGenResult,
        unitTestResults: sandboxResults,
        testPassStatus: testPassed,
        understandingLevel: highLowResult.level,
        confidence: highLowResult.confidence,
        highLowDetails: highLowResult,
        finalOutcome,
        timestamp: new Date().toISOString(),
        pipelineLog,
      };

      const saved = saveSubmission(newSubmission);
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('Submission evaluation error:', err);
      res.status(500).json({ error: err?.message || 'Pipeline evaluation failed' });
    }
  });

  // Human Grade Annotation (for Research comparison)
  app.post('/api/submissions/:id/human-grade', (req, res) => {
    try {
      const { grade, understandingLevel, notes, evaluatorName } = req.body;
      if (!grade || !understandingLevel) {
        return res.status(400).json({ error: 'Grade and understandingLevel are required.' });
      }

      const updated = updateSubmissionHumanGrade(req.params.id, {
        grade,
        understandingLevel,
        notes,
        evaluatorName: evaluatorName || 'Dr. Elena Rostova',
      });

      if (!updated) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Human grade error:', err);
      res.status(500).json({ error: err?.message || 'Failed to save human grade' });
    }
  });

  // Prompt Configuration & Research Metrics
  app.get('/api/prompts', (req, res) => {
    res.json(getPromptConfig());
  });

  app.post('/api/prompts', (req, res) => {
    const updated = updatePromptConfig(req.body);
    res.json(updated);
  });

  app.get('/api/research/metrics', (req, res) => {
    res.json(calculateResearchMetrics());
  });

  // Vite middleware for development vs Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EIPE Assessment Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
