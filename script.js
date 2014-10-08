var map;
var defi_dd_trajet;
var defi_dd_pi;
var defi_dd_arret;
var suiviActive;
var markerSuivi;

function chargerTrajet(){
	$.getJSON("http://defidd.cartodb.com/api/v2/sql?format=geojson&q=select%20*%20from%20defi_dd_trajet", function(data) {
		
		defi_dd_trajet = L.geoJson(data,
		{style:
		{
			"color":"green",
			"opacity":0.5
		}}
		).addTo(map);

	});
}

function chargerArret(){
	$.getJSON("http://nbtetreault.cartodb.com/api/v2/sql?format=geojson&q=SELECT%20*%20FROM%20public.untitled_table", function(data) {
		
		console.log(data);
		var myStyle = {
			"color": "#ff7800",
			"weight": 5,
			"opacity": 0.65
		};


		defi_dd_arret = data;
		L.geoJson(defi_dd_arret,{
			style:myStyle,
			onEachFeature:function (feature, layer) {
					//Récupérer le html
					var contenuPopup = "test";
					//if (feature.properties && feature.properties.popupContent) {
					if(contenuPopup){
						layer.bindPopup(contenuPopup);
					//	layer.setIcon();
					}
				}

			}
	
		).addTo(map);

	});
}

function chargerPI(){
$.getJSON("http://nbtetreault.cartodb.com/api/v2/sql?format=geojson&q=SELECT%20*%20FROM%20public.untitled_table", function(data) {
		
		console.log(data);
		var myStyle = {
			"color": "#ff7800",
			"weight": 5,
			"opacity": 0.65
		};


		defi_dd_pi = data;
		L.geoJson(defi_dd_pi,{
			style:myStyle,
			onEachFeature:function (feature, layer) {
					//Récupérer le html
					var contenuPopup = "test";
					//if (feature.properties && feature.properties.popupContent) {
					if(contenuPopup){
						layer.bindPopup(contenuPopup);
					//	layer.setIcon();
					}
				}

			}
	
		).addTo(map);

	});
}

function init(){

	map = L.map('map', {
		center: [46.7829, -71.2847],
		zoom: 14
	});

	markerSuivi = L.Marker({
		'clickable':false
		
		});
	chargerTrajet();
	chargerArret();
	chargerPI();
	

	
	var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);
	var ggl = new L.Google();

	var baseMaps = {"OSM" : osm, "Google Maps": ggl};
	var overlayMaps = {};
	L.control.layers(baseMaps, overlayMaps).addTo(map);
	map.locate({setView: true, maxZoom: 16});

	function onLocationFound(e) {
	
		L.Marker(e.latlng).addTo(map);
	/*
		var radius = e.accuracy / 2;

		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();
*/

		markerSuivi.setLatLng(e.latlng);
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {


		map.setView(L.latLng(46.7811, -71.2736), 16);
		
	}

	map.on('locationerror', onLocationError);
	
	L.easyButton( "fa-compass", toggleSuivi , "Activer/désactiver le suivi",map );
}

function toggleSuivi(){
	map.locate({watch: true})
}