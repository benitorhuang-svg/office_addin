/**
 * Molecule: DesignReviewer (Huashu Integration — 5-Dimension Review)
 *
 * Implements the hidden Expert Panel review gate described in huashu-design-integration.md.
 * Before any PPT/Word/Excel output reaches the user, it is scored across 5 dimensions:
 *   1. Information Architecture  (25 pts)
 *   2. Visual Poetry             (20 pts)
 *   3. Emotional Resonance       (20 pts)
 *   4. Usability & Legibility    (20 pts)
 *   5. Brand Consistency         (15 pts)
 *
 * Total: 100. Pass threshold: 70 (domain-specific via SelfCorrector).
 * All 5 dimensions are fully scored for ppt, word, and excel domains.
 */
import { logger } from '@shared/logger/index.js';

const TAG = 'DesignReviewer';

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
  allIssues: string[];
  refinementHint: string;
}

// ---------------------------------------------------------------------------
// Heuristic scorers — all 5 dimensions, all 3 domains
// ---------------------------------------------------------------------------

function scoreInformationArchitecture(output: string | undefined, domain: DesignDomain, isOfficeJs: boolean): DimensionScore {
  const issues: string[] = [];
  let score = 25;
  const safeOutput = output ?? '';

  if (isOfficeJs) {
    return { name: 'Information Architecture', score: 25, maxScore: 25, issues: [] };
  }

  if (domain === 'excel') {
    if (!/header|column|table|row 1/i.test(safeOutput)) {
      issues.push('No clear header row definition detected — spreadsheets need a labelled header row.');
      score -= 10;
    }
    if (!/cell|range|Sheet/i.test(safeOutput)) {
      issues.push('Ambiguous target location. Explicit cell ranges or sheet names are required.');
      score -= 8;
    }
    if (!/named.?range|data.?validation|structured.?table/i.test(safeOutput)) {
      issues.push('Consider using named ranges or structured Tables (Ctrl+T) for maintainability.');
      score -= 7;
    }
  } else if (domain === 'ppt') {
    if (!/title|heading|h[1-3]/i.test(safeOutput)) {
      issues.push('No clear heading or title hierarchy detected — slides need a visual anchor.');
      score -= 10;
    }
    if ((safeOutput.match(/slide/gi) ?? []).length < 2) {
      issues.push('Response should reference multiple slides to establish narrative flow.');
      score -= 5;
    }
    if (/lorem ipsum/i.test(safeOutput)) {
      issues.push('Placeholder text detected — replace with audience-relevant content.');
      score -= 10;
    }
  } else if (domain === 'word') {
    if (!/section|chapter|heading|## /i.test(safeOutput)) {
      issues.push('Document lacks visible structural sections. Add headings to guide the reader.');
      score -= 10;
    }
    if (safeOutput.split('\n').filter(l => l.trim()).length < 5) {
      issues.push('Document is too brief — a structured document should have at least 5 non-empty paragraphs.');
      score -= 8;
    }
  }

  return { name: 'Information Architecture', score: Math.max(0, score), maxScore: 25, issues };
}

