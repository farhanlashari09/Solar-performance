import { randomBytes } from 'node:crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const sessions = new Map();
let usersProvider = () => [];
let administratorResolver = (user) => user.role === 'admin';

export function configureAuth(provider, isAdministrator = administratorResolver) {
  usersProvider = provider;
  administratorResolver = isAdministrator;
}

export function createSession(user) {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function revokeSession(token) {
  sessions.delete(token);
}

export function resolveSession(token, users, now = Date.now()) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= now) {
    sessions.delete(token);
    return null;
  }

  const user = users.find((candidate) => candidate.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    role: administratorResolver(user) ? 'admin' : 'customer',
    preferredLanguage: user.preferredLanguage || 'en',
    createdAt: user.createdAt,
  };
}

export function canAccessSystem(user, system) {
  return Boolean(user && system && (user.role === 'admin' || system.userId === user.id));
}

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]+)$/);
  const user = match && resolveSession(match[1], usersProvider());
  if (!user) {
    return res.status(401).json({ success: false, errorCode: 'UNAUTHENTICATED', message: 'Please sign in again.' });
  }

  req.user = user;
  req.sessionToken = match[1];
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, errorCode: 'FORBIDDEN', message: 'Administrator access is required.' });
  }
  next();
}
