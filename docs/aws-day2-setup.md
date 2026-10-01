# AWS Day 2 Setup

## AWS Region

- Region: `ap-south-1` (Mumbai)

## DynamoDB

- Table Name: `EventRegistrations`
- Partition Key: `registrationId`
- Key Type: String
- Billing Mode: On-Demand

## SNS

- Topic Name: `RegistrationNotifications`
- Type: Standard
- Email subscription: Confirmed

## Lambda Functions

### registerStudent

- Runtime: Node.js 24.x
- Architecture: ARM64
- Purpose: Register students and store registration data in DynamoDB
- SNS notification: Enabled

### listRegistrations

- Runtime: Node.js 24.x
- Architecture: ARM64
- Purpose: Retrieve all registrations from DynamoDB
- Sorting: Latest registration first

## IAM

Existing execution role:

`EventRegistrationLambdaRole`

Permissions used:

- DynamoDB `PutItem`
- DynamoDB `Scan`
- SNS `Publish`
- CloudWatch Logs

## Tested Backend Flow

Student registration:

```text
Student
  ↓
registerStudent Lambda
  ↓
DynamoDB
  ↓
SNS
  ↓
Email notification
