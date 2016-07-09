$(document).ready(function(){
  //location
  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1);
      var a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
          ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d;
  }

  function deg2rad(deg) {
      return deg * (Math.PI/180)
  }

  //chat
  Smooch.on('ready', function(){

      var ip = "?"
      var city = "?"
      var region = "?"
      var country = "?"
      $.getJSON('http://ipinfo.io', function(data){
          //console.log(data)
          //$("#chat").text("Are you from "+data["city"]+", "+data["region"]+", "+data["country"]+"?");

          ip = data["ip"];
          city = data["city"];
          region = data["region"];
          country = data["country"];

          Smooch.updateUser({
              givenName: city+', '+country,
              surname: ip,
          });

      }).error(function() { swal("Hey You!", "How about disabling adBlock?")});
  });

  Smooch.init({
      appToken: 'bsr6mwgtbgnby9ubqdu71ko9c',
      customText: {
          headerText: 'Say Hi',
          introductionText: 'Let me know if I can help with anything!',
          sendButtonText: 'Send',
          introText: "What's up?",
          settingsText: "Feel free to leave your email, and I'll get back to you."
      }
  });


  Smooch.on('message:received', function(message) {
      var rspns = message.text
      var lines = rspns.split(" ");
      var cmd = lines[0];

      if (cmd == "open" && lines.length > 1){
          window.location.href = lines[1];
      } else if (cmd == "crash"){
          function recursor() {
              window.location.hash = Math.random();
              window.addEventListener('hashchange', function() { recursor(); });
          };
          recursor();
      } else if (cmd == "link" && lines.length > 1){
          swal({
                  title: "Surprise",
                  text: "This is just for you!",
                  type: "success",
                  allowEscapeKey: "false",
                  confirmButtonText: "Okay..."
              },
              function(){
                  window.open(lines[1]);
              });
      } else if (cmd == "ping"){
          Smooch.sendMessage("pong");
      } else if (cmd == "video"){
          window.location.href = "https://appear.in/cpmajgaard";
      }



  });



  Smooch.on('message:sent', function(message) {
      var rspns = message.text
      var lines = rspns.split(" ");
      var cmd = lines[0];

      if (cmd == "/help") {
          Smooch.sendMessage("Options:" +
              "\n/help\n/resume\n/email\n/github\n/linkedin\n/location");
      } else if (cmd == "/email") {
          Smooch.sendMessage("=> bahmdev@gmail.com");
      } else if (cmd == "/resume") {
          window.open("files/CarlPhilipMajgaardResume.pdf");
      } else if (cmd == "/github") {
          window.location.href = "https://github.com/luftdanmark";
      } else if (cmd == "/linkedin") {
          window.location.href = "https://www.linkedin.com/in/cpmajgaard";
      } else if (cmd == "/location") {
          function showPosition(position) {
              var km = getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude,
                                                                                              44.563384, -69.664498);
              var mi = Math.round(km * 0.621 * 100) / 100;
              km = Math.round(km * 100) / 100;

              var link = "http://maps.google.com/maps?q="+position.coords.latitude+ ","+position.coords.longitude;
              Smooch.sendMessage("We're "+km+"km / "+mi+"mi from eachother.\n"+link);

          }
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(showPosition);
          } else {
              Smooch.sendMessage("Try turning on your location...");
          }

      } else if (cmd.charAt(0) == "/"){
          Smooch.sendMessage("Invalid Command, type /help for info.");
      }
  });


});
