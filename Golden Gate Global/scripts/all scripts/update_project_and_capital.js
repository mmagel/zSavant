function delete_all(recType,recId){
	nlapiDeleteRecord(recType,recId);
}
function set_project_and_adj_capital(recType,recId){
	var rec=nlapiLoadRecord(recType,recId);
	var iid=rec.getFieldValue('custrecord_sdm_is_investor_id');
	var cap_cont=rec.getFieldValue('custrecord_sdm_is_capital_contribution');
	var adm_cont=rec.getFieldValue('custrecord_sdm_is_admin_contributed');
	var adm_paid=rec.getFieldValue('custrecord_sdm_is_admin_paid');
	if (cap_cont!=''&&cap_cont!=null){
		cap_cont=parseFloat(cap_cont);
	}
	else {
		cap_cont=parseFloat(0);
	}
	if (adm_cont!=''&&adm_cont!=null){
		adm_cont=parseFloat(adm_cont);
	}
	else {
		adm_cont=parseFloat(0);
	}
	if (adm_paid!=''&&adm_paid!=null){
		adm_paid=parseFloat(adm_paid);
	}
	else {
		adm_paid=parseFloat(0);
	}
	var beginning=0;
	if (rec.getFieldValue('custrecord_sdm_is_previous_balance')!=''){
		beginning=rec.getFieldValue('custrecord_sdm_is_previous_balance');
	}
	if (cap_cont>0){
		var adj_cap=cap_cont-0+adm_cont-0+adm_paid-0+beginning-0;
		rec.setFieldValue('custrecord_sdm_is_adj_capital',adj_cap);
	}
	var result=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
	if (result!=null)
	rec.setFieldValue('custrecord_sdm_is_project',result[0].getValue('internalid'));
	else
		nlapiLogExecution('ERROR',recId,iid);
	nlapiSubmitRecord(rec);
}
function qis_after_submit(type){
	if (type=='create'){
		try {
	var rec=nlapiLoadRecord('customrecord_sdm_quarterly_statement',nlapiGetRecordId());
	var iid=rec.getFieldValue('custrecord_sdm_is_investor_id');
	var cap_cont=rec.getFieldValue('custrecord_sdm_is_capital_contribution');
	var adm_cont=rec.getFieldValue('custrecord_sdm_is_admin_contributed');
	var adm_paid=rec.getFieldValue('custrecord_sdm_is_admin_paid');
	var tax=rec.getFieldValue('custrecord_sdm_is_fed_tax_withheld');
	if (tax!=null&&tax.length>0&&parseFloat(tax)<0){
		tax=tax*-1;
		rec.setFieldValue('custrecord_sdm_is_fed_tax_withheld',tax);
	}
	if (cap_cont!=''&&cap_cont!=null){
		cap_cont=parseFloat(cap_cont);
	}
	else {
		cap_cont=parseFloat(0);
	}
	if (adm_cont!=''&&adm_cont!=null){
		adm_cont=parseFloat(adm_cont);
	}
	else {
		adm_cont=parseFloat(0);
	}
	if (adm_paid!=''&&adm_paid!=null){
		adm_paid=parseFloat(adm_paid);
	}
	else {
		adm_paid=parseFloat(0);
	}
	var beginning=0;
	if (rec.getFieldValue('custrecord_sdm_is_previous_balance')!=''){
		beginning=rec.getFieldValue('custrecord_sdm_is_previous_balance');
	}
	if (cap_cont>0){
		var adj_cap=cap_cont-0+adm_cont-0+adm_paid-0+beginning-0;
		rec.setFieldValue('custrecord_sdm_is_adj_capital',adj_cap);
	}
	var result=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
	if (result!=null)
	rec.setFieldValue('custrecord_sdm_is_project',result[0].getValue('internalid'));
	else
		nlapiLogExecution('ERROR',recId,iid);
	nlapiSubmitRecord(rec);
		}
		catch(e){
			nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
		}
	}
}