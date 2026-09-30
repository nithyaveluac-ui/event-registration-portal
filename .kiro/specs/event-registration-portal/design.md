# Technical Design Document

## AWS Event Registration Portal

**Version:** 1.0  
**Last Updated:** September 30, 2026  
**Project Timeline:** 4 days

---

## Overview

The AWS Event Registration Portal is a serverless web application that enables students to register for university events and administrators to view and manage registrations. The system uses a three-tier architecture with React frontend, AWS Lambda backend, API Gateway for REST APIs, DynamoDB for data persistence, and SNS for event notifications.

**Key Design Goals**:
- Simple and achievable within 4-day timeline
- Serverless architecture for scalability and low cost
- No authentication required (public access for MVP)
- Client-side filtering to minimize backend complexity
- AWS Free Tier eligible

---

## Architecture

The AWS Event Registration Portal follows a **serverless three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React + Vite Frontend (Static SPA)               │  │
│  │   • RegistrationForm Component                           │  │
│  │   • Dashboard Component                                  │  │
│  │   • Client-side routing, search, and filtering           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Amazon API Gateway (REST API)               │  │
│  │   • POST /registrations  → registerStudent Lambda        │  │
│  │   • GET  /registrations  → listRegistrations Lambda      │  │
│  │   • CORS enabled for all origins                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Invokes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       COMPUTE LAYER                             │
│  ┌────────────────────────┐    ┌───────────────────────────┐   │
│  │  registerStudent       │    │  listRegistrations        │   │
│  │  Lambda Function       │    │  Lambda Function          │   │
│  │  • Validate input      │    │  • Scan DynamoDB table    │   │
│  │  • Generate ID         │    │  • Return all records     │   │
│  │  • Store in DynamoDB   │    │                           │   │
│  │  • Publish to SNS      │    │                           │   │
│  └────────────────────────┘    └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    │                           │
                    ▼                           ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│       DATA LAYER             │   │   NOTIFICATION LAYER     │
│  ┌────────────────────────┐  │   │  ┌────────────────────┐ │
│  │   Amazon DynamoDB      │  │   │  │   Amazon SNS       │ │
│  │   Registrations Table  │  │   │  │   Topic: reg-logs  │ │
│  │   • PK: registrationId │  │   │  │   (logging only)   │ │
│  │   • All registration   │  │   │  └────────────────────┘ │
│  │     data                │  │   └──────────────────────────┘
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### Architecture Characteristics

- **Serverless**: No server management, automatic scaling
- **Stateless**: Lambda functions are stateless, state stored in DynamoDB
- **Event-driven**: SNS notifications triggered by registration events
- **Client-side logic**: Search and filtering handled in React (no complex queries)
- **Simple deployment**: Static frontend + managed AWS services

---

## 2. Frontend Design (React + Vite)

### 2.1 Technology Stack

- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **HTTP Client**: fetch API (native browser)
- **Styling**: CSS modules or inline styles (keep it simple)
- **State Management**: React useState/useEffect hooks (no Redux needed)
- **Routing**: React Router 6.x (optional, for /register and /admin routes)

### 2.2 Component Architecture

```
src/
├── App.jsx                    # Root component with routing
├── main.jsx                   # Entry point
├── components/
│   ├── RegistrationForm.jsx   # Student registration form
│   ├── Dashboard.jsx          # Admin view of registrations
│   └── RegistrationDetails.jsx # Modal for viewing single registration
├── services/
│   └── api.js                 # API client functions
├── constants/
│   └── events.js              # Predefined event list
└── styles/
    └── App.css                # Global styles
```

### 2.3 RegistrationForm Component

**Purpose**: Allow students to register for events

**State**:
```javascript
{
  formData: {
    studentName: '',
    studentEmail: '',
    studentId: '',
    eventName: ''
  },
  errors: {},
  isSubmitting: false,
  submitSuccess: false,
  registrationId: null
}
```

**Key Functions**:
- `validateForm()`: Client-side validation before submission
- `handleSubmit()`: POST request to `/registrations`
- `handleInputChange()`: Update form state
- `resetForm()`: Clear form after successful submission

**Validation Rules**:
- All fields required
- Email must contain `@` and domain
- Student ID must be alphanumeric

### 2.4 Dashboard Component

**Purpose**: Display all registrations with search and filter

**State**:
```javascript
{
  registrations: [],          // All registrations from API
  filteredRegistrations: [], // After search/filter applied
  searchQuery: '',           // Text search input
  selectedEvent: 'All',      // Event filter dropdown
  isLoading: true,
  error: null,
  selectedRegistration: null // For details modal
}
```

**Key Functions**:
- `fetchRegistrations()`: GET request to `/registrations`
- `handleSearch()`: Filter by name, email, or ID (client-side)
- `handleEventFilter()`: Filter by event name (client-side)
- `viewDetails()`: Show registration details modal

**Display**:
- Table with columns: Name, Email, Student ID, Event, Date, Actions
- Search input box (searches name, email, ID)
- Event filter dropdown
- View Details button for each row

### 2.5 Predefined Events

Located in `src/constants/events.js`:

```javascript
export const EVENTS = [
  'Tech Workshop 2026',
  'Career Fair 2026',
  'Hackathon 2026'
];
```

---

## 3. API Gateway Design

### 3.1 REST API Configuration

**API Name**: `event-registration-api`  
**API Type**: REST API (not HTTP API, for simplicity)  
**Stage**: `dev`  
**Endpoint Type**: Regional

