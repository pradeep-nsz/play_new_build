var db;
var matchId = '';
var tabNo = '';

var matchDetails = new Array();

var plapp = angular.module('plappm', []);
var latitude;
var longitude;
var color = "";
var isAuthenticatedBool = false;
var isAuthenticatedInt = 0;

var access_key = "";

var angularScope;

function getGeocode() {
	
	var geocoder = new google.maps.Geocoder();
	
	geocoder.geocode( { 'address': matchDetails["venue"]}, function(results, status) {
	
	    if (status == google.maps.GeocoderStatus.OK)
        {
    		latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng(); 
            
            initGoogleMap();                    
    	}
    });

}
        
function initGoogleMap() {
	
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
	      
//    var infowindow = new google.maps.InfoWindow({
//		content: "<div class='iwContent'>"+address+"</div>"
//	});
	
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

var matchLocalStatus = "";
var matchServerStatus = "";

var followingOnPopup = "#followingOnPopup";
var syncConfirmationPopup = "#syncConfirmationPopup";
var matchEndPopup = "#matchEndPopup";
var changeTargetPopup = "#changeTargetPopup";
var changeOversPopup = "#changeOversPopup";
var changeStrikerPopup = "#changeStrikerPopup";
var changeNonStrikerPopup = "#changeNonStrikerPopup";
var noMOMPopup = "#noMOMPopup";
var endInningsPopup = "#endInningsPopup";
var inningsEndNotifyPopup = "#inningsEndNotifyPopup";

function onDeviceReady(){
	
	document.addEventListener("backbutton", function() {
	    
		backButton();
		
	}, false);
	
//	window.location.href="#basic";
	
	$(syncConfirmationPopup).popup();
	$(followingOnPopup).popup();
	$(matchEndPopup).popup();
	$(changeTargetPopup).popup();
	$(changeOversPopup).popup();
	$(changeStrikerPopup).popup();
	$(changeNonStrikerPopup).popup();
	$(noMOMPopup).popup();
	$(endInningsPopup).popup();
	$(inningsEndNotifyPopup).popup();
	
    matchId = getParameterByName("matchId");
    tabNo = getParameterByName("tabNo");
    
    db = window.sqlitePlugin.openDatabase({name: "playingaDB"});
    
    db.transaction(function(tx) {
    	
    	tx.executeSql("SELECT id, access_key, type, social_id, user_id from " + userTableName + " where is_active=1;",
			[],function(tx, res) {                                  
				if(res.rows.length > 0)
				{
					access_key = res.rows.item(0).access_key;
				}
		}, errorHandler);
    	
    	
//    	tx.executeSql("DELETE FROM "+ballbyballTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
    	
    	tx.executeSql("SELECT * FROM " + matchParticipants + " WHERE match_id='"+matchId+"' ORDER BY match_participant_id;", [], function(tx, res) {
      	  
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
                     
                 var formattedDateVal = res.rows.item(0).match_date.split(" ").join("T");
                 formattedDateVal = formattedDateVal.split("-").join("");
                 formattedDateVal = formattedDateVal.split(":").join("");
                 formattedDateVal = formattedDateVal + "Z";
                     
                 matchDetails["formattedDate"] = formattedDateVal;
                 latitude = matchDetails["lat"];
                 longitude = matchDetails["long"];
                 
                 var playerDet = matchDetails["player_info"].split(",");
                 
                 matchDetails["playersLen"] = playerDet.length;
                     
                 matchDetails["image_path"] = res.rows.item(0).image_path;
                 
                 for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
                 {
                     var indexNum = arrLoop + 1;
                     
                     var indPlayerDet = playerDet[arrLoop].split("###");
                     
                     matchDetails["name"+indexNum] = indPlayerDet[1];
                     
                     matchDetails["image"+indexNum] = indPlayerDet[2];
                     
                     matchDetails["jersey_color"+(arrLoop+1)] = indPlayerDet[3];
                     
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
                 $("#loader").hide();
             });
                     
         }, errorHandler);
       
       	var getAuthenticatedInfo = "SELECT * FROM "+matchAttributes+
       		" WHERE match_id = "+matchId;
       	
       	tx.executeSql(getAuthenticatedInfo, [], function(tx, res) {
       		
       		isAuthenticatedBool = false;
       		isAuthenticatedInt = 0;
       		
            if(res.rows.length > 0)
            {	
            	if(res.rows.item(0).is_authenticated == 1){
            		isAuthenticatedBool = true;
            		isAuthenticatedInt = 1;
            		
            		matchSync();
            		
            	}
            	
            	matchLocalStatus = res.rows.item(0).match_status;
            	
//            	alert("matchLocalStatus "+matchLocalStatus);
            	
            }
            
//            alert("matchLocalStatus "+matchLocalStatus);
            
            getScore();
            
       	}, errorHandlerNew);
       	  
   }, errorHandler);
   
   
   $("input[type=password]").keyup(function () {
       if (this.value.length == this.maxLength) {
           $(this).next().focus();
       }
   });
    
}

var tabClasses = ["match-details","match-scorecard","match-score-entry"];
var tabTitleClasses = ["details-tab","scorecard-tab","scoring-tab"];

var currentTab = 0;

function changeTab(tabno){
	
	for(var i=0;i<tabClasses.length;i++){
		$("."+tabClasses[i]).addClass("hide");
		$("."+tabTitleClasses[i]).removeClass("active");
	}
	
	currentTab = tabno;
	
	$("."+tabClasses[tabno]).removeClass("hide");
	$("."+tabTitleClasses[tabno]).addClass("active");
	
}

function hideTabTitle(tabno){
	$("."+tabTitleClasses[tabno]).addClass("hide");
}

function showTabTitle(tabno){
	$("."+tabTitleClasses[tabno]).removeClass("hide");	
}


function getScore(){
	
//	alert("access_key "+access_key);
	
	 var soapRequest = soapMsgStart + '<getScore xmlns="'+webserviceURL+'"> \
	 <match_id>' + matchId + '</match_id> \
	 <access_key>' + access_key + '</access_key> \
	 </getScore> \ ' + soapMsgEnd;
	 
	 $.ajax({
	    type: "POST",
	    url: webserviceURL,
	    contentType: "text/xml",
	    dataType: "xml",
	    data: soapRequest,
	    success: getScoreSuccess,
	    error: getScoreError
	 });
	
}

var team1Squad = new Array();
var team2Squad = new Array();
var matchSquad = new Array();

var getScoreParams = ["match_id","user_id","match_participant_id",
                      "firstname","lastname","role_type_id","player_attr_name",
                      "jersey_no","thumb_loc"];

var teamRole = ["","C","VC",""];
//var playerRole = ["","C","VC",""];
var matchStatus;

var matchAttrJSON = {};
var playerAttrJSON = {};
var team1PlayersJSON = [];
var team2PlayersJSON = [];
var matchParticipantIdArray = new Array();

