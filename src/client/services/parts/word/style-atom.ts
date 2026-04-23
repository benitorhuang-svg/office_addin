/**
 * Atom: Word Style Utility
 * Provides safe, literal-based access to Word's internal formatting.
 * FIXED: Replaced live 'Word' object references with constant literals to prevent 
 * ReferenceErrors in browser environments.
 */

export const WORD_STYLES = {
    HEADING_1: "Heading1",
    HEADING_2: "Heading2",
    HEADING_3: "Heading3",
    NORMAL: "Normal",
    // Word.BuiltInStyleName.gridTable4_Accent1 string equivalent
    GRID_TABLE: "GridTable4-Accent1"
};

// Use numeric literals from Word.Alignment enum
export const ALIGNMENT_MAP = {
    left: "Left",      // Corresponds to Word.Alignment.left
    centered: "Centered", // Corresponds to Word.Alignment.centered
    right: "Right",    // Corresponds to Word.Alignment.right
    justified: "Justified" // Corresponds to Word.Alignment.justified
};

export const INSERT_LOCATION = {
    REPLACE: "Replace",
    END: "End",
    START: "Start"
};
