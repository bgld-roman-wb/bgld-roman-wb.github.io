# Data corrections

This project applies a small set of **proposed corrections** to the dictionary
data at build time. They live in [`corrections.json`](corrections.json).

## How it works

- The professor's source spreadsheet, `data/current/dictionary.xlsx`, is
  **never modified.** Corrections are applied only in memory while the site is
  built, on top of the parsed spreadsheet.
- Each correction is a **hypothesis pending the professor's review**, recorded
  with a rationale in `corrections.json`. This file is the exact change-list to
  send the professor.
- When the professor incorporates a correction into a future snapshot, delete
  it from `corrections.json` — the build will then rely on the corrected source
  directly.

## Why this exists

The spreadsheet is a large, human-maintained dataset (~12,500 entries), so it
contains a few internal inconsistencies — mostly typos where a code is spelled
one way in the `GLOSSARY` sheet and another way in a lookup or paradigm sheet.
Left uncorrected, each such row loses a piece of its rendered entry (an
inflection table, a grammar label). Rather than wait for every one to be fixed
at the source before anything can go live, we apply well-evidenced corrections
now and track them transparently.

## Kinds of correction

- **Grammatical abbreviation additions** — a code used in `GLOSSARY` that is
  missing entirely from the `abbrs-gram` sheet (e.g. `INTR` / intransitive).
- **Grammatical abbreviation aliases** — a code that is a typo of one already
  defined in `abbrs-gram` (e.g. `INDECLold` → `INDECL-old`); the alias reuses
  the professor's own label.
- **Paradigm key aliases** — an inflection-paradigm key referenced in
  `GLOSSARY` that is a typo of a key defined in a `*-DECL` / `V-CONJG` sheet
  (e.g. `NME-i` → `NM-E-i`, affecting ~175 entries).

## The deploy gate

The build tolerates a small budget of **unresolved** errors
(`acceptedErrorBudget` in `corrections.json`) so the site can ship despite a
genuine long-tail of one-off data issues, while still failing loudly if a
future snapshot regresses badly (e.g. a shifted column producing hundreds of
errors). The full list of every remaining issue is written to
`src/data/generated/warnings.json` on every build.

## Currently unresolved (for the professor)

As of this writing, one issue is intentionally left uncorrected because it
isn't a confident typo fix:

- **GLOSSARY row 1538** — the Word class cell contains
  `N+V1536N1536:U1536`, which looks like a broken spreadsheet formula / cell
  reference rather than a grammatical code. Needs the professor to restore the
  intended value.
