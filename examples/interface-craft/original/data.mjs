// A coherent, entirely illustrative product-team workspace.
export const people = {
  AR: { name: 'Alex Rivera', tone: 'slate' },
  MN: { name: 'Mina Noor', tone: 'sage' },
  SK: { name: 'Sam Kim', tone: 'clay' },
};
export const projects = [
  { name: 'Workspace refresh', code: 'WR', detail: 'Navigation & onboarding', status: 'In review', tone: 'review', tasks: 6, progress: 82, due: 'Oct 30', owners: ['AR','MN'], selected: true, identity: 'violet' },
  { name: 'Billing experience', code: 'BE', detail: 'Payments & invoices', status: 'In progress', tone: 'active', tasks: 4, progress: 64, due: 'Nov 02', owners: ['AR','SK'], selected: true, identity: 'clay' },
  { name: 'Mobile navigation', code: 'MN', detail: 'iOS & Android', status: 'In progress', tone: 'active', tasks: 5, progress: 45, due: 'Nov 04', owners: ['MN'], selected: false, identity: 'sage' },
  { name: 'Component library', code: 'CL', detail: 'Foundations & patterns', status: 'Planning', tone: 'neutral', tasks: 3, progress: 24, due: 'Nov 06', owners: ['SK'], selected: false, identity: 'slate' },
];
export const reviews = [
  { title: 'Navigation states', project: 'Workspace refresh', person: 'MN', due: 'Today' },
  { title: 'Empty-state copy', project: 'Workspace refresh', person: 'AR', due: 'Today' },
  { title: 'Payment confirmation', project: 'Billing experience', person: 'SK', due: 'Tomorrow' },
];
export const current = [3,4,3,6,4,7,5,8,6,7,6,8,7,10];
export const previous = [3,4,2,5,4,6,3,7,5,6,4,7,6,8];
const sum = values => values.reduce((total,value) => total + value, 0);
export const fixture = {
  kind: 'illustrative', dateRange: 'Oct 15–28, 2026', comparisonRange: 'Oct 1–14, 2026',
  today: '2026-10-28', lastSynced: '09:41', people, projects, reviews, current, previous,
  completed: sum(current), previousCompleted: sum(previous),
  changePercent: Math.round((sum(current) / sum(previous) - 1) * 100),
  openTasks: sum(projects.map(project => project.tasks)), inReview: reviews.length,
  reviewProjects: new Set(reviews.map(review => review.project)).size,
};
