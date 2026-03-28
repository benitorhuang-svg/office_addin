/**
 * Atom: LayoutBox
 * A standardized layout container with precise CSS control.
 * Supports any Node-based children for nexus-absolute flexibility.
 */

export interface LayoutBoxProps {
    id?: string;
    className?: string;
    tag?: keyof HTMLElementTagNameMap;
    style?: Partial<CSSStyleDeclaration> | string;
    children?: Node[]; // Standardized to Node to support HTMLElement and Text
    dataset?: Record<string, string>;
}

export function createLayoutBox(props: LayoutBoxProps): HTMLElement {
    const el = document.createElement(props.tag || "div");
    if (props.id) el.id = props.id;
    if (props.className) el.className = props.className;
    
    if (props.style) {
        if (typeof props.style === 'string') {
            el.style.cssText = props.style;
        } else {
            Object.assign(el.style, props.style);
        }
    }
    
    if (props.dataset) {
        Object.entries(props.dataset).forEach(([key, val]) => {
            el.dataset[key] = val;
        });
    }
    
    if (props.children) {
        props.children.forEach(child => el.appendChild(child));
    }
    
    return el;
}
