$(".div_spectator_content").prepend("<div id=\"ingameChartButton\" data-bind=\"visible: isSpectator, click: model.toggleGraph\"></div>");

var browserFrame;
(function() {

	var chartURL = paStatsGlobal.queryUrlBase+"ingamechart?gameIdent=" + decode(localStorage['lobbyId']);

	// pre-load the page
	// Have to wait until the browser has been initialized.
	var preloadCharts = function() {
		if(typeof inGameBrowser != 'undefined') {
			extendInGameBrowser();
			inGameBrowser.open(chartURL);
			inGameBrowser.hide();
			$("#inGameBrowser").css('left', '-100%');
			$("#inGameBrowser iframe").attr("id", "inGameBrowser_iframe");
			browserFrame = $("#inGameBrowser_iframe")[0];
		} else {
			setTimeout(preloadCharts, 1000);
		}
	};

	var extendInGameBrowser = function() {
		inGameBrowser.show = function() {
			$("#inGameBrowser").show();
		};

		inGameBrowser.hide = function() {
			$("#inGameBrowser").hide();
		};

		inGameBrowser.toggle = function() {
			var browserDiv = $("#inGameBrowser");

			if($(browserDiv).is(":visible")) {
				inGameBrowser.close();
			} else {
				$(browserDiv).css('opacity', 0);
				$(browserDiv).show();

				// Keep the focus on the main window.
				$(browserFrame.contentWindow).on('mouseup', function() {
					window.focus();
				});

				$(browserDiv).animate({
					'left': '0%',
					'opacity': 1
				}, 500);
			}
		}

		inGameBrowser.close = function() {
			var browserDiv = $("#inGameBrowser");
			$(browserDiv).css('opacity', 1);
			$(browserDiv).animate({
				'left': '-100%',
				'opacity': 0
			}, 500, function() { $(browserDiv).hide(); });
		};

		$("#openInGameBrowser").remove();
	};

	preloadCharts();

	Mousetrap.bind("ctrl+space", function() {
		if(model.isSpectator())
			model.toggleGraph();
	});
}());

model.toggleGraph = function () {
	inGameBrowser.toggle();
};