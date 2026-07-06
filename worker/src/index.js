// Agent endpoint for "Creative Wor(l)ds of Robert Hunter: A Celebration".
// One zero-dependency Cloudflare Worker exposing the same event data over:
//   - A2A  (Agent Card at /.well-known/agent-card.json + JSON-RPC at /a2a)
//   - MCP  (Streamable HTTP JSON-RPC at /mcp)
//   - a plain /events.json for anything that just wants the data.
// Answers are deterministic (no LLM call), so it runs free on the Workers plan.

const FESTIVAL = {
  name: "Creative Wor(l)ds of Robert Hunter: A Celebration",
  location: "Portland, Oregon",
  startDate: "2026-09-24",
  endDate: "2026-09-26",
  about:
    "Honoring Grateful Dead lyricist and poet Robert Hunter (1941–2019) on the seventh anniversary of his passing — poetry readings, live music, and songwriter reflections.",
  website: "https://creativeworldsofroberthunter.com/",
};

const EVENTS = [
  {
    id: "poems",
    name: "Robert Hunter's Garden: The Poems",
    day: "Thursday",
    date: "2026-09-24",
    venue: "Kennedy School Theater",
    city: "Portland, OR",
    doors: "6:00pm",
    start: "7:00pm",
    end: "9:30pm",
    admission: "Ticket info to be announced",
    free: false,
    description:
      "A poetry reading of Hunter's literary work, a presentation on his creative lineage, a screening of Hunter reading, and a bookfair.",
  },
  {
    id: "garcia",
    name: "Garcia Birthday Band",
    day: "Friday",
    date: "2026-09-25",
    venue: "Sanctuary Hall",
    city: "Portland, OR",
    doors: "7:00pm",
    start: "8:00pm",
    end: null,
    admission: "Ticket info to be announced",
    free: false,
    performer: "Garcia Birthday Band",
    description:
      "Live sets of Hunter songs by the Garcia Birthday Band, a local and regionally popular cover band.",
  },
  {
    id: "golden-afternoon",
    name: "The Golden Afternoon: Hunter's Songwriting Magic",
    day: "Saturday",
    date: "2026-09-26",
    venue: "Laurelthirst Public House",
    city: "Portland, OR",
    doors: null,
    start: "1:00pm",
    end: "3:00pm",
    admission: "Free — donations warmly accepted",
    free: true,
    description: "Songwriters share Hunter songs and stories close to their hearts.",
  },
];

const HOSTS = [
  {
    name: "Katherine Factor",
    bio: "Editor, book coach, and poet (A Sybil Society); graduate of the Iowa Writers' Workshop.",
  },
  {
    name: "Darrin Daniel",
    bio: "Publisher of Cityful Press and poetry editor of Emergency Horse; studied under Robert Hunter at Naropa University.",
  },
];

// ---- shared helpers ---------------------------------------------------------

function eventLine(e) {
  const time = e.doors
    ? `doors ${e.doors}, show ${e.start}${e.end ? `–${e.end}` : ""}`
    : `${e.start}${e.end ? `–${e.end}` : ""}`;
  return `${e.day}, ${e.date} — ${e.name} at ${e.venue}, ${e.city}. ${time}. ${e.admission}.`;
}

function findEvent(query) {
  const q = (query || "").toLowerCase().trim();
  return (
    EVENTS.find((e) => e.id === q) ||
    EVENTS.find((e) => e.name.toLowerCase().includes(q) && q) ||
    (/(poe|garden|thursday)/.test(q) && EVENTS[0]) ||
    (/(garcia|music|band|friday|concert|live)/.test(q) && EVENTS[1]) ||
    (/(golden|songwrit|saturday|afternoon)/.test(q) && EVENTS[2]) ||
    null
  );
}

// Natural-language answering for the A2A skill.
function answer(text) {
  const t = (text || "").toLowerCase();
  if (/host|who.*(run|host)|organi[sz]|presenter/.test(t))
    return "Hosts: " + HOSTS.map((h) => `${h.name} (${h.bio})`).join(" ");
  // Match a specific event before the generic ticket branch — an event line
  // already states its own admission, so "when is the poetry night and is it
  // free?" is answered in full here rather than getting the all-events list.
  const e = findEvent(t);
  if (e && /(poe|garden|thursday|garcia|music|band|friday|golden|songwrit|saturday|afternoon)/.test(t))
    return eventLine(e) + " " + e.description;
  if (/ticket|cost|price|admission|free|how much/.test(t))
    return "Tickets: " + EVENTS.map((x) => `${x.name} — ${x.admission}`).join("; ") + ".";
  if (/where|venue|location|address|city/.test(t))
    return (
      "Venues (all in Portland, OR): " +
      EVENTS.map((x) => `${x.name} at ${x.venue}`).join("; ") +
      "."
    );
  if (/when|date|schedule|day/.test(t))
    return (
      `${FESTIVAL.name} runs ${FESTIVAL.startDate} to ${FESTIVAL.endDate} in ${FESTIVAL.location}. ` +
      EVENTS.map(eventLine).join(" ")
    );
  return (
    `${FESTIVAL.name}: ${FESTIVAL.about} ${FESTIVAL.location}, ${FESTIVAL.startDate}–${FESTIVAL.endDate}. ` +
    EVENTS.map(eventLine).join(" ")
  );
}

