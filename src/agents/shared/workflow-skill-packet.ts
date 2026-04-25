import type { AgentSkill } from "@agents/agent-skill.js";

export interface AgentSkillWorkflowPacket {
  id: string;
  version: string;
  description: string;
  trigger?: string;
  logic?: string;
  intentLabels: string[];
  edgeCases?: string;
  parallelSafe: boolean;
  overview: string;
  whenToUse: string[];
  process: string[];
  rationalizations: Array<{
    excuse: string;
    reality: string;
  }>;
  redFlags: string[];
  verification: string[];
  references: string[];
}

export function buildSkillWorkflowPacket(
  skill: AgentSkill<Record<string, unknown>>
): AgentSkillWorkflowPacket {
  return {
    id: skill.name,
    version: skill.version,
    description: skill.description,
    trigger: skill.trigger,
    logic: skill.logic,
    intentLabels: skill.intent_labels ?? [],
    edgeCases: skill.edge_cases,
    parallelSafe: skill.parallel_safe,
    overview: skill.workflow.overview,
    whenToUse: [...skill.workflow.whenToUse],
    process: [...skill.workflow.process],
    rationalizations: skill.workflow.rationalizations.map((item) => ({
      excuse: item.excuse,
      reality: item.reality,
    })),
    redFlags: [...skill.workflow.redFlags],
    verification: [...skill.workflow.verification],
    references: [...(skill.workflow.references ?? [])],
  };
}

export function renderSkillWorkflowGuide(
  skill: AgentSkill<Record<string, unknown>>,
  coreInstructions?: string
): string {
  const sections = [
    `# Skill: ${skill.name}`,
    "",
    `## Overview`,
    skill.workflow.overview,
    "",
    `## When to Use`,
    ...skill.workflow.whenToUse.map((item) => `- ${item}`),
    "",
    `## Process`,
    ...skill.workflow.process.map((item, index) => `${index + 1}. ${item}`),
    "",
    `## Common Rationalizations`,
    `| Rationalization | Reality |`,
    `|---|---|`,
    ...skill.workflow.rationalizations.map((item) => `| ${item.excuse} | ${item.reality} |`),
    "",
    `## Red Flags`,
    ...skill.workflow.redFlags.map((item) => `- ${item}`),
    "",
    `## Verification`,
    ...skill.workflow.verification.map((item) => `- ${item}`),
  ];

  if (skill.workflow.references && skill.workflow.references.length > 0) {
    sections.push("", "## References", ...skill.workflow.references.map((item) => `- ${item}`));
  }

  if (coreInstructions) {
    sections.push("", "## Core Instructions", coreInstructions.trim());
  }

  return sections.join("\n");
}
