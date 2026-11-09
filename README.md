# Nilaha

A mobile-first support-access prototype with an everyday calculator interface. The interface uses one mobile layout, capped at 600px, with matching dark support and counselling pages.

## Prototype status

This is a demonstration, not a live support or emergency service. Requests are **not sent, saved, or monitored**. Counselling entries are illustrative and are not verified providers. Use fictional details only.

The four-digit demo codes are hard-coded and visible in the source. They demonstrate navigation only, not authentication or confidentiality. Client-side attempt limiting resets on reload. Do not use this version for survivor information.

## Run locally

Requires Python 3; there is no build step or JavaScript dependency installation.

```sh
python3 -m http.server 4173
```

Open http://localhost:4173.

## Try the demo

1. Use the calculator for basic arithmetic, decimals, percentages, sign changes and backspace.
2. Tap the keyboard key to switch to PIN entry.
3. Enter `2580`, then `=` to open the support request form.
4. Enter `1379`, then `=` to open the counselling directory.
5. Use Back to calculator or Escape to exit. Switching tabs also resets to the calculator.

Requests allow selection of phone, SMS or WhatsApp and a safe contact time. No team dashboard or in-app reply system is included.

## Hostinger deployment

1. Add the new domain to your hosting plan and connect its DNS using the values provided in Hostinger.
2. Upload these six public files to that website's document root (usually `public_html`):
   - `index.html`
   - `style.css`
   - `app.js`
   - `sw.js`
   - `manifest.webmanifest`
   - `icon.svg`
3. Enable HTTPS and test the site on mobile.

No Node.js server, database or build command is required. Do not upload local environment files, Git metadata or Vercel account configuration. `vercel.json` is optional configuration for Vercel and is not used by Hostinger.

The service worker caches public application assets only. External fonts have local fallbacks. Home-screen installation and offline behavior require device testing; the manifest currently supplies an SVG icon only.

## Before a real pilot

Implement user-selected credentials, server-enforced authentication and throttling, secure request delivery, provider verification, consent and retention rules, and safeguarding review. Discreet appearance does not guarantee that app use is undetectable on a shared or monitored device.

## Open source and privacy

Licensed under the MIT licence in [LICENSE](LICENSE). The licence covers the software; personal information, access credentials and case records must never be committed to this repository.
