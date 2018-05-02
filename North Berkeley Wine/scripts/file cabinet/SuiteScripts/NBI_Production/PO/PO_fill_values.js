/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord purchaseorder
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
var item_id = nlapiGetCurrentLineItemValue('item', 'item');

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('internalid', null,'is', item_id);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custitem7'); //Bottles @ standard
	var myresult = nlapiSearchRecord('item', null, filters, columns);
	var myresult = myresult[0].getValue('custitem7');
	alert (myresult);
	
    return true;
}