/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Oct 2015     CBlaisure_2
 *
 * This mass update is used to send Automated collection notices based on various days from due date
 * This is used in conjunction with inv_dunning_client.js to validate field values
 *
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function send_collections(recType, recId) {
//Function is used to facilitate the send of a collections (dunning) email via a mass update

try{
	var inv = nlapiLoadRecord(recType, recId);
	//exit if not active	
	var collect_status = inv.getFieldValue('custbody_dunning_status_list'); 
		if(collect_status == 1 || collect_status == 8){
			return;
			}
	//If amount due is less than threshold ($10), accepted it as collected and close
	var amt_due = Number(inv.getFieldValue('amountremainingtotalbox'));
		if(amt_due < 10 || isEmpty(amt_due)){
			nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 8, false); //update status
			return;
		}

	nlapiLogExecution('ERROR', 'Start New Collection', '<-------'+ inv.getFieldValue('transactionnumber') + '-------------->');		
	//get parameters	
	var temp_5_before = nlapiGetContext().getSetting('SCRIPT', 'custscript_5_day_notice');
	var temp_5_after = nlapiGetContext().getSetting('SCRIPT', 'custscript_5_past_due');
	var temp_15_after = nlapiGetContext().getSetting('SCRIPT', 'custscript_15_past_due');
	var temp_30_after = nlapiGetContext().getSetting('SCRIPT', 'custscript_30_past_due');
	var temp_45_after = nlapiGetContext().getSetting('SCRIPT', 'custscript_45_past_due');
	var from_employee = nlapiGetContext().getSetting('SCRIPT', 'custscript_from_email');
	var bcc_global_copy = nlapiGetContext().getSetting('SCRIPT', 'custscript_bcc_global_copy');
	
	//calculate days from transaction due date
	var due = inv.getFieldValue('duedate');
		due = nlapiStringToDate(due, 'datetime');
		due = parseFloat(due.getTime());
	var today = parseFloat(new Date().getTime());
	var days_old = Math.round((due - today)/(24*60*60*1000));
	
	//get send to fields
	var send_to = inv.getFieldValue('custbody_dunning_to_email');
	if(isEmpty(send_to)){ //error check (should already be in right email format)
		throw nlapiCreateError('Collections Error', 'To Email address is blank', true);
		}
	
	//Multiple CC fields need to be in an array
	var send_cc = inv.getFieldValue('custbody_dunning_cc_email');
	if(!(isEmpty(send_cc))){	
		send_cc = send_cc.toString().split(';');
		}
	
	//add in functionality for always bcc email address regardless if there is a defined BCC or not.
	var send_bcc = inv.getFieldValue('custbody_dunning_bcc_email');
	if(isEmpty(send_bcc)){
		if(!(isEmpty(bcc_global_copy))){ 
			send_bcc = bcc_global_copy;
			} else if(!(isEmpty(bcc_global_copy))){
				send_bcc += ';' + bcc_global_copy;
				} 
		}
		if(!(isEmpty(send_bcc))){ //BCC requires an array and not string, therefore split
			send_bcc = send_bcc.split(';');
			}
	
	//define records to attach email to transaction/entity
	var records = new Object();
		records['transaction'] = recId;
		records['entity'] = nlapiGetFieldValue('customer');
		
	var attach_me = nlapiPrintRecord('TRANSACTION', recId, 'PDF', null);
	
	//Handle each case of aging differently
	switch (days_old){
	case 5: //send 5 day notice
		var email_merge = nlapiCreateEmailMerger(temp_5_before);
		email_merge.setTransaction(recId);
		var mergeResult = email_merge.merge(); 
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
		nlapiSendEmail(from_employee, send_to, emailSubject, emailBody,send_cc,send_bcc,records,attach_me,true,null);
		nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 3, false); //update status
		break;
	case -5: //Send 5 day late
		var email_merge = nlapiCreateEmailMerger(temp_5_after);
		email_merge.setTransaction(recId);
		var mergeResult = email_merge.merge(); 
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
		nlapiSendEmail(from_employee, send_to, emailSubject, emailBody,send_cc,send_bcc,records,attach_me,true,null);
		nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 4, false); //update status
		break;
	case -15: //15 day notice
		var email_merge = nlapiCreateEmailMerger(temp_15_after);
		email_merge.setTransaction(recId);
		var mergeResult = email_merge.merge(); 
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
		nlapiSendEmail(from_employee, send_to, emailSubject, emailBody,send_cc,send_bcc,records,attach_me,true,null);
		nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 5, false); //update status
		break;
	case -30: //30 day notice
		var email_merge = nlapiCreateEmailMerger(temp_30_after);
		email_merge.setTransaction(recId);
		var mergeResult = email_merge.merge(); 
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
		
		//Add sales rep to notice
		var rep = inv.getFieldValue('salesrep');
		if(!(isEmpty(rep))){
			var rep_email = nlapiLookupField('employee', inv.getFieldValue('salesrep'), 'email', false);
			if(!(isEmpty(rep_email))){
				if(isEmpty(send_cc)){
					send_cc = rep_email;
					} else {
						send_cc.push(rep_email);
					}
				}
			}
		nlapiSendEmail(from_employee, send_to, emailSubject, emailBody,send_cc,send_bcc,records,attach_me,true,null);
		nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 6, false); //update status
		break;
	case -45: //45 day notice
		var email_merge = nlapiCreateEmailMerger(temp_45_after);
		email_merge.setTransaction(recId);
		var mergeResult = email_merge.merge(); 
		var emailSubject = mergeResult.getSubject();
		var emailBody = mergeResult.getBody();
	
		//Add sales rep to notice
		var rep_email = nlapiLookupField('employee', inv.getFieldValue('salesrep'), 'email', false);
		if(!(isEmpty(rep_email))){
			if(isEmpty(send_cc)){
				send_cc = rep_email;
				} else {
					send_cc.push(rep_email);
					}
			}
		//Suppress notification until further notice.
		//nlapiSendEmail(from_employee, send_to, emailSubject, emailBody,send_cc,send_bcc,records,attach_me,true,null);
		//nlapiSubmitField('invoice', recId, 'custbody_dunning_status_list', 7, false); //update status
		break;
	default: //Does not hit milestone days
		//currently in collections but no actions required
		break;
		}
} catch(e){
	nlapiLogExecution('ERROR', 'Error Start', '<-------'+ inv.getFieldValue('transactionnumber') + '-------------->');	
	nlapiLogExecution('ERROR', 'days_old', days_old);
	nlapiLogExecution('ERROR', 'amt_due', amt_due);
	nlapiLogExecution('ERROR', 'send_to', send_to);
	nlapiLogExecution('ERROR', 'send_cc', send_cc);
	nlapiLogExecution('ERROR', 'send_bcc', send_bcc);
	nlapiLogExecution('ERROR', 'Collect Status', collect_status);
	nlapiLogExecution('ERROR', 'Error', e.message);

	//	throw nlapiCreateError('Collection Error', e.message, false);
	}
}

function isEmpty(stValue) {
	//used to identify blank fields
		if ((stValue == '') || (stValue == null) ||(stValue == undefined)) {
			return true;
	    	}
	    return false;
	}