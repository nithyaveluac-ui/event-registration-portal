import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  UpdateCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    const data =
      typeof event.body === 'string'
        ? JSON.parse(event.body)
        : event.body || {};

    const { registrationId, status } = data;

    const allowedStatuses = ['Confirmed', 'Rejected'];

    if (!registrationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Registration ID is required'
        })
      };
    }

    if (!allowedStatuses.includes(status)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Status must be Confirmed or Rejected'
        })
      };
    }

    const command = new UpdateCommand({
      TableName: process.env.TABLE_NAME,

      Key: {
        registrationId
      },

      UpdateExpression: 'SET #status = :status',

      ExpressionAttributeNames: {
        '#status': 'status'
      },

      ExpressionAttributeValues: {
        ':status': status
      },

      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Registration ${status.toLowerCase()} successfully`,
        registration: result.Attributes
      })
    };

  } catch (error) {
    console.error('Update registration error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to update registration',
        error: error.message
      })
    };
  }
};
