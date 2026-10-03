import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "EventRegistrations";

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || event;

    const registrationId = body.registrationId?.trim();

    if (!registrationId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "Registration ID is required",
        }),
      };
    }

    // Check whether registration exists
    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          registrationId,
        },
      })
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "Registration ID not found",
        }),
      };
    }

    // Prevent duplicate check-in
    if (getResult.Item.checkInStatus === "Checked In") {
      return {
        statusCode: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "Student is already checked in",
          registration: getResult.Item,
        }),
      };
    }

    const checkInTime = new Date().toISOString();

    const updateResult = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          registrationId,
        },
        UpdateExpression:
          "SET checkInStatus = :status, checkInTime = :time",
        ExpressionAttributeValues: {
          ":status": "Checked In",
          ":time": checkInTime,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: "Student checked in successfully",
        registration: updateResult.Attributes,
      }),
    };
  } catch (error) {
    console.error("Check-in error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
    };
  }
};