function getScoreSuccess(data, status, req){
	
	getGeocode();
	
	if (status == "success")
    {
        var responseXML = $(req.responseXML);
        console.log(req.responseText);
//        alert("req.responseText "+req.responseText)
        matchStatus = responseXML.find("matchstatus").text();        
        playerImagepath = responseXML.find("playerimagepath").text();
        
        var matchSquadXML = $(responseXML.find("MatchSquad"));    	
    	var playersCount = matchSquadXML.find("match_participant_id").length;
    	
    	for(var initLoop=0;initLoop<playersCount;initLoop++){
    		matchSquad[initLoop] = new Array();
    	}
    	
    	showTabTitle(1);
    	showTabTitle(2);
    	
    	$.each(getScoreParams, function(index, value){
            
            var incLoop = 0;
            matchSquadXML.find(value).each(function(){
            	
            	matchSquad[incLoop][value] = $(this).text();
            	matchSquad[incLoop][value] = matchSquad[incLoop][value].replace(/'/g,"''");
            	
//            	alert("value " +matchSquad[incLoop][value])
            	
                incLoop++;
                
            });
               
        });
    	
    	var insertQry = "INSERT INTO " + matchSquadTable 
        + " (match_id, player_id, match_participant_id, first_name, last_name, player_role," +
		" team_role, jersey_no, player_image) VALUES ";
        
        var valuesQry = "";
        	        
        db.transaction(function(tx) {
        	
            for(var playerLoop = 0; playerLoop < playersCount; playerLoop++)
            {
                var qryStr = "DELETE FROM "+matchSquadTable+" WHERE match_id='"+matchSquad[playerLoop]["match_id"]+"' AND player_id='"+matchSquad[playerLoop]["user_id"]+"';";
                
                tx.executeSql(qryStr, [], (function(playerLoop){
                	
                   return function(tx,res) //success function
                   {   
                	   
                       var commaStr = "";
                       
                       var valuesStr = "";                       
                       valuesStr = "(" + matchSquad[playerLoop]["match_id"] + ", '" +
                       		matchSquad[playerLoop]["user_id"] + "', '" +
                       		matchSquad[playerLoop]["match_participant_id"];
                       
                       valuesStr = valuesStr + "', '" + matchSquad[playerLoop]["firstname"] +
                       		"', '" + matchSquad[playerLoop]["lastname"] + "',' " +
                   			matchSquad[playerLoop]["player_attr_name"]+"'";
                       
                       valuesStr = valuesStr + ", '" + matchSquad[playerLoop]["role_type_id"] +
                       		"', '" + matchSquad[playerLoop]["jersey_no"] + "', '" +
                       		playerImagepath+"/"+matchSquad[playerLoop]["thumb_loc"];
                       valuesStr = valuesStr+ "')";
                       
                       if(valuesQry == ""){
                           commaStr = " ";
                       }
                       else{
                           commaStr = " , ";
                       }
                       
                       valuesQry = valuesQry + commaStr + valuesStr;
                           
                       if(playerLoop == playersCount - 1 && valuesQry != "")
                       {   
                    	   console.log(matchSquadTable+" INSERTION ===> "+insertQry + valuesQry);                    	   
                           tx.executeSql(insertQry + valuesQry,[], function(tx, res) {}, errorHandler);
                       }
                   };
               })(playerLoop), errorHandler);
            }
        }, errorHandler);
        
//        alert("matchStatus "+matchStatus);
        
        if(matchStatus == "Yet to be Started") {
        	
        	matchServerStatus = "N";
        	
        	if(matchLocalStatus == "N" || matchLocalStatus == ""){
        		restoreGetScoreNextData();
        	}
        	else{
        		showPopup(syncConfirmationPopup);
        	}
        	
        } 
      else //{
        if(matchStatus == "Match Started") {
        	
    	  	matchServerStatus = "S";
        	
        	matchAttrXML = $(responseXML.find("matchattr"));
        	fullScoreXML = $(responseXML.find("cricket_fullscore"));
        	playingaXIXML = $(responseXML.find("playingXI"));
        	fullScoreInfoXML = $(responseXML.find("fullscore_info"));
        	ballbyBallXML = $(responseXML.find("cricket_ball_update"));
        	
        	
        	db.transaction(function(tx) {
        		
        		var getLocalBallDetails = "SELECT * FROM "+ballbyballTable+
    	    		" WHERE match_id="+matchId+
    	    		" AND is_synced = 1 "+
    	    		" ORDER BY innings_id DESC,ball_unique DESC";
            	
    			tx.executeSql(getLocalBallDetails,[],function(tx,res){
    				
    				var ballLength = ballbyBallXML.find("match_id").length;
    				
    				if(res.rows.length > 0){
        	        	
        	    		if(ballLength != 0){
        	        	
        		        	var ballbyBallAttr = ["inni_num","ball_unique"];
        					
        					var ballbyBallParserValues = new Array();
        					
        		 			$.each(ballbyBallAttr, function(index, value){
        		 	           ballbyBallXML.find(value).each(function(){
        		 	        	  ballbyBallParserValues[value] = $(this).text();
        		 	           });
        		 			});
        		 			
//        		 			alert("ballbyBallParserValues[inni_num] "+ballbyBallParserValues["inni_num"]);
//        		 			alert("ballbyBallParserValues[ball_unique] "+ballbyBallParserValues["ball_unique"]);
//        		 			alert("res.rows.item(0).innings_id  "+res.rows.item(0).innings_id );
//        		 			alert("res.rows.item(0).ball_unique "+res.rows.item(0).ball_unique);
        		 			
        		 			if(ballbyBallParserValues["inni_num"] != res.rows.item(0).innings_id 
        		 					|| ballbyBallParserValues["ball_unique"] != res.rows.item(0).ball_unique){
        		 				showPopup(syncConfirmationPopup);
        		 			}
        		 			else{
        		 				angularScope.getMatchInfo();
        		 			}
        	        	
        	    		}
        	    		else{
        	    			showPopup(syncConfirmationPopup);
        	    		}
    					
    				}
    				else if(ballLength != 0){
    					showPopup(syncConfirmationPopup);
    				}
    			
    			},errorHandler);
    			
        	},errorHandler);
        	
        	if(matchLocalStatus != "S"){
        		showPopup(syncConfirmationPopup);
    		}
        }
        else{
        	
        	matchAttrXML = $(responseXML.find("matchattr"));
        	fullScoreXML = $(responseXML.find("cricket_fullscore"));
        	playingaXIXML = $(responseXML.find("playingXI"));
        	fullScoreInfoXML = $(responseXML.find("fullscore_info"));
        	ballbyBallXML = $(responseXML.find("cricket_ball_update"));
        	
        	if(matchLocalStatus == "S"){
        		showPopup(syncConfirmationPopup);
        	}
        	else{
        		hideTabTitle(2);
        	}
        }
    }
}

function restoreGetScoreNextData(){
	
	db.transaction(function(tx) {
		
		tx.executeSql("DELETE FROM "+matchAttributes+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);			
		tx.executeSql("DELETE FROM "+fullScoreInfoTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreWicketTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+ballbyballTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		

		var insertMatchAttr = "INSERT INTO "+matchAttributes+
		"(match_id, toss_won_by, toss_decision, "+
		"innings_count, is_following, total_overs, " +
		"is_last_man_batting, result, match_status, is_authenticated, mom_id)"+
		" VALUES "+
		"("+matchId+",0,'0',0,0,0,0,'','N',"+isAuthenticatedInt+",0)";
		
		console.log(matchAttributes+" INSERTION ===> "+insertMatchAttr);    			
		tx.executeSql(insertMatchAttr,[],function(){
			angularScope.getMatchInfo();
		},errorHandler);
	
	},errorHandler);
	
}

var matchAttrXML;
var fullScoreXML;
var playingaXIXML;
var ballbyBallXML;
var fullScoreInfoXML;

function restoreGetScoreData(){
	
	var matchAttrLength = matchAttrXML.find("match_attr_name").length;
	
	var matchAttrName = [];
	var matchAttrValue = [];
	
	var incLoop = 0;
	matchAttrXML.find("match_attr_name").each(function(){
		matchAttrName[incLoop] = $(this).text();
		incLoop++;
    });
	
	incLoop = 0;
	matchAttrXML.find("attr_value").each(function(){
		matchAttrValue[incLoop] = $(this).text();
		incLoop++;
    });
	
	for(var i=0 ;i<matchAttrLength;i++){        		
		matchAttrJSON[matchAttrName[i]] = matchAttrValue[i];
	}
	
	var totalInnings;
	
	if(matchAttrJSON["inn_type"] == 1)
		totalInnings = 2;
	else if(matchAttrJSON["inn_type"] == 2)
		totalInnings = 4;
	
	db.transaction(function(tx) {
		
		tx.executeSql("DELETE FROM "+matchAttributes+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);			
		tx.executeSql("DELETE FROM "+fullScoreInfoTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreWicketTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+ballbyballTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
		
		/*
		 *  MATCH ATTRIBUTES INSERTION STARTS
		 */
		
		var momId;
		
		if(matchAttrJSON["man_of_the_match"] == "")
			momId = 0;
		else
			momId = matchAttrJSON["man_of_the_match"];

		var insertMatchAttr = "INSERT INTO "+matchAttributes+
		"(match_id, toss_won_by, toss_decision, "+
		"innings_count, is_following, total_overs, " +
		"is_last_man_batting, result, match_status, is_authenticated,mom_id)"+
		" VALUES "+
		"("+matchId+","+matchAttrJSON["toss_won_by_team"]+",'"+matchAttrJSON["team_decision"]+"',"+
		matchAttrJSON["inn_type"]+",0,"+matchAttrJSON["total_overs"]+","+
		matchAttrJSON["lastman_batting"]+",'"+matchAttrJSON["result"]+"','"
		+matchAttrJSON["match_status"]+"',"+isAuthenticatedInt+","+momId+")";
		
		console.log(matchAttributes+" INSERTION ===> "+insertMatchAttr);    			
		tx.executeSql(insertMatchAttr,[],function(){},errorHandler);
		
		/*
		 *  MATCH ATTRIBUTES INSERTION ENDS
		 */
		
		/*
		 *  FULL SCORE INSERTION STARTS
		 */
		
		var fullScoreResponseAttr = ["match_id","innings","batsmanid",
				"match_participant_id","batted_order_no","bowled_order_no",
				"runs","balls","four","sixer","str_rate","bow_balls",
				"bow_over","bow_maidens","bow_runs","bow_wickets","bow_economy",
				"out_type_id","wfielderid1","wfielderid2","wfielderid3","wfielderid4",
				"wbowlerid","out_text","fall_of_wicket",
				"bowl_extras","bow_dotball","wicket_number","role_id"];
		
		var playerCount = fullScoreXML.find("match_id").length;
		
		var fullScoreParserValues = new Array();
		for(var arrayLoop = 0; arrayLoop < playerCount; arrayLoop++){
			fullScoreParserValues[arrayLoop] = new Array();
        }
		
		$.each(fullScoreResponseAttr, function(index, value){
            var incLoop = 0;
            fullScoreXML.find(value).each(function(){
            	fullScoreParserValues[incLoop][value] = $(this).text();
            	fullScoreParserValues[incLoop][value] = fullScoreParserValues[incLoop][value].replace(/'/g,"''");
                incLoop++;
            });
       });
		
		var fullScoreValues = new Array();
		var fullScoreWicketValues = new Array();
		for(var innningsInitLoop = 1;innningsInitLoop < (totalInnings+1);innningsInitLoop++){
			fullScoreValues[innningsInitLoop] = new Array();
		}
		
		
		for(var playerLoopCount = 0;playerLoopCount < playerCount;playerLoopCount++){
			
			var innings = fullScoreParserValues[playerLoopCount]["innings"];
			var playerLoop = fullScoreValues[innings].length;
			
			fullScoreValues[innings][playerLoop] = new Array();
			
			matchParticipantIdArray[innings] = fullScoreParserValues[playerLoopCount]["match_participant_id"];
			
			fullScoreValues[innings][playerLoop]["match_id"] = fullScoreParserValues[playerLoopCount]["match_id"];
			fullScoreValues[innings][playerLoop]["innings_id"] = innings;
			fullScoreValues[innings][playerLoop]["player_id"] = fullScoreParserValues[playerLoopCount]["batsmanid"];
			fullScoreValues[innings][playerLoop]["match_participant_id"] = fullScoreParserValues[playerLoopCount]["match_participant_id"];
			
			fullScoreValues[innings][playerLoop]["role_id"] = fullScoreParserValues[playerLoopCount]["role_id"];
			
			fullScoreValues[innings][playerLoop]["batting_bowling_order"] = fullScoreParserValues[playerLoopCount]["batted_order_no"];
			fullScoreValues[innings][playerLoop]["score_info_1"] = fullScoreParserValues[playerLoopCount]["runs"];
			fullScoreValues[innings][playerLoop]["score_info_2"] = fullScoreParserValues[playerLoopCount]["balls"];
			fullScoreValues[innings][playerLoop]["score_info_3"] = fullScoreParserValues[playerLoopCount]["four"];
			fullScoreValues[innings][playerLoop]["score_info_4"] = fullScoreParserValues[playerLoopCount]["sixer"];
			fullScoreValues[innings][playerLoop]["score_info_5"] = fullScoreParserValues[playerLoopCount]["str_rate"];
			fullScoreValues[innings][playerLoop]["is_batting"] = 1;
			fullScoreValues[innings][playerLoop]["out_text"] = fullScoreParserValues[playerLoopCount]["out_text"];
			fullScoreValues[innings][playerLoop]["extra_count"] = "";
			fullScoreValues[innings][playerLoop]["bowler_dotballs"] = 0;
			
			if(fullScoreParserValues[playerLoopCount]["out_type_id"] != 0){
				
				fullScoreWicketValues[fullScoreWicketValues.length] = new Array();
				
				fullScoreWicketValues[fullScoreWicketValues.length-1]["match_id"] = matchId;
				fullScoreWicketValues[fullScoreWicketValues.length-1]["innings_id"] = innings;
				fullScoreWicketValues[fullScoreWicketValues.length-1]["batsman_id"] = fullScoreParserValues[playerLoopCount]["batsmanid"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["bowler_id"] = fullScoreParserValues[playerLoopCount]["wbowlerid"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["fielder_id1"] = fullScoreParserValues[playerLoopCount]["wfielderid1"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["fielder_id2"] = fullScoreParserValues[playerLoopCount]["wfielderid2"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["fielder_id3"] = fullScoreParserValues[playerLoopCount]["wfielderid3"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["fielder_id4"] = fullScoreParserValues[playerLoopCount]["wfielderid4"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["wicket_type"] = fullScoreParserValues[playerLoopCount]["out_type_id"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["wicket_number"] = fullScoreParserValues[playerLoopCount]["wicket_number"];
				fullScoreWicketValues[fullScoreWicketValues.length-1]["fall_of_wickets"] = fullScoreParserValues[playerLoopCount]["fall_of_wicket"];
			}
			
			if(innings == 2)
				innings = 1;
			else if(innings == 1)
				innings = 2;
			else if(innings == 4)
				innings = 3;
			else if(innings == 3)
				innings = 4;
			
			fullScoreValues[innings][playerLoop] = new Array();
			
			fullScoreValues[innings][playerLoop]["match_id"] = fullScoreParserValues[playerLoopCount]["match_id"];
			fullScoreValues[innings][playerLoop]["innings_id"] = innings;
			fullScoreValues[innings][playerLoop]["player_id"] = fullScoreParserValues[playerLoopCount]["batsmanid"];
			fullScoreValues[innings][playerLoop]["match_participant_id"] = fullScoreParserValues[playerLoopCount]["match_participant_id"];
			
			fullScoreValues[innings][playerLoop]["role_id"] = fullScoreParserValues[playerLoopCount]["role_id"];
			
			fullScoreValues[innings][playerLoop]["batting_bowling_order"] = fullScoreParserValues[playerLoopCount]["bowled_order_no"];
			fullScoreValues[innings][playerLoop]["score_info_1"] = fullScoreParserValues[playerLoopCount]["bow_balls"];
			fullScoreValues[innings][playerLoop]["score_info_2"] = fullScoreParserValues[playerLoopCount]["bow_maidens"];
			fullScoreValues[innings][playerLoop]["score_info_3"] = fullScoreParserValues[playerLoopCount]["bow_runs"];
			fullScoreValues[innings][playerLoop]["score_info_4"] = fullScoreParserValues[playerLoopCount]["bow_wickets"];
			fullScoreValues[innings][playerLoop]["score_info_5"] = fullScoreParserValues[playerLoopCount]["bow_economy"];
			fullScoreValues[innings][playerLoop]["is_batting"] = 0;
			fullScoreValues[innings][playerLoop]["out_text"] = "0";
			fullScoreValues[innings][playerLoop]["extra_count"] = fullScoreParserValues[playerLoopCount]["bowl_extras"];
			fullScoreValues[innings][playerLoop]["bowler_dotballs"] = fullScoreParserValues[playerLoopCount]["bow_dotball"];
			
		}
		
		for(var inningsLoop = 1;inningsLoop < (totalInnings+1);inningsLoop++){
			
			var insertFullQry = "INSERT INTO "+fullScoreTable+
			"(match_id, innings_id, player_id, " +
			"match_participant_id, role_id, batting_bowling_order, score_info_1, " +
			"score_info_2, score_info_3, score_info_4, " +
			"score_info_5, is_batting, out_text, extra_count, bowler_dotballs) VALUES ";
			
			var valuesQry = "";
			
			for(var playerLoop = 0;playerLoop < fullScoreValues[inningsLoop].length;playerLoop++){
				
				var valueStr = "";		
					
				valueStr = "("+
					fullScoreValues[inningsLoop][playerLoop]["match_id"]+","+
					fullScoreValues[inningsLoop][playerLoop]["innings_id"]+","+
					fullScoreValues[inningsLoop][playerLoop]["player_id"]+","+
					fullScoreValues[inningsLoop][playerLoop]["match_participant_id"]+","+
					
					fullScoreValues[innings][playerLoop]["role_id"]+","+
					
					fullScoreValues[inningsLoop][playerLoop]["batting_bowling_order"]+","+
					fullScoreValues[inningsLoop][playerLoop]["score_info_1"]+","+
					fullScoreValues[inningsLoop][playerLoop]["score_info_2"]+","+
					fullScoreValues[inningsLoop][playerLoop]["score_info_3"]+","+
					fullScoreValues[inningsLoop][playerLoop]["score_info_4"]+","+
					fullScoreValues[inningsLoop][playerLoop]["score_info_5"]+","+
					fullScoreValues[inningsLoop][playerLoop]["is_batting"]+",'"+
					fullScoreValues[inningsLoop][playerLoop]["out_text"]+"','"+
					fullScoreValues[inningsLoop][playerLoop]["extra_count"]+"',"+
					fullScoreValues[inningsLoop][playerLoop]["bowler_dotballs"]+
					")";
				
				if(valuesQry == ""){
					valuesQry = valueStr;
				}
				else{
					valuesQry = valuesQry+","+valueStr;
				}
			}
			console.log("valuesQry "+valuesQry);
			
			if(valuesQry != ""){
				console.log(fullScoreTable+" INSERTION ===> "+insertFullQry + valuesQry);
				tx.executeSql(insertFullQry + valuesQry,[], function(tx, res) {}, errorHandler);
			}
		}
		
		/*
		 *  FULL SCORE INSERTION ENDS
		 */
		
		/*
		 *  FULL SCORE WICKETS INSERTION STARTS
		 */
		
		var insertFullWicketQry = "INSERT INTO "+fullScoreWicketTable+
		"(match_id, innings_id, batsman_id, " +
		"bowler_id, fielder_id_1, fielder_id_2, " +
		"fielder_id_3, fielder_id_4, wicket_type, " +
		"wicket_number, fall_of_wickets) VALUES ";
		
		var fullWicketValuesQry = "";
		
		for(var playerLoop = 0;playerLoop < fullScoreWicketValues.length;playerLoop++){
			
			var valueStr = "";						
				
			valueStr = "("+
				fullScoreWicketValues[playerLoop]["match_id"]+","+
				fullScoreWicketValues[playerLoop]["innings_id"]+","+
				fullScoreWicketValues[playerLoop]["batsman_id"]+","+
				fullScoreWicketValues[playerLoop]["bowler_id"]+","+
				fullScoreWicketValues[playerLoop]["fielder_id1"]+","+
				fullScoreWicketValues[playerLoop]["fielder_id2"]+","+
				fullScoreWicketValues[playerLoop]["fielder_id3"]+","+
				fullScoreWicketValues[playerLoop]["fielder_id4"]+","+
				fullScoreWicketValues[playerLoop]["wicket_type"]+","+
				fullScoreWicketValues[playerLoop]["wicket_number"]+",'"+
				fullScoreWicketValues[playerLoop]["fall_of_wickets"]+"'"+
				")";
			
			if(fullWicketValuesQry == ""){
				fullWicketValuesQry = valueStr;
			}
			else{
				fullWicketValuesQry = fullWicketValuesQry+","+valueStr;
			}
		}
		console.log("fullWicketValuesQry "+fullWicketValuesQry);
		
		if(fullWicketValuesQry != ""){
			console.log(fullScoreWicketTable+" INSERTION ===> "+insertFullWicketQry + fullWicketValuesQry);
			tx.executeSql(insertFullWicketQry + fullWicketValuesQry,[], function(tx, res) {}, errorHandler);
		}
		
		/*
		 *  FULL SCORE WICKETS INSERTION ENDS
		 */
		
		/*
		 *  FULL SCORE INFO INSERTION STARTS
		 */
		
		var fullScoreInfoResponseAttr = ["match_id", "innings_id", "match_participant_id",
		                      		"extras_text", "team_runs", "team_wickets", "team_overs", "keeper_id", "is_declare"];
		         			
			var infoCount = fullScoreInfoXML.find("match_id").length;     			
			var fullScoreinfoParserValues = new Array();
			
			for(var arrayLoop = 0; arrayLoop < infoCount; arrayLoop++){
				fullScoreinfoParserValues[arrayLoop] = new Array();
	        }
			
			$.each(fullScoreInfoResponseAttr, function(index, value){
				
				var incLoop = 0;
				fullScoreInfoXML.find(value).each(function(){
					
	            	fullScoreinfoParserValues[incLoop][value] = $(this).text();
//	            	fullScoreinfoParserValues[incLoop][value] = fullScoreParserValues[incLoop][value].replace(/'/g,"''");
	                incLoop++;
	                
	            });
			});  
			
			    			
		var insertFullInfoQry = "INSERT INTO "+fullScoreInfoTable+
			" (match_id, innings_id, match_participant_id, extra_text," +
			" team_runs, team_wickets, team_overs, keeper_id, is_declare) VALUES ";				
		
		
		var insertFullInfoValues = "";
		
		for(var infoInningsLoop = 0; infoInningsLoop < infoCount; infoInningsLoop++){
			
			insertFullInfoValues = insertFullInfoValues+
				"("+fullScoreinfoParserValues[infoInningsLoop]["match_id"]+","+
				fullScoreinfoParserValues[infoInningsLoop]["innings_id"]+","+
				fullScoreinfoParserValues[infoInningsLoop]["match_participant_id"]+",'"+
				fullScoreinfoParserValues[infoInningsLoop]["extras_text"]+"',"+
				fullScoreinfoParserValues[infoInningsLoop]["team_runs"]+","+
				fullScoreinfoParserValues[infoInningsLoop]["team_wickets"]+",'"+
				fullScoreinfoParserValues[infoInningsLoop]["team_overs"]+"',"+
				fullScoreinfoParserValues[infoInningsLoop]["keeper_id"]+","+
				fullScoreinfoParserValues[infoInningsLoop]["is_declare"]+""+
				")";
			
			if(infoInningsLoop < infoCount-1){
				insertFullInfoValues = insertFullInfoValues+",";
			}
		}
		
		if(insertFullInfoValues != ""){
			console.log(fullScoreInfoTable+" INSERTION ===> "+insertFullInfoQry+insertFullInfoValues);
			tx.executeSql(insertFullInfoQry+insertFullInfoValues,[],function(){},errorHandler);
		}
		
		/*
		 *  FULL SCORE INFO INSERTION ENDS
		 */
		
		
		/*
		 *  BALL by BALL INSERTION STARTS
		 */
		
		var ballLength = ballbyBallXML.find("match_id").length;
		
		if(ballLength != 0){

			var ballbyBallAttr = ["match_id","inni_num",
			                      "over","ball_no","ball_unique",
			                      "batsman_id","non_striker_id","bowler_id",
			                      "runs","extra_run",
			                      "is_extra","is_wicket","curr_team_runs",
			                      "curr_team_wickets","required_runs","remaining_balls",
			                      "this_over"];
			
			var ballbyBallParserValues = new Array();
			
 			$.each(ballbyBallAttr, function(index, value){         				
 	           ballbyBallXML.find(value).each(function(){
 	        	   
 	        	   ballbyBallParserValues[value] = $(this).text();
 	           }); 
 			});
 			
			var insertBallDetailsQry = "INSERT INTO "+ballbyballTable+
        		" (match_id, innings_id,"+
     			" over_id, ball_id, ball_unique,"+
    			" striker_id, non_striker_id, bowler_id,"+
    			" batsman_runs, extra_runs, extra_type,"+
    			" is_wicket, is_updated, is_synced,"+
    			" curr_team_runs, curr_team_wickets,required_runs,"+
    			" remaining_balls,this_over) VALUES ";
				
			var valueStr = "";
			
			var isUpdated = 1;
			var isSynced = 1;
			
			valueStr = "("+
				ballbyBallParserValues["match_id"]+","+
				ballbyBallParserValues["inni_num"]+","+
				ballbyBallParserValues["over"]+","+
				ballbyBallParserValues["ball_no"]+","+
				ballbyBallParserValues["ball_unique"]+","+
				ballbyBallParserValues["batsman_id"]+","+
				ballbyBallParserValues["non_striker_id"]+","+
				ballbyBallParserValues["bowler_id"]+","+
				ballbyBallParserValues["runs"]+","+
				ballbyBallParserValues["extra_run"]+","+
				ballbyBallParserValues["is_extra"]+","+
				ballbyBallParserValues["is_wicket"]+","+
				isUpdated+","+
				isSynced+","+
				ballbyBallParserValues["curr_team_runs"]+","+
				ballbyBallParserValues["curr_team_wickets"]+","+
				ballbyBallParserValues["required_runs"]+","+
				ballbyBallParserValues["remaining_balls"]+",'"+
				ballbyBallParserValues["this_over"]+"'"+
				")";
			
			if(valueStr != ""){						
				
				console.log(ballbyballTable+" INSERTION ===> "+insertBallDetailsQry + valueStr);
				tx.executeSql(insertBallDetailsQry + valueStr,[], function(tx, res){
					angularScope.getMatchInfo();
				}, errorHandler);						
			}
			
			var outBatsmanId = 0;
			
			if(ballbyBallParserValues["is_wicket"] == 1){
				
				var getOutBatsmanId = " SELECT batsman_id FROM "+fullScoreWicketTable+
					" WHERE match_id = "+matchId+
					" AND innings_id = "+ballbyBallParserValues["inni_num"]+
					" AND wicket_number = "+ballbyBallParserValues["curr_team_wickets"];
				
				tx.executeSql(getOutBatsmanId,[], function(tx, res){
					
					if(res.rows.length > 0){
						
						angularScope.nextBallCalculation(ballbyBallParserValues["inni_num"],
								ballbyBallParserValues["ball_unique"],
								res.rows.item(0).batsman_id);
						
					}
					
				}, errorHandler);
				
			}
			else{
				
				angularScope.nextBallCalculation(ballbyBallParserValues["inni_num"],
						ballbyBallParserValues["ball_unique"],
						0);
			}
			
		}
		else{
			
			angularScope.nextBallCalculation(1,0,0);
		}
		
		/*
		 *  BALL by BALL INSERTION ENDS
		 */
        
    }, errorHandler);
	
}


function getScoreError(data, status, req){
	
	if(isAuthenticatedBool){
		
		db.transaction(function(tx) {
			
			var checkSquad = "SELECT * FROM "+matchSquadTable+" WHERE match_id = "+matchId;
			
			tx.executeSql(checkSquad,[],function(tx, res) {
				
				if(res.rows.length < 0){
					hideTabTitle(1);
					hideTabTitle(2);
				}
				else{
					showTabTitle(1);
					showTabTitle(2);
					
					angularScope.getMatchInfo();
					
				}
				
			},errorHandler);
		
    	},errorHandler);
		
	}
	else{
		
		hideTabTitle(1);
		hideTabTitle(2);
	}
		
}

function authenticatePasscode()
{
    $(".authenticateButton").hide();
    
    var pwd = $("#password1").val() + $("#password2").val() +
    	$("#password3").val() + $("#password4").val() +
    	$("#password5").val() + $("#password6").val();
    
    var soapRequest = soapMsgStart + '<matchAuth xmlns="'+webserviceURL+'"> \
    <match_id>' + matchId + '</match_id> \
    <access_key>' + access_key + '</access_key> \
    <password>' + pwd + '</password> \
    </matchAuth> \ ' + soapMsgEnd;
    
    $.ajax({
       type: "POST",
       url: webserviceURL,
       contentType: "text/xml",
       dataType: "xml",
       data: soapRequest,
       success: authenticateSuccess,
       error: authenticateError
    });
}

function authenticateSuccess(data, status, req)
{
	
    if (status == "success")
    {
        var responseXML = $(req.responseXML);
        
        var code = responseXML.find("code").text();
        
        
        if(code == 0 || code == "")
        {   
            $(".authenticateButton").show();
            var inLoop=0;
            $("input[type=password]").each(function(){
                $(this).val("");
                if(inLoop == 0)
                {
                    $(this).focus();
                }
                inLoop++;
            });
        }
        else
        {
        	isAuthenticatedBool = true;
        	isAuthenticatedInt = 1;
        	
        	matchSync();
        	
        	db.transaction(function(tx) {
    			
    			var updateAuthenticate = "UPDATE "+matchAttributes+
    			" SET is_authenticated = 1"+
    			" WHERE match_id = "+matchId;
    			
    			tx.executeSql(updateAuthenticate,[],function(tx, res) {
    				
    				angularScope.getMatchInfo();
    				
    			},errorHandler);
    		
        	},errorHandler);
        	
        }
    }
}

function authenticateError(data, status, req)
{
	$(".authenticateButton").show();
	
	var inLoop=0;
	$("input[type=password]").each(function(){
		$(this).val("");
	    if(inLoop == 0)
	    {
	    	$(this).focus();
	    }
	    inLoop++;
	});
}


var playername1Str;
var playername2Str;

var match_participant_id1Str;
var match_participant_id2Str;

var participant_id1Str;
var participant_id2Str;

function MatchDetails($scope)
{
    $scope.details = [];
    
    $scope.addMatchDetails = function()
    {
        playername1Str = matchDetails["name1"];        
        if(matchDetails["name2"] != ""){
            playername1Str = playername1Str + ", " + matchDetails["name2"];
        }
        playername2Str = matchDetails["name3"];
        if(matchDetails["name4"] != ""){
            playername2Str = playername2Str + ", " + matchDetails["name4"];
        }
        
        if(matchDetails["name"].length > 10){
        	matchDetails["name"] = matchDetails["name"].substring(0,10)+"...";
        }
        
        match_participant_id1Str = matchDetails["match_participant_id1"];
        if(matchDetails["match_participant_id2"] != ""){
        	match_participant_id1Str = match_participant_id1Str + ", " + matchDetails["match_participant_id2"];
        }
        match_participant_id2Str = matchDetails["match_participant_id3"];
        if(matchDetails["match_participant_id4"] != ""){
        	match_participant_id2Str = match_participant_id2Str + ", " + matchDetails["match_participant_id4"];
        }
        
        participant_id1Str = matchDetails["participant_id1"];
        if(matchDetails["participant_id2"] != ""){
        	participant_id1Str = participant_id1Str + ", " + matchDetails["participant_id2"];
        }
        participant_id2Str = matchDetails["participant_id3"];
        if(matchDetails["participant_id4"] != ""){
        	participant_id2Str = participant_id2Str + ", " + matchDetails["participant_id4"];
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
	        match_participant_id1:match_participant_id1Str,
	        match_participant_id2:match_participant_id2Str,
	        participant_id1:participant_id1Str,
	        participant_id2:participant_id2Str,
	        playerimage1:matchDetails["image_path"]+matchDetails["image1"],
	        playerimage2:matchDetails["image_path"]+matchDetails["image2"],
	        playerimage3:matchDetails["image_path"]+matchDetails["image3"],
	        playerimage4:matchDetails["image_path"]+matchDetails["image4"],
	        tabNo:tabNo,
	        innType:matchDetails["inn_type"],
	        jerseyColor1:matchDetails["jersey_color1"],
	        jerseyColor2:matchDetails["jersey_color2"]
	        
        }
    }
    $scope.addMatchDetails();
    
    $scope.team1Squad = [];    
    $scope.team2Squad = [];
    
    $scope.getTeamSquad = function(){

        db.transaction(function(tx) {
        	
			var getSquadQry = "SELECT * FROM "+matchSquadTable+" WHERE match_id = "+matchId;
			
			tx.executeSql(getSquadQry,[],function(tx, res) {
				
				var playersLength = res.rows.length;
				
		    	for(var assignLoop=0; assignLoop<playersLength; assignLoop++){
		    		
		    		var playerAttributes = res.rows.item(assignLoop).player_role.split(",");
		    		
		    		var playerRole = playerAttributes[0];
		    		
		    		var role_id = res.rows.item(assignLoop).team_role;
		    		
		    		if(playerAttributes.length == 4 && playerAttributes[3] == "yes"){
		    			playerRole = "Wicket Keeper";
		    			role_id = 5;
		    		}
		    		
		    		var jerseyNo = "0";
		    		
		    		if(res.rows.item(assignLoop).jersey_no != "undefined"){
		    			jerseyNo = res.rows.item(assignLoop).jersey_no;
		    		}
		    		
		    		var info={
	            			id:res.rows.item(assignLoop).player_id,
	            			No:jerseyNo,
	            			Name:res.rows.item(assignLoop).first_name+
	            				" "+res.rows.item(assignLoop).last_name,
	            			Role:playerRole,
	            			imageUrl:res.rows.item(assignLoop).player_image,
	            			done:false,
	            			position:teamRole[role_id-1],
	            			roleId:role_id
	            	};
		    		
//		    		alert("info.Name "+info.Name);
//		    		alert("info.Role "+info.Role);
//		    		alert("info.position "+info.position);
//		    		
//		    		alert("res.rows.item(assignLoop).match_participant_id "+res.rows.item(assignLoop).match_participant_id);
//		    		alert("$scope.details.match_participant_id1 "+$scope.details.match_participant_id1);
//		    		alert("$scope.details.match_participant_id2 "+$scope.details.match_participant_id2);
		    		
		    		if(res.rows.item(assignLoop).match_participant_id == $scope.details.match_participant_id1){
		    			info.jerseyColor = $scope.details.jerseyColor1; 
		        		$scope.team1Squad.push(info);
		    		}
		    		else{
		    			info.jerseyColor = $scope.details.jerseyColor2;
		        		$scope.team2Squad.push(info);
		    		}
		    		
		    	}
		    	
		    	var getPlayingXI = "SELECT * FROM "+fullScoreTable+
	    		" WHERE match_id = "+matchId+
	    		" AND innings_id = 1";
	    	
		    	tx.executeSql(getPlayingXI,[],function(tx, res) {
		    		
		    		$scope.team1PlayingXI = [];
		    		$scope.team2PlayingXI = [];
		    		
		    		for(var i=0;i<res.rows.length;i++){
		    			
		    			if(res.rows.item(i).match_participant_id == $scope.details.match_participant_id1){		    				
		    				for(var j=0; j<$scope.team1Squad.length;j++){
		    					if(res.rows.item(i).player_id == $scope.team1Squad[j].id)
		    						$scope.team1PlayingXI.push({"index":j})
		    				}
		    			}
		    			else{
		    				for(var j=0; j<$scope.team2Squad.length;j++){
		    					if(res.rows.item(i).player_id == $scope.team2Squad[j].id)
		    						$scope.team2PlayingXI.push({"index":j})
		    				}
		    			}
		    		}
		    		
		    	},errorHandler);
				
			},errorHandler);
		
    	},errorHandler);
    	
    }
    
    $scope.fullScoreInnings1 = {
    		teamName:"",
    		teamScore:"",
    		batsmanInfo:[],
    		bowlerInfo:[],
    		extras:"",
    		extraText:"",
    		total:"",
    		totalText:"",
    		dnb:"",
    		fow:"",
    		isBatting:1,
    		inningsNo:1
    }
    
    $scope.fullScoreInnings2 = {
    		teamName:"",
    		teamScore:"",
    		batsmanInfo:[],
    		bowlerInfo:[],
    		extras:"",
    		extraText:"",
    		total:"",
    		totalText:"",
    		dnb:"",
    		fow:"",
    		isBatting:1,
    		inningsNo:2
    }
    
    $scope.fullScoreInnings3 = {
    		teamName:"",
    		teamScore:"",
    		batsmanInfo:[],
    		bowlerInfo:[],
    		extras:"",
    		extraText:"",
    		total:"",
    		totalText:"",
    		dnb:"",
    		fow:"",
    		isBatting:1,
    		inningsNo:3
    }
    
    $scope.fullScoreInnings4 = {
    		teamName:"",
    		teamScore:"",
    		batsmanInfo:[],
    		bowlerInfo:[],
    		extras:"",
    		extraText:"",
    		total:"",
    		totalText:"",
    		dnb:"",
    		fow:"",
    		isBatting:1,
    		inningsNo:4
    }
    
    $scope.changeFullScoreInnings = function(innings) {
    	
    	$(".innings1").removeClass("active");
    	$(".innings2").removeClass("active");
    	$(".innings3").removeClass("active");
    	$(".innings4").removeClass("active");
    	
    	$(".fullScoreBatting").addClass("active");
    	$(".fullScoreBowling").removeClass("active");
    	
    	if(innings == 1){
    		$scope.fullScoreCurrentInnings = $scope.fullScoreInnings1;
    		$(".innings1").addClass("active");
    	}
    	else if(innings == 2){
    		$scope.fullScoreCurrentInnings = $scope.fullScoreInnings2;
    		$(".innings2").addClass("active");
    	}
    	else if(innings == 3){
    		$scope.fullScoreCurrentInnings = $scope.fullScoreInnings3;
    		$(".innings3").addClass("active");
    	}
    	else if(innings == 4){
    		$scope.fullScoreCurrentInnings = $scope.fullScoreInnings4;
    		$(".innings4").addClass("active");
    	}
    	
	}
    
    $scope.changeFullScoreBatting = function(isBatting) {
		
    	if(isBatting == 0){    	
    		$(".fullScoreBatting").removeClass("active");
    		$(".fullScoreBowling").addClass("active");
    	}
    	else{
    		$(".fullScoreBatting").addClass("active");
    		$(".fullScoreBowling").removeClass("active");
    	}
    	
    	$scope.fullScoreCurrentInnings.isBatting = isBatting;
    	
	}
    
    $scope.matchAttributes = {
    		tossWonBy:"0",
			tossDecision:"0",
			inningsCount:"0",
			isFollowing:"",
			totalOvers:"",
			isLastManBatting:"",
			result:"",
			matchStatus:"",
			momId:""
    };
    
    $scope.getMatchInfo = function(){
    	
    	if($scope.team1Squad.length == 0){
    		$scope.getTeamSquad();
    	}
    	
    	$scope.changeFullScoreInnings(1);

        db.transaction(function(tx) {
        	
        	var getMatchParticipants = "SELECT * FROM "+fullScoreInfoTable+
        		" WHERE match_id = "+matchId;
        	
        	tx.executeSql(getMatchParticipants,[],function(tx, res) {
        		
        		for(var i=0;i<res.rows.length;i++){
        			
        			matchParticipantIdArray[res.rows.item(i).innings_id] = res.rows.item(i).match_participant_id;
        			
        			var teamScore = "",
        				extras = 0,
    					extrasText = "",
    					total = 0,
    					totalText = "",
    					teamName = "";
        			
        			var overs;
        			
        			if(res.rows.item(i).team_overs == ""){
        				overs = "0.0";
        			}
        			else
        				overs = res.rows.item(i).team_overs;
        			
        			teamScore = res.rows.item(i).team_runs+"/"+
        				res.rows.item(i).team_wickets+"("+overs+" overs)";
        			
        			var extrasSplit = res.rows.item(i).extra_text.split(separater);
        			
        			var extrasSymbol = ["b","lb","nb","wd","pen"];
        			
        			if(res.rows.item(i).extra_text != ""){
        				
	        			for(var extrasLoop=0; extrasLoop < extrasSplit.length; extrasLoop++){
	        				
	        				extras = extras+parseInt(extrasSplit[extrasLoop]);
	        				
	        				if(extrasSplit[extrasLoop] != 0){
	        					if(extrasText == "")
	        						extrasText = extrasSymbol[extrasLoop]+" "+extrasSplit[extrasLoop];
	        					else
	        						extrasText = extrasText+","+extrasSymbol[extrasLoop]+" "+extrasSplit[extrasLoop];
	        				}
	        				
	        			}
	        			
	        			if(extrasText != ""){
	        				extrasText = "("+extrasText+")";
	        			}
        			
        			}
        			else{
        				extras = 0;
        				extrasText = "";
        			}
        			
        			total = res.rows.item(i).team_runs+"/"+
    					res.rows.item(i).team_wickets;
        			
        			var runRate;
        			runRate = runRateCalculation(res.rows.item(i).team_runs, overs);
        			
        			totalText = "(RR: "+runRate+","+overs+" Overs)";
        			
        			if(res.rows.item(i).match_participant_id == $scope.details.match_participant_id1){
        				teamName = $scope.details.playername1;
        			}
        			else{
        				teamName = $scope.details.playername2;
        			}
        			
        			if(teamName.length > 5 && $scope.matchAttributes.inningsCount == 2)
        				teamName = teamName.substring(0,5)+"...";
        			
        			if(res.rows.item(i).innings_id == 1){
        				
        				$scope.fullScoreInnings1.teamName = teamName;
        				$scope.fullScoreInnings1.total = total;
        				$scope.fullScoreInnings1.totalText = totalText;
        				$scope.fullScoreInnings1.extras = extras;
        				$scope.fullScoreInnings1.extraText = extrasText;
        				$scope.fullScoreInnings1.teamScore = teamScore;
        				
        			}
        			else if(res.rows.item(i).innings_id == 2){
        				
        				$scope.fullScoreInnings2.teamName = teamName;
        				$scope.fullScoreInnings2.total = total;
        				$scope.fullScoreInnings2.totalText = totalText;
        				$scope.fullScoreInnings2.extras = extras;
        				$scope.fullScoreInnings2.extraText = extrasText;
        				$scope.fullScoreInnings2.teamScore = teamScore;
        				
        			}
    				else if(res.rows.item(i).innings_id == 3){
        				
        				$scope.fullScoreInnings3.teamName = teamName;
        				$scope.fullScoreInnings3.total = total;
        				$scope.fullScoreInnings3.totalText = totalText;
        				$scope.fullScoreInnings3.extras = extras;
        				$scope.fullScoreInnings3.extraText = extrasText;
        				$scope.fullScoreInnings3.teamScore = teamScore;
        				
        			}
					else if(res.rows.item(i).innings_id == 4){
						
						$scope.fullScoreInnings4.teamName = teamName;
						$scope.fullScoreInnings4.total = total;
						$scope.fullScoreInnings4.totalText = totalText;
						$scope.fullScoreInnings4.extras = extras;
						$scope.fullScoreInnings4.extraText = extrasText;
						$scope.fullScoreInnings4.teamScore = teamScore;
						
					}
        			
        		}
        		
        	},errorHandler);
        	
        	var getFullScorePlayerInfo = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+matchId+
			" AND score.batting_bowling_order != 0"+
    		" ORDER BY innings_id,is_batting DESC,batting_bowling_order";
        	
        	tx.executeSql(getFullScorePlayerInfo,[],function(tx, res) {
        		
        		$scope.fullScoreInnings1.batsmanInfo = [];
        		$scope.fullScoreInnings2.batsmanInfo = [];
        		$scope.fullScoreInnings3.batsmanInfo = [];
        		$scope.fullScoreInnings4.batsmanInfo = [];
        		
        		$scope.fullScoreInnings1.bowlerInfo = [];
        		$scope.fullScoreInnings2.bowlerInfo = [];
        		$scope.fullScoreInnings3.bowlerInfo = [];
        		$scope.fullScoreInnings4.bowlerInfo = [];
        		
        		var fullScorePlayersCount = res.rows.length;
        		
        		for(var i=0; i<fullScorePlayersCount; i++){
        			
        			if(res.rows.item(i).is_batting == 1){
        				
        				var playerValues = {
        						name:res.rows.item(i).first_name+" "+res.rows.item(i).last_name,
		   		            	runs:res.rows.item(i).score_info_1,
		   		            	balls:res.rows.item(i).score_info_2,
		   		            	fours:res.rows.item(i).score_info_3,
		   		            	sixes:res.rows.item(i).score_info_4,
		   		            	SR:res.rows.item(i).score_info_5,
		   		            	outText:res.rows.item(i).out_text
        				};
        				
        				if(res.rows.item(i).innings_id == 1)
        					$scope.fullScoreInnings1.batsmanInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 2)
        					$scope.fullScoreInnings2.batsmanInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 3)
        					$scope.fullScoreInnings3.batsmanInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 4)
        					$scope.fullScoreInnings4.batsmanInfo.push(playerValues);
        				
        			}
        			else{
        				
        				var playerValues = {
        						name:res.rows.item(i).first_name+" "+res.rows.item(i).last_name,
        						overs:ballstoOver(res.rows.item(i).score_info_1),
        						maidens:res.rows.item(i).score_info_2,
        						runs:res.rows.item(i).score_info_3,
        						wickets:res.rows.item(i).score_info_4,
        						econ:res.rows.item(i).score_info_5
        				};
        				
        				if(res.rows.item(i).innings_id == 1)
        					$scope.fullScoreInnings1.bowlerInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 2)
        					$scope.fullScoreInnings2.bowlerInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 3)
        					$scope.fullScoreInnings3.bowlerInfo.push(playerValues);
        				else if(res.rows.item(i).innings_id == 4)
        					$scope.fullScoreInnings4.bowlerInfo.push(playerValues);
        				
        			}
        			
        		}
        		
        		var getDNB = "SELECT group_concat(first_name||' '||last_name) as DNB FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
				" ON squad.player_id = score.player_id " +
				" AND squad.match_id = score.match_id " +
				" AND squad.match_participant_id = score.match_participant_id WHERE" +
				" score.match_id = "+matchId+
				" AND score.batting_bowling_order = 0"+
				" AND score.is_batting = 1"+
				" AND score.innings_id = ";
        		
        		var getInnings1DNB = getDNB+"1";
        		var getInnings2DNB = getDNB+"2";
        		var getInnings3DNB = getDNB+"3";
        		var getInnings4DNB = getDNB+"4";
        		
        		var getFOW = "SELECT group_concat(fall_of_wickets) as FOW FROM "+fullScoreWicketTable+
        		" WHERE match_id = "+matchId+				
				" AND innings_id = ";
        		
        		var getInnings1FOW = getFOW+"1";
        		var getInnings2FOW = getFOW+"2";
        		var getInnings3FOW = getFOW+"3";
        		var getInnings4FOW = getFOW+"4";
        		
//        		var totalInnings = $scope.matchAttributes.inningsCount*2;
        		
        		tx.executeSql(getInnings1DNB,[],function(tx, res) {
        			$scope.fullScoreInnings1.dnb = res.rows.item(0).DNB;
        		},errorHandler);
        		tx.executeSql(getInnings2DNB,[],function(tx, res) {
        			$scope.fullScoreInnings2.dnb = res.rows.item(0).DNB;
        		},errorHandler);
        		tx.executeSql(getInnings3DNB,[],function(tx, res) {
        			$scope.fullScoreInnings3.dnb = res.rows.item(0).DNB;
        		},errorHandler);
        		tx.executeSql(getInnings4DNB,[],function(tx, res) {
        			$scope.fullScoreInnings4.dnb = res.rows.item(0).DNB;
        		},errorHandler);
        		
        		tx.executeSql(getInnings1FOW,[],function(tx, res) {
        			$scope.fullScoreInnings1.fow = res.rows.item(0).FOW;
        		},errorHandler);
        		tx.executeSql(getInnings2FOW,[],function(tx, res) {
        			$scope.fullScoreInnings2.fow = res.rows.item(0).FOW;
        		},errorHandler);
        		tx.executeSql(getInnings3FOW,[],function(tx, res) {
        			$scope.fullScoreInnings3.fow = res.rows.item(0).FOW;
        		},errorHandler);
        		tx.executeSql(getInnings4FOW,[],function(tx, res) {
        			$scope.fullScoreInnings4.fow = res.rows.item(0).FOW;
        		},errorHandler);
        		
        		
        	},errorHandler);
        	
        	
        	var getMatchAttributes = "SELECT * FROM "+matchAttributes+
        		" WHERE match_id = "+matchId;
        	
			tx.executeSql(getMatchAttributes,[],function(tx, res) {
			
				$scope.matchAttributes.tossWonBy = res.rows.item(0).toss_won_by;
				$scope.matchAttributes.tossDecision = res.rows.item(0).toss_decision;
				$scope.matchAttributes.inningsCount = res.rows.item(0).innings_count;
				$scope.matchAttributes.isFollowing = res.rows.item(0).is_following;
				$scope.matchAttributes.totalOvers = res.rows.item(0).total_overs;
				$scope.matchAttributes.isLastManBatting = res.rows.item(0).is_last_man_batting;
				$scope.matchAttributes.result = res.rows.item(0).result;
				$scope.matchAttributes.matchStatus = res.rows.item(0).match_status;
				
				syncScore();
				
				if(isAuthenticatedBool){
					
					if($scope.matchAttributes.matchStatus == "N"){
						$(".toss-details").removeClass("hide");
						$(".authentication").addClass("hide");
						
					}
					else if($scope.matchAttributes.matchStatus == "S"){
						
						$(".match-scoring-ballByBall").removeClass("hide");
						$(".match-attributes-section").addClass("hide");
						
						$scope.getBallInfo();
						
					}
					else if($scope.matchAttributes.matchStatus == "F"){
						
						if(currentTab == 2)
							changeTab(1);
						
						$scope.getBallInfo();
						hideTabTitle(2);
					}
				}
				
			},errorHandler);
		
    	},errorHandler);
    	
    }
    
    $scope.team1PlayingXI = [];    
    $scope.team2PlayingXI = [];
    
    $scope.showTeamAttributes = function() {
    	$(".playingXI-details").addClass("hide");
		$(".toss-details").removeClass("hide");
    }
    
    $scope.showTeamSquad = function() {
    	
    	if($scope.matchAttributes.tossWonBy == undefined 
    			|| $scope.matchAttributes.tossWonBy == ""
				|| $scope.matchAttributes.tossWonBy == 0){
    		alert("Choose the toss won team ");    		
    	}
    	
    	else if($scope.matchAttributes.tossDecision == undefined
    			|| $scope.matchAttributes.tossDecision == ""
				|| $scope.matchAttributes.tossDecision == 0){
    		alert("Choose the team decision");
    	}
    	
    	else if($scope.matchAttributes.inningsCount == undefined
				|| $scope.matchAttributes.inningsCount == ""
				|| $scope.matchAttributes.inningsCount == 0){
    		alert("Choose the innings type");
    	}
    	else if($scope.matchAttributes.inningsCount < 2 
    			&& $scope.matchAttributes.totalOvers ==0){
    		alert("Please enter the total overs");
    	}
    	else{
	    	$(".toss-details").addClass("hide");
	    	$(".playingXI-details").removeClass("hide");
    	}
    }
    
    var currentChoosenTeam = 1; // Current display squad
    
    $scope.changeTeams = function() {
    	
    	if(currentChoosenTeam == 1){
    		currentChoosenTeam = 2;
    		$(".team1Squad").addClass("hide");
    		$(".team2Squad").removeClass("hide");
    	}
    	else if(currentChoosenTeam == 2){
    		currentChoosenTeam = 1;
    		$(".team1Squad").removeClass("hide");
    		$(".team2Squad").addClass("hide");
    	}
	}
    
    $scope.addTeamPlayingXI = function (index){
    	
    	if(currentChoosenTeam == 1){
    		
    		if($scope.team1Squad[index].done){	    		
        		$scope.team1Squad[index].done = false
        		$scope.team1PlayingXI = [];
        		for(i=0;i<$scope.team1Squad.length;i++){       			
        			if($scope.team1Squad[i].done)
        				$scope.team1PlayingXI.push({"index":i});       			
        		}
        	}
    		else{
        		$scope.team1Squad[index].done = true;
        		$scope.team1PlayingXI.push({"index":index});
        	}
    		
    	}
    	else if(currentChoosenTeam == 2){
    		
    		if($scope.team2Squad[index].done){
        		$scope.team2Squad[index].done = false
        		$scope.team2PlayingXI = [];
        		for(i=0;i<$scope.team2Squad.length;i++){
        			if($scope.team2Squad[i].done)
        				$scope.team2PlayingXI.push({"index":i});
        		}
        	}
        	else{
        		$scope.team2Squad[index].done = true;
        		$scope.team2PlayingXI.push({"index":index});
        	}
    		
    	}
    }
    
    /*
     * Checking Weather one team playingXI in another team squad
     */
    $scope.checkingTeam1PlayingXI = function(id) {
    	
    	for(i=0;i<$scope.team1PlayingXI.length;i++){
			if($scope.team1Squad[$scope.team1PlayingXI[i].index].id == id)
				return true;
		}
    	return false;
	}
    
    $scope.checkingTeam2PlayingXI = function(id) {
    	
    	for(i=0;i<$scope.team2PlayingXI.length;i++){
			if($scope.team2Squad[$scope.team2PlayingXI[i].index].id == id)
				return true;
		}
    	return false;
	}
    
    $scope.sendTossDetails = function(){
    	
    	var team1Length = $scope.team1PlayingXI.length;    	
    	var team2Length = $scope.team2PlayingXI.length;
    	
    	if(team1Length < 2){
			alert("Please choose minimun 2 players in "+$scope.details.playername1);
		}
    	
		else if(team2Length < 2){
			alert("Please choose minimun 2 players in "+$scope.details.playername2);
		}
    	
		else {
			
			matchAttrJSON = {};
			playerAttrJSON = {};
			team1PlayersJSON = [];
			team2PlayersJSON = [];
			
			if($scope.matchAttributes.totalOvers == undefined
					&& $scope.matchAttributes.totalOvers == ""){
				$scope.matchAttributes.totalOvers = 0;
	    	}
			
			for(i=0;i<team1Length;i++){
		    	
	    		var playerId ={};
	    		
	    		playerId["playerid"] = $scope.team1Squad[$scope.team1PlayingXI[i].index].id;
	    		playerId["role_id"] = $scope.team1Squad[$scope.team1PlayingXI[i].index].roleId;
	    			
	  			team1PlayersJSON.push(playerId);
	    	}
	    	
	    	playerAttrJSON[$scope.details.match_participant_id1] = team1PlayersJSON;
	    	
	    	for(i=0;i<team2Length;i++){
	    	
	    		var playerId ={};
	    		
	    		playerId["playerid"] = $scope.team2Squad[$scope.team2PlayingXI[i].index].id;
	    		playerId["role_id"] = $scope.team2Squad[$scope.team2PlayingXI[i].index].roleId;
	    			
	  			team2PlayersJSON.push(playerId);
	    	}
	    	
	    	playerAttrJSON[$scope.details.match_participant_id2] = team2PlayersJSON;
	    	
	    	var is_last_man_batting;
	    	
	    	if($scope.matchAttributes.isLastManBatting)
				is_last_man_batting = 1;
			else
				is_last_man_batting = 0;
	    	
	    	if($scope.matchAttributes.inningsCount > 1){
	    		$scope.matchAttributes.inningsCount -=1
	    	}
	    	
	    	matchAttrJSON["toss_won_by_team"] = $scope.matchAttributes.tossWonBy;
			matchAttrJSON["result"] = "";
			matchAttrJSON["team_decision"] = $scope.matchAttributes.tossDecision;
			matchAttrJSON["total_overs"] = $scope.matchAttributes.totalOvers;
			matchAttrJSON["lastman_batting"] = is_last_man_batting;
			matchAttrJSON["inn_type"] = $scope.matchAttributes.inningsCount;
			
			matchAttrJSON["match_status"] = "S";
			matchAttrJSON["is_follow_on"] = "";
			matchAttrJSON["mom_id"] = "";
			
			sendToss();
		}
    }
    
    $scope.saveToss = function (){
    	
    	var battingTeam;
    	
    	var totalInnings;
    	
    	if($scope.details.participant_id1 == matchAttrJSON["toss_won_by_team"]){
			if(matchAttrJSON["team_decision"] == "Bat")
				battingTeam = "1";
			else
				battingTeam = "2";
		}
		else{
			if(matchAttrJSON["team_decision"] == "Bat")
				battingTeam = "2";
			else
				battingTeam = "1";
		}
    	
    	if($scope.matchAttributes.inningsCount == 1)
    		totalInnings = 2;
    	else if($scope.matchAttributes.inningsCount == 2)
    		totalInnings = 4;
		
		db.transaction(function(tx) {
			
			tx.executeSql("DELETE FROM "+matchAttributes+" WHERE match_id = "+matchId,[],function(){},errorHandler);
			tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);			
			tx.executeSql("DELETE FROM "+fullScoreInfoTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
			tx.executeSql("DELETE FROM "+fullScoreWicketTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);
			tx.executeSql("DELETE FROM "+ballbyballTable+" WHERE match_id = "+matchId,[],function(){},errorHandler);

			var insertMatchAttr = "INSERT INTO "+matchAttributes+
			" (match_id, toss_won_by, toss_decision,"+
			" innings_count, is_following, total_overs," +
			" is_last_man_batting, result," +
			" match_status, is_authenticated, mom_id)"+
			" VALUES "+
			"("+matchId+","+matchAttrJSON["toss_won_by_team"]+",'"+matchAttrJSON["team_decision"]+"',"+
			matchAttrJSON["inn_type"]+","+"0,"+matchAttrJSON["total_overs"]+","+
			matchAttrJSON["lastman_batting"]+",'','"+matchAttrJSON["match_status"]+"'," +isAuthenticatedInt+
			",0)";
			
			console.log(matchAttributes+" INSERTION ===> "+insertMatchAttr);
			
			tx.executeSql(insertMatchAttr,[],function(){},errorHandler);
			
			
			var matchFormat = "";
			
			if(matchAttrJSON["inn_type"] == 1 && matchAttrJSON["total_overs"] != 0){
				matchFormat = matchAttrJSON["total_overs"]+" over game";
			}
			else if(matchAttrJSON["inn_type"] == 1 && matchAttrJSON["total_overs"] == 0){
				matchFormat = "Test single innings";
			}
			else if(matchAttrJSON["inn_type"] == 2 && matchAttrJSON["total_overs"] == 0){
				matchFormat = "Test double innings";
			}
			
			var updateMatchFormat = "UPDATE "+matchesTableName+
				" SET match_format = '"+matchFormat+"'"+
				" WHERE match_id = "+matchId;
			
			tx.executeSql(updateMatchFormat,[],function(){},errorHandler);
			
			
			for(var inningsLoop = 1;inningsLoop < (totalInnings+1);inningsLoop++){
				
				var insertFullQry = "INSERT INTO "+fullScoreTable+
				"(match_id, innings_id, player_id, " +
				"match_participant_id, role_id, batting_bowling_order, score_info_1, " +
				"score_info_2, score_info_3, score_info_4, " +
				"score_info_5, is_batting, out_text, extra_count, bowler_dotballs) VALUES ";
				
				var valuesQry = "";
				
				for(var teamLoop = 0; teamLoop < 2; teamLoop++){
					
					var playersLength;
					var currentTeam;					
					var isbatting;					
					var extraText;
					
					if((inningsLoop%2) == 1){
						if(teamLoop == 0){
							currentTeam = battingTeam;
						}
						else{
							if(battingTeam == "1"){
								currentTeam = 2;
							}
							else{
								currentTeam = 1;
							}
						}
					}
					else{
						if(teamLoop == 0){
							if(battingTeam == "1"){
								currentTeam = 2;
							}
							else{
								currentTeam = 1;
							}
						}
						else{
							currentTeam = battingTeam;							
						}
					}
					
					if(teamLoop == 0){
						isbatting = 1;
						extraText='';
					}
					else{
						isbatting = 0;
						extraText='0'+separater+'0';
					}
					
					if(currentTeam == 1)
						playersLength = $scope.team1PlayingXI.length;
					else
						playersLength = $scope.team2PlayingXI.length;
					
					
					if(isbatting == 1){
						
						var insertFullInfoQry = "INSERT INTO "+fullScoreInfoTable+
						" (match_id, innings_id, match_participant_id, extra_text, team_runs, team_wickets, team_overs) VALUES";
						
						if(currentTeam == 1){
							insertFullInfoQry = insertFullInfoQry+
							" ("+matchId+","+inningsLoop+","+$scope.details.match_participant_id1+",'',0,0,'0.0')";
						}
						else{
							insertFullInfoQry = insertFullInfoQry+
							" ("+matchId+","+inningsLoop+","+$scope.details.match_participant_id2+",'',0,0,'0.0')";
						}
						
						console.log(fullScoreInfoTable+" INSERTION ===> "+insertFullInfoQry);
						tx.executeSql(insertFullInfoQry,[],function(){},errorHandler);
					
					}
					
					for(var playerLoop = 0;playerLoop < playersLength;playerLoop++){
						
						var valueStr = "";
						
						if(currentTeam == 1){
							
							valueStr = "("+matchId+","+inningsLoop+","+
							$scope.team1Squad[$scope.team1PlayingXI[playerLoop].index].id+","+
							$scope.details.match_participant_id1+","+
							$scope.team1Squad[$scope.team1PlayingXI[playerLoop].index].roleId+","+
							"0,'0','0','0','0','0',"+isbatting+",'','"+extraText+"',0)";
							
						}
						else{
							
							valueStr = "("+matchId+","+inningsLoop+","+
							$scope.team2Squad[$scope.team2PlayingXI[playerLoop].index].id+","+
							$scope.details.match_participant_id2+","+
							$scope.team2Squad[$scope.team2PlayingXI[playerLoop].index].roleId+","+
							"0,0,0,0,0,0,"+isbatting+",'','"+extraText+"',0)";
							
						}
						
						if(valuesQry == ""){
							valuesQry = valueStr;
						}
						else{
							valuesQry = valuesQry+","+valueStr;
						}
						
					}
					
					if(teamLoop == 1 && valuesQry != ""){
						console.log(fullScoreTable+" INSERTION ===> "+insertFullQry + valuesQry);
						tx.executeSql(insertFullQry + valuesQry,[], function(tx, res) {
                        }, errorHandler);
					}
	            }
			}
			

			$(".match-scoring-ballByBall").removeClass("hide");
			$(".match-attributes-section").addClass("hide");
			$scope.getMatchInfo();
			$scope.nextBallCalculation(1, 0, 0);
            
        }, errorHandler);
    	
    }
    
    
    
    $scope.getBallInfo = function (){
    	
    	$scope.matchBallInfo={
        		
    			team1Innings1Runs:"",
    			team1Innings1Wickets:"",
    			team1Innings1Overs:"",
    			team1Innings1RR:"",
    			
    			team1Innings2Runs:"",
    			team1Innings2Wickets:"",
    			team1Innings2Overs:"",
    			team1Innings2RR:"",
    			
    			team2Innings1Runs:"",
    			team2Innings1Wickets:"",
    			team2Innings1Overs:"",
    			team2Innings1RR:"",
    			
    			team2Innings2Runs:"",
    			team2Innings2Wickets:"",
    			team2Innings2Overs:"",
    			team2Innings2RR:"",
    			
    			matchStatus:"",
    			requiredRunRate:"",
    			
    			strikerId:"",
    			strikerName:"",
    			strikerImage:"",
    			strikerRuns:"",
    			strikerBalls:"",
    			striker4s:"",
    			striker6s:"",
    			
    			nonStrikerId:"",
    			nonStrikerName:"",
    			nonStrikerImage:"",
    			nonStrikerRuns:"",
    			nonStrikerBalls:"",
    			nonStriker4s:"",
    			nonStriker6s:"",
    			
    			bowlerId:"",
    			bowlerName:"",
    			bowlerImage:"",
    			bowlerRuns:"",
    			bowlerWickets:"",
    			bowlerOvers:"",
    			bowlerMaidens:"",
    			bowlerBalls:"",
    			bowlerDotBalls:"",
    			
    			thisOverInfo:[],
    		
    			currentInnings:0,
    			currentOver:"",
    			currentBall:"",
    			ballUnique:"",
    			
    			currTeamRuns:"",
    			currTeamWickets:"",
    			requiredRuns:"",
    			remainingBalls:"",
    			
    			currInningsExtraStr:"",		
    			currMatchParticipantId:"",
    			
    			thisOverStr:"",
    			
    			battingTeamName:"",
    			battingTeamImage:"",
    			battingTeamJersey:"",
    			
    			battingInnings1Runs:"",
    			battingInnings1Wickets:"",
    			battingInnings1Overs:"",
    			battingInnings1RR:"",
    			
    			battingInnings2Runs:"",
    			battingInnings2Wickets:"",
    			battingInnings2Overs:"",
    			battingInnings2RR:"",
    			
    			bowlingTeamName:"",
    			bowlingTeamImage:"",
    			bowlingTeamJersey:"",
    			
    			bowlingInnings1Runs:"",
    			bowlingInnings1Wickets:"",
    			bowlingInnings1Overs:"",
    			bowlingInnings1RR:"",
    			
    			bowlingInnings2Runs:"",
    			bowlingInnings2Wickets:"",
    			bowlingInnings2Overs:"",
    			bowlingInnings2RR:""
    		};
    	
//    	$scope.momOptions();
//		hideOtherContent();
//		showOtherContent("manoftheMatchList");
//    	$scope.matchEnd("");
    	
    	db.transaction(function(tx) {
    		
    		var totalInnings = $scope.matchAttributes.inningsCount*2;
    		
    		var getBallbyBallInfo = "SELECT * FROM "+ballbyballTable+" WHERE match_id="+matchId+" AND is_updated=0";
    		
    		tx.executeSql(getBallbyBallInfo,[],function(tx,res){
    			
    			if(res.rows.length > 0)
                {	
                	$scope.matchBallInfo.currentInnings = res.rows.item(0).innings_id;
                	$scope.matchBallInfo.currentOver = res.rows.item(0).over_id;
                	$scope.matchBallInfo.currentBall = res.rows.item(0).ball_id;
                	$scope.matchBallInfo.ballUnique = res.rows.item(0).ball_unique;
                	$scope.matchBallInfo.strikerId = res.rows.item(0).striker_id;
                	$scope.matchBallInfo.nonStrikerId = res.rows.item(0).non_striker_id;
                	$scope.matchBallInfo.bowlerId = res.rows.item(0).bowler_id;
                	
                	$scope.matchBallInfo.currTeamRuns = res.rows.item(0).curr_team_runs;
                	$scope.matchBallInfo.currTeamWickets = res.rows.item(0).curr_team_wickets;
                	$scope.matchBallInfo.requiredRuns = res.rows.item(0).required_runs;
                	$scope.matchBallInfo.remainingBalls = res.rows.item(0).remaining_balls;
                	
                	$scope.matchBallInfo.thisOverStr = res.rows.item(0).this_over;
                	
                	
                	$scope.nextBallInfo.inningsId = $scope.matchBallInfo.currentInnings;
                	$scope.nextBallInfo.overId = $scope.matchBallInfo.currentOver;
                	$scope.nextBallInfo.ballId = $scope.matchBallInfo.currentBall;
                	$scope.nextBallInfo.ballUnique = $scope.matchBallInfo.ballUnique;
                	$scope.nextBallInfo.strikerId = $scope.matchBallInfo.strikerId;
                	$scope.nextBallInfo.nonStrikerId = $scope.matchBallInfo.nonStrikerId;
                	$scope.nextBallInfo.bowlerId = $scope.matchBallInfo.bowlerId;
                	$scope.nextBallInfo.currTeamRuns = $scope.matchBallInfo.currTeamRuns;
                	$scope.nextBallInfo.currTeamWicket = $scope.matchBallInfo.currTeamWickets;
                	$scope.nextBallInfo.requiredRuns = $scope.matchBallInfo.requiredRuns;
                	$scope.nextBallInfo.remainingBalls = $scope.matchBallInfo.remainingBalls;
                	$scope.nextBallInfo.thisOver = $scope.matchBallInfo.thisOverStr;
                	
                	if($scope.nextBallInfo.nonStrikerId != 0)                	
                		$scope.nextBallInfo.isLastManBatting = 0;
                	else
                		$scope.nextBallInfo.isLastManBatting = 1;
                	
                	$scope.nextBallInfo.lastBowlerId = $scope.matchBallInfo.bowlerId;
                	
                	
                	if($scope.matchBallInfo.currentInnings == totalInnings 
                			&& $scope.matchAttributes.totalOvers != 0){                		
                		$scope.matchBallInfo.requiredRunRate = (($scope.matchBallInfo.requiredRuns/$scope.matchBallInfo.remainingBalls)*6).toFixed(2);                		
                	}
                	
                	$scope.matchBallInfo.thisOverInfo = [];
                	
                	var thisOver = res.rows.item(0).this_over.split(separater);
                	var ballLength = 0;
                	var thisOverLength = thisOver.length;
                	
                	if(res.rows.item(0).this_over == ""){
                		ballLength = 6;
                	}
                	else{
                		var remainingBalls = 6-$scope.matchBallInfo.currentBall;
                		ballLength = thisOverLength + remainingBalls;
                	}
                	
                	for(var i=0;i<ballLength;i++){                		
                		var runs={};                		
                		if(i<thisOverLength)                		
                			runs["runs"] = thisOver[i];
                		else
                			runs["runs"] = '';                		
                		$scope.matchBallInfo.thisOverInfo.push(runs);                		
                	}
                	
                	var strikerInfoQry = 
                	"SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
        			" ON squad.player_id = score.player_id " +
        			" AND squad.match_id = score.match_id " +
        			" AND squad.match_participant_id = score.match_participant_id WHERE" +
        			" score.match_id = "+matchId+
        			" AND score.innings_id = "+$scope.matchBallInfo.currentInnings+
        			" AND squad.player_id = "+$scope.matchBallInfo.strikerId;
                	
                	console.log(" Striker Info ====> "+strikerInfoQry);
                	
                	tx.executeSql(strikerInfoQry,[],function(tx,res){
                		
                		if(res.rows.length > 0)
                        {	
                        	$scope.matchBallInfo.strikerName = res.rows.item(0).first_name+res.rows.item(0).last_name;
                        	$scope.matchBallInfo.strikerImage = res.rows.item(0).player_image;
                        	$scope.matchBallInfo.strikerRuns = res.rows.item(0).score_info_1;
                        	$scope.matchBallInfo.strikerBalls = res.rows.item(0).score_info_2;
                        	$scope.matchBallInfo.striker4s = res.rows.item(0).score_info_3;
                        	$scope.matchBallInfo.striker6s = res.rows.item(0).score_info_4;
                        	$scope.matchBallInfo.strikerSR = res.rows.item(0).score_info_5;
                        	
                        	if($scope.matchBallInfo.strikerName.length > 10){
                        		$scope.matchBallInfo.strikerName = $scope.matchBallInfo.strikerName.substring(0,7)+"...";
                        	}
                        	
                        }
                		
                	},errorHandler);
                	
                	var nonStrikerInfoQry = 
                	"SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
        			" ON squad.player_id = score.player_id " +
        			" AND squad.match_id = score.match_id " +
        			" AND squad.match_participant_id = score.match_participant_id WHERE" +
        			" score.match_id = "+matchId+
        			" AND score.innings_id = "+$scope.matchBallInfo.currentInnings+
        			" AND squad.player_id = "+$scope.matchBallInfo.nonStrikerId;
                	
                	console.log(" Non Striker Info ====> "+nonStrikerInfoQry);
                	
                	tx.executeSql(nonStrikerInfoQry,[],function(tx,res){
                		
                		if(res.rows.length > 0)
                        {	
                        	$scope.matchBallInfo.nonStrikerName = res.rows.item(0).first_name+res.rows.item(0).last_name;
                        	$scope.matchBallInfo.nonStrikerImage = res.rows.item(0).player_image;
                        	$scope.matchBallInfo.nonStrikerRuns = res.rows.item(0).score_info_1;
                        	$scope.matchBallInfo.nonStrikerBalls = res.rows.item(0).score_info_2;
                        	$scope.matchBallInfo.nonStriker4s = res.rows.item(0).score_info_3;
                        	$scope.matchBallInfo.nonStriker6s = res.rows.item(0).score_info_4;
                        	$scope.matchBallInfo.nonStrikerSR = res.rows.item(0).score_info_5;
                        	
                        	if($scope.matchBallInfo.nonStrikerName.length > 10){
                        		$scope.matchBallInfo.nonStrikerName = $scope.matchBallInfo.nonStrikerName.substring(0,7)+"...";
                        	}
                        }
                		
                	},errorHandler);
                    	
                	var bowlerInfoQry = 
                	"SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
        			" ON squad.player_id = score.player_id " +
        			" AND squad.match_id = score.match_id " +
        			" AND squad.match_participant_id = score.match_participant_id WHERE" +
        			" score.match_id = "+matchId+
        			" AND score.innings_id = "+$scope.matchBallInfo.currentInnings+
        			" AND squad.player_id = "+$scope.matchBallInfo.bowlerId;
                	
                	console.log(" Bowler Info ====> "+bowlerInfoQry);
                	
                	tx.executeSql(bowlerInfoQry,[],function(tx,res){
                		
                		if(res.rows.length > 0)
                        {	
                        	$scope.matchBallInfo.bowlerName = res.rows.item(0).first_name+res.rows.item(0).last_name;
                        	$scope.matchBallInfo.bowlerImage = res.rows.item(0).player_image;
                        	
//                        	var oversFloat = parseInt(res.rows.item(0).score_info_1);
//                        	var overs = parseInt(oversFloat/6);
//                        	var balls = oversFloat%6;
//                        	var combinedOvers = overs+"."+balls;
                        	                        	
                        	$scope.matchBallInfo.bowlerOvers = ballstoOver(res.rows.item(0).score_info_1);
                        	$scope.matchBallInfo.bowlerMaidens = res.rows.item(0).score_info_2;
                        	$scope.matchBallInfo.bowlerRuns = res.rows.item(0).score_info_3;
                        	$scope.matchBallInfo.bowlerWickets = res.rows.item(0).score_info_4;
                        	$scope.matchBallInfo.bowlerEcon = res.rows.item(0).score_info_5;
                        	
                        	$scope.matchBallInfo.bowlerBalls = res.rows.item(0).score_info_1;
                        	$scope.matchBallInfo.bowlerextras = res.rows.item(0).extra_count;
                        	
                        	$scope.matchBallInfo.bowlerDotBalls = res.rows.item(0).bowler_dotballs;
                        	
                        	if($scope.matchBallInfo.bowlerName.length > 10){
                        		$scope.matchBallInfo.bowlerName = $scope.matchBallInfo.bowlerName.substring(0,7)+"...";
                        	}
                        	
                        }
                		
                	},errorHandler);
                	
                	
                	var matchInfoQry = 
                    	"SELECT * FROM "+fullScoreInfoTable+ " WHERE"+
            			" match_id = "+matchId;
                    	
                	console.log(" Match Info ====> "+matchInfoQry);
                    	
                	tx.executeSql(matchInfoQry,[],function(tx,res){
                    		
                		if(res.rows.length > 0)
                        {	
                			for(var infoLoop=0; infoLoop < res.rows.length; infoLoop++){
                    				
                				if(res.rows.item(infoLoop).innings_id <= totalInnings 
                						&& $scope.matchBallInfo.currentInnings >= res.rows.item(infoLoop).innings_id){
                					
                					if(res.rows.item(infoLoop).match_participant_id == $scope.details.match_participant_id1){
                    					
                						if(res.rows.item(infoLoop).innings_id <= 2){
                						
	                						$scope.matchBallInfo.team1Innings1Runs = res.rows.item(infoLoop).team_runs;
	                						$scope.matchBallInfo.team1Innings1Wickets = res.rows.item(infoLoop).team_wickets;
	                						$scope.matchBallInfo.team1Innings1Overs = res.rows.item(infoLoop).team_overs;
	                						$scope.matchBallInfo.team1Innings1RR = runRateCalculation($scope.matchBallInfo.team1Innings1Runs,$scope.matchBallInfo.team1Innings1Overs);
                						
                						}
                						else{
                							
                							$scope.matchBallInfo.team1Innings2Runs = res.rows.item(infoLoop).team_runs;
	                						$scope.matchBallInfo.team1Innings2Wickets = res.rows.item(infoLoop).team_wickets;
	                						$scope.matchBallInfo.team1Innings2Overs = res.rows.item(infoLoop).team_overs;
	                						$scope.matchBallInfo.team1Innings2RR = runRateCalculation($scope.matchBallInfo.team1Innings2Runs,$scope.matchBallInfo.team1Innings2Overs);
                							
                						}
                						
//                						alert("$scope.matchBallInfo.team1Innings1Runs "+$scope.matchBallInfo.team1Innings1Runs);
//                						alert("$scope.matchBallInfo.team1Innings1Wickets "+$scope.matchBallInfo.team1Innings1Wickets);
//                						alert("$scope.matchBallInfo.team1Innings1Overs "+$scope.matchBallInfo.team1Innings1Overs);
//                						alert("$scope.matchBallInfo.team1Innings1RR "+$scope.matchBallInfo.team1Innings1RR);
//                						
//                						alert("$scope.matchBallInfo.team1Innings2Runs "+$scope.matchBallInfo.team1Innings2Runs);
//                						alert("$scope.matchBallInfo.team1Innings2Wickets "+$scope.matchBallInfo.team1Innings2Wickets);
//                						alert("$scope.matchBallInfo.team1Innings2Overs "+$scope.matchBallInfo.team1Innings2Overs);
//                						alert("$scope.matchBallInfo.team1Innings2RR "+$scope.matchBallInfo.team1Innings2RR);

                					}
                					else{
                						
                						if(res.rows.item(infoLoop).innings_id <= 2){
                    						
	                						$scope.matchBallInfo.team2Innings1Runs = res.rows.item(infoLoop).team_runs;
	                						$scope.matchBallInfo.team2Innings1Wickets = res.rows.item(infoLoop).team_wickets;
	                						$scope.matchBallInfo.team2Innings1Overs = res.rows.item(infoLoop).team_overs;
	                						$scope.matchBallInfo.team2Innings1RR = runRateCalculation($scope.matchBallInfo.team2Innings1Runs,$scope.matchBallInfo.team2Innings1Overs);
                						
                						}
                						else{
                							
                							$scope.matchBallInfo.team2Innings2Runs = res.rows.item(infoLoop).team_runs;
	                						$scope.matchBallInfo.team2Innings2Wickets = res.rows.item(infoLoop).team_wickets;
	                						$scope.matchBallInfo.team2Innings2Overs = res.rows.item(infoLoop).team_overs;
	                						$scope.matchBallInfo.team2Innings2RR = runRateCalculation($scope.matchBallInfo.team2Innings2Runs,$scope.matchBallInfo.team2Innings2Overs);
                							
                						}
                						
//                						alert("$scope.matchBallInfo.team2Innings1Runs "+$scope.matchBallInfo.team2Innings1Runs);
//                						alert("$scope.matchBallInfo.team2Innings1Wickets "+$scope.matchBallInfo.team2Innings1Wickets);
//                						alert("$scope.matchBallInfo.team2Innings1Overs "+$scope.matchBallInfo.team2Innings1Overs);
//                						alert("$scope.matchBallInfo.team2Innings1RR "+$scope.matchBallInfo.team2Innings1RR);
//                						
//                						alert("$scope.matchBallInfo.team2Innings2Runs "+$scope.matchBallInfo.team2Innings2Runs);
//                						alert("$scope.matchBallInfo.team2Innings2Wickets "+$scope.matchBallInfo.team2Innings2Wickets);
//                						alert("$scope.matchBallInfo.team2Innings2Overs "+$scope.matchBallInfo.team2Innings2Overs);
//                						alert("$scope.matchBallInfo.team2Innings2RR "+$scope.matchBallInfo.team2Innings2RR);
                						
                					}
                    					
                				}
                				
                				var currTeamName;
                				
                				if($scope.matchBallInfo.currentInnings == res.rows.item(infoLoop).innings_id){
                					
                					$scope.matchBallInfo.currInningsExtraStr = res.rows.item(infoLoop).extra_text;
                					$scope.matchBallInfo.currMatchParticipantId = res.rows.item(infoLoop).match_participant_id;
                					$scope.keeperId = res.rows.item(infoLoop).keeper_id;
                					
                					if(res.rows.item(infoLoop).match_participant_id == $scope.details.match_participant_id1)
                						currTeamName = $scope.details.playername1;
            						else
            							currTeamName = $scope.details.playername2;
                					
                				}
                				
                				if($scope.matchBallInfo.currentInnings == totalInnings){
                					
        							if($scope.matchAttributes.totalOvers != 0){
            							$scope.matchBallInfo.matchStatus = currTeamName+
            							" need "+ $scope.matchBallInfo.requiredRuns +" runs from "+
            		                	$scope.matchBallInfo.remainingBalls +" balls";
        							}
        							else{
        								$scope.matchBallInfo.matchStatus = currTeamName+
            							" need "+ $scope.matchBallInfo.requiredRuns +" runs ";
        							}
        							
        						}                							
    							else if($scope.matchBallInfo.currentInnings > 1 && totalInnings == 4){
    								
        							if($scope.matchBallInfo.requiredRuns > 0)                							
            							$scope.matchBallInfo.matchStatus = currTeamName+
            							" trail by "+ $scope.matchBallInfo.requiredRuns +" runs ";
        							else
        								$scope.matchBallInfo.matchStatus = currTeamName+
            							" lead by "+ ($scope.matchBallInfo.requiredRuns*-1) +" runs ";
        							
        						}
                    				
                			}
                			
                			
                			if($scope.matchBallInfo.currMatchParticipantId == $scope.details.match_participant_id1){
                				
                				$scope.matchBallInfo.battingTeamName = $scope.details.playername1;
                				$scope.matchBallInfo.battingTeamImage = $scope.details.playerimage1;
                				$scope.matchBallInfo.battingTeamJersey = $scope.details.jerseyColor1;
                				
                				$scope.matchBallInfo.battingInnings1Runs = $scope.matchBallInfo.team1Innings1Runs;
                				$scope.matchBallInfo.battingInnings1Wickets = $scope.matchBallInfo.team1Innings1Wickets;
                				$scope.matchBallInfo.battingInnings1Overs = $scope.matchBallInfo.team1Innings1Overs;
                				$scope.matchBallInfo.battingInnings1RR = $scope.matchBallInfo.team1Innings1RR;
                				
                				$scope.matchBallInfo.battingInnings2Runs = $scope.matchBallInfo.team1Innings2Runs;
                				$scope.matchBallInfo.battingInnings2Wickets = $scope.matchBallInfo.team1Innings2Wickets;
                				$scope.matchBallInfo.battingInnings2Overs = $scope.matchBallInfo.team1Innings2Overs;
                				$scope.matchBallInfo.battingInnings2RR = $scope.matchBallInfo.team1Innings2RR;
                				
                				
                				$scope.matchBallInfo.bowlingTeamName = $scope.details.playername2;
                				$scope.matchBallInfo.bowlingTeamImage = $scope.details.playerimage3;
                				$scope.matchBallInfo.bowlingTeamJersey = $scope.details.jerseyColor2;
                				
                				$scope.matchBallInfo.bowlingInnings1Runs = $scope.matchBallInfo.team2Innings1Runs;
                				$scope.matchBallInfo.bowlingInnings1Wickets = $scope.matchBallInfo.team2Innings1Wickets;
                				$scope.matchBallInfo.bowlingInnings1Overs = $scope.matchBallInfo.team2Innings1Overs;
                				$scope.matchBallInfo.bowlingInnings1RR = $scope.matchBallInfo.team2Innings1RR;
                				
                				$scope.matchBallInfo.bowlingInnings2Runs = $scope.matchBallInfo.team2Innings2Runs;
                				$scope.matchBallInfo.bowlingInnings2Wickets = $scope.matchBallInfo.team2Innings2Wickets;
                				$scope.matchBallInfo.bowlingInnings2Overs = $scope.matchBallInfo.team2Innings2Overs;
                				$scope.matchBallInfo.bowlingInnings2RR = $scope.matchBallInfo.team2Innings2RR;
                				
                			}
                			else{
                				
                				$scope.matchBallInfo.battingTeamName = $scope.details.playername2;
                				$scope.matchBallInfo.battingTeamImage = $scope.details.playerimage3;
                				$scope.matchBallInfo.battingTeamJersey = $scope.details.jerseyColor2;
                				
                				$scope.matchBallInfo.battingInnings1Runs = $scope.matchBallInfo.team2Innings1Runs;
                				$scope.matchBallInfo.battingInnings1Wickets = $scope.matchBallInfo.team2Innings1Wickets;
                				$scope.matchBallInfo.battingInnings1Overs = $scope.matchBallInfo.team2Innings1Overs;
                				$scope.matchBallInfo.battingInnings1RR = $scope.matchBallInfo.team2Innings1RR;
                				
                				$scope.matchBallInfo.battingInnings2Runs = $scope.matchBallInfo.team2Innings2Runs;
                				$scope.matchBallInfo.battingInnings2Wickets = $scope.matchBallInfo.team2Innings2Wickets;
                				$scope.matchBallInfo.battingInnings2Overs = $scope.matchBallInfo.team2Innings2Overs;
                				$scope.matchBallInfo.battingInnings2RR = $scope.matchBallInfo.team2Innings2RR;
                				
                				
                				$scope.matchBallInfo.bowlingTeamName = $scope.details.playername1;
                				$scope.matchBallInfo.bowlingTeamImage = $scope.details.playerimage1;
                				$scope.matchBallInfo.bowlingTeamJersey = $scope.details.jerseyColor1;
                				
                				$scope.matchBallInfo.bowlingInnings1Runs = $scope.matchBallInfo.team1Innings1Runs;
                				$scope.matchBallInfo.bowlingInnings1Wickets = $scope.matchBallInfo.team1Innings1Wickets;
                				$scope.matchBallInfo.bowlingInnings1Overs = $scope.matchBallInfo.team1Innings1Overs;
                				$scope.matchBallInfo.bowlingInnings1RR = $scope.matchBallInfo.team1Innings1RR;
                				
                				$scope.matchBallInfo.bowlingInnings2Runs = $scope.matchBallInfo.team1Innings2Runs;
                				$scope.matchBallInfo.bowlingInnings2Wickets = $scope.matchBallInfo.team1Innings2Wickets;
                				$scope.matchBallInfo.bowlingInnings2Overs = $scope.matchBallInfo.team1Innings2Overs;
                				$scope.matchBallInfo.bowlingInnings2RR = $scope.matchBallInfo.team1Innings2RR;
                				
                			}
                            	
                        }
                		
                		if($scope.matchBallInfo.currentInnings == 1){
                			
                			var tossWonTeam = "";
                			
                			if($scope.matchAttributes.tossWonBy == $scope.details.participant_id1){
                				tossWonTeam = $scope.details.playername1;
                			}
                			else{
                				tossWonTeam = $scope.details.playername2;
                			}
                			
                			$scope.matchBallInfo.matchStatus = tossWonTeam+
							" won the toss and elected to "+ $scope.matchAttributes.tossDecision;
                			
                		}
                		
	    				var checkDeclare = "SELECT is_declare FROM "+fullScoreInfoTable+
    						" WHERE innings_id = "+$scope.matchBallInfo.currentInnings;
	    				
	    				tx.executeSql(checkDeclare,[], function(tx, res){
							if(res.rows.length > 0){
								if(res.rows.item(0).is_declare == 1){
									$scope.inningsEnd();
								}
							}
	    				},errorHandler);
                		
                		$scope.$apply();
                    		
                	},errorHandler);
                	
                }
    			else{
    				
    				var getLastBallInfo = "SELECT * FROM "+ballbyballTable+" WHERE match_id="+matchId+" ORDER BY innings_id DESC,ball_unique DESC";
    	    		
    	    		tx.executeSql(getLastBallInfo,[],function(tx,res){

    	    			if(res.rows.length > 0){
    	    				
//    	    				alert("res.rows.item(0).innings_id "+res.rows.item(0).innings_id);
//    	    				alert("res.rows.item(0).ball_unique "+res.rows.item(0).ball_unique);
//    	    				alert("res.rows.item(0).ballUnique "+res.rows.item(0).ballUnique);
//    	    				alert("res.rows.length "+res.rows.length);
//    	    				alert("res.rows.item(1).ballUnique "+res.rows.item(1).ballUnique);
    	    				
    	    				var inningsId = res.rows.item(0).innings_id;
    	    				var ballUnique = res.rows.item(0).ball_unique;
    	    				
    	    				var isWicket = res.rows.item(0).is_wicket;
    	    				
    	    				var currTeamWickets = res.rows.item(0).curr_team_wickets;
    	    				
//    	    				var checkDeclare = "SELECT is_declare FROM "+fullScoreInfoTable+
//    	    					" WHERE innings_id = "+inningsId;
//    	    				
//    	    				tx.executeSql(checkDeclare,[], function(tx, res){
//    	    					
//    							if(res.rows.length > 0){
//    								
//									if(res.rows.item(0).is_declare == 1){
//										
//										$scope.inningsEnd();
//										
//									}
//									else{
										
										if(isWicket == 1){
				    						
				    						var getOutBatsmanId = " SELECT batsman_id FROM "+fullScoreWicketTable+
				    							" WHERE match_id = "+matchId+
				    							" AND innings_id = "+inningsId+
				    							" AND wicket_number = "+currTeamWickets;
				    						
				    						tx.executeSql(getOutBatsmanId,[], function(tx, res){
				    							
				    							if(res.rows.length > 0){
				    								$scope.nextBallCalculation(
				    										inningsId,
				    										ballUnique,
				    										res.rows.item(0).batsman_id);
				    							}
				    							
				    						}, errorHandler);
				    						
				    					}
				    					else{					 
				    						$scope.nextBallCalculation(
				    								inningsId,
													ballUnique,
				    								0);
				    					}
										
//									}
//									
//    							}
//    							
//    						}, errorHandler);
		    					
    	    			}
    	    			else{
    	    				$scope.nextBallCalculation(1,0,0);
    	    			}
    	    			
    	    		},errorHandler);
    			}
    			
    		},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.updateRuns = function (batsmanRuns,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,0,0,0,0,0,0,thisOverText);
    	hideOtherContent();
    }
    
    $scope.updateExtras = function (batsmanRuns,extraRuns,extraType,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,extraRuns,extraType,0,0,0,0,thisOverText);
    	hideOtherContent();
    }
    
    $scope.updateWickets = function (batsmanRuns,extraRuns,extraType,wicketType,outBatsmanId,fielderIds,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,extraRuns,extraType,1,wicketType,outBatsmanId,fielderIds,thisOverText);
    	hideOtherContent();
    }
    
    $scope.updateBalldetails = function (batsmanRuns,extraRuns,extraType,
    		isWicket,wicketType,outBatsmanId,fielderIds,thisOverText){
    	
    	var teamRuns,teamWickets,teamBall,teamRequired,teamRemaining;
    	
    	var updateBallQryFirstPart = "UPDATE "+ballbyballTable+" SET ";
    	var updateBallQryLastPart = " WHERE ball_unique = "+$scope.matchBallInfo.ballUnique+
	    	" AND innings_id = "+$scope.matchBallInfo.currentInnings+
			" AND match_id = "+matchId;
    	
    	var updateBallQryValuesPart = "";
    	
    	if(extraType != 3 && extraType != 4){
    		teamBall = ($scope.matchBallInfo.currentBall+1);
    	}
    	else{
    		teamBall = ($scope.matchBallInfo.currentBall);
    	}
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"ball_id = "+teamBall+", ";
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"batsman_runs = "+batsmanRuns+", ";
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_runs = "+extraRuns+", ";
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_type = "+extraType+", ";
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"is_wicket = "+isWicket+", ";
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"is_updated = 1, ";
    	
    	teamRuns = ($scope.matchBallInfo.currTeamRuns+batsmanRuns+extraRuns); 
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_runs = "+teamRuns+", ";
    	
    	if(isWicket == 1){
    		teamWickets = ($scope.matchBallInfo.currTeamWickets+1);
    	}
    	else{
    		teamWickets = ($scope.matchBallInfo.currTeamWickets);
    	}
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_wickets = "+teamWickets+", ";
    	
    	
    	
//    	if($scope.matchBallInfo.requiredRuns > 0){
    		teamRequired = ($scope.matchBallInfo.requiredRuns-(batsmanRuns+extraRuns));
//    	}
//    	else{
//    		teamRequired = 0;
//    	}
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"required_runs = "+teamRequired+", ";
    	
    	if($scope.matchBallInfo.remainingBalls > 0 && extraType < 3){
    		teamRemaining = ($scope.matchBallInfo.remainingBalls - 1);
    	}
    	else{
    		teamRemaining = $scope.matchBallInfo.remainingBalls;
    	}
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"remaining_balls = "+teamRemaining+", ";
    	
    	var thisOverValue = $scope.matchBallInfo.thisOverStr;
    	
    	if(thisOverValue == "")
    		thisOverValue = thisOverText;
    	else
    		thisOverValue = thisOverValue+separater+thisOverText;
    	
    	updateBallQryValuesPart = updateBallQryValuesPart+"this_over = '"
		+thisOverValue+"' ";
    	
    	
    	
    	
    	
    	var strikerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
    	var strikerUpdateQryLastPart = " WHERE player_id = "+$scope.matchBallInfo.strikerId+
    		" AND innings_id = "+$scope.matchBallInfo.currentInnings+
    		" AND match_id = "+matchId;
    	
    	var strikerUpdateQryValuesPart = "";
    	
    	var strikerRuns = parseInt($scope.matchBallInfo.strikerRuns)+batsmanRuns;
    	
    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_1 = '"+strikerRuns+"', ";
    	
    	var strikerBalls = parseInt($scope.matchBallInfo.strikerBalls);
    	
    	if(extraType != 4)
    		strikerBalls = strikerBalls+1;
    		
		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_2 = '"+strikerBalls+"', ";
    	
    	if(batsmanRuns == 4)
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_3 = '"+(parseInt($scope.matchBallInfo.striker4s)+1)+"', ";
    	
    	if(batsmanRuns == 6)
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_4 = '"+(parseInt($scope.matchBallInfo.striker6s)+1)+"', ";
    	
    	var strikerSR = ((strikerRuns/strikerBalls)*100).toFixed(2);
    	
    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_5 = '"+strikerSR+"', ";
    	
    	
    	
    	var outText = "NOT OUT";
    	
    	var fullScoreWicketQry = "";
    	
    	var wicketOrder = ["bowled","Caught","Caught Behind",
    			"LBW","Stumped","HitWicket",
    			"Runout","handled","hit the twice",
    			"obstructing"];
    	
    	if(isWicket != 0){
    		
    		if(wicketType == 1){
    			outText = "b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 2 || wicketType == 3){
    			outText = "c "+wicketsFielderName+" b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 4){
    			outText = "lbw b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 5){
    			outText = "st "+wicketsFielderName+" b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 6){
    			outText = "hitwicket b "+$scope.matchBallInfo.bowlerName
    		}
    		else if(wicketType == 7){
    			outText = "runout("+wicketsFielderName+")";
    		}
    		else if(wicketType == 8){
    			outText = "handled the ball";
    		}
    		else if(wicketType == 9){
    			outText = "hit the ball twice";
    		}
    		else if(wicketType == 10){
    			outText = "obstructing the field";
    		}
    		
    		var fullScoreWicketQryFirstPart = "INSERT INTO "+fullScoreWicketTable+
    		" (match_id, innings_id, batsman_id, bowler_id, fielder_id_1," +
    		" fielder_id_2, fielder_id_3, fielder_id_4," +
    		" wicket_type, wicket_number, fall_of_wickets) VALUES ";
    		
    		var fielderIdSplit = (fielderIds+"").split(separater);    		
    		var fielderId = new Array();
    		
    		for(var fielderCount = 0;fielderCount < 4;fielderCount++){
    			if(fielderIdSplit.length > fielderCount && fielderIdSplit[fielderCount] != ""){
    				fielderId[fielderCount] = fielderIdSplit[fielderCount];
    			}
    			else
    				fielderId[fielderCount] = 0;
    		}
    		
    		var outBatsmanName;
    		
    		if(outBatsmanId == $scope.matchBallInfo.strikerId){
    			outBatsmanName = $scope.matchBallInfo.strikerName;
    		}
    		else{
    			outBatsmanName = $scope.matchBallInfo.nonStrikerName;
    		}
    		
    		var fowStr = teamWickets+"-"+teamRuns+"("+outBatsmanName+", "+
    			$scope.matchBallInfo.currentOver+"."+teamBall+" ov)";
        	
        	var fullScoreWicketQryValuesPart = "("+matchId+","+$scope.matchBallInfo.currentInnings+","+
        		" "+outBatsmanId+", "+$scope.matchBallInfo.bowlerId+", "+
        		" "+fielderId[0]+", "+fielderId[1]+", "+fielderId[2]+", "+fielderId[3]+", "+
        		" "+wicketType+", "+teamWickets+", '"+fowStr+"')";
        	
        	fullScoreWicketQry = fullScoreWicketQryFirstPart+fullScoreWicketQryValuesPart;

        	console.log("Full Score Wicket Update Ball ===> "+fullScoreWicketQry);
    		
    	}
//    	else{
//    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '"+outText+"' ";
//    	}
    	
    	
    	
    	var nonStrikerUpdateQry="";
    	
    	if(outBatsmanId != $scope.matchBallInfo.strikerId){
    		
    		nonStrikerUpdateQry = "UPDATE "+fullScoreTable+
    			" SET out_text = '"+outText+
    			"' WHERE player_id = "+$scope.matchBallInfo.nonStrikerId+
        		" AND innings_id = "+$scope.matchBallInfo.currentInnings+
        		" AND match_id = "+matchId;
    		
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = 'NOT OUT' ";
    		
    	}
    	else{
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '"+outText+"' ";
    	}
    	

    	
    	var bowlerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
    	var bowlerUpdateQryLastPart = " WHERE player_id = "+$scope.matchBallInfo.bowlerId+
			" AND innings_id = "+$scope.matchBallInfo.currentInnings+
			" AND match_id = "+matchId;
    	
    	var bowlerUpdateQryValuesPart = "";
    	
    	var bowlerBallBowled = parseInt($scope.matchBallInfo.bowlerBalls);
    	if(extraType != 3 && extraType != 4){
    		bowlerBallBowled = bowlerBallBowled+1;
    	}
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_1 = '"+bowlerBallBowled+"', ";
    	
    	if(teamBall == 6){
    		
    		var thisOverSplit = thisOverValue.split(separater);
    		
    		if(thisOverSplit.length == 6){
    			var thisOverRuns = 0;
    			for(var i=0;i<thisOverSplit.length;i++){
    				if((thisOverSplit[i].indexOf("b") > -1 && thisOverSplit[i].indexOf("nb") < 0)||(thisOverSplit[i].indexOf("b") > -1)){
    					thisOverSplit[i] = "0"; 
    				}
    				thisOverRuns = thisOverRuns+parseInt(thisOverSplit[i]);
    			}
    			
    			if(thisOverRuns == 0){    				
    				bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_2 = '"+(parseInt($scope.matchBallInfo.bowlerMaidens)+1)+"', ";
    			}
    			
    		}
    		
    	}
    	
    	var bowlerRunsConceded = parseInt($scope.matchBallInfo.bowlerRuns)+batsmanRuns;
    	
    	if(extraType == 3 || extraType == 4){
    		bowlerRunsConceded = bowlerRunsConceded+extraRuns;
    	}
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_3 = '"+bowlerRunsConceded+"', ";
    	
    	var bowlerDotBalls = parseInt($scope.matchBallInfo.bowlerDotBalls);    	
    	if(batsmanRuns == 0 && (extraRuns == 0 || extraType<3) ){
    		bowlerDotBalls += 1;
    	}
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" bowler_dotballs = "+bowlerDotBalls+", ";
    	
    	if(isWicket == 1){
    		if(wicketType < 7)
    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_4 = '"+(parseInt($scope.matchBallInfo.bowlerWickets)+1)+"', ";
    		else
    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_4 = '"+($scope.matchBallInfo.bowlerWickets)+"', ";
    	}
    	
    	var bowlerEcon;
    	
    	if(bowlerBallBowled != 0)
    		bowlerEcon = ((bowlerRunsConceded/bowlerBallBowled)*6).toFixed(2);
    	else
    		bowlerEcon = 0;
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_5 = '"+bowlerEcon+"', ";
    	
    	var extrasSplit = new Array();
    	
    	if($scope.matchBallInfo.bowlerextras != '')    	
    		extrasSplit= $scope.matchBallInfo.bowlerextras.split(separater);
    	else
    		extrasSplit= ("0"+separater+"0").split(separater);
    	
    	if(extraType == 3){
    		extrasSplit[0] = parseInt(extrasSplit[0])+1; 
    	}
    	else if(extraType == 4){
    		extrasSplit[1] = parseInt(extrasSplit[1])+1; 
    	}
    	
    	var extraText = extrasSplit[0]+separater+extrasSplit[1];
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" extra_count = '"+extraText+"' ";
    	
    	
    	
    	var fullScoreInfoQryFirstPart = "UPDATE "+fullScoreInfoTable+" SET ";
    	var fullScoreInfoQryLastPart = " WHERE innings_id = "+$scope.matchBallInfo.currentInnings+
			" AND match_id = "+matchId;
    	
    	var fullScoreInfoQryValuesPart = "";
    	
    	var teamExtras = new Array();
    	
    	if($scope.matchBallInfo.currInningsExtraStr != '')    	
    		teamExtras = $scope.matchBallInfo.currInningsExtraStr.split(separater);
    	else
    		teamExtras = ("0"+separater+"0"+separater+"0"+separater+"0"+separater+"0").split(separater);
    	
    	if(extraType != 0){
    		teamExtras[(extraType-1)] =  parseInt(teamExtras[(extraType-1)])+extraRuns;
    	}
    	
    	var teamExtraStr = teamExtras[0]+separater+
    		teamExtras[1]+separater+
    		teamExtras[2]+separater+
    		teamExtras[3]+separater+
    		teamExtras[4];
    	
    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"extra_text = '"+teamExtraStr+"', ";
    	
    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_runs = "+teamRuns+", ";
    		
		fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_wickets = "+teamWickets+", ";
		
		fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_overs = '"+
		$scope.matchBallInfo.currentOver+"."+teamBall+"' ";
		
		
		
		var updateBallQry = updateBallQryFirstPart+updateBallQryValuesPart+updateBallQryLastPart;
    	console.log("Update Ball ===> "+updateBallQry);
		
		var strikerUpdateQry = strikerUpdateQryFirstPart+strikerUpdateQryValuesPart+strikerUpdateQryLastPart;
    	console.log("Striker Info Update Ball ===> "+strikerUpdateQry);
		
		var bowlerUpdateQry = bowlerUpdateQryFirstPart+bowlerUpdateQryValuesPart+bowlerUpdateQryLastPart;
    	console.log("Bowler Info Update Ball ===> "+bowlerUpdateQry);
		
		var fullScoreInfoQry = fullScoreInfoQryFirstPart+fullScoreInfoQryValuesPart+fullScoreInfoQryLastPart;
    	console.log("Full Score Info Update Ball ===> "+fullScoreInfoQry);
    	
    	
    	db.transaction(function(tx) {
        	
			tx.executeSql(updateBallQry,[],function(tx,res){},errorHandler);
			tx.executeSql(strikerUpdateQry,[],function(tx,res){},errorHandler);
			
			if(nonStrikerUpdateQry!="")
				tx.executeSql(nonStrikerUpdateQry,[],function(tx,res){},errorHandler);
			
			tx.executeSql(bowlerUpdateQry,[],function(tx,res){},errorHandler);
			tx.executeSql(fullScoreInfoQry,[],function(tx,res){},errorHandler);
			
			if(fullScoreWicketQry!="")
				tx.executeSql(fullScoreWicketQry,[],function(tx,res){},errorHandler);
			
    	},errorHandler);
    	
    	$scope.nextBallCalculation($scope.matchBallInfo.currentInnings,
    			$scope.matchBallInfo.ballUnique,
    			outBatsmanId);
    	
    }
    
    $scope.nextBallInfo = {
    		matchId:"",
    		inningsId:"",
    		
    		overId:"",
    		ballId:"",
    		ballUnique:"",
    		
    		strikerId:"",
    		nonStrikerId:"",
    		bowlerId:"",
    		
    		currTeamRuns:"",
    		currTeamWicket:"",
    		requiredRuns:"",
    		remainingBalls:"",
    		
    		thisOver:"",
    		isLastManBatting:"",
    		
    		lastBowlerId:""
    		
        };
    
    $scope.nextBallCalculation = function(currentInnings,lastBallUnique,
    		outBatsmanId) {
    	
    	if(lastBallUnique == 0 && currentInnings == 1){
    		
    		var updateFullScore = "UPDATE "+fullScoreTable+
    		" SET batting_bowling_order = 0 WHERE "+
    		" match_id = "+matchId+
    		" AND innings_id = 1";
    		
    		db.transaction(function(tx) {
    			tx.executeSql(updateFullScore,[],function(tx,res){},errorHandler);
	    	},errorHandler);
    		
    		
    		$scope.nextBallInfo.inningsId = currentInnings;
			
			$scope.nextBallInfo.overId = 0;
			$scope.nextBallInfo.ballId = 0;
			$scope.nextBallInfo.ballUnique = 0.01;
			
			$scope.nextBallInfo.strikerId = 0;
			$scope.nextBallInfo.nonStrikerId = 0;
			$scope.nextBallInfo.bowlerId = 0;
			
			$scope.nextBallInfo.currTeamRuns = 0;
			$scope.nextBallInfo.currTeamWicket = 0;
			$scope.nextBallInfo.thisOver = "";
			$scope.nextBallInfo.requiredRuns = 0;			

			$scope.nextBallInfo.remainingBalls = 0;
			
			$scope.nextBallInfo.isLastManBatting = 0;
			
	    	$scope.nextBallInfo.lastBowlerId = 0;
			
			$scope.insertNewBall();
    		
    	}
    	else{
    	
	    	db.transaction(function(tx) {
	    		
	    		var getLastBallInfo = "SELECT * FROM "+ballbyballTable+
	    		" WHERE match_id = "+matchId+
	    		" AND innings_id = "+currentInnings+
	    		" AND ball_unique = "+lastBallUnique;
	    		
	//    		" over_id integer,ball_id integer,ball_unique float,"+
	//			" striker_id integer, non_striker_id integer, bowler_id integer,"+
	//			" batsman_runs integer, extra_runs integer,"+
	//			" extra_type integer, is_wicket integer, is_updated integer,"+
	//			" is_synced integer, curr_team_runs integer, curr_team_wickets integer,"+
	//			" required_runs integer, remaining_balls integer, this_over text"
	    		
	    		var overId, ballId, strikerId, nonStrikerId, bowlerId,
	    			batsmanRuns, extraRuns, extraType, isWicket,
	    			currTeamRuns, currTeamWickets, requiredRuns, remainingBalls ,thisOver;
	        	
				tx.executeSql(getLastBallInfo,[],function(tx,res){
					
					overId = res.rows.item(0).over_id;
					ballId = res.rows.item(0).ball_id;
					strikerId = res.rows.item(0).striker_id;
					nonStrikerId = res.rows.item(0).non_striker_id;
					bowlerId = res.rows.item(0).bowler_id;
	    			batsmanRuns = res.rows.item(0).batsman_runs;
	    			extraRuns = res.rows.item(0).extra_runs;
	    			extraType = res.rows.item(0).extra_type;
	    			isWicket = res.rows.item(0).is_wicket;
	    			currTeamRuns = res.rows.item(0).curr_team_runs;
	    			currTeamWickets = res.rows.item(0).curr_team_wickets;
	    			requiredRuns = res.rows.item(0).required_runs;
	    			remainingBalls = res.rows.item(0).remaining_balls;
	    			thisOver = res.rows.item(0).this_over;
	    			
	    			var isInningsEnd = false;
	    			var isMatchEnd = false;
	    			
	    			var nextOverId, nextBallId, nextBallUnique, nextIsLastManBatting;
	    			
	    			if(ballId == 6){
	    				nextOverId = overId+1;
	    				nextBallId = 0;
	    				nextBallUnique = nextOverId + 0.01;
	    	    	}
	    	    	else{
	    	    		nextOverId = overId;
	    	    		nextBallId = ballId;
	    	    		nextBallUnique = parseFloat(lastBallUnique)+0.01;
	    	    	}
	    			
	    			if(nextOverId == $scope.matchAttributes.totalOvers && $scope.matchAttributes.totalOvers != 0){
						isInningsEnd = true;
					}
					else {
						
						if($scope.matchAttributes.isLastManBatting == 1){
	    					if(matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id1){
	    						
	    						if(currTeamWickets == $scope.team1PlayingXI.length)
	    							isInningsEnd = true;
	    						else if(currTeamWickets == $scope.team1PlayingXI.length-1)
	    							nextIsLastManBatting = 1;
	    					}
	    					else if(matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id2){
	    						
	    						if(currTeamWickets == $scope.team2PlayingXI.length)
	    							isInningsEnd = true;
	    						else if(currTeamWickets == $scope.team2PlayingXI.length-1)
	    							nextIsLastManBatting = 1;
	    					}
	    					
						}
						else{
	    					if(currTeamWickets == ($scope.team1PlayingXI.length-1) 
	    							&& matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id1){
	    						isInningsEnd = true;
	    					}
	    					else if(currTeamWickets == ($scope.team2PlayingXI.length-1) 
	    							&& matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id2){
	    						isInningsEnd = true;
	    					}
						}
					}
	    			
	    			var totalInnings = $scope.matchAttributes.inningsCount*2;
	    			
	    			if(currentInnings == totalInnings){	    				
	    				if(!isInningsEnd){
		    				if(requiredRuns <= 0){
		    		    		isMatchEnd = true;
		    		    	}
	    				}
	    				else{
	    					isMatchEnd = true;
	    				}
	    			}
	    			
//	    			alert("currentInnings "+currentInnings);
//	    			alert("totalInnings "+totalInnings);
//	    			alert("requiredRuns "+requiredRuns);
//	    			alert("isInningsEnd "+isInningsEnd);
//	    			alert("isMatchEnd "+isMatchEnd);
	    			
	    			$scope.nextBallInfo.matchId = matchId;

	    			if(isInningsEnd && !isMatchEnd){
	    				
	    				$scope.keeperId = "";
	    				
	    				$scope.nextBallInfo.inningsId = currentInnings+1;
	    				
	    				$scope.nextBallInfo.overId = 0;
	    				$scope.nextBallInfo.ballId = 0;
	    				$scope.nextBallInfo.ballUnique = 0.01;
	    				
	    				$scope.nextBallInfo.strikerId = 0;
	    				$scope.nextBallInfo.nonStrikerId = 0;
	    				$scope.nextBallInfo.bowlerId = 0;
	    				
	    				$scope.nextBallInfo.currTeamRuns = 0;
	    				$scope.nextBallInfo.currTeamWicket = 0;
	    				$scope.nextBallInfo.thisOver = "";
	    				
	    				if(currentInnings == 1 && totalInnings == 4){
	    					$scope.nextBallInfo.requiredRuns = currTeamRuns;
	    				}
	    				else if(currentInnings == 1 && totalInnings == 2){
	    					$scope.nextBallInfo.requiredRuns = currTeamRuns+1;
	    				}
	    				else if(currentInnings == 2){	    					
	    					$scope.nextBallInfo.requiredRuns = (requiredRuns*-1);
	    				}
	    				else if(currentInnings == 3){
	    					if(requiredRuns < 0) 
	    						$scope.nextBallInfo.requiredRuns = (requiredRuns*-1)+1;
	    					else
	    						isMatchEnd = true;
	    				}
	    				
	    				if($scope.matchAttributes.totalOvers !=0 )
	    					$scope.nextBallInfo.remainingBalls = $scope.matchAttributes.totalOvers*6;
	    				
	    				$scope.nextBallInfo.isLastManBatting = 0;
	    				
	    				$scope.nextBallInfo.lastBowlerId = 0;
	    				
	    				if(!isMatchEnd){
	    					
	    					if(currentInnings == 2 && requiredRuns > 0){
	    						showPopup(followingOnPopup);
	    					}
	    					else{
	    						showPopup(inningsEndNotifyPopup);
	    					}
	    				}

	    			}
	    			else if(!isMatchEnd){
	    				
	    				$scope.nextBallInfo.inningsId = currentInnings;
	    				
	    				$scope.nextBallInfo.overId = nextOverId;
	    				$scope.nextBallInfo.ballId = nextBallId;
	    				$scope.nextBallInfo.ballUnique = nextBallUnique;
	    				
	    				$scope.nextBallInfo.strikerId = strikerId;
	    				$scope.nextBallInfo.nonStrikerId = nonStrikerId;
	    				$scope.nextBallInfo.bowlerId = bowlerId;
	    				
	    				$scope.nextBallInfo.currTeamRuns = currTeamRuns;
	    				$scope.nextBallInfo.currTeamWicket = currTeamWickets;
	    				$scope.nextBallInfo.requiredRuns = requiredRuns;
	    				$scope.nextBallInfo.remainingBalls = remainingBalls;
	    				
	    				$scope.nextBallInfo.thisOver = thisOver;    				
	    				$scope.nextBallInfo.isLastManBatting = nextIsLastManBatting;
	    				
	    				$scope.nextBallInfo.lastBowlerId = bowlerId;
	    				
	    	    		if(extraType != 5){
	    	    			
	    	    			var totalRunsScored;
	    	    			
	    	    			if(extraType > 2)
	    	    				totalRunsScored = batsmanRuns+(extraRuns-1);
	    	    			else
	    	    				totalRunsScored = batsmanRuns+extraRuns;
	    	    			
	    	    			if((totalRunsScored % 2) != 0){    				
	    	    				$scope.nextBallInfo.strikerId = nonStrikerId;
	    	    				$scope.nextBallInfo.nonStrikerId = strikerId;
	    	    			}
	    	    			
	    	    		}
	    	    		
	    	    		if(ballId == 6){    	    			
	    	    			var strikertemp = $scope.nextBallInfo.strikerId;    	    			
	    	    			$scope.nextBallInfo.strikerId = $scope.nextBallInfo.nonStrikerId;
	    	    			$scope.nextBallInfo.nonStrikerId = strikertemp;
	    	    			
	    	    			$scope.nextBallInfo.thisOver = "";    	    			
	    	    			$scope.nextBallInfo.bowlerId = 0;
	    	    			
	    	    			$(".all-overs").css("marginLeft","0px");
	    	    			
	    	    		}
	    	    		
	    	    		
	    	    		if(isWicket == 1){
	    	    			if($scope.nextBallInfo.strikerId == outBatsmanId)
	    	    				$scope.nextBallInfo.strikerId = 0;
	    	    			else
	    	    				$scope.nextBallInfo.nonStrikerId = 0;
	    	    		}
	    	    		
	    	    		$scope.insertNewBall();
	    			}
	    			
	    			if(isMatchEnd){
	    				
	    				var matchResults;
	    				
	    				if(currentInnings == 3){
	    					
	    					if(matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id1){
	    						matchResults = $scope.details.playername2;
	    						$scope.winningTeam = 2;
	    					}
	    					else{
	    						matchResults = $scope.details.playername1;
	    						$scope.winningTeam = 1;
	    					}
	    					
	    					matchResults = matchResults+" won by an innings and "+requiredRuns+" runs";
	    					
	    				}
	    				else if(currentInnings == totalInnings){
	    					
			    			if(requiredRuns <= 0){
			    				
			    				var wickets;
			    				
			    				if(matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id1){
		    						matchResults = $scope.details.playername1;
		    						$scope.winningTeam = 1;
		    						wickets = $scope.team1PlayingXI.length - currTeamWickets;
		    					}
		    					else{
		    						matchResults = $scope.details.playername2;
		    						$scope.winningTeam = 2;
		    						wickets = $scope.team2PlayingXI.length - currTeamWickets;
		    					}
			    				
			    				matchResults = matchResults+" won by "+wickets+" wickets";
			    				
		    				}
		    				else{
		    					
		    					if(matchParticipantIdArray[currentInnings] == $scope.details.match_participant_id1){
		    						matchResults = $scope.details.playername2;
		    						$scope.winningTeam = 2;
		    					}
		    					else{
		    						matchResults = $scope.details.playername1;
		    						$scope.winningTeam = 1;
		    					}
		    					
		    					matchResults = matchResults+" won by "+requiredRuns+" runs";
		    					
		    				}
	    					
	    				}
	    				
	    				$scope.matchEnd(matchResults);
	    			}
					
				},errorHandler);
				
	    	},errorHandler);
	    	
    	}
		
	}
    
    $scope.winningTeam = 0;
    
    $scope.endInningsNotify = function() {
    	
//    	alert("endInningsNotify ");
    	
    	$scope.insertNewBall();
		
	}
    
    $scope.inningsEnd = function(){
    	
    	var currentInnings = $scope.matchBallInfo.currentInnings;
    	var totalInnings = $scope.matchAttributes.inningsCount*2;
    	var currTeamRuns = $scope.matchBallInfo.currTeamRuns;
    	var requiredRuns = $scope.matchBallInfo.requiredRuns;
    	
    	var isMatchEnd = false;
    	
    	if(currentInnings == totalInnings){
			isMatchEnd = true;
		}
    	else{
	    	$scope.keeperId = "";
			
			$scope.nextBallInfo.inningsId = currentInnings+1;
			
			$scope.nextBallInfo.overId = 0;
			$scope.nextBallInfo.ballId = 0;
			$scope.nextBallInfo.ballUnique = 0.01;
			
			$scope.nextBallInfo.strikerId = 0;
			$scope.nextBallInfo.nonStrikerId = 0;
			$scope.nextBallInfo.bowlerId = 0;
			
			$scope.nextBallInfo.currTeamRuns = 0;
			$scope.nextBallInfo.currTeamWicket = 0;
			$scope.nextBallInfo.thisOver = "";
			
			if(currentInnings == 1 && totalInnings == 4){
				$scope.nextBallInfo.requiredRuns = currTeamRuns;
			}
			else if(currentInnings == 1 && totalInnings == 2){
				$scope.nextBallInfo.requiredRuns = currTeamRuns+1;
			}
			else if(currentInnings == 2){	    					
				$scope.nextBallInfo.requiredRuns = (requiredRuns*-1);
			}
			else if(currentInnings == 3){
				if(requiredRuns < 0) 
					$scope.nextBallInfo.requiredRuns = (requiredRuns*-1)+1;
				else
					isMatchEnd = true;
			}
			
			if($scope.matchAttributes.totalOvers !=0 )
				$scope.nextBallInfo.remainingBalls = $scope.matchAttributes.totalOvers*6;
			
			$scope.nextBallInfo.isLastManBatting = 0;
			
			$scope.nextBallInfo.lastBowlerId = 0;
    	}
    	
		if(!isMatchEnd){
			if(currentInnings == 2 && requiredRuns > 0){
				showPopup(followingOnPopup);
			}
			else{
				
				db.transaction(function(tx) {
		    		
		    		var deleteLastBall = "DELETE FROM "+ballbyballTable+
		    			" WHERE match_id = "+matchId+
		    			" AND is_updated = 0";
		    		
		    		tx.executeSql(deleteLastBall,[],function(tx,res){
		    			
		    			hideOtherContent()
						$scope.insertNewBall();
						
		    		},errorHandler);
					
		    	},errorHandler);
				
			}
		}
		else{
			showPopup(matchEndPopup);
		}
    	
    }
    
    $scope.matchEnd = function(matchResults){
    	
    	alert("MatchResults "+matchResults);
    	
    	db.transaction(function(tx) {
    		
    		var updateAttributes = "UPDATE "+matchAttributes+
    			" SET match_status = 'F'," +
    			" result = '"+matchResults+"'"+
    			" WHERE match_id = "+matchId;
    		
//    		alert("updateAttributes "+updateAttributes);
    		
    		tx.executeSql(updateAttributes,[],function(tx,res){
    			
    			$scope.momOptions();
    			hideOtherContent();
    			showOtherContent("manoftheMatchList");

    		},errorHandler);
			
    	},errorHandler);
    	
    }
    
    $scope.insertNewBall = function() {
    	
    	$(".changeStriker").hide();

    	if($scope.nextBallInfo.nonStrikerId == 0 && $scope.nextBallInfo.isLastManBatting != 1){
    		
    		$scope.remainingBatsman();
			showOtherContent("batsmanLists");
			
			if($scope.nextBallInfo.strikerId != 0 && $scope.nextBallInfo.ballUnique == 0.01)
				$(".changeStriker").show();
			
    	}
    	else if($scope.nextBallInfo.strikerId == 0){

    		if($scope.nextBallInfo.isLastManBatting == 1){
    			
        		if($scope.nextBallInfo.strikerId == 0 && $scope.nextBallInfo.nonStrikerId != 0){        			
        			$scope.nextBallInfo.strikerId = $scope.nextBallInfo.nonStrikerId;
        		}
        		$scope.nextBallInfo.nonStrikerId = 0;
        		$scope.insertNewBall();
        		
        	}
    		else{
    			$scope.remainingBatsman();
    			showOtherContent("batsmanLists");
    			
//    			$(".entryControls").addClass("hide");    			
//        		$(".batsmanLists").removeClass("hide");
    		}
    		
    	}
    	else if($scope.keeperId == "" && $scope.nextBallInfo.ballUnique == 0.01){
			
			$scope.keeperOptions();
			showOtherContent("keeperLists");
			
//			$(".entryControls").addClass("hide");    			
//    		$(".keeperLists").removeClass("hide");
		}
    	else if($scope.nextBallInfo.bowlerId == 0){
    		
    		if($scope.nextBallInfo.ballUnique == 0.01)
    			$(".changeKeeper").show();
    		
    		$scope.remainingBowlers();
    		
    		showOtherContent("bowlerLists");
    		
//    		$(".entryControls").addClass("hide");
//    		$(".bowlerLists").removeClass("hide");
    	}
    	else{
    		
    		var insertNewBallQry = "INSERT INTO "+ballbyballTable+
		    	" (match_id, innings_id,"+
		    	" over_id, ball_id, ball_unique,"+
				" striker_id, non_striker_id, bowler_id,"+
				" batsman_runs, extra_runs,"+
				" extra_type, is_wicket, is_updated,"+
				" is_synced, curr_team_runs, curr_team_wickets, required_runs," +
				" remaining_balls, this_over) VALUES ";
	    	
	    	var insertBallDetailsVal = "("+
		    	matchId+","+
		    	$scope.nextBallInfo.inningsId+","+
		    	$scope.nextBallInfo.overId+","+
		    	$scope.nextBallInfo.ballId+","+
		    	$scope.nextBallInfo.ballUnique+","+
		    	$scope.nextBallInfo.strikerId+","+
		    	$scope.nextBallInfo.nonStrikerId+","+
		    	$scope.nextBallInfo.bowlerId+","+
		    	"0,0,0,0,0,0,"+
		    	$scope.nextBallInfo.currTeamRuns+","+
		    	$scope.nextBallInfo.currTeamWicket+","+
		    	$scope.nextBallInfo.requiredRuns+","+
		    	$scope.nextBallInfo.remainingBalls+",'"+
		    	$scope.nextBallInfo.thisOver+"')";
	    	
	    	db.transaction(function(tx) {
	    		
	    		var deleteDuplicate = "DELETE FROM "+ballbyballTable+
	    			" WHERE match_id = "+matchId+
	    			" AND innings_id = "+$scope.nextBallInfo.inningsId+
	    			" AND ball_unique = "+$scope.nextBallInfo.ballUnique;
	    		
	    		tx.executeSql(deleteDuplicate,[],function(tx,res){},errorHandler);
	        	
				tx.executeSql(insertNewBallQry+insertBallDetailsVal,[],function(tx,res){
					
					$scope.getBallInfo();
				
				},errorHandler);
				
	    	},errorHandler);
    		
    	}
	}
    
    $scope.remainingBatsman = function(){
    	
    	$scope.battingRemaining = [];
        
        db.transaction(function(tx) {
        	
        	var selectQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+matchId+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
			" AND (score.batting_bowling_order = 0"+
			" OR score.out_text = '"+retireHurtTxt+"')"+
			" AND score.is_batting = 1";
        	
        	console.log(selectQry);      	
			
			tx.executeSql(selectQry,[],
				function(tx, res){
					for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
						
						var info = {
			        			indicator:playerLoop,
			        			id:res.rows.item(playerLoop).player_id,
			        			No:res.rows.item(playerLoop).jersey_no,
			        			Name:res.rows.item(playerLoop).first_name+" "+res.rows.item(playerLoop).last_name,
			        			Role:teamRole[res.rows.item(playerLoop).player_role-1],
			        			imageUrl:res.rows.item(playerLoop).player_image,
			        			done:"",
			        			position:teamRole[res.rows.item(playerLoop).team_role-1]
			        	};
			    		$scope.battingRemaining.push(info);
			    		
					}
					
					$scope.$apply();
					
				},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.remainingBowlers = function(){
    	
        $scope.bowlingRemaining = [];
        
        db.transaction(function(tx) {
        	
        	var keeperId;
        	
        	if($scope.keeperId != "")
        		keeperId = $scope.keeperId;
        	else
        		keeperId = 0;
        	
			var bowlingQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+matchId+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
			" AND score.player_id != "+$scope.nextBallInfo.lastBowlerId+
			" AND score.player_id != "+keeperId+
			" AND score.is_batting = 0";
        	
        	console.log(bowlingQry);      	
			
			tx.executeSql(bowlingQry,[],
			function(tx, res){
				
				for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
					
					var info = {
		        			indicator:playerLoop,
		        			id:res.rows.item(playerLoop).player_id,
		        			No:res.rows.item(playerLoop).jersey_no,
		        			Name:res.rows.item(playerLoop).first_name+" "+res.rows.item(playerLoop).last_name,
		        			Role:teamRole[res.rows.item(playerLoop).player_role-1],
		        			imageUrl:res.rows.item(playerLoop).player_image,
		        			done:"",
		        			position:teamRole[res.rows.item(playerLoop).team_role-1]
		        	};
		    		
		    		$scope.bowlingRemaining.push(info);
					
				}
				
				$scope.$apply();
				
			},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.keeperOptions = function(){
    	
        $scope.keepersList = [];
        
        db.transaction(function(tx) {
        	
        	var keeperId;
        	if($scope.keeperId != "")
        		keeperId = $scope.keeperId;
        	else
        		keeperId = 0;
        	
			var keeperQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+matchId+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
			" AND score.player_id != "+keeperId+
			" AND score.is_batting = 0";
        	
        	console.log(keeperQry);      	
			
			tx.executeSql(keeperQry,[],
			function(tx, res){
				
				for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
					
					var info = {
		        			indicator:playerLoop,
		        			id:res.rows.item(playerLoop).player_id,
		        			No:res.rows.item(playerLoop).jersey_no,
		        			Name:res.rows.item(playerLoop).first_name+" "+res.rows.item(playerLoop).last_name,
		        			Role:teamRole[res.rows.item(playerLoop).player_role-1],
		        			imageUrl:res.rows.item(playerLoop).player_image,
		        			done:"",
		        			position:teamRole[res.rows.item(playerLoop).team_role-1]
		        	};
		    		
		    		$scope.keepersList.push(info);
					
				}
				
				$scope.$apply();
				
			},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.momOptions = function(){
    	
    	$scope.momTeam1OptionsList = [];
    	$scope.momTeam2OptionsList = [];
        
        db.transaction(function(tx) {
        	
        	var battingInfo = "SELECT *, group_concat(score_info_1) as battingPerformance" +
    			" FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
				" ON squad.player_id = score.player_id " +
				" AND squad.match_id = score.match_id " +
				" AND squad.match_participant_id = score.match_participant_id WHERE" +
				" score.match_id = "+matchId+
				" AND score.is_batting = 1"+
				" GROUP BY player_id";
        	
        	console.log(battingInfo);      	
			
			tx.executeSql(battingInfo,[],
				function(tx, res){
				
					var playerLength = res.rows.length;
				
					for(var playerLoop = 0; playerLoop < playerLength; playerLoop++){
						
						var battingPerformance = res.rows.item(playerLoop).battingPerformance;
						
						var bowlingInfo = "SELECT *, group_concat(score_info_3||'/'||score_info_4) as bowlingPerformance" +
							" FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
							" ON squad.player_id = score.player_id " +
							" AND squad.match_id = score.match_id " +
							" AND squad.match_participant_id = score.match_participant_id WHERE" +
							" score.match_id = "+matchId+
							" AND score.is_batting = 0"+
							" AND score.player_id = "+res.rows.item(playerLoop).player_id+
							" GROUP BY player_id";
						
						tx.executeSql(bowlingInfo,[],
								function(tx, res){
						
							var info = {
				        			id:res.rows.item(0).player_id,
				        			No:res.rows.item(0).jersey_no,
				        			Name:res.rows.item(0).first_name+" "+res.rows.item(0).last_name,
				        			Role:teamRole[res.rows.item(0).player_role-1],
				        			imageUrl:res.rows.item(0).player_image,
				        			done:"",
				        			position:teamRole[res.rows.item(0).team_role-1],
									battingPerformance:battingPerformance,
									bowlingPerformance:res.rows.item(0).bowlingPerformance
				        	};
							
							if($scope.details.match_participant_id1 == res.rows.item(0).match_participant_id){
								info.jerseyColor = $scope.details.jerseyColor1;
								$scope.momTeam1OptionsList.push(info);
							}
							else{
								info.jerseyColor = $scope.details.jerseyColor2;
								$scope.momTeam2OptionsList.push(info);
							}
							
							var totalLength = $scope.momTeam1OptionsList.length+$scope.momTeam2OptionsList.length;
							
				    		if(playerLength == totalLength)
				    			$scope.$apply();
					
						},errorHandler);
						
					}
					
				},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.chooseTeam1MOM = function(index){
    	$scope.choosedMomId = $scope.momTeam1OptionsList[index].id;
    }
    
    $scope.chooseTeam2MOM = function(index){
    	$scope.choosedMomId = $scope.momTeam2OptionsList[index].id;
    }
    
    $scope.addMOM = function() {
    	
    	if($scope.choosedMomId != "" && $scope.choosedMomId != undefined){
    		$scope.updateMOM($scope.choosedMomId);
    		$scope.choosedMomId = "";
    	}
    	else{
    		alert("Choose any one player");
    	}
    	
	}
    
    $scope.updateMOM = function(momId) {
		
    	db.transaction(function(tx) {
    		
    		var updateAttributes = "UPDATE "+matchAttributes+
    			" SET mom_id = "+momId+
    			" WHERE match_id = "+matchId;
    		
    		tx.executeSql(updateAttributes,[],function(tx,res){
    			
    			$scope.unSyncLastBall();
    			
    			hideOtherContent();
    			
    			changeTab(1);
    			hideTabTitle(2);
    			
    		},errorHandler);
			
    	},errorHandler);
    	
	}
    
    $scope.unSyncLastBall = function() {
    	
    	db.transaction(function(tx) {

    		var findLastBallUnique = "SELECT ball_unique FROM "+ballbyballTable+
	    	" WHERE match_id = "+matchId+
	    	" AND is_updated = 1"+
	    	" ORDER BY innings_id DESC,ball_unique DESC";
	    	
	    	tx.executeSql(findLastBallUnique,[],function(tx,res){
	    		
	    		if(res.rows.length > 0){
	    		
		    		var lastBallUnique = res.rows.item(0).ball_unique
		    		
		    		var unSyncLastBall = "UPDATE "+ballbyballTable+
			    	" SET is_synced = 0"+
			    	" WHERE match_id = "+matchId+
			    	" AND ball_unique = "+lastBallUnique;
		    		
			    	tx.executeSql(unSyncLastBall,[],function(tx,res){
			    		
			    	},errorHandler);
		    	
	    		}
	    	
	    	},errorHandler);
			
    	},errorHandler);
		
	}
    
    
    $scope.chooseStrikers = function(index){    	    	
    	$scope.choosedId = $scope.battingRemaining[index].id;
    }
    
    $scope.chooseBowlers = function(index){
    	$scope.choosedId = $scope.bowlingRemaining[index].id;
    }
    
    $scope.chooseKeeper = function(index){
    	$scope.choosedId = $scope.keepersList[index].id;
    }
    
    $scope.changeStrikers = function(){
    	
    	var updateOrder = "UPDATE "+fullScoreTable+
    		" SET batting_bowling_order = 0"+
    		" WHERE match_id = "+matchId+
    		" AND innings_id = "+$scope.nextBallInfo.inningsId;
    	
    	if($scope.nextBallInfo.nonStrikerId != 0){
    		$scope.nextBallInfo.nonStrikerId = 0;
    		updateOrder = updateOrder + " AND batting_bowling_order != 1";
    	}
    	else if($scope.nextBallInfo.strikerId != 0){
    		$scope.nextBallInfo.strikerId = 0;
    	}
    	
    	hideOtherContent();
    	
    	db.transaction(function(tx) {
			
			tx.executeSql(updateOrder,[],function(tx, res){
				$scope.insertNewBall();
			},errorHandler);
			
    	},errorHandler);
    	
    	
    	
    }
    
    $scope.addStrikers = function(){
    	
    	var playerId;
    	
    	if($scope.choosedId != "" && $scope.choosedId != undefined){
			
			if($scope.nextBallInfo.strikerId == 0){
				$scope.nextBallInfo.strikerId = $scope.choosedId;
			}
			else{
				$scope.nextBallInfo.nonStrikerId = $scope.choosedId;
			}
			
			playerId = $scope.choosedId; 
			
			$scope.choosedId = "";
			
			hideOtherContent();
			
//			$(".entryControls").removeClass("hide");
//			$(".batsmanLists").addClass("hide");
			
			db.transaction(function(tx) {
				
				var getBattingOrder = " SELECT batting_bowling_order FROM "+fullScoreTable+
					" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
					" AND player_id = "+playerId+
					" AND match_id = "+matchId;
				
				tx.executeSql(getBattingOrder,[],function(tx, res){
					
					if(res.rows.item(0).batting_bowling_order == 0){
						
						var getMaxBowlingOrder = " SELECT MAX(batting_bowling_order) as max_order FROM "+fullScoreTable+
						" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
						" AND match_id = "+matchId+
						" AND is_batting = 1";
						
						tx.executeSql(getMaxBowlingOrder,[],function(tx, res){
							
							var maxOrder = res.rows.item(0).max_order+1;
							
							var strikerQry = "UPDATE "+fullScoreTable+" SET" +
							" batting_bowling_order = "+maxOrder+","+
							" out_text = 'NOT OUT'"+
							" WHERE" +
							" match_id = " +matchId+
							" AND innings_id = "+$scope.nextBallInfo.inningsId+
							" AND player_id = "+playerId+
							" AND batting_bowling_order = 0"+
							" AND is_batting = 1";
							
							tx.executeSql(strikerQry,[],function(tx, res){								
								$scope.insertNewBall();								
							},errorHandler);
							
						},errorHandler);
					}
					else{
						
						var strikerQry = "UPDATE "+fullScoreTable+" SET" +
						" out_text = 'NOT OUT'"+
						" WHERE" +
						" match_id = " +matchId+
						" AND innings_id = "+$scope.nextBallInfo.inningsId+
						" AND player_id = "+playerId+
						" AND is_batting = 1";
						
						tx.executeSql(strikerQry,[],function(tx, res){								
							$scope.insertNewBall();								
						},errorHandler);
					}
					
				},errorHandler);
				
				if(retirePlayerId != ""){
				
					var updateRetireStatus = "UPDATE "+fullScoreTable+
		    		" SET out_text = '"+retireHurtTxt+"'"+
		    		" WHERE player_id = "+retirePlayerId+
		    		" AND match_id = "+matchId+
		    		" AND innings_id = "+$scope.matchBallInfo.currentInnings;
		        	
					retirePlayerId = "";
					
					tx.executeSql(updateRetireStatus,[],function(tx,res){},errorHandler);
				
				}
				
	        }, errorHandler);
    	
    	}
    	else{
    		
    		alert("Choose any one player");
    		
    	}
    	
    }
    
    $scope.addBowlers = function (){
    	
    	if($scope.choosedId != "" && $scope.choosedId != undefined){
    		
    		var playerId = $scope.choosedId;
    		
    		$scope.choosedId = "";
    		
    		$scope.nextBallInfo.bowlerId = playerId;
    		
    		$(".changeKeeper").show();
    		hideOtherContent();
    		
//    		$(".entryControls").removeClass("hide");
//    		$(".bowlerLists").addClass('hide');
    		
			
			db.transaction(function(tx) {
				
				var getBowlingOrder = " SELECT batting_bowling_order FROM "+fullScoreTable+
					" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
					" AND player_id = "+playerId+
					" AND match_id = "+matchId;
				
				tx.executeSql(getBowlingOrder,[],function(tx, res){
					
					if(res.rows.item(0).batting_bowling_order == 0){
						
						var getMaxBowlingOrder = " SELECT MAX(batting_bowling_order) as max_order FROM "+fullScoreTable+
						" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
						" AND match_id = "+matchId+
						" AND is_batting = 0";
						
						tx.executeSql(getMaxBowlingOrder,[],function(tx, res){
							
							var maxOrder = res.rows.item(0).max_order+1;							
							
							var strikerQry = "UPDATE "+fullScoreTable+" SET" +
							" batting_bowling_order = "+maxOrder+" WHERE" +
							" match_id = " +matchId+
							" AND innings_id = "+$scope.nextBallInfo.inningsId+
							" AND player_id = "+playerId+
							" AND batting_bowling_order = 0"+
							" AND is_batting = 0";
							
							tx.executeSql(strikerQry,[],function(tx, res){
								$scope.insertNewBall();
							},errorHandler);
							
						},errorHandler);
						
					}
					else{
						$scope.insertNewBall();
					}
					
				},errorHandler);
				
	        }, errorHandler);
		
	    }
		else{
			
			alert("Choose any one player");
			
		}
    	
    }
    
    $scope.keeperId = "";
    $scope.addKeeper = function (){
    	
    	if($scope.choosedId != "" && $scope.choosedId != undefined){
    		
    		var playerId = $scope.choosedId;
    		
    		$scope.choosedId = "";
    		$scope.keeperId = playerId;
    		
    		hideOtherContent();
    		
//    		$(".entryControls").removeClass("hide");
//    		$(".keeperLists").addClass('hide');    		
			
			db.transaction(function(tx) {
				
				var keeperUpdate = "UPDATE "+fullScoreInfoTable+" SET" +
				" keeper_id = "+playerId+" WHERE" +
				" match_id = " +matchId+
				" AND innings_id = "+$scope.nextBallInfo.inningsId;
				
				tx.executeSql(keeperUpdate,[],function(tx, res){
					$scope.insertNewBall();
				},errorHandler);
				
	        }, errorHandler);
		
	    }
		else{
			
			alert("Choose any one player");
			
		}
    	
    }
    
    $scope.swapStrikers = function (){
    	
    	db.transaction(function(tx) {
    		
    		var updateStrikers = "UPDATE "+ballbyballTable+
    		" SET striker_id = "+$scope.matchBallInfo.nonStrikerId+","+
    		" non_striker_id = "+$scope.matchBallInfo.strikerId+
    		" WHERE match_id="+matchId;
        	
			tx.executeSql(updateStrikers,[],function(tx,res){
				
				$scope.getBallInfo();
			
			},errorHandler);
			
    	},errorHandler);
    	
    }
    
    $scope.changeInfos={};
    
    $scope.retireBatsman = function(isNonStriker) {
    	
    	if(isNonStriker == 1){
    		retirePlayerId = $scope.matchBallInfo.nonStrikerId;
    		$scope.nextBallInfo.nonStrikerId = 0;
    	}
    	else{
    		retirePlayerId = $scope.matchBallInfo.strikerId;
    		$scope.nextBallInfo.strikerId = 0;
    	}
    	
    	hideOtherContent();
    	$scope.insertNewBall();
		
	}
    
    $scope.changeBowler = function(isNonStriker) {
    	
    	$scope.nextBallInfo.bowlerId = 0;
    	
    	$(".changeKeeper").hide();
    	hideOtherContent();
    	$scope.insertNewBall();
		
	}
    
    var currStrikerId = "";
    var currNonStrikerId = "";
    
    $scope.undoLastBall = function (){
    	
    	currStrikerId = $scope.matchBallInfo.strikerId
        currNonStrikerId = $scope.matchBallInfo.nonStrikerId;
		
		db.transaction(function(tx) {
		
	    	var ballUnique = $scope.matchBallInfo.ballUnique;
			var currentInnings = $scope.matchBallInfo.currentInnings;			
			var currentOver = $scope.matchBallInfo.currentOver;
			
	    	if(ballUnique != 0.01 || currentInnings != 1){
	    		
	    		if(ballUnique != 0.02){
	    			
	    			var checkPrevBall = "SELECT * FROM "+ballbyballTable+
				    	" WHERE match_id = "+matchId;
	    			
	    			tx.executeSql(checkPrevBall,[],function(tx,res){
	    				
	    				if(res.rows.length >= 3){
	    					
	    					var deleteBallQry = "DELETE FROM "+ballbyballTable+
						    	" WHERE ball_unique = "+ballUnique+
						    	" AND innings_id = "+currentInnings+
								" AND match_id = "+matchId;
			    			
			    			tx.executeSql(deleteBallQry,[],function(tx,res){
			    				
			    				if(ballUnique == 0.01){
			    					
			    					var deleteInningsBalls = "DELETE FROM "+ballbyballTable+
							    	" WHERE innings_id = "+currentInnings+
									" AND match_id = "+matchId;
			    					
			    					tx.executeSql(deleteInningsBalls,[],function(tx,res){
			    						
			    						var updateCurrentInnings = "UPDATE "+fullScoreTable+
		    							" SET batting_bowling_order = 0 "+
		    							" WHERE match_id = "+matchId+
		    							" AND innings_id = "+currentInnings;
			    						
			    						tx.executeSql(updateCurrentInnings,[],function(tx,res){
			    							currentInnings = currentInnings - 1;
				    						$scope.undoProcess(currentInnings);
			    						},errorHandler);
			    						
			    					},errorHandler);
			    					
						    		
						    	}
			    				else
			    					$scope.undoProcess(currentInnings);
			    				
			    			},errorHandler);
	    				}
	    				
	    			},errorHandler);
	    			
	    		}
	    		else{
	    			
	    			var deleteBallQry = "DELETE FROM "+ballbyballTable+
				    	" WHERE ball_unique = "+ballUnique+
				    	" AND innings_id = "+currentInnings+
						" AND match_id = "+matchId;
	    			
	    			tx.executeSql(deleteBallQry,[],function(tx,res){
	    				$scope.undoProcess(currentInnings);
	    			},errorHandler);
	    			
	    		}
	    		
	    	}
	    	else{
	    		
	    		var deleteBallQry = "DELETE FROM "+ballbyballTable+
		    	" WHERE match_id = "+matchId;
			
				tx.executeSql(deleteBallQry,[],function(tx,res){
					$scope.getBallInfo();
				},errorHandler);
	    		
	    	}
		
		},errorHandler);
		
	}
    
    $scope.undoProcess = function(currentInnings) {
    	
//    	alert("undoProcess ");
    	
    	db.transaction(function(tx) {
    	
	    	var findBallUnique = "SELECT MAX(ball_unique) as ballUnique FROM "+ballbyballTable+
	    	" WHERE match_id = "+matchId+
	    	" AND innings_id = "+currentInnings;
	    	
	    	tx.executeSql(findBallUnique,[],function(tx,res){
	    		
	    		var ballUnique = res.rows.item(0).ballUnique;
	    		
	    		if(ballUnique != 0){
	    			
	    			var getLastBallInfo = "SELECT * FROM "+ballbyballTable+
	    				" WHERE match_id = "+matchId+
    					" AND innings_id = "+currentInnings+
    					" AND ball_unique = "+ballUnique;
	    			
//	    			alert("getLastBallInfo "+getLastBallInfo);
	    			
	    			tx.executeSql(getLastBallInfo,[],function(tx,res){
	    				
	    				var batsmanRuns,extraRuns,extraType,
	    	    			isWicket,requiredRuns,remainingBalls,thisOverText;
	    				
	    				var strikerId,nonStrikerId,bowlerId;
	    				
	    				var overId,ballId;
	    				
	    				var currTeamRuns,currTeamWickets;
	    				
	    				strikerId = res.rows.item(0).striker_id;
	    				nonStrikerId = res.rows.item(0).non_striker_id;
	    				bowlerId = res.rows.item(0).bowler_id;
	    				
	    				overId = res.rows.item(0).over_id;
	    				ballId = res.rows.item(0).ball_id;
	    				
	    				currTeamRuns = res.rows.item(0).curr_team_runs;
	    				currTeamWickets = res.rows.item(0).curr_team_wickets;
	    				
	    				batsmanRuns = res.rows.item(0).batsman_runs;
	    				extraRuns = res.rows.item(0).extra_runs;
	    				extraType = res.rows.item(0).extra_type;
	    	    		isWicket = res.rows.item(0).is_wicket;
	    	    		requiredRuns = res.rows.item(0).required_runs;
	    	    		remainingBalls = res.rows.item(0).remaining_balls;
	    	    		thisOverText = res.rows.item(0).this_over;
		    	    	
		    	    	var teamRuns,teamWickets,teamBall,teamRequired,teamRemaining;
		    	    	
		    	    	var updateBallQryFirstPart = "UPDATE "+ballbyballTable+" SET ";
		    	    	var updateBallQryLastPart = " WHERE ball_unique = "+ballUnique+
		    		    	" AND innings_id = "+currentInnings+
		    				" AND match_id = "+matchId;
		    	    	
		    	    	var updateBallQryValuesPart = "";
		    	    	
		    	    	if(extraType != 3 && extraType != 4){
		    	    		teamBall = (ballId-1);
		    	    	}
		    	    	else{
		    	    		teamBall = (ballId);
		    	    	}
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"ball_id = "+teamBall+", ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"batsman_runs = 0, ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_runs = 0, ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_type = 0, ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"is_wicket = 0, ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"is_updated = 0, ";
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"is_synced = 0, ";
		    	    	
		    	    	teamRuns = (currTeamRuns-(batsmanRuns+extraRuns)); 
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_runs = "+teamRuns+", ";
		    	    	
		    	    	
		    	    	if(isWicket == 1){
		    	    		teamWickets = (parseInt(currTeamWickets)-1);
		    	    	}
		    	    	else{
		    	    		teamWickets = currTeamWickets;
		    	    	}
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_wickets = "+teamWickets+", ";

	    	    		teamRequired = (requiredRuns+(batsmanRuns+extraRuns));
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"required_runs = "+teamRequired+", ";
		    	    	
		    	    	if(remainingBalls > 0 && extraType < 3){
		    	    		teamRemaining = (remainingBalls + 1);
		    	    	}
		    	    	else{
		    	    		teamRemaining = remainingBalls;
		    	    	}
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"remaining_balls = "+teamRemaining+", ";
		    	    	
		    	    	var thisOverSplit = thisOverText.split(separater);
		    	    	
		    	    	var thisOverValue = "";
		    	    	
		    	    	for(var thisOverCount = 0;thisOverCount < (thisOverSplit.length-1);thisOverCount++){
		    	    		
		    	    		if(thisOverValue == "")
			    	    		thisOverValue = thisOverSplit[thisOverCount];
			    	    	else
			    	    		thisOverValue = thisOverValue+separater+thisOverSplit[thisOverCount];
		    	    		
		    	    	}
		    	    	
		    	    	updateBallQryValuesPart = updateBallQryValuesPart+"this_over = '"
		    			+thisOverValue+"' ";
		    	    	
		    	    	var newBatsmanId = 0;
		    	    	var outBatsmanId = 0;
		    	    	
		    	    	if(isWicket == 1){
		    	    	
			    	    	if(strikerId == currStrikerId || nonStrikerId == currStrikerId){
			    	    		newBatsmanId = currNonStrikerId;
			    	    	}
			    	    	else if(strikerId == currNonStrikerId || nonStrikerId == currNonStrikerId){
			    	    		newBatsmanId = currStrikerId;
			    	    	}
			    	    	
			    	    	if(strikerId == currStrikerId || strikerId == currNonStrikerId){
			    	    		outBatsmanId = nonStrikerId;
			    	    	}
			    	    	else if(nonStrikerId == currStrikerId || nonStrikerId == currNonStrikerId){
			    	    		outBatsmanId = strikerId;
			    	    	}
			    	    	
		    	    	}
		    	    	
		    	    	var getCurrentBatsman = "SELECT * FROM "+fullScoreTable+
		    	    	" WHERE player_id = "+strikerId+
	    				" AND innings_id = "+currentInnings+
	    				" AND match_id = "+matchId;
		    	    	
//		    	    	alert("getCurrentBatsman "+getCurrentBatsman);
	    	    	
		    	    	tx.executeSql(getCurrentBatsman,[],function(tx,res){
		    	    		
		    	    		var strikerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
			    	    	var strikerUpdateQryLastPart = " WHERE player_id = "+strikerId+
			    	    		" AND innings_id = "+currentInnings+
			    	    		" AND match_id = "+matchId;
			    	    	
			    	    	var strikerUpdateQryValuesPart = "";
			    	    	
			    	    	var strikerRuns = parseInt(res.rows.item(0).score_info_1)-batsmanRuns;
			    	    	
			    	    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_1 = '"+strikerRuns+"', ";
			    	    	
			    	    	var strikerBalls = parseInt(res.rows.item(0).score_info_2);
			    	    	
			    	    	if(extraType != 4)
			    	    		strikerBalls = strikerBalls-1;
			    	    		
			    			strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_2 = '"+strikerBalls+"', ";
			    	    	
			    	    	if(batsmanRuns == 4)
			    	    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_3 = '"+(parseInt(res.rows.item(0).score_info_3)-1)+"', ";
			    	    	
			    	    	if(batsmanRuns == 6)
			    	    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_4 = '"+(parseInt(res.rows.item(0).score_info_4)-1)+"', ";
			    	    	
			    	    	var strikerSR = ((strikerRuns/strikerBalls)*100).toFixed(2);
			    	    	
			    	    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_5 = '"+strikerSR+"', ";
			    	    	
			    	    	if(isWicket == 1){
				    	    	
				    	    	var getBatsmanOrder = " SELECT batting_bowling_order FROM "+fullScoreTable+
		    					" WHERE innings_id = "+currentInnings+
		    					" AND player_id = "+newBatsmanId+
		    					" AND match_id = "+matchId+
		    					" AND is_batting = 1";
				    	    	
//				    	    	alert("getBatsmanOrder "+getBatsmanOrder);
				    	    	
			    				tx.executeSql(getBatsmanOrder,[],function(tx, res){
			    					
			    					if(res.rows.length > 0){
			    					
				    					var battingOrder = res.rows.item(0).batting_bowling_order;
				    					
				    					var getMaxBattingOrder = " SELECT MAX(batting_bowling_order) as max_order FROM "+fullScoreTable+
										" WHERE innings_id = "+currentInnings+
										" AND match_id = "+matchId+
										" AND is_batting = 1";
				    					
//				    					alert("getMaxBattingOrder "+getMaxBattingOrder);
				    					
										tx.executeSql(getMaxBattingOrder,[],function(tx, res){
			    							
			    							var maxOrder = res.rows.item(0).max_order;
			    							var strikerQry;
			    							
			    							if(battingOrder == maxOrder){
			    							
				    							strikerQry = "UPDATE "+fullScoreTable+" SET" +
				    							" batting_bowling_order = 0 WHERE" +
				    							" match_id = " +matchId+
				    							" AND innings_id = "+currentInnings+
				    							" AND player_id = "+newBatsmanId+
				    							" AND is_batting = 1";
				    							
			    							}
			    							else{
			    								
			    								strikerQry = "UPDATE "+fullScoreTable+" SET" +
				    							" out_text = '"+retireHurtTxt+"' WHERE" +
				    							" match_id = " +matchId+
				    							" AND innings_id = "+currentInnings+
				    							" AND player_id = "+newBatsmanId+
				    							" AND is_batting = 1";
			    								
			    							}
			    							
//			    							alert("strikerQry "+strikerQry);
			    							
			    							tx.executeSql(strikerQry,[],function(tx, res){
			    								$scope.getBallInfo();
			    							},errorHandler);
			    							
			    						},errorHandler);
									
			    					}
			    					else{
			    						$scope.getBallInfo();
			    					}
			    					
			    				},errorHandler);
			    	    		
			    	    	}
			    	    	
			    	    	var outText = "NOT OUT";
			    	    	
			    	    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '"+outText+"' ";
			    	    	
			    	    	var nonStrikerUpdateQry = "UPDATE "+fullScoreTable+
		    	    			" SET out_text = '"+outText+
		    	    			"' WHERE player_id = "+nonStrikerId+
		    	        		" AND innings_id = "+currentInnings+
		    	        		" AND match_id = "+matchId;
			    	    	
			    	    	var strikerUpdateQry = strikerUpdateQryFirstPart+strikerUpdateQryValuesPart+strikerUpdateQryLastPart;
			    	    	console.log("Striker Info Update Ball ===> "+strikerUpdateQry);
			    	    	
//			    	    	alert("strikerUpdateQry "+strikerUpdateQry);
			    	    	
			    	    	tx.executeSql(strikerUpdateQry,[],function(tx,res){},errorHandler);
			    	    	
//			    	    	alert("nonStrikerUpdateQry "+nonStrikerUpdateQry);
			    	    	
			    	    	tx.executeSql(nonStrikerUpdateQry,[],function(tx,res){},errorHandler);
			    	    	
		    	    	},errorHandler);
		    	    	
		    	    	
		    	    	var getWicketType = "SELECT wicket_type FROM "+fullScoreWicketTable+
		    	    	" WHERE (batsman_id = "+strikerId+
		    	    	" OR batsman_id = "+nonStrikerId+")"+
	    				" AND innings_id = "+currentInnings+
	    				" AND match_id = "+matchId;
		    	    	
//		    	    	alert("getWicketType "+getWicketType);
		    	    	
		    	    	tx.executeSql(getWicketType,[],function(tx,res){
		    	    		
		    	    		var wicketType = 0;
		    	    		
		    	    		if(res.rows.length == 1)
		    	    			wicketType = res.rows.item(0).wicket_type;
		    	    		
		    	    		var getCurrentBowler = "SELECT * FROM "+fullScoreTable+
			    	    	" WHERE player_id = "+bowlerId+
		    				" AND innings_id = "+currentInnings+
		    				" AND match_id = "+matchId;
		    	    		
//		    	    		alert("getCurrentBowler "+getCurrentBowler);
		    	    	
			    	    	tx.executeSql(getCurrentBowler,[],function(tx,res){
			    	    		
			    	    		var bowlerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
				    	    	var bowlerUpdateQryLastPart = " WHERE player_id = "+bowlerId+
				    				" AND innings_id = "+currentInnings+
				    				" AND match_id = "+matchId;
				    	    	
				    	    	var bowlerUpdateQryValuesPart = "";
				    	    	
				    	    	var bowlerBallBowled = parseInt(res.rows.item(0).score_info_1);
				    	    	if(extraType != 3 && extraType != 4){
				    	    		bowlerBallBowled = bowlerBallBowled-1;
				    	    	}
				    	    	
				    	    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_1 = '"+bowlerBallBowled+"', ";
				    	    	
				    	    	if(teamBall == 6){
				    	    		
				    	    		var thisOverSplit = thisOverText.split(separater);
				    	    		
				    	    		if(thisOverSplit.length == 6){
				    	    			var thisOverRuns = 0;
				    	    			for(var i=0;i<thisOverSplit.length;i++){
				    	    				if((thisOverSplit[i].indexOf("b") > -1 && thisOverSplit[i].indexOf("nb") < 0)||(thisOverSplit[i].indexOf("b") > -1)){
				    	    					thisOverSplit[i] = "0"; 
				    	    				}
				    	    				thisOverRuns = thisOverRuns+parseInt(thisOverSplit[i]);
				    	    			}
				    	    			
				    	    			if(thisOverRuns == 0){    				
				    	    				bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_2 = '"+(parseInt(res.rows.item(0).score_info_2)-1)+"', ";
				    	    			}
				    	    			
				    	    		}
				    	    		
				    	    	}
				    	    	
				    	    	var bowlerRunsConceded = parseInt(res.rows.item(0).score_info_3)-batsmanRuns;
				    	    	
				    	    	if(extraType == 3 || extraType == 4){
				    	    		bowlerRunsConceded = bowlerRunsConceded-extraRuns;
				    	    	}
				    	    	
				    	    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_3 = '"+bowlerRunsConceded+"', ";
				    	    	
				    	    	var bowlerDotBalls = parseInt(res.rows.item(0).bowler_dotballs);    	
				    	    	if(batsmanRuns == 0 && (extraRuns == 0 || extraType<3) ){
				    	    		bowlerDotBalls -= 1;
				    	    	}
				    	    	
				    	    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" bowler_dotballs = "+bowlerDotBalls+", ";
				    	    	
				    	    	if(isWicket == 1){
				    	    		
				    	    		if(wicketType < 7 && wicketType != 0)
				    	    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+
				    	    				" score_info_4 = '"+
				    	    				(parseInt(res.rows.item(0).score_info_4)-1)+
				    	    				"', ";
				    	    		
				    	    	}
				    	    	else{
				    	    		bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+
				    	    			" score_info_4 = '"+(res.rows.item(0).score_info_4)+"', ";
				    	    	}
				    	    	
				    	    	var bowlerEcon;
				    	    	
				    	    	if(bowlerBallBowled != 0)
				    	    		bowlerEcon = ((bowlerRunsConceded/bowlerBallBowled)*6).toFixed(2);
				    	    	else
				    	    		bowlerEcon = 0;
				    	    	
				    	    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_5 = '"+bowlerEcon+"', ";
				    	    	
				    	    	var extrasSplit = new Array();
				    	    	
				    	    	var bowlerExtras =  res.rows.item(0).extra_count;
				    	    	
				    	    	if(bowlerExtras != '')    	
				    	    		extrasSplit= bowlerExtras.split(separater);
				    	    	else
				    	    		extrasSplit= ("0"+separater+"0").split(separater);
				    	    	
				    	    	if(extraType == 3){
				    	    		extrasSplit[0] = parseInt(extrasSplit[0])-1; 
				    	    	}
				    	    	else if(extraType == 4){
				    	    		extrasSplit[1] = parseInt(extrasSplit[1])-1; 
				    	    	}
				    	    	
				    	    	var extraText = extrasSplit[0]+separater+extrasSplit[1];
				    	    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" extra_count = '"+extraText+"' ";
			    	    		
			    	    		
				    	    	var bowlerUpdateQry = bowlerUpdateQryFirstPart+bowlerUpdateQryValuesPart+bowlerUpdateQryLastPart;
				    	    	console.log("Bowler Info Update Ball ===> "+bowlerUpdateQry);
				    	    	
//				    	    	alert("bowlerUpdateQry "+bowlerUpdateQry);
				    	    	
				    	    	tx.executeSql(bowlerUpdateQry,[],function(tx,res){
				    	    		
				    	    		if(isWicket != 1)
				    	    			$scope.getBallInfo();
				    	    		
				    	    	},errorHandler);
				    	    	
			    	    	},errorHandler);
		    	    		
		    	    	},errorHandler);
		    	    	
	    	    		
		    	    	
		    	    	var getFullScoreInfoQry = "SELECT * FROM "+fullScoreInfoTable+
			    	    	" WHERE innings_id = "+currentInnings+
		    				" AND match_id = "+matchId;
		    	    	
//		    	    	alert("getFullScoreInfoQry "+getFullScoreInfoQry);
		    	    	
		    	    	tx.executeSql(getFullScoreInfoQry,[],function(tx,res){
		    	    		
		    	    		var fullScoreInfoQryFirstPart = "UPDATE "+fullScoreInfoTable+" SET ";
			    	    	var fullScoreInfoQryLastPart = " WHERE innings_id = "+currentInnings+
			    				" AND match_id = "+matchId;
			    	    	
			    	    	var fullScoreInfoQryValuesPart = "";
			    	    	
			    	    	var teamExtras = new Array();
			    	    	
			    	    	var currInningsExtraStr = res.rows.item(0).extra_text;
			    	    	
			    	    	if(currInningsExtraStr != '')    	
			    	    		teamExtras = currInningsExtraStr.split(separater);
			    	    	else
			    	    		teamExtras = ("0"+separater+"0"+separater+"0"+separater+"0"+separater+"0").split(separater);
			    	    	
			    	    	if(extraType != 0){
			    	    		teamExtras[(extraType-1)] =  parseInt(teamExtras[(extraType-1)])-extraRuns;
			    	    	}
			    	    	
			    	    	var teamExtraStr = teamExtras[0]+separater+
			    	    		teamExtras[1]+separater+
			    	    		teamExtras[2]+separater+
			    	    		teamExtras[3]+separater+
			    	    		teamExtras[4];
			    	    	
			    	    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"extra_text = '"+teamExtraStr+"', ";
			    	    	
			    	    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_runs = "+teamRuns+", ";
			    	    		
			    			fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_wickets = "+teamWickets+", ";
			    			
			    			fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_overs = '"+
			    				overId+"."+teamBall+"' ";
			    			
			    			var fullScoreInfoQry = fullScoreInfoQryFirstPart+fullScoreInfoQryValuesPart+fullScoreInfoQryLastPart;
			    	    	console.log("Full Score Info Update Ball ===> "+fullScoreInfoQry);
			    	    	
//			    	    	alert("fullScoreInfoQry "+fullScoreInfoQry);
			    	    	
			    	    	tx.executeSql(fullScoreInfoQry,[],function(tx,res){},errorHandler);
		    	    		
		    	    	},errorHandler);

		    	    	
		    			
		    			var updateBallQry = updateBallQryFirstPart+updateBallQryValuesPart+updateBallQryLastPart;
		    	    	console.log("Update Ball ===> "+updateBallQry);
		    	    	
//		    	    	alert("updateBallQry "+updateBallQry);
		    	        	
	    				tx.executeSql(updateBallQry,[],function(tx,res){},errorHandler);
	    				
	    				tx.executeSql("DELETE FROM "+fullScoreWicketTable+
	    						" WHERE match_id = "+matchId+
	    						" AND innings_id = "+currentInnings+
	    						" AND (batsman_id = "+strikerId+
	    						" OR batsman_id = "+nonStrikerId+")",[],function(tx,res){},errorHandler);
		    	    	
	    			},errorHandler);
	    			
	    		}
	    		
	    	},errorHandler);
	    	
    	},errorHandler);
    	
    	$scope.unSyncLastBall();
		
	}
    
    $scope.choosenWicketTitle;
    
    var choosenWicketType;
    var wicketBatsmanRuns;
    var wicketExtraRuns;
    var wicketExtraType;
    var wicketOutBatsmanId;
    var wicketThisOverText;
    
    var wicketsFielderName;
    
    $scope.straightWicketType = 0;
    
    $scope.straightWicketReset = function() {
    	$scope.straightWicketType = 0;
    	$(".hitwicket,.lbw,.bowled").css("backgroundPosition","0px -128px");
	}
    
    $scope.straightWicketSelection = function(wicketType){
    	
    	$scope.straightWicketType = wicketType;
    	
    	$(".hitwicket,.lbw,.bowled").css("backgroundPosition","0px -128px");
    	
    	if(wicketType == 1)    	
    		$(".bowled").css("backgroundPosition","0px -150px");
    	else if(wicketType == 2)
    		$(".lbw").css("backgroundPosition","0px -150px");
    	else if(wicketType == 3)
    		$(".hitwicket").css("backgroundPosition","0px -150px");
    	
    }
    
    $scope.straightWicketDone = function() {
    	
//    	alert("$scope.straightWicketType "+$scope.straightWicketType)
    	
    	if($scope.straightWicketType == 1)    	
    		$scope.updateWickets(0,0,0,1,$scope.matchBallInfo.strikerId,'0','W');
    	else if($scope.straightWicketType == 2)
    		$scope.updateWickets(0,0,0,4,$scope.matchBallInfo.strikerId,'0','W');
    	else if($scope.straightWicketType == 3)
    		$scope.updateWickets(0,0,0,6,$scope.matchBallInfo.strikerId,'0','W');
	}

    $scope.showWicketDetails = function(wicketType) {
    	
    	$scope.straightWicketType = 0;
    	$(".hitwicket,.lbw,.bowled").css("backgroundPosition","0px -128px");
    	
    	choosenWicketType = wicketType;
    	wicketBatsmanRuns = 0;
    	wicketExtraRuns = 0;
    	wicketExtraType = 0;
    	wicketOutBatsmanId = 0;
    	wicketThisOverText = "W";
    	
    	$scope.wideSwitch = false;
        $scope.noBallSwitch = false;
        $scope.keeperSwitch = false;
    	
        $scope.wicketChoosenRuns = 0;
        $scope.choosenFielders = [];
        $scope.maxFielder = 0;
        
    	$('.wicketsList ul').hide();
    	$('.wicketDetails').removeClass("hide");
    	
    	$(".wideSwitch").hide();
    	$(".noBallSwitch").hide();
    	$(".keeperSwitch").hide();
    	$(".chooseOutBatsman").hide();
    	$(".chooseWicketFielders").hide();
    	$(".chooseWicketRuns").hide();
    	$(".fieldersList").hide();
    	
    	$(".strikerOut").css("backgroundColor","#FFF");
    	$(".nonStrikerOut").css("backgroundColor","#FFF");

    	
    	if(wicketType == 2){ // Caught
    		
    		wicketOutBatsmanId = $scope.matchBallInfo.strikerId;
    		
    		$scope.choosenWicketTitle = "Caught";
    		$(".chooseWicketFielders").show();
    		$(".keeperSwitch").show();
    		$scope.availableFielders(0);
    		
    		$scope.maxFielder = 1;
    		
    	}
    	else if(wicketType == 5){ // Stumped
    		
    		wicketOutBatsmanId = $scope.matchBallInfo.strikerId;
    		
    		$scope.choosenWicketTitle = "Stumped";
    		$(".wideSwitch").show();
    		
    	}
    	else if(wicketType == 7){ // Runout
    		
    		$scope.choosenWicketTitle = "Runout";
    		$(".chooseOutBatsman").show();
    		$(".chooseWicketRuns").show();
    		$(".chooseWicketFielders").show();
    		$scope.availableFielders(1);
    		
    		$scope.maxFielder = 4;
    		
    	}
    	else if(wicketType == 8){ // Handled Ball
    		
    		$scope.choosenWicketTitle = "Handling the Ball";
    		$(".chooseOutBatsman").show();
    		
    	}
    	else if(wicketType == 9){ // Hit Ball Twice
    		
    		wicketOutBatsmanId = $scope.matchBallInfo.strikerId;
    		
    		$scope.choosenWicketTitle = "Hit Ball Twice";
    		$(".noBallSwitch").show();
    		
    	}
    	else if(wicketType == 10){ // Obstructing the Field
    		
    		$scope.choosenWicketTitle = "Obstructing the Field";
    		$(".chooseOutBatsman").show();
    		$(".chooseWicketRuns").show();
    		
    	}
    	
    }
    
    $scope.choosingOutBatsman = function(isStriker) {
    	
    	$(".strikerOut").css("backgroundColor","#FFF");
    	$(".nonStrikerOut").css("backgroundColor","#FFF");
    	
    	if(isStriker == 1){
    		wicketOutBatsmanId = $scope.matchBallInfo.strikerId;
    		$(".strikerOut").css("backgroundColor","#5CB85C");
    	}
    	else{
    		wicketOutBatsmanId = $scope.matchBallInfo.nonStrikerId;
    		$(".nonStrikerOut").css("backgroundColor","#5CB85C");
    	}
		
	}
    
    $scope.availableFielders = function(isRunout){
    	
        $scope.fieldersList = [];
        
        db.transaction(function(tx) {
        	
        	var keeperId;
        	if($scope.keeperId != "")
        		keeperId = $scope.keeperId;
        	else
        		keeperId = 0;
        	
			var fielderQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+matchId+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
			" AND score.is_batting = 0";
			
			if(isRunout == 0)
				fielderQry = fielderQry+" AND score.player_id != "+keeperId;
			
			for(var choosenLoop = 0; choosenLoop < $scope.choosenFielders.length; choosenLoop++){
				fielderQry = fielderQry+" AND score.player_id != "+$scope.choosenFielders[choosenLoop].id;
			}
        	
        	console.log("fielderQry ==== >"+fielderQry);      	
			
			tx.executeSql(fielderQry,[],
			function(tx, res){
				
				for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
					
					var playerAttributes = res.rows.item(playerLoop).player_role.split(",");
		    		var playerRole = playerAttributes[0];
		    		
		    		var role_id = res.rows.item(playerLoop).team_role;
		    		
		    		if(playerAttributes.length == 4 && playerAttributes[3] == "yes"){
		    			playerRole = "Wicket Keeper";
		    			role_id = 5;
		    		}
		    		
		    		var jerseyNo = "0";
		    		if(res.rows.item(playerLoop).jersey_no != "undefined"){
		    			jerseyNo = res.rows.item(playerLoop).jersey_no;
		    		}
					
					var info = {
							id:res.rows.item(playerLoop).player_id,
	            			No:jerseyNo,
	            			Name:res.rows.item(playerLoop).first_name+
	            				" "+res.rows.item(playerLoop).last_name,
	            			Role:playerRole,
	            			imageUrl:res.rows.item(playerLoop).player_image,
	            			done:false,
	            			position:teamRole[role_id-1],
	            			roleId:role_id
		        	};
		    		
		    		$scope.fieldersList.push(info);
					
				}
				
				$scope.$apply();
				
			},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.choosenFielders = [];
    
    $scope.chooseFielders = function(index){    	    	
    	$scope.choosenFielders.push($scope.fieldersList[index]);
    	$(".fieldersList").hide();
    }
    
    $scope.removeFielders = function(index){    	    	
    	$scope.choosenFielders.splice(index,1);
    }
    
    $scope.wicketChoosenRuns = 0;
    
    $scope.choosingWicketRuns = function(batsmanRuns,extraRuns,extraType,displayRuns) {
    	
    	wicketBatsmanRuns = batsmanRuns;
    	wicketExtraRuns = extraRuns;
    	wicketExtraType = extraType;
    	
    	wicketThisOverText = displayRuns+"+W";
    	
    	$scope.wicketChoosenRuns = displayRuns;
    	
    	$(".wicketRunsContent ul").hide();
		
	}
    
    $scope.wicketsDone = function() {
    	
    	var fielderIds = "";
    	
    	if(wicketOutBatsmanId != 0){
    	
	    	if(choosenWicketType == 2){ // Caught
	    		
	    		if($scope.keeperSwitch){
	    			choosenWicketType = 3;
	    			fielderIds = $scope.keeperId;
	    			$scope.getKeeperName();
	    		}
	    		else if($scope.choosenFielders.length > 0){
	    			fielderIds = $scope.choosenFielders[0].id;
	    			wicketsFielderName = $scope.choosenFielders[0].Name;
	    		}
	    		else{
	    			alert("Choose one Fielder");
	    			return;
	    		}
	    		
	    	}
	    	else if(choosenWicketType == 5){ // Stumped
	    		
	    		fielderIds = $scope.keeperId;

	    		$scope.getKeeperName();
	    		
	    		if($scope.wideSwitch){
	    			wicketExtraRuns = 1;
	    			wicketExtraType = 4;
	    			wicketThisOverText = "wd+W";
	    		}
	    		
	    	}
	    	else if(choosenWicketType == 7){ // Runout
	    		
	    		if($scope.choosenFielders.length > 0){
	    			
	    			for(var fielderLoop = 0; fielderLoop < $scope.choosenFielders.length; fielderLoop++){
	    				
	    				if(fielderIds == ""){
			    			fielderIds = $scope.choosenFielders[fielderLoop].id;
			    			wicketsFielderName = $scope.choosenFielders[fielderLoop].Name;
	    				}
	    				else{
			    			fielderIds = fielderIds+separater+$scope.choosenFielders[fielderLoop].id;
			    			wicketsFielderName = wicketsFielderName+"/"+$scope.choosenFielders[fielderLoop].Name;
	    				}
	    			}
	    		}
	    		else{
	    			alert("Choose one Fielder");
	    			return;
	    		}
	    		
	    	}
	    	else if(choosenWicketType == 9){ // Hit Ball Twice
	    		
	    		if($scope.wideSwitch){
	    			wicketExtraRuns = 1;
	    			wicketExtraType = 3;
	    			wicketThisOverText = "nb+W";
	    		}
	    		
	    	}
	    	else if(choosenWicketType == 10){ // Obstructing the Field
	    		
	    	}
	    	
	    	$scope.updateWickets(wicketBatsmanRuns, wicketExtraRuns,
	    			wicketExtraType, choosenWicketType, wicketOutBatsmanId,
	    			fielderIds, wicketThisOverText);
	    	
//	    	hideOtherContent();
	    	
    	}
		
	}
    
    $scope.showFielders = function(){
    	
    	if(choosenWicketType == 2){
    		$scope.availableFielders(0);
    	}
    	else if(choosenWicketType == 7){
    		$scope.availableFielders(1);
    	}
    	
    	$(".fieldersList").show();
    }
    
    $scope.getKeeperName = function(){
    	
    	var fielderId = $scope.keeperId;
    	
    	if($scope.matchBallInfo.currMatchParticipantId != $scope.details.match_participant_id1){
		
			for(var playerLoop = 0; playerLoop < $scope.team1Squad.length;playerLoop++){
				if($scope.team1Squad[playerLoop].id == fielderId)
					wicketsFielderName = $scope.team1Squad[playerLoop].Name;
			}
		
    	}
    	else{
		
			for(var playerLoop = 0; playerLoop < $scope.team2Squad.length;playerLoop++){
				if($scope.team2Squad[playerLoop].id == fielderId)
					wicketsFielderName = $scope.team2Squad[playerLoop].Name;
			}
		
    	}
		
    }
    
//    $scope.updateWickets(batsmanRuns, extraRuns, extraType, wicketType, outBatsmanId, fielderIds, thisOverText)
    
}



function showWicketRuns(){
	$(".wicketRunsContent ul").show();
}


var matchAttributesJSON = {};
var ballByBallJSON = [];
var fullScoreJSON = [];
var fullScoreOthersJSON = [];

var syncedBallUnique = "", syncedInnings = "";

function syncScore(){
	
	setTimeout(syncScore, 5000);
	
	matchAttributesJSON = {};
	ballByBallJSON = [];
	fullScoreJSON = [];
	fullScoreOthersJSON = [];

	
	
	
	db.transaction(function(tx) {
		
		var getNonSyncData = "SELECT * FROM "+ballbyballTable+
			" WHERE match_id = "+matchId+
			" AND is_updated = 1"+
			" AND is_synced != 1"+
			" ORDER BY id";
    	
		tx.executeSql(getNonSyncData,[],function(tx,res){
			
			var ballLength = res.rows.length;
			
			for(var ballCount = 0; ballCount < ballLength; ballCount++){
				
				syncedBallUnique = "";
				syncedInnings = "";
				
				var ballInfo = {};
				
				ballInfo["match_id"] = matchId;
				ballInfo["over"] = res.rows.item(ballCount).over_id;
				ballInfo["ball_no"] = res.rows.item(ballCount).ball_id;
				ballInfo["ball_unique"] = res.rows.item(ballCount).ball_unique;
				ballInfo["runs"] = res.rows.item(ballCount).batsman_runs;
				ballInfo["bowler_id"] = res.rows.item(ballCount).bowler_id;
				ballInfo["batsman_id"] = res.rows.item(ballCount).striker_id;
				ballInfo["is_extra"] = res.rows.item(ballCount).extra_type;
				ballInfo["extra_run"] = res.rows.item(ballCount).extra_runs;
				ballInfo["is_wicket"] = res.rows.item(ballCount).is_wicket;
				ballInfo["non_striker_id"] = res.rows.item(ballCount).non_striker_id;
				ballInfo["inn_num"] = res.rows.item(ballCount).innings_id;
				ballInfo["team_id"] = "";
				ballInfo["out_batsmen_id"] = "";
				ballInfo["fielder_id1"] = "";
				ballInfo["fielder_id2"] = "";
				ballInfo["fielder_id3"] = "";
				ballInfo["wicket_type"] = "";
				ballInfo["curr_team_runs"] = res.rows.item(ballCount).curr_team_runs;
				ballInfo["curr_team_wickets"] = res.rows.item(ballCount).curr_team_wickets;
				ballInfo["required_runs"] = res.rows.item(ballCount).required_runs;
				ballInfo["remaining_balls"] = res.rows.item(ballCount).remaining_balls;
				ballInfo["this_over"] = res.rows.item(ballCount).this_over;
				
				ballByBallJSON.push(ballInfo);
				
				syncedBallUnique = ballInfo["ball_unique"];
				syncedInnings = ballInfo["inn_num"];
				
			}
			
			if(ballLength != 0){
				
				var getMatchAttributes = "SELECT * FROM "+matchAttributes+
					" WHERE match_id = "+matchId;
				
				tx.executeSql(getMatchAttributes,[],function(tx,res){
					
					var matchAttributesInfo = {};
					
					matchAttributesInfo["toss_won_by_team"] = res.rows.item(0).toss_won_by;
					matchAttributesInfo["result"] = res.rows.item(0).result;
					matchAttributesInfo["team_decision"] = res.rows.item(0).toss_decision;
					matchAttributesInfo["total_overs"] = res.rows.item(0).total_overs;
					matchAttributesInfo["inn_type"] = res.rows.item(0).innings_count;
					matchAttributesInfo["lastman_batting"] = res.rows.item(0).is_last_man_batting;
					matchAttributesInfo["match_status"] = res.rows.item(0).match_status;
					matchAttributesInfo["is_follow_on"] = res.rows.item(0).is_following;
					matchAttributesInfo["mom_id"] = res.rows.item(0).mom_id;
					
					matchAttributesJSON = matchAttributesInfo;
//					.push(matchAttributesInfo);
					
				},errorHandler);
					
				var getFullScoreData = "SELECT * FROM "+fullScoreTable+
					" WHERE match_id = "+matchId+
					" AND is_batting = 1"+
					" ORDER BY innings_id";
	    	
				tx.executeSql(getFullScoreData,[],function(tx,res){
					
					var fullScoreLength = res.rows.length;
					
					for(var fullScorePlayerLoop = 0; fullScorePlayerLoop < fullScoreLength; fullScorePlayerLoop++){
						
						var getFullScoreBatsmanData = "SELECT * FROM "+fullScoreTable+
							" WHERE match_id = "+matchId+
							" AND player_id = "+res.rows.item(fullScorePlayerLoop).player_id+
							" AND innings_id = "+res.rows.item(fullScorePlayerLoop).innings_id;
						
						tx.executeSql(getFullScoreBatsmanData,[],function(tx,res){
							
							var fullScorePlayerInfo = {};
							
							fullScorePlayerInfo["match_id"] = matchId;
							fullScorePlayerInfo["match_participant_id"] = res.rows.item(0).match_participant_id;
							
							fullScorePlayerInfo["innings"] = res.rows.item(0).innings_id;
							fullScorePlayerInfo["batsmanid"] = res.rows.item(0).player_id;
							
							fullScorePlayerInfo["runs"] = res.rows.item(0).score_info_1;
							fullScorePlayerInfo["balls"] = res.rows.item(0).score_info_2;
							fullScorePlayerInfo["four"] = res.rows.item(0).score_info_3;
							fullScorePlayerInfo["sixer"] = res.rows.item(0).score_info_4;
							fullScorePlayerInfo["str_rate"] = res.rows.item(0).score_info_5;
							
							fullScorePlayerInfo["out_text"] = res.rows.item(0).out_text;					
							fullScorePlayerInfo["batted_order_no"] = res.rows.item(0).batting_bowling_order;
							
							if(fullScorePlayerInfo["batted_order_no"] != 0)					
								fullScorePlayerInfo["batted"] = "1";
							else
								fullScorePlayerInfo["batted"] = "0";
							
							fullScorePlayerInfo["batsmanname"] = "";
							fullScorePlayerInfo["status"] = "";
							
							fullScorePlayerInfo["role_id"] = res.rows.item(0).role_id;
							
							
							
							var bowlingInnings;
							
							if(parseInt(fullScorePlayerInfo["innings"]) % 2 == 0 && parseInt(fullScorePlayerInfo["innings"]) != 0){
								bowlingInnings = parseInt(fullScorePlayerInfo["innings"])-1;
							}
							else
								bowlingInnings = parseInt(fullScorePlayerInfo["innings"])+1;
							
							
							var getFullScoreBowlerData = "SELECT * FROM "+fullScoreTable+
								" WHERE match_id = "+matchId+
								" AND player_id = "+fullScorePlayerInfo["batsmanid"]+
								" AND innings_id = "+bowlingInnings;
							
							tx.executeSql(getFullScoreBowlerData,[],function(tx,res){
								
								fullScorePlayerInfo["bowled_order_no"] = res.rows.item(0).batting_bowling_order;
								fullScorePlayerInfo["bow_runs"] = res.rows.item(0).score_info_3;
								fullScorePlayerInfo["bow_balls"] = res.rows.item(0).score_info_1;
								fullScorePlayerInfo["bow_over"] = ballstoOver(fullScorePlayerInfo["bow_balls"]);
								fullScorePlayerInfo["bow_economy"] = res.rows.item(0).score_info_5;
								fullScorePlayerInfo["bow_wickets"] = res.rows.item(0).score_info_4;
								fullScorePlayerInfo["bow_dotball"] = res.rows.item(0).bowler_dotballs;
								fullScorePlayerInfo["bow_maidens"] = res.rows.item(0).score_info_2;
								fullScorePlayerInfo["extras_count"] = res.rows.item(0).extra_count;
								
								var getFullScoreWicketData = "SELECT * FROM "+fullScoreWicketTable+
									" WHERE match_id = "+matchId+
									" AND batsman_id = "+fullScorePlayerInfo["batsmanid"]+
									" AND innings_id = "+fullScorePlayerInfo["innings"];
								
								tx.executeSql(getFullScoreWicketData,[],function(tx,res){
									
									if(res.rows.length > 0){
									
										fullScorePlayerInfo["wbowlerid"] = res.rows.item(0).bowler_id
										fullScorePlayerInfo["wbowlername"] = "";
										fullScorePlayerInfo["wfielderid1"] = res.rows.item(0).fielder_id_1;
										fullScorePlayerInfo["wfieldername1"] = "";
										fullScorePlayerInfo["wfielderid2"] = res.rows.item(0).fielder_id_2;
										fullScorePlayerInfo["wfieldername2"] = "";
										fullScorePlayerInfo["wfielderid3"] = res.rows.item(0).fielder_id_3;
										fullScorePlayerInfo["wfieldername3"] = "";
										fullScorePlayerInfo["wfielderid4"] = res.rows.item(0).fielder_id_4;
										fullScorePlayerInfo["wfieldername4"] = "";
										fullScorePlayerInfo["out_type_id"] = res.rows.item(0).wicket_type;
										fullScorePlayerInfo["fall_of_wicket"] = res.rows.item(0).fall_of_wickets;
										fullScorePlayerInfo["wicket_number"] = res.rows.item(0).wicket_number;
									
									}
									else{
										
										fullScorePlayerInfo["wbowlerid"] = "0";
										fullScorePlayerInfo["wbowlername"] = "";
										fullScorePlayerInfo["wfielderid1"] = "0";
										fullScorePlayerInfo["wfieldername1"] = "";
										fullScorePlayerInfo["wfielderid2"] = "0";
										fullScorePlayerInfo["wfieldername2"] = "";
										fullScorePlayerInfo["wfielderid3"] = "0";
										fullScorePlayerInfo["wfieldername3"] = "";
										fullScorePlayerInfo["wfielderid4"] = "0";
										fullScorePlayerInfo["wfieldername4"] = "";
										fullScorePlayerInfo["out_type_id"] = "0";
										fullScorePlayerInfo["fall_of_wicket"] = "";
										fullScorePlayerInfo["wicket_number"] = "0";
										
									}
									
									fullScoreJSON.push(fullScorePlayerInfo);
									
									if(fullScoreJSON.length == fullScoreLength)
										sendScore();
									
								},errorHandler);
								
							},errorHandler);
							
						},errorHandler);
						
					}
					
				},errorHandler);
				
				var getFullInfoData = "SELECT * FROM "+fullScoreInfoTable+
					" WHERE match_id = "+matchId;
		
				tx.executeSql(getFullInfoData,[],function(tx,res){
					
					var infoLength = res.rows.length;
					
					for(var inningsCount = 0; inningsCount < infoLength; inningsCount ++ ){
						
						var fullScoreInningsInfo = {};
						
						fullScoreInningsInfo["match_id"] = matchId;
						fullScoreInningsInfo["match_participant_id"] = res.rows.item(inningsCount).match_participant_id;
						fullScoreInningsInfo["innings_id"] = res.rows.item(inningsCount).innings_id;
						fullScoreInningsInfo["team_overs"] = res.rows.item(inningsCount).team_overs;
						fullScoreInningsInfo["team_runs"] = res.rows.item(inningsCount).team_runs;
						fullScoreInningsInfo["team_wickets"] = res.rows.item(inningsCount).team_wickets;
						fullScoreInningsInfo["keeper_id"] = res.rows.item(inningsCount).keeper_id;
						fullScoreInningsInfo["extras_text"] = res.rows.item(inningsCount).extra_text;
						fullScoreInningsInfo["is_declare"] = res.rows.item(inningsCount).is_declare;
						
						fullScoreOthersJSON.push(fullScoreInningsInfo);
						
					}
					
				},errorHandler);
				
			}
				
		},errorHandler);
		
	},errorHandler);
	
}

function matchSync(){
	 
	 var soapRequest = soapMsgStart + '<matchSync xmlns="'+webserviceURL+'"> \
	 <match_id>' + matchId + '</match_id> \
	 <access_key>' + access_key + '</access_key> \
	 </matchSync> \ ' + soapMsgEnd;
	 
//	 console.log("soapRequest  ===>  "+JSON.stringify(fullDetails));
	 
	 $.ajax({
	    type: "POST",
	    url: webserviceURL,
	    contentType: "text/xml",
	    dataType: "xml",
	    data: soapRequest,
	    success: function() {
    		setTimeout(matchSync, 10000);
		},
	    error: function() {
	    	setTimeout(matchSync, 10000);
		}
	 });
	
}


function sendScore(){
	
	var fullDetailsVal = {};
	
	var fullDetails = [];
	
	fullDetailsVal["match_id"] = matchId;
	
	fullDetailsVal["ballbyball"] = ballByBallJSON;
	fullDetailsVal["fullscore"] = fullScoreJSON;
	fullDetailsVal["fullscoreOthers"] = fullScoreOthersJSON;
	fullDetailsVal["matchattr"] = matchAttributesJSON;
	
	fullDetails.push(fullDetailsVal);
	 
	 var soapRequest = soapMsgStart + '<matchScore xmlns="'+webserviceURL+'"> \
	 <access_key>' + access_key + '</access_key> \
	 <score>' + JSON.stringify(fullDetails) + '</score> \
	 </matchScore> \ ' + soapMsgEnd;
	 
	 console.log("soapRequest  ===>  "+JSON.stringify(fullDetails));
	 
	 console.log("soapRequest  ===>  "+soapRequest);
	 
	 $.ajax({
	    type: "POST",
	    url: webserviceURL,
	    contentType: "text/xml",
	    dataType: "xml",
	    data: soapRequest,
	    success: sendScoreSuccess,
	    error: sendScoreError
	 });
	
}

function sendScoreSuccess(data, status, req){
	
	db.transaction(function(tx) {
		
		if(syncedInnings != ""){
		
			var updateSyncInningsData = "UPDATE "+ballbyballTable+
	    		" SET is_synced = 1"+
	    		" WHERE match_id = "+matchId+
	    		" AND innings_id < "+syncedInnings;
	    	
			tx.executeSql(updateSyncInningsData,[],function(tx,res){
				
			},errorHandler);
		
		}
		
		if(syncedBallUnique != "" && syncedInnings != ""){
		
			var updateSyncBallData = "UPDATE "+ballbyballTable+
			" SET is_synced = 1"+
			" WHERE match_id = "+matchId+
			" AND innings_id = "+syncedInnings+
			" AND ball_unique <= "+syncedBallUnique;
		
			tx.executeSql(updateSyncBallData,[],function(tx,res){
			},errorHandler);
		
		}
		
	},errorHandler);
	
}

function sendScoreError(data, status, req){
}


var retirePlayerId = "";

var retireHurtTxt = "Retried Hurt";

function sendToss(){
	
	var fullDetailsVal = {};
	
	var fullDetails = [];
	
	fullDetailsVal["match_id"] = matchId;
	fullDetailsVal["matchattr"] = matchAttrJSON;
	fullDetailsVal["playerattr"] = playerAttrJSON;
	
	fullDetails.push(fullDetailsVal);
	
//	 var soapRequest = soapMsgStart + '<matchToss xmlns="'+webserviceURL+'"> \
//	 <match_id>' + matchId + '</match_id> \
//	 <matchattr>' + JSON.stringify(matchAttrJSON) + '</matchattr> \
//	 <playerattr>' + JSON.stringify(playerAttrJSON) + '</playerattr> \
//	 </matchToss> \ ' + soapMsgEnd;
	 
	 var soapRequest = soapMsgStart + '<matchToss xmlns="'+webserviceURL+'"> \
	 <access_key>' + access_key + '</access_key> \
	 <full_details>' + JSON.stringify(fullDetails) + '</full_details> \
	 </matchToss> \ ' + soapMsgEnd;
	 
	 console.log("soapRequest  ===>  "+soapRequest);
	 
	 $.ajax({
	    type: "POST",
	    url: webserviceURL,
	    contentType: "text/xml",
	    dataType: "xml",
	    data: soapRequest,
	    success: sendTossSuccess,
	    error: sendTossError
	 });
	
}

function sendTossSuccess(data, status, req){
	angularScope.saveToss();
}

function sendTossError(data, status, req){
	angularScope.saveToss();
}

function runRateCalculation(runs,overs){
	
	var splitOvers = overs.split(".");
	
	var totalBalls = 0;
	if(splitOvers.length > 1)
		totalBalls = ( parseInt(splitOvers[0])*6 ) + parseInt(splitOvers[1]);
	else
		totalBalls = 0;
	
	var runRate = 0.0;	
	if(totalBalls != 0)
		runRate = parseFloat((parseInt(runs) / totalBalls)*6);
	else
		runRate = parseFloat(0.0);
	
	runRate = runRate.toFixed(2);
	
	return runRate;
	
}

function ballstoOver(balls){
	
	var oversFloat = parseInt(balls);
	var overs = parseInt(oversFloat/6);
	var balls = oversFloat%6;
	var combinedOvers = overs+"."+balls;
	
	return combinedOvers;
}

function showInfo(detailsClass){
	
	if((!$('.strikerDetails').hasClass("hide") 
			|| !$('.nonStrikerDetails').hasClass("hide") 
			|| !$('.bowlerDetails').hasClass("hide")))
		hideInfo();
	else	
		$('.'+detailsClass).removeClass("hide");
}

function hideInfo(){
	$('.strikerDetails,.nonStrikerDetails,.bowlerDetails').addClass("hide");
}

function showChangeKeeper(){
	
	angularScope.keeperOptions();
	
	$(".keeperLists").removeClass("hide");
	$(".bowlerLists").addClass("hide");
}

function showOtherContent(className){
	
	if(className == "wicketsList"){
		$('.wicketsList ul').show();
		$('.wicketDetails').addClass("hide");
	}
	
	$("."+className).removeClass("hide");
	$(".entryControls").addClass("hide");
}

function hideOtherContent(){
	$(".extrasContent,.otherOptions,.batsmanLists,.bowlerLists,.keeperLists,.wicketsList,.manoftheMatchList").addClass("hide");
	$(".entryControls").removeClass("hide");
}

//function showExtraDetails(){
//	$(".extrasContent").removeClass("hide");
//	$(".entryControls").addClass("hide");
//}
//
//function hideExtraDetails(){
//	$(".extrasContent").addClass("hide");
//	$(".entryControls").removeClass("hide");
//}
//
//function showOtherOptions(){
//	$(".otherOptions").removeClass("hide");
//	$(".entryControls").addClass("hide");
//}
//
//function hideOtherOptions(){
//	$(".otherOptions").addClass("hide");
//	$(".entryControls").removeClass("hide");
//}

function showPopup(popupId){
	$(popupId).popup('show');
}

function hidePopup(popupId){
	$(popupId).popup('hide');
}

function popupYes(popupNum) {
	
	if(popupNum == 1){
		
		if(matchServerStatus == "N"){
			restoreGetScoreNextData();
		}
		else{
			restoreGetScoreData();
		} 
		
		hidePopup(syncConfirmationPopup);
		
	}
	else if(popupNum == 2){
		
		db.transaction(function(tx) {
    		
    		var updateInningsto5 = "UPDATE "+fullScoreTable+
	    		" SET innings_id = 5"+
	    		" WHERE match_id="+matchId+
	    		" AND innings_id = 4";
        	
			tx.executeSql(updateInningsto5,[],function(tx,res){
				
				var updateInningsto4 = "UPDATE "+fullScoreTable+
		    		" SET innings_id = 4"+
		    		" WHERE match_id="+matchId+
		    		" AND innings_id = 3";
	        	
				tx.executeSql(updateInningsto4,[],function(tx,res){
					
					var updateInningsto3 = "UPDATE "+fullScoreTable+
			    		" SET innings_id = 3"+
			    		" WHERE match_id="+matchId+
			    		" AND innings_id = 5";
		        	
					tx.executeSql(updateInningsto3,[],function(tx,res){
					
					},errorHandler);
				
				},errorHandler);
			
			},errorHandler);
			
			var upadateMatchAttr = "UPDATE "+matchAttributes+
			" SET is_following = 1 "+
			" WHERE match_id = "+matchId;
			
			tx.executeSql(upadateMatchAttr,[],function(){},errorHandler);
			
			var updateInfoInningsto5 = "UPDATE "+fullScoreInfoTable+
	    		" SET innings_id = 5"+
	    		" WHERE match_id="+matchId+
	    		" AND innings_id = 4";
        	
			tx.executeSql(updateInfoInningsto5,[],function(tx,res){
				
				var updateInfoInningsto4 = "UPDATE "+fullScoreInfoTable+
		    		" SET innings_id = 4"+
		    		" WHERE match_id="+matchId+
		    		" AND innings_id = 3";
	        	
				tx.executeSql(updateInfoInningsto4,[],function(tx,res){
					
					var updateInfoInningsto3 = "UPDATE "+fullScoreInfoTable+
			    		" SET innings_id = 3"+
			    		" WHERE match_id="+matchId+
			    		" AND innings_id = 5";
		        	
					tx.executeSql(updateInfoInningsto3,[],function(tx,res){
						
						angularScope.insertNewBall();
						hidePopup(followingOnPopup);
						
					},errorHandler);
				
				},errorHandler);
			
			},errorHandler);
			
    	},errorHandler);
		
	}
	else if(popupNum == 3){
		
		var matchResult = $("#matchResult").val();
		
		if(matchResult != undefined 
				&& matchResult != ""){
			
			hidePopup(matchEndPopup);
			
			angularScope.matchEnd(matchResult);
			
		}
		else{
			alert("Please enter the match result");
		}
		
	}
	else if(popupNum == 4){
		
		var revisedTarget = $("#revisedTarget").val();
		
		if(revisedTarget != undefined &&
				revisedTarget != "" &&
				!isNaN(revisedTarget)){
			
			db.transaction(function(tx) {
	    		
	    		var updateTarget = "UPDATE "+ballbyballTable+
		    		" SET required_runs = "+revisedTarget+
		    		" WHERE match_id = "+matchId+
		    		" AND is_updated = 0";
	        	
				tx.executeSql(updateTarget,[],function(tx,res){
					hidePopup(changeTargetPopup);
				},errorHandler);
				
	    	},errorHandler);
			
		}
		else{
			alert("Please enter vaild target");
		}
		
	}
	else if(popupNum == 5){
		
		var revisedOvers = $("#revisedOvers").val();
		
		if(revisedOvers != undefined &&
				revisedOvers != "" &&
				!isNaN(revisedOvers)){
			
			db.transaction(function(tx) {
				
				var getUsedBalls = "SELECT * FROM "+ballbyballTable+
					" WHERE match_id="+matchId+" AND is_updated=0";
			
				tx.executeSql(getUsedBalls,[],function(tx,res){
					
					var usedBalls;
					
					usedBalls = parseInt(res.rows.item(0).over_id)*6;
					usedBalls = usedBalls+parseInt(res.rows.item(0).ball_id);
					
					var remainingBalls = (revisedOvers*6)-usedBalls;
					
					if(remainingBalls < 0){
						alert("Revised overs should not be less than bowled overs");
					}
					else{
						
						var updateOvers = "UPDATE "+matchAttributes+
				    		" SET total_overs = "+revisedOvers+
				    		" WHERE match_id = "+matchId;
			        	
						tx.executeSql(updateOvers,[],function(tx,res){
							
							if(angularScope.nextBallInfo.inningsId == (angularScope.matchAttributes.inningsCount*2)){
								
								var updateRemainingBalls = "UPDATE "+ballbyballTable+
						    		" SET remaining_balls = "+remainingBalls+
						    		" WHERE match_id = "+matchId+
						    		" AND is_updated=0";
					        	
								tx.executeSql(updateRemainingBalls,[],function(tx,res){
									hidePopup(changeOversPopup);
								},errorHandler);
								
							}
							else{
								hidePopup(changeOversPopup);
							}
							
						},errorHandler);
						
					}
					
				},errorHandler);
				
	    	},errorHandler);
			
		}
		else{
			alert("Please enter vaild overs");
		}
		
	}
	else if(popupNum == 6){
		hidePopup(changeStrikerPopup);
		angularScope.retireBatsman(0);
	}
	else if(popupNum == 7){
		hidePopup(changeNonStrikerPopup);
		angularScope.retireBatsman(1);
	}
	else if(popupNum == 8){
		hidePopup(noMOMPopup);
		angularScope.updateMOM(0);
		hideOtherContent();
	}
	else if(popupNum == 9){
		hidePopup(endInningsPopup);
		hideOtherContent();
		angularScope.inningsEnd();
	}
	else if(popupNum == 10){
		angularScope.undoProcess(angularScope.matchBallInfo.currentInnings);
		hidePopup(inningsEndNotifyPopup);
	}
}

function popupNo(popupNum) {
	
	if(popupNum == 1){
		
		if(matchLocalStatus == "")
			restoreGetScoreNextData();
		
		hidePopup(syncConfirmationPopup);
	}
	else if(popupNum == 2){
		hidePopup(followingOnPopup);
		angularScope.insertNewBall();
	}
	else if(popupNum == 3){
		hidePopup(matchEndPopup);
	}
	else if(popupNum == 4){
		hidePopup(changeTargetPopup);
	}
	else if(popupNum == 5){
		hidePopup(changeOversPopup);
	}
	else if(popupNum == 6){
		hidePopup(changeStrikerPopup);
	}
	else if(popupNum == 7){
		hidePopup(changeNonStrikerPopup);
	}
	else if(popupNum == 8){
		hidePopup(noMOMPopup);
		hideOtherContent();
	}
	else if(popupNum == 9){
		hidePopup(endInningsPopup);
	}
	else if(popupNum == 10){
		angularScope.endInningsNotify();
		hidePopup(inningsEndNotifyPopup);
	}
	
}

function backButton(){
	
//	alert("back");
	
	if(!$(".manoftheMatchList").hasClass("hide")){
//		alert("manoftheMatchList");
		showPopup('#noMOMPopup');
	}
	else if(!$('.wicketDetails').hasClass("hide")){
//		alert("wicketDetails");
		$('.wicketDetails').addClass("hide");
		$('.wicketsList ul').show();
	}
	else if(!$(".extrasContent").hasClass("hide") 
			|| !$(".otherOptions").hasClass("hide") 
			|| !$(".wicketsList").hasClass("hide")){
//		alert("extrasContent");
		hideOtherContent();
	}
	else if((!$('.strikerDetails').hasClass("hide") 
			|| !$('.nonStrikerDetails').hasClass("hide") 
			|| !$('.bowlerDetails').hasClass("hide"))){
//		alert("strikerDetails");
		hideInfo();
	}	
	else{
		history.back(1);
	}
	
}
