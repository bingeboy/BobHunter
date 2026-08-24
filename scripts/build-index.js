#!/usr/bin/env node
/*
 * build-index.js — rebuild public/index.html from src/index.template.html
 *
 * The page content lives inside the bundle's <script type="__bundler/template">
 * as a JSON-encoded HTML string. `src/index.template.html` is the readable
 * source for that content; this script encodes it back into the bundle,
 * preserving everything else in public/index.html (loader, manifest, JSON-LD).
 *
 * Encoding rule (do NOT change): JSON-encode the HTML, then rewrite every
 * closing-tag "</" as "</". Dropping the "<" here is exactly what took
 * the site down once — the round-trip guard below makes that impossible to ship.
 *
 * Usage:
 *   node scripts/build-index.js          # rebuild public/index.html from src
 *   node scripts/build-index.js --check  # verify public matches src; exit 1 on drift (no write)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'index.html');
const SRC = path.join(ROOT, 'src', 'index.template.html');
const MARKER = '<script type="__bundler/template">';
const CHECK = process.argv.includes('--check');

function fail(msg) { console.error('build-index: ' + msg); process.exit(1); }

const shell = fs.readFileSync(OUT, 'utf8');
const html = fs.readFileSync(SRC, 'utf8');

const open = shell.indexOf(MARKER);
if (open < 0) fail('template marker not found in public/index.html');
const bodyStart = open + MARKER.length;
const bodyEnd = shell.indexOf('</script>', bodyStart);
if (bodyEnd < 0) fail('template closing </script> not found');
const body = shell.slice(bodyStart, bodyEnd);
const lead = body.slice(0, body.length - body.trimStart().length);
const trail = body.slice(body.trimEnd().length);

// Correct encoder.
const encoded = JSON.stringify(html).split('</').join('<\\u002F');

// Guard 1 — round-trip must reproduce the source byte-for-byte.
if (JSON.parse(encoded) !== html) fail('round-trip mismatch — encoder produced malformed output');

const out = shell.slice(0, bodyStart) + lead + encoded + trail + shell.slice(bodyEnd);

// Guard 2 — re-extract, decode, and confirm structure is intact.
const ns = out.indexOf(MARKER) + MARKER.length;
const ne = out.indexOf('</script>', ns);
const redecoded = JSON.parse(out.slice(ns, ne).trim());
if (redecoded !== html) fail('spliced re-decode mismatch');
if (!/<\/head>/.test(redecoded) || !/<\/body>/.test(redecoded)) fail('decoded HTML missing </head> or </body>');
if (/[^<]\/(head|body|script)>/.test(redecoded)) fail('malformed closing tag detected (a "<" was dropped)');

if (CHECK) {
  if (out !== shell) fail('public/index.html is out of sync with src/index.template.html — run `node scripts/build-index.js`');
  console.log('build-index: --check OK, public/index.html is in sync with src');
  process.exit(0);
}

if (out === shell) {
  console.log('build-index: no changes (public/index.html already up to date)');
} else {
  fs.writeFileSync(OUT, out, 'utf8');
  console.log('build-index: wrote public/index.html (' + out.length + ' bytes)');
}
