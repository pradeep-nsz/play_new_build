var googleapi = {
authorize: function(options) {
    var deferred = $.Deferred();
    
    //Build the OAuth consent page URL
    var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
                                                                         client_id: options.client_id,
                                                                         redirect_uri: options.redirect_uri,
                                                                         response_type: 'code',
                                                                         scope: options.scope
                                                                         });
    
    //Open the OAuth consent page in the InAppBrowser
    var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
    
    $(authWindow).on('loadstart', function(e) {
                     var url = e.originalEvent.url;
                     var code = /\?code=(.+)$/.exec(url);
                     var error = /\?error=(.+)$/.exec(url);

                     if (code || error)
                     {
                        //Always close the browser when match is found
                     
                        authWindow.close();
                        //alert(code);
                     }
                     
                     if (code)
                     {
                     //Exchange the authorization code for an access token
                     $.post('https://accounts.google.com/o/oauth2/token', {
                            code: code[1],
                            client_id: options.client_id,
                            client_secret: options.client_secret,
                            redirect_uri: options.redirect_uri,
                            grant_type: 'authorization_code'
                            }).done(function(data) {
                                    deferred.resolve(data);
                                    getDataProfile(data.access_token);
                                    }).fail(function(response) {
                                            deferred.reject(response.responseJSON);
                                            });
                     } else if (error) {
                     //The user denied access to the app
                     deferred.reject({
                                     error: error[1]
                                     });
                     }
                     });
    
    return deferred.promise();
}
};

function getDataProfile(accessToken)
{
    var term=null;
    //  alert("getting user data="+accessToken);
    $.ajax({
       url:'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+accessToken,
       type:'GET',
       data:term,
       dataType:'json',
       error:function(jqXHR,text_status,strError){
       },
       success:function(data)
       {
           authenticateUser(data.id, 2);
           socialID = data.id;
           type = 2;
       }
    });
}

