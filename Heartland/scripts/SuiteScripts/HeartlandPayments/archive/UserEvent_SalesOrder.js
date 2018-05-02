/**
 * Created by Huzaifa on 9/10/2017.
 */

function onBeforeLoad(type) {

    if (type == 'copy') {

        nlapiSetFieldValue('custbody_authcode', '');
        nlapiSetFieldValue('custbody_gateway_trx_id', '');
        nlapiSetFieldValue('paymentmethod', '');
        nlapiSetFieldValue('custbody_ccnumber', '');
        nlapiSetFieldValue('ccexpiredate', '');
        nlapiSetFieldValue('ccname', '');
        nlapiSetFieldValue('ccstreet', '');
        nlapiSetFieldValue('cczipcode', '');
    }
}

function onBeforeSubmit(type) {

    if (type == 'create' || type == 'copy') {

        //var ccname = nlapiGetFieldValue('ccname').split(' ');
        var card = nlapiGetFieldValue('custbody_ccnumber');
        var ccapproved = nlapiGetFieldValue('ccapproved');
        var getauth = nlapiGetFieldValue('getauth');

        if (getauth == 'F')
            return;

        //var cvv2 = '123'; //document.getElementById('standardCardCvv');

        // Parse the expiration date
        var expiration = nlapiGetFieldValue('ccexpiredate');
        if (!expiration && card)
            throw "ERROR\n Credit card expiration date is required.";

        if (!card || !expiration)
            return;

        var split = expiration.split('/');
        var month = split[0].replace(/^\s+|\s+$/g, '');
        var year = split[1].replace(/^\s+|\s+$/g, '');

        var nsData = {
            /*
             CardHolderFirstName: ccname[0],
             CardHolderLastName: ccname[1],
             CardHolderAddr: nlapiGetFieldValue('ccstreet'),
             CardHolderCity: nlapiGetFieldValue(''),
             CardHolderState: nlapiGetFieldValue('')
             */
            CardNbr: card,
            CardHolderZip: nlapiGetFieldValue('cczipcode'),
            ExpMonth: month,
            ExpYear: year,
            Amt: parseFloat(nlapiGetFieldValue('total'))
        };

        nlapiLogExecution('DEBUG', 'nsData', JSON.stringify(nsData));

        var resp = doCreditAuth(nsData);

        // todo throw error if CC ops fails

        nlapiSetFieldValue('custbody_heartl_trx_data', JSON.stringify(resp));

        nlapiSetFieldValue('custbody_authcode', resp.authCode);
        nlapiSetFieldValue('custbody_gateway_trx_id', resp.gatewayTxnId);
        nlapiSetFieldValue('pnrefnum', resp.gatewayTxnId);
        nlapiSetFieldText('ccavsstreetmatch', 'Y');
        nlapiSetFieldText('ccavszipmatch', 'Y');
        nlapiSetFieldValue('custbody_ccnumber', '');
    }
}


function onAfterSubmit(type) {

    if (type == 'create') {

        var id = nlapiGetRecordId();

        var gtwData = nlapiLookupField('salesorder', id, 'custbody_heartl_trx_data');

        if (!gtwData)
            return;

        gtwData = JSON.parse(gtwData);

        var r = nlapiCreateRecord('customrecord_heartl_payment_events');
        r.setFieldValue('custrecord_heartl_evts_trx', id);
        r.setFieldValue('custrecord_heartl_evts_gtwytrxid',gtwData.gatewayTxnId );
        r.setFieldValue('custrecord_heartl_evts_date', gtwData.date);
        r.setFieldValue('custrecord_heartl_evts_event', gtwData.event);
        r.setFieldValue('custrecord_heartl_evts_ccnumber', gtwData.cardType + ' ' + gtwData.creditCard);
        r.setFieldValue('custrecord_heartl_evts_result', gtwData.result);
        r.setFieldValue('custrecord_heartl_evts_amt', gtwData.amt);
        r.setFieldValue('custrecord_heartl_evts_req_raw', gtwData.request);
        r.setFieldValue('custrecord_heartl_evts_resp_raw', gtwData.response);
        nlapiSubmitRecord(r);
    }
}