import { current, previous, fixture } from './data.mjs';

export const plot = { width: 746, height: 170, left: 40, right: 706, top: 24, bottom: 134, max: 12 };
export const pointsFor = values => values.map((value,index) => ({
  x: plot.left + index * (plot.right - plot.left) / (values.length - 1),
  y: plot.bottom - value / plot.max * (plot.bottom - plot.top), value,
}));

// Monotone cubic segments: every control point remains inside its data interval.
export function curveFor(values) {
  const points = pointsFor(values);
  const slopes = points.slice(1).map((point,index) => (point.y - points[index].y) / (point.x - points[index].x));
  const tangents = points.map((_,index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes.at(-1);
    const a = slopes[index - 1], b = slopes[index];
    return a * b <= 0 ? 0 : 2 * a * b / (a + b);
  });
  const segments = points.slice(1).map((end,index) => {
    const start = points[index], dx = (end.x - start.x) / 3;
    const min = Math.min(start.y,end.y), max = Math.max(start.y,end.y);
    const clamp = value => Math.max(min,Math.min(max,value));
    return { start, c1:{x:start.x + dx,y:clamp(start.y + tangents[index] * dx)}, c2:{x:end.x - dx,y:clamp(end.y - tangents[index + 1] * dx)}, end };
  });
  const command = point => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
  return { points, segments, path: `M${command(points[0])}${segments.map(segment => `C${command(segment.c1)} ${command(segment.c2)} ${command(segment.end)}`).join('')}` };
}

export function renderChart() {
  const now = curveFor(current), before = curveFor(previous), end = now.points.at(-1);
  const ticks = [[0,'Oct 15'],[3,'Oct 18'],[6,'Oct 21'],[9,'Oct 24'],[13,'Oct 28']];
  return `<svg class="article-dash-line-chart" viewBox="0 0 ${plot.width} ${plot.height}" role="img" aria-label="Daily completed tasks from October 15 to 28: ${fixture.completed} total, versus ${fixture.previousCompleted} in the previous fourteen days.">
    <defs>
      <linearGradient id="delivery-line" x1="40" x2="706" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#8b8ee6"/><stop offset=".48" stop-color="#6379dc"/><stop offset="1" stop-color="#6155ce"/></linearGradient>
      <linearGradient id="delivery-area" x1="0" y1="24" x2="0" y2="134" gradientUnits="userSpaceOnUse"><stop stop-color="#8a83e8" stop-opacity=".22"/><stop offset=".62" stop-color="#9b9dec" stop-opacity=".065"/><stop offset="1" stop-color="#a2a5ee" stop-opacity="0"/></linearGradient>
      <radialGradient id="delivery-pulse"><stop stop-color="#7f74e4" stop-opacity=".2"/><stop offset=".45" stop-color="#8178e2" stop-opacity=".09"/><stop offset="1" stop-color="#8178e2" stop-opacity="0"/></radialGradient>
      <linearGradient id="delivery-tail" x1="565" x2="706" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#7274dd" stop-opacity="0"/><stop offset="1" stop-color="#8275ed" stop-opacity=".3"/></linearGradient>
      <filter id="delivery-glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
      <clipPath id="delivery-clip"><rect x="38" y="20" width="690" height="116"/></clipPath>
    </defs>
    ${[0,4,8,12].map(value => { const y=plot.bottom-value/plot.max*(plot.bottom-plot.top); return `<path class="article-dash-chart-rule" d="M40 ${y}H706"/><text class="article-dash-axis-label" x="24" y="${y+3}" text-anchor="end">${value}</text>`; }).join('')}
    <g clip-path="url(#delivery-clip)">
      <path d="${now.path}L706 134H40Z" fill="url(#delivery-area)"/>
      <path d="${before.path}" class="article-dash-previous-line"/>
      <path d="M${end.x} ${end.y}V134" class="article-dash-current-guide"/>
      <path d="${now.path}" fill="none" stroke="url(#delivery-tail)" stroke-width="7" filter="url(#delivery-glow)"/>
      <path d="${now.path}" class="article-dash-current-line" stroke="url(#delivery-line)"/>
      <circle cx="${end.x}" cy="${end.y}" r="22" fill="url(#delivery-pulse)"/>
      <circle cx="${end.x}" cy="${end.y}" r="9" fill="none" stroke="#7269dc" stroke-opacity=".16"/>
      <circle cx="${end.x}" cy="${end.y}" r="4" fill="#675bcf" stroke="#fff" stroke-width="2"/>
    </g>
    <text class="article-dash-point-label" x="690" y="15" text-anchor="end">Oct 28 · ${end.value} completed</text>
    ${ticks.map(([index,label])=>`<text class="article-dash-axis-label" x="${now.points[index].x}" y="158" text-anchor="${index===0?'start':index===13?'end':'middle'}">${label}</text>`).join('')}
  </svg>`;
}
