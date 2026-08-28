/**
 * PromptGuard warning overlay.
 *
 * Renders inside a shadow root so the host page's CSS can't clash with it
 * (and vice versa). Shows what categories of sensitive data were found —
 * counts and labels only, never the raw matched values — and lets the user
 * cancel, redact-and-send, or send anyway.
 */
(function () {
  'use strict';

  const STYLE = `
    :host { all: initial; }
    .pg-backdrop {
      position: fixed; inset: 0; z-index: 2147483647;
      background: rgba(15, 23, 42, 0.55);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pg-modal {
      background: #ffffff; border-radius: 12px; padding: 24px;
      width: 420px; max-width: 90vw; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      color: #0f172a;
    }
    .pg-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .pg-icon {
      width: 28px; height: 28px; border-radius: 50%;
      background: #fef3c7; display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .pg-title { font-size: 16px; font-weight: 600; margin: 0; }
    .pg-subtitle { font-size: 13px; color: #475569; margin: 0 0 16px 0; }
    .pg-list { list-style: none; margin: 0 0 20px 0; padding: 0; }
    .pg-list li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; border-radius: 8px; background: #f8fafc;
      margin-bottom: 6px; font-size: 13px;
    }
    .pg-sev {
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
      text-transform: uppercase; letter-spacing: 0.03em;
    }
    .pg-sev-high { background: #fee2e2; color: #b91c1c; }
    .pg-sev-low { background: #e0f2fe; color: #075985; }
    .pg-actions { display: flex; flex-direction: column; gap: 8px; }
    .pg-btn {
      border: none; border-radius: 8px; padding: 10px 14px; font-size: 13px;
      font-weight: 600; cursor: pointer; width: 100%;
    }
    .pg-btn-primary { background: #0f766e; color: white; }
    .pg-btn-secondary { background: #f1f5f9; color: #0f172a; }
    .pg-btn-danger { background: #ffffff; color: #b91c1c; border: 1px solid #fecaca; }
  `;

  function show({ matches, onCancel, onRedactAndSend, onSendAnyway }) {
    const host = document.createElement('div');
    host.id = 'promptguard-overlay-host';
    const shadow = host.attachShadow({ mode: 'closed' });

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    shadow.appendChild(styleEl);

    // Group matches by category for a compact summary (counts only).
    const counts = {};
    for (const m of matches) {
      if (!counts[m.id]) counts[m.id] = { label: m.label, severity: m.severity, count: 0 };
      counts[m.id].count++;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'pg-backdrop';

    const itemsHtml = Object.values(counts)
      .map(
        (c) => `
        <li>
          <span>${escapeHtml(c.label)} ${c.count > 1 ? `(${c.count})` : ''}</span>
          <span class="pg-sev pg-sev-${c.severity === 'high' ? 'high' : 'low'}">${c.severity}</span>
        </li>`
      )
      .join('');

    backdrop.innerHTML = `
      <div class="pg-modal" role="dialog" aria-modal="true">
        <div class="pg-header">
          <div class="pg-icon">⚠️</div>
          <h2 class="pg-title">PromptGuard flagged this message</h2>
        </div>
        <p class="pg-subtitle">This prompt appears to contain sensitive data. Choose how to proceed:</p>
        <ul class="pg-list">${itemsHtml}</ul>
        <div class="pg-actions">
          <button class="pg-btn pg-btn-primary" data-action="redact">Redact &amp; Send</button>
          <button class="pg-btn pg-btn-secondary" data-action="cancel">Cancel — let me edit</button>
          <button class="pg-btn pg-btn-danger" data-action="send">Send anyway</button>
        </div>
      </div>
    `;

    function close() {
      host.remove();
      document.removeEventListener('keydown', onEsc, true);
    }

    function onEsc(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
        onCancel && onCancel();
      }
    }

    backdrop.addEventListener('click', (e) => {
      const action = e.target && e.target.getAttribute && e.target.getAttribute('data-action');
      if (e.target === backdrop) {
        close();
        onCancel && onCancel();
        return;
      }
      if (!action) return;
      close();
      if (action === 'cancel') onCancel && onCancel();
      if (action === 'redact') onRedactAndSend && onRedactAndSend();
      if (action === 'send') onSendAnyway && onSendAnyway();
    });

    document.addEventListener('keydown', onEsc, true);
    shadow.appendChild(backdrop);
    document.body.appendChild(host);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  window.PromptGuardUI = { show };
})();
