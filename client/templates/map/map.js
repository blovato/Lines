Template.map.helpers({
  'lines': function(){
    var currentUserId = Meteor.userId();
    //createdBy: "Brenten Lovato"
    return Lines.find({});
  },
  'linesCount': function(){
    return Lines.find().count();
  },
  'createdAtFormattedTime': function () {
    var hour = String(this.createdAt.getHours()%12);
    var minute = this.createdAt.getMinutes();
    if(minute < 10){
      minute = "0" + String(minute);
    }
    return hour + ":" + minute;
  }
});
Template.map.events({
  'click #createLine': function(){
    $("createLine").remove();
    var lats = [];
    var lngs = [];
    var latLngs = [];
    var currentUserId = Meteor.userId();

    // every second check if there is a new latLng, 
    // if true add it to the array
    setInterval(function(){
      var currentLatLng = Geolocation.currentLocation();
      console.log(currentLatLng);

      if(lats.indexOf(currentLatLng.coords.latitude) && lngs.indexOf(currentLatLng.coords.longitude)){
        latLngs.push(currentLatLng);
      }
    }, 2000);

    Lines.insert({
      "createdAt": new Date(),
      "coordinates": latLngs,
      "createdBy": currentUserId
    });
  },
  'click #endLine': function(){

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
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
  var map = L.map('map', {
    doubleClickZoom: true,
    attributionControl: false,
    zoomControl:false 
  }).setView([37.749745, -122.467134], 13);
  L.control.attribution({'prefix': ''});

  //draw all lines in Lines collection on map
  var coordinatesAll = Lines.find().forEach(function(lines) {
    var polyline = L.polyline(lines['coordinates'], {color: 'black'}).addTo(map);
  });

  // locate user on template load
  var userLocation = Geolocation.currentLocation();
  var loopGeolocation = setInterval(function(){
    userLocation = Geolocation.currentLocation();
    if(userLocation && map){
      clearInterval(loopGeolocation);
      console.log(userLocation);
      var accuracyLocation = L.circle([userLocation.coords.latitude, 
                                       userLocation.coords.longitude], 
                                       userLocation.coords.accuracy,
                                       {color: "black", weight: 0, opacity: .3});
      var pointLocation = L.circle([userLocation.coords.latitude, 
                                    userLocation.coords.longitude],.1,
                                    {color: "black", weight: 5, opacity: 1});
      var accuracyAndPointLocation = L.layerGroup([pointLocation, accuracyLocation]).addTo(map);
      map.fitBounds(accuracyLocation.getBounds());
      $('#createLine').removeClass('disabled');
    }
  },1000);
};

