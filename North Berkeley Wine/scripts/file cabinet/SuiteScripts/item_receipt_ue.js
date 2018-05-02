function item_receipt_after_submit(type){
	var count=nlapiGetLineItemCount('item');
	var array=new Array();
	for (var i=1; i<=count; i++){
		var item=nlapiGetLineItemValue('item','item',i);
		array.push(item);
	}
	var items=nlapiSearchRecord('transaction','customsearch736',new nlobjSearchFilter('item',null,'anyof',array));
	try {
		for (var i=0; items!=null&&i<items.length; i++){
			columns=items[0].getAllColumns();
			var date=items[i].getValue(columns[0]);
			var item=items[i].getValue(columns[1]);
			if (items[i].getText(columns[2]).search('Inventory Item')>-1)
				nlapiSubmitField('inventoryitem',item,'custitem_date_received',date);
		}
	}
	catch(e){
		nlapiLogExecution('ERROR','item received date update error',e.message+' '+nlapiGetRecordId());
	}
}