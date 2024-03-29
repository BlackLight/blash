{
	"name" : "users",

	"info" :  {
		"syntax" : "users",
		"brief" : "Show the users on the system"
	},

	"action" : function ( arg )
	{
		var users_php = './modules/users/users.php';
		params = 'action=list';
		shell.auto_prompt_refresh = false;

		var http = new XMLHttpRequest();
		http.open ( "POST", users_php, true );
		http.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		http.onreadystatechange = function ()
		{
			if ( http.readyState == 4 && http.status == 200 )
			{
				shell.cmdOut.innerHTML = http.responseText;
				shell.auto_prompt_refresh = true;
				shell.refreshPrompt ( false, false );
			}
		}

		http.send ( params );
		shell.cmdOut.innerHTML = '';
	}
}

