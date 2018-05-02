/**
* Module Description
*
* Version    Date           Author           Remarks
* 1.00       2 Oct 2017     rbender          grab search results to update custom rcord
*
* Update Custom Records - use saved searches to update Custom Record for reporting
*
* @param {nlobjSearchFilter|Array|Array} filters [optional] - A single nlobjSearchFilter object - <strong>or</strong> - an array of nlobjSearchFilter objects - <strong>or</strong> - a search filter expression.
* @param {nlobjSearchColumn|Array} columns [optional] - A single nlobjSearchColumn object - <strong>or</strong> - an array of nlobjSearchColumn objects. Note that you can further filter the returned saved search by passing additional search return column values.
* @returns {nlobjSearchResult[]} - An array of nlobjSearchResult objects corresponding to the searched records.
 */
// this is a scheduled script that updates the DSO (Days Sales Open) field with the formula:
// ((invoiced date field - date of payment) for every invoice) / total # of invoices
// this will give the result whihc will require a client script on the customer record to load from this custom record

function dsoupdater()
{
    // load the saved search and the custom record
    var searchresult = nlapiSearchRecord('transaction','customsearch314');
    var cols = searchresult[0].getAllColumns();
    var val = searchresult[0].getValue(cols[0]);
    var searchlength = searchresult.length;
    //var custrec = nlapiLoadRecord('customrecord_sdmdso','1');

    // create loop as long as the search record's length
    for (i=1; i<searchresult.length; i++)
    {
        var custname = searchresult[i].getText(cols[0]);// customer name
        var col0 = searchresult[i].getValue(cols[0]);   // customer id
        var col1 = searchresult[i].getValue(cols[1]);   // invoice count
        var col2 = searchresult[i].getValue(cols[2]);   // days between (date paid - invoice date)
        var counter = i;
        //var cols = searchresult[i].getAllColumns();
        try
        {
            var custrec = nlapiLoadRecord('customrecord_sdmdso',i);
        } 
        catch(e)
        {
            var custrec = nlapiCreateRecord('customrecord_sdmdso',i, {recordmode: 'dynamic'});
            if (e.message != 'That record does not exist.')
            {
                nlapiLogExecution('ERROR',e.message);
            }
        }

        custrec.setFieldValue('name', custname);
        custrec.setFieldValue('custrecord_dsocustomer', col0);
        custrec.setFieldValue('custrecord_dsoinvoicecount', col1);
        custrec.setFieldValue('custrecord_dsodaysbetween', col2);

        var stopper =1;
        nlapiSubmitRecord(custrec);

        //load customer record and update the "custentity_dso" field
        try
        {
            var dso = custrec.getFieldValue('custrecord_dsoformula');
            var customerrec = nlapiLoadRecord('customer', col0);
            customerrec.setFieldValue('custentity_dso', dso);
            nlapiSubmitRecord(customerrec);
        }
        catch(e)
        {
            nlapiLogExecution('ERROR','setting customer field-' + e.message);
        }


    }

    // grab search result columns and put them in the cust record 

    var stopper=1;
}
 


