---
name: eventhub-testing
description: Test the EventHub event registration portal using Vitest and fast-check. Use this skill when validating registration correctness, required fields, email formats, registration IDs, API behavior, DynamoDB persistence, SNS independence, or CORS behavior.
---

# EventHub Testing

Use this skill when working on automated tests for the EventHub event registration portal.

## Testing stack

- Vitest for test execution
- fast-check for property-based testing
- React/Vite frontend
- AWS Lambda backend
- API Gateway
- DynamoDB
- SNS

## Core correctness properties

1. Registration IDs must follow the `reg_<timestamp>_<random>` format and remain unique.
2. Registration records must contain:
   - studentName
   - studentEmail
   - studentId
   - eventName
   - timestamp
3. Student email values must contain `@` and a domain component.
4. Successfully stored registrations must persist in DynamoDB.
5. SNS notification failure must not cause a successful registration to fail.
6. API responses must provide the required CORS headers.

## Test commands

Run the frontend property tests with:

`npm test -- --run`

Build the frontend after dependency or configuration changes with:

`npm run build`

## Project conventions

- Do not deploy or use `backend/functions/updateRegistration/`.
- Do not modify working AWS infrastructure unless the task specifically requires it.
- Prefer isolated tests over changing production Lambda code.
- Keep test files under `frontend/tests/`.
- Use property-based tests for general correctness rules rather than only fixed examples.
- Verify the production build after significant frontend changes.

## Expected test behavior

Property tests should generate multiple valid inputs and verify invariants rather than relying on a single hard-coded registration.

Tests must be deterministic enough to reproduce failures and must not require production AWS credentials unless explicitly testing an integration boundary.
