# Burgenland Roman Dictionary (bgld-roman-wb.github.io)

## What this is
An online dictionary for Burgenland Roman (the Romani dialect spoken by the
Roma community in Burgenland, Austria), built from a spreadsheet maintained by
a linguistics professor. This repo will host the built site via GitHub Pages
(hence the `<org>.github.io` name). The repo is public and intentionally so —
raw source data is committed here, not kept private.

Roles: the professor owns the linguistic content and the spreadsheet/structure
spec; the user (repo owner) is building the site and engineering the data
pipeline.

**The spreadsheet and its spec are human-made and well put together, but not
infallible** — treat `structure.pdf` as the authoritative *intent*, not a
guarantee that every row in `dictionary.xlsx` follows it exactly. When the
pipeline hits a row that violates the documented structure (unexpected value,
missing paradigm link, malformed composition, etc.), don't silently coerce it
or assume the code is wrong — flag it, since it's likely a data entry issue
worth surfacing to the professor rather than quietly working around.

**Never edit `data/current/dictionary.xlsx` to fix data issues.** It is the
professor's authoritative source. Instead, well-evidenced corrections go in
[`data/corrections.json`](data/corrections.json), a build-time overlay applied
on top of the parsed spreadsheet (never modifying it) — see
[`data/CORRECTIONS.md`](data/CORRECTIONS.md) for the mechanism. Each correction
carries a rationale and is a proposal pending the professor's review. The build
tolerates a small `acceptedErrorBudget` of unresolved errors so the site can
ship despite a genuine long-tail of one-off issues, but fails loudly if errors
spike (a snapshot regression). All remaining issues are listed in the generated
`src/data/generated/warnings.json`.

## Source data
- `data/current/dictionary.xlsx` and `data/current/structure.pdf` — the
  **entry points**: the latest dictionary data and its authoritative
  column-by-column spec (written by the professor, in German). Always read
  `structure.pdf` before changing any data pipeline code — it is the source
  of truth, more so than the summary below.
- `data/archive/<YYYY-MM-DD>/` — previous dated snapshots of the same two
  files, kept for history. When the professor sends an update, move the
  current files into a new dated archive folder before replacing
  `data/current/` with the new ones — don't delete old snapshots.
- `data/background/manuscript-de.pdf` / `manuscript-en.pdf` — the same
  accompanying book manuscript in German and English: project history,
  sociolinguistic background on the Burgenland Roma and the Roman dialect,
  and the codification project this dictionary grows out of. Useful context,
  not itself dictionary data.

## Workbook structure (as of the 2026-06-17 snapshot, now `data/current/dictionary.xlsx`)
18 sheets. The important ones:

- **GLOSSARY** — the main entry table, ~9,900 rows. Columns (A–AP):
  - `Roman INT`/`Roman DEU` (A/B) — the lemma in international vs. German
    orthography. A trailing hyphen inside the lemma (e.g. `acél-o`) marks
    where inflectional endings attach per the `Paradigm` column; it's hidden
    in display.
  - `Composition INT/DEU` (C/D) — if the lemma is a compound, its parts.
  - `Variation INT/DEU` (E/F) — attested variant forms.
  - `Reconstruction INT/DEU` (G/H) — unattested reconstructed forms (marked
    `*`), when the lemma is the result of a phonological process.
  - `Source-1` (I), `Source-2 INT/DEU` (J/K) — etymology: ISO-639 language
    code and/or derivation base (`←`).
  - `Base INT/DEU` (L/M) — the word-family root form.
  - `Word class 1/2` (N/O) — POS and sub-class (e.g. N + M/F/MF, ADJ, V).
  - `Flexion 1/2/3` (P/Q/R/S/T) — inflection class markers (meaning depends
    on word class — see PDF).
  - `Paradigm` (U, hidden) — links a row to a row in `ADJ-DECL`, `F-DECL`,
    `M-DECL`, `MF-DECL`, `V-CONJG`, or `V-EXIST` to generate the full
    inflection table for that entry. Paradigms marked `IRR` are irregular and
    already contain the full stem — don't reassemble them.
  - `Domain` (V, hidden) — internal-only tagging for topical word lists, not
    used in the rendered dictionary.
  - `DEUTSCH 01`–`10` (W–AF), `ENGLISH 01`–`10` (AG–AP) — up to 10 glosses
    per lemma in German and English respectively.
