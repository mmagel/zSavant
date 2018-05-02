/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function prospect_redirect(type, form, request){
		nlapiSetRedirectURL('RECORD', 'customer', null, null, null);

}
