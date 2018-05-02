function reset(){
	nlapiLogExecution('ERROR','1','1');
	var a='123';
	alert('1');
	nlapiLogExecution('ERROR','2','2');
	var ship_rec=nlapiLoadRecord('customrecord_nbi_shipping',nlapiGetRecordId());
	var tran_id=ship_rec.getFieldValue('custrecord_ship_tran');
	alert('here');
	nlapiLogExecution('ERROR','3','3');
	var filters=new Array();
	filters.push(new nlobjSearchFilter('custrecord_shipline_parent',null,'is',nlapiGetRecordId()));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('internalid'));
	var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,columns);
	alert('here');
	for (var i=0; results!=null &&i<results.length; i++){
		nlapiDeleteRecord('customrecord_nbi_shipping_line',results[i].getValue('internalid'));
	}
	alert(i);
	var transaction=nlapiLoadRecord('salesorder',tran_id);
	var lines=transaction.getLineItemCount('item');
	for (var i=1; i<=lines; i++){
		var ship_line=nlapiCreateRecord('customrecord_nbi_shipping_line');
		ship_line.setFieldValue('custrecord_shipline_parent',nlapiGetRecordId());
		ship_line.setFieldValue('custrecord_shipline_item',transaction.getLineItemValue('item','item',i));
		ship_line.setFieldValue('custrecord_shipline_qty',transaction.getLineItemValue('item','quantity',i));
		ship_line.setFieldValue('custrecord_shipline_options',transaction.getLineItemValue('item','options',i));
		ship_line.setFieldValue('custrecord_shipline_date',transaction.getFieldValue('shipdate'));
		//ship_line.setFieldValue('custrecord_shipline_status',nlapiGetLineItemValue('item','item',i));
		//ship_line.setFieldValue('custrecord_shipline_qty_shipped',nlapiGetLineItemValue('item','item',i));
		//ship_line.setFieldValue('custrecord_shipline_date_actual',transaction.getFieldValue('actualshipdate'));
		//ship_line.setFieldValue('custrecord_shipline_notes',nlapiGetLineItemValue('item','item',i));
		nlapiSubmitRecord(ship_line);
	}
}