const topojson = require('topojson-client'),
  toGeoJSON = require('@tmcw/togeojson'),
  csv2geojson = require('csv2geojson'),
  osmtogeojson = require('osmtogeojson'),
  polytogeojson = require('polytogeojson'),
  geojsonNormalize = require('@mapbox/geojson-normalize');


module.exports.readAsText = readAsText;
module.exports.readFile = readFile;


function readAsText(f, callback) {
  try {
    const reader = new FileReader();
    reader.readAsText(f);
    reader.onload = function (e) {
      if (e.target && e.target.result) callback(null, e.target.result);
      else
        callback({
          message: 'Dropped file could not be loaded'
        });
    };
    reader.onerror = function () {
      callback({
        message: 'Dropped file was unreadable'
      });
    };
  } catch (e) {
    callback({
      message: 'Dropped file was unreadable'
    });
  }
}

function readFile(f, text, callback) {
  const fileType = detectType(f, text);

  if (!fileType) {
    return callback({
      message: 'Could not detect file type'
    });
  }  else if (fileType === 'dsv') {
    csv2geojson.csv2geojson(
      text,
      {
        delimiter: 'auto'
      },
      (err, result) => {
        if (err) {
          return callback({
            type: 'geocode',
            result: result,
            raw: text
          });
        } else {
          return callback(null, result);
        }
      }
    );
  } 

  function toDom(x) {
    return new DOMParser().parseFromString(x, 'text/xml');
  }

  function detectType(f, text) {
    const filename = f.name ? f.name.toLowerCase() : '';
    function ext(_) {
      return filename.indexOf(_) !== -1;
    }
    if (f.type === 'application/vnd.google-earth.kml+xml' || ext('.kml')) {
      return 'kml';
    }
    if (ext('.gpx')) return 'gpx';
    if (ext('.geojson') || ext('.json') || ext('.topojson')) return 'geojson';
    if (f.type === 'text/csv' || ext('.csv') || ext('.tsv') || ext('.dsv')) {
      return 'dsv';
    }
    if (ext('.xml') || ext('.osm')) return 'xml';
    if (ext('.poly')) return 'poly';
    if (
      (text && text.indexOf('shape_id,shape_pt_lat,shape_pt_lon') !== -1) ||
      (text && text.indexOf('"shape_id","shape_pt_lat","shape_pt_lon"') !== -1)
    ) {
      return 'gtfs-shapes';
    }
    if (
      (text &&
        text.indexOf(
          'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon'
        ) !== -1) ||
      (text &&
        text.indexOf(
          '"stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon"'
        ) !== -1)
    ) {
      return 'gtfs-stops';
    }
  }
}
