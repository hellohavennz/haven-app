import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = (event.headers['authorization'] ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return { statusCode: 401, body: 'Missing token' };

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const { claim_id, admin_notes } = JSON.parse(event.body ?? '{}');
  if (!claim_id) return { statusCode: 400, body: 'Missing claim_id' };

  await supabase
    .from('resit_claims')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: admin_notes || 'Rejected',
    })
    .eq('id', claim_id);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
