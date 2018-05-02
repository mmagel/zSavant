$.namespace('Celigo.greentoys.orion.salesorderexport');

Celigo.greentoys.orion.salesorderexport.library = (function() {

	var nlapi = Celigo.suitescript.SuiteScript;
	var l = $.getExecutionLogger('Sales Order Export');

	this.preProcessEachSearchResultSubset = function(flow, searchResultSubset) {
		l.audit('Before - SearchResultSubset', searchResultSubset);
		if (searchResultSubset.length === 0)
			return;
		var salesOrderId = searchResultSubset[0].id;
		var exportCounter = parseInt(nlapi.lookupField('salesorder',
				salesOrderId, 'custbody_cps_orion_export_counter'), 10) || 1;

		for (var i = 0; i < searchResultSubset.length; ++i) {
			searchResultSubset[i]['Order #'] += ("-" + exportCounter);
		}
		nlapi.submitField('salesorder', salesOrderId,
				'custbody_cps_orion_export_counter', exportCounter + 1);
		try {
			var salesOrderRec = new $R({
				"nlobjRecordType" : "salesorder",
				"id" : parseInt(salesOrderId, 10),
				"nlobjFieldIds" : {
					custbody_cps_orion_export_counter : exportCounter + 1,
					custbody_cps_last_exportedto_orion : new Date()
				}
			});
			salesOrderRec.save();
		} catch (exception) {
			l.error('error saving sales order', exception);
		}
		l.audit('After - SearchResultSubset', searchResultSubset);
	};

	var batchExportDispatcher = Celigo.event.dispatcher.integrator.batch.ExportDispatcher;

	batchExportDispatcher.on(
			'BATCH_EXPORT:PRE_PROCESS_EACH_SEARCH_RESULT_SUBSET',
			preProcessEachSearchResultSubset);
})();
