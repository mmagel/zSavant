//
// Script to grab CMs from search and then transform them into Refunds
// effectively writting-off the CMs
//

function writeoffcreditmemos(){
    nlapiLogExecution('DEBUG','begin function');
    //var searchresult = nlapiSearchRecord('transaction','customsearch1002',null,'Internal ID'); //sandbox
    var searchresult = nlapiSearchRecord('transaction','customsearch1955',null,'Internal ID'); //production     +10 units
    var cols = searchresult[0].getAllColumns();
    var val = searchresult[0].getValue(cols[0]);
    var rows = 0;
    var gov = 10;

    //go thru 
    for (i=0; i < searchresult.length; i++){    //~73
        var cols = searchresult[rows].getAllColumns();
        var intid = searchresult[rows].getValue(cols[0]);
        var creditMemo = nlapiLoadRecord('creditmemo', intid);      // +10 units
        gov = gov +10

        var CASH_PAYMENT_METHOD = 1;
        var customerRefund = nlapiCreateRecord('customerrefund',{recordmode:'dynamic', entity:creditMemo.getFieldValue('entity')});   // +10 units
        gov = gov +10

        var customerRefundId = null;
        var refundAmnt = creditMemo.getFieldValue('total');
        var cmdocnum = creditMemo.getFieldValue('tranid');
        customerRefund.setFieldValue('paymentmethod', CASH_PAYMENT_METHOD); // cash
        nlapiLogExecution('DEBUG','first loop = '+i+' - gov='+gov);
        for(var i = 1; i<= customerRefund.getLineItemCount('apply'); i++){
            if(creditMemo.getId() == customerRefund.getLineItemValue('apply', 'doc', i)){
                customerRefund.selectLineItem('apply', i);
                customerRefund.setCurrentLineItemValue('apply', 'apply', 'T');
                customerRefund.commitLineItem('apply');           
                customerRefund.setFieldValue('memo','auto refunded CM#'+cmdocnum+' via script for writing-off CMs');
                nlapiLogExecution('DEBUG','second loop = '+i);
            }
        }
        try{
            customerRefundId = nlapiSubmitRecord(customerRefund, true, true);
            nlapiLogExecution('DEBUG','submit record');  // 20 units
            gov = gov +20
        } catch(e){
            nlapiLogExecution('ERROR',e.message);
        }

        //var refundrec = nlapiTransformRecord('creditmemo',intid,'customerrefund',{recordmode:'dynamic'});

        var stopper = 1;
        //nlapiSubmitRecord(updtrec);
    }



}


/*

    var CASH_PAYMENT_METHOD = 1;
    var refundAmnt = creditMemo.getFieldValue('total');
    var customerRefund = nlapiCreateRecord('customerrefund',{recordmode:'dynamic', entity:creditMemo.getFieldValue('entity')});
    var customerRefundId = null;

    customerRefund.setFieldValue('paymentmethod', CASH_PAYMENT_METHOD); // cash

    for(var i = 1; i<= customerRefund.getLineItemCount('apply'); i++){
        if(creditMemo.getId() == customerRefund.getLineItemValue('apply', 'doc', i)){
            customerRefund.selectLineItem('apply', i);
            customerRefund.setCurrentLineItemValue('apply', 'apply', 'T');
            customerRefund.commitLineItem('apply');           
        }
    }
    try{
        customerRefundId = nlapiSubmitRecord(customerRefund, true, true);
    }

*/