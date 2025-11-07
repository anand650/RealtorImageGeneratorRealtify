// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Next.js Request/Response APIs
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill for fetch API if not available (Next.js 16+ has native fetch)
if (typeof global.fetch === 'undefined') {
  // Use native fetch from Node.js 18+ or mock it for tests
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Simple mock implementation for tests
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({}),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
      headers: new Headers(),
      url: typeof input === 'string' ? input : input.toString(),
    } as Response
  }
}

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || 'test-aws-key'
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || 'test-aws-secret'
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1'
process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'test-bucket'
process.env.DISABLE_AUTH = 'false'
process.env.APP_URL = 'http://localhost:3000'

// Suppress console errors during tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => {
  const React = require('react')
  return {
    useAuth: jest.fn(() => ({
      isSignedIn: true,
      userId: 'test-user-id',
      isLoaded: true,
    })),
    useUser: jest.fn(() => ({
      user: {
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      },
      isLoaded: true,
    })),
    SignedIn: ({ children }: { children: any }) => {
      return React.createElement(React.Fragment, null, children)
    },
    SignedOut: ({ children }: { children: any }) => {
      return React.createElement(React.Fragment, null, children)
    },
    UserButton: () => {
      return React.createElement('div', null, 'UserButton')
    },
  }
})

jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(),
  auth: jest.fn(),
}))

