(function() {

	model.showExodusVideos = ko.pureComputed(function () {
    	return model.communityTabGroup() == 'exodusvideos';
    });
	model.toggleExodusVideosTab = function(){
		if(model.showExodusVideos()){
			model.communityTabGroup(null);
		}
		else{
			model.communityTabGroup('exodusvideos');
		}
	}
	model.communityTabGroup('exodusvideos');

	$('.tab_content').prepend('<div class="full_update" data-bind="visible: showExodusVideos"><div class="section_header">eXodus Videos</div><div id="exodusvideo"><div class="ytv-wrapper" id="cExodus_ytv-wrapper"><div class="null-msg"><loc>Video list could not be retrieved.</loc></div></div></div></div>'); 
	$('.tab_controls').prepend('<div class="community_tab btn_std_ix" data-placement="top" data-bind="click: toggleExodusVideosTab, click_sound: \'default\', rollover_sound: \'default\', css: { \'active\': $root.showExodusVideos() }, tooltip: \'eXodus Videos\'"><img src="coui://ui/mods/cExodus/img/logo_small.png" width="32"/></div>')

	// Load videos
    $("#cExodus_ytv-wrapper").ytv({
		user: 'paexodusesports',
		playlist: 'PLgHN3Bih2vx6a4XJxcn2eS4JoJvioEdPo',
        controls: false,
        annotations: false
    });


})();