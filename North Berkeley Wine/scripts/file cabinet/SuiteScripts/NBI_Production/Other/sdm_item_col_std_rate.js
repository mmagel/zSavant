/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2013     cblaisure
 * 
 * Description: Used to populate a static price that does not change to multiply discounts off of.
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord salesorder
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function set_std_price(type, name, linenum){
 
	if (type == 'item' && name == 'item'){
		
		var initial = nlapiGetCurrentLineItemValue('item', 'rate');
		var type = nlapiGetCurrentLineItemValue('item', 'itemtype');
		var ns_rate = nlapiGetCurrentLineItemValue('item', 'custcolsdm_ns_rate');
		var pricelevel = nlapiGetCurrentLineItemValue('item', 'price');
		
		// is custom : pricelevel != -1
		// is Wine: type == 'InvtPart'
		
		if(type == 'InvtPart' && pricelevel != -1){
					
			nlapiSetCurrentLineItemValue('item', 'custcolsdm_ns_rate', initial);
		}
			
	}	
	return true;
}

function so_vf(type,name,linenum){
	//nlapiGetFieldValue('customform')==138||
	if (type=='item'&&name=='isclosed'&&nlapiGetRole()!=3){
		return false;
	}
	if (nlapiGetUser()==11278){
		//alert(nlapiGetFieldValue('customform')+' aaa');
	}
	if (nlapiGetFieldValue('customform')==138){
		if (nlapiGetUser()==11278){
			//alert(type+' '+name);
		}
		if (type=='item'&&name=='price'){
			var pl=nlapiGetCurrentLineItemText(type,name);
			if (pl=='BTG Pricing'||pl=='Wholesale Frontline'||pl=='Wholesale 10%'){
				var entity=nlapiGetFieldValue('entity');
				var plnum='';
				if (entity!=''&&entity!=null)
					plnum=nlapiLookupField('customer',entity,'pricelevel');
				if (plnum==6&&pl=='BTG Pricing'){
					return false;
				}
				else {
					return true;
				}
			}
			else {
				return false;
			}
		}
	}
	
	return true;
}