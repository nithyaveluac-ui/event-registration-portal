import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Validate registration data
 * @param {Object} data - Registration data to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
function validateRegistrationData(data) {
  const errors = {};
  
  // Check student name
  if (!data.studentName || data.studentName.trim() === '') {
    errors.studentName = 'Student name is required';
  }
  
  // Check student email
  if (!data.studentEmail || data.studentEmail.trim() === '') {
    errors.studentEmail = 'Email is required';
  } else if (!data.studentEmail.includes('@') || !data.studentEmail.includes('.')) {
    errors.studentEmail = 'Please enter a valid email address';
  }
  
  // Check student ID
  if (!data.studentId || data.studentId.trim() === '') {
    errors.studentId = 'Student ID is required';
  }
  
  // Check event name
  if (!data.eventName || data.eventName.trim() === '') {
    errors.eventName = 'Event selection is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Generate random alphanumeric string
 * @param {number} length - Length of random string
 * @returns {string} - Random alphanumeric string
 */
function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Lambda handler for student registration
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @returns {Object} - API Gateway Lambda Proxy Output Format
 */
export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // CORS headers for all responses
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  try {
    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }
    
    // Parse request body
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid request body',
          errors: { body: 'Request body must be valid JSON' }
        })
      };
    }
    
    // Validate registration data
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        })
      };
    }
    
    // Generate unique registration ID
    const timestamp = Date.now();
    const randomString = generateRandomString(6);
    const registrationId = `reg_${timestamp}_${randomString}`;
    
    // Create timestamp in ISO 8601 format
    const timestampISO = new Date().toISOString();
    
    // Prepare registration item
    const registration = {
      registrationId,
      studentName: data.studentName.trim(),
      studentEmail: data.studentEmail.trim().toLowerCase(),
      studentId: data.studentId.trim(),
      eventName: data.eventName.trim(),
      timestamp: timestampISO
    };
    
    console.log('Storing registration:', registration);
    
    // Store in DynamoDB
    const putCommand = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: registration
    });
    
    await docClient.send(putCommand);
    console.log('Registration stored successfully in DynamoDB');
    
    // Publish notification to SNS (non-blocking - don't fail registration if SNS fails)
    try {
      if (process.env.SNS_TOPIC_ARN) {
        const message = {
          registrationId: registration.registrationId,
          studentName: registration.studentName,
          studentEmail: registration.studentEmail,
          studentId: registration.studentId,
          eventName: registration.eventName,
          timestamp: registration.timestamp
        };
        
        const publishCommand = new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Subject: 'New Event Registration',
          Message: JSON.stringify(message, null, 2)
        });
        
        await snsClient.send(publishCommand);
        console.log('SNS notification published successfully');
      }
    } catch (snsError) {
      // Log SNS error but don't fail the registration
      console.error('SNS publish failed (non-critical):', snsError);
    }
    
    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Registration successful',
        registrationId: registration.registrationId,
        timestamp: registration.timestamp
      })
    };
    
  } catch (error) {
    console.error('Error processing registration:', error);
    
    // Determine if it's a DynamoDB error
    const isDynamoDBError = error.name && (
      error.name.includes('DynamoDB') ||
      error.name === 'ResourceNotFoundException' ||
      error.name === 'ValidationException'
    );
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: isDynamoDBError 
          ? 'Database error: Failed to store registration'
          : 'Internal server error: Failed to process registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
