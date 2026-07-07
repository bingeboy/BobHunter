# Creative Wor(l)ds of Robert Hunter: A Celebration 🌹

A small site for a big-hearted weekend in Portland, Oregon — September 24–26 
Honoring Grateful Dead lyricist and American poet Robert Hunter

Three days of poetry, live music, and songwriter stories, bringing “Hunter heads” together to enjoy what's been sung on repeat — while we explore all that is still unsung.


## Events
**Thursday Sept 24** 
Robert Hunter’s Garden: The Poems   McMennimnen's Kennedy School Theater   Doors 6:00 pm  Show 7:00 - 9:30 pm

Poetry reading of Robert Hunter’s literary work, showcasing his poetry, translation, and lost memoir: Night Cadre, Glass Lunch, Sentinel,  Infinity Minus Eleven, and Rainier Marie Rilke’s Duino Elegies, and Silver Snarling Trumpet. Presentation on the work that influenced Hunter’s creative lineage with writers and scholars. Screening of Hunter reading; Bookfair. 
_Check back for ticket information._

**Friday, Sept. 25**
Garcia Birthday Band     Sanctuary  Hall     Doors  7 :00 pm    Show  8:00 pm 
Live sets of Hunter songs by the  Garcia Birthday Band, a local and regionally popular cover band known to sell out shows.
_Check back for ticket information._

**Saturday Sept. 26**
The Golden Afternoon: Hunter's Songwriting Magic   Laurelthirst Tavern  Show 1:00 pm -3:00 pm 
Songwriters share Hunter songs and stories close to their hearts.  
_Admission: Free: Donations warmly accepted._


## About

_Guests and speakers forthcoming.Please check back!_

Join us this September 24th-26th — for the seventh anniversary of  Robert Hunter’s passing— to honor the American national treasure. We’ll pay tribute to the great Robert Hunter through poetry readings, deep dives into his creative influences, rousing live music, and intimate reflections from songwriters.

When one speaks the name “Robert Hunter,” it rings sweetly to those whose lives were shaped by his words. Robert Hunter. Grateful Dead lyricist.  Poet, muse amplifier, maker of the new American Songbag. Enigma to many, troubadour to all. Though he lived a life opaque to us, he nevertheless intimately alchemized the hearts of deadheads—shaping its culture into a national treasure. His songs are responsible for millions of life milestones, business names, lovers and sordid heartbreaks. His words charged internal illuminations, responsible for a spectrum of Americana to personal ecstatics. 

**Hotels and Partners**
The snazzy Hotel Zags is offering standard and king rooms downtown at a discounted rate of $99. 
McMennimens Kennedy School is offering a 10% discount off rooms. 

**Your Hosts**
Katherine Factor is an editor, book coach, and author of four Choose Your Own Adventures. Her debut poetry book, A Sybil Society, won the Interim Poetics Test Site Poetry Prize. She’s a graduate of the Iowa Writers’ Workshop and has appeared at the Oregon Country Fair, Azoth space, with the band Catal Hyuk, and at the University of San Diego, Miami Book Festival, Mission Creek Music & Arts Festival, the Brautigan Library, and in libraries and schools across America. 


Darrin  Daniel is a Eugene native and the publisher of Cityful Press and the poetry editor for the arts & literary magazine, Emergency Horse. He was a student of Allen Ginsberg, Harry Smith, and Robert Hunter while studying poetry and literature at Naropa University. He’s authored, edited, and/or published Think of the Self Speaking: Selected Interviews of Harry Smith),  Dark Music by Gordon Ball, work on Stan Brakhage and Robert Hunter’s poetry chapbook, Infinity Minus Eleven. Daniel interviewed Robert Hunter in 1993.


## The Site

A single-page static site. The web root is `public/` — serve it locally with:

```sh
npx serve public
```

- `public/index.html` — the microsite (designed with Claude)
- `public/llms.txt` — clean markdown map of the event for LLMs / assistants
- `public/robots.txt`, `public/sitemap.xml` — crawler directives + sitemap
- `public/imgs/` — image assets (incl. the social share image)
- `docs/copy-deck-production.md` — the copy deck the site content comes from
- `worker/` — optional A2A + MCP agent endpoint (separate Cloudflare Worker)

## Deploying

Served by a Cloudflare **Worker** (`bob-hunter`) with static assets, connected
to this repo. Single environment — every push to `main` auto-deploys to
production. There is no separate dev site.

- **Build command:** _(none)_
- **Deploy command:** `npx wrangler deploy`
- **Assets directory:** `public`

HTTPS is automatic and free (Cloudflare Universal SSL, auto-renewing).

## For agents & search engines

The site carries a machine-readable layer so assistants, agents, and search
engines can understand it without scraping the visual page:

- **schema.org `Festival` + `Event` JSON-LD** in `public/index.html` — the three
  events with dates, venues, times, performers, and ticket status.
- **`llms.txt`** — an LLM-friendly summary of the whole event.
- **Open Graph / Twitter Card** meta for rich link previews.

These work today for any agent given the URL directly. Note: real **A2A** or
**MCP** support (an agent that *answers questions* or *checks tickets*) needs a
running server, not a static file — that's a separate build if we want it.

## Status

**Live and public** at <https://creativeworldsofroberthunter.com> — open to
search engines and AI crawlers (`robots.txt` allows all, `sitemap.xml`
published, no noindex). Social preview image is `public/imgs/hunter_trio.jpeg`
(swap in a 1200×630 version anytime for sharper link cards).

No build step, no dependencies. Long may the song be sung. 🎶
