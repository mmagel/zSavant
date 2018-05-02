function set_account_number(type,name,linenum){
	if (name=='entity'){
		var cust=nlapiGetFieldValue(name);
		if (cust!=null&&cust.length>0){
			try {
				var rec=nlapiLoadRecord('customer',cust);
				var acct=rec.getFieldValue('thirdpartyacct');
				nlapiSetFieldValue('custbody_3prtyship_',acct);
			}
			catch(e) {
				
			}
		}
		else {
			nlapiSetFieldValue('custbody_3prtyship_','');
		}
	}
}