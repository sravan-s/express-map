// Constants
var STATUS_DRAG = 'DRAG';
var STATUS_DRAW = 'DRAW';

var SHAPE_CIRCLE = 'CIRCLE';
var SHAPE_POLYGON = 'POLYGON';

// Map state
var state;
var shapes = [];

// Map callback
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 8
  });
  map.addListener('click', handleMapClick);
  state = initMapState(map);
  getSavedData();
}

function handleMapClick(event) {
  if (state.status == STATUS_DRAW) { // Draw polygon
    var shape = drawShapeAt(state.map, state.shape, {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
    shapes.push(shape);
    state = setStatus(STATUS_DRAG, shape);
  }
}

// btn event listner
function drawMode(event) {
  if (!map) {
    console.warn('Map not found');
    return false;
  }
  var shape = event.target.dataset.btn;
  state = setStatus(STATUS_DRAW, shape);
  window.alert('Click on map to draw a' + shape);
}

// state related functions
function initMapState(map) {
  return {
    map: map,
    status: STATUS_DRAG,
    shape: SHAPE_CIRCLE
  };
}

function setStatus(status, shape) {
  return {
    map: state.map,
    status: status,
    shape: shape
  };
}

// draw selected shape at given latLng
function drawShapeAt(map, shape, latLng) {
  if (shape == SHAPE_CIRCLE) {
    return drawCircle(map, latLng, 30000);
  } else {
    var shapeArray = [{
      lat: latLng.lat - .5,
      lng: latLng.lng - .5
    }, {
      lat: latLng.lat - .5,
      lng: latLng.lng + .5
    }, {
      lat: latLng.lat + .5,
      lng: latLng.lng + .5
    }, {
      lat: latLng.lat + .5,
      lng: latLng.lng - .5
    }, {
      lat: latLng.lat - .5,
      lng: latLng.lng - .5
    }];
    return drawPolygon(map, shapeArray);
  }
}

function drawCircle(map, latLng, radius) {
  var circle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    editable: true,
    draggable: true,
    geodesic: false,
    center: latLng,
    radius: radius
  });
  return circle;
}

function drawPolygon(map, coords) {
  var polygon = new google.maps.Polygon({
    map: map,
    paths: coords,
    strokeColor: '#0000FF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#0000FF',
    fillOpacity: 0.35,
    editable: true,
    draggable: true,
    geodesic: false
  });
  return polygon;
}

function saveData() {
  var data = extractData(shapes);
  $.ajax({
    type: 'PUT',
    url: '/maps',
    contentType : 'application/json',
    data: JSON.stringify({
      data: data
    }),
    success: function() {
      window.alert('Data saved');
    }
  });
}

function extractData(shapesArray) {
  var info = shapesArray.map(function(shape) {
    if (shape.radius) { // radius
      return {
        center: shape.center.toJSON(),
        radius: shape.radius
      }
    } else { // polygon
      var polygonPaths = shape.getPath();
      var pathsLatLng = [];
      polygonPaths.forEach(function(point) {
        pathsLatLng.push(point.toJSON());
      });
      return {
        paths: pathsLatLng
      };
    }
  });
  return info;
}

function getSavedData() {
  $.ajax({
    type: 'GET',
    url: '/maps',
    contentType : 'application/json',
    success: drawSavedData
  });
}

function drawSavedData(savedShapesArray) {
  var shapes = savedShapesArray.map(function(savedShapes) {
    savedShapes.data.map(function(shape) {
      if (shape.radius) {
        drawCircle(state.map, shape.center, shape.radius);
      } else {
        drawPolygon(state.map, shape.paths);
      }
    })
  })
}
