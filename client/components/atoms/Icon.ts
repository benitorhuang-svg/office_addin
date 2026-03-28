/**
 * Atom: Icons
 * Encapsulates SVG icons for Nexus Center.
 */

export type IconName = 
    | "nexus-logo" | "step-01" | "step-02" | "prerequisites" 
    | "backend" | "link" | "connected" | "disconnected" | "close"
    | "gemini" | "github" | "eye" | "user" | "home" | "disconnect" | "plus" | "eraser" | "broom" | "trash";

export interface IconProps {
    name: IconName;
    className?: string;
    size?: number;
}

const icons: Record<IconName, string> = {
    "broom": `<path d="m11 17 2 2"/><path d="m15 13 2 2"/><path d="m19 9 2 2"/><path d="M12 21h9a2 2 0 0 0 2-2v-3"/><path d="M19 15.586a1 1 0 0 1 .707.293l2 2a1 1 0 0 1 0 1.414L20.414 20.586a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-.293-.707V15.586ZM3 21v-3.757a2 2 0 0 1 .586-1.414L15.414 4.014a2 2 0 0 1 2.828 0l2.157 2.157a2 2 0 0 1 0 2.828l-5.171 5.172v.001l-1.07 1.071c-.782.78-1.564 1.561-2.346 2.342a2 2 0 0 1-1.414.586H3Z"/>`,
    "nexus-logo": `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>`,
    "step-01": `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path>`,
    "step-02": `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`,
    "prerequisites": `<rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><rect x="7" y="2" width="2" height="20"></rect><rect x="15" y="2" width="2" height="20"></rect><rect x="2" y="12" width="20" height="2"></rect>`,
    "backend": `<rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><rect x="7" y="2" width="2" height="20"></rect><rect x="15" y="2" width="2" height="20"></rect><rect x="2" y="12" width="20" height="2"></rect>`,
    "link": `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>`,
    "connected": `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
    "disconnected": `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`,
    "close": `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`,
    "gemini": `<path d="M12 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-1zM5 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H5zM12 21a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1zM19 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1zM12 7l1.306 3.694L17 12l-3.694 1.306L12 17l-1.306-3.694L7 12l3.694-1.306L12 7z"></path>`,
    "github": `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>`,
    "eye": `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`,
    "user": `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`,
    "home": `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`,
    "disconnect": `<path d="M9 2v4M15 2v4M8 6h8v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6z"></path><path d="M12 12v2"></path><path d="M8 15h8a1 1 0 0 1 1 1v2a4 4 0 0 1-8 0v-2a1 1 0 0 1 1-1zM12 20v2"></path>`,
    "plus": `<path d="M5 12h14"></path><path d="M12 5v14"></path>`,
    "eraser": `<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.4 5.4c1 1 1 2.5 0 3.4L13 21"></path><path d="m22 21H7"></path><path d="m5 11 9 9"></path>`,
    "trash": `<path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path>`
};

export function createIcon({ name, className = "", size = 24 }: IconProps): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size.toString());
    svg.setAttribute("height", size.toString());
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.className.baseValue = className;
    svg.innerHTML = icons[name];
    return svg;
}
