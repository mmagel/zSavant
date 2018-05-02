function addAvailable() {
/*
Purpose: Populate fields of available inventory and adjust qty by on custom record line level
Deployment: Button on edit view of custom record 
Date: 2/8/2013
Created by SD Mayer & Associates llp.
www.sdmayer.com
*/ 
	var searchid = 'customsearch_count_search';
	var cust_rec_id = 'recmachcustrecord_count_line_no';
	var cust_field_item = 'custrecord_count_line_item';
	var cust_field_avail = 'custrecord_count_line_available';
	var cust_field_count_qty = 'custrecord_count_line_qty';
	var cust_field_adj_qty = 'custrecord_count_line_adjust';

	var count1 = 'custrecord_count_line_wh1';
	var count2 = 'custrecord_count_line_wh2';

	var count3 = 'custrecord_count_line_fl1';
	var count4 = 'custrecord_count_line_fl2';
	var count5 = 'custrecord_count_line_fl3';

	var filters = new Array();
	filters[0] = new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto',0 );
	filters[1] = new nlobjSearchFilter('inventorylocation', null, 'is', 1);

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid').setSort(false);
	columns[1] = new nlobjSearchColumn('locationquantityonhand');
	results=new Array();
	results[0]= nlapiSearchRecord('item', null, filters, columns );
	var i=1;
	while (results[i-1]!=null){
		var lastid=parseInt(results[i-1][results[i-1].length-1].getValue('internalid'));
		filters[0]= new nlobjSearchFilter('internalidnumber', null, 'greaterthanorequalto',lastid+1 );
		results[i]= nlapiSearchRecord('item', null, filters, columns );
		i++;
	}
	

//Go through each item on custom record
	var LineCount = nlapiGetLineItemCount(cust_rec_id);
	
	for (var i=1;i<=LineCount;++i) {
		//set total qty counted
		var get1 = nlapiGetLineItemValue(cust_rec_id, count1, [i]);
		var get2 = nlapiGetLineItemValue(cust_rec_id, count2, [i]);
		var get3 = nlapiGetLineItemValue(cust_rec_id, count3, [i]);
		var get4 = nlapiGetLineItemValue(cust_rec_id, count4, [i]);
		var get5 = nlapiGetLineItemValue(cust_rec_id, count5, [i]);
		
		if(get1 == ''){get1 = 0;}
		if(get2 == ''){get2 = 0;}
		if(get3 == ''){get3 = 0;}
		if(get4 == ''){get4 = 0;}
		if(get5 == ''){get5 = 0;}
		var totalcount = parseInt(get1) + parseInt(get2) + parseInt(get3) + parseInt(get4) + parseInt(get5);
			
		nlapiSetLineItemValue(cust_rec_id, cust_field_count_qty, [i], totalcount);
		
		//set available amount

		var item = nlapiGetLineItemValue(cust_rec_id, cust_field_item, [i]);
		var qty=0;
		for (var n=0; n<results.length;n++){
			if (results[n]!=null){
				var first=parseInt(results[n][0].getValue('internalid'));
				var last=parseInt(results[n][results[n].length-1].getValue('internalid'));
				if (item>=first&&item<=last){
					for (var j=0;j<results[n].length; j++){
						var id=results[n][j].getValue('internalid');
						if (item==id){
							if (results[n][j].getValue('locationquantityonhand').length>0){
								qty+=parseInt(results[n][j].getValue('locationquantityonhand'));
							}
							break;
						}
					}
				}
			}
		}

		if(qty != null){
			nlapiSetLineItemValue(cust_rec_id, cust_field_avail, [i] ,qty);
		} else {
			qty = 0;
		}
		
		// set adjustment quantity
		var adj = totalcount - qty;
		nlapiSetLineItemValue(cust_rec_id, cust_field_adj_qty, [i], adj);
		
	}
}