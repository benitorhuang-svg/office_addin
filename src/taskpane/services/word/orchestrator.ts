/* global Word */
import { OfficeAction } from "../../types";
import { insertTextIntoWord } from "./streaming";
import { convertImageUrlToBase64 } from "./utils";

function applyParagraphAlignment(paragraph: Word.Paragraph, alignment: OfficeAction["alignment"]) {
  if (!alignment) return;
  const alignmentMap = {
    left: Word.Alignment.left,
    center: Word.Alignment.centered,
    right: Word.Alignment.right,
    justify: Word.Alignment.justified,
  };
  paragraph.alignment = alignmentMap[alignment];
}

async function insertPageNumber(
  action: OfficeAction,
  context: Word.RequestContext,
  firstSection: Word.Section
) {
  const position = action.pageNumberPosition || "bottom";
  const blockType =
    position === "top"
      ? "PageNumberTop"
      : position === "current"
        ? "PageNumberPage"
        : "PageNumberBottom";
  const template = context.document.attachedTemplate;
  const typeItem = template.buildingBlockTypes.getByType(
    blockType as unknown as Word.BuildingBlockType
  );
  const categories = typeItem.categories;
  categories.load("items/name");
  await context.sync();

  const firstCategory = (
    categories as unknown as { items: { buildingBlocks: Word.BuildingBlockCollection }[] }
  ).items[0];
  if (!firstCategory) throw new Error("No page number building blocks are available.");

  const buildingBlocks = firstCategory.buildingBlocks;
  buildingBlocks.load("items/name");
  await context.sync();

  const firstBlock = (
    buildingBlocks as unknown as {
      items: { insert: (range: Word.Range, replace: boolean) => void }[];
    }
  ).items[0];
  if (!firstBlock) throw new Error("Attached Word template does not expose a page number block.");

  const targetBody =
    position === "top" ? firstSection.getHeader("Primary") : firstSection.getFooter("Primary");
  firstBlock.insert(targetBody.getRange("End"), true);
}

/**
 * Universal Word Action Engine.
 * Orchestrates formatting, insertion, and complex document tasks.
 */
export async function applyOfficeActions(
  wordActions: OfficeAction[] | undefined,
  fallbackText: string
) {
  if (!Array.isArray(wordActions) || wordActions.length === 0) {
    await insertTextIntoWord(fallbackText);
    return;
  }

  const preparedActions = await Promise.all(
    wordActions.map(async (action) => {
      if (action.type === "insert_image" && !action.base64Image && action.imageUrl) {
        return { ...action, base64Image: await convertImageUrlToBase64(action.imageUrl) };
      }
      return action;
    })
  );

  await Word.run(async (context) => {
    const selection = context.document.getSelection();
    const body = context.document.body;
    const sections = context.document.sections;
    sections.load("items");
    await context.sync();
    const firstSection = sections.items[0];

    function applyFormatting(selection: Word.Range, action: OfficeAction) {
      if (typeof action.bold === "boolean") selection.font.bold = action.bold;
      if (typeof action.italic === "boolean") selection.font.italic = action.italic;
      if (typeof action.underline === "boolean")
        selection.font.underline = action.underline ? "Single" : "None";
      if (typeof action.fontSize === "number") selection.font.size = action.fontSize;
      if (typeof action.fontColor === "string") selection.font.color = action.fontColor;
      if (typeof action.highlightColor === "string")
        selection.font.highlightColor = action.highlightColor;
      if (typeof action.fontName === "string") selection.font.name = action.fontName;

      const paragraph = selection.paragraphs.getFirstOrNullObject();
      applyParagraphAlignment(paragraph as Word.Paragraph, action.alignment);
    }

    for (const action of preparedActions) {
      if (!action || !action.type) continue;
      switch (action.type) {
        case "replace":
        case "replace_selection":
        case "insert":
        case "insert_at_cursor": {
          const content = action.value || action.text;
          if (content) selection.insertText(content, Word.InsertLocation.replace);
          applyFormatting(selection, action);
          break;
        }
        case "append_to_end":
          if (action.text) {
            const p = body.insertParagraph(action.text, Word.InsertLocation.end);
            applyFormatting(p as unknown as Word.Range, action);
          }
          break;
        case "insert_heading": {
          if (!action.text) break;
          const heading = body.insertParagraph(action.text, Word.InsertLocation.end);
          if (action.level === 2)
            (heading as unknown as { styleBuiltIn: string }).styleBuiltIn = "Heading 2";
          else if (action.level === 3)
            (heading as unknown as { styleBuiltIn: string }).styleBuiltIn = "Heading 3";
          else (heading as unknown as { styleBuiltIn: string }).styleBuiltIn = "Heading 1";
          break;
        }
        case "insert_bullets":
          if (Array.isArray(action.items) && action.items.length > 0) {
            for (const item of action.items)
              body.insertParagraph(`• ${item}`, Word.InsertLocation.end);
          } else if (action.text) {
            body.insertParagraph(`• ${action.text}`, Word.InsertLocation.end);
          }
          break;
        case "insert_numbered_list":
          if (Array.isArray(action.items) && action.items.length > 0) {
            action.items.forEach((item, i) =>
              body.insertParagraph(`${i + 1}. ${item}`, Word.InsertLocation.end)
            );
          }
          break;
        case "insert_table": {
          const rows = Array.isArray(action.rows) ? action.rows : [];
          const headers = Array.isArray(action.headers) ? action.headers : [];
          const values: string[][] = [];
          if (headers.length > 0) values.push(headers);
          if (rows.length > 0) values.push(...rows);
          if (values.length === 0) break;
          const colCount = values.reduce((m, r) => Math.max(m, r.length), 0);
          const table = body.insertTable(values.length, colCount, Word.InsertLocation.end, values);
          table.styleBuiltIn = Word.BuiltInStyleName.gridTable4_Accent1;
          break;
        }
        case "insert_page_number":
          if (firstSection) await insertPageNumber(action, context, firstSection);
          break;
        case "accept_tracked_changes":
          if (
            typeof (context.document as unknown as Record<string, unknown>).acceptAllRevisions ===
            "function"
          )
            (
              context.document as unknown as { acceptAllRevisions: () => void }
            ).acceptAllRevisions();
          break;
      }
    }
    await context.sync();
  });
}
