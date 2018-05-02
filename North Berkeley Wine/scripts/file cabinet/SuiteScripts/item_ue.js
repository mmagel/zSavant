/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Sep 2014     AHalbleib
 *
 */


function item_before_load(type, form, request){
	if (nlapiGetRole()==1006){
		var array=['weight','shippackage','quantitypricingschedule',
		           'pricinggroup','overallquantitypricingtype','costestimatetype','costestimate','minimumquantity',
		           'shipindividually','shippingcost','handlingcost','usemarginalrates',
		           'salesdescription','shippingcostunits','handlingcostunits','costunits','weightunit','weightunits','saleunit','unitstype'];
		
		for (var i=0; i<array.length; i++){
			field=form.getField(array[i]);
			if (field!=null){
				field.setDisplayType('hidden');
			}
		}
		form.getSubList('price1').setDisplayType('hidden');
		form.getSubList('price2').setDisplayType('hidden');
		form.getSubList('price3').setDisplayType('hidden');
		form.getSubList('price4').setDisplayType('hidden');
	}
	if (type=='copy'){
		var fields=nlapiGetContext().getSetting('SCRIPT', 'custscript_field_clear_on_copy');
		if (fields!=null&&fields!=''){
			fields=fields.split(',');
			for (var i=0;i<fields.length;i+=2){
				nlapiLogExecution('ERROR',i,fields[i+1]);
				var field=form.getField(fields[i+1]);
				if (field!=null){
					if (field.getType()=='checkbox')
					field.setDefaultValue('F');
					else
					field.setDefaultValue('');
				}
				
			}
		}
	}
}


function item_before_submit(type){
if (nlapiGetRecordType()=='inventoryitem'&&type=='edit'){
		var items=nlapiSearchRecord('transaction','customsearch736',new nlobjSearchFilter('item',null,'anyof',nlapiGetRecordId()));
		try {
			for (var i=0; items!=null&&i<items.length; i++){
				columns=items[0].getAllColumns();
				var date=items[i].getValue(columns[0]);
				var item=items[i].getValue(columns[1]);
				if (items[i].getText(columns[2]).search('Inventory Item')>-1)
					nlapiSetFieldValue('custitem_date_received',date);
			}
		}
		catch(e){
			nlapiLogExecution('ERROR','item received date update error',e.message+' '+nlapiGetRecordId());
		}
}
}


function item_after_submit(type){
 
  var filters=new Array();
  try {
  if (type=='create'||type=='edit'){
	  var res=nlapiSearchRecord(null,'customsearch737',new nlobjSearchFilter('internalid',null,'anyof',nlapiGetRecordId()));


	  
		  var cols=res[0].getAllColumns();
		  var btg=res[0].getValue(cols[1]);
		  nlapiSubmitField('inventoryitem',nlapiGetRecordId(),'custitem56',btg);
	 
	  var purchased=nlapiSearchRecord('transaction','customsearch745',new nlobjSearchFilter('item',null,'anyof',nlapiGetRecordId()));
	  var sale=nlapiSearchRecord('transaction','customsearch747',new nlobjSearchFilter('item',null,'anyof',nlapiGetRecordId()));
	  
	  if (purchased!=null){
		  var cols=purchased[0].getAllColumns();
		  var amt=purchased[0].getValue(cols[1]);
		  var quant=purchased[0].getValue(cols[2]);
		  nlapiSubmitField('inventoryitem',nlapiGetRecordId(),['custitem57','custitem58'],[quant,amt]);
	  }
	  if (sale!=null){
		  var cols=sale[0].getAllColumns();
		  var amt=sale[0].getValue(cols[1]);
		  var quant=sale[0].getValue(cols[2]);
		  nlapiSubmitField('inventoryitem',nlapiGetRecordId(),['custitem59','custitem60'],[quant,amt]);
	  }
  }
  if (type=='edit'){
	  var record=nlapiGetNewRecord();
  if (record.getFieldValue('custitem_sdm_pending_prearr')=='T'){
	 filters.push(new nlobjSearchFilter('custrecord_shipline_item',null,'is',nlapiGetRecordId()));
	 filters.push(new nlobjSearchFilter('custrecord_shipline_status',null,'noneof',3));
	  var column=new nlobjSearchColumn('internalid');
	  var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,column);
	  for (var i=0; results!=null&&i<results.length; i++){
		  nlapiSubmitField('customrecord_nbi_shipping_line',results[i].getValue('internalid'),'custrecord_shipline_status',1);
	  }
  }
  //record status-open, shipped, cancelled
  //record status filter
  else if (record.getFieldValue('custitem_sdm_pending_prearr')=='F'){
	  
	  filters.push(new nlobjSearchFilter('custrecord_shipline_item',null,'is',nlapiGetRecordId()));
	  filters.push(new nlobjSearchFilter('custrecord_shipline_status',null,'noneof',3));
	  //filters.push(new nlobjSearchFilter('custrecord_shipline_qty_shipped',null,'is','F'));
	  var column=new nlobjSearchColumn('internalid');
	  var results=nlapiSearchRecord('customrecord_nbi_shipping_line',null,filters,column);
	  for (var i=0; results!=null&&i<results.length; i++){
		  nlapiSubmitField('customrecord_nbi_shipping_line',results[i].getValue('internalid'),'custrecord_shipline_status','');
	  }
  }
  }
  if (type=='edit'||type=='xedit'||type=='create'){
	 var item= nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId(),{recordmode: 'dynamic'});
	 var sched=item.getFieldValue('quantitypricingschedule');
	 item.setFieldValue('quantitypricingschedule','');
	 item.setFieldValue('quantitypricingschedule',sched);
	 nlapiSubmitRecord(item);
  }
   }
	  catch(e){
		  nlapiLogExecution('ERROR','set btg error',e.message+' '+nlapiGetRecordId());
	  }
}
