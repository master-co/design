import { samples, escapeHtml as e } from './model.mjs';

export const command = 'npx skills add master-co/design --skill master-design\n';
const arrow = '<svg class="article-study-reading-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const link = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m9 15 6-6m-7 3-2 2a4 4 0 0 0 6 6l2-2m2-6 2-2a4 4 0 0 0-6-6l-2 2"/></svg>';

export function renderReadingControls(locale = 'zh-TW') {
  const sample = samples[locale];
  return `<div class="article-study-reading-pair">
    ${['minimum', 'independent'].map(mode => `<section data-reading-heading="${mode}"><h3>${mode === 'minimum' ? 'Target minimum in layout' : 'Independent anchor target'}</h3><h4 class="article-study-reading-heading article-study-copy" lang="${locale}"><span class="article-study-reading-target"><span>${e(sample.label)}</span><a class="article-study-heading-anchor" href="#reading-command" aria-label="Open command: ${e(sample.label)}">${link}</a></span></h4><p class="article-study-hint">The same following paragraph. The anchor remains usable in the space around the heading.</p></section>`).join('')}
  </div><div class="article-study-reading-pair">
    ${['inline', 'column'].map(mode => `<section data-reading-result="${mode}"><h3>${mode === 'inline' ? 'Arrow in the text flow' : 'Independent first-line arrow'}</h3><a class="article-study-reading-result article-study-reading-${mode} article-study-copy" lang="${locale}" href="#reading-command">${mode === 'column' ? `<span>${e(sample.wrap)}</span>` : e(sample.wrap)}${arrow}</a></section>`).join('')}
  </div><section class="article-study-reading-code" id="reading-command" aria-label="Command example"><pre tabindex="0"><code>${e(command)}</code></pre><button type="button" class="article-study-reading-copy" data-reading-copy aria-label="Copy command" hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></svg></button></section><p class="article-study-hint" data-reading-copy-status role="status">The command remains selectable without JavaScript. Copy is shown directly on devices without hover.</p>`;
}
