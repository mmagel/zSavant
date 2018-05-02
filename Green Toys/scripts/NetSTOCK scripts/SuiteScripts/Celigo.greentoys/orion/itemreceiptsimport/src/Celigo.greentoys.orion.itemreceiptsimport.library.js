$.namespace('Celigo.greentoys.orion.itemreceiptsimport');

Celigo.greentoys.orion.itemreceiptsimport.library = (function() {

	var nlapi = Celigo.suitescript.SuiteScript;
	var batchImportDispatcher = Celigo.event.dispatcher.integrator.batch.ImportDispatcher;

	var l = $.getExecutionLogger('Item Receipts Import');

	this.processEachRecordConfig = function(flow, configObject) {
		l.audit('Before - Config', configObject);

		var salesOrderRec = nlapi.loadRecord('purchaseorder',
				configObject.nlobjFieldIds.celigo_nlobjTransformId);

		var itemLines = configObject.nlobjSublistIds.item.lines;
		var groupItems = [];
		for (var i = 0; i < itemLines.length; ++i) {

			var itemName = itemLines[i].item;
			var index = checkIfItemExists(groupItems, itemName);
			if (index !== -1) {
				var originalQuantity = groupItems[index].quantity
				groupItems[index].quantity = originalQuantity
						+ parseInt(itemLines[i].quantity);
				groupItems[index].custcol_cps_orion_packagelist += (" " + itemLines[i].custcol_cps_orion_packagelist);
				groupItems[index].custcol_celigo_orion_pack += (" " + itemLines[i].custcol_celigo_orion_pack);
			} else {
				groupItems
						.push({
							"item" : itemName,
							"quantity" : parseInt(itemLines[i].quantity, 10),
							"custcol_celigo_orion_pack" : itemLines[i].custcol_celigo_orion_pack,
							"custcol_cps_orion_packagelist" : itemLines[i].custcol_cps_orion_packagelist
						});
			}

		}
		l.audit("Grouped Items", groupItems);

		configObject.nlobjSublistIds.item.lines = groupItems;

		l.audit("After - Config", configObject);
	};

	this.beforeSubmitEachRecord = function(flow, record) {
		l.audit("record", record);
	};
	this.checkIfItemExists = function(array, item) {
		for (var i = 0; i < array.length; ++i) {
			if (array[i].item === item) {
				return i;
			}
		}
		return -1;
	}
	batchImportDispatcher.on('BATCH_IMPORT:PROCESS_EACH_RECORD_CONFIG',
			processEachRecordConfig);
})();
