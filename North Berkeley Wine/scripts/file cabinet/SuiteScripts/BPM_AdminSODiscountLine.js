/* ----------------------------------------------------------------------------------------------------------------
*	
Function:
	discountPercentPerQty

Business Problem:
	Client needs to be able to identify a % discount by item 

Functionality:
	Discounts (in %) the line item.
	Amount = Rate * (1 - DiscountPercent/100) * Quantity.

Deployment:
	Sales Order

Event triggering the script:
	validate Line.

Custom Fields:
	SalesOrder>Custom Column field 'custcoldiscpercent' where type = percent

Provided by Burr, Pilger, Mayer Inc. www.bpmcpa.com

*------------------------------------------------------------------------------------------------------------------
*/

function log(type, message, details)
{
  ///log to folder 6  
  var systemAdministratorId = 4;
  nlapiLogExecution (type, message, details);  
  nlapiSendEmail (systemAdministratorId, systemAdministratorId, message, details, null, null, null, null); 
}

function discountPercentPerQty()
{
  try {
	  var disc = nlapiGetCurrentLineItemValue('item', 'custcoldiscpercent');

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
  }
	return true;
}

