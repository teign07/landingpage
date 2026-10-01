/* The original Feedback Board's draft links, beside the public Book. */
(() => {
  const note = document.querySelector('#feedback-note');
  const count = document.querySelector('#feedback-count');
  const submit = document.querySelector('#feedback-submit');
  const email = document.querySelector('#feedback-email');
  const form = document.querySelector('#feedback-draft');
  if (!note || !count || !submit || !email || !form) return;

  const storageKey = 'reenchanted-feedback-draft';
  try { note.value = (localStorage.getItem(storageKey) || '').slice(0, note.maxLength); } catch (_) {}

  function updateDraft() {
    const text = note.value.trim();
    const title = text
      ? `App feedback: ${text.split(/\s+/).slice(0, 7).join(' ')}`
      : 'App feedback: ';
    const body = [
      'What happened or what would you like?', '', text || '(Write the note here.)', '',
      'Where in the app:', '', 'What did you expect?', '', 'Device / iOS version:', '',
      'Contact email, if you want a reply:', '', `Sent from: ${location.href}`,
    ].join('\n');
    const query = `subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    count.textContent = `${note.value.length} / ${note.maxLength}`;
    submit.href = `https://github.com/teign07/ReEnchanted/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    email.href = `mailto:hello@reenchanted.app?${query}`;
    try { localStorage.setItem(storageKey, note.value); } catch (_) {}
  }

  note.addEventListener('input', updateDraft);
  form.addEventListener('submit', event => event.preventDefault());
  updateDraft();
})();
