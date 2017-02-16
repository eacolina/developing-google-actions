# Developing Actions on Google

**NOTE:** The following documentation assumes that you have read the "Developing Amazon Alexa Skills", hence the explanation will be less detailled here.

Amazon Alexa is a voice recognition service that allows the integration of voice control to your app or device. In this guide, you will learn how to develop and deploy your own Alexa skills.

## Table of Contents
- [Differences between Actions on Google and Alexa Skills ](#how-alexa-works)
- [Creating a Google Action](#creating-alexa-skills)
  - [Step 1: Action Information](#step-1-skill-information)
  - [Step 2: Creating the Interaction Model using API.ai](#step-2-interaction-model)
      - [Intents](#intent-schema)
      - [Entities](#utterances)
  - [Step 3: Configuration on the Google Developer Console](#step-3-configuration)
  - [Step 4: Setting up your web hook in Meteor using Express](#step-4-lambda-function-configuration)
  - [Step 5: Web Hook Code](#step-5-lambda-function-code)
      - [Handler](#handler-function)
      - [Callback](#callback)
      - [Context](#context)
      - [Event](#event)
      - [Dealing with Requests](#dealing-with-requests)
      - [Dealing with Intents, Slots and Sessions](#dealing-with-intents-slots-and-sessions)
      - [Building Speech Component](#building-speech-component)
      - [Building Callback Response](#building-callback-response)
      - [Using Callback](#using-callback)
      - [Install NPM Packages](#install-npm-packages)
      - [External HTTP Requests](#external-http-requests)
  - [Step 6: Conclusion and Testing](#step-6-conclusion-and-testing)
- [Resources](#resources)
- [Authors](#authors)

## How Alexa Works
In order to develop an Alexa Skill we should first understand how it works by looking at the following use-case:
![](https://developer.amazon.com/public/binaries/content/gallery/developerportalpublic/alexa_smart_home_ecosystem.png)

To do that or to control an app, the system architecture is expected to look like this:
![](https://perkinelmer.box.com/shared/static/psnchr8fvqu5njil35yognio1okzkw43.png)

When Alexa parses your speech, she compiles the data into a JSON structure and sends it to an endpoint. That endpoint may be on your own HTTPS server, or an AWS Lambda Function. In this guide, we will create an AWS Lambda Function.

In that Lambda Function, we parse that JSON data, do something with it (REST calls, computation, etc.), then returns JSON data back to Alexa. Alexa takes the data you send back (text to say) and responds to the user. We will get into the specifics of what the data contains (in both directions) later.

Note: there is an [Alexa Skills Kit SDK](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) designed to make development easier, but for this guide, we will not use it. It is not documented well enough at this point. If you would like to use it, you can choose a template for it in [Step 4](#42-blueprint).

## Creating Alexa Skills
There are 6 parts to creating Alexa skills.

## Step 1: Skill Information
Go to the [Amazon Developer Portal](https://developer.amazon.com/edw/home.html#/) and choose "Get Started" with the Alexa Skills Kit. Then you can "Add a New Skill" and start with the Skill Information.

If you are creating a custom skill from scratch, choose that as your Skill Type. Otherwise, if you want to use a built-in API, choose one of the other Skill Types.

The "Name" of your skill is what is displayed to the users. This is *not* what you use to invoke your skill. The "Invocation Name" is what you use to invoke your skill. For example, if your Invocation Name is "Tester", then you would use your Skill by saying:

> Alexa, ask Tester \<utterance\>

The general format of a Skill call is the following:

> Alexa, \<ask/tell/...\> \<invocation_name\> \<utterance\>

The `...` is there because there is more vocabulary that can be put there. For example, you may use "open" there instead, and then omit the \<utterace\> part. Then, it will simply state your welcome message for the skill (and start the Session - more on that later). Also, there are more ways to invoke a custom skill than the general format I wrote ([read more](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/supported-phrases-to-begin-a-conversation)). I just wrote the primary format.

You cannot have your skill be referenced without the invocation name to avoid any ambiguous skill uses. Imagine if multiple skills had the same utterance of "do something". Then "Alexa, do something" would be ambiguous - which skill do you use?!

We will see what an utterance is in the next step.

Note: the Audio Player option is *not* to allow Alexa to play speech back to the user. That is a given. You can tell Alexa to respond to the user via speech even without Audio Player directives.

## Step 2: Interaction Model

### Intent Schema
An intent represents an action that fulfils a user's request. Alexa will analyze what the user has requested from her and then generate an "intent" from that request. That intent is sent in the data to the AWS Lambda Function. Then, you can do something (depending on what the intent is) in your Lambda Function. You will define how Alexa determines which intent to send based on the user request in the second part of this step.

As an example, imagine there are two intents, one called `GetFavouriteColour` and another called `SetFavouriteColour`. Then, when the user says "Alexa, tell Tester that my new favourite colour is blue", Alexa should send the `SetFavouriteColour` intent to the Lambda Function. Or, if the user says "Alexa, ask Tester what my favourite colour is", Alexa should send the `GetFavouriteColour` intent instead.

Note: Alexa sees no difference between "ask" and "tell" in the part just before your invocation name. It does *not* specify get vs. set or anything like that. For example, "Alexa, ask Tester what my favourite colour is" would get the same data as "Alexa, tell Tester what my favourite colour is".

But isn't that weird? Yes, it is. The "tell" sentence seems like you are wanting to tell Alexa what your favourite colour is, but Alexa thinks you are asking for it. In this case, it would be more appropriate to name the utterance "what is my favourite colour" so that the ask vs tell scenario would never happen. Because then, "Alexa, tell Tester what is my favourite colour" never makes sense in any context, so the user won't say it. That sentence will still technically work for Alexa, but it is not likely to be said by the user.

You can also define input variables for your intents. They are called "slots". Each "slot" has a "name" and a "type". The name is used in the utterances and Lambda Function to determine what the input is. The type is one of the default types (AMAZON.NUMBER for a number, etc.) or a custom slot type. A custom slot type can be added easily and the definition of one is just every possible input for the type on a separate line. For all slot type listings, visit the [Interaction Model Reference](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#Slot%20Types).

The format of an intent schema may look like the following:

```
{
  "intents": [
    {
      "intent": "SetSomeDataIntent",
      "slots": [
        {
          "name": "someData",
          "type": "AMAZON.NUMBER"
        }
      ]
    },
    {
      "intent": "GetSomeDataIntent"
    },
    { "intent": "AMAZON.HelpIntent" },
    { "intent": "AMAZON.StopIntent" },
    { "intent": "AMAZON.CancelIntent" }
  ]
}
```

Notice that the last three intents are built-in intents. Those will be used in the last step. Find the list of them here: [Built-in Intents](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents)

### Utterances
For the sample utterances section, use the following potential formats:

> MyIntentName my sample utterance
>
> MyIntentName my sample utterance {mySlotName}
>
> MyIntentName my sample utterance {mySlotName} more utterance text

The utterances are line-separated. Each line must start with the intent name that is associated with the utterance. The point is when users say an utterance, Alexa will send *the corresponding* intent to the Lambda Function. So depending on what users say, you take a specifc action.

The `{mySlotName}` notation indicates that anything said here will be stored in a variable named *mySlotName*, and passed on to the Lambda Function. For example:

> MyIntentName do something with {someData}

And saying "Alexa, tell Tester do something with 5" will give the slot with name "someData" a value of 5.

Note that utterances are specific and if you want the same intent to be called even if some of the words are switched around in the utterance, you must declare nearly duplicate utterances where you make those minor changes. For example: if you want "do something with 5" and "do some with the number 5" to both be recognized as utterances, use the following utterances:

> MyIntentName do something with {someData}
>
> MyIntentName do something with the number {someData}

## Step 3: Configuration
Now is where you specify your endpoint for Alexa to send the intent and slot data to. You may choose your own web server, or an AWS Lambda ARN (AWS web server).

Let's choose the AWS Lambda ARN. But now we need to create a Lambda function, which will automatically creates a web server for us on AWS. You can access it by Amazon Resource Name (ARN). This is what we need to enter for the endpoint field. We will make the Lambda function in another tab and then come back to enter the ARN we get from it.

## Step 4: Lambda Function Configuration

### 4.1 Create Function
Open up [AWS Console](https://console.aws.amazon.com/lambda/) and sign into the console. The link should take you right to Lambda in the console, but if you are in the console and not at the Lambda page, just find it.

### 4.2 Blueprint
Then you can click "Create a Lambda function". Then you have the option of selecting a blueprint. It is just to give you a template to work with for your function. You can choose the "Blank Function" template if you want to start from scratch, or you can pick a relevant one.

### 4.3 Configure Triggers
In this section, if it says "Alexa Skills Kit > Lambda", it is already configured. Otherwise, click the empty box on the left and choose "Alexa Skills Kit".

### 4.4 Configure Function

#### Name, Description, and Runtime
You may name your function whatever you see appropriate, and describe it how you see fit. This is done just to help you quickly recognize the functions you create. For this guide, the runtime should be Node.js 4.3 or higher. Other runtimes may be used perfectly fine. It is a matter of preference for how you want to handle your endpoint.

We will skip the function code for a minute and come back to it in the next step. Scroll below it for now.

#### Environment Variables
[Read More](http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html)

#### Handler Configuration
The `module-name.export` value in your function. For example, `index.handler` would call `exports.handler` in `index.js`. And if you create a file `helloworld.js`, then `helloworld.myHandler` would be the handler, which would call `exports.myHandler`.

AWS Lambda invokes this handler function when the service executes your code. `exports.myHandler = function(event, context, callback?) {` The JSON body of the request is provided in the event parameter.

We will talk more about this in the next step.

#### Role
The role defines the permissions of your lambda function. [Read More](https://docs.aws.amazon.com/lambda/latest/dg/intro-permission-model.html#lambda-intro-execution-role)
For this case, choose "Create a custom role" and then choose "lambda_basic_excecution" from the IAM Role dropdown.

#### Advanced Settings
The only setting to mention here is `Timeout`. We had issues where some API calls would timeout and the whole Lambda function would error out. The reason was because the default `Timeout` value is 3 seconds. We recommend increasing that depending on what makes sense. 3 seconds is typically not a long enough buffer time for anomolies or a lot of data. We changed the value to 10 seconds.

## Step 5: Lambda Function Code

Now scroll up to the code (or go to wherever the code is) and get started on that.

**Note**: For this guide, we have `'use strict';` as the very first line of our JavaScript code. Make sure you do as well, or else you will get some errors. You can omit that line if you want, but you will have to make some changes to the code as well.

### Handler Function
Inside of your Lambda function, the entry point is the handler function ([docs](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html)). An example of a handler function is `exports.handler = (event, context, callback) => {`, or replace `handler` with whatever you called it when configuring the function. Here, we called it `index.handler`, so `exports.handler` is to use.

The handler has three parameters:

#### Event
The `event` object is sent to your handler function as a parameter. It gives information such as Session data (talked about later) and request information. The request information contains the intent details and slot values, the locale and timestamp.

The uses of the `event` object will be shown later.

#### Context
The `context` object is sent into the handler function as a parameter. It provides useful runtime information while the Lambda function is executing ([docs](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html)).

In *earlier* versions of Node.js, the callback parameter for Lambda functions is not supported. To terminate the Lambda function, instead use `done()`, `succeed()`, and `fail()` on your `context` object. Although we use the newest version of Node available, this is mentioned because in some tutorials, they use older versions of Node, so you might see this. [More information](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-using-old-runtime.html)

#### Callback
The `callback` is a Node.js thing and it is an optional argument to your handler function. It is a function. Use `callback(error, result)` to return information back to the caller (in our case, it's your Lambda function's response back to Alexa).

- `error` is optional (null if you want it to be ignored).
- `result` is optional as well. Must be JSON.stringify compatible. If `error` is provided, `result` is ignored.

We will show the format of the `result` object that needs to be sent in the callback function a little later ([docs](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html)).

### Sessions
A session is started when you mention an utterance from your skill. You can send a flag to end your session once an utterance is received, or you can keep the session going. Keeping the session going is letting you say multiple utterances in succession without mentioning your skill name again. Sessions can also store variables.

Examples of how to use sessions will be shown later.

### Dealing with Requests
In your handler function, you'll want to check the request type from the `event` object and then handle the request from there (use `event.request.type`). The event types can be `LaunchRequest`, `IntentRequest` or `SessionEndedRequest`.

If it's a `LaunchRequest`, the user might have asked to "open" your skill. So greet them with a welcome message and maybe a brief explanation of how to use it.

If it's a `SessionEndedRequest`, you'll want to do any Session cleanup and then return nothing back to Alexa (`callback()`). You may think "well I want Alexa to say bye". But that is done in specific built-in intents, such as `AMAZON.StopIntent` and `AMAZON.CancelIntent`. Ending the Session is solely for cleaning up the Session data (if you even need to).

If it's an `IntentRequest`, you'll want to check which intent was sent and then handle it appropriately. It will be one of the intents from your Intent Schema.

Here is a general format for dealing with the different request types:

```javascript
// some functions...

exports.handler = (event, context, callback) => {

  // some other stuff...

  if (event.request.type === 'LaunchRequest') {
    onLaunch(someParams);
  } else if (event.request.type === 'IntentRequest') {
    onIntent(someParams);
  } else if (event.request.type === 'SessionEndedRequest') {
    onSessionEnded(someParams);
    callback(); // returns no information back to Alexa (she won't speak)
  }
};
```

### Dealing with Intents, Slots and Sessions
You may use `const intent = event.request.intent` to get the `intent` object. From there, you can use `intent.name` to get the name, which you can then use to check which function you should call.

Here is a general format for dealing with the intent name:

```javascript
function onIntent(intent, session, callback) {
  const intentName = intent.name;

  if (intentName === 'SetSomeDataIntent') {
    setSomeDataIntent(intent, session, callback);
  } else if (intentName === 'AMAZON.StopIntent' ||
             intentName === 'AMAZON.CancelIntent') {
    handleSessionEndRequest(callback);
  } else {
    throw new Error('Invalid intent');
  }
}
```

And then you can call this method from your handler function with the following:
`onIntent(event.request.intent, event.session, callback);`

The callback parameter will be explained later.

Now let's look inside the `setSomeDataIntent` function. That is where the session data is looked at and where the slot data is looked at. It is also where you make external API calls, build the speech component that you can send back to Alexa, etc.

On the `intent` object, you can use `intent.slots` to get the slots array. Now let's assume you have the following slots array in your Intent Schema:

```
"slots": [{
    "name": "someData",
    "type": "AMAZON.NUMBER"
}]
```

Then you can get that data like this:
`const slotData = intent.slots.someData.value;`

Here is a general format for the functions:

```javascript
function setSomeDataIntent(intent, session, callback) {
  const slotData = intent.slots.someData.value;
  // some other stuff...

  // get "foo" session attribute
  var foo = null;
  if (session.attributes) {
    foo = session.attributes.foo;
  }

  // create session data to save
  var sessionAttributes = {foo: slotData};
}
```

The code gets the value of the slot named `someData` (part of the utterance that the user said). Then, it gets the session attribute called `foo` and does nothing with it. But something could be done with it. And finally, it creates a new session attribute with the value being the value of `slotData`.

Currently, `sessionAttributes` is created, but not used anywhere. So it's not actually saved to the session. We will see where to send that data in the next parts.

### Building Speech Component
To build the speech component that we need to send back to Alexa (via the `callback` function), we will build a helper method to do so.

```javascript
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: 'PlainText',
      text: output,
    },
    card: {
      type: 'Simple',
      title: `SessionSpeechlet - ${title}`,
      content: `SessionSpeechlet - ${output}`,
    },
    reprompt: {
      outputSpeech: {
        type: 'PlainText',
        text: repromptText,
      },
    },
    shouldEndSession,
  };
}
```

The field `outputSpeech` is the response that Alexa will give to the user via speech. The field `card` is the card that will display on the Alexa app (in the request log). The field `reprompt` is the response that Alexa will give to the user (via speech) if there is an issue and Alexa needs to reprompt the user. And finally, the field `shouldEndSession` is a boolean that says whether or not the session will end after this response is given from Alexa. For example, if you want Alexa to keep listening to what the user says after this response (without having to say "Alexa, ask Tester to..." every time), set `shouldEndSession` to false.

### Building Callback Response
Similar to building the speech component, we will use a helper function to build the response object that is used directly as a parameter to the `callback` function.

```javascript
function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: '1.0',
    sessionAttributes,
    response: speechletResponse,
  };
}
```

Notice the field `response`, which takes `speechletResponse`. That is the result of the function we just created prior to this, `buildSpeechletResponse`. Also note that the `sessionAttributes` are added to this object. This is where the session attributes are sent to, which is how they get saved. The response from this function has the session attributes, and then the response is sent to the `callback` function.

### Using Callback
We originally get the `callback` function in the handler function. So then in every helper method we use, which may need to eventually use that function, we need to pass in `callback` as a parameter to those functions as well.

For example, when we call `onLaunch`, `onIntent` and `onSessionEnded` in our handler function, we must pass `callback` as a parameter to those functions. Let's take `onLaunch` an example.

Call it from our handler with:
```
onLaunch(callback);
```

Then define the function like the following:

```javascript
function onLaunch(callback) {
  // initialize the session to have some attributes (if needed)
  const sessionAttributes = {};
  // data to send back to Alexa
  const cardTitle = 'Welcome';
  const speechOutput = 'Welcome speech text.';
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  const repromptText = 'Reprompt text.';
  const shouldEndSession = false; // welcoming, so the session needs to stay active

  // use the callback function to return the data back to Alexa.
  const speechletResponse = buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession);
  callback(null, buildResponse(sessionAttributes, speechletResponse));
}
```

Notice that the first parameter to `callback` is `null`, which indicates that there are no errors in the response. And we use our helper functions `buildSpeechletResponse` and `buildResponse` to generate the data for the `callback` function.

You may use the same format inside the `onIntent` function to return data back to Alexa. An example of that is shown in the following part, [External HTTP Requests](#external-http-requests).

### Install NPM Packages
We are using Node.js for this Lambda function, so of course we can use npm. To include npm packages for usage (such as `http` or `request` for making API calls), we can upload a zip file to AWS (containing the npm packages in a `node_modules` directory and the Lambda function in a JS file). Follow these steps:

1. Create a directory somewhere on your computer.
2. Make a JavaScript file in there. Call it the same name as your handler (from the configuration step). E.g. if you used the handler `index.handler`, you can name the JS file `index.js`.
3. Install your npm packafes in that directory (e.g. `npm install request` or `npm install http`). You may need to also run `npm init` first so that they save in the `node_modules` directory.
4. Zip the JS file and `node_modules` directory together by selecting them both, then by right clicking and choosing "compress". Or you could use the command line with command "zip". Make sure that the JS file and `node_modules` directory are in the root of the zip (not in a directory inside the zip).
5. Open up your Lambda function code in the AWS console again. Under "Code entry type", it should say "Edit code inline" by default. Change that to "Upload a .ZIP file" and then proceed to upload the directory you zipped.

### External HTTP Requests
Assuming that we followed the part immediately before this, we can use `request` to make external API calls now. Let's do that inside our intent function (e.g. `setSomeDataIntent`, which is called after we figured out what the name of the intent was).

```javascript
function setSomeDataIntent(intent, session, callback) {
  const slotData = intent.slots.someData.value;

  // initializing data to be sent to the callback function
  var speechOutput = '', repromptText = '', shouldEndSession = true, cardTitle = intent.name, sessionAttributes = {};

  // get "foo" session attribute
  var foo = null;
  if (session.attributes) {
    foo = session.attributes.foo;
  }

  // create session data to save
  var sessionAttributes = {foo: slotData};

  // make an API call
  var request = require('request');
  request({
    url: 'YOUR_URL',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    json: {
      foo: foo, // session attribute
      slotData: slotData // slot input data
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('BODY: ', body);
      speechOutput = "Some POST request was made. The set value is " + slotData;
      repromptText = "Your reprompt text.";
    } else {
      speechOutput = "Error.";
      repromptText = "Your remprompt text.";
      shouldEndSession = false;
    }
    // use the callback function to return the data back to Alexa.
    const speechletResponse = buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession);
    callback(null, buildResponse(sessionAttributes, speechletResponse));
  });
}
```

## Step 6: Conclusion and Testing
After you are done writing your code for the Lambda Function, you can click "Next" to complete the process.

After you complete the Lambda function, at the top right corner, it will give you the ARN. You may have to open the Lambda function again to see it. It should say something like
> ARN - arn:aws:lambda:us-east-1:579632299403:function:GRT

Just copy the entire part after `ARN -`:
> arn:aws:lambda:us-east-1:579632299403:function:GRT

And put that into the textbox that we got at the end of [Step 3](#step-3-configuration). Click next, test your skill and use it on your Echo.

On your Lambda function page, you can give test input to the function and see the output. That test input can be generated from the Test tab on the page where you create your skill (after you click Next when you enter your ARN). The Lambda function testing shows raw input/output from the function. The Test tab on the skill page shows input/output from the user to Alexa (uses the Lambda function in between).

### Example
When using the example code, try the following inputs into Alexa so you can follow what is happening:

> Utterance: do something with 1
>
> Utterance: do something with 2
>
> Utterance: do something with 3
>
> Utterance: do something with 0
>
> Utterance: do something with 4
>
> Utterance: do something with 5

You may want to improve the example by logging session information (when it starts, ends and updates attributes).


## Resources
- [Create an AWS Lambda Function for a Custom Skill (Color example)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function)
- [Amazon Developer Portal (Step 1)](https://developer.amazon.com/edw/home.html#/)
- [How Users Invoke Custom Skills (Step 1)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/supported-phrases-to-begin-a-conversation)
- [Defining the Voice Interface (Step 2)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface)
- [Interaction Model Reference (Step 2)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#Slot%20Types)
- [Built-in Intents (Step 2)](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/standard-intents)
- [AWS Console (Step 3)](https://console.aws.amazon.com/lambda/)
- [Lambda Function Docs (Steps 4-5)](http://docs.aws.amazon.com/lambda/latest/dg/programming-model.html)
- [Alexa Skills Kit SDK](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)


## Authors
- Mike Yaworski
- Eduardo Colina
- Abdul Al-Haimi
