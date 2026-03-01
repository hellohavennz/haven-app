import { useEffect } from 'react';

const SUFFIX = 'Haven Study';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : `${SUFFIX} — Life in the UK Test Prep`;
  }, [title]);
}
