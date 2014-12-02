(function() {

	cExodus.addListeners(function() {
		$("#cExodus_news_tab").on("click", function() {
			localStorage.cExodus_lastNews = cExodus.newsItems()[0].ID;
			$(this).removeClass("cExodus_alert");
		});

		$("#cExodus_events_tab").on("click", function() {
			localStorage.cExodus_lastEvent = JSON.stringify(cExodus.getEventIds());
			$(this).removeClass("cExodus_alert");
		});

		$("#cExodus_guides_tab").on("click", function() {
			localStorage.cExodus_lastGuide = cExodus.guides()[0].ID;
			$(this).removeClass("cExodus_alert");
		});

		$(".tab-container-box").on("click", function() {
			if($(this).find(".active-tab").length > 0) {
				$(".tab-container-box .active-tab").removeClass("active-tab");
				$(".active-box").removeClass("active-box");
				return;
			}
			var id = $(this).attr('id');
			$(".tab-container-box .active-tab").removeClass("active-tab");
			$(this).find(".tab").addClass("active-tab");
			$(".active-box").removeClass("active-box");
			$(".container-box#" + id).addClass("active-box");
		});

		$("#cExodus").on("DOMSubtreeModified", function() {
			$("#cExodus").find("a").unbind("click");
			$("#cExodus").find("a").on("click", function(e) {
				var linkTarget = e.delegateTarget.href;
				inGameBrowserEngineClient.call("addSession", { "sessionTitle": "eXodus eSports", "sessionUrl": linkTarget });
				return false;
			});
		});

	});


	// Start the countdown
	cExodus.getCountdownArray();
	var countdown = setInterval(function() {
		cExodus.getCountdownArray();
	}, 500);
})();