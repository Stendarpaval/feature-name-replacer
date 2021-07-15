const moduleName = "feature-name-replacer";

Hooks.on("init", () => {
	const moduleName = "feature-name-replacer";

	game.settings.registerMenu(moduleName, "keywordSettingsMenu", {
		name: "SETTINGS.FNR.keywordSettings",
		label: "SETTINGS.FNR.keywordSettingsLabel",
		hint: "SETTINGS.FNR.keywordSettingsHint",
		icon: "fas fa-key",
		type: KeywordSettingsMenu,
		restricted: true
	})

	game.settings.register(moduleName,"namedCreaturesList", {
		name: "SETTINGS.FNR.namedCreaturesList",
		hint: "SETTINGS.FNR.namedCreaturesListHint",
		config: true,
		default: "",
		scope: "world",
		type: String
	});

	game.settings.register(moduleName,"descriptionDataPath", {
		name: "SETTINGS.FNR.descriptionDataPath",
		hint: "SETTINGS.FNR.descriptionDataPathHint",
		config: true,
		default: "data.description.value",
		scope: "world",
		type: String
	});

	game.settings.register(moduleName,"keywordTable", {
		name: "keywordTable",
		config: false,
		scope: "world",
		default: [
			"{creature}",0,"data.name","",
			"{type}",0,"data.data.details.type.value","",
			"{item}",1,"data.name",""
		],
		type: Array
	})
});


/**
 * Replace {creature} and {type} in the description text with the 
 * creature's name.
 * If the creature happens to be a Named Creature, then also remove any
 * preceding article ("the").
 * @param {Item} [item]				The feature item that is added to the actor
 * @return {void}					Return nothing to continue
 */
async function replaceMonsterName(item) {
	let descPath = game.settings.get(moduleName, "descriptionDataPath");
	let pathParts = descPath.split(".").filter((pathPart) => {
		return pathPart !== "";
	});
	let featureDesc = item.data;
	for (let pathPart of pathParts) {
		featureDesc = featureDesc[pathPart];
	}
	if (!featureDesc) return;

	let keywordTable = game.settings.get(moduleName, "keywordTable");
	let tableRow = {};
	const numColumns = 4;
	let splitKeywords = [], regex, regexNamedCreature, newName;
	for (let i = 0; i < Math.floor(keywordTable.length / numColumns); i++) {
		tableRow[i] = keywordTable.slice(numColumns * i, numColumns * (i + 1));
		splitKeywords = tableRow[i][0].split(";").filter((keyword) => {
			return keyword !== "";
		});
		let regexString = "";
		for (let i = 0; i < splitKeywords.length; i++) {
			if (i === splitKeywords.length - 1) {
				regexString += `${splitKeywords[i]}`;	
			} else {
				regexString += `${splitKeywords[i]}|`;
			}
		}
		regex = new RegExp(regexString,"g");
		regexNamedCreature = new RegExp(`(The\\\W|the\\\W)?(${regexString})`,"g");
		let pathSkipped = false;
		if (featureDesc.match(regex) === null) pathSkipped = true;

		let dataPath;
		if (parseInt(tableRow[i][1]) === 0 && !pathSkipped) {
			[dataPath, pathSkipped] = checkDataPath(item.parent, 'actor', tableRow[i]);
		} else if (!pathSkipped) {
			[dataPath, pathSkipped] = checkDataPath(item, 'item', tableRow[i]);
		}
		if (!pathSkipped) {
			newName = String((tableRow[i][3] !== "") ? tableRow[i][3] : dataPath)?.capitalize();
			if (parseInt(tableRow[i][1]) === 0) {
				if (tableRow[i][0].indexOf("{type}") === -1 && (item.parent?.getFlag(moduleName, "namedCreature") || item.parent?.type === "character" || checkNamedCreatureList(item))) {
					newName = String(dataPath)?.capitalize();
					featureDesc = featureDesc.replaceAll(regexNamedCreature, newName);
				} else if (item.parent?.getFlag(moduleName, "namedCreature") === undefined) {
					await item.parent?.setFlag(moduleName, "namedCreature", false);
					featureDesc = featureDesc.replaceAll(regex, newName.toLowerCase());
				} else {
					featureDesc = featureDesc.replaceAll(regex, newName.toLowerCase());
				}
			} else {
				featureDesc = featureDesc.replaceAll(regex, newName);
			}

			await item.update({"data.description.value": featureDesc});
		}
	}
}

/**
 * Check if the provided datapath can be parsed as a string.
 * @param {string} [dataPath]	The provided string such as 'data.name'
 * @param {string} [documentType]	Document type that the datapath starts at, such as 'actor' or 'item'
 * @param {array} [row]	The current row of the keywordTable data
 * @returns {array[string, boolean]} [dataPath, pathSkipped]	An array containing the replacement value in dataPath and whether or not the path failed and should be skipped
 */
function checkDataPath(dataPath, documentType, row) {
	let pathSkipped;
	let pathParts = row[2].split(".").filter((pathPart) => {
		return pathPart !== "";
	})
	for (let pathPart of pathParts) {
		dataPath = dataPath?.[pathPart];
	}
	if (!dataPath || !(String(dataPath))) {
		console.warn(game.i18n.format(`FNR.${documentType}DatapathParseNotify`,{keyword: row[0]}));
		ui.notifications.warn(game.i18n.format(`FNR.${documentType}DatapathParseNotify`,{keyword: row[0]}));
		pathSkipped = true;
	}
	return [dataPath, pathSkipped];
}