- **ADJ-DECL / F-DECL / M-DECL / MF-DECL** — declension paradigm tables for
  adjectives and the three noun genders/classes.
- **V-CONJG / V-EXIST** — verb conjugation paradigms; `V-EXIST` specifically
  for the verb "to be".
- **abbrs-gram / abbrs-lang / abbrs-lex** — abbreviation lookup tables for
  grammar labels, language/ISO-639 codes, and lexicographic labels.
- **structure, lists, noun, verb, pre-european, swadesh, lexiko-stat,
  base-etym** — supporting/reference sheets (methodology notes, curated word
  lists, Swadesh list, statistics, base etymology data). Not yet mapped in
  detail — check the sheet itself and ask the user/professor before assuming
  its purpose.

### How one dictionary entry renders (from the struktur PDF)
```
lemma [composition; variation; reconstruction] WORDCLASS1. WORDCLASS2. FLEX1 [flex2; flex3]
gloss01, …, gloss10 [SOURCE1 source2]
underline = obligatory field
INT : DEU / DEUTSCH : ENGLISH
```
Plus UI affordances: a button to expand the full inflection paradigm, and a
button to show the word family (linked to the individual related entries).

## Architecture
- **Astro** static site, deployed to GitHub Pages via `.github/workflows/deploy.yml`
  (rebuilds on every push to `main`; `ci.yml` validates PRs). `npm run build` =
  `build:data` → `astro build` → `pagefind --site dist`.
- **Data pipeline** (`scripts/pipeline/`, plain Node, run via `npm run build:data`)
  parses `data/current/dictionary.xlsx` into `src/data/generated/entries.json`
  (gitignored, regenerated each build). It expands paradigms, resolves word
  families and etymology links, and validates against a corrections overlay +
  error budget (see the corrections note above).
- **Search**: Pagefind, indexing built HTML post-build. It auto-detects each
  page's `<html lang>` and builds a per-language index, so search on the German
  site returns German pages and vice versa. Paradigm/word-family toggles are
  native `<details>` so their content stays indexable.

### Localization (i18n)
The **dictionary content is Burgenland Roman**; the **interface** is localized
into two app languages, configured in `astro.config.mjs` (`defaultLocale: 'de'`,
`prefixDefaultLocale: false`):
- **German (default)** serves at the root (`/entry/…`); **English** at `/en/…`.
  Page files mirror between `src/pages/` and `src/pages/en/`, both thin wrappers
  around shared bodies in `src/components/pages/*`; `lang` is threaded through as
  a prop. `src/i18n/ui.ts` holds the UI string catalog + helpers
  (`useTranslations`, `localizePath`, `pathInLocale`, `glossFor`, `labelFor`).
- **What the app language switches**: UI text, grammatical/etymology labels
  (`.de` vs `.en` from the pipeline), and which meaning-gloss is shown (`DEUTSCH`
  vs `ENGLISH` columns). The German and English glosses are two localizations of
  the same meaning — **never show them together**.
- **What it does NOT switch**: the Roman headword itself. Its two orthographies
  — DEU (German-based) vs INT (international) — are dictionary content, shown
  the same in both locales. **DEU is the primary/default spelling** (headword,
  browse lists, sort/letter grouping, first paradigm columns); INT is secondary
  (own line under the headword when it differs, second paradigm columns). (This
  overrides the literal `INT : DEU / DEUTSCH : ENGLISH` line in the struktur
  PDF template above, which predates this decision.)
- `LanguageSwitcher.astro` links to the same page in the other locale.

### Site icon & theming
- **The site icon** is the rounded square with a stressed **á** (the
  dictionary's stress-accent motif). The user explicitly approved this design —
  keep it. It exists in two places that must stay in sync:
  - `public/favicon.svg` — the favicon (accent hex hardcoded; SVG favicons
    can't read CSS variables).
  - `src/components/site/SiteMark.astro` — inline, theme-aware copy
    (uses `var(--color-accent)`), shown top-left in the header.
- **Accent color**: the current violet is provisional — the user wants to be
  able to try different accent tones easily. All theme colors live in the
  `:root` blocks (light + dark) at the top of `src/styles/global.css`; to
  change the accent, edit `--color-accent` (both modes), `--color-surface`
  (a whisper of the accent), and the hardcoded hex in `public/favicon.svg`.
