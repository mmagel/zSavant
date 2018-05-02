function adjust_inv() {
/*
Purpose: Create an Inventory adjustment transaction from a custom record
Deployment: Button on view of the custom record
Date: 2/4/2013
Created by SD Mayer & Associates llp.
www.sdmayer.com
*/

var adjust_account = 741
var adjust_location = 1
var cust_record_id = 'recmachcustrecord_count_line_no'
var cust_field_qty = 'custrecord_count_line_adjust'
var cust_field_item = 'custrecord_count_line_item'
var cust_field_inv_adj_ref = 'custrecord_count_adj'
var items_ray = new Array();
var qty_ray = new Array();

//Error check already ran
var error1 = nlapiGetFieldValue(cust_field_inv_adj_ref);
if(error1 > 0 ){alert('Adjustment already created');return confirm;}


//Get items with adjust qty > 0
var linecount = nlapiGetLineItemCount(cust_record_id);
	
	for (i=1;i<=linecount;++i) {
		var item = nlapiGetLineItemValue(cust_record_id, cust_field_item, [i]);
		var qty = nlapiGetLineItemValue(cust_record_id, cust_field_qty, [i]);
		
		if (qty != null && (qty > 0 || qty < 0)){
			qty_ray.push(qty)
			items_ray.push(item);
		}
	}

//Error check if no items
if(items_ray.length== 0 || items_ray.length == null){alert('No items to adjust');return confirm;}

// create inventory adjust
	var adjust_record = nlapiCreateRecord('inventoryadjustment');
	var get_no = adjust_record.getFieldValue('tranid');
	adjust_record.setFieldValue('department', 5);
	adjust_record.setFieldValue('class', 1);
	adjust_record.setFieldValue('adjlocation', adjust_location);
	
	adjust_record.setFieldValue('account', adjust_account);
	for (x=0;x<items_ray.length;++x) {
		adjust_record.setLineItemValue('inventory','item', (x+1), items_ray[x]);
		adjust_record.setLineItemValue('inventory','location', (x+1), adjust_location);
		adjust_record.setLineItemValue('inventory','adjustqtyby', (x+1), qty_ray[x]);	
                adjust_record.setLineItemValue('inventory','department', (x+1),5);	
	}

	nlapiSubmitRecord(adjust_record, true,true);
		
// set adjustment ref field on custom record

	nlapiSetFieldValue(cust_field_inv_adj_ref, get_no);
	alert('Inventory Adjustment No.' + get_no+ ' Created');
}

