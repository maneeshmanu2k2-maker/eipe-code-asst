import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SandboxExecutionResult, SingleTestExecution, UnitTest } from '../src/types/assessment';

const TIMEOUT_MS = 4000;

/**
 * Validates code for prohibited dangerous patterns before execution
 */
function sanitizePythonCode(code: string): { safe: boolean; reason?: string } {
  const forbiddenPatterns = [
    /import\s+(os|subprocess|sys|shutil|pty|socket|http|requests|urllib|builtins|pathlib)/i,
    /from\s+(os|subprocess|sys|shutil|pty|socket|http|requests|urllib|builtins|pathlib)\s+import/i,
    /__import__\s*\(/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /open\s*\(/i,
    /globals\s*\(\s*\)/i,
    /locals\s*\(\s*\)/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason: `Security violation: Code contains restricted operation matching pattern ${pattern.toString()}`,
      };
    }
  }

  return { safe: true };
}

/**
 * Runs Python code against unit tests inside a sandboxed wrapper script
 */
export async function executeInSandbox(
  pythonCode: string,
  unitTests: UnitTest[]
): Promise<SandboxExecutionResult> {
  const startTime = Date.now();

  // Basic sanity check
  if (!pythonCode || !pythonCode.trim()) {
    return {
      status: 'FAILED',
      testsTotal: unitTests.length,
      testsPassed: 0,
      testsFailed: unitTests.length,
      executionTime: 0,
      rawStdout: '',
      rawStderr: 'No code provided for execution.',
      errorMessage: 'Empty code submitted.',
      tests: unitTests.map(t => ({
        testId: t.id,
        name: t.name,
        assertionCode: t.assertionCode,
        passed: false,
        errorMessage: 'Empty code submission',
        executionTimeMs: 0,
      })),
    };
  }

  const securityCheck = sanitizePythonCode(pythonCode);
  if (!securityCheck.safe) {
    return {
      status: 'ERROR',
      testsTotal: unitTests.length,
      testsPassed: 0,
      testsFailed: unitTests.length,
      executionTime: 0.01,
      rawStdout: '',
      rawStderr: securityCheck.reason || 'Security check failed',
      errorMessage: securityCheck.reason,
      tests: unitTests.map(t => ({
        testId: t.id,
        name: t.name,
        assertionCode: t.assertionCode,
        passed: false,
        errorMessage: securityCheck.reason,
        executionTimeMs: 0,
      })),
    };
  }

  // Create temporary sandbox runner script
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eipe-sandbox-'));
  const testScriptPath = path.join(tempDir, 'sandbox_runner.py');

  // Build python harness
  const runnerScript = generateHarnessScript(pythonCode, unitTests);

  try {
    fs.writeFileSync(testScriptPath, runnerScript, { encoding: 'utf-8' });

    const runResult = await runPythonProcess(testScriptPath, tempDir);
    const durationSec = (Date.now() - startTime) / 1000;

    if (runResult.timedOut) {
      return {
        status: 'TIMEOUT',
        testsTotal: unitTests.length,
        testsPassed: 0,
        testsFailed: unitTests.length,
        executionTime: durationSec,
        rawStdout: runResult.stdout,
        rawStderr: 'Execution timed out (exceeded limit of 4 seconds). Possible infinite loop.',
        errorMessage: 'Execution timed out. Likely infinite loop or excessive computation.',
        tests: unitTests.map(t => ({
          testId: t.id,
          name: t.name,
          assertionCode: t.assertionCode,
          passed: false,
          errorMessage: 'Timeout exceeded',
          executionTimeMs: 4000,
        })),
      };
    }

    // Parse structured test output
    const parsed = parseTestOutput(runResult.stdout, unitTests);
    const testsPassed = parsed.filter(t => t.passed).length;
    const testsFailed = parsed.length - testsPassed;
    const allRequiredPassed = unitTests.every(ut => {
      if (!ut.isRequired) return true;
      const res = parsed.find(p => p.testId === ut.id);
      return res?.passed === true;
    });

    return {
      status: testsFailed === 0 && allRequiredPassed ? 'PASSED' : 'FAILED',
      testsTotal: unitTests.length,
      testsPassed,
      testsFailed,
      executionTime: parseFloat(durationSec.toFixed(3)),
      rawStdout: runResult.stdout,
      rawStderr: runResult.stderr,
      errorMessage: runResult.exitCode !== 0 && testsPassed === 0 ? runResult.stderr || 'Syntax or Runtime Error' : undefined,
      tests: parsed,
    };
  } catch (err: any) {
    const durationSec = (Date.now() - startTime) / 1000;
    return {
      status: 'ERROR',
      testsTotal: unitTests.length,
      testsPassed: 0,
      testsFailed: unitTests.length,
      executionTime: parseFloat(durationSec.toFixed(3)),
      rawStdout: '',
      rawStderr: err?.message || String(err),
      errorMessage: err?.message || 'Failed to execute test runner.',
      tests: unitTests.map(t => ({
        testId: t.id,
        name: t.name,
        assertionCode: t.assertionCode,
        passed: false,
        errorMessage: err?.message || 'Execution failed',
        executionTimeMs: 0,
      })),
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

function generateHarnessScript(pythonCode: string, unitTests: UnitTest[]): string {
  const testsJson = JSON.stringify(
    unitTests.map(t => ({
      id: t.id,
      name: t.name,
      assertion: t.assertionCode,
      required: t.isRequired,
    }))
  );

  return `
import json
import sys
import time
import traceback

# Sandboxed execution harness
TEST_DEFINITIONS = json.loads('''${testsJson.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}''')

results = []

# Section 1: Define Student Generated Code in isolated namespace
code_namespace = {
    '__name__': '__sandbox__',
    '__doc__': None,
    '__package__': None,
}

load_error = None
try:
    student_code = """${pythonCode.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}"""
    compiled = compile(student_code, '<student_code>', 'exec')
    exec(compiled, code_namespace)
except Exception as e:
    load_error = traceback.format_exc()

if load_error:
    for t in TEST_DEFINITIONS:
        results.append({
            'testId': t['id'],
            'name': t['name'],
            'assertionCode': t['assertion'],
            'passed': False,
            'errorMessage': f"Compilation/Import Error: {load_error}",
            'executionTimeMs': 0
        })
else:
    for t in TEST_DEFINITIONS:
        t_start = time.time()
        assertion_code = t['assertion'].strip()
        passed = False
        error_msg = None
        
        try:
            # If the assertion is of form 'assert ...', execute it
            # Otherwise evaluate expression
            if assertion_code.startswith('assert '):
                exec(assertion_code, code_namespace)
                passed = True
            elif '==' in assertion_code:
                # Format: expr == expected
                val = eval(assertion_code, code_namespace)
                passed = bool(val)
                if not passed:
                    error_msg = f"Assertion failed: {assertion_code} evaluated to False"
            else:
                val = eval(assertion_code, code_namespace)
                passed = bool(val)
        except AssertionError as ae:
            passed = False
            error_msg = f"Assertion Error on: {assertion_code}"
        except Exception as ex:
            passed = False
            error_msg = f"{type(ex).__name__}: {str(ex)}"
            
        t_duration = round((time.time() - t_start) * 1000, 2)
        results.append({
            'testId': t['id'],
            'name': t['name'],
            'assertionCode': t['assertion'],
            'passed': passed,
            'errorMessage': error_msg,
            'executionTimeMs': t_duration
        })

print("__SANDBOX_RESULTS_JSON_START__")
print(json.dumps(results))
print("__SANDBOX_RESULTS_JSON_END__")
`;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

function runPythonProcess(scriptPath: string, cwd: string): Promise<ProcessOutput> {
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn('python3', ['-u', scriptPath], {
      cwd,
      env: {
        PYTHONPATH: '',
        PYTHONUNBUFFERED: '1',
        PATH: process.env.PATH || '',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }, TIMEOUT_MS);

    child.stdout.on('data', data => {
      stdout += data.toString();
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', code => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code ?? (timedOut ? 124 : 1),
        timedOut,
      });
    });

    child.on('error', err => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
      });
    });
  });
}

function parseTestOutput(rawStdout: string, unitTests: UnitTest[]): SingleTestExecution[] {
  const startMarker = '__SANDBOX_RESULTS_JSON_START__';
  const endMarker = '__SANDBOX_RESULTS_JSON_END__';

  const startIndex = rawStdout.indexOf(startMarker);
  const endIndex = rawStdout.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const jsonStr = rawStdout.substring(startIndex + startMarker.length, endIndex).trim();
    try {
      const parsed: SingleTestExecution[] = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // Fallback
    }
  }

  // Fallback if structured json could not be extracted
  return unitTests.map(t => ({
    testId: t.id,
    name: t.name,
    assertionCode: t.assertionCode,
    passed: false,
    errorMessage: rawStdout.includes('Error') ? rawStdout.substring(0, 300) : 'Test output parsing failed',
    executionTimeMs: 0,
  }));
}
