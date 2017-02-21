
  import { Meteor } from 'meteor/meteor';

  app = Express(); // create Express server
  const APIAiAssistant = require('actions-on-google').ApiAiAssistant; // create api assitant object to  process API AI requests
  app.get('/test', function(req, res) { // test endpoint
    res.status(200).send("Hello World!")
  });

  app.post('/ga-webhook',function(req, res){
    const assistant = new APIAiAssistant({request:req,response:res});
    const actionMap = new Map();
    console.log(req)

    function welcomeIntent(assistant){
      assistant.tell("Welcome and go away");
    }

    function runMethod(assistant){
      var id = assistant.getArgument('method_ID');
      Meteor.call('random.insert', id);
      assistant.tell("Ok method ", id, "is now running!");
    }


    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function Navigate(assistant){
      var view = capitalizeFirstLetter(assistant.getArgument('view'));

      NavData.insert({ name: view, createdAt: new Date() } );
      assistant.tell("Ok method " + id + "is now running!");
    }

    actionMap.set('input.welcome',welcomeIntent);
    actionMap.set('runMethod_intent', runMethod);
    assistant.handleRequest(actionMap);
  })
