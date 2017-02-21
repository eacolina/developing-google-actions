
  import { Meteor } from 'meteor/meteor';
  import { NavData } from '../imports/api/nav-data.js'

  app = Express(); // create Express server
  const APIAiAssistant = require('actions-on-google').ApiAiAssistant; // create api assitant object to  process API AI requests
  app.get('/test', function(req, res) { // test endpoint
    res.status(200).send("Hello World!")
  });

  app.post('/ga-webhook',function(req, res){
    const assistant = new APIAiAssistant({request:req,response:res});
    const actionMap = new Map();
    console.log(req.body)

    function welcomeIntent(assistant){
      assistant.tell("Welcome and go away");
    }

    function runMethod(assistant){
      var id = assistant.getArgument('method_ID');
      Meteor.call('random.insert', id);
      assistant.tell("Ok method " + id + " is now running!");
    }


    function Navigate(assistant){
      var view = assistant.getArgument('view');
      console.log("I called navigate");
      console.log("view is",view);
      Meteor.call('insertView', view);
      assistant.tell("Ok you can now see " + view + " on your device");
    }

    actionMap.set('input.welcome',welcomeIntent);
    actionMap.set('runMethod_intent', runMethod);
    actionMap.set('goToView_intent', Navigate)
    assistant.handleRequest(actionMap);
  })
