# Learning the Anchovy Stack — Personal Roadmap & "Backlog" MVP

> A self-study plan for learning the Anchovy tech stack (Angular 20 + Ionic frontend, .NET layered backend + EF Core) end-to-end by building a personal side project called **Backlog** — a personal backlog tracker (video games, movies, shows, books, and vacations) with status, ratings, notes, stats, and social features.
>
> **Guiding principle:** your side project and your day job teach each other. Read a pattern in the real Anchovy code → rebuild a simpler version in your project → that cements it → you get faster on tickets.
>
> **Stack philosophy:** *real where it teaches, simplified where it's just ceremony.* Keep Angular/Ionic patterns and the .NET layered architecture + EF Core (they transfer 1:1 to work); simplify the heavy infra (Azure Functions → ASP.NET Web API, SQL Server → PostgreSQL, DbUp → EF migrations, Auth0 → fake user first, skip Service Bus / Blob / Search / payments / native).

---

## Part 1 — The one mental model that anchors everything

Almost every feature in this stack is the *same loop*. Learn to build it once and the rest is repetition with variations:

```
[Angular Page]      recipe.page.ts          UI: signals, @if / @for
      │ calls
[Service]           recipe.service.ts       HttpClient → returns an Observable
      │  HTTP  GET /v1/recipes/{id}
══════╪═══════════════════ network ═══════════════════
[API entry]         RecipeFunction.cs       HTTP trigger → routes to a Manager
      │
[Manager]           RecipeManager.cs        orchestrates, maps DTOs, injects the current UserId
      │
[Accessor]          RecipeAccessor.cs       EF Core LINQ query
      │
[DbContext / DB]    DatabaseContext.cs      DbSet<Recipe> → SQL table
      ▲
   …response travels back up, getting re-mapped at each layer, and the page
   stashes it in a [Store] (recipe.store.ts) so other screens can reuse it.
```

