/**
 * End-to-end test for the AskPippa AI function.
 * Creates a temporary Premium test user, sends a question, verifies a response,
 * then cleans up. The real Premium account is never touched.
 *
 * Run with: npx tsx scripts/test-ask-pippa.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://auth.havenstudy.app';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXRqYmxoaHFmenVhem5hcnplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc4MjMxMywiZXhwIjoyMDc3MzU4MzEzfQ.Ysv9qI8DYtWoxKjgQjvpQ-PFqSzrBePERv9xaVRMRmc';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXRqYmxoaHFmenVhem5hcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODIzMTMsImV4cCI6MjA3NzM1ODMxM30.U7EDzgZv5XPtKXjvy6Cpdbf-dvgREH1PFtbdo8KmasE';

const FUNCTION_URL = 'https://havenstudy.app/.netlify/functions/ask-pippa';
const TEST_EMAIL = `pippa-test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPippa99!';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let passed = 0;
let failed = 0;
let testUserId = '';

function ok(label: string, detail?: string) {
  console.log(`  ✅ ${label}${detail ? `  (${detail})` : ''}`);
  passed++;
}
function fail(label: string, err: string) {
  console.error(`  ❌ ${label}: ${err}`);
  failed++;
}

async function run() {
  console.log('\n🤖 AskPippa E2E test\n');

  // ── 1. Create test user ────────────────────────────────────────────────
  console.log('1. Creating test user…');
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    fail('Create test user', createErr?.message ?? 'no user returned');
    return summarise();
  }
  testUserId = created.user.id;
  ok('Test user created', TEST_EMAIL);

  // ── 2. Promote to Premium ──────────────────────────────────────────────
  console.log('\n2. Setting subscription to Premium…');
  const { error: tierErr } = await admin
    .from('profiles')
    .update({ subscription_tier: 'premium' })
    .eq('id', testUserId);
  if (tierErr) {
    fail('Set Premium tier', tierErr.message);
    return cleanup();
  }
  ok('Profile set to premium');

  // ── 3. Sign in as test user ────────────────────────────────────────────
  console.log('\n3. Signing in as test user…');
  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInErr || !signIn.session) {
    fail('Sign in', signInErr?.message ?? 'no session');
    return cleanup();
  }
  const token = signIn.session.access_token;
  ok('Signed in', 'access token obtained');

  // ── 4. Call ask-pippa — simple question ───────────────────────────────
  console.log('\n4. Sending question to Pippa…');
  const res1 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'What year did World War Two end?' }),
  });
  if (!res1.ok) {
    const body = await res1.text();
    fail('Ask question', `HTTP ${res1.status}: ${body}`);
    return cleanup();
  }
  const { reply } = await res1.json();
  if (!reply || reply.length < 10) {
    fail('Response content', `reply too short: "${reply}"`);
  } else {
    ok('Received reply', reply.slice(0, 80) + (reply.length > 80 ? '…' : ''));
  }

  // ── 5. Call with conversation history ─────────────────────────────────
  console.log('\n5. Sending follow-up with history…');
  const res2 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      message: 'And when did the First World War end?',
      history: [
        { role: 'user', content: 'What year did World War Two end?' },
        { role: 'assistant', content: reply },
      ],
    }),
  });
  if (!res2.ok) {
    fail('Follow-up question', `HTTP ${res2.status}: ${await res2.text()}`);
  } else {
    const { reply: reply2 } = await res2.json();
    ok('Follow-up reply received', reply2.slice(0, 80) + (reply2.length > 80 ? '…' : ''));
  }

  // ── 6. Reject free user ───────────────────────────────────────────────
  console.log('\n6. Verifying free users are rejected…');
  await admin.from('profiles').update({ subscription_tier: 'free' }).eq('id', testUserId);
  const res3 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'Hello?' }),
  });
  if (res3.status === 403) {
    ok('Free user correctly rejected', 'HTTP 403');
  } else {
    fail('Free user rejection', `Expected 403, got ${res3.status}`);
  }

  // ── 7. Reject unauthenticated ─────────────────────────────────────────
  console.log('\n7. Verifying unauthenticated requests are rejected…');
  const res4 = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello?' }),
  });
  if (res4.status === 401) {
    ok('Unauthenticated request rejected', 'HTTP 401');
  } else {
    fail('Unauthenticated rejection', `Expected 401, got ${res4.status}`);
  }

  await cleanup();
}

async function cleanup() {
  if (testUserId) {
    await admin.auth.admin.deleteUser(testUserId);
    console.log('\n🧹 Test user deleted');
  }
  summarise();
}

function summarise() {
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('🎉 All tests passed!');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  cleanup();
});
