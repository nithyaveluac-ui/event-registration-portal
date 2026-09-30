# AWS Setup Guide

Complete step-by-step guide for setting up AWS infrastructure for the Event Registration Portal.

## Prerequisites

- AWS Account with administrator access
- Basic understanding of AWS services
- AWS CLI installed (optional, for testing)

## Estimated Setup Time

- **Total**: 1-1.5 hours
- DynamoDB: 5 minutes
- IAM: 15 minutes
- Lambda: 30 minutes
- API Gateway: 20 minutes
- SNS: 10 minutes

## Cost Estimate

All services used are eligible for AWS Free Tier. Expected costs:
- **Free Tier**: $0/month for typical usage
- **Beyond Free Tier**: < $1/month for small scale

---

## Step 1: Create DynamoDB Table

### 1.1 Navigate to DynamoDB

1. Sign in to AWS Console
2. Search for "DynamoDB" in the search bar
3. Click "DynamoDB" to open the service

### 1.2 Create Table

1. Click **"Create table"** button
2. Configure table settings:
   - **Table name**: `EventRegistrations`
   - **Partition key**: `registrationId` (Type: **String**)
   - Leave sort key empty (not needed)
3. **Table settings**: Select **"On-demand"** capacity mode
4. Keep default encryption settings (AWS managed key)
5. Leave all other settings as default
6. Click **"Create table"**

### 1.3 Wait for Table Creation

