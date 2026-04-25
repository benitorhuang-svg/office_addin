/**
 * FluentButton — thin TypeScript wrapper over <fluent-button> web component.
 *
 * Usage:
 *   const btn = new FluentButton({ label: 'Submit', onClick: () => {} });
 *   document.body.appendChild(btn.element);
 *
 * Or declarative helper:
 *   document.getElementById('container')?.appendChild(
 *     FluentButton.create({ label: 'Cancel', variant: 'outline', onClick: handler })
 *   );
 */

export type FluentButtonVariant = "accent" | "neutral" | "outline" | "subtle" | "transparent";
export type FluentButtonSize = "small" | "medium" | "large";
export type FluentButtonShape = "circular" | "rounded" | "square";

export interface FluentButtonOptions {
  label: string;
  variant?: FluentButtonVariant;
  size?: FluentButtonSize;
  shape?: FluentButtonShape;
  disabled?: boolean;
  icon?: string; // inner HTML for icon slot
  iconPosition?: "before" | "after";
  onClick?: (event: MouseEvent) => void;
  className?: string;
  ariaLabel?: string;
}

export class FluentButton {
  readonly element: HTMLElement;

  constructor(opts: FluentButtonOptions) {
    const btn = document.createElement("fluent-button");

    if (opts.variant) btn.setAttribute("appearance", opts.variant);
    if (opts.size) btn.setAttribute("size", opts.size);
    if (opts.shape) btn.setAttribute("shape", opts.shape);
    if (opts.disabled) btn.setAttribute("disabled", "");
    if (opts.className) btn.className = opts.className;
    if (opts.ariaLabel) btn.setAttribute("aria-label", opts.ariaLabel);

    if (opts.icon) {
      const slot = opts.iconPosition ?? "before";
      const iconEl = document.createElement("span");
      iconEl.setAttribute("slot", `${slot}-icon`);
      iconEl.innerHTML = opts.icon;
      btn.appendChild(iconEl);
    }

    const labelNode = document.createTextNode(opts.label);
    btn.appendChild(labelNode);

    if (opts.onClick) {
      btn.addEventListener("click", opts.onClick as EventListener);
    }

    this.element = btn;
  }

  setDisabled(disabled: boolean): void {
    if (disabled) {
      this.element.setAttribute("disabled", "");
    } else {
      this.element.removeAttribute("disabled");
    }
  }

  setLabel(label: string): void {
    // Update last text node
    for (let i = this.element.childNodes.length - 1; i >= 0; i--) {
      const node = this.element.childNodes[i];
      if (node && node.nodeType === Node.TEXT_NODE) {
        node.textContent = label;
        break;
      }
    }
  }

  /** Convenience factory method */
  static create(opts: FluentButtonOptions): HTMLElement {
    return new FluentButton(opts).element;
  }
}
