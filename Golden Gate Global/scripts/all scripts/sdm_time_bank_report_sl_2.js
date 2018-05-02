function delete_all(recType,recId){
	nlapiDeleteRecord(recType,recId);
//nlapiAttachRecord('file',11807,recType,recId);
}
function set_project_and_adj_capital(recType,recId){
	var rec=nlapiLoadRecord(recType,recId);
	var iid=rec.getFieldValue('custrecord_sdm_is_investor_id');
	var cap_cont=rec.getFieldValue('custrecord_sdm_is_investor_id');
	var adm_cont=rec.getFieldValue('custrecord_sdm_is_investor_id');
	var adm_paid=rec.getFieldValue('custrecord_sdm_is_investor_id');
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
	if (cap_cont>0){
		var adj_cap=cap_cont+adm_cont+adm_paid;
		rec.setFieldValue('custrecord_sdm_is_adj_capital',adj_cap);
	}
	var result=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
	rec.setFieldValue('custrecord_sdm_is_project',result[0].getValue('internalid'));
	nlapiSubmitRecord(rec);
}