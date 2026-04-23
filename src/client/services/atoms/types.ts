/**
 * Re-exporting from @shared for compatibility during refactor.
 * This keeps the atomic structure clean while using universal types.
 */
export * from "@shared/types";
export * from "@shared/enums"; // Some files expect enums in types
export * from "@shared/locales"; // Some expect locales
