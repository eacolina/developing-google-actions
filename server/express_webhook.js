
  import { Meteor } from 'meteor/meteor';
  import { NavData } from '../imports/api';

  app = Express(); // create Express server
  const APIAiAssistant = require('actions-on-google').ApiAiAssistant; // create api assitant object to  process API AI requests
  app.get('/test', function(req, res) { // test endpoint
    res.status(200).send("Hello World!")
  });

  app.post('/ga-webhook',function(req, res){
    const assistant = new APIAiAssistant({request:req,response:res});
    const actionMap = new Map();

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

    function goHome(assistant){
      NavData.insert({ name: 'Home', createdAt: new Date() } );
      assistant.tell("Ok, you should now be able to see the home page on your device");
    }


    function goDetail1(assistant){
      NavData.insert({ name: 'Detail 1', createdAt: new Date() } );
      assistant.tell("Ok, you should now be able to see the Detail 1 page on your device");
    }

    function goDetail2(assistant){
      NavData.insert({ name: 'Detail 2', createdAt: new Date() } );
      assistant.tell("Ok, you should now be able to see the Detail 2 page on your device");
    }

    actionMap.set('input.welcome',welcomeIntent);
    actionMap.set('runMethod_intent', runMethod);
    actionMap.set('goHome_intent', goHome);
    actionMap.set('goDetail1_intent', goDetail1);
    actionMap.set('gDetail2_intent', goDetail2);
    assistant.handleRequest(actionMap);
  })
