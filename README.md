## Steps to repro the error

1. Clone this project
2. `npm install` in this folder to install all the dependencies [Expects that you have [Node.js](https://nodejs.org/en/download/) downloaded/installed in your system]
3. Create `.env` file and populate it with `SERVICEBUS_CONNECTION_STRING` in it as shown in `sample.env`
4. Install `ts-node` globally (to be able to run the typescript file directly)
   > `npm install ts-node -g`
5. Running the sample with `ts-node test.ts` in this folder should give you the output such as below.

    ```bash
    100000 KB = max message size
    1 messages being sent... size = 90000.067 KB
    Error occurred:  ServiceBusError: InvalidOperationError: The link 'G1:3360212:queue-random-1930-2e2e81cc-d80f-e347-95b7-672dba6217ec' is force detached by the broker because publisher(link22) received a batch message with no data in it. Detach origin: Publisher.
        at translateServiceBusError (C:\<path>\sb-max-msg-size-test\node_modules\@azure\service-bus\src\serviceBusError.ts:174:12)
        at Object.sendEventPromise [as operation] (C:\<path>\sb-max-msg-size-test\node_modules\@azure\service-bus\src\core\messageSender.ts:266:33)
        at processTicksAndRejections (node:internal/process/task_queues:96:5) {
    retryable: false,
    info: null,
    code: 'GeneralError'
    }
    ```

## `test.ts`

`test.ts` file has three tests. Comment two of them at a time to run a test

```ts
// ----------- Test 1 -------------------------------------------------
// ----------- One large batch message formed by a single message -----
// sendTest(2000000 * 45, true).catch((err) => {
//   console.log("Error occurred: ", err);
//   process.exit(1);
// });

// ----------- Test 2 -------------------------------------------------
// ----------- One large batch message formed by a many messages ------
// sendTest(2000, true).catch((err) => {
//   console.log("Error occurred: ", err);
//   process.exit(1);
// });

// ----------- Test 3 ---------------------------
// ----------- One large non-batch message ------
sendTest(2000000 * 45, false).catch((err) => {
  console.log("Error occurred: ", err);
  process.exit(1);
});
```

### `sendTest(bodySize: number, isBatchMessage: boolean)`

sendTest method takes two arguments
- size of the body (- buffer of the specified size will be created)
- boolean indicating if the message being sent is a batch message

Tweak the arguments if you'd like to test with different kinds of inputs.
