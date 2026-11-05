# ADAH manual verification checklist

Use this checklist on the Cloudflare branch preview before requesting production release. These checks are not marked passed until a person runs them in a browser.

## Navigation and language
- [ ] Open the home page in Arabic; confirm RTL layout and brand marks remain correctly oriented.
- [ ] Switch to English; confirm LTR layout and that the preference survives a reload.
- [ ] Visit every navigation, footer, help, about, legal, learning, resources and services link.
- [ ] Confirm unavailable categories do not lead to empty or misleading pages.

## Search and tools
- [ ] Confirm the home page advertises 13 tools and that the visible cards match the implemented tool IDs in `app.js`.
- [ ] Search for Arabic text with and without tashkeel, hamza variants and taa marbuta; verify expected matching without unrelated matches.
- [ ] Open every tool from its card and direct `?tool=` link; verify closing and reopening does not retain stale object URLs or output state.
- [ ] Switch language on the home page and each content page; inspect dynamic validation, toast and error messages as well as static labels.
- [ ] Open each tool after switching to English; confirm labels, placeholders, select options, notices and dynamically inserted modal content are translated.
- [ ] Switch back to Arabic and confirm the original Arabic text and RTL layout are restored without mixed-language fragments.
- [ ] Search by Arabic title, Arabic partial term and English term.
- [ ] Confirm empty results are explained and clearing search restores results.
- [ ] Exercise every tool with valid, empty, malformed and boundary inputs.
- [ ] Calculator: test integers, decimals, leading decimals, negative values, parentheses, percentages, division by zero and malformed expressions.
- [ ] Line organizer: test LF and CRLF files, empty lines, duplicate lines, Arabic sorting and text with trailing spaces.
- [ ] Global search: verify Learning, Resources and Services pages appear alongside all 13 tools.
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
