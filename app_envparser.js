module.exports = (function(){
  var Habitat = require("habitat");
  Habitat.load('./.env');
  return new Habitat('app');
}());
