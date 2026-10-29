import { paths } from './components.mjs';
const shapes = {
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  folder: '<path d="M3 7V5h7l2 3h9v12H3V7Z"/>',
  library: '<rect x="4" y="4" width="5" height="16" rx="1"/><path d="m13 4 5-1 3 16-5 1-3-16Z"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  more: '<circle cx="5" cy="12" r=".7"/><circle cx="12" cy="12" r=".7"/><circle cx="19" cy="12" r=".7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0v6l2 3H4l2-3V9Zm4 12h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h3m3 0h3m-9 3h3"/>',
  sliders: '<path d="M4 7h16M4 17h16"/><rect x="8" y="4" width="3" height="6" rx="1"/><rect x="14" y="14" width="3" height="6" rx="1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 2 4h4l2-3 3-1 2-3-2-2 1-3-3-2-2-4H9Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  archive: '<path d="M4 8h16v13H4V8Z"/><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M10 12h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};

Object.assign(shapes, {folder: paths.folder, grid: paths.grid});

export function fineIcon(name, size = 16, stroke = size <= 12 ? 1 : 1.25) {
  if (!shapes[name]) throw new Error(`Unknown icon: ${name}`);
  const sourceStroke = stroke * 24 / size;
  return `<svg class="article-dash-icon article-finish-icon" viewBox="0 0 24 24" style="width:${size}px;height:${size}px;stroke-width:${sourceStroke}" data-physical-stroke="${stroke}" aria-hidden="true">${shapes[name]}</svg>`;
}
export function splitDate(label = 'Oct 19–23, 2026') {
  return `<div class="article-finish-split"><span class="article-finish-date">${fineIcon('calendar',14)}${label}</span><span class="article-finish-dropdown">${fineIcon('down',12)}</span></div>`;
}
export function fineProgress(value = 75) {
  return `<div class="article-finish-progress"><span class="article-finish-track"><i style="width:${value}%"></i></span><span class="article-finish-percent">${value}%</span></div>`;
}