### 3.2 API Endpoints

#### Endpoint 1: Create Registration

```
POST /registrations
```

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

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "registrationId": "reg_1727712000000_abc123",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "studentEmail": "Invalid email format"
  }
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "message": "Failed to store registration",
  "error": "Database connection error"
}
```

#### Endpoint 2: List Registrations

```
GET /registrations
```

**Request Headers**: None required

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "registrations": [
    {
      "registrationId": "reg_1727712000000_abc123",
      "studentName": "John Doe",
      "studentEmail": "john.doe@kirouniversity.edu",
      "studentId": "KU12345",
      "eventName": "Tech Workshop 2026",
      "timestamp": "2026-09-30T14:30:00.000Z"
    },
    {
      "registrationId": "reg_1727712100000_def456",
      "studentName": "Jane Smith",
      "studentEmail": "jane.smith@kirouniversity.edu",
      "studentId": "KU67890",
      "eventName": "Career Fair 2026",
      "timestamp": "2026-09-30T14:32:00.000Z"
    }
  ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "message": "Failed to fetch registrations",
  "error": "Database scan error"
}
```

### 3.3 Integration Type

- **Lambda Proxy Integration**: Enabled
  - Lambda receives full HTTP request context
  - Lambda returns full HTTP response (status, headers, body)

---

## 4. Lambda Functions

### 4.1 registerStudent Function

**Runtime**: Node.js 18.x  
**Handler**: `index.handler`  
**Timeout**: 10 seconds  
**Memory**: 256 MB

**Responsibilities**:
1. Parse and validate request body
2. Generate unique registration ID
3. Create timestamp
4. Store registration in DynamoDB
5. Publish notification to SNS (non-blocking)
6. Return success/error response

**Input Event** (API Gateway proxy format):
```javascript
{
  body: '{"studentName":"John Doe",...}',
  headers: {...},
  httpMethod: 'POST',
  path: '/registrations'
}
```

**Function Logic**:
```javascript
export const handler = async (event) => {
  try {
    // 1. Parse request body
    const data = JSON.parse(event.body);
    
    // 2. Validate required fields
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        })
      };
    }
    
    // 3. Generate unique registration ID
    const registrationId = `reg_${Date.now()}_${generateRandomString(6)}`;
    const timestamp = new Date().toISOString();
    
    // 4. Prepare DynamoDB item
    const registration = {
      registrationId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      studentId: data.studentId,
      eventName: data.eventName,
      timestamp
    };
    
    // 5. Store in DynamoDB
    await dynamoDb.put({
      TableName: process.env.TABLE_NAME,
      Item: registration
    }).promise();
    
    // 6. Publish to SNS (non-blocking, catch errors)
    try {
      await sns.publish({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify(registration),
        Subject: 'New Registration'
      }).promise();
    } catch (snsError) {
      console.error('SNS publish failed:', snsError);
      // Continue anyway
    }
    
    // 7. Return success response
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Registration successful',
        registrationId,
        timestamp
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to store registration',
        error: error.message
      })
    };
  }
};
```

**Validation Function**:
```javascript
function validateRegistrationData(data) {
  const errors = {};
  
  if (!data.studentName || data.studentName.trim() === '') {
    errors.studentName = 'Student name is required';
  }
  
  if (!data.studentEmail || !data.studentEmail.includes('@')) {
    errors.studentEmail = 'Valid email is required';
  }
  
  if (!data.studentId || data.studentId.trim() === '') {
    errors.studentId = 'Student ID is required';
  }
  
  if (!data.eventName || data.eventName.trim() === '') {
    errors.eventName = 'Event selection is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

**Environment Variables**:
- `TABLE_NAME`: DynamoDB table name
- `SNS_TOPIC_ARN`: SNS topic ARN for notifications

**IAM Permissions Required**:
- `dynamodb:PutItem` on Registrations table
- `sns:Publish` on registration topic
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`

### 4.2 listRegistrations Function

**Runtime**: Node.js 18.x  
**Handler**: `index.handler`  
**Timeout**: 10 seconds  
**Memory**: 256 MB

**Responsibilities**:
1. Scan DynamoDB table for all registrations
2. Return registrations list
3. Handle errors

**Function Logic**:
```javascript
export const handler = async (event) => {
  try {
    // 1. Scan DynamoDB table
    const result = await dynamoDb.scan({
      TableName: process.env.TABLE_NAME
    }).promise();
    
    // 2. Sort by timestamp (newest first)
    const registrations = result.Items.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // 3. Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        count: registrations.length,
        registrations
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to fetch registrations',
        error: error.message
      })
    };
  }
};
```

**Environment Variables**:
- `TABLE_NAME`: DynamoDB table name

