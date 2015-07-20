var soapMsgStart = '<?xml version="1.0" encoding="utf-8"?> \
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
xmlns:xsd="http://www.w3.org/2001/XMLSchema" \
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> \
<soap:Body> \ ';

var soapMsgEnd = '</soap:Body> \
</soap:Envelope>';


	              
var webserviceURL = 'http://dev.playinga.com/playingaAPI/webservices.php?WSDL';
var serverURL = 'http://dev.playinga.com/playingaAPI/webservices.php';

//var webserviceURL = 'http://192.168.1.16:8888/playingaAPI_new/webservices.php?WSDL';
//var serverURL = 'http://192.168.1.16:8888/playingaAPI_new/webservices.php';

var userTableName = "users_details";

var matchesTableName = "matches";

var matchParticipants = "matches_participants";

var cricketBallTable = "ball_by_ball_details";

var cricketWicketTable = "wicket_details";

var cricketFullBatting = "fullcard_batting";
	
var cricketFullBowling = "fullcard_bowling";

var wicketMaster = "wickets_master";

var matchSquadTable = "match_squad";

var fullScoreTable = "full_scorecard";

var fullScoreInfoTable = "full_scorecard_info";

var fullScoreWicketTable = "full_scorecard_wickets";

var matchAttributes = "match_attributes";

var ballbyballTable = "ball_by_ball_updates";

var wicketKeeperTable = "wicket_keeper_info";

var separater = "##";

var playerImagepath;



function errorHandler(transaction, error)
{
	alert("Error Handler");
    alert("Error: " + error.message + " code: " + error.code);
}

function errorHandlerNew(transaction, error)
{
	alert("Error Handler NEW");
    alert("Error: " + error.message + " code: " + error.code);
}


function successCallBack()
{
    //alert("DEBUGGING: success");
}

function nullHandler(){
	
	//alert("Null Handler");

};

function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if(results == null)
    return "";
    else
    return results[1];
}

function calculateNextBall(matchId){
	
	var db = window.sqlitePlugin.openDatabase({name: "playingaDB"});
    
    db.transaction(function(tx) {
    	
    	var selectQry = "SELECT * FROM "+ballbyballTable+" WHERE match_id="+matchId+" AND is_updated="+1+" ORDER BY id DESC ";
    	
    	var checkValueQry = "SELECT * FROM "+ballbyballTable+" WHERE match_id="+matchId+" AND is_updated="+0;
    	
        tx.executeSql(checkValueQry, [], function(tx, res) {
        	
        	alert(res.rows.length);
        	
        	if(res.rows.length == 0){
        			
        	}
              
        }, errorHandler);
        
     }, errorHandler);
	
}

