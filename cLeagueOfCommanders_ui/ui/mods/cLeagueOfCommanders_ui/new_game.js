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
	"RaptorStickman9000":	"PRoeleert"
};

cLeagueOfCommanders.notInLeague = [
	"ProgenitorCommander",
	"GammaCommander",
	"DeltaCommander",
	"RaptorBeast",
	"ImperialAryst0krat",
	"QuadShadowdaemon",
	"QuadSacrificialLamb",
	"QuadXinthar",
	"QuadGambitdfa",
	"ImperialAble",
	"ImperialGnugfur",
	"RaptorIwmiked",
	"ImperialSangudo",
	"QuadPotbelly79",
	"ImperialTheChessKnight",
	"RaptorZaazzaa",
	"QuadTokamaktech",
	"RaptorDiremachine",
	"RaptorBeniesk",
	"ImperialKapowaz"
];

cLeagueOfCommanders.lastArmy = 0;
cLeagueOfCommanders.lastSlots = Array(model.armies().length);
cLeagueOfCommanders.pickCountInArmy = 1;
cLeagueOfCommanders.doingPicks = false;
cLeagueOfCommanders.lookingForPlayer;
cLeagueOfCommanders.isMyTurn = false;
cLeagueOfCommanders.announcedMod = false;
cLeagueOfCommanders.usingServerMod = ko.observable(false);
cLeagueOfCommanders.addedPicksButton = false;

cLeagueOfCommanders.renamecommander = function(commanders, objectName, newName) {
	var foundDuplicate = false;

	for(commanderIndex in commanders) {
		var commander = commanders[commanderIndex];

		if(commander.ObjectName == objectName) {
			commander.DisplayName = newName;

			if(foundDuplicate) {
				commanders.splice(commanderIndex, 1);
			}
		}

		if(commander.DisplayName == newName) {
			foundDuplicate = true;
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

(function() {
	model.activeModTextArray.subscribe(function(newValue) {
		for(var i=0; i<newValue.length; i++) {
			if(newValue[i] == "League Of Commanders" && !cLeagueOfCommanders.announcedMod) {
				cLeagueOfCommanders.usingServerMod(true);

				var commanderList = model.commanders();

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
			}
		}
	});
})();