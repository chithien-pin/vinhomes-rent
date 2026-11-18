import assert from "node:assert/strict";

process.env.ADMIN_PASSWORD = "test-password";
process.env.SESSION_SECRET = "test-session-secret";

async function main() {
  const {
    createSessionToken,
    getAdminCredentials,
    verifySessionToken,
  } = await import("../src/lib/session");

  const credentials = getAdminCredentials();
  assert.equal(credentials.configured, true);
  assert.equal(credentials.username, "admin");
  assert.equal(credentials.password, "test-password");

  const token = await createSessionToken();
  assert.equal(await verifySessionToken(token), true);
  assert.equal(await verifySessionToken(`${token}x`), false);
  assert.equal(await verifySessionToken(undefined), false);

  console.log("Auth session checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
