var db;

var matchId = '';

var matchDetails = new Array();

var plapp = angular.module('plappm', []);

var tabNo = '';

var angluarScope;

var teamRole = ["","C","VC",""];

function onDeviceReady()
{
	document.addEventListener("backbutton", function() {
		
		if(!$(".extrasContent").hasClass("hide"))
			$(".extrasContent").addClass("hide")
		else if((!$('.strikerDetails').hasClass("hide") || !$('.nonStrikerDetails').hasClass("hide") || !$('.bowlerDetails').hasClass("hide")))
			hideInfo();
		else{
//			window.location.href="index.html"			
		}
			
			
	    
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

function showExtraDetails(){
	$(".extrasContent").removeClass("hide");
}

var playername1Str;
var playername2Str;

var match_participant_id1Str;
var match_participant_id2Str;

var participant_id1Str;
var participant_id2Str;

function MatchScoring($scope)
{
//    $scope.details = [];
    
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
    
    $scope.battingRemaining = [];
    $scope.bowlingRemaining = [];
    
    $scope.remainingPlayer = function(){
    	
    	$scope.battingRemaining = [];
        $scope.bowlingRemaining = [];
        
        db.transaction(function(tx) {
        	
        	var selectQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+$scope.details.match_id+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
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
				
			}
			
			,errorHandler);
        	
			var bowlingQry = "SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
			" ON squad.player_id = score.player_id " +
			" AND squad.match_id = score.match_id " +
			" AND squad.match_participant_id = score.match_participant_id WHERE" +
			" score.match_id = "+$scope.details.match_id+
			" AND score.innings_id = "+$scope.nextBallInfo.inningsId+
			" AND score.player_id != "+$scope.nextBallInfo.bowlerId+
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
		        			imageUrl:playerImagepath+"/"+res.rows.item(playerLoop).player_image,
		        			done:"",
		        			position:teamRole[res.rows.item(playerLoop).team_role-1]
		        	};
					
		    		$scope.bowlingRemaining.push(info);
					
				}
				
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
    	
    	var playerId;
    	
    	if($scope.choosedId != ""){
			
			if($scope.nextBallInfo.strikerId == 0){
				$scope.nextBallInfo.strikerId = $scope.choosedId;
			}
			else{
				$scope.nextBallInfo.nonStrikerId = $scope.choosedId;
			}
			
			playerId = $scope.choosedId; 
			
			$scope.choosedId = "";
			
			$(".next-batsman-details").addClass("hide");
			
			db.transaction(function(tx) {
				
				var getBattingOrder = " SELECT batting_bowling_order FROM "+fullScoreTable+
					" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
					" AND player_id = "+playerId+
					" AND match_id = "+$scope.details.match_id;
				
				tx.executeSql(getBattingOrder,[],function(tx, res){
					
					if(res.rows.item(0).batting_bowling_order == 0){
						
						var getMaxBowlingOrder = " SELECT MAX(batting_bowling_order) as max_order FROM "+fullScoreTable+
						" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
						" AND match_id = "+$scope.details.match_id+
						" AND is_batting = 1";
						
//						alert(getMaxBowlingOrder);
						
						tx.executeSql(getMaxBowlingOrder,[],function(tx, res){
							
							var maxOrder = res.rows.item(0).max_order+1;
							
//							alert(maxOrder);
							
							var strikerQry = "UPDATE "+fullScoreTable+" SET" +
							" batting_bowling_order = "+maxOrder+" WHERE" +
							" match_id = " +$scope.details.match_id+
							" AND innings_id = "+$scope.nextBallInfo.inningsId+
							" AND player_id = "+playerId+
							" AND batting_bowling_order = 0"+
							" AND is_batting = 1";
							
							tx.executeSql(strikerQry,[],function(tx, res){},errorHandler);
							
						},errorHandler);
					}
					
				},errorHandler);
				
	        }, errorHandler);
			
			$scope.insertNewBall();
    	
    	}
    	else{
    		
    		alert("Choose any one player");
    		
    	}
    	
    }
    
    $scope.addBowlers = function (){
    	
    	if($scope.choosedId != ""){
    		
    		var playerId = $scope.choosedId;
    		
    		$scope.choosedId = "";
    		
    		$scope.nextBallInfo.bowlerId = playerId;
    		$scope.insertNewBall();
    		
    		$(".next-bowler-details").addClass('hide');
			
			db.transaction(function(tx) {
				
				var getBowlingOrder = " SELECT batting_bowling_order FROM "+fullScoreTable+
					" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
					" AND player_id = "+playerId+
					" AND match_id = "+$scope.details.match_id;
				
				tx.executeSql(getBowlingOrder,[],function(tx, res){
					
					if(res.rows.item(0).batting_bowling_order == 0){
						
						var getMaxBowlingOrder = " SELECT MAX(batting_bowling_order) as max_order FROM "+fullScoreTable+
						" WHERE innings_id = "+$scope.nextBallInfo.inningsId+
						" AND match_id = "+$scope.details.match_id+
						" AND is_batting = 0";
						
						tx.executeSql(getMaxBowlingOrder,[],function(tx, res){
							
							var maxOrder = res.rows.item(0).max_order+1;							
							
							var strikerQry = "UPDATE "+fullScoreTable+" SET" +
							" batting_bowling_order = "+maxOrder+" WHERE" +
							" match_id = " +$scope.details.match_id+
							" AND innings_id = "+$scope.nextBallInfo.inningsId+
							" AND player_id = "+playerId+
							" AND batting_bowling_order = 0"+
							" AND is_batting = 0";
							
							tx.executeSql(strikerQry,[],function(tx, res){},errorHandler);
							
						},errorHandler);
						
					}
					
				},errorHandler);
				
	        }, errorHandler);
		
	    }
		else{
			
			alert("Choose any one player");
			
		}
    	
    }
    
    $scope.matchAttr = {};
    
    $scope.choosedId = "";
    
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
    		
    		thisOverInfo:[],
    
    		currentInnings:"",
    		currentOver:"",
    		currentBall:"",
    		ballUnique:"",
    		
    		currTeamRuns:"",
    		currTeamWickets:"",
    		requiredRuns:"",
    		remainingBalls:"",
    		
    		currInningsExtraStr:"",
    		
    		thisOverStr:""
    		
			
	};
    
    $scope.getBallInfo = function (){
    	
    	db.transaction(function(tx) {
    		
    		var getBallbyBallInfo = "SELECT * FROM "+ballbyballTable+" WHERE match_id="+matchId+" AND is_updated=0";
    		
    		tx.executeSql(getBallbyBallInfo,[],function(tx,res){
    			
    			if(res.rows.length <= 0)
                {
                    history.go(-1);
                }
                else
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
                	
                	
                	if($scope.matchBallInfo.currentInnings == 2){
                		
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
        			" score.match_id = "+$scope.details.match_id+
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
                        }
                		
                	},errorHandler);
                	
                	var nonStrikerInfoQry = 
                	"SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
        			" ON squad.player_id = score.player_id " +
        			" AND squad.match_id = score.match_id " +
        			" AND squad.match_participant_id = score.match_participant_id WHERE" +
        			" score.match_id = "+$scope.details.match_id+
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
                        }
                		
                	},errorHandler);
                    	
                	var bowlerInfoQry = 
                	"SELECT * FROM "+matchSquadTable+" squad LEFT JOIN "+fullScoreTable+" score" +
        			" ON squad.player_id = score.player_id " +
        			" AND squad.match_id = score.match_id " +
        			" AND squad.match_participant_id = score.match_participant_id WHERE" +
        			" score.match_id = "+$scope.details.match_id+
        			" AND score.innings_id = "+$scope.matchBallInfo.currentInnings+
        			" AND squad.player_id = "+$scope.matchBallInfo.bowlerId;
                	
                	console.log(" Bowler Info ====> "+bowlerInfoQry);
                	
                	tx.executeSql(bowlerInfoQry,[],function(tx,res){
                		
                		if(res.rows.length > 0)
                        {	
                        	$scope.matchBallInfo.bowlerName = res.rows.item(0).first_name+res.rows.item(0).last_name;
                        	$scope.matchBallInfo.bowlerImage = res.rows.item(0).player_image;
                        	
                        	var oversFloat = parseInt(res.rows.item(0).score_info_1);
                        	
                        	var overs = parseInt(oversFloat/6);
                        	
                        	var balls = oversFloat%6;
                        	
                        	var combinedOvers = overs+"."+balls;
                        	                        	
                        	$scope.matchBallInfo.bowlerOvers = combinedOvers;
                        	$scope.matchBallInfo.bowlerMaidens = res.rows.item(0).score_info_2;
                        	$scope.matchBallInfo.bowlerRuns = res.rows.item(0).score_info_3;
                        	$scope.matchBallInfo.bowlerWickets = res.rows.item(0).score_info_4;
                        	$scope.matchBallInfo.bowlerEcon = res.rows.item(0).score_info_5;
                        	
                        	$scope.matchBallInfo.bowlerBalls = res.rows.item(0).score_info_1;
                        	$scope.matchBallInfo.bowlerextras = res.rows.item(0).extra_count;
                        }
                		
                	},errorHandler);
                	
                	
                	var matchInfoQry = 
                    	"SELECT * FROM "+fullScoreInfoTable+ " WHERE"+
            			" match_id = "+$scope.details.match_id;
                    	
                	console.log(" Match Info ====> "+matchInfoQry);
                    	
                	tx.executeSql(matchInfoQry,[],function(tx,res){
                    		
                		if(res.rows.length > 0)
                        {	
                			
//                			alert("$scope.matchBallInfo.currentInnings "+$scope.matchBallInfo.currentInnings);
                			
                			for(var infoLoop=0; infoLoop < res.rows.length; infoLoop++){
                				
//                				alert("res.rows.item(infoLoop).innings_id "+res.rows.item(infoLoop).innings_id);
                    				
                				if(res.rows.item(infoLoop).innings_id < 3 && $scope.matchBallInfo.currentInnings >= res.rows.item(infoLoop).innings_id){
                    					
                					if(res.rows.item(infoLoop).match_participant_id == $scope.details.match_participant_id1){
                    						
                						$scope.matchBallInfo.team1Innings1Runs = res.rows.item(infoLoop).team_runs;
                						$scope.matchBallInfo.team1Innings1Wickets = res.rows.item(infoLoop).team_wickets;
                						$scope.matchBallInfo.team1Innings1Overs = res.rows.item(infoLoop).team_overs;
                						$scope.matchBallInfo.team1Innings1RR = runRateCalculation($scope.matchBallInfo.team1Innings1Runs,$scope.matchBallInfo.team1Innings1Overs);
                						
                						if($scope.matchBallInfo.currentInnings == 2){
                							$scope.matchBallInfo.matchStatus = $scope.details.playername1+
                							" need "+ $scope.matchBallInfo.requiredRuns +" runs from "+
                		                	$scope.matchBallInfo.remainingBalls +" balls";
                						}
                						
//                						alert("$scope.matchBallInfo.team1Innings1Runs "+$scope.matchBallInfo.team1Innings1Runs);
//                						alert("$scope.matchBallInfo.team1Innings1Wickets "+$scope.matchBallInfo.team1Innings1Wickets);
//                						alert("$scope.matchBallInfo.team1Innings1Overs "+$scope.matchBallInfo.team1Innings1Overs);
//                						alert("$scope.matchBallInfo.team1Innings1RR "+$scope.matchBallInfo.team1Innings1RR);

                					}
                					else{
                						
                						$scope.matchBallInfo.team2Innings1Runs = res.rows.item(infoLoop).team_runs;
                						$scope.matchBallInfo.team2Innings1Wickets = res.rows.item(infoLoop).team_wickets;
                						$scope.matchBallInfo.team2Innings1Overs = res.rows.item(infoLoop).team_overs;
                						$scope.matchBallInfo.team2Innings1RR = runRateCalculation($scope.matchBallInfo.team2Innings1Runs,$scope.matchBallInfo.team2Innings1Overs);
                						
                						if($scope.matchBallInfo.currentInnings == 2){
                							$scope.matchBallInfo.matchStatus = $scope.details.playername2+
                							" need "+ $scope.matchBallInfo.requiredRuns +" runs from "+
                		                	$scope.matchBallInfo.remainingBalls +" balls";
                						}
                						
//                						alert("$scope.matchBallInfo.team2Innings1Runs "+$scope.matchBallInfo.team2Innings1Runs);
//                						alert("$scope.matchBallInfo.team2Innings1Wickets "+$scope.matchBallInfo.team2Innings1Wickets);
//                						alert("$scope.matchBallInfo.team2Innings1Overs "+$scope.matchBallInfo.team2Innings1Overs);
//                						alert("$scope.matchBallInfo.team2Innings1RR "+$scope.matchBallInfo.team2Innings1RR);
                						
                					}
                    					
                				}
                				
                				if($scope.matchBallInfo.currentInnings == res.rows.item(infoLoop).innings_id){
                					$scope.matchBallInfo.currInningsExtraStr = res.rows.item(infoLoop).extra_text;
                				}
                    				
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
                		
                		$scope.$apply();
                    		
                	},errorHandler);
                	
                }
    			
    		},errorHandler);
			
        }, errorHandler);
    	
    }
    
    $scope.matchAttributes={
    		
    		tossWonBy:"",
    		tossDecision:"",
    		noofPlayers:"",
			inningsCount:"",
			totalOvers:"",
			isLastManBatting:""
			
	};
    
    $scope.getMatchAttributes = function() {
    	
    	var matchAttributesQry = "SELECT * FROM "+matchAttributes+" WHERE match_id="+$scope.details.match_id;
    	
    	db.transaction(function(tx) {
    	
			tx.executeSql(matchAttributesQry,[],function(tx,res){
				
				if(res.rows.length > 0)
	            {
					$scope.matchAttributes.tossWonBy = res.rows.item(0).toss_won_by;
					$scope.matchAttributes.tossDecision = res.rows.item(0).toss_decision;
					$scope.matchAttributes.noofPlayers = res.rows.item(0).no_of_players;
					$scope.matchAttributes.inningsCount = res.rows.item(0).innings_count;
					$scope.matchAttributes.totalOvers = res.rows.item(0).total_overs;
					$scope.matchAttributes.isLastManBatting = res.rows.item(0).is_last_man_batting;
				}
			
			},errorHandler);
			
    	},errorHandler);
		
	}
    
    $scope.getMatchAttributes();
    
    $scope.getBallInfo();
    
    
    $scope.swapStrikers = function (){
    	
    	db.transaction(function(tx) {
    		
    		var updateStrikers = "UPDATE "+ballbyballTable+
    		" SET striker_id = "+$scope.matchBallInfo.nonStrikerId+","+
    		" non_striker_id = "+$scope.matchBallInfo.strikerId+
    		" WHERE match_id="+$scope.details.match_id;
        	
			tx.executeSql(updateStrikers,[],function(tx,res){
				
				$scope.getBallInfo();
			
			},errorHandler);
			
    	},errorHandler);
    	
    }
    
    $scope.updateRuns = function (batsmanRuns,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,0,0,0,0,0,0,thisOverText);
    }
    
    $scope.updateExtras = function (batsmanRuns,extraRuns,extraType,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,extraRuns,extraType,0,0,0,0,thisOverText);
    	$(".extrasContent").addClass("hide");
    }
    
    $scope.updateWickets = function (batsmanRuns,extraRuns,extraType,wicketType,outBatsmanId,fielderIds,thisOverText){
    	$scope.updateBalldetails(batsmanRuns,extraRuns,extraType,1,wicketType,outBatsmanId,fielderIds,thisOverText);
    }
    
    $scope.updateBalldetails = function (batsmanRuns,extraRuns,extraType,
    		isWicket,wicketType,outBatsmanId,fielderIds,thisOverText){
    	
    	var teamRuns,teamWickets,teamBall,teamRequired,teamRemaining;
    	
    	var updateBallQryFirstPart = "UPDATE "+ballbyballTable+" SET ";
    	var updateBallQryLastPart = " WHERE ball_unique = "+$scope.matchBallInfo.ballUnique+
	    	" AND innings_id = "+$scope.matchBallInfo.currentInnings+
			" AND match_id = "+$scope.details.match_id;
    	
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
    	
    	
    	
    	if($scope.matchBallInfo.requiredRuns > 0){
    		teamRequired = ($scope.matchBallInfo.requiredRuns-(batsmanRuns+extraRuns));
    	}
    	else{
    		teamRequired = 0;
    	}
    	
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
    		" AND match_id = "+$scope.details.match_id;
    	
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
    	
    	
    	
    	var outText = "";
    	
    	var fielderNames = "";
    	
    	if(isWicket != 0){
    		
    		if(wicketType == 1){
    			outText = "b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 2){
    			outText = "c "+fielderNames+" b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 3){
    			outText = "lbw b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 4){
    			outText = "st "+fielderNames+" b "+$scope.matchBallInfo.bowlerName;
    		}
    		else if(wicketType == 5){
    			outText = "runout("+fielderNames+")";
    		}
    		else if(wicketType == 6){
    			outText = "hitwicket b "+$scope.matchBallInfo.bowlerName
    		}
    		else if(wicketType == 7){
    			outText = "handled the ball";
    		}
    		else if(wicketType == 8){
    			outText = "hit the ball twice";
    		}
    		else if(wicketType == 9){
    			outText = "obstructing the field";
    		}
    		
    	}
    	
    	
    	
    	var nonStrikerUpdateQry="";
    	
    	if(outBatsmanId == $scope.matchBallInfo.strikerId)
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '"+outText+"' ";
    	else{
    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '' ";
    		
    		nonStrikerUpdateQry = "UPDATE "+fullScoreTable+
    			" SET out_text = '"+outText+
    			"' WHERE player_id = "+$scope.matchBallInfo.nonStrikerId+
        		" AND innings_id = "+$scope.matchBallInfo.currentInnings+
        		" AND match_id = "+$scope.details.match_id;
    		
    	}
    	
    	
    	

    	
    	var bowlerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
    	var bowlerUpdateQryLastPart = " WHERE player_id = "+$scope.matchBallInfo.bowlerId+
			" AND innings_id = "+$scope.matchBallInfo.currentInnings+
			" AND match_id = "+$scope.details.match_id;
    	
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
    				alert((parseInt($scope.matchBallInfo.bowlerMaidens)+1));
    			}
    			
    		}
    		
    	}
    	
    	var bowlerRunsConceded = parseInt($scope.matchBallInfo.bowlerRuns)+batsmanRuns;
    	
    	if(extraType == 3 || extraType == 4){
    		bowlerRunsConceded = bowlerRunsConceded+extraRuns;
    	}
    	
    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_3 = '"+bowlerRunsConceded+"', ";
    	
    	if(isWicket == 1){
    		if(wicketType != 5 && wicketType < 7)
    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_4 = '"+($scope.matchBallInfo.bowlerWickets+1)+"', ";
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
			" AND match_id = "+$scope.details.match_id;
    	
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
//    	alert(updateBallQry);
    	console.log("Update Ball ===> "+updateBallQry);
		
		var strikerUpdateQry = strikerUpdateQryFirstPart+strikerUpdateQryValuesPart+strikerUpdateQryLastPart;
//    	alert(strikerUpdateQry);
    	console.log("Striker Info Update Ball ===> "+strikerUpdateQry);
		
		var bowlerUpdateQry = bowlerUpdateQryFirstPart+bowlerUpdateQryValuesPart+bowlerUpdateQryLastPart;
//    	alert(bowlerUpdateQry);
    	console.log("Bowler Info Update Ball ===> "+bowlerUpdateQry);
		
		var fullScoreInfoQry = fullScoreInfoQryFirstPart+fullScoreInfoQryValuesPart+fullScoreInfoQryLastPart;
//    	alert(fullScoreInfoQry);
    	console.log("Full Score Info Update Ball ===> "+fullScoreInfoQry);
    	
    	
    	db.transaction(function(tx) {
        	
			tx.executeSql(updateBallQry,[],function(tx,res){},errorHandler);
			tx.executeSql(strikerUpdateQry,[],function(tx,res){},errorHandler);
			
			if(nonStrikerUpdateQry!="")			
				tx.executeSql(nonStrikerUpdateQry,[],function(tx,res){},errorHandler);
			
			tx.executeSql(bowlerUpdateQry,[],function(tx,res){},errorHandler);
			tx.executeSql(fullScoreInfoQry,[],function(tx,res){},errorHandler);
			
    	},errorHandler);
    	
    	    	
    	$scope.matchBallInfo.currTeamRuns = teamRuns;
    	
    	$scope.nextBallInfo.matchId = $scope.details.match_id;
    	
    	var inningsId = 0,overId,ballId,ballUnique;
    	
    	if(teamBall == 6){
    		overId = ($scope.matchBallInfo.currentOver+1);
    		ballId = 0;
    		ballUnique = overId + 0.01;
    	}
    	else{
    		overId = $scope.matchBallInfo.currentOver;
    		ballId = teamBall;
    		ballUnique = $scope.matchBallInfo.ballUnique+0.01;
    	}
    	
    	inningsId = $scope.matchBallInfo.currentInnings;
    	
    	if($scope.matchBallInfo.currentInnings == 1){
			if($scope.matchAttributes.isLastManBatting == 1 && $scope.matchAttributes.noofPlayers == teamWickets){
				$scope.newInnings();
				inningsId = 0;
			}
			else if($scope.matchAttributes.isLastManBatting == 0 && ($scope.matchAttributes.noofPlayers-1) == teamWickets){
				$scope.newInnings();
				inningsId = 0;
			}
			else if(overId == $scope.matchAttributes.totalOvers && $scope.matchAttributes.totalOvers != 0){
				$scope.newInnings();
				inningsId = 0;
			}
			else
				inningsId = 1;
		}
    	else if(teamRequired <= 0 && teamRemaining >= 0){    		
    		alert("batting team wins");
    	}
    	else if(teamRequired >= 0 && teamRemaining == 0){    		
    		alert("bowling team wins");
    	}
    	
    	if($scope.matchBallInfo.currentInnings == inningsId){
    		
    		$scope.nextBallInfo.inningsId = inningsId;
    		
    		$scope.nextBallInfo.overId = overId;
    		$scope.nextBallInfo.ballId = ballId;
    		$scope.nextBallInfo.ballUnique = ballUnique;
    		
    		$scope.nextBallInfo.bowlerId = $scope.matchBallInfo.bowlerId;
    		$scope.nextBallInfo.thisOver = thisOverValue;
    		
    		$scope.nextBallInfo.strikerId = $scope.matchBallInfo.strikerId;
			$scope.nextBallInfo.nonStrikerId = $scope.matchBallInfo.nonStrikerId;
    		
    		if(extraType != 5){
    			
    			var totalRunsScored;
    			
    			if(extraType > 2)
    				totalRunsScored = batsmanRuns+(extraRuns-1);
    			else
    				totalRunsScored = batsmanRuns+extraRuns;
    			
    			if((totalRunsScored % 2) != 0){    				
    				$scope.nextBallInfo.strikerId = $scope.matchBallInfo.nonStrikerId;
    				$scope.nextBallInfo.nonStrikerId = $scope.matchBallInfo.strikerId;
    			}
    			
    		}
    		
    		$scope.nextBallInfo.currTeamRuns = teamRuns;
        	$scope.nextBallInfo.currTeamWicket = teamWickets;
        	
        	$scope.nextBallInfo.requiredRuns = teamRequired;
        	$scope.nextBallInfo.remainingBalls = teamRemaining;
    		
    		if(teamBall == 6){
    			
    			var strikertemp = $scope.nextBallInfo.strikerId;
    			
    			$scope.nextBallInfo.strikerId = $scope.nextBallInfo.nonStrikerId;
    			$scope.nextBallInfo.nonStrikerId = strikertemp;
    			
    			$scope.nextBallInfo.thisOver = "";
    			
    			$scope.remainingPlayer();
    			$(".next-bowler-details").removeClass('hide');
    			
    		}
    		else{    		
    			$scope.insertNewBall();
    		}
    		
    	}
    	
    }
    
    $scope.newInnings = function(){
    	
    	$scope.nextBallInfo.inningsId = $scope.matchBallInfo.currentInnings+1;
    	
    	$scope.nextBallInfo.overId = 0;
    	$scope.nextBallInfo.ballId = 0;
    	$scope.nextBallInfo.ballUnique = 0.01;
    	
    	$scope.nextBallInfo.strikerId = 0;
    	$scope.nextBallInfo.nonStrikerId = 0;
    	$scope.nextBallInfo.bowlerId = 0;
    	
    	$scope.nextBallInfo.currTeamRuns = 0;
    	$scope.nextBallInfo.currTeamWicket = 0;
    	
    	if($scope.matchBallInfo.currentInnings == 1){
    		
	    	$scope.nextBallInfo.requiredRuns = $scope.matchBallInfo.currTeamRuns;
	    	$scope.nextBallInfo.remainingBalls = ($scope.matchAttributes.totalOvers*6);
	    	
    	}
    	
    	$scope.nextBallInfo.thisOver = "";
    	
    	$scope.remainingPlayer();
		$(".next-bowler-details").removeClass('hide');
    	
//    	$scope.insertNewBall();
    	
    }
    
    $scope.insertNewBall = function() {
    	
    	if($scope.nextBallInfo.strikerId == 0 || $scope.nextBallInfo.nonStrikerId == 0){
    		
    		
    		alert("Striker Id "+$scope.nextBallInfo.strikerId);
    		alert("Non Striker Id "+$scope.nextBallInfo.nonStrikerId);
    		
    		$scope.remainingPlayer();
    		$(".next-batsman-details").removeClass("hide");
    		
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
		    	$scope.nextBallInfo.matchId+","+
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
	    	
	//    	alert(insertNewBallQry+insertBallDetailsVal);
	    	
	    	db.transaction(function(tx) {
	        	
				tx.executeSql(insertNewBallQry+insertBallDetailsVal,[],function(tx,res){
					
					$scope.getBallInfo();
				
				},errorHandler);
				
	    	},errorHandler);
    		
    	}
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
    		
    		thisOver:""
    		
    };
    
