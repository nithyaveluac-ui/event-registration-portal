# API Gateway Setup

## API

- API Name: `EventRegistrationAPI`
- API ID: `o41h3b0aw4`
- Region: `ap-south-1` (Mumbai)
- Endpoint Type: Regional
- Stage: `prod`

## Resource

- Resource: `/registrations`
- CORS: Enabled
- OPTIONS method: Enabled

## API Methods

### POST /registrations

- Lambda: `registerStudent`
- Purpose: Create student registration
- Integration: Lambda Proxy
- Authorization: NONE

### GET /registrations

- Lambda: `listRegistrations`
- Purpose: Retrieve student registrations
- Integration: Lambda Proxy
- Authorization: NONE

## Invoke URL

`https://o41h3b0aw4.execute-api.ap-south-1.amazonaws.com/prod`

## Endpoints

POST:

`https://o41h3b0aw4.execute-api.ap-south-1.amazonaws.com/prod/registrations`

GET:

`https://o41h3b0aw4.execute-api.ap-south-1.amazonaws.com/prod/registrations`

## Verification

- GET endpoint successfully returned registration records.
- POST endpoint successfully created registration `CSE003`.
- POST request returned HTTP `201`.
- API Gateway → Lambda → DynamoDB flow verified.
- SNS email notification successfully verified.

## Backend Flow

```text
React Frontend
      ↓
API Gateway
      ↓
Lambda
      ↓
DynamoDB
      ↓
SNS
      ↓
Email Notification
