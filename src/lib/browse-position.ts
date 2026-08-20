// Where the reader last was in a browse list, so that returning to it can put them back.
// Written from two places — the browse list itself (on click) and every entry page (on view) —
// which is why the shape lives here rather than being spelled out at each end.
//
// Per-tab (sessionStorage) and purely a convenience: every read is allowed to come back null,
// and every write is allowed to fail, in which case browsing simply behaves as if nothing was
// remembered.

export interface BrowsePosition {
	/** Letter page the entry belongs to — entries can cross letters via the next-entry link. */
	letter: string;
	slug: string;
	/**
	 * Scroll offset of the list at the moment the entry was opened from it, for a pixel-exact
	 * return. Null when the reader reached the entry some other way — a next-entry link, a search
	 * hit, a word-family link — where no list offset was ever observed and the list has to fall
	 * back to scrolling the highlighted entry into view.
	 */
	scrollY: number | null;
}

const STORAGE_KEY = 'browse:lastClicked';

export function readBrowsePosition(): BrowsePosition | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<BrowsePosition>;
		if (typeof parsed?.letter !== 'string' || typeof parsed?.slug !== 'string') return null;
		return {
			letter: parsed.letter,
			slug: parsed.slug,
			scrollY: typeof parsed.scrollY === 'number' ? parsed.scrollY : null,
		};
	} catch {
		// Storage disabled, or a stale/hand-edited value — treat as nothing remembered.
		return null;
	}
}

export function writeBrowsePosition(position: BrowsePosition): void {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(position));
	} catch {
		// Storage disabled — the position just won't be remembered.
	}
}