//    $scope.undoLastBall = function (){
//    	
//    	db.transaction(function(tx) {
//    	
//	    	var ballUnique = $scope.matchBallInfo.ballUnique;
//			var currentInnings = $scope.matchBallInfo.currentInnings;			
//			var currentOver = $scope.matchBallInfo.currentOver;
//			var currentBall = $scope.matchBallInfo.currentBall;
//			var matchId = $scope.details.match_id;
//	    	
//	    	if(ballUnique != 0.01 && currentInnings != 1){
//	    		
//		    	var deleteBallQry = "DELETE FROM "+ballbyballTable+
//			    	" WHERE ball_unique = "+ballUnique+
//			    	" AND innings_id = "+currentInnings+
//					" AND match_id = "+matchId;
//		    	
//		    	tx.executeSql(deleteBallQry,[],function(tx,res){},errorHandler);
//		    	
//		    	
//		    	if(ballUnique == 0.01){
//		    		currentInnings = currentInnings - 1;
//		    	}
//		    	else if(ballUnique == (currentOver+0.01)){
//		    		currentOver = currentOver-1;		    		
//		    	}
//		    	
//		    	var findBallUnique = "SELECT MAX(ball_unique) FROM "+ballbyballTable+
//		    	" WHERE match_id = "+matchId+
//		    	" AND innings_id = "+currentInnings+
//		    	" AND over_id = "+currentOver;
//		    	
//		    	tx.executeSql(findBallUnique,[],function(tx,res){
//		    		
//		    		if(res.rows.item(0).)
//		    		
//		    	},errorHandler);
//		    	
//		    	
//		    	
//		    	
//		    	
//		        	
//					
//					tx.executeSql(strikerUpdateQry,[],function(tx,res){},errorHandler);
//					
//					if(nonStrikerUpdateQry!="")			
//						tx.executeSql(nonStrikerUpdateQry,[],function(tx,res){},errorHandler);
//					
//					tx.executeSql(bowlerUpdateQry,[],function(tx,res){},errorHandler);
//					tx.executeSql(fullScoreInfoQry,[],function(tx,res){},errorHandler);
//					
//		    	
//	    	
//	    	}
//	    	else{
//	    		
//	    		alert("Enter one ball before undo!!!!");
//	    		
//	    	}
//    	
//    	},errorHandler);
//    	
//    	
//    	
//    	var teamRuns,teamWickets,teamBall,teamRequired,teamRemaining;
//    	
//    	var updateBallQryFirstPart = "UPDATE "+ballbyballTable+" SET ";
//    	var updateBallQryLastPart = " WHERE ball_unique = "+$scope.matchBallInfo.ballUnique+
//	    	" AND innings_id = "+$scope.matchBallInfo.currentInnings+
//			" AND match_id = "+$scope.details.match_id;
//    	
//    	var updateBallQryValuesPart = "";
//    	
//    	if(extraType != 3 && extraType != 4){
//    		teamBall = ($scope.matchBallInfo.currentBall+1);
//    	}
//    	else{
//    		teamBall = ($scope.matchBallInfo.currentBall);
//    	}
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"ball_id = "+teamBall+", ";
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"batsman_runs = "+batsmanRuns+", ";
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_runs = "+extraRuns+", ";
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"extra_type = "+extraType+", ";
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"is_wicket = "+isWicket+", ";
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"is_updated = 1, ";
//    	
//    	teamRuns = ($scope.matchBallInfo.currTeamRuns+batsmanRuns+extraRuns); 
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_runs = "+teamRuns+", ";
//    	
//    	if(isWicket == 1){
//    		teamWickets = ($scope.matchBallInfo.currTeamWickets+1);
//    	}
//    	else{
//    		teamWickets = ($scope.matchBallInfo.currTeamWickets);
//    	}
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"curr_team_wickets = "+teamWickets+", ";
//    	
//    	
//    	
//    	if($scope.matchBallInfo.requiredRuns > 0){
//    		teamRequired = ($scope.matchBallInfo.requiredRuns-(batsmanRuns+extraRuns));
//    	}
//    	else{
//    		teamRequired = 0;
//    	}
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"required_runs = "+teamRequired+", ";
//    	
//    	if($scope.matchBallInfo.remainingBalls > 0 && extraType < 3){
//    		teamRemaining = ($scope.matchBallInfo.remainingBalls - 1);
//    	}
//    	else{
//    		teamRemaining = $scope.matchBallInfo.remainingBalls;
//    	}
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"remaining_balls = "+teamRemaining+", ";
//    	
//    	var thisOverValue = $scope.matchBallInfo.thisOverStr;
//    	
//    	if(thisOverValue == "")
//    		thisOverValue = thisOverText;
//    	else
//    		thisOverValue = thisOverValue+separater+thisOverText;
//    	
//    	updateBallQryValuesPart = updateBallQryValuesPart+"this_over = '"
//		+thisOverValue+"' ";
//    	
//    	
//    	
//    	
//    	
//    	var strikerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
//    	var strikerUpdateQryLastPart = " WHERE player_id = "+$scope.matchBallInfo.strikerId+
//    		" AND innings_id = "+$scope.matchBallInfo.currentInnings+
//    		" AND match_id = "+$scope.details.match_id;
//    	
//    	var strikerUpdateQryValuesPart = "";
//    	
//    	var strikerRuns = parseInt($scope.matchBallInfo.strikerRuns)+batsmanRuns;
//    	
//    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_1 = '"+strikerRuns+"', ";
//    	
//    	var strikerBalls = parseInt($scope.matchBallInfo.strikerBalls);
//    	
//    	if(extraType != 4)
//    		strikerBalls = strikerBalls+1;
//    		
//		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_2 = '"+strikerBalls+"', ";
//    	
//    	if(batsmanRuns == 4)
//    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_3 = '"+(parseInt($scope.matchBallInfo.striker4s)+1)+"', ";
//    	
//    	if(batsmanRuns == 6)
//    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_4 = '"+(parseInt($scope.matchBallInfo.striker6s)+1)+"', ";
//    	
//    	var strikerSR = ((strikerRuns/strikerBalls)*100).toFixed(2);
//    	
//    	strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" score_info_5 = '"+strikerSR+"', ";
//    	
//    	
//    	
//    	var outText = "";
//    	
//    	var fielderNames = "";
//    	
//    	if(isWicket != 0){
//    		
//    		if(wicketType == 1){
//    			outText = "b "+$scope.matchBallInfo.bowlerName;
//    		}
//    		else if(wicketType == 2){
//    			outText = "c "+fielderNames+" b "+$scope.matchBallInfo.bowlerName;
//    		}
//    		else if(wicketType == 3){
//    			outText = "lbw b "+$scope.matchBallInfo.bowlerName;
//    		}
//    		else if(wicketType == 4){
//    			outText = "st "+fielderNames+" b "+$scope.matchBallInfo.bowlerName;
//    		}
//    		else if(wicketType == 5){
//    			outText = "runout("+fielderNames+")";
//    		}
//    		else if(wicketType == 6){
//    			outText = "hitwicket b "+$scope.matchBallInfo.bowlerName
//    		}
//    		else if(wicketType == 7){
//    			outText = "handled the ball";
//    		}
//    		else if(wicketType == 8){
//    			outText = "hit the ball twice";
//    		}
//    		else if(wicketType == 9){
//    			outText = "obstructing the field";
//    		}
//    		
//    	}
//    	
//    	
//    	
//    	var nonStrikerUpdateQry="";
//    	
//    	if(outBatsmanId == $scope.matchBallInfo.strikerId)
//    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '"+outText+"' ";
//    	else{
//    		strikerUpdateQryValuesPart = strikerUpdateQryValuesPart+" out_text = '' ";
//    		
//    		nonStrikerUpdateQry = "UPDATE "+fullScoreTable+
//    			" SET out_text = '"+outText+
//    			"' WHERE player_id = "+$scope.matchBallInfo.nonStrikerId+
//        		" AND innings_id = "+$scope.matchBallInfo.currentInnings+
//        		" AND match_id = "+$scope.details.match_id;
//    		
//    	}
//    	
//    	
//    	
//
//    	
//    	var bowlerUpdateQryFirstPart = "UPDATE "+fullScoreTable+" SET ";
//    	var bowlerUpdateQryLastPart = " WHERE player_id = "+$scope.matchBallInfo.bowlerId+
//			" AND innings_id = "+$scope.matchBallInfo.currentInnings+
//			" AND match_id = "+$scope.details.match_id;
//    	
//    	var bowlerUpdateQryValuesPart = "";
//    	
//    	var bowlerBallBowled = parseInt($scope.matchBallInfo.bowlerBalls);
//    	if(extraType != 3 && extraType != 4){
//    		bowlerBallBowled = bowlerBallBowled+1;
//    	}
//    	
//    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_1 = '"+bowlerBallBowled+"', ";
//    	
//    	if(teamBall == 6){
//    		
//    		var thisOverSplit = thisOverValue.split(separater);
//    		
//    		if(thisOverSplit.length == 6){
//    			var thisOverRuns = 0;
//    			for(var i=0;i<thisOverSplit.length;i++){
//    				if((thisOverSplit[i].indexOf("b") > -1 && thisOverSplit[i].indexOf("nb") < 0)||(thisOverSplit[i].indexOf("b") > -1)){
//    					thisOverSplit[i] = "0"; 
//    				}
//    				thisOverRuns = thisOverRuns+parseInt(thisOverSplit[i]);
//    			}
//    			
//    			if(thisOverRuns == 0){    				
//    				bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_2 = '"+(parseInt($scope.matchBallInfo.bowlerMaidens)+1)+"', ";
//    				alert((parseInt($scope.matchBallInfo.bowlerMaidens)+1));
//    			}
//    			
//    		}
//    		
//    	}
//    	
//    	var bowlerRunsConceded = parseInt($scope.matchBallInfo.bowlerRuns)+batsmanRuns;
//    	
//    	if(extraType == 3 || extraType == 4){
//    		bowlerRunsConceded = bowlerRunsConceded+extraRuns;
//    	}
//    	
//    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_3 = '"+bowlerRunsConceded+"', ";
//    	
//    	if(isWicket == 1){
//    		if(wicketType != 5 && wicketType < 7)
//    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_4 = '"+($scope.matchBallInfo.bowlerWickets+1)+"', ";
//    		else
//    			bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_4 = '"+($scope.matchBallInfo.bowlerWickets)+"', ";
//    	}
//    	
//    	var bowlerEcon;
//    	
//    	if(bowlerBallBowled != 0)
//    		bowlerEcon = ((bowlerRunsConceded/bowlerBallBowled)*6).toFixed(2);
//    	else
//    		bowlerEcon = 0;
//    	
//    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" score_info_5 = '"+bowlerEcon+"', ";
//    	
//    	var extrasSplit = new Array();
//    	
//    	if($scope.matchBallInfo.bowlerextras != '')    	
//    		extrasSplit= $scope.matchBallInfo.bowlerextras.split(separater);
//    	else
//    		extrasSplit= ("0"+separater+"0").split(separater);
//    	
//    	if(extraType == 3){
//    		extrasSplit[0] = parseInt(extrasSplit[0])+1; 
//    	}
//    	else if(extraType == 4){
//    		extrasSplit[1] = parseInt(extrasSplit[1])+1; 
//    	}
//    	
//    	var extraText = extrasSplit[0]+separater+extrasSplit[1];
//    	
//    	bowlerUpdateQryValuesPart = bowlerUpdateQryValuesPart+" extra_count = '"+extraText+"' ";
//    	
//    	
//    	
//    	
//    	
//    	var fullScoreInfoQryFirstPart = "UPDATE "+fullScoreInfoTable+" SET ";
//    	var fullScoreInfoQryLastPart = " WHERE innings_id = "+$scope.matchBallInfo.currentInnings+
//			" AND match_id = "+$scope.details.match_id;
//    	
//    	var fullScoreInfoQryValuesPart = "";
//    	
//    	var teamExtras = new Array();
//    	
//    	if($scope.matchBallInfo.currInningsExtraStr != '')    	
//    		teamExtras = $scope.matchBallInfo.currInningsExtraStr.split(separater);
//    	else
//    		teamExtras = ("0"+separater+"0"+separater+"0"+separater+"0"+separater+"0").split(separater);
//    	
//    	if(extraType != 0){
//    		teamExtras[(extraType-1)] =  parseInt(teamExtras[(extraType-1)])+extraRuns;
//    	}
//    	
//    	var teamExtraStr = teamExtras[0]+separater+
//    		teamExtras[1]+separater+
//    		teamExtras[2]+separater+
//    		teamExtras[3]+separater+
//    		teamExtras[4];
//    	
//    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"extra_text = '"+teamExtraStr+"', ";
//    	
//    	fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_runs = "+teamRuns+", ";
//    		
//		fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_wickets = "+teamWickets+", ";
//		
//		fullScoreInfoQryValuesPart = fullScoreInfoQryValuesPart+"team_overs = '"+
//		$scope.matchBallInfo.currentOver+"."+teamBall+"' ";
//		
//		
//		
//		var updateBallQry = updateBallQryFirstPart+updateBallQryValuesPart+updateBallQryLastPart;
////    	alert(updateBallQry);
//    	console.log("Update Ball ===> "+updateBallQry);
//		
//		var strikerUpdateQry = strikerUpdateQryFirstPart+strikerUpdateQryValuesPart+strikerUpdateQryLastPart;
////    	alert(strikerUpdateQry);
//    	console.log("Striker Info Update Ball ===> "+strikerUpdateQry);
//		
//		var bowlerUpdateQry = bowlerUpdateQryFirstPart+bowlerUpdateQryValuesPart+bowlerUpdateQryLastPart;
////    	alert(bowlerUpdateQry);
//    	console.log("Bowler Info Update Ball ===> "+bowlerUpdateQry);
//		
//		var fullScoreInfoQry = fullScoreInfoQryFirstPart+fullScoreInfoQryValuesPart+fullScoreInfoQryLastPart;
////    	alert(fullScoreInfoQry);
//    	console.log("Full Score Info Update Ball ===> "+fullScoreInfoQry);
//    	
//    	
//    	db.transaction(function(tx) {
//        	
//			tx.executeSql(updateBallQry,[],function(tx,res){},errorHandler);
//			tx.executeSql(strikerUpdateQry,[],function(tx,res){},errorHandler);
//			
//			if(nonStrikerUpdateQry!="")			
//				tx.executeSql(nonStrikerUpdateQry,[],function(tx,res){},errorHandler);
//			
//			tx.executeSql(bowlerUpdateQry,[],function(tx,res){},errorHandler);
//			tx.executeSql(fullScoreInfoQry,[],function(tx,res){},errorHandler);
//			
//    	},errorHandler);
//    	
//    	    	
//    	$scope.matchBallInfo.currTeamRuns = teamRuns;
//    	
//    	$scope.nextBallInfo.matchId = $scope.details.match_id;
//    	
//    	var inningsId = 0,overId,ballId,ballUnique;
//    	
//    	if(teamBall == 6){
//    		overId = ($scope.matchBallInfo.currentOver+1);
//    		ballId = 0;
//    		ballUnique = overId + 0.01;
//    	}
//    	else{
//    		overId = $scope.matchBallInfo.currentOver;
//    		ballId = teamBall;
//    		ballUnique = $scope.matchBallInfo.ballUnique+0.01;
//    	}
//    	
//    	inningsId = $scope.matchBallInfo.currentInnings;
//    	
//    	if($scope.matchBallInfo.currentInnings == 1){
//			if($scope.matchAttributes.isLastManBatting == 1 && $scope.matchAttributes.noofPlayers == teamWickets){
//				$scope.newInnings();
//				inningsId = 0;
//			}
//			else if($scope.matchAttributes.isLastManBatting == 0 && ($scope.matchAttributes.noofPlayers-1) == teamWickets){
//				$scope.newInnings();
//				inningsId = 0;
//			}
//			else if(overId == $scope.matchAttributes.totalOvers && $scope.matchAttributes.totalOvers != 0){
//				$scope.newInnings();
//				inningsId = 0;
//			}
//			else
//				inningsId = 1;
//		}
//    	else if(teamRequired <= 0 && teamRemaining >= 0){    		
//    		alert("batting team wins");
//    	}
//    	else if(teamRequired >= 0 && teamRemaining == 0){    		
//    		alert("bowling team wins");
//    	}
//    	
//    	if($scope.matchBallInfo.currentInnings == inningsId){
//    		
//    		$scope.nextBallInfo.inningsId = inningsId;
//    		
//    		$scope.nextBallInfo.overId = overId;
//    		$scope.nextBallInfo.ballId = ballId;
//    		$scope.nextBallInfo.ballUnique = ballUnique;
//    		
//    		$scope.nextBallInfo.bowlerId = $scope.matchBallInfo.bowlerId;
//    		$scope.nextBallInfo.thisOver = thisOverValue;
//    		
//    		$scope.nextBallInfo.strikerId = $scope.matchBallInfo.strikerId;
//			$scope.nextBallInfo.nonStrikerId = $scope.matchBallInfo.nonStrikerId;
//    		
//    		if(extraType != 5){
//    			
//    			var totalRunsScored;
//    			
//    			if(extraType > 2)
//    				totalRunsScored = batsmanRuns+(extraRuns-1);
//    			else
//    				totalRunsScored = batsmanRuns+extraRuns;
//    			
//    			if((totalRunsScored % 2) != 0){    				
//    				$scope.nextBallInfo.strikerId = $scope.matchBallInfo.nonStrikerId;
//    				$scope.nextBallInfo.nonStrikerId = $scope.matchBallInfo.strikerId;
//    			}
//    			
//    		}
//    		
//    		$scope.nextBallInfo.currTeamRuns = teamRuns;
//        	$scope.nextBallInfo.currTeamWicket = teamWickets;
//        	
//        	$scope.nextBallInfo.requiredRuns = teamRequired;
//        	$scope.nextBallInfo.remainingBalls = teamRemaining;
//    		
//    		if(teamBall == 6){
//    			
//    			var strikertemp = $scope.nextBallInfo.strikerId;
//    			
//    			$scope.nextBallInfo.strikerId = $scope.nextBallInfo.nonStrikerId;
//    			$scope.nextBallInfo.nonStrikerId = strikertemp;
//    			
//    			$scope.nextBallInfo.thisOver = "";
//    			
//    			$scope.remainingPlayer();
//    			$(".next-bowler-details").removeClass('hide');
//    			
//    		}
//    		else{    		
//    			$scope.insertNewBall();
//    		}
//    		
//    	}
//    	
//    }
    
}

