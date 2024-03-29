{
	"name" : "nano",

	"info" :  {
		"syntax" : "nano &lt;file name&gt;",
		"brief" : "Edit the content of a new or existing file",
	},

	"action" : function ( arg )
	{
		var file = null;
		var parent_dir = null;
		var newfile = false;

		if ( !arg || arg.length == 0 )
		{
			return "nano: Parameter expected<br/>\n";
		}

		arg = shell.expandPath ( arg );

		if (!( parent_dir = shell.getParentDirectory ( arg )))
		{
			return "nano: Parent directory not found<br/>\n";
		}

		if ( !( file = shell.getFile ( arg )))
		{
			newfile = true;
		}

		if ( !newfile )
		{
			if ( file['type'] == 'directory' )
			{
				arg = arg.replace ( /</g, '&lt;' );
				arg = arg.replace ( />/g, '&gt;' );
				return "nano: Cannot edit '" + arg + "': Is a directory<br/>\n";
			}
		}

		var users_php = './modules/users/users.php';
		params = 'action=getperms&resource=' +
			( newfile ? escape ( parent_dir['path'] ) : escape ( arg ));

		var http = new XMLHttpRequest();
		http.open ( "POST", users_php, true );
		http.setRequestHeader ("Content-type", "application/x-www-form-urlencoded");
		http.onreadystatechange = function ()
		{
			if ( http.readyState == 4 && http.status == 200 )
			{
				if ( http.responseText.length > 0 )
				{
					shell.perms = eval ( '(' + http.responseText + ')' );
				}
			}
		}

		http.send ( params );

		fname = arg.replace ( /</g, '&lt;' );
		fname = fname.replace ( />/g, '&gt;' );
		
		shell.fname = arg;
		shell.editorkeypressed = this.editorkeypressed;
		shell.editorpaste = this.editorpaste;
		shell.editorclick = this.editorclick;
		shell.confirmkey = this.confirmkey;
		shell.bufferSave = this.bufferSave;
		shell.firstKey = 1;  // Set when no key has been pressed yet

		shell.default_editor_status = "[<b>^X</b> Exit] [<b>^O</b> WriteOut] [<b>^F</b> Where Is]";

		if ( shell.perms )
		{
			if ( shell.perms.write == false )
			{
				shell.default_editor_status += ' [read-only]';
			}
		}

		shell.default_editor_head = "<table class=\"editor_head\" border=\"0\" width=\"100%\"><tr>" +
			"<td align=\"left\">blash nano</td><td align=\"right\">File: " + fname + "</td></tr></table>";

		shell.auto_prompt_focus = false;
		shell.auto_prompt_refresh = false;
		shell.window.removeChild ( shell.prompt );
		shell.window.removeChild ( shell.cmdOut );
		shell.window.innerHTML = '';

		var container = document.createElement ( 'div' );
		container.setAttribute ( 'class', 'editor_container' );
		container.setAttribute ( 'id', 'editor_container' );
		shell.window.appendChild ( container );
		shell.editor_container = container;

		var head = document.createElement ( 'span' );
		head.setAttribute ( 'class', 'editor_head' );
		head.setAttribute ( 'id', 'editor_head' );
		head.innerHTML = shell.default_editor_head;
		container.appendChild ( head );
		shell.editor_head = document.getElementById ( 'editor_head' );

		var editor = document.createElement ( 'textarea' );

		editor.setAttribute ( 'class', 'editor_window' );
		editor.setAttribute ( 'id', 'editor_window' );
		editor.setAttribute ( 'onkeypress', 'shell.editorkeypressed ( event )' );
		// editor.setAttribute ( 'onmousedown', 'shell.editorclick ( event )' ); /* This might be useful someday */
		editor.setAttribute ( 'onpaste', 'shell.editorpaste ( )' );
		editor.setAttribute ( 'oncut', 'shell.editorpaste( )' );

		has_content = false;

		if ( file )
		{
			if ( file.content )
			{
				if ( file.content.length > 0 )
				{
					var content = file.content.replace ( /(<br ?\/?>)/g, "\n" );
					content = content.replace ( /&lt;/g, '<' );
					content = content.replace ( /&gt;/g, '>' );
					editor.value = content;
					has_content = true;
				}
			}
		}

		if ( !has_content )
		{
			editor.value = '';
			shell.originalContent = '';
		} else {
			shell.originalContent = file.content;
		}

		container.appendChild ( editor );
		editor.focus();
		shell.file_changed = false;
		shell.editor_window = document.getElementById ( 'editor_window' );

		var status = document.createElement ( 'span' );
		status.setAttribute ( 'class', 'editor_status' );
		status.setAttribute ( 'id', 'editor_status' );
		status.innerHTML = shell.default_editor_status;

		container.appendChild ( status );
		shell.editor_status = document.getElementById ( 'editor_status' );
		shell.hitCount = 0;

		return '';
	},

	"editorkeypressed" : function ( e )
	{
			  shell.hitCount++;
		var evt = ( window.event ) ? window.event : e;
		var key = ( evt.charCode ) ? evt.charCode : evt.keyCode;

		if ( shell.firstKey == 1 && key == 13 )
		{
			evt.preventDefault();
			shell.firstKey = -1;
			return false;
		}

		if(shell.firstKey == -1)
		{
				  shell.file_changed = true;
				  if(shell.perms.write == false)
							 shell.editor_status.innerHTML += " [read-only]";
				  shell.editor_status.innerHTML += " [modified]";
				  shell.firstKey = 0;
				  shell.editor_window.value = shell.editor_window.value.replace(/(\n|\r)+$/, '');
		}

		key = String.fromCharCode ( key );

		if (( key == 'x' || key == 'X' ) && evt.ctrlKey )
		{
			evt.preventDefault();

			if(shell.originalContent != shell.editor_window.value)
					  shell.file_changed = true;

			if ( shell.file_changed && shell.hitCount > 2)
			{
				var can_write = false;

				if ( shell.perms )
				{
					if ( shell.perms.write == true )
					{
						can_write = true;
					}
				}

				if ( can_write )
				{
					shell.editor_status.innerHTML = 'Save modified buffer (ANSWERING "No" WILL DESTROY CHANGES) ? ' +
						'(Yes/No/Cancel) ';
				} else {
					shell.editor_status.innerHTML = 'You modified a read-only file. If you exit, the changes will ' +
						'be lost. Are you sure you cant to exit? (Yes/No) ';
				}

				shell.editor_status.innerHTML += '<input type="text" class="editor_status_input" id="editor_status_input" '+
						'onkeydown="shell.confirmkey ( event )"/>';

				document.getElementById ( 'editor_status_input' ).focus();
			} else {
				shell.auto_prompt_focus = true;
				shell.auto_prompt_refresh = true;
				shell.refreshPrompt ( true );
			}

			return false;
		} else if (( key == 'o' || key == 'O' ) && evt.ctrlKey ) {
			evt.preventDefault();

			if( shell.originalContent != shell.editor_window.value )
					  shell.file_changed = true;

			if ( shell.file_changed )
			{
				var can_write = false;

				if ( shell.perms )
				{
					if ( shell.perms.write == true )
					{
						can_write = true;
					}
				}

				if ( can_write )
				{
					shell.bufferSave();
					shell.file_changed = false;
					shell.editor_status.innerHTML = shell.default_editor_status;
				}
			}

			return false;
		} else if (( key == 'f' || key == 'F' ) && evt.ctrlKey ) {
			evt.preventDefault();

			shell.editor_status.innerHTML = 'Text or regex to search: ' +
				'<input type="text" class="editor_status_input" id="editor_status_input" '+
				'onkeydown="shell.confirmkey ( event, ' + "'find'" + ' )"/>';

			document.getElementById ( 'editor_status_input' ).focus();
			return false;
		}

		if( !shell.file_changed )
		{
				  if ( shell.originalContent != shell.editor_window.value )
				  {
							 if ( shell.perms )
					 			{
					 				if ( shell.perms.write == false )
					 				{
					 					shell.default_editor_status += ' [read-only]';
					 					shell.editor_status.innerHTML += ' [read-only]';
					 				}
					 			}
					 			shell.editor_status.innerHTML += ' [modified]';
					 			shell.file_changed = true;
				  }
		}
		
	},

	"confirmkey" : function ( e, arg )
	{
		var can_write = false;
		var evt = ( window.event ) ? window.event : e;
		var key = ( evt.charCode ) ? evt.charCode : evt.keyCode;

		if ( arg )
		{
			if ( arg == "find" )
			{
				var input = document.getElementById ( 'editor_status_input' );
				var idx = -1;

				if ( key == 13 )
				{
					shell.firstKey = true;

					if ( input.value.length > 0 )
					{
						var matches = shell.editor_window.value.match ( new RegExp ( input.value ));

						if ( matches )
						{
							idx = shell.editor_window.value.indexOf ( matches[0] );

						}
					}

					shell.editor_status.innerHTML = shell.default_editor_status;
					shell.editor_window.focus();

					if ( idx > -1 )
					{
						if ( shell.editor_window.setSelectionRange )
						{
							shell.editor_window.setSelectionRange ( idx, idx + input.value.length );
						}
					} else {
						shell.editor_status.innerHTML = 'No matches found';
						setTimeout ( 'shell.editor_status.innerHTML = shell.default_editor_status', 1500 );
					}

					return false;
				}
			}

			return false;
		}

		key = String.fromCharCode ( key );

		if ( shell.perms )
		{
			if ( shell.perms.write == true )
			{
				can_write = true;
			}
		}

		if ( can_write )
		{
			switch ( key )
			{
				case 'c':
				case 'C':
					evt.preventDefault();
					shell.editor_status.innerHTML = shell.default_editor_status + ' [modified]';
					shell.editor_window.focus();
					break;

				case 'y':
				case 'Y':
					shell.bufferSave();

				case 'n':
				case 'N':
					evt.preventDefault();
					shell.firstKey = true;
					shell.auto_prompt_focus = true;
					shell.auto_prompt_refresh = true;
					shell.refreshPrompt ( true );
					break;

				default :
					evt.preventDefault();
					document.getElementById ( 'editor_status_input' ).value = '';
					break;
			}
		} else {
			switch ( key )
			{
				case 'n':
				case 'N':
					evt.preventDefault();
					shell.editor_status.innerHTML = shell.default_editor_status + ' [modified]';
					shell.editor_window.focus();
					break;

				case 'y':
				case 'Y':
					evt.preventDefault();
					shell.firstKey = true;
					shell.auto_prompt_focus = true;
					shell.auto_prompt_refresh = true;
					shell.refreshPrompt ( true );
					break;

				default :
					evt.preventDefault();
					document.getElementById ( 'editor_status_input' ).value = '';
					break;
			}
		}
	},

	"bufferSave" : function ()
	{
		var users_php = './modules/users/users.php';
		params = 'action=set_content&file=' + escape ( shell.fname ) + '&content=' + escape ( document.getElementById ( 'editor_window' ).value );

		var http = new XMLHttpRequest();
		http.open ( "POST", users_php, true );
		http.setRequestHeader ("Content-type", "application/x-www-form-urlencoded");
		http.onreadystatechange = function ()
		{
			if ( http.readyState == 4 && http.status == 200 )
			{
				if ( http.responseText.length > 0 )
				{
					shell.editor_status.innerHTML = http.responseText;
					shell.refreshFiles();
					setTimeout ( 'shell.editor_status.innerHTML = shell.default_editor_status', 1500 );
				}
			}
		}

		http.send ( params );
		shell.originalContent = shell.editor_window.value;
		shell.file_changed = false;
	},

	"editorpaste" : function ()
	{
		if(shell.perms)
		{
			if(shell.perms.write == true)
			{
				if(shell.file_changed == false)
				{
					shell.file_changed = true;
					shell.editor_status.innerHTML += ' [modified]';
				}
			}
			else
				if(shell.file_changed == false)
				{
					shell.file_changed = true;
					shell.editor_status.innerHTML += ' [read-only] [modified]';
				}
		}

		if (shell.firstKey==-1)
		{
			shell.hitCount++;
			shell.firstKey=0;
		}

		return;
	},

	"editorclick": function ( e )
	{
		if (e.button == 2); /* Do something with the right button */
		return;
	}
}

