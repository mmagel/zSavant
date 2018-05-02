/**
 * Created by huzaifa.sultanali on 12/15/2017.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['SuiteScripts/Heartland/lodash',
    'SuiteScripts/Heartland/globalpayments.api2',
    'SuiteScripts/Heartland/utils',
    'N/log', 'N/record', 'N/search'], function (lodash, GP, utils, log, record, search) {

    function post(requestBody) {
        try {
            log.debug({title: 'requestBody', details: requestBody});
            var result = postToHeartland(requestBody);
            log.debug({title: 'result', details: result});
            return result;
        } catch(e) {
            log.error({title: 'postToHeartland failed', details: [JSON.stringify(e), e]});
            return "" + e.code;
        }
    }

    function postToHeartland(requestBody) {

        var rec, resp = {};

        var heartlSettings = record.load({
            type: 'customrecord_heartl_settings',
            id: '2',
            isDynamic: true
        });
        var secretKey = heartlSettings.getValue({
            fieldId: 'custrecord_heartl_secret_key'
        });
        var serviceURL = heartlSettings.getValue({
            fieldId: 'custrecord_heartl_url'
        });
        var config = new GP.ServicesConfig();
        config.secretApiKey = secretKey;
        config.serviceUrl = serviceURL;
        GP.ServicesContainer.configure(config);
log.debug({title:'config', details: config});
        var ccData = JSON.parse(requestBody);
        ccData = ccData.postData;

        var card = new GP.CreditCardData();

        if (ccData.operation == 'DO_CC_AUTH') {
log.debug({title: 'ccData', details: ccData});

            if (!ccData.token) {

                card.number = ccData.number;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                card.cvn = ccData.cvn;
                card.cardHolderName = ccData.cardHolderName;

                //const address = new GP.Address();
                //address.state = "12345";

                log.debug({title:'card', details: card});

                var transaction = {
                    id: '123',
                    currency: 'USD',
                    amount: 20.29,
                    token_raw: null
                };



                // run tests

                // get token

                card.tokenize()
                    .withCurrency(transaction.currency)
                    .withRequestMultiUseToken(true)
                    .execute()
                    .then(function (token) {
                      log.debug({title: 'token', details: token});
                        resp = token;
                        transaction.token_raw = token;
                        transaction.token = token.token;
                        log.debug({title:'transaction', details: transaction});
                        card.token = token.token;
                        log.debug({title:'transaction', details: transaction});

                        log.debug({title:'token.token', details: token.token});

/* once we have the token we can perform other transactions */






                // authorize

                card.authorize(transaction.amount)
                    .withCurrency(transaction.currency)
                    .execute()
                    .then( function(authorize) {
                      log.debug({title: 'authorize', details: authorize});
                      transaction.authorize = authorize;
                      log.debug({title:'transaction', details: transaction});
                })
                .catch(function(err){log.error({title: 'authorize error', details: err});});


                card = new GP.CreditCardData();
                card.number = ccData.number;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                card.cvn = ccData.cvn;
                card.cardHolderName = ccData.cardHolderName;
                card.token = transaction.token;
              
              // log.debug({title: 'card', details: card});

                // capture
                card.authorize(transaction.amount)
                    .withCurrency(transaction.currency)
                    .execute()
                    .then( function(authorize2) {
                        var transactionId = authorize2.transactionReference.transactionId;
                        log.debug({title:'transactionId', details: transactionId});
                        var capture = GP.Transaction.fromId(transactionId)
                        .capture(transaction.amount) /* is it possible that our amount is different from the serverside? */
                        .execute();

                        log.debug({title: 'capture', details: capture});
                        log.debug({title: 'authorize2', details: authorize2});
                        transaction.authorize2 = authorize2;
                        transaction.capture = capture;
                        log.debug({title:'transaction', details: transaction});
                        
                    })
                .catch(function(err){
                    log.error({title: 'auth/capture error', details: JSON.stringify(err)});
                    var code  = err.code || 500;
                    var message = err.message;
                    var name = err.name || 'Unexpected Error';
                    var errorRecord = record.create({
                        type: 'customrecord_heartl_error'
                    });

                    if (code >= 500 && code < 600) {
                        // could have been caused by a duplicate card, network issues, etc.
                        
                    }


                    /*
                    transaction: 'custrecord_heartl_err_trans_id',
                detail: 'custrecord_heartl_err_detail',
                type: 'custrecord_heartl_err_type',
                reported: 'custrecord_heartl_err_reported',
                logged: 'custrecord_heartl_err_logged',
                notified: 'custrecord_heartl_err_notified'*/
                    errorRecord.setValue({
                        fieldId: 'custrecord_heartl_err_trans_id',
                        value: transaction.id
                    });
                    errorRecord.setValue({
                        fieldId: 'custrecord_heartl_err_type',
                        value: name
                    });
                    errorRecord.setValue({
                        fieldId: 'custrecord_heartl_err_detail',
                        value: message
                    });
                    errorId = errorRecord.save();
                    log.error({title: 'error created #'+errorId, details: JSON.stringify(err)});
                });

                card = new GP.CreditCardData();
                card.number = ccData.number;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                card.cvn = ccData.cvn;
                card.cardHolderName = ccData.cardHolderName;
                card.token = transaction.token;

                //reverse

                card.authorize(transaction.amount)
                .withCurrency(transaction.currency)
                .execute()
                .then( function(authorize3) {
                    var transactionId = authorize3.transactionReference.transactionId;
                    log.debug({title:'transactionId', details: transactionId});

                    var reverse = GP.Transaction.fromId(transactionId)
                    .reverse(transaction.amount)
                    .execute();

                    log.debug({title: 'reverse', details: reverse});
                    log.debug({title: 'authorize3', details: authorize3});
                    transaction.authorize3 = authorize3;
                    transaction.reverse = reverse;
                    log.debug({title:'transaction', details: transaction});


                })
                .catch(function(err){log.error({title: 'reverse error', details: err});});
        
                card = new GP.CreditCardData();
                card.number = ccData.number;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                card.cvn = ccData.cvn;
                card.cardHolderName = ccData.cardHolderName;
                card.token = transaction.token;

                // void
                card.authorize(transaction.amount)
                .withCurrency(transaction.currency)
                .execute()
                .then( function(authorize4) {
                    var void_refund = Transaction.fromId(response.transactionId)
                    .void()
                    .execute();

                    log.debug({title: 'void_refund', details: void_refund});
                    log.debug({title: 'authorize4', details: authorize4});
                    transaction.authorize4 = authorize4;
                    transaction.void_refund = void_refund;


                    return result;
                })
                .catch(function(err){log.error({title: 'void_refund error', details: err});});

                //edit 



/* END tokenized callback*/



                    }).catch(function handleTokenError(err) {
                        log.error({title: 'tokenize error', details: err});
                        if (err.code >= 500 && err.code < 600) {
                            // could have been caused by a duplicate card
                            log.error({title: 'ServerError', details: JSON.stringify(err)});
                        }
                    });

                

            }

            /*
            else {

                log.debug('verify');

                card.token = ccData.token;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                //card.cvn = ccData.cvn;
                //card.cardHolderName = ccData.cardHolderName;

                //const address = new GP.Address();
                //address.state = "12345";

                card.verify()
                    .withCurrency("USD")
                    //.withAddress(address)
                    .execute()
                    .then(function (verification) {
                        resp = verification;
                    });
            }
            */
        }

        log.debug({
            title: 'resp',
            details: JSON.stringify(resp)
        });

        if (!lodash.isEmpty(resp) && resp.responseCode == '00' && resp.token) {
            utils.addToken(ccData, resp.token);
        }
      
      resp = resp || {};

        return JSON.stringify(resp);
    }

    return {
        post: post
    };

});