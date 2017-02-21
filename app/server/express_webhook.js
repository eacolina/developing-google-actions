  import { Meteor } from 'meteor/meteor';

  app = Express(); // create Express server
  const APIAiAssistant = require('actions-on-google').ApiAiAssistant; // declare th APIAiAssistant class included in the ActionsSDK

  app.get('/test', function(req, res) { // test endpoint
    res.status(200).send("Hello World!")
  });

  app.post('/ga-webhook',function(req, res){
    const assistant = new APIAiAssistant({request:req,response:res}); //create new instance of API assistan with the reponse and request of this particular endpoint
    const actionMap = new Map(); //create a new a map to map the intents called with fucntions in our webhook

    function welcomeIntent(assistant){ // create a function for the welcomeIntent
      assistant.tell("Welcome to the Sample Action that controls a Meteor App");
    }

    function runMethod(assistant){ // function to run a method when the  'runMethod_intent is called'
      var id = assistant.getArgument('method_ID'); // use .getArgument('parameterName') to get the value of a paramter
      if (id != null){

        Meteor.call('random.insert', id); // insert a method into the database
        assistant.tell("Ok method " + id + " is now running!"); //  using .tell to talk to the user and finish this conversation

      } else {

        assistant.tell("There was an error with your request.");

      }
    }


    function Navigate(assistant){ // function to navigate to a certain view when th 'goToView_intent' is called
      var view = assistant.getArgument('view'); // get the value of 'view'
      Meteor.call('insertView', view); // insert the new view in NavData
      assistant.tell("Ok you can now see " + view + " on your device"); // inform the user that process is done
    }


    // the actionMap.set lines just insert a new kay:value pair to map the incoming intents to functions
    actionMap.set('input.welcome',welcomeIntent);
    actionMap.set('runMethod_intent', runMethod);
    actionMap.set('goToView_intent', Navigate)
    assistant.handleRequest(actionMap); // declare handler to process the requests made form API.ai
  })
