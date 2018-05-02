function loan_traunch_validate_line(type){
	if (type=='item'){
		if (nlapiGetLineItemCount('item')>0){
			return false;
		}
	var quantity=nlapiGetCurrentLineItemValue('item','quantity');
	var amount=nlapiGetCurrentLineItemValue('item','amount');
	var text_date=nlapiGetFieldValue('custbody_sdm_loan_issue_date');
	var alloc=nlapiGetFieldText('custbody_sdm_contract_alloc');
	var pct=parseFloat(alloc.substring(0,alloc.length-1))*.01;
	if (amount!=null && alloc!=null && quantity!=null && text_date!=null && amount.length>0 
			&& quantity.length>0 && alloc.length>0 && text_date.length>0){
		var ref_date=new Date(text_date);
		var total=0;
		var calcs='';
		for (var i=0; i<=quantity; i++){
			date=nlapiAddMonths(ref_date,i);
			var month=date.getMonth()+1;
			var year=date.getFullYear();
			var days=0;
			if (i>0 && i<quantity){
				days=get_last_day(month,year);
			}
			else if (i==0){
				days=get_last_day(month,year)-date.getDate()+1;

			}
			else {
				days=date.getDate()-2;
			}
			var curr=(.04/365)*days*amount*pct;
			calcs+=curr+' ';
			total+=curr;
			if (i==quantity){
				alert(date.getDate()+' '+curr);
			}

		}
		nlapiSetCurrentLineItemValue('item','custcol_sdm_total_fees',total,false);
		nlapiSetFieldValue('custbody_sdm_calculations',calcs);
		//nlapiCommitLineItem('item');
	}
	else {
		return false;
	}
	}
	  return true;
}
function get_last_day(month,year){
	if (month=='1'||month=='3'||month=='5'||month=='7'||month=='8'||month=='10'||month=='12'){
		return 31;
	}
	else if(month=='4'||month=='6'||month=='9'||month=='11'){
		return 30;
	}
	else if (month=='2'){
		if (year%4==0){
			return 29;
		}
		else {
			return 28;
		}
	}
}