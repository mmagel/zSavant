function item_receipt_before_load(type,from,request){
if (type=='view'){
	var f=form.addButton('custpage_bill','Bill Receipt','bill();');
	form.setScript('customscript_irc');
}
nlapiLogExecution('ERROR','type',type);
}
function bill(){
	try{
		document.location='https://system.sandbox.netsuite.com/app/accounting/transactions/vendbill.nl?transform=purchord&whence=&id='+nlapiGetFieldValue('createdfrom')+'&e=T&memdoc=0&rec='+nlapiGetRecordId();

		
		
	}
	catch(e){
		alert(e.message);
	}
}
function bill_bl(type,form,request){
	var rec=request.getParameter('rec');
	if (rec!=''&&rec!=null){
		form.addField('custpage_rec','text','').setDefaultValue(rec);
	}
}
function bill_ol(){
	var rec=nlapiGetFieldValue('custpage_rec');
	if (rec!=''&&rec!=null){
			var billlines=nlapiGetLineItemCount('item');
		
		var billexplines=nlapiGetLineItemCount('expense');
		var rec=nlapiLoadRecord('itemreceipt',rec);
		var reclines=rec.getLineItemCount('item');
		var recexplines=rec.getLineItemCount('expense');
		var recnum=rec.getId();

		for (var i=billlines; i>=1; i--){
			var rectext=nlapiGetLineItemValue('item','billreceipts',i);
			var amt=nlapiGetLineItemValue('item','billreceipts',i);
			var quant=nlapiGetLineItemValue('item','quantity',i);
			//alert(recnum+' '+rectext)
			if (rectext!=''&&rectext!=null){
				if (rectext.indexOf(recnum)==-1){
					nlapiRemoveLineItem('item',i);
				}
				else {
					nlapiSelectLineItem('item',i);
					for (var j=1; j<=reclines; j++){
						if (rec.getLineItemValue('item','item',j)==nlapiGetCurrentLineItemValue('item','item')){
							nlapiSetCurrentLineItemValue('item','billreceipts',recnum);
							//alert(quant+' '+rec.getLineItemValue('item','quantity',j));
							if (parseFloat(quant)>parseFloat(rec.getLineItemValue('item','quantity',j))){
								nlapiSetCurrentLineItemValue('item','quantity',rec.getLineItemValue('item','quantity',j));
				
							}
							nlapiCommitLineItem('item');
							break;
						}
					}
				}
			}
			else {
				nlapiRemoveLineItem('item',i);
			}
		}
		for (var i=billexplines; i>=1; i--){
			
			var amt=nlapiGetLineItemValue('expense','amount',i);
			var acct=nlapiGetLineItemValue('expense','account',i);
			var memo=nlapiGetLineItemValue('expense','memo',i);
			var found=false;
			for (var j=1;j<=recexplines;j++){
				var amt1=rec.getLineItemValue('expense','amount',i);
				var acct1=rec.getLineItemValue('expense','acct_key',i);
				var memo1=rec.getLineItemValue('expense','memo',i);
				if (amt1==amt&&memo1==memo&&acct==acct1)
					found=true;
				//alert(amt1+' '+acct1+' '+memo1+' '+amt+' '+acct+' '+memo);
			}
			if (!found){
				nlapiRemoveLineItem('expense',i);
			}
		}
	}
}
function bill_lineinit(type){
	if (type=='expense'){
		var ven=nlapiGetFieldValue('entity');
		if (ven!=''&&ven!=null){
			var dept=nlapiLookupField('vendor',ven,'custentity_defdept');
			nlapiSetCurrentLineItemValue('expense','department',dept);
		}
		else {
			nlapiSetCurrentLineItemValue('expense','department','');
		}
	}
}
function bill_fc(type,name,linenum){
	if (name=='entity'){
		var ven=nlapiGetFieldValue('entity');
		if (ven!=''&&ven!=null){
			var dept=nlapiLookupField('vendor',ven,'custentity_defdept');
			nlapiSetCurrentLineItemValue('expense','department',dept);
			var lines=nlapiGetLineItemCount('expense');
			for (var i=1; i<=lines; i++){
				nlapiSelectLineItem('expense',i);
				nlapiSetCurrentLineItemValue('expense','department',dept);
				nlapiCommitLineItem('expense');
			}
		}
		else {
			var lines=nlapiGetLineItemCount('expense');
			nlapiSetCurrentLineItemValue('expense','department','');
			for (var i=1; i<=lines; i++){
				nlapiSelectLineItem('expense',i);
				nlapiSetCurrentLineItemValue('expense','department','');
				nlapiCommitLineItem('expense');
			}
		}
	}
}