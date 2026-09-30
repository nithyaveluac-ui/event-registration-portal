# Backend Lambda Functions

This directory contains AWS Lambda functions for the Event Registration Portal backend.

## Functions

### 1. registerStudent

**Purpose**: Handle student event registration requests

**Trigger**: API Gateway POST /registrations

**Environment Variables**:
- `TABLE_NAME`: DynamoDB table name (EventRegistrations)
- `SNS_TOPIC_ARN`: SNS topic ARN for notifications
- `AWS_REGION`: AWS region (e.g., us-east-1)

**Runtime**: Node.js 18.x

**Memory**: 256 MB

**Timeout**: 10 seconds

**Permissions Required**:
- dynamodb:PutItem on EventRegistrations table
- sns:Publish on RegistrationNotifications topic
- logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents

### 2. listRegistrations

**Purpose**: Retrieve all event registrations

**Trigger**: API Gateway GET /registrations

**Environment Variables**:
- `TABLE_NAME`: DynamoDB table name (EventRegistrations)
- `AWS_REGION`: AWS region (e.g., us-east-1)

**Runtime**: Node.js 18.x

**Memory**: 256 MB

**Timeout**: 10 seconds

**Permissions Required**:
- dynamodb:Scan on EventRegistrations table
- logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents

## Deployment

### Prerequisites

1. Node.js 18.x or higher installed
2. AWS CLI configured with appropriate credentials
3. IAM role created with necessary permissions

### Deploy registerStudent Function

```bash
cd functions/registerStudent
npm install
zip -r registerStudent.zip .
# Upload registerStudent.zip through AWS Lambda Console
```

### Deploy listRegistrations Function

```bash
cd functions/listRegistrations
npm install
zip -r listRegistrations.zip .
# Upload listRegistrations.zip through AWS Lambda Console
```

## Testing Locally

You can test the Lambda functions locally using sample event files:

### Test registerStudent

Create a test event file `test-register-event.json`:

```json
{
  "httpMethod": "POST",
  "body": "{\"studentName\":\"John Doe\",\"studentEmail\":\"john@test.com\",\"studentId\":\"TEST123\",\"eventName\":\"Tech Workshop 2026\"}"
}
```

### Test listRegistrations

Create a test event file `test-list-event.json`:

```json
{
  "httpMethod": "GET"
}
```

## Error Handling

Both functions include comprehensive error handling:

- **400 Bad Request**: Validation errors (missing/invalid fields)
- **500 Internal Server Error**: Database or system errors

All responses include CORS headers for frontend integration.

## Logging

All functions log to CloudWatch Logs:
- Request events
- Validation results
- Database operations
- Errors with stack traces

## Security Considerations

- All user inputs are validated before processing
- Email addresses are normalized to lowercase
- Whitespace is trimmed from all fields
- SNS failures don't block registration success
- Minimal error information exposed to clients
- DynamoDB access restricted by IAM policies
