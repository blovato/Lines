// create Lines collection and data schema
Lines = new Mongo.Collection('lines');

/*
Lines.attachSchema(new SimpleSchema({
  createdBy: {
    type: String,
    label: 'Created By',
    max: 200
  },
  coordinates: {
    type: [Object],
    label: 'Coordinates'
  },
  createdAt: {
    type: Date,
    label: 'Date'
  }
}));
*/


// create user profile collection and data schema
UserProfile = new Mongo.Collection('userProfile');

UserProfile.attachSchema(new SimpleSchema({
  firstName: {
    type: String,
    optional: false
  },
  lastName: {
    type: String,
    optional: false
  },
  birthday: {
    type: Date,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    optional: false
  }
}));