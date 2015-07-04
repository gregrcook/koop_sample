function main() {
  // This script queries an ArcServer installation for a kml file of river gauge data, converts the file to GeoJson and then updates the Koop configuration to serve the file.
  // 
  var ahpsKmlFile = getAhpsGaugeData(getCurrentDate());
  console.log(ahpsKmlFile[0], ahpsKmlFile[1]);
  var ahpsGeoJsonFile = convertToGeoJson(ahpsKmlFile[0], ahpsKmlFile[1], ahpsKmlFile[0].split(".kmz").join(".geojson"), ahpsKmlFile[1].split("kmz").join("geojson"));
  console.log(ahpsGeoJsonFile[0], ahpsGeoJsonFile[1]);
};

function getAhpsGaugeData(date) {
  // Generate and retrieve a kml file from the NOAA ArcServer. http://gis.srh.noaa.gov/arcgis/sdk/rest/index.html?generatekml.html
  // Example kml REST request. http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/generatekml?docName=Test+Name&layers=1,2&layerOptions=separateImage
  var url = "http://gis.srh.noaa.gov/arcgis/rest/services/ahps_gauges/MapServer/generateKml?docName=ahps_gauges_" + date + "&layers=0,1&layerOptions=composite"
  var fileName = "ahps_gauges_" + date + ".kmz";
  var fileLocation = __dirname + "/kmz/";
  getFile(fileName, fileLocation, url)
  return [fileName, fileLocation]
};

function getFile(fileName, fileLocation, url) {
  var curl = 'curl -o ' + fileLocation + fileName + ' ' + url;
  var exec = require('sync-exec');

  exec(curl, 100000);
  console.log(fileName + ' downloaded to ' + fileLocation);
};

function convertToGeoJson(kmlFileName, kmlFileLocation, geoJsonFileName, geoJsonFileLocation) {
  var tj = require('togeojson'),
      fs = require('fs'),
    // node doesn't have xml parsing or a dom. use jsdom
    jsdom = require('node-jsdom').jsdom;
    
    var newestGeoJsonFileName = "ahps_gauges_newest.geojson"
    var kml = jsdom(fs.readFileSync(kmlFileLocation + kmlFileName, 'utf8'));
    var converted = JSON.stringify(tj.kml(kml));
    
    fs.writeFileSync(geoJsonFileLocation + geoJsonFileName, converted);
    console.log(geoJsonFileName + ' writen to ' + geoJsonFileLocation);
    
    fs.writeFileSync(geoJsonFileLocation + newestGeoJsonFileName, converted);
    console.log('Updated geoJson file created.')
    return [geoJsonFileName, geoJsonFileLocation]
};

function updateConfigFile(fileName, fileLocation) {
  
  
};

function getCurrentDate() {
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