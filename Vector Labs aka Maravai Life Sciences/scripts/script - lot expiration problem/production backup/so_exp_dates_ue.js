function set_lot_exp_dates_so(type){
	if (type=='create'||type=='edit'){
		var rec=nlapiLoadRecord('salesorder',nlapiGetRecordId());
		for (var i=1; i<=nlapiGetLineItemCount('item'); i++){
			var sn=nlapiGetLineItemValue('item','serialnumbers',i);
			if (sn!=''&&sn!=null){
				var exdate=nlapiSearchRecord('inventorynumber',null,new nlobjSearchFilter('inventorynumber',null,'is',sn),new nlobjSearchColumn('expirationdate'));
				if (exdate!=null)
					rec.setLineItemValue('item','custcol_expdate',i,exdate[0].getValue('expirationdate'));
			}
		}
		nlapiSubmitRecord(rec);
	}
}