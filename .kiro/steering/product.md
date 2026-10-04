# EventHub Product Context

## Product Overview

EventHub is a cloud-based college event registration platform built for students and administrators.

The platform allows students to discover predefined college events, submit registration details, receive a unique registration ID and QR pass, and use that QR pass for event check-in.

Administrators can securely access an admin dashboard to view registrations, search and filter records, inspect registration details, and scan QR passes for student check-in.

## Target Users

### Students
Students can:
- View available college events
- Register for an event
- Provide their name, email, student ID, and selected event
- Receive a unique registration ID
- Receive a QR registration pass
- Use the QR pass for event check-in

### Administrators

Administrators can:
- Sign in through the admin login
- View all event registrations
- Search registrations by student name, email, or student ID
- Filter registrations by event
- View registration details
- Scan QR passes
- Check students in
- View check-in status and check-in time

## Core Events

The platform currently supports:
- Tech Workshop 2026
- Career Fair 2026
- Hackathon 2026

## Registration Flow

1. Student opens the EventHub website.
2. Student selects an event.
3. Student enters registration details.
4. Frontend sends the registration request to the REST API.
5. API Gateway invokes the registration Lambda.
6. Lambda validates the data and checks for duplicate registration.
7. Registration is stored in DynamoDB.
8. A notification is published through Amazon SNS.
9. Student receives a registration ID and QR pass.
10. Administrator can view the registration in the dashboard.
11. Administrator scans the QR pass during the event.
12. Check-in Lambda updates the registration with check-in status and time.

## Product Goals

- Provide a simple and reliable event registration experience.
- Reduce manual registration work for college events.
- Give administrators real-time visibility into registrations.
- Provide QR-based event check-in.
- Use AWS serverless services for scalable backend processing.
- Keep the user interface modern, responsive, and easy to use.

## Current Project Scope

The current implementation includes:
- React and Vite frontend
- Admin login
- Event registration
- Registration ID generation
- QR pass generation
- Admin dashboard
- Search and event filtering
- Registration details view
- QR scanner
- Student check-in
- DynamoDB persistence
- API Gateway REST APIs
- AWS Lambda backend
- Amazon SNS notifications
- Amazon S3 production frontend hosting

## Product Principles

- Keep the registration flow simple.
- Keep administrator workflows clear.
- Validate user input before storing data.
- Preserve registration data consistency.
- Avoid unnecessary UI complexity.
- Prefer secure AWS architecture and least-privilege access where possible.
