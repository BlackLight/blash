/**
 * Sample configuration and contents
 */

{
	"banner" : "blash version 0.1<br/>" +
    "by Fabio \"BlackLight\" Manganiello &lt;info@fabiomanganiello.com&gt;>" +
		"<br/>Copyright (C) 2010, 2022" +
		"<br/>Licence GPLv3+: GNU GPL version 3 or later " +
		"&lt;<a class=\"bannerLink\" href=\"http://gnu.org/licences/gpl.html\" target=\"_new\">" +
		"http://gnu.org/licences/gpl.html</a>&gt;<br/>" +
		"Source code available at <a class=\"bannerLink\" target=\"_new\" " +
		"href=\"https://git.platypush.tech/blacklight/blash\">" +
		"https://git.platypush.tech/blacklight/blash</a><br/><br/>" +
		"This is free software; you are free to change and " +
		"redistribuite it.<br/>There is NO WARRANTY, to the " +
		"extent permitted by law.<br/>" +
		"Type '<span class=\"brief\">man blash</span>' for help on usage and available commands<br/><br/>",

	"user" : "guest",
	"machine" : "localhost",
	"shellName" : "blash",
	"basepath" : "/",
	"promptText" : "[#{800}%n#{888}@#{800}%m#{888} %W] $ ",
	"promptSequences" : [
		{
			"sequence" : "%n",
			"default_text" : "guest",
			"text" : function ()  {
				return shell.user;
			}
		},
		{
			"sequence" : "%m",
			"default_text" : "localhost",
			"text" : function ()  {
				return shell.json.machine;
			}
		},
		{
			"sequence" : "%W",
			"default_text" : "/",
			"text" : function ()  {
				return shell.path;
			}
		}
	],

	"modules" : [
		{
			"name" : "users",
			"enabled" : true
		}
	],

	"commands" : [
		"cat",
		"cd",
		"cp",
		"chmod",
		"clear",
		"echo",
		"eval",
		"find",
		"grep",
		"logout",
		"ln",
		"ls",
		"man",
		"mkdir",
		"mv",
		"nano",
		"passwd",
		"pwd",
		"rm",
		"rmdir",
		"su",
		"touch",
		"useradd",
		"userdel",
		"users",
		"wget",
		"whoami"
	]
}

