/**
 * FluentInput — thin TypeScript wrapper over <fluent-text-field> web component.
 *
 * Usage:
 *   const input = new FluentInput({ label: 'Search', placeholder: 'Type here...' });
 *   document.body.appendChild(input.element);
 *   const value = input.getValue();
 */

export type FluentInputAppearance = 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
export type FluentInputSize = 'small' | 'medium' | 'large';

export interface FluentInputOptions {
  label?: string;
  placeholder?: string;
  value?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url';
  appearance?: FluentInputAppearance;
  size?: FluentInputSize;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
  ariaLabel?: string;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
}

export class FluentInput {
  readonly element: HTMLElement;
  private readonly _input: HTMLElement;

  constructor(opts: FluentInputOptions) {
    const field = document.createElement('fluent-text-field');

    if (opts.appearance) field.setAttribute('appearance', opts.appearance);
    if (opts.size) field.setAttribute('size', opts.size);
    if (opts.placeholder) field.setAttribute('placeholder', opts.placeholder);
    if (opts.value) field.setAttribute('value', opts.value);
    if (opts.type) field.setAttribute('type', opts.type);
    if (opts.disabled) field.setAttribute('disabled', '');
    if (opts.required) field.setAttribute('required', '');
    if (opts.readOnly) field.setAttribute('readonly', '');
    if (opts.maxLength) field.setAttribute('maxlength', String(opts.maxLength));
    if (opts.className) field.className = opts.className;
    if (opts.ariaLabel) field.setAttribute('aria-label', opts.ariaLabel);

    if (opts.label) {
      const labelEl = document.createElement('label');
      labelEl.textContent = opts.label;
      labelEl.setAttribute('slot', 'label');
      field.appendChild(labelEl);
    }

    if (opts.onInput) {
      field.addEventListener('input', (e: Event) => {
        opts.onInput!((e.target as HTMLInputElement)?.value ?? '', e);
      });
    }

    if (opts.onChange) {
      field.addEventListener('change', (e: Event) => {
        opts.onChange!((e.target as HTMLInputElement)?.value ?? '', e);
      });
    }

    this._input = field;
    this.element = field;
  }

  getValue(): string {
    return (this._input as HTMLInputElement).value ?? this._input.getAttribute('current-value') ?? '';
  }

  setValue(value: string): void {
    this._input.setAttribute('value', value);
    (this._input as HTMLInputElement).value = value;
  }

  setDisabled(disabled: boolean): void {
    if (disabled) {
      this._input.setAttribute('disabled', '');
    } else {
      this._input.removeAttribute('disabled');
    }
  }

  focus(): void {
    (this._input as HTMLElement).focus?.();
  }

  /** Convenience factory method */
  static create(opts: FluentInputOptions): HTMLElement {
    return new FluentInput(opts).element;
  }
}
