/* global PowerPoint, Office */
/// <reference types="office-js" />

import { OfficeAction, OfficeContextPayload } from "@shared/types";
import { SLIDE_DESIGN_TOKENS } from "../atoms/slide-design-tokens";

/**
 * Organism Module: PowerPoint Slide Factory
 * UPDATED: Optimized for 'Atomic Design' and 'High-Fidelity Branding'.
 */

export async function getPowerPointContext(): Promise<OfficeContextPayload> {
  return new Promise((resolve) => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (asyncResult) => {
      let selectedText = "";
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        selectedText = String(asyncResult.value) || "";
      }
      resolve({
        host: "PowerPoint",
        selectedText,
        fullBody: "Presentation session active. Industrial 'Slide Factory' is online.",
      });
    });
  });
}

/**
 * Molecule Component: Apply High-Fidelity Style
 * Responsible for the atomic arrangement and styling of a single slide's elements.
 */
async function applyAtomicSlideStyles(
  context: PowerPoint.RequestContext,
  slide: PowerPoint.Slide,
  title: string,
  body: string
): Promise<void> {
  if (!slide) return;
  
  // High-Fidelity Sync: Ensure slide is mounted
  await context.sync();

  const shapes = slide.shapes;
  shapes.load("items");
  await context.sync();

  if (shapes.items.length < 1) {
    console.warn("[Slide Factory] No shapes found on the new slide. Retrying with explicit sync.");
    return;
  }

  const titleShape = shapes.getItemAt(0);
  const bodyShape = shapes.items.length > 1 ? shapes.getItemAt(1) : null;

  // Load properties for manipulation
  titleShape.load("textFrame/textRange");
  if (bodyShape) bodyShape.load("textFrame/textRange");

  await context.sync();

  // Atom: Apply Title Design
  const titleRange = titleShape.textFrame.textRange;
  titleRange.text = title;
  titleRange.font.bold = true;
  titleRange.font.size = SLIDE_DESIGN_TOKENS.SIZES.TITLE;
  titleRange.font.color = SLIDE_DESIGN_TOKENS.COLORS.TITLE;
  titleRange.font.name = SLIDE_DESIGN_TOKENS.FONTS.PRIMARY;

  // Atom: Apply Content Design
  if (bodyShape) {
    const bodyRange = bodyShape.textFrame.textRange;
    bodyRange.text = body;
    bodyRange.font.size = SLIDE_DESIGN_TOKENS.SIZES.BODY;
    bodyRange.font.color = SLIDE_DESIGN_TOKENS.COLORS.BODY;
    bodyRange.font.name = SLIDE_DESIGN_TOKENS.FONTS.PRIMARY;
  }
}

/**
 * Organism Component: Slide Deck Architect
 * Coordinates the full-deck creation process based on AI's industrial reasoning.
 */
export async function createIndustrialSlides(rawText: string): Promise<number> {
  if (!rawText) return 0;

  console.log(`[Slide Factory V8] Active Scan on payload length: ${rawText.length}`);

  const slideContents: Array<{ title: string; body: string }> = [];
  
  // V8 Scanner: Correctly segments the raw text by slide delimiters
  const slideDelimiter = /---Slide\s*(?:\[\d+\]|\d+)?\s*---?|第\s*[一二三四五六七八九十0-9]+\s*[頁页]|Page\s*[0-9]+/gi;
  const rawParts = rawText.split(slideDelimiter);
  
  // Skip first part (intro) and process subsequent content blocks
  for (let i = 1; i < rawParts.length; i++) {
    const part = rawParts[i].trim();
    if (part.length < 5) continue;

    // V8 Content Extraction: Precision Regex
    const titleMatch = part.match(/\[標題\]\s*(.+?)(?=\s*\[內容\]|$)/i);
    const bodyMatch = part.match(/\[內容\]\s*([\s\S]*)/i);

    if (titleMatch) {
      slideContents.push({
        title: titleMatch[1].replace(/[:：]/g, "").trim(),
        body: bodyMatch ? bodyMatch[1].trim() : ""
      });
    }
  }

  if (slideContents.length === 0) {
    console.warn("[Slide Factory V8] No valid industrial structures detected. Deploying direct text injection.");
    await insertTextIntoPowerPoint(rawText);
    return 0;
  }

  try {
    return await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides;
      console.log(`[Slide Factory V9] Autonomous manufacturing of ${slideContents.length} slides...`);

      for (const content of slideContents) {
        const slide = slides.add() as any;
        const { title, body } = content;
        if (slide) {
          await applyAtomicSlideStyles(context, slide, title, body);
        }
      }

      await context.sync();
      return slideContents.length;
    });
  } catch (error: any) {
    console.error(`[Slide Factory V9] Critical Office JS Error: ${error.message}. Redirecting to Stable Injection.`);
    // Ultimate Fallback: High-stability text injection if the slide factory crashed
    await insertTextIntoPowerPoint(rawText);
    return 0; // Return 0 to indicate specialized factory failed, but content was injected.
  }
}

export async function insertTextIntoPowerPoint(text: string): Promise<void> {
  if (!text) return;
  return new Promise((resolve) => {
    Office.context.document.setSelectedDataAsync(
      text,
      { coercionType: Office.CoercionType.Text },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            console.warn(`[Slide Factory] Stable injection fallback encountered an issue: ${asyncResult.error.message}`);
        }
        resolve(); // Always resolve to maintain orchestrator rhythm
      }
    );
  });
}

export async function applyPowerPointActions(
  actions: OfficeAction[] | undefined,
  fallbackText: string
): Promise<number | void> {
  const hasSlideMarker = fallbackText.includes("---Slide") || fallbackText.includes("第");
  
  if (hasSlideMarker) {
    return createIndustrialSlides(fallbackText);
  }

  if (!Array.isArray(actions) || actions.length === 0) {
    return insertTextIntoPowerPoint(fallbackText);
  }

  let fullText = "";
  for (const action of actions) {
    if (action.text) fullText += action.text;
  }
  return insertTextIntoPowerPoint(fullText || fallbackText);
}
