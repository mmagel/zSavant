/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
//1 investor 2 company
function vendor_before_submit(type){
	if (type=='create' && nlapiGetFieldValue('customform')==8){
		var cust=nlapiLoadRecord('customer',nlapiGetFieldValue('custentity_sdm_related_cust'));
		if (nlapiGetFieldValue('customform')==8 &&cust.getFieldValue('entitystatus')!=15){
			
			cust.setFieldValue('entitystatus',15);
			cust.setFieldValue('custentity_sdm_latest_status_change',nlapiDateToString(new Date()));
			var lead=cust.getFieldValue('custentity213');
			var lead2=cust.getFieldValue('custentity214');
			var status=cust.getFieldText('entitystatus');
			


					nlapiSendEmail(nlapiGetUser(),['bwu@3gfund.com','jbian@3gfund.com'],'Customer Status Updated- '+cust.getFieldValue('companyname'),'Hi '+
							cust.getFieldText('custentity213')+', \n The status for this customer has been updated.\n'
							+'Status: '+status);

			nlapiSubmitRecord(cust);
		}
	}
}