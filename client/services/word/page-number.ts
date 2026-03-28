/* global Word */
import { OfficeAction } from "../atoms/types";

/**
 * Atomic function to insert page numbers into headers/footers.
 * Handles building nexus-block extraction and section alignment.
 */
export async function insertPageNumber(
  action: OfficeAction,
  context: Word.RequestContext,
  firstSection: Word.Section
) {
  const position = action.pageNumberPosition || "bottom";
  const blockType = position === "top" ? "PageNumberTop" : position === "current" ? "PageNumberPage" : "PageNumberBottom";
  
  const template = context.document.attachedTemplate;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeItem = template.buildingBlockTypes.getByType(blockType as any);
  const categories = typeItem.categories;
  categories.load("items/name");
  await context.sync();

  // Office.js collection items are dynamically populated after load/sync
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstCategory = (categories as any).items[0];
  if (!firstCategory) return;

  const buildingBlocks = firstCategory.buildingBlocks;
  buildingBlocks.load("items/name");
  await context.sync();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstBlock = (buildingBlocks as any).items[0];
  if (!firstBlock) return;

  const targetBody = position === "top" ? firstSection.getHeader("Primary") : firstSection.getFooter("Primary");
  firstBlock.insert(targetBody.getRange("End"), true);
}
