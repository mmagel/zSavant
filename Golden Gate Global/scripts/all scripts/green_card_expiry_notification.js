function green_card_expiry_email(recType,recId){
	var project=nlapiLoadRecord(recType,recId);
	var end_date=project.getFieldValue('custentity232');
	var today=new Date();
	//nlapiLogExecution('ERROR',nlapiDateToString(nlapiAddMonths(today,5)),end_date);
	if (nlapiDateToString(nlapiAddMonths(today,5))==end_date){
		//nlapiSendEmail(1102,'ir@3gfund.com','Green Card Expiring in 5 months','The conditional green card of investor '+project.getFieldText('parent')+' conditional green card is due to expire in 5 months. ');
		nlapiSendEmail(1102,['ir@3gfund.com','accounting@3gfund.com'],'Green Card Expiring in 5 months- '+project.getFieldText('parent'),'The conditional green card of investor '+project.getFieldText('parent')+' is due to expire on '+end_date,null,null,{'entity':recId});
	}
}
function green_card_filing_email(recType,recId){
	var project=nlapiLoadRecord(recType,recId);
	var file_date=project.getFieldValue('custentity146');
	var today=new Date();
	//nlapiLogExecution('ERROR',nlapiDateToString(nlapiAddMonths(today,5)),file_date);
	if (nlapiDateToString(nlapiAddMonths(today,2))==file_date){
		//nlapiSendEmail(1102,'ir@3gfund.com','Green Card Expiring in 5 months','The conditional green card of investor '+project.getFieldText('parent')+' conditional green card is due to expire in 5 months. ');
		nlapiSendEmail(1102,['ir@3gfund.com','accounting@3gfund.com'],'Projected I-829 Green Card Filing Date in 2 Months- '+project.getFieldText('parent'),'The projected I-829 green card filing date of investor '+project.getFieldText('parent')+' is on '+file_date,null,null,{'entity':recId});
	}
}