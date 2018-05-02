// check status to make sure if it's not shipped from bulk fulfill

function as_check_status(type, status){

    if (status != 'shipped' )    // in bulk item fulfillment, I need to double-check with this AS function
    {
        try
        {
            var currentContext = nlapiGetContext();
            var id = nlapiGetRecordId();
            //nlapiSetDateTimeValue('custbody_mv_status_changed_to_shipped','');
            nlapiSubmitField('itemfulfillment', id, 'custbody_mv_status_changed_to_shipped', '');
            nlapiLogExecution('DEBUG','as','end,type='+type+" status="+status+" contxt="+currentContext.getExecutionContext() );
        } catch(e)
        {
            nlapiLogExecution('DEBUG','as','err= '+e.message);
        }

    }



}

