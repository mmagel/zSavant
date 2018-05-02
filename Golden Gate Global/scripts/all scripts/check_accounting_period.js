function transaction_before_load(type,form,request){
	if (nlapiGetRole()!=1021&&nlapiGetFieldValue('trandate')!=null&&nlapiGetFieldValue('trandate')!=''&&type=='edit'){
		var period=nlapiSearchRecord('accountingperiod','customsearch324',
				[new nlobjSearchFilter('startdate',null,'onorbefore',nlapiGetFieldValue('trandate')),
				 new nlobjSearchFilter('enddate',null,'onorafter',nlapiGetFieldValue('trandate'))],
				 [new nlobjSearchColumn('periodname'),
				 new nlobjSearchColumn('alllocked')]);

		if (period!=null&&period[0].getValue('alllocked')=='T'){
			throw 'Your role is not authorized to create or edit transactions in the period '+period[0].getValue('periodname')+' because it is Locked.';
		}
	}
}


function transaction_before_submit(type){
	if (nlapiGetRole()!=1021&&nlapiGetFieldValue('trandate')!=null&&nlapiGetFieldValue('trandate')!=''&&(type=='create'||type=='edit')){
		var period=nlapiSearchRecord('accountingperiod','customsearch324',
				[new nlobjSearchFilter('startdate',null,'onorbefore',nlapiGetFieldValue('trandate')),
				 new nlobjSearchFilter('enddate',null,'onorafter',nlapiGetFieldValue('trandate'))],
				 [new nlobjSearchColumn('periodname'),
				 new nlobjSearchColumn('alllocked')]);

		if (period!=null&&period[0].getValue('alllocked')=='T'){
			throw 'Your role is not authorized to create or edit transactions in the period '+period[0].getValue('periodname')+' because it is Locked.';
		}
	}
}
//enddate
//startdate
//periodname
//alllocked
//accountingperiod
