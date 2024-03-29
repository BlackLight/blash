{
	"name" : "whoami",

	"info" : {
		"syntax" : "whoami",
		"brief" : "Print effective userid",
	},

	"action" : function ( arg )
	{
		var out = '';

		if ( !shell.has_users )
		{
			return "guest<br/>\n";
		}

		if ( arg )
		{
			return "whoami: extra operand `" + arg + "'<br/>\n";
		}

		if ( shell.user == shell.json.user )
		{
			return shell.json.user + "<br/>\n";
		} else {
			shell.auto_prompt_refresh = false;

      var users_php = './modules/users/users.php';
			params = 'action=getuser';

			var http = new XMLHttpRequest();
			http.open ( "POST", users_php, true );
			http.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );

			http.onreadystatechange = function ()
			{
				if ( http.readyState == 4 && http.status == 200 )
				{
					if ( http.responseText.length > 0 )
					{
						shell.cmdOut.innerHTML = http.responseText + "\n";
					} else {
						shell.cmdOut.innerHTML = shell.json.user + "<br/>\n";
					}

					shell.auto_prompt_refresh = true;
					shell.refreshPrompt ( false, false );
				}
			}

			http.send ( params );
			shell.cmdOut.innerHTML = '';
			return out;
		}
	},
}

