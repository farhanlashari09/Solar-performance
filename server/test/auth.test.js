import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessSystem,
  configureAuth,
  createSession,
  requireAdmin,
  requireAuth,
  resolveSession,
  revokeSession,
} from '../auth.js';

const owner = {
  id: 'user-1',
  name: 'Owner',
  email: 'owner@example.test',
  isVerified: true,
  role: 'customer',
};
const admin = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@example.test',
  isVerified: true,
  role: 'admin',
};
const system = { id: 'system-1', userId: owner.id };
configureAuth(() => [owner, admin], (user) => user.email === 'admin@example.test');

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('server sessions identify the account and expire', () => {
  const token = createSession(owner);
  assert.notEqual(token, owner.id);
  assert.equal(resolveSession(token, [owner]).id, owner.id);
  assert.equal(resolveSession(token, [owner], Date.now() + 13 * 60 * 60 * 1000), null);
});

test('system access is limited to its owner or an authenticated administrator', () => {
  assert.equal(canAccessSystem(owner, system), true);
  assert.equal(canAccessSystem({ ...owner, id: 'other-user' }, system), false);
  assert.equal(canAccessSystem(admin, system), true);
  assert.equal(canAccessSystem(null, system), false);
});

test('logout revokes the access token', () => {
  const token = createSession(owner);
  revokeSession(token);
  assert.equal(resolveSession(token, [owner]), null);
});

test('protected system APIs reject missing tokens and never accept client identities', () => {
  const missingResponse = mockResponse();
  requireAuth({ get: () => undefined }, missingResponse, () => assert.fail('request must not be authenticated'));
  assert.equal(missingResponse.statusCode, 401);

  const token = createSession(owner);
  const request = {
    get: () => `Bearer ${token}`,
    body: { userId: admin.id, role: 'admin', email: admin.email },
  };
  const response = mockResponse();
  requireAuth(request, response, () => {});
  assert.equal(request.user.id, owner.id);
  assert.equal(request.user.role, 'customer');
  assert.equal(canAccessSystem(request.user, { ...system, userId: 'other-user' }), false);
});

test('administrator API authorization requires a server-resolved admin role', () => {
  const denied = mockResponse();
  requireAdmin({ user: owner }, denied, () => assert.fail('customer must not be an admin'));
  assert.equal(denied.statusCode, 403);

  let allowed = false;
  requireAdmin({ user: admin }, mockResponse(), () => { allowed = true; });
  assert.equal(allowed, true);

  const persistedAdmin = { ...admin, id: 'unlisted-admin', email: 'unlisted@example.test' };
  const token = createSession(persistedAdmin);
  assert.equal(resolveSession(token, [persistedAdmin]).role, 'customer');
});
