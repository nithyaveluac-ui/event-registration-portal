# Requirements Document

## Introduction

The AWS Event Registration Portal is a web application designed for Kiro University to enable students to register for events and administrators to manage and view registrations. The system consists of a React frontend, AWS Lambda backend, API Gateway for REST APIs, DynamoDB for data storage, and SNS for notifications. This project is scoped for completion within 4 days, focusing on core registration and administrative viewing functionality.

### Problem Statement

Kiro University needs a simple, cloud-based system to collect student event registrations and provide administrators with visibility into registration data. Current manual processes lack scalability and real-time visibility.

### Project Objective

Build a working event registration web application that allows students to submit registration forms for predefined events and administrators to view, search, and filter registration records using AWS serverless infrastructure.

### Target Users

- **Students**: Kiro University students registering for events
- **Administrators**: University staff viewing event registrations

### Development Timeline

This project is designed for completion within 4 days, with phased implementation of core features first.

### Scope Limitations

- **No authentication**: Public access to both student and admin views
- **No email notifications**: SNS integration simplified to logging only
- **Predefined events**: Event list is hardcoded in the frontend (no event management)
- **Single region**: Deployment to one AWS region only

## Glossary

- **Portal**: The AWS Event Registration Portal web application
- **Student**: A Kiro University student user registering for an event
- **Administrator**: A university staff user with access to view and manage registrations
- **Registration**: A student's submission of event registration information
- **Registration_Form**: The web form presented to students for event registration
- **Registration_API**: The API Gateway REST endpoint for registration operations
- **Registration_Service**: The AWS Lambda function that processes registration requests
- **Registration_Store**: The DynamoDB table storing registration records
- **Notification_Service**: The Amazon SNS service for sending notifications
- **Dashboard**: The administrative interface for viewing registrations
- **Frontend**: The React + Vite web application
- **Backend**: The AWS Lambda functions and associated infrastructure

## Requirements

### Requirement 1: Student Registration Form

**User Story:** As a Student, I want to fill out a registration form on the website, so that I can register for an event.

#### Acceptance Criteria

1. WHEN a Student accesses the Portal, THE Frontend SHALL display the Registration_Form
2. THE Registration_Form SHALL accept student name as text input (required field)
3. THE Registration_Form SHALL accept student email as text input (required field)
4. THE Registration_Form SHALL accept student ID as text input (required field)
5. THE Registration_Form SHALL provide an event dropdown with predefined events (required field)
6. THE Registration_Form SHALL include a submit button
7. WHEN the Student submits an incomplete Registration_Form, THE Frontend SHALL display validation errors for missing fields
8. WHEN the Student submits a Registration_Form with an invalid email format, THE Frontend SHALL display an email validation error
9. WHEN the Student successfully submits the form, THE Registration_Form SHALL be cleared for a new registration

### Requirement 2: Registration Submission Processing

**User Story:** As a Student, I want my registration to be processed when I submit the form, so that I am registered for the event.

#### Acceptance Criteria

1. WHEN the Student submits a valid Registration_Form, THE Frontend SHALL send a registration request to the Registration_API
2. WHEN the Registration_API receives a registration request, THE Registration_API SHALL invoke the Registration_Service
3. WHEN the Registration_Service receives a registration request, THE Registration_Service SHALL validate the registration data
4. WHEN the Registration_Service validates registration data successfully, THE Registration_Service SHALL store the Registration in the Registration_Store
5. WHEN the Registration_Service stores a Registration, THE Registration_Service SHALL generate a unique registration ID
6. WHEN the Registration_Service stores a Registration, THE Registration_Service SHALL record a timestamp for the registration

### Requirement 3: Registration Confirmation

**User Story:** As a Student, I want to receive confirmation when my registration is successful, so that I know my submission was processed.

#### Acceptance Criteria

1. WHEN the Registration_Service successfully stores a Registration, THE Registration_Service SHALL return a success response with the registration ID
2. WHEN the Frontend receives a success response, THE Frontend SHALL display a success message to the Student
3. WHEN the Frontend receives a success response, THE Frontend SHALL display the registration ID to the Student
4. WHEN the Registration_Service fails to store a Registration, THE Registration_Service SHALL return an error response with a descriptive error message
5. WHEN the Frontend receives an error response, THE Frontend SHALL display the error message to the Student

### Requirement 4: Registration Notification Logging

**User Story:** As a developer, I want registration events to be logged, so that I can track system activity.

#### Acceptance Criteria