- Wait for table status to show **"Active"** (usually 10-30 seconds)
- Note the **Table ARN** (you'll need this for IAM policy)

### 1.4 Verify Table

1. Click on the table name `EventRegistrations`
2. Go to "Explore table items" tab
3. Verify table is empty (no items yet)

**✅ Checkpoint**: DynamoDB table created and active

---

## Step 2: Create IAM Role for Lambda

### 2.1 Navigate to IAM

1. Search for "IAM" in AWS Console
2. Click "IAM" to open the service
3. Click **"Roles"** in the left sidebar

### 2.2 Create Role

1. Click **"Create role"** button
2. **Trusted entity type**: Select **"AWS service"**
3. **Use case**: Select **"Lambda"**
4. Click **"Next"**

### 2.3 Attach Managed Policy

1. In the search box, type: `AWSLambdaBasicExecutionRole`
2. Check the box next to **"AWSLambdaBasicExecutionRole"**
   - This allows Lambda to write logs to CloudWatch
3. Click **"Next"**

### 2.4 Name and Create Role

1. **Role name**: `EventRegistrationLambdaRole`
2. **Description**: "Role for Event Registration Lambda functions with DynamoDB and SNS access"
3. Review the settings
4. Click **"Create role"**

### 2.5 Add Inline Policy for DynamoDB and SNS

1. Find and click on the role `EventRegistrationLambdaRole`
2. Click **"Add permissions"** → **"Create inline policy"**
3. Click **"JSON"** tab
4. Paste the following policy (replace `REGION` and `ACCOUNT_ID` with your values):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/EventRegistrations"
    },
    {
      "Sid": "SNSAccess",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:REGION:ACCOUNT_ID:RegistrationNotifications"
    }
  ]
}
```

5. Click **"Next"**
6. **Policy name**: `DynamoDBAndSNSAccess`
7. Click **"Create policy"**

**How to find your ACCOUNT_ID and REGION**:
- Account ID: Click your username in top-right corner
- Region: Shown in top-right (e.g., us-east-1, us-west-2)

### 2.6 Note Role ARN

1. In the role summary page, copy the **Role ARN**
2. Save it for later use (format: `arn:aws:iam::ACCOUNT_ID:role/EventRegistrationLambdaRole`)

**✅ Checkpoint**: IAM role created with DynamoDB and SNS permissions

---

## Step 3: Deploy registerStudent Lambda Function

### 3.1 Prepare Deployment Package Locally

On your local machine:

```bash
cd backend/functions/registerStudent
npm install
zip -r registerStudent.zip .
```

This creates `registerStudent.zip` with all code and dependencies.

### 3.2 Navigate to Lambda Console

1. Search for "Lambda" in AWS Console
2. Click "Lambda" to open the service
3. Click **"Create function"**

### 3.3 Create Function

1. Select **"Author from scratch"**
2. **Function name**: `registerStudent`
3. **Runtime**: Select **"Node.js 18.x"**
4. **Architecture**: **x86_64**
5. **Permissions**: 
   - Expand "Change default execution role"
   - Select **"Use an existing role"**
   - Choose **"EventRegistrationLambdaRole"**
6. Click **"Create function"**

### 3.4 Upload Code

1. In the function page, scroll to **"Code source"** section
2. Click **"Upload from"** → **".zip file"**
3. Click **"Upload"** and select `registerStudent.zip`
4. Click **"Save"**
5. Wait for upload to complete

### 3.5 Configure Environment Variables

1. Click **"Configuration"** tab
2. Click **"Environment variables"** in left sidebar
3. Click **"Edit"**
4. Click **"Add environment variable"** for each:
   - Key: `TABLE_NAME`, Value: `EventRegistrations`
   - Key: `AWS_REGION`, Value: `us-east-1` (or your region)
   - Key: `SNS_TOPIC_ARN`, Value: (leave blank for now, will update after SNS creation)
5. Click **"Save"**

### 3.6 Configure Function Settings

1. Still in **"Configuration"** tab
2. Click **"General configuration"** in left sidebar
3. Click **"Edit"**
4. Set **Timeout**: `10` seconds
5. Set **Memory**: `256` MB
6. Click **"Save"**

**✅ Checkpoint**: registerStudent Lambda function deployed

---

## Step 4: Deploy listRegistrations Lambda Function

### 4.1 Prepare Deployment Package

On your local machine:

```bash
cd backend/functions/listRegistrations
npm install
zip -r listRegistrations.zip .
```

### 4.2 Create Function in Lambda Console

1. Go to Lambda Console
2. Click **"Create function"**
3. Select **"Author from scratch"**
4. **Function name**: `listRegistrations`
5. **Runtime**: **"Node.js 18.x"**
6. **Architecture**: **x86_64**
7. **Permissions**: Use existing role **"EventRegistrationLambdaRole"**
8. Click **"Create function"**

### 4.3 Upload Code

1. Click **"Upload from"** → **".zip file"**
2. Select `listRegistrations.zip`
3. Click **"Save"**

### 4.4 Configure Environment Variables

1. **Configuration** → **Environment variables** → **Edit**
2. Add:
   - Key: `TABLE_NAME`, Value: `EventRegistrations`
   - Key: `AWS_REGION`, Value: `us-east-1` (or your region)
3. Click **"Save"**

### 4.5 Configure Function Settings

1. **Configuration** → **General configuration** → **Edit**
2. Set **Timeout**: `10` seconds
3. Set **Memory**: `256` MB
4. Click **"Save"**

**✅ Checkpoint**: listRegistrations Lambda function deployed

---

## Step 5: Test Lambda Functions

### 5.1 Test registerStudent

1. Open `registerStudent` function
2. Click **"Test"** tab
3. Click **"Create new event"**
4. **Event name**: `validRegistration`
5. **Template**: Select **"API Gateway AWS Proxy"**
6. Replace the event JSON with:

```json
{
  "httpMethod": "POST",
  "body": "{\"studentName\":\"John Doe\",\"studentEmail\":\"john@test.com\",\"studentId\":\"TEST123\",\"eventName\":\"Tech Workshop 2026\"}"
}
```

7. Click **"Save"**
8. Click **"Test"** button
9. **Expected result**: 
   - Execution result: **succeeded**
   - Response statusCode: **201**
   - Response body contains `registrationId`

### 5.2 Verify in DynamoDB

1. Go to DynamoDB Console
2. Open `EventRegistrations` table
3. Click "Explore table items"
4. You should see the test registration

### 5.3 Test listRegistrations

1. Open `listRegistrations` function
2. Click **"Test"** tab
3. Create event named `getRegistrations`
4. Use API Gateway template with:

```json
{
  "httpMethod": "GET"
}
```

5. Click **"Test"**
6. **Expected result**:
   - Execution result: **succeeded**
   - Response statusCode: **200**
   - Response body contains `registrations` array

**✅ Checkpoint**: Both Lambda functions tested successfully

---

## Step 6: Create API Gateway

### 6.1 Navigate to API Gateway

1. Search for "API Gateway" in AWS Console
2. Click "API Gateway"
3. Click **"Create API"**

### 6.2 Choose API Type

1. Find **"REST API"** (not Private or HTTP API)
2. Click **"Build"** under REST API

### 6.3 Create API

1. Select **"New API"**
2. **API name**: `event-registration-api`
3. **Description**: "API for Kiro University Event Registration Portal"
4. **Endpoint Type**: **Regional**
5. Click **"Create API"**

### 6.4 Create Resource

1. In the Resources panel, select "/" (root)
2. Click **"Actions"** → **"Create Resource"**
3. **Resource Name**: `registrations`
4. **Resource Path**: `/registrations` (auto-filled)
5. Keep CORS unchecked (we'll configure manually)
6. Click **"Create Resource"**

**✅ Checkpoint**: API Gateway created with /registrations resource

---

## Step 7: Configure API Methods

### 7.1 Create POST Method

1. Select `/registrations` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **"POST"** from dropdown
4. Click the ✓ checkmark
5. **Integration type**: **Lambda Function**
6. Check ☑ **"Use Lambda Proxy integration"**
7. **Lambda Region**: Select your region
8. **Lambda Function**: Type `registerStudent`
9. Click **"Save"**
10. Click **"OK"** to grant API Gateway permission

### 7.2 Create GET Method

1. Select `/registrations` resource (click on it)
2. Click **"Actions"** → **"Create Method"**
3. Select **"GET"** from dropdown
4. Click ✓ checkmark
5. **Integration type**: **Lambda Function**
6. Check ☑ **"Use Lambda Proxy integration"**
7. **Lambda Region**: Your region
8. **Lambda Function**: Type `listRegistrations`
9. Click **"Save"**
10. Click **"OK"** to grant permission

### 7.3 Enable CORS

1. Select `/registrations` resource
2. Click **"Actions"** → **"Enable CORS"**
3. **Access-Control-Allow-Origin**: `*`
4. Keep default allowed headers
5. Check methods: **GET**, **POST**, **OPTIONS**
6. Click **"Enable CORS and replace existing CORS headers"**
7. Click **"Yes, replace existing values"**

**✅ Checkpoint**: POST and GET methods created with CORS enabled

---

## Step 8: Deploy API

### 8.1 Create Deployment

1. Click **"Actions"** → **"Deploy API"**
2. **Deployment stage**: Select **[New Stage]**
3. **Stage name**: `dev`
4. **Stage description**: "Development stage"
5. **Deployment description**: "Initial deployment"
6. Click **"Deploy"**

### 8.2 Get Invoke URL

1. After deployment, you'll see the **Invoke URL** at the top
2. Format: `https://XXXXXXXXXX.execute-api.REGION.amazonaws.com/dev`
3. **Copy this URL** - you'll need it for frontend configuration
4. Save it in a safe place

