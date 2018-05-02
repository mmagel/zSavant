/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Oct 2015     CBlaisure_2
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord invoice
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function validate_field(type, name, linenum){
	//validate collection email address fields
	if(name == 'custbody_dunning_to_email' || name == 'custbody_dunning_cc_email' || name == 'custbody_dunning_bcc_email'){
		var email_str = nlapiGetFieldValue(name);
		//email_str = email_str.replace(/\s/g, ''); if you need to remove whitespace for email send.
		if(isEmpty(email_str)==false && test_emails(email_str) == false){
			alert('One or more email addresses entered are not valid');
			return false;
			}
	}
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord invoice
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	//check on Collection Email Fields.
	var col_status = nlapiGetFieldValue('custbody_dunning_status_list');	
	if(isEmpty(col_status)==false && !(col_status==1 || col_status==8)){
		var cc_email = nlapiGetFieldValue('custbody_dunning_cc_email');
		var bcc_email = nlapiGetFieldValue('custbody_dunning_bcc_email');
		var to_email = nlapiGetFieldValue('custbody_dunning_to_email');		
		
		if(isEmpty(to_email)){ //must have to address
			var cus_email = nlapiLookupField('entity', nlapiGetFieldValue('entity'), 'email'); //default to billing address if present
			if(isEmpty(cus_email)){
				alert('"COLLECT SEND TO:" Email address cannot be blank');
				return false;
				} else {
					to_email = cus_email;
					nlapiSetFieldValue('custbody_dunning_to_email', cus_email);
					}
				}
		if(isEmpty(to_email)==false && test_emails(to_email)==false){ //check syntax
			alert('One or more email addresses in "COLLECT SEND TO:" were not valid');
			return false;
			}
		if(isEmpty(cc_email)==false && test_emails(cc_email)==false){ //check syntax
			alert('One or more email addresses in "COLLECT SEND CC:" were not valid');
			return false;
			}
		if(isEmpty(bcc_email)==false && test_emails(bcc_email)==false){ //check syntax
			alert('One or more email addresses in "COLLECT SEND BCC:" were not valid');
			return false;
			}
		}
 return true;
}

function test_emails(email_str){
//Test a string for with 1 or more email addresses separated by ; for proper email syntax. No spaces allowed.
//email regular expression
var reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
//Support for 1 or more email addresses
	if(email_str.search(";")>0){
		//multiple email address
		email_ray = email_str.split(';');
		for (var i = 0; i < email_ray.length; i++) {
			if(!(reg.test(email_ray[i]))){
				return false;
					} 	
				}			
		} else {
		//1 email address
		if(!(reg.test(email_str))){
				return false;
					} 	
				}
	return true;
}


function isEmpty(stValue) {
	//used to identify blank fields
		if ((stValue == '') || (stValue == null) ||(stValue == undefined)) {
			return true;
	    	}
	    return false;
	}