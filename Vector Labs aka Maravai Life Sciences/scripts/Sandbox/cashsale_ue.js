function cs_bs(type){
	nlapiLogExecution('ERROR','type',nlapiGetContext().getExecutionContext());
	if (type=='create'&&nlapiGetContext().getExecutionContext()=='userevent'){
		var iid=nlapiGetFieldValue('createdfrom');
		
	if (iid!=''&&iid!=null){
			var results=nlapiSearchRecord('salesorder','customsearch_auth',new nlobjSearchFilter('internalid',null,'anyof',iid));
		for (var i=0; results!=null&&i<results.length; i++){
				var cols=results[i].getAllColumns();
				var auth=results[i].getValue(cols[1]);
				var meth=nlapiGetFieldValue('paymentmethod');
				//nlapiSetFieldValue('paymentmethod','',true,true);
				//nlapiSetFieldValue('chargeit','F');
				//nlapiSetFieldValue('creditcardprocessor','');
				nlapiSetFieldValue('custbody_fb','T')
			//nlapiSetFieldValue('paymentmethod',meth,true,true);
			//nlapiSetFieldValue('ignoreavs','T',true,true);
			//nlapiSetFieldValue('ignorecsc','T',true,true);
			//	nlapiSetFieldValue('pnrefnum',auth);
				break;
			}
		}
	}
}
function bill_cs(type){
	nlapiLogExecution('DEBUG','bill_cs','start');
var res=nlapiSearchRecord('cashsale',null,[new nlobjSearchFilter('custbody_fb',null,'is','T'),new nlobjSearchFilter('mainline',null,'is','T')], new nlobjSearchColumn('internalid'));
	for (var j=0; res!=null&&j<res.length; j++){
		var cashsale=nlapiLoadRecord('cashsale',res[j].getValue('internalid'));
		var iid=cashsale.getFieldValue('createdfrom');
if (iid!=''&&iid!=null){
	
			var results=nlapiSearchRecord('salesorder','customsearch_auth',new nlobjSearchFilter('internalid',null,'anyof',iid));
			nlapiLogExecution('DEBUG','bill_cs','start-for-'+results.length);
		for (var i=0; results!=null&&i<results.length; i++){
          nlapiLogExecution('ERROR',results[i].getValue('internalid'),res[j].getValue('internalid'));
/*
 * //why does this have to delete the cash sale and recreate from SO ?
 * 
                nlapiDeleteRecord('cashsale',res[j].getValue('internalid'));
                var record=nlapiTransformRecord('salesorder', results[i].getValue('internalid'), 'cashsale',{recordmode:'dynamic'});
*/            
try 
{

	nlapiLogExecution('DEBUG','bill_cs','start-try');
                var record = cashsale;

				var cols=results[i].getAllColumns();
				var auth=results[i].getValue(cols[1]);
				var meth=record.getFieldValue('paymentmethod');
				record.setFieldValue('paymentmethod','');
				
				//record.setFieldValue('creditcardprocessor','');
				//record.setFieldValue('custbody_fb','T')
			record.setFieldValue('paymentmethod',meth); //why get the method, clear it, then put it back?
			record.setFieldValue('chargeit','T');
			record.setFieldValue('ignoreavs','T');
			record.setFieldValue('ignorecsc','T');
			record.setFieldValue('pnrefnum',auth);
            nlapiSubmitRecord(record,true,true);
} catch(e)
{
    nlapiLogExecution('DEBUG','bill_cs','start-catch');
    var fromId = -5; //Authors' Internal ID
    var toEmail = 'rbender@sdmayer.com';
    var sbj = 'CCR EMAIL ISSUE';
    var msg = e;

    var newRecord = nlapiGetNewRecord();
    var recordAsJSON = JSON.stringify(newRecord);
    var fileObj = nlapiCreateFile('salesorder.json', 'JSON', recordAsJSON);

    nlapiSendEmail(fromId, toEmail, sbj, msg, null, null, null, fileObj);
	nlapiLogExecution('ERROR','fail-emailsent',e.message);
}            



				break;
			}
		}
		if (nlapiGetContext().getRemainingUsage()<100){
			return;
		}
		//
}
	
}