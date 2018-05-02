var ENABLE_ALERT = true;

//we want to take the item ID and then use it to get the 
//value of the Inventory Item being reviewed so as to link the
//review to the appropriate item.

function saveReview(type) {

	// Initialize Variables
	var reviewerName = '';
	var reviewerEmail = '';
	var reviewerRating = '';
	var reviewerTitle = '';
	var reviewerBody = '';
	var reviewerDate = '';
	var productReview1 = '';
	var productReview2 = '';
	var totalScore = 0;
	var averageRating = 0.0;
	var numberReviews = 0;
	var rating = 0;

	var itemForUpdate;

	var recordId;
	var newRecord;
	var itemId;


    	if (ENABLE_ALERT) nlapiLogExecution('debug','Started type:', type);

    	if ((type == 'create') ||  (type == 'edit') ||  (type == 'xedit')) {
		// Update the item field on the custom record - also track the review details.

        	//get the newly created product review custom record (for link to item)
        	recordId = nlapiGetRecordId();
		if (ENABLE_ALERT) nlapiLogExecution('debug','recordId', recordId);

        	newRecord = nlapiLoadRecord('customrecord_product_review', recordId);
		if (ENABLE_ALERT) nlapiLogExecution('debug','newRecord', newRecord);

        	itemId = newRecord.getFieldValue('custrecord_custom_itemid');
		if (ENABLE_ALERT) nlapiLogExecution('debug','itemId', itemId );

        	nlapiLogExecution('AUDIT', 'Testing', recordId + '-' + itemId);
        	reviewerName = '<b>Name:</b> ' + newRecord.getFieldValue('custrecord_productreview_yourname') + '<br/>';
        	reviewerEmail = '<b>E-mail:</b> ' + newRecord.getFieldValue('custrecord_productreview_youremail') + '<br/>';
		reviewerDate = '<b>Review Date:</b> ' + newRecord.getFieldValue('created') + '<br/>';
		

		rating = nlapiLookupField('customrecord_product_review', recordId, 'custrecord_productreview_yourrating', true);
		if (rating == null) { rating = ''; }
		reviewerRating = '<b>Rating:</b> ' + rating + '<br/><br/>';
        	reviewerTitle = '<b>' + newRecord.getFieldValue('custrecord_productreview_yourtitle')  + '</b><br/>';
		reviewerBody = newRecord.getFieldValue('custrecord_productreview_yourreview') + '<br/><br/><HR><br/><br/>';
         
		if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerName', reviewerName );
		if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerDate', reviewerDate );
		if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerRating', reviewerRating );
		if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerTitle', reviewerTitle );
		if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerBody', reviewerBody );
               
		if (type == 'create')
		{
			// Updated the item ID
	        	if (itemId != null && itemId > 0) {                                                              
        	    		//Save the Review with the item linkage
            			newRecord.setFieldValue('custrecord_inventoryitem', itemId);
            			nlapiSubmitRecord(newRecord);
        		}
		}

		// We do not update the item itself with the review at this point because the review has not been approved.
    	}
    
	if ((type == 'edit') || (type == 'xedit')) {

		// When editing - confirm if approved - we loaded the record in the previous block	
        	var approved = newRecord.getFieldValue('custrecord_productreview_approved');
		if (ENABLE_ALERT) nlapiLogExecution('debug','approved', approved  );


        	var posted = newRecord.getFieldValue('custrecord_productreview_posted');
		if (ENABLE_ALERT) nlapiLogExecution('debug','posted', posted);


		if ((approved == 'T')  && (posted == 'F'))
		{
			//If the record is approved for posting, then post the review
	        	nlapiLogExecution('debug', 'Review Approved', recordId + '-' + itemId);

			// Log the review
			if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerName', reviewerName );
			if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerDate', reviewerDate );
			if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerRating', reviewerRating );
			if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerTitle', reviewerTitle );
			if (ENABLE_ALERT) nlapiLogExecution('debug','reviewerBody', reviewerBody );

			// pull the review from the item record - we will append our review on to the end of this.
		        if (itemId != null && itemId > 0) {    
        			//search for the item by id so we can get back the type we need the type for loading the item record later on
        			var columns = new Array();
		       		columns[0] = new nlobjSearchColumn('internalId');
            
        			var filters = new Array();
	        		nlapiLogExecution('AUDIT', 'checking values', recordId + '-' + itemId);
	        		filters[0] = new nlobjSearchFilter('internalId', null, 'anyOf', itemId, null);
		    		var results = nlapiSearchRecord('item', null, filters, columns);
                        
        			var inventoryItem = results[0]; //should only ever get 1 item returned when searching by internal id
				if (ENABLE_ALERT) nlapiLogExecution('debug','inventoryItem', inventoryItem ); 

        	    		//load the item record for updating
	        		itemForUpdate = nlapiLoadRecord(inventoryItem.getRecordType(), itemId);
				if (ENABLE_ALERT) nlapiLogExecution('debug','itemForUpdate', itemForUpdate ); 
            
	            		//Get current review field values            
        	    		productReview1 = itemForUpdate.getFieldValue('custitem_productreviews1');
	            		if (productReview1 == null) { productReview1 = ''; }

        	    		productReview2 = itemForUpdate.getFieldValue('custitem_productreviews2');
	            		if (productReview2 == null) { productReview2 = ''; }

				totalScore = parseInt(itemForUpdate.getFieldValue('custitem_review_total_score'));
				if ((totalScore  == null) || (totalScore  == '')|| isNaN(totalScore))  { totalScore  = parseInt(0); }

				averageRating = parseFloat(itemForUpdate.getFieldValue('custitem_review_average_rating'));
				if ((averageRating == null) || (averageRating == '') || isNaN(averageRating)) { averageRating = parseFloat(0); }

				numberReviews = parseInt(itemForUpdate.getFieldValue('custitem_review_total_number'));
				if ((numberReviews == null) || (numberReviews == '') || isNaN(numberReviews)) { numberReviews = parseInt(0); }

		    		if (ENABLE_ALERT) nlapiLogExecution('debug','productReview1', productReview1 ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','productReview2', productReview2 ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','totalScore', totalScore ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','averageRating', averageRating ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','numberReviews', numberReviews );


				// Update the item with the review
				var reviewAppended = false; //flag to set once append is done  

				//check to see if review field #1 is empty/full
				//assumes that standard body field (free form text) is a max length of 4000
				if (productReview1.length <= 3700) {                
					itemForUpdate.setFieldValue('custitem_productreviews1', reviewerName + reviewerDate + reviewerRating + reviewerTitle + reviewerBody + productReview1);
					reviewAppended = true;
				} else if (productReview2.length <= 3700) {                
					itemForUpdate.setFieldValue('custitem_productreviews2',  reviewerName + reviewerDate + reviewerRating + reviewerTitle + reviewerBody + productReview2);
					reviewAppended = true;
				} else {
					nlapiLogExecution('AUDIT', 'Review Not Appended', recordId + '-' + itemId);
					//may want to send an e-mail to a website admin here as well notifying them of a problem?
				}

				totalScore += parseInt(rating);
				numberReviews++;
				averageRating = parseFloat(parseFloat(totalScore)/parseFloat(numberReviews));

		    		if (ENABLE_ALERT) nlapiLogExecution('debug','totalScore', totalScore ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','averageRating', averageRating.toFixed(1)); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','numberReviews', numberReviews );

				itemForUpdate.setFieldValue('custitem_review_total_score',totalScore);
				itemForUpdate.setFieldValue('custitem_review_average_rating',averageRating.toFixed(1));
				itemForUpdate.setFieldValue('custitem_review_total_number',numberReviews);

				if (ENABLE_ALERT) nlapiLogExecution('debug','reviewAppended', reviewAppended );  
           
				nlapiSubmitRecord(itemForUpdate);
			}
			
			newRecord.setFieldValue('custrecord_productreview_posted', 'T');

        	}
		else if ((approved == 'F') || (posted == 'T'))
		{
			// If a review is approved then unapproved, we need to rebuild the reviews.
			nlapiLogExecution('debug', 'Review Not Approved', recordId + '-' + itemId);

			// Clear the product reviews we may have in memory.
	        	productReview1 = ''; 
        		productReview2 = '';
			
		        if (itemId != null && itemId > 0) {   
      
        			//search for the item by id so we can get back the type we need the type for loading the item record later on
        			var columns = new Array();
		        	columns[0] = new nlobjSearchColumn('internalId');
				nlapiLogExecution('AUDIT', 'set columns', 1);
            
        			var filters = new Array();
	        		nlapiLogExecution('AUDIT', 'checking values', recordId + '-' + itemId);
        			filters[0] = new nlobjSearchFilter('internalId', null, 'anyOf', itemId, null);
				nlapiLogExecution('AUDIT', 'set filters', 1);

		        	var results = nlapiSearchRecord('item', null, filters, columns);
				nlapiLogExecution('AUDIT', 'got results', 1);				
                        
        			var inventoryItem = results[0]; //should only ever get 1 item returned when searching by internal id
				if (ENABLE_ALERT) nlapiLogExecution('debug','inventoryItem', inventoryItem ); 

        			//load the item record for updating
	        		var itemForUpdate = nlapiLoadRecord(inventoryItem.getRecordType(), itemId);
				if (ENABLE_ALERT) nlapiLogExecution('debug','itemForUpdate', itemForUpdate ); 



	        		//search for reviews that have been approved by item id 
        			var reviewcolumns = new Array();
	        		reviewcolumns[0] = new nlobjSearchColumn('internalId');
	        		// reviewcolumns[0] = new nlobjSearchColumn('custrecord_productreview_yourname');
				nlapiLogExecution('AUDIT', 'set columns', 1);
            
	        		var reviewfilters = new Array();
		        	nlapiLogExecution('AUDIT', 'checking values', recordId + '-' + itemId);
        			reviewfilters[0] = new nlobjSearchFilter('custrecord_custom_itemid', null, 'is', itemId, null);
				reviewfilters[1] = new nlobjSearchFilter('custrecord_productreview_approved', null, 'is', 'T', null);
				nlapiLogExecution('AUDIT', 'set filters', 1);

	        		var reviewresults = nlapiSearchRecord('customrecord_product_review', null, reviewfilters, reviewcolumns);
				nlapiLogExecution('AUDIT', 'got results', 1);
                        
				if (reviewresults != null) 
				{
					for(var count = 0; count < reviewresults.length; count++) {
						recordId = reviewresults[count].getId();
						if(ENABLE_ALERT) nlapiLogExecution('debug','recordId', recordId);
		
						reviewRecord = nlapiLoadRecord('customrecord_product_review', recordId);
						if(ENABLE_ALERT) nlapiLogExecution('debug','reviewRecord', reviewRecord);
		
				
        					var reviewName = '<b>Name:</b> ' + reviewRecord.getFieldValue('custrecord_productreview_yourname') + '<br/>';

						var reviewDate = '';
						reviewDate = '<b>Review Date:</b> ' + reviewRecord.getFieldValue('created') + '<br/>';
						
						// var rating = reviewRecord.getFieldValue('custrecord_productreview_yourrating');
						var rating = nlapiLookupField('customrecord_product_review', recordId, 'custrecord_productreview_yourrating', true);

						if ((rating == null) || (rating == '')) { rating = ''; }
						else {
							totalScore += parseInt(rating);
							numberReviews++;
							averageRating = parseFloat(parseFloat(totalScore)/parseFloat(numberReviews));
						}

						var reviewRating = '<b>Customer Rating:</b> ' + rating + '<br/><br/>';
	     	  				var reviewTitle = '<b>' + reviewRecord.getFieldValue('custrecord_productreview_yourtitle') + '</b><br/>';	

	     	  				var reviewBody = reviewRecord.getFieldValue('custrecord_productreview_yourreview') + '<br/><br/><HR><br/><br/>';	

						if (ENABLE_ALERT) nlapiLogExecution('debug','Approved reviewName', reviewName );
						if (ENABLE_ALERT) nlapiLogExecution('debug','Approved reviewDate', reviewDate );
						if (ENABLE_ALERT) nlapiLogExecution('debug','Approved reviewTitle', reviewTitle );
						if (ENABLE_ALERT) nlapiLogExecution('debug','Approved reviewRating', reviewRating );
						if (ENABLE_ALERT) nlapiLogExecution('debug','Approved reviewBody', reviewBody );

						//check to see if review field #1 is empty/full
 						//assumes that standard body field (free form text) is a max length of 4000
						if (productReview1.length <= 3700) {                
        						productReview1 += reviewName + reviewDate + reviewRating + reviewTitle + reviewBody;
						} else if (productReview2.length <= 3700) {                
        						productReview2 += reviewName + reviewDate + reviewRating + reviewTitle + reviewBody;
						} 
	
						if (ENABLE_ALERT) nlapiLogExecution('debug','reviewAppended', reviewAppended ); 
					}			
				}

				// Update the item with the review
				//check to see if review field #1 is empty/full
				var reviewAppended = true;

		    		if (ENABLE_ALERT) nlapiLogExecution('debug','totalScore', totalScore ); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','averageRating', averageRating.toFixed(1)); 
		    		if (ENABLE_ALERT) nlapiLogExecution('debug','numberReviews', numberReviews );

				itemForUpdate.setFieldValue('custitem_review_total_score',totalScore);
				itemForUpdate.setFieldValue('custitem_review_average_rating',averageRating.toFixed(1));
				itemForUpdate.setFieldValue('custitem_review_total_number',numberReviews);
				itemForUpdate.setFieldValue('custitem_productreviews1', productReview1);
				itemForUpdate.setFieldValue('custitem_productreviews2', productReview2);

				if (ENABLE_ALERT) nlapiLogExecution('debug','reviewAppended', reviewAppended );  
           
				nlapiSubmitRecord(itemForUpdate);
			}

			if (approved == 'F') { newRecord.setFieldValue('custrecord_productreview_posted', 'F'); }
		}
	
		nlapiSubmitRecord(newRecord);
	}
}