/*eslint-env applescript*/
/*eslint eqeqeq:0, quotes:0, space-infix-ops:0, curly:0*/
"use strict";

var delegate = {}; // our delegate to receive events from the osx app

var digg = { postinject: ["styler", "add_feed"], url: "http://digg.com/reader"};
var diggHacked = { postinject: ["styler"], url: "file://" + $.app.resourcePath + "/digg.com.webarchive"};
var diggTab = new $.WebView(digg);

function getAddFeedLink(url) {
	if (!~url.indexOf("rss:") || !~url.indexOf("feed:")) { // this is a rss feed from safari or osx
		//WTF: http://en.wikipedia.org/wiki/Feed_URI_scheme
		var feed = url.replace(/^(rss|feed):\/*/, ''); // strip off bogus schemes
		feed = feed.replace(/^(rss|feed):\/*/, ''); // do it again Sam....sometimes its added twice by Safari or OSX?
		feed = encodeURIComponent(feed);

		// redirect to digg's addFeed route, but doing so reloads diggreader.js
		return "http://digg.com/reader/search/" + feed;
	}
	return false;
}

/*
function addFeedViaJS(feedUrl) {
	//readerTab.evalJS("inputFeed("+feed+", '\n');");
	//diggTab.evalJS("location.href = '"+addFeedToDigg+"';");
	//diggTab.evalJS("history.pushState({}, 'Search for feeds to add', '"+addFeedToDigg+"');");
	// _, require, requirejs, and Backbone.Router.navigate are all present ...
	// bootstrap is used too
	// Backbone.Router.prototype.navigate("search/:feed", {trigger: true});
	// 			`app.navigate("search/{feedURL}", {trigger: true});` gotta get a ref to the app object
	// download a webarchive and remove the IIFE closure guards. then its all global.
	//  or, save a ref to `arguments` of the module invocation. that should get you to app
	// or: http://benalman.com/news/2010/11/immediately-invoked-function-expression/#highlighter_105228
	// 		assign the IIFE to a global var, so you can pick at it!

	//diggTab.evalJS("$('#tooltip-subscription-add-form')[0].submit();");

	//e.pubsub.fire("discovery:load_search", {feed_url: feed}),

	//diggTab.evalJS("$('#tooltip-subscription-add-form-input')[0].value = '"+feed+"';");
	//Backbone.Events.trigger("reader", "discovery:load_search")

	// Backbone.Events.trigger("discovery:load_search", {feed_url: "http://blog.github.io"})
}
*/

// handles cmd-line and LaunchServices openURL()s
delegate.launchURL = function(url) {
	var addURL = getAddFeedLink(url);
	if (addURL) {
		diggTab.loadURL(addURL);
		$.browser.tabSelected = diggTab;
		$.browser.unhideApp();
	} else {
		$.browser.tabSelected = new $.WebView({url: url});
	}
};

// handles in-webview link clicks and non-HTML5 link DND's
/*
delegate.decideNavigationForURL = function(url) {
	var addURL = getAddFeedLink(url);
	if (addURL) {
		diggTab.loadURL(addURL);
		$.browser.tabSelected = diggTab;
		$.browser.unhideApp();
		return true; //tell webkit to do nothing
	} else {
		return false; // handle link with default behavior
	}
};
*/

delegate.AppFinishedLaunching = function() {
	$.app.registerURLScheme('feed');
	$.app.registerURLScheme('rss');

	$.browser.addShortcut("Digg Reader", digg);
	$.browser.addShortcut("Digg Reader + `var digg`", diggHacked);

	if ($.launchedWithURL != '') { // app was launched with a feed url
		this.launchURL($.launchedWithURL);
		$.launchedWithURL = '';
	} else {
		$.browser.tabSelected = diggTab;
	}
};
delegate; //return delegate to app