### 8.3 Test Endpoints

Test with curl or Postman:

```bash
# POST test (replace with your URL)
curl -X POST https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations \
  -H "Content-Type: application/json" \
  -d '{"studentName":"Jane Smith","studentEmail":"jane@test.com","studentId":"TEST456","eventName":"Career Fair 2026"}'

# GET test
curl https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/registrations
```

**✅ Checkpoint**: API Gateway deployed and accessible

---

## Step 9: Create SNS Topic

### 9.1 Navigate to SNS

1. Search for "SNS" in AWS Console
2. Click "Simple Notification Service"
3. Click **"Topics"** in left sidebar
4. Click **"Create topic"**

### 9.2 Create Topic

1. **Type**: Select **Standard**
2. **Name**: `RegistrationNotifications`
3. **Display name**: `Event Registrations`
4. Keep all other default settings
5. Click **"Create topic"**

### 9.3 Copy Topic ARN

1. You'll see the topic ARN at the top
2. Format: `arn:aws:sns:REGION:ACCOUNT_ID:RegistrationNotifications`
3. **Copy this ARN**

### 9.4 Update Lambda Environment Variable

1. Go back to Lambda Console
2. Open `registerStudent` function
3. **Configuration** → **Environment variables** → **Edit**
4. Update `SNS_TOPIC_ARN` with the copied ARN
5. Click **"Save"**

