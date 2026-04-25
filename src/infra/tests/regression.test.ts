/**
 * Regression Test: Design Quality Stability
 * Ensures that changes to prompts/agents do not degrade design quality scores.
 */
import { reviewDesign, type DesignDomain } from "../../agents/skills/molecules/design-reviewer.js";

const EXCEL_GOLD_CASE = `
# Quarterly Revenue Analysis Report
This spreadsheet establishes a structured table for tracking sales across regions.

## Data Structure
- Column 1: Region Name (Text, Left Aligned)
- Column 2: Q1 Revenue (Currency, Right Aligned)
- Column 3: Q2 Revenue (Currency, Right Aligned)
- Column 4: Growth % (Percentage, Right Aligned)

We use a [named range] "RevenueData" and a [structured table] "SalesTable" because this helps track growth so that we can adjust targets which allows better planning for the next fiscal year.

## Formulas and Formatting
- Cell G5: \`=SUM($B$2:$B$10)\` - Note: We use absolute references for anchoring the total range.
- Conditional formatting is applied to the Growth column: Fill background with light green if > 10%.
- Data validation is set on the Region column using a dropdown list to prevent data entry errors.
- Comments // Total calculation includes all subsidiaries.

## Brand Guidelines
- Palette: #FFFFFF (Background), #333333 (Text), #0056b3 (Header Fill).
- Number format: Use "USD 0,000" for all revenue cells.
- Typography: Arial for headers, Calibri for body.
`;

const PPT_GOLD_CASE = `
# Strategic Growth Plan 2024
Slide 1: Executive Summary - Title Anchor
Slide 2: Market Opportunity - Problem / Action / Outcome
Slide 3: Roadmap - Next Steps and CTA

## Visual Design
- Margin: 40px all around to ensure whitespace and breathing room.
- Padding: 20px within text blocks for legibility.
- Palette: Primary #002D62, Accent #FFD700.
- Typography: Headline font-family: 'Segoe UI', 32pt. Body font-family: 'Open Sans', 20pt.

## Content Journey
Problem: Market saturation in Tier 1 cities is limiting organic growth.
Action: Pivot to digital-first expansion in emerging Tier 2 markets with localized campaigns.
Outcome: Projected 25% increase in active user base by Q4 2024.

Next Steps:
- Finalize vendor contracts by end of month.
- Launch pilot program in July.
- Schedule review meeting for August.
- Call to Action: Visit nexus-center.internal/roadmap to approve the budget.

Cognitive Clarity: We maintain a maximum of 4 bullet points per slide for optimal audience retention.
`;

const WORD_GOLD_CASE = `
# Project Memorandum: Nexus Core Implementation
Section 1: Executive Summary
Chapter 2: Technical Architecture
Heading: Security Protocols

## Overview
This document outlines the deployment strategy for the Nexus Core system. We emphasize bold typography for key terms and italic emphasis for critical warnings.

The implementation follows our internal Glossary for preferred term usage. We ensure terminology is used consistently throughout the document to avoid ambiguity.

The architecture is robust. It scales well. Security is baked in. We use short sentences to improve readability. 

## Technical Details
This structured document provides comprehensive coverage of the API surfaces. We have optimized the latency. The system is ready.

The palette is constrained to #000000, #FFFFFF, and #004488 for brand consistency.
`;

const TEST_CASES = [
  { domain: "excel", content: EXCEL_GOLD_CASE },
  { domain: "ppt", content: PPT_GOLD_CASE },
  { domain: "word", content: WORD_GOLD_CASE },
];

describe("DesignReviewer Quality Regression (Expert Gold Cases)", () => {
  for (const tc of TEST_CASES) {
    it(`should achieve expert-level score (>= 80) for ${tc.domain}`, async () => {
      const result = reviewDesign(tc.content, tc.domain as DesignDomain);

      console.log(`[${tc.domain.toUpperCase()}] Score: ${result.totalScore}/100`);
      if (result.allIssues.length > 0) {
        console.log(`Issues: `, result.allIssues);
      }

      expect(result.totalScore).toBeGreaterThanOrEqual(80);
    });
  }
});
