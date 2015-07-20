var db;

var matchId = '';

var matchDetails = new Array();

var plapp = angular.module('plappm', []);

var tabNo = '';

function onDeviceReady()
{
	
	document.addEventListener("backbutton", function() {
	    
		window.location.href="index.html"
	    
	}, false);
	
    matchId = getParameterByName("matchId");
    tabNo = getParameterByName("tabNo");
    
    db = window.sqlitePlugin.openDatabase({name: "playingaDB"});
    
    db.transaction(function(tx) {
    	
        tx.executeSql("select id, access_key from " + userTableName + " where is_active=1;", [], function(tx, res) {
        	
              if(res.rows.length <= 0)
              {
                  window.location.href = "index.html";
              }
              else
              {
                  access_key = res.rows.item(0).access_key;
                      
//                  var status = window.localStorage.getItem("authenticate"+matchId);
//
//                  if(status == 1)
//                  {                	  
//                	  getScore();
//                  }
                  
                  tx.executeSql("SELECT * FROM " + matchParticipants + " WHERE match_id='"+matchId+"';", [], function(tx, res) {
                	  
                      for(var arrLoop=0;arrLoop<res.rows.length;arrLoop++)
                      {
                          var indexNum = arrLoop + 1;

                          matchDetails["match_participant_id"+indexNum] = res.rows.item(arrLoop).match_participant_id;
                          
                          matchDetails["participant_id"+indexNum] = res.rows.item(arrLoop).participant_id;

                          if(arrLoop == 1 && res.rows.length <= 2)
                          {
                              var indexNum2 = arrLoop + 2;

                              var indexNum3 = arrLoop + 3;

                              matchDetails["match_participant_id"+indexNum2] = matchDetails["match_participant_id"+indexNum];

                              matchDetails["match_participant_id"+indexNum] = "";

                              matchDetails["match_participant_id"+indexNum3] = "";
                              
                              matchDetails["participant_id"+indexNum2] = matchDetails["participant_id"+indexNum];
                              
                              matchDetails["participant_id"+indexNum] = "";
                              
                              matchDetails["participant_id"+indexNum3] = "";
                              
                          }
                      }
                	  
                  }, errorHandler);

                  tx.executeSql("SELECT * FROM " + matchesTableName + " WHERE match_id='"+matchId+"';", [], function(tx, res) {
                     if(res.rows.length <= 0)
                     {
                         history.go(-1);
                     }
                     else
                     {
                         matchDetails["match_id"] = matchId;

                         matchDetails["name"] = res.rows.item(0).name;

                         matchDetails["tournament_name"] = res.rows.item(0).tournament_name;

                         matchDetails["player_info"] = res.rows.item(0).player_info;

                         matchDetails["game_name"] = res.rows.item(0).game_name.split(" ").join("").toLowerCase();

                         matchDetails["venue"] = res.rows.item(0).venue;

                         matchDetails["lat"] = res.rows.item(0).latitude;

                         matchDetails["long"] = res.rows.item(0).longitude;

                         matchDetails["play_type"] = res.rows.item(0).play_type;

                         matchDetails["match_date"] = res.rows.item(0).match_date;
                         
                         matchDetails["inn_type"] = res.rows.item(0).inn_type;

                         var formattedDateVal = res.rows.item(0).match_date.split(" ").join("T");
                         formattedDateVal = formattedDateVal.split("-").join("");
                         formattedDateVal = formattedDateVal.split(":").join("");
                         formattedDateVal = formattedDateVal + "Z";

                         matchDetails["formattedDate"] = formattedDateVal;
                         latitude = matchDetails["lat"];
                         longitude = matchDetails["long"];

                         var playerDet = matchDetails["player_info"].split(",");

                         matchDetails["image_path"] = res.rows.item(0).image_path;
                         matchDetails["playersLen"] = playerDet.length;

                         for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
                         {
                             var indexNum = arrLoop + 1;

                             var indPlayerDet = playerDet[arrLoop].split("###");

                             matchDetails["name"+indexNum] = indPlayerDet[1];

                             matchDetails["image"+indexNum] = indPlayerDet[2];

                             if(arrLoop == 1 && playerDet.length <= 2)
                             {
                                 var indexNum2 = arrLoop + 2;

                                 var indexNum3 = arrLoop + 3;

                                 matchDetails["name"+indexNum2] = matchDetails["name"+indexNum];

                                 matchDetails["image"+indexNum2] = matchDetails["image"+indexNum];

                                 matchDetails["name"+indexNum] = "";

                                 matchDetails["image"+indexNum] = "";

                                 matchDetails["name"+indexNum3] = "";

                                 matchDetails["image"+indexNum3] = "";
                             }
                         }
                         
                     }

                     $('.site-wrapper').ready(function() {
                         angular.bootstrap($('.site-wrapper'), ['plappm']);
                         
                         angularScope = angular.element(document.getElementById('MatchScoringId')).scope();
                         
                     });

                 }, errorHandler);
             }
         }, errorHandler);
        
     }, errorHandler);
}

