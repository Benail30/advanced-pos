import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Auth0
vi.mock('@auth0/nextjs-auth0/client', () => ({
  getSession: vi.fn(() => Promise.resolve({
    user: {
      sub: 'test-user-id',
      'https://your-app/roles': ['admin'],
      'https://your-app/store_id': 'test-store-id',
    },
  })),
  withApiAuthRequired: vi.fn((handler) => handler),
  withMiddlewareAuthRequired: vi.fn((handler) => handler),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn((callback) => callback({
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 'test-transaction-id' }])),
        })),
      })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([{ quantity: 10 }])),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      })),
    })),
  },
}));

// Mock environment variables
process.env.AUTH0_SECRET = 'test-secret';
process.env.AUTH0_BASE_URL = 'http://localhost:3000';
process.env.AUTH0_ISSUER_BASE_URL = 'https://test-tenant.auth0.com';
process.env.AUTH0_CLIENT_ID = 'test-client-id';
process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'; 