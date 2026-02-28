/**
 * End-to-end test for the resit support flow.
 * Run with: npx tsx scripts/test-resit-flow.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://auth.havenstudy.app';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXRqYmxoaHFmenVhem5hcnplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc4MjMxMywiZXhwIjoyMDc3MzU4MzEzfQ.Ysv9qI8DYtWoxKjgQjvpQ-PFqSzrBePERv9xaVRMRmc';
const ADMIN_EMAIL = 'hello.haven.nz@gmail.com';
const SITE_URL = 'https://havenstudy.app';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
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

// ── 1. Table structure ────────────────────────────────────────────────────
section('1. Table + bucket structure');

async function checkStructure() {
  // Table exists
  const { error: tblErr } = await admin.from('resit_claims').select('id').limit(0);
  tblErr ? fail('resit_claims table', tblErr.message) : ok('resit_claims table exists');

  // Bucket exists
  const { data: bucket, error: bktErr } = await admin.storage.getBucket('resit-evidence');
  if (bktErr || !bucket) {
    fail('resit-evidence bucket', bktErr?.message ?? 'not found');
  } else {
    ok('resit-evidence bucket exists', `public=${bucket.public}`);
  }
}

// ── 2. Insert a test claim ────────────────────────────────────────────────
section('2. Insert test claim (service role)');

async function insertTestClaim(userId: string, userEmail: string): Promise<string | null> {
  const { data, error } = await admin
    .from('resit_claims')
    .insert({
      user_id: userId,
      user_email: userEmail,
      evidence_path: `${userId}/test-evidence-${Date.now()}.jpg`,
      status: 'pending',
    })
    .select('id, status')
    .single();

  if (error) { fail('Insert test claim', error.message); return null; }
  ok('Test claim inserted', `id=${data.id} status=${data.status}`);
  return data.id;
}

// ── 3. Get admin JWT via magic link ───────────────────────────────────────
section('3. Get admin JWT');

async function getAdminJwt(): Promise<string | null> {
  // Generate a magic link for the admin user
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ADMIN_EMAIL,
    options: { redirectTo: 'http://localhost' },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    fail('Generate magic link', linkErr?.message ?? 'no action_link returned');
    return null;
  }
  ok('Magic link generated');

  // Follow the link with redirect:manual — the fragment in the Location header contains the token
  const res = await fetch(linkData.properties.action_link, { redirect: 'manual' });
  const location = res.headers.get('location') ?? '';
  const fragment = location.split('#')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');

  if (!accessToken) {
    fail('Extract admin JWT from redirect', `Location: ${location.slice(0, 80)}`);
    return null;
  }
  ok('Admin JWT extracted from redirect');
  return accessToken;
}

// ── 4. Approve the test claim via Netlify function ───────────────────────
section('4. Approve via Netlify function');

async function testApprove(claimId: string, adminJwt: string): Promise<boolean> {
  const res = await fetch(`${SITE_URL}/.netlify/functions/approve-resit-claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`,
    },
    body: JSON.stringify({ claim_id: claimId }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    fail(`approve-resit-claim (HTTP ${res.status})`, JSON.stringify(body));
    return false;
  }

  const { ok: success, stripeExtended } = body as any;
  if (!success) { fail('Function returned ok:false', JSON.stringify(body)); return false; }
  ok(`Function returned ok:true`, `stripeExtended=${stripeExtended}`);
  if (!stripeExtended) {
    console.log('  ℹ️  stripeExtended=false — test user has no Stripe subscription (expected)');
  }
  return true;
}

// ── 5. Verify claim status in DB ─────────────────────────────────────────
section('5. Verify claim status in DB');

async function verifyApproved(claimId: string) {
  const { data, error } = await admin
    .from('resit_claims')
    .select('status, admin_notes')
    .eq('id', claimId)
    .single();

  if (error) { fail('Query claim status', error.message); return; }
  data.status === 'approved'
    ? ok(`Claim status = approved`, data.admin_notes ?? '')
    : fail('Claim status', `expected "approved", got "${data.status}"`);
}

// ── 6. Test reject path ───────────────────────────────────────────────────
section('6. Reject a fresh test claim');

async function testReject(userId: string, userEmail: string, adminJwt: string) {
  // Insert another test claim
  const { data: claim, error } = await admin
    .from('resit_claims')
    .insert({
      user_id: userId,
      user_email: userEmail,
      evidence_path: `${userId}/test-reject-${Date.now()}.jpg`,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !claim) { fail('Insert claim for reject test', error?.message ?? ''); return null; }

  const res = await fetch(`${SITE_URL}/.netlify/functions/reject-resit-claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminJwt}`,
    },
    body: JSON.stringify({ claim_id: claim.id, admin_notes: 'Automated test rejection' }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) { fail(`reject-resit-claim (HTTP ${res.status})`, JSON.stringify(body)); return claim.id; }
  ok('Reject function returned ok:true');

  const { data: updated } = await admin.from('resit_claims').select('status, admin_notes').eq('id', claim.id).single();
  updated?.status === 'rejected'
    ? ok('Claim status = rejected', updated.admin_notes ?? '')
    : fail('Claim status after reject', `got "${updated?.status}"`);

  return claim.id;
}

// ── 7. Auth guard test ────────────────────────────────────────────────────
section('7. Auth guard (bad token → 403)');

async function testAuthGuard(claimId: string) {
  const res = await fetch(`${SITE_URL}/.netlify/functions/approve-resit-claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer not-a-real-token',
    },
    body: JSON.stringify({ claim_id: claimId }),
  });
  res.status === 403 || res.status === 401
    ? ok(`Bad token correctly rejected`, `HTTP ${res.status}`)
    : fail('Auth guard', `expected 401/403, got ${res.status}`);
}

// ── 8. Clean up ───────────────────────────────────────────────────────────
section('8. Clean up test data');

async function cleanup(ids: (string | null)[]) {
  const validIds = ids.filter(Boolean) as string[];
  if (!validIds.length) return;
  const { error } = await admin.from('resit_claims').delete().in('id', validIds);
  error ? fail('Delete test claims', error.message) : ok(`Deleted ${validIds.length} test claim(s)`);
}

// ── Run all ───────────────────────────────────────────────────────────────
async function run() {
  console.log('Haven — Resit Support E2E Test');
  console.log(`Target: ${SITE_URL}\n`);

  await checkStructure();

  // Find a real user to attach the test claim to
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1 });
  const testUser = users[0];
  if (!testUser) {
    console.error('\n⚠️  No users found — cannot run claim tests. Create a user first.');
    process.exit(1);
  }
  console.log(`\n  Using test user: ${testUser.email} (${testUser.id})`);

  const claimId1 = await insertTestClaim(testUser.id, testUser.email ?? '');
  const adminJwt = await getAdminJwt();

  let claimId2: string | null = null;

  if (claimId1 && adminJwt) {
    await testApprove(claimId1, adminJwt);
    await verifyApproved(claimId1);
    claimId2 = await testReject(testUser.id, testUser.email ?? '', adminJwt);
    await testAuthGuard(claimId1); // already approved, but just tests auth
  } else {
    console.log('\n  ⏭️  Skipping function tests (missing claim or admin JWT)');
  }

  await cleanup([claimId1, claimId2]);

  console.log(`\n${'─'.repeat(52)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('\nUnhandled error:', err);
  process.exit(1);
});
