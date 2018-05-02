function namerec_as(type){
	var name=nlapiGetFieldValue('name');
	
	var regExp = /\(([^)]+)\)/;
var matches = regExp.exec(name);

var iid=matches[1];
	var result=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
	if (result!=null){
		var intid=result[0].getValue('internalid');
		nlapiSubmitField(nlapiGetRecordType(),nlapiGetRecordId(),'custrecord_nhp',intid);
		nlapiSubmitField('job',intid,'custentity_conf','T');
	}
}