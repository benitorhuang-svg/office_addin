import { reviewDesign } from '../molecules/design-reviewer';

describe('DesignReviewer', () => {
  it('should pass Excel Office.js code without natural language penalties', () => {
    const code = `
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange("A1");
        range.values = [["Hello"]];
        await context.sync();
      });
    `;
    const result = reviewDesign(code, 'excel');
    expect(result.passed).toBe(true);
    expect(result.totalScore).toBe(100);
  });

  it('should pass PPT Office.js code without natural language penalties', () => {
    const code = `
      await PowerPoint.run(async (context) => {
        const slide = context.presentation.slides.getItemAt(0);
        slide.shapes.addTextBox("Hello World");
        await context.sync();
      });
    `;
    const result = reviewDesign(code, 'ppt');
    expect(result.passed).toBe(true);
    expect(result.totalScore).toBe(100);
  });

  it('should fail when using standard refusal language', () => {
    const text = "I cannot do this for you. I'm unable to fulfill your request.";
    const result = reviewDesign(text, 'excel');
    expect(result.passed).toBe(false);
    expect(result.allIssues.some(i => i.includes('Refusal language detected'))).toBe(true);
  });

  it('should NOT fail when using refusal language legitimately for Office operations', () => {
    const text = "I cannot modify this cell because it is locked due to protection settings. You must unprotect it first. The bold and highlighted header shows the current data. Also I added some colors and formatted it because you need to see what changed.";
    const result = reviewDesign(text, 'excel');
    // Ensure "Refusal language detected" is not in the issues
    expect(result.allIssues.some(i => i.includes('Refusal language detected'))).toBe(false);
  });
});