gnssws: GNSS Web Service

# Overview
"gnssws" is a "function" of gnssfinder. This server side program can provide gnss positions in response to input information such as time and gnss satellites. 

# Target Environment
- Apache 2.2  
- Tomcat 7  (tested version is 7.0.90 on centos and 7.0.91 on Windows 10)
- PostgreSQL 8  (tested version is 8.4.20 on centos and 9.6 on Windows 10)

# Installation
## Preparation
install necessary software packages such as apache2.2, tomcat7, and postgresql8

## Database
create necessary database and table. In this application, PostgreSQL is used. The name of database is "gnss_db" in my code. you can modify it. and there is a table named "tle_tbl".

tle_tbl

|No|Column Name|contents|
|:----|:----|:----|
|1|date|pk with noradcatalogin|
|2|noradcatalogid|pk with date|	
|3|card1|first line of TLE |
|4|card2|second line of TLE |
|5|status| |

## Deploy WAR file
compile "gnssws" package and deploy tomcat server.

# WEB SERVICE USAGE
Input parameter through url string, and you can get result text data.

## Get Ground Track
- Request URL
`http://<address>/gnssws/groundTrack`
- Queries

|param|name|description|blank|value|
|:---|:---|:-----------|:---|:----|
|format|format|default is xml|allowed|xml, json or jsonp|
|dateTimeStr| date and time string|default is -9999. It means it should be error|not allowed|YYYY-MM-DD_HH:mm:ss|


Sample url string is 

	http://<address>/gnssws/groundTrack?dateTime=2017-01-07_10:00:00&format=json&gnss=GE

- format (xml)  
	xml, json or jsonp
	
- dateTimeStr (-9999: should be error)  
	YYYY-MM-DD_HH:mm:ss
	
- term (86400: means 24 hour)  
	[s]
	
- step  
	[s]
	
- gnss
	G: GPS, R: GLONASS, E: GALILEO, C: BEIDOU, J: QZSS, I: IRNSS, S: SBAS
	
- callback
	 
#Operation
## adding new satellite system
(Mightbe) add NORAD id of the satellites to "space_track.ini"

