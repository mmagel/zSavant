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
 * @param {edit} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function sdm_disable_add_button(type, form, request){
 
	// edit to include logic for just on Retail sales forms
	// var role_id = nlapiGetRole();
			
	if(type == 'edit' || type == 'create') {
		var sublist = form.getSubList('item');
		var add_button = sublist.getButton('item_addmultiple');
		
		if(add_button != null){
			add_button.setDisabled(true);
					
		}
	}

}