$.namespace('Celigo.greentoys.orion.itemfulfillmentsimport');

Celigo.greentoys.orion.itemfulfillmentsimport.library = (function() {

	var nlapi = Celigo.suitescript.SuiteScript;
	var batchImportDispatcher = Celigo.event.dispatcher.integrator.batch.ImportDispatcher;

	var l = $.getExecutionLogger('Item Fulfillments Import');

	this.processEachRecordConfig = function(flow, configObject) {
		// Order number can have -1 -2 in it, remove it and then search
		if (!configObject.nlobjFieldIds.celigo_nlobjTransformId) {
			var orderno = configObject.nlobjFieldIds._orderno;
			if (orderno.indexOf("-") !== -1) {
				var orderno = orderno.substring(0, orderno.indexOf("-"));
			}
			var search = nlapi.searchRecord('salesorder', null,
					[ new nlobjSearchFilter('tranid', null, 'is', orderno) ])
					|| [];
			if (search.length > 0) {
				configObject.nlobjFieldIds.celigo_nlobjTransformId = search[0].id;
			} else {
				throw new Celigo.Error({
					name : "ITEM_FULFILLMENT_IMPORT_ERROR",
					message : "Cannot find order number " + orderno
							+ " to fulfill"
				})
			}
		}

		l.debug('Before - Config', configObject);

		if (!configObject.nlobjFieldIds.shipmethod)
			delete configObject.nlobjFieldIds.shipmethod;

		var salesOrderRec = nlapi.loadRecord('salesorder',
				configObject.nlobjFieldIds.celigo_nlobjTransformId);

		var shipCarrier = salesOrderRec.getFieldValue('carrier');
		var shipMethod = salesOrderRec.getFieldValue('shipmethod');
		var entityid = salesOrderRec.getFieldValue('entity');

		configObject.nlobjFieldIds.entity = parseInt(entityid, 10);

		l.audit('shipCarrier', shipCarrier);

		if (shipCarrier === 'ups' && shipMethod) {
			delete configObject.nlobjSublistIds.package;
			delete configObject.nlobjSublistIds.packagefedex;

			delete configObject.nlobjFieldIds.celigo_replaceAllLines_package;
			delete configObject.nlobjFieldIds.celigo_replaceAllLines_packagefedex;
		} else {
			delete configObject.nlobjSublistIds.packageups;
			delete configObject.nlobjSublistIds.packagefedex;

			delete configObject.nlobjFieldIds.celigo_replaceAllLines_packageups;
			delete configObject.nlobjFieldIds.celigo_replaceAllLines_packagefedex;
		}

		/*
		 * Multiple lines can have the same item. Group items based on the item
		 * name
		 */
		var itemLines = configObject.nlobjSublistIds.item.lines;
		var groupItems = [];
		for (var i = 0; i < itemLines.length; ++i) {

			var itemName = itemLines[i].item;
			var index = checkIfItemExists(groupItems, itemName);
			if (index !== -1) {
				var originalQuantity = groupItems[index].quantity
				groupItems[index].quantity = originalQuantity
						+ parseInt(itemLines[i].quantity);
				groupItems[index].custcol_celigo_cartonnum += (" " + itemLines[i].custcol_celigo_cartonnum);
			} else {
				groupItems
						.push({
							"item" : itemName,
							"quantity" : parseInt(itemLines[i].quantity, 10),
							"custcol_celigo_cartonnum" : itemLines[i].custcol_celigo_cartonnum
						});
			}

		}
		l.audit("Grouped Items", groupItems);

		configObject.nlobjSublistIds.item.lines = groupItems;

		l.debug("After - Config", configObject);
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
	// batchImportDispatcher.on('BATCH_IMPORT:BEFORE_SUBMIT_EACH_RECORD',
	// beforeSubmitEachRecord);
})();
