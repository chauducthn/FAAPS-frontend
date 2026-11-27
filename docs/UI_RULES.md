# FAAPS UI Rules

Mandatory reading for every agent and developer **before** changing any UI in this repository
(markup, classes, styles, icons, layout, motion). These rules describe the design system the product
was refactored onto in November 2026. When a rule and existing code disagree, the rule wins; fix the
code you touch, but do not start unrelated drive-by rewrites.

---

## 1. Scope of a UI change

- A UI refactor changes **presentation only**. Never edit hooks, queries, mutations, services,
  validation schemas, routing, form wiring, or API shapes as part of UI work. If a functional bug is
  found, report it instead of fixing it silently.
- Keep every `id`, `htmlFor`, `aria-*`, `role`, `data-testid`, label text and button text that tests
  or users rely on. Test files may only change when they assert on class names that the new design
  intentionally replaces; update such assertions to the new classes, never delete them.
- Do not edit files that have someone else's uncommitted work in progress (`git status`) without
  asking.

## 2. Color

Only use the design tokens from `src/styles/tokens.css` (exposed to Tailwind in `src/index.css`).
They are dark-mode aware, so a token-only component works in both themes.

| Purpose | Use | Never |
| --- | --- | --- |
| Accent (primary action, active state, focus) | `brand`, `brand-hover`, `brand-soft`, `brand-soft-strong`, `brand-ink` | hex literals such as `[#F26F21]`, Tailwind `orange-*` |
| Text | `ink-primary`, `ink-secondary`, `ink-muted`, `ink-subtle` | `text-gray-*`, `text-slate-*`, hex |
| Borders, dividers, rings | `line`, `line-soft` | `border-gray-*`, hex |
| Surfaces | `bg-white` (cards), `surface-page`, `surface-sunken`, `surface-hover`, `line-soft` | `bg-gray-*` |
| Status | `emerald-*` success, `amber-*` warning, `red-*` danger | `indigo`, `violet`, `purple`, `blue`, `sky`, `cyan`, `rose` |

- Orange is the **only** accent hue. Informational or "category" states are neutral, not blue.
- Inverse elements (dark chips, code badges) use `bg-ink-primary text-surface-page`, never
  `bg-gray-900 text-white` (it disappears in dark mode).
- No decorative gradients. The only allowed gradients are neutral black scrims over photos for
  text legibility.
- Charts: single-series charts use `var(--brand)`; axes, grid and labels use `var(--line)`,
  `var(--ink-subtle)`, `var(--ink-muted)`. Multi-series categorical charts may use distinct hues.

## 3. Shape and elevation

| Element | Radius |
| --- | --- |
| Chips, badges, counters, small inline tags | `rounded-sm` (6px) |
| Buttons, inputs, selects, tabs, icon tiles, menu items | `rounded-md` (8px) |
| Cards, panels, tables, modals, alerts | `rounded-lg` (10px) |
| Avatars, status dots, progress tracks | `rounded-full` |

- `rounded-xl`, `rounded-2xl`, `rounded-3xl` and pill-shaped bars are forbidden; they read as "too
  soft" for this product.
- Prefer a 1px `border-line` over shadows. Cards may use `shadow-2xs` at most. Real shadows are
  reserved for floating layers (menus, popovers, modals, the sticky landing header).

## 4. Typography

- Font: Inter Variable (already global). Do not add font families.
- Headings: `font-semibold` with negative tracking (`tracking-tight` to `tracking-[-0.03em]`);
  avoid `font-extrabold`/`font-black`.
- Eyebrow / section labels: `text-[11px] font-semibold uppercase tracking-[0.12em-0.2em]
  text-ink-subtle` (or `text-brand` on marketing pages, with a short brand hairline).
- Numbers in metrics and tables: `tabular-nums`.

## 5. Icons

- Library: **Phosphor** (`@phosphor-icons/react`) only. Do not import `lucide-react` or add another
  icon set.
- The global weight is **light**, set once by `IconContext` in `src/main.tsx`. Do not pass
  `weight="duotone"` or `weight="regular"`.
- `weight="fill"` or `weight="bold"` is allowed only when it carries meaning (status check marks,
  alert glyphs, tiny carets).
- Utility icons (theme toggle, menu, close, chevrons) use neutral ink colors. Never decorative colors
  such as amber or blue. Brand color is for active or primary states only.
- Sizes: `size-4` inline with text, `size-[18px]` inside 36px icon tiles, `size-5` for standalone
  marketing icons.

## 6. Shared components (use them, do not copy them)

| Need | Component |
| --- | --- |
| Metric / KPI / filter tile | `modules/management/components/AdminStatTile` (semantic `tone`: neutral, brand, success, warning, danger) |
| Section tabs | `AdminTabBar`; for custom tab buttons use `ADMIN_TAB_LIST_CLASS` + `adminTabClass(active)` |
| Data table with paging, sorting, selection | `shared/components/common/DataTable` |
| Static or preview table | `shared/components/common/table/TablePrimitives` |
| Dialog | `shared/components/ui/Modal` (shell) + `ModalParts`: `ModalHeader`, `ModalBody`, `ModalFooter`, `modalButtonClass` |
| Inline error / info / success message | `shared/components/ui/InlineAlert` |
| Account or record status pill | `modules/management/components/StatusBadge` |
| Auth page shell, fields, alerts, Google button | `modules/auth/components/AuthLayout`, `AuthField`, `AuthAlert`, `GoogleAuthButton`, `authFormStyles` |
| Landing section heading | `modules/landing/components/SectionHeading` |

