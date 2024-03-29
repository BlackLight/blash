{
	"name" : "su",

	"info" : {
		"syntax" : "su [username]",
		"brief" : "Change user ID or become superuser",
	},

	"action" : function ( arg )
	{
		var out = '';

		if ( !shell.has_users )
		{
			return "Users module not enabled<br/>\n";
		}

		if ( !arg || arg.length == 0 )
		{
			arg = 'root';
		}

		if ( shell.__first_cmd )
		{
			shell.cmdOut.innerHTML = '<br/>Password: <input type="password" ' +
				'name="password" class="password" ' +
				'onkeyup="shell.getPassword ( event )">' +
				'<br/>';

			shell.__first_cmd = false;
		} else {
			shell.cmdOut.innerHTML = 'Password: <input type="password" ' +
				'name="password" class="password" ' +
				'onkeyup="shell.getPassword ( event )">' +
				'<br/>';
		}

		shell.getPassword = this.getPassword;
		shell.newuser = arg;

		shell.auto_prompt_focus = false;
		shell.auto_prompt_refresh = false;

		this.password = document.getElementsByName ( "password" )[0];
		this.password.focus();

		return out;
	},

	"getPassword" : function ( e )
	{
		var evt = ( window.event ) ? window.event : e;
		var key = ( evt.charCode ) ? evt.charCode : evt.keyCode;
		var password = document.getElementsByName ( "password" )[0];

		if ( key == 13 && password.value.length > 0 )
		{
			var users_php = './modules/users/users.php';
			params = 'action=login&user=' + escape ( shell.newuser ) + '&pass=' + md5 ( password.value );

			var http = new XMLHttpRequest();
			http.open ( "POST", users_php, true );
			http.setRequestHeader ( "Content-type", "application/x-www-form-urlencoded" );

			http.onreadystatechange = function ()
			{
				if ( http.readyState == 4 && http.status == 200 )
				{
					if ( http.responseText.match ( /^Successfully logged in as '(.+?)'/i ))
					{
						var user = RegExp.$1;
						shell.user = user;
						shell.refreshFiles();

						var xml2 = new XMLHttpRequest();
						xml2.open ( "POST", users_php, true );
						xml2.setRequestHeader ( "Content-type", "application/x-www-form-urlencoded" );
						params = 'action=gethome';

						xml2.onreadystatechange = function ()
						{
							if ( xml2.readyState == 4 && xml2.status == 200 )
							{
								if ( xml2.responseText.length > 0 )
								{
									shell.home = xml2.responseText;
									shell.path = shell.home;
								} else {
									shell.user = shell.json.user;
								}

                shell.files_json = shell.has_users ?
									 './modules/users/files.php' :
									 './system/files.json';

								var http3 = new XMLHttpRequest();
								http3.open ( "GET", shell.files_json, true );

								http3.onreadystatechange = function ()
								{
									if ( http3.readyState == 4 && http3.status == 200 )
									{
										shell.files = eval ( '(' + http3.responseText + ')' );
										blashrcIndex = -1; // Index of .blashrc file
										stylercIndex = -1; // Index of .stylerc file

										for ( var i in shell.files )
										{
											if ( shell.files[i].path.match ( new RegExp ( '^' + shell.home + '/.blashrc$' )))
											{
												blashrcIndex = i;
											}

											if ( shell.files[i].path.match ( new RegExp ( '^' + shell.home + '/.stylerc$' )))
											{
												stylercIndex = i;
											}

											if ( blashrcIndex >= 0 && stylercIndex >= 0 )
											{
												break;
											}
										}

										if ( blashrcIndex > 0 )
										{
											var blashrc = shell.files[blashrcIndex].content.replace ( /<br\/?>/g, ' ' );
											blashrc = eval ( '(' + blashrc + ')' );

											if ( !blashrc )
											{
												return false;
											}

											for ( var i in blashrc )
											{
												shell.json[i] = blashrc[i];
											}

											if ( blashrc['banner'] )
											{
												if ( document.getElementById ( 'banner' ))
												{
													document.getElementById ( 'banner' ).innerHTML = blashrc['banner'] + '<br/><br/>';
												}
											}

											if ( blashrc['promptText'] )
											{
												if ( document.getElementById ( 'promptText' ))
												{
													document.getElementById ( 'promptText' ).innerHTML = shell.unescapePrompt ( blashrc['promptText'], shell.json.promptSequences );
												}
											}
										}

										if ( stylercIndex > 0 )
										{
											var cur_style = document.getElementsByTagName ( 'link' );

											for ( var i in cur_style )
											{
												if ( cur_style[i].getAttribute )
												{
													if ( cur_style[i].getAttribute ( 'rel' ) && cur_style[i].getAttribute ( 'href' ))
													{
														if ( cur_style[i].getAttribute ( 'rel' ) == 'stylesheet'
																&& cur_style[i].getAttribute ( 'href' ).match ( /blash\.css$/ ))
														{
															var parent = cur_style[i].parentNode;
															cur_style[i].parentNode.removeChild ( cur_style[i] );

															var stylerc = document.createElement ( 'style', { type: 'text/css' });
															stylerc.innerHTML = shell.files[stylercIndex].content.replace ( /<br\/?>/g, ' ' );
															parent.appendChild ( stylerc );
														}
													}
												}
											}
										}
									}
								}

								http3.send ( null );
							}
						}

						xml2.send ( params );
					}

					shell.cmdOut.innerHTML = http.responseText;
					shell.auto_prompt_focus = true;
					shell.auto_prompt_refresh = true;
					shell.refreshPrompt ( false, false );
				}
			}

			http.send ( params );
			shell.cmdOut.innerHTML = '';
		}
	},
}

