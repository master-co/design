import IconBrandGithub from '@tabler/icons-svelte-runes/icons/brand-github'
export const primaryNavs = [
  { name: 'Principles', href: '/principles' },
  { name: 'Foundations', href: '/foundations/color' },
  { name: 'Patterns', href: '/patterns/forms' },
  { name: 'Master UI', href: 'https://ui.master.co' },
]
export const communityNavs = [{ name: 'GitHub', href: 'https://github.com/master-co/design', Icon: IconBrandGithub }]
export const footerProps = { navGroups: [
  { name: 'Guide', links: [{ name: 'Accessibility', href: '/accessibility' }, { name: 'Components', href: '/components/actions' }, { name: 'Craft', href: '/craft/surfaces' }] },
  { name: 'Master', links: [{ name: 'Master UI', href: 'https://ui.master.co' }, { name: 'Master CSS', href: 'https://css.master.co' }, { name: 'Master', href: 'https://master.co' }] },
  { name: 'Resources', links: [{ name: 'Source and skill', href: 'https://github.com/master-co/design' }, { name: 'Markdown index', href: '/llms.txt' }, { name: 'MIT License', href: 'https://github.com/master-co/design/blob/main/LICENSE' }] },
] }
