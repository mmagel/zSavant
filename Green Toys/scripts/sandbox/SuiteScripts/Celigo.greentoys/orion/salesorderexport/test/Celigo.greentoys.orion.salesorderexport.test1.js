(function() {

	var assert = Celigo.Test.Assert;

	this.createCustomer = function(name) {
		var customerRecord = new $R({
			"nlobjRecordType" : "customer",
			"nlobjFieldIds" : {
				"customform" : "GT Customer Form",
				"isperson" : false,
				"companyname" : name,
				"partner" : "*, Error",
				"email" : "abc123456789018943@example.com"
			}
		});
		return customerRecord;
	}

	this.createNonInventoryItem = function(name) {
		var itemRecord = new $R({
			"nlobjRecordType" : "noninventoryitem",
			"nlobjFieldIds" : {
				"itemid" : name + " " + new Date().getTime().toFixed(0),
				"taxschedule" : "S1"
			},
			initializeValues : {
				subtype : 'sale'
			},
		});

		return itemRecord;
	}
	this.createSalesOrder = function(customer, item) {
		var salesOrderRecord = new $R({
			"nlobjRecordType" : "salesorder",
			"nlobjFieldIds" : {
				"customform" : "GT Sales Order",
				"entity" : customer,
				"location" : 3,
				"custbody_cps_orderreadytoship" : true,
				"custbody7" : "3-Regular",
				"partner" : "*, Error",
				"orderstatus" : "Pending Fulfillment"
			},
			"nlobjSublistIds" : {
				"item" : [ {
					"item" : item,
					"quantity" : 10,
					"custcol_cps_orion_linereadytoship" : true,
					"amount" : 10
				} ]
			}
		});
		return salesOrderRecord;
	};
	var testConfig = {
		_options : {
			skipTraceRemoval : false
		},
		init : function() {
		},
		testCheckExciseTaxAndAgeVerification : function() {
			var customer = createCustomer("Celigo Test Customer").save();
			var item = createNonInventoryItem("GT_").save();

			var salesOrderId = createSalesOrder(customer, item).save();
			var beforeSendMessage = "";
			Celigo.event.dispatcher.Util.removeAllListeners();
			var flow = Celigo.integrator.dataflow.Factory
					.getDataFlowByRecordId('ORION_SALESORDER_EXPORT',
							Celigo.integrator.batch.DataFlowMetadata);
			var batchExportDispatcher = Celigo.event.dispatcher.integrator.batch.ExportDispatcher;

			function processSavedSearchResults(flow, savedSearches, collection) {
				savedSearches[0].getAdditionalFilters().push(
						new nlobjSearchFilter('internalid', null, 'anyof',
								[ salesOrderId ]));
			}

			function beforeSend(flow, requestMessage) {
				beforeSendMessage = requestMessage.getData().getContent();
				$$.logExecution('ERROR', 'request message', JSON
						.stringify(beforeSendMessage));
			}

			batchExportDispatcher.on('BATCH_EXPORT:PRE_PROCESS_SAVED_SEARCHES',
					processSavedSearchResults);
			batchExportDispatcher.on('BATCH_EXPORT:BEFORE_SEND_MESSAGE',
					beforeSend);

			Celigo.integrator.dataflow.Runner.runDataFlow(flow);

			var lines = beforeSendMessage.split("\n");

			var tokens = lines[1].split("|");
			var orderId = tokens[1];
			var salesOrder = $$.loadRecord('salesorder', salesOrderId);
			assert.areSame("T", salesOrder
					.getFieldValue("custbody_celigo_ordercompleteto3pl"));
			assert.areSame(salesOrder.getFieldValue('tranid') + "-1", orderId);
			assert.areSame(salesOrder
					.getFieldValue("custbody_cps_orion_export_counter"), "2");
			assert.isNotNull(salesOrder
					.getFieldValue('custbody_cps_last_exportedto_orion'));
			$$.logExecution('ERROR', 'Last Export', salesOrder
					.getFieldValue('custbody_cps_last_exportedto_orion'));
		}
	};

	return new Celigo.Test.TestCase(testConfig);
}());