### 9.5 (Optional) Subscribe to Topic

To receive email notifications for testing:

1. In SNS Topic page, click **"Create subscription"**
2. **Protocol**: **Email**
3. **Endpoint**: Your email address
4. Click **"Create subscription"**
5. Check your email and confirm subscription

**✅ Checkpoint**: SNS topic created and Lambda configured

---

## Step 10: Final Verification

### 10.1 End-to-End Test

1. **Test POST** using Postman or curl with your API URL
2. Verify:
   - Response is 201 Created
   - Response contains registrationId
3. **Check DynamoDB**: Registration appears in table
4. **Check CloudWatch**: Logs show successful execution
5. **Check SNS** (if subscribed): Email notification received
6. **Test GET**: Retrieve registrations list

### 10.2 Document Configuration

Create a file with your configuration:

```
DynamoDB Table: EventRegistrations
IAM Role: EventRegistrationLambdaRole
Lambda Functions: registerStudent, listRegistrations
API Gateway: event-registration-api
API Invoke URL: https://XXXXXXXXXX.execute-api.REGION.amazonaws.com/dev
SNS Topic: RegistrationNotifications
SNS Topic ARN: arn:aws:sns:REGION:ACCOUNT_ID:RegistrationNotifications
Region: us-east-1 (or your region)
```

**✅ Checkpoint**: All AWS resources configured and working

---

## Troubleshooting

### Lambda Function Errors

**Issue**: Function times out
- **Solution**: Increase timeout in function configuration (max 15 minutes)

**Issue**: Permission denied for DynamoDB
- **Solution**: Verify IAM role has correct policy with table ARN

**Issue**: Cannot find module
- **Solution**: Ensure `node_modules` included in zip file

### API Gateway Errors

**Issue**: CORS error in browser
- **Solution**: Ensure CORS enabled with `*` origin

**Issue**: 403 Forbidden
- **Solution**: Redeploy API after making changes

**Issue**: 502 Bad Gateway
- **Solution**: Check Lambda function is not timing out

### DynamoDB Errors

**Issue**: Table not found
- **Solution**: Verify `TABLE_NAME` environment variable matches table name exactly

**Issue**: Access denied
- **Solution**: Check IAM role policy includes correct table ARN

---

## Resource Cleanup

To avoid charges, delete resources when done:

1. **API Gateway**: Delete API
2. **Lambda**: Delete both functions
3. **DynamoDB**: Delete table
4. **SNS**: Delete topic
5. **IAM**: Delete role (after deleting Lambda functions)
6. **CloudWatch**: Delete log groups (optional)

---

## Next Steps

1. ✅ AWS backend complete
2. ➡️ Proceed to frontend development
3. Configure frontend `.env` with API URL
4. Test complete flow end-to-end

---

**Setup Complete! 🎉**

Your AWS serverless backend is now ready for the Event Registration Portal.
