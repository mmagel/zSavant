/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Apr 2014     cblaisure
 * 
 * The purpose of this script is to automate the cash sale creation from the sales order.  
 *
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */

function pos_sales_order_open(type){
	var form = nlapiGetFieldValue('customform');
	if(form == 152 && type == 'create'){ //only on POS Sales Order
		nlapiSetFieldText('orderstatus', 'Pending Approval', true, true);
		}
}

function pos_sales_order_checks(type){
	var form = nlapiGetFieldValue('customform');
	
	if(form == 152 && type == 'create'){ //only on POS Sales Order
		
		nlapiSetFieldText('orderstatus', 'Pending Fulfillment', true, true);
	
		var payment = nlapiGetFieldText('paymentmethod');
	
		if(payment == 'American Express' || payment == 'VISA / MC'){
			nlapiSetFieldValue('ccapproved', 'T', true, true);
			}
		}
}


function create_cash_sale(type){
	
	var form = nlapiGetFieldValue('customform');
	
	if(form == 152 && type == 'create'){ //only on POS Sales Order Form
	
		var so = nlapiGetRecordId();
		var charge = nlapiGetFieldValue('custbody_sdm_charge_it');
		var payment = nlapiGetFieldText('paymentmethod');
		
		var so_trans = nlapiTransformRecord('salesorder', so, 'cashsale');

		if(payment == 'American Express' || payment == 'VISA / MC'){
		
			if(charge == 'T'){
				so_trans.setFieldValue('ccapproved', 'F');
				so_trans.setFieldValue('chargeit', 'T');
			} else {
				so_trans.setFieldValue('ccapproved', 'T');
				so_trans.setFieldValue('chargeit', 'F');
				}
			}
			
		cash_sale = nlapiSubmitRecord(so_trans, true);
				
		//	var item_full = nlapiTransformRecord('salesorder', so, 'itemfulfillment');
		//	fullfilment = nlapiSubmitRecord(item_full, true);
		}
}


function isEmpty(stValue) {
	//used to identify blank fields
		if (stValue == '' || stValue == null ||stValue == undefined){
			return true;
	    }
			return false;
}
