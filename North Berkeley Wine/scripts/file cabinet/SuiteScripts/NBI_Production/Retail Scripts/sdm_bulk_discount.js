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
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function bulk_button(type, form, request){
	if (type == 'create' || type == 'edit'){
		
		form.getSubList('item').addButton('custpage_sdmbutton','Discount All','discount_lines();');
		form.setScript('customscript_sdm_retail_bulk_discount');
	}
}

function discount_lines (){

	var x = confirm('Are you sure you want to apply this discount to all items?');

	if (x==true) {

		var discount = nlapiGetFieldValue('custbody_sdm_discount_all_amount');
		var linecount = nlapiGetLineItemCount('item');
	
		
		if (linecount == null || linecount == 0) {alert("No items defined."); return;}

		for(var n=1; n <= linecount; n++) {
		
		nlapiSelectLineItem('item',n);
		nlapiSetCurrentLineItemValue('item','custcolretaillinedisc',discount);
		nlapiCommitLineItem('item');
		}

		nlapiSetFieldValue('custbody_sdm_discount_all_amount', '');
		alert('Discount applied to all line items');
		}
	
	}
