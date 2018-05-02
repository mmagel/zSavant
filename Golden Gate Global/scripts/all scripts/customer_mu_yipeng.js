function update_customers(){
	var customers=nlapiSearchRecord('customer','customsearch179');
	for (var i=0; i<customers.length; i++){
		var columns=customers[i].getAllColumns();
		var setby=customers[i].getValue(columns[1]);
		nlapiLogExecution('ERROR',setby,setby);
		//var emp=nlapiSearchRecord('employee',null,new nlobjSearchFilter('entityid',null,'startswith',setby),new nlobjSearchColumn('internalid'));
		nlapiSubmitField('customer',customers[i].getValue('internalid'),'custentity213',setby);
	}
}