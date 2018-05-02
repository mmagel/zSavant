/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jun 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function vendor_bill_before_load(type,form,request){
	nlapiSetFieldValue('approvalstatus',2);
}
function vendor_bill_after_submit(type){
    if (type=='create'){
    	var wire_date=nlapiGetFieldValue('trandate');
    	var lines=nlapiGetLineItemCount('expense');
    	for (var i=1; i<=lines; i++){
    		var investor_id=nlapiGetLineItemValue('expense','customer',i);
    		var investor=nlapiLoadRecord('customer',investor_id);
    		
    	}
    }
}
