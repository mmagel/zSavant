/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Apr 2014     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function disable_edit(type, form, request){
 
	if(type == 'edit'){
		
		var status = nlapiGetFieldValue('status');
		var role = nlapiGetRole();
		
		if(status == 'Billed' && (role == 1001||role==1015)&&nlapiGetContext().getExecutionContext()!='suitelet'){
			throw 'You are not allowed to Edit a Billed Sales Order';
					
		}
		
	}
	
	
}
