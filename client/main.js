import {
    RandomData
} from '../imports/api/random-data.js';

import {
    NavData
} from '../imports/api/nav-data.js';

import '../imports/router/routes.js';

var moment = require('moment');

Template.main.onCreated(function mainOnCreated() {
    this.autorun(function() {
        if (NavData.find({
                name: 'Detail 1'
            }).count() > 0) {
            Router.go('/detail1');
            Meteor.call('removeNavDocs');
        }
        if (NavData.find({
                name: 'Detail 2'
            }).count() > 0) {
            Router.go('/detail2');
            Meteor.call('removeNavDocs');
        }
    });
});

Template.detail1.onCreated(function mainOnCreated() {
    this.autorun(function() {
        if (NavData.find({
                name: 'Home'
            }).count() > 0) {
            Router.go('/');
            Meteor.call('removeNavDocs');
        }
        if (NavData.find({
                name: 'Detail 2'
            }).count() > 0) {
            Router.go('/detail2');
            Meteor.call('removeNavDocs');
        }
    });
});

Template.detail2.onCreated(function mainOnCreated() {
    this.autorun(function() {
        if (NavData.find({
                name: 'Home'
            }).count() > 0) {
            Router.go('/');
            Meteor.call('removeNavDocs');
        }
        if (NavData.find({
                name: 'Detail 1'
            }).count() > 0) {
            Router.go('/detail1');
            Meteor.call('removeNavDocs');
        }
    });
});

Template.main.helpers({
    counter() {
        return Template.instance().counter.get();
    },
    randomData() {
        return RandomData.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },
    formatDate(date) {
        return moment(date).fromNow();
    }
});

Template.main.events({
    'click button' (event, instance) {
        var id = Math.floor(1000 + Math.random() * 9000);
        Meteor.call('random.insert', id);
    }
});
