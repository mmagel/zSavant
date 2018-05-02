/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 May 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function rep_line_validate(type){
 
	var qty = parseInt(nlapiGetCurrentLineItemValue('item','quantity'));
	var availQty = parseInt(nlapiGetCurrentLineItemValue('item', 'quantityavailable'));
	var itemloc = nlapiGetCurrentLineItemText('item', 'location');
	var reploc = nlapiGetFieldText('custbody_salesreploc');

	if (qty>availQty){throw alert('Order quantity can not be greater than available quantity.');}
	
	if (reploc == null){throw alert('No location defined for this Sales Rep');}
	
	if (!((itemloc==reploc||itemloc.indexOf(reploc)>-1) || itemloc=="Vinlux")){throw alert('You do not have access to this location');}

	return true;
}
function rep_line_init(type){
	if (type=='item'){
	 nlapiDisableLineItemField('item', 'amount', true);
	nlapiDisableLineItemField('item', 'location',false);
		nlapiSetCurrentLineItemValue('item','location',7,false);
	nlapiDisableLineItemField('item', 'location',true);
	}
}

function or_init(type) {
nlapiDisableLineItemField('item', 'amount', true);
//nlapiSetFieldValue('custbody_salesreploc',7);
nlapiSetFieldValue('custbodyvinluxstatus',1);
if (type=='create'||type=='edit')
	nlapiSelectNewLineItem('item');
} 
function disable_amount() {
	nlapiDisableLineItemField('item', 'amount', true);
	//nlapiSetFieldValue('custbody_salesreploc',7);
	nlapiSetFieldValue('custbodyvinluxstatus',1);
	} 