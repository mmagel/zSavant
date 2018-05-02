/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Sep 2014     AHalbleib
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function massUpdate(recType, recId) {
	var line=nlapiLoadRecord(recType,recId);
	var p=line.getFieldValue('custrecord_shipline_parent');
	var customer=nlapiLookupField('customrecord_nbi_shipping',p,'custrecord_ship_customer');
	var transaction=nlapiLookupField('customrecord_nbi_shipping',p,'custrecord_ship_tran');
	nlapiSubmitField(recType,recId,'custrecord_sdm_shipline_customer',customer);
	nlapiSubmitField(recType,recId,'custrecord_sdm_shipline_transaction',transaction);
	var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',customer);
	var column=new nlobjSearchColumn('internalid');
	var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
	if (result!=null){
		nlapiSubmitField(recType,recId,'custrecord_cust_cust',result[0].getValue('internalid'));
	}
}
function cust_field_changed(type,name,linenum){
	if (name=='custpage_list_filter'){
		while (nlapiGetLineItemCount('custpage_list')>1){
			nlapiRemoveLineItem('custpage_list',1);
		}
	}
}
function cust_update(recType,recId){
	
	var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',recId);
	var column=new nlobjSearchColumn('internalid');
	var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
	if (result==null){
		var rec=nlapiLoadRecord(recType,recId);
		var cust=nlapiCreateRecord('customrecord_sdm_cust');
		cust.setFieldValue('name',rec.getFieldValue('entityid'));
		cust.setFieldValue('custrecord_link_id',recId);
		nlapiSubmitRecord(cust);
	}
}
function cust_before_submit(type){
	if (type=='delete'){
		var customer=nlapiGetRecordId();
		var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',customer);
		var column=new nlobjSearchColumn('internalid');
		var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
		if (result!=null){
			nlapiDeleteRecord('customrecord_sdm_cust',result[0].getValue('internalid'));
		}
	}
	if (type=='edit'){
		var recId=nlapiGetRecordId();
		var name=nlapiGetFieldValue('entityid');
		var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',recId);
		var column=new nlobjSearchColumn('internalid');
		var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
		if (result!=null){
			nlapiSubmitField('customrecord_sdm_cust',result[0].getValue('internalid'),'name',name);
		}
		nlapiLogExecution('ERROR','edit',name+' '+recId);
	}
	if (type=='create'||type=='edit'||type=='xedit'){
		
		var lines=nlapiGetLineItemCount('custpage_list');
		var fields=['custrecord_shipline_date','custrecord_shipline_instruction'];
		for (var i=2; i<=lines; i++){
			var values=[nlapiGetLineItemValue('custpage_list','custpage_shipline_date',i),nlapiGetLineItemValue('custpage_list','custpage_shipline_instruction',i)];
			nlapiSubmitField('customrecord_nbi_shipping_line',nlapiGetLineItemValue('custpage_list','custpage_intid',i),fields,values);
		}
	}
}
function cust_after_submit(type){
	if (type=='create'){
		var recId=nlapiGetRecordId();
		var name=nlapiGetFieldValue('entityid');
		var cust=nlapiCreateRecord('customrecord_sdm_cust');
		cust.setFieldValue('name',name);
		cust.setFieldValue('custrecord_link_id',recId);
		nlapiSubmitRecord(cust);
		nlapiLogExecution('ERROR','create',name+' '+recId);
	}
if (type=='create'||type=='edit'){
var lasttrandate=nlapiSearchRecord('transaction','customsearch744',new nlobjSearchFilter('entity',null,'anyof',nlapiGetRecordId()));
	  if (lasttrandate!=null){
		  var cols=lasttrandate[0].getAllColumns();
		  var lastdate=lasttrandate[0].getValue(cols[1]);
		  nlapiSubmitField('customer',nlapiGetRecordId(),'custentity_last_order_date',lastdate);
	  }
}
}
function cust_before_load(type, form, request){
	if (type=='edit'||type=='view'){
		//var role=nlapiGetRole();
		//var context=nlapiGetContext();
		//var ship_role=context.getSetting('SCRIPT','custscript_sdm_shipping_role');
		//var filter=form.addField('custpage_list_filter','multiselect','Record Status','customlist_ship_status_list','sales').setDefaultValue(1);
		var sublist=form.addSubList('custpage_list','list','NBI Shipping Items','sales');
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
		var tran_field=sublist.addField('custpage_shipline_tran','text','').setDisplayType('hidden');
		//var notes_field=sublist.addField('custpage_shipline_notes','text','Notes').setDisplayType('entry');
		
		
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_sdm_shipline_customer',null,'is',nlapiGetRecordId()));
		filters.push(new nlobjSearchFilter('custrecord_shipline_record_status',null,'is',1));
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
			sublist.setLineItemValue('custpage_shipline_tran',i+2,results[i].getValue('custrecord_sdm_shipline_transaction') );
		}		
		
		item_field.setDisplayType('inline');
		qty_field.setDisplayType('inline');
		setloc_field.setDisplayType('inline');
		status_field.setDisplayType('inline');
		inst_field.setDisplayType('entry');
		qty_shipped_field.setDisplayType('inline');
		rec_status_field.setDisplayType('inline');
		date_actual_field.setDisplayType('inline');
		//notes_field.setDisplayType('entry');
		date_field.setDisplayType('entry');
	}
}