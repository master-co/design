import type { SiteApp } from '@master/internal-site/config'
import Logotype from './components/DesignLogotype.svelte'
import { primaryNavs, communityNavs } from './navigation'
export default {
  name: 'Master Design', brandURL: 'https://master.co/brand',
  sourceBaseURL: 'https://github.com/master-co/design/blob/main/',
  feedbackURL: 'https://github.com/master-co/design/issues/new?template=documentation.yml',
  navs: primaryNavs, communityNavs, header: { communityNavs, searchOnHome: true }, versions: [], Logotype,
} satisfies SiteApp
