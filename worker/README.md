# Robert Hunter — agent endpoint (A2A + MCP)

A single zero-dependency Cloudflare Worker that lets agents discover and query
the celebration. It serves the same event data three ways:

| Path | Protocol | For |
| --- | --- | --- |
| `/.well-known/agent-card.json` | **A2A** Agent Card | agents discovering what this can do |
| `/a2a` | **A2A** JSON-RPC (`message/send`) | natural-language Q&A |
| `/mcp` | **MCP** Streamable HTTP JSON-RPC | Claude & other MCP clients (`tools/list`, `tools/call`) |
| `/events.json` | plain JSON | anything that just wants the raw data |

Answers are computed from a hardcoded copy of the event data — **no LLM call, no
API keys** — so it stays inside the Cloudflare Workers **free** plan
(100k requests/day; this will use a tiny fraction of that).

## Deploy

```sh
cd worker
npm install
npx wrangler login          # opens browser; or set CLOUDFLARE_API_TOKEN
npx wrangler deploy
```

After deploy it lives at `https://roberthunter-agent.<your-subdomain>.workers.dev`.
To put it on your own domain instead, uncomment the `routes` block in
`wrangler.toml` (a subdomain like `agent.creativeworldsofroberthunter.com` is
also free on your existing Cloudflare zone).

## Test it

```sh
BASE=https://roberthunter-agent.<your-subdomain>.workers.dev

# A2A discovery
curl $BASE/.well-known/agent-card.json

# A2A question
curl -s $BASE/a2a -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":1,"method":"message/send",
  "params":{"message":{"role":"user","kind":"message","messageId":"1",
  "parts":[{"kind":"text","text":"when is the poetry night and is it free?"}]}}}'

# MCP: list tools
curl -s $BASE/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":1,"method":"tools/list"}'

# MCP: call a tool
curl -s $BASE/mcp -H 'content-type: application/json' -d '{
  "jsonrpc":"2.0","id":2,"method":"tools/call",
  "params":{"name":"get_event","arguments":{"query":"garcia"}}}'
```

## Connect from Claude (MCP)

Add the deployed `/mcp` URL as a custom connector, e.g.:

```json
{ "mcpServers": { "robert-hunter": { "url": "https://roberthunter-agent.<sub>.workers.dev/mcp" } } }
```

## Keeping data in sync

Event details live in `src/index.js` (`FESTIVAL` / `EVENTS` / `HOSTS`) and mirror
the schema.org JSON-LD in the site's `index.html`. Update both when details
change, or later refactor to a shared JSON file both read from.
