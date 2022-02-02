// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT Licence.

import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
  ServiceBusMessage,
  ServiceBusMessageBatch,
} from "@azure/service-bus";

// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

// Define connection string and related Service Bus entity names here
const connectionString =
  process.env.SERVICEBUS_CONNECTION_STRING || "<connection string>";
const queueName = `queue-random-${Math.ceil(Math.random() * 1000 + 1000)}`;

export async function sendTest(bodySize: number, isBatchMessage: boolean) {
  const sbClient = new ServiceBusClient(connectionString, {
    retryOptions: { timeoutInMs: 60 * 1000 * 5 },
  });
  const adminClient = new ServiceBusAdministrationClient(connectionString);
  await adminClient.createQueue(queueName, {
    maxMessageSizeInKilobytes: 100 * 1000,
  });
  console.log(
    `${
      (await adminClient.getQueue(queueName)).maxMessageSizeInKilobytes
    } KB = max message size of the queue`
  );
  /* ------- QUEUE CREATION DONE ------------- */

  const sender = sbClient.createSender(queueName);

  try {
    let messageToSend: ServiceBusMessage | ServiceBusMessageBatch;
    if (isBatchMessage) {
      // To send the messages as batch
      const batchMessage = await sender.createMessageBatch();

      for (let numOfMessages = 0; ; numOfMessages++) {
        if (
          !batchMessage.tryAddMessage({ body: Buffer.alloc(bodySize) }) ||
          batchMessage.count > 4100 ||
          batchMessage.sizeInBytes / 1000 > 90 * 1000
        ) {
          break;
        }
      }

      console.log(
        `${batchMessage.count} messages being sent... size = ${
          batchMessage.sizeInBytes / 1000
        } KB`
      );
      messageToSend = batchMessage;
    } else {
      // To send a single message
      messageToSend = { body: Buffer.alloc(bodySize) };
    }

    await sender.sendMessages(messageToSend);
    // Close the sender
    console.log(`Done sending, closing...`);
    await sender.close();
    await adminClient.deleteQueue(queueName);
  } finally {
    await sbClient.close();
  }
}

// ----------- Test 1 -------------------
// sendTest(2000000 * 45, true).catch((err) => {
//   console.log("Error occurred: ", err);
//   process.exit(1);
// });

// ----------- Test 2 -------------------
sendTest(2000, true).catch((err) => {
  console.log("Error occurred: ", err);
  process.exit(1);
});

// ----------- Test 3 -------------------
// sendTest(2000000 * 45, false).catch((err) => {
//   console.log("Error occurred: ", err);
//   process.exit(1);
// });
