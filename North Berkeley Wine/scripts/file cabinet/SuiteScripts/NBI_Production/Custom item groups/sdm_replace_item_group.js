/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Apr 2014     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
//37827
function set_approved(){
	var form = nlapiGetFieldValue('customform');
	//run only on retail forms # 105, 152
	if(form == 152){		
		nlapiSetFieldText('orderstatus', 'Pending Fulfillment', true, true);
	}
	
}


function replace_items(type){
 
	var form = nlapiGetFieldValue('customform');
	//run only on retail forms # 105, 152
	
	if(type == 'item' && (form == 105 || form == 152)){
		
		var item_group = nlapiGetCurrentLineItemValue('item', 'item');
		var item_type = nlapiGetCurrentLineItemValue('item', 'itemtype');
		
		if(item_type == 'Group'){
			
			//Error check if no group price on item group record
			var item_price = nlapiLookupField('itemgroup', item_group, 'custitem_sdm_group_price');
			if(isEmpty(item_price)){
				alert('No item group price defined. Default group and pricing shown');
				return true;
			}
			
			//Error check no quantity on the form
			var group_qty = nlapiGetCurrentLineItemValue('item', 'quantity');
			if (isEmpty(group_qty) || group_qty == 0){
				alert('Item Group Must have a Quantity');
				return false;
			}
			
			//Search for item group items
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('internalid', null, 'is', item_group);
			var columns = new Array();
			columns[0] = new nlobjSearchColumn('memberitem').setSort(false);
			columns[1] = new nlobjSearchColumn('memberquantity');
			
			var search_results = nlapiSearchRecord('item', null, filters, columns);

			//let NS handle if no items on record
			if(isEmpty(search_results)){
				return true;
				}
			
			var total = 0;
			for (var n = 0; search_results != null && n < search_results.length; n++){
				var n_result = search_results[n];
				var item = n_result.getValue('memberitem');
				var this_item_type = nlapiLookupField('item', item, 'type');

				if(this_item_type == 'InvtPart'){
					//get retail price
					var n_filters = new Array();
						n_filters[0] = new nlobjSearchFilter('internalid', null, 'is', item);
					var search_price = nlapiSearchRecord('item', 'customsearch_sdm_retail_price_list', n_filters, null);
					var price_result = search_price[0];
					var price_col = price_result.getAllColumns();
					var rate = price_result.getValue(price_col[0]);
					var qty = n_result.getValue('memberquantity');
					var amount = qty * rate;
					total = total + amount;
					}
				}
				
				//what's the calculated even discount by bottle
				var disc = ((1- (item_price / total))*100); //discount to apply at item line level
				disc = disc.toFixed(8);
				
				//Retail can not sell at higher than a 50% discount, prevent it
				if(disc > 50) {
					alert('Item group is discounted greater than 50%, please reset item group price');
					return false;
					}
				
				if(disc < 0) {
					alert('Item group pricing is not a discount.  Standard pricing will be used');
					disc = 0;
				}
				
				if(search_results.length == 1){
					//if item group only has 1 item
					var one_result = search_results[0];
					var item = one_result.getValue('memberitem');
					var qty = one_result.getValue('memberquantity');
					qty = qty * group_qty; //if Ordering more than 1 group
					nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
					nlapiSetCurrentLineItemValue('item', 'quantity', qty, true, true);
					nlapiSetCurrentLineItemValue('item', 'custcolretaillinedisc', disc, true, true);
					var last = nlapiGetCurrentLineItemIndex('item');
					nlapiCommitLineItem('item');
				
				} else {
				
					//Commit items with discounts
					for (var p = 0; p < search_results.length; p++){
						
					var p_result = search_results[p];
					var item = p_result.getValue('memberitem');
					var qty = p_result.getValue('memberquantity');
						
					qty = qty * group_qty; //if Ordering more than 1 group
						
					this_item_type = nlapiLookupField('item', item, 'type');
				
					if(this_item_type == 'InvtPart'){
						if(p == 0){ //if this is an inventory item
							//if first item
							nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
							nlapiSetCurrentLineItemValue('item', 'quantity', qty, true, true);
							nlapiSetCurrentLineItemValue('item', 'custcolretaillinedisc', disc, true, true);
							nlapiCommitLineItem('item');
							} else if(p == (search_results.length - 1)){
								//if last item
								nlapiSelectNewLineItem('item');
								nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
								nlapiSetCurrentLineItemValue('item', 'quantity', qty, true, true);
								nlapiSetCurrentLineItemValue('item', 'custcolretaillinedisc', disc, true, true);
								var last = nlapiGetCurrentLineItemIndex('item');
								nlapiCommitLineItem('item');
							} else {
								//if any items inbetween
								nlapiSelectNewLineItem('item');
								nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
								nlapiSetCurrentLineItemValue('item', 'quantity', qty, true, true);
								nlapiSetCurrentLineItemValue('item', 'custcolretaillinedisc', disc, true, true);
								nlapiCommitLineItem('item');
							}
						} else { //If other than item, Description, discount, etc.
							if(p == 0){
								//if first item
								nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
								nlapiCommitLineItem('item');
							} else if(p == (search_results.length - 1)){
								//if last item
								nlapiSelectNewLineItem('item');
								nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
								var last = nlapiGetCurrentLineItemIndex('item');
								nlapiCommitLineItem('item');
							} else {
								//if any items inbetween
								nlapiSelectNewLineItem('item');
								nlapiSetCurrentLineItemValue('item', 'item', item, true, true);
								nlapiCommitLineItem('item');
							}
						}
					}	
				}
				//Selected the last line after commit to prevent pop up from the return true statement
				nlapiSelectLineItem('item', last);
		}
	}
	return true;
}


function isEmpty(stValue) {
	//used to identify blank fields
		if ((stValue == '') || (stValue == null) ||(stValue == undefined))
	    {
	    return true;
	    }
	    return false;
	}
