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







function item_bs(type){
  try{
    var itemrec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId(),{recordmode: 'dynamic'});
    var classification = itemrec.getFieldValue('custitem6');
    var mlbottle = itemrec.getFieldValue('custitem11');
    var estweight = itemrec.getFieldValue('custitem72');
    
        nlapiLogExecution('DEBUG','type is: '+type+' - '+
                         'class is: '+classification+' - '+
                         'ml    is: '+mlbottle+' - '+
                         'est weigh is: '+estweight
                         );

    //calculate est weight on create only
    if (type=='create' && (estweight==null||estweight=='') ){
        if (classification == 'Still' || classification == 'Dessert' || classification == 'Oil'){
            itemrec.setFieldValue('custitem72', Math.round((mlbottle*.004)) );
        } else if (classification == 'Sparkling' ){
            itemrec.setFieldValue('custitem72', Math.round((mlbottle*.0053)) );
        }
      nlapiSubmitRecord(itemrec);
    }

    //if edit and theres no estweight value
    if (type=='edit' && (estweight==null||estweight=='') ){
        if (classification == 'Still' || classification == 'Dessert' || classification == 'Oil'){
            itemrec.setFieldValue('custitem72', Math.round((mlbottle*.004)) );
        } else if (classification == 'Sparkling' ){
            itemrec.setFieldValue('custitem72', Math.round((mlbottle*.0053)) );
        }
      nlapiSubmitRecord(itemrec);
    }
    
  } catch(e)
  {
    nlapiLogExecution('ERROR','error',e.message);
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