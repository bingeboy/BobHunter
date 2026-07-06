# Creative Wor(l)ds of Robert Hunter: A Celebration 🌹

A little microsite for a big-hearted weekend in Portland, Oregon — **September 24–26**, honoring Robert Hunter (Grateful Dead lyricist, poet, muse amplifier, maker of the new American Songbag) on the seventh anniversary of his passing.

Three days of poetry, live music, and songwriter stories, bringing together Hunter heads to explore what's been sung on repeat — while we sing all that is still unsung.

## The Events

**Thursday, Sept 24 — Robert Hunter's Garden: The Poems**
Kennedy School Theater · Doors 6:00 pm · Show 7:00–9:30 pm
A poetry reading of Hunter's literary work — *Night Cadre*, *Glass Lunch*, *Sentinel*, *Infinity Minus Eleven*, his Rilke *Duino Elegies* translation, and the lost memoir *Silver Snarling Trumpet* — plus a presentation on his creative lineage, a screening of Hunter reading, and a bookfair. *Check back for ticket info.*

**Friday, Sept 25 — Garcia Birthday Band**
Sanctuary Hall · Doors 7:00 pm · Show 8:00 pm
Live sets of Hunter songs from the Garcia Birthday Band, a local favorite known to sell out shows. *Check back for ticket info.*

**Saturday, Sept 26 — The Golden Afternoon: Hunter's Songwriting Magic**
Laurelthirst Tavern · 1:00–3:00 pm
Songwriters share the Hunter songs and stories closest to their hearts. *Free — donations warmly accepted.*

## Your Hosts

**Katherine Factor** — editor, book coach, and author of four Choose Your Own Adventures. Her debut poetry book, *A Sybil Society*, won the Interim Poetics Test Site Poetry Prize. Iowa Writers' Workshop grad; heard on KBOO and WFMU.

**Darrin Daniel** — publisher of Cityful Press and poetry editor of *Emergency Horse*. Studied under Allen Ginsberg, Harry Smith, and Robert Hunter at Naropa University, and published Hunter's poetry chapbook *Infinity Minus Eleven*.

## The Site

This is a single-page static site — just open `index.html` in a browser, or serve it locally:

```sh
npx serve .
```

- `index.html` — the microsite (designed with Claude)
- `docs/copy-deck-production.md` — the copy deck the site content comes from
- `llms.txt` — clean markdown map of the event for LLMs / assistants
- `robots.txt`, `_headers` — crawler + no-index controls (see below)

## For agents & search engines

The site carries a machine-readable layer so assistants, agents, and search
engines can understand it without scraping the visual page:

- **schema.org `Festival` + `Event` JSON-LD** in `index.html` — the three
  events with dates, venues, times, performers, and ticket status.
- **`llms.txt`** — an LLM-friendly summary of the whole event.
- **Open Graph / Twitter Card** meta for rich link previews.

These work today for any agent given the URL directly. Note: real **A2A** or
**MCP** support (an agent that *answers questions* or *checks tickets*) needs a
running server, not a static file — that's a separate build if we want it.

## Going to production

Discovery is intentionally **off** while we're on the dev subdomain. The prod
cutover is:

1. Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`.
2. Delete the `X-Robots-Tag` block in `_headers`.
3. Replace `robots.txt` with an allow rule (open it to crawlers / AI bots).
4. Add a `1200×630` share image and point `og:image` / `twitter:image` at it.
5. Map the apex domain `creativeworldsofroberthunter.com` in Cloudflare Pages.

No build step, no dependencies. Long may the song be sung. 🎶