Before writing a new local `StatTile`, tab bar, card shell or input style, search for an existing
one. If a shared component almost fits, extend it with a prop instead of forking it.

## 7. Layout

### Admin portal (contained, 100vh)

- `AdminLayout` renders `PortalLayout` with `contained`: the shell is exactly one viewport tall and
  the sidebar and header never scroll.
- A page marks its working area (usually the table card) with the class **`admin-fill`**. Every
  wrapper between `<main data-contained-main>` and that area automatically becomes a flex column
  (see `src/styles/contained-layout.css`), so the area takes the remaining height and scrolls
  internally while tabs, stat tiles and filters stay fixed.
- Never size areas with magic viewport math such as `h-[calc(100vh-295px)]`.
- Pages with extra content below the working area (for example AI presets) let `<main>` scroll;
  the working area keeps a floor of `18rem`.
- Wrappers whose class contains `grid` are excluded from the automatic flex chain; if a grid sits on
  the path to `admin-fill`, size that grid cell explicitly.

- **Every** admin page fits one viewport, overview pages included. Card-based pages (such as the
  Dashboard) put their card grid inside an `admin-fill` wrapper: the grid takes the remaining height
  (`grid-rows-[minmax(0,1fr)]` on wide screens), long lists scroll inside their own card
  (`min-h-0 flex-1 overflow-y-auto`), charts flex into the space left (`flex-1 min-h-[...]`), and each
  card has a minimum height. When the viewport is too short, only the grid area scrolls; the header and
  the summary bar never move.
- Verify with the snippet in section 10 at 1440x900 **and** 1280x720: `doc` and `main` must be `0`.

### Page anatomy (admin overview / dashboard)

1. Section label + page action (for example Export) on one line.
2. One summary bar: a single bordered card split into hairline cells (icon + label, value, meta),
   one row on `xl` screens.
3. A two-column card grid in `admin-fill`: wide working column (charts, coverage lists) and a narrow
   column (`340px`, `360px` from `2xl`) for queues and capacity panels.

### Page anatomy (admin list pages)

1. Tab bar (left) + page actions (right; one primary orange button at most).
2. Stat strip of `AdminStatTile`s (clickable tiles act as filters).
3. One card containing the filter bar, the table (`admin-fill`) and pagination.

### Spacing and controls

- Admin controls are `h-9` (`h-8` inside tab bars); auth controls are `h-11`.
- Page gaps: `gap-4` between blocks, `gap-5` on the dashboard; card padding `p-4`.
- Focus: `focus:border-brand` with a `brand/15` ring, or `focus-visible:ring-2 ring-brand/40`.

### Dialogs

- Every dialog is `Modal` + `ModalHeader` + `ModalBody` + `ModalFooter`; never hand-roll a header,
  close button or footer.
- Header: semantic icon tile (`tone`: brand for create/edit, neutral for read-only, danger for
  destructive or failed, warning for security-sensitive actions), title, one-line description.
  Header + footer only dialogs (confirmations) pass `divided={false}`.
- Footer: actions right-aligned, secondary before primary; `start` holds hints or secondary
  downloads. Destructive confirmations use `modalButtonClass('danger')`.
- Loading buttons keep their label and add a spinner; never swap in an unrelated label.
- Forms inside dialogs (reference: Create user): a type switch that changes the whole form lives in the
  header `actions` slot; the body is two columns, each a single-file stack of fields under a small
  eyebrow label. Identity fields go left; the dependent "placement" fields go right inside a tinted
  panel (`bg-surface-page`). No section descriptions or "fields marked *" footnotes; derived facts
  appear as a one-line muted `hint` under the field they come from.

### Tables and pagination

- Rows `py-3`, header cells 11px uppercase `text-ink-subtle`, hover `bg-surface-hover`, selected
  rows `bg-brand-soft`.
- Avatars are neutral circles; roles are small chips; short codes (major, cohort, IDs) use
  `font-mono` in `text-ink-secondary`; missing values are a subtle dash.
- Pagination: row summary on the left; page size, numbered pages with ellipsis, square
  previous/next buttons and the optional "Go to" input on the right.

## 8. Motion

- One clear movement per interaction; no stacked lift + shadow + blur + cascade effects.
- Every animation must be disabled under `prefers-reduced-motion` (CSS media query or `motion-safe:`).
- Route transitions between landing and auth pages use React Router's `viewTransition` prop on
  `Link`s; shared elements are named in `src/styles/page-transitions.css`. Keep view-transition names
  unique on a page.
- Data-heavy admin screens get no entrance animation.

## 9. Dark mode

- Tokens handle dark mode. Do not add new `.dark` overrides or `dark:` hex values for colors a
  token already covers.
- Always look at a changed screen in both light and dark theme before finishing.

## 10. Verification before completion

1. `npx tsc --noEmit` passes for the files you touched.
2. `npx vitest run <touched modules>`; compare failures against the baseline before your change and
   report pre-existing failures instead of hiding them.
3. `node .vet/vet/check.mjs` reports nothing new for touched files (lines <= 140 chars, files < 200
   lines).
4. Check the screens in the browser at 1440x900, 1280x720 and 375px wide, in light and dark theme.
5. For admin list pages, confirm only the working area scrolls:

   ```js
   const m = document.querySelector('[data-contained-main]');
   ({ doc: document.documentElement.scrollHeight - innerHeight, main: m.scrollHeight - m.clientHeight });
   // both values must be 0 on pages without extra content below the table
   ```