Two things to burn in now (they're everywhere in this code):

- **Three tiers of "the same object."** A recipe exists as a *Client/API contract* → a *Common DTO* → an *EF database entity*, and it gets **mapped** between each (`Managers/DtoMapper.cs` does API↔DTO; `Accessors/Mapper.cs` does DTO↔entity). Feels redundant at first; the payoff is each layer can change independently.
- **Async all the way down.** Every method is `async Task<T>` and every call is `await`-ed, top to bottom. Skipping an `await` is a real bug, not a style choice.

---

## Part 2 — Your stack: keep what teaches, drop the ceremony

| Layer | At work (Anchovy) | Your side project | Why |
|---|---|---|---|
| Frontend UI | Angular 20 + Ionic, standalone + signals | **Same**, run in the browser | The patterns *are* the lesson — keep them 1:1 |
| Native shell | Capacitor (camera, push, IAP) | **Skip** (web only) | Pure ceremony for learning; add a Capacitor build later if curious |
| State store | `StoreBase` + `@ngrx/component-store` + immer | **Service with `signal()` + `computed()`** | Same idea, far less machinery — you'll recognize the real one |
| HTTP entry | Azure Functions (isolated) + Proxy | **ASP.NET Core Web API controller** | Identical job (HTTP→Manager), zero Azure tooling |
| Manager | `…Managers` + DtoMapper | **Same pattern**, your own class | Core architecture — keep |
| Engine | `…Engines` (format/enrich) | **Skip at first** | Only for heavy processing; add when a feature needs it |
| Accessor | `…Accessors` + AutoMapper | **Same pattern**, your own class | Core architecture — keep |
| ORM | EF Core | **EF Core** | Fully transferable, identical skill |
| Database | SQL Server + temporal tables + Azure | **PostgreSQL** (local via Docker or Homebrew) | Production-grade RDBMS, closest to SQL Server; same EF Core/LINQ. Costs a little setup (a real server must be running) but that's a transferable skill; temporal tables are SQL-Server-only ceremony |
| Migrations | DbUp (hand-written SQL) | **EF Core migrations** (`dotnet ef`) | Lower ceremony, more standard; you already see DbUp at work |
| Auth | Auth0 | **Fake user first → real auth later** | Learn *where* auth plugs in before the OAuth ceremony |
| Async messaging | Service Bus | **Skip → in-process event later** | Infra ceremony, not needed to learn the loop |
| Files/images | Blob Storage | **Local files / URLs → blob later** | Same |
| Search | Azure AI Search | **EF LINQ** | Same |
| Payments | RevenueCat | **Skip entirely** | No learning value here |
| Feeds | Stream.io | **Build your own tables** | More educational *and* fits the social vibe |
| Deploy | Azure + API Management | **localhost → free hosting (Part 7)** | Get it working before you host it |

---

## Part 3 — The phased learning plan

Each phase names the concepts, points at the real Anchovy file to read, and says what to build. **Don't read all of backend then all of frontend — go vertical.** Build one tiny feature through every layer first; that single slice teaches ~80% of the stack.

### Phase 0 — Setup + first contact *(a weekend)*
- Install: .NET 10 SDK, Node LTS, Angular CLI (`npm i -g @angular/cli`), VS Code or Rider, PostgreSQL (run it via Docker or Homebrew — see Session 0), and a Postgres viewer (pgAdmin, DBeaver, or TablePlus).
- Scaffold: `dotnet new webapi` for the backend; the Ionic + Angular starter for the frontend.
- **Win condition:** one `GET /ping` endpoint, and an Angular service that calls it and shows the result. You'll fight CORS and the API base URL exactly once — that *is* the connective-tissue lesson. (At work that URL lives in `App/src/environments/environment.ts` → `http://localhost:7071/api/`.)
- **Concepts:** client/server, HTTP verbs + status codes, JSON, dev servers & ports, CORS, dependency injection (you'll meet it in `Program.cs`).

### Phase 1 — One vertical slice, all the way down *(the big one)*
Pick your project's simplest entity and push it through every layer:
- **DB:** EF entity + `DbContext` + first migration. *Read:* `…Database/DataContracts/DatabaseContext.cs` (the DbSets), the `Recipe.cs` entity, and one migration `…DbUp/Scripts/001/002.InitialTables.sql` — then do yours with `dotnet ef migrations add`.
- **Accessor:** `IHabitAccessor` / `HabitAccessor` doing an EF LINQ query. *Read:* `RecipeAccessor.cs` + `IRecipeAccessor.cs`.
- **Mapping:** entity ↔ DTO. *Read:* `…Accessors/Mapper.cs`.
- **Manager:** `IHabitManager` / `HabitManager` — orchestrates, maps DTO ↔ API contract, injects the current user. *Read:* `…Managers/Planning/RecipeManager.cs` (the `GetRecipe` method ~line 109) + `…Managers/DtoMapper.cs`.
- **API:** a controller with `GET`/`POST`. *Read:* `…Client.Functions/Recipe/V1/RecipeFunction.cs`.
- **DI:** register accessor + manager + dbcontext. *Read:* the `ServiceRegistration.cs` files.
- **Frontend:** data-contract interface → service (HttpClient → Observable) → a simple signal store → a standalone page listing items with `@for`, plus one reusable component. *Read:* `recipe.service.ts`, `recipe.store.ts`, `recipe.page.ts` + `.html`, `components/profile-info-block/profile-info-block.component.ts`.
- **Concepts:** layered architecture, repository pattern, DTO + 3-tier mapping, dependency injection, `async/await` + `Task`, LINQ, EF migrations — *and* Angular standalone components, `input()`/`output()`/`computed()` signals, Observables + the `async` pipe, the store pattern, change detection (`OnPush` vs zone).

### Phase 2 — Relationships + the join table you're already building
Add related entities and a **many-to-many** join. The reaction/favorite pattern from **ANCH-2516** (`RecipeReaction`) is *the* canonical example — rebuild that same shape in your project (e.g. a user "reacts" to a friend's check-in).
- **Concepts:** one-to-many vs many-to-many, navigation properties, foreign keys, join tables, `.Include()`, filtering & sorting.

### Phase 3 — Your fun features (social + tracking + dashboards)
Friends list, a **feed** of friends' activity, **profile** pages with stats, reactions, and a **dashboard** with charts (counts/totals — i.e. `GroupBy`/aggregation queries).
- **Concepts:** aggregation queries, feed/list UI, a charting library, pagination.

### Phase 4 — Auth + identity
Replace the fake current-user with real auth. This is exactly where the real code injects `UserId` inside the Manager — your job is just to make that value real.
- **Path:** simplest = JWT via ASP.NET Identity; closest-to-work = Auth0's free tier. Protect endpoints, send a token from Angular, read the user server-side.
- **Concepts:** authentication vs authorization, JWT/tokens, auth headers, Angular route guards, user-scoped data.

### Phase 5 — Tests, for real
- **Backend:** xUnit accessor + manager tests against a throwaway Postgres — **Testcontainers** spins up a real Postgres in Docker per test run, so tests hit the same engine as prod (no SQL-dialect surprises). Same idea as `Tests.AccessorTests` at work.
- **Frontend:** Jasmine/Karma + `TestBed` + mock factories. *Read:* `stores/meal-plan.store.spec.ts` and `test-utilities/mock-factory.ts`.
- **Concepts:** unit vs integration, mocking dependencies, Arrange/Act/Assert.

### Phase 6 — Ship it + add one "real" piece
Deploy frontend (Azure Static Web Apps / Netlify) + backend (Azure App Service or a container) + a hosted DB (managed Postgres — Neon, Supabase, or Azure Database for PostgreSQL). Then add back **one** deferred piece: image upload to Blob storage, *or* an async event via a queue, *or* swap the API layer to Azure Functions to feel the difference. **See Part 7 for the concrete, step-by-step hosting guide.**
- **Concepts:** build vs dev config, environment variables, hosting, connection strings & secrets.

> **Skip-for-now, add-later:** native/Capacitor, Service Bus, Blob, AI Search, API Management, RevenueCat, Auth0. Each maps to a Phase 6 stretch goal.

---

## Part 4 — How long will it take?

You have a **real, working app you built end-to-end in a weekend.** The full plan is a 2–3 month *roadmap*, but finishing it is **not** a prerequisite for having something you're proud of.

| Milestone | What you have | Focused hours | At ~5 hrs/wk |
|---|---|---|---|
| **MVP** (Phase 0–1, no auth/social) | Add an item, mark it backlog→in-progress→done, rate it, see your list. Built through every layer yourself. | **12–18 hrs** | ~1 focused weekend, or ~2–3 weeks of evenings |
| **"Mine" version** (+ Phase 2 & a slice of 3) | Ratings, relationships, basic stats/dashboard, a profile page. | **+15–25 hrs** | ~4–6 weeks total |
| **Everything** (+ friends/feed, auth, tests, deployed) | The full plan. | **~50–95 hrs total** | ~2–3 months — built piece by piece |

**Where the time actually goes** (it's front-loaded and lumpy):
- **Phase 0 (setup): 3–6 hrs.** Mostly one fight: CORS + base URL. Annoying once, then never again.
- **Phase 1 (first vertical slice): 10–15 hrs — this is the wall.** Slow because you're doing every layer for the first time *and* learning EF migration tooling. The *second* entity (Phase 2) takes a fraction of the time. Don't judge your pace by Phase 1.
- **Phase 3 (social + charts): 12–25 hrs.** Quietly several features.
- **Phase 4 (auth): 6–12 hrs.** Fiddly for everyone; that's why it's deferred behind a fake user.
- **Phase 6 (deploy): 6–15 hrs.** First deploy always eats a session on config and secrets.

---

## Part 5 — The project: "Backlog"

A personal backlog tracker: log the games, movies, shows, books, and vacations you want to get to; set status (Backlog → InProgress → Done), a rating, and a note; see stats; and (later) friends + an activity feed + reactions.

**MVP scope (this weekend):** add an item → it goes to your Backlog → mark it InProgress/Done → rate it. Push it through every layer, both apps talking.
**Deliberately out (Phase 2+):** auth, friends, feed, charts, deploy.

**Data model (as you've built it):** rather than one flat entity, you went with a **type hierarchy** — `BacklogItem` (base: Id, Title, Category, Status, Rating, Note) → `MediaItem` (adds YearReleased) → concrete `VideoGame` / `Movie` / `Show` / `Book` / `Vacation`, each with its own fields (`HowLongToBeat`, `RuntimeMinutes`, `Seasons`, `TotalPages`, `EstimatedCost`/`HowManyDays`). EF Core maps this as **Table-Per-Hierarchy (TPH)**: one `BacklogItems` table with a discriminator column. That's a more advanced (Phase-2-flavored) choice than the original single-entity MVP — great for learning EF inheritance, just a bit more moving parts. See the status box in Part 6 for two design nits to settle first (abstract leaf types; `Category` vs the discriminator).

**Architecture (simplified from Anchovy, same shape):**
```
[Ionic Page] → [Store] → [Service] → HTTP → [Controller] → [Manager] → [Accessor] → [DbContext] → PostgreSQL
```
Two simplifications vs work: it's **one .NET project with folders** (not a project per layer), and you **map by hand** instead of AutoMapper (you'll see exactly what maps to what).

---

## Part 6 — Weekend MVP build checklist

Check items off. **Each session ends in something that works** — if you run out of weekend, you stop at a real milestone, not a half-wired mess.

> ### 📍 Current status (updated from your repo)
>
> **Done:** Session 0 scaffold — both `Backlog.Api` (backend) and `backlog` (frontend) exist and run.
> **In progress:** Session 1 — your entity model is written; `BacklogDbContext` exists. Still to do: switch to Postgres, register the DbContext in `Program.cs`, add the first migration, create the DB.
>
> **Design decisions you've made (richer than the original flat MVP):**
> - A **type hierarchy** instead of one flat entity: `BacklogItem` (base) → `MediaItem` → concrete `VideoGame` / `Movie` / `Show` / `Book` / `Vacation`, each with its own fields. With a single `DbSet<BacklogItem>`, EF Core maps this as **TPH (Table-Per-Hierarchy)**: one table, all columns, plus an auto **discriminator** column recording each row's real subtype. Concept to look up: *EF Core inheritance / TPH*.
> - Enums `Category { Movie, Show, VideoGame, Book, Vacation }` and `BacklogStatus { Backlog, InProgress, Done }` live in `Common/Enums`.
> - `Rating` is `decimal?` (allows 4.5-style) and there's a `string? Note`. (Note: you dropped `CreatedAt` — the Session 2 accessor below orders by it, so adjust that.)
>
> **⚠️ Three things to fix/decide before the migration:**
> 1. **Leaf types must be concrete.** Right now *every* class is `abstract` — including `VideoGame` / `Movie` / `Show` / `Book` / `Vacation`. An `abstract` class can't be instantiated, so you can never `new VideoGame()` or insert a row. Keep `abstract` only on the **base** types (`BacklogItem`, `MediaItem`); drop it from the five leaves.
> 2. **`Category` duplicates the TPH discriminator.** Once a row *is* a `VideoGame`, EF's discriminator already knows that — a separate `Category` enum is double-bookkeeping that can drift. Pick one: keep the subtypes and drop `Category`, **or** keep one flat `BacklogItem` with a `Category` and drop the subtypes. (Subtypes are the more interesting EF lesson.)
> 3. **You're still on SQLite; the plan is Postgres.** Your `.csproj` references `Microsoft.EntityFrameworkCore.Sqlite` and `Program.cs` doesn't register the DbContext yet. Since you haven't created a migration, **now is the free moment to switch** — no migration to redo:
>    ```bash
>    dotnet remove package Microsoft.EntityFrameworkCore.Sqlite
>    dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
>    ```
>    then wire `UseNpgsql(...)` in `Program.cs` (Session 1 below).

### Session 0 — Tooling & scaffold *(1–2 hrs)*

Install (skip any you have):
- [ ] .NET 10 SDK → verify `dotnet --version`
- [ ] Node LTS → verify `node --version`
- [ ] Ionic CLI: `npm install -g @ionic/cli`
- [ ] EF Core CLI: `dotnet tool install --global dotnet-ef` (verify `dotnet ef`)
- [ ] **PostgreSQL running locally** — pick one:
  - [ ] **Docker (recommended — one disposable command, explicit credentials):**
    `docker run --name backlog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=backlog -p 5432:5432 -d postgres:17`
  - [ ] **Homebrew:** `brew install postgresql@17 && brew services start postgresql@17`, then `createdb backlog`. ⚠️ Homebrew's default login is your **macOS username with no password** (not `postgres`), so your connection string differs — see the note in Session 1.
- [ ] A Postgres viewer (pgAdmin, DBeaver, or TablePlus) → connect to `localhost:5432`, database `backlog`

Scaffold the backend (`--use-controllers` matters — .NET 10's default is minimal APIs; you want controllers to mirror Anchovy's Function layer):
- [ ] `dotnet new webapi --use-controllers -o Backlog.Api`
- [ ] `cd Backlog.Api`
- [ ] `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL` (the provider version tracks EF Core — the `10.x` release targets .NET 10 / EF Core 10)
- [ ] `dotnet add package Microsoft.EntityFrameworkCore.Design`
- [ ] `dotnet run` → it boots. Note the **HTTP port** in `Properties/launchSettings.json` (e.g. `http://localhost:5080`).

Scaffold the frontend:
- [ ] (separate folder) `ionic start backlog blank --type=angular` → choose **Standalone**
- [ ] `cd backlog && ionic serve` → opens on `http://localhost:8100`

✅ **Checkpoint:** two apps run independently. — **done** (both projects scaffolded and running).

> ⚠️ **Postgres note:** you scaffolded the backend on **SQLite**, not Postgres — see the status box above. The "PostgreSQL running locally" step is still open if you switch (recommended, and free right now since there's no migration yet).

---

### Session 1 — Backend data layer *(2–4 hrs)*

> Mirrors `…Database/DataContracts/Recipe.cs` + `DatabaseContext.cs` + a DbUp migration — but with EF Core migrations instead of hand-written SQL.

- [x] **`Common/Enums/`** — you split the enums into their own folder:
```csharp
// Common/Enums/Category.cs
namespace Backlog.Api.Common.Enums;
public enum Category { Movie, Show, VideoGame, Book, Vacation }

// Common/Enums/BacklogStatus.cs
namespace Backlog.Api.Common.Enums;
public enum BacklogStatus { Backlog, InProgress, Done }
```

- [x] **`Models/` — a type hierarchy** (your design; richer than the original single entity). `BacklogItem` is the shared base, `MediaItem` adds fields common to released media, and each category is a concrete leaf:
```csharp
// Models/BacklogItem.cs — shared base (abstract: never instantiated directly)
using Backlog.Api.Common.Enums;
namespace Backlog.Api.Models;

public abstract class BacklogItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Category Category { get; set; }
    public BacklogStatus Status { get; set; }
    public decimal? Rating { get; set; }   // decimal → allows 4.5-style ratings
    public string? Note { get; set; }
}

// Models/MediaItem.cs — intermediate base for released media
public abstract class MediaItem : BacklogItem
{
    public int? YearReleased { get; set; }
}

// Concrete leaf types — MUST be non-abstract so EF can create rows and you can `new` them
public class VideoGame : MediaItem { public int? HowLongToBeat { get; set; } }
public class Movie     : MediaItem { public int? RuntimeMinutes { get; set; } }
public class Show      : MediaItem { public int? Seasons { get; set; } }
public class Book      : MediaItem { public int? TotalPages { get; set; } }
public class Vacation  : MediaItem { public decimal? EstimatedCost { get; set; } public int? HowManyDays { get; set; } }
```
> ⚠️ **Fix before you migrate:** in your current files all five leaf types are marked `abstract` — an `abstract` class can't be instantiated, so EF can't insert rows and `new VideoGame()` won't compile. Drop `abstract` from `VideoGame` / `Movie` / `Show` / `Book` / `Vacation` (keep it only on `BacklogItem` and `MediaItem`).
> 💡 **Concept — EF Core inheritance (TPH):** with the single `DbSet<BacklogItem>` below, EF stores the whole hierarchy in **one table** and adds a **discriminator** column to remember each row's real type. Look up "EF Core Table-Per-Hierarchy." Because the discriminator already records the type, the separate `Category` enum is redundant — pick one (see the status box up top).

- [x] **`Data/BacklogDbContext.cs`** — one DbSet of the base type (EF discovers the subtypes automatically):
```csharp
using Backlog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Backlog.Api.Data;

public class BacklogDbContext(DbContextOptions<BacklogDbContext> options) : DbContext(options)
{
    public DbSet<BacklogItem> BacklogItems => Set<BacklogItem>();
}
```

> 🚧 **IN PROGRESS HERE** — the model exists; the DB isn't wired up yet. Next three steps:

- [ ] **Switch the provider to Postgres** (you're still on SQLite, and there's no migration yet, so it's free):
```bash
dotnet remove package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```
- [ ] **Register the DbContext in `Program.cs`** (above `var app = builder.Build();` — your `Program.cs` doesn't do this yet):
```csharp
builder.Services.AddDbContext<BacklogDbContext>(options =>
    options.UseNpgsql("Host=localhost;Port=5432;Database=backlog;Username=postgres;Password=postgres"));
```
> 💡 That inline connection string is fine for a local-only MVP. If you used the **Homebrew** path instead of Docker, it's `Host=localhost;Port=5432;Database=backlog;Username=<your-mac-username>` (no password). In **Part 7** this moves out to config / env vars — never commit a real password.

- [ ] **Create the schema** (make sure Postgres is running first — Docker container up, or `brew services` started):
  - [ ] `dotnet ef migrations add InitialCreate` → creates a `Migrations/` folder (open it — one table with a discriminator + every subtype's columns, all nullable)
  - [ ] `dotnet ef database update` → creates the tables inside your `backlog` Postgres database
- [ ] Connect to `backlog` (`localhost:5432`) in your viewer → confirm the `BacklogItems` table exists (with a `Discriminator` column).

✅ **Checkpoint:** your database and table exist, generated from your C# model.

---

### Session 2 — Backend layers + API *(2–4 hrs)*

> This is `RecipeFunction → RecipeManager → RecipeAccessor`, shrunk. Open those three at work side-by-side.

> 📝 **Heads-up given your model:** the code below still uses the original flat fields (`MediaType Type`, `int? Rating`, `CreatedAt`) so it reads simply — but your real model uses `Category`, `decimal? Rating`, `Note`, no `CreatedAt`, and a subtype per category. So: (1) order by `Title` instead of `CreatedAt` (or add `CreatedAt` back to the base), and (2) decide between one flat `BacklogItemDto` with nullable per-subtype fields or a DTO per subtype. The same applies to the Session 3 frontend (`MediaType` / `Playing` → your `Category` / `InProgress`). Keep the *layering* pattern below; adapt the field names to what you built.

- [ ] **`Dtos/BacklogDtos.cs`** — the contracts the API speaks (separate from the entity — that separation *is* the lesson):
```csharp
using Backlog.Api.Models;
namespace Backlog.Api.Dtos;

public record BacklogItemDto(Guid Id, string Title, MediaType Type, BacklogStatus Status, int? Rating, DateTimeOffset CreatedAt);
public record CreateBacklogItemRequest(string Title, MediaType Type);
public record UpdateBacklogItemRequest(BacklogStatus Status, int? Rating);
```

- [ ] **`Accessors/BacklogAccessor.cs`** — EF queries + entity↔DTO mapping (mirrors `RecipeAccessor.cs` + `Accessors/Mapper.cs`):
```csharp
using Backlog.Api.Data;
using Backlog.Api.Dtos;
using Backlog.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace Backlog.Api.Accessors;

public interface IBacklogAccessor
{
    Task<List<BacklogItemDto>> GetAllAsync();
    Task<BacklogItemDto> CreateAsync(CreateBacklogItemRequest request);
    Task<BacklogItemDto?> UpdateAsync(Guid id, UpdateBacklogItemRequest request);
}

public class BacklogAccessor(BacklogDbContext db) : IBacklogAccessor
{
    public async Task<List<BacklogItemDto>> GetAllAsync()
    {
        var entities = await db.BacklogItems.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return entities.Select(ToDto).ToList();   // ⚠️ map AFTER ToListAsync — see gotcha
    }

    public async Task<BacklogItemDto> CreateAsync(CreateBacklogItemRequest request)
    {
        var entity = new BacklogItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Type = request.Type,
            Status = BacklogStatus.Backlog,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        db.BacklogItems.Add(entity);
        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<BacklogItemDto?> UpdateAsync(Guid id, UpdateBacklogItemRequest request)
    {
        var entity = await db.BacklogItems.FindAsync(id);
        if (entity is null) return null;
        entity.Status = request.Status;
        entity.Rating = request.Rating;
        await db.SaveChangesAsync();
        return ToDto(entity);
    }

    private static BacklogItemDto ToDto(BacklogItem i) =>
        new(i.Id, i.Title, i.Type, i.Status, i.Rating, i.CreatedAt);
}
```
> ⚠️ **Gotcha that will bite you:** EF can't translate your C# `ToDto` method into SQL. If you write `.Select(ToDto)` *before* `.ToListAsync()`, it throws at runtime. Materialize first (`ToListAsync`), then map in memory. (Or inline a `new BacklogItemDto(...)` — that EF *can* translate.)

- [ ] **`Managers/BacklogManager.cs`** — orchestration (thin now, on purpose):
```csharp
using Backlog.Api.Accessors;
using Backlog.Api.Dtos;
namespace Backlog.Api.Managers;

public interface IBacklogManager
{
    Task<List<BacklogItemDto>> GetItemsAsync();
    Task<BacklogItemDto> AddItemAsync(CreateBacklogItemRequest request);
    Task<BacklogItemDto?> UpdateItemAsync(Guid id, UpdateBacklogItemRequest request);
}

public class BacklogManager(IBacklogAccessor accessor) : IBacklogManager
{
    public Task<List<BacklogItemDto>> GetItemsAsync() => accessor.GetAllAsync();
    public Task<BacklogItemDto> AddItemAsync(CreateBacklogItemRequest request) => accessor.CreateAsync(request);
    public Task<BacklogItemDto?> UpdateItemAsync(Guid id, UpdateBacklogItemRequest request) => accessor.UpdateAsync(id, request);
}
```
> 💡 The manager just forwards calls right now — normal for a CRUD MVP. Its job becomes real in Phase 2: injecting the current user (the `_contextFactoryUtility...UserId` line in `RecipeManager.GetRecipe`), validation, combining accessors. Keep the layer so the seam already exists.

- [ ] **`Controllers/BacklogItemsController.cs`** — HTTP entry (mirrors `RecipeFunction.cs`):
```csharp
using Backlog.Api.Dtos;
using Backlog.Api.Managers;
using Microsoft.AspNetCore.Mvc;
namespace Backlog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]                       // → /api/backlogitems
public class BacklogItemsController(IBacklogManager manager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BacklogItemDto>>> Get() => await manager.GetItemsAsync();

    [HttpPost]
    public async Task<ActionResult<BacklogItemDto>> Post(CreateBacklogItemRequest request)
    {
        var created = await manager.AddItemAsync(request);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BacklogItemDto>> Put(Guid id, UpdateBacklogItemRequest request)
    {
        var updated = await manager.UpdateItemAsync(id, request);
        return updated is null ? NotFound() : updated;
    }
}
```

- [ ] **Wire DI + CORS in `Program.cs`** (mirrors the `ServiceRegistration.cs` files at work):
```csharp
builder.Services.AddScoped<IBacklogAccessor, BacklogAccessor>();
builder.Services.AddScoped<IBacklogManager, BacklogManager>();
builder.Services.AddControllers();
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.WithOrigins("http://localhost:8100").AllowAnyHeader().AllowAnyMethod()));
```
…and after `var app = builder.Build();`:
```csharp
app.UseCors("Frontend");
app.MapControllers();
```

- [ ] **Test it without the frontend:** open the generated `Backlog.Api.http` file (or use `curl`) and POST one item, then GET the list. .NET 10's template gives you that `.http` file instead of Swagger UI.
```
POST http://localhost:5080/api/backlogitems
Content-Type: application/json

{ "title": "Hollow Knight", "type": 0 }
```

✅ **Checkpoint:** you can create and read items over HTTP and see JSON. **The whole backend is done.**

---

### Session 3 — Frontend: show your list *(2–4 hrs)*

> Mirrors `recipe.service.ts` + `recipe.store.ts` + `recipe.page.ts`. The store is the simplified version (plain signals, no `@ngrx/component-store` + immer).

- [ ] **Turn on HttpClient:** in `src/main.ts`, add `provideHttpClient()` (import from `@angular/common/http`) to the `providers` array next to `provideIonicAngular()`.
- [ ] **`src/environments/environment.ts`** → set your API port:
```ts
export const environment = { production: false, apiBaseUrl: 'http://localhost:5080' };
```
- [ ] **`src/app/models/backlog.ts`** — TS contracts mirroring your C# DTOs:
```ts
export enum MediaType { Game = 0, Movie = 1, Book = 2 }
export enum BacklogStatus { Backlog = 0, Playing = 1, Done = 2 }

export interface BacklogItem { id: string; title: string; type: MediaType; status: BacklogStatus; rating: number | null; createdAt: string; }
export interface CreateBacklogItemRequest { title: string; type: MediaType; }
export interface UpdateBacklogItemRequest { status: BacklogStatus; rating: number | null; }
```
> 💡 The enums are numbers because .NET serializes enums as ints by default — so `0` = Game on both sides. (Optional later: add `JsonStringEnumConverter` on the backend to send `"Game"` instead.)

- [ ] **`src/app/services/backlog.service.ts`** (`ionic g service services/backlog`, then):
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BacklogItem, CreateBacklogItemRequest, UpdateBacklogItemRequest } from '../models/backlog';

@Injectable({ providedIn: 'root' })
export class BacklogService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/api/backlogitems`;

  getItems(): Observable<BacklogItem[]> { return this.http.get<BacklogItem[]>(this.url); }
  addItem(req: CreateBacklogItemRequest): Observable<BacklogItem> { return this.http.post<BacklogItem>(this.url, req); }
  updateItem(id: string, req: UpdateBacklogItemRequest): Observable<BacklogItem> { return this.http.put<BacklogItem>(`${this.url}/${id}`, req); }
}
```

- [ ] **`src/app/stores/backlog.store.ts`** — signals + computed groupings:
```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { BacklogService } from '../services/backlog.service';
import { BacklogItem, BacklogStatus, CreateBacklogItemRequest, UpdateBacklogItemRequest } from '../models/backlog';

@Injectable({ providedIn: 'root' })
export class BacklogStore {
  private api = inject(BacklogService);
  private readonly _items = signal<BacklogItem[]>([]);

  readonly backlog = computed(() => this._items().filter(i => i.status === BacklogStatus.Backlog));
  readonly playing = computed(() => this._items().filter(i => i.status === BacklogStatus.Playing));
  readonly done = computed(() => this._items().filter(i => i.status === BacklogStatus.Done));

  load() { this.api.getItems().subscribe(items => this._items.set(items)); }
  add(req: CreateBacklogItemRequest) { this.api.addItem(req).subscribe(c => this._items.update(l => [c, ...l])); }
  update(id: string, req: UpdateBacklogItemRequest) {
    this.api.updateItem(id, req).subscribe(u => this._items.update(l => l.map(i => i.id === id ? u : i)));
  }
}
```

- [ ] **`src/app/home/home.page.ts`** — render the three groups:
```ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonListHeader, IonLabel } from '@ionic/angular/standalone';
import { BacklogStore } from '../stores/backlog.store';
import { BacklogItem, BacklogStatus, MediaType } from '../models/backlog';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonListHeader, IonLabel],
})
export class HomePage implements OnInit {
  private store = inject(BacklogStore);
  backlog = this.store.backlog; playing = this.store.playing; done = this.store.done;
  newTitle = signal(''); newType = signal(MediaType.Game);

  ngOnInit() { this.store.load(); }
  add() { if (this.newTitle().trim()) { this.store.add({ title: this.newTitle().trim(), type: this.newType() }); this.newTitle.set(''); } }
  markDone(i: BacklogItem) { this.store.update(i.id, { status: BacklogStatus.Done, rating: i.rating }); }
}
```
> ⚠️ **Ionic standalone gotcha:** every `<ion-*>` tag you use in the template **must** be in that `imports` array (import from `@ionic/angular/standalone`). A missing one = a silent blank / `Unknown element`. Same family as the import-array gotcha on redesign pages.

- [ ] **`src/app/home/home.page.html`** — `@for` / `@if` + signals in the template (compare to `recipe.page.html`):
```html
<ion-header><ion-toolbar><ion-title>My Backlog</ion-title></ion-toolbar></ion-header>
<ion-content class="ion-padding">
  <ion-item>
    <ion-input placeholder="Title" [ngModel]="newTitle()" (ngModelChange)="newTitle.set($event)"></ion-input>
    <ion-select [ngModel]="newType()" (ngModelChange)="newType.set($event)">
      <ion-select-option [value]="0">Game</ion-select-option>
      <ion-select-option [value]="1">Movie</ion-select-option>
      <ion-select-option [value]="2">Book</ion-select-option>
    </ion-select>
    <ion-button (click)="add()">Add</ion-button>
  </ion-item>

  @for (group of [{ label: 'Backlog', items: backlog() }, { label: 'Playing', items: playing() }, { label: 'Done', items: done() }]; track group.label) {
    <ion-list-header>{{ group.label }}</ion-list-header>
    @for (item of group.items; track item.id) {
      <ion-item>
        <ion-label>{{ item.title }}</ion-label>
        <ion-button slot="end" fill="clear" (click)="markDone(item)">Done</ion-button>
      </ion-item>
    } @empty {
      <ion-item><ion-label color="medium">Nothing here yet</ion-label></ion-item>
    }
  }
</ion-content>
```

✅ **Checkpoint:** add an item in the UI → it appears under **Backlog** → "Done" moves it to **Done**, and it survives a refresh (it's in Postgres). **That's the full loop, end to end, that you built yourself.**

---

### Session 4 — Polish the loop *(1–3 hrs, optional this weekend)*
- [ ] Add a "Start" button (Backlog → Playing) alongside "Done"
- [ ] Add a 1–5 rating control on Done items (reuse `store.update`)
- [ ] Show the `type` as an icon (`ion-icon`: game-controller / film / book)
- [ ] Empty-state message when there are zero items total

🛑 **Stop anywhere after Session 3 and you have a real, working app you understand top to bottom.**

---

## Part 7 — Hosting the app on the web (any browser can reach it)

Your frontend is already a web app — that's literally what `ionic serve` runs. "Hosting" just means putting three things on public URLs instead of `localhost`:

1. a **static site** for the built Angular/Ionic frontend,
2. a **web service** for the .NET API,
3. a **managed Postgres** for the data.

Swapping each `localhost` for a public URL is ~90% of the job. Everything below is the concrete version of Phase 6.

### Recommended free stack (quickest path)

| Piece | Host | Why |
|---|---|---|
| Database | **Neon** (serverless Postgres, free tier) | Same Postgres you run locally; hands you a ready-to-paste connection string |
| Backend API | **Render** (free Web Service) | Deploys .NET straight from your Git repo. Caveat: the free tier **sleeps after ~15 min idle**, so the first request after a nap takes ~30s |
| Frontend | **Netlify** or **Cloudflare Pages** (free) | Connect the repo, it builds and serves the static `www/` folder with instant HTTPS |

> **Closest-to-work (Azure) alternative:** Azure Static Web Apps (frontend) + Azure App Service (API) + Azure Database for PostgreSQL. More setup and not free long-term, but it mirrors the Anchovy deploy target — worth doing once later for the skill. (Free tiers/limits on all of these change — check each host's current docs before you rely on a number.)

### The 5 changes that turn "localhost only" into "hosted"

**1. Move the DB connection string out of code, into config/env** (never commit a real password). In `Program.cs`:
```csharp
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=backlog;Username=postgres;Password=postgres"; // local fallback
builder.Services.AddDbContext<BacklogDbContext>(options => options.UseNpgsql(connectionString));
```
On the host, set an env var **`ConnectionStrings__Default`** = your Neon connection string. (.NET maps the `__` double-underscore to the nested `ConnectionStrings:Default` config key — that's the convention that lets env vars override `appsettings.json`.)

**2. Apply migrations to the hosted DB.** Simplest for a learning app — auto-migrate on startup. After `var app = builder.Build();`:
```csharp
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<BacklogDbContext>().Database.Migrate();
}
```
`Migrate()` runs any pending migrations when the API boots, so the hosted DB gets your schema with no manual step. (Alternative: run `dotnet ef database update` once from your machine, pointed at the Neon connection string.)

**3. Open CORS to the deployed frontend origin**, not just `localhost:8100`:
```csharp
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.WithOrigins("http://localhost:8100", "https://your-app.netlify.app")
     .AllowAnyHeader().AllowAnyMethod()));
```

**4. Point the frontend at the hosted API.** Angular swaps in a production environment file at build time:
```ts
// src/environments/environment.prod.ts
export const environment = { production: true, apiBaseUrl: 'https://your-api.onrender.com' };
```
Build with `ionic build` (production is the default `ng build` configuration, which triggers the `environment.ts → environment.prod.ts` file replacement in `angular.json`), then deploy the generated `www/` folder.
> 💡 A fresh Angular app doesn't create environment files by default anymore — if `environment.prod.ts` doesn't exist, run `ng generate environments` once to create the files and wire the `fileReplacements` entry in `angular.json`.

**5. Let the API listen on the host's port.** PaaS hosts inject a `PORT` env var and expect your app to bind `0.0.0.0:$PORT`, not a fixed `5080`. Easiest fix — set this env var on the host:
```
ASPNETCORE_URLS = http://0.0.0.0:${PORT}
```
This is the single most common "works locally, 502 in the cloud" gotcha.

### Order to do it in
Neon (get the DB URL) → deploy the API to Render with the two env vars (`ConnectionStrings__Default` + `ASPNETCORE_URLS`) → confirm the API's public `/api/backlogitems` responds → set `environment.prod.ts` to that API URL → deploy the frontend to Netlify → add the Netlify URL to CORS → redeploy the API. Then open the Netlify URL on your phone's browser — that's the whole app, hosted.

### Deploy gotchas (the cloud cousins of the local ones)
1. **CORS, again** — now it's the *deployed* frontend origin that must be in `WithOrigins`. Same lesson, new URL.
2. **Mixed content** — a Netlify site is HTTPS; if the API is plain HTTP the browser blocks the calls. Always use the HTTPS URL your API host gives you.
3. **Free-tier cold starts** — Render's free API sleeps; first request after idle is slow. Fine for a demo, awkward in a live one.
4. **Secrets** — the Neon password lives only in the host's env var and your local user-secrets, never in Git. Add any `appsettings.*.json` that holds real secrets to `.gitignore`.

---

## Appendix — The gotchas most likely to eat an hour
1. **CORS** — "blocked by CORS" in the console = your Ionic port (`8100`) doesn't match `WithOrigins(...)`. Same lesson as the work app's base-URL setup.
2. **EF map-in-query** — map *after* `ToListAsync`, never inside the query (EF can't translate your C# method to SQL).
3. **Ionic imports array** — a missing `<ion-*>` import = blank render.
4. **API port** — `environment.apiBaseUrl` must match `launchSettings.json`, and use `http://` (not the https port) to skip local cert hassles.
5. **Postgres not running / wrong connection string** — `dotnet ef database update` or the API throwing "connection refused" / "password authentication failed" = your Postgres container/service isn't up, or the `Host/Port/Database/Username/Password` in `UseNpgsql(...)` doesn't match how you started it. This is the new tax for a real server (SQLite never had it — it was just a file).
6. **Npgsql wants UTC timestamps** — Npgsql maps `DateTimeOffset`/`DateTime` to `timestamptz` and rejects non-UTC values ("Cannot write DateTimeOffset with Offset different than 0"). Always use `DateTimeOffset.UtcNow` (the MVP already does) — don't switch to `.Now`.

**Phase 2 picks up directly from here:** add a second entity, a many-to-many (the same `RecipeReaction` shape from ANCH-2516), and a stats view — all reusing this exact layer stack.
