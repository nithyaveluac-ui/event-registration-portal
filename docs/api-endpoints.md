# API Documentation

REST API endpoints for the Event Registration Portal.

## Base URL

```
https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev
```

Replace `YOUR_API_ID` and `REGION` with your actual values from API Gateway.

---

## Authentication

**None** - This is a public API with no authentication (MVP scope).

⚠️ **Warning**: In production, implement proper authentication using AWS Cognito or similar.

---

## CORS Configuration

All endpoints support CORS with the following configuration:

- **Access-Control-Allow-Origin**: `*` (all origins)
- **Access-Control-Allow-Methods**: `GET, POST, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type`

---

## Endpoints

### 1. Create Registration

Create a new event registration.

**Endpoint**: `POST /registrations`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "studentName": "John Doe",
  "studentEmail": "john.doe@kirouniversity.edu",
  "studentId": "KU12345",
  "eventName": "Tech Workshop 2026"
}
```

**Request Body Schema**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| studentName | string | Yes | Non-empty, max 100 chars | Full name of the student |
| studentEmail | string | Yes | Valid email format | Student email address |
| studentId | string | Yes | Non-empty, max 20 chars | University student ID |
| eventName | string | Yes | One of predefined events | Event to register for |

**Valid Event Names**:
- `Tech Workshop 2026`
- `Career Fair 2026`
- `Hackathon 2026`

#### Success Response

**Status Code**: `201 Created`

**Response Body**:
```json
{
  "success": true,
  "message": "Registration successful",
  "registrationId": "reg_1727712000000_abc123",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful requests |
| message | string | Human-readable success message |
| registrationId | string | Unique identifier for the registration |
| timestamp | string | ISO 8601 timestamp of registration |

#### Error Responses

**Status Code**: `400 Bad Request` (Validation Error)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "studentName": "Student name is required",
    "studentEmail": "Please enter a valid email address"
  }
}
```

**Status Code**: `500 Internal Server Error` (System Error)

```json
{
  "success": false,
  "message": "Database error: Failed to store registration",
  "error": "Error message (in development mode only)"
}
```

#### Example Requests

**cURL**:
```bash
curl -X POST https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "studentEmail": "john.doe@kirouniversity.edu",
    "studentId": "KU12345",
    "eventName": "Tech Workshop 2026"
  }'
