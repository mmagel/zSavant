function disableSublistButtons(type, form) {
/*
Purpose: Disable the Attach button on a custom record sublist
Deployment: beforeload on custom record
Date: 2/4/2013
Created by SD Mayer & Associates llp.
www.sdmayer.com
*/ 
    if(type == 'view') {

	var customSublist = form.getSubList('recmachcustrecord_count_line_no');
    var attachButton = customSublist.getButton('attach'); 
    
	if(attachButton != null)
    attachButton.setDisabled(true);
  
  
	}
} 