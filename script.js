var map;
var defi_dd_trajet;
var defi_dd_pi;
var suiviActive = true;
var markerSuivi;
var controles;

function chargerTrajet(){

	//http://defidd.cartodb.com/api/v2/sql?format=geojson&q=select%20*%20from%20defi_dd_trajet
	$.getJSON("./fiches/defi_dd_trajet.geojson", function(data) {
		
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
	//http://defidd.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM public.untitled_table
	$.getJSON("./fiches/untitled_table.geojson", function(data) {
		
		console.log(data);
		defi_dd_pi = L.geoJson(data,{
		
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
						
							var monIcone = L.icon({
								iconUrl: 'pi.png',
								iconRetinaUrl: 'pi.png',
								iconSize: [16, 16],
								iconAnchor: [9, 32]
							});
						
						var popup = L.popup({
							'keepInView':true,
							'maxHeight':500
						}).setContent(titre + images + description);
						
						layer.bindPopup(popup);
						layer.options.icon = monIcone;
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
		zoom: 16
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
		
		if(suiviActive){
			map.setView(e.latlng);
			//comparer avec le bound
			var boundPI = defi_dd_pi.getBounds();
			var ne = boundPI._northEast;
			var sw = boundPI._southWest;
			
			if(ne.lat > e.lat && e.lat > sw.lat 
				&&
				sw.lng > e.lng && e.lng > ne.lng){
				console.log("dans le coin de ul");
			}else{
			
				setTimeout(redirigerUL, 5000);

			}
			
		}
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		swal("Localisation non trouvée!", "On a pas pu trouver ta localisation. Tu es redirigé vers le campus de l'UL.");
		map.fitBounds(defi_dd_pi.getBounds());
		map.setZoom(18);
	}

	map.on('locationerror', onLocationError);
	
	L.easyButton( "fa-compass", majPositionMarker , "Activer/désactiver le suivi",map );
	L.easyButton( "fa-question", afficherInfo , "Activer/désactiver le suivi",map );
	
	map.on('popupopen', function(e){
	  controles.removeFrom(map);
	});
	map.on('popupclose', function(e){
	  controles.addTo(map);
	});

}

function activerLocalisation(){
	suiviActive = true;
	map.locate({
		watch: true, 
		enableHighAccuracy:true,
		timeout:3000
		});

}

function majPositionMarker(){
	map.stopLocate();
	activerLocalisation();
}

function redirigerUL(){

	swal("Hors zone.", "Il semble que tu sois hors du campus de l'UL. Nous t'y emmenons.");
	map.fitBounds(defi_dd_pi.getBounds());
	map.setZoom(18);				
	
}

function afficherInfo(){

$('#information').dialog({title:'Information'});
}
