# AWS Event Registration Portal

A serverless web application for Kiro University that enables students to register for events and administrators to view and manage registrations.

## Overview

This project is built using AWS serverless architecture with React frontend and Lambda backend, designed to be completed within 4 days as a student project.

## Features

- **Student Registration**: Web form for event registration with validation
- **Admin Dashboard**: View, search, and filter all registrations
- **Real-time Updates**: Registrations stored in DynamoDB
- **Notifications**: SNS integration for event logging
- **Serverless Architecture**: No server management required

## Technology Stack

### Frontend
- React 18.x
- Vite 5.x
- Fetch API for HTTP requests

### Backend
- AWS Lambda (Node.js 18.x)
- Amazon API Gateway (REST API)
- Amazon DynamoDB (On-demand)
- Amazon SNS (Standard topic)

### Infrastructure
- Manual AWS Console setup (no IaC for simplicity)
- Git for version control

## Project Structure

```
event-registration-portal/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── constants/       # Event definitions
│   │   └── styles/          # CSS files
│   └── package.json
├── backend/                  # Lambda functions
│   └── functions/
│       ├── registerStudent/ # Registration Lambda
│       └── listRegistrations/ # List Lambda
├── docs/                     # Documentation
└── README.md
```

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS Account with access to:
  - DynamoDB
  - Lambda
  - API Gateway
  - SNS
  - IAM

## Quick Start

### Backend Setup

1. Create AWS resources (see `docs/aws-setup-guide.md`)
2. Deploy Lambda functions
3. Configure API Gateway
4. Update environment variables

### Frontend Setup

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Configure API URL in `.env`
4. Start dev server: `npm run dev`

## Configuration

### Backend Environment Variables

- `TABLE_NAME`: DynamoDB table name (EventRegistrations)
- `SNS_TOPIC_ARN`: SNS topic ARN for notifications
- `AWS_REGION`: AWS region (e.g., us-east-1)

### Frontend Environment Variables

- `VITE_API_BASE_URL`: API Gateway invoke URL

## API Endpoints

- `POST /registrations` - Create new registration
- `GET /registrations` - List all registrations

See `docs/api-endpoints.md` for detailed documentation.

## Predefined Events

Students can register for:
- Tech Workshop 2026
- Career Fair 2026
- Hackathon 2026

## Development Timeline

- **Day 1**: Backend setup (DynamoDB, Lambda, API Gateway, SNS)
- **Day 2**: Frontend registration form
- **Day 3**: Admin dashboard with search and filter
- **Day 4**: Testing, documentation, deployment

## Known Limitations (MVP)

- No user authentication or authorization
- No email delivery (SNS logging only)
- Hardcoded events (no event management)
- No duplicate detection
- No pagination (client-side filtering)
- Manual AWS setup required

## Future Enhancements

- AWS Cognito authentication
- Email notifications via SES
- Event management interface
- Registration editing/deletion
- Analytics dashboard
- Infrastructure as Code (Terraform/CloudFormation)
- CI/CD pipeline

## Documentation

- [AWS Setup Guide](docs/aws-setup-guide.md)
- [API Documentation](docs/api-endpoints.md)
- [Deployment Guide](docs/deployment-guide.md)

## License

This is a student project for educational purposes.

## Author

Kiro University Computer Science Department

---

**Note**: This is a simplified project designed for learning AWS serverless architecture. It should not be used in production without adding proper authentication, security measures, and testing.
