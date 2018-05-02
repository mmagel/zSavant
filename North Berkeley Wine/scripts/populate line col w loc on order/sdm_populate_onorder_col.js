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
    //var custform = nlapiGetFieldValue('customform');    // 105 = Retail Sales Order

    // Begin populating Retail location's On Order & MLK location's Back Ordered - rBender @ 9/1/2017
    var role = nlapiGetRole();
    if ((type=='view'||type=='edit') && role==3){
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
                if (qtyOnOrder == null || qtyOnOrder == ''){ qtyOnOrder=0;}
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
                columns[1] = new nlobjSearchColumn('locationquantitybackordered');

                var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
                if (srchRslts != null && srchRslts.length > 0){
                    qtyBackOrdered = srchRslts[0].getValue(columns[1]);
                }
                if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
                nlapiLogExecution('DEBUG', 'qtyBackOrdered', ' qtyBackOrdered='+qtyBackOrdered);
                nlapiSetLineItemValue ( 'item' , 'custcol30' , i , qtyBackOrdered );
            }            
        }
    }
// END - rBender @ 9/1/2017


}


//CLIENT SCRIPT - Validate line function
function populateOnOrderCol(){
    // internalID >> is the intenral id of the item you are trying to get the inventory location data 
    // inventoryLocation >> is the number value NetSuite gives for that particular inventory location
//    var custform = nlapiGetFieldValue('customform');
//    if(custform == 105){
        var internalID = nlapiGetCurrentLineItemValue('item', 'item');

        //On Order Retail
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

        //Backordered MLK
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
    //}    
        return true; 
    
    
}
