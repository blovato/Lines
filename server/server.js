Meteor.startup(function () {
 Future = Npm.require('fibers/future');
});

Meteor.publish("UserProfile", function(){
  var currentUserId = this.userId;
  return UserProfile.find({userId: currentUserId});
});

Meteor.publish('allUserNames', function(){
  return UserProfile.find({}, {fields: {'firstName':1, 'lastName': 1, 'userId': 1}});
})

Meteor.publish('Lines', function(){
  return Lines.find({});
});

UserProfile.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Lines.allow({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

Meteor.methods({
  'insertLine': function(){

    var future = new Future();

    var currentUserId = Meteor.userId();
    var setId;
    Lines.insert({
      "createdAt": new Date(),
      "coordinates": [],
      "createdBy": currentUserId
    }, function(err, _id){
      future["return"](_id)
    });
    return future.wait();
  },
  'updateLine': function(_id, latLngs){
    Lines.update(_id, {$set: {coordinates: latLngs}});
  },
  'removeLine': function(_id){
    Lines.remove(_id);
  }
});