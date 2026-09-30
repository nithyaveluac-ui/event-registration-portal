# AWS Quick Reference Card

Quick reference for AWS resource configuration. See `aws-setup-guide.md` for detailed instructions.

---

## 1. DynamoDB Table

```
Service: DynamoDB
Action: Create table

Table name: EventRegistrations
Partition key: registrationId (String)
Sort key: None
Capacity mode: On-demand
Encryption: Default (AWS managed)
```

**Test**: Create and delete a sample item

---

## 2. IAM Role

```
Service: IAM > Roles
Action: Create role

Role name: EventRegistrationLambdaRole
Trusted entity: AWS Lambda
Managed policy: AWSLambdaBasicExecutionRole
```

**Inline Policy** (replace REGION and ACCOUNT_ID):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:GetItem"],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/EventRegistrations"
    },
    {
      "Effect": "Allow",
      "Action": ["sns:Publish"],
      "Resource": "arn:aws:sns:REGION:ACCOUNT_ID:RegistrationNotifications"
    }
  ]
}
```

---

## 3. Lambda: registerStudent

```
Service: Lambda
Action: Create function

Function name: registerStudent
Runtime: Node.js 18.x
Architecture: x86_64
Execution role: EventRegistrationLambdaRole
Memory: 256 MB
Timeout: 10 seconds
```

**Upload**: `backend/functions/registerStudent/registerStudent.zip`

**Environment Variables**:
```
TABLE_NAME=EventRegistrations
AWS_REGION=us-east-1
SNS_TOPIC_ARN=(set after SNS creation)
```

**Test Event**:
```json
{
  "httpMethod": "POST",
  "body": "{\"studentName\":\"John Doe\",\"studentEmail\":\"john@test.com\",\"studentId\":\"TEST123\",\"eventName\":\"Tech Workshop 2026\"}"
}
```

---

## 4. Lambda: listRegistrations

```
Service: Lambda
Action: Create function

Function name: listRegistrations
Runtime: Node.js 18.x
Architecture: x86_64
Execution role: EventRegistrationLambdaRole
Memory: 256 MB
Timeout: 10 seconds
```

**Upload**: `backend/functions/listRegistrations/listRegistrations.zip`

**Environment Variables**:
```
TABLE_NAME=EventRegistrations
AWS_REGION=us-east-1
```

**Test Event**:
```json
{
  "httpMethod": "GET"
}
```

---

## 5. API Gateway

```
Service: API Gateway
Action: Create API

API type: REST API (not HTTP API)
API name: event-registration-api
Endpoint type: Regional
```

### Resource
```
Resource name: registrations
Resource path: /registrations
```

### Methods

**POST Method**:
```
Integration: Lambda Function
Lambda Proxy: Enabled
Function: registerStudent
```

**GET Method**:
```
Integration: Lambda Function
Lambda Proxy: Enabled
Function: listRegistrations
```

### CORS
```
Action: Enable CORS on /registrations
Access-Control-Allow-Origin: *
Methods: GET, POST, OPTIONS
```

### Deploy
```
Stage name: dev
```

**Copy Invoke URL** (format):
```
https://XXXXXXXXXX.execute-api.REGION.amazonaws.com/dev
```

---

## 6. SNS Topic

```
Service: SNS
Action: Create topic

Type: Standard
Name: RegistrationNotifications
Display name: Event Registrations
```

**Copy Topic ARN** then:
1. Update registerStudent Lambda
2. Environment variable: `SNS_TOPIC_ARN`

---

## Testing Commands

### Test API with curl

```bash
# Set your API URL
export API_URL="https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev"

# POST - Create registration
curl -X POST $API_URL/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Test Student",
    "studentEmail": "test@example.com",
    "studentId": "TEST001",
    "eventName": "Tech Workshop 2026"
  }'

# GET - List registrations
curl $API_URL/registrations
```

### Expected Responses

**POST Success (201)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "registrationId": "reg_1727712000000_abc123",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

**GET Success (200)**:
```json
{
  "success": true,
  "count": 1,
  "registrations": [...]
}
```

---

## Deployment Package Creation

```bash
# Option 1: Use deployment script
cd backend
chmod +x deploy.sh
./deploy.sh

# Option 2: Manual
cd backend/functions/registerStudent
npm install
zip -r registerStudent.zip .

cd ../listRegistrations
npm install
zip -r listRegistrations.zip .
```

---

## Verification Checklist

- [ ] DynamoDB table active
- [ ] IAM role created with policies
- [ ] registerStudent Lambda deployed and tested
- [ ] listRegistrations Lambda deployed and tested
- [ ] API Gateway deployed to dev stage
- [ ] POST /registrations working
- [ ] GET /registrations working
- [ ] CORS headers present
- [ ] SNS topic created
- [ ] SNS topic ARN set in Lambda
- [ ] Data persists in DynamoDB
- [ ] CloudWatch Logs show executions

---

## Resource ARNs to Document

```
DynamoDB: arn:aws:dynamodb:REGION:ACCOUNT:table/EventRegistrations
IAM Role: arn:aws:iam::ACCOUNT:role/EventRegistrationLambdaRole
Lambda 1: arn:aws:lambda:REGION:ACCOUNT:function:registerStudent
Lambda 2: arn:aws:lambda:REGION:ACCOUNT:function:listRegistrations
API Gateway: https://XXXXXXXXXX.execute-api.REGION.amazonaws.com/dev
SNS Topic: arn:aws:sns:REGION:ACCOUNT:RegistrationNotifications
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Lambda timeout | Increase timeout or check network issues |
| Access Denied | Verify IAM role has correct permissions |
| CORS error | Enable CORS in API Gateway and redeploy |
| 502 Bad Gateway | Check Lambda logs for errors |
| Module not found | Ensure npm install ran before zip |

---

**Quick Setup Time**: ~1 hour for manual AWS configuration

For detailed step-by-step instructions, see `aws-setup-guide.md`.
