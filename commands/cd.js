{
	"name" : "cd",

	"info" :  {
		"syntax" : "cd &lt;directory&gt;",
		"brief" : "Change the current directory to the specified one",
	},

	"action" : function ( arg )
	{
		var out = '';

		if ( !arg || arg.length == 0 || arg == '~' )
		{
			shell.auto_prompt_focus = false;
			shell.auto_prompt_refresh = false;

			var users_php = './modules/users/users.php';
			params = 'action=gethome';

			var http = new XMLHttpRequest();
			http.open ( "POST", users_php, true );
			http.setRequestHeader ( "Connection", "close" );
			http.onreadystatechange = function ()
			{
				if ( http.readyState == 4 && http.status == 200 )
				{
					if ( http.responseText.length > 0 )
					{
						shell.home = http.responseText;
						shell.path = shell.home;
					} else {
						shell.user = shell.json.user;
					}

					shell.cmdOut.innerHTML = '';
					shell.auto_prompt_focus = true;
					shell.auto_prompt_refresh = true;
					shell.refreshPrompt ( false, false );
				}
			}

			http.send ( params );
		} else {
			var found = false;
			arg = shell.expandPath ( arg );

			for ( var i=0; i < shell.files.length && !found; i++ )
			{
				if ( shell.files[i].path == arg )
				{
					found = true;

					if ( shell.files[i].link_to && shell.files[i].link_to.length > 0 ) {
						return this.action ( shell.files[i].link_to );
					} else if ( shell.files[i].type != 'directory' ) {
						return "cd: not a directory: " + arg + "<br/>\n";
					}
				}
			}

			if ( !found )
			{
				return "cd: No such file or directory: " + arg + "<br/>\n";
			}

			shell.path = arg;
		}

		return out;
	},
}

