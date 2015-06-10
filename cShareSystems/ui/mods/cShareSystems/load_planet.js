// for backwards compatibility

var loadJson_pending = ko.observable(0);

// default is user systems

model.cShareSystems_selectedTabKey = ko.observable( 'my-systems' );

// setup tabs

model.cShareSystems_tabsIndex = ko.observable(
{
	'my-systems':
	{
		key: "my-systems",
		name: "My Systems",
		systems: ko.observableArray( model.userSystems() ) // initially empty
	},
	'shared-systems':
	{
		key: "shared-systems",
		name: "Shared Systems",
		systems: ko.observableArray( [] )
	},
	'uber-systems':
	{
 		key: "uber-systems",
		name: "Uber Systems",
		systems: ko.observableArray( model.premadeSystems() ) // initially empty
	}
});

model.cShareSystems_tabs = ko.computed( function()
{
    return _.values( model.cShareSystems_tabsIndex() );    
});

model.cShareSystems_showTab = function( tab )
{
    model.cShareSystems_selectedTabKey( tab.key );
    model.selectedSystemIndex(-1);
}

model.cShareSystems_selectedTab = ko.computed( function()
{
    return model.cShareSystems_tabsIndex()[ model.cShareSystems_selectedTabKey() ]; 
});

model.cShareSystems_showingUserSystems = ko.computed( function()
{
    return model.showValue() == 'systems' && model.cShareSystems_selectedTabKey() == 'my-systems';    
});

model.cShareSystems_showingSharedSystems = ko.computed( function()
{
    return cShareSystems.showServerOptions() && model.showValue() == 'systems' && model.cShareSystems_selectedTabKey() == 'shared-systems';
})

model.cShareSystems_serverOptions = ko.computed( function()
{
    return cShareSystems.serverOptions();
})

model.cShareSystems_server = ko.observable( cShareSystems.server() );

model.cShareSystems_systemInfo = function( data )
{
    if ( data.creator )
    {
        return data.creator;
    }
    
    return model.cShareSystems_systemPlayers( data );
}

model.cShareSystems_systemPlayers = function( data )
{
    return model.generateDescription(data.players);  
}

model.cShareSystems_systemDescription = function( data )
{
    return data.description;  
}

model.cShareSystems_systemVersion = function( data )
{
    return "Version: " + data.version;  
}

model.cShareSystems_metal = function( data )
{

    if ( data.metal_spots )
    {
        return "Custom Metal: " + data.metal_spots.length;
    }
    
    return "Metal Clusters: " + Math.round( data.planet.metalClusters ) + " Density: "+ Math.round( data.planet.metalDensity );

}

model.cShareSystems_landing = function( data )
{

    if ( data.landing_zones )
    {
        return "Custom Landing: " + ( $.isArray( data.landing_zones ) ? data.landing_zones.length : data.landing_zones.list.length );
    }
    
    return "";

}

model.cShareSystems_csg = function( data )
{
    
    if ( data.planetCSG )
    {
        return "Custom CSG: " + data.planetCSG.length;
    }
    
    return "";

}

cShareSystems.addTab = function(tabName, systems)
{

	var key = Math.random() + "";
	
	key = key.slice(2);
    
    var tabs = model.cShareSystems_tabsIndex();
    
	tabs[ key ] =
	{
		key: key,
		name: tabName,
		systems: ko.observableArray( systems )
	};
	
	model.cShareSystems_tabsIndex( tabs );
}

// show shared systems once populated

cShareSystems.systems.subscribe( function( systems )
{
    console.log( systems );
    model.cShareSystems_tabsIndex()['shared-systems'].systems( systems ); 
});

// show user systems once populated

model.userSystems.subscribe( function( systems )
{
    model.cShareSystems_tabsIndex()['my-systems'].systems( systems ); 
});

// show user systems once populated

model.premadeSystems.subscribe( function( systems )
{
    model.cShareSystems_tabsIndex()['uber-systems'].systems( systems ); 
});

// overrides

model.systems = ko.computed( function()
{
    return model.cShareSystems_selectedTab().systems();
})

model.selectedSystemIsUserSystem = ko.computed( function()
{
    return model.cShareSystems_showingUserSystems();
});

model.deleteSystem = function ()
{
    if (model.selectedSystemIndex() < 0)
        return;

    var systems = model.userSystems();

    systems.splice(model.selectedSystemIndex(), 1);
  
    model.userSystems(systems);
    
    model.selectedSystemIndex(-1);
}

// add tabs and server selection

$("#systems").parent().attr( "data-bind", "css: { cShareSystems: model.cShareSystems_showingSharedSystems }" );
$("#systems").parent().prepend(loadHtml('coui://ui/mods/cShareSystems/load_planet/tab_content.html'));

$("#systems .system-player-reco").attr('data-bind', "text: model.cShareSystems_systemInfo( $data )");

$('<p data-bind="visible: $data.description, text: model.cShareSystems_systemDescription( $data )"></p>').insertBefore("#detail-pane .section.col-planets");

$('<p data-bind="visible: $data.version, text: model.cShareSystems_systemVersion( $data )"></p>').insertBefore("#detail-pane .section.col-planets");

$('<p data-bind="visible: $data.creator, text: model.cShareSystems_systemPlayers( $data )"></p>').insertBefore("#detail-pane .section.col-planets");

$("#detail-pane .planet-metal").remove();

$("#detail-pane .planet-properties").append('<div class="planet-metal" data-bind="text: model.cShareSystems_metal( $data )"></div>');

$("#detail-pane .planet-properties").append('<div class="planet-metal" data-bind="text: model.cShareSystems_landing( $data )"></div>');

$("#detail-pane .planet-properties").append('<div class="planet-metal" data-bind="text: model.cShareSystems_csg( $data )"></div>');

// backwards compatibility

cShareSystems.load_pas = function(tabName, fileArray)
{

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
