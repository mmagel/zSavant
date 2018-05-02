function aiq_validate_field(type,name,linenum){
	var valid=true;
	var patt=new RegExp('SFBARC-[1-9][0-9]*-[0-9][0-9][0-9]');
	var patt2=new RegExp('GSIF-[1-9][0-9]*-[0-9][0-9][0-9]');
	if (name=='custbody_investor_id'){
		var investor_id=nlapiGetFieldValue(name);
		if ((nlapiGetFieldValue('subsidiary')==2||nlapiGetFieldValue('subsidiary')==3||nlapiGetFieldValue('subsidiary')==4)&&investor_id.length>0&&!patt2.test(investor_id)){
			alert('If the subsidiary is GSIF 1 2 or 3 The investor id must be in the following format: GSIF-#-###. Once the Investor ID is entered, it cannot be erased.');
			valid=false;
		}
		else if ((nlapiGetFieldValue('subsidiary')==2||nlapiGetFieldValue('subsidiary')==3||nlapiGetFieldValue('subsidiary')==4)&&investor_id.length>0&&patt2.test(investor_id)){
			var filters=new Array();
			var columns=new Array();
			filters.push(new nlobjSearchFilter('custbody_investor_id',null,'is',investor_id));
			columns.push(new nlobjSearchColumn('internalid'));
			var results=nlapiSearchRecord('opportunity',null,filters,columns);
			if (results!=null&&results.length>0){
				var arr=new Array();
				for (var i=0; i<results.length; i++){
					arr.push(results[i].getValue('internalid'));
				}
				alert ('Investor id '+investor_id+' already exists on opportunity record(s) '+arr.toString()+ ' and thus cannot be chosen.');
				valid=false;
			}
		}	
		else if ((nlapiGetFieldValue('subsidiary')==7)&&investor_id.length>0&&!patt.test(investor_id)){
			alert('If the subsidiary is GSIF 5 The investor id must be in the following format: SFBARC-#-###. Once the Investor ID is entered, it cannot be erased.');
			valid=false;
		}
		else if (nlapiGetFieldValue('subsidiary')==7&&investor_id.length>0&&patt.test(investor_id)){
			var filters=new Array();
			var columns=new Array();
			filters.push(new nlobjSearchFilter('custbody_investor_id',null,'is',investor_id));
			columns.push(new nlobjSearchColumn('internalid'));
			var results=nlapiSearchRecord('opportunity',null,filters,columns);
			if (results!=null&&results.length>0){
				var arr=new Array();
				for (var i=0; i<results.length; i++){
					arr.push(results[i].getValue('internalid'));
				}
				alert ('Investor id '+investor_id+' already exists on opportunity record(s) '+arr.toString()+ ' and thus cannot be chosen.');
				valid=false;
			}
		}
		else {
			valid==false;
			alert('The subsidiary of the investor record is not GSIF 1, 2, 3, or 5, so you cannot enter an investor ID');
		}
	}
    return valid;
}
function aiq_save_record(){
	var valid=true;
	if (nlapiGetFieldValue('custbody_aiq_date').length>0){
		//make sure values are entered for all highlighted fields
		if (nlapiGetFieldValue('custbody_investor_id').length<1){
			alert('If the AIQ Date has been entered, you must also enter the Investor ID(field 1).');
			valid=false;
		}
	}if (nlapiGetFieldValue('custbody_investor_id').length>0){
		//make sure values are entered for all highlighted fields
		if (nlapiGetFieldValue('custbody_aiq_date').length<1){
			alert('If the Investor ID has been entered, you must also enter the AIQ Date(field 2a).');
			valid=false;
		}
	}

	return valid;
}
