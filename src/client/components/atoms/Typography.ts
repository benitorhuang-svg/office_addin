/**
 * Atom: Typography
 * Defines standardized industrial typography for Nexus Center.
 */

export type TypographyVariant = 
    | "h1" | "h2" | "h3" | "body" | "caption" | "mono-label" | "mono-data";

export interface TypographyProps {
    variant: TypographyVariant;
    text: string;
    className?: string;
    id?: string;
}

const styles: Record<TypographyVariant, string> = {
    h1: "nexus-text-h1", 
    h2: "nexus-text-h2",
    h3: "nexus-text-h3", 
    body: "nexus-text-body", 
    caption: "nexus-text-meta", 
    "mono-label": "nexus-text-meta", 
    "mono-data": "nexus-text-meta" 
};

export function createTypography({ variant, text, className = "", id }: TypographyProps): HTMLElement {
    const el = document.createElement(variant === "h1" || variant === "h2" || variant === "h3" ? variant : "span");
    el.className = `${styles[variant]} ${className}`;
    el.textContent = text;
    if (id) el.id = id;
    return el;
}
