/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jul 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function invoice_after_submit(type){
  if (type=='create'){
	  var so_id=nlapiGetFieldValue('createdfrom');
	  if (so_id!=null&&so_id.length>0){
		  var so=nlapiLoadRecord('salesorder',so_id);
		  var salesrep=so.getFieldValue('salesrep');
		  var status=so.getFieldValue('status');
		  var records=new Object();
		  records['transaction']=''+so_id+'';
		  var file=nlapiPrintRecord('TRANSACTION',so_id,'PDF');
		  if (salesrep==822){
			  var message='You are being notified because one of Dave Davenport\'s Sales orders has just been billed. '
				  +'The record can be found at the following url: '+'https://system.netsuite.com'+nlapiResolveURL('RECORD','salesorder',so_id);
			// nlapiSendEmail(nlapiGetUser(),'shipping@northberkeleyimports.com','One of Dave Davenport\'s Sales Orders has been billed',message,null,null,records,file);
		  }
		  else {
			  nlapiLogExecution('ERROR','cond not passed',status+' '+salesrep);
		  }
	  }
	  else {
		  nlapiLogExecution('ERROR','so_id null or empty','asdfasdf');
	  }
  }
}
function invoice_before_load(type){
	if (nlapiGetFieldValue('customform')==107){
		nlapiSetFieldValue('terms',4,false);
		var terms=nlapiGetField('terms');
		terms.setDisplayType('inline');
	}
}
function invoice_field_changed(type,name,linenum){
	if (nlapiGetFieldValue('customform')==107 && name=='terms'){
		nlapiSetFieldValue('terms',4,false);
	}
}
function invoice_save_record(){
	if (nlapiGetFieldValue('customform')==107){
		return confirm('You are creating a retail invoice. Are you sure you want to do this?');
	}
	return true;
}