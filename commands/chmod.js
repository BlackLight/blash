{
	"name" : "chmod",

	"info" :  {
		"syntax" : "chmod &lt;perms&gt; &lt;file|directory&gt;",
		"brief" : "Change the access permissions to a file or directory for one or more users or groups, example: \"chmod user1,user2,@group1,@group2+r /path\", \"chmod @all+rw /path\""
	},

	"action" : function ( arg )
	{
		var out = '';

		if ( !arg.match ( /^\s*([^+|-]*)(\+|\-)((r|w)+)\s+(.+)\s*$/ ))
		{
			return "Usage: " + this.info.syntax + "<br/>\n";
		}

		shell.auto_prompt_refresh = false;

		var userlist = RegExp.$1;
		var resource = RegExp.$5;
		var perm_string = RegExp.$3;
		var perms = 0;

		// Unset R/W perms: 011. Unset R perms: 010. Unset W perms: 001
		// Set R/W perms: 111. Set R perms: 110. Set W perms: 101
		perms |= (( RegExp.$2 == '+' ) ? 4 : 0 );
		perms |= (( perm_string.match ( 'r' )) ? 2 : 0 );
		perms |= (( perm_string.match ( 'w' )) ? 1 : 0 );
		resource = shell.expandPath ( resource );

		var users_php = './modules/users/users.php';
		params = 'action=chmod&resource=' + escape ( resource ) + '&perms=' + escape ( perms.toString() );

		if ( userlist )
		{
			params += '&userlist=' + escape ( userlist );
		}

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
		return out;
	}
}