var geocoder = new google.maps.Geocoder();
var latitude;
var longitude;
var color = "";

//google.maps.event.addDomListener(window, 'load', initialize);

//google.maps.event.addDomListener(window, 'load', getGeocode);


function getGeocode() {

	//alert("matchDetails[venue] "+matchDetails["venue"]);
                
	geocoder.geocode( { 'address': matchDetails["venue"]}, function(results, status) {
	
	    if (status == google.maps.GeocoderStatus.OK)
        {
    		latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng(); 
            
            initGoogleMap();                    
    	}
    });
    
    //12.965758, 80.218689
    
    //latitude = 12.965758;
    //longitude = 80.218689; 
    
}
        
function initGoogleMap() {

	//alert(" matchDetails[venue] "+matchDetails["venue"]);

	var styles = [{stylers: [{ saturation: 0 }]}];
	
  	var options = {
  		mapTypeControlOptions: {
      		mapTypeIds: ['Styled']
  		},
  		center: new google.maps.LatLng(latitude, longitude),
  		zoom: 15,
	  	scrollwheel: false,
	  	navigationControl: false,
	  	mapTypeControl: false,
	  	zoomControl: true,
	  	disableDefaultUI: true,	
	  	mapTypeId: 'Styled'
  	};
  	
  	var div = document.getElementById('googleMap');
  	var map = new google.maps.Map(div, options);
  	
  	marker = new google.maps.Marker({
		map:map,
      	draggable:false,
      	animation: google.maps.Animation.DROP,
      	icon: 'img/gmap-marker.png',
      	position: new google.maps.LatLng(latitude,longitude)
  	});
  	
    var styledMapType = new google.maps.StyledMapType(styles, { name: 'Styled' });
    
	map.mapTypes.set('Styled', styledMapType);
	      
    var infowindow = new google.maps.InfoWindow({
		content: "<div class='iwContent'>"+address+"</div>"
	});
	
    google.maps.event.addListener(marker, 'click', function() {
	    infowindow.open(map,marker);
    });
    
    bounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(-84.999999, -179.999999),
        new google.maps.LatLng(84.999999, 179.999999));
        
	rect = new google.maps.Rectangle({
		bounds: bounds,
    	fillColor: color,
        fillOpacity: 0,
        strokeWeight: 0,
        map: map
    });
}



function MatchIndex($scope)
{
    $scope.details = [];
    
    $scope.addMatchDetails = function()
    {
        var playername1Str = matchDetails["name1"];
        
        if(matchDetails["name2"] != "")
        {
            playername1Str = playername1Str + ", " + matchDetails["name2"];
        }
        
        var playername2Str = matchDetails["name3"];
        
        if(matchDetails["name4"] != "")
        {
            playername2Str = playername2Str + ", " + matchDetails["name4"];
        }
        
        if(matchDetails["name"].length > 10){
        	
        	matchDetails["name"] = matchDetails["name"].substring(0,10)+"...";
        	
        }
        
        $scope.details = {
            match_id:matchDetails["match_id"],
            name: matchDetails["name"],
            venue: matchDetails["venue"],
            match_status: matchDetails["match_status"],
            tournament_name: matchDetails["tournament_name"],
            score_edit: matchDetails["score_edit"],
            require_partner: matchDetails["require_partner"],
            lat: matchDetails["lat"],
            long: matchDetails["long"],
            formattedDate:matchDetails["formattedDate"],
            game_name: matchDetails["game_name"],
            play_type: matchDetails["play_type"],
            image_path: matchDetails["image_path"],
            playername1:playername1Str,
            playername2:playername2Str,
            playerimage1:matchDetails["image_path"]+matchDetails["image1"],
            playerimage2:matchDetails["image_path"]+matchDetails["image2"],
            playerimage3:matchDetails["image_path"]+matchDetails["image3"],
            playerimage4:matchDetails["image_path"]+matchDetails["image4"],
            tabNo:tabNo
        }
    }
    
    $scope.addMatchDetails();
}



