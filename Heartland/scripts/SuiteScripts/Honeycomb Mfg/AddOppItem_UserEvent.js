/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Apr 2013     pblancaflor
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
function aoi_userEventBeforeLoad(type, form, request){
  if(type == "create" || type == "edit") {
    form.addButton("custpage_btn_addoppitem", "Add to Opportunity", "addOppItem();");
  }
}
