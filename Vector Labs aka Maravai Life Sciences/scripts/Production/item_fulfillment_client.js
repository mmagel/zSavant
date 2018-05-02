function item_fulfillment_on_load(){
	var status=nlapiGetFieldText('shipstatus');
	var car=nlapiGetFieldText('shipcarrier');
	if (car=='UPS'){
		document.getElementById("packagedescrups").innerHTML = "Non haz chemicals";
	}
}
function item_fulfillment_field_change(type,name,linenum){
  try {
	if (name=='shipstatus'||name=='shipcarrier'){
		var status=nlapiGetFieldText('shipstatus');
		var car=nlapiGetFieldText('shipcarrier');
		
		if (car=='UPS'){
			//alert(status+' '+car);
			//nlapiSetFieldValue('packagedescrups','Non haz chemicals');
			
			document.getElementById("packagedescrups").innerHTML = "Non haz chemicals";
		}
	}
	if (type=='packageups'&&name=='packagedescrups'){
		nlapiSetCurrentLineItemValue('packageups','packagedescrups',"Non haz chemicals",false)
	}
  }
  catch(e){
    
  }
}
function item_fulfillment_bs(type,name,linenum){
	nlapiLogExecution('ERROR','type',type);
	if (type=='create'){
		var lines=nlapiGetLineItemCount('packageups');
		nlapiLogExecution('ERROR','type',lines);
		for (var i=1; i<=lines; i++){
			nlapiSetLineItemValue('packageups','packagedescrups',i,"Non haz chemicals");
		}
	}
//	var newrec=nlapiGetNewRecord();
//	if (newrec.getFieldText('shipstatus')=='Packed'||newrec.getFieldText('shipstatus')=='Shipped'){
//			var cust=nlapiGetFieldValue('entity');
//			var createdfrom=nlapiGetFieldValue('createdfrom');
//			if (createdfrom!=''&&createdfrom!=null){
//				var acct=nlapiLookupField('salesorder',createdfrom,'custbody_shippingacct');
//				if (acct!='' && acct!=null && typeof acct != 'undefined'){
//					//nlapiSetFieldValue('shipcarrier','nonups');
//					//nlapiSetFieldValue('shipmethod',5589);
//					try {
//						nlapiSetFieldValue('generateintegratedshipperlabel','F');
//						nlapiSetFieldValue('generatereturnlabel','F');
//					}
//					catch(e){
//						
//					}
//				}
//			}
//	}
}
function if_set_edi_fields(type){
  nlapiLogExecution('ERROR','type',type);
	if (type=='create'){
		nlapiSetFieldValue('custbody_fulfillment_edi_status',1);
		var status=nlapiGetFieldText('shipstatus');
		if (status=='Shipped'){
			var date=new Date();
			date=nlapiDateToString(date,'datetime');
			var date=date.split(' ');
			date[1]=date[1]+':00';
			date=date[0]+' '+date[1]+' '+date[2];
			nlapiSetFieldValue('custbody_status_changed_to_shipped',date);
			//2/15/2017 4:37 pm
		}
	}
	if (type=='edit'||type=='xedit'||type=='ship'){
		var old=nlapiGetOldRecord();;
		var newrec=nlapiGetNewRecord();
		var stat=old.getFieldText('shipstatus');
		var newstat=newrec.getFieldText('shipstatus');
		nlapiLogExecution('ERROR',stat,newstat);
		if (stat!='Shipped'&&newstat=='Shipped'){
			var date=new Date();
			date=nlapiDateToString(date,'datetime');
			var date=date.split(' ');
			date[1]=date[1]+':00';
			date=date[0]+' '+date[1]+' '+date[2];
			nlapiSetFieldValue('custbody_status_changed_to_shipped',date);
		}
	}
}
function in_bs(type){
	if (type=='create'||type=='edit'){
      var rectype=nlapiGetRecordType();
      if (rectype=='invoice'&&nlapiGetContext().getExecutionContext()=='csvimport'){
		
		var lines=nlapiGetLineItemCount('item');
		for (var i=1;i<=lines;i++){
			nlapiSelectLineItem('item',i);
			var item=nlapiGetCurrentLineItemValue('item','item');
			
			var quant=nlapiGetCurrentLineItemValue('item','quantity');
			var curnum=num=nlapiGetCurrentLineItemValue('item','serialnumbers');
			//if (curnum==''||curnum==null){
				var nums=nlapiSearchRecord('inventorynumber','customsearch238',new nlobjSearchFilter('item',null,'anyof',item));
				for (var j=0; nums!=null&&j<nums.length; j++){
					var id=nums[j].getValue('internalid');
					var av=nums[j].getValue('quantityavailable');
					var num=nums[j].getValue('inventorynumber');
                  	//var expir=nums[j].getValue('expirationdate');
					
					nlapiLogExecution('ERROR',i,id+' '+av+' '+quant);
					if (parseFloat(av)>=parseFloat(quant)){
						try{
							nlapiSetCurrentLineItemValue('item','serialnumbers',num);
                          	//nlapiSetCurrentLineItemValue('item','expirationdate',expir);
							nlapiCommitLineItem('item');
							break;
						
						}
						catch(e){
							nlapiLogExecution('ERROR','error',e.message);
						}
					}
					
				}
			//}
		}
    }
	}
}
function so_as(type,form,request){
	//nlapiLogExecution('ERROR','a',type);
	if (type=='create'||type=='edit'){
      var rectype=nlapiGetRecordType();
	  var or=nlapiGetFieldValue('custbody_lot_or');

      if ((rectype=='invoice'&&nlapiGetContext().getExecutionContext()=='csvimport')||(rectype=='salesorder'&&or!='T')){
		var rec=nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()	,{recordmode: 'dynamic'});
		var lines=rec.getLineItemCount('item');
		for (var i=1;i<=lines;i++){
			rec.selectLineItem('item',i);
			var item=rec.getCurrentLineItemValue('item','item');
			
			var quant=rec.getCurrentLineItemValue('item','quantity');
			var curnum=num=nlapiGetCurrentLineItemValue('item','serialnumbers');
			//if (curnum==''||curnum==null){
			var nums=nlapiSearchRecord('inventorynumber','customsearch238',new nlobjSearchFilter('item',null,'anyof',item));
				for (var j=0; nums!=null&&j<nums.length; j++){
					var id=nums[j].getValue('internalid');
					var av=nums[j].getValue('quantityavailable');
					var num=nums[j].getValue('inventorynumber');
                  	var expir=nums[j].getValue('expirationdate');							//rb
                    var yearfromtran = nlapiAddMonths( nlapiStringToDate(rec.getFieldValue('trandate')) , 12 ); //rb-add year
                  	yearfromtran = nlapiDateToString(yearfromtran);		//rb-convert back

					if (expir == null || expir == ''){ expir = yearfromtran;}				//rb-if no expir add 1yr to SOdate
                  
					nlapiLogExecution('ERROR',i,id+' '+av+' '+quant);
					if (parseFloat(av)>=parseFloat(quant) && type=='create'){
						try{
							rec.setCurrentLineItemValue('item','serialnumbers',num);
                          	rec.setCurrentLineItemValue('item','custcol_expdate',expir);	//rb                                
                          
							rec.commitLineItem('item');
							break;
						
						}
						catch(e){
							nlapiLogExecution('ERROR','error',e.message);
						}
					}


                  if (parseFloat(av)>=parseFloat(quant) && type=='edit'){		// was: if (parseFloat(av+quant)>=parseFloat(quant) && type=='edit')
						try{
							rec.setCurrentLineItemValue('item','serialnumbers',num);
                          	rec.setCurrentLineItemValue('item','custcol_expdate',expir);	//rb                                
                          
							rec.commitLineItem('item');
							break;
						
						}
						catch(e){
							nlapiLogExecution('ERROR','error',e.message);
						}
					}


					
				}   //end of 2nd for loop
			//}
		}   // end of 1st for loop
		nlapiSubmitRecord(rec);
      }
	}
}