// rbender 10/2/2017
// This is a client page init script to grab the data from the custom record
// setting the field custentity_dso

function customerinit(type)
{
    if (type=='edit' || type=='view')
    {
        try
            {
                var custid = nlapiGetRecordId();
                var customrecordsearch = nlapiSearchRecord('customrecord_sdmdso',null,
                [
                    ["custrecord_dsocustomer","equalto",custid]
                ], 
                [
                    new nlobjSearchColumn('custrecord_dsoformula',null,null)
                ]
                );
                var cols = customrecordsearch[0].getAllColumns();
                var dso = customrecordsearch[0].getValue(cols[0]);
                nlapiSetFieldValue('custentity_dso', dso);
            }
            catch(e)
            {
                nlapiLogExecution('ERROR',e.message);
                console.log('there client script was an error.');
            }
    }
    
}

