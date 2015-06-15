(function() {
	//$('#sidebar-tabs').find(".active").removeClass("active");
	//$(".tab-pane.active").removeClass("active");
	//$('#sidebar-tabs').append('<li class="active"><a href="#cExodus_videofeed" data-toggle="pill" data-bind="click_sound: \'default\', rollover_sound: \'default\'">eXodus</a></li>');
	//$('.tab-content').append("<div id='cExodus_videofeed' class='tab-pane active'><div id='cExodus_ytv-wrapper'></div></div>");


	var ubertab = $('#section_videos .sub_section_tabs ul').find(".active");
	//$(ubertab).find("a").text("Vids");
	$(ubertab).removeClass("active");
	$(".tab-pane.active").removeClass("active");
	$('#section_videos .sub_section_tabs ul').append('<li class="active"><a href="#cExodus_videofeed" data-toggle="pill" data-bind="click_sound: \'default\', rollover_sound: \'default\'" style="overflow: visible; max-height: 40px; padding-top: 4px;"><img src="coui://ui/mods/cExodus/img/logo_small.png" width="32"/></a></li>');
	$('.tab-content').append("<div id='cExodus_videofeed' class='tab-pane active'><div id='cExodus_ytv-wrapper'></div></div>");

	// Load videos
    $("#cExodus_ytv-wrapper").ytv({
		user: 'paexodusesports',
		playlist: 'PLgHN3Bih2vx6a4XJxcn2eS4JoJvioEdPo',
        controls: false,
        annotations: false
    });
	/*
    // YTV never seems to fire it's videoReady event, so this detects the creation of the video list and performs a resize
	$('#cExodus_videofeed').on('DOMNodeInserted', function (e) {
		if ($(e.target).is('.cExodus_ytv-relative')) {
			$("#cExodus_videofeed .cExodus_ytv-list").height($(window).height() - 68);
			$("#cExodus_videofeed a").attr('data-bind', "click_sound: 'default', rollover_sound: 'default'");
		}
    });
	*/

})();