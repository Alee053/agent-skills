---
name: testing
description: Test strategy, test implementation, and quality assurance
license: MIT
---

## Testing strategy

### Test pyramid
- **Unit tests**: Pure functions, business logic, edge cases (fast, many)
- **Integration tests**: API boundaries, database queries, service interactions (moderate)
- **E2E tests**: Critical user paths, happy paths only (slow, few)

### Before writing tests
1. Identify the test framework in use (Jest, Vitest, pytest, etc.)
2. Read 2-3 existing test files to understand patterns
3. Match project conventions exactly (naming, structure, utilities)
4. Check for test utilities, factories, and helpers already in the project

## Test structure (AAA pattern)
```
// Arrange: Set up test data and dependencies
// Act: Execute the code under test
// Assert: Verify the expected outcome
```

## Test naming
- Describe the behavior, not the implementation
- Include the scenario and expected outcome
- Example: `should return empty array when no items match filter`

## What to test
- Happy path (normal expected behavior)
- Edge cases (empty input, null, boundary values)
- Error cases (invalid input, network failures, timeouts)
- State transitions (before/after, setup/teardown)

## What NOT to test
- Implementation details (internal state, private methods)
- Third-party library behavior
- Trivial getters/setters with no logic

## Test quality checklist
- [ ] Each test has one clear assertion focus
- [ ] Tests are independent (no shared state)
- [ ] Tests are deterministic (no flaky timing/randomness)
- [ ] Test names describe behavior clearly
- [ ] Setup/teardown is minimal and focused
