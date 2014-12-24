var cLeagueOfCommanders = { };

cLeagueOfCommanders.commanderLeague = {
	"RaptorRallus":			"Marshall",
	"RaptorNemicus":			"ZaphodX",
	"RaptorCenturion":		"Quitch",
	"InvictusCommander":		"Tripax",
	"QuadOsiris":				"TotalAnnihilation",
	"TankAeson":				"Martenus",
	"ThetaCommander":			"Conundrum",
	"QuadTwoboots":			"Conundrum",
	"QuadMobiousblack":		"Conundrum",
	"QuadCalyx":				"Bsport",
	"QuadArmalisk":			"Bsport",
	"RaptorBetadyne":			"Bsport",
	"AlphaCommander":			"PRoeleert",
	"QuadSpiderOfMean":		"PRoeleert",
	"ImperialChronoblip":	"PRoeleert",
	"RaptorStickman9000":	"PRoeleert",
	"GammaCommander":			"Sambasti",
	"QuadAjax":					"Sambasti",
	"ImperialAryst0krat":	"Sambasti",
	"QuadGambitdfa":			"Sambasti",
	"ProgenitorCommander":	"OtterFamily",
	"QuadShadowdaemon":		"OtterFamily",
	"RaptorDiremachine":		"OtterFamily"
};

cLeagueOfCommanders.notInLeague = [
	"DeltaCommander",
	"QuadXinthar",
	"ImperialGnugfur",
	"QuadTokamaktech",
	"TankBanditks",
	"RaptorBeast",
	"QuadSacrificialLamb",
	"ImperialAble",
	"RaptorIwmiked",
	"ImperialSangudo",
	"QuadPotbelly79",
	"ImperialTheChessKnight",
	"RaptorZaazzaa",
	"RaptorBeniesk",
	"ImperialKapowaz",
	"QuadRaventhornn",
	"ImperialFiveleafclover",
	"ImperialSeniorhelix"
];

cLeagueOfCommanders.commanderDescriptions = {
	"Bsport": {
		"subtitle": "Airship Commander",
		"description": "Slow flying fortress equipped with an eXodus Beam that can destroy most structures in a single shot from directly above. The weapon can also be used against ground forces."
	},
	"Conundrum": {
		"subtitle": "Orbital Commander",
		"description": "This commander lives in the orbital layer and carries a Yamato Cannon. The weapon has a very long cooldown timer but destroys a very large area on the ground every time it fires."
	},
	"Martenus": {
		"subtitle": "Ninja Commander",
		"description": "Martenus has radar stealth, super fast torpedoes, and is capable of constructing advanced bots. Martenus loves the water but is still very powerful on land."
	},
	"Marshall": {
		"subtitle": "Intel Commander",
		"description": "Marshall is your team's chance to become aware of every threat before it is too late. Marshall has low health and is not effective in combat, but it has many intel options including the ability to construct radar satellites."
	},
	"OtterFamily": {
		"subtitle": "Artillery Commander",
		"description": "Has an artillery weapon that normally fires slowly but can store up ammunition for a rapid-fire volley of up to 10 shots. OtterFamily's cannon is inaccurate but can do severe damage to large armies in the mid to late game."
	},
	"PRoeleert": {
		"subtitle": "Combat Fabrication Commander",
		"description": "This is one of the hardest commanders to play. The PRoeleert sacrifices health and the ability to construct resource structures for mobility and a fast build rate that uses no energy. PRoeleert is an excellent support commander and can quickly repair friendly commanders or reclaim enemies."
	},
	"Quitch": {
		"subtitle": "Flak Commander",
		"description": "Quitch has high health and a flak weapon that is excellent against large swarms of air or even orbital units. Although useful in many situations, Quitch is best paired with a commander that is easily sniped by air."
	},
	"Sambasti": {
		"subtitle": "Transport Commander",
		"description": "Although not the best commander for duels, Sambasti can carry up to 6 units. This commander has a fast anti-air weapon but is still very vulnerable to fighters, so be sure to send air support. Always remember that Sambasti can even carry other commanders!"
	},
	"TotalAnnihilation": {
		"subtitle": "Orbital Fabrication Commander",
		"description": "Conundrum's worst nightmare in single-planet systems. Total Annihilation can build orbital transports and fighters without an orbital launcher, so use this commander to quickly pin down an enemy Conundrum or expand throughout a multi-planet system."
	},
	"Tripax": {
		"subtitle": "Defense Commander",
		"description": "Although slow, Tripax has the highest health of all the commanders. Tripax has a slightly longer range weapon and can build all kinds of defenses."
	},
	"ZaphodX": {
		"subtitle": "Combat Commander",
		"description": "ZaphodX is an expert at commander duels and is able to take on an entire army on its own with an improved Uber Cannon. Many of the other commanders work well in combination with ZaphodX."
	}
};

