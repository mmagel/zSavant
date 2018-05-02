/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([
	'N/record', 
	'N/runtime', 
	'SuiteBundles/Bundle 227444/HeartlandPayments/20180312-globalpayments.api',
	'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Application_CM',
	'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Utilities_CM'
], function (record, runtime, GP, app, utils) {

	function beforeSubmit(context) {

		var captureResponse = {};
		var resp = {};
		var newRecord = context.newRecord;
		var typesAllowed = [context.UserEventType.CREATE, context.UserEventType.EDIT];

		if (typesAllowed.indexOf(context.type) == -1) {
			return;
		}

		app.hlapi.initialize();

		var paymentOperation = newRecord.getValue({
			fieldId: app.config.transaction.body.paymentOperation
		});

		/* if this is not a heartland transaction, we have nothing to do here */
		if (!paymentOperation) {
			return;
		}

		var doNotStoreCard = newRecord.getValue({
			fieldId: app.config.transaction.body.doNotStoreCard
		});

		var newCCId = newRecord.getValue({
			fieldId: app.config.transaction.body.creditCardId,
		});

		/* copy new cc internalid to the select field - record configuration will 
			not allow to save a token marked 'do not store' */
		if (!doNotStoreCard && newCCId) {
			newRecord.setValue({
				fieldId: app.config.transaction.body.creditCards,
				value: newCCId
			});
		}




		var token = newRecord.getValue({
			fieldId: app.config.transaction.body.ccToken
		});

		var expiration = newRecord.getValue({
			fieldId: app.config.transaction.body.expiration
		});

		var previousResponse = newRecord.getValue({
			fieldId: app.config.transaction.body.gatewayResponse
		});
		var amount = newRecord.getValue({
			fieldId: 'total'
		}) || '0.00';
		var transactionId = newRecord.getValue({fieldId: 'custbody_heartl_trx_id'});

		var transaction = {};
		transaction.amount = amount || '0.00';
		
		if (transactionId) {
			transaction.transactionId = transactionId;
		}
		var user = runtime.getCurrentUser();
        var profile = utils.isProduction() 
            ? user.getPreference({name: 'custscript_heartl_pmt_profile'}) 
            : user.getPreference({name: 'custscript_heartl_sandbox_pmt_profile'});

		var cardHolderName = newRecord.getValue({
			fieldId: app.config.transaction.body.ccHolderName
		});
        var card = new GP.CreditCardData();
        card.token = token;
    	card.cvn = '';
		card.cardHolderName = cardHolderName;
		card.expMonth = '';
        card.expYear = '';
		// Parse the expiration date
		var split = expiration.split('/');

		if (split.length == 2) {
			card.expMonth = split[0].replace(/^\s+|\s+$/g, '') || '';
			card.expYear = split[1].replace(/^\s+|\s+$/g, '') || '';
		}

        app.hlapi.connectToHeartland(profile);

		log.debug({title: 'paymentOperation, token', details: [paymentOperation, token]});

		/* handle CC Sale with a charge transaction */
		if ((paymentOperation == app.config.list.payment_operation.options.SALE_REQUEST
			|| paymentOperation == app.config.list.payment_operation.options.CAPTURE)
			&& token) {

			// card.token = token;
			var chargeResponse = {};
			chargeResponse = app.hlapi.charge(card, transaction, function callback(chargeResponse) {
				resp = chargeResponse;
				log.debug({title: 'chargeResponse', details: chargeResponse});
			});

	        handleApiResponse(newRecord, resp, app.config);

	        return;
		}

		if (!expiration) {
			log.error({title: 'no expiration date input', details: true});
			return;
		}

		if (!token) {
			log.error({title: 'no token', details: true});
			return;
		}

        /* run the void/refund functionality when the payment operation is refund and the transaction is refund */
		if (paymentOperation == app.config.list.payment_operation.options.REFUND
			&& context.newRecord.type == record.Type.CASH_REFUND) {

        	var refundResponse = {};
        	refundResponse = app.hlapi.void_refund(transaction, refundResponse);

        	if (refundResponse) {
				log.debug({title: 'refundResponse after', details: refundResponse});
        		// update this current record with the details of the refund update
        	}
        	throw refundResponse;
		}

		/* If a transaction id does not exist, then it needs to be authorized */
		else if (!transaction.transactionId) {

			/* This function is passed to the verify/authorize transactions as a callback to the promise used to hit the API */
			var captureCallback = function(authorization) {

				resp = authorization;
				transaction.transactionId = authorization.transactionReference.transactionId;

            	if (paymentOperation != app.config.list.payment_operation.options.CAPTURE) {
            		return;
            	}

            	captureResponse = app.hlapi.capture(transaction, resp);
            };

			try {

        		/* handle zero dollar transactions with verify */
	            if (!parseInt(transaction.amount * 100)) {
	                app.hlapi.verify(card, transaction, captureCallback);
	            } else {

	                // authorize the card
	                app.hlapi.authorize(card, transaction, captureCallback);
	            }

        	} catch(err) {
	            log.error({title: 'error', details: JSON.stringify(err)});

        		throw app.handleError(err);
        	}

		} else {

			/* transaction id already exists, capture if applicable */
			try {

            	if (paymentOperation != app.config.list.payment_operation.options.CAPTURE) {
            		return;
            	}

            	captureResponse = app.hlapi.capture(transaction, resp);

			} catch(err) {
                log.error({title: 'previously authorized error', details: JSON.stringify(err)});
			}
        }

        handleApiResponse(newRecord, resp, app.config);
	}

	/* update record on good response and throw errors on bad response */
    function handleApiResponse(newRecord, resp, cfg) {

        /* update the record with the successful Heartland API response */
		utils.updateNewRecord(newRecord, resp, app.config);

		if (!resp) {
			throw app.config.language.noGatewayResponse;
		}

		if (app.config.acceptableResponseCodes.indexOf(resp.responseCode) == -1) {
			throw app.config.language.unacceptableResponseHeader + resp.responseMessage;
		}

    }

	/**
	 * Select and disable the refund field if there is no transaction id so
	 */
	function disableField(scriptContext, fieldId) {

		var fieldObject = scriptContext.newRecord.getField({fieldId: fieldId});
		var transactionId = scriptContext.newRecord.getValue({fieldId: 'custbody_heartl_trx_id'});
		
		if (transactionId) {
			fieldObject.isDisabled = true;
		} else {
			fieldObject.isDisabled = false;
		}
	}

	return {
		beforeSubmit: beforeSubmit
	};
});