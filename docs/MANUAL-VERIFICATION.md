# ADAH manual verification checklist

Use this checklist on the Cloudflare branch preview before requesting production release. These checks are not marked passed until a person runs them in a browser.

## Navigation and language
- [ ] Open the home page in Arabic; confirm RTL layout and brand marks remain correctly oriented.
- [ ] Switch to English; confirm LTR layout and that the preference survives a reload.
- [ ] Visit every navigation, footer, help, about, legal, learning, resources and services link.
- [ ] Confirm unavailable categories do not lead to empty or misleading pages.

## Search and tools
- [ ] Search by Arabic title, Arabic partial term and English term.
- [ ] Confirm empty results are explained and clearing search restores results.
- [ ] Exercise every tool with valid, empty, malformed and boundary inputs.
- [ ] Confirm copy, clear and download controls give accurate feedback.
- [ ] For file-based tools, confirm the browser does not upload selected files.
- [ ] Test on a secure context for Web Crypto-dependent functions.

## Responsive and accessibility
- [ ] Test narrow Android viewport, tablet and desktop widths.
- [ ] Navigate with keyboard only and verify visible focus.
- [ ] Check labels, accessible names, contrast, zoom and reduced-motion preference.
- [ ] Confirm dialogs can be closed and focus is restored.

## Offline and release
- [ ] Load once online, then test the documented offline pages.
- [ ] Confirm a service-worker update replaces old cached assets.
- [ ] Inspect browser console and network failures.
- [ ] Verify privacy/legal text reflects actual implemented behavior.
- [ ] Do not deploy until all required checks pass and the owner approves.
