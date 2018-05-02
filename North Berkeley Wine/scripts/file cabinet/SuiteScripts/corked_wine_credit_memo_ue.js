function credit_memo_before_submit(type){
	if (type=='create'){
		if (nlapiGetFieldValue('customform')==155){
			var inv_adj=nlapiCreateRecord('inventoryadjustment');
			inv_adj.setFieldValue('customer',nlapiGetFieldValue('entity'));
			inv_adj.setFieldValue('department',nlapiGetFieldValue('department'));
			inv_adj.setFieldValue('adjlocation',nlapiGetFieldValue('location'));
			inv_adj.setFieldValue('account',336);
                        inv_adj.setFieldValue('class',2);
			var lines=nlapiGetLineItemCount('item');
			for (var i=1; i<=lines; i++){
				inv_adj.setLineItemValue('inventory','item',i,nlapiGetLineItemValue('item','item',i));
				inv_adj.setLineItemValue('inventory','location',i,nlapiGetFieldValue('location'));
				inv_adj.setLineItemValue('inventory','unitcost',i,
						nlapiSearchRecord('item',null,
								new nlobjSearchFilter('internalid',null,'anyof',nlapiGetLineItemValue('item','item',i)),new nlobjSearchColumn('cost'))[0].getValue('cost'));
				inv_adj.setLineItemValue('inventory','adjustqtyby',i,-parseFloat(nlapiGetLineItemValue('item','quantity',i)));
				
				//inv_adj.setLineItemValue('item','item',i,nlapiGetLineItemValue('item','item',i));
				//inv_adj.setLineItemValue('item','item',i,nlapiGetLineItemValue('item','item',i));
			}
			nlapiSubmitRecord(inv_adj,true,true);
		}
	}
}
