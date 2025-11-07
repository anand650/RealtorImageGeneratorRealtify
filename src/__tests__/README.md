# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Realtor Image Generator application, including unit tests, integration tests, and tests for critical edge cases and concurrency scenarios.

## Test Structure

```
src/__tests__/
├── unit/                    # Unit tests for individual functions
│   ├── utils.test.ts       # Utility functions (token calculation, formatting)
│   ├── tokens.test.ts      # Token management functions
│   └── usage-tracking.test.ts  # Usage tracking and limits
│
├── integration/             # Integration tests for API routes
│   ├── concurrency.test.ts  # Concurrent request handling
│   └── api-process.test.ts  # Image processing API tests
│
└── e2e/                     # End-to-end tests (future)
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Categories
```bash
npm run test:unit           # Only unit tests
npm run test:integration   # Only integration tests
npm run test:e2e           # Only end-to-end tests
```

## Test Categories

### Unit Tests

#### `utils.test.ts`
Tests for utility functions used throughout the application:
- **calculateTokenUsage**: Token calculation for different room types and styles
- **formatCurrency**: Currency formatting
- **formatDate/formatDateTime**: Date formatting
- **generateSlug**: URL-friendly slug generation
- **getRoomTypeDisplayName/getStyleDisplayName**: Display name conversion

**Key Test Scenarios:**
- Base token calculation (1 token for simple styles)
- Style multipliers (luxury = 1.5x, minimalist = 0.8x, etc.)
- Unknown style/room type handling
- Edge cases (empty strings, special characters)

#### `tokens.test.ts`
Tests for token management system:
- **checkTokenAvailability**: Token availability checks
- **consumeTokens**: Token consumption and logging
- **refreshMonthlyTokens**: Monthly token refresh
- **upgradePlan**: Plan upgrade functionality

**Key Test Scenarios:**
- Token availability validation
- Token consumption with logging
- Monthly token refresh (when period ends)
- Plan upgrades and token allocation adjustments
- Edge cases (missing user/tenant)

#### `usage-tracking.test.ts`
Tests for usage tracking system:
- **checkAnonymousUsage**: Anonymous user limits (2 free images)
- **checkUserUsage**: Authenticated user limits (free tier + subscription)
- **recordAnonymousUsage**: Recording anonymous usage
- **recordUserUsage**: Recording authenticated usage

**Key Test Scenarios:**
- Anonymous user limits (2 total, 2 per day)
- Free tier limits (4 images for registered users)
- Subscription-based limits
- Daily usage tracking
- Usage recording and logging

### Integration Tests

#### `concurrency.test.ts`
**CRITICAL:** Tests for concurrent request handling scenarios that simulate production load.

**Key Test Scenarios:**
1. **Token Update Race Condition**
   - Problem: Multiple requests can read the same token value and overwrite each other
   - Expected: Atomic database increments prevent lost updates
   - Test: Verifies atomic increment operations

2. **Status Check Race Condition**
   - Problem: Two requests can both see status='pending' and proceed to process
   - Expected: Only one request should process an image
   - Test: Verifies atomic status updates

3. **Database Connection Pool Exhaustion**
   - Problem: Too many concurrent requests can exhaust connection pool
   - Expected: System handles connection limits gracefully
   - Test: Verifies connection pool management

4. **Token Calculation Accuracy**
   - Problem: Concurrent token calculations should be consistent
   - Expected: All calculations return the same value
   - Test: Verifies calculation consistency

5. **Gemini API Rate Limiting**
   - Problem: 20 concurrent requests will hit rate limits
   - Expected: System handles rate limit errors gracefully
   - Test: Verifies error handling for rate limits

6. **Response Time Optimization**
   - Problem: Synchronous processing blocks for 15-30 seconds
   - Expected: Async processing returns quickly
   - Test: Demonstrates need for async queue system

#### `api-process.test.ts`
Tests for the `/api/images/process` endpoint:

**Key Test Scenarios:**
1. **Authentication and Authorization**
   - Unauthenticated requests rejected
   - Authenticated requests proceed

2. **Usage Limit Validation**
   - Usage limit exceeded rejection
   - Token validation checks

3. **Image Status Validation**
   - Already processing images rejected
   - Completed images rejected

4. **Race Condition Tests**
   - Concurrent status checks
   - Demonstrates need for atomic operations

5. **Error Handling**
   - Gemini API errors handled gracefully
   - Token refunds on failure
   - Status updates on failure

## Test Explanations

Each test includes detailed comments explaining:
- **What it tests**: The specific functionality being tested
- **Why it matters**: Why this test is important
- **What to expect**: Expected behavior
- **Edge cases**: Special scenarios covered

## Known Issues Discovered

The test suite has identified several critical issues:

1. **Race Conditions in Token Updates**
   - Issue: Non-atomic token updates can lose data
   - Solution: Use Prisma's `increment` operation

2. **Status Check Race Condition**
   - Issue: Multiple requests can process same image
   - Solution: Use database transactions or optimistic locking

3. **Gemini API Rate Limiting**
   - Issue: Concurrent requests hit rate limits
   - Solution: Implement request queue with rate limiting

4. **Synchronous Processing**
   - Issue: Requests block for 15-30 seconds
   - Solution: Implement async processing with status polling

5. **Database Connection Pool Exhaustion**
   - Issue: Too many concurrent requests exhaust connections
   - Solution: Implement connection pooling and request queuing

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies (Prisma, Clerk, Gemini) are mocked
3. **Coverage**: Tests cover happy paths, error cases, and edge cases
4. **Documentation**: Each test explains what it tests and why
5. **Realistic Scenarios**: Tests simulate production scenarios (e.g., 20 concurrent requests)

## Writing New Tests

When adding new functionality:

1. **Write tests first** (TDD approach when possible)
2. **Test happy path** (normal operation)
3. **Test error cases** (what happens when things go wrong)
4. **Test edge cases** (boundary conditions, empty inputs, etc.)
5. **Test concurrency** (if applicable)
6. **Document tests** (explain what and why)

## Continuous Integration

Tests should be run:
- Before every commit
- On every pull request
- Before every deployment
- In CI/CD pipeline

## Coverage Goals

- **Unit Tests**: 80%+ coverage for utility functions
- **Integration Tests**: Critical paths covered (authentication, image processing, billing)
- **Edge Cases**: All known edge cases covered
- **Concurrency**: Production-load scenarios tested

## Troubleshooting

### Tests Failing

1. **Check environment variables**: Ensure test environment is configured
2. **Check mocks**: Verify mocks are properly set up
3. **Check database state**: Ensure test database is clean
4. **Check dependencies**: Ensure all dependencies are installed

### Tests Slow

1. **Reduce timeout**: Adjust Jest timeout if needed
2. **Run specific tests**: Use `--testPathPattern` to run subset
3. **Parallel execution**: Ensure tests can run in parallel

### Mock Issues

1. **Reset mocks**: Use `beforeEach` to clear mocks
2. **Check mock setup**: Verify mocks match actual implementation
3. **Check async handling**: Ensure async mocks are properly awaited

## Next Steps

1. Add E2E tests for critical user flows
2. Add performance tests
3. Add load tests
4. Add security tests
5. Integrate with CI/CD pipeline