// ---- A2A --------------------------------------------------------------------

function agentCard(origin) {
  return {
    protocolVersion: "0.2.5",
    name: FESTIVAL.name,
    description: FESTIVAL.about,
    url: `${origin}/a2a`,
    preferredTransport: "JSONRPC",
    version: "1.0.0",
    provider: { organization: "Creative Wor(l)ds of Robert Hunter", url: FESTIVAL.website },
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: [
      {
        id: "event-info",
        name: "Event Information",
        description:
          "Answers questions about the Robert Hunter celebration: schedule, venues, times, tickets, hosts, and performers.",
        tags: ["events", "music", "poetry", "grateful dead", "robert hunter", "portland"],
        examples: [
          "When is the poetry night?",
          "Where is the Garcia Birthday Band playing?",
          "Are any events free?",
          "Who is hosting?",
        ],
      },
    ],
  };
}

function handleA2a(msg) {
  const { id, method, params } = msg || {};
  if (method === "message/send" || method === "message/stream") {
    const parts = params?.message?.parts || [];
    const text = parts
      .filter((p) => p.kind === "text" || p.type === "text")
      .map((p) => p.text)
      .join(" ");
    return {
      jsonrpc: "2.0",
      id,
      result: {
        role: "agent",
        parts: [{ kind: "text", text: answer(text) }],
        messageId: crypto.randomUUID(),
        kind: "message",
      },
    };
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}

// ---- MCP (Streamable HTTP) --------------------------------------------------

const MCP_TOOLS = [
  {
    name: "list_events",
    description: "List all events in the Robert Hunter celebration with dates, venues, and times.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_event",
    description:
      "Get details for one event by id (poems, garcia, golden-afternoon) or keyword (poetry, music, songwriter).",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Event id or keyword." } },
      required: ["query"],
    },
  },
  {
    name: "get_hosts",
    description: "Get the event hosts and their bios.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_festival_info",
    description: "Get an overview of the whole celebration (dates, location, about).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

function callTool(name, args) {
  args = args || {};
  if (name === "list_events") return { events: EVENTS };
  if (name === "get_hosts") return { hosts: HOSTS };
  if (name === "get_festival_info") return { festival: FESTIVAL };
  if (name === "get_event") {
    const e = findEvent(args.query);
    return e ? { event: e } : { error: "No matching event. Try 'poems', 'garcia', or 'golden-afternoon'." };
  }
  return { error: `Unknown tool: ${name}` };
}

function handleMcp(msg) {
  const { id, method, params } = msg || {};
  if (method === "initialize")
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "roberthunter-agent", version: "1.0.0" },
      },
    };
  if (method && method.startsWith("notifications/")) return null; // no response for notifications
  if (method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
  if (method === "tools/call") {
    const out = callTool(params?.name, params?.arguments);
    return {
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: JSON.stringify(out, null, 2) }], structuredContent: out },
    };
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}

// ---- HTTP plumbing ----------------------------------------------------------

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
};

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });
}

async function dispatch(request, handler) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400);
  }
  if (Array.isArray(body)) {
    const out = body.map(handler).filter(Boolean);
    return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
  }
  const out = handler(body);
  return out ? json(out) : new Response(null, { status: 202, headers: CORS });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.origin;

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === "/.well-known/agent-card.json" || url.pathname === "/.well-known/agent.json")
      return json(agentCard(origin));

    if (url.pathname === "/events.json")
      return json({ festival: FESTIVAL, events: EVENTS, hosts: HOSTS });

    if (url.pathname === "/a2a" && request.method === "POST") return dispatch(request, handleA2a);

    if (url.pathname === "/mcp") {
      if (request.method !== "POST")
        return new Response("MCP endpoint — POST JSON-RPC here.", {
          status: 405,
          headers: { ...CORS, Allow: "POST" },
        });
      return dispatch(request, handleMcp);
    }

    if (url.pathname === "/")
      return json({
        service: "Creative Wor(l)ds of Robert Hunter — agent endpoint",
        website: FESTIVAL.website,
        endpoints: {
          agentCard: `${origin}/.well-known/agent-card.json`,
          a2a: `${origin}/a2a (POST JSON-RPC — method: message/send)`,
          mcp: `${origin}/mcp (POST JSON-RPC — initialize, tools/list, tools/call)`,
          events: `${origin}/events.json`,
        },
      });

    return json({ error: "Not found" }, 404);
  },
};
