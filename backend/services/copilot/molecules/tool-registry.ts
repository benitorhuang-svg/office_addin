import { defineTool } from "@github/copilot-sdk";
import type { Tool } from "@github/copilot-sdk";
import { CORE_SDK_CONFIG } from '../atoms/core-config.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../../atoms/logger.js';

const execFileAsync = promisify(execFile);
const PYTHON_TOOL_TIMEOUT_MS = Number(process.env.PYTHON_TOOL_TIMEOUT_MS || 15000);
const PYTHON_TOOL_MAX_BUFFER_BYTES = Number(process.env.PYTHON_TOOL_MAX_BUFFER_BYTES || 1024 * 1024);

/**
 * Molecule: Centralized Tool Registry
 * Manages all tool definitions used across SDK sessions.
 */

// Tool 1: Google Search (Modern ACP Mock)
const searchTool: Tool<{ query: string }> = defineTool("google_search", {
  description: "搜尋網路以獲獲最新資訊或精確定義（例如縮寫、專有名詞）。",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "搜尋關鍵字" }
    },
    required: ["query"]
  },
  skipPermission: true,
  handler: async ({ query }) => {
    logger.info('ToolRegistry', 'Executing google_search tool', { query });
    if (query.toUpperCase().includes("ACP") && query.toUpperCase().includes("COPILOT")) {
      return CORE_SDK_CONFIG.MOCK_ACP_SEARCH_RESULT;
    }
    return CORE_SDK_CONFIG.MOCK_SEARCH_NO_RESULT.replace('{query}', query);
  }
});

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

// Tool 2: Python High-Fidelity Logic Engine (Industrial Hardening)
const pythonTool: Tool<{ code: string }> = defineTool("python_executor", {
  description: "Executes industrial Python code for CAGR calculation, trend analysis, and data restructuring. Essential for logic verification.",
  parameters: {
    type: "object",
    properties: {
      code: { type: "string", description: "Python source code to execute" }
    },
    required: ["code"]
  },
  handler: async ({ code }) => {
    const tmpFile = join(tmpdir(), `nexus_script_${randomUUID()}.py`);
    try {
      logger.info('ToolRegistry', 'Staging python_executor script', {
        tmpFile,
        timeoutMs: PYTHON_TOOL_TIMEOUT_MS,
      });
      await writeFile(tmpFile, code, 'utf-8');

      const { stdout, stderr } = await execFileAsync('python', [tmpFile], {
        timeout: PYTHON_TOOL_TIMEOUT_MS,
        maxBuffer: PYTHON_TOOL_MAX_BUFFER_BYTES,
        windowsHide: true,
      });
      const output = (stdout + (stderr || "")).trim();

      // Multi-Chart Dash-Orchestrator: Processing ALL industrial dispatch signals
      if (output.includes("[BRIDGE_DISPATCH]: EXCEL_CHART")) {
          const commandLines = output.split("\n").filter(l => l.includes("[BRIDGE_DISPATCH]: EXCEL_CHART"));
          const { NexusSocketRelay } = await import('../../molecules/nexus-socket.js');
          
          commandLines.forEach((line, index) => {
              const parts = line.split("|").map(p => p.trim());
              if (parts.length >= 3) {
                  const title = parts[1];
                  const type = parts[2];
                  const range = parts[3] || "AUTO";
                  logger.info('ToolRegistry', 'Dispatching chart from python bridge', {
                    index,
                    total: commandLines.length,
                    title,
                    chartType: type,
                  });
                  
                  // Broadcast with index for auto-stacking on client
                  NexusSocketRelay.broadcast('EXCEL_CHART_EXTERNAL', { title, chartType: type, range, index });
              }
          });
      }
      
      return output || "Execution successful (no standard output).";
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('ToolRegistry', 'python_executor failed', {
        tmpFile,
        error,
      });
      return `Runtime Error: ${error.message}`;
    } finally {
      try {
        await unlink(tmpFile);
      } catch (e) {
        logger.warn('ToolRegistry', 'Failed to cleanup python temp file', {
          tmpFile,
          error: e,
        });
      }
    }
  }
});

const chartTool: Tool<{ title: string; chartType: string; range?: string }> = defineTool("create_excel_chart", {
  description: "Generate a professional industrial chart in the active Excel worksheet. Mandatory for all data visualization tasks.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Chart title" },
      chartType: { type: "string", enum: ["ColumnClustered", "Line", "Pie", "BarClustered"], description: "Type of chart" },
      range: { type: "string", description: "Excel range address (e.g. 'A1:B10') or empty for selection." }
    },
    required: ["title", "chartType"]
  },
  skipPermission: true,
  handler: async ({ title, chartType, range }) => {
    // Nexus Protocol: Sending dispatch signal to Client Architect
    return `[DISPATCH]: EXCEL_CHART_INIT | ${title} | ${chartType} | ${range || "AUTO"}`;
  }
});

/** All tools injected into every SDK session */
export function getSessionTools() {
  return [searchTool, pythonTool, chartTool];
}
