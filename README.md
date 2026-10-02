# EventHub - AWS Event Registration Portal

A serverless college event registration platform built with React and AWS services.

## Features

- Student event registration
- Input validation
- Duplicate registration prevention
- DynamoDB data storage
- SNS email notifications
- Admin dashboard
- Search and event filtering
- Registration analytics
- Registration details view

## Architecture

```text
Student
   |
   v
React + Vite
   |
   v
API Gateway
   |
   +-------------------+
   |                   |
   v                   v
registerStudent    listRegistrations
Lambda             Lambda
   |                   |
   v                   v
DynamoDB <-------------+
   |
   v
SNS
   |
   v
Email Notification

Admin
   |
   v
Admin Dashboard
   |
   v
GET /registrations
   |
   v
API Gateway