**IAM Permissions Required**:
- `dynamodb:Scan` on Registrations table
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`

**Note**: Using `Scan` is acceptable for a student project with limited data. For production, consider `Query` with GSI or pagination.

---

## 5. DynamoDB Table Design

### 5.1 Table Configuration

**Table Name**: `EventRegistrations`  
**Billing Mode**: On-Demand (pay per request, no capacity planning)  
**Encryption**: AWS managed key (default)

### 5.2 Primary Key Design

**Partition Key**: `registrationId` (String)
- Format: `reg_{timestamp}_{randomString}`
- Example: `reg_1727712000000_abc123`
- Ensures uniqueness and roughly chronological ordering

**No Sort Key**: Simple key-value store, single-item access pattern

### 5.3 Attribute Schema

| Attribute Name   | Type   | Required | Description                          | Example                           |
|------------------|--------|----------|--------------------------------------|-----------------------------------|
| registrationId   | String | Yes      | Unique identifier (partition key)    | `reg_1727712000000_abc123`        |
| studentName      | String | Yes      | Full name of student                 | `John Doe`                        |
| studentEmail     | String | Yes      | Student email address                | `john.doe@kirouniversity.edu`     |
| studentId        | String | Yes      | University student ID                | `KU12345`                         |
| eventName        | String | Yes      | Name of event registered for         | `Tech Workshop 2026`              |
| timestamp        | String | Yes      | ISO 8601 timestamp of registration   | `2026-09-30T14:30:00.000Z`        |

### 5.4 Sample DynamoDB Item

```json
{
  "registrationId": "reg_1727712000000_abc123",
  "studentName": "John Doe",
  "studentEmail": "john.doe@kirouniversity.edu",
  "studentId": "KU12345",
  "eventName": "Tech Workshop 2026",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

### 5.5 Access Patterns

1. **Create Registration**: `PutItem` with registrationId
2. **List All Registrations**: `Scan` (acceptable for small dataset)
3. **Get Single Registration**: `GetItem` by registrationId (not needed for MVP)

### 5.6 Considerations

- **No indexes**: Keep it simple, filtering done client-side
- **No TTL**: Keep all registrations permanently
- **No streams**: No real-time processing needed
- **On-Demand pricing**: Suitable for sporadic traffic pattern

---

## Components and Interfaces

This section describes the major components and their public interfaces.

### Frontend Component (React + Vite SPA)

**Responsibilities**:
- Render registration form for students
- Render admin dashboard
- Client-side validation, search, and filtering
- HTTP communication with API Gateway

**Key Interfaces**:

```typescript
// API Request/Response Types

// POST /registrations request
interface RegistrationRequest {
  studentName: string;
  studentEmail: string;
  studentId: string;
  eventName: string;
}

// POST /registrations response (success)
interface RegistrationSuccessResponse {
  success: true;
  message: string;
  registrationId: string;
  timestamp: string;
}

// GET /registrations response
interface ListRegistrationsResponse {
  success: true;
  count: number;
  registrations: Registration[];
}

// Error response
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
```

### API Gateway Component

**Responsibilities**:
- Expose REST endpoints over HTTPS
- Handle CORS preflight requests
- Route to Lambda functions
- Return HTTP responses

**Endpoints**:
1. `POST /registrations` → registerStudent Lambda
2. `GET /registrations` → listRegistrations Lambda

**Configuration**:
- Integration: Lambda Proxy
- CORS: Enabled for all origins
- Stage: dev

### registerStudent Lambda

**Input**: API Gateway proxy event
```javascript
{
  httpMethod: 'POST',
  body: '{"studentName":"John Doe",...}',
  headers: {...}
}
```

**Output**: HTTP response
```javascript
{
  statusCode: 201,
  headers: { 'Content-Type': 'application/json', ... },
  body: '{"success":true,"registrationId":"..."}'
}
```

**Side Effects**:
- Writes to DynamoDB
- Publishes to SNS (non-blocking)

### listRegistrations Lambda

**Input**: API Gateway proxy event

**Output**: HTTP response with registrations array

**Side Effects**:
- Reads from DynamoDB (Scan operation)

### DynamoDB Component

**Interface**: AWS SDK DynamoDB client

**Operations Used**:
- `putItem`: Create registration
- `scan`: Retrieve all registrations

**Table**: EventRegistrations (partition key: registrationId)

### SNS Component

**Interface**: AWS SDK SNS client

**Operation**: `publish` to RegistrationNotifications topic

**Message**: JSON string with registration details

---

## Data Models

### Registration Entity

Core data model representing a student's event registration.

**Storage**: DynamoDB table `EventRegistrations`

**Schema**:

| Field          | Type   | Required | Constraints               | Example                      |
|----------------|--------|----------|---------------------------|------------------------------|
| registrationId | String | Yes      | PK, format: `reg_*`       | `reg_1727712000000_abc123`   |
| studentName    | String | Yes      | Non-empty, max 100 chars  | `John Doe`                   |
| studentEmail   | String | Yes      | Valid email with @        | `john.doe@kiro.edu`          |
| studentId      | String | Yes      | Non-empty, max 20 chars   | `KU12345`                    |
| eventName      | String | Yes      | One of predefined events  | `Tech Workshop 2026`         |
| timestamp      | String | Yes      | ISO 8601 format           | `2026-09-30T14:30:00.000Z`   |

**Sample Item**:
```json
{
  "registrationId": "reg_1727712000000_abc123",
  "studentName": "John Doe",
  "studentEmail": "john.doe@kirouniversity.edu",
  "studentId": "KU12345",
  "eventName": "Tech Workshop 2026",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

**ID Generation**:
```
registrationId = "reg_" + Date.now() + "_" + randomString(6)
```

**Invariants**:
- registrationId is globally unique
- All required fields are non-null and non-empty
- Email contains @ character and domain

### Predefined Events

Events are hardcoded constants (no database management for MVP).

**Events List**:
```javascript
['Tech Workshop 2026', 'Career Fair 2026', 'Hackathon 2026']
```

**Location**: `frontend/src/constants/events.js`

---

## Correctness Properties

### Property 1: Unique Registration IDs

**Validates: Requirements 2.5**

**Statement**: Every registration shall have a globally unique registrationId.

**Mechanism**: 
- ID format: `reg_${timestampMillis}_${randomString(6)}`
- Timestamp provides millisecond precision
- Random string adds 62^6 possible combinations
- Collision probability: negligible for project scale (<10,000 registrations)

**Verification**: Check DynamoDB for duplicate IDs (should be zero)

### Property 2: Required Field Completeness

**Validates: Requirements 1, 12**

**Statement**: All registration records shall contain non-null, non-empty values for all required fields (studentName, studentEmail, studentId, eventName, timestamp).

**Mechanism**:
- Frontend validation blocks submission of incomplete forms
- Backend validation rejects requests missing required fields (returns 400)
- DynamoDB only accepts writes that pass backend validation

**Verification**: Query DynamoDB for any items with null/empty required fields (should be zero)

### Property 3: Email Format Validity

**Validates: Requirements 1.8, 12.5**

**Statement**: All studentEmail values shall contain at minimum an @ character and a domain component.

**Mechanism**:
- Frontend validation checks email format before submission
- Backend validation verifies @ character presence
- Regex pattern: `contains('@')`

**Verification**: Scan all emails in DynamoDB and validate format

### Property 4: Data Persistence

**Validates: Requirements 2.4, 10**

**Statement**: Once a registration is successfully stored and confirmed (201 response sent), it shall remain in DynamoDB indefinitely.

**Mechanism**:
- DynamoDB provides durable storage with automatic replication
- No TTL configured (data never expires)
- Strong consistency for reads after writes

**Verification**: After successful registration, verify item exists via GetItem or Scan

### Property 5: SNS Independence

**Validates: Requirements 4, 11.4**

**Statement**: Registration success shall be independent of SNS notification success. If SNS publish fails, the registration shall still be stored and confirmed.

**Mechanism**:
- SNS publish wrapped in try-catch block
- SNS errors logged but not propagated
- Registration response sent regardless of SNS outcome

**Verification**: Simulate SNS failure (invalid topic ARN) and verify registration still succeeds

### Property 6: CORS Compliance

**Validates: Requirements 13**

**Statement**: The API shall accept requests from any origin and include proper CORS headers in all responses.

**Mechanism**:
- All Lambda responses include `Access-Control-Allow-Origin: *`
- API Gateway configured for CORS with OPTIONS support
- Preflight requests return appropriate CORS headers

**Verification**: Test API from different origins (different domains/ports) and verify no CORS errors

---

## Error Handling

### Frontend Error Handling

**Client Validation Errors**:
- Display inline error messages below each field
- Prevent form submission until validation passes
- Clear errors when user corrects input

**API Errors**:
- Parse error response from backend
- Display user-friendly error message
- Provide retry mechanism

**Network Errors**:
- Catch fetch exceptions
- Display "Network error, please check your connection"
- Log to console for debugging

**Loading States**:
- Show spinner during API calls
- Disable submit button to prevent double-submission

### Backend Error Handling

**Validation Errors (400 Bad Request)**:
- Missing required fields
- Invalid email format
- Return specific error for each field

**Database Errors (500 Internal Server Error)**:
- DynamoDB connection failures
- PutItem/Scan errors
- Log full error, return generic message to client

**SNS Errors**:
- Catch and log to CloudWatch
- Do NOT fail the registration
- Continue processing normally

**Error Response Format**:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "errors": {
    "fieldName": "Specific field error"
  }
}
```

### Error Logging

All errors logged to CloudWatch Logs with:
- Timestamp
- Request context (when available)
- Error message and stack trace
- Function name and version

---

## Testing Strategy

### Backend Testing

**Unit Testing** (Optional for MVP):
- Test validation functions
- Test ID generation
- Mock AWS SDK calls

**Integration Testing** (Manual with Postman/curl):

1. **POST /registrations - Happy Path**
   - Send valid registration data
   - Expect 201 response
   - Verify item in DynamoDB
   - Verify SNS message sent

2. **POST /registrations - Validation Errors**
   - Missing studentName → 400
   - Missing email → 400
   - Invalid email format → 400
   - Verify specific error messages

3. **GET /registrations**
   - Expect 200 response
   - Verify all registrations returned
   - Check sorting (newest first)

**CloudWatch Logs Verification**:
- Check Lambda execution logs
- Verify no unexpected errors
- Monitor execution duration

### Frontend Testing

**Manual Browser Testing**:

1. **Registration Form**
   - Fill all fields → Success message
   - Submit empty → Validation errors shown
   - Invalid email → Email error shown
   - Success → Form clears

2. **Admin Dashboard**
   - Load dashboard → Table displays
   - Search by name → Results filter correctly
   - Search by email → Results filter correctly
   - Filter by event → Results filter correctly
   - View details → Modal shows all data
   - Empty state → "No registrations" message

3. **Error Scenarios**
   - Invalid API URL → Network error displayed
   - Backend returns 500 → Error message shown

**Cross-Browser Testing**:
- Chrome (primary)
- Firefox
- Safari (if available)

### Integration/E2E Testing

**Complete Workflow**:
1. Student fills form and submits
2. Verify success message with registration ID
3. Navigate to admin dashboard
4. Verify registration appears in table
5. Search for student name
6. Verify registration found
7. View details
8. Verify all fields correct

### Load Testing (Optional)

For production readiness:
- Use AWS CLI or script to create 100+ registrations
- Verify dashboard performance
- Check Lambda cold start times
- Monitor DynamoDB read/write metrics

---

## 6. SNS Integration

### 6.1 Topic Configuration

**Topic Name**: `RegistrationNotifications`  
**Type**: Standard (not FIFO)  
**Purpose**: Log registration events (no email delivery for MVP)

### 6.2 Message Format

**Subject**: `New Registration`

**Message Body**:
```json
{
  "registrationId": "reg_1727712000000_abc123",
  "studentName": "John Doe",
  "studentEmail": "john.doe@kirouniversity.edu",
  "studentId": "KU12345",
  "eventName": "Tech Workshop 2026",
  "timestamp": "2026-09-30T14:30:00.000Z"
}
```

### 6.3 Subscription (Optional)

For MVP, no subscriptions needed. For testing/monitoring:
- **Email subscription**: Admin email to monitor registrations
- **Lambda subscription**: Future processing (e.g., send confirmation emails)

### 6.4 Error Handling

- SNS publishing is **non-blocking**
- If SNS fails, registration still succeeds
- Errors logged to CloudWatch only

---

## 7. Student Registration Flow

### 7.1 Sequence Diagram

```
Student      Frontend         API Gateway      registerStudent      DynamoDB        SNS
  │              │                  │                Lambda             │            │
  │──Fill Form──>│                  │                  │                │            │
  │              │                  │                  │                │            │
  │──Submit─────>│                  │                  │                │            │
  │              │                  │                  │                │            │
  │              │──POST /reg──────>│                  │                │            │
  │              │                  │                  │                │            │
  │              │                  │──Invoke─────────>│                │            │
  │              │                  │                  │                │            │
  │              │                  │                  │──Validate      │            │
  │              │                  │                  │                │            │
  │              │                  │                  │──Generate ID   │            │
  │              │                  │                  │                │            │
  │              │                  │                  │──PutItem──────>│            │
  │              │                  │                  │                │            │
  │              │                  │                  │<──Success──────│            │
  │              │                  │                  │                │            │
  │              │                  │                  │──Publish───────────────────>│
  │              │                  │                  │                │            │
  │              │                  │                  │<──(async)──────────────────│
  │              │                  │                  │                │            │
  │              │                  │<──Response───────│                │            │
  │              │                  │    201 Created   │                │            │
  │              │<──Response───────│                  │                │            │
  │              │                  │                  │                │            │
  │<──Success────│                  │                  │                │            │
  │   Message    │                  │                  │                │            │
```

### 7.2 Step-by-Step Flow

1. **Student fills form**: Enter name, email, ID, select event
2. **Client validation**: Check all fields filled, email format valid
3. **Form submission**: Click submit button
4. **Frontend sends POST**: `fetch()` to API Gateway endpoint
5. **API Gateway receives**: Forwards to Lambda with proxy integration
6. **Lambda validates**: Check required fields, email format
7. **Lambda generates ID**: Create unique registration ID with timestamp
8. **Lambda stores data**: `PutItem` to DynamoDB
9. **DynamoDB confirms**: Returns success
10. **Lambda publishes SNS**: Send notification (non-blocking)
11. **Lambda returns response**: 201 with registration ID
12. **API Gateway forwards**: Returns response to frontend
13. **Frontend displays**: Success message with registration ID
14. **Form resets**: Clear fields for next registration

### 7.3 Error Scenarios

**Validation Error (Client-side)**:
- Missing fields → Display inline error messages
- Invalid email → Display email format error
- Form not submitted to API

**Validation Error (Server-side)**:
- Lambda returns 400
- Frontend displays error message from API

**Database Error**:
- Lambda returns 500
- Frontend displays generic error message
- User can retry

**SNS Error**:
- Logged but ignored
- Registration succeeds anyway
- No impact on user experience

---

## 8. Admin Dashboard Flow

### 8.1 Sequence Diagram

```
Admin        Frontend         API Gateway      listRegistrations    DynamoDB
  │              │                  │                Lambda            │
  │──Navigate───>│                  │                  │               │
  │   to /admin  │                  │                  │               │
  │              │                  │                  │               │
  │              │──GET /reg───────>│                  │               │
  │              │                  │                  │               │
  │              │                  │──Invoke─────────>│               │
  │              │                  │                  │               │
  │              │                  │                  │──Scan────────>│
  │              │                  │                  │               │
  │              │                  │                  │<──Items───────│
  │              │                  │                  │               │
  │              │                  │                  │──Sort         │
  │              │                  │                  │               │
  │              │                  │<──Response───────│               │
  │              │                  │    200 OK        │               │
  │              │<──Response───────│                  │               │
  │              │                  │                  │               │
  │──Display────<│                  │                  │               │
  │   Table      │                  │                  │               │
  │              │                  │                  │               │
  │──Search─────>│                  │                  │               │
  │   "John"     │──Filter (local)──│                  │               │
  │              │                  │                  │               │
  │<──Filtered───│                  │                  │               │
  │   Results    │                  │                  │               │
```

### 8.2 Step-by-Step Flow

1. **Admin navigates**: Go to `/admin` or dashboard route
2. **Component mounts**: `useEffect` triggers data fetch
3. **Frontend sends GET**: `fetch()` to API Gateway endpoint
4. **API Gateway receives**: Forwards to Lambda
5. **Lambda scans table**: `Scan` operation on DynamoDB
6. **DynamoDB returns**: All registration items
7. **Lambda sorts**: By timestamp, newest first
8. **Lambda returns response**: 200 with array of registrations
9. **Frontend receives**: Store in state
10. **Frontend displays**: Render table with all columns
11. **Search interaction**: Filter locally using state
12. **Event filter**: Filter locally by event name
13. **View details**: Show modal with full registration info

### 8.3 Client-Side Filtering

**Search Logic** (JavaScript):
```javascript
const filteredBySearch = registrations.filter(reg => {
  const query = searchQuery.toLowerCase();
  return (
    reg.studentName.toLowerCase().includes(query) ||
    reg.studentEmail.toLowerCase().includes(query) ||
    reg.studentId.toLowerCase().includes(query)
  );
});
```

**Event Filter Logic**:
```javascript
const filteredByEvent = filteredBySearch.filter(reg => {
  if (selectedEvent === 'All') return true;
  return reg.eventName === selectedEvent;
});
```

**Why Client-Side?**:
- Simpler implementation (no complex DynamoDB queries)
- Acceptable performance for < 1000 registrations
- No additional Lambda logic needed
- Real-time filtering without API calls

---

## 9. Error Handling Strategy

### 9.1 Frontend Error Handling

**Form Validation Errors**:
- Display inline errors below each field
- Prevent form submission until valid
- Clear errors on input change

**API Errors**:
- Display error message from API response
- Provide retry mechanism
- Log errors to console for debugging

**Network Errors**:
- Catch fetch errors
- Display "Network error, please try again"
- Optionally retry automatically

**Loading States**:
- Show loading spinner during API calls
- Disable submit button to prevent double submission

### 9.2 Backend Error Handling

**Lambda Error Types**:

1. **Validation Errors** (400):
   - Missing required fields
   - Invalid email format
   - Return detailed error object

2. **Database Errors** (500):
   - DynamoDB connection failure
   - PutItem/Scan errors
   - Log error, return generic message

3. **SNS Errors**:
   - Catch and log only
   - Don't fail the registration
   - Continue processing

**Error Response Format**:
```javascript
{
  success: false,
  message: "Human-readable error message",
  errors: {  // Optional, for validation errors
    fieldName: "Field-specific error"
  }
}
```

### 9.3 CloudWatch Logging

**Log Every**:
- Function invocation
- Validation failures
- Database operations
- SNS publish attempts
- Errors with stack traces

**Log Format**:
```javascript
console.log('Registration attempt:', { studentEmail });
console.error('DynamoDB error:', error);
```

---

## 10. CORS Configuration

### 10.1 API Gateway CORS Settings

**Allowed Origins**: `*` (all origins, for development simplicity)  
**Allowed Methods**: `GET, POST, OPTIONS`  
**Allowed Headers**: `Content-Type`  
**Expose Headers**: None needed  
**Max Age**: 86400 seconds (24 hours)

### 10.2 Lambda Response Headers

Every Lambda response must include:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### 10.3 OPTIONS Method

API Gateway should auto-generate OPTIONS responses for preflight requests.

**Manual OPTIONS Handler** (if needed):
```javascript
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: ''
  };
}
```

---

## 11. AWS Resource Configuration

### 11.1 Manual AWS Console Setup

**Step 1: Create DynamoDB Table**
1. Go to DynamoDB console
2. Create table: `EventRegistrations`
3. Partition key: `registrationId` (String)
4. Table settings: On-demand
5. Create table

**Step 2: Create SNS Topic**
1. Go to SNS console
2. Create standard topic: `RegistrationNotifications`
3. Copy topic ARN
4. (Optional) Add email subscription for testing

**Step 3: Create IAM Role for Lambda**
1. Go to IAM console
2. Create role: `EventRegistrationLambdaRole`
3. Trust policy: Lambda service
4. Attach policies:
   - `AWSLambdaBasicExecutionRole` (for CloudWatch Logs)
   - Custom inline policy for DynamoDB and SNS (see below)

**Custom Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/EventRegistrations"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:REGION:ACCOUNT_ID:RegistrationNotifications"
    }
  ]
}
```

**Step 4: Create Lambda Functions**

**registerStudent**:
1. Go to Lambda console
2. Create function: `registerStudent`
3. Runtime: Node.js 18.x
4. Role: `EventRegistrationLambdaRole`
5. Upload function code (zip file)
6. Set environment variables:
   - `TABLE_NAME`: `EventRegistrations`
   - `SNS_TOPIC_ARN`: (paste ARN from SNS)
7. Save

**listRegistrations**:
1. Create function: `listRegistrations`
2. Runtime: Node.js 18.x
3. Role: `EventRegistrationLambdaRole`
4. Upload function code
5. Set environment variables:
   - `TABLE_NAME`: `EventRegistrations`
6. Save

**Step 5: Create API Gateway**
1. Go to API Gateway console
2. Create REST API: `event-registration-api`
3. Create resource: `/registrations`
4. Create method: `POST` → integrate with `registerStudent` Lambda
5. Create method: `GET` → integrate with `listRegistrations` Lambda
6. Enable CORS for `/registrations` resource
7. Deploy API to stage: `dev`
8. Copy Invoke URL: `https://xxxxxx.execute-api.REGION.amazonaws.com/dev`

