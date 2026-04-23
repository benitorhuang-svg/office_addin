/**
 * Molecule: DesignReviewer (Huashu Integration — 5-Dimension Review)
 *
 * Implements the hidden Expert Panel review gate described in huashu-design-integration.md.
 * Before any PPT/Word output reaches the user, it is scored across 5 dimensions:
 *   1. Information Architecture  (25 pts)
 *   2. Visual Poetry             (20 pts)
 *   3. Emotional Resonance       (20 pts)
 *   4. Usability & Legibility    (20 pts)
 *   5. Brand Consistency         (15 pts)
 *
 * Total: 100. Pass threshold: 70.
 * On fail, a structured `issues` list is returned so the caller can trigger refinement.
 */

import { logger } from '../../core/atoms/logger.js';

const TAG = 'DesignReviewer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DesignDomain = 'ppt' | 'word' | 'excel' | 'general';

export interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
}

export interface DesignReviewResult {
  totalScore: number;
  passed: boolean;
  dimensions: DimensionScore[];
  /** Flat list of all issues across dimensions, ordered by severity (worst dimension first). */
  allIssues: string[];
  /** Short summary suitable for injecting into a refinement prompt. */
  refinementHint: string;
}

// ---------------------------------------------------------------------------
// Heuristic scorers — one per dimension
// ---------------------------------------------------------------------------

function scoreInformationArchitecture(output: string, domain: DesignDomain): DimensionScore {
  const issues: string[] = [];
  let score = 25;

  if (domain === 'ppt') {
    if (!/title|heading|h[1-3]/i.test(output)) {
      issues.push('No clear heading or title hierarchy detected — slides need a visual anchor.');
      score -= 10;
    }
    if ((output.match(/slide/gi) ?? []).length < 2) {
      issues.push('Response should reference multiple slides to establish narrative flow.');
      score -= 5;
    }
    if (/lorem ipsum/i.test(output)) {
      issues.push('Placeholder text detected — replace with audience-relevant content.');
      score -= 10;
    }
  }

  if (domain === 'word') {
    if (!/section|chapter|heading|## /i.test(output)) {
      issues.push('Document lacks visible structural sections. Add headings to guide the reader.');
      score -= 10;
    }
    if (output.split('\n').filter(l => l.trim()).length < 5) {
      issues.push('Document is too brief — a structured document should have at least 5 non-empty paragraphs.');
      score -= 8;
    }
  }

  return { name: 'Information Architecture', score: Math.max(0, score), maxScore: 25, issues };
}

