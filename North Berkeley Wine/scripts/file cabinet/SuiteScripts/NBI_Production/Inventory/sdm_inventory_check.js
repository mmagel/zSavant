/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Jan 2014     cblaisure
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function monitor_inventory(type) {

try {
	
	//customsearch_inv_check
	
	var results = nlapiSearchRecord(null, 'customsearch_inv_check', null, null);
	var result = results[0];
	var columns = result.getAllColumns();
	var on_hand = result.getValue(columns[0]);
	var on_order = result.getValue(columns[1]);
	var commited = result.getValue(columns[2]);
	var available = result.getValue(columns[3]);
	var back_ordered = result.getValue(columns[4]);
	var on_transit = result.getValue(columns[5]);
	
	
	var record = nlapiCreateRecord('customrecord_sdm_track_inventory', null);
	
	var today = new Date();	
	var today = nlapiDateToString(today, 'datetimetz');
	
		record.setFieldValue('custrecord_mlk_inv_date', today);
		record.setFieldValue('custrecord_mlk_inv_on_hand', on_hand);
		record.setFieldValue('custrecord_mlk_inv_on_order', on_order);
		record.setFieldValue('custrecord_mlk_inv_commit', commited);
		record.setFieldValue('custrecord_mlk_inv_avail', available);
		record.setFieldValue('custrecord_mlk_inv_back_order', back_ordered);
		record.setFieldValue('custrecord_mlk_inv_transit', on_transit);
		
		nlapiSubmitRecord(record, null, null);
	}

catch (e)

	{
	
	nlapiSendEmail(4, 4, 'NBI Error', 'Inventory review script: ' + e, null, null, null, null);
	
	}
}
