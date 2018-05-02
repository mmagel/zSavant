/*

If the SO is edited, viewed, OR a line is entered THEN
a script will grab the item's qty on order in location 3
and update the column

column that pulls the ON ORDER quantity from the location  Vinlux:Retail. Called 'On Order Retail'.
column which show the quantity backordered at location Retail/MLK. Called 'Backordered MLK'.

*/

//var rec=nlapiLoadRecord('salesorder',7315);

// get line item's item internalid
//itemid = nlapiGetCurrentLineItemValue('item', 'item')

//USER EVENT script - before load?
//if EDITing or VIEWing SO then cycle through each item & assign col
function updatelineitemsonordercol(){
    var custform = nlapiGetFieldValue('customform');
    if ((type=='view'||type=='edit') && custform == 174 ){
        var inventoryLocation = 3;
        var lines = nlapiGetLineItemCount ( 'item' );
        var qtyOnOrder = '';
        var qtyBackOrdered = '';
        for (i=1; i-1<lines; i++){
            //nlapiSelectLineItem ( 'item' , i );
            var internalID = nlapiGetLineItemValue('item', 'item', i);
            var filters = new Array();
            filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
            filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
            var columns = new Array();
            columns[0] = new nlobjSearchColumn('locationquantityonorder'); 
            columns[1] = new nlobjSearchColumn('locationquantitybackordered');

            var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
            if (srchRslts != null && srchRslts.length > 0){
                qtyOnOrder = srchRslts[0].getValue(columns[0]);
                qtyBackOrdered = srchRslts[0].getValue(columns[1]);
            }
            if (qtyOnOrder == null || qtyOnOrder == ''){ qtyOnOrder=0;}
            if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
            nlapiLogExecution('DEBUG', 'qtyOnOrder=', 'qtyOnOrder='+qtyOnOrder+' qtyBackOrdered='+qtyBackOrdered);
            nlapiSetLineItemValue ( 'item' , 'custcol9' , i , qtyOnOrder );
            nlapiSetLineItemValue ( 'item' , 'custcol10' , i , qtyBackOrdered );
        }
    }
}


//CLIENT SCRIPT - Validate line function
function populateOnOrderCol(){
    // internalID >> is the intenral id of the item you are trying to get the inventory location data 
    // inventoryLocation >> is the number value NetSuite gives for that particular inventory location
    var custform = nlapiGetFieldValue('customform');
    if(custform == 174){
        var internalID = nlapiGetCurrentLineItemValue('item', 'item');
        var inventoryLocation = 3;
        var filters = new Array();
        filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
        filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('locationquantityonorder'); 
        columns[1] = new nlobjSearchColumn('locationquantitybackordered');
        var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
        if (srchRslts != null && srchRslts.length > 0) {
            qtyOnOrder = srchRslts[0].getValue(columns[0]);
            qtyBackOrdered = srchRslts[0].getValue(columns[1]); 
        } else {qtyOnOrder=0; qtyBackOrdered=0;}
        //console.log('onorderqty = '+qtyOnOrder);
        if (qtyOnOrder==''||qtyOnOrder==null){qtyOnOrder = 0;}
        if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
        nlapiSetCurrentLineItemValue('item', 'custcol9', qtyOnOrder);
        nlapiSetCurrentLineItemValue('item', 'custcol10', qtyBackOrdered);
    }    
        return true; 
    
    
}