cLeagueOfCommanders.lastArmy = 0;
cLeagueOfCommanders.lastSlots = Array(model.armies().length);
cLeagueOfCommanders.pickCountInArmy = 1;
cLeagueOfCommanders.doingPicks = false;
cLeagueOfCommanders.lookingForPlayer;
cLeagueOfCommanders.isMyTurn = false;
cLeagueOfCommanders.announcedMod = false;
cLeagueOfCommanders.usingServerMod = ko.observable(false);
cLeagueOfCommanders.addedPicksButton = false;
cLeagueOfCommanders.showCommanderCard = ko.observable(false);

cLeagueOfCommanders.renamecommander = function(commanders, objectName, newName) {
	var foundDuplicate = -1;

	for(commanderIndex in commanders) {
		var commander = commanders[commanderIndex];

		if(commander.ObjectName == objectName) {
			commander.DisplayName = newName;

			if(foundDuplicate >= 0) {
				if(model.signedInToUbernet() && (commander.IsOwned || commander.IsFree)) {
					commanders[foundDuplicate] = commanders[commanderIndex];
				}
				commanders.splice(commanderIndex, 1);
			}
		}

		if(commander.DisplayName == newName) {
				foundDuplicate = commanderIndex;
		}
	}
};

cLeagueOfCommanders.removeCommander = function(commanders, objectName) {
	for(commanderIndex in commanders) {
		var commander = commanders[commanderIndex];

		if(commander.ObjectName == objectName) {
			commanders.splice(commanderIndex, 1);
			break;
		}
	}
};

var setCommander_original = model.setCommander;
model.setCommander = function(commanderIndex) {
	cLeagueOfCommanders.showCommanderCard(false);
	if(!cLeagueOfCommanders.usingServerMod() || !cLeagueOfCommanders.doingPicks)
		return setCommander_original(commanderIndex);
	return model.chooseCommander(commanderIndex);
};

model.chooseCommander = function (commanderIndex) {

	if (model.thisPlayerIsReady())
		 return;

	if(cLeagueOfCommanders.canSelectCommander(commanderIndex)) {
		model.selectedCommanderIndex(commanderIndex % model.commanders().length);

		model.send_message('update_commander', {
			 commander: { ObjectName: model.selectedCommander().ObjectName }
		});
		cLeagueOfCommanders.sendChatMessage("pick: " + model.selectedCommander().DisplayName);
		cLeagueOfCommanders.isMyTurn = false;
	}
};

cLeagueOfCommanders.canSelectCommander = function(commanderIndex) {
	// If there is no server mod
	if(!cLeagueOfCommanders.usingServerMod())
		return true;

	//Can't choose this commander
	if(model.signedInToUbernet() && !(model.commanders()[commanderIndex].IsOwned || model.commanders()[commanderIndex].IsFree))
		return false;

	// If we are in free picks mode
	if(cLeagueOfCommanders.doingPicks == false)
		return true;

	// ALLOW MULTIPLE PEOPLE TO PICK A COMM
	//return true;

	// TODO: set a lobby global to mark whether we're doing picks

	if(!cLeagueOfCommanders.isMyTurn)
		return false;

	var commander = model.commanders()[commanderIndex];
	var commanderName = commander["DisplayName"];

	var armies = model.armies();

	return cLeagueOfCommanders.validatePick(commanderName);
};

