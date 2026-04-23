import { createStatusIcon, StatusType } from "../atoms/status-icon";

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
  container.className = "nexus-flex nexus-flex-col nexus-gap-4";

  steps.forEach((step, index) => {
    const row = document.createElement("div");
    row.className = `nexus-flex nexus-items-center nexus-gap-4 nexus-p-3 nexus-rounded-xl nexus-transition-all ${
        step.status === 'success' ? 'nexus-bg-emerald-500/5' : 
        step.status === 'error' ? 'bg-rose-500/5' : 'nexus-bg-white/5'
    }`;

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "nexus-shrink-0";
    iconWrapper.appendChild(createStatusIcon(step.status));

    const content = document.createElement("div");
    content.className = "nexus-flex-1";
    content.innerHTML = `
      <div class="nexus-text-9px nexus-font-black nexus-uppercase nexus-tracking-widest nexus-text-slate-500 nexus-mb-0.5">STEP ${index + 1}</div>
      <div class="nexus-text-xs nexus-font-bold nexus-text-slate-200">${step.label || step.description}</div>   
    `;

    row.appendChild(iconWrapper);
    row.appendChild(content);
    container.appendChild(row);
  });

  return container;
}
