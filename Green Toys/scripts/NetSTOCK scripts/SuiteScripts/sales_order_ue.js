function sales_order_before_load(type,form,request){
	//if (type=='create' && typeof request != 'undefined'){
	//	var entity=request.getParameter('entity');
	//	nlapiLogExecution('ERROR','entity',entity);
	//	if (entity!=null&&entity!=''){
	//		var araging15=nlapiSearchRecord('transaction','customsearch277',new nlobjSearchFilter('internalid','customer','anyof',entity));
	//		if (araging15!=null){
	//			form.getField('custbody_credverif').setDefaultValue('T');
	//		}
	//		if (nlapiLookupField('customer',entity,'entitystatus')==17){
	//			form.getField('custbody_custvalidation_').setDefaultValue('T');
	//		}
	//		if (nlapiLookupField('customer',entity,'category')==3){
	//			form.getField('custbody_custintl').setDefaultValue('T');
	//		}
	//		if (nlapiLookupField('customer',entity,'shippingitem')==721){
	//			form.getField('custbody8').setDefaultValue(5);
	//		}
		//	if (nlapiLookupField('customer',entity,'custentity9')=='T'){
	//			form.getField('customform').setDefaultValue(108);
	//		}
	//	}
	//}
	//nlapiLogExecution('ERROR','type',type);
	if (type=='create'&& typeof request!='undefined'){
		var entity=request.getParameter('entity');
		if (entity!=null&&entity.length>0){
			var rec=nlapiLoadRecord('customer',entity);
			var acct=rec.getFieldValue('thirdpartyacct');
				form.getField('custbody_3prtyship_').setDefaultValue(acct);
		}
	}
	if (type=='copy'){
		form.getField('custbody_celigo_ordercompleteto3pl').setDefaultValue('F');
		form.getField('custbody_cps_last_exportedto_orion').setDefaultValue('');
	var sd=nlapiLookupField('salesorder',request.getParameter('id'),'shipdate');
	form.addField('custpage_sd','date','').setDisplayType('hidden').setDefaultValue(sd);
	//	form.getField('shipdate').setDefaultValue();
	}
}

function sales_order_before_submit(type){
	//nlapiLogExecution('ERROR','type',type);
	if (type=='approve'){
	
			//var lines=nlapiGetLineItemCount('item');

			//for (var i=1;i<=lines;i++){
				
			//	nlapiSetLineItemValue('item','commitmentfirm',i,nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i));

			//}
		}

}
function so_after_submit(type){

	if (type!='delete'){
		try {
			var status=nlapiLookupField(nlapiGetRecordType(),nlapiGetRecordId(),'statusref',true);
			//nlapiLogExecution('ERROR','status',)
			if (status!=null&&status.indexOf('Fulfill')>-1){
				record=nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId(),{recordmode:'dynamic'});
				var lines=record.getLineItemCount('item');

				for (var i=1;i<=lines;i++){
					record.selectLineItem('item',i);
					var orion=record.getCurrentLineItemValue('item','custcol_cps_orion_linereadytoship');
					if (orion=='T'){
						record.setCurrentLineItemValue('item','commitinventory',1);
					}
					else {
						record.setCurrentLineItemValue('item','commitinventory',3);
					}
					record.setCurrentLineItemValue('item','commitmentfirm','F');
					record.commitLineItem('item');
				}
				nlapiSubmitRecord(record,true,true);
			}
		}
		catch(e){
			nlapiLogExecution('ERROR','error',e.message);
		}
	}	
}