cLeagueOfCommanders.validatePick = function(commanderName) {
	var pickedCommanders = cLeagueOfCommanders.pickedCommanders;

		if(pickedCommanders) {
			for(var i=0; i<pickedCommanders.length; i++) {
				if(pickedCommanders[i] == commanderName)
					return false;
			}
		}

	return true;
};

cLeagueOfCommanders.getCommanderDisplayName = function(objectName) {
	return cLeagueOfCommanders.commanderLeague[objectName];
};

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

cLeagueOfCommanders.resetPickOrder = function() {
	cLeagueOfCommanders.updatePickedCommanders();

	// Randomly pick a team to go first
	cLeagueOfCommanders.lastArmy = Math.floor(Math.random() * model.armies().length);

	cLeagueOfCommanders.lastSlots = Array(model.armies().length);
	for(var slotIndex = 0; slotIndex < cLeagueOfCommanders.lastSlots.length; slotIndex++) {
		cLeagueOfCommanders.lastSlots[slotIndex] = -1;
	}
	cLeagueOfCommanders.pickCountInArmy = 1;
};

cLeagueOfCommanders.nextArmy = function() {
	if(cLeagueOfCommanders.lastArmy < model.armies().length-1)
		return cLeagueOfCommanders.lastArmy+1;
	else {
		return 0;
	}
};

cLeagueOfCommanders.nextSlot = function() {
	var slot = [0,0];
	if(cLeagueOfCommanders.pickCountInArmy == 1) {
		slot[0] = cLeagueOfCommanders.lastArmy;
		slot[1] = cLeagueOfCommanders.lastSlots[cLeagueOfCommanders.lastArmy] + 1;
		if(slot[1] >= model.armies()[cLeagueOfCommanders.lastArmy].slots().length) {
			slot[0] = cLeagueOfCommanders.nextArmy();
			slot[1] = cLeagueOfCommanders.lastSlots[slot[0]] + 1;
		}
	} else {
		slot[0] = (cLeagueOfCommanders.lastArmy+1) % model.armies().length;
		slot[1] = cLeagueOfCommanders.lastSlots[slot[0]] + 1;
	}

	if(slot[0] >= model.armies().length)
		return null;

	if(slot[1] >= model.armies()[slot[0]].slots().length)
		return null;

	return slot;
};

cLeagueOfCommanders.doNextSlot = function() {
	var slot = cLeagueOfCommanders.nextSlot();

	if(slot == null)
		return null;

	if(cLeagueOfCommanders.lastArmy == slot[0])
		cLeagueOfCommanders.pickCountInArmy = 0;
	else
		cLeagueOfCommanders.pickCountInArmy = 1;

	cLeagueOfCommanders.lastArmy = slot[0];
	cLeagueOfCommanders.lastSlots[slot[0]] = slot[1];

	cLeagueOfCommanders.lookingForPlayer = model.armies()[slot[0]].slots()[slot[1]].playerName();
	cLeagueOfCommanders.sendChatMessage("turn: " + cLeagueOfCommanders.lookingForPlayer);

	return slot;
};

cLeagueOfCommanders.doSameSlot = function() {
	cLeagueOfCommanders.sendChatMessage("turn: " + cLeagueOfCommanders.lookingForPlayer);
};

cLeagueOfCommanders.debug_do_picks_fast = function() {
	cLeagueOfCommanders.resetPickOrder();

	var doNext = true;
	while(doNext == true) {
		doNext = cLeagueOfCommanders.doNextSlot()
	}
};

cLeagueOfCommanders.doPicks = function() {
	cLeagueOfCommanders.resetPickOrder();
	cLeagueOfCommanders.doingPicks = true;
	cLeagueOfCommanders.sendChatMessage("BEGINNING COMMANDER PICKS");
	cLeagueOfCommanders.doNextSlot();
};

var old_chatHandler = handlers.chat_message;

