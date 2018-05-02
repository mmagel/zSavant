/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Jan 2015     AHalbleib
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
//also restrict creation of numbers 305000-305499 so they stay reserved for this script
function account_after_submit(type){
	nlapiLogExecution('ERROR','length',type);
	if (type=='create'){
		var name=nlapiGetFieldValue('acctname');
		var acctnumber=Number(nlapiGetFieldValue('acctnumber'));
		var type=nlapiGetFieldValue('accttype');
		var sub=nlapiGetFieldValue('subsidiary');
		var investor=nlapiGetFieldValue('custrecord4');
		var texttype=nlapiGetFieldText('accttype');
		var date=nlapiGetFieldValue('trandate');
		nlapiLogExecution('ERROR','1',type);
		nlapiLogExecution('ERROR','2',acctnumber);
		if (type=='Equity'&&((acctnumber>305501&&acctnumber<306000&&sub==7)||(acctnumber>306501&&acctnumber<307000&&sub==6))){
			var new_num=parseInt(parseInt(acctnumber)-500).toFixed(0);
			nlapiLogExecution('ERROR','3',new_num);
			var results=nlapiSearchRecord('account',null,new nlobjSearchFilter('number',null,'is',new_num),new nlobjSearchColumn('internalid'));
			nlapiLogExecution('ERROR','4',1);
			if (results==null||results.length==0){
				var parent='';
				if (sub==7){
					parent=2702;
				}
				else if (sub==6){
					parent=3131;
				}
			var acct=nlapiCreateRecord('account');
			acct.setFieldValue('parent',parent);
			acct.setFieldValue('acctname',name);
			acct.setFieldValue('accttype','Equity');
			acct.setFieldValue('acctnumber',new_num);
			if (investor!=null&&investor.length>0){
			acct.setFieldValue('custrecord4',investor);
			}
			acct.setFieldValue('subsidiary',sub);
			acct.setFieldValue('trandate',date);
			nlapiSubmitRecord(acct);
			}
			else {
				nlapiLogExecution('ERROR','5',results.length);
				nlapiLogExecution('ERROR','6',results[0].getValue('internalid'));
			}
		}
	}
}
function account_save_record(){
	var valid=true;
	var number=nlapiGetFieldValue('acctnumber');
	var type=nlapiGetFieldText('accttype');
	var sub=nlapiGetFieldValue('subsidiary');
	var parent=nlapiGetFieldValue('parent');
	if ((number>305001&&number<305500)||(number>306001&&number<306500)){
		valid=false;
	}
	if (number>305501&&number<306000){
		if (parent!=2703||sub!=7||type!='Equity'){
			valid=false;
		}
	}
	if (number>306501&&number<307000){
		if (parent!=3131||sub!=6||type!='Equity'){
			valid=false;
		}
	}
	return valid;
}