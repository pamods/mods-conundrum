var loadHtml_pending = ko.observable(0);
var loadJson_pending = ko.observable(0);
var tabs_initialized = false;

//load html dynamically
function loadHtmlTemplate(element, url) {
	loadHtml_pending(loadHtml_pending()+1);
    element.load(url, function () {
        console.log("Loading html " + url);
        element.children().each(function() {
			ko.applyBindings(model, this);
		});
	loadHtml_pending(loadHtml_pending()-1);
    });
}

cShareSystems.tab_items = ko.observableArray([
	{
		tabId: "my-systems",
		value: "systems",
		name: "My Systems",
		systems: []
	},
	{
		tabId: "cShareSystems",
		value: "cShareSystems",
		name: "Shared Systems",
		systems: []
	}
]);

/*
 * Inject a ton of html
 */

// ASSIGN IDS
$(".section_content .col_2 .tab-wrapper").wrap("<div id='col-container'></div>");

$(".section_content .col_2").attr("id", "system-tab-wrapper");
$("#system-tab-wrapper .tab-wrapper").attr("id", "my-systems");


// SYSTEM DESCRIPTIONS

model.selectedSystemHasDesc = ko.computed(function() {
	var sys = model.selectedSystem();
	return sys.creator || sys.version || sys.date || sys.description;
});

$(".section_controls").append("<div id='cShareSystems-description-cont' data-bind='visible: selectedSystemHasDesc'></div>");
loadHtmlTemplate($("#cShareSystems-description-cont"), "coui://ui/mods/cShareSystems/load_planet/description.html");

// CREATE TAB BUTTONS
$("#col-container").prepend("<ul id='system-tabs' data-bind='foreach: cShareSystems.tab_items'><li><a data-bind='text: name, attr: { href: \"#\" + tabId}, click: function() { cShareSystems.offline_systems(systems); model.showValue(value); }'></a></li></ul>");

// SHARED SYSTEMS tab
$("#col-container").append("<div id='cShareSystems' class='tab-wrapper'></div>");
loadHtmlTemplate($("#cShareSystems"), "coui://ui/mods/cShareSystems/load_planet/tab_content.html");

// INITIALIZE TABS
loadHtml_pending.subscribe(function(newValue) {
	// Don't initialize until the components are done loading
	if(newValue <= 0 && loadJson_pending() <= 0 && tabs_initialized == false) {
		$("#system-tab-wrapper").tabs();
		tabs_initialized = true;
	}
});

loadJson_pending.subscribe(function(newValue) {
	// Don't initialize until the components are done loading
	if(newValue <= 0 && loadHtml_pending() <= 0 && tabs_initialized == false) {
		$("#system-tab-wrapper").tabs();
		tabs_initialized = true;
	}
});

// Filtering options
//$(".div_pre_game_header").append("<div id=\"filter-controls\" data-bind=\"visible: showSharedSystems\">	<div id=\"filter-controls-inner\">		<div>			<table>				<tr>					<td>						<span class=\"input_label\">System Name</span>					</td>					<td>						<input type=\"text\" data-bind=\"value: cShareSystems.filterOptions().name, valueUpdate: 'afterkeydown'\">					</td>				</tr>					<td>						<span class=\"input_label\">Creator</span>					</td>					<td>						<input type=\"text\" data-bind=\"value: cShareSystems.filterOptions().creator, valueUpdate: 'afterkeydown'\">					</td>				</tr>			</table>		</div>		<div style=\"margin-left: 10px;\">			<table>				<tr>					<td>						<span class=\"input_label\">Planets</span>					</td>					<td style=\"padding-left: 10px;\">						<input type=\"number\" min=\"1\" max=\"16\" step=\"1\" data-bind=\"value: cShareSystems.filterOptions().minPlanets, valueUpdate: 'afterkeydown'\">						 - 						<input type=\"number\" min=\"1\" max=\"16\" step=\"1\" data-bind=\"value: cShareSystems.filterOptions().maxPlanets, valueUpdate: 'afterkeydown'\">					</td>				</tr>					<td style=\"padding-top: 1px;\">						<span class=\"input_label\">Sort By</span>					</td>					<td>						<select class=\"div_settings_control_select\" data-bind=\"value: cShareSystems.filterOptions().sort_field, valueUpdate: ['afterkeydown', 'propertychange', 'input']\">							<option value=\"system_id\">Most Recent</option>							<option value=\"num_planets\">Planets</option>						</select>					</td>				</tr>			</table>		</div>	</div></div>");

