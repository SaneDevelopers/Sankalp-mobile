/**
 * Quick test to verify:
 * 1. POST /api/auth/google is now reachable (was 404 due to double /auth prefix)
 * 2. POST /api/auth/register + GET /api/auth/me works (token flow)
 * 3. POST /api/auth/login + GET /api/auth/me works (token flow)
 */

const BASE = "http://localhost:5000";

async function test() {
  console.log("=== Test 1: Google Auth route is reachable ===");
  try {
    const googleRes = await fetch(`${BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "mock_dev_google_id_token" }),
    });
    console.log(`  Status: ${googleRes.status} (expected 200)`);
    if (googleRes.ok) {
      const data = await googleRes.json();
      console.log(`  ✅ Google auth works! Token: ${data.token?.substring(0, 20)}...`);
      console.log(`  User: ${data.user?.name} (${data.user?.email})`);
    } else {
      const body = await googleRes.text();
      console.log(`  ❌ Google auth failed: ${body}`);
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }

  console.log("\n=== Test 2: Register + /me flow ===");
  const testEmail = `test_${Date.now()}@fix.com`;
  try {
    const regRes = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Fix User",
        email: testEmail,
        password: "test12345678",
      }),
    });
    console.log(`  Register status: ${regRes.status}`);
    if (regRes.ok) {
      const data = await regRes.json();
      const token = data.token;
      console.log(`  Token: ${token?.substring(0, 20)}...`);

      // Now call /me with the token
      const meRes = await fetch(`${BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  /me status: ${meRes.status} (expected 200)`);
      if (meRes.ok) {
        const user = await meRes.json();
        console.log(`  ✅ /me works! User: ${user.name} (${user.email})`);
      } else {
        console.log(`  ❌ /me failed: ${await meRes.text()}`);
      }
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }

  console.log("\n=== Test 3: Login with test user ===");
  try {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "ayushvprop@gmail.com",
        password: "123456789",
      }),
    });
    console.log(`  Login status: ${loginRes.status}`);
    if (loginRes.ok) {
      const data = await loginRes.json();
      console.log(`  ✅ Login works! Token: ${data.token?.substring(0, 20)}...`);
      
      const meRes = await fetch(`${BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      console.log(`  /me status: ${meRes.status} (expected 200)`);
      if (meRes.ok) {
        const user = await meRes.json();
        console.log(`  ✅ /me after login works! User: ${user.name} (${user.email})`);
      }
    } else {
      const body = await loginRes.json().catch(() => loginRes.text());
      console.log(`  Login result: ${JSON.stringify(body)}`);
      console.log("  (User may not exist yet - that's OK, register first)");
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }
}

test();
