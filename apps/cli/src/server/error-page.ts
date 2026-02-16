export const errorPage = (appPort: number) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev app not reachable — OpenUI</title>
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <style>
  :root {
    --bg: #f4f4f5;
    --text: #09090b;
    --muted: #71717a;
    --accent: #4692CF;
    --btn-bg: #18181b;
    --btn-fg: #fff;
  }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #09090b;
        --text: #fff;
        --muted: #a1a1aa;
        --accent: #6066DA;
        --btn-bg: #fff;
        --btn-fg: #09090b;
      }
    }

    body {
      background: var(--bg);
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .container {
      text-align: center;
      max-width: 420px;
      padding: 2rem;
    }

    .brand {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    h1 {
      color: var(--text);
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.75rem;
    }

    p {
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

    code {
      background: color-mix(in srgb, var(--muted) 15%, transparent);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .retry-btn {
      display: inline-block;
      padding: 0.6rem 1.5rem;
      background: var(--btn-bg);
      color: var(--btn-fg);
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .retry-btn:hover { opacity: 0.85; }
  </style>
</head>
<body>
<div class="container">
  <div class="brand">OpenUI</div>
  <h1>Dev app not reachable</h1>
  <p>Your app is not responding on port <code>${appPort}</code>.<br>Start your dev server first (e.g. <code>npm run dev</code>), then retry.</p>
  <button class="retry-btn" onclick="location.reload()">Retry</button>
</div>
</body>
</html>`;