// LOAD SYSTEM button
$(".div_commit_cont").append("<div id='cShareSystems-button-bar' data-bind='visible: showSharedSystems'></div>");
loadHtmlTemplate($("#cShareSystems-button-bar"), "coui://ui/mods/cShareSystems/load_planet/button_bar.html");

$(".div_commit_cont").append("<div id='cShareSystems-button-bar-offline' data-bind='visible: model.showValue() == \"cShareSystems_offline\"'></div>");
loadHtmlTemplate($("#cShareSystems-button-bar-offline"), "coui://ui/mods/cShareSystems/load_planet/button_bar_offline.html");



// Add a div for the loading animation.
//$(".wrapper tab-content").append("<div id=\"cSystemSharing_loading_div\" class=\"cSystemSharing_loading_div cSystemSharing_loading_div_load_planet\"></div>");


/*
 * Add some jquery handlers that will force a new search every time a filter is updated.
 */

$("#filter-controls input,select").on("keyup", function() {
	cShareSystems.searchSystems({}, 0);
}).on("click", function() {
	cShareSystems.searchSystems({}, 0);
});


/*
 * Extend the model with a handler for the new button
 */

model.showSharedSystems = ko.computed(function() { return model.showValue() == 'cShareSystems'});

model.showValue.subscribe(function(newValue) {
	model.selectedSystemIndex(-1);
	$(".selected_planet").removeClass("selected_planet");

	if(newValue=="cShareSystems")
		cShareSystems.searchSystems({}, 0, true);
});

// Override
model.selectedSystem = ko.computed(function () {
	var systems;

	if(model.showValue() == "systems") {
		systems = model.systems;
	} else if(model.showValue() == "cShareSystems") {
		systems = cShareSystems.systems;
	} else if (model.showValue() == "cShareSystems_offline") {
		systems = cShareSystems.offline_systems;
	}

	var selected_system = systems()[model.selectedSystemIndex()] ? systems()[model.selectedSystemIndex()] : {};

	return selected_system;
});

// Override
model.selectedSystemName = ko.computed(function () {
	if(!model.showSharedSystems())
		return (model.systems()[model.selectedSystemIndex()]) ? model.systems()[model.selectedSystemIndex()].name : '';
	else if(model.showSharedSystems())
		return (cShareSystems.systems()[model.selectedSystemIndex()]) ? cShareSystems.systems()[model.selectedSystemIndex()].name : '';
});

cShareSystems.offline_systems = ko.observableArray();

cShareSystems.addTab = function(tabName, systems) {
	var tabId = Math.random() + "";
	tabId = tabId.slice(2);

	$("#col-container").append("<div id='" + tabId + "' class='tab-wrapper'></div>");

	loadHtmlTemplate($("#" + tabId), "coui://ui/mods/cShareSystems/load_planet/tab_content_offline.html");

	cShareSystems.tab_items.push({
		tabId: tabId,
		value: "cShareSystems_offline",
		name: tabName,
		systems: systems
	});
}

cShareSystems.load_pas = function(tabName, fileArray)
{
    loadJson_pending(loadJson_pending() + 1);

    var systems = new Array();
    var counter = fileArray.length;

    var system_index = 0;
    var sort_index = {};
    
    for (arrayItem in fileArray)
    {
        var fileName = fileArray[arrayItem];
        
        sort_index[ fileName ] = system_index;
        system_index++;

        $.getJSON(fileName, function(data)
        {
            data.system_index = sort_index[ this.url ];
            systems.push(data);
        }).always(function()
        {
            counter--;

            if (counter <= 0)
            {
                systems = _.sortBy(systems, 'system_index');
                cShareSystems.addTab(tabName, systems);
                loadJson_pending(loadJson_pending() - 1);
            }
        });
    }
};

cShareSystems.unfixupPlanetConfig_array = function(systemsArray) {
	for(systemIndex in systemsArray) {
		var system = systemsArray[systemIndex];
		system.creator = "1v1 Ranked Match";
		systemsArray[systemIndex] = UberUtility.unfixupPlanetConfig(system);
	}
	return systemsArray;
};

// PUT UBER'S SYSTEMS IN A TAB

cShareSystems.addTab("Uber Systems", model.premadeSystems());
model.premadeSystems([]);