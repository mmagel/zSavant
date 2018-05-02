function to_field_changed(type,name,linenum){	
	if (type=='item'&&name=='item'){
      try {
        if (nlapiGetRecordType()=='transferorder'){
		  var itid=nlapiGetCurrentLineItemValue('item','item');
		  if (itid!=''&&itid!=null){
				var quantsearch=nlapiSearchRecord('inventoryitem','customsearch708',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',1)],[new nlobjSearchColumn('locationquantityavailable'),new nlobjSearchColumn('locationquantitybackordered')]);
				//alert(quantsearch[0].getValue('locationquantityavailable'));
				nlapiSetCurrentLineItemValue('item','custcol_mlk_available',quantsearch[0].getValue('locationquantityavailable'));
				nlapiSetCurrentLineItemValue('item','custcol_mlk_backordered',quantsearch[0].getValue('locationquantitybackordered'));
		  }
		  else {
			  nlapiSetCurrentLineItemValue('item','custcol_mlk_available','');
				nlapiSetCurrentLineItemValue('item','custcol_mlk_backordered','');
		  }
        }
        else {
          var itid=nlapiGetCurrentLineItemValue('item','item');
		  if (itid!=''&&itid!=null){
				var quantsearch=nlapiSearchRecord('inventoryitem','customsearch812',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',2)],[new nlobjSearchColumn('locationquantityavailable'),new nlobjSearchColumn('locationquantitybackordered')]);
				//alert(quantsearch[0].getValue('locationquantityavailable'));
				nlapiSetCurrentLineItemValue('item','custcol_quantity_avail_at_vin',quantsearch[0].getValue('locationquantityavailable'));
				//nlapiSetCurrentLineItemValue('item','custcol_mlk_backordered',quantsearch[0].getValue('locationquantitybackordered'));
				var quantsearch=nlapiSearchRecord('inventoryitem','customsearch814',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',1)],[new nlobjSearchColumn('locationquantityavailable'),new nlobjSearchColumn('locationquantityonorder')]);
				 nlapiSetCurrentLineItemValue('item','custcol_quantity_onorder_mlk',quantsearch[0].getValue('locationquantityonorder'));
				 
				 var quantsearch=nlapiSearchRecord('inventoryitem','customsearch844',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',14)],[new nlobjSearchColumn('locationquantityavailable'),new nlobjSearchColumn('locationquantityonorder')]);
				 nlapiSetCurrentLineItemValue('item','custcol_vin_ret_avail',quantsearch[0].getValue('locationquantityavailable'));
				 
				 var quantsearch=nlapiSearchRecord('inventoryitem','customsearch844',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',1)],[new nlobjSearchColumn('locationquantityavailable'),new nlobjSearchColumn('locationquantityonorder')]);
				 nlapiSetCurrentLineItemValue('item','custcol_retail_mlk_available',quantsearch[0].getValue('locationquantityavailable'));
				 
				 var quantsearch=nlapiSearchRecord('inventoryitem','customsearch844',
				[new nlobjSearchFilter('internalid',null,'anyof',itid),
				 new nlobjSearchFilter('internalid','inventorylocation','anyof',[1,2,14])],[new nlobjSearchColumn('locationquantityavailable',null,'sum'),new nlobjSearchColumn('internalid',null,'group')]);
				 nlapiSetCurrentLineItemValue('item','custcol_sum_available',quantsearch[0].getValue('locationquantityavailable',null,'sum'));
		  }
		  else {
			  nlapiSetCurrentLineItemValue('item','custcol_quantity_avail_at_vin','');
			   nlapiSetCurrentLineItemValue('item','custcol_quantity_onorder_mlk','');
				//nlapiSetCurrentLineItemValue('item','custcol_mlk_backordered','');
		  }
        }
      }
      catch(e){
        
      }
	}
}