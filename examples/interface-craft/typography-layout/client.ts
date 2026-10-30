import { renderCjk, renderFlex, renderTable, renderInline, renderSpecimens } from './render.mjs';
import { samples } from './model.mjs';
import { renderReadingControls, command } from './reading-controls.mjs';

const main = document.querySelector<HTMLElement>('.article-study-main');
const form = document.querySelector<HTMLFormElement>('.article-study-settings');
if (main && form) {
  const get = (name: string) => (form.elements.namedItem(name) as HTMLSelectElement).value;
  const support = [
    ['Script spacing', CSS.supports('text-autospace', 'normal')],
    ['Punctuation trim', CSS.supports('text-spacing-trim', 'trim-start')],
    ['Latin text edges', CSS.supports('text-box', 'trim-both cap alphabetic')],
    ['Ideographic text edges', CSS.supports('text-box', 'trim-both ideographic')],
  ] as const;
  main.querySelector('[data-study-support]')!.textContent = support.map(([label, value]) => `${label}: ${value ? 'syntax supported' : 'not supported; normal layout retained'}`).join(' · ') + '. Syntax support is not a visual result.';
  function measure() {
    main!.querySelectorAll<HTMLElement>('[data-row]').forEach(row => {
      const output = row.parentElement?.querySelector('output');
      const item = row.querySelector('.article-study-slot')?.firstElementChild;
      if (output && item) output.textContent = `Row ${row.getBoundingClientRect().height.toFixed(2)} px · target ${item.getBoundingClientRect().height.toFixed(2)} px`;
    });
  }
  function enableActions() {
    main!.querySelectorAll<HTMLButtonElement>('[data-study-action]').forEach(button => { button.disabled = false; });
    main!.querySelectorAll<HTMLButtonElement>('[data-reading-copy]').forEach(button => { button.hidden = false; });
  }
  async function update() {
    const locale = get('locale') as keyof typeof samples;
    document.body.dataset.theme = get('theme');
    main!.dataset.guides = String((form!.elements.namedItem('guides') as HTMLInputElement).checked);
    main!.style.setProperty('--study-measure', `${get('measure')}px`);
    main!.style.setProperty('--study-scale', get('scale'));
    main!.querySelector('[data-study-cjk]')!.innerHTML = renderCjk(locale);
    main!.querySelector('[data-study-rows]')!.innerHTML = ['normal', 'compensated', 'translated'].map(mode => `<section><h3>${mode}</h3>${renderFlex(locale, mode)}<output data-measure="row"></output></section>`).join('');
    main!.querySelector('[data-study-tables]')!.innerHTML = renderTable(locale) + renderTable(locale, 'compact');
    main!.querySelector('[data-study-inline]')!.innerHTML = renderInline(locale) + renderInline(locale, 'compensated');
    main!.querySelector('[data-study-inline-extras]')!.innerHTML = ['image', 'icon', 'code', 'sup'].map(kind => `<section><h3>${kind === 'sup' ? 'superscript' : kind}</h3>${renderInline(locale, 'normal', kind)}</section>`).join('');
    main!.querySelector('[data-study-specimens]')!.innerHTML = renderSpecimens(locale);
    main!.querySelector('[data-study-reading]')!.innerHTML = renderReadingControls(locale);
    enableActions();
    await document.fonts.ready;
    measure();
  }
  form.addEventListener('change', () => { void update(); });
  main.addEventListener('click', event => {
    const copy = (event.target as Element).closest<HTMLButtonElement>('[data-reading-copy]');
    if (copy) {
      const status = main.querySelector<HTMLElement>('[data-reading-copy-status]')!;
      delete copy.dataset.copied;
      void (async () => {
        try {
          await navigator.clipboard.writeText(command);
          copy.dataset.copied = 'true';
          status.textContent = 'Command copied, including its final line break.';
        } catch {
          status.textContent = 'Clipboard unavailable. Select the command above to copy it manually.';
          main.querySelector<HTMLElement>('.article-study-reading-code pre')!.focus();
        }
      })();
      return;
    }
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-study-action]');
    if (!button) return;
    const saved = button.dataset.saved !== 'true';
    button.dataset.saved = String(saved);
    main.querySelector('[data-study-status]')!.textContent = saved ? 'Local action completed. The label and target stay in place.' : 'Local action reset.';
  });
  const observer = new ResizeObserver(measure);
  observer.observe(main);
  form.querySelector('fieldset')!.disabled = false;
  enableActions();
  document.fonts.ready.then(measure);
}
