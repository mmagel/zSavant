//we want to take the item ID and then use it to get the 
//value of the Inventory Item being reviewed so as to link the
//review to the appropriate item.
function saveReview(type) {
    if (type == 'create') {
        //get the newly created product review custom record (for link to item)
        var recordId = nlapiGetRecordId();
        var newRecord = nlapiLoadRecord('customrecord34', recordId);
        var itemId = newRecord.getFieldValue('custrecord_custom_itemid');
        nlapiLogExecution('AUDIT', 'Testing', recordId + '-' + itemId);
        var reviewerName = '<b>Name:</b> ' + newRecord.getFieldValue('custrecord_productreview_yourname') + '<br/>';
        var reviewerEmail = '<b>E-mail:</b> ' + newRecord.getFieldValue('custrecord_productreview_youremail') + '<br/><br/>';
        var reviewBody = newRecord.getFieldValue('custrecord_productreview_yourreview') + '<br/><br/>*****************************<br/><br/>';
                        
        if (itemId != null && itemId > 0) {                                                              
            //Save the Review with the item linkage
            newRecord.setFieldValue('custrecordcust_inventoryitem', itemId);
            nlapiSubmitRecord(newRecord);
            
            //*****************************
            //search for the item by id so we can get back the type
            //we need the type for loading the item record later on
            var columns = new Array();
            columns[0] = new nlobjSearchColumn('internalId');
            
            var filters = new Array();
            nlapiLogExecution('AUDIT', 'checking values', recordId + '-' + itemId);
            filters[0] = new nlobjSearchFilter('internalId', null, 'anyOf', itemId, null);
            var results = nlapiSearchRecord('item', null, filters, columns);
                        
            var inventoryItem = results[0]; //should only ever get 1 item returned when searching by internal id
            //*****************************
            
            
            //******************************
            //load the item record for updating
            var itemForUpdate = nlapiLoadRecord(inventoryItem.getRecordType(), itemId);
            
            //Get current review field values            
            var productReview1 = itemForUpdate.getFieldValue('custitem_productreviews1');
            if (productReview1 == null) { productReview1 = ''; }
            var productReview2 = itemForUpdate.getFieldValue('custitem_productreviews2');
            if (productReview2 == null) { productReview2 = ''; }
            
            var reviewAppended = false; //flag to set once append is done
            
            //check to see if review field #1 is empty/full
            //assumes that standard body field (free form text) is a max length of 4000
            if (productReview1.length <= 3700) {                
                itemForUpdate.setFieldValue('custitem_productreviews1', productReview1 + reviewerName + reviewerEmail + reviewBody);
            } else if (productReview2.length <= 3700) {                
                itemForUpdate.setFieldValue('custitem_productreviews2', productReview2 + reviewerName + reviewerEmail + reviewBody);
            } else {
                nlapiLogExecution('AUDIT', 'Review Not Appended', recordId + '-' + itemId);
                //may want to send an e-mail to a website admin here as well notifying them of a problem?
            }
            
            nlapiSubmitRecord(itemForUpdate);
            //*****************************
        }
    }
}