1. WHEN the Registration_Service successfully stores a Registration, THE Registration_Service SHALL publish a notification message to the Notification_Service
2. THE notification message SHALL include the student name, student email, registration ID, and event name
3. IF the Notification_Service fails, THEN THE Registration_Service SHALL log the error and complete the registration successfully

### Requirement 5: Administrator Dashboard Access

**User Story:** As an Administrator, I want to access a dashboard, so that I can view event registrations.

#### Acceptance Criteria

1. WHEN an Administrator accesses the Portal dashboard URL, THE Frontend SHALL display the Dashboard
2. THE Dashboard SHALL request registration data from the Registration_API
3. WHEN the Registration_API receives a list registrations request, THE Registration_API SHALL invoke the Registration_Service to retrieve registrations
4. WHEN the Registration_Service receives a list request, THE Registration_Service SHALL query the Registration_Store for all registrations
5. WHEN the Registration_Service retrieves registrations, THE Registration_Service SHALL return the registration list to the Registration_API

### Requirement 6: Registration Display

**User Story:** As an Administrator, I want to view all registrations in a list, so that I can see who has registered for events.

#### Acceptance Criteria

1. WHEN the Dashboard receives registration data, THE Dashboard SHALL display registrations in a table format
2. THE registration table SHALL display student name for each Registration
3. THE registration table SHALL display student email for each Registration
4. THE registration table SHALL display student ID for each Registration
5. THE registration table SHALL display event name for each Registration
6. THE registration table SHALL display registration timestamp for each Registration
7. THE registration table SHALL display registration ID for each Registration
8. WHEN the Registration_Store contains no registrations, THE Dashboard SHALL display a message indicating no registrations exist

### Requirement 7: Registration Search

**User Story:** As an Administrator, I want to search registrations, so that I can find specific student registrations quickly.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a search input field
2. WHEN an Administrator enters text in the search field, THE Dashboard SHALL filter displayed registrations to match the search text
3. THE search filter SHALL match against student name
4. THE search filter SHALL match against student email
5. THE search filter SHALL match against student ID
6. THE search matching SHALL be case-insensitive

### Requirement 8: Registration Filtering

**User Story:** As an Administrator, I want to filter registrations by event, so that I can view registrations for a specific event.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an event filter dropdown
2. THE event filter dropdown SHALL include an option for all events
3. THE event filter dropdown SHALL include an option for each distinct event in the registrations
4. WHEN an Administrator selects an event filter, THE Dashboard SHALL display only registrations for the selected event
5. WHEN an Administrator selects the all events option, THE Dashboard SHALL display all registrations

### Requirement 9: Registration Details View

**User Story:** As an Administrator, I want to view detailed information for a registration, so that I can see complete registration data.

#### Acceptance Criteria

1. THE registration table SHALL provide a view details action for each Registration
2. WHEN an Administrator selects view details for a Registration, THE Dashboard SHALL display the complete registration information
3. THE registration details SHALL include all Registration_Form fields
4. THE registration details SHALL include the registration ID
5. THE registration details SHALL include the registration timestamp
6. THE registration details SHALL include a close or back action to return to the registration list

### Requirement 10: Data Persistence

**User Story:** As an Administrator, I want registrations to be persistently stored, so that registration data is not lost.

#### Acceptance Criteria

1. THE Registration_Store SHALL use Amazon DynamoDB
2. THE Registration_Store SHALL use registration ID as the primary key
3. WHEN the Registration_Service stores a Registration, THE Registration SHALL persist in the Registration_Store
4. WHEN the Registration_Service queries the Registration_Store, THE Registration_Store SHALL return all stored registrations
5. THE Registration_Store SHALL maintain data consistency across all read and write operations

### Requirement 11: Basic Error Handling

**User Story:** As a developer, I want the API to handle errors gracefully, so that the system provides meaningful feedback when failures occur.

#### Acceptance Criteria

1. WHEN the Registration_Service encounters a DynamoDB error, THE Registration_Service SHALL return an HTTP 500 status code with an error message
2. WHEN the Registration_API receives a request with missing required fields, THE Registration_API SHALL return an HTTP 400 status code with validation errors
3. WHEN the Registration_API receives a request for a non-existent endpoint, THE Registration_API SHALL return an HTTP 404 status code
4. IF the Notification_Service fails, THEN THE Registration_Service SHALL complete the registration successfully

### Requirement 12: Basic Data Validation

**User Story:** As a system, I want to validate registration data, so that only valid data is stored.

#### Acceptance Criteria

