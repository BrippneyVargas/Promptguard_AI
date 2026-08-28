/**
 * PromptGuard content script.
 *
 * Runs on supported chatbot pages (see manifest.json "matches"). Intercepts
 * prompt submission — either pressing Enter in the prompt box, or clicking
 * a "send"-looking button — and scans the prompt text for sensitive data
 * before letting the submission through.
 *
 * Design notes / known limitations (documented honestly rather than hidden):
 *  - Chat UIs don't expose a stable public API for "the prompt box" or
 *    "the send button", so this uses heuristics (Enter key on a text field,
 *    click on a button that looks like "send") rather than site-specific
 *    selectors. That's more resilient to UI changes but not bulletproof.
 *  - Some chat UIs (React-controlled inputs in particular) don't reliably
 *    pick up programmatic changes to `.value`/`.innerText` without using
 *    the native property setter trick — implemented below for <textarea>.
 *    For contenteditable fields this is best-effort; if redaction doesn't
 *    visibly update the box, the safe fallback is "Cancel" and edit by hand.
 *  - This only runs on the pages listed in manifest.json. Extending
 *    coverage to a new chatbot just means adding its domain there.
 */
(function () {
  'use strict';

  const detector = window.PromptGuardDetector;
  if (!detector) return;

  let enabled = true;
  chrome.storage.local.get({ enabled: true }, (data) => {
    enabled = data.enabled;
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) enabled = changes.enabled.newValue;
  });

  // Set while we're programmatically re-triggering a submission the user
  // already approved, so our own listeners don't intercept it again.
  let bypassNext = false;

  // Track the most recently focused editable field, so a click on a send
  // button (which itself isn't the text field) can still find the prompt.
  let lastFocusedField = null;

  function isEditableField(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function getFieldText(el) {
    if (el.tagName === 'TEXTAREA') return el.value;
    return el.innerText;
  }

  function setFieldText(el, newText) {
    if (el.tagName === 'TEXTAREA') {
      // Native setter trick: needed so frameworks like React (which patch
      // the value setter) still observe the change and fire their own
      // onChange/oninput handlers correctly.
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      ).set;
      setter.call(el, newText);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.innerText = newText;
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
  }

  function looksLikeSendButton(btn) {
    const label = (
      (btn.getAttribute('aria-label') || '') +
      ' ' +
      (btn.getAttribute('title') || '') +
      ' ' +
      (btn.textContent || '') +
      ' ' +
      (btn.getAttribute('data-testid') || '')
    ).toLowerCase();
    if (btn.type === 'submit') return true;
    return /send|submit/.test(label);
  }

  document.addEventListener(
    'focusin',
    (e) => {
      if (isEditableField(e.target)) lastFocusedField = e.target;
    },
    true
  );

  function handleFlaggedSubmission(field, text, matches, proceed) {
    window.PromptGuardUI.show({
      matches,
      onCancel: () => {
        // Do nothing further — user stays in the chat box to edit manually.
      },
      onRedactAndSend: () => {
        const redacted = detector.redact(text, matches);
        setFieldText(field, redacted);
        proceed();
      },
      onSendAnyway: () => {
        proceed();
      }
    });
  }

  function redispatchEnter(field) {
    bypassNext = true;
    field.focus();
    const ev = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
      cancelable: true
    });
    field.dispatchEvent(ev);
    setTimeout(() => {
      bypassNext = false;
    }, 0);
  }

  function redispatchClick(btn) {
    bypassNext = true;
    btn.click();
    setTimeout(() => {
      bypassNext = false;
    }, 0);
  }

  document.addEventListener(
    'keydown',
    (e) => {
      if (!enabled || bypassNext) return;
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return;
      const field = e.target;
      if (!isEditableField(field)) return;
      const text = getFieldText(field);
      if (!text || !text.trim()) return;

      const matches = detector.scan(text);
      if (matches.length === 0) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      handleFlaggedSubmission(field, text, matches, () => redispatchEnter(field));
    },
    true
  );

  document.addEventListener(
    'click',
    (e) => {
      if (!enabled || bypassNext) return;
      const btn = e.target.closest('button, [role="button"]');
      if (!btn || !looksLikeSendButton(btn)) return;
      const field = lastFocusedField;
      if (!field) return;
      const text = getFieldText(field);
      if (!text || !text.trim()) return;

      const matches = detector.scan(text);
      if (matches.length === 0) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      handleFlaggedSubmission(field, text, matches, () => redispatchClick(btn));
    },
    true
  );
})();
