# Ongoing-content scope revision — 2026-11-15

At the owner's request, remove WCAG 2.2.2 (Pause, Stop, Hide) from the active guide's requirements. Remove its ongoing-motion and automatic-update conditions from motion, accessibility, notifications and media guidance, including the carousel-specific pause requirement. Retain reduced-motion preferences, manual sequence navigation, content time limits (2.2.1), audio controls (1.4.2) and flashing conditions (2.3.1).

The local timing specimen now demonstrates session warning, extension, retained drafts after expiry, resumption and manual slides. Its independent-update pause controls and matching behavioral assertions have been removed. The existing section anchors remain stable for installed references and site links.

The original audit, implementation plan, evidence report and runtime manifest remain historical records. Their 55-criterion map and original closure claims are not a claim of complete coverage by the revised guide; this removal does not change the external standard.

## Verification

- `bun run check`: all 72 tests passed, including canonical links and packaging boundaries.
- `bun run check:site`: no type errors or warnings; all eight site tests passed.
- `bun run build:site`: 58 pages built successfully.
- `SITE_TEST_SECTION=expansion bun run test:site`: all 17 check groups passed in Chromium 153.0.8010.12 and WebKit 26.6, including the remaining timing behaviors and no-JavaScript fallback.
- Focused timing inspection passed in both engines at 1280px and 320px, in light and dark appearances with reduced motion. Verified keyboard slide activation, reset, absence of removed controls, no runtime errors and no horizontal overflow. Reviewed ordinary light and narrow dark captures; remaining controls and labels fit their stage.

Logs, the focused inspection script and screenshots are under ignored `artifacts/wcag-scope*`. Real assistive-technology speech and physical-device checks were not run. These implementation checks preceded the separately authorized 0.3.6 release preparation.
