/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Feb 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function check_name_format(){
	var patt=new RegExp('[A-Za-z]+, [A-Za-z]+');
	if (!patt.test(nlapiGetFieldValue('companyname'))){
		alert('Company name must be in this format: Last Name, First Name');
		return false;
	}
    return true;
}
