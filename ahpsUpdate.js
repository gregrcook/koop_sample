var ogr2ogr = require('ogr2ogr');               // Require npm library definitions.
var execSync = require('sync-exec');
var fs = require('fs');

var dateAndTime = getCurrentDateAndTime();

function main() {
  // This script queries an ArcServer installation for an ESRI json file of forecasted river gauge data in Wisconsin, converts the file
  // to GeoJson using ogr2ogr and then updates the Koop configuration to serve the file.

  var url = buildArcServerQueryUrl(
    "http://gis.srh.noaa.gov/arcgis/rest/services/ahps_gauges/MapServer/1/query?",
    "json",
    //"-180,-90,180,90",                          // World extent.
    "-92.889433,42.49172,-86.249548,47.309822",   // Wisconsin extent.
    "esriGeometryEnvelope",
    "*",
    "4326"
  );
  
  var test = convertStreamToGeoJson(url, __dirname + "/geojson/", "ahps_gauge_data_" + dateAndTime, "gj");
  //var test2 = updateToLatestFile(__dirname + "/geojson/", "ahps_gauge_data_" + dateAndTime + ".geojson");
  //convertPathToGeoJson(__dirname + "/json/query.json", __dirname + "/geojson/", "query3", "gj");
};

function buildArcServerQueryUrl(baseUrl, f, geometry, geometryType, outfields, outSR) {
  // http://gis.srh.noaa.gov/arcgis/sdk/rest/index.html?query.html
  return baseUrl + "&f=" + f + "&geometry=" + geometry + "&geometryType=" + geometryType + "&outfields=" + outfields + "&outSR=" + outSR
};

function convertStreamToGeoJson(url, outputLocation, outputName, format) {
  //var write_stream =fs.createWriteStream(outputLocation + outputName + returnExtension(format));
  
  ogr2ogr(url)
    .format(returnFormat(format))
    .skipfailures()
    .stream()
    .pipe(fs.createWriteStream(outputLocation + outputName + returnExtension(format)));
    
  ogr2ogr(url)        // Hackish until I figure out how to properly use streams.
    .format(returnFormat(format))
    .skipfailures()
    .stream()
    .pipe(fs.createWriteStream(outputLocation + "ahps_gauge_data_latest" + returnExtension(format)));
    
  /*write_stream.on('end', function() {
    write_stream.end();
    updateToLatestFile(__dirname + "/geojson/", "ahps_gauge_data_" + dateAndTime + ".geojson");
  });*/
};

function convertPathToGeoJson(fileLocation, outputLocation, outputName, format) {
  ogr2ogr(fileLocation)
    .format(returnFormat(format))
    .destination(outputLocation + outputName + returnExtension(format))
    //.options(['-simplify', '0.4'])
    .exec(function (err, data) {
      if (err) console.error(err);
    });
};

function updateToLatestFile(fileLocation, fileName) {
  fs.writeFileSync(__dirname + "/geojson/ahps_gauge_data_latest.geojson", JSON.parse(fileLocation + fileName), function (err) {
  if (err) throw err;
    console.log('It\'s saved!');
  });
};

function updateConfigFile(fileName, fileLocation) {
  
  
};

function returnFormat(format) {
  switch (format) {
    //case "shp": return "ESRI Shapefile"
    case "gj": return "GeoJSON"
    case "kml": return "KML"
    default: return "GeoJSON"
  }
};

function returnExtension(format) {
  switch (format) {
    //case "shp": return ".shp"
    case "gj": return ".geojson"
    case "kml": return ".kml"
    default: return ".geojson"
  }
};

function getCurrentDateAndTime() {
    // https://stackoverflow.com/questions/7357734/how-do-i-get-the-time-of-day-in-javascript-node-js
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    return year + "_" + month + "_" + day + "_" + hour + ":" + min + ":" + sec;
};

main();