1. WHEN the Registration_Service receives a registration request without a student name, THE Registration_Service SHALL reject the request with a validation error
2. WHEN the Registration_Service receives a registration request without a student email, THE Registration_Service SHALL reject the request with a validation error
3. WHEN the Registration_Service receives a registration request without a student ID, THE Registration_Service SHALL reject the request with a validation error
4. WHEN the Registration_Service receives a registration request without an event selection, THE Registration_Service SHALL reject the request with a validation error
5. WHEN the Registration_Service receives a registration request with an invalid email format (must contain @ and domain), THE Registration_Service SHALL reject the request with a validation error

### Requirement 13: CORS Configuration

**User Story:** As a developer, I want the API to support cross-origin requests, so that the Frontend can communicate with the Backend.

#### Acceptance Criteria

1. THE Registration_API SHALL include CORS headers in all responses
2. THE Registration_API SHALL allow requests from any origin (for development simplicity)
3. THE CORS configuration SHALL allow GET and POST methods
4. THE CORS configuration SHALL allow Content-Type header

### Requirement 14: Predefined Events

**User Story:** As a Student, I want to see available events to register for, so that I can select the event I'm interested in.

#### Acceptance Criteria

1. THE Registration_Form SHALL provide a dropdown with at least 3 predefined events
2. THE predefined events SHALL include "Tech Workshop 2026", "Career Fair 2026", and "Hackathon 2026"
3. WHEN a Student accesses the Registration_Form, THE dropdown SHALL display all available events

### Requirement 15: Simple AWS Deployment

**User Story:** As a developer, I want the application to be deployable on AWS, so that it can be accessed online.

#### Acceptance Criteria

1. THE Backend SHALL use AWS Lambda functions written in Node.js
2. THE Backend SHALL use Amazon API Gateway REST API
3. THE Backend SHALL use Amazon DynamoDB with a single table
4. THE Backend SHALL use Amazon SNS for logging notifications (no email delivery required)
5. THE Frontend SHALL be deployable as static files to S3 or locally testable

## AWS Architecture

The system follows a serverless architecture pattern:

1. **Frontend Layer**: React + Vite application served as static content
2. **API Layer**: Amazon API Gateway exposing REST endpoints
3. **Compute Layer**: AWS Lambda functions for business logic
4. **Data Layer**: Amazon DynamoDB for registration storage
5. **Notification Layer**: Amazon SNS for event notifications

## Suggested Project Folder Structure

```
event-registration-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegistrationForm.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── functions/
│   │   ├── registerStudent/
│   │   │   └── index.js
│   │   └── listRegistrations/
│   │       └── index.js
│   ├── package.json
│   └── README.md
├── infrastructure/
│   └── aws-config.md
└── README.md
```

## Development Phases

### Phase 1: Backend Foundation (Day 1)
- Set up DynamoDB table with registration ID as primary key
- Create Lambda function for student registration (POST /registrations)
- Create Lambda function for listing registrations (GET /registrations)
- Configure API Gateway with 2 REST endpoints
- Set up basic SNS topic for logging
- Test both endpoints using Postman or curl

### Phase 2: Frontend Registration (Day 2)
- Initialize React + Vite project
- Build RegistrationForm component with validation
- Integrate with registration API endpoint
- Display success/error messages
- Test registration flow end-to-end

### Phase 3: Admin Dashboard (Day 3)
- Build Dashboard component
- Fetch and display registrations in a table
- Implement client-side search functionality (filter by name, email, or ID)
- Implement client-side event filter dropdown
- Test with multiple registrations

### Phase 4: Polish and Deploy (Day 4)
- Add registration details modal/view
- Improve UI styling
- Add loading states and error handling
- Test complete workflow
- Deploy frontend to S3 (optional) or run locally
- Document API endpoints and deployment steps

## Non-Functional Requirements

### Simplicity
- The system is designed for rapid development within 4 days
- Features are limited to core registration and viewing functionality
- No authentication or authorization
- No email delivery (SNS used for logging only)
- Events are hardcoded (no event management system)

### Technology Stack
- Frontend: React 18+ with Vite for fast development
- Backend: Node.js 18+ on AWS Lambda
- API: Amazon API Gateway REST API
- Database: Amazon DynamoDB (single table design)
- Notifications: Amazon SNS (for logging, not email delivery)

### Development Considerations
- Focus on functionality over aesthetics
- Use AWS Free Tier eligible configurations
- Client-side filtering/searching (no complex DynamoDB queries)
- Manual AWS resource creation acceptable (no IaC required)
- Local development with API Gateway URLs
