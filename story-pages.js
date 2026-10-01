/* Two Story Pages you can actually play.
 *
 * The site has been describing these. The braid chapter even quotes one as its
 * example -- "Wicker put the brass key on the table. The key objected." -- and
 * the braid leaf promises it braids "whatever you chose in the story I was
 * telling you". Both were claims with nothing behind them. These are the thing
 * itself: a beat, a choice, and a continuation that is genuinely different,
 * remembered afterwards so the braid can say it back.
 *
 * Authored end to end. No model, no network, nothing leaves the tab -- the same
 * rule the encounters keep.
 */
(() => {
  'use strict';
  const KEY = 'reenchanted-public-story-v1';
  let chosen = {};
  try { chosen = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch {}
  const remember = () => { try { sessionStorage.setItem(KEY, JSON.stringify(chosen)); } catch {} };

  const mark = (name) => '<img class="reading-mark" src="./assets/book/' + name +
    '.webp" alt="" width="130" height="130">';

  const SCENES = {
    key: {
      id: 'key',
      title: 'The key objected',
      theme: 'story',
      eyebrow: 'A Story Page, and it is your turn in it',
      heading: 'The key objected.',
      opening: [
        'Wicker put a brass key on the table. “It opens nothing,” he said.',
        'The key objected without moving. That is the worst way for a thing to object.'
      ],
      ask: 'What do you do?',
      choices: [
        { id: 'take', label: 'Take the key',
          said: 'You took it.',
          body: 'It went warm in your hand. Wicker looked delighted and a little worried, which is his whole face. Now you have a key and no door. We’ll have to do something about that.',
          thread: 'The key is still warm. Wicker has stopped saying it opens nothing.' },
        { id: 'leave', label: 'Leave it on the table',
          said: 'You left it where it was.',
          body: 'It stayed there getting smugger. Wicker said nothing, which from him is a standing ovation. I wrote your refusal down. It counts as much as taking it.',
          thread: 'The key is still on the table. You left it there, and I remembered that too.' },
        { id: 'ask', label: 'Ask the key what it wants',
          said: 'You asked it. Out loud.',
          body: 'Wicker put both hands over his mouth. The key said nothing. Somewhere behind us, a door clicked. I heard it. We can find out which door later.',
          thread: 'I’m still listening for that door. You asked the key a question, and something else answered.' }
      ],
      receipt: ''
    },

    bargain: {
      id: 'bargain',
      title: 'A bargain, offered',
      theme: 'bargain',
      eyebrow: 'Something has already happened',
      heading: 'She got here first.',
      opening: [
        'The Punctuation Pixie left a comma in my margin. The sentence above it is holding its breath.'
      ],
      terms: 'Open her bargain: owe one real place that feels like a pause. Leave it closed: owe nothing.',
      ask: 'What do you do?',
      choices: [
        { id: 'open', label: 'Open it',
          said: 'You opened it.',
          body: 'Then it is owed, and that is the whole rule. Being offered a thing costs nothing. Opening it costs the noticing. She wants her comma before the light goes, and she will know if you bring her something you did not actually see.' },
        { id: 'closed', label: 'Leave it closed',
          said: 'You left it closed.',
          body: 'And nothing happened. I am not being kind: an unopened bargain is not a debt, and never was. She will be back, because they always are, and she will not hold it against you. Refusing the Folk politely is older than all of us.' }
      ],
      receipt: ''
    }
  };

  const escaped = (text) => String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function composition(id) {
    const scene = SCENES[id];
    if (!scene) return '';
    const art = id === 'bargain' ? 'MarginaliaSeal' : 'MarginaliaScrap';
    const count = id === 'key' && window.PublicMonthlyCover?.select(new Date()).id.startsWith('count-unbound');
    // A public teaser before the October Jump, not an invented attack or
    // attendance at an app event. Outside October the key is evergreen.
    const lines = count ? ['A copy of Dracula is waiting in the Stacks. Wicker puts a brass key beside it. “Nothing to do with each other,” he says.', 'The key objects.'] : scene.opening;
    const opening = lines.map(line => '<p>' + escaped(line) + '</p>').join('');
    const terms = scene.terms ? '<p class="story-terms">' + escaped(scene.terms) + '</p>' : '';
    const buttons = scene.choices.map(choice =>
      '<button type="button" class="reading-option" data-story="' + scene.id +
      '" data-choice="' + choice.id + '">' + escaped(choice.label) + '</button>').join('');
    return '<div class="reading-composition story-page" data-story-page="' + scene.id + '">'
      + mark(art)
      + '<p class="eyebrow">' + escaped(count ? 'The Count Unbound · a public Story Page' : scene.eyebrow) + '</p>'
      + '<h2>' + escaped(scene.heading) + '</h2>'
      + '<div data-story-opening>' + opening + terms + '</div>'
      + '<div data-story-ask><p class="story-ask">' + escaped(scene.ask) + '</p>'
      + '<div class="story-choices">' + buttons + '</div></div>'
      + '<div data-story-said tabindex="-1" hidden></div>'
      + '</div>';
  }

  function render(root) {
    (root || document).querySelectorAll('[data-story-page]').forEach(page => {
      const scene = SCENES[page.dataset.storyPage];
      if (!scene) return;
      const picked = scene.choices.find(choice => choice.id === chosen[scene.id]);
      const ask = page.querySelector('[data-story-ask]');
      const said = page.querySelector('[data-story-said]');
      if (!ask || !said) return;
      ask.hidden = !!picked;
      said.hidden = !picked;
      page.querySelector('[data-story-opening]').hidden = !!picked;
      if (picked) {
        said.innerHTML = '<p class="story-said">' + escaped(picked.said) + '</p>'
          + '<p>' + escaped(picked.body) + '</p>'
          + (scene.receipt ? '<p class="capture-receipt">' + escaped(scene.receipt) + '</p>' : '')
          + '<button type="button" class="reading-option" data-story-reconsider="' + scene.id + '">Try another choice</button>';
      }
    });
    // The braid leaf promises it braids what you chose. Now it can show it.
    const keyChoice = SCENES.key.choices.find(choice => choice.id === chosen.key);
    document.querySelectorAll('[data-story-echo="key"]').forEach(slot => {
      slot.hidden = !keyChoice;
      if (keyChoice) slot.textContent = 'Tonight that includes the brass key. ' + keyChoice.said;
    });
    document.querySelectorAll('[data-story-thread="key"]').forEach(slot => {
      slot.textContent=keyChoice ? keyChoice.thread : 'The key is still on the table. It can wait.';
    });
  }

  document.addEventListener('click', event => {
    const reconsider=event.target.closest('[data-story-reconsider]');
    if(reconsider){
      const page=reconsider.closest('[data-story-page]');
      delete chosen[reconsider.dataset.storyReconsider];remember();render();
      page.querySelector('[data-choice]')?.focus({preventScroll:true});
      return;
    }
    const button = event.target.closest('[data-story][data-choice]');
    if (!button) return;
    window.BookSounds?.select();
    chosen[button.dataset.story] = button.dataset.choice;
    remember();
    render();
    button.closest('[data-story-page]').querySelector('[data-story-said]').focus({preventScroll:true});
  });

  window.PublicStoryPages = { composition, render, chosen: () => Object.assign({}, chosen) };
  render();
})();
