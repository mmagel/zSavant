function customer_fields_mu(recType,recId){
	var results=nlapiSearchRecord('transaction','customsearch767',new nlobjSearchFilter('entity',null,'anyof',recId));
	var pending_approval_nso_ytd=0;
	var pending_fulfillment_nso_ytd=0;
	var shipped_nso_ytd=0;
	var pending_approval_nso_ly=0;
	var pending_fulfillment_nso_ly=0;
	var shipped_nso_ly=0;
	if (results!=null){
		var c=results[0].getAllColumns();
		if (results[0].getValue(c[1])!=null&&results[0].getValue(c[1])!=''){
			pending_approval_nso_ytd=results[0].getValue(c[1]);
		}
		if (results[0].getValue(c[2])!=null&&results[0].getValue(c[2])!=''){
			pending_fulfillment_nso_ytd=results[0].getValue(c[2]);
		}
		if (results[0].getValue(c[3])!=null&&results[0].getValue(c[3])!=''){
			shipped_nso_ytd=results[0].getValue(c[3]);
		}
		if (results[0].getValue(c[4])!=null&&results[0].getValue(c[4])!=''){
			pending_approval_nso_ly=results[0].getValue(c[4]);
		}
		if (results[0].getValue(c[5])!=null&&results[0].getValue(c[5])!=''){
			pending_fulfillment_nso_ly=results[0].getValue(c[5]);
		}
		if (results[0].getValue(c[6])!=null&&results[0].getValue(c[6])!=''){
			shipped_nso_ly=results[0].getValue(c[6]);
		}
	}
	var a=pending_approval_nso_ytd-pending_approval_nso_ly;
	var b=pending_fulfillment_nso_ytd-pending_fulfillment_nso_ly;
	var c=shipped_nso_ytd-pending_approval_nso_ly;
	var d='';
	var e='';
	var f='';
	if (pending_approval_nso_ytd!=0&&pending_approval_nso_ly!=0){
		d=pending_approval_nso_ytd/pending_approval_nso_ly-1;
	}
	if (pending_fulfillment_nso_ytd!=0&&pending_fulfillment_nso_ly!=0){
		e=pending_fulfillment_nso_ytd/pending_fulfillment_nso_ly-1;
	}
	if (shipped_nso_ytd!=0&&shipped_nso_ly!=0){
		f=shipped_nso_ytd/shipped_nso_ly-1;
	}
	nlapiSubmitField(recType,recId,['custentity_sdm_sosub1','custentity_sdm_sosub2','custentity_sdm_invsub1','custentity_sdm_sodiff1','custentity_sdm_sodiff2','custentitysdm__invdiff1'],[a,b,c,d,e,f]);
}