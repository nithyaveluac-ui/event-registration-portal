import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize AWS DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * Lambda handler for listing registrations
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
    
    console.log('Scanning DynamoDB table:', process.env.TABLE_NAME);
    
    // Scan DynamoDB table to get all registrations
    const scanCommand = new ScanCommand({
      TableName: process.env.TABLE_NAME
    });
    
    const result = await docClient.send(scanCommand);
    console.log(`Retrieved ${result.Items?.length || 0} registrations from DynamoDB`);
    
    // Get items from result
    const registrations = result.Items || [];
    
    // Sort registrations by timestamp (newest first)
    const sortedRegistrations = registrations.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA; // Descending order (newest first)
    });
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: sortedRegistrations.length,
        registrations: sortedRegistrations
      })
    };
    
  } catch (error) {
    console.error('Error fetching registrations:', error);
    
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
          ? 'Database error: Failed to fetch registrations'
          : 'Internal server error: Failed to retrieve registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
