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
var gnssString = "JE";
var url_DateTime = "2014-03-01_00:00:00";
var trackLineArray = new Array();
var trackCoordinatesArray = new Array();
var update_timeout = null;
var markerArray = new Array();
var satArray = new Array();
var satNo = new Array();
for (var i = 0; i < 5; i++) {
	satNo[i] = 0;
}

function initialize() {

	/* Setting for initial map info. */
	var mapOptions = {
		zoom : 2,
		center : new google.maps.LatLng(32.068235, 131.129172),
		mapTypeId : google.maps.MapTypeId.SATELLITE,
		disableDoubleClickZoom : true,
		streetViewControl : false,
		mapTypeControl : false
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
			markerArray[index].setMap(null);
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

	roadSatDB(values);

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

/**
 * class for satellite.
 */
function Satellite(_catNo, _rnxStr, _imgStr, _description) {
	this.catNo = _catNo;
	this.rnxStr = _rnxStr;
	this.imgStr = _imgStr;
	this.description = _description;
}

function roadSatDB(values) {

	var httpReq = new XMLHttpRequest();
	httpReq.onreadystatechange = function callback_inRoadSatDB() {
		var lines = new Array();
		if (httpReq.readyState == 4 && httpReq.status == 200) {
			lines = httpReq.responseText.split("\n", 50);
			ele_line = new Array();
			lines.forEach(function(ele, index, array) {
				ele_line = ele.split("\t", 5);
				satArray[index] = new Satellite(ele_line[0], ele_line[1],
						ele_line[2], ele_line[3]);
			});
			createAndDrawTrackCoordinateArray(values);
		}
	};
	//var url = 'http://localhost:8080/gnss_webclient/assets/satelliteDataBase.txt';
	var url = 'http://braincopy.org/WebContent/assets/satelliteDataBase.txt';
	httpReq.open("GET", url, true);
	httpReq.send(null);
}

function createAndDrawTrackCoordinateArray(values) {
	values
			.forEach(function(ele_val, index_val, array_val) {
				satArray
						.some(function(ele_sat, index_sat, array_sat) {
							if (ele_val.SatObservation.SatelliteNumber == ele_sat.catNo) {
								trackCoordinatesArray[index_sat][satNo[index_sat]] = new google.maps.LatLng(
										ele_val.SatObservation.Sensor.SensorLocation.Latitude,
										ele_val.SatObservation.Sensor.SensorLocation.Longitude);
								satNo[index_sat]++;
								return;
							}
						});
			});
	trackCoordinatesArray.forEach(function(ele, index, array) {
		trackLineArray[index] = new google.maps.Polyline({
			path : trackCoordinatesArray[index],
			strokeColor : '#FF4040',
			strokeOpacity : 1.0,
			strokeWeight : 2
		});
		trackLineArray[index].setMap(map);

		var image = new google.maps.MarkerImage('res/drawable/ic_star.png',
				new google.maps.Size(40, 40), new google.maps.Point(0, 0),
				new google.maps.Point(10, 10), new google.maps.Size(20, 20));
		if (satArray[index].imgStr == "qzss") {
			image = new google.maps.MarkerImage('res/drawable/qzss.gif',
					new google.maps.Size(300, 160),
					new google.maps.Point(0, 0), new google.maps.Point(30, 20),
					new google.maps.Size(80, 40));
		} else if (satArray[index].imgStr == "galileo") {
			image = new google.maps.MarkerImage('res/drawable/galileo.gif',
					new google.maps.Size(300, 160),
					new google.maps.Point(0, 0),
					new google.maps.Point(60, 22.5), new google.maps.Size(90,
							45));
		}
		markerArray[index] = new google.maps.Marker({
			position : trackCoordinatesArray[index][0],
			map : map,
			icon : image
		});

	});
}

google.maps.event.addDomListener(window, 'load', initialize);
