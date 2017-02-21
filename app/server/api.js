import {
    Meteor
} from 'meteor/meteor';

import {
    RandomData
} from '../imports/api/random-data.js';

import {
    NavData
} from '../imports/api/nav-data.js';

// Global API configuration
var Api = new Restivus({
    apiPath: 'api/',
    useDefaultAuth: true,
    prettyJson: true
});

// Exposing a POST API
// Maps to: /api/random.insert/:id
Api.addRoute('random.insert/:id', {
    authRequired: false
}, {
    post: function() {
        RandomData.insert({
            name: 'Method ' + this.urlParams.id,
            createdAt: new Date()
        });
        var data = {};
        data["status"] = "OK";
        data["name"] = this.urlParams.id;
        return data;
    },
});

// Exposing a GET API
// Maps to: /api/random.get/
Api.addRoute('random.get/', {
    authRequired: false
}, {
    get: function() {
        var data = RandomData.findOne({}, {
            sort: {
                createdAt: -1
            }
        });
        return data;
    },
});

// Exposing a POST API
// Maps to: /api/home.view/
Api.addRoute('home.view', {
    authRequired: false
}, {
    post: function() {
        NavData.insert({
            name: 'Home',
            createdAt: new Date()
        });
        var data = {};
        data["status"] = "OK";
        return data;
    },
});


// Exposing a POST API
// Maps to: /api/detail.view1/
Api.addRoute('detail.view1', {
    authRequired: false
}, {
    post: function() {
        NavData.insert({
            name: 'Detail 1',
            createdAt: new Date()
        });
        var data = {};
        data["status"] = "OK";
        return data;
    },
});

// Exposing a POST API
// Maps to: /api/detail.view2/
Api.addRoute('detail.view2', {
    authRequired: false
}, {
    post: function() {
        NavData.insert({
            name: 'Detail 2',
            createdAt: new Date()
        });
        var data = {};
        data["status"] = "OK";
        return data;
    },
});
