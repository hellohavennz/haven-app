import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Public endpoint — returns the current sale status so external sites (e.g.
// haven.study) can display discounted prices without needing Supabase keys.
// No auth required. Response is cached for 60 seconds at the CDN edge.

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CORS = {
  'Access-Control-Allow-Origin': 'https://haven.study',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'sale')
    .single();

  const sale = (data?.value as { active: boolean; discount: number }) ?? {
    active: false,
    discount: 0,
  };

  return {
    statusCode: 200,
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: JSON.stringify(sale),
  };
};
