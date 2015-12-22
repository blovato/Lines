Meteor.subscribe('Lines');
Meteor.subscribe('allUserNames');

Template.map.helpers({
  'lines': function(){
    var currentUserId = Meteor.userId();
    //createdBy: "Brenten Lovato"
    return Lines.find({}, {sort: {createdAt: -1}, limit: 6});
  },
  'userName': function(){
    var thisUser = this.createdBy;
    var first = UserProfile.findOne({userId: thisUser},{fields: {firstName: 1}});
    var last = UserProfile.findOne({userId: thisUser},{fields: {lastName: 1}});
    return first.firstName + " " + last.lastName;
  },
  'createdAtFormattedTime': function () {
    var hour = String(this.createdAt.getHours());
    var meridian = 'am'
    if(hour > 12){
      hour = String(this.createdAt.getHours()%12);
      meridian ='pm'
    }
    var minute = this.createdAt.getMinutes();
    if(minute < 10){
      minute = "0" + String(minute);
    }
    return hour + ":" + minute + " " + meridian;
  },
  'createdAtFormattedDay': function(){
    return this.createdAt.toDateString();
  },
  'accuracy': function(){
    var location = Geolocation.getCurrentLocation();
    if(location){
      console.log(location.coords.accuracy);
      return location.coords.accuracy;
    }
  }
});

//declare global latLng vars
var latLngs = [],
    lats = [],
    lngs = [],
    buildingLine,
    map;

Template.map.events({
  'click #createLine': function(){
    // set buttons visibility and class
    $('#createLine').addClass('disabled');
    $('#createLine').fadeOut(300);
    $('#endLine').removeClass('disabled');
    setTimeout(function(){
      $('#endLine').fadeIn(100);
    },300);
    
    // create new record that will be updated by the interval
    Meteor.call('insertLine', function(error, result){
      Session.set('lastInsertId', result);
    });
    
    // every second check if there is a new latLng, 
    // if true add it to the array
    var currentLatLng = Geolocation.currentLocation();
    map.setView(new L.LatLng(currentLatLng.coords.latitude, currentLatLng.coords.longitude), 21);

    var polyline = L.polyline([], {color: 'black'}).addTo(map);
    buildingLine = setInterval(function(){
      // fetch location on interval and update record
      var currentLatLng = Geolocation.currentLocation();
      lats.push(currentLatLng.coords.latitude);
      lngs.push(currentLatLng.coords.longitude);
      latLngs.push([currentLatLng.coords.latitude, currentLatLng.coords.longitude]);
      polyline.setLatLngs(latLngs);
      map.panTo(new L.LatLng(currentLatLng.coords.latitude, currentLatLng.coords.longitude));
      Meteor.call('updateLine', Session.get('lastInsertId'), latLngs);
    }, 1000);
  },
  'click #endLine': function(){
    // set main buttons visibility and class
    $('#endLine').addClass('disabled');
    $('#endLine').fadeOut(300);
    $('#createLine').removeClass('disabled');
    setTimeout(function(){
      $('#createLine').fadeIn(100);
    },300);

    // end search for coordinates and update function
    clearInterval(buildingLine);

    // find duplicate coordinates   
    var duplicateIdx = [];
    for(var i = 0; i < lats.length; i++){
      var idx = lats.indexOf(lats[i]);
      if(idx > -1){
        duplicateIdx.push(idx);
      }
    }
    
    // if only 5 coordinates or if all records 
    // are duplicates create warning popup
    if(latLngs.length <= 5 || latLngs.length == duplicateIdx.length){

      // show didn't move far error
      IonPopup.show({
        title: 'You didn\'t move very far, do you want to delete your last line?',
        buttons: [{
          text: 'no, keep it',
          type: 'button-balanced button-clear',
          onTap: function() {
            IonPopup.close();
          }
        },
        {
          text: 'delete it',
          type: 'button-assertive button-clear',
          onTap: function() {
            Meteor.call('removeLine', Session.get('lastInsertId'));
            IonPopup.close();
          }
        }]
      });
    }
    else {
      // finished popup, keep or delete
      IonPopup.show({
        title: 'Completed Line! Would you like to keep it or delete it?',
        buttons: [{
          text: 'keep',
          type: 'button-balanced button-clear',
          onTap: function() {
            IonPopup.close();
          }
        },
        {
          text: 'delete',
          type: 'button-assertive button-clear',
          onTap: function() {
            Meteor.call('removeLine', Session.get('lastInsertId'));
            IonPopup.close();
          }
        }]
      });
    }
    // reset coord variables
    latLngs = [],
       lats = [],
       lngs = [];
  } 
});

// on startup run resizing event
Meteor.startup(function() {
  $(window).resize(function() {
    $('#map').css('height', window.innerHeight - 82 - 45);
  });
  $(window).resize(); // trigger resize event
});

Template.map.rendered = function() {
  // initialize endLine button to hidden
  $('#endLine').hide();
  $('div .item').hide();
  $('#infoBar').hide();

  // animate lines list
  setTimeout(function(){
    $( "div .item" ).first().show( "fast", function showNext() {
      $( this ).next( "div .item" ).show( "fast", showNext );
    });
  },2000);

  // L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  // create map and attributes
  var mapTile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  map = L.map('map', {
    doubleClickZoom: true,
    attributionControl: false,
    zoomControl: false 
  }).setView([37.749745, -122.467134], 15);

  // toggle tile layer control
  L.control.layers('',{
    "map layer": mapTile
  }).addTo(map);

  // draw all lines in Lines collection on map
  var coordinatesAll = Lines.find().forEach(function(lines) {
    var polyline = L.polyline(lines['coordinates'], {color: 'black'}).addTo(map);
  });

  // show searching for location popup
  IonBackdrop.retain();

  // locate user on template load
  var userLocation = Geolocation.currentLocation();
  var loopGeolocation = setInterval(function(){

    userLocation = Geolocation.currentLocation();
    if(userLocation && map){
      $('#infoBar').fadeIn(400);

      IonBackdrop.release();
      clearInterval(loopGeolocation);
      var accuracyLocation = L.circle([userLocation.coords.latitude, 
                                       userLocation.coords.longitude], 
                                       userLocation.coords.accuracy,
                                       {color: "black", weight: 0, opacity: .3}).addTo(map);
      var popup = L.popup({closeButton: false}).setContent("<b>Your Location</b><br>"+
                                  userLocation.coords.latitude+", "+ 
                                  userLocation.coords.longitude+ "<br>Accuracy: "+ 
                                  userLocation.coords.accuracy+" feet");
      accuracyLocation.bindPopup(popup).openPopup();
      map.fitBounds(accuracyLocation.getBounds());
      $('#createLine').removeClass('disabled');
    }
  },1000);
};

