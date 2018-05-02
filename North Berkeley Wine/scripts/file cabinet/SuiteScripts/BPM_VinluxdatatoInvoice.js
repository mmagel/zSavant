/* ----------------------------------------------------------------------------------------------------------------
*	
Function:
	vinluxdatatoinvoice

Business Problem:
	Client needed to source various customer information onto the Invoice form, including:
		Delivery times as defined on the customer record 
		Item count from Invoice
		Days in correct format
		
Functionality:
	Counts the line items and places the value on the invoice
	Pulls delivery times defined on the customer record
		If no time define; default ship times of 080000 - 170000
		If 999999 - then do not allow processing of order as customer does not ship on those days
		Else use customer defined delievery time.
	Copies dates in correct format
	
Deployment:
	Invoice

Event triggering the script:
	Save Record Function

Custom Fields:
	20 Entity fields>Customer, from custentity13 to custentity32 defined as mon - fri delievery windows
	8 transaction body fields> Sale,
		ID 'custbodyitemcount'
		ID 'custbody2' to 'custbody5' for each delievery window
		ID 'custbody6' - For Ship Date
		ID 'custbody7' - For Invoice Date
		ID 'custbody8' - For Due Date
		
Provided by Burr, Pilger, Mayer Inc. www.bpmcpa.com	
*------------------------------------------------------------------------------------------------------------------
*/

function log(type, message, details)
{
  ///log to folder 6  
  var systemAdministratorId = 4;
  nlapiLogExecution (type, message, details);  
  //nlapiSendEmail (systemAdministratorId, systemAdministratorId, message, details, null, null, null, null);
  
}

function vinluxdatatoinvoice()
{
  try {
    // defaultDeliveryTiming
    var defaultDelivery = new Array();
    defaultDelivery[0] = '080000';
    defaultDelivery[1] = '170000';
    defaultDelivery[2] = '';
    defaultDelivery[3] = '';
    
  	// Get item Count, set field
  	var LineCount = 0;
  	var TotalLineCount = nlapiGetLineItemCount('item');
  	for (i=1;i<=TotalLineCount;++i) {		  
      itemType = nlapiGetLineItemValue('item', 'itemtype', i);
      if (itemType == 'InvtPart') {
        LineCount = LineCount + 1;
      }
  	}
  	nlapiSetFieldValue('custbodyitemcount', LineCount, true);	
  	
  	// Set Ship Times by ship date
  	
  	var shipDate = nlapiGetFieldValue('shipdate');
  	var dayOfWeek = (new Date(shipDate)).getDay();
  	
  	var deliveryWindowFields = new Array();
  	for (i=0;i<4;++i) { 
  	  deliveryWindowFields[i] = 'custentity' + ((dayOfWeek * 4)+9 + i);
  	}	
  		
  	var customer_id = nlapiGetFieldValue("entity");
  	var deliveryWindow = nlapiLookupField('customer',customer_id, deliveryWindowFields);
  
  	if (nlapiLookupField('customer',customer_id, deliveryWindowFields[0])==999999)
  	{
  	alert("This customer does not accept shipments on the shipping day selected. Please select another ship date");
  	return;
  	}
  	else
  	{
    	for (i in deliveryWindowFields) {
        deliveryTimeItem = deliveryWindow[deliveryWindowFields[i]];
		deliveryTimeItem = ((deliveryTimeItem =='') || (deliveryTimeItem == '0')) ? defaultDelivery[i] : deliveryTimeItem;
    	fieldName = 'custbody' + (2 + i*1);
        nlapiSetFieldValue(fieldName, deliveryTimeItem, true);
    	
    	  //  Alert user of default time usage
    	  if(i == 0 && deliveryTimeItem == defaultDelivery[i]){
			//start edit (3.19.2013 disabled alert per Jon Levin request)
			//alert("No shipping time defined for this customer on the selected shipping date, default shipping time assigned");
			//end edit
		}
    	}
    	// set days with correct format
    	
		var vlship = new Date(nlapiGetFieldValue('shipdate'));
		var vlinvoice = new Date(nlapiGetFieldValue('trandate'));
		var vlnet30 = new Date(nlapiGetFieldValue('shipdate'));
		
		vlnet30.setMonth(vlnet30.getMonth() + 1);
	
		nlapiSetFieldValue('custbody6', vlship.format("m/d/Y").toString(), true);
		nlapiSetFieldValue('custbody7', vlinvoice.format("m/d/Y").toString(), true);
		nlapiSetFieldValue('custbody8', vlnet30.format("m/d/Y").toString(), true);
		
		return confirm;
  	}
  } 
  catch (e) {
      if (e instanceof nlobjError) 
  		log('ERROR', 'system error', e.getCode() + '\n' + e.getDetails())
  	else 
  		log('ERROR', 'unexpected error', e.toString())	
  }  
	return false;
}
