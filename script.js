var map;
var defi_dd_trajet;
var defi_dd_pi;
var suiviActive;
var markerSuivi;
var controles;

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
				
					if(feature.properties){
						var description = '';
						var images = '';
						var titre = '';
						if(feature.properties.description){
							description = feature.properties.description;
						}
						
						
						if(feature.properties.name){
							titre = '<h3>'+feature.properties.name+'</h3>';
						}
						
						
						if(feature.properties.images){
							images = '<img width="100%" src="./fiches/images/' + feature.properties.images + '">';
						}
						
						var popup = L.popup({
							'keepInView':true
						}).setContent(titre + images + description);
						
							layer.bindPopup(popup);
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

	var myIcon = L.icon({
		iconUrl: 'personne.png',
		iconRetinaUrl: 'personne.png',
		iconSize: [32, 54],
		iconAnchor: [32, 54]
	});
	markerSuivi = L.marker([46.7829, -71.2847], {
		'clickable':false,
		'icon':myIcon
		});

	chargerTrajet();
	chargerPI();

	
	var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);
	var ggl = new L.Google();

	var baseMaps = {"OSM" : osm, "Google Maps": ggl};
	var overlayMaps = {};
	controles = L.control.layers(baseMaps, overlayMaps).addTo(map);
	

	function onLocationFound(e) {
		markerSuivi.setLatLng(e.latlng);
		if(!map.hasLayer(markerSuivi)){
			markerSuivi.addTo(map)
		}
	

		markerSuivi.setLatLng(e.latlng).addTo(map);
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		swal("Localisation non trouvée!", "On a pas pu trouver ta localisation. Tu es redirigé vers le campus de l'UL.");
		map.fitBounds(defi_dd_pi.getBounds());
		
	}

	map.on('locationerror', onLocationError);
	
	L.easyButton( "fa-compass", toggleSuivi , "Activer/désactiver le suivi",map );
	
	map.on('popupopen', function(e){
	  controles.removeFrom(map);
	});
	map.on('popupclose', function(e){
	  controles.addTo(map);
	});

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

