/**
 * Atom: Status HTML Renderer
 * Generates a polished HTML response for OAuth/Auth status pages.
 */
export function renderStatusHTML(
  title: string, 
  message: string, 
  color: string = '#0078D4', 
  autoClose: boolean = false
): string {
  return `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fbfbfb; color: #333; }
        .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.06); text-align: center; max-width: 400px; animation: slideIn 0.5s ease; border: 1px solid #eee; }
        .icon { font-size: 48px; color: ${color}; margin-bottom: 24px; }
        h3 { margin: 0 0 12px; font-weight: 600; font-size: 22px; }
        p { color: #666; line-height: 1.5; margin: 0 0 24px; }
        button { background: ${color}; color: white; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: filter 0.2s; }
        button:hover { filter: brightness(1.1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✨</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="window.close()">關閉視窗</button>
      </div>
      ${autoClose ? '<script>setTimeout(() => window.close(), 2000);</script>' : ''}
    </body>
    </html>`;
}
