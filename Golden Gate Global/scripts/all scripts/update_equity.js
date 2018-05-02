/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Apr 2014     AHalbleib
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function update_equity(recType, recId) {
	var acct=nlapiLoadRecord(recType,recId);
	var patt=new RegExp('No GSIF');
	var id_patt=new RegExp('GSIF-[1-9][0-9]*-[0-9][0-9][0-9]');
	var id=id_patt.exec(acct.getFieldText('custrecord4'));
	if (id!=null){
		if (id_patt.exec(acct.getFieldValue('acctname'))==null){
			acct.setFieldValue('acctname',id+' '+acct.getFieldValue('acctname'));
			nlapiSubmitRecord(acct,false,true);
		}
	}
	else if (acct.getFieldValue('acctnumber').length>0 &&patt.exec(acct.getFieldValue('acctname')==null)){
		acct.setFieldValue('acctname','No GSIF '+acct.getFieldValue('acctname'));
		nlapiSubmitRecord(acct,false,true);
	}
}
