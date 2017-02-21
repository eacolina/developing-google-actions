# Developing Actions on Google

**NOTE:** The following documentation assumes that you have read the "Developing Amazon Alexa Skills", hence the explanation will be less detailed here.
**Before you begin:** Clone the repo from the [Alexa-Meteor](#https://github.com/aalhaimi/developing-alexa-skills) example app and deploy the **meteorApp** folder to Heroku.

We can think of Actions as Google's response to  Alexa.Both work using a very similar logic flow, a voice enabled device processes voice input from the user, sends this parsed information in a JSON to a web service, this web service executes the developers logics and it sends back a JSON response.

## Table of Contents
- [Differences between Actions on Google and Alexa Skills ](#how-alexa-works)
- [Creating a Google Action](#creating-alexa-skills)
  - [Step 1: Configuration on the Google Developer Console](#step-1-skill-information)
  - [Step 2: Creating the Interaction Model using API.ai](#step-2-interaction-model)
      - [Creating the Agent](#create-agent)
      - [Intents](#intent-schema)
      - [Fulfillment](#fulfillment)
  - [Step 3: Enable your agent in Google Actions](#step-3-configuration)
  - [Step 4: Setting up your web hook in Meteor using Express](#step-4-lambda-function-configuration)
  - [Step 5: Web Hook Code](#step-5-lambda-function-code)
        - [Creating an endpoint in Express](#express-code)
        - [Handler and Action Map](#callback)
        - [Getting the value of a parameter](#get-arg)
        - [Sending a response back to the user](#reply)
      - [External HTTP Requests](#external-http-requests)
  - [Step 6: Conclusion and Testing](#step-6-conclusion-and-testing)
- [Resources](#resources)
- [Authors](#authors)

## How do Actions on Google work
In order to develop an Alexa Skill we should first understand how it works by looking at the following use-case:
![](https://developers.google.com/actions/images/conversation-action.png)

To do that or to control an app, the system architecture is expected to look like this:
![](https://perkinelmer.box.com/shared/static/psnchr8fvqu5njil35yognio1okzkw43.png)

As said before the process is almost identical of the one followed by Alexa so we are not going to get into much detail.

Note: there is an [Alexa Skills Kit SDK](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) designed to make development easier, but for this guide, we will not use it. It is not documented well enough at this point. If you would like to use it, you can choose a template for it in [Step 4](#42-blueprint).

## Creating Alexa Skills
There are 6 parts to creating Alexa skills.

## Step 1: Action Information
Creating an Action for the first time might seem a little bit more tricky than creating an Alexa Skill as there are more //CHECk pieces involved, nevertheless once you do it one time it becomes straightforward.

**NOTE:** You need a Google account to create an Action.

The first you need to do is to go to the [Google Developer Console](#https://console.developers.google.com/), sign in and click **Create project**.Give your project a name, and copy your project ID.

Here's where the big difference with Alexa comes into play. Before we created the interaction model by simply creating a JSON file with our intents and utterances.Here we will use a conversational user experience platform called [API.ai](https://api.ai/).

Here to wake up the Google Home device you use the key phrase:
> Ok, Google ...

> Ok Google, talk to inLAB

The general format of a Skill call is the following:

> Ok Google, talk to \<invocation_name\> \<utterance\>

## Step 2: Creating the Interaction Model using API.ai

This step is the equivalent of creating our intent schema and utterances file in Alexa. Here's is where the main advantage of using Actions comes in.
The API.ai platform gives us a powerful and robust way of creating a conversational experience for the user.First of all, because it uses Google's Natural Language Processing engine which is much better than Amazon's, it allows us to ask prompt questions with just a few clicks instead of having to create some obfuscated logic in our backend to track the stage of the conversation. And the ability to export and import all of your actions with a ZIP file. Plus they have a really nice user interface (but they still have some TEDIOUS bugs).


### Creating an Agent

If you are going to use API.ai your agent will be the core of your action.To create an agent go to [API.ai](https://api.ai/), and log in using Google (you don't have to but it will make things easier).

Once you login click **Create a New Agent** in the left menu bar.Give your agent a name and be sure to set the language to English as it's the only supported language by Google right now.

### Intents

As for the Alexa Skill example, we will define two intents.A _**runMethod_intent**_ and a _**navigation_intent**_.
  To create an intent, click **Intents** on the left side bar.Here you will see two default intents which happen to be really useful.But we won't edit them now.Click **CREATE INTENT** in the top right corner.Name it: _**runMethod_intent**_.
  In the **User says** field you will type your utterances, this time you won't have to write most of the possible combination for a particular sentence, just give it a few and API.ai you learn how to identify them efficiently.
  Type around 4 to 5 example sentences. You will notice that as soon as you hit enter the numbers will get highlighted. This means that this word (or number in this case) is a parameter, so the equivalent of a slot in Alexa.It does it automatically because numbers are common parameters, but you can select or unselect any word you want and make it a parameter
  You should give a reference name in the **Parameter Name** field.The **Entity** field is where you define the type of the parameter.Here we will use the _**@sys.number-integer**_ entity as we want to make sure that the method argument is an integer.The **Value** field is where you will define the variable name to access the value of this parameter later.It will always be set automatically for you unless you are accessing a context variable (you will learn about this later).
 ![Screen Shot 2017-02-17 at 11.12.51 AM](</assets/Screen Shot 2017-02-17 at 11.12.51 AM.png>).Also, notice that when setting up the parameter you there is a **Required** checkbox.This is what enables the "conversational model" we discussed above. Your agent will not send a request to your webhook until this parameter has a value.When the user doesn't specify a value for it, the agent will ask for it.You can customize those question by clicking on **Define prompts** in the left.
 Now the last thing you need to do to finish this intent is to enable fulfillment (i.e allow the intent to talk to your webhook). For this scroll down click  **Fulfillment** in the intent panel.
 And enable the **Use webhook** checkbox.
![Screen Shot 2017-02-17 at 11.42.38 AM](</assets/Screen Shot 2017-02-17 at 11.42.38 AM.png>)

Ok, so we have now created our _**runMethod_intent**_ we need to create a _**navigation_intent**_.

For this intent follow the same steps as the previous one and fill it like this.

![Screen Shot 2017-02-17 at 2.17.47 PM](</assets/Screen Shot 2017-02-17 at 2.17.47 PM.png>)

Don't forget to enable fulfillment in the bottom.

### Fulfillment

In the left sidebar of API.ai click **Fulfillment**, here enable the webhook and paste the URL of your Heroku app that you deployed at the beginning and add "/ga-webhook" to it.It should look like this.
>https://<your-app-name>.herokuapp.com/ga-webhook

Here the _/ga-webhook_ is our Express endpoint so you can name it however you want but for the purpose of this tutorial, we will just us this path.



## Step 3: Enabling your agent in Google Actions

Now that your agent is ready to be deployed to the Actions on Google platform we can start the **Integration** process.For this just go to **Integrations** on the left sidebar and select **Actions on Google**, and enable it. For the invocation put in a name of your choice.For the **Google Project ID** field, you will need to paste the _ProjectID_ from Step 1. Leave the **Sign in required for welcome intent** unchecked.

## Step 4: Setting up your webhook in Meteor

Now that our Action's interaction model is up and running we need to create the business logic to process our intents (the equivalent of the Lambda function for Alexa).This time we will embed the fulfillment in our Meteor app, this way we can eliminate an unnecessary middle man and speed up the process.As we said at the beginning of this tutorial we will be using Google's **ActionSDK**.Because of this, we will need to implement the endpoint of our webhook using **Express**(because the SDK only works with Express objects).For this, we need to add a few packages to our Meteor app.

``` bash
$ npm install --save actions-on-google
$ npm install --save express
$ meteor add glittershark:meteor-express
```

With this, we can begin creating our webhook.We will create our Express endpoint in a new file in our 'server' folder.

## Step 5: Step 5: Web Hook Code

### Creating an endpoint in Express

Express is simply another router package similar to Restivus or any other.
To create an endpoint we simply need to create an new Express instance :

``` js
app = Express()
```
Then to create a POST enpoint we do the following:

```js
app.post('<route>', function(request, response){
  // do stuff with the request
  // send response
})
```
**NOTE:** For Google Actions you will need to use a POST endpoint.

 Even though Google did a terrific work on the [SDK's documentation](https://developers.google.com/actions/reference/ApiAiAssistant), we will briefly go over some methods and properties used in this example, to get context on the code snippets below please check out the file:`app/server/expressWebhook.js`

### Assistant

To use the SDK with API.ai we need to declare the ApiAiAssistant class and also create an instance of this class.

```js
const APIAiAssistant = require('actions-on-google').ApiAiAssistant; // declare the APIAiAssistant class included in the ActionsSDK
const assistant = new APIAiAssistant({request:req,response:res}); //create new instance of API assistant with the reponse and request of this particular endpoint
```

With the assistant created we now need to declare a handler to process the requests being made to our Action's webhook.

### Handler and Action Map

As with Alexa the endpoint needs a function to handle the incoming requests.`assistant.handleRequest()` accepts a single parameter. Either a function callback that will be called whenever there is an incoming request.Or it will also take a map of callback functions.In this case, it will map the `action` of the incoming request to the functions that you declare.The `action` name is the one that you set in the **Action** field when you create an intent using API.ai.

``` js
const actionMap = new Map(); //create a new a map to map the intents called with fucntions in our webhook
actionMap.set('input.welcome',welcomeIntent);
actionMap.set('runMethod_intent', runMethod);
actionMap.set('goToView_intent', Navigate)
assistant.handleRequest(actionMap); // declare handler to process the requests made form API.ai
```

## Getting the value of a parameter


To get the value of a parameter from an intent is as simple as calling a method.
`assistant.getArgument(argName)` takes a `string` with the name of the parameter, and will return an `Object` that will either have the value the matching argName or `null` in case there is not such parameter in the intent.


## Sending a response back to the user

Here it's easier to send back a response to the user.You can either use `assistant.tell(textToSpeech)` or `assistant.ask(textToSpeech, [noInputs])`.Both of these methods will return an HTTP `object` that will be sent back to API.ai by Express.
`textToSpeech` is simply a `string`, and `noInputs` is an optional `Array of string`.The main difference between these two methods is that `ask` will keep the mic open waiting for a request from the user.And `tell` will close the mic and exit the conversation.



### External HTTP Requests
There is nothing special on making external from Express, it's exactly as you will do it on any other piece of Javascript code, but if you want a quick refresh on how to do it, check out the Alexa Skills documentation.

## Step 6: Conclusion and Testing

The final step is to deploy your app to Heroku.Just double check that the endpoint that you created matches the **Fulfillment** URL in API.ai.If you have a Google Home device linked with the account you used in this example you can test it from there.If not you can still use the [Web Simulator](https://developers.google.com/actions/tools/web-simulator).



## Resources
- [Learn how to build actions quickly](https://developers.google.com/actions/develop/conversation)
- [Actions on Google Reference](https://developers.google.com/actions/reference/conversation)
- [Actions on Google: Building Assistant Actions using API.AI](https://www.youtube.com/watch?v=9SUAuy9OJg4)



## Authors
- Mike Yaworski
- Eduardo Colina
- Abdul Al-Haimi
