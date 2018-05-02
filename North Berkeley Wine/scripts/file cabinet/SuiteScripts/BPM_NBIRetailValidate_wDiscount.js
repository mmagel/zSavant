/* ----------------------------------------------------------------------------------------------------------------
*	
Function
	NBIRetailValidate
Business Problem:
	The retail sales reps should able to specify a item discount on the line item.
Functionality:
	allows a discount by line item functionality
Deployment:
	Sales Order
Event Trigger:
	'Validate Line Function'
Custom Fields:
	Custom Sales transaction column> ID 'Custcolretaillinedisc' as percent

Provided by Burr, Pilger, Mayer, Inc.  www.bpmcpa.com
*------------------------------------------------------------------------------------------------------------------
*/


function log(type, message, details)
{
  ///log to folder 6  
  var systemAdministratorId = 4;
  nlapiLogExecution (type, message, details);  
 // nlapiSendEmail (systemAdministratorId, systemAdministratorId, message, details, null, null, null, null);
  
}

function NBIRetailValidate()
{
	var validatedSuccesfully = true;
	var validationFailedMsg = '';
	try {
		//2/4/2013 start
		var location = parseInt(nlapiGetCurrentLineItemValue('item', 'location'));
		if (location != 1)
		{
			validationFailedMsg = "Location must be set to Retail / MLK. Please modify it.";
			validatedSuccesfully = false;
		}
		//2/4/2013 end
		var disc = nlapiGetCurrentLineItemValue('item', 'custcolretaillinedisc');

		if (disc == null || disc.length == 0)
			disc = 0;
		else
			disc = (disc.split("%"))[0];

		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		  if (qty == null || qty.length == 0 || isNaN(qty))
		{
			qty = 0;
		}

		  var rate = nlapiGetCurrentLineItemValue('item', 'rate');
		if (rate == null || rate.length == 0 || isNaN(rate))
		  {
			  rate = 0;
		}
		
		  amt = parseFloat( parseFloat(rate) * (1 - parseFloat(disc)/100) * parseInt(qty) );
		nlapiSetCurrentLineItemValue('item', 'amount', amt);
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