/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 May 2013     cblaisure
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

function retail_rep_line_validate(type){
	//error catch no customer
	var cust = nlapiGetFieldValue('entity');
	if(cust < 1 || cust == null) {
		nlapiCancelLineItem('item');
		throw alert('A customer must be specified before adding items');
		}
		
	var type = nlapiGetCurrentLineItemValue('item', 'itemtype');
	
	if(type == 'InvtPart'){
	
		var disc = nlapiGetCurrentLineItemValue('item', 'custcolretaillinedisc');
		var qty = nlapiGetCurrentLineItemValue('item', 'quantity');
		var rate = nlapiGetCurrentLineItemValue('item', 'custcolsdm_ns_rate');
		
		if (disc == null || disc.length == 0){
			disc = 0;}
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
		
		rate = rate.toFixed(5);
		
		nlapiSetCurrentLineItemValue('item', 'price', -1, false);
			
		nlapiSetCurrentLineItemValue('item', 'rate', rate); 

    
  // get qty @ locations - added by rBender @ 9/1/2017
        var internalID = nlapiGetCurrentLineItemValue('item', 'item');

        var inventoryLocation = 14;  //Vinlux : Retail = 14 
        var filters = new Array();
        filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
        filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('locationquantityonorder'); 
        var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
        if (srchRslts != null && srchRslts.length > 0) {
            qtyOnOrder = srchRslts[0].getValue(columns[0]);
        } else {qtyOnOrder=0;}
        //console.log('onorderqty = '+qtyOnOrder);
        //if (qtyOnOrder==''||qtyOnOrder==null){qtyOnOrder = 0;}
        nlapiSetCurrentLineItemValue('item', 'custcol29', qtyOnOrder);


        inventoryLocation = 1;  // Retail / MLK=1
        //var filters = new Array();
        //filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
        filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
        //var columns = new Array();
        columns[1] = new nlobjSearchColumn('locationquantitybackordered');  
        var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
        if (srchRslts != null && srchRslts.length > 0) {
            qtyBackOrdered = srchRslts[0].getValue(columns[1]); 
        } else {qtyBackOrdered=0;}
        //if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
        nlapiSetCurrentLineItemValue('item', 'custcol30', qtyBackOrdered);
  // end add
      
    }
		

    return true;
}
function check_card_on_save(){

var cc_approved = nlapiGetFieldValue('ccapproved');
var cc_charge = nlapiGetFieldValue('chargeit');
var card = nlapiGetFieldValue('creditcard');
   
	if(cc_approved == 'T' && cc_charge == 'F' && card > 1) {
		
		var x = confirm('Are you sure you want to charge the selected Credit Card through Netsuite?');
		
		if(x == false) {return false;}
	}
	
	var location = nlapiGetFieldValue('location');
	if(location != 1){
		alert('Location must be set to Retail / MLK');
		return false;	
	}
	
	
	return true;
}

// page init
function start_disable(){

	nlapiDisableLineItemField('item','amount',true);
	nlapiDisableLineItemField('item','rate', true);
	
    // Begin populating Retail location's On Order & MLK location's Back Ordered - rBender @ 9/6/2017
    var role = nlapiGetRole();
    if (role==3){	//(type=='view'||type=='edit') &&
      console.log('the admin is on the retails sales form');
        //var rec=nlapiSearchRecord('salesorder',null,new nlobjSearchFilter('internalid',null,'is',nlapiGetRecordId()),new nlobjSearchColumn('customform'));
        var form_no=nlapiGetFieldValue('customform'); //rec[0].getValue('customform');
        nlapiLogExecution('DEBUG',type,form_no);
        if (form_no == 105){    // 105 = Retail S.O.
            var lines = nlapiGetLineItemCount ( 'item' );
            var qtyOnOrder = '';
            var qtyBackOrdered = '';

            var inventoryLocation = 14;  //Vinlux : Retail = 14             
            for (i=1; i-1<lines; i++){
                var internalID = nlapiGetLineItemValue('item', 'item', i);
                var filters = new Array();
                filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
                filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
                var columns = new Array();
                columns[0] = new nlobjSearchColumn('locationquantityonorder'); 
                var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
                if (srchRslts != null && srchRslts.length > 0){
                    qtyOnOrder = srchRslts[0].getValue(columns[0]);
                }
                //if (qtyOnOrder == null || qtyOnOrder == ''){ qtyOnOrder=0;}
                nlapiLogExecution('DEBUG', 'qtyOnOrder', 'qtyOnOrder='+qtyOnOrder);
                nlapiSetLineItemValue ( 'item' , 'custcol29' , i , qtyOnOrder );
            }

            var inventoryLocation = 1;  //  MLK:Retail = 1             
            for (i=1; i-1<lines; i++){
                var internalID = nlapiGetLineItemValue('item', 'item', i);
                var filters = new Array();
                filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
                filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
                var columns = new Array();
                columns[0] = new nlobjSearchColumn('locationquantitybackordered');

                var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
                if (srchRslts != null && srchRslts.length > 0){
                    qtyBackOrdered = srchRslts[0].getValue(columns[0]);
                }
                //if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
                nlapiLogExecution('DEBUG', 'qtyBackOrdered', ' qtyBackOrdered='+qtyBackOrdered);
                nlapiSetLineItemValue ( 'item' , 'custcol30' , i , qtyBackOrdered );
            }            
        }
    //return true;
    }
// END - rBender @ 9/1/2017
  
  
}

function line_disable(){

	nlapiDisableLineItemField('item','amount',true);
	nlapiDisableLineItemField('item','rate', true);
	
}



function check_location_on_save(){
	
	var location = nlapiGetFieldValue('location');
	
	if(location != 1){
		alert('Location must be set to Retail / MLK');
		return false;
	}
return true;
	
}




