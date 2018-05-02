/* ----------------------------------------------------------------------------------------------------------------
*	
Function
	NBISalesValidate
Business Problem:
	Based on the client's location | Sub-location relationships, employee restrictions could not be used to appropriately restrict sales rep
	From selling inventory from the appropriate location and;
	Advanced inventory is used, however based on their actual inventory, back orders can not be allowed.
Functionality:
	This script prevent's processing sales orders if the available qty is less than the purchased ammount and;
	restricts item sales from the Sales Reps location or Standard Location (VinLux)
Deployment:
	Sales Order
Event Trigger:
	'Validate Line Function'
Custom Fields:
	Sales Order> Custom body field ('custbody_salesreploc') where the current user's location is default value and not editable.

Provided by Burr, Pilger, Mayer, Inc.  www.bpmcpa.com
*------------------------------------------------------------------------------------------------------------------
*/


function log(type, message, details)
{
  ///log to folder 6  
  var systemAdministratorId = 4;
  nlapiLogExecution (type, message, details);  
  nlapiSendEmail (systemAdministratorId, systemAdministratorId, message, details, null, null, null, null);
  
}

function NBISalesValidate()
{
	var validatedSuccesfully = true;
	var validationFailedMsg = '';
	try {
		var qty = parseInt(nlapiGetCurrentLineItemValue('item','quantity'));
		var availQty = parseInt(nlapiGetCurrentLineItemValue('item', 'quantityavailable'));

		if (qty>availQty)
		{
			validationFailedMsg = "Order quantity can not be greater than available quantity. Please modify it.";
			validatedSuccesfully = false;
		}
	
		var reploc = nlapiGetFieldText('custbody_salesreploc')
		if (reploc == null)
		{
			validationFailedMsg = 'Please define a location for this Sales Rep';
			validatedSuccesfully = false;
		}
	
		var itemloc = nlapiGetCurrentLineItemText('item', 'location')	
		if (!(itemloc==reploc || itemloc=="Vinlux"))
		{
			validationFailedMsg = 'You do not have access to this location';
			validatedSuccesfully = false;
		}
	}
	catch (e) {
	    if (e instanceof nlobjError) 
			log('ERROR', 'system error', e.getCode() + '\n' + e.getDetails())
		else 
			log('ERROR', 'unexpected error', e.toString())	
		validationFailedMsg = 'Error occurred during the execution. Please contact system administrator.';
	  validatedSuccesfully = false;
	}
	if (!validatedSuccesfully ) {
		alert(validationFailedMsg);
	}
	return validatedSuccesfully;
}

function Linetovinlux()
{
var location = 'vinlux'
nlapiSetCurrentLineItemValue('item', 'location', location)

}