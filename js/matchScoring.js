var db;

var matchId = '';

var matchDetails = new Array();

var plapp = angular.module('plappm', []);

var tabNo = '';

var angluarScope;

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
                      
                  var status = window.localStorage.getItem("authenticate"+matchId);

                  if(status == 1)
                  {                	  
                	  getScore();
                  }
                  
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

                         //alert(res.rows.item(0).latitude + "--"+res.rows.item(0).longitude);
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
    
    //alert(" matchId "+matchId);
    //alert(" pwd "+pwd);
    
    //console.log(soapRequest);
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
        
        //console.log(responseXML);
        
        //console.log(responseXML.find("matchAuthResponse").text());
        
        var code = responseXML.find("code").text();
        
        if(code == 0 || code == "")
        {
            //alert("Authentication Failed. Please try again with valid Credentials");
            
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
            
            window.localStorage.setItem("authenticate"+matchId, 0);
        }
        else
        {
        	getScore();
        	
            window.localStorage.setItem("authenticate"+matchId, 1);
        }
    }
}

function authenticateError(data, status, req)
{
    $(".site-wrapper").show();
}

function getScore(){
	
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
                      "firstname","lastname","role_type_id","role_type_id","player_jersey_no","thumb_loc"];
var teamRole = ["","C","VC",""];
//var playerImagepath;

function getScoreSuccess(data, status, req){
	
	if (status == "success")
    {
        var responseXML = $(req.responseXML);
        
        console.log(req.responseText);
        
        var matchStatus = responseXML.find("matchstatus").text();
        
        playerImagepath = responseXML.find("playerimagepath").text();
        
        var matchSquadXML = $(responseXML.find("MatchSquad"));
    	
    	var playersCount = matchSquadXML.find("match_participant_id").length;
    	
    	for(var initLoop=0;initLoop<playersCount;initLoop++){
    		matchSquad[initLoop] = new Array();
    	}
    	
    	$.each(getScoreParams, function(index, value){
            
            var incLoop = 0;
            matchSquadXML.find(value).each(function(){
            	
            	matchSquad[incLoop][value] = $(this).text();
            	matchSquad[incLoop][value] = matchSquad[incLoop][value].replace(/'/g,"''");
                incLoop++;
                
            });
               
        });
    	
    	for(assignLoop=0;assignLoop<playersCount;assignLoop++){
    		
    		if(matchSquad[assignLoop]["match_participant_id"] == match_participant_id1Str){
    			
    			team1Squad[team1Squad.length] = new Array();
    			
    			team1Squad[team1Squad.length-1] = matchSquad[assignLoop];
    			
    		}
    		else{
    			
    			team2Squad[team2Squad.length] = new Array();
    			
    			team2Squad[team2Squad.length-1] = matchSquad[assignLoop];
    		}
    		
    	}
    	
    	var insertQry = "INSERT INTO " + matchSquadTable 
        + " (match_id, player_id, match_participant_id, first_name, last_name, player_role, team_role, jersey_no, player_image) VALUES ";
        
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
                                                      
                       valuesStr = "(" + matchSquad[playerLoop]["match_id"] + ", '" + matchSquad[playerLoop]["user_id"] + "', '" + matchSquad[playerLoop]["match_participant_id"];
                       
                       valuesStr = valuesStr + "', '" + matchSquad[playerLoop]["firstname"] + "', '" + matchSquad[playerLoop]["lastname"] + "', " + matchSquad[playerLoop]["role_type_id"];
                       
                       valuesStr = valuesStr + ", '" + matchSquad[playerLoop]["role_type_id"] + "', '" + matchSquad[playerLoop]["jersey_no"] + "', '" + matchSquad[playerLoop]["thumb_loc"];
                       
                       valuesStr = valuesStr+ "')"
                       
                       if(valuesQry == "")
                       {
                           commaStr = " ";
                       }
                       else
                       {
                           commaStr = " , ";
                       }
                       
                       valuesQry = valuesQry + commaStr + valuesStr;
                           
                       if(playerLoop == playersCount - 1 && valuesQry != "")
                       {
                    	   
                    	   console.log(matchSquadTable+" INSERTION ===> "+insertQry + valuesQry);
                    	   
                           tx.executeSql(insertQry + valuesQry,[], function(tx, res) {
                                 
                           }, errorHandler);
                       }
                   };
               })(playerLoop), errorHandler);
            }
        }, errorHandler);
        
        angularScope.addTeamsSquad();
        
