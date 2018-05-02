/**
 * Created by Huzaifa on 10/8/2017.
 */


function onStart() {

    var context = nlapiGetContext();

    /*
     var gatewayTxnId = '1025846554';
     var nsData = {
     gatewayTrxId: gatewayTxnId
     };
     doReportTxnDetail(nsData);
     */

    doReportBatchHistory();
}