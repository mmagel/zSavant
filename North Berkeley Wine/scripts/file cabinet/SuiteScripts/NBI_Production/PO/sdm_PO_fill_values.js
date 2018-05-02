/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jun 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord purchaseorder
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
if(type == 'item'){
	
	var item_id = nlapiGetCurrentLineItemValue('item', 'item');
	var sub_type = nlapiGetCurrentLineItemValue('item', 'itemtype');
	var disc_applied = nlapiGetCurrentLineItemValue('item', 'custcol_disc_applied');
	if(sub_type == 'InvtPart'&&disc_applied!='T'){
	
		//Set Discount
		var disc = nlapiGetCurrentLineItemValue('item', 'custcoldiscpercent');
		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		var rate = nlapiGetCurrentLineItemValue('item', 'rate');
		
		if (disc == null || disc.length == 0){
			disc = 0;
		}
				
		else {
			disc = (disc.split("%"))[0];
		}
	
		if (qty == null || qty.length == 0 || isNaN(qty)){
			qty = 0;
		}
	
		if (rate == null || rate.length == 0 || isNaN(rate)){
			rate = 0;
		}
	
		amt = parseFloat( parseFloat(rate) * (1 - parseFloat(disc)/100) * parseInt(qty) );
		rate = amt/qty;
		
		rate = rate.toFixed(2);

		nlapiSetCurrentLineItemValue('item', 'custcol_disc_applied', 'T',false); 
		nlapiSetCurrentLineItemValue('item', 'rate', rate,false); 	
	}
		// Set Wholesale fields		
	if(sub_type == 'InvtPart'){
		var whsle_price = nlapiGetCurrentLineItemValue('item', 'custcol_po_whsle_price');
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('internalid', null,'is', item_id);
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custitem7'); //Bottles @ standard
		var myresult = nlapiSearchRecord('item', null, filters, columns);
		var bottles_at_std = myresult[0].getValue('custitem7');
		
		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		var rate = nlapiGetCurrentLineItemValue('item', 'rate');
		var fx = nlapiGetFieldValue('exchangerate');	
		var shipping = 15.50; // estimated shipping cost per case
	
		var current_cases = qty/bottles_at_std;
		var per_case = ((((rate*qty)/current_cases)*fx)+shipping);
		var wh_margin = ((whsle_price-per_case)/whsle_price) * 100; //Additional *100 because Netsuite field is already / 100
		var margin10 = (((whsle_price*.9)-per_case)/(whsle_price*.9)) * 100; //Additional *100 because Netsuite field is already / 100
		var retail = (((whsle_price/bottles_at_std)*1.5)*.9);
		
		if(whsle_price==0){
		alert('No Wholesale Price defined on the item record');
		wh_margin = 0;
		margin10 = 0;
		} else {
			wh_margin = Math.round(wh_margin*100)/100;
			margin10 = Math.round(margin10*100)/100;
		}
		
		if(current_cases == null){ throw alert('Item does not have a defined Bottles at Standard field');}
		if(per_case == null){ throw alert('Error in calculation, please check quantity, rate, and fx fields');}
			
		nlapiSetCurrentLineItemValue('item', 'custcol_po_case_qty', parseFloat(current_cases).toFixed(1));
		nlapiSetCurrentLineItemValue('item', 'custcol_po_cost_per_case', per_case);
	    nlapiSetCurrentLineItemValue('item', 'custcol_po_whsle_margin', wh_margin);
	    nlapiSetCurrentLineItemValue('item', 'custcol_po_margin_10_discount', margin10);
	    nlapiSetCurrentLineItemValue('item', 'custcol_po_retail_price', retail);
	   // alert('1');
		return true;
		}
	//alert('2');
	return true;
	}
//alert('3');
return true;
}
function po_field_changed(type,name,linenum){
	if (type=='item'){
		if (name=='rate'||name=='custcoldiscpercent'||name=='amount'||name=='item'){
			nlapiSetCurrentLineItemValue(type,'custcol_disc_applied','F',true);
		}
	}
}
function po_line_discount(type){
	
	if(type == 'item'){
		
	var item_type = nlapiGetCurrentLineItemValue('item', 'itemtype');
	var disc_applied = nlapiGetCurrentLineItemValue('item', 'custcol_disc_applied');
	alert(disc_applied);
	if(item_type == 'InvtPart'&&disc_applied!='T'){
	
		var disc = nlapiGetCurrentLineItemValue('item', 'custcoldiscpercent');
		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		var rate = nlapiGetCurrentLineItemValue('item', 'rate');
		
		if (disc == null || disc.length == 0){
			disc = 0;
		}
				
		else {
			disc = (disc.split("%"))[0];
		}
	
		if (qty == null || qty.length == 0 || isNaN(qty)){
			qty = 0;
		}
	
		if (rate == null || rate.length == 0 || isNaN(rate)){
			rate = 0;
		}
	
		amt = parseFloat( parseFloat(rate) * (1 - parseFloat(disc)/100) * parseInt(qty) );
		rate = amt/qty;
		
		rate = rate.toFixed(2);
		nlapiSetCurrentLineItemValue('item', 'custcol_disc_applied', 'T',false); 
		nlapiSetCurrentLineItemValue('item', 'rate', rate,false); 	
	
	}
	return true;
	}
	return true;
}
function po_before_submit(){
	if (nlapiGetFieldValue('customform')==157){
		var lines=nlapiGetLineItemCount('item');
		var listprice=parseFloat(0);
		for (var i=1;i<=lines;i++){
			nlapiSelectLineItem('item',i);
			var disc=nlapiGetCurrentLineItemValue('item','custcoldiscpercent');
			var amount=nlapiGetCurrentLineItemValue('item','amount');
			if (disc == null || disc.length == 0){
				disc = 1;
			}
			else {
				disc = parseFloat(1-(disc.split("%"))[0]/100);
			}
			nlapiSetCurrentLineItemValue('item','custcol_listprice',parseFloat((amount/disc)/nlapiGetCurrentLineItemValue('item','quantity')));
			listprice=parseFloat(parseFloat(listprice)+parseFloat(amount/disc));
			nlapiCommitLineItem('item');
		}
		nlapiSetFieldValue('custbody_listprice',listprice);
	}
}