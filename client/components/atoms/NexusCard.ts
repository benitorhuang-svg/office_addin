/**
 * Atom: NexusCard
 * Premium industrial container for Nexus Center components.
 */

export interface CardProps {
    children: (HTMLElement | string)[];
    className?: string;
    variant?: "default" | "glass" | "warning" | "success";
    padding?: "none" | "sm" | "md" | "lg";
}

const variants = {
    default: "nexus-card-variant-default",
    glass: "nexus-card-variant-glass",
    warning: "nexus-card-variant-warning",
    success: "nexus-card-variant-success"
};

const paddings = {
    none: "nexus-p-0",
    sm: "nexus-p-4",
    md: "nexus-p-6",
    lg: "nexus-p-8"
};

export function createNexusCard({ children, className = "", variant = "default", padding = "md" }: CardProps): HTMLElement {
    const card = document.createElement("div");
    card.className = `nexus-group nexus-card-base ${variants[variant]} ${paddings[padding]} ${className}`;
    
    children.forEach(child => {
        if (typeof child === "string") {
            const span = document.createElement("span");
            span.innerHTML = child;
            card.appendChild(span);
        } else {
            card.appendChild(child);
        }
    });

    return card;
}
