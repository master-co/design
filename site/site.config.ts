import { defineSite } from '@master/internal-site/config'
import translations from './i18n/translations'
const sections = ['home', 'principles', 'accessibility', 'foundations', 'components', 'patterns', 'craft']
const categories = new URL('./.categories/guide.json', import.meta.url)
const document = { layout: new URL('./layouts/Doc.astro', import.meta.url), dictionaries: new URL('./dictionaries.ts', import.meta.url), categories }
export default defineSite({
  id: 'design', name: 'Master Design', origin: process.env.PUBLIC_URL || 'https://design.master.co',
  content: new URL('./content/', import.meta.url), app: new URL('./app-config.ts', import.meta.url),
  i18n: { defaultLocale: 'en', locales: ['en'], hreflangOfLocale: { en: 'en' }, nameOfLocale: { en: 'English' }, localizablePathnameRoots: sections.filter(name => name !== 'home'), translations },
  sections: { ...Object.fromEntries(sections.map(name => [name, new URL('./sections/guide.astro', import.meta.url)])), page: new URL('./sections/guide.astro', import.meta.url) },
  navigation: { guide: categories },
  documents: Object.fromEntries(sections.map(name => [name, document])),
  styles: { site: new URL('./styles/site.ts', import.meta.url) },
})
