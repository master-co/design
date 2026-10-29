// A small original component vocabulary shared by studies and the final workspace.
export const canvas = { width: 1440, height: 1000, scale: 2 };
export const geometry = { inset: 8, outerRadius: 24, innerRadius: 16, trackRadius: 14, trackPadding: 4, selectedRadius: 10 };
export const paths = {
  grid: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  folder: '<path d="M3 8V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  more: '<circle cx="5" cy="12" r=".7"/><circle cx="12" cy="12" r=".7"/><circle cx="19" cy="12" r=".7"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
export const icon = name => `<svg class="article-craft-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
export const segments = (labels = ['Overview', 'Library', 'Activity'], selected = 1, extra = '') => `<div class="article-segments ${extra}">${labels.map((label, i) => `<span class="article-segment ${i === selected ? 'article-selected' : ''}">${label}</span>`).join('')}</div>`;
export const button = (pressed = false) => `<div class="article-craft-button ${pressed ? 'article-craft-pressed' : ''}">${icon('folder')}<span>Library</span></div>`;
export const nested = (content = '') => `<div class="article-shell"><div class="article-nested-panel">${content}</div></div>`;
export const projects = [
  { initials: 'IL', name: 'Interface library', detail: 'Components & patterns', state: 'In review', date: 'Oct 23' },
  { initials: 'WR', name: 'Workspace refresh', detail: 'Layout & navigation', state: 'In progress', date: 'Oct 26' },
  { initials: 'IC', name: 'Icon collection', detail: 'Symbols & details', state: 'In progress', date: 'Oct 28' },
];
export function projectList(count = 3) {
  return `<div class="article-craft-list"><div class="article-craft-list-head"><span>Project</span><span>Status</span><span>Due</span></div>${projects.slice(0, count).map(p => `<div class="article-craft-list-row"><div class="article-craft-project"><span class="article-craft-mark">${p.initials}</span><span>${p.name}<small>${p.detail}</small></span></div><span class="article-craft-status"><i></i>${p.state}</span><time>${p.date}</time></div>`).join('')}</div>`;
}
export const toolbar = () => `<div class="article-craft-glass"><span class="article-craft-selection"><i>2</i> selected</span><b></b><span>${icon('folder')}Move to</span><span>${icon('check')}Review</span><b></b><span>${icon('close')}</span></div>`;
