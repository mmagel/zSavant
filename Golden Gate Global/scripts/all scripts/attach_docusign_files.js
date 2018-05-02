//6589
//6588
function attach_files(){
	var files=nlapiSearchRecord(null,'customsearch347');
	for (var i=0; files!=null && i<files.length; i++){
		columns=files[i].getAllColumns();
		var name=files[i].getValue(columns[1]);
		var id=files[i].getValue(columns[0]);
		var iid=name.split('_')[0];
		var result=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'is',iid),new nlobjSearchColumn('internalid'));
		if (result!=null)
		nlapiAttachRecord('file',id,'job',result[0].getValue('internalid'));
		else
			nlapiLogExecution('ERROR',name,'no project found');
	}
}