/**
 * Overlays: toasts, modals, drawers and confirmations.
 *
 * These are the only things in the app that write to the DOM outside a page's
 * own subtree, so they live here rather than in primitives.js. Pages import
 * them directly:
 *
 *   import { toast, openModal, confirmAction } from '../ui/overlays.js';
 *   toast('Bullet replaced', { tone: 'pass', undo: () => restore() });
 */

import { icon } from './icons.js';
import { esc, Button } from './primitives.js';

/* ---- Toasts ------------------------------------------------------------ */

let toastSeq = 0;

/**
 * Confirms an action in the same words the button used. Never "Success!".
 * @param {string} message what happened, past tense
 * @param {object} [o]
 * @param {'info'|'pass'|'caution'|'fault'} [o.tone]
 * @param {number} [o.duration] ms; 0 keeps it until dismissed
 * @param {Function} [o.undo] shows an Undo button
 */
export function toast(message, { tone = 'info', duration = 4200, undo } = {}) {
  const root = document.getElementById('toast-root');
  if (!root) return () => {};

  const id = `toast-${++toastSeq}`;
  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  el.id = id;
  el.setAttribute('role', tone === 'fault' ? 'alert' : 'status');
  el.innerHTML = `
    <span class="toast__icon">${icon(
      tone === 'pass' ? 'check' : tone === 'fault' ? 'alertTriangle' : tone === 'caution' ? 'alertCircle' : 'info',
      15,
    )}</span>
    <span class="toast__text">${esc(message)}</span>
    ${undo ? '<button class="toast__undo" data-toast-undo>Undo</button>' : ''}
    <button class="toast__close" data-toast-close aria-label="Dismiss">${icon('x', 14)}</button>`;

  root.appendChild(el);

  let timer = null;
  const dismiss = () => {
    if (timer) clearTimeout(timer);
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400); // in case animations are disabled
  };

  el.querySelector('[data-toast-close]').addEventListener('click', dismiss);
  const undoBtn = el.querySelector('[data-toast-undo]');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      undo();
      dismiss();
    });
  }
  if (duration) timer = setTimeout(dismiss, duration);

  return dismiss;
}

/* ---- Focus handling shared by modal and drawer ------------------------ */

let lastFocused = null;

function trapFocus(container) {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const items = [...container.querySelectorAll(selector)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

/* ---- Modal ------------------------------------------------------------- */

let closeOverlay = null;

/**
 * @param {object} o
 * @param {string} o.title
 * @param {string} o.body HTML
 * @param {string} [o.foot] HTML; defaults to a single Close button
 * @param {'sm'|'md'|'lg'} [o.size]
 * @param {Function} [o.onMount] receives the modal element
 */
export function openModal({ title, body, foot, size = 'md', onMount }) {
  closeOverlays();
  const root = document.getElementById('overlay-root');
  if (!root) return () => {};

  lastFocused = document.activeElement;
  root.innerHTML = `
    <div class="scrim" data-overlay-close></div>
    <div class="modal modal--${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal__head">
        <h2 class="modal__title" id="modal-title">${esc(title)}</h2>
        <button class="modal__close" data-overlay-close aria-label="Close">${icon('x', 16)}</button>
      </header>
      <div class="modal__body">${body}</div>
      <footer class="modal__foot">${
        foot || Button({ label: 'Close', action: 'overlay-close' })
      }</footer>
    </div>`;

  const modal = root.querySelector('.modal');
  const release = trapFocus(modal);
  root.querySelectorAll('[data-overlay-close]').forEach((el) => el.addEventListener('click', closeOverlays));

  const focusTarget = modal.querySelector('[autofocus], input, textarea, select, button');
  if (focusTarget) focusTarget.focus();
  document.documentElement.classList.add('has-overlay');

  closeOverlay = () => {
    release();
    root.innerHTML = '';
    document.documentElement.classList.remove('has-overlay');
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
    closeOverlay = null;
  };

  if (onMount) onMount(modal);
  return closeOverlays;
}

/* ---- Drawer ------------------------------------------------------------ */

/** Side sheet. Used for record detail: an application, a job, a finding. */
export function openDrawer({ title, eyebrow, body, foot, onMount }) {
  closeOverlays();
  const root = document.getElementById('overlay-root');
  if (!root) return () => {};

  lastFocused = document.activeElement;
  root.innerHTML = `
    <div class="scrim" data-overlay-close></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <header class="drawer__head">
        <div>
          ${eyebrow ? `<p class="label">${esc(eyebrow)}</p>` : ''}
          <h2 class="drawer__title" id="drawer-title">${esc(title)}</h2>
        </div>
        <button class="drawer__close" data-overlay-close aria-label="Close">${icon('x', 16)}</button>
      </header>
      <div class="drawer__body">${body}</div>
      ${foot ? `<footer class="drawer__foot">${foot}</footer>` : ''}
    </aside>`;

  const drawer = root.querySelector('.drawer');
  const release = trapFocus(drawer);
  root.querySelectorAll('[data-overlay-close]').forEach((el) => el.addEventListener('click', closeOverlays));
  drawer.querySelector('.drawer__close').focus();
  document.documentElement.classList.add('has-overlay');

  closeOverlay = () => {
    release();
    root.innerHTML = '';
    document.documentElement.classList.remove('has-overlay');
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
    closeOverlay = null;
  };

  if (onMount) onMount(drawer);
  return closeOverlays;
}

export function closeOverlays() {
  if (closeOverlay) closeOverlay();
}

export function hasOverlay() {
  return Boolean(closeOverlay);
}

/* ---- Confirmation ----------------------------------------------------- */

/**
 * For destructive actions only. The confirm button repeats the verb — "Delete
 * version", not "OK" — so the consequence is legible at the moment of clicking.
 */
export function confirmAction({ title, body, confirmLabel = 'Confirm', tone = 'danger' }) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      closeOverlays();
      resolve(value);
    };

    openModal({
      title,
      size: 'sm',
      body: `<p class="prose">${body}</p>`,
      foot: `
        <button class="btn" data-confirm-cancel>Cancel</button>
        <button class="btn btn--${tone}" data-confirm-ok>${esc(confirmLabel)}</button>`,
      onMount: (modal) => {
        modal.querySelector('[data-confirm-ok]').addEventListener('click', () => done(true));
        modal.querySelector('[data-confirm-cancel]').addEventListener('click', () => done(false));
        modal.querySelector('[data-confirm-ok]').focus();
      },
    });
  });
}

/* ---- Clipboard -------------------------------------------------------- */

export async function copyText(text, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label, { tone: 'pass', duration: 2000 });
    return true;
  } catch {
    toast('Your browser blocked the clipboard. Select the text and copy it manually.', { tone: 'caution' });
    return false;
  }
}