/**
 * Inject the handlebars template for the Named Creature option into 
 * the ActorTypeConfig application.
 * @param {ActorTypeConfig} [args]	The ActorTypeConfig application data
 * @param {string} [html]			The rendered html of the ActorTypeConfig application
 * @return {void}					Return nothing to continue
 */
async function injectNamedCreatureOption(args, html) {
	if (game.system.id !== "dnd5e") return;
	let data = {value: false};
	if (args.object.getFlag(moduleName, "namedCreature") || args.object.type === "character") {
		data.value = true;
	} else if (args.object.getFlag(moduleName, "namedCreature") === undefined) {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
	
	const namedCreatureHtml = await renderTemplate('modules/feature-name-replacer/templates/named-creature.html', data);
	html.css({height: 'auto'}).find('button[type="submit"]').before(namedCreatureHtml);
}

/**
 * Detect the value of the Named Creature option when the ActorTypeConfig
 * application is closed.
 * @param {ActorTypeConfig} [args]	The ActorTypeConfig application data
 * @param {string} [html]			The rendered html of the ActorTypeConfig application
 * @return {void}					Return nothing to continue
 */
async function detectNamedCreatureOption(args, html) {
	if (game.system.id !== "dnd5e") return;
	if (html.find('input[name="namedCreature"]')[0].checked) {
		await args.object.setFlag(moduleName, "namedCreature", true);
	} else {
		await args.object.setFlag(moduleName, "namedCreature", false);
	}
}

/**
 * Checks the list of named creatures against the item owner's name.
 * @param {Item} [item]				The item being added to the actor sheet
 * @returns {boolean}				Whether or not the named creature list includes the item owner's name
 */
function checkNamedCreatureList(item) {
	const namedCreaturesList = game.settings.get(moduleName, "namedCreaturesList");
	let splitNames = namedCreaturesList.split(";").filter((name) => {
		return name !== "";
	});
	if (splitNames.includes(item.parent.name)) {
		return true;
	} else {
		return false;
	}
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

// Tie functions to relevant hooks
Hooks.on("createItem", async (item) => {
	await replaceMonsterName(item);
});

Hooks.on("renderActorTypeConfig", async (args, html) => {
	await injectNamedCreatureOption(args, html);
});

Hooks.on("closeActorTypeConfig", async (args, html) => {
	await detectNamedCreatureOption(args, html);
});


class KeywordSettingsMenu extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: "Keyword Replacement Settings",
			id: "feature-name-replacer-keyword-settings",
			template: "modules/feature-name-replacer/templates/keyword-settings-menu.html",
			width: "550",
			height: "auto",
			closeOnSubmit: true
		})
	}

	getData() {
		const data = {
			keywordTable: {
				rows: {}
			}
		};
		const numColumns = 4;
		let keywordTable = game.settings.get(moduleName, "keywordTable");
		for (let i = 0; i < Math.floor(keywordTable.length / numColumns); i++) {
			data.keywordTable.rows[i] = {
				keywordId: "keywordTable",
				keywordValue: keywordTable[numColumns * i],
				documentTypeId: "keywordTable",
				documentTypeValue: {selectedActor: parseInt(keywordTable[numColumns * i + 1]) === 0, selectedItem: parseInt(keywordTable[numColumns * i + 1]) > 0},
				dataPathId: "keywordTable",
				dataPathValue: keywordTable[numColumns * i + 2],
				staticStringId: "keywordTable",
				staticStringValue: keywordTable[numColumns * i + 3]
			}
		}
		data.isGM = game.user.isGM;
		data.removeRowDisabled = (keywordTable.length <= numColumns);
		return data;
	}

	async _updateObject(event, formData) {
		const numColumns = 4;
		for (let [settingKey, value] of Object.entries(formData)) {
			if (settingKey === "keywordTable") {
				let keywordTable = game.settings.get(moduleName, "keywordTable");
				let tableRow = {};
				for (let i = 0; i < Math.floor(keywordTable.length / numColumns); i++) {
					tableRow[i] = value.slice(numColumns * i, numColumns * i + numColumns)
					if (parseInt(tableRow[i][1])) {
						value[numColumns * i + 1] = parseInt(tableRow[i][1]);
					}
				}
			}
			await game.settings.set(moduleName, settingKey, value);
		}
	}

	activateListeners(html) {
		super.activateListeners(html);

		html.on('click', '.FNRaddRow', async () => {
			let tableData = [];
			let tableDataHtml = html.find(`[name="keywordTable"]`);
			for (let input of tableDataHtml) {
				if (!parseInt(input.value)) {
					tableData.push(input.value);
				} else {
					tableData.push(parseInt(input.value));
				}
			}
			let customTable = tableData;
			customTable = customTable.concat(["", 0, "", ""]);
			await game.settings.set(moduleName, "keywordTable", customTable);
			this.render();
		})

		html.on('click', '.FNRremoveRow', async () => {
			let tableData = [];
			let tableDataHtml = html.find(`[name="keywordTable"]`);
			for (let input of tableDataHtml) {
				if (!parseInt(input.value)) {
					tableData.push(input.value);
				} else {
					tableData.push(parseInt(input.value));
				}
			}
			let customTable = tableData;
			if (customTable.length > 3) {
				customTable = customTable.slice(0, customTable.length - 4);	
				await game.settings.set(moduleName, "keywordTable", customTable);
			}
			this.render();
		})


		html.on('click', '.FNRresetTable', async () => {
			await game.settings.set(moduleName, "keywordTable", [
				"{creature}",0,"data.name","",
				"{type}",0,"data.data.details.type.value","",
				"{item}",1,"data.name",""
			]);
			this.render();
		})
	}
}