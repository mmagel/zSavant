function ship_record_before_load(type, form, request){
	
	if (type=='edit' || type=='view'){
nlapiLogExecution('ERROR','Type',type);
		var role=nlapiGetRole();
		var context=nlapiGetContext();
		var ship_role=context.getSetting('SCRIPT','custscript_sdm_shipping_role');
		var sublist=form.addSubList('custpage_list','list','Items','custom');
		sublist.addField('custpage_intid','integer','').setDisplayType('hidden');
		if (type=='edit'){
			var text=sublist.addField('custpage_text','text','');
		}
		var item_field=sublist.addField('custpage_shipline_item','select','Item','item');
		var qty_field=sublist.addField('custpage_shipline_qty','integer','Quantity');
		var setloc_field=sublist.addField('custpage_shipline_setloc','select','Set Location','customlist_sdm_set_location');
		var date_field=sublist.addField('custpage_shipline_date','date','Planned Ship Date');
		var inst_field=sublist.addField('custpage_shipline_instruction','select','Ship Instruction','customlist_sdm_ship_instruction');
		var status_field=sublist.addField('custpage_shipline_status','select','Item Status','customlist_ship_status_line_list');
		var rec_status_field=sublist.addField('custpage_shipline_record_status','select','Record Status','customlist_ship_status_list');
		var qty_shipped_field=sublist.addField('custpage_shipline_qty_shipped','text','Quantity Shipped');
		var date_actual_field=sublist.addField('custpage_shipline_date_actual','date','Actual Ship Date');
		//var notes_field=sublist.addField('custpage_shipline_notes','text','Notes').setDisplayType('entry');
		
		
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_shipline_parent',null,'is',nlapiGetRecordId()));
		var columns=new Array();
		columns.push(new nlobjSearchColumn('internalid'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_item'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_qty'));
		columns.push(new nlobjSearchColumn('custrecord_sdm_set_location'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_date'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_status'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_instruction'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_record_status'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_qty_shipped'));
		columns.push(new nlobjSearchColumn('custrecord_shipline_date_actual'));
		//columns.push(new nlobjSearchColumn('custrecord_shipline_notes'));
		var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,columns);
		if (type=='edit'){
			sublist.setLineItemValue('custpage_text',1,'Use this line to set all fields.\n Save to confirm line level changes.');
		}
		sublist.setLineItemValue('custpage_shipline_item',1,'' );
		sublist.setLineItemValue('custpage_shipline_qty',1,'');
		sublist.setLineItemValue('custpage_shipline_setloc',1,'');
		sublist.setLineItemValue('custpage_shipline_date',1,'' );
		sublist.setLineItemValue('custpage_shipline_instruction',1,'' );
		sublist.setLineItemValue('custpage_shipline_status',1,'' );
		sublist.setLineItemValue('custpage_shipline_record_status',1,'' );
		sublist.setLineItemValue('custpage_shipline_qty_shipped',1,'' );
		sublist.setLineItemValue('custpage_shipline_date_actual',1,'' );
		for (var i=0; results!=null && i<results.length; i++){
			sublist.setLineItemValue('custpage_intid',i+2, results[i].getValue('internalid'));
			sublist.setLineItemValue('custpage_shipline_item',i+2,results[i].getValue('custrecord_shipline_item') );
			sublist.setLineItemValue('custpage_shipline_qty',i+2,results[i].getValue('custrecord_shipline_qty'));
			sublist.setLineItemValue('custpage_shipline_setloc',i+2,results[i].getValue('custrecord_sdm_set_location'));
			sublist.setLineItemValue('custpage_shipline_date',i+2,results[i].getValue('custrecord_shipline_date') );
			sublist.setLineItemValue('custpage_shipline_instruction',i+2,results[i].getValue('custrecord_shipline_instruction') );
			sublist.setLineItemValue('custpage_shipline_status',i+2,results[i].getValue('custrecord_shipline_status') );
			sublist.setLineItemValue('custpage_shipline_record_status',i+2,results[i].getValue('custrecord_shipline_record_status') );
			sublist.setLineItemValue('custpage_shipline_qty_shipped',i+2,results[i].getValue('custrecord_shipline_qty_shipped') );
			sublist.setLineItemValue('custpage_shipline_date_actual',i+2,results[i].getValue('custrecord_shipline_date_actual') );
			//sublist.setLineItemValue('custpage_shipline_notes',i+1,results[i].getValue('custrecord_shipline_notes') );
		}		
		
				item_field.setDisplayType('inline');
				qty_field.setDisplayType('inline');
				inst_field.setDisplayType('entry');
				setloc_field.setDisplayType('entry');
				status_field.setDisplayType('entry');
				rec_status_field.setDisplayType('entry');
				if (type=='edit'){
					qty_shipped_field.setDisplayType('entry');
				}
				else {
					qty_shipped_field.setDisplayType('normal');
				}
				date_actual_field.setDisplayType('entry');
				//notes_field.setDisplayType('entry');
				date_field.setDisplayType('entry');
			//form.setScript(101);
			form.addButton('custpage_reset','Regenerate','if (!confirm(\'Are you sure you want to delete all existing shipping line records for this sales order and generate new ones?\')){return false;}else {document.location=\'https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=112&deploy=1&custpage_id='+nlapiGetRecordId()+'\';} ');
	}	
}
function regenerate(){
	var run=confirm('Are you sure you want to delete all existing shipping line records for this sales order and generate new ones?'); 
	if (run==false)
	{
		return false;
		}
	else {
		
		}
}
function ship_record_before_submit(type){
	if (type=='create'||type=='edit'||type=='xedit'){
		so=nlapiLoadRecord('salesorder',nlapiGetFieldValue('custrecord_ship_tran'));
		so.setFieldValue('custbody_sdm_ship_status',nlapiGetFieldValue('custrecord_ship_status'));
		nlapiSubmitRecord(so);
		var shipped=nlapiGetFieldValue('custrecord_ship_status');
		var s=true;
		var lines=nlapiGetLineItemCount('custpage_list');
		var fields=['custrecord_shipline_item','custrecord_shipline_qty','custrecord_shipline_date','custrecord_shipline_status','custrecord_shipline_qty_shipped','custrecord_shipline_instruction','custrecord_shipline_date_actual','custrecord_shipline_record_status','custrecord_sdm_set_location'];
		for (var i=2; i<=lines; i++){
			var qty_act=nlapiGetLineItemValue('custpage_list','custpage_shipline_qty_shipped',i);
			var date_act=nlapiGetLineItemValue('custpage_list','custpage_shipline_date_actual',i);
			var status=nlapiGetLineItemValue('custpage_list','custpage_shipline_status',i);
			var qty=nlapiGetLineItemValue('custpage_list','custpage_shipline_qty',i);
			var rec_stat=nlapiGetLineItemValue('custpage_list','custpage_shipline_record_status',i);
			var inst=nlapiGetLineItemValue('custpage_list','custpage_shipline_instruction',i);
			if (qty_act==qty){
				nlapiLogExecution('ERROR','here','1');
				//var qty=nlapiGetLineItemValue('custpage_list','custpage_shipline_qty',i);
				//qty_act=qty;
				if (date_act==null||date_act.length==0){
					date_act=nlapiDateToString(new Date());
				}
				
				nlapiLogExecution('ERROR','here','2');
				
			}
			else if (qty_act>0&&qty_act!=qty){
				//split lines, defaulting new line to open with the difference
				var new_quant=qty-qty_act;
				qty=qty_act;
				var record=nlapiCopyRecord('customrecord_nbi_shipping_line',nlapiGetLineItemValue('custpage_list','custpage_intid',i));
				record.setFieldValue('custrecord_shipline_qty',new_quant);
				record.setFieldValue('custrecord_shipline_record_status',1);
				record.setFieldValue('custrecord_shipline_qty_shipped',0);
				record.setFieldValue('custrecord_shipline_date_actual','');
				nlapiSubmitRecord(record);
			}
			var values=[nlapiGetLineItemValue('custpage_list','custpage_shipline_item',i),qty,
			            nlapiGetLineItemValue('custpage_list','custpage_shipline_date',i),status,qty_act,inst,
			            date_act,rec_stat,nlapiGetLineItemValue('custpage_list','custpage_shipline_setloc',i)];
			nlapiSubmitField('customrecord_nbi_shipping_line',nlapiGetLineItemValue('custpage_list','custpage_intid',i),fields,values);
		}
	}
	if (type=='delete'){
		if (nlapiLookupField('salesorder',nlapiGetFieldValue('custrecord_ship_tran'),'custbody_sdm_shipping_record_num')==nlapiGetRecordId()){
			nlapiSubmitField('salesorder',nlapiGetFieldValue('custrecord_ship_tran'),'custbody_sdm_shipping_record_num','');
			nlapiSubmitField('salesorder',nlapiGetFieldValue('custrecord_ship_tran'),'custbody_sdm_shipped','F');
		}
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_shipline_parent',null,'is',nlapiGetRecordId()));
		var columns=new Array();
		columns.push(new nlobjSearchColumn('internalid'));
		var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,columns);
		for (var i=0; results!=null&&i<results.length; i++){
			nlapiDeleteRecord('customrecord_nbi_shipping_line',results[i].getValue('internalid'));
		}
	}
}
function ship_record_field_changed(type,name,linenum){
	if (type=='custpage_list'&&linenum=='1'){
		var value=nlapiGetLineItemValue(type,name,linenum);
		var lines=nlapiGetLineItemCount('custpage_list');
		var stat='custpage_shipline_record_status';
		for (var i=2; i<=lines; i++){
			nlapiSetLineItemValue(type,name,i,value);
			if (name==stat&&value==2&&nlapiGetLineItemValue(type,'custpage_shipline_date_actual',i).length==0){
				nlapiSetLineItemValue(type,'custpage_shipline_qty_shipped',i,nlapiGetLineItemValue(type,'custpage_shipline_qty',i));
				nlapiSetLineItemValue(type,'custpage_shipline_date_actual',i,nlapiDateToString(new Date));
			}
		}
	}
		if (name=='custpage_list_filter'){
			while (nlapiGetLineItemCount('custpage_list')>1){
				nlapiRemoveLineItem('custpage_list',1);
			}
		}
	
	if (type=='custpage_list'&&linenum!='1'&&name=='custpage_shipline_record_status'){
		if (nlapiGetLineItemValue(type,name,linenum)==2&&nlapiGetLineItemValue(type,'custpage_shipline_date_actual',linenum).length==0){
			nlapiSetLineItemValue(type,'custpage_shipline_qty_shipped',linenum,nlapiGetLineItemValue(type,'custpage_shipline_qty',linenum));
			nlapiSetLineItemValue(type,'custpage_shipline_date_actual',linenum,nlapiDateToString(new Date));
		}
	}
}
function regenerate_ship_record(request,response){
	if (request.getMethod()=='GET'){
		var ship_id=request.getParameter('custpage_id');
		var ship_rec=nlapiLoadRecord('customrecord_nbi_shipping',ship_id);
		var tran_id=ship_rec.getFieldValue('custrecord_ship_tran');
		var transaction=nlapiLoadRecord('salesorder',tran_id);
		var instruction=transaction.getFieldValue('custbody_sdm_ship_instruction');

		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_shipline_parent',null,'is',ship_id));
		var columns=new Array();
		columns.push(new nlobjSearchColumn('internalid'));
		var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,columns);
		for (var i=0; results!=null &&i<results.length; i++){
			nlapiDeleteRecord('customrecord_nbi_shipping_line',results[i].getValue('internalid'));
		}
		var customer=transaction.getFieldValue('entity');
		var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',customer);
		var column=new nlobjSearchColumn('internalid');
		var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
		var cust='';
		if (result!=null){
			cust=result[0].getValue('internalid');
		}
		var lines=transaction.getLineItemCount('item');
		for (var i=1; i<=lines; i++){
			var ship_line=nlapiCreateRecord('customrecord_nbi_shipping_line');
			ship_line.setFieldValue('custrecord_shipline_parent',ship_id);
			ship_line.setFieldValue('custrecord_shipline_item',transaction.getLineItemValue('item','item',i));
			ship_line.setFieldValue('custrecord_shipline_qty',transaction.getLineItemValue('item','quantity',i));
			var stat=nlapiLookupField('item',transaction.getLineItemValue('item','item',i),'custitem_sdm_pending_prearr');
			if (stat=='T'){
				ship_line.setFieldValue('custrecord_shipline_status',1);
			}
			else {
				ship_line.setFieldValue('custrecord_shipline_status','');
			}
			ship_line.setFieldValue('custrecord_shipline_record_status','1');
			ship_line.setFieldValue('custrecord_shipline_qty_shipped','0');
			ship_line.setFieldValue('custrecord_shipline_date',transaction.getFieldValue('shipdate'));
			ship_line.setFieldValue('custrecord_shipline_instruction',instruction);
			ship_line.setFieldValue('custrecord_cust_cust',cust);
			ship_line.setFieldValue('custrecord_sdm_shipline_customer',customer);
			ship_line.setFieldValue('custrecord_sdm_shipline_transaction',tran_id);
			nlapiSubmitRecord(ship_line);
		} 
		nlapiSetRedirectURL('RECORD','customrecord_nbi_shipping',ship_id,false);
	}
}