//var wicketTypes = {"Bowled","Caught","LBW",
//		"Stumped","Run Out","Hit Wicket",
//		"Handling the Ball","Hit Ball Twice","Obstructing the field"};

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
			
			if(matchAttrJSON["team_decision"] == "Batting"){
				angularScope.battingTeam = "1";
			}
			else{
				angularScope.battingTeam = "2";
			}
			
		}
		else{
			if(matchAttrJSON["team_decision"] == "Batting"){
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
			"(match_id, toss_won_by, toss_decision, "+
			"no_of_players, innings_type, total_overs, " +
			"is_last_man_batting, current_innings, result," +
			"innings_1_score, innings_2_score, innings_3_score, innings_4_score)"+
			" VALUES "+
			"("+angularScope.details.match_id+","+matchAttrJSON["toss_won_by_team"]+",'"+matchAttrJSON["team_decision"]+"',"+
			matchAttrJSON["tot_num_player"]+","+matchAttrJSON["inn_type"]+","+matchAttrJSON["total_overs"]+","+
			matchAttrJSON["lastman_batting"]+","+1+",''" +
			",'','','','')";
			
			tx.executeSql(insertMatchAttr,[],function(){},errorHandler);
			
			for(var inningsLoop = 1;inningsLoop < 3;inningsLoop++){
				
				var insertFullQry = "INSERT INTO "+fullScoreTable+
				"(match_id, innings_id, player_id, " +
				"match_participant_id, batting_bowling_order, score_info_1, " +
				"score_info_2, score_info_3, score_info_4, " +
				"score_info_5, is_batting, out_type, fielder_id, " +
				"bowler_id, out_text) VALUES ";
				
				var valuesQry = "";
				
				for(var teamLoop = 0; teamLoop < 2; teamLoop++){
					
					var playersLength;
					var currentTeam;
					
					var isbatting;
					
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
							
						}
						
					}
					
//					alert("playersLength "+playersLength);
					
					for(var playerLoop = 0;playerLoop < playersLength;playerLoop++){
						
						var valueStr = "";
						
						if(currentTeam == 1){
							
							valueStr = "("+angularScope.details.match_id+","+inningsLoop+","+
							angularScope.team1Squad[angularScope.team1PlayingXI[playerLoop].index].id+","+
							angularScope.details.match_participant_id1+","+
							"0,0,0,0,0,0,"+isbatting+",0,0,0,'')";
							
						}
						else{
							
							valueStr = "("+angularScope.details.match_id+","+inningsLoop+","+
							angularScope.team2Squad[angularScope.team2PlayingXI[playerLoop].index].id+","+
							angularScope.details.match_participant_id2+","+
							"0,0,0,0,0,0,"+isbatting+",0,0,0,'')";
							
						}
						
						if(valuesQry == ""){
							valuesQry = valueStr;
						}
						else{
							valuesQry = valuesQry+","+valueStr;
						}
						
					}
					
					if(teamLoop == 1 && valuesQry != ""){
						
						console.log(insertFullQry + valuesQry);
						
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

function showInfo(detailsClass){
	
	hideInfo();
	
	$('.'+detailsClass).removeClass("hide");
	
}

function hideInfo(){
	
	$('.strikerDetails,.nonStrikerDetails,.bowlerDetails').addClass("hide");
	
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
	
//	alert(parseFloat(runRate));
	
	return runRate;
	
}




