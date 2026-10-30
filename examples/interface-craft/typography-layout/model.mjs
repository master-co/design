export const samples = {
  'zh-TW': { name: 'Traditional Chinese', family: 'Noto Sans TC', label: '專案進度', mixed: '專案Alpha已完成24項', punctuation: '「介面設計」，從細節開始。', wrap: '請先確認這個專案InterfaceCraft的設定，再繼續編輯。', edit: '編輯', status: '進行中', before: '請先', after: '資料，再儲存。', word: '編輯', fontLabel: '漢字 Ag 24' },
  en: { name: 'English', family: 'Geist', label: 'Project status', mixed: 'Project Alpha has 24 tasks', punctuation: '“Interface craft,” one detail at a time.', wrap: 'Interface craft brings text, icons and controls into a clear relationship.', edit: 'Edit', status: 'Active', before: 'Please ', after: ' the details before saving.', word: 'edit', fontLabel: 'Ag Hx 24' },
  ja: { name: 'Japanese', family: 'Noto Sans JP', label: 'プロジェクト', mixed: 'プロジェクトAlphaは24件完了', punctuation: '「画面設計」、細部から整える。', wrap: '小さなアイコンサイズをチェックし、操作と文字の関係を整えます。', edit: '編集', status: '進行中', before: '先に', after: 'してから保存します。', word: '編集', fontLabel: '漢字 かな Ag 24' },
  ko: { name: 'Korean', family: 'Noto Sans KR', label: '프로젝트 상태', mixed: '프로젝트 Alpha 작업 24개', punctuation: '“인터페이스 설계”, 작은 부분부터.', wrap: '인터페이스 설계는 글자와 아이콘 그리고 조작 요소 사이의 관계를 다듬는 일입니다.', edit: '편집', status: '진행 중', before: '먼저 정보를 ', after: '한 다음 저장하세요.', word: '편집', fontLabel: '한글 Ag 24' },
  'zh-CN': { name: 'Simplified Chinese', family: 'Noto Sans SC', label: '项目进度', mixed: '项目Alpha已完成24项', punctuation: '「界面设计」，从细节开始。', wrap: '请先确认这个项目InterfaceCraft的设置，再继续编辑。', edit: '编辑', status: '进行中', before: '请先', after: '资料，再保存。', word: '编辑', fontLabel: '汉字 Ag 24' },
};
export const localeIds = Object.keys(samples);
export const kinds = ['avatar', 'thumbnail', 'icon', 'badge', 'count', 'button', 'checkbox', 'radio', 'switch', 'input', 'select'];
export const boardSpecs = [
  { id: 'C1', title: 'A frame is not the visible face', note: '24 px type / 40 px line height. The same metrics can carry different visible proportions.', topic: 'typography' },
  { id: 'C2', title: 'Give each kind of spacing its own job', note: 'Each pair changes one property. Existing spaces are not removed. Punctuation trimming is progressive.', topic: 'typography' },
  { id: 'C3', title: 'Choose breaks for the language', note: 'Within each pair: identical text, font and 240 px measure. Only the wrapping rule changes.', topic: 'typography' },
  { id: 'R1', title: 'Move the footprint, or only the paint?', note: '24 px text + 36 px button. Negative block margins change the footprint; translation keeps the row tall.', topic: 'layout' },
  { id: 'R2', title: 'Let the action cell use the spare space', note: '24 px line + 8 px cell padding = 40 px. A 36 px control fits with 2 px action-cell padding.', topic: 'layout' },
  { id: 'R3', title: 'An inline object participates in the line', note: 'Same words and 36 px control. Margins and baseline alignment interact with the surrounding line box.', topic: 'layout' },
];
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
