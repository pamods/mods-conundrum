// Share button
$(".sys_editor_control_group.saveclose").prepend("<div id=\"cSystemSharing_shareDiv\"><a id=\"cSystemSharing_shareButton\" data-bind=\"click_sound: 'default', rollover_sound: 'default'\"><input type=\"button\" locattr=\"value\" value=\"SHARE SYSTEM\" id=\"Button7001\" class=\"btn_std btn_toolbar\" data-bind=\"disable: cShareSystems.hasSaveServers, click: cShareSystems.system_editor.saveSystem\" /></a></div>");

// Server selector
$("#cSystemSharing_shareDiv").append("<div id=\"cSystemSharing_serverselect\" style=\"top: -16px; left: 4px;\" data-bind=\"visible: cShareSystems.showSaveServerOptions\"><div><select class=\"div_settings_control_select\" data-bind=\"options: cShareSystems.saveServerOptions, optionsText: function(item) { return item.name; }, value: cShareSystems.server\"></div></div>");

// Add a div for the loading animation.
$("body").append("<div id=\"cSystemSharing_loading_div\" class=\"cSystemSharing_loading_div cSystemSharing_loading_div_system_editor\"></div>");


model.displayName = ko.observable('').extend({ session: 'displayName' });

cShareSystems.system_editor = (function () {

	var system_editor = {};

	system_editor.saveSystem = function() {
		var system = model.system();
		system.name = model.systemName();

		// Yeah, I know this is hackable here. Does anyone really care?
		// IP logs + server bans should prevent the worst abuse.
		if(model.displayName() == "") {
			cShareSystems.showErrorDialog("You need to be logged in to Ubernet!", true);
		} else {
			system.creator = model.displayName();
			cShareSystems.saveSystem(model.system());
		}
	};

	return system_editor;
})();
