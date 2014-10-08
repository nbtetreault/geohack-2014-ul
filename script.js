var map;
var defi_dd_trajet;
var defi_dd_pi;
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

function chargerPI(){
$.getJSON("http://defidd.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM public.untitled_table", function(data) {
		

		var myStyle = {
			"color": "#ff7800",
			"weight": 5,
			"opacity": 0.65
		};

		console.log(data);
		defi_dd_pi = L.geoJson(data,{
			style:myStyle,
			onEachFeature:function (feature, layer) {
				
					if(feature.properties && feature.properties.description){
						layer.bindPopup(feature.properties.description);
					//	layer.setIcon();
					}
				}

			}
	
		).addTo(map);

	});
	
	activerLocalisation();
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
	chargerPI();

	
	var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);
	var ggl = new L.Google();

	var baseMaps = {"OSM" : osm, "Google Maps": ggl};
	var overlayMaps = {};
	L.control.layers(baseMaps, overlayMaps).addTo(map);
	

	function onLocationFound(e) {
		markerSuivi.setLatLng(e.latlng);
		if(!map.hasLayer(markerSuivi)){
			markerSuivi.addTo(map)
		}
	

		markerSuivi.setLatLng(e.latlng).addTo(map);
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {

		map.fitBounds(defi_dd_pi.getBounds());
	//	map.setView(L.latLng(46.7811, -71.2736), 16);
		
	}

	map.on('locationerror', onLocationError);
	
	L.easyButton( "fa-compass", toggleSuivi , "Activer/désactiver le suivi",map );
	

}

function toggleSuivi(){
	if(map._locateOptions.watch){
		map.stopLocate();
		console.log("désactiver la géolocalisation");
	}else{
		activerLocalisation();
		console.log("activer la géolocalisation");
	}
	
}

function activerLocalisation(){
	map.locate({watch: true,enableHighAccuracy:true,timeout:3000});

}