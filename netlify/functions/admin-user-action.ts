import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';
// 100 years — effectively permanent ban
const FREEZE_DURATION = '876000h';

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

  // Verify caller is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  const { action, user_id } = JSON.parse(event.body ?? '{}') as {
    action: 'freeze' | 'unfreeze' | 'delete';
    user_id: string;
  };

  if (!action || !user_id) {
    return { statusCode: 400, body: 'Missing action or user_id' };
  }
  if (user_id === user.id) {
    return { statusCode: 400, body: 'Cannot perform this action on your own account' };
  }

  try {
    if (action === 'freeze') {
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        ban_duration: FREEZE_DURATION,
      });
      if (error) throw error;
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'unfreeze') {
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        ban_duration: 'none',
      });
      if (error) throw error;
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'delete') {
      const { error } = await supabase.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, body: `Unknown action: ${action}` };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};
