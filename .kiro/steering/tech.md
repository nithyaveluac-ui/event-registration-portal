# EventHub Technical Context

## Frontend

The frontend is built using React, Vite, JavaScript, HTML5, CSS3, react-qr-code, and html5-qrcode.

Vite is used for local development. HTTPS is enabled during local development so browser camera access can be used for QR scanning.

## Backend

The backend uses AWS serverless services.

### AWS Lambda

The application uses separate Lambda functions for:

- registerStudent
- listRegistrations
- checkInRegistration

The unused updateRegistration function exists in the repository but must not be deployed or used.

### Amazon API Gateway

Current API structure:

    /registrations
    ├── GET  -> listRegistrations
    ├── POST -> registerStudent
    └── /check-in
        └── POST -> checkInRegistration

### Amazon DynamoDB

The application stores registration data in the EventRegistrations table.

Primary key:

- registrationId (String)

Important fields:

- registrationId
- studentName
- studentEmail
- studentId
- eventName
- timestamp
- status
- checkInStatus
- checkInTime

DynamoDB is the source of truth for registration and check-in state.

### Amazon SNS

Amazon SNS is used for registration notifications.

The registerStudent Lambda publishes a notification after a successful registration.

## AWS Region

The current AWS deployment uses ap-south-1 (Mumbai).

## Frontend Hosting

The production frontend is built using npm run build.

The generated dist directory is uploaded to Amazon S3.

Current S3 bucket:

eventhub-2026-774770453574

CloudFront is planned but currently postponed because AWS account verification is required before creating a CloudFront resource.

## QR Code Architecture

The QR pass contains the student's registration information, including the unique registration ID.

During check-in:

1. Administrator opens the QR scanner.
2. Camera scans the QR code.
3. Frontend extracts the registration ID.
4. Frontend sends the registration ID to the check-in API.
5. API Gateway invokes the checkInRegistration Lambda.
6. Lambda retrieves the registration from DynamoDB.
7. Lambda prevents duplicate check-in.
8. Lambda updates checkInStatus and checkInTime.
9. The dashboard displays the updated check-in information.

## Development Environment

Primary development tools include:

- Kali Linux
- Node.js
- npm
- Git
- GitHub
- AWS CLI
- Vite

Project directory:

~/projects/event-registration-portal

## Source Control

The project is maintained in a public GitHub repository:

nithyaveluac-ui/event-registration-portal

Git is used for version control and source management.

## Technical Principles

- Prefer serverless AWS services where practical.
- Keep frontend and backend responsibilities separated.
- Keep Lambda functions focused on individual operations.
- Validate input before writing data.
- Prevent duplicate registrations and duplicate check-ins.
- Use DynamoDB as the source of truth for registration state.
- Avoid deploying unused backend functions.
- Preserve existing working functionality when making changes.
