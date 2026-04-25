/* global fetch, FileReader */

/**
 * Atomic helper for image processing before Word insertion.
 */
export async function convertImageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] || result : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read image data."));
    reader.readAsDataURL(blob);
  });
}
