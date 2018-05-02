//status, shipped qty, date, notes
function ship_line_before_load(type,form,request){
	var role=nlapiGetRole();
	if (role==1006){
		var parent=nlapiGetField('custrecord_shipline_parent');
		parent.setDisplayType('inline');
		var item=nlapiGetField('custrecord_shipline_item');
		item.setDisplayType('inline');
		var order_qty=nlapiGetField('custrecord_shipline_qty');
		order_qty.setDisplayType('inline');
		var options=nlapiGetField('custrecord_shipline_options');
		options.setDisplayType('inline');	
		var date_to_ship=nlapiGetField('custrecord_shipline_date');
		date_to_ship.setDisplayType('inline');
	}
	else if (role!=3){
		var status=nlapiGetField('custrecord_shipline_status');
		status.setDisplayType('inline');
		var qty_shipped=nlapiGetField('custrecord_shipline_qty_shipped');
		qty_shipped.setDisplayType('inline');
		var date_actual=nlapiGetField('custrecord_shipline_date_actual');
		date_actual.setDisplayType('inline');
		var notes=nlapiGetField('custrecord_shipline_notes');
		notes.setDisplayType('inline');	
	}
}
function ship_line_field_changed(type,name,linenum){
	if (name='custrecord_shipline_record_status'&&nlapiGetFieldValue(name)==2&&nlapiGetFieldValue('custpage_shipline_date_actual').length==0){
		nlapiSetFieldValue(type,'custrecord_shipline_qty_shipped',nlapiGetFieldValue('custrecord_shipline_qty'));
		nlapiSetFieldValue('custrecord_shipline_date_actual',nlapiDateToString(new Date));
	}
}
function ship_line_before_submit(type){
		if (type!='create'&&type!='delete'){
			var record=nlapiGetNewRecord();
		
			if (record.getFieldValue('custrecord_shipline_record_status')==2){
			//var qty=nlapiLookupField('customrecord_nbi_shipping_line',nlapiGetRecordId(),'custrecord_shipline_qty');
			//nlapiLogExecution('ERROR','asdf',qty);
			//record.setFieldValue('custrecord_shipline_qty_shipped',qty);
				nlapiSubmitField('customrecord_nbi_shipping_line',nlapiGetRecordId(),'custrecord_shipline_qty_shipped',nlapiLookupField('customrecord_nbi_shipping_line',nlapiGetRecordId(),'custrecord_shipline_qty'));
				if (nlapiGetFieldValue('custrecord_shipline_date_actual')==null||nlapiGetFieldValue('custrecord_shipline_date_actual').length==0){
					var date=nlapiDateToString(new Date());
					nlapiSubmitField('customrecord_nbi_shipping_line',nlapiGetRecordId(),'custrecord_shipline_date_actual',date);
					
				}
			}
			
		}
}
