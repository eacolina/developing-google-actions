  import { Meteor } from 'meteor/meteor';

  app = Express(); // Express object from the glittershark:meteor-express package
  const ApiAiAssistant = require('actions-on-google').ApiAiAssistant; // ApiAiAssistant class included in the Google Actions npm package

  app.get('/test', function(req, res) { // test endpoint
    res.status(200).send("Hello World!")
  });

  app.post('/ga-webhook', function(req, res){
    const assistant = new ApiAiAssistant({request:req, response:res}); // create new instance of ApiAiAssistant according to the request given

    // function for the welcomeIntent
    function welcomeIntent(assistant) {
      assistant.tell("Welcome to the Sample Action that controls a Meteor App");
    }

    // function to run a method when the 'runMethod_intent' is called
    function runMethod(assistant) {
      var id = assistant.getArgument('method_ID'); // use .getArgument(parameterName) to get the value of a paramter (parameterNames defined in API.ai) 
      if (id) {
        Meteor.call('random.insert', id); // insert a method into the database
        assistant.tell("Ok method " + id + " is now running!"); // using .tell to talk to the user and finish this conversation
      } else {
        assistant.tell("There was an error with your request.");
      }
    }

    // function to navigate to a certain view when the 'goToView_intent' is called
    function Navigate(assistant) {
      var view = assistant.getArgument('view'); // get the value of the 'view' parameter
      Meteor.call('insertView', view); // insert the new view in NavData
      assistant.tell("Ok you can now see " + view + " on your device"); // inform the user that process is done
    }

    const actionMap = new Map(); // create a new a map to map the intents called with functions in our webhook
    actionMap.set('input.welcome',welcomeIntent);
    actionMap.set('runMethod_intent', runMethod);
    actionMap.set('goToView_intent', Navigate);
    assistant.handleRequest(actionMap); // declare handler to process the requests made form API.ai
  })
