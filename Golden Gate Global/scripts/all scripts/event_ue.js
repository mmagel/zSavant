function event_before_load(type,form,request){
	form.setScript('customscript50');
	if (type=='view'){
		form.addField('custpage_id','text','').setDisplayType('hidden').setDefaultValue(nlapiGetRecordId());
		form.addField('custpage_create_task','inlinehtml','').setLayoutType('outsideabove').setDefaultValue('<button onclick="document.location=\'https://system.na1.netsuite.com/app/crm/calendar/task.nl?&custpage_event='+nlapiGetRecordId()+'\'; return false;">Create Task</button>');
		
	}
	if (type=='edit'){
		form.addButton('custpage_create_contact_host','Create Contact From Host','create_contact_host()');
		form.addButton('custpage_create_contact_int','Create Contact From Interpreter','create_contact_int()');
	}
	if (type=='create'){
		//nlapiSelectLineItem('attendee',1);
		//nlapiLogExecution('ERROR','1',nlapiGetCurrentLineItemValue('attendee','response'));
		if (nlapiGetUser()!=6204){
			nlapiSelectNewLineItem('attendee');
			nlapiSetCurrentLineItemValue('attendee','attendee',6204,false);
			nlapiSetCurrentLineItemValue('attendee','response','ACCEPTED',false);
			nlapiCommitLineItem('attendee');
		}
	}
}
function create_contact_host(){

	var name=nlapiGetFieldValue('custevent_sdm_third_party_host');
	//alert(name);
	if (name==''){
		alert('The third party host field is empty. No contact can be created.');
	}
	else {
		try {
			var rec=nlapiCreateRecord('contact');
			rec.setFieldValue('subsidiary',1);
			rec.setFieldValue('entityid',name);
			var id=nlapiSubmitRecord(rec);
			nlapiSetFieldValue('custevent_sdm_ev_host',id);
			nlapiSetFieldValue('custevent_sdm_third_party_host','');
			
		}
		catch (e){
			alert(e.message);
		}
	}
}
function create_contact_int(){
	var name=nlapiGetFieldValue('custevent_sdm_other_interpreter_name');
	if (name==''){
		alert('The third party interpreter field is empty. No contact can be created.');
	}
	else {
		try {
			var rec=nlapiCreateRecord('contact');
			rec.setFieldValue('subsidiary',1);
			rec.setFieldValue('entityid',name);
			var id=nlapiSubmitRecord(rec);
			nlapiSetFieldValue('custevent_sdm_interpreter',id);
			nlapiSetFieldValue('custevent_sdm_other_interpreter_name','');
		}
		catch (e){
			alert(e.message);
		}
	}
}
function event_on_save(){
	var host=nlapiGetFieldValue('custevent_sdm_ev_host');
	var host1=nlapiGetFieldValue('custevent_sdm_third_party_host');
	var int=nlapiGetFieldValue('custevent_sdm_interpreter');
	var int1=nlapiGetFieldValue('custevent_sdm_other_interpreter_name');
	var message='';
	if (host==host1&&host==''){
		message+='You must enter a value for either host or third party host. Save Failed.\n';
	}
	if (int==int1&&int==''){
		message+='You must enter a value for either interpreter or third party interpreter. Save Failed.';
	}
	if (message.length>1)
		alert(message);
	return message.length==0;
}