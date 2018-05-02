/**
 * Created by Huzaifa on 9/11/2017.
 */

function onBeforeLoad(type) {

    if (type == 'create' || type == 'copy') {
        nlapiSetFieldValue('custbody_gateway_trx_id', '');
    }
}

function onBeforeSubmit(type) {

    if (type == 'create') {

        var chargeit = nlapiGetFieldValue('chargeit');
        if (chargeit == 'F')
            return;

        var createdFrom = nlapiGetFieldValue('createdfrom');
        if (createdFrom) {

            var gatewayTxnId = nlapiLookupField('salesorder', createdFrom, 'custbody_gateway_trx_id');

            var nsData = {
                gatewayTxnId: gatewayTxnId
            };

            var resp = doCreditAddToBatch(nsData);

            // todo throw error if CC ops fails

            nlapiSetFieldValue('custbody_heartl_trx_data', JSON.stringify(resp));
            nlapiSetFieldValue('custbody_gateway_trx_id', resp.gatewayTxnId);
            nlapiSetFieldValue('pnrefnum', resp.gatewayTxnId);
        }
    }
}

function onAfterSubmit(type) {

    nlapiLogExecution('DEBUG', type);

    if (type == 'create') {

        var id = nlapiGetRecordId();
        var gtwData = nlapiLookupField('cashsale', id, 'custbody_heartl_trx_data');
        if (!gtwData)
            return;
        gtwData = JSON.parse(gtwData);

        var r = nlapiCreateRecord('customrecord_heartl_payment_events');

        var trxns = [];
        trxns.push(id);
        var soId = nlapiLookupField('cashsale', id, 'createdfrom');
        if (soId)
            trxns.push(soId);
        r.setFieldValues('custrecord_heartl_evts_trx', trxns);
        r.setFieldValue('custrecord_heartl_evts_gtwytrxid', gtwData.gatewayTxnId);
        r.setFieldValue('custrecord_heartl_evts_date', gtwData.date);
        r.setFieldValue('custrecord_heartl_evts_event', gtwData.event);
        r.setFieldValue('custrecord_heartl_evts_ccnumber', gtwData.creditCard);
        r.setFieldValue('custrecord_heartl_evts_result', gtwData.result);
        r.setFieldValue('custrecord_heartl_evts_amt', gtwData.amt);
        r.setFieldValue('custrecord_heartl_evts_req_raw', gtwData.request);
        r.setFieldValue('custrecord_heartl_evts_resp_raw', gtwData.response);
        nlapiSubmitRecord(r);
    }
}