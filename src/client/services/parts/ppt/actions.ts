/* global PowerPoint, Office */
/// <reference types="office-js" />

import { OfficeAction, OfficeContextPayload } from "@shared/types";
import { SLIDE_DESIGN_TOKENS } from "../../atoms/slide-design-tokens";

// ---- Internal helpers ----

function getPowerPointErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ---- Context ----

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

// ---- Atom: Slide Styles ----

async function applyAtomicSlideStyles(
  context: PowerPoint.RequestContext,
  slide: PowerPoint.Slide,
  title: string,
  body: string
): Promise<void> {
  if (!slide) return;

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

  titleShape.load("textFrame/textRange");
  if (bodyShape) bodyShape.load("textFrame/textRange");

  await context.sync();

  const titleRange = titleShape.textFrame.textRange;
  titleRange.text = title;
  titleRange.font.bold = true;
  titleRange.font.size = SLIDE_DESIGN_TOKENS.SIZES.TITLE;
  titleRange.font.color = SLIDE_DESIGN_TOKENS.COLORS.TITLE;
  titleRange.font.name = SLIDE_DESIGN_TOKENS.FONTS.PRIMARY;

  if (bodyShape) {
    const bodyRange = bodyShape.textFrame.textRange;
    bodyRange.text = body;
    bodyRange.font.size = SLIDE_DESIGN_TOKENS.SIZES.BODY;
    bodyRange.font.color = SLIDE_DESIGN_TOKENS.COLORS.BODY;
    bodyRange.font.name = SLIDE_DESIGN_TOKENS.FONTS.PRIMARY;
  }
}

// ---- Organism: Slide Deck Architect ----

export async function createIndustrialSlides(rawText: string): Promise<number> {
  if (!rawText) return 0;

  console.log(`[Slide Factory V8] Active Scan on payload length: ${rawText.length}`);

  const slideContents: Array<{ title: string; body: string }> = [];

  const slideDelimiter =
    /---Slide\\s*(?:\\[\\d+\\]|\\d+)?\\s*---?|第\\s*[一二三四五六七八九十0-9]+\\s*[頁页]|Page\\s*[0-9]+/gi;
  const rawParts = rawText.split(slideDelimiter);

  for (let i = 1; i < rawParts.length; i++) {
    const rawPart = rawParts[i];
    if (!rawPart) continue;

    const part = rawPart.trim();
    if (part.length < 5) continue;

    const titleMatch = part.match(/\[標?\]\s*(.+?)(?=\s*\[?容\]|$)/i);
    const bodyMatch = part.match(/\[?容\]\s*([\s\S]*)/i);

    if (titleMatch && titleMatch[1]) {
      slideContents.push({
        title: titleMatch[1].replace(/[:：]/g, "").trim(),
        body: bodyMatch && bodyMatch[1] ? bodyMatch[1].trim() : "",
      });
    }
  }

  if (slideContents.length === 0) {
    console.warn(
      "[Slide Factory V8] No valid industrial structures detected. Deploying direct text injection."
    );
    await insertTextIntoPowerPoint(rawText);
    return 0;
  }

  try {
    return await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides;
      console.log(
        `[Slide Factory V9] Autonomous manufacturing of ${slideContents.length} slides...`
      );

      for (const content of slideContents) {
        slides.add();
        slides.load("items");
        await context.sync();

        const slide = slides.items[slides.items.length - 1];
        const { title, body } = content;
        if (slide) {
          await applyAtomicSlideStyles(context, slide, title, body);
        }
      }

      await context.sync();
      return slideContents.length;
    });
  } catch (error: unknown) {
    console.error(
      `[Slide Factory V9] Critical Office JS Error: ${getPowerPointErrorMessage(error)}. Redirecting to Stable Injection.`
    );
    await insertTextIntoPowerPoint(rawText);
    return 0;
  }
}

// ---- Insert ----

export async function insertTextIntoPowerPoint(text: string): Promise<void> {
  if (!text) return;
  return new Promise((resolve) => {
    Office.context.document.setSelectedDataAsync(
      text,
      { coercionType: Office.CoercionType.Text },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.warn(
            `[Slide Factory] Stable injection fallback encountered an issue: ${asyncResult.error.message}`
          );
        }
        resolve();
      }
    );
  });
}

// ---- Actions ----

export async function applyPowerPointActions(
  actions: OfficeAction[] | undefined,
  fallbackText: string
): Promise<number | void> {
  const hasSlideMarker = fallbackText.includes("---Slide") || fallbackText.includes("Slide");

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