//        alert("matchStatus "+matchStatus);
        
        if(matchStatus == "Yet to be Started") {
        	
	        $(".authentication").hide();            
	        $(".toss-details").removeClass("hide");
	        
        }
        
        else if(matchStatus == "Match Started") {
        	
        	var matchAttrXML = $(responseXML.find("matchattr"));        	
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
        	
        	var fullScoreXML = $(responseXML.find("cricket_fullscore"));
        	
        	var playingaXIXML = $(responseXML.find("playingXI"));
        	
        	var ballbyBallXML = $(responseXML.find("cricket_ball_update"));
        	
        	db.transaction(function(tx) {
    			
    			tx.executeSql("DELETE FROM "+matchAttributes+" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
    			tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);

    			var insertMatchAttr = "INSERT INTO "+matchAttributes+
    			"(match_id, toss_won_by, toss_decision, "+
    			"no_of_players, innings_count, total_overs, " +
    			"is_last_man_batting, current_innings, result, " +
    			"innings_1_score, innings_2_score, innings_3_score, innings_4_score)"+
    			" VALUES "+
    			"("+angularScope.details.match_id+","+matchAttrJSON["toss_won_by_team"]+",'"+matchAttrJSON["team_decision"]+"',"+
    			matchAttrJSON["tot_num_player"]+","+matchAttrJSON["inn_type"]+","+matchAttrJSON["total_overs"]+","+
    			matchAttrJSON["lastman_batting"]+","+1+",''" +
				",'','','','')";
    			
    			console.log(matchAttributes+" INSERTION ===> "+insertMatchAttr);
    			
    			tx.executeSql(insertMatchAttr,[],function(){},errorHandler);
    			
    			var fullScoreResponseAttr = ["match_id","innings","batsmanid",
    					"match_participant_id","batted_order_no","bowled_order_no",
    					"runs","balls","four","sixer","str_rate",
    					"bow_over","bow_maidens","bow_runs","bow_wickets","bow_economy",
    					"out_type_id","wfielderid","wbowlerid","out_type","fall_of_wicket","bowl_extras"];
    			
    			var playerCount = fullScoreXML.find("match_id").length;
    			
    			var fullScoreParserValues = new Array();
    			
    			for(var arrayLoop = 0; arrayLoop < playerCount; arrayLoop++)
    	        {
    				fullScoreParserValues[arrayLoop] = new Array();
    				fullScoreParserValues[arrayLoop]["bowl_extras"] = "";
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
    			
    			for(var innningsInitLoop = 0;innningsInitLoop < 5;innningsInitLoop++){
    				
    				fullScoreValues[innningsInitLoop] = new Array();
    				
    			}
    			
    			tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
    			
    			var matchParticipantIdArray = new Array();
    			
    			for(var playerLoop = 0;playerLoop < playerCount;playerLoop++){
    				
    				var innings = fullScoreParserValues[playerLoop]["innings"];
    				
    				fullScoreValues[innings][playerLoop] = new Array();
    				
    				matchParticipantIdArray[innings] = fullScoreParserValues[playerLoop]["match_participant_id"];
    				
//    				alert("innings "+innings);
    				
    				fullScoreValues[innings][playerLoop]["match_id"] = fullScoreParserValues[playerLoop]["match_id"];
    				fullScoreValues[innings][playerLoop]["innings_id"] = innings;
    				fullScoreValues[innings][playerLoop]["player_id"] = fullScoreParserValues[playerLoop]["batsmanid"];
    				fullScoreValues[innings][playerLoop]["match_participant_id"] = fullScoreParserValues[playerLoop]["match_participant_id"];
    				fullScoreValues[innings][playerLoop]["batting_bowling_order"] = fullScoreParserValues[playerLoop]["batted_order_no"];
    				fullScoreValues[innings][playerLoop]["score_info_1"] = fullScoreParserValues[playerLoop]["runs"];
    				fullScoreValues[innings][playerLoop]["score_info_2"] = fullScoreParserValues[playerLoop]["balls"];
    				fullScoreValues[innings][playerLoop]["score_info_3"] = fullScoreParserValues[playerLoop]["four"];
    				fullScoreValues[innings][playerLoop]["score_info_4"] = fullScoreParserValues[playerLoop]["sixer"];
    				fullScoreValues[innings][playerLoop]["score_info_5"] = fullScoreParserValues[playerLoop]["str_rate"];
    				fullScoreValues[innings][playerLoop]["is_batting"] = 1;
    				fullScoreValues[innings][playerLoop]["out_text"] = fullScoreParserValues[playerLoop]["out_type"];
    				fullScoreValues[innings][playerLoop]["extra_count"] = "";
    				
//    				alert("playerCount "+playerCount);
    				
    				if(innings == 2)
    					innings = 1;
    				else
    					innings = 2;
    				
//    				innings = innings-1;
    				
    				fullScoreValues[innings][playerLoop] = new Array();
    				
//    				alert("innings "+innings);
    				
    				fullScoreValues[innings][playerLoop]["match_id"] = fullScoreParserValues[playerLoop]["match_id"];
    				fullScoreValues[innings][playerLoop]["innings_id"] = innings;
    				fullScoreValues[innings][playerLoop]["player_id"] = fullScoreParserValues[playerLoop]["batsmanid"];
    				fullScoreValues[innings][playerLoop]["match_participant_id"] = fullScoreParserValues[playerLoop]["match_participant_id"];
    				fullScoreValues[innings][playerLoop]["batting_bowling_order"] = fullScoreParserValues[playerLoop]["bowled_order_no"];
    				fullScoreValues[innings][playerLoop]["score_info_1"] = fullScoreParserValues[playerLoop]["bow_over"];
    				fullScoreValues[innings][playerLoop]["score_info_2"] = fullScoreParserValues[playerLoop]["bow_maidens"];
    				fullScoreValues[innings][playerLoop]["score_info_3"] = fullScoreParserValues[playerLoop]["bow_runs"];
    				fullScoreValues[innings][playerLoop]["score_info_4"] = fullScoreParserValues[playerLoop]["bow_wickets"];
    				fullScoreValues[innings][playerLoop]["score_info_5"] = fullScoreParserValues[playerLoop]["bow_economy"];
    				fullScoreValues[innings][playerLoop]["is_batting"] = 0;
    				fullScoreValues[innings][playerLoop]["out_text"] = "0";
    				fullScoreValues[innings][playerLoop]["extra_count"] = fullScoreParserValues[playerLoop]["bowl_extras"];;
    				
    			}
    			
    			tx.executeSql("DELETE FROM "+fullScoreInfoTable+
    					" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
    			
    			tx.executeSql("DELETE FROM "+fullScoreWicketTable+
    					" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
    			
    			for(var inningsLoop = 1;inningsLoop < 3;inningsLoop++){
    				
					var insertFullInfoQry = "INSERT INTO "+fullScoreInfoTable+
					" (match_id, innings_id, match_participant_id, extra_text," +
					" team_runs, team_wickets, team_overs) VALUES" +
					
					" ("+angularScope.details.match_id+","+inningsLoop+","+
					matchParticipantIdArray[inningsLoop]+",'',0,0,'0.0')";
				
					console.log(fullScoreInfoTable+" INSERTION ===> "+insertFullInfoQry);
					
//					alert("insertFullInfoQry "+insertFullInfoQry);
					
					tx.executeSql(insertFullInfoQry,[],function(){},errorHandler);
    				
    				
    				var insertFullQry = "INSERT INTO "+fullScoreTable+
    				"(match_id, innings_id, player_id, " +
    				"match_participant_id, batting_bowling_order, score_info_1, " +
    				"score_info_2, score_info_3, score_info_4, " +
    				"score_info_5, is_batting, out_text, extra_count) VALUES ";
    				
    				var valuesQry = "";
    				
					for(var playerLoop = 0;playerLoop < playerCount;playerLoop++){
						
						var valueStr = "";						
							
						valueStr = "("+
						fullScoreValues[inningsLoop][playerLoop]["match_id"]+","+
						fullScoreValues[inningsLoop][playerLoop]["innings_id"]+","+
						fullScoreValues[inningsLoop][playerLoop]["player_id"]+","+
						fullScoreValues[inningsLoop][playerLoop]["match_participant_id"]+","+
						fullScoreValues[inningsLoop][playerLoop]["batting_bowling_order"]+","+
						fullScoreValues[inningsLoop][playerLoop]["score_info_1"]+","+
						fullScoreValues[inningsLoop][playerLoop]["score_info_2"]+","+
						fullScoreValues[inningsLoop][playerLoop]["score_info_3"]+","+
						fullScoreValues[inningsLoop][playerLoop]["score_info_4"]+","+
						fullScoreValues[inningsLoop][playerLoop]["score_info_5"]+","+
						fullScoreValues[inningsLoop][playerLoop]["is_batting"]+",'"+
						fullScoreValues[inningsLoop][playerLoop]["out_text"]+"','"+
						fullScoreValues[inningsLoop][playerLoop]["extra_count"]+
						"')";
						
						if(valuesQry == ""){
							valuesQry = valueStr;
						}
						else{
							valuesQry = valuesQry+","+valueStr;
						}
						
					}
					
//					alert("valuesQry "+valuesQry +" "+playerCount);
					console.log("valuesQry "+valuesQry);
					
					
    					
					if(valuesQry != ""){
						
						console.log(fullScoreTable+" INSERTION ===> "+insertFullQry + valuesQry);
						
//						console.log(insertFullQry + valuesQry);
						
						
						
						tx.executeSql(insertFullQry + valuesQry,[], function(tx, res) {}, errorHandler);
					}
    			}
    			
    			var ballLength = ballbyBallXML.find("match_id").length;
				
				if(ballLength == 0){
					
					angularScope.currentInnings = 1;
					
					$(".striker-details").removeClass("hide");            
				    $(".toss-details").hide();
				}
				else{
					
//					angularScope.currentInnings = 1;
//					
//					var ballbyBallAttr = ["match_id","inni_num",
//                        "over","ball_no",
//     					"batsman_id","non_striker_id","bowler_id",
//     					"runs","extra_run",
//     					"is_extra","is_wicket",
//     					"inn_1_score","inn_2_score"];
//								         			
//         			var ballbyBallParserValues = new Array();
//         			
//         			for(var arrayLoop = 0; arrayLoop < ballLength; arrayLoop++)
//         	        {
//         				ballbyBallParserValues[arrayLoop] = new Array();
//         	        }
//         			
//         			$.each(ballbyBallAttr, function(index, value){
//                         
//         	           var incLoop = 0;
//         	           ballbyBallXML.find(value).each(function(){
//         	            	
//         	        	  ballbyBallParserValues[incLoop][value] = $(this).text();
//         	        	  ballbyBallParserValues[incLoop][value] = ballbyBallParserValues[incLoop][value].replace(/'/g,"''");
//         	                
//         	                incLoop++;
//         	            });
//         	               
//         	       });
//					
//					
//					var insertBallDetailsQry = "INSERT INTO "+ ballbyballTable +
//	            		" (match_id, innings_id,"+
//	         			" over_id, ball_id, ball_unique,"+
//	        			" striker_id, non_striker_id, bowler_id,"+
//	        			" is_legal, batsman_runs, extra_runs,"+
//	        			" extra_type, is_wicket, is_updated,"+
//	        			" is_synced, curr_team_runs, curr_team_wickets) VALUES ";
//					
//					var insertBallValuesQry = "";					
//					var ballUnique;
//					
//					for(var valueLoop = 0; valueLoop < ballLength; valueLoop++){
//						
//						var valueStr = "";
//						
//						if(valueLoop == 0){
//							ballUnique = parseFloat(ballbyBallParserValues[valueLoop]["over"])+0.01;
//						}
//						else{							
//							if(ballbyBallParserValues[valueLoop]["over"] == 
//								ballbyBallParserValues[valueLoop-1]["over"]){								
//								ballUnique = parseFloat(ballUnique) + .01;
//							}
//							else{
//								ballUnique = parseFloat(ballbyBallParserValues[valueLoop]["over"])+.01;
//							}
//						}
//						
//						var isLegal = 0;
//						
//						if(ballbyBallParserValues[valueLoop]["is_extra"] == 1 ||
//								ballbyBallParserValues[valueLoop]["is_extra"] == 2)
//							isLegal = 0;
//						else
//							isLegal = 1;
//						
//						var isUpdated = 1;
//						var isSynced = 1;
//						
//						valueStr = "("+
//							ballbyBallParserValues[valueLoop]["match_id"]+","+
//							ballbyBallParserValues[valueLoop]["inni_num"]+","+
//							ballbyBallParserValues[valueLoop]["over"]+","+
//							ballbyBallParserValues[valueLoop]["ball_no"]+","+
//							ballUnique+","+
//							ballbyBallParserValues[valueLoop]["batsman_id"]+","+
//							ballbyBallParserValues[valueLoop]["non_striker_id"]+","+
//							ballbyBallParserValues[valueLoop]["bowler_id"]+","+
//							isLegal+","+
//							ballbyBallParserValues[valueLoop]["runs"]+","+
//							ballbyBallParserValues[valueLoop]["extra_run"]+","+
//							ballbyBallParserValues[valueLoop]["is_extra"]+","+
//							ballbyBallParserValues[valueLoop]["is_wicket"]+","+
//							isUpdated+","+
//							isSynced+","+
//							ballbyBallParserValues[valueLoop]["inn_1_score"]+","+
//							ballbyBallParserValues[valueLoop]["inn_2_score"]+
//							")";
//						
//						if(insertBallValuesQry == ""){
//							insertBallValuesQry = valueStr;
//						}
//						else{
//							insertBallValuesQry = insertBallValuesQry+","+valueStr;
//						}
//						
//					}
//					
//					if(insertBallValuesQry != ""){
//						
//						alert(insertBallDetailsQry + insertBallValuesQry);
//						
//						tx.executeSql(insertBallDetailsQry + insertBallValuesQry,[], function(tx, res){}, errorHandler);
						
						window.location.href = "matchScoreEntry.html?matchId="+matchId+"&tabNo="+tabNo;
						
//					}
					
				}
    			
    			angularScope.remainingPlayer();
                
            }, errorHandler);
        	
	        $(".authentication").hide();            
	        $(".toss-details").removeClass("hide");
	        
        }
    }
	
}

function getScoreError(data, status, req){
	
}

$(document).ready(function()
{
    $("input[type=password]").keyup(function () {
        if (this.value.length == this.maxLength) {
            $(this).next().focus();
        }
    });

});

function closeTossPopup()
{
    $.magnificPopup.close();
}

var playername1Str;
var playername2Str;

var match_participant_id1Str;
var match_participant_id2Str;

var participant_id1Str;
var participant_id2Str;

function MatchScoring($scope)
{
    $scope.details = [];
    
    $scope.addMatchDetails = function()
    {
        playername1Str = matchDetails["name1"];
        
        if(matchDetails["name2"] != "")
        {
            playername1Str = playername1Str + ", " + matchDetails["name2"];
        }
        
        playername2Str = matchDetails["name3"];
        
        if(matchDetails["name4"] != "")
        {
            playername2Str = playername2Str + ", " + matchDetails["name4"];
        }
        
        if(matchDetails["name"].length > 10){
        	
        	matchDetails["name"] = matchDetails["name"].substring(0,10)+"...";
        	
        }
        
        
        match_participant_id1Str = matchDetails["match_participant_id1"];
        
        if(matchDetails["match_participant_id2"] != "")
        {
        	match_participant_id1Str = match_participant_id1Str + ", " + matchDetails["match_participant_id2"];
        }
        
        match_participant_id2Str = matchDetails["match_participant_id3"];
        
        if(matchDetails["match_participant_id4"] != "")
        {
        	match_participant_id2Str = match_participant_id2Str + ", " + matchDetails["match_participant_id4"];
        }
        
        
        
        participant_id1Str = matchDetails["participant_id1"];
        
        if(matchDetails["participant_id2"] != "")
        {
        	participant_id1Str = participant_id1Str + ", " + matchDetails["participant_id2"];
        }
        
        participant_id2Str = matchDetails["participant_id3"];
        
        if(matchDetails["participant_id4"] != "")
        {
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
	        innType:matchDetails["inn_type"]
	        
        }
    }
    
    $scope.addMatchDetails();
    
    $scope.currentTeam = 1;
    
    $scope.addTeamsSquad = function(){
    	
    	$scope.team1Squad = [];    
        $scope.team2Squad = [];
        
    	for(i=0;i<team1Squad.length;i++){
    		
    		var info={
        			indicator:i,
        			id:team1Squad[i]["user_id"],
        			No:team1Squad[i]["jersey_no"],
        			Name:team1Squad[i]["firstname"]+" "+team1Squad[i]["lastname"],
        			Role:teamRole[team1Squad[i]["role_type_id"]-1],
        			imageUrl:playerImagepath+"/"+team1Squad[i]["thumb_loc"],
        			done:false,
        			position:teamRole[team1Squad[i]["role_type_id"]-1]
        	};
    		
    		$scope.team1Squad.push(info);	
    	}
    	
    	for(i=0;i<team2Squad.length;i++){
    		
    		var info={
        			indicator:i,
        			id:team2Squad[i]["user_id"],
        			No:team2Squad[i]["jersey_no"],
        			Name:team2Squad[i]["firstname"]+" "+team2Squad[i]["lastname"],
        			Role:teamRole[team2Squad[i]["role_type_id"]-1],
        			imageUrl:playerImagepath+"/"+team2Squad[i]["thumb_loc"],
        			done:false,
        			position:teamRole[team2Squad[i]["role_type_id"]-1]
        	};
    		
    		$scope.team2Squad.push(info);
    	}
    	
//    	$scope.$digest();
    	$scope.$apply();
    	
    }
    
    $scope.team1PlayingXI = [];    
    $scope.team2PlayingXI = [];
    
    var currentTeam = 1;
    
    $scope.changeTeams = function() {
    	
    	if(currentTeam == 1){
    		
    		currentTeam = 2;
    		
    		$(".team1Squad").addClass("hide");
    		$(".team2Squad").removeClass("hide");
    		
    	}
    	
    	else if(currentTeam == 2){
    		
    		currentTeam = 1;
    		
    		$(".team1Squad").removeClass("hide");
    		$(".team2Squad").addClass("hide");
    	}
		
	}
    
    $scope.addTeam1PlayingXI = function (index){
    	
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
    
    $scope.addTeam2PlayingXI = function (index){
    	
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
    
    $scope.checkingPlayingXI = function(id) {
    	
    	for(i=0;i<$scope.team1PlayingXI.length;i++){
    		
			if($scope.team1Squad[$scope.team1PlayingXI[i].index].id == id)
				return true;
			
		}
    	
    	return false;
		
	}
    
    $scope.sendTossDetails = function(){
    	
    	var team1Length = $scope.team1PlayingXI.length;    	
    	var team2Length = $scope.team2PlayingXI.length;
    	
    	if($scope.matchAttr.toss_won_by_team == undefined){
    		alert("Choose the toss won team ");    		
    	}
    	
    	else if($scope.matchAttr.team_decision == undefined){
    		alert("Choose the team decision");
    	}
    	
		else if($scope.matchAttr.total_overs == undefined){
			alert("Enter the total overs");
    	}
    	
		else if($scope.matchAttr.tot_num_player == undefined){
			alert("Enter the total number of players");
		}
    	
		else if($scope.matchAttr.tot_num_player < 2){
			alert("Minimum 2 players has to play");
		}
    	
		else if(team1Length != $scope.matchAttr.tot_num_player){
			alert("Please choose "+$scope.matchAttr.tot_num_player+" players in "+$scope.details.playername1);
		}
    	
		else if(team2Length != $scope.matchAttr.tot_num_player){
			alert("Please choose "+$scope.matchAttr.tot_num_player+" players in "+$scope.details.playername2);
		}
    	
		else {
			
			for(i=0;i<team1Length;i++){
		    	
	    		var playerId ={};
	    		
	    		playerId["playerid"] = $scope.team1Squad[$scope.team1PlayingXI[i].index].id;
	    			
	  			team1PlayersJSON.push(playerId);
	    	}
	    	
	    	playerAttrJSON[$scope.details.match_participant_id1] = team1PlayersJSON;
	    	
	    	
	    	
	    	for(i=0;i<team2Length;i++){
	    	
	    		var playerId ={};
	    		
	    		playerId["playerid"] = $scope.team2Squad[$scope.team2PlayingXI[i].index].id;
	    			
	  			team2PlayersJSON.push(playerId);
	    	}
	    	
	    	playerAttrJSON[$scope.details.match_participant_id2] = team2PlayersJSON;
	    	
	    	var is_last_man_batting;
	    	
	    	if($scope.matchAttr.lastman_batting)
				is_last_man_batting = 1;
			else
				is_last_man_batting = 0;
	    	
	    	matchAttrJSON["toss_won_by_team"] = $scope.matchAttr.toss_won_by_team;
			matchAttrJSON["result"] = "";
			matchAttrJSON["team_decision"] = $scope.matchAttr.team_decision;
			matchAttrJSON["total_overs"] = $scope.matchAttr.total_overs;
			matchAttrJSON["lastman_batting"] = is_last_man_batting;
			matchAttrJSON["tot_num_player"] = $scope.matchAttr.tot_num_player;
			matchAttrJSON["inn_type"] = $scope.details.innType;
			
			sendToss();
			
		}
    	
    }
    
    $scope.remainingPlayer = function(){
    	
    	$scope.battingRemaining = [];
        $scope.bowlingRemaining = [];
        
        db.transaction(function(tx) {
        	
        	var selectQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+$scope.details.match_id+
			" AND score.innings_id = "+$scope.currentInnings+
			" AND score.batting_bowling_order = 0"+
			" AND score.is_batting = 1";
        	
        	console.log(selectQry);      	
			
			tx.executeSql(selectQry
					,[],
					
			function(tx, res){
				
				for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
					
					var info = {
		        			indicator:playerLoop,
		        			id:res.rows.item(playerLoop).player_id,
		        			No:res.rows.item(playerLoop).jersey_no,
		        			Name:res.rows.item(playerLoop).first_name+" "+res.rows.item(playerLoop).last_name,
		        			Role:teamRole[res.rows.item(playerLoop).player_role-1],
		        			imageUrl:playerImagepath+"/"+res.rows.item(playerLoop).player_image,
		        			done:"",
		        			position:teamRole[res.rows.item(playerLoop).team_role-1]
		        	};
		    		
		    		$scope.battingRemaining.push(info);
					
				}
				
//				$scope.$apply();
						
			}
			
			,errorHandler);
			
			var bowlingQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+$scope.details.match_id+
			" AND score.innings_id = "+$scope.currentInnings+
			" AND score.batting_bowling_order = 0"+
			" AND score.is_batting = 0";
        	
        	console.log(bowlingQry);      	
			
			tx.executeSql(bowlingQry
					,[],
					
			function(tx, res){
				
				for(var playerLoop = 0; playerLoop < res.rows.length; playerLoop++){
					
					var info = {
		        			indicator:playerLoop,
		        			id:res.rows.item(playerLoop).player_id,
		        			No:res.rows.item(playerLoop).jersey_no,
		        			Name:res.rows.item(playerLoop).first_name+" "+res.rows.item(playerLoop).last_name,
		        			Role:teamRole[res.rows.item(playerLoop).player_role-1],
		        			imageUrl:playerImagepath+"/"+res.rows.item(playerLoop).player_image,
		        			done:"",
		        			position:teamRole[res.rows.item(playerLoop).team_role-1]
		        	};
		    		
		    		$scope.bowlingRemaining.push(info);
					
				}
				
//				alert($scope.battingRemaining.length);
				
				$scope.$apply();
						
			}
			
			,errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.chooseStrikers = function(index){
    	    	
    	$scope.choosedId = $scope.battingRemaining[index].id;
    	
    }
    
    $scope.chooseBowlers = function(index){
    	    	
    	$scope.choosedId = $scope.bowlingRemaining[index].id;
    	
    }
    
    $scope.addStrikers = function(){
    	
    	if($scope.choosedId != ""){
			
			if($scope.strikerId == ""){
				$scope.strikerId = $scope.choosedId;
			}
			else{
				$scope.nonStrikerId = $scope.choosedId;
				
				$(".striker-details").addClass("hide");
	    		$(".bowler-details").removeClass("hide");
				
			}
			
			$scope.choosedId = "";
			
			db.transaction(function(tx) {
				
				if($scope.strikerId != ""){
	        	
		        	var strikerQry = "UPDATE "+fullScoreTable+" SET" +
					" batting_bowling_order = 1 WHERE" +
					" match_id = " +$scope.details.match_id+
					" AND innings_id = "+$scope.currentInnings+
					" AND player_id = "+$scope.strikerId
					" AND batting_bowling_order = 0"+
					" AND is_batting = 1";
		        	
		        	console.log(strikerQry);
					tx.executeSql(strikerQry,[],function(tx, res){},errorHandler);
				
				}
				
				if($scope.nonStrikerId != ""){
		        	
		        	var nonStrikerQry = "UPDATE "+fullScoreTable+" SET" +
					" batting_bowling_order = 2 WHERE" +
					" match_id = " +$scope.details.match_id+
					" AND innings_id = "+$scope.currentInnings+
					" AND player_id = "+$scope.nonStrikerId
					" AND batting_bowling_order = 0"+
					" AND is_batting = 1";
		        	
		        	console.log(nonStrikerQry);
					tx.executeSql(nonStrikerQry,[],function(tx, res){},errorHandler);
				
				}
			
			}, errorHandler);
			
			$scope.remainingPlayer();
    	
    	}
    	else{
    		
    		alert("Choose any one player");
    		
    	}
    	
    }
    
    $scope.addBowlers = function (){
    	
    	if($scope.choosedId != ""){
    	
	    	$scope.currBowlerId = $scope.choosedId;
	    	
	    	$scope.choosedId = "";
			
			db.transaction(function(tx) {
				
				if($scope.strikerId != ""){
	        	
		        	var strikerQry = "UPDATE "+fullScoreTable+" SET" +
					" batting_bowling_order = 1 WHERE" +
					" match_id = " +$scope.details.match_id+
					" AND innings_id = "+$scope.currentInnings+
					" AND player_id = "+$scope.currBowlerId
					" AND batting_bowling_order = 0"+
					" AND is_batting = 0";
		        	
		        	console.log(strikerQry);
					tx.executeSql(strikerQry,[],function(tx, res){
						
						var insertBallDetailsQry = "INSERT INTO "+ ballbyballTable +
                		" (match_id, innings_id,"+
             			" over_id, ball_id, ball_unique,"+
            			" striker_id, non_striker_id, bowler_id,"+
            			" batsman_runs, extra_runs,"+
            			" extra_type, is_wicket, is_updated,"+
            			" is_synced, curr_team_runs, curr_team_wickets, required_runs," +
            			" remaining_balls, this_over) VALUES ";
						
						var insertBallDetailsVal = "("+$scope.details.match_id+","+$scope.currentInnings+","
						+"0,0,0.01,"
						+$scope.strikerId+","+$scope.nonStrikerId+","+$scope.currBowlerId+","
						+"0,0,"
						+"0,0,0,"
						+"0,0,0,0,"
						+"0,'')"
						
						console.log(ballbyballTable+" INSERTION ===> "+insertBallDetailsQry+insertBallDetailsVal);
						
						tx.executeSql("DELETE FROM "+ballbyballTable+" WHERE match_id = "+$scope.details.match_id,[],function(){},errorHandler);
						
						tx.executeSql(insertBallDetailsQry+insertBallDetailsVal,[],function(){},errorHandler);
						
//						alert(matchId);
						
						window.location.href = "matchScoreEntry.html?matchId="+matchId+"&tabNo="+tabNo;
						
					},errorHandler);
				
				}
				
	        }, errorHandler);
		 
	    }
		else{
			
			alert("Choose any one player");
			
		}
    	
    }
    
    $scope.matchAttr = {};
    
    $scope.currentInnings = "";
    $scope.battingTeam = "";
    $scope.bowlingTeam = "";
    
    $scope.strikerId = "";
    $scope.nonStrikerId = "";
    $scope.currBowlerId = "";
    
    $scope.choosedId = "";
    
}

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
	 <access_key>' + 123456 + '</access_key> \
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
	
	if (status == "success")
	{
		var responseXML = $(req.responseXML);
      
		var matchStatus = responseXML.find("matchstatus").text();
		
		angularScope.currentInnings = "1";
		
		if(angularScope.details.participant_id1 == matchAttrJSON["toss_won_by_team"]){
			
			if(matchAttrJSON["team_decision"] == "Bat"){
				angularScope.battingTeam = "1";
			}
			else{
				angularScope.battingTeam = "2";
			}
			
		}
		else{
			if(matchAttrJSON["team_decision"] == "Bat"){
				angularScope.battingTeam = "2";
			}
			else{
				angularScope.battingTeam = "1";
			}
		}
		
		db.transaction(function(tx) {
			
			tx.executeSql("DELETE FROM "+matchAttributes+" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
			tx.executeSql("DELETE FROM "+fullScoreTable+" WHERE match_id = "+angularScope.details.match_id,[],function(){},errorHandler);
			
//			var is_last_man_batting;
//			
//			if(matchAttrJSON["lastman_batting"])
//				is_last_man_batting = 1;
//			else
//				is_last_man_batting = 0;
//			
			var insertMatchAttr = "INSERT INTO "+matchAttributes+
			" (match_id, toss_won_by, toss_decision, "+
			"no_of_players, innings_count, total_overs, " +
			"is_last_man_batting, current_innings, result," +
			"innings_1_score, innings_2_score, innings_3_score, innings_4_score)"+
			" VALUES "+
			"("+angularScope.details.match_id+","+matchAttrJSON["toss_won_by_team"]+",'"+matchAttrJSON["team_decision"]+"',"+
			matchAttrJSON["tot_num_player"]+","+matchAttrJSON["inn_type"]+","+matchAttrJSON["total_overs"]+","+
			matchAttrJSON["lastman_batting"]+","+1+",''" +
			",'','','','')";
			
			console.log(matchAttributes+" INSERTION ===> "+insertMatchAttr);
			
//			alert("insertMatchAttr "+insertMatchAttr);
			
			tx.executeSql(insertMatchAttr,[],function(){},errorHandler);
			
//			alert("insertMatchAttr after "+insertMatchAttr);
			
			for(var inningsLoop = 1;inningsLoop < 3;inningsLoop++){
				
				var insertFullQry = "INSERT INTO "+fullScoreTable+
				"(match_id, innings_id, player_id, " +
				"match_participant_id, batting_bowling_order, score_info_1, " +
				"score_info_2, score_info_3, score_info_4, " +
				"score_info_5, is_batting, out_text, extra_count) VALUES ";
				
				var valuesQry = "";
				
				for(var teamLoop = 0; teamLoop < 2; teamLoop++){
					
					var playersLength;
					var currentTeam;
					
					var isbatting;
					
					var extraText;
					
					if(inningsLoop == 1){
						
						if(teamLoop == 0){
							
							if(angularScope.battingTeam == "1"){
								playersLength = angularScope.team1PlayingXI.length;
								currentTeam = 1;
							}
							else{
								playersLength = angularScope.team2PlayingXI.length;
								currentTeam = 2;
							}
							
							isbatting = 1;
							extraText='';
							
						}
						else{
							
							if(angularScope.battingTeam == "1"){
								playersLength = angularScope.team2PlayingXI.length;
								currentTeam = 2;
							}
							else{
								playersLength = angularScope.team1PlayingXI.length;
								currentTeam = 1;
							}
							
							isbatting = 0;
							extraText='0'+separater+'0';
							
						}
						
					}
					else{
						
						if(teamLoop == 0){
							
							if(angularScope.battingTeam == "1"){
								playersLength = angularScope.team2PlayingXI.length;
								currentTeam = 2;
							}
							else{
								playersLength = angularScope.team1PlayingXI.length;
								currentTeam = 1;
							}
							
							isbatting = 1;
							extraText='';
							
						}
						else{
							
							if(angularScope.battingTeam == "1"){
								playersLength = angularScope.team1PlayingXI.length;
								currentTeam = 1;
							}
							else{
								playersLength = angularScope.team2PlayingXI.length;
								currentTeam = 2;
							}
							
							isbatting = 0;
							extraText='0'+separater+'0';
							
						}
						
					}
					
					if(isbatting == 1){
						
						if(currentTeam == 1){
					
							var insertFullInfoQry = "INSERT INTO "+fullScoreInfoTable+
							" (match_id, innings_id, match_participant_id, extra_text, team_runs, team_wickets, team_overs) VALUES" +
							" ("+angularScope.details.match_id+","+inningsLoop+","+angularScope.details.match_participant_id1+"'',0,0,'0.0')";
						
							console.log(fullScoreInfoTable+" INSERTION ===> "+insertFullInfoQry);
							
							tx.executeSql(insertFullInfoQry,[],function(){},errorHandler);
						
						}
						else{
							
							var insertFullInfoQry = "INSERT INTO "+fullScoreInfoTable+
							" (match_id, innings_id, match_participant_id, extra_text, team_runs, team_wickets, team_overs) VALUES" +
							" ("+angularScope.details.match_id+","+inningsLoop+","+angularScope.details.match_participant_id2+"'',0,0,'0.0')";
						
							console.log(fullScoreInfoTable+" INSERTION ===> "+insertFullInfoQry);
							
							tx.executeSql(insertFullInfoQry,[],function(){},errorHandler);
						}
					
					}
					
//					alert("playersLength "+playersLength);
					
					for(var playerLoop = 0;playerLoop < playersLength;playerLoop++){
						
						var valueStr = "";
						
						if(currentTeam == 1){
							
							valueStr = "("+angularScope.details.match_id+","+inningsLoop+","+
							angularScope.team1Squad[angularScope.team1PlayingXI[playerLoop].index].id+","+
							angularScope.details.match_participant_id1+","+
							"0,0,0,0,0,0,"+isbatting+",'','"+extraText+"')";
							
						}
						else{
							
							valueStr = "("+angularScope.details.match_id+","+inningsLoop+","+
							angularScope.team2Squad[angularScope.team2PlayingXI[playerLoop].index].id+","+
							angularScope.details.match_participant_id2+","+
							"0,0,0,0,0,0,"+isbatting+",'','"+extraText+"')";
							
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
						
//						console.log(insertFullQry + valuesQry);
						
						tx.executeSql(insertFullQry + valuesQry,[], function(tx, res) {
							
							$(".striker-details").removeClass("hide");            
						    $(".toss-details").hide();
                            
                        }, errorHandler);
					}
	            }
			}
			
			angularScope.remainingPlayer();
            
        }, errorHandler);
		
	}
	
}

function sendTossError(data, status, req){
	
	alert("send Toss error "+status);
	
}

var matchAttrJSON = {};
var playerAttrJSON = {};
var team1PlayersJSON = [];
var team2PlayersJSON = [];



