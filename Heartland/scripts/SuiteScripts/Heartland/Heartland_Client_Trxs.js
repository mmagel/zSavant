/**
 * Created by huzaifa.sultanali on 9/6/2017.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['SuiteScripts/Heartland/lodash', 'SuiteScripts/Heartland/utils', 'N/url', 'N/https'],
    function (lodash, utils, url, https) {

        return {
            saveRecord: function (context) {

                var ccData = {};

                var currentRecord = context.currentRecord;

                var recordType = currentRecord.type;
              log.debug({title: 'recordType', details:recordType});

                var recordId = currentRecord.id;

                var custId = currentRecord.getValue({
                    fieldId: 'entity'
                });
                ccData.custId = custId;

                var heartlTrxId = currentRecord.getValue({
                    fieldId: 'custbody_heartl_trx_id'
                });

                var doCCAuth = currentRecord.getValue({
                    fieldId: 'custbody_heartl_do_cc_auth'
                });
              log.debug({title: 'doCCAuth', details:doCCAuth});

                var doCCCapture = currentRecord.getValue({
                    fieldId: 'custbody_heartl_do_cc_capture'
                });

                ccData.number = currentRecord.getValue({
                    fieldId: 'custbody_heartl_ccnumber'
                });

                ccData.token = currentRecord.getValue({
                    fieldId: 'custbody_heartl_cc_token'
                });

                if (utils.isCreditCardValid(ccData.number))
                    ccData.token = '';

                ccData.amount = currentRecord.getValue({
                    fieldId: 'total'
                });
                if (ccData.amount == 0 || ccData.token)
                    return true;

                var expiration = currentRecord.getValue({
                    fieldId: 'custbody_heartl_expiration'
                });
                if (expiration) {

                    // Parse the expiration date
                    var split = expiration.split('/');

                    if (split.length == 2) {
                        var month = split[0].replace(/^\s+|\s+$/g, '');
                        var year = split[1].replace(/^\s+|\s+$/g, '');
                    }

                    ccData.expMonth = month;
                    ccData.expYear = year;
                }

                ccData.cvn = currentRecord.getValue({
                    fieldId: 'custbody_heartl_csc'
                });

                ccData.cardHolderName = currentRecord.getValue({
                    fieldId: 'custbody_heartl_ccholder_name'
                });

                ccData.operation = null;

                if (recordType == 'salesorder' && doCCAuth == true) {
                    ccData.operation = 'DO_CC_AUTH'; // auth cc
                }

                if (!ccData.operation) {
                    return true;
                }

                var r = confirm("Authorize Credit Card?\nClick [OK] to continue or [Cancel] to abort");
                if (r == false) {
                    return r;
                }

                var postData = {"postData": ccData};

                // Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
                postData = JSON.stringify(postData);
              log.debug({title: 'postData', details: postData});

                // Generate RESTlet URL using the URL module.
                var restUrl = url.resolveScript({
                    scriptId: 'customscript_heartl_restlet', // RESTlet scriptId
                    deploymentId: 'customdeploy1' // RESTlet deploymentId
                });
              log.debug({title: 'restUrl', details: restUrl});

                // Generate request headers
                var headers = new Array();
                headers['Content-Type'] = 'application/json';

                // Perform HTTP POST call
                var resp = https.post({
                    url: restUrl,
                    headers: headers,
                    body: postData
                });

              log.debug({title: 'resp', details: resp});
              
               if(!resp.body) {
                log.error({title: 'no response body', details: 'no response body'});
                 throw new Error('No response data from the server.');
                 return;
              }

                resp = JSON.parse(resp.body);

                if (!lodash.isEmpty(resp)) {

                    if (resp.responseCode == '00') {

                        currentRecord.setValue({
                            fieldId: 'custbody_heartl_cc_token',
                            value: resp.token
                        });
                        currentRecord.setValue({
                            fieldId: 'custbody_heart_gtw_resp',
                            value: JSON.stringify(resp)
                        });
                        currentRecord.setValue({
                            fieldId: 'custbody_heartl_update_fields',
                            value: true
                        });

                        return true;
                    }
                    else {
                        alert('ERROR\n\nHeartland credit card gateway error\n' + resp.responseMessage);
                        return false;
                    }
                }
                else {
                    alert('UNEXPECTED ERROR\n\nNo response from Heartland credit card gateway');
                    return false;
                }
            }
        }
    });