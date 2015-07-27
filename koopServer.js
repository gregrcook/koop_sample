function setupKoop() {
  // This script runs a Koop server with an external configuration stored in config.json.
  // The server is run using nodemon so that any changes to the config result in the server being restarted.
  // nodemon --watch config -e json koopServer.js
  // Access the Cloud9 website via http://node-gregrcook.c9.io/ Cloud9 only offers 8080 as an accessible port.
  // Access the individual served geojson files via http://node-gregrcook.c9.io/geojson/boundary/FeatureServer/0
  
  var express = require('express');
  var fs = require('fs');
  var koopGeoJson = require('koop-geojson-file');

  var config = JSON.parse(fs.readFileSync(__dirname + '/config/config.json'));  // Read configuration from json file.
  // Relative paths in express must be expressed using the __dirname variable.
  // __dirname + '/geojson/filename/
  
  var koop = require('koop')(config);
  
  koop.register(koopGeoJson);
  
  var app = express();
  app.use(koop);
  
  app.listen(process.env.PORT || config.server.port,  function() {
    console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
  });
};

setupKoop();