/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Jul 2013     cblaisure
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function core_wine_list(request, response){

	
	var list = nlapiCreateList('12 Month Core Wine Report', false);
		list.addColumn('item', 'text', 'Core Wine', 'left');
		list.addColumn('country_col', 'text', 'Country', 'left');
		list.addColumn('sold', 'integer', 'Quantity Sold', 'left');
		list.addColumn('ave', 'integer', 'Monthly Average', 'left');
		list.addColumn('avail', 'integer', 'Available', 'left');
		list.addColumn('on_hand', 'integer', 'On Hand', 'left');
		list.addColumn('on_order', 'integer', 'On Order', 'Left');
		
		
		list.setScript('customscript_sdm_core_report_email');
		list.addButton('email', 'E-Mail Me', 'Core_report()');
		
		
	sales_results = nlapiSearchRecord(null, 'customsearch_core_sales_3', null, null);
	avail_results = nlapiSearchRecord(null, 'customsearch_core_item_available', null, null);	
	
	var row_num = 0;
	
	var display_row = new Array();
		
	for (var a=0; a < sales_results.length; a++){
		
		// get search values
		
		var sales_result = sales_results[a];
		var columns = sales_result.getAllColumns();
		var new_item = sales_result.getValue(columns[0]);
		var qty_sold = sales_result.getValue(columns[1]);
		qty_sold = parseInt(qty_sold);
		var year_ave = qty_sold / 12;
		year_ave = year_ave.toFixed(0);
		var item_country = sales_result.getText(columns[2]);
		
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

		
		display_row[row_num] = new Array();
		
		display_row[row_num].item = new_item;
		display_row[row_num].country_col = item_country;
		display_row[row_num].sold = qty_sold;
		display_row[row_num].ave = year_ave;
		display_row[row_num].avail = avail_qty;
		display_row[row_num].on_hand = avail_onhand;
		display_row[row_num].on_order = avail_onorder;
		
		row_num = row_num + 1;
		
		qty_sold = 0;
		year_ave = 0;
		avail_qty = 0;
		avail_onhand = 0;
		avail_onorder = 0;
		
		}
		
	
	 	list.addRows(display_row);
		response.writePage(list);
}