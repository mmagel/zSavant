/**
 * Copyright NetSuite, Inc. 2013 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * This script will create the button on Customer File record
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Apr 2013     jbucoy		   Initial version
 *
 */
{
	var FLD_MFG_RTG = 'manufacturingrouting';
	
	var BTN_PRODUCTION_TRAVELER = 'custpage_jb_production_traveler_btn';
	
	var PDF_URL = 'https://system.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_jb_production_traveler_pdf&deploy=customdeploy_jb_production_traveler_pdf';
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function productionTravelerBtnBeforeLoad(type, form, request)
{
	if(type == 'view')
	{
//		var idMfgRtg = nlapiGetFieldValue(FLD_MFG_RTG);
//		
//		if(idMfgRtg)
//		{
			var idWO = nlapiGetRecordId();
			var url = PDF_URL + '&id=' + idWO;

			var script = 'window.open(\'' + url + '\');';
			
			form.addButton(BTN_PRODUCTION_TRAVELER, 'Print Production Traveler', script);
//		}
	}
}
