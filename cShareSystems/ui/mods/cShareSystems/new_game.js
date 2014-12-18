(function() {
	model.navToEditPlanet = function () {
		model.lastSceneUrl('coui://ui/main/game/new_game/new_game.html?returnFromLoad=true');
		model.nextSceneUrl(model.lastSceneUrl());

		// Those silly devs set it to not show tabs on the load_planet scene but shared systems are in a tab
		window.location.href = 'coui://ui/main/game/load_planet/load_planet.html?tabs=true&systems=true&planets=false&title=' + encodeURI('Select System');
		return; /* window.location.href will not stop execution. */
	}
})();