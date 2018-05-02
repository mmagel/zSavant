/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Oct 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord invoice 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function set_drop_to_na_on_sample(type){
   
	var form = nlapiGetFieldValue('customform');
	
	if(type == "create" && form == 135){ 
	
		nlapiSetFieldValue('custbodyvinluxstatus', 1);
		
	}	
	
}
