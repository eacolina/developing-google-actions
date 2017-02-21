import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';

export const RandomData = new Mongo.Collection('random_data');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('random_data', function randomDataPublication() {
        return RandomData.find({});
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('random_data');
}

Meteor.methods({
    'random.insert' (id) {
        RandomData.insert({
            name: 'Method ' + id,
            createdAt: new Date()
        });
    },
});
