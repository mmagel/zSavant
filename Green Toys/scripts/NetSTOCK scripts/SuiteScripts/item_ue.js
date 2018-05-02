function item_after_submit(type){
 
  var filters=new Array();
  if (type=='create'||type=='edit'){

	  var sale=nlapiSearchRecord('transaction','customsearch761',new nlobjSearchFilter('item',null,'anyof',nlapiGetRecordId()));
	  
	  if (sale!=null){
		  var cols=sale[0].getAllColumns();
		  var amt=sale[0].getValue(cols[1]);
		  var quant=sale[0].getValue(cols[2]);
		  var onhand=sale[0].getValue(cols[3]);
		  var type=sale[0].getText(cols[4]);
		  quant=(onhand/quant)*30;
quant=parseFloat(quant).toFixed(2);
		  try {
		  if (type=='Inventory Item')
		  nlapiSubmitField('inventoryitem',nlapiGetRecordId(),'custitem_onhandoversoldytd',quant);
		  else
			  nlapiSubmitField('assemblyitem',nlapiGetRecordId(),'custitem_onhandoversoldytd',quant);
		  }
		  catch (e){
			  nlapiLogExecution('ERROR',nlapiGetRecordId()+' '+type+' '+quant+' '+onhand,e.message)
		  }
	  }
  }
}
function open_n_save(recType, recId) {
	try {
	var rec=nlapiLoadRecord(recType,recId,{recordmode:'dynamic'});
	nlapiSubmitRecord(rec,true,true);
	}
	catch(e){
		nlapiLogExecution('ERROR',recId,e.message);
	}
}