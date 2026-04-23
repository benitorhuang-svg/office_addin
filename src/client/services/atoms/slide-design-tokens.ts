/**
 * Atoms: PowerPoint Design Tokens
 * Centralized industrial styling tokens for the Slide Factory.
 * Adheres to Atomic Design principles for consistent visual hierarchy.
 */

export const SLIDE_DESIGN_TOKENS = {
  FONTS: {
    PRIMARY: "Segoe UI Semibold", // More impact
    SECONDARY: "Segoe UI",
    MONO: "Cascadia Code",
  },
  COLORS: {
    TITLE: "#0f172a", // Deep Industrial Navy (Slate 950)
    BODY: "#334155", // Slate 700 for better contrast
    ACCENT: "#2563eb", // Royal Indigo Blue
    SUBTITLE: "#475569", // Slate 600
    HIGHLIGHT: "#0ea5e9", // Sky Blue for micro-accenting
  },
  SIZES: {
    TITLE: 42, // Larger, more authoritative
    SUBTITLE: 28,
    BODY: 20, // Better readability on screens
    SMALL: 16,
  },
  SPACING: {
    LINE_HEIGHT: 1.25,
    BULLET_INDENT: 25,
  }
};
