/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2014     AHalbleib
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function create_bills(type) {
	var po_form='110';
	var bill_form='111';
	var so_form='120';
	var inv_form='103';
	create_transactions('purchaseorder',po_form,'vendorbill',bill_form);
	create_transactions('salesorder',so_form,'invoice',inv_form);

}

function create_transactions(type,form_id,type1,form_id1){
	//purchase orders
	var filters=new Array();
	filters.push(new nlobjSearchFilter('customform',null,'is',form_id));
	filters.push(new nlobjSearchFilter('mainline',null,'is','T'));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('internalid'));
	var results=nlapiSearchRecord(type,null,filters,columns);
	var today=new Date();
	if (results!=null){
		nlapiLogExecution('DEBUG','results not null',results.length);
	}
	else {
		nlapiLogExecution('DEBUG','results null','null');
	}
	for (var i=0; results!=null&&i<results.length; i++){
		nlapiLogExecution('DEBUG','results[i]',results[i].getValue('internalid'));
		var record=nlapiLoadRecord(type,results[i].getValue('internalid'));
		var issue_date=record.getFieldValue('custbody_sdm_loan_issue_date');

		var date=new Date(issue_date);
		record.selectLineItem('item',1);
		var quantity=record.getCurrentLineItemValue('item','quantity');
		var item=record.getCurrentLineItemValue('item','item');
		var entity=record.getFieldValue('entity');
		var tran_class=record.getFieldValue('class');
		var j=0;
		while ((date.getMonth()!=today.getMonth()||date.getFullYear()!=today.getFullYear()) && j<=quantity){
			date=nlapiAddMonths(date,1);
			j++;
		}
		if (j<=quantity){
			var amounts=record.getFieldValue('custbody_sdm_calculations');
			var amounts_arr=amounts.split(" ");
			var amount=parseFloat(amounts_arr[j]);
			nlapiLogExecution('DEBUG','class',record.getFieldValue('class'));
			nlapiLogExecution('DEBUG','class1',record.getFieldText('class'));
			nlapiLogExecution('DEBUG','amounts[j]',amounts_arr[j] + ' '+j);
			nlapiLogExecution('DEBUG','date',nlapiDateToString(date));
			var bill=nlapiCreateRecord(type1);
			bill.setFieldValue('customform',form_id1);
			bill.setFieldValue('entity',entity);
			bill.setFieldValue('class',record.getFieldValue('class'));
			bill.setFieldValue('trandate','6/30/2014');
			bill.setFieldValue('approvalstatus',2);
			bill.selectNewLineItem('item');
			bill.setCurrentLineItemValue('item','item',item);
			bill.setCurrentLineItemValue('item','rate',amount);
			bill.setFieldValue('custbody_sdm_po_id',results[i].getValue('internalid'));
			bill.commitLineItem('item');
			nlapiSubmitRecord(bill,false,true);
		}
		nlapiLogExecution('DEBUG','j',j);
	}
}