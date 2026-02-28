/**
 * End-to-end test for the forgot password flow.
 * Uses a dedicated test user (created + deleted by the script) so the
 * admin password is never touched.
 *
 * Run with: npx tsx scripts/test-forgot-password.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://auth.havenstudy.app';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXRqYmxoaHFmenVhem5hcnplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc4MjMxMywiZXhwIjoyMDc3MzU4MzEzfQ.Ysv9qI8DYtWoxKjgQjvpQ-PFqSzrBePERv9xaVRMRmc';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXRqYmxoaHFmenVhem5hcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODIzMTMsImV4cCI6MjA3NzM1ODMxM30.U7EDzgZv5XPtKXjvy6Cpdbf-dvgREH1PFtbdo8KmasE';

const TEST_EMAIL = `haven-test-reset-${Date.now()}@example.com`;
const INITIAL_PASSWORD = 'InitialPass123!';
const NEW_PASSWORD = 'NewPass456!';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client — used to simulate what the browser does
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let passed = 0;
let failed = 0;

function ok(label: string, detail?: string) {
  console.log(`  ✅ ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, err: string) {
  console.error(`  ❌ ${label}: ${err}`);
  failed++;
}
function section(title: string) {
  console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`);
}

async function run() {
  console.log('Haven — Forgot Password E2E Test');
  console.log(`Test user: ${TEST_EMAIL}\n`);

  // ── 1. Create a fresh test user ─────────────────────────────────────────
  section('1. Create test user');
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: INITIAL_PASSWORD,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    fail('Create test user', createErr?.message ?? 'no user returned');
    process.exit(1);
  }
  const userId = created.user.id;
  ok('Test user created', userId);

  // ── 2. Verify initial sign-in works ─────────────────────────────────────
  section('2. Verify initial sign-in');
  const { error: signInErr1 } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: INITIAL_PASSWORD,
  });
  signInErr1
    ? fail('Sign in with initial password', signInErr1.message)
    : ok('Sign in with initial password works');

  // ── 3. Generate a recovery link (simulates "send reset email") ──────────
  section('3. Generate recovery link');
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: TEST_EMAIL,
    options: { redirectTo: 'https://havenstudy.app/uk/reset-password' },
  });
  if (linkErr || !linkData?.properties?.action_link) {
    fail('Generate recovery link', linkErr?.message ?? 'no action_link');
    await cleanup(userId);
    process.exit(1);
  }
  ok('Recovery link generated');

  // ── 4. Follow the link and extract the access token ─────────────────────
  section('4. Extract recovery token from redirect');
  const res = await fetch(linkData.properties.action_link, { redirect: 'manual' });
  const location = res.headers.get('location') ?? '';
  const fragment = location.split('#')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const tokenType = params.get('type');

  if (!accessToken || !refreshToken) {
    fail('Extract tokens from redirect', `Location: ${location.slice(0, 120)}`);
    await cleanup(userId);
    process.exit(1);
  }
  tokenType === 'recovery'
    ? ok('token type = recovery')
    : fail('Token type', `expected "recovery", got "${tokenType}"`);
  ok('Access + refresh tokens extracted');

  // Check the redirect destination points to the right page
  const redirectDest = location.split('#')[0];
  redirectDest.includes('/uk/reset-password')
    ? ok('Redirect destination correct', redirectDest)
    : fail('Redirect destination', `got ${redirectDest}`);

  // ── 5. Use the recovery token to set a new password ─────────────────────
  section('5. Update password via recovery session');

  // Set the session on the anon client — this is what the browser does
  // when the ResetPassword page mounts and onAuthStateChange fires
  const { error: sessionErr } = await anon.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  sessionErr
    ? fail('Set recovery session', sessionErr.message)
    : ok('Recovery session established');

  const { error: updateErr } = await anon.auth.updateUser({ password: NEW_PASSWORD });
  updateErr
    ? fail('Update password', updateErr.message)
    : ok('Password updated successfully');

  // ── 6. Verify new password works ────────────────────────────────────────
  section('6. Verify new password');

  // Need a fresh client — the previous one has a session already
  const verifyClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInErr2 } = await verifyClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: NEW_PASSWORD,
  });
  signInErr2
    ? fail('Sign in with new password', signInErr2.message)
    : ok('Sign in with new password works');

  // ── 7. Verify old password no longer works ───────────────────────────────
  section('7. Verify old password rejected');
  const { error: oldPassErr } = await verifyClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: INITIAL_PASSWORD,
  });
  oldPassErr
    ? ok('Old password correctly rejected', oldPassErr.message)
    : fail('Old password', 'should have been rejected but sign-in succeeded');

  // ── 8. Clean up ──────────────────────────────────────────────────────────
  section('8. Clean up');
  await cleanup(userId);

  console.log(`\n${'─'.repeat(52)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

async function cleanup(userId: string) {
  const { error } = await admin.auth.admin.deleteUser(userId);
  error
    ? console.error(`  ❌ Delete test user: ${error.message}`)
    : console.log(`  ✅ Test user deleted`);
}

run().catch(err => {
  console.error('\nUnhandled error:', err);
  process.exit(1);
});
