import { ASTAnalysis, ASTStats, ComplexityClassification } from '../src/types/assessment';

/**
 * Robust Python Code AST & Complexity Analyzer
 * Analyzes Python syntax structures, cyclomatic complexity, nesting depth,
 * recursion, and produces classification (SIMPLE, MODERATE, COMPLEX).
 */
export function analyzePythonCode(pythonCode: string): ASTAnalysis {
  if (!pythonCode || !pythonCode.trim()) {
    return {
      complexityScore: 1.0,
      classification: 'SIMPLE',
      explanation: 'Empty or trivial code snippet.',
      indicators: ['No executable statements detected'],
      recommendedQuestion: 'What does this code do? Explain your answer in plain English.',
      stats: createEmptyStats(),
    };
  }

  const lines = pythonCode.split('\n');
  const stats: ASTStats = createEmptyStats();

  let currentIndent = 0;
  let maxIndent = 0;
  let currentFunction: { name: string; params: string[]; lineStart: number; indent: number; body: string[] } | null = null;
  const functionDefinitions: { name: string; params: string[]; lineStart: number; lineEnd: number; body: string[] }[] = [];
  const classDefinitions: { name: string; methods: string[]; lineStart: number; lineEnd: number }[] = [];

  let currentClass: { name: string; methods: string[]; lineStart: number; indent: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    stats.statementsCount++;

    // Calculate indentation depth (assuming 4 spaces = 1 level, or tabs)
    const leadingSpaces = rawLine.search(/\S/);
    const indentLevel = leadingSpaces > 0 ? Math.floor(leadingSpaces / 4) : 0;
    if (indentLevel > maxIndent) {
      maxIndent = indentLevel;
    }

    // Function definition
    const defMatch = trimmed.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\):/);
    if (defMatch) {
      stats.functionsCount++;
      const fnName = defMatch[1];
      const params = defMatch[2].split(',').map(p => p.trim()).filter(Boolean);

      if (currentFunction) {
        currentFunction.body.push(trimmed);
        functionDefinitions.push({
          name: currentFunction.name,
          params: currentFunction.params,
          lineStart: currentFunction.lineStart,
          lineEnd: i,
          body: currentFunction.body,
        });
      }

      currentFunction = {
        name: fnName,
        params,
        lineStart: i + 1,
        indent: indentLevel,
        body: [],
      };

      if (currentClass) {
        currentClass.methods.push(fnName);
      }
    } else if (currentFunction) {
      if (indentLevel > currentFunction.indent || trimmed === 'pass' || trimmed === 'return') {
        currentFunction.body.push(trimmed);
      } else {
        functionDefinitions.push({
          name: currentFunction.name,
          params: currentFunction.params,
          lineStart: currentFunction.lineStart,
          lineEnd: i,
          body: currentFunction.body,
        });
        currentFunction = null;
      }
    }

    // Class definition
    const classMatch = trimmed.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (classMatch) {
      stats.classesCount++;
      const className = classMatch[1];
      if (currentClass) {
        classDefinitions.push({
          name: currentClass.name,
          methods: currentClass.methods,
          lineStart: currentClass.lineStart,
          lineEnd: i,
        });
      }
      currentClass = {
        name: className,
        methods: [],
        lineStart: i + 1,
        indent: indentLevel,
      };
    }

    // Imports
    if (/^(import\s+|from\s+[a-zA-Z0-9_.]+\s+import\s+)/.test(trimmed)) {
      stats.importsCount++;
      incrementNode(stats, 'ImportStatement');
    }

    // Loops
    if (/^(for\s+|while\s+)/.test(trimmed) || /\bfor\s+.*\bin\s+/.test(trimmed)) {
      stats.loopsCount++;
      incrementNode(stats, 'LoopStatement');
    }

    // Conditionals
    if (/^(if\s+|elif\s+|else\s*:|match\s+|case\s+)/.test(trimmed) || /\bif\b.*\belse\b/.test(trimmed)) {
      stats.conditionalsCount++;
      incrementNode(stats, 'ConditionalStatement');
    }

    // Variable assignments
    const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_,\s]*)\s*(=|\+=|-=|\*=|\/=)\s*[^=]/);
    if (assignMatch && !defMatch && !classMatch) {
      stats.variablesCount++;
      incrementNode(stats, 'VariableAssignment');
    }

    // Function calls
    const callMatches = trimmed.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g);
    for (const match of callMatches) {
      const calledName = match[1];
      const keywords = ['def', 'class', 'if', 'elif', 'while', 'for', 'return', 'import', 'from', 'with', 'except'];
      if (!keywords.includes(calledName)) {
        stats.functionCallsCount++;
        incrementNode(stats, 'FunctionCall');
      }
    }
  }

  // Close trailing function/class
  if (currentFunction) {
    functionDefinitions.push({
      name: currentFunction.name,
      params: currentFunction.params,
      lineStart: currentFunction.lineStart,
      lineEnd: lines.length,
      body: currentFunction.body,
    });
  }

  if (currentClass) {
    classDefinitions.push({
      name: currentClass.name,
      methods: currentClass.methods,
      lineStart: currentClass.lineStart,
      lineEnd: lines.length,
    });
  }

  // Detect recursion
  const recursionFns: string[] = [];
  for (const fn of functionDefinitions) {
    const fnName = fn.name;
    const recursiveCallPattern = new RegExp(`\\b${fnName}\\s*\\(`, 'g');
    let recursiveCount = 0;
    for (const bodyLine of fn.body) {
      const matches = bodyLine.match(recursiveCallPattern);
      if (matches) {
        recursiveCount += matches.length;
      }
    }
    if (recursiveCount > 0) {
      recursionFns.push(fnName);
    }
  }

  stats.hasRecursion = recursionFns.length > 0;
  stats.recursionFunctions = recursionFns;
  stats.maxNestingDepth = maxIndent;
  stats.detectedFunctions = functionDefinitions.map(f => ({
    name: f.name,
    params: f.params,
    lineStart: f.lineStart,
    lineEnd: f.lineEnd,
  }));
  stats.detectedClasses = classDefinitions;

  // Calculate Cyclomatic Complexity:
  // Base M = 1 + (conditionals) + (loops) + (boolean operators `and`, `or`)
  let booleanOpsCount = 0;
  const andOrMatches = pythonCode.match(/\b(and|or)\b/g);
  if (andOrMatches) {
    booleanOpsCount = andOrMatches.length;
  }
  const cyclomatic = 1 + stats.conditionalsCount + stats.loopsCount + booleanOpsCount;
  stats.cyclomaticComplexity = cyclomatic;

  // Calculate Complexity Score (1.0 - 10.0 scale)
  // Weights:
  // - Cyclomatic: 0.35
  // - Functions: 0.15
  // - Classes: 0.15
  // - Nesting depth: 0.15
  // - Loops: 0.10
  // - Recursion: +1.5 bonus
  let rawScore = 1.0;
  rawScore += Math.min(cyclomatic * 0.45, 4.0);
  rawScore += Math.min(stats.functionsCount * 0.8, 2.0);
  rawScore += Math.min(stats.classesCount * 1.5, 2.0);
  rawScore += Math.min(stats.maxNestingDepth * 0.7, 2.0);
  rawScore += Math.min(stats.loopsCount * 0.5, 1.5);
  if (stats.hasRecursion) {
    rawScore += 1.8;
  }

  const complexityScore = Math.min(Math.max(parseFloat(rawScore.toFixed(1)), 1.0), 10.0);

  // Classification logic
  let classification: ComplexityClassification = 'SIMPLE';
  if (complexityScore >= 6.8 || stats.hasRecursion || stats.classesCount > 0 || (stats.functionsCount >= 3 && stats.maxNestingDepth >= 3)) {
    classification = 'COMPLEX';
  } else if (complexityScore >= 3.8 || stats.functionsCount >= 2 || stats.loopsCount >= 2 || stats.maxNestingDepth >= 2) {
    classification = 'MODERATE';
  } else {
    classification = 'SIMPLE';
  }

  // Question generation based on complexity
  let recommendedQuestion = 'What does this code do? Explain your answer in plain English.';
  if (classification === 'MODERATE') {
    recommendedQuestion = 'What does this code do? Explain the main steps and logic in plain English.';
  } else if (classification === 'COMPLEX') {
    recommendedQuestion = 'What does each function do? Explain the purpose and behaviour of the functions in plain English.';
  }

  // Explainable indicators
  const indicators: string[] = [];
  indicators.push(`${stats.functionsCount} function${stats.functionsCount === 1 ? '' : 's'} defined`);
  if (stats.classesCount > 0) {
    indicators.push(`${stats.classesCount} class${stats.classesCount === 1 ? '' : 'es'} present`);
  }
  indicators.push(`${stats.loopsCount} loop construct${stats.loopsCount === 1 ? '' : 's'}`);
  indicators.push(`${stats.conditionalsCount} conditional branch${stats.conditionalsCount === 1 ? '' : 'es'}`);
  indicators.push(`Maximum nesting depth: ${stats.maxNestingDepth}`);
  indicators.push(`Cyclomatic complexity: ${stats.cyclomaticComplexity}`);
  if (stats.hasRecursion) {
    indicators.push(`Recursion detected in function(s): ${stats.recursionFunctions.join(', ')}`);
  } else {
    indicators.push('No recursion detected');
  }

  const explanation = classification === 'COMPLEX'
    ? `Classified as COMPLEX (Score: ${complexityScore}/10) due to ${stats.hasRecursion ? 'recursive call patterns, ' : ''}${stats.classesCount > 0 ? 'object-oriented classes, ' : ''}high cyclomatic complexity (${stats.cyclomaticComplexity}), and nested control flow (depth ${stats.maxNestingDepth}).`
    : classification === 'MODERATE'
    ? `Classified as MODERATE (Score: ${complexityScore}/10) featuring ${stats.functionsCount} function(s) with ${stats.loopsCount} loop(s) and branching logic requiring structured multi-step comprehension.`
    : `Classified as SIMPLE (Score: ${complexityScore}/10) representing a single-routine linear or shallow-branching algorithm suitable for concise holistic summary.`;

  return {
    complexityScore,
    classification,
    explanation,
    indicators,
    recommendedQuestion,
    stats,
  };
}

function createEmptyStats(): ASTStats {
  return {
    functionsCount: 0,
    classesCount: 0,
    loopsCount: 0,
    conditionalsCount: 0,
    variablesCount: 0,
    functionCallsCount: 0,
    importsCount: 0,
    statementsCount: 0,
    maxNestingDepth: 0,
    hasRecursion: false,
    cyclomaticComplexity: 1,
    recursionFunctions: [],
    detectedFunctions: [],
    detectedClasses: [],
    syntaxNodeCounts: {},
  };
}

function incrementNode(stats: ASTStats, nodeName: string) {
  stats.syntaxNodeCounts[nodeName] = (stats.syntaxNodeCounts[nodeName] || 0) + 1;
}
