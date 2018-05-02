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
				"itemid" : name
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
			var itemName = "GT_" + new Date().getTime().toFixed(0);
			var item = createNonInventoryItem(itemName).save();
			var salesOrderId = createSalesOrder(item, customer);

			var responseString = [
					"SO#|OrderNumber|Priority|PO|ShipTo Name|FreightTerms|FreightAmount|CarrierService|TotalCartons|TotalWeight|ShipDate|Sku|QtyShipped|LineNumber|Carton#|IsTaped|PackageLineNumber|TrackingNumber",
					salesOrderId,
					"|0000598528|3||RG Natural Babies|PREPAID|93.8800|UPS|7|40.9460|05/11/2016|",
					item, "|1|00001|1|0|00001|1Z6WA0550302179005" ].join('');

			Celigo.event.dispatcher.Util.removeAllListeners();
			var flow = Celigo.integrator.dataflow.Factory
					.getDataFlowByRecordId('DEMANDWARE_SALESORDER_IMPORT',
							Celigo.integrator.batch.DataFlowMetadata);
			var flowUtil = flow.getUtil();
			flowUtil.initializeJobRecord(flow);

			var batchImportDispatcher = Celigo.event.dispatcher.integrator.batch.ImportDispatcher;

			function beforeMapCollectionToRequestMessage(flow, collection) {

			}

			function afterReceiveResponseCallback(flow, responseMessage) {
				$$.logExecution('ERROR', 'original responseString',
						responseMessage.getData().getContent());

				responseMessage.getData().setContent(responseString);

				$$.logExecution('ERROR', 'mock responseString', responseString);
			}
			function afterMapResponseCallback(flow, mapToNetSuiteResult,
					document) {
				var jsObjects = mapToNetSuiteResult.getJsObjects();
				var config = jsObjects.getNextObject();

				$$.logExecution('ERROR', 'config', config);

				assert.isNotNull(config);
			}
			function pressEachRecordConfigCallback(flow, config) {
				assert.isNotNull(config);
				$$.logExecution('ERROR', 'config object', JSON
						.stringify(config));
			}

			batchImportDispatcher.on(
					'BATCH_IMPORT:BEFORE_MAP_COLLECTION_TO_REQUEST_MESSAGE',
					beforeMapCollectionToRequestMessage);
			batchImportDispatcher.on('BATCH_IMPORT:AFTER_RECEIVE_MESSAGE',
					afterReceiveResponseCallback);
			batchImportDispatcher.on(
					'BATCH_IMPORT:AFTER_MAP_RESPONSE_DOCUMENT_TO_RECORDS',
					afterMapResponseCallback);
			batchImportDispatcher.on('BATCH_IMPORT:PROCESS_EACH_RECORD_CONFIG',
					pressEachRecordConfigCallback);
			Celigo.integrator.dataflow.Runner.runDataFlow(flow);

			var fulfillmentSearch = $$.searchRecord('itemfulfillment', null, [
					new nlobjSearchFilter("createdfrom", null, 'is',
							salesOrderId),
					new nlobjSearchFilter("mainLine", null, 'is', 'T') ])
					|| [];
			assert.areSame(1, fulfillmentSearch.length);

			var fulfillmentRecord = $$.loadRecord('itemfulfillment',
					fulfillmentSearch[0].id);
		}
	};

	return new Celigo.Test.TestCase(testConfig);
}());