function scoreVisualPoetry(output: string, domain: DesignDomain): DimensionScore {
  const issues: string[] = [];
  let score = 20;

  if (domain === 'ppt') {
    if (!/whitespace|margin|padding|negative.?space|blank/i.test(output)) {
      issues.push('No mention of whitespace or breathing room — slides feel crowded without it.');
      score -= 8;
    }
    if (!/color|palette|hsl\(|rgb\(|#[0-9a-f]{3,6}/i.test(output)) {
      issues.push('No color specification found — define a purposeful 2–3 color palette.');
      score -= 6;
    }
    if (!/font|typeface|sans.?serif|serif/i.test(output)) {
      issues.push('Typography not addressed — specify font family and size hierarchy.');
      score -= 6;
    }
  }

  if (domain === 'word') {
    if (!/bold|italic|emphasis|highlight/i.test(output)) {
      issues.push('No typographic emphasis used — use bold/italic to create visual rhythm in body text.');
      score -= 6;
    }
  }

  return { name: 'Visual Poetry', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreEmotionalResonance(output: string, domain: DesignDomain): DimensionScore {
  const issues: string[] = [];
  let score = 20;

  // Generic red flags
  if (/I cannot|I don't know|I'm unable|I'm not able/i.test(output)) {
    issues.push('Refusal language detected — rewrite with a concrete, actionable response.');
    score -= 15;
  }

  if (domain === 'ppt') {
    if (output.toLowerCase().split(' ').length < 80) {
      issues.push('Slide content is too sparse — include supporting context that builds the audience\'s emotional journey.');
      score -= 8;
    }
    // Check for story arc signals
    if (!/problem|solution|opportunity|challenge|result|outcome/i.test(output)) {
      issues.push('No narrative tension detected — include Problem/Opportunity → Action → Outcome arc.');
      score -= 7;
    }
  }

  return { name: 'Emotional Resonance', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreUsabilityLegibility(output: string, domain: DesignDomain): DimensionScore {
  const issues: string[] = [];
  let score = 20;

  if (domain === 'ppt') {
    // Check for dangerously small font sizes
    const fontMatches = output.match(/\d+\s*pt/gi) ?? [];
    for (const m of fontMatches) {
      const pt = parseInt(m, 10);
      if (pt < 18) {
        issues.push(`Font size ${m} is below 18pt — violates WCAG readability for projected slides.`);
        score -= 8;
        break;
      }
    }
    // Check for excessive lines per slide
    const bulletLines = (output.match(/[-*•]\s/g) ?? []).length;
    if (bulletLines > 6) {
      issues.push(`${bulletLines} bullet points detected — reduce to ≤6 lines per slide for cognitive clarity.`);
      score -= 6;
    }
  }

  if (domain === 'word') {
    if (/line.?height|leading/i.test(output) === false) {
      // Soft warning only
    }
    const sentenceCount = (output.match(/[.!?]/g) ?? []).length;
    if (sentenceCount > 0 && output.length / sentenceCount > 220) {
      issues.push('Average sentence is very long — aim for ≤25 words per sentence for readability.');
      score -= 5;
    }
  }

  return { name: 'Usability & Legibility', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreBrandConsistency(output: string, _domain: DesignDomain): DimensionScore {
  const issues: string[] = [];
  let score = 15;

  // Check for brand token usage (CSS vars or named palette)
  const colorCount = new Set(
    (output.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? [])
  ).size;

  if (colorCount > 6) {
    issues.push(`${colorCount} distinct color values found — constrain to a 3-color palette for brand consistency.`);
    score -= 8;
  }

  const fontFamilyMatches = new Set(
    (output.match(/font-family:\s*[^;,\n]+/gi) ?? []).map(f => f.toLowerCase())
  ).size;
  if (fontFamilyMatches > 2) {
    issues.push(`${fontFamilyMatches} typefaces found — limit to 2 (one sans-serif headline, one body).`);
    score -= 7;
  }

  return { name: 'Brand Consistency', score: Math.max(0, score), maxScore: 15, issues };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the 5-Dimension Expert Panel review on an AI-generated output.
 * Returns a structured result that the orchestrator uses to decide whether to
 * pass the output through or request a targeted refinement.
 */
export function reviewDesign(output: string, domain: DesignDomain): DesignReviewResult {
  const ia    = scoreInformationArchitecture(output, domain);
  const vp    = scoreVisualPoetry(output, domain);
  const er    = scoreEmotionalResonance(output, domain);
  const ul    = scoreUsabilityLegibility(output, domain);
  const bc    = scoreBrandConsistency(output, domain);

  const dimensions = [ia, vp, er, ul, bc];
  const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
  const passed = totalScore >= 70;

  // Sort dimensions worst-first for the refinement hint
  const sorted = [...dimensions].sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore));
  const allIssues = sorted.flatMap(d => d.issues);

  const worstDimension = sorted[0];
  const refinementHint = allIssues.length > 0
    ? `Design review failed (${totalScore}/100). Weakest dimension: "${worstDimension.name}" (${worstDimension.score}/${worstDimension.maxScore}). Top issues: ${allIssues.slice(0, 3).join(' | ')}`
    : `Design review passed (${totalScore}/100). No major issues.`;

  logger.info(TAG, `Review complete`, { domain, totalScore, passed, dimensionScores: dimensions.map(d => `${d.name}:${d.score}/${d.maxScore}`) });

  return { totalScore, passed, dimensions, allIssues, refinementHint };
}
