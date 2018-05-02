/**
 * Created by huzaifa.sultanali on 12/15/2017.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define([
    'N/log',
    'N/record',
    'N/runtime',
    'N/search',
    'SuiteBundles/Bundle 227444/HeartlandPayments/20180312-globalpayments.api',
    'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Application_CM',
    'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Utilities_CM'
], function (log, record, runtime, search, GP, app, utils) {

    var settings = app.hlapi.initialize();

    var doTests = false;

    function runTests(requestBody) {
        establishConnection();

        [

        {
            card: {
                cardHolderName: 'Certification 1, Visa',
                number: '4012002000060016',
                expMonth: '12',
                expYear: '2017',
                cvn: '123',
                address: {
                    streetAddress1: 'Address Line 1',
                    streetAddress2: 'Address Line 2',
                    streetAddress3: 'Address Line 3',
                    city: 'City',
                    state: 'CA',
                    province: '',
                    postalCode: '90210',
                    country: 'USA',
                    type: 'Billing'
                },
            },
            transaction: {
                currency: 'USD',
                amount: '0.00'
            }
        },
        {
            card: {
                cardHolderName: 'Certification 2, MasterCard',
                number: '547300000000014',
                expMonth: '12',
                expYear: '2017',
                cvn: '123',
                address: {
                    streetAddress1: 'Address Line 1',
                    streetAddress2: 'Address Line 2',
                    streetAddress3: 'Address Line 3',
                    city: 'City',
                    state: 'CA',
                    province: '',
                    postalCode: '90210',
                    country: 'USA',
                    type: 'Billing'
                },
            },
            transaction: {
                currency: 'USD',
                amount: '0.00'
            }
        },
        {
            card: {
                cardHolderName: 'Certification 3, Discover',
                number: '6011000990156527',
                expMonth: '12',
                expYear: '2017',
                cvn: '123',
                address: {
                    streetAddress1: 'Address Line 1',
                    streetAddress2: 'Address Line 2',
                    streetAddress3: 'Address Line 3',
                    city: 'City',
                    state: 'CA',
                    province: '',
                    postalCode: '75024',
                    country: 'USA',
                    type: 'Billing'
                },
            },
            transaction: {
                currency: 'USD',
                amount: '0.00'
            }
        },
        {
            card: {
                cardHolderName: 'Certification 4, Amex',
                number: '372700699251018',
                expMonth: '12',
                expYear: '2017',
                cvn: '123',
                address: {
                    streetAddress1: 'Address Line 1',
                    streetAddress2: 'Address Line 2',
                    streetAddress3: 'Address Line 3',
                    city: 'City',
                    state: 'CA',
                    province: '',
                    postalCode: '75024',
                    country: 'USA',
                    type: 'Billing'
                },
            },
            transaction: {
                currency: 'USD',
                amount: '0.00'
            }
        },

        {
            card: {
                cardHolderName: 'Certification 5, Visa',
                number: '4012002000060016',
                expMonth: '12',
                expYear: '2017',
                cvn: '123',
                address: {
                    streetAddress1: 'Address Line 1',
                    streetAddress2: 'Address Line 2',
                    streetAddress3: 'Address Line 3',
                    city: 'City',
                    state: 'CA',
                    province: '',
                    postalCode: '90210',
                    country: 'USA',
                    type: 'Billing'
                },
            },
            transaction: {
                currency: 'USD',
                amount: '0.00'
            }
        }

        ].forEach(function(dataIn) {

            var resp = '';

            log.debug({title: 'dataIn', details: [dataIn]});


            var creditCard = utils.createHeartlandCreditCard(dataIn);

            var transaction = {
                amount: dataIn.transaction.amount,
                currency: dataIn.transaction.currency
            };

            var card = {
                token: app.hlapi.tokenize(creditCard, dataIn.transaction, resp),
                expMonth: creditCard.expMonth,
                expYear: creditCard.expYear,
                cardHolderName: creditCard.cardHolderName,

                // value must be defined
                cvn: '',
            };

            /* This function is passed to the verify/authorize transactions as a callback to the promise used to hit the API */
            var captureCallback = function captureCallback(authorization) {

                resp = authorization;
                transaction.transactionId = authorization.transactionReference.transactionId;

                if (paymentOperation != app.config.list.payment_operation.options.CAPTURE) {
                    return;
                }

                // @review add in a callback to process void for test cases
                app.hlapi.capture(transaction, resp);
            }

            /* handle zero dollar transactions with verify */
            if (!parseInt(transaction.amount * 100)) {
                app.hlapi.verify(card, transaction, captureCallback);
            } else {
                // authorize the card
                app.hlapi.authorize(card, transaction, captureCallback);
            }
        });
    }

    function post(requestBody) {

        if (doTests) {
            runTests();
        }

        try {

            var result = postToHeartland(requestBody);

            return result;
        } catch(e) {

            log.error({title: 'postToHeartland failed', details: [JSON.stringify(e), e]});
            throw e;
        }
    }

    function postToHeartland(requestBody) {
        log.audit({title: 'requestBody', details: requestBody});

        establishConnection();

        var rec, resp = {};

        var ccData = JSON.parse(requestBody);

        var card = new GP.CreditCardData();

        var address = new GP.Address();

        for (var addressField in ccData.address) {

            var addressValue = ccData.address[addressField];

            if (addressField == 'state' && addressValue) {
                address.setState(addressValue);
                return;
            }
            address[addressField] = addressValue;
        }

        if (ccData.operation != 'DO_CC_AUTH') {
            return;
        }

        /* no auth needed */
        if (ccData.token) {
            return;
        }

        card.number = ccData.number;
        card.expMonth = ccData.expMonth;
        card.expYear = ccData.expYear;
        card.cvn = ccData.cvn;
        card.cardHolderName = ccData.cardHolderName;

        var transaction = {
            currency: 'USD',
            address: address,
            amount: ccData.amount,
            token_raw: null
        };

        var token = app.hlapi.tokenize(card, transaction, resp);

        resp = token;
        log.audit({title: 'resp', details: [typeof resp, resp]});

        if (app.config.acceptableResponseCodes.indexOf(resp.responseCode) == -1) {

            throw app.config.language.unacceptableResponseHeader + JSON.stringify(resp);
        }

        // if (!resp.token) {
        //     log.error({title: 'no token', details: resp});
        //     return JSON.stringify({error: 'No Token Created resp: '+JSON.stringify(resp)});
        // }

        resp = resp || {};

        return JSON.stringify(resp);
    }

    function establishConnection() {
        var user = runtime.getCurrentUser();

        var profile = utils.isProduction() 
            ? user.getPreference({name: 'custscript_heartl_pmt_profile'}) 
            : user.getPreference({name: 'custscript_heartl_sandbox_pmt_profile'});

        app.hlapi.connectToHeartland(profile);
    }

    return {
        post: post
    };

});