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

function opportunity_before_submit(type){
//return;
	var investor_id=nlapiGetFieldValue('custbody_investor_id');
	var customer=nlapiGetFieldValue('entity');
	nlapiSubmitField('customer',customer,'custentity7',investor_id,false);
	var patt=new RegExp('[A-Za-z]+, [A-Za-z]+ \\(SFBARC-[1-9][0-9]*-[0-9][0-9][0-9]\\)');
	var id_patt=new RegExp('SFBARC-[1-9][0-9]*-[0-9][0-9][0-9]');
	var patt2=new RegExp('[A-Za-z]+, [A-Za-z]+ \\(GSIF-[1-9][0-9]*-[0-9][0-9][0-9]\\)');
	var id_patt2=new RegExp('GSIF-[1-9][0-9]*-[0-9][0-9][0-9]');
	var name=nlapiLookupField('customer',customer,'companyname');
	var sub=nlapiGetFieldValue('subsidiary');
//nlapiLogExecution('ERROR',sub,name+' '+patt.test(name) +' '+nlapiGetFieldValue('job').length);
	if (sub==7&&patt.test(name)){
		var gender=nlapiGetFieldValue('custbody172');
		var gentext=nlapiGetFieldText('custbody172');
		nlapiLogExecution('ERROR','1'+gender,gentext);
		var id=id_patt.exec(name);
		if (type=='edit' &&nlapiGetFieldValue('job').length>0){
			nlapiLogExecution('ERROR','bb','bb');
			var proj=nlapiLoadRecord('job',nlapiGetFieldValue('job'));
			proj.setFieldValue('parent',nlapiGetFieldValue('entity'));
			proj.setFieldValue('custentity23',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148'));
			proj.setFieldValue('companyname',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148')+' ('+nlapiGetFieldValue('custbody_investor_id')+')');
			proj.setFieldValue('custentity7',nlapiGetFieldValue('custbody_investor_id'));
			proj.setFieldValue('custentity35',nlapiGetFieldValue('custbody151'));
			proj.setFieldValue('custentity9',nlapiGetFieldValue('custbody152'));
			proj.setFieldValue('custentity_sdm_gender',nlapiGetFieldValue('custbody172'));			
			proj.setFieldValue('custentity_sdm_cellphonenumber',nlapiGetFieldValue('custbody13'));
			proj.setFieldValue('custentity_sdm_email',nlapiGetFieldValue('custbody158'));
			proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
			proj.setFieldValue('custentity5',nlapiGetFieldValue('custbody1'));
			proj.setFieldValue('custentity_sdm_typeofreferralsource',nlapiGetFieldValue('custbody2'));
			proj.setFieldValue('custentity_sdm_referralsourceother',nlapiGetFieldValue('custbody3'));
			proj.setFieldValue('custentity43',nlapiGetFieldValue('custbody_aiq_date'));
			proj.setFieldValue('custentity_sdm_mailingeb5doc',nlapiGetFieldValue('custbody155'));
			proj.setFieldValue('custentity33',nlapiGetFieldValue('custbody171'));
			proj.setFieldValue('custentity120',nlapiGetFieldValue('custbody183'));
			proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
			proj.setFieldValue('custentity_sdm_immigrationattorney',nlapiGetFieldValue('custbody136'));
			var proj_id=nlapiSubmitRecord(proj,true,true);
			nlapiSetFieldValue('job',proj_id);
		}
		
		if (id==investor_id){
			//return;
		}
		else {
			var new_name=name.replace(id,investor_id);
			nlapiSubmitField('customer',customer,'companyname',new_name);
			nlapiSubmitField('customer',customer,'entityid',new_name);
		}
	}
	else if ((sub==2||sub==3||sub==4)&&patt2.test(name)){
		var gender=nlapiGetFieldValue('custbody172');
		var gentext=nlapiGetFieldText('custbody172');
		nlapiLogExecution('ERROR','2'+gender,gentext);
		var id=id_patt2.exec(name);
		if (type=='edit' &&nlapiGetFieldValue('job').length>0){
			nlapiLogExecution('ERROR','aa','aa');
			var proj=nlapiLoadRecord('job',nlapiGetFieldValue('job'));
			proj.setFieldValue('parent',nlapiGetFieldValue('entity'));
			proj.setFieldValue('custentity23',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148'));
			proj.setFieldValue('companyname',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148')+' ('+nlapiGetFieldValue('custbody_investor_id')+')');
			proj.setFieldValue('custentity7',nlapiGetFieldValue('custbody_investor_id'));
			proj.setFieldValue('custentity35',nlapiGetFieldValue('custbody151'));
			proj.setFieldValue('custentity9',nlapiGetFieldValue('custbody152'));
			proj.setFieldValue('custentity_sdm_gender',nlapiGetFieldValue('custbody172'));			
			proj.setFieldValue('custentity_sdm_cellphonenumber',nlapiGetFieldValue('custbody13'));
			proj.setFieldValue('custentity_sdm_email',nlapiGetFieldValue('custbody158'));
			proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
			proj.setFieldValue('custentity5',nlapiGetFieldValue('custbody1'));
			proj.setFieldValue('custentity_sdm_typeofreferralsource',nlapiGetFieldValue('custbody2'));
			proj.setFieldValue('custentity_sdm_referralsourceother',nlapiGetFieldValue('custbody3'));
			proj.setFieldValue('custentity43',nlapiGetFieldValue('custbody_aiq_date'));
			proj.setFieldValue('custentity_sdm_mailingeb5doc',nlapiGetFieldValue('custbody155'));
			
			proj.setFieldValue('custentity33',nlapiGetFieldValue('custbody171'));
			proj.setFieldValue('custentity120',nlapiGetFieldValue('custbody183'));
			proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
			proj.setFieldValue('custentity_sdm_immigrationattorney',nlapiGetFieldValue('custbody136'));
			var proj_id=nlapiSubmitRecord(proj,true,true);
			nlapiSetFieldValue('job',proj_id);
		}
		
		if (id==investor_id){
			//return;
		}
		else {
			var new_name=name.replace(id,investor_id);
			nlapiSubmitField('customer',customer,'companyname',new_name);
			nlapiSubmitField('customer',customer,'entityid',new_name);
		}
	}
	
	
	else {
		var gender=nlapiGetFieldValue('custbody172');
		var gentext=nlapiGetFieldText('custbody172');
		nlapiLogExecution('ERROR','3'+gender,gentext);
		nlapiSubmitField('customer',customer,'companyname',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148')+' ('+investor_id+')');
		nlapiSubmitField('customer',customer,'entityid',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148')+' ('+investor_id+')');
		
	}
	// &&(nlapiGetFieldValue('job').length<1||sub==6)
	if ((type=='create' ||type=='edit') &&nlapiGetFieldValue('custbody_investor_id').length>0){
		var exist=nlapiSearchRecord('job',null,new nlobjSearchFilter('parent',null,'anyof',customer),new nlobjSearchColumn('internalid'));
		var proj;
		if (exist==null)
			proj=nlapiCreateRecord('job');
		else {
			if (nlapiGetFieldValue('job').length<1){
				proj=nlapiLoadRecord('job',exist[0].getValue('internalid'));
			}
			else {
				proj=nlapiLoadRecord('job',nlapiGetFieldValue('job'));
			}
		}
		proj.setFieldValue('parent',nlapiGetFieldValue('entity'));
		proj.setFieldValue('custentity23',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148'));
		proj.setFieldValue('companyname',nlapiGetFieldValue('custbody149')+', '+nlapiGetFieldValue('custbody148')+' ('+nlapiGetFieldValue('custbody_investor_id')+')');
		proj.setFieldValue('custentity7',nlapiGetFieldValue('custbody_investor_id'));
		proj.setFieldValue('custentity35',nlapiGetFieldValue('custbody151'));
		proj.setFieldValue('custentity9',nlapiGetFieldValue('custbody152'));
		proj.setFieldValue('custentity_sdm_gender',nlapiGetFieldValue('custbody172'));			
		proj.setFieldValue('custentity_sdm_cellphonenumber',nlapiGetFieldValue('custbody13'));
		proj.setFieldValue('custentity_sdm_email',nlapiGetFieldValue('custbody158'));
		proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
		proj.setFieldValue('custentity_pob_country',nlapiGetFieldValue('custbody22'));
		proj.setFieldValue('custentity5',nlapiGetFieldValue('custbody1'));
		proj.setFieldValue('custentity_sdm_typeofreferralsource',nlapiGetFieldValue('custbody2'));
		proj.setFieldValue('custentity_sdm_referralsourceother',nlapiGetFieldValue('custbody3'));
		proj.setFieldValue('custentity43',nlapiGetFieldValue('custbody_aiq_date'));
		proj.setFieldValue('custentity_sdm_mailingeb5doc',nlapiGetFieldValue('custbody155'));
		proj.setFieldValue('custentity33',nlapiGetFieldValue('custbody171'));
		proj.setFieldValue('custentity120',nlapiGetFieldValue('custbody183'));
		proj.setFieldValue('custentity37',nlapiGetFieldValue('custbody4'));
		proj.setFieldValue('custentity_sdm_immigrationattorney',nlapiGetFieldValue('custbody136'));
		var proj_id=nlapiSubmitRecord(proj,true,true);
		nlapiSetFieldValue('job',proj_id);
	}
}