**Step 6: Configure Frontend**
1. Update `src/services/api.js` with API Gateway URL
2. Test locally with `npm run dev`

### 11.2 Environment Configuration

**Frontend** (`.env` file):
```
VITE_API_BASE_URL=https://xxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

**Backend** (Lambda environment variables):
```
TABLE_NAME=EventRegistrations
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:RegistrationNotifications
AWS_REGION=us-east-1
```

---

## 12. Project Folder Structure

```
event-registration-portal/
│
├── frontend/                          # React + Vite application
│   ├── public/                        # Static assets
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationForm.jsx  # Student registration form
│   │   │   ├── Dashboard.jsx         # Admin dashboard
│   │   │   └── RegistrationDetails.jsx # Registration modal
│   │   ├── services/
│   │   │   └── api.js                # API client functions
│   │   ├── constants/
│   │   │   └── events.js             # Predefined events list
│   │   ├── styles/
│   │   │   └── App.css               # Global styles
│   │   ├── App.jsx                   # Root component with routes
│   │   └── main.jsx                  # Entry point
│   ├── .env                          # Environment variables
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   └── README.md                     # Frontend documentation
│
├── backend/                           # Lambda functions
│   ├── functions/
│   │   ├── registerStudent/
│   │   │   ├── index.js              # Lambda handler
│   │   │   └── package.json          # Function dependencies
│   │   └── listRegistrations/
│   │       ├── index.js              # Lambda handler
│   │       └── package.json          # Function dependencies
│   ├── shared/                       # Shared utilities (optional)
│   │   └── validation.js             # Validation functions
│   └── README.md                     # Backend documentation
│
├── docs/                              # Project documentation
│   ├── api-endpoints.md              # API documentation
│   ├── aws-setup-guide.md            # Step-by-step AWS setup
│   └── deployment-guide.md           # Deployment instructions
│
├── .gitignore                        # Git ignore file
└── README.md                         # Project overview
```

### 12.1 Key Files

**frontend/src/services/api.js**:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createRegistration = async (data) => {
  const response = await fetch(`${API_BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const fetchRegistrations = async () => {
  const response = await fetch(`${API_BASE_URL}/registrations`);
  return response.json();
};
```

**frontend/src/constants/events.js**:
```javascript
export const EVENTS = [
  'Tech Workshop 2026',
  'Career Fair 2026',
  'Hackathon 2026'
];
```

**backend/functions/registerStudent/package.json**:
```json
{
  "name": "register-student",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "aws-sdk": "^2.1400.0"
  }
}
```

---

## 13. Security Considerations

### 13.1 Current Security Posture (MVP)

**What's Included**:
- HTTPS encryption (API Gateway default)
- Input validation (prevent empty fields, validate email)
- AWS IAM for service-to-service authentication
- CloudWatch logging for audit trail

**What's NOT Included** (Out of Scope):
- User authentication (no login required)
- Authorization (anyone can view admin dashboard)
- Rate limiting (AWS default throttling only)
- Data encryption at rest (DynamoDB default encryption)
- Input sanitization (basic validation only)

### 13.2 Known Limitations

1. **Public Access**: Both student and admin views are public
   - Anyone can register
   - Anyone can view all registrations
   - **Mitigation**: Add authentication in future iteration

2. **No Rate Limiting**: Susceptible to spam
   - **Mitigation**: AWS throttling (10,000 req/sec default)
   - **Future**: Add CAPTCHA or rate limiting

3. **No Data Sanitization**: Potential for XSS if displaying HTML
   - **Mitigation**: React escapes by default
   - **Future**: Add server-side sanitization

4. **Open CORS**: Allows requests from any origin
   - **Mitigation**: Fine for development
   - **Future**: Restrict to specific domains

### 13.3 Best Practices Applied

1. **Least Privilege IAM**: Lambda role has only necessary permissions
2. **Environment Variables**: Secrets stored in environment, not code
3. **Error Messages**: Don't expose internal details (e.g., SQL queries)
4. **Logging**: Log errors for debugging, not sensitive data
5. **HTTPS Only**: API Gateway enforces HTTPS

### 13.4 Recommendations for Production

- Add AWS Cognito for authentication
- Implement API Gateway API keys or usage plans
- Add WAF rules for common attacks
- Enable DynamoDB point-in-time recovery
- Implement field-level encryption for PII
- Add CloudTrail for governance
- Set up AWS Secrets Manager for sensitive config

---

## 14. Implementation Approach (4 Days)

### Day 1: Backend Foundation

**Goals**: Working API endpoints with database storage

**Tasks**:
1. Create DynamoDB table in AWS Console (15 min)
2. Create SNS topic (10 min)
3. Create IAM role with policies (20 min)
4. Write `registerStudent` Lambda function (1.5 hours)
   - Implement validation logic
   - Implement DynamoDB PutItem
   - Implement SNS publish
   - Handle errors
5. Write `listRegistrations` Lambda function (45 min)
   - Implement DynamoDB Scan
   - Sort results
   - Handle errors
6. Create Lambda functions in AWS Console (30 min)
   - Upload code
   - Set environment variables
7. Create API Gateway REST API (45 min)
   - Create resources and methods
   - Configure Lambda integrations
   - Enable CORS
   - Deploy to stage
8. Test endpoints with Postman (30 min)

**Deliverables**:
- Working POST /registrations endpoint
- Working GET /registrations endpoint
- Data persisting in DynamoDB
- SNS messages published

---

### Day 2: Frontend Registration

**Goals**: Students can register through web form

**Tasks**:
1. Initialize Vite + React project (15 min)
   - `npm create vite@latest frontend -- --template react`
2. Set up project structure (20 min)
   - Create folders: components, services, constants, styles
3. Create constants file with events (5 min)
4. Create API client service (30 min)
5. Build RegistrationForm component (2 hours)
   - Form inputs
   - Validation logic
   - Submit handler
   - Success/error display
6. Add basic styling (45 min)
7. Configure API base URL (15 min)
8. Test registration flow (30 min)
9. Fix bugs and improve UX (1 hour)

**Deliverables**:
- Functional registration form
- Form validation working
- Success/error messages displaying
- Data flowing to backend

---

### Day 3: Admin Dashboard

**Goals**: View, search, and filter registrations

**Tasks**:
1. Build Dashboard component (1.5 hours)
   - Fetch data on mount
   - Display in table format
   - Loading and error states
2. Implement search functionality (1 hour)
   - Search input
   - Filter logic (name, email, ID)
   - Real-time filtering
3. Implement event filter (1 hour)
   - Dropdown with events
   - Filter logic
   - Combined with search
4. Build RegistrationDetails component (1 hour)
   - Modal or detail view
   - Display all fields
   - Close/back action
5. Add routing (30 min)
   - / → RegistrationForm
   - /admin → Dashboard
6. Style dashboard (1 hour)
7. Test all functionality (1 hour)

**Deliverables**:
- Admin dashboard displaying registrations
- Search working
- Event filter working
- Details view working
- Navigation working

---

### Day 4: Polish and Deploy

**Goals**: Production-ready application

**Tasks**:
1. Code cleanup (1 hour)
   - Remove console.logs
   - Fix linting errors
   - Add comments
2. Improve error handling (1 hour)
   - Better error messages
   - Retry logic
   - Network error handling
3. Final styling improvements (1.5 hours)
   - Responsive design
   - Better form layout
   - Table formatting
4. Write documentation (2 hours)
   - README with setup instructions
   - API documentation
   - AWS setup guide
5. End-to-end testing (1.5 hours)
   - Test all user flows
   - Test error scenarios
   - Cross-browser testing
6. Optional: Deploy frontend to S3 (1 hour)
   - Build production bundle
   - Upload to S3
   - Configure static hosting
7. Final demo preparation (1 hour)

**Deliverables**:
- Polished, working application
- Complete documentation
- Deployment (optional)
- Demo-ready

---

## 15. Testing Strategy

### 15.1 Backend Testing

**Manual Testing with Postman**:

1. **Test POST /registrations** (Happy Path)
   - Valid request body
   - Expect 201 response
   - Verify DynamoDB item created
   - Verify SNS message sent

2. **Test POST /registrations** (Validation Errors)
   - Missing studentName → 400 error
   - Missing studentEmail → 400 error
   - Invalid email format → 400 error

3. **Test GET /registrations**
   - Expect 200 response
   - Verify all registrations returned
   - Check sorting (newest first)

**CloudWatch Logs Verification**:
- Check Lambda execution logs
- Verify no errors logged
- Check execution duration

### 15.2 Frontend Testing

**Manual Browser Testing**:

1. **Registration Form**
   - Fill all fields → Success
   - Submit empty form → Validation errors
   - Submit invalid email → Email error
   - Submit valid form → Success message
   - Verify form clears after success

2. **Dashboard**
   - Navigate to /admin → Table displays
   - Search by name → Results filter
   - Search by email → Results filter
   - Filter by event → Results filter
   - View details → Modal opens
   - Close details → Return to list

3. **Error Scenarios**
   - Stop Lambda → API error displayed
   - Invalid API URL → Network error

**Cross-Browser Testing**:
- Chrome (primary)
- Firefox
- Safari (if on Mac)

### 15.3 Integration Testing

**End-to-End Workflow**:
1. Student submits registration
2. Verify success message
3. Go to admin dashboard
4. Verify registration appears
5. Search for student
6. View details
7. Verify all data correct

---

## 16. Success Criteria

The AWS Event Registration Portal is considered complete when:

✅ Students can fill out and submit registration form  
✅ Form validation prevents invalid submissions  
✅ Registrations are stored in DynamoDB  
✅ Success confirmation is displayed with registration ID  
✅ Admin can view all registrations in dashboard  
✅ Admin can search registrations by name, email, or ID  
✅ Admin can filter registrations by event  
✅ Admin can view detailed information for each registration  
✅ SNS notifications are published (logged)  
✅ API returns appropriate error messages  
✅ CORS is configured for frontend-backend communication  
✅ All AWS resources are created and configured  
✅ Documentation is complete  
✅ Application is tested and working  

---

## 17. Future Enhancements (Post-MVP)

1. **Authentication**: Add AWS Cognito for user login
2. **Email Notifications**: Send confirmation emails via SNS
3. **Event Management**: Admin can create/edit events
4. **Pagination**: Handle large datasets in dashboard
5. **Export**: Download registrations as CSV
6. **Analytics**: Registration counts by event
7. **Duplicate Prevention**: Check for duplicate emails
8. **Edit/Delete**: Allow admin to modify registrations
9. **Infrastructure as Code**: Use CloudFormation or Terraform
10. **CI/CD Pipeline**: Automate deployment

---

## Appendix: Technology Versions

- **React**: 18.x
- **Vite**: 5.x
- **Node.js**: 18.x
- **AWS SDK**: 2.x
- **React Router**: 6.x (optional)

---

**Document End**
