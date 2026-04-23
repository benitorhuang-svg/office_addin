import type { PermissionHandler, PermissionRequestResult } from "@github/copilot-sdk";
import { logger } from '@shared/logger/index.js';

const SAFE_CUSTOM_TOOLS = new Set([
  'google_search',
  'create_excel_chart',
  'word_skill',
  'excel_skill',
  'powerpoint_skill',
]);
const AUTO_APPROVE_ALL_PERMISSIONS = process.env.COPILOT_AUTO_APPROVE_ALL_PERMISSIONS === 'true';
const AUTO_APPROVE_PYTHON_TOOL = process.env.COPILOT_AUTO_APPROVE_PYTHON_TOOL === 'true';

function approved(): PermissionRequestResult {
  return { kind: 'approved' };
}

function denied(): PermissionRequestResult {
  return { kind: 'denied-no-approval-rule-and-could-not-request-from-user' };
}

export const handleCopilotPermissionRequest: PermissionHandler = (request, invocation) => {
  const toolName = typeof request.toolName === 'string' ? request.toolName : undefined;

  if (AUTO_APPROVE_ALL_PERMISSIONS) {
    logger.warn('SDKPermission', 'Auto-approving permission request due to env override', {
      sessionId: invocation.sessionId,
      kind: request.kind,
      toolName,
    });
    return approved();
  }

  if (request.kind === 'custom-tool') {
    if (toolName && SAFE_CUSTOM_TOOLS.has(toolName)) {
      return approved();
    }

    if (toolName === 'python_executor' && AUTO_APPROVE_PYTHON_TOOL) {
      logger.warn('SDKPermission', 'Auto-approving python executor due to env override', {
        sessionId: invocation.sessionId,
        toolName,
      });
      return approved();
    }
  }

  logger.warn('SDKPermission', 'Denied permission request by default', {
    sessionId: invocation.sessionId,
    kind: request.kind,
    toolName,
  });
  return denied();
};
