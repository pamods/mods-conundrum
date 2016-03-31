var cExodus = (function () {

	var cExodus = {};

	var urls = {};
	urls.exodus_eventSchedule = "http://exodusesports.com/api-2/posts/?type=tournament&filter[posts_per_page]=5&filter[orderby]=tournament_date";
	urls.exodus_newsItems = "http://exodusesports.com/api-2/posts/?type=news&filter[posts_per_page]=3";
	urls.pyrus_top10 = "http://pa.coffee-break.at/api/ladder?limit=10";
	urls.exodus_articles = "http://exodusesports.com/api-2/posts/?type=article&filter[posts_per_page]=2";
	urls.exodus_guides = "http://exodusesports.com/api-2/posts/?type=guides&filter[posts_per_page]=2";
	urls.exodus_isLive = "http://exodusesports.com/site-status";

	cExodus.newsItems = ko.observable(new Array());
	cExodus.eventSchedule = ko.observable(new Array());
	cExodus.top10 = ko.observable(new Array());
	cExodus.articles = ko.observable(new Array());
	cExodus.guides = ko.observable(new Array());
	cExodus.isLive = ko.observable(false);
	cExodus.isLiveResponse = ko.observable(false);
	cExodus.currentEvent = ko.observable("TOURNAMENT IN PROGRESS");

	cExodus.isNotLive = ko.computed(function() { return !cExodus.isLive(); });

	cExodus.nextEvent_date = ko.observable();
	cExodus.nextEvent_time = ko.observable();
	cExodus.nextEvent_title = ko.observable();
	cExodus.nextEvent_link = ko.observable();

	cExodus.nextEvent = ko.computed(function() {
		var eventSchedule = cExodus.eventSchedule();
		var currentTime = new Date().getTime();
		var tournamentDate, tournamentTime;
		var closestTime = Number.POSITIVE_INFINITY;
		var nextEvent;


		for(eventIndex in eventSchedule) {
			var exodusEvent = eventSchedule[eventIndex];
			if(exodusEvent.meta && exodusEvent.meta.tournament_date) {
				tournamentDate = new Date(parse_yyyymmdd(exodusEvent.meta.tournament_date)).getTime();
				tournamentTime = from_utc_time_string(exodusEvent.meta.tournament_starttime);
				tournamentDate += tournamentTime;
				if(tournamentDate >= currentTime && tournamentDate < closestTime) {
					closestTime = tournamentDate;
					nextEvent = exodusEvent;
				}
			}
		}

		if(nextEvent) {
			cExodus.nextEvent_date(new Date(parse_yyyymmdd(nextEvent.meta.tournament_date)).getTime());
			cExodus.nextEvent_time(from_utc_time_string(nextEvent.meta.tournament_starttime));
			cExodus.nextEvent_title(nextEvent.title);
			cExodus.nextEvent_link(nextEvent.link);
		}

		return nextEvent;
	});


	cExodus.getCountdownArray = function() {
		var eventDate = cExodus.nextEvent_date();
		var eventTime = cExodus.nextEvent_time();
		eventDate += eventTime;

		var countdown = eventDate - new Date().getTime();
		var countdownArray = new Array();

		var DAY = 24 * 60 * 60 * 1000;
		var HOUR = 60 * 60 * 1000;
		var MINUTE = 60 * 1000;
		var SECOND = 1000;

		countdownArray[0] = to_00_str(Math.floor(countdown / DAY));
		countdownArray[1] = to_00_str(Math.floor((countdown - countdownArray[0] * DAY) / HOUR));
		countdownArray[2] = to_00_str(Math.floor((countdown - countdownArray[1] * HOUR - countdownArray[0] * DAY) / MINUTE));
		countdownArray[3] = to_00_str(Math.floor((countdown - countdownArray[2] * MINUTE - countdownArray[1] * HOUR - countdownArray[0] * DAY) / SECOND));
		countdownArray[4] = Math.floor(countdown / DAY);

		cExodus.countDown(countdownArray);

		return countdownArray;
	};

	cExodus.countDown = ko.observableArray("", "", "", "");

	cExodus.loadNewsItems = function() {
		$.get(urls.exodus_newsItems, { time: Date.now() },  function(data) {
			console.log(data);
			cExodus.newsItems(data);
			cExodus.setNewsAlert();
		});
	};

	cExodus.loadEventSchedule = function() {
		$.get(urls.exodus_eventSchedule, { time: Date.now() }, function(data) {
			cExodus.eventSchedule(data);
			cExodus.setEventAlert();
		});
	};

	cExodus.loadTop10 = function() {
		$.get(urls.pyrus_top10, function(data) {
			cExodus.top10(data);
		});
	};

	cExodus.loadArticles = function() {
		$.get(urls.exodus_articles, { time: Date.now() }, function(data) {
			cExodus.articles(data);
			cExodus.setArticleAlert();

			$(".card-holder").on("mouseenter", function() {
				$(this).parent().find(".cExodus_guideDescription").stop().animate({
					opacity: 0
				}, 500);
			});

			$(".card-holder").on("mouseleave", function() {
				$(this).parent().find(".cExodus_guideDescription").stop().animate({
					opacity: 1
				}, 500);
			});
		});
	};

	cExodus.loadGuides = function() {
		$.get(urls.exodus_guides, { time: Date.now() }, function(data) {
			cExodus.guides(data);
			cExodus.setGuideAlert();

			$(".card-holder").on("mouseenter", function() {
				$(this).parent().find(".cExodus_guideDescription").stop().animate({
					opacity: 0
				}, 500);
			});

			$(".card-holder").on("mouseleave", function() {
				$(this).parent().find(".cExodus_guideDescription").stop().animate({
					opacity: 1
				}, 500);
			});
		});
	};

	cExodus.loadIsLive = function() {
		$.get(urls.exodus_isLive, function(data) {
			var site_status = data;

			cExodus.isLive(site_status.tournament_in_progress);

			if(site_status.tournament_name)
				cExodus.currentEvent(site_status.tournament_name);
			else
				cExodus.currentEvent("TOURNAMENT IN PROGRESS");

			cExodus.isLiveResponse(true);
		});
	};

	cExodus.getLastNews = function() {
		return localStorage.cExodus_lastNews;
	}

	cExodus.getLastEvent = function() {
		if(localStorage.cExodus_lastEvent && localStorage.cExodus_lastEvent != "undefined")
			return localStorage.cExodus_lastEvent;
		else
			return "[]";
	}

	cExodus.getLastArticle = function() {
		return localStorage.cExodus_lastArticle;
	}

	cExodus.getLastGuide = function() {
		return localStorage.cExodus_lastGuide;
	}

	cExodus.setNewsAlert = function() {
		var lastNews = cExodus.getLastNews();
		if(cExodus.newsItems()[0].ID != lastNews) {
			$("#cExodus_news_tab").addClass("cExodus_alert");
		}
	};

	cExodus.setEventAlert = function() {
		var lastEvent = cExodus.getLastEvent();
		if(!cExodus.getEventIds().equals(JSON.parse(lastEvent))) {
			$("#cExodus_events_tab").addClass("cExodus_alert");
		}
	};

	cExodus.setArticleAlert = function() {
		var lastArticle = cExodus.getLastArticle();
		if(cExodus.articles()[0].ID != lastArticle) {
			$("#cExodus_articles_tab").addClass("cExodus_alert");
		}
	};

	cExodus.setGuideAlert = function() {
		var lastGuide = cExodus.getLastGuide();
		if(cExodus.guides()[0].ID != lastGuide) {
			$("#cExodus_guides_tab").addClass("cExodus_alert");
		}
	};

	cExodus.getEventIds = function() {
		var eventIds = new Array(cExodus.eventSchedule().length);
		for(var i=0; i<eventIds.length; i++) {
			eventIds[i] = cExodus.eventSchedule()[i].ID;
		}
		return eventIds;
	};

	cExodus.isReady = function() {
		return (
			cExodus.newsItems().length>0
			&& cExodus.eventSchedule().length>0
			&& cExodus.articles().length>0
			&& cExodus.guides().length>0
			&& cExodus.isLiveResponse() == true);
	};

	cExodus.initialize = function() {
		cExodus.loadIsLive();
		cExodus.loadEventSchedule();
		cExodus.loadNewsItems();
		cExodus.loadArticles();
		cExodus.loadGuides();
	};

	//load html dynamically
	cExodus.loadHtmlTemplate = function(element, url) {
	    element.load(url, function () {
	        console.log("Loading html " + url);
	        element.children().each(function() {
				ko.applyBindings(model, this);
			});
			cExodus.applyListeners();
	    });
	};

	cExodus.applyListeners = function() { };

	cExodus.addListeners = function(listeners) {
		var applyListeners_old = cExodus.applyListeners;
		cExodus.applyListeners = function() {
			applyListeners_old();
			listeners();
		};
	};

	return cExodus;
})();

(function() {
	$("body").append("<div id='tournament-count-down'></div>");
	cExodus.loadHtmlTemplate($("#tournament-count-down"), "coui://ui/mods/cExodus/tabs/countdown.html");

	$("body").append("<div id='cExodus'></div>");
	cExodus.loadHtmlTemplate($("#cExodus"), "coui://ui/mods/cExodus/tabs/cexodus_html.html");

	cExodus.initialize();
})();