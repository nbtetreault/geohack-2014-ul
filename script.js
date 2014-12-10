var app = {};


function chargerTrajet(){

	//http://defidd.cartodb.com/api/v2/sql?format=geojson&q=select%20*%20from%20defi_dd_trajet
	$.getJSON("http://defidd.cartodb.com/api/v2/sql?format=geojson&q=select%20*%20from%20defi_dd_trajet", function(data) {
		
		app.trajet = L.geoJson(data,
		{style:
		{
			"color":"green",
			"opacity":0.5
		}}
		).addTo(app.map);

	});
	

}

function chargerPI(){
	//http://defidd.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM public.untitled_table
	$.getJSON("http://defidd.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM pi", function(data) {

		app.pi = L.geoJson(data,{
		
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
	
		).addTo(app.map);

	});
	
	activerLocalisation();
}

function init(){

	app.trajet = null;
	app.pi = null;
	app.suiviActive = true;
	app.markerSuivi = null;
	app.controles = null;

	app.map = L.map('map', {
		center: [46.7829, -71.2847],
		zoom: 16
	});

	var myIcon = L.icon({
		iconUrl: 'personne.png',
		iconRetinaUrl: 'personne.png',
		iconSize: [32, 54],
		iconAnchor: [32, 54]
	});
	app.markerSuivi = L.marker([46.7829, -71.2847], {
		'clickable':false,
		'icon':myIcon
		});

	chargerTrajet();
	chargerPI();

	
	var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(app.map);
	var ggl = new L.Google();

	var baseMaps = {"OSM" : osm, "Google Maps": ggl};
	var overlayMaps = {};
	app.controles = L.control.layers(baseMaps, overlayMaps).addTo(app.map);
	

	function onLocationFound(e) {
		app.markerSuivi.setLatLng(e.latlng);
		if(!app.map.hasLayer(app.markerSuivi)){
			app.markerSuivi.addTo(app.map)
		}
	

		app.markerSuivi.setLatLng(e.latlng).addTo(app.map);
		
		if(app.suiviActive){
			app.map.setView(e.latlng);
			//comparer avec le bound
			var boundPI = app.pi.getBounds();
			var ne = boundPI._northEast;
			var sw = boundPI._southWest;
			
			if(ne.lat > e.lat && e.lat > sw.lat 
				&&
				sw.lng > e.lng && e.lng > ne.lng){
			}else{
			
				setTimeout(redirigerUL, 5000);

			}
			
		}
	}

	app.map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		swal({
			title: "Localisation non trouvée!", 
			text : "On a pas pu trouver ta localisation. Tu es redirigé vers le campus de l'UL.",
			showCancelButton : false
			}, function(){
			app.map.fitBounds(app.pi.getBounds()).setZoom(18);
		});
		

	}

	app.map.on('locationerror', onLocationError);
	
	L.easyButton( "fa-compass", majPositionMarker , "Activer/désactiver le suivi", app.map );
	L.easyButton( "fa-question", afficherInfo , "Activer/désactiver le suivi", app.map );
	
	app.map.on('popupopen', function(e){
	  app.controles.removeFrom(app.map);
	});
	app.map.on('popupclose', function(e){
	  app.controles.addTo(app.map);
	});

}

function activerLocalisation(){
	app.suiviActive = true;
	app.map.locate({
		watch: true, 
		enableHighAccuracy:true,
		timeout:3000
		});

}

function majPositionMarker(){
	app.map.stopLocate();
	activerLocalisation();
}

function redirigerUL(){

	swal({
		title : "Hors zone.", 
		text : "Il semble que tu sois hors du campus de l'UL. Nous t'y emmenons.",
		showCancelButton : false
		}, function(){
		app.map.fitBounds(app.pi.getBounds()).setZoom(18);
	});
		

	
}

function afficherInfo(){

$('#information').dialog({title:'Information'});
}
