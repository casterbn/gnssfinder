/**
 * 
 * Google Map API Ver.3
 * 
 * K.Someya, Hiroaki Tateshita Reference from
 * http://www.ajaxtower.jp/googlemaps/ Reference from
 * https://developers.google.com/maps/documentation/javascript/events?hl=ja
 * 
 */

var map;
var radius = 100000;// [m]
var gnssString = "JE";
var url_DateTime = "2014-03-01_00:00:00";
var valueCircleArray = new Array();
var trackLineArray = new Array();
var trackCoordinatesArray = new Array();
var update_timeout = null;

function initialize() {

	/* Setting for initial map info. */
	var mapOptions = {
		zoom : 2,
		center : new google.maps.LatLng(32.068235, 131.129172),
		mapTypeId : google.maps.MapTypeId.SATELLITE,
		disableDoubleClickZoom : true,
		streetViewControl : false,
		mapTypeControl:false
	};

	/* Generating map */
	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	/* Initializing track coordinates array */
	for (var i = 0; i < 5; i++) {
		trackCoordinatesArray[i] = new Array();
	}

	/* Setting Current date and time */
	var currentDateTime = new Date();
	var dateStr = "";
	var timeStr = "";
	dateStr = currentDateTime.getUTCFullYear() + "-";
	if (currentDateTime.getUTCMonth() < 9) {
		dateStr += "0";
	}
	dateStr += (currentDateTime.getUTCMonth() + 1) + "-";
	if (currentDateTime.getUTCDate() < 10) {
		dateStr += "0";
	}
	dateStr += currentDateTime.getUTCDate();
	$('#datepicker').val(dateStr);

	if (currentDateTime.getUTCHours() < 10) {
		timeStr = "0";
	}
	timeStr += currentDateTime.getUTCHours() + ":";
	if (currentDateTime.getUTCMinutes() < 10) {
		timeStr += "0";
	}
	timeStr += currentDateTime.getUTCMinutes() + ":";
	if (currentDateTime.getUTCSeconds() < 10) {
		timeStr += "0";
	}
	timeStr += currentDateTime.getUTCSeconds();
	$('#timepicker').val(timeStr);

	/* Event when click */
	google.maps.event.addListener(map, 'click', function(event) {
		update_timeout = setTimeout(function() {
			// alert("here click event");
			var url_Date_temp = $('#datepicker').val();
			if (url_Date_temp != "") {
				var url_Time_temp = $('#timepicker').val();
				if (url_Time_temp != "") {
					url_DateTime = url_Date_temp + "_" + url_Time_temp;
				}
			}
			gnssString = $('#sel1').val();
			var url = "http://braincopy.org/gnssws/groundTrack?" + "dateTime="
					+ url_DateTime + "&gnss=" + gnssString
					+ "&format=jsonp&term=86400&step=900";
			load_src(url);
		}, 200);
	});

	/* Event when double click */
	google.maps.event.addListener(map, 'dblclick', function(event) {
		clearTimeout(update_timeout);
		// alert("here double click event");
		trackCoordinatesArray.forEach(function(ele, index, array) {
			trackLineArray[index].setMap(null);
			valueCircleArray[index].setMap(null);
			trackCoordinatesArray[index] = new Array();
		});
	});

}

window.callback = function(data) {
	plotAllSatellites(data.values);
};

function load_src(url) {
	var script = document.createElement('script');
	script.src = url;
	document.body.appendChild(script);
}

function plotAllSatellites(values) {
	var satNo = new Array();
	for (var i = 0; i < 5; i++) {
		satNo[i] = 0;
	}
	trackCoordinates = new Array();
	values.forEach(function(ele, index, array) {
		if (ele.SatObservation.SatelliteNumber == 37158) {
			// QZSS
			trackCoordinatesArray[0][satNo[0]] = new google.maps.LatLng(
					ele.SatObservation.Sensor.SensorLocation.Latitude,
					ele.SatObservation.Sensor.SensorLocation.Longitude);
			satNo[0]++;
		} else if (ele.SatObservation.SatelliteNumber == 37846) {
			// Galileo
			trackCoordinatesArray[1][satNo[1]] = new google.maps.LatLng(
					ele.SatObservation.Sensor.SensorLocation.Latitude,
					ele.SatObservation.Sensor.SensorLocation.Longitude);
			satNo[1]++;
		} else if (ele.SatObservation.SatelliteNumber == 37847) {
			// Galileo
			trackCoordinatesArray[2][satNo[2]] = new google.maps.LatLng(
					ele.SatObservation.Sensor.SensorLocation.Latitude,
					ele.SatObservation.Sensor.SensorLocation.Longitude);
			satNo[2]++;
		} else if (ele.SatObservation.SatelliteNumber == 38857) {
			// Galileo
			trackCoordinatesArray[3][satNo[3]] = new google.maps.LatLng(
					ele.SatObservation.Sensor.SensorLocation.Latitude,
					ele.SatObservation.Sensor.SensorLocation.Longitude);
			satNo[3]++;
		} else if (ele.SatObservation.SatelliteNumber == 38858) {
			// Galileo
			trackCoordinatesArray[4][satNo[4]] = new google.maps.LatLng(
					ele.SatObservation.Sensor.SensorLocation.Latitude,
					ele.SatObservation.Sensor.SensorLocation.Longitude);
			satNo[4]++;
		}
	});
	trackCoordinatesArray.forEach(function(ele, index, array) {
		trackLineArray[index] = new google.maps.Polyline({
			path : trackCoordinatesArray[index],
			strokeColor : '#FF4040',
			strokeOpacity : 1.0,
			strokeWeight : 2
		});
		trackLineArray[index].setMap(map);
		valueCircleArray[index] = new google.maps.Circle({
			strokeColor : colorString(),
			strokeOpacity : 0.8,
			strokeWeight : 2,
			fillColor : colorString(),
			fillOpacity : 0.35,
			map : map,
			center : trackCoordinatesArray[index][0],
			radius : radius
		});

	});
}

function colorString(value) {
	return '#FF4040';
}

function addInfowindow(text, latLng) {
	/* Add information window at click point */
	var text2 = url_Date + ": " + url_DataSource + "=" + text;
	var infowindow = new google.maps.InfoWindow({
		content : text2,
		position : latLng
	});
	infowindow.open(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
