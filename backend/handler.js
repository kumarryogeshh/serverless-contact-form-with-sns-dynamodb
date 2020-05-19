"use strict";
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

module.exports.submitContactForm = async (event) => {
  console.log("EVENT: ", event);

  const sns = new AWS.SNS();

  const messageData = JSON.parse(event.body);

  let message = "Thank you for contacting!\nWill get back to you soon!";
  let statusCode = 200;

  let response = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };

  if (typeof messageData.name != "string" || messageData.name.length === 0) {
    statusCode = 400;
    message = "Name is required";
  } else if (
    typeof messageData.email != "string" ||
    messageData.email.length === 0
  ) {
    statusCode = 400;
    message = "Email is required";
  } else if (
    typeof messageData.message != "string" ||
    messageData.message.length === 0
  ) {
    statusCode = 400;
    message = "A message is required";
  } else {
    // Send SNS
    const snsMessage = {
      TopicArn: process.env.CONTACT_TOPIC_ARN,
      Subject: "Message from ykumar.in contact form",
      MessageAttributes: {
        name: {
          DataType: "String",
          StringValue: messageData.name,
        },
        email: {
          DataType: "String",
          StringValue: messageData.email,
        },
        message: {
          DataType: "String",
          StringValue: messageData.message,
        },
      },
      Message: `
Contact Form Message
From: ${messageData.name} <${messageData.email}>
Message: ${messageData.message}
    `,
    };

    const result = await sns.publish(snsMessage).promise();
    console.log("PUBLISH RESULT: ", result);
  }

  // Send response back to frontend
  response.statusCode = statusCode;
  response.body = JSON.stringify({ message: message });
  return response;
};

module.exports.saveContactMessage = async (event) => {
  console.log("SNS EVENT: ", event);
  const dynamoDB = new AWS.DynamoDB();
  const snsObject = event.Records[0].Sns;
  console.log("snsObject :", snsObject);

  const dbItem = {
    TableName: process.env.CONTACT_TABLE_NAME,
    Item: {
      id: { S: uuidv4() },
      SNS_Timestamp: { S: snsObject.Timestamp },
      SNS_MessageId: { S: snsObject.MessageId },
      SNS_Message: { S: snsObject.Message },
      SNS_Subject: { S: snsObject.Subject },
      Sender_Name: { S: snsObject.MessageAttributes.name.Value },
      Sender_Email: { S: snsObject.MessageAttributes.email.Value },
      Message: { S: snsObject.MessageAttributes.message.Value },
    },
  };
  console.log("SAVING : ", dbItem);
  await dynamoDB.putItem(dbItem).promise();
  console.log("SAVED");

  return;
};