handlers.chat_message = function (msg) {
	if(!model.isGameCreator()) {
		cLeagueOfCommanders.lookForDoingPicks(msg);
	}

	cLeagueOfCommanders.lookForTurn(msg);
	cLeagueOfCommanders.lookForPicks(msg);

	old_chatHandler(msg);
};

cLeagueOfCommanders.lookForDoingPicks = function(msg) {
	if(msg.message.startsWith("BEGINNING COMMANDER PICKS")) {
		cLeagueOfCommanders.doingPicks = true;
		cLeagueOfCommanders.updatePickedCommanders();
	}
};

cLeagueOfCommanders.lookForTurn = function(msg) {
	if(msg.message.startsWith("turn: ") && cLeagueOfCommanders.playerIsHost(msg.player_name)) {
		var turn = msg.message.slice(6);
		if(model.displayName() == turn) {
			cLeagueOfCommanders.isMyTurn = true;
			model.toggleCommanderPicker()
		} else
			cLeagueOfCommanders.isMyTurn = false;

		cLeagueOfCommanders.lookingForPlayer = turn;
	}
};

cLeagueOfCommanders.lookForPicks = function(msg) {
	if(msg.message.startsWith("pick: ") && msg.player_name == cLeagueOfCommanders.lookingForPlayer && cLeagueOfCommanders.doingPicks) {
		var pick = msg.message.slice(6);

		if(cLeagueOfCommanders.validatePick(pick)) {
			cLeagueOfCommanders.updatePickedCommanders(pick);
			if(model.isGameCreator()) {
				cLeagueOfCommanders.doNextSlot();
			}
		} else {
			if(model.isGameCreator()) {
				cLeagueOfCommanders.doSameSlot();
			}
		}
	}
};

cLeagueOfCommanders.findPlayer = function(playerName) {
	var armies = model.armies();
	for(armyIndex in armies) {
		var army = armies[armyIndex];
		var slots = army.slots();

		for(slotIndex in slots) {
			var slot = slots[slotIndex];
			var slotPlayer = slot.playerName();
			if(playerName == slotPlayer) {
				return [armyIndex, slotIndex];
			}
		}
	}
	return [-1, -1];
};

cLeagueOfCommanders.playerIsHost = function(playerName) {
	var slot = cLeagueOfCommanders.findPlayer(playerName);
	return model.armies()[slot[0]].slots()[slot[1]].isCreator();
}

cLeagueOfCommanders.slotIsPlayer = function(slot) {
	if(slot.playerName() == model.displayName())
		return true;
	else
		return false;
};

cLeagueOfCommanders.sendChatMessage = function(message) {
	var msg = {};
	msg.message = message;
	model.send_message("chat_message", msg);
};

cLeagueOfCommanders.updatePickedCommanders = function(newPick) {
	if(newPick) {
		cLeagueOfCommanders.pickedCommanders.push(newPick);
	} else {
		cLeagueOfCommanders.pickedCommanders = [];
	}
};

cLeagueOfCommanders.addPicksButton = function() {
	cLeagueOfCommanders.addedPicksButton = true;
	$(".form-control-spectator").after("<div style='position: relative; top: -40px; left: 180px; width: 0px;'><div onclick='cLeagueOfCommanders.doPicks()' style='position: absolute;height: 32px; width: 80px; text-align: center; display: block; padding: 5px;margin-right: 5px; border: 1px #585858 solid; border-radius: 1px; background: #282828; color: #FFFFFF;'>Start Picks</div></div>");

};

cLeagueOfCommanders.usingServerMod.subscribe(function(newValue) {
	if(!cLeagueOfCommanders.addedPicksButton && model.isGameCreator())
		cLeagueOfCommanders.addPicksButton();
});

model.isGameCreator.subscribe(function(newValue) {
	if(!cLeagueOfCommanders.addedPicksButton && cLeagueOfCommanders.usingServerMod())
		cLeagueOfCommanders.addPicksButton();
});

