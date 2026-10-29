import { fineIcon as icon, splitDate, fineProgress } from './finishing.mjs';
import { segments } from './components.mjs';
import { fixture, projects, reviews, people } from './data.mjs';
import { renderChart } from './chart.mjs';
export { fixture };
const avatar = (id,extra='') => `<span class="article-dash-person article-dash-person-${people[id].tone} ${extra}" title="${people[id].name}">${id}</span>`;
function stat(value,label,foot,name,tone='neutral',delta='') {
  return `<div class="article-dash-stat article-dash-stat-${tone}"><div class="article-dash-stat-label"><span>${label}</span>${icon(name,14)}</div><div class="article-dash-stat-line"><span class="article-dash-stat-value">${value}</span>${delta?`<span class="article-dash-delta">${icon('arrow',12)}${delta}</span>`:''}</div><div class="article-dash-stat-foot">${foot}</div></div>`;
}
function projectRow(project) {
  return `<tr class="${project.selected?'article-dash-row-selected':''}"><td><span class="article-dash-checkbox ${project.selected?'article-dash-checked':''}">${project.selected?icon('check',9):''}</span></td><td><div class="article-dash-project-name"><span class="article-dash-project-mark article-dash-identity-${project.identity}">${project.code}</span><span>${project.name}<small>${project.detail}</small></span></div></td><td><span class="article-dash-status article-dash-status-${project.tone}"><i></i>${project.status}</span></td><td>${fineProgress(project.progress)}</td><td class="article-dash-task-count">${project.tasks}</td><td><div class="article-dash-owner-stack">${project.owners.map(person=>avatar(person)).join('')}</div></td><td class="article-dash-due">${project.due}</td><td>${icon('more',14)}</td></tr>`;
}
export function renderDashboard() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio — delivery overview</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/fonts/geist.css"><link rel="stylesheet" href="/fonts/ibm-plex-mono.css"><link rel="stylesheet" href="/study.css"><link rel="stylesheet" href="/finishing.css"><link rel="stylesheet" href="./dashboard.css"></head><body>
  <section class="article-dashboard-plate" aria-label="An original product-team workspace">
    <header class="article-dash-plate-heading"><span>11</span><h1>In context</h1><small>STUDIO / DELIVERY OVERVIEW</small></header>
    <div class="article-dash-shell">
      <aside class="article-dash-sidebar">
        <div class="article-dash-brand"><span class="article-dash-brand-icon">${icon('grid',18)}</span><span>Studio<small>Product team</small></span>${icon('down',12)}</div>
        <div class="article-dash-search">${icon('search',16)}<span>Search workspace</span><kbd>⌘ K</kbd></div>
        <div class="article-dash-nav-label">WORKSPACE</div>
        <div class="article-dash-nav-group"><div class="article-dash-nav-item article-dash-nav-current">${icon('grid')}Overview<span class="article-dash-current-dot"></span></div>
        <div class="article-dash-nav-item">${icon('folder')}Projects<span class="article-dash-nav-count">${projects.length}</span></div>
        <div class="article-dash-nav-item">${icon('check')}Reviews<span class="article-dash-review-count">${fixture.inReview}</span></div>
        <div class="article-dash-nav-item">${icon('activity')}Activity</div>
        </div><div class="article-dash-nav-label article-dash-spaces-label">YOUR SPACES${icon('plus',12)}</div>
        <div class="article-dash-nav-group"><div class="article-dash-space"><i class="article-dash-space-product"></i>Product design<span>${projects.length}</span></div>
        <div class="article-dash-space"><i></i>Team library${icon('library',12)}</div>
        </div><div class="article-dash-sidebar-bottom"><div class="article-dash-nav-item">${icon('settings')}Workspace settings</div><div class="article-dash-account">${avatar('AR')}<span>Alex Rivera<small>Design lead</small></span>${icon('down',12)}</div></div>
      </aside>
      <main class="article-dash-main">
        <div class="article-dash-topbar"><span>Workspace <i>/</i> <b>Overview</b></span><div class="article-dash-top-actions"><span class="article-dash-saved"><i></i>Synced at ${fixture.lastSynced}</span><span class="article-dash-icon-button">${icon('bell',14)}</span>${avatar('AR')}</div></div>
        <div class="article-dash-body">
          <div class="article-dash-title-row"><div><h2>Overview</h2><p>Wednesday, October 28</p></div><div class="article-dash-title-actions">${splitDate(fixture.dateRange)}<span class="article-dash-button article-dash-button-primary">${icon('plus',14)}New project</span></div></div>
          <div class="article-dash-stats">${stat(projects.length,'Active projects','Across product design','folder')}${stat(fixture.openTasks,'Open tasks','Across 4 workstreams','grid')}${stat(fixture.inReview,'Awaiting review',`${fixture.reviewProjects} projects need a decision`,'clock','review')}${stat(fixture.completed,'Completed','vs previous 14 days','check','success',`+${fixture.changePercent}%`)}</div>
          <div class="article-dash-middle">
            <div class="article-dash-chart-shell"><div class="article-dash-chart-heading"><div><h3>Delivery cadence</h3><small>Completed tasks per day</small></div><div class="article-dash-chart-legend"><span><i class="article-dash-legend-current"></i>Current</span><span><i class="article-dash-legend-previous"></i>Previous 14 days</span></div></div><div class="article-dash-chart-panel">${renderChart()}<div class="article-dash-chart-footer"><span>Oct 15–28, 2026</span><span>Compared with Oct 1–14</span></div></div></div>
            <aside class="article-dash-next"><div class="article-dash-review-heading"><div><h3>Review queue</h3><small>Across ${fixture.reviewProjects} projects</small></div><span class="article-dash-review-count">${fixture.inReview}</span></div><div class="article-dash-next-panel"><div class="article-dash-review-items">${reviews.map(review=>`<div class="article-dash-next-task">${avatar(review.person)}<span>${review.title}<small>${review.project}</small></span><time>${review.due}</time></div>`).join('')}</div><div class="article-dash-next-footer">Open review queue${icon('arrow',14)}</div></div></aside>
          </div>
          <div class="article-dash-projects-shell"><div class="article-dash-projects-heading"><h3>Projects <span>${projects.length}</span></h3>${segments(['All projects','In progress','Archived'],0,'article-dash-segments')}<span class="article-dash-filter">${icon('sliders',14)}Filter</span><span class="article-dash-icon-button">${icon('search',14)}</span></div><div class="article-dash-projects-panel"><table><colgroup><col style="width:4%"><col style="width:28%"><col style="width:17%"><col style="width:19%"><col style="width:7%"><col style="width:10%"><col style="width:10%"><col style="width:5%"></colgroup><thead><tr><th></th><th>Project</th><th>Status</th><th>Progress</th><th>Open tasks</th><th>Team</th><th>Due</th><th></th></tr></thead><tbody>${projects.map(projectRow).join('')}</tbody></table><div class="article-dash-projects-footer"><span>Showing ${projects.length} projects</span><span>Updated at ${fixture.lastSynced}</span></div></div>
            <div class="article-dash-floating-actions"><span class="article-dash-selection-count"><i>${projects.filter(project=>project.selected).length}</i>selected</span><span class="article-dash-action-divider"></span><span class="article-dash-floating-action">${icon('folder',14)}Move to${icon('down',12)}</span><span class="article-dash-floating-action">${icon('archive',14)}Archive</span><span class="article-dash-action-divider"></span><span class="article-dash-floating-close">${icon('close',14)}</span></div>
          </div>
        </div>
      </main>
    </div><div class="article-dash-register article-dash-register-left"></div><div class="article-dash-register article-dash-register-right"></div>
  </section></body></html>`;
}
