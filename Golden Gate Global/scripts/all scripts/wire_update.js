function update_wires(recType,recId){
	var fields=nlapiLookupField(recType,recId,['custrecord_wire_iid','custrecord_wire_acct_num']);
	if (fields.custrecord_wire_iid==''||fields.custrecord_wire_acct_num==''){
		
	}
	else {
		try {
		//var aiq=nlapiSearchRecord('opportunity',null,new nlobjSearchFilter('custbody_investor_id',null,'is',fields.custrecord_wire_iid),new nlobjSearchColumn('internalid'));
		
		//aiq=aiq[0].getValue('internalid');
		var job=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',fields.custrecord_wire_iid),new nlobjSearchColumn('internalid'));
		job=job[0].getValue('internalid');

		try {
			//nlapiSubmitField(recType,recId,['custrecord_wire_project','custrecord_wire_aiq'],[job,aiq]);
			nlapiSubmitField(recType,recId,['custrecord_wire_project'],[job]);
		}
		catch (e){
			nlapiLogExecution('ERROR',fields.custrecord_wire_iid,e.message);
		}
		try {
			nlapiSubmitField('job',job,'custentity_bec','T');
		}
		catch (e){
			nlapiLogExecution('ERROR','job'+fields.custrecord_wire_iid,e.message);
		}
		}
		catch(e){
			nlapiLogExecution('ERROR','surrounding'+fields.custrecord_wire_iid,e.message);
		}
	}
}