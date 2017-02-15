import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';

export const NavData = new Mongo.Collection('nav_data');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('nav_data', function navDataPublication() {
        return NavData.find({});
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('nav_data');
}

Meteor.methods({
    'removeNavDocs' () {
        NavData.remove({});
    },
});
