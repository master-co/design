/**
 * Aronrepo checks commit messages here; it does not release this repository.
 * Releases stay with `scripts/release.mjs` and `.github/workflows/release.yml`, which ship
 * only the `skills/master-design` folder, so that folder is the only release path.
 *
 * @type {import('aronrepo').AronrepoConfig}
 */
export default {
  release: {
    mode: 'explicit',
    paths: {
      include: ['skills/master-design/**']
    }
  }
}
