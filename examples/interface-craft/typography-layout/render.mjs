import { samples, localeIds, kinds, boardSpecs, escapeHtml as e } from './model.mjs';
import { renderReadingControls } from './reading-controls.mjs';

const icon = '<svg class="article-study-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const attr = (locale, extra = '') => `lang="${locale}" class="article-study-copy ${extra}"`;
let sequence = 0;
export function renderItem(kind, locale = 'zh-TW') {
  const s = samples[locale], id = 'study-control-' + (++sequence);
  switch (kind) {
    case 'avatar': return '<img class="article-study-avatar" src="./avatar/portraits/portrait-a.webp" width="32" height="32" alt="Fictional participant">';
    case 'thumbnail': return '<img class="article-study-thumbnail" src="./image-study.svg" width="48" height="32" alt="Original landscape study">';
    case 'icon': return icon;
    case 'badge': return `<span class="article-study-badge" lang="${locale}">${e(s.status)}</span>`;
    case 'count': return '<span class="article-study-count" aria-label="24 items">24</span>';
    case 'button': return `<button type="button" class="article-study-button" data-study-action disabled lang="${locale}">${e(s.edit)}</button>`;
    case 'checkbox': return `<label class="article-study-check-target"><input type="checkbox" aria-label="Select project">${icon}</label>`;
    case 'radio': return `<label class="article-study-check-target"><input type="radio" name="${id}" aria-label="Choose project"></label>`;
    case 'switch': return '<label class="article-study-switch"><input type="checkbox" role="switch" aria-label="Project notifications"><span aria-hidden="true"></span></label>';
    case 'input': return `<input class="article-study-input" aria-label="Project name" value="Alpha" size="5">`;
    case 'select': return `<select class="article-study-select" aria-label="Project status"><option lang="${locale}">${e(s.status)}</option><option>Paused</option></select>`;
    default: throw new Error('Unknown specimen: ' + kind);
  }
}
export function renderFlex(locale = 'zh-TW', mode = 'normal', kind = 'button') {
  return `<div class="article-study-row article-study-${mode}" data-row="${mode}" data-kind="${kind}"><span ${attr(locale, 'article-study-row-label')}>${e(samples[locale].label)}</span><span ${attr(locale, 'article-study-slot')}>${renderItem(kind, locale)}</span></div>`;
}
export function renderTable(locale = 'zh-TW', mode = 'normal', kind = 'button') {
  return `<table class="article-study-table article-study-${mode}" data-table="${mode}"><caption>${mode === 'compact' ? 'Action cell: 2 px block padding' : 'Every cell: 8 px block padding'}</caption><tbody><tr><td ${attr(locale)}>${e(samples[locale].label)}</td><td ${attr(locale, 'article-study-action-cell')}>${renderItem(kind, locale)}</td></tr></tbody></table>`;
}
export function renderInline(locale = 'zh-TW', mode = 'normal', kind = 'button') {
  const s = samples[locale];
  return `<p ${attr(locale, `article-study-inline article-study-${mode}`)} data-inline="${mode}">${e(s.before)}${kind === 'button' ? renderItem('button', locale) : kind === 'image' ? renderItem('avatar', locale) : kind === 'icon' ? icon : kind === 'code' ? '<code>save()</code>' : '<sup>2</sup>'}${e(s.after)}<br><span>${e(s.before + s.word + s.after)}</span></p>`;
}
export function renderCjk(locale = 'zh-TW') {
  const s = samples[locale];
  return `<div class="article-study-cjk-grid">
    <section><h3>Frame and visible face</h3><div ${attr(locale, 'article-study-metric-line')}><span class="article-study-em">${e(s.fontLabel.slice(0, 1))}</span><span>${e(s.fontLabel)}</span>${icon}</div><p class="article-study-hint">24 px type · 40 px line · real local fonts</p></section>
    <section><h3>Between scripts</h3><p ${attr(locale, 'article-study-space-off')}>${e(s.mixed)}</p><p ${attr(locale, 'article-study-space-on')}>${e(s.mixed)}</p><p class="article-study-hint">no-autospace / normal</p></section>
    <section><h3>Punctuation space</h3><p ${attr(locale, 'article-study-punct-off')}>${e(s.punctuation)}</p><p ${attr(locale, 'article-study-punct-on')}>${e(s.punctuation)}</p><p class="article-study-hint">space-all / trim-start · inspect engine support below</p></section>
    <section><h3>Breaks in a narrow measure</h3><p ${attr(locale, 'article-study-wrap article-study-wrap-default')}>${e(s.wrap)}</p><p ${attr(locale, 'article-study-wrap article-study-wrap-chosen')}>${e(s.wrap)}</p><p class="article-study-hint">${locale.startsWith('zh') ? 'break-all / normal' : locale === 'ko' ? 'normal / keep-all' : locale === 'en' ? 'wrap / pretty' : 'normal / strict'}</p></section>
  </div>`;
}
export function renderSpecimens(locale = 'zh-TW') {
  return kinds.map(kind => `<section class="article-study-specimen"><h3>${kind}</h3>${renderFlex(locale, 'bounded', kind)}</section>`).join('');
}
function boardBody(id) {
  if (id === 'C1') return `<div class="article-study-face-list">${localeIds.map(locale => `<section><h2>${samples[locale].name}</h2><div ${attr(locale, 'article-study-metric-line')}><span class="article-study-em">${e(samples[locale].fontLabel.slice(0, 1))}</span><span>${e(samples[locale].fontLabel)}</span>${icon}</div><small>${e(samples[locale].family)} · 24 px / 40 px</small></section>`).join('')}</div>`;
  if (id === 'C2') return `<div class="article-study-pairs"><section><h2>Between scripts</h2><div class="article-study-pair"><div><small>no-autospace</small><p ${attr('zh-TW', 'article-study-space-off')}>${e(samples['zh-TW'].mixed)}</p></div><div><small>normal</small><p ${attr('zh-TW', 'article-study-space-on')}>${e(samples['zh-TW'].mixed)}</p></div></div></section><section><h2>Punctuation</h2><div class="article-study-pair"><div><small>space-all</small><p ${attr('ja', 'article-study-punct-off')}>${e(samples.ja.punctuation)}</p></div><div><small>trim-start</small><p ${attr('ja', 'article-study-punct-on')}>${e(samples.ja.punctuation)}</p></div></div></section></div>`;
  if (id === 'C3') return `<div class="article-study-break-list">${['zh-TW', 'ja', 'ko'].map(locale => `<section><h2>${samples[locale].name}</h2><div class="article-study-pair"><div><small>${locale.startsWith('zh') ? 'break-all' : 'normal'}</small><p ${attr(locale, 'article-study-wrap article-study-wrap-default')}>${e(samples[locale].wrap)}</p></div><div><small>${locale === 'ko' ? 'keep-all' : locale === 'ja' ? 'strict' : 'normal'}</small><p ${attr(locale, 'article-study-wrap article-study-wrap-chosen')}>${e(samples[locale].wrap)}</p></div></div></section>`).join('')}</div>`;
  if (id === 'R1') return `<div class="article-study-row-boards">${['normal', 'compensated', 'translated'].map((mode, i) => `<section><h2>${['Natural footprint', 'Negative margins', 'Visual translation'][i]}</h2><small>${['36 px row', '24 px row · 36 px target', '36 px row · translated −6 px'][i]}</small>${renderFlex('zh-TW', mode)}</section>`).join('')}<p class="article-study-anatomy">Row boundary / button surface and target / text line<br>Outside paint is allowed here; surrounding space must accommodate it.</p></div>`;
  if (id === 'R2') return `<div class="article-study-table-boards"><section><h2>Text-only reference</h2><table class="article-study-table"><tbody><tr><td lang="zh-TW" class="article-study-copy">專案進度</td><td>Alpha</td></tr></tbody></table><small>40 px row</small></section><section><h2>Uniform padding</h2>${renderTable()}<small>52 px row</small></section><section><h2>Action-cell padding</h2>${renderTable('zh-TW', 'compact')}<small>40 px row · same 36 px control</small></section></div>`;
  return `<div class="article-study-inline-boards">${['normal', 'compensated', 'translated'].map((mode, i) => `<section><h2>${['Natural inline box', 'Margins + baseline', 'Translation only'][i]}</h2>${renderInline('zh-TW', mode)}<small>${['The 36 px control increases this line.', 'Baseline and font metrics still participate.', 'The original line contribution remains.'][i]}</small></section>`).join('')}</div>`;
}
function head(title, boards = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Master Design</title><link rel="icon" href="data:,"><link rel="stylesheet" href="./fonts.css"><link rel="stylesheet" href="./typography-layout/fonts.css"><link rel="stylesheet" href="./typography-layout/study.css">${boards ? '' : '<link rel="stylesheet" href="./typography-layout/reading-controls.css">'}</head><body class="${boards ? 'article-study-boards' : 'article-study-page'}">`;
}
export function renderTypographyBoards() {
  sequence = 0;
  return head('Typography and row studies', true) + boardSpecs.map(spec => `<section class="article-study-board" id="${spec.id}" data-guides="true"><header><span>${spec.id}</span><h1>${spec.title}</h1><small>${['C1','R2'].includes(spec.id) ? 'DETAIL GEOMETRY × 1.5' : ['R1','R3'].includes(spec.id) ? 'DETAIL GEOMETRY × 1.6' : 'GEOMETRY × 1'}</small></header><div class="article-study-board-body">${boardBody(spec.id)}</div><footer>${spec.note}</footer></section>`).join('') + '</body></html>';
}
export function renderTypographyPage() {
  sequence = 0;
  return head('Type, controls and row rhythm') + `<main class="article-study-main" data-guides="true"><nav><a href="./index.html">Workspace</a><a href="./typography-layout-studies.html">Six diagrams</a></nav><header class="article-study-intro"><p class="article-study-eyebrow">MASTER DESIGN / TYPE & LAYOUT</p><h1>Type, controls<br>and row rhythm.</h1><p>Compare real letterforms, layout footprints and actionable bounds. The numbers describe these specimens.</p></header>
    <form class="article-study-settings" aria-label="Study settings"><fieldset disabled><legend>Study settings</legend><label>Sample language<select name="locale">${localeIds.map(locale => `<option value="${locale}" ${locale === 'zh-TW' ? 'selected' : ''}>${samples[locale].name}</option>`).join('')}</select></label><label>Appearance<select name="theme"><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Measure<select name="measure"><option value="480">480 px</option><option value="320">320 px</option><option value="720">720 px</option></select></label><label>Text size<select name="scale"><option value="1">100%</option><option value="2">200%</option></select></label><label class="article-study-guide-label"><input name="guides" type="checkbox" checked> Show bounds</label></fieldset></form>
    <noscript><p>These fixed comparisons remain readable without JavaScript. Settings require JavaScript.</p></noscript>
    <section aria-labelledby="cjk-title"><h2 id="cjk-title">Letterforms, spacing and breaks</h2><div data-study-cjk>${renderCjk()}</div><p class="article-study-support" data-study-support>Support is checked in your browser when enhancement is available.</p></section>
    <section aria-labelledby="rows-title"><h2 id="rows-title">One row, three different footprints</h2><div class="article-study-comparisons" data-study-rows>${['normal', 'compensated', 'translated'].map(mode => `<section><h3>${mode}</h3>${renderFlex('zh-TW', mode)}<output data-measure="row">Compare the row boundary and target.</output></section>`).join('')}</div><p class="article-study-hint">The compact example has room around the row. A 36 px target still needs 36 px of unobstructed space. At large text sizes the specimen grows.</p></section>
    <section aria-labelledby="table-title"><h2 id="table-title">Native table cells</h2><div class="article-study-comparisons" data-study-tables>${renderTable() + renderTable('zh-TW', 'compact')}</div></section>
    <section aria-labelledby="inline-title"><h2 id="inline-title">Inside a sentence</h2><div class="article-study-comparisons" data-study-inline>${renderInline() + renderInline('zh-TW', 'compensated')}</div><div class="article-study-inline-extras" data-study-inline-extras>${['image', 'icon', 'code', 'sup'].map(kind => `<section><h3>${kind === 'sup' ? 'superscript' : kind}</h3>${renderInline('zh-TW', 'normal', kind)}</section>`).join('')}</div></section>
    <section aria-labelledby="specimens-title"><h2 id="specimens-title">Different contents need different space</h2><p>These bounded rows grow to fit their content. Avatars and fields keep their own size; touch targets may require a taller row.</p><div class="article-study-specimens" data-study-specimens>${renderSpecimens()}</div><button class="article-study-button" disabled>Unavailable action</button><output class="article-study-status" aria-live="polite" data-study-status>Controls operate locally.</output></section>
    <section aria-labelledby="reading-title"><h2 id="reading-title">Reading controls without a taller text line</h2><p>The 44 px anchor is a specimen target, independent of the heading line. Compare fixed text before changing geometry.</p><div data-study-reading>${renderReadingControls()}</div></section>
    <footer class="article-study-page-footer">Local fonts and original fictional portraits. No backend. <a href="./typography-layout-studies.html">Open the fixed-canvas comparisons</a>.</footer></main><script type="module" src="./dist/typography-layout/client.js"></script></body></html>`;
}
