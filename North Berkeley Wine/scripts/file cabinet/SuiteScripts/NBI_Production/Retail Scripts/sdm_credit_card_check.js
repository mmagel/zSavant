/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Jun 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord cashsale
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var cc_approved = nlapiGetFieldValue('ccapproved');
	var cc_charge = nlapiGetFieldValue('chargeit');
	var card = nlapiGetFieldValue('creditcard');
   
	if(cc_approved == 'T' && cc_charge == 'F' && card.length > 1) {
		
		alert('working');
		
		
	}
	
	
	//var x = confirm('Are you sure you want to charge this Credit Card?');
		
			
	
	return true;
}
