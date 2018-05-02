/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Mar 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function investor_before_load(type,form,request){
	if (type!='create'){
		id=nlapiGetRecordId();
		var filters=new Array();
		filters[0]=new nlobjSearchFilter('custrecord4',null,'is',id);
		var columns=new Array();
		columns[0]=new nlobjSearchColumn('internalid');
		var results=nlapiSearchRecord('account',null,filters,columns);
		nlapiLogExecution('DEBUG','here','1');
		if (results!=null){
			//acctname -112
			//acctnumber
			//accttype
			nlapiLogExecution('DEBUG','here','2');
			form.addTab('custpage_accounts','Investor Accounts');
			nlapiLogExecution('DEBUG','here','3');
			var sublist=form.addSubList('custpage_accounts_sub','staticlist','Accounts','custpage_accounts');

			sublist.addField('custpage_url','url','Register URL').setLinkText('Account Register');
			sublist.addField('custpage_acct','text','Account');
			sublist.addField('custpage_num','text','Number');

			sublist.addField('custpage_type','text','Type');
			var url1="https://system.na1.netsuite.com/app/reporting/reportrunner.nl?acctid=";
			var url2=	"&reload=T&outputtype=3&reporttype=REGISTER";
			for (var i=0; i<results.length; i++){
				var id=parseInt(results[i].getValue('internalid'));
				var record=nlapiLoadRecord('account',id);
				var name=record.getFieldValue('acctname');
				sublist.setLineItemValue('custpage_acct',i+1,name);
				sublist.setLineItemValue('custpage_url',i+1,url1+id+url2);
				sublist.setLineItemValue('custpage_num',i+1,record.getFieldValue('acctnumber'));

				sublist.setLineItemValue('custpage_type',i+1,record.getFieldText('accttype'));

			}
		}
		
	}
	nlapiLogExecution('DEBUG','here','12');
}
function investor_before_submit(type){
		if (type!='create'){
		var investor_id=nlapiGetFieldValue('custentity7');
		var filters=new Array();
		filters[0]=new nlobjSearchFilter('entity',null,'is',nlapiGetRecordId());
		var columns=new Array();
		columns[0]=new nlobjSearchColumn('internalid');
		var results=nlapiSearchRecord('opportunity',null,filters,columns);
		if (results!=null){
			for (var i=0; i<results.length; i++){
				var opportunity=results[i].getValue('internalid');
				nlapiSubmitField('opportunity',opportunity,'custbody_investor_id',investor_id,false);
			}
		}
		var name=nlapiGetFieldValue('companyname');
		if (name.length>=5){
		if (name.substring(name.length-5,name.length)==investor_id){
			return;
		}
		else {
			var new_name=name.replace(name.substring(name.length-5,name.length),investor_id);
			nlapiSetFieldValue('companyname',new_name);
		}
		}
		}
		
}
