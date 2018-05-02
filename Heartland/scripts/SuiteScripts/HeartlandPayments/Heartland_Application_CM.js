/**
 * app.js
 * @NApiVersion 2.x

 @todo implement withInvoiceNumber
 */
define([
    'N/error',
    'N/https',
    'N/log',
    'N/search',
    'N/record',
    'N/runtime',
    'N/url',
    'SuiteBundles/Bundle 227444/HeartlandPayments/20180312-globalpayments.api',
    'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Utilities_CM'
], function (error, https, log, search, record, runtime, url, GP, utils) {

    var settings = {};

    var config = {

        cardTypes: {
            Visa: 1,
            MasterCard: 2,
            AmericanExpress: 3,
            Discover: 4,
            JCB: 5,
            Other: 6
        },

        acceptableResponseCodes: ['00', '0', '85'],
        defaultAddressType: 'Billing',

        language: {
            paymentMethodIsNotHeartland: 'The Heartland payment method is not set. Set it now?',
            clearHeartlandTransactionBodyFields: 'Clear all Heartland transaction data? ',
            resetForRefund: 'The Heartland transaction data will be cleared on save.',
            noGatewayResponse: 'UNEXPECTED ERROR\n\nNo response from Heartland credit card gateway',
            unacceptableResponseHeader: 'ERROR\n\nHeartland credit card gateway error\n',
            generalError: 'ERROR\n\nAn Error occurred while transmitting to the Heartland credit card gateway API. Try again, try another card, check the error logs.',
            authorizeCard: "Authorize Credit Card?\n\nClick [Cancel] to abort or [OK] to continue",
            authorizeExistingCard: "Authorize Existing Credit Card?\n\nClick [Cancel] to abort or [OK] to continue",
            invalidExpiration: "USER ERROR\n\nPlease set the expiration with MM/YY or MM/YYYY format.",
            invalidVerificationCode: "USER ERROR\n\nPlease enter into the Security Code a 3 or 4 digit card verification code (typically found on the back of the card in the signature panel.)",
            invalidCardNumber: "USER ERROR\n\nThe card number entered is invalid.",
            notAHeartlandTransaction: 'This Refund\'s source transaction does not use the Heartland payment method, and will not be unable to Refund a Heartland payment. Double check the record details',
            tokenExists: 'Press [OK] to Authorize the existing tokenized card for the total amount.',
            amountIsZero: 'USER ERROR\n\nThere is no amount to charge (paymentsessionamount must be set)',
            noItemsOnTransaction: 'USER ERROR\n\nThe transaction must have one or more items.'
        },

        record: {
            connection_settings: {
                type: 'customrecord_heartl_settings',
                fields: {
                    key: 'custrecord_heartl_secret_key',
                    serviceUrl: 'custrecord_heartl_url',
                    website: 'custrecord_heartl_s_website',
                    subsidiary: 'custrecord_heartl_s_subsidiary',
                    currencies: 'custrecord_heartl_s_currencies',
                    testMode: 'custrecord_heartl_s_testmode',
                    accountId: 'custrecord_heartl_s_acct_id',
                    developerId: 'custrecord_heartl_s_developer_id',
                    versionNumber: 'custrecord_heartl_s_version_number',
                    allowDuplicates: 'custrecord_heartl_s_allow_duplicate_tran',
                    autoSetHeartlandDefaultPayment: 'custrecord_heartl_s_autoset_payment_meth', //*
                    autoCaptureCashSales: 'custrecord_heartl_s_autocapture_cashsale',//*
                    notifyAdmins: 'custrecord_heartl_s_error_notify_admin',
                    heartlandPaymentMethodId: 'custrecord_heartl_s_payment_method',
                    autoRefundHeartlandPayments: 'custrecord_heartl_s_autorefund',
                    allowPartialAmount: 'custrecord_heartl_allow_partial_amount',
                    authorizeWithAvs: 'custrecord_heartl_s_authorize_avs',
                    maxRetries: 'custrecord_heartl_s_max_retries',
                    // ignoreAvs: 'custrecord_heartl_s_ignoreavs',
                    avsNotMatched: 'custrecord_heartl_s_avs_notmatched',
                    avsNotAvailable: 'custrecord_heartl_s_avs_notavailable',
                    avsPartialMatch: 'custrecord_heartl_s_avs_partialmatch',
                    // cvvIgnore: 'custrecord_heartl_s_cvv_ignore',
                    cvvNotMatched: 'custrecord_heartl_s_cvv_notmatched',
                    cvvNotSubmitted: 'custrecord_heartl_s_cvv_notsubmitted',
                    cvvNotSupported: 'custrecord_heartl_s_cvv_notsupported',
                    cvvSvcNotAvailable: 'custrecord_heartl_s_cvv_svc_notavailable',
                    authorization: 'custrecord_heartl_s_authorization',
                    verify: 'custrecord_heartl_s_verify',
                    charge: 'custrecord_heartl_s_charge',
                    tokenize: 'custrecord_heartl_s_tokenize',
                    capture: 'custrecord_heartl_s_capture',
                    refund: 'custrecord_heartl_s_refund',
                    'void': 'custrecord_heartl_s_void',
                    // edit: 'custrecord_heartl_s_edit',
                    recurring: 'custrecord_heartl_s_recurring'
                }
            },
            tokens: {
                type: 'customrecord_heartl_cc_tokens',
                field: {
                    customer: 'custrecord_heartl_customer',
                    ccname: 'custrecord_heartl_ccname',
                    token: 'custrecord_heartl_cc_token',
                    ccexp: 'custrecord_heartl_ccexp',
                    cvn: 'custrecord_heartl_csc'
                }
            }
        },

        list: {
            payment_operation:{
                id: 'customlist_heartl_pmt_op',
                options: {
                    AUTH_REQUEST: 1,
                    SALE_REQUEST: 2,
                    REFUND: 3,
                    CAPTURE: 4
                }
            }
        },

        entity: {
            defaultCard: 'custentity_heartl_default_token'
        },

        transaction: {
            body: {

                /* FUNCTIONAL/ACTIONS */
                reset: 'custbody_heartl_reset',
                creditCards: 'custbody_heartl_ccs',
                creditCardId: 'custbody_heartl_cc_id',

                /* API REQUEST DATA: card */
                doNotStoreCard: 'custbody_heartl_do_not_store_card',
                ccHolderName: 'custbody_heartl_ccholder_name',
                cardType: 'custbody_heartl_cardtype',
                csc: 'custbody_heartl_csc',
                expiration: 'custbody_heartl_expiration',
                creditCardNumber: 'custbody_heartl_ccnumber',

                /* API REQUEST DATA: avs */
                address: {
                    processAvs: 'custbody_heartl_process_avs',
                    streetAddress1: 'custbody_heartl_street_address_1',
                    streetAddress2: 'custbody_heartl_street_address_2',
                    streetAddress3: 'custbody_heartl_street_address_3',
                    city: 'custbody_heartl_city',
                    state: 'custbody_heartl_state',
                    province: 'custbody_heartl_province',
                    postalCode: 'custbody_heartl_postal_code',
                    country: 'custbody_heartl_country',
                },

                /* API RESPONSE DATA: card */
                ccToken: 'custbody_heartl_cc_token',

                /* API RESPONSE DATA: transaction  */
                gatewayResponse: 'custbody_heart_gtw_resp',
                cvvResultText: 'custbody_heartl_cvv_result_txt',
                cvvResultCode: 'custbody_heartl_cvv_result_code',
                avsResultText: 'custbody_heartl_avs_result_txt',
                avsResultCode: 'custbody_heartl_avs_result_code',
                ccAuthCode: 'custbody_heartl_cc_auth',
                transactionId: 'custbody_heartl_trx_id',
                referenceNumber: 'custbody_heartl_ref_num',

                /* API REQUEST DATA: payment */
                paymentOperation: 'custbody_heartl_payment_operation',
                paymentStatus: 'custbody_heartl_pmt_sts',
                holdError: 'custbody_heartl_hold_error',
            }
        },

        error: {
            type: 'customrecord_heartl_error',
            field: {
                transaction: 'custrecord_heartl_err_trans_id',
                record: 'custrecord_hle_transaction_record',
                detail: 'custrecord_heartl_err_detail',
                type: 'custrecord_heartl_err_type',
                reported: 'custrecord_heartl_err_reported',
                logged: 'custrecord_heartl_err_logged',
                notified: 'custrecord_heartl_err_notified'
            },
            language: {
                transactionIdMissing: "400: (User Error) Unable to void/refund, No Transaction Id provided",
                badGatewayResponse: "500: (Server Error) Invalid response from the Gateway"
            }
        }
    };

    var internal_cache = {};

    var getRestUrl = function getRestUrl(charge) {
        if (!internal_cache.rest_url) {
            internal_cache.rest_url = url.resolveScript({
                scriptId: 'customscript_heartl_restlet',
                deploymentId: 'customdeploy1'
            });
        }
        if (charge) {
            internal_cache.rest_url += '&custscript_heartl_api=charge';
        }
        
        return internal_cache.rest_url;
    };

    /* @todo support transaction.currency in v2  
        per shane: Heartland only supports USD through our Portico gateway (what you're currently using), 
        but our Realex gateway through Global Payments supports a wide range of currencies. 
        You can find a list here: https://developer.realexpayments.com/#!/technical-resources/currency-codes. 
        The SDK you're using supports Realex using mostly the same code, but you will need to add support for its configuration.
     */
    var currency = 'USD';

    var hlapi = {

        initialize: function initialize(profile) {
            return getSettings(profile);
        },

        /* Establish API session with Heartland */
        connectToHeartland: function connectToHeartland() {

            try {

                var serviceConfig = new GP.ServicesConfig();
                serviceConfig.secretApiKey = settings.key;
                serviceConfig.serviceUrl = settings.serviceUrl;
                serviceConfig.developerId = settings.developerId;
                serviceConfig.versionNumber = settings.versionNumber;
                GP.ServicesContainer.configure(serviceConfig);
            } catch (err) {
                throw "Unable to connect to Heartland: " + JSON.stringify(err);
            }
        },

        /* Wrapper for RESTlet call to Request a credit card token from Heartland */
        routeTokenRequest: function routeTokenRequest(creditCard, callback) {
            
            postData = JSON.stringify(creditCard);
            
            var restUrl = getRestUrl();

            // Generate request headers
            var headers = {
                'Content-Type': 'application/json'
            };

            var restOptions = {
                url: restUrl,
                headers: headers,
                body: postData
            };

            // Perform HTTP POST call
            log.audit({title: 'restOptions', details: restOptions});
            var response = https.post(restOptions);

            return callback(response);
        },


        /* Wrapper for RESTlet call to Charge a credit card */
        routeChargeRequest: function routeChargeRequest(creditCard, callback) {
            
            postData = JSON.stringify(creditCard);
            
            var restUrl = getRestUrl(true);

            // Generate request headers
            var headers = {
                'Content-Type': 'application/json'
            };

            var restOptions = {
                url: restUrl,
                headers: headers,
                body: postData
            };

            // Perform HTTP POST call
            log.audit({title: 'restOptions', details: restOptions});
            var response = https.post(restOptions);

            return callback(response);
        },

        /* Authorize a transaction (non-zero) with Heartland 
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#authorize
        */
        authorize: function authorize(card, transaction, cb) {

            if (!card.isAuthable) {
                throw "Card is not Authable";
            }

            if (!settings.authorization) {
                throw "Heartland Authorization API is not enabled";
            }

            log.audit({title: 'auth card, transaction', details: [card, transaction]});

            /* handle zero dollar transactions with verify */
            if (!parseInt(transaction.amount * 100, 10)) {
                return this.verify(card, transaction, cb);
            }

            card.authorize(transaction.amount)
                .withCurrency(currency)
                //.withAddress(transaction.address && transaction.address.processAvs ? (transaction.address) : false)
                .withAllowDuplicates(settings.allowDuplicates || false)
                .execute()
                .then( cb )
            .catch(function(e){
                throw callbacks.handleError(e);
            });

        },

        /* charge card details with Heartland, used for zero dollar transactions
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#charge
        */
        charge: function charge(card, transaction, cb) {

            if (!card.isChargable) {
                // throw "Card is not chargable";
            }

            if (!settings.charge) {
                throw "Heartland charge API is not enabled";
            }

            log.audit({title: 'charge card, transaction', details: [card, JSON.stringify(card), transaction]});

            card.charge(transaction.amount)
                .withCurrency(currency)
                .withAddress(transaction.address && transaction.address.processAvs ? (transaction.address) : {})
                .withAllowDuplicates(settings.allowDuplicates || false)
                .execute()
                .then( cb )
            .catch(function(e){
                throw callbacks.handleError(e);
            });
        },

        /* Verify card details with Heartland, used for zero dollar transactions
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#verify
        */
        verify: function verify(card, transaction, cb) {

            if (!card.isVerifyable) {
                throw "Card is not Verifyable";
            }

            if (!settings.verify) {
                throw "Heartland Verify API is not enabled";
            }

            log.audit({title: 'verify card, transaction', details: [card, transaction]});

            card.verify(transaction.amount)
                .withCurrency(currency)
                .withAddress(transaction.address && transaction.address.processAvs ? (transaction.address) : false)
                .withAllowDuplicates(settings.allowDuplicates || false)
                .execute()
                .then( cb )
            .catch(function(e){
                throw callbacks.handleError(e);
            });
        },

        /* Tokenize credit card details with Heartland
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#tokenize
        */
        tokenize: function tokenize (card, transaction, resp) {

            if (!card.isTokenizable) {
                throw "Card is not tokenizable";
            }

            if (!settings.tokenize) {
                throw "Heartland Tokenize API is not enabled";
            }

            log.audit({title: 'transaction.address.processAvs, tokenize card, transaction', details: [transaction.address.processAvs, card, transaction]});

            const address = new GP.Address();

            var processAvs = transaction.address.processAvs;
            delete transaction.address.processAvs;

            if (transaction.address.processAvs) {
                address.postalCode = transaction.address.postalCode;
                log.debug({title: 'deleted', details: [address]});
            }

            for (var element in transaction.address) {
                address[element] = transaction.address[element];
            }

            log.debug({title: 'transaction.address', details: [transaction.address]});
            log.debug({title: 'address', details: [address]});
            log.debug({title: 'settings', details: [settings]});

            card.tokenize()
            .withCurrency(currency)
            .withAddress(processAvs ? address : false)
            .withAllowDuplicates(true || settings.allowDuplicates || false)
            .withRequestMultiUseToken(true)
            .execute()
            .then(function (token) {

                resp = token;
                transaction.token_raw = token;
                transaction.token = token.token;
                            log.debug({title: 'resp, transaction', details: [resp, transaction]});
            }).catch(function(e){
                throw callbacks.handleError(e);
            });
            log.debug({title: 'resp', details: [resp]});

            return resp;
        },

        /* Charge an authorized transaction with Heartland
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#capture
        */
        capture: function capture(transaction, resp) {

            if (!transaction.transactionId) {
                log.error({title: 'NO Transaction ID', details: [card, transaction]});
                return callbacks.handleError( config.error.language.transactionIdMissing );
            }

            if (!settings.capture) {
                throw "Heartland Capture API is not enabled";
            }

            var captureResponse = GP.Transaction.fromId(transaction.transactionId)
            .capture(transaction.amount)
            .execute()
            .then(function(captureResponse) {
                resp = captureResponse;
                log.audit({title: 'captureResponse', details: [captureResponse, transaction]});
            }).catch(function(e){
                throw callbacks.handleError(e);
            });

            return resp;
        },

        // reverse: function reverse(card, transaction) {
        //     card.authorize(transaction.amount)
        //         .withCurrency(currency)
        //         .withAddress(transaction.address.processAvs ? transaction.address : false)
        //         .withAllowDuplicates(settings.allowDuplicates || false)
        //         .execute()
        //         .then( function(response) {
        //             var result = Transaction.fromId(response.transactionId)
        //             .reverse(transaction.amount)
        //             .execute();

        //             log.debug({title: 'reverse result', details: result});

        //             callbacks.handleReverseTransactionResponse(response);

        //             return result;
        //         })
        //         .catch(function(e){
        //         throw callbacks.handleError(e);
        //     });
        // },

        /* Void/Refund an authorized transaction with Heartland
            https://developer.heartlandpaymentsystems.com/Documentation/reference/node-js/classes/creditcarddata.html#refund
        */
        void_refund: function void_refund(transaction, resp) {

            if (!transaction.transactionId) {
                log.error({title: 'NO Transaction ID', details: transaction});
                throw callbacks.handleError( config.error.language.transactionIdMissing );
            }

            if (!settings.void) {
                throw "Heartland Capture API is not enabled";
            }

            var void_refundResponse = GP.Transaction.fromId(transaction.transactionId)
            .void(transaction.amount)
            .execute()
            .then(function(void_refundResponse) {
                resp = void_refundResponse;
                log.audit({title: 'void_refund response', details: void_refund});
                return void_refundResponse;

            }).catch(function(e){
                throw callbacks.handleError(e);
            });

        },
        // @todo v2.0
        // edit: function edit(card, transaction) {
        //     card.authorize(transaction.amount)
        //         .withCurrency(currency)
        //         .withAddress(transaction.address.processAvs ? transaction.address : false)
        //         .withAllowDuplicates(settings.allowDuplicates || false)
        //         .execute()
        //         .then( function(response) {
        //             var result = Transaction.fromId(response.transactionId)
        //             .edit()
        //             .withAmount(transaction.amount)
        //             .withGratuity(transaction.gratuity) /* do we need support this feature? */
        //             .execute();

        //             log.debug({title: 'edit result', details: result});

        //             callbacks.handleEditTransactionResponse(response);

        //             return result;
        //         })
        //         .catch(function(e){
        //         throw callbacks.handleError(e);
        //     });
        // },
    };

    var callbacks = {

        handleError: function handleError (err, message) {
            err.type = err.name;
            err.details = JSON.stringify(err);
            err.report = true;
            err.logged = true;
            err.notified = config.notifyAdmins;
            err.id = 0;
            err.retries = settings.maxRetries;
            
            // create error record
            log.error({title: 'err.name:' + err.name, details: [runtime.executionContext , err, err.message, err.code]});
  
            var errorRecord = record.create({
                type: config.error.type
            });

            if (settings.notifyAdmins) {
                error.create({
                    name: err.name,
                    message: err.message,
                    notifyOff: false
                });
            }

            /* reported: 'custrecord_heartl_err_reported', logged: 'custrecord_heartl_err_logged', notified: 'custrecord_heartl_err_notified'*/
            errorRecord.setValue({
                fieldId: config.error.field.transaction,
                value: ''
            });
            errorRecord.setValue({
                fieldId: 'name',
                value: err.name
            });
            errorRecord.setValue({
                fieldId: config.error.field.type,
                value: err.code
            });
            errorRecord.setValue({
                fieldId: config.error.field.detail,
                value: JSON.stringify(err)
            });
            
            if (message) {
                errorRecord.setValue({
                    fieldId: config.error.field.transaction,
                    value: JSON.stringify(message)
                });
            }

            errorId = errorRecord.save();

            if (runtime.executionContext == runtime.ContextType.RESTLET) {

                throw(appConfig.language.badGatewayResponse + ' Please check the Heartland Error records.');
            }
        }
    };

    // wrapper function to only load settings when necessary
    function getSettings(profile) {
        if (!Object.keys(settings).length) {
            settings = loadSettings(profile);
        }
        return settings;
    }

    // load the heartland settings record and set the settings object and return it
    function loadSettings(profile) {

        if (!profile) {
            var user = runtime.getCurrentUser();
            profile = utils.isProduction()
                ? user.getPreference({name: 'custscript_heartl_pmt_profile'})
                : user.getPreference({name: 'custscript_heartl_sandbox_pmt_profile'});
        }
   
        var settingsRecord = record.load({
            type: config.record.connection_settings.type,
            id: profile
        });

        var settingsLoaded = {};

        for (var field in config.record.connection_settings.fields) {
         
            settingsLoaded[field] = settingsRecord.getValue({fieldId: config.record.connection_settings.fields[field]});
        }

        if (settingsLoaded.allowPartialAmount) {
            config.acceptableResponseCodes.push('10');
        }

        settings = settingsLoaded;

        return settings;
    }

    return {
        config: config,
        getRestUrl: getRestUrl,
        hlapi: hlapi,
        settings: settings,
        handleError: callbacks.handleError
    };
});