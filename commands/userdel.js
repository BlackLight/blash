{
	"name" : "userdel",

	"info" : {
		"syntax" : "userdel &lt;username&gt;",
		"brief" : "Remove a username from the system",
	},

	"action" : function ( arg )
	{
		if ( !arg || arg.length == 0 )
		{
			return "Usage: " + this.info.syntax + "<br/>\n";
		}

		shell.auto_prompt_refresh = false;

		var users_php = './modules/users/users.php';
		params = 'action=del&user=' + escape ( arg );

		var http = new XMLHttpRequest();
		http.open ( "POST", users_php, true );
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
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
	}
}

