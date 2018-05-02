/*

 */

var uri = 'https://cert.api2.heartlandportico.com/Hps.Exchange.PosGateway/PosGatewayService.asmx';

var config = {
    secretApiKey: 'skapi_cert_MTHmAQBzLV8Az7J-Bw0NNiftmI7VPCClwvpAOd-dCg',
    publicApiKey: 'pkapi_cert_f2PVUhLj6jRBSCtTL5',
    versionNumber: '1234',
    developerId: '123456',
    siteTrace: 'trace0001'
};

function getCardType(number) {
    var re = new RegExp("^4");
    if (number.match(re) != null)
        return "Visa";

    re = new RegExp("^(34|37)");
    if (number.match(re) != null)
        return "American Express";

    re = new RegExp("^5[1-5]");
    if (number.match(re) != null)
        return "MasterCard";

    re = new RegExp("^6011");
    if (number.match(re) != null)
        return "Discover";

    return "";
}

function doCreditAuth(nsData) {

    var file = nlapiLoadFile(5957);
    var xml = file.getValue();

    xml = xml.replace('[secretApiKey]', config.secretApiKey);

    xml = xml.replace('[Amt]', nsData.Amt);
    xml = xml.replace('[CardNbr]', nsData.CardNbr);
    xml = xml.replace('[ExpMonth]', nsData.ExpMonth);
    xml = xml.replace('[ExpYear]', nsData.ExpYear);
    xml = xml.replace('[CardHolderZip]', nsData.CardHolderZip);

    var headers = {
        'SOAPAction': '""'
    }

    nlapiLogExecution('DEBUG', 'xml', xml);

    var respObj = nlapiRequestURL(uri, xml, headers);

    var respBody = respObj.getBody();
    nlapiLogExecution('DEBUG', 'respBody', respBody);

    var x2js = new X2JS();
    var jsObj = x2js.xml_str2json(respBody);
    nlapiLogExecution('DEBUG', 'jsObj', JSON.stringify(jsObj));

    var resp = {
        authCode: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.CreditAuth.AuthCode,
        gatewayTxnId: jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.GatewayTxnId,
        //ccavsstreetmatch: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.CreditAuth.AVSResultCodeAction,
        //: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.CreditAuth.CVVResultCodeAction,
        date: moment(jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.RspDT).format('MM/DD/YYYY hh:mm:ss a'),
        event: 'Authorization Request',
        cardType: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.CreditAuth.CardType,
        creditCard: nsData.CardNbr,
        result: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.CreditAuth.RspText,
        reason: '',
        amt: nsData.Amt,
        request: xml,
        response: respBody
    };

    nlapiLogExecution('DEBUG', 'resp', JSON.stringify(resp));
    return resp;
}

function doCreditAddToBatch(nsData) {

    var file = nlapiLoadFile(5964);
    var xml = file.getValue();

    xml = xml.replace('[secretApiKey]', config.secretApiKey);

    xml = xml.replace('[GatewayTxnId]', nsData.gatewayTxnId);
    var headers = {
        'SOAPAction': '""'
    }

    nlapiLogExecution('DEBUG', 'xml', xml);

    var respObj = nlapiRequestURL(uri, xml, headers);

    var respBody = respObj.getBody();
    nlapiLogExecution('DEBUG', 'respBody', respBody);

    var x2js = new X2JS();
    var jsObj = x2js.xml_str2json(respBody);
    nlapiLogExecution('DEBUG', 'jsObj', JSON.stringify(jsObj));  // todo why is the response returned empty?

    var r = nlapiSearchRecord('customrecord_heartl_payment_events', null,
        [new nlobjSearchFilter('custrecord_heartl_evts_gtwytrxid', null, 'is', nsData.gatewayTxnId)],
        [new nlobjSearchColumn('custrecord_heartl_evts_ccnumber'),
            new nlobjSearchColumn('custrecord_heartl_evts_amt')]);
    var creditCard = '', amt = parseFloat(0);
    if (r && r.length == 1) {
        creditCard = r[0].getValue('custrecord_heartl_evts_ccnumber');
        amt = r[0].getValue('custrecord_heartl_evts_amt');
    }

    var resp = {
        gatewayTxnId: jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.GatewayTxnId,
        date: moment(jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.RspDT).format('MM/DD/YYYY hh:mm:ss a'),
        event: 'Capture Request',
        cardType: '',
        creditCard: creditCard,
        result: jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.GatewayRspMsg,
        reason: '',
        amt: amt,
        request: xml,
        response: respBody
    };

    nlapiLogExecution('DEBUG', 'resp', JSON.stringify(resp));
    return resp;
}

function doReportTxnDetail(nsData) {

    var file = nlapiLoadFile(5975);
    var xml = file.getValue();

    xml = xml.replace('[secretApiKey]', config.secretApiKey);

    xml = xml.replace('[TxnId]', nsData.gatewayTxnId);
    var headers = {
        'SOAPAction': '""'
    };

    nlapiLogExecution('DEBUG', 'xml', xml);

    var respObj = nlapiRequestURL(uri, xml, headers);

    var respBody = respObj.getBody();
    nlapiLogExecution('DEBUG', 'respBody', respBody);

    var x2js = new X2JS();
    var jsObj = x2js.xml_str2json(respBody);
    nlapiLogExecution('DEBUG', 'jsObj', JSON.stringify(jsObj));

    /*
     var resp = {
     Date: moment(jsObj.Envelope.Body.PosResponse["Ver1.0"].Header.RspDT).format('YYYY/MM/DD h:mm a'),
     Event: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.ReportTxnDetail.ServiceName,
     CardType: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.ReportTxnDetail.Data.CardType,
     CreditCard: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.ReportTxnDetail.Data.MaskedCardNbr,
     Result: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.ReportTxnDetail.Data.RspText,
     Reason: '',
     Amount: jsObj.Envelope.Body.PosResponse["Ver1.0"].Transaction.ReportTxnDetail.Data.Amt,
     request: xml
     }

     nlapiLogExecution('DEBUG', 'resp', JSON.stringify(resp));
     return resp;
     */
}

function doReportBatchHistory(nsData) {

    var file = nlapiLoadFile(5978);
    var xml = file.getValue();

    xml = xml.replace('[secretApiKey]', config.secretApiKey);

    var headers = {
        'SOAPAction': '""'
    };

    nlapiLogExecution('DEBUG', 'xml', xml);

    var respObj = nlapiRequestURL(uri, xml, headers);

    var respBody = respObj.getBody();
    nlapiLogExecution('DEBUG', 'respBody', respBody);

    var x2js = new X2JS();
    var jsObj = x2js.xml_str2json(respBody);
    nlapiLogExecution('DEBUG', 'jsObj', JSON.stringify(jsObj));
}