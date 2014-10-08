function init(){
var defi_dd_trajet;
$.getJSON("http://defidd.cartodb.com/api/v2/sql?format=geojson&q=select%20*%20from%20defi_dd_trajet", function(data) {
    console.log(data);
	defi_dd_trajet = data;
	var trajet = L.geoJson(defi_dd_trajet,
	{style:
	{
		"color":"green",
		"opacity":0.5
	}}
	).addTo(map);
	map.fitBounds(coordsToLatLng.coordsToLatLng());
});

var map = L.map('map', {
center: [46.7829, -71.2847],
zoom: 14
});
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
var ggl = new L.Google();

var baseMaps = {"OSM" : osm, "Google Maps": ggl};
var overlayMaps = {};
L.control.layers(baseMaps, overlayMaps).addTo(map);
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);
}