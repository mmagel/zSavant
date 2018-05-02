/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Mar 2014     cblaisure
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function wine_club(recType, customer) {

var item_group = nlapiGetContext().getSetting('SCRIPT',  'custscriptsdm_item_group');
var item_price = nlapiGetContext().getSetting('SCRIPT',  'custscriptsdm_item_price');
var memo = nlapiGetContext().getSetting('SCRIPT',  'custscriptsdm_wine_club_memo');
var sales_rep = nlapiLookupField('customer', customer, 'salesrep', false);
var item_type = nlapiLookupField('item', item_group, 'type', true);

if(item_type != 'Item Group'){
	return; //end update
}

if(item_price < 1){
	return; //end update
}

//create so, add main line fields
new_so = nlapiCreateRecord('salesorder');
	new_so.setFieldValue('customform', 105); //retail SO Form
	new_so.setFieldValue('entity', customer);
	new_so.setFieldValue('salesrep', sales_rep);
	new_so.setFieldValue('department', 5);
	new_so.setFieldValue('location', 1);
	new_so.setFieldValue('memo', memo);
	new_so.setFieldText('orderstatus', 'Pending Fulfillment'); 
	new_so.setFieldValue('tobeprinted', 'T');
	
//get item information
var filters = new Array();
filters[0] = new nlobjSearchFilter('internalid', null, 'is', item_group);
var columns = new Array();
columns[0] = new nlobjSearchColumn('memberitem');
columns[1] = new nlobjSearchColumn('memberquantity');

var search_results = nlapiSearchRecord('item', null, filters, columns);

//if no results end update
if(isEmpty(search_results)){
	return;
}


//calculate discount off each item
var total = 0;
for (var n = 0; search_results != null && n < search_results.length; n++){
	var n_result = search_results[n];
	
	//get retail price
	var item = n_result.getValue('memberitem');
	
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

var disc = (item_price / total)*100; //discount to apply at item line level

	if (disc == null || disc.length == 0){
		disc = 1;}
	if ((1 - disc) > 50) {
		disc = 50;
		}

//set line items
new_so.selectNewLineItem('item');

for (var x = 0; search_results != null && x < search_results.length; x++){
	
	var result = search_results[x];
	var item = result.getValue('memberitem');
	var qty = result.getValue('memberquantity');
	
	var n_filters = new Array();
	n_filters[0] = new nlobjSearchFilter('internalid', null, 'is', item);
	var search_price = nlapiSearchRecord('item', 'customsearch_sdm_retail_price_list', n_filters, null);
	var price_result = search_price[0];
	var price_col = price_result.getAllColumns();
	var rate = price_result.getValue(price_col[0]);
	
	new_so.setCurrentLineItemValue('item', 'item', item);
	new_so.setCurrentLineItemValue('item', 'quantity', qty);
	new_so.setCurrentLineItemValue('item', 'custcolsdm_ns_rate', rate); //set old rate field
	new_so.setCurrentLineItemValue('item', 'custcolretaillinedisc', (100 - disc));

	//calculate rate field and set price level
	amt = parseFloat(parseFloat(rate) * (parseFloat(disc)/100) * parseInt(qty));
	rate = amt/qty;
	rate = rate.toFixed(3);
	
	new_so.setCurrentLineItemValue('item', 'price', -1);
	new_so.setCurrentLineItemValue('item', 'rate', rate);	
	
	new_so.commitLineItem('item');
	new_so.selectNewLineItem('item');
	
	}
	var soid=nlapiSubmitRecord(new_so, true, false);
	var so_rec=nlapiLoadRecord('salesorder',soid);
	nlapiSubmitRecord(so_rec,true,false);
}

function isEmpty(stValue) {
	//used to identify blank fields
		if ((stValue == '') || (stValue == null) ||(stValue == undefined))
	    {
	    return true;
	    }
	    return false;
	}