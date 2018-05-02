function set_to_send(recType,recId){
var iid=nlapiLookupField('customrecord_sdm_quarterly_statement',recId,'custrecord_sdm_is_investor_id');
	var job=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
nlapiLogExecution('ERROR','Investor id',iid);
var id=job[0].getValue('internalid');
	nlapiSubmitField('job',id,'custentity_send_datareq','T');
}