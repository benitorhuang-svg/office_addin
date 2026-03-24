/**
 * Atom: Fix import.meta.resolve for CJS compatibility
 * Wraps import.meta.resolve calls with typeof guards so they
 * don't crash when transpiled to CommonJS.
 */
export const name = 'import-meta-resolve';
export const clientOnly = true;

export function apply(source) {
  let result = source;

  // Replace the ternary form
  result = result.replace(
    /const sdkUrl = \(?import\.meta && import\.meta\.resolve \? import\.meta\.resolve\("@github\/copilot\/sdk"\) : "@github\/copilot\/sdk"\)?;/g,
    'const sdkUrl = (typeof import.meta !== "undefined" && typeof import.meta.resolve === "function" ? import.meta.resolve("@github/copilot/sdk") : "@github/copilot/sdk");'
  );

  // Also catch the direct call form
  result = result.replace(
    /import\.meta\.resolve\("@github\/copilot\/sdk"\);/g,
    '(typeof import.meta !== "undefined" && typeof import.meta.resolve === "function" ? import.meta.resolve("@github/copilot/sdk") : "@github/copilot/sdk");'
  );

  return result;
}
