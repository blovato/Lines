Template.map.helpers({
  'lines': function(){
    var currentUserId = Meteor.userId();
    //createdBy: "Brenten Lovato"
    return Lines.find({}, {sort: {createdAt: -1}, limit: 10});
  },
  'createdAtFormattedTime': function () {
    var hour = String(this.createdAt.getHours());
    if(hour > 12){
      hour = String(this.createdAt.getHours()%12);
    }
    var minute = this.createdAt.getMinutes();
    if(minute < 10){
      minute = "0" + String(minute);
    }
    return hour + ":" + minute;
  },
  'createdAtFormattedDay': function(){
    return this.createdAt.toDateString();
  }
});

//declare global latLng var
var latLngs = [];
var buildingLine;
var lastInsertId;

Template.map.events({
  'click #showLineList': function(){
    $('#showLineList').hide();

    // animate lines list
    $( "div .item" ).first().show( "fast", function showNext() {
      $( this ).next( "div .item" ).show( "fast", showNext );
    });
  },
  'click #createLine': function(){
    // set buttons visibility and class
    $('#createLine').addClass('disabled');
    $('#createLine').hide(100);
    $('#endLine').removeClass('disabled');
    $('#endLine').show(100);

    var lats = [];
    var lngs = [];
    var currentUserId = Meteor.userId();
    var date = new Date();
    
    // create new record that will be updated by the interval
    Lines.insert({
      "createdAt": date,
      "coordinates": latLngs,
      "createdBy": currentUserId
    }, function(err, _id){
      lastInsertId = _id;
    });
    // every second check if there is a new latLng, 
    // if true add it to the array
    buildingLine = setInterval(function(){
      // fetch location on interval and update record
      var currentLatLng = Geolocation.currentLocation();
      if(!lats.indexOf(currentLatLng.coords.latitude) && !lngs.indexOf(currentLatLng.coords.longitude)){
        latLngs.push([currentLatLng.coords.latitude, currentLatLng.coords.longitude]);
        Lines.update(lastInsertId, {$set: {coordinates: latLngs}});
      }
    }, 1000);
  },
  'click #endLine': function(){
    // set buttons visibility and class
    $('#endLine').addClass('disabled');
    $('#endLine').hide(100);
    $('#createLine').removeClass('disabled');
    $('#createLine').show(100);

    // end search for coordinates and update function
    clearInterval(buildingLine);

    // if the last line was empty then remove it
    var lastInsert = Lines.find(lastInsertId,{}).fetch();
  
    if(lastInsert[0].coordinates.length <= 0){
      Lines.remove(lastInsertId);
      // show searching for location popup
      IonPopup.show({
        title: 'You need to move for the line to be recorded',
        buttons: [{
          text: 'dismiss',
          type: 'button-assertive button-clear',
          onTap: function() {
            IonPopup.close();
          }
        }]
      });
    }
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

  // L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  // create map and attributes
  var mapTile = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png');
  var map = L.map('map', {
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
      IonBackdrop.release();
      clearInterval(loopGeolocation);
      var accuracyLocation = L.circle([userLocation.coords.latitude, 
                                       userLocation.coords.longitude], 
                                       userLocation.coords.accuracy,
                                       {color: "black", weight: 0, opacity: .3}).addTo(map);
      map.fitBounds(accuracyLocation.getBounds());
      $('#createLine').removeClass('disabled');
    }
  },1000);
};

