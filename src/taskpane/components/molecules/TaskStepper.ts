import { createStatusIcon, StatusType } from "../atoms/StatusIcon";

export interface TaskStep {
  label: string;
  description?: string;
  status: StatusType;
}

/**
 * Molecule: TaskStepper
 * Renders a list of numbered steps with status icons.
 */
export function createTaskStepper(steps: TaskStep[]): HTMLElement {
  const container = document.createElement("div");
  container.className = "mol-task-stepper";

  steps.forEach((step, index) => {
    const row = document.createElement("div");
    row.className = `stepper-row ${step.status}`;

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "stepper-icon-wrapper";
    iconWrapper.appendChild(createStatusIcon(step.status));

    const content = document.createElement("div");
    content.className = "stepper-content";
    content.innerHTML = `
      <div class="stepper-label">步驟 ${index + 1}</div>
      <div class="stepper-desc">${step.label || step.description}</div>
    `;

    row.appendChild(iconWrapper);
    row.appendChild(content);
    container.appendChild(row);
  });

  return container;
}
