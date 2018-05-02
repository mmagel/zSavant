/**
 * Module Description
 * 
 * Script is deployed on sales transactions and is used to default "bill to" address on the transaction 
 * based on the selection of a property.  The property name text is compared to the customer addressbook 
 * where label = property name.
 * 
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Oct 2013     cblaisure
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord estimate
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function set_property_bill_to(type, name, linenum) {
   
	var customer = nlapiGetFieldValue('entity');
	
	if(name == 'custbody_aw_property' && customer > 1){
		var property = nlapiGetFieldText('custbody_aw_property');
		
		//search on customer record where label of address = property
		
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('internalid', null, 'is', customer);
		filters[1] = new nlobjSearchFilter('addresslabel', null, 'is', property);
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('addressinternalid');
		var address_ray = nlapiSearchRecord('customer', null, filters, columns);
		
		//get default address
		
		var filters2 = new Array();
		filters2[0] = new nlobjSearchFilter('internalid', null, 'is', customer);
		filters2[1] = new nlobjSearchFilter('isdefaultbilling', null, 'is', 'T');
		var columns2 = new Array();
		columns2[0] = new nlobjSearchColumn('addressinternalid');
		var default_ray = nlapiSearchRecord('customer', null, filters2, columns2);
			
		if(address_ray != null){
			var address = address_ray[0].getValue(columns[0]);
			nlapiSetFieldValue('billaddresslist', address);
		
		} else if(default_ray != null){
			var default_result = default_ray[0].getValue(columns2[0]);
			nlapiSetFieldValue('billaddresslist', default_result);
		
		} else {
			nlapiSetFieldValue('billaddresslist', '');
		}
				
	}
}
