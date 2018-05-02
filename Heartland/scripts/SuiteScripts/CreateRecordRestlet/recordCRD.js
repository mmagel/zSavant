// Operations on NetSuite records (see NetSuite Help - Example Code Snippets of HTTP Methods)
// Also SuiteScript Supported Records - 
// https://system.netsuite.com/help/helpcenter/en_US/Output/Help/SuiteFlex/SuiteScript/Reference_SuiteScriptSupportedRecords.html
//
// See related file with example cURL commands for testing
// cURL can be downloaded from http://curl.haxx.se/download.html
// URLs for various record types below:
// https://rest.netsuite.com/app/site/hosting/restlet.nl?script=90&deploy=1&recordtype=customer&id=###
// https://rest.netsuite.com/app/site/hosting/restlet.nl?script=90&deploy=1&recordtype=vendor&id=###
// https://rest.netsuite.com/app/site/hosting/restlet.nl?script=90&deploy=1&recordtype=partner&id=###
// https://rest.netsuite.com/app/site/hosting/restlet.nl?script=90&deploy=1&recordtype=inventoryitem&id=###
//

// Get a standard NetSuite record 

function getRecord(datain)
{
    return nlapiLoadRecord(datain.recordtype, datain.id); // e.g recordtype="customer", id="769"
}

// Delete a standard NetSuite record
function deleteRecord(datain)
{
    nlapiDeleteRecord(datain.recordtype, datain.id); // e.g recordtype="customer", id="769"
}

// Create a standard NetSuite record via POST method
// Request Payload:
// {"recordtype":"customer","entityid":"John Doe","companyname":"ABCTools, Inc", "subsidiary":"1","email":jdoe@email.com}

function createRecord(datain)
{
    var err = new Object();
   
    // Validate if mandatory record type is set in the request
    if (!datain.recordtype)
    {
        err.status = "failed";
        err.message= "missing recordtype";
        return err;
    }
   
    var record = nlapiCreateRecord(datain.recordtype);
   
    for (var fieldname in datain)
    {
     if (datain.hasOwnProperty(fieldname))
     {
         if (fieldname != 'recordtype' && fieldname != 'id')
         {
             var value = datain[fieldname];
			 nlapiLogExecution('DEBUG', 'fieldname='+fieldname, 'value='+value + ' typeof=' + typeof value);
             if (value && typeof value != 'object') // ignore other type of parameters
             {                 
				 record.setFieldValue(fieldname, value);
             } else if (fieldname == 'member'){
				for (var fieldname2 in value) {
					var value2 = value[fieldname2];
					nlapiLogExecution('DEBUG', '**fieldname='+fieldname2, '**value2='+value2 + ' typeof=' + typeof value2);
					
					if (value2 && typeof value2 != 'object') {
						record.setFieldValue(fieldname2, value2);
					} else {
						record.selectNewLineItem(fieldname);
						
						for (var fieldname3 in value2) {
							var value3 = value2[fieldname3];
							nlapiLogExecution('DEBUG', '@fieldname='+fieldname3, '**value3='+value3 + ' typeof=' + typeof value3);
							
							if (value3 && typeof value3 != 'object') {								
								record.setCurrentLineItemValue(fieldname, fieldname3, value3);
							}
						}
						record.commitLineItem(fieldname);
					}
				}
			 }
         }
     }
    }
    var recordId = nlapiSubmitRecord(record);
    nlapiLogExecution('DEBUG','id='+recordId);
   
    var nlobj = nlapiLoadRecord(datain.recordtype,recordId);
    return nlobj;
}

//