function scoreVisualPoetry(output: string, domain: DesignDomain, isOfficeJs: boolean): DimensionScore {
  const issues: string[] = [];
  let score = 20;

  if (isOfficeJs) {
    return { name: 'Visual Poetry', score: 20, maxScore: 20, issues: [] };
  }

  if (domain === 'excel') {
    // For Excel, "visual poetry" = clear formatting and conditional formatting usage
    if (!/bold|italic|fill|background|highlight|conditional.?format/i.test(output)) {
      issues.push('No cell formatting specified — use header bold/fill and conditional formatting for visual clarity.');
      score -= 8;
    }
    if (!/align|center|left|right/i.test(output)) {
      issues.push('Column alignment not addressed — numbers should be right-aligned, text left-aligned.');
      score -= 6;
    }
  } else if (domain === 'ppt') {
    if (!/whitespace|margin|padding|negative.?space|blank/i.test(output)) {
      issues.push('No mention of whitespace — slides feel crowded without breathing room.');
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
  } else if (domain === 'word') {
    if (!/bold|italic|emphasis|highlight/i.test(output)) {
      issues.push('No typographic emphasis — use bold/italic to create visual rhythm in body text.');
      score -= 6;
    }
  }

  return { name: 'Visual Poetry', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreEmotionalResonance(output: string | undefined, domain: DesignDomain, isOfficeJs: boolean): DimensionScore {
  const issues: string[] = [];
  let score = 20;
  const safeOutput = output ?? '';

  // Universal red flags
  if (/I cannot|I don't know|I'm unable|I'm not able/i.test(safeOutput)) {
    if (!/because it is locked|due to protection|read-only|protected/i.test(safeOutput)) {
      issues.push('Refusal language detected — rewrite with a concrete, actionable response.');
      score -= 15;
    }
  }

  if (isOfficeJs) {
    return { name: 'Emotional Resonance', score: Math.max(0, score), maxScore: 20, issues };
  }

  const wordCount = safeOutput.trim().split(/\s+/).length;

  if (domain === 'excel') {
    // For Excel, resonance = does the output explain *why*, not just *what*
    if (!/because|so that|which allows|this helps|result/i.test(safeOutput)) {
      issues.push('Output lacks rationale — explain why each formula or operation is used, not just the syntax.');
      score -= 8;
    }
    if (wordCount < 40) {
      issues.push('Excel response is too terse — include brief context for each change applied.');
      score -= 5;
    }
  } else if (domain === 'ppt') {
    if (wordCount < 80) {
      issues.push('Slide content is too sparse — include supporting context that builds the audience\'s journey.');
      score -= 8;
    }
    // P3: Narrative Flow ARC
    if (!/problem|solution|opportunity|challenge|result|outcome/i.test(safeOutput)) {
      issues.push('No narrative tension detected — use a Problem → Action → Outcome arc.');
      score -= 7;
    }
    if (!/next steps|conclusion|summary|call to action|cta/i.test(safeOutput)) {
      issues.push('Missing "Call to Action" or "Next Steps" — slides should drive a clear objective.');
      score -= 5;
    }
  } else if (domain === 'word') {
    if (wordCount < 100) {
      issues.push('Document text is extremely short — Word documents should provide comprehensive coverage.');
      score -= 5;
    }
  }

  return { name: 'Emotional Resonance', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreUsabilityLegibility(output: string | undefined, domain: DesignDomain, isCodeOutput: boolean): DimensionScore {
  const issues: string[] = [];
  let score = 20;
  const safeOutput = output ?? '';

  if (isCodeOutput) {
    if (safeOutput.split('\n').some(line => line.length > 150)) {
      issues.push('Code contains very long lines (>150 chars) — format for readability.');
      score -= 5;
    }
    return { name: 'Usability & Legibility', score: Math.max(0, score), maxScore: 20, issues };
  }

  if (domain === 'excel') {
    // Relative vs absolute reference correctness
    if (/=\w+\(/.test(safeOutput) && !/\$[A-Z]\$\d|\$[A-Z]\d|[A-Z]\$\d/g.test(safeOutput)) {
      issues.push('Formulas present but no absolute references ($) detected — verify anchoring is intentional.');
      score -= 5;
    }
    if (!/explain|note|comment|\/\//i.test(safeOutput)) {
      issues.push('Missing explanatory notes for complex operations — add comments for maintainability.');
      score -= 7;
    }
    // Check for data validation mention on input cells
    if (/input|entry|user.?fill/i.test(safeOutput) && !/validation|restrict|dropdown/i.test(safeOutput)) {
      issues.push('Input cells detected without data validation — add dropdowns or restrictions to prevent errors.');
      score -= 8;
    }
  } else if (domain === 'ppt') {
    // Improved font size regex to match '18pt', '18 pt', '18-point'
    const fontMatches = safeOutput.match(/\d+\s*(?:pt|-point)/gi) ?? [];
    for (const m of fontMatches) {
      const size = parseInt(m.match(/\d+/)?.[0] || '0', 10);
      if (size > 0 && size < 18) {
        issues.push(`Font size ${m} is below 18pt — violates WCAG readability for projected slides.`);
        score -= 8;
        break;
      }
    }
    
    // Bullet points threshold - only apply if not an Agenda/Table of Contents slide
    const isAgenda = /agenda|contents|table of contents|outline/i.test(safeOutput);
    const bulletLines = (safeOutput.match(/[-*•]\s/g) ?? []).length;
    if (!isAgenda && bulletLines > 6) {
      issues.push(`${bulletLines} bullet points detected — reduce to ≤6 lines per slide for cognitive clarity.`);
      score -= 6;
    }
  } else if (domain === 'word') {
    const isChinese = /[\u4e00-\u9fa5]/.test(safeOutput);
    const sentenceCount = (safeOutput.match(/[.!?。！？]/g) ?? []).length;
    
    if (sentenceCount > 0) {
      const avgLen = safeOutput.length / sentenceCount;
      const threshold = isChinese ? 80 : 220;
      if (avgLen > threshold) {
        issues.push(`Average sentence is too long (${Math.round(avgLen)} chars) — aim for shorter sentences for readability.`);
        score -= 5;
      }
    }
  }

  return { name: 'Usability & Legibility', score: Math.max(0, score), maxScore: 20, issues };
}

function scoreBrandConsistency(output: string | undefined, domain: DesignDomain, isOfficeJs: boolean): DimensionScore {
  const issues: string[] = [];
  let score = 15;
  const safeOutput = output ?? '';

  if (isOfficeJs) {
    return { name: 'Brand Consistency', score: 15, maxScore: 15, issues: [] };
  }

  if (domain === 'excel') {
    // For Excel, brand = consistent number formats and colour usage
    const colorCount = new Set(
      (safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)/g) ?? [])
    ).size;
    if (colorCount > 4) {
      issues.push(`${colorCount} distinct colors found — constrain to a 3-color scheme (header, data, highlight) for brand consistency.`);
      score -= 8;
    }
    if (!/number.?format|currency|percentage|decimal/i.test(safeOutput)) {
      issues.push('No number format specified — define consistent formats (currency, percentage, etc.) for all numeric columns.');
      score -= 7;
    }
  } else if (domain === 'word') {
    // P3: Terminology consistency check (Placeholder check for glossary adherence language)
    if (!/preferred term|glossary|terminology|consistently/i.test(safeOutput) && safeOutput.length > 500) {
      issues.push('No mention of terminology consistency — verify output aligns with provided Glossary.');
      score -= 5;
    }
    const colorCount = new Set(
      (safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? [])
    ).size;
    if (colorCount > 6) {
      issues.push(`${colorCount} distinct color values — constrain to a 3-color palette for brand consistency.`);
      score -= 8;
    }
  } else {
    const colorCount = new Set(
      (safeOutput.match(/#[0-9a-fA-F]{3,6}|hsl\([^)]+\)|rgb\([^)]+\)|--color-[a-z-]+/g) ?? [])
    ).size;
    if (colorCount > 6) {
      issues.push(`${colorCount} distinct color values — constrain to a 3-color palette for brand consistency.`);
      score -= 8;
    }
    const fontFamilyMatches = new Set(
      (safeOutput.match(/font-family:\s*[^;,\n]+/gi) ?? []).map(f => f.toLowerCase())
    ).size;
    if (fontFamilyMatches > 2) {
      issues.push(`${fontFamilyMatches} typefaces found — limit to 2 (one sans-serif headline, one body).`);
      score -= 7;
    }
  }

  return { name: 'Brand Consistency', score: Math.max(0, score), maxScore: 15, issues };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function reviewDesign(output: string, domain: DesignDomain): DesignReviewResult {
  const safeOutput = output ?? '';
  const isOfficeJs = /function|Excel\.run|Word\.run|PowerPoint\.run|context\.sync\(\)/i.test(safeOutput);

  const ia  = scoreInformationArchitecture(safeOutput, domain, isOfficeJs);
  const vp  = scoreVisualPoetry(safeOutput, domain, isOfficeJs);
  const er  = scoreEmotionalResonance(safeOutput, domain, isOfficeJs);
  const ul  = scoreUsabilityLegibility(safeOutput, domain, isOfficeJs);
  const bc  = scoreBrandConsistency(safeOutput, domain, isOfficeJs);

  const dimensions = [ia, vp, er, ul, bc];
  const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
  const passed = totalScore >= 70;

  const allIssues = dimensions.flatMap(d => d.issues);
  const worstDimension = [...dimensions].sort((a, b) => (a.score/a.maxScore) - (b.score/b.maxScore))[0];
  const refinementHint = allIssues.length > 0
    ? `Review failed (${totalScore}/100). Weakest: "${worstDimension.name}". Issues: ${allIssues.slice(0, 2).join(' | ')}`
    : `Review passed (${totalScore}/100).`;

  logger.info(TAG, `Review complete`, { domain, totalScore, passed });

  return { totalScore, passed, dimensions, allIssues, refinementHint };
}