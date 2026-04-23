import { applyExcelActions, getExcelContext, insertTextIntoExcel } from "./excel-actions";
import {
  applyPowerPointActions,
  getPowerPointContext,
  insertTextIntoPowerPoint,
} from "./powerpoint-actions";
import { applyOfficeActions, getWordContext, insertTextIntoWord } from "./word-actions";
/* global Office */

import { OfficeAction, OfficeContextPayload } from "../atoms/types";

function getHostType(): Office.HostType | "" {
  if (typeof Office !== "undefined" && Office.context && Office.context.host) {
    return Office.context.host;
  }
  return "";
}

export async function getOfficeContext(): Promise<OfficeContextPayload> {
  const host = getHostType();
  if (host === Office.HostType.Excel) {
    return getExcelContext();
  }
  if (host === Office.HostType.PowerPoint) {
    return getPowerPointContext();
  }
  // Default to Word, which is the most feature-complete.
  return getWordContext();
}

export async function insertTextIntoOffice(text: string): Promise<void> {
  const host = getHostType();
  if (host === Office.HostType.Excel) {
    return insertTextIntoExcel(text);
  }
  if (host === Office.HostType.PowerPoint) {
    return insertTextIntoPowerPoint(text);
  }
  return insertTextIntoWord(text);
}

export async function applyUniversalOfficeActions(
  actions: OfficeAction[] | undefined,
  fallbackText: string
): Promise<number | void> {
  const host = getHostType();
  if (host === Office.HostType.Excel) {
    return applyExcelActions(actions, fallbackText);
  }
  if (host === Office.HostType.PowerPoint) {
    return applyPowerPointActions(actions, fallbackText);
  }
  return applyOfficeActions(actions, fallbackText);
}
