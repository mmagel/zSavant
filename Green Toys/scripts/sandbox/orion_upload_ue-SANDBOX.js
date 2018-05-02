function upload_before_submit(type){
	if (type=='create'){
		var line=nlapiGetFieldValue('custrecord_upload');
		line=line.split('|');
		var sonumber=line[line.length-1];
		nlapiLogExecution('ERROR','sonumber',sonumber);
		var so=nlapiSearchRecord('salesorder',null,new nlobjSearchFilter('tranid',null,'is',sonumber.trim()),new nlobjSearchColumn('internalid'));
		if (so!=null){
			nlapiLogExecution('ERROR','1',1);
			nlapiSetFieldValue('custrecord_sonumber',so[0].getValue('internalid'));
		}
	}
	if (type=='xedit'&&nlapiGetFieldValue('custrecord_processed')=='T'){
		try {
			var so=nlapiLookupField('customrecord_orionautobill',nlapiGetRecordId(),'custrecord_sonumber');
			var fulf=nlapiSearchRecord('itemfulfillment',null,new nlobjSearchFilter('createdfrom',null,'anyof',so),new nlobjSearchColumn('trandate'));
			var trandate='';
			var shipcost = nlapiLookupField('salesorder',so,'shippingcost');	//rb
			//var so_shipcost = so.getFieldValue('shippingcost',so_shipcost);
			if (fulf!=null){
				trandate=fulf[0].getValue('trandate');
			}
			var inv=nlapiTransformRecord('salesorder',so,'invoice',{recordmode:'dynamic'});
			//inv.setFieldValue('shippingcost',so_shipcost);	//rb


			var customer=nlapiLookupField('salesorder',so,'entity');
			if (customer!=''&&customer!=null){
				//12 fax 13 print 11 email
				var fields=nlapiLookupField('customer',customer,['custentity13','custentity11','custentity12']);
				if (fields.custentity13=='T'){
					inv.setFieldValue('tobeprinted','T');
				}
				else {
					inv.setFieldValue('tobeprinted','F');
				}
				if (fields.custentity11=='T'){
					inv.setFieldValue('tobeemailed','T');
				}
				else {
					inv.setFieldValue('tobeemailed','F');
				}
				if (fields.custentity12=='T'){
					inv.setFieldValue('tobefaxed','T');
				}
				else {
					inv.setFieldValue('tobefaxed','F');
				}
			}
			if (trandate!=''){
				inv.setFieldValue('trandate',trandate);
			}
				var total=parseFloat(0);
				//var discounts=new Array();
				var lines=inv.getLineItemCount('item');
				for (var i=1;i<=lines;i++){
					
					if (inv.getLineItemText('item','item',i)!='Subtotal'){
						var itemtype=inv.getLineItemValue('item','itemtype',i);
						var rate=inv.getLineItemValue('item','rate',i);
						if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
							//rate=rate.substring(0,rate.length-1);
							//discounts.push(rate*.01);
							//alert(rate);
						}
						else {
							var amount=parseFloat(inv.getLineItemValue('item','amount',i));
							total+=amount; 
						}
					}
				}
				var subtotal=total;
				var shipmethod=inv.getFieldText('shipmethod');
				
				
          		//var shipcost=inv.getFieldValue('shippingcost');	//rb
				//var shipcost=nlapiLookupField('salesorder',so,'shippingcost',true);


				var error=false;
				var shipcarrier=nlapiLookupField('salesorder',so,'shipcarrier',true);
          nlapiLogExecution('ERROR','shipcarrier',shipcarrier)
					if (shipcarrier=='FedEx/USPS/More'&&shipmethod!=null&&shipmethod!='P1P-First Class Priority'&&shipmethod!='UPS1 - Next Day Air'&& shipmethod.indexOf('%')!=-1 && shipcost!=0)	//rb
                    {
						shipmethod=shipmethod.replace(/\D/g,'');
						shipmethod=parseFloat(shipmethod);
						nlapiLogExecution('ERROR','e',shipcarrier+' '+shipmethod)
						if (typeof shipmethod=='number')
                        {
							inv.setFieldValue('shippingcost',subtotal*(shipmethod*.01));
                        }
						
					}
          			else if (shipcarrier=='FedEx/USPS/More'&&shipmethod!=null&&shipmethod!='P1P-First Class Priority'&&shipmethod!='UPS1 - Next Day Air' && shipcost!=0)	//rb
                    {
            			nlapiLogExecution('ERROR','s',shipcarrier+' '+shipmethod)
          			}
                    else if (shipcost == 0)
					{
						inv.setFieldValue('shippingcost',0);
						nlapiLogExecution('ERROR','s',shipcost);
					}
					else
                    {

						nlapiLogExecution('ERROR','a',shipcarrier+' '+shipmethod);
						nlapiSetFieldValue('custrecord_processed','F');
						nlapiSetFieldValue('custrecord_error','Shipping Carrier is '+shipcarrier+' and shipping method is '+shipmethod+'.This combination cannot be automatically processed. Please process manually. ');
                        return;
                    };
					
						
				nlapiLogExecution ( 'DEBUG' , nlapiGetRecordId() , shipcost );


				
			inv=nlapiSubmitRecord(inv,true,true);
			nlapiSetFieldValue('custrecord_invoice',inv);
			var matching=nlapiSearchRecord('customrecord_orionautobill',null,[new nlobjSearchFilter('custrecord_sonumber',null,'anyof',so),new nlobjSearchFilter('custrecord_processed',null,'is','F')],new nlobjSearchColumn('internalid'));
			nlapiSetFieldValue('custrecord_error','');
			for (var i=0;matching!=null&&i<matching.length;i++){
				nlapiSubmitField('customrecord_orionautobill',matching[i].getValue('internalid'),'custrecord_processed','T');
			}
			
		}
		catch(e){
			nlapiSetFieldValue('custrecord_processed','F');
			nlapiSetFieldValue('custrecord_error',e.message);
			nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
		}
	} 
// end try, now see if shipcost=0
/*  if (type=='xedit'&&nlapiGetFieldValue('custrecord_processed')=='F'){
    			inv=nlapiSubmitRecord(inv,true,true);
			nlapiSetFieldValue('custrecord_invoice',inv);
			var matching=nlapiSearchRecord('customrecord_orionautobill',null,[new nlobjSearchFilter('custrecord_sonumber',null,'anyof',so),new nlobjSearchFilter('custrecord_processed',null,'is','F')],new nlobjSearchColumn('internalid'));
			nlapiSetFieldValue('custrecord_error','');
			for (var i=0;matching!=null&&i<matching.length;i++){
				nlapiSubmitField('customrecord_orionautobill',matching[i].getValue('internalid'),'custrecord_processed','T');
			}
  }
 */ 
  
  
}
function schedule_script(request,response){
	nlapiScheduleScript('customscript_autobillschedule','customdeploy_autobillschedule');
	nlapiSetRedirectURL('tasklink','LIST_SCRIPTSTATUS');
}
function bill_orion_so_scheduled(){
	var recs=nlapiSearchRecord('customrecord_orionautobill','customsearch_unprocessed_orion');
	var context=nlapiGetContext();
	for (var i=0; recs!=null&&i<recs.length; i++){
		nlapiSubmitField('customrecord_orionautobill',recs[i].getValue('internalid',null,'max'),'custrecord_processed','T');
		context.setPercentComplete(i/recs.length*100);
	}
}
function test_invoice(request,response){
nlapiLoadRecord('invoice',118811,{recordmode:'dynamic'});
}