```

**JavaScript (fetch)**:
```javascript
fetch('https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentName: 'John Doe',
    studentEmail: 'john.doe@kirouniversity.edu',
    studentId: 'KU12345',
    eventName: 'Tech Workshop 2026'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Python (requests)**:
```python
import requests

url = 'https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations'
data = {
    'studentName': 'John Doe',
    'studentEmail': 'john.doe@kirouniversity.edu',
    'studentId': 'KU12345',
    'eventName': 'Tech Workshop 2026'
}

response = requests.post(url, json=data)
print(response.json())
```

---

### 2. List Registrations

Retrieve all event registrations.

**Endpoint**: `GET /registrations`

**Request Headers**: None required

**Request Body**: None

#### Success Response

**Status Code**: `200 OK`

**Response Body**:
```json
{
  "success": true,
  "count": 2,
  "registrations": [
    {
      "registrationId": "reg_1727712100000_def456",
      "studentName": "Jane Smith",
      "studentEmail": "jane.smith@kirouniversity.edu",
      "studentId": "KU67890",
      "eventName": "Career Fair 2026",
      "timestamp": "2026-09-30T14:32:00.000Z"
    },
    {
      "registrationId": "reg_1727712000000_abc123",
      "studentName": "John Doe",
      "studentEmail": "john.doe@kirouniversity.edu",
      "studentId": "KU12345",
      "eventName": "Tech Workshop 2026",
      "timestamp": "2026-09-30T14:30:00.000Z"
    }
  ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` for successful requests |
| count | number | Total number of registrations |
| registrations | array | Array of registration objects |

**Registration Object**:

| Field | Type | Description |
|-------|------|-------------|
| registrationId | string | Unique identifier |
| studentName | string | Student's full name |
| studentEmail | string | Student's email address |
| studentId | string | University student ID |
| eventName | string | Name of the event |
| timestamp | string | ISO 8601 timestamp |

**Sorting**: Registrations are sorted by timestamp, newest first.

#### Error Response

**Status Code**: `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Database error: Failed to fetch registrations",
  "error": "Error message (in development mode only)"
}
```

#### Example Requests

**cURL**:
```bash
curl https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations
```

**JavaScript (fetch)**:
```javascript
fetch('https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations')
  .then(response => response.json())
  .then(data => {
    console.log(`Total registrations: ${data.count}`);
    console.log('Registrations:', data.registrations);
  });
```

**Python (requests)**:
```python
import requests

url = 'https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations'
response = requests.get(url)
data = response.json()

print(f"Total registrations: {data['count']}")
for reg in data['registrations']:
    print(f"{reg['studentName']} - {reg['eventName']}")
```

---

## Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful (GET) |
| 201 Created | Registration created successfully (POST) |
| 400 Bad Request | Invalid request data or validation error |
| 404 Not Found | Endpoint does not exist |
| 500 Internal Server Error | Server or database error |

---

## Rate Limiting

**AWS API Gateway Default Limits**:
- 10,000 requests per second
- 5,000 requests per second per account

For this student project, these limits are more than sufficient.

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": {
    "fieldName": "Field-specific error message"
  }
}
```

**Common Error Scenarios**:

1. **Missing Required Field**:
   - Status: 400
   - Message: "Validation failed"
   - Errors object contains specific field errors

2. **Invalid Email Format**:
   - Status: 400
   - Message: "Validation failed"
   - Error: "Please enter a valid email address"

3. **Database Connection Error**:
   - Status: 500
   - Message: "Database error: Failed to store registration"

4. **DynamoDB Table Not Found**:
   - Status: 500
   - Message: "Database error: Failed to fetch registrations"

---

## Testing with Postman

### Setup

1. Create a new collection: "Event Registration API"
2. Set collection variable:
   - Variable: `base_url`
   - Value: `https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev`

### Test POST /registrations

**Request**:
- Method: POST
- URL: `{{base_url}}/registrations`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "studentName": "Test Student",
  "studentEmail": "test@example.com",
  "studentId": "TEST001",
  "eventName": "Tech Workshop 2026"
}
```

**Tests** (Postman Tests tab):
```javascript
pm.test("Status code is 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Response has registrationId", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('registrationId');
  pm.expect(json.success).to.be.true;
});
```

### Test GET /registrations

**Request**:
- Method: GET
- URL: `{{base_url}}/registrations`

**Tests**:
```javascript
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has registrations array", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('registrations');
  pm.expect(json.registrations).to.be.an('array');
});
```

---

## CloudWatch Logs

All API requests are logged to CloudWatch Logs:

**Log Groups**:
- `/aws/lambda/registerStudent`
- `/aws/lambda/listRegistrations`

**What's Logged**:
- Request events
- Validation results
- Database operations
- Errors with stack traces
- Execution duration

---

## Security Considerations

### Current Implementation (MVP)

- ✅ HTTPS encryption (enforced by API Gateway)
- ✅ Input validation on all fields
- ✅ Error messages don't expose internal details
- ✅ IAM roles for service-to-service authentication
- ❌ No user authentication
- ❌ No rate limiting beyond AWS defaults
- ❌ No request signing

### Production Recommendations

1. **Add Authentication**: Implement AWS Cognito
2. **Add API Keys**: Use API Gateway API keys
3. **Add WAF**: Configure AWS WAF rules
4. **Enable Throttling**: Set custom throttling limits
5. **Input Sanitization**: Add server-side sanitization
6. **Request Validation**: Enable API Gateway request validation
7. **Enable CloudTrail**: Track all API calls

---

## Support

For issues or questions:
- Check CloudWatch Logs for error details
- Verify DynamoDB table exists and is accessible
- Ensure Lambda functions have correct environment variables
- Test API Gateway endpoint directly

---

**Last Updated**: September 30, 2026
