# Reviewed forward-test evidence

Two agents began with fresh conversation contexts and separate directories. Each received the frozen installed skill, one original HTML fixture, and a task describing the intended refinement. They received neither the article nor an expected repair list. They worked independently. The frozen skill-file hashes and unchanged before-fixture hashes are in [provenance.json](provenance.json).

| Test | Task | Result |
| --- | --- | --- |
| [Brand preservation](brand/output/report.md) | Refine a compact existing dispatch interface, retaining its brand and behavior. | Preserved teal/ivory/amber, Georgia/system type and four-pixel corners. Removed the doubled seam and stabilized state feedback. All 28 recorded checks passed. |
| [Explicit Aron preferences](aron/output/report.md) | Refine local numeric controls and disclosure using the selected preferences. | Preserved Arial and content, stabilized changing figures, separated states and made reversal continuous. All 31 check groups passed. |

The implementation and matched before/after screenshots were reviewed at rendered size. The reports record actual browsers, platform-specific keyboard behavior and limits. Browser tests were rerun against the retained fixture implementations. Only the retained browser scripts' absolute Playwright imports were replaced with the repository dependency so the evidence can be reproduced here.

The numeric test exposed a useful failure mode: Arial's numeric kerning changes a complete clock string even when digit advances are equal. Typography guidance was expanded to require checking actual strings and applying any kerning adjustment only to the numeric run. The agent's implementation already contained that adjustment; its affected checks were rerun successfully. No new agent run is claimed for this editorial addition.

```sh
bun run test:forward
```

These reports test the skill's use in two bounded tasks. They do not establish universal design quality, accessibility certification, or hardware/assistive-technology coverage. Do not rewrite agent-reported measurements as the author's personal experience.


After the original forward tests, user review of the actual dashboard exposed visual regressions during native-control conversion. The installed guidance now explicitly covers baseline preservation, browser defaults and target geometry. The affected real dashboard was retested with the source comparison in `scripts/dashboard-check.mjs`; no additional independent-agent run is claimed for that guidance change. Original frozen hashes above remain unchanged.
