import { useEffect } from 'react';

const SUFFIX = 'Haven Study';
const DEFAULT_DESCRIPTION = 'Pass the Life in the UK test with calm, guided study. Practice questions, flashcards, and comprehensive lessons.';

export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Life in the UK Test Prep`;

    const desc = description ?? DEFAULT_DESCRIPTION;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
  }, [title, description]);
}
