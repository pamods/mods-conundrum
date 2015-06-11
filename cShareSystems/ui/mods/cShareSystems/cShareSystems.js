// System Sharing
// By Captain Conundrum
// Share your favorite systems with other users.

// Add a div for error messages.
$("body").append("<div id=\"error\"><div class=\"div_alert\"><div class=\"msg_error\" id=\"errorText\"></div></div></div>");

// Initialize the variable that will hold the matchmaking systems
var exports = {};

var cShareSystems = (function () {

	var cShareSystems = {};


	/*
	 * MOD SUPPORT
	 * There is a bug that is keeping me from getting the preferred server out of local storage.
	 */

    model.cShareSystems_busy = ko.observable( false );
    
	cShareSystems.addServer = function(server, noOverride) {

		var serverOptions = cShareSystems.serverOptions();

		// Override an existing server
		for(var i=0; i<serverOptions.length; i++) {
			if(serverOptions[i].name == server.name) {
				if(!noOverride) {
					serverOptions[i] = server;
					cShareSystems.serverOptions(serverOptions);
				}
				return;
			}
		}

		cShareSystems.serverOptions.push(server);
	};

	cShareSystems.removeServer = function(name) {
		cShareSystems.serverOptions.remove(function(item) {
			return item.name == name;
		});
	};

	cShareSystems.getServer = function() {
		var server = decode(localStorage.getItem('cShareSystems_server'));
		if(server)
			return server;
		else {
			cShareSystems.serverOptions()[0];
			return cShareSystems.serverOptions()[0];
		}
	};

	cShareSystems.setServer = function(newServer) {
		if(newServer)
			localStorage.setItem('cShareSystems_server', encode(newServer));
		else
			localStorage.setItem('cShareSystems_server', encode(cShareSystems.getServer()));
	};


	/*
	 * INITIALIZE OBJECT ATTRIBUTES
	 */

	cShareSystems.modName = ko.observable("SHARED SYSTEMS");

	cShareSystems.serverListUrl = "https://raw.githubusercontent.com/pamods/mods-conundrum/master/cShareSystems_serverList/serverlist.json";

	cShareSystems.serverOptions = ko.observableArray([
		{
			"name"		: "Default Server",
			"save_url"	: "http://1-dot-winged-will-482.appspot.com/save",
			"search_url"	: "http://1-dot-winged-will-482.appspot.com/search"
		}
	]);

	cShareSystems.server = ko.observable(cShareSystems.getServer());
	cShareSystems.server.subscribe(function(newServer) {
		cShareSystems.setServer(newServer);
// 		if(!cShareSystems.currentPage()) {
			cShareSystems.searchSystems({}, 0, true);
// 		}
	});

	cShareSystems.systems = ko.observableArray([]);

	cShareSystems.currentPage = ko.observable(false);

	// Defaults
	// Currently no way for the UI to change sort_direction or limit.
	// Servers are still required to recognize those parameters ni case I ever bind them to a ui element.
	cShareSystems.filterOptions = ko.observable({
		"name"			: "",
		"creator"		: "",
		"minPlanets"	: 1,
		"maxPlanets"	: 16,
		"sort_field"	: "system_id",
		"sort_direction": "DESC",
		"limit"			: 16
	});

	// Only show the servers that can be saved to.
	cShareSystems.saveServerOptions = ko.computed(function() {
		return cShareSystems.serverOptions().filter(function(item) { return (item.save_url); });
	});

	cShareSystems.showServerOptions = ko.computed(function() {
		return (cShareSystems.serverOptions().length > 1);
	});

	cShareSystems.showSaveServerOptions = ko.computed(function() {
		return (cShareSystems.saveServerOptions().length > 1);
	});

	cShareSystems.hasServers = ko.computed(function() {
		return (cShareSystems.serverOptions().length == 0);
	});

	cShareSystems.hasSaveServers = ko.computed(function() {
			return (cShareSystems.saveServerOptions().length == 0);
	});


	/*
	 * SERVER LIST
	 */

	 cShareSystems.getServerList = function() {
		 $.getJSON(cShareSystems.serverListUrl, function(data) {
			if(!data || !data.servers)
				return;

			for(var i=0; i<data.servers.length; i++) {
				cShareSystems.addServer(data.servers[i], true);
			}
		 });
	 };


	/*
	 * SERVER API CALLS
	 */

	// It's easy!
	cShareSystems.saveSystem = function(system) {
		system = JSON.stringify(system);

		// Display the loading animation.
        model.cShareSystems_busy( true );

		$.post(cShareSystems.server().save_url, { system: system }, function(data) {
			if(data != "true")
				cShareSystems.showErrorDialog("Save failed. So sad.", true);
			else
				cShareSystems.showErrorDialog("Saved to " + cShareSystems.server().name + ". Cool!", false);

		}).fail(function(jqXHR, textStatus, errorThrown) {

			// Oh noes.
			cShareSystems.lastError = {};
			cShareSystems.lastError.jqXHR = jqXHR;
			cShareSystems.lastError.textStatus = textStatus;
			cShareSystems.lastError.errorThrown = errorThrown;

			cShareSystems.showErrorDialog("Error saving to server.<br/>" + cShareSystems.lastError.errorThrown, true);
		}).always( function()
		{
			model.cShareSystems_busy( false );
        });
	};

	// A little less easy
	cShareSystems.searchSystems = function(page, start, forceUpdate) {
		var currentSystems = cShareSystems.systems();
		cShareSystems.systems(new Array());

		// Store the current time.
		// This will allow us to ignore and responses that are not from the current request.
		// We need this to allow the user to quickly click through pages without waiting for them to load.
		var request_time = Date.now();

		$.extend(page, { "start": start, "request_time": request_time });
		$.extend(page, cShareSystems.filterOptions());

		// Copy these objects so they can be modified and then compared.
		var newRequest = $.extend({}, page);
		var lastRequest = $.extend({}, cShareSystems.currentPage());
		delete newRequest.request_time;
		delete lastRequest.request_time;
		delete lastRequest.total;
		newRequest = JSON.stringify(newRequest);
		lastRequest = JSON.stringify(lastRequest);

/*
		console.log(cShareSystems.server().search_url);
		console.log(JSON.stringify(page));
*/

		// Only send a request if there will be an update
		if(forceUpdate || newRequest != lastRequest) {
			// Store the current page so that we can easily request next and previous pages later on.
			cShareSystems.currentPage(page);

			// Display the loading animation.
            model.cShareSystems_busy( true );

			$.get(cShareSystems.server().search_url, cShareSystems.currentPage() , function(data) {
				// Ignore the response if it is for a previous request.
				if(data.request_time == cShareSystems.currentPage().request_time) {
					if(typeof data == "string") {
						var message = (typeof data == "string");
						cShareSystems.lastError.errorThrown = message;
						showErrorDialog(message, true);
					} else {
						// Everything is great!
						delete cShareSystems.lastError;
						// Need this to know if there is a next page
						page = cShareSystems.currentPage();
						$.extend(page, { "total": data.total });
						cShareSystems.currentPage(page);
						// Show the page
						cShareSystems.systems(data.systems);
					}
				}

			}, "json")
				.fail(function(jqXHR, textStatus, errorThrown) {

					// Oh noes.
					cShareSystems.lastError = {};
					cShareSystems.lastError.jqXHR = jqXHR;
					cShareSystems.lastError.textStatus = textStatus;
					cShareSystems.lastError.errorThrown = errorThrown;

					cShareSystems.showErrorDialog("Error retrieving page from server.<br/>" + cShareSystems.lastError.errorThrown, true);
				}).always( function()
        		{
        			model.cShareSystems_busy( false );
                });
		} else {
			cShareSystems.systems(currentSystems);
		}
	};

	/*
	 * PAGINATION
	 */

	cShareSystems.hasPreviousPage = ko.computed(function () {
		var page = cShareSystems.currentPage();

		// If the current page starts at an index higher than 0, there must be something before it.
		if(!page.start)
			return false;
		if(page.start > 0)
			return true;
		else
			return false;
	});

	cShareSystems.hasNextPage = ko.computed(function () {
		var page = cShareSystems.currentPage();

		// Make sure the next page won't just be empty.
		if(!page || !page.total)
			return false;
		if(page.start + page.limit < page.total)
			return true;
		else
			return false;
	});

	cShareSystems.showPreviousPage = function () {
		if(cShareSystems.hasPreviousPage()) {
			// Change the start index and then search again.
			var prevPage = cShareSystems.currentPage();
			var newStart = prevPage.start - prevPage.limit;
			prevPage.start = newStart >= 0 ? newStart : 0;
			delete prevPage.total;
			delete prevPage.request_time;
			cShareSystems.searchSystems(prevPage, prevPage.start, true);
		}
	};

	cShareSystems.showNextPage = function () {
		if(cShareSystems.hasNextPage()) {
			// Change the start index and then search again.
			var nextPage = cShareSystems.currentPage();
			nextPage.start += nextPage.limit;
			delete nextPage.total;
			delete nextPage.request_time;
			cShareSystems.searchSystems(nextPage, nextPage.start, true);
		}
	};


	/*
	 * UI FUNCTIONS
	 */

	cShareSystems.showErrorDialog = function(message, error) {
		$("#errorText").html(message);

		if(!error) {
			$("#errorText").addClass("not-error");
			$("#errorText").removeClass("msg_error");
		}

		$("#error").dialog({
			dialogClass: "signin_notification",
			draggable: false,
			resizable: false,
			height: 200,
			width: 600,
			modal: true,
			buttons: {
				"OK": function () {
					$(this).dialog("close");
					$("#errorText").removeClass("not-error");
					$("#errorText").addClass("msg_error");
					model.mode(1);
				}
			}
		});
	};

	return cShareSystems;
})();

(function() {
	cShareSystems.getServerList();
})();