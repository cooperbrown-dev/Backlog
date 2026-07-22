/* ==========================================================================
   Backlog — Learning Roadmap · shared logic
   Loaded as a classic script (works over file://; ES modules don't) so it
   attaches one global: window.Roadmap.

   It owns:
   - the checklist DATA (single source of truth for tracker + dashboard)
   - progress math
   - localStorage persistence (so ticks survive refresh & sync across tabs)
   - the light/dark theme toggle
   ========================================================================== */
(function () {
  "use strict";

  var STORE = "backlog-roadmap-progress-v1";
  var THEME = "backlog-theme";

  /* ---- The plan --------------------------------------------------------
     Mirrors Part 6 of the roadmap (Sessions 0–4). Each item has a stable id
     and optional `done:true` to SEED initial state — Sessions 0 & 1 are
     complete per the md. Multi-line code lives in reading.html, not here;
     the tracker stays a checklist, with only the short commands inline.     */
  var sessions = [
    {
      id: "s0", title: "Session 0 — Tooling & scaffold", time: "1–2 hrs",
      blurb: "Get both apps running side by side.",
      checkpoint: "Two apps run independently.",
      groups: [
        {
          label: "Install",
          items: [
            { id: "s0-dotnet",  done: true, title: "<b>.NET 10 SDK</b> — verify <code>dotnet --version</code>" },
            { id: "s0-node",    done: true, title: "<b>Node LTS</b> — verify <code>node --version</code>" },
            { id: "s0-ionic",   done: true, title: "<b>Ionic CLI</b> — <code>npm install -g @ionic/cli</code>" },
            { id: "s0-ef",      done: true, title: "<b>EF Core CLI</b> — <code>dotnet tool install --global dotnet-ef</code>" },
            { id: "s0-pg",      done: true, title: "<b>PostgreSQL running locally</b>", note: "Recommended: Docker — <code>docker run --name backlog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=backlog -p 5432:5432 -d postgres:17</code>. Homebrew works too (its default login is your macOS user, no password)." },
            { id: "s0-viewer",  done: true, title: "<b>A Postgres viewer</b> (pgAdmin, DBeaver, TablePlus) → connect to <code>localhost:5432</code>, db <code>backlog</code>" }
          ]
        },
        {
          label: "Scaffold the backend",
          items: [
            { id: "s0-webapi", done: true, title: "<code>dotnet new webapi --use-controllers -o Backlog.Api</code>", note: "<code>--use-controllers</code> matters — .NET 10 defaults to minimal APIs; controllers mirror Anchovy's Function layer." },
            { id: "s0-cd",     done: true, title: "<code>cd Backlog.Api</code>" },
            { id: "s0-npgsql", done: true, title: "<code>dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL</code>" },
            { id: "s0-design", done: true, title: "<code>dotnet add package Microsoft.EntityFrameworkCore.Design</code>" },
            { id: "s0-run",    done: true, title: "<code>dotnet run</code> → note the HTTP port in <code>Properties/launchSettings.json</code>" }
          ]
        },
        {
          label: "Scaffold the frontend",
          items: [
            { id: "s0-start", done: true, title: "<code>ionic start backlog blank --type=angular</code> → choose <b>Standalone</b>" },
            { id: "s0-serve", done: true, title: "<code>cd backlog &amp;&amp; ionic serve</code> → opens on <code>http://localhost:8100</code>" }
          ]
        }
      ]
    },
    {
      id: "s1", title: "Session 1 — Backend data layer", time: "2–4 hrs",
      blurb: "Model → DbContext → migration → real Postgres tables.",
      checkpoint: "Your database and table exist, generated from your C# model.",
      groups: [
        {
          label: "Steps",
          items: [
            { id: "s1-enums",      done: true, title: "<b><code>Common/Enums/</code></b> — <code>Category</code> and <code>BacklogStatus</code> in their own folder" },
            { id: "s1-models",     done: true, title: "<b><code>Models/</code> — a type hierarchy</b>: <code>BacklogItem</code> → <code>MediaItem</code> → concrete <code>VideoGame / Movie / Show / Book / Vacation</code>", note: "EF maps this as Table-Per-Hierarchy (TPH): one table + a Discriminator column." },
            { id: "s1-dbcontext",  done: true, title: "<b><code>Data/BacklogDbContext.cs</code></b> — one <code>DbSet&lt;BacklogItem&gt;</code> (EF discovers the subtypes)" },
            { id: "s1-provider",   done: true, title: "<b>Switched the provider to Postgres</b> (Npgsql)" },
            { id: "s1-register",   done: true, title: "<b>Registered the DbContext in <code>Program.cs</code></b>, reading the connection string from config" },
            { id: "s1-migrations", done: true, title: "<code>dotnet ef migrations add InitialCreate</code> → creates a <code>Migrations/</code> folder" },
            { id: "s1-update",     done: true, title: "<code>dotnet ef database update</code> → creates the tables in Postgres" },
            { id: "s1-verify",     done: true, title: "Confirm the <code>BacklogItems</code> table exists in your viewer (with a <code>Discriminator</code> column)" }
          ]
        }
      ]
    },
    {
      id: "s2", title: "Session 2 — Backend layers + API", time: "2–4 hrs",
      blurb: "DTOs → Accessor → Manager → Controller. The whole backend.",
      checkpoint: "You can create and read items over HTTP. The whole backend is done.",
      groups: [
        {
          label: "Steps",
          items: [
            { id: "s2-dtos",       title: "<b><code>Dtos/BacklogDtos.cs</code></b> — the contracts the API speaks (separate from the entity — that separation <em>is</em> the lesson)" },
            { id: "s2-accessor",   title: "<b><code>Accessors/BacklogAccessor.cs</code></b> — EF queries + entity↔DTO mapping", note: "⚠️ Map <b>after</b> <code>ToListAsync()</code> — EF can't translate your C# <code>ToDto</code> into SQL." },
            { id: "s2-manager",    title: "<b><code>Managers/BacklogManager.cs</code></b> — orchestration (thin for now, on purpose)" },
            { id: "s2-controller", title: "<b><code>Controllers/BacklogItemsController.cs</code></b> — HTTP entry (mirrors <code>RecipeFunction.cs</code>)" },
            { id: "s2-di",         title: "<b>Wire DI + CORS in <code>Program.cs</code></b> — register accessor + manager, allow <code>http://localhost:8100</code>" },
            { id: "s2-test",       title: "<b>Test without the frontend</b> — POST one item, then GET the list via the <code>.http</code> file or <code>curl</code>" }
          ]
        }
      ]
    },
    {
      id: "s3", title: "Session 3 — Frontend: show your list", time: "2–4 hrs",
      blurb: "Service → signal store → a page with three status groups.",
      checkpoint: "Add an item → Backlog → Done, and it survives a refresh. The full loop, end to end.",
      groups: [
        {
          label: "Steps",
          items: [
            { id: "s3-http",     title: "<b>Turn on HttpClient</b> — add <code>provideHttpClient()</code> in <code>src/main.ts</code>" },
            { id: "s3-env",      title: "<b><code>src/environments/environment.ts</code></b> → set <code>apiBaseUrl</code> to your API port" },
            { id: "s3-models",   title: "<b><code>src/app/models/backlog.ts</code></b> — TS contracts mirroring your C# DTOs" },
            { id: "s3-service",  title: "<b><code>src/app/services/backlog.service.ts</code></b> — <code>HttpClient</code> → <code>Observable</code>" },
            { id: "s3-store",    title: "<b><code>src/app/stores/backlog.store.ts</code></b> — <code>signal()</code> + <code>computed()</code> groupings" },
            { id: "s3-pagets",   title: "<b><code>home.page.ts</code></b> — render the three groups", note: "⚠️ Every <code>&lt;ion-*&gt;</code> tag must be in the component's <code>imports</code> array." },
            { id: "s3-pagehtml", title: "<b><code>home.page.html</code></b> — <code>@for</code> / <code>@if</code> + signals in the template" }
          ]
        }
      ]
    },
    {
      id: "s4", title: "Session 4 — Polish the loop", time: "1–3 hrs", optional: true,
      blurb: "Optional niceties. Stop after Session 3 and you already have a real app.",
      checkpoint: null,
      groups: [
        {
          label: "Optional",
          items: [
            { id: "s4-start",  title: "Add a <b>“Start”</b> button (Backlog → Playing) alongside “Done”" },
            { id: "s4-rating", title: "Add a <b>1–5 rating</b> control on Done items (reuse <code>store.update</code>)" },
            { id: "s4-icon",   title: "Show the <b>type as an icon</b> (<code>ion-icon</code>: game-controller / film / book)" },
            { id: "s4-empty",  title: "<b>Empty-state</b> message when there are zero items total" }
          ]
        }
      ]
    }
  ];

  /* ---- Derived helpers -------------------------------------------------- */
  function itemsOf(session) {
    var out = [];
    session.groups.forEach(function (g) { g.items.forEach(function (it) { out.push(it); }); });
    return out;
  }
  function allItems() {
    var out = [];
    sessions.forEach(function (s) { out = out.concat(itemsOf(s)); });
    return out;
  }

  /* ---- Persistence ------------------------------------------------------ */
  // Seed = the done:true flags in the data. Used on first ever load and reset.
  function seedState() {
    var s = {};
    allItems().forEach(function (it) { s[it.id] = !!it.done; });
    return s;
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return seedState();
      var saved = JSON.parse(raw);
      // Merge: known ids win from saved; any new item falls back to its seed.
      var base = seedState();
      Object.keys(base).forEach(function (id) {
        if (Object.prototype.hasOwnProperty.call(saved, id)) base[id] = !!saved[id];
      });
      return base;
    } catch (e) { return seedState(); }
  }
  function save(state) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  var listeners = [];
  function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  function isDone(id) { return !!load()[id]; }
  function setDone(id, val) {
    var s = load(); s[id] = !!val; save(s); notify();
  }
  function resetAll() { save(seedState()); notify(); }

  // Sync when another tab changes progress.
  window.addEventListener("storage", function (e) { if (e.key === STORE) notify(); });

  /* ---- Progress math ---------------------------------------------------- */
  function countIds(ids) {
    var state = load(), done = 0;
    ids.forEach(function (id) { if (state[id]) done++; });
    var total = ids.length;
    return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  function sessionProgress(sessionId) {
    var s = sessions.filter(function (x) { return x.id === sessionId; })[0];
    if (!s) return { done: 0, total: 0, pct: 0 };
    return countIds(itemsOf(s).map(function (it) { return it.id; }));
  }
  function progressForSessions(sessionIds) {
    var ids = [];
    sessionIds.forEach(function (sid) {
      var s = sessions.filter(function (x) { return x.id === sid; })[0];
      if (s) ids = ids.concat(itemsOf(s).map(function (it) { return it.id; }));
    });
    return countIds(ids);
  }
  function overall() {
    // Exclude the optional Session 4 from the headline number so 100% means
    // "the real app is done", matching the roadmap's own framing.
    var core = sessions.filter(function (s) { return !s.optional; }).map(function (s) { return s.id; });
    return progressForSessions(core);
  }

  /* ---- Theme ------------------------------------------------------------ */
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME, t); } catch (e) {}
  }
  function initThemeToggle(btn) {
    if (!btn) return;
    function paint() { btn.textContent = currentTheme() === "dark" ? "☀" : "☾"; btn.setAttribute("aria-label", "Switch to " + (currentTheme() === "dark" ? "light" : "dark") + " theme"); }
    paint();
    btn.addEventListener("click", function () { applyTheme(currentTheme() === "dark" ? "light" : "dark"); paint(); });
  }

  window.Roadmap = {
    sessions: sessions,
    isDone: isDone,
    setDone: setDone,
    resetAll: resetAll,
    sessionProgress: sessionProgress,
    progressForSessions: progressForSessions,
    overall: overall,
    onChange: function (fn) { listeners.push(fn); },
    initThemeToggle: initThemeToggle
  };
})();
