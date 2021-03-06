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
				"itemid" : name,
				"taxschedule" : "S1"
			},
			initializeValues : {
				subtype : 'sale'
			},
		});

		return itemRecord;
	}
	this.createSalesOrder = function(customer, item, item1) {
		var salesOrderRecord = new $R({
			"nlobjRecordType" : "salesorder",
			"nlobjFieldIds" : {
				"customform" : "GT Sales Order",
				"entity" : customer,
				"location" : 3,
				"custbody_cps_orderreadytoship" : true,
				"custbody7" : "3-Regular",
				"partner" : "*, Error",
				"orderstatus" : "Pending Fulfillment",
				"shipcarrier" : "More",
				"shipmethod" : "Routing"
			},
			"nlobjSublistIds" : {
				"item" : [ {
					"item" : item,
					"quantity" : 10,
					"custcol_cps_orion_linereadytoship" : true,
					"amount" : 10
				}, {
					"item" : item1,
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

			var itemName1 = "GT_" + new Date().getTime().toFixed(0);
			var item1 = createNonInventoryItem(itemName1).save();

			var salesOrderId = createSalesOrder(customer, item, item1).save();
			salesOrderNo = $$.lookupField('salesorder', salesOrderId, 'tranid');
			salesOrderNo = 100760;
			itemName = "SRWB-1185";
			itemName1 = "TRWB-1186";

			var responseString = [
					"SO#|OrderNumber|Priority|PO|ShipTo Name|FreightTerms|FreightAmount|CarrierService|TotalCartons|TotalWeight|ShipDate|Sku|QtyShipped|LineNumber|Carton#|IsTaped|PackageLineNumber|TrackingNumber|Original Order #\n",
					salesOrderNo
							+ "-1"
							+ "|0000600291|5|01 262670|TJX Companies : Marshalls (Domestic)|COLLECT|0.0000|GLTN|54|341.1110|06/07/2016|SRWB-1185|136|00001|17|0||LHP56716|",
					salesOrderNo + "\n",
					salesOrderNo + "-1",
					"|0000600291|5|01 262670|TJX Companies : Marshalls (Domestic)|COLLECT|0.0000|GLTN|54|341.1110|06/07/2016|TRWB-1186|333|00002|54|0||LHP56716|"
							+ salesOrderNo ].join('');

			Celigo.event.dispatcher.Util.removeAllListeners();
			var flow = Celigo.integrator.dataflow.Factory
					.getDataFlowByRecordId('ORION_ITEMFULFILLMENT_IMPORT',
							Celigo.integrator.batch.DataFlowMetadata);
			var flowUtil = flow.getUtil();
			flowUtil.initializeJobRecord(flow);

			flow.getConnector().getCredentialRef().setId('CELIGO_FTP');
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

			assert.areSame(fulfillmentRecord.getLineItemCount('item'), 2);

			assert.areSame(fulfillmentRecord.getLineItemValue('item',
					'quantity', 1), '10');
			assert.areSame(fulfillmentRecord.getLineItemValue('item',
					'quantity', 2), '5');

		}
	};

	return new Celigo.Test.TestCase(testConfig);
}());
