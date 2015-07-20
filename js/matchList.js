var db;

var todayMatches = new Array();

var upcomingMatches = new Array();

var pastMatches = new Array();

var plapp = angular.module('plapp', []);

var accessKey = "";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady()
{
    //angular.bootstrap(document, ['app']);
    
	//alert("device Ready");
    
    document.addEventListener("backbutton", function() {
    
	   navigator.app.exitApp();
	    
	}, false);
    
    db = window.sqlitePlugin.openDatabase({name: "playingaDB"});
    
    $("#addMatchPopup").popup();
    $("#logoutConfirmPopup").popup();
    
    db.transaction(function(tx) {
    
		tx.executeSql("select id, access_key, type, social_id, user_id from " + userTableName + " where is_active=1;", [],
	    	function(tx, res) {                                  
				if(res.rows.length > 0)
				{
					socialId = res.rows.item(0).social_id;
					type = res.rows.item(0).type;
					accessKey = res.rows.item(0).access_key; 
					
//					alert("socialId "+socialId +" type "+type)
					
					syncMatch();
					
					getMatchList(socialId,type);
				}
			}, errorHandler);
			
    }, errorHandler);
    
    function getMatchList(socialId,type){
    
    	var soapRequest = soapMsgStart + '<getMatchesList xmlns="'+webserviceURL+'"> \
            <social_id>' + socialId + '</social_id> \
            <type>' + type + '</type> \
            <access_key>' + accessKey + '</access_key> \
            </getMatchesList> \ ' + soapMsgEnd;
            
            $.ajax({
               type: "POST",
               url: webserviceURL,
               contentType: "text/xml",
               dataType: "xml",
               data: soapRequest,
               success: responseSuccess,
               error: responseError
           });
    
    }
    
    
    function responseSuccess(data, status, req){
    
	    var responseXML = $(req.responseXML);
	    var parametersList = ["match_id", "game_id", "type_id", "play_type", "name", "created_by",
	                          "created_by_type", "match_date", "result", "full_address", "lat", "long",
	                          "tournamentName", "gameName", "tournamentPhotoUrl", "match_status",
	                          "player_info", "require_partner", "image_path", "score_edit",
	                          "matchParticipantIds", "inn_type", "match_format"];
	    var matchVals = new Array();
	    var arrLoop = 0;
	    var matchesCount = responseXML.find("match_id").length;
	    
//	    alert("response "+req.responseText);
//	    
//	    console.log("response "+responsetext);
	    
	    for(var arrayLoop = 0; arrayLoop < matchesCount; arrayLoop++)
        {
            matchVals[arrayLoop] = new Array();
        }
        
        $.each(parametersList, function(index, value){
                           
            var incLoop = 0;
            responseXML.find(value).each(function(){
                matchVals[incLoop][value] = $(this).text();
                matchVals[incLoop][value] = matchVals[incLoop][value].replace(/'/g,"''");
                
                if(value == "inn_type" && matchVals[incLoop]["inn_type"] == "")                            
                	matchVals[incLoop]["inn_type"] = 0;
                
//                alert(" matchVals[incLoop][value] "+matchVals[incLoop][value]);
                
                incLoop++;
            });
               
       });
       
       if(matchesCount > 0)
       {
	       var valuesQry = "";
	       var insertQry = "INSERT INTO " + matchesTableName +
       		" (match_id, game_id, type_id, play_type, name, created_by,"+
    		" created_by_type, match_date, result, venue, latitude, longitude,"+
    		" tournament_name, game_name, tournament_photo_url, match_status, player_info,"+
    		" require_partner, image_path, score_edit, inn_type, match_format) VALUES ";
	       var insertParticipantQry = "INSERT INTO " + matchParticipants + " (match_id, match_participant_id, participant_id, participant_name, partner_id, partner_name) VALUES ";
	       var valuesPartQry = "";
	       
	       db.transaction(function(tx) {
		       
		       for(var matchLoop = 0; matchLoop < matchesCount; matchLoop++)
		       {
					var qryStr = "SELECT count(*) as cnt FROM matches WHERE match_id='"+matchVals[matchLoop]["match_id"]+"';";
					//alert(matchVals[matchLoop]["player_info"]);
					
					tx.executeSql(qryStr, [], (function(matchLoop){
						
						return function(tx,res) //success function
						{
							
							if(res.rows.item(0).cnt <= 0)
							{
								var commaStr = "";
								var valuesStr = "";
								var commaPartStr = "";
								var valuesPartStr = "";
								
								valuesStr = "(" + matchVals[matchLoop]["match_id"] + ", '" + matchVals[matchLoop]["game_id"] + "', '" + matchVals[matchLoop]["type_id"];
								valuesStr = valuesStr + "', '" + matchVals[matchLoop]["play_type"] + "', '" + matchVals[matchLoop]["name"] + "', " + matchVals[matchLoop]["created_by"];
								valuesStr = valuesStr + ", '" + matchVals[matchLoop]["created_by_type"] + "', '" + matchVals[matchLoop]["match_date"] + "', '" + matchVals[matchLoop]["result"];
								valuesStr = valuesStr +  "', '" + matchVals[matchLoop]["full_address"] + "', '" + matchVals[matchLoop]["lat"] + "', '" + matchVals[matchLoop]["long"];
								valuesStr = valuesStr +  "', '" + matchVals[matchLoop]["tournamentName"] + "', '" + matchVals[matchLoop]["gameName"];
								valuesStr = valuesStr + "', '" + matchVals[matchLoop]["tournamentPhotoUrl"] + "', '" + matchVals[matchLoop]["match_status"];
								valuesStr = valuesStr + "', '" + matchVals[matchLoop]["player_info"] +  "', '" + matchVals[matchLoop]["require_partner"];
								valuesStr = valuesStr + "', '" + matchVals[matchLoop]["image_path"];
								valuesStr = valuesStr + "', " + matchVals[matchLoop]["score_edit"] +
									", " + matchVals[matchLoop]["inn_type"] +
									", '" + matchVals[matchLoop]["match_format"] +"' )";
								
								if(valuesQry == "")
								{
									commaStr = " ";
								}
								else
								{
									commaStr = " , ";
								}
								
								valuesQry = valuesQry + commaStr + valuesStr;
								
								var matchParticipantIds = matchVals[matchLoop]["matchParticipantIds"].split(",");
								var playerDet = matchVals[matchLoop]["player_info"].split(",");
								var playersLen = playerDet.length;
								var playerDetails = new Array();
								
								for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
								{
									var indexNum = arrLoop + 1;
									var indPlayerDet = playerDet[arrLoop].split("###");
									playerDetails["name"+indexNum] = indPlayerDet[1];
									playerDetails["id"+indexNum] = indPlayerDet[0];
									
									if(arrLoop == 1 && playerDet.length <= 2)
									{
										var indexNum2 = arrLoop + 2;
										var indexNum3 = arrLoop + 3;
										playerDetails["name"+indexNum2] = playerDetails["name"+indexNum];
										playerDetails["id"+indexNum2] = playerDetails["id"+indexNum];
										playerDetails["name"+indexNum] = "";
										playerDetails["id"+indexNum] = "";
										playerDetails["name"+indexNum3] = "";
										playerDetails["id"+indexNum3] = "";
									}
								}
								
								valuesPartStr = "(" + matchVals[matchLoop]["match_id"] + ", '" + matchParticipantIds[0] + "', '" + playerDetails["id1" ]+ "', '" + playerDetails["name1"];
								valuesPartStr = valuesPartStr + "', '" + playerDetails["id2" ]+ "', '" + playerDetails["name2"] + "')";
								valuesPartStr = valuesPartStr + ", (" + matchVals[matchLoop]["match_id"] + ", '" + matchParticipantIds[1] + "', '" + playerDetails["id3" ];
								valuesPartStr = valuesPartStr + "', '" + playerDetails["name3"] + "', '" + playerDetails["id4" ]+ "', '" + playerDetails["name4"] + "')";
								
								if(valuesPartQry == "")
								{
									commaPartStr = " ";
								}
								else
								{
									commaPartStr = " , ";
								}
								
								valuesPartQry = valuesPartQry + commaPartStr + valuesPartStr;
								
		                    }
		                    
			                if(matchLoop == matchesCount - 1 && valuesQry != "")
			                {
			                	//alert(insertQry + valuesQry);
			                	tx.executeSql(insertQry + valuesQry,[], function(tx, res) {
			                	
			                		tx.executeSql(insertParticipantQry + valuesPartQry,[], function(tx, res) {
			                		
			                			getMatchesFromDB(1);			                			
//			                			alert("Query Executed");
			                			
		                			}, errorHandler);
		                			
		            			}, errorHandler);
		            			
		        			}
		        			else if(matchLoop == matchesCount - 1 && valuesQry == ""){
		        				
		        				getMatchesFromDB(0);
					
								/*$('.site-wrapper').ready(function() {
					                angular.bootstrap($('.site-wrapper'), ['plapp']);
					            });*/
								
							}
		        			
		    			};
		    			
					})(matchLoop), errorHandler);
					
				}
				
				
				
			}, errorHandler);
			
       }
       else{
    	   getMatchesFromDB(0);
       }
		
	}
    
    function responseError(data, status, req){
    
//    	alert("auth"+status);
    	
    	getMatchesFromDB(0);
    	
    	/*$('.site-wrapper').ready(function() {
	        angular.bootstrap($('.site-wrapper'), ['plapp']);
        });*/

    }
    
    function getMatchesFromDB(isExecuted){
    
    	db.transaction(function(tx) {
    		
    		tx.executeSql("SELECT matches.* FROM `"+ matchesTableName + "` matches LEFT JOIN "+matchAttributes+" attr ON "+
    				" matches.match_id = attr.match_id "+
    				" WHERE DATE(matches.match_date) = date() "+
    				" OR attr.match_status = 'S';", [], 
    	
//    		tx.executeSql("SELECT * FROM `"+ matchesTableName + "` WHERE DATE(match_date) = date();", [], 
    		function(tx, res) {
    		
//    			alert("today "+res.rows.length);
    			
				for(var loop=0; loop<res.rows.length;loop++)
				{
					 /* $scope.today.push({
		               match_id:res.rows.item(loop).match_id,
		               game_id: res.rows.item(loop).game_id,
		               type_id: res.rows.item(loop).type_id,
		               play_type: res.rows.item(loop).play_type,
		               created_by: res.rows.item(loop).created_by,
		               created_by_type: res.rows.item(loop).created_by_type,
		               match_date: res.rows.item(loop).match_date,
		               venue: res.rows.item(loop).venue,
		               match_status: res.rows.item(loop).match_status,
		               tournament_name: res.rows.item(loop).tournament_name,
		               name: res.rows.item(loop).name,
		               score_edit: res.rows.item(loop).score_edit
		               });*/
                                 
                     todayMatches[loop] = new Array();
                     todayMatches[loop]["match_id"] = res.rows.item(loop).match_id;
                     
                     todayMatches[loop]["type_id"] = res.rows.item(loop).type_id;
                     todayMatches[loop]["play_type"] = res.rows.item(loop).play_type;
                     todayMatches[loop]["created_by"] = res.rows.item(loop).created_by;
                     todayMatches[loop]["match_date"] = res.rows.item(loop).match_date;
                     var formattedDateVal = res.rows.item(loop).match_date.split(" ").join("T");
                     formattedDateVal = formattedDateVal.split("-").join("");
                     formattedDateVal = formattedDateVal.split(":").join("");
                     formattedDateVal = formattedDateVal + "Z";
                     todayMatches[loop]["formattedDate"] = formattedDateVal;
                     todayMatches[loop]["venue"] = res.rows.item(loop).venue;
                     todayMatches[loop]["match_status"] = res.rows.item(loop).match_status;
                     todayMatches[loop]["tournament_name"] = res.rows.item(loop).tournament_name;
                     todayMatches[loop]["name"] = res.rows.item(loop).name;
                     todayMatches[loop]["score_edit"] = res.rows.item(loop).score_edit;
                     todayMatches[loop]["game_name"] = res.rows.item(loop).game_name.split(" ").join("").toLowerCase();
                     todayMatches[loop]["player_info"] = res.rows.item(loop).player_info;
                     todayMatches[loop]["require_partner"] = res.rows.item(loop).require_partner;
                     todayMatches[loop]["image_path"] = res.rows.item(loop).image_path;
                     todayMatches[loop]["score_edit"] = res.rows.item(loop).score_edit;
                     todayMatches[loop]["match_format"] = res.rows.item(loop).match_format;
                     
//                     alert("todayMatches[loop][image_path] "+todayMatches[loop]["image_path"]);
                     
//                     console.log("todayMatches[loop][image_path] "+todayMatches[loop]["image_path"]);
                     
                     var playerDet = todayMatches[loop]["player_info"].split(",");
                                 
                     todayMatches[loop]["playersLen"] = playerDet.length;
                     
                     for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
                     {
                     	var indPlayerDet = playerDet[arrLoop].split("###");
                     	
                        var indexNum = arrLoop + 1;
                 
                        todayMatches[loop]["name"+indexNum] = indPlayerDet[1];
                 
                        todayMatches[loop]["image"+indexNum] = indPlayerDet[2];
                        
                        todayMatches[loop]["jersey_color"+(arrLoop+1)] = indPlayerDet[3];
                        
//                        alert("todayMatches[loop][jersey_color+(arrLoop+1)] "+todayMatches[loop]["jersey_color"+(arrLoop+1)])
                 
                        if(arrLoop == 1 && playerDet.length <= 2)
                        {
                            var indexNum2 = arrLoop + 2;
                 
                            var indexNum3 = arrLoop + 3;
                 
                            todayMatches[loop]["name"+indexNum2] = todayMatches[loop]["name"+indexNum];
                 
                            todayMatches[loop]["image"+indexNum2] = todayMatches[loop]["image"+indexNum];
                 
                            todayMatches[loop]["name"+indexNum] = "";
                             
                            todayMatches[loop]["image"+indexNum] = "";
                 
                            todayMatches[loop]["name"+indexNum3] = "";
                             
                            todayMatches[loop]["image"+indexNum3] = "";
                        }
                                 
                     }
                     
                 }
                 
             }, errorHandler);
                   
                   
           	tx.executeSql("SELECT * FROM `"+ matchesTableName + "` WHERE DATE(match_date) BETWEEN date('now','+1 day') and date('now','+3 day') ORDER BY `match_date` ASC;", [], 
           	function(tx, resu) {
           	
//           		alert("Upcoming "+resu.rows.length);
           		
           		for(var loop=0; loop<resu.rows.length;loop++)
           		{
                     upcomingMatches[loop] = new Array();
                     upcomingMatches[loop]["match_id"] = resu.rows.item(loop).match_id;
                     upcomingMatches[loop]["game_id"] = resu.rows.item(loop).game_id;
                     upcomingMatches[loop]["type_id"] = resu.rows.item(loop).type_id;
                     upcomingMatches[loop]["play_type"] = resu.rows.item(loop).play_type;
                     upcomingMatches[loop]["created_by"] = resu.rows.item(loop).created_by;
                     upcomingMatches[loop]["created_by_type"] = resu.rows.item(loop).created_by_type;
                     upcomingMatches[loop]["match_date"] = resu.rows.item(loop).match_date;
                     var formattedDateVal = resu.rows.item(loop).match_date.split(" ").join("T");
                     formattedDateVal = formattedDateVal.split("-").join("");
                     formattedDateVal = formattedDateVal.split(":").join("");
                     formattedDateVal = formattedDateVal + "Z";
                     upcomingMatches[loop]["formattedDate"] = formattedDateVal;
                     upcomingMatches[loop]["venue"] = resu.rows.item(loop).venue;
                     upcomingMatches[loop]["match_status"] = resu.rows.item(loop).match_status;
                     upcomingMatches[loop]["tournament_name"] = resu.rows.item(loop).tournament_name;
                     upcomingMatches[loop]["name"] = resu.rows.item(loop).name;
                     upcomingMatches[loop]["score_edit"] = resu.rows.item(loop).score_edit;
                     upcomingMatches[loop]["game_name"] = resu.rows.item(loop).game_name.split(" ").join("").toLowerCase();
                     upcomingMatches[loop]["player_info"] = resu.rows.item(loop).player_info;
                     upcomingMatches[loop]["require_partner"] = resu.rows.item(loop).require_partner;
                     upcomingMatches[loop]["image_path"] = resu.rows.item(loop).image_path;
                     
                     upcomingMatches[loop]["match_format"] = resu.rows.item(loop).match_format;
                     
                     var playerDet = upcomingMatches[loop]["player_info"].split(",");
                     //alert(playerDet);
                     upcomingMatches[loop]["playersLen"] = playerDet.length;
                     
                     for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
                     {
                         var indexNum = arrLoop + 1;
                     
                         var indPlayerDet = playerDet[arrLoop].split("###");
                     
                    
                         upcomingMatches[loop]["name"+indexNum] = indPlayerDet[1];
                         
                         upcomingMatches[loop]["image"+indexNum] = indPlayerDet[2];
                         
                         upcomingMatches[loop]["jersey_color"+(arrLoop+1)] = indPlayerDet[3];
                         
                         if(arrLoop == 1 && playerDet.length <= 2)
                         {
                             var indexNum2 = arrLoop + 2;
                             
                             var indexNum3 = arrLoop + 3;

                             upcomingMatches[loop]["name"+indexNum2] = upcomingMatches[loop]["name"+indexNum];
                             
                             upcomingMatches[loop]["image"+indexNum2] = upcomingMatches[loop]["image"+indexNum];
                             
                             upcomingMatches[loop]["name"+indexNum] = "";
                             
                             upcomingMatches[loop]["image"+indexNum] = "";
                             
                             upcomingMatches[loop]["name"+indexNum3] = "";
                             
                             upcomingMatches[loop]["image"+indexNum3] = "";
                         }
                         
                     }
                     
                 }
                     
             }, errorHandler);
           	
           	tx.executeSql("SELECT * FROM "+ matchesTableName + " matches LEFT JOIN "+matchAttributes+" attr "+
    				" ON matches.match_id = attr.match_id"+
    				" AND attr.match_status != 'S'"+
    				" WHERE DATE(matches.match_date) BETWEEN date('now','-7 day') and date('now','-1 day')"+
    				" AND attr.match_status IS NOT NULL"
//    				" AND attr.match_status != 'S'"
//    				" ORDER BY matches.match_date DESC;"
    				, [], 
                   
//           	tx.executeSql("SELECT * FROM `"+ matchesTableName + "` WHERE DATE(match_date) BETWEEN date('now','-3 day') and date('now','-1 day') ORDER BY `match_date` DESC;", [], 
           	function(tx, resul) {
           	
//           		alert("Past "+resul.rows.length);
           		
           		for(var loop=0; loop<resul.rows.length;loop++)
           		{
           			
//           			alert("resul.rows.item(loop).match_status "+resul.rows.item(loop).match_status+" fjkgjdf;");
           			
	                 pastMatches[loop] = new Array();
	                 pastMatches[loop]["match_id"] = resul.rows.item(loop).match_id;
	                 pastMatches[loop]["game_id"] = resul.rows.item(loop).game_id;
	                 pastMatches[loop]["type_id"] = resul.rows.item(loop).type_id;
	                 pastMatches[loop]["play_type"] = resul.rows.item(loop).play_type;
	                 pastMatches[loop]["created_by"] = resul.rows.item(loop).created_by;
	                 pastMatches[loop]["created_by_type"] = resul.rows.item(loop).created_by_type;
	                 pastMatches[loop]["match_date"] = resul.rows.item(loop).match_date;
	                 var formattedDateVal = resul.rows.item(loop).match_date.split(" ").join("T");
	                 formattedDateVal = formattedDateVal.split("-").join("");
	                 formattedDateVal = formattedDateVal.split(":").join("");
	                 formattedDateVal = formattedDateVal + "Z";
	                 pastMatches[loop]["formattedDate"] = formattedDateVal;
	                 pastMatches[loop]["venue"] = resul.rows.item(loop).venue;
	                 pastMatches[loop]["match_status"] = resul.rows.item(loop).match_status;
	                 pastMatches[loop]["tournament_name"] = resul.rows.item(loop).tournament_name;
	                 pastMatches[loop]["name"] = resul.rows.item(loop).name;
	                 pastMatches[loop]["score_edit"] = resul.rows.item(loop).score_edit;
	                 pastMatches[loop]["game_name"] = resul.rows.item(loop).game_name.split(" ").join("").toLowerCase();
	             
	                 pastMatches[loop]["player_info"] = resul.rows.item(loop).player_info;
	                 pastMatches[loop]["require_partner"] = resul.rows.item(loop).require_partner;
	                 pastMatches[loop]["image_path"] = resul.rows.item(loop).image_path;
	                 
	                 pastMatches[loop]["match_format"] = resul.rows.item(loop).match_format;
	                 
	                 var playerDet = pastMatches[loop]["player_info"].split(",");
	             
	                 pastMatches[loop]["playersLen"] = playerDet.length;
	                 
	                 for(var arrLoop=0;arrLoop<playerDet.length;arrLoop++)
	                 {
	                     var indexNum = arrLoop + 1;
	             
	                     var indPlayerDet = playerDet[arrLoop].split("###");
	                     
	                     pastMatches[loop]["name"+indexNum] = indPlayerDet[1];
	                     
	                     pastMatches[loop]["image"+indexNum] = indPlayerDet[2];
	                     
	                     pastMatches[loop]["jersey_color"+(arrLoop+1)] = indPlayerDet[3];
	                     
	                     if(arrLoop == 1 && playerDet.length <= 2)
	                     {
	                         var indexNum2 = arrLoop + 2;
	             
	                         var indexNum3 = arrLoop + 3;
	             
	                         pastMatches[loop]["name"+indexNum2] = pastMatches[loop]["name"+indexNum];
	                         
	                         pastMatches[loop]["image"+indexNum2] = pastMatches[loop]["image"+indexNum];
	                         
	                         pastMatches[loop]["name"+indexNum] = "";
	                         
	                         pastMatches[loop]["image"+indexNum] = "";
	                         
	                         pastMatches[loop]["name"+indexNum3] = "";
	                         
	                         pastMatches[loop]["image"+indexNum3] = "";
	                     }
	                 }
	             }
	
				//if(isExecuted == 1){
		             $('.site-wrapper').ready(function() {
		                angular.bootstrap($('.site-wrapper'), ['plapp']);
		                $("#loader").hide();
		             });
	             //}
	             
		     }, errorHandler);
		               
		               
		}, errorHandlerNew);
    
    }
}

function goToMatchDetails(matchId,tabNo)
{
//    alert(matchId);
    window.location.href = "matchDetails.html?matchId="+matchId+"&tabNo="+tabNo;
}



function MatchList($scope)
{
    $scope.today = [];
    
    $scope.upcoming = [];
    
    $scope.past = [];
    
    $scope.addTodayMatches = function()
    {
        for(var loop=0; loop<todayMatches.length;loop++)
        {
            $scope.today.push({
              match_id:todayMatches[loop]["match_id"],
              game_id: todayMatches[loop]["game_id"],
              type_id: todayMatches[loop]["type_id"],
              play_type: todayMatches[loop]["play_type"],
              created_by: todayMatches[loop]["created_by"],
              created_by_type: todayMatches[loop]["created_by_type"],
              match_date: todayMatches[loop]["match_date"],
              formatted_date: todayMatches[loop]["formattedDate"],
              venue: todayMatches[loop]["venue"],
              match_status: todayMatches[loop]["match_status"],
              tournament_name: todayMatches[loop]["tournament_name"],
              name: todayMatches[loop]["name"],
              score_edit: todayMatches[loop]["score_edit"],
              require_partner: todayMatches[loop]["require_partner"],
              game_name: todayMatches[loop]["game_name"],
              playername1:todayMatches[loop]["name1"],
              playerimage1:todayMatches[loop]["image_path"]+todayMatches[loop]["image1"],
              playername2:todayMatches[loop]["name2"],
              playerimage2:todayMatches[loop]["image_path"]+todayMatches[loop]["image2"],
              playername3:todayMatches[loop]["name3"],
              playerimage3:todayMatches[loop]["image_path"]+todayMatches[loop]["image3"],
              playername4:todayMatches[loop]["name4"],
              playerimage4:todayMatches[loop]["image_path"]+todayMatches[loop]["image4"],
              matchFormat:todayMatches[loop]["match_format"],
              jerseyColor1:todayMatches[loop]["jersey_color1"],
              jerseyColor2:todayMatches[loop]["jersey_color2"]
            });
        }
    }
    
    $scope.addTodayMatches();
    
    $scope.addUpcomingMatches = function()
    {
        for(var loop=0; loop<upcomingMatches.length;loop++)
        {
            $scope.upcoming.push({
	          match_id:upcomingMatches[loop]["match_id"],
	          game_id: upcomingMatches[loop]["game_id"],
	          type_id: upcomingMatches[loop]["type_id"],
	          play_type: upcomingMatches[loop]["play_type"],
	          created_by: upcomingMatches[loop]["created_by"],
	          created_by_type: upcomingMatches[loop]["created_by_type"],
	          match_date: upcomingMatches[loop]["match_date"],
	          formatted_date: upcomingMatches[loop]["formattedDate"],
	          venue: upcomingMatches[loop]["venue"],
	          match_status: upcomingMatches[loop]["match_status"],
	          tournament_name: upcomingMatches[loop]["tournament_name"],
	          name: upcomingMatches[loop]["name"],
	             score_edit: upcomingMatches[loop]["score_edit"],
	             require_partner: upcomingMatches[loop]["require_partner"],
	             game_name: upcomingMatches[loop]["game_name"],
	             playername1:upcomingMatches[loop]["name1"],
	             playerimage1:upcomingMatches[loop]["image_path"]+upcomingMatches[loop]["image1"],
	             playername2:upcomingMatches[loop]["name2"],
	             playerimage2:upcomingMatches[loop]["image_path"]+upcomingMatches[loop]["image2"],
	             playername3:upcomingMatches[loop]["name3"],
	             playerimage3:upcomingMatches[loop]["image_path"]+upcomingMatches[loop]["image3"],
	             playername4:upcomingMatches[loop]["name4"],
	             playerimage4:upcomingMatches[loop]["image_path"]+upcomingMatches[loop]["image4"],
	             matchFormat:upcomingMatches[loop]["match_format"],
	             jerseyColor1:upcomingMatches[loop]["jersey_color1"],
	             jerseyColor2:upcomingMatches[loop]["jersey_color2"]
	          });
        }
    }
    
    $scope.addUpcomingMatches();
    
    $scope.addPastMatches = function()
    {
        for(var loop=0; loop<pastMatches.length;loop++)
        {
            
            $scope.past.push({
	          match_id:pastMatches[loop]["match_id"],
	          game_id: pastMatches[loop]["game_id"],
	          type_id: pastMatches[loop]["type_id"],
	          play_type: pastMatches[loop]["play_type"],
	          created_by: pastMatches[loop]["created_by"],
	          created_by_type: pastMatches[loop]["created_by_type"],
	          match_date: pastMatches[loop]["match_date"],
	          formatted_date: pastMatches[loop]["formattedDate"],
	          venue: pastMatches[loop]["venue"],
	          match_status: pastMatches[loop]["match_status"],
	          tournament_name: pastMatches[loop]["tournament_name"],
	          name: pastMatches[loop]["name"],
	         score_edit: pastMatches[loop]["score_edit"],
	         require_partner: pastMatches[loop]["require_partner"],
	         game_name: pastMatches[loop]["game_name"],
	         playername1:pastMatches[loop]["name1"],
	         playerimage1:pastMatches[loop]["image_path"]+pastMatches[loop]["image1"],
	         playername2:pastMatches[loop]["name2"],
	         playerimage2:pastMatches[loop]["image_path"]+pastMatches[loop]["image2"],
	         playername3:pastMatches[loop]["name3"],
	         playerimage3:pastMatches[loop]["image_path"]+pastMatches[loop]["image3"],
	         playername4:pastMatches[loop]["name4"],
	         playerimage4:pastMatches[loop]["image_path"]+pastMatches[loop]["image4"],
	         matchFormat:pastMatches[loop]["match_format"],
             jerseyColor1:pastMatches[loop]["jersey_color1"],
             jerseyColor2:pastMatches[loop]["jersey_color2"]
          });
        }
    }
    
    $scope.addPastMatches();
    
    
    
}

function showPopup(popupId){
	$(popupId).popup('show');
}

function hidePopup(popupId){
	$(popupId).popup('hide');
}

function logout(){
	
	db.transaction(function(tx) {
		
		tx.executeSql("DELETE FROM "+userTableName,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+matchesTableName,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+matchParticipants,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+matchSquadTable,[],function(){},errorHandler);
		
		tx.executeSql("DELETE FROM "+matchAttributes,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreTable,[],function(){},errorHandler);			
		tx.executeSql("DELETE FROM "+fullScoreInfoTable,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+fullScoreWicketTable,[],function(){},errorHandler);
		tx.executeSql("DELETE FROM "+ballbyballTable,[],function(){
			
			window.location.href = "index.html";
			
		},errorHandler);
		
	},errorHandler);
	
		
}

function syncMatch(){
	
	db.transaction(function(tx) {
		
		var getMatchIds = "SELECT * FROM "+ballbyballTable+
    		" WHERE is_synced = 0"+
    		" AND is_updated = 1"+
    		" GROUP BY match_id";
		
//		alert("getMatchIds "+getMatchIds);
    	
		tx.executeSql(getMatchIds,[],function(tx,res){
			
//			alert("res.rows.length "+res.rows.length);
			
			for(var matchLoop = 0;matchLoop < res.rows.length;matchLoop++){
				
//				alert("res.rows.item(matchLoop).match_id "+res.rows.item(matchLoop).match_id);
				
				syncScore(res.rows.item(matchLoop).match_id);
				
			}
			
		},errorHandler);
		
	},errorHandler);

}



function syncScore(matchId){
	
	var matchAttributesJSON = {};
	var ballByBallJSON = [];
	var fullScoreJSON = [];
	var fullScoreOthersJSON = [];

	var syncedBallUnique = "", syncedInnings = "";
	
	
	db.transaction(function(tx) {
		
		var getNonSyncData = "SELECT * FROM "+ballbyballTable+
			" WHERE match_id = "+matchId+
			" AND is_updated = 1"+
			" AND is_synced != 1"+
			" ORDER BY id";
    	
		tx.executeSql(getNonSyncData,[],function(tx,res){
			
			var ballLength = res.rows.length;
			
//			alert("ballLength "+ballLength);
			
			for(var ballCount = 0; ballCount < ballLength; ballCount++){
				
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
					
//					alert("matchAttributesInfo "+matchAttributesInfo)
					
				},errorHandler);
					
				var getFullScoreData = "SELECT * FROM "+fullScoreTable+
					" WHERE match_id = "+matchId+
					" AND is_batting = 1"+
					" ORDER BY innings_id";
	    	
				tx.executeSql(getFullScoreData,[],function(tx,res){
					
					var fullScoreLength = res.rows.length;
					
//					alert("fullScoreLength "+fullScoreLength);
					
					for(var fullScorePlayerLoop = 0; fullScorePlayerLoop < fullScoreLength; fullScorePlayerLoop++){
						
						var getFullScoreBatsmanData = "SELECT * FROM "+fullScoreTable+
							" WHERE match_id = "+matchId+
							" AND player_id = "+res.rows.item(fullScorePlayerLoop).player_id+
							" AND innings_id = "+res.rows.item(fullScorePlayerLoop).innings_id;
						
//						alert("getFullScoreBatsmanData "+getFullScoreBatsmanData);
						
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
							
//							alert("getFullScoreBowlerData "+getFullScoreBowlerData);
							
							tx.executeSql(getFullScoreBowlerData,[],function(tx,res){
								
//								alert(" getFullScoreBowlerData res.rows.length "+res.rows.length);
								
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
								
//								alert("getFullScoreWicketData "+getFullScoreWicketData);
								
								tx.executeSql(getFullScoreWicketData,[],function(tx,res){
									
//									alert("fullScorePlayerInfo[batsmanid] "+fullScorePlayerInfo["batsmanid"]);
									
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
									
//									alert("fullScoreJSON.length() "+fullScoreJSON.length);
//									alert("fullScoreLength "+fullScoreLength);
									
									if(fullScoreJSON.length == fullScoreLength){
										
										var fullDetailsVal = {};
										
										var fullDetails = [];
										
										fullDetailsVal["match_id"] = matchId;
										
										fullDetailsVal["ballbyball"] = ballByBallJSON;
										fullDetailsVal["fullscore"] = fullScoreJSON;
										fullDetailsVal["fullscoreOthers"] = fullScoreOthersJSON;
										fullDetailsVal["matchattr"] = matchAttributesJSON;
										
										fullDetails.push(fullDetailsVal);
										 
										 var soapRequest = soapMsgStart + '<matchScore xmlns="'+webserviceURL+'"> \
										 <access_key>' + accessKey + '</access_key> \
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
										    success: function() {
										    	
//										    	alert("send score success");
										    	
										    	db.transaction(function(tx) {
										    		
										    		var updateSyncInningsData = "UPDATE "+ballbyballTable+
										        		" SET is_synced = 1"+
										        		" WHERE match_id = "+matchId+
										        		" AND innings_id < "+syncedInnings;
										        	
										    		tx.executeSql(updateSyncInningsData,[],function(tx,res){
										    			
										    		},errorHandler);
										    		
										    		var updateSyncBallData = "UPDATE "+ballbyballTable+
										    		" SET is_synced = 1"+
										    		" WHERE match_id = "+matchId+
										    		" AND innings_id = "+syncedInnings+
										    		" AND ball_unique <= "+syncedBallUnique;
										    	
										    		tx.executeSql(updateSyncBallData,[],function(tx,res){
										    		
										    		},errorHandler);
										    		
										    	},errorHandler);
												
											},
										    error: sendScoreError
										 });
										
									}
									
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

//function sendScore(){
//
//}

function ballstoOver(balls){
	
	var oversFloat = parseInt(balls);
	var overs = parseInt(oversFloat/6);
	var balls = oversFloat%6;
	var combinedOvers = overs+"."+balls;
	
	return combinedOvers;
}

function sendScoreSuccess(data, status, req){
	
//	alert("sendScoreSuccess");
	
}

function sendScoreError(data, status, req){
//	alert("sendScoreError "+status+" "+$(req.responseText));
}