cLeagueOfCommanders.watchCommanderPicker = function() {
	//$(".div-commander-picker-item").unbind("mouseenter");
	//$(".div-commander-picker-item").unbind("mouseleave");

	var commanderIndex = 0;
	$(".div-commander-picker-item").each(function() {
		if(!cLeagueOfCommanders.canSelectCommander(commanderIndex)) {
			$(this).addClass("div-commander-picker-item-disabled");
		}

		commanderIndex++;
	});

	$(".div-commander-picker-item").on("mouseenter", function() {
		cLeagueOfCommanders.commanderImg_mouseenter(this);
	});

	$(".div-commander-picker-item").on("mouseleave", function() {
		cLeagueOfCommanders.commanderImg_mouseleave(this);
	});
};

cLeagueOfCommanders.pickerTimer;

cLeagueOfCommanders.pickerTimerFunction = function(tries) {
	if($(".div-commander-picker-cont").length > 0) {

		cLeagueOfCommanders.watchCommanderPicker();
	} else {
		tries--;
		cLeagueOfCommanders.pickerTimer = setTimeout("cLeagueOfCommanders.pickerTimerFunction(" + tries + ");", 100);
	}
};

cLeagueOfCommanders.commanderImg_mouseenter = function(element) {
	var commanderName = $(element).find(".profile-commander-name").text();
	cLeagueOfCommanders.setCommanderCard(element, commanderName);
	cLeagueOfCommanders.showCommanderCard(true);
};

cLeagueOfCommanders.commanderImg_mouseleave = function(element) {
	cLeagueOfCommanders.showCommanderCard(false);
};

cLeagueOfCommanders.setCommanderCard = function(element, commanderName) {
	var offset = $(element).offset();
	offset.top += $(element).height() + 4;
	offset.left += 0;
	$("#commander-card").css("top", offset.top);
	$("#commander-card").css("left", offset.left);
	$("#commander-card-subtitle").text(cLeagueOfCommanders.commanderDescriptions[commanderName].subtitle);
	$("#commander-card-description").text(cLeagueOfCommanders.commanderDescriptions[commanderName].description);
};

//load html dynamically
cLeagueOfCommanders.loadHtmlTemplate = function(element, url) {
    element.load(url, function () {
        console.log("Loading html " + url);
        element.children().each(function() {
			ko.applyBindings(model, this);
		});
    });
};

(function() {
	model.activeModTextArray.subscribe(function(newValue) {
		for(var i=0; i<newValue.length; i++) {
			if(newValue[i] == "League Of Commanders" && !cLeagueOfCommanders.announcedMod) {
				cLeagueOfCommanders.usingServerMod(true);


				var commanderList =  _.filter(model.extendedCatalog(), function (element) {
					  return element.UnitSpec;
				 });

				//var commanderList = model.commanders();

				for(commanderObject in cLeagueOfCommanders.commanderLeague) {
					var commanderName = cLeagueOfCommanders.commanderLeague[commanderObject];
					cLeagueOfCommanders.renamecommander(commanderList, commanderObject, commanderName);
				}

				for(commanderObject in cLeagueOfCommanders.notInLeague) {
					var objectName = cLeagueOfCommanders.notInLeague[commanderObject];
					cLeagueOfCommanders.removeCommander(commanderList, objectName);
				}

				model.commanders = ko.observable(commanderList);

				api.mods.getMountedMods("client", function (mods) {
					 for(var i = 0; i < mods.length; ++i) {
						  var mod = mods[i];
							if(mod.identifier=="com.pa.conundrum.cLeagueOfCommandersUi") {
								cLeagueOfCommanders.announcedMod = true;
								cLeagueOfCommanders.sendChatMessage("Running UI Mod - Version " + mod.version);
							}
					 }
				});

				model.showCommanderPicker.subscribe(function(newValue) {
					if(newValue) {
						cLeagueOfCommanders.pickerTimerFunction(10);
					}
				});

				$("body").append("<div id='commander-card-cont'></div>");
				cLeagueOfCommanders.loadHtmlTemplate($("#commander-card-cont"), "coui://ui/mods/cLeagueOfCommanders_ui/new_game/commander_card.html");
			}
		}
	});
})();

