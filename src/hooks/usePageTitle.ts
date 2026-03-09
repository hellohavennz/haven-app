import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SUFFIX = 'Haven Study';
const BASE_URL = 'https://havenstudy.app';
const DEFAULT_DESCRIPTION = 'Pass the Life in the UK test with calm, guided study. Practice questions, flashcards, and comprehensive lessons.';

export function usePageTitle(title?: string, description?: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | Life in the UK Test Prep`;

    const desc = description ?? DEFAULT_DESCRIPTION;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);

    // Keep canonical and og:url in sync with the actual current URL so Google
    // indexes each public page separately rather than treating them all as
    // alternates of the homepage.
    const canonicalUrl = `${BASE_URL}${pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  }, [title, description, pathname]);
}
