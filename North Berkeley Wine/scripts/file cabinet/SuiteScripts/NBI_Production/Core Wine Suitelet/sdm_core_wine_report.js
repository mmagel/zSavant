/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Aug 2013     cblaisure
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function Core_report(type) {

	
	if(type == 'undefined') {
		
		var context = nlapiGetContext();
		var user_email = context.getEmail();
	
	} else {
		
		var user_email = 'levine@northberkeleyimports.com';
				
	}
	
	sales_results = nlapiSearchRecord(null, 'customsearch_core_sales_3', null, null);
	avail_results = nlapiSearchRecord(null, 'customsearch_core_item_available', null, null);	

	var sales_result = sales_results[0];	
	var columns = sales_result.getAllColumns();
	
	var row_num = 1;
	
	var html_ray = new Array();
	var htmlrow = ''; 
	
	html_ray[0] = '<table border="1"><tr><th>Core Wine</th><th>Country</th><th>QTY Sold</th><th>Monthly Average</th><th>Available</th><th>On Hand</th><th>On Order</th></tr><tr><td>';

	for (var a=0; a < sales_results.length; a++){
		
		var sales_result = sales_results[a];
		var columns = sales_result.getAllColumns();
		var new_item = sales_result.getValue(columns[0]);
		var qty_sold = sales_result.getValue(columns[1]);
		qty_sold = parseInt(qty_sold);
		var year_ave = qty_sold / 12;
		year_ave = year_ave.toFixed(0);
		var country = sales_result.getText(columns[2]);
		
		for (var b=0; b<=avail_results.length; b++){
			var avail_row = avail_results[b];
		
			if(!(avail_row == null)){
			
			var avail_columns = avail_row.getAllColumns();
			var avail_item = avail_row.getValue(avail_columns[0]);
				if(avail_item == new_item) {
					var avail_qty = avail_row.getValue(avail_columns[1]);
					var avail_onhand = avail_row.getValue(avail_columns[2]);
					var avail_onorder = avail_row.getValue(avail_columns[3]);
					b = avail_results.length + 1;
					}
				}
		}
		
		htmlrow = new_item + '</td><td>' + country + '</td><td>' + qty_sold + '</td><td>' + year_ave + '</td><td>' + avail_qty + '</td><td>' + avail_onhand + '</td><td>' + avail_onorder + '</td>' + '</tr><tr>'; 
		
		html_ray[row_num] = htmlrow;
		
		row_num = row_num + 1;
		
		qty_sold = 0;
		year_ave = 0;
		avail_qty = 0;
		avail_onhand = 0;
		avail_onorder = 0;
		
	}
	
	html_ray[row_num] = htmlrow + '</tr></table>';
	
	nlapiSendEmail(-5,user_email,'12 Month Core Wine Report', html_ray);
		
}
