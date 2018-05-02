/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Feb 2014     AHalbleib
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
function concat_id(type){
	if (type=='create'){
		if (nlapiGetContext().getExecutionContext()=='csvimport'){
			return;
		}
		else {
		filters=new Array();
		filters[0]=new nlobjSearchFilter('isinactive', null, 'is', false);
		var c1=new Array();
	    c1[0] = new nlobjSearchColumn('companyname',null);
	    var results=nlapiSearchRecord('customer',null,filters,c1);
	    var highest_id=0;
	    for (var i=0; i<results.length;i++){
	    	var curr_name=results[i].getValue(c1[0]);
	    	var curr_id=parseInt(curr_name.substring(curr_name.length-5,curr_name.length));
	    	if (curr_id!='NaN'){
	    		if (curr_id>highest_id){
	    			highest_id=curr_id;
	    		}
	    	}
	    }
	    if (highest_id>43672){
	    nlapiSetFieldValue('companyname',nlapiGetFieldValue('companyname')+' '+(highest_id+1));
	    }
	    else {
	    	nlapiSetFieldValue('companyname',nlapiGetFieldValue('companyname')+' '+43673);
	    }
		}
	}
}
