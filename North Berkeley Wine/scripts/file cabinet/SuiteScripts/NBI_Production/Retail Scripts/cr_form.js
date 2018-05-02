/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */

function retail_rep_line_validate(type){
	//error catch no customer
	var cust = nlapiGetFieldValue('entity');
	if(cust < 1 || cust == null) {
		nlapiCancelLineItem('item');
		throw alert('A customer must be specified before adding items');
		}
		
	var type = nlapiGetCurrentLineItemValue('item', 'itemtype');
	
	if(type == 'InvtPart'){
	
		var disc = nlapiGetCurrentLineItemValue('item', 'custcolretaillinedisc');
		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		var rate = nlapiGetCurrentLineItemValue('item', 'custcolsdm_ns_rate');
		
		if (disc == null || disc.length == 0){
			disc = 0;}
		else {
			disc = (disc.split("%"))[0];
		}
	
		if (qty == null || qty.length == 0 || isNaN(qty)){
			qty = 0;
		}
	
		if (rate == null || rate.length == 0 || isNaN(rate)){
			rate = 0;
		}
	
		amt = parseFloat( parseFloat(rate) * (1 - parseFloat(disc)/100) * parseInt(qty) );
		rate = amt/qty;
		
		rate = rate.toFixed(5);
		
		nlapiSetCurrentLineItemValue('item', 'price', -1, false);
			
		nlapiSetCurrentLineItemValue('item', 'rate', rate); 
	}
		
    return true;
}

function start_disable(){

	nlapiDisableLineItemField('item','amount',true);
	nlapiDisableLineItemField('item','rate', true);
	
}

function line_disable(){

	nlapiDisableLineItemField('item','amount',true);
	nlapiDisableLineItemField('item','rate', true);
	
}



function check_location_on_save(){
	
	var location = nlapiGetFieldValue('location');
	
	if(location != 1){
		alert('Location must be set to Retail / MLK');
		return false;
	}
return true;
	
}




