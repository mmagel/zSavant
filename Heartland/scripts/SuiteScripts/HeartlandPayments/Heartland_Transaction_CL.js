/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([
	'N/currentRecord',
	'N/record',
	'N/search',
	'N/url',
	'N/https',
	'SuiteBundles/Bundle 227444/HeartlandPayments/20180312-globalpayments.api',
	'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Application_CM',
	'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Utilities_CM'
], function (currentRecord, record, search, url, https, GP, app, utils) {

	var userInitialized = false;
	var pageInitialized = false;
	var scriptContext = {};
	var heartlandTransactionBodyFields = {};
	var settings = {};
	var initialPaymentMethod = '';
	var lastPaymentMethod = '';
	var paymentOperation = '';

	/**
	 * Function triggered when record is loaded in the UI
	 *
	 * @param {Object} scriptContext
	 * @param {N/record.Record} scriptContext.currentRecord
	 */
	pageInit = function pageInit(scriptContext) {

		try {

			settings = app.hlapi.initialize();

			heartlandTransactionBodyFields = Object.values(app.config.transaction.body);
			lastPaymentMethod = scriptContext.currentRecord.getValue({fieldId: 'paymentmethod'});
			initialPaymentMethod = lastPaymentMethod;

			/* if this field is not set, set it */
			paymentOperation = scriptContext.currentRecord.getValue({
				fieldId: app.config.transaction.body.paymentOperation
			});

			/* if pmt op is not set and not using heartland payment method, it's a non-heartland transaction */
			if (!paymentOperation && !isHeartlandPayment(lastPaymentMethod)) {
				return;
			}

			setDefaultPaymentOperation(scriptContext.currentRecord);

			/* when initializing, refer to the system setting for AVS */
			toggleAddressFields(scriptContext.currentRecord, settings.authorizeWithAvs );

		} catch(e) {
			window.console && console.error(JSON.stringify(e), e);
			throw app.handleError(e);
		}

		pageInitialized = true;
	};

	/* given a transaction record, set the default heartland payment Operation */
	setDefaultPaymentOperation = function setDefaultPaymentOperation(transaction) {

		var defaultPaymentOperation = getDefaultPaymentOperation(transaction.type);

		/* Automatically assign the appropriate payment operation if the Heartland payment method is selected */
		transaction.setValue({
			fieldId: app.config.transaction.body.paymentOperation,
			value: defaultPaymentOperation
		});
	};

	/** 
	 * Function triggered when record is saved
	 *
	 * @param {Object} scriptContext
	 * @param {N/record.Record} scriptContext.currentRecord
	 */
	saveRecord = function saveRecord(scriptContext) {

		try {

			var currentRecord = scriptContext.currentRecord;
			var paymentMethod = currentRecord.getValue({
				fieldId: 'paymentmethod'
			});
			var cardType = currentRecord.getValue({
				fieldId: app.config.transaction.body.cardType
			});
			var postalCode = currentRecord.getValue({
				fieldId: app.config.transaction.body.address.postalCode
			});
			var paymentOperation = currentRecord.getValue({
				fieldId: app.config.transaction.body.paymentOperation
			});
			var transactionId = currentRecord.getValue({
				fieldId: app.config.transaction.body.transactionId
			});
			var transaction = {
				amount: currentRecord.getValue({
					fieldId: 'total'
				})
			};
			var doNotStoreCard = currentRecord.getValue({
				fieldId: app.config.transaction.body.doNotStoreCard
			});
			var lineItemCount = currentRecord.getLineCount({sublistId: 'item'});

			if (!lineItemCount) {
				alert(app.config.language.noItemsOnTransaction);
				return false;
			}

			/* if the transaction id is populated, there is an active authorization in place for the order
			@todo verify the amount */
			if (transactionId) {
				return true;
			}


			var expiration = currentRecord.getValue({
				fieldId: app.config.transaction.body.expiration
			}).replace(/^\s+|\s+$/g, '').split('/');

			if (!expiration  || expiration.length != 2) {
				alert(app.config.language.invalidExpiration);
				return false;
			}

			/* Amex cards require postal code */
			if (cardType == app.config.cardTypes.AmericanExpress) {
				if (!postalCode) {
					var message = 'Postal Code is required.';
					var additionalText = ' Check the Process AVS checkbox.';
					alert(message + (!heartlandccData.address.processAvs ? additionalText : ''));
					return false;
				}
			}

			/* exit if no payment method set and payment Operation not set */
			if (!paymentMethod && !paymentOperation) {
				return true;
			}

			/* if the heartland payment method is not set, but there is a Payment Operation set, confirm with the user */
			if (paymentMethod != settings.heartlandPaymentMethodId) {
				var automaticallySetHeartlandPaymentMethod = confirm(app.config.language.paymentMethodIsNotHeartland);//) {

				if (!automaticallySetHeartlandPaymentMethod) {
					/* bypass tokenization/sale */
					return true;
				}

				currentRecord.setValue({
					fieldId: 'paymentmethod',
					value: settings.heartlandPaymentMethodId
				});
			}

			// set the payment operation after payment method is finalized
			setDefaultPaymentOperation(currentRecord);

			var heartlandccData = buildHeartlandTokenRequest(currentRecord);

			/* if token is already present, do not attempt to update it */
			if (heartlandccData.token) {
				var userResponse = confirm(app.config.language.authorizeExistingCard.concat( " to authorize the card "+maskedCardNumber+" for a total of "+heartlandccData.amount ));

				if (!userResponse) {
					return false;
				}
				return true;
			}

			/* investigate why this is firing for cash sale, maybe bypass it
			 @todo build checker for verification, is there a checksum? */
			if (!heartlandccData.cvn) {
				alert(app.config.language.invalidVerificationCode);
				return false;
			}

			/* if no cc number */
			if (!heartlandccData.number) {
				alert('Credit card is empty');
				return false;
			}
			
			/* Reject invalid credit cards */
			if (!utils.isCreditCardValid(heartlandccData.number)) {
				alert(app.config.language.invalidCardNumber);
				return false;
			}

			/* mask the card number */
			var maskedCardNumber = maskCardNumber(heartlandccData.number);

			/* confirm with the user that the card is about to be authorized for the given amount */
			if (!confirm(app.config.language.authorizeCard.concat( " to authorize the card "+maskedCardNumber+" for a total of "+heartlandccData.amount ))) {
				return false;
			}

			/* If the Do not store checkbox is marked, run a charge transaction */
			if (doNotStoreCard) {

				return app.hlapi.routeChargeRequest(heartlandccData, function callback(captureResponse) {
					
					var response = validateClientResponse(captureResponse);
					
					if (!response) {
						return false;
					}

					heartlandccData.oneTimeUse = true;

					 // create/update the token record 
			        response.ccId = utils.addToken(heartlandccData, response.token);

			        updateHeartlandBodyFields(currentRecord, response);

					return true;
				});
			}

			/* Send a request to Heartland to tokenize the card details, firing the callback on success */
			return app.hlapi.routeTokenRequest(heartlandccData, function callback(tokenResponse) {
				
				console.log('tokenResponse', tokenResponse);

				var response = validateClientResponse(tokenResponse);

				if (!response) {
					return false;
				}

				/* create/update the token record */
		        response.ccId = utils.addToken(heartlandccData, response.token);

		        updateHeartlandBodyFields(currentRecord, response);

				return true;
			});

		} catch(e) {
			window.console && console.error(JSON.stringify(e), e);
			throw app.handleError(e);
		}
		return false;
	};

    function createHeartlandCreditCard(card) {
        var address = new GP.Address();

        for (var field in card.address) {

            // if (field == 'state') {
                // address.setState(card.address[field]);
                // return;
            // }
            address[field] = card.address[field];
        }

        var cardObj = new GP.CreditCardData();

        cardObj.number = card.number;
        cardObj.expMonth = card.expMonth;
        cardObj.expYear = card.expYear;
        cardObj.cvn = card.cvn;
        cardObj.cardHolderName = card.cardHolderName;
        cardObj.address = address;

        return cardObj;
    }

	/* given the current record and the API response, update the response fields */
    updateHeartlandBodyFields = function updateHeartlandBodyFields(recordObject, response) {
    	
		/* set the token and response info on the current transaction */
		recordObject.setValue({
			fieldId: app.config.transaction.body.ccToken,
			value: response.token
		});
		recordObject.setValue({
			fieldId: app.config.transaction.body.gatewayResponse,
			value: JSON.stringify(response)
		});
		recordObject.setValue({
			fieldId: app.config.transaction.body.creditCardId,
			value: response.ccId
		});

		/* Due a UI issue, this field will not be set for a new CC, user event handles that 
		 @note this also serves to force wipe the actual card data before submit via botched sourcing */
		// recordObject.setValue({
		// 	fieldId: app.config.transaction.body.creditCards,
		// 	value: response.ccId
		// });

		/* Unset csc field because its not needed elsewhere and this field does not source from the CC token record */
		recordObject.setValue({
			fieldId: app.config.transaction.body.csc,
			value: ''
		});
    };

	/* Make sure that the response was valid, and handle errors */
	validateClientResponse = function validateClientResponse(response) {
		var responseBody = response.body;

		window.console && console.log('response', response);

		if (!responseBody) {
			alert(app.config.language.noGatewayResponse);
			return false;
		}

		if (responseBody.indexOf('error') != -1) {
			alert(app.config.language.generalError + ' ' + responseBody);
			return false;
		}

		/* parse the response if necessary*/
		if (typeof responseBody == 'string') {
			responseBody = JSON.parse(responseBody);
		}

		/* handle bad gateway response */
		if (!responseBody) {
			alert(app.config.language.noGatewayResponse);
			return false;
		}

		/* reject unacceptable response codes */
		if (app.config.acceptableResponseCodes.indexOf(responseBody.responseCode) == -1) {
			alert(app.config.language.unacceptableResponseHeader + JSON.stringify(responseBody));
			return false;
		}

		return responseBody;
	};

	/* applies asterisks to mask the card data */
	maskCardNumber = function maskCardNumber(number) {

		number = String(number);
		if (!number) {
			return '****************';
		}
		return number.replace(/.(?=.{4,}$)/g, '*');
	};

	/**
	 * Parse the current record to generate the request data for the card tokenization
	 */
	buildHeartlandTokenRequest = function buildHeartlandTokenRequest(currentRecord) {

		var expirationRaw = currentRecord.getValue({
			fieldId: app.config.transaction.body.expiration
		});
		var expiration = expirationRaw.replace(/^\s+|\s+$/g, '').split('/');
		var month = expiration[0];
		var year = expiration[1];

		return {
			expMonth: month,
			expYear: year,
			custId: currentRecord.getValue({
				fieldId: 'entity'
			}),
			number: currentRecord.getValue({
				fieldId: app.config.transaction.body.creditCardNumber
			}),
			token: currentRecord.getValue({
				fieldId: app.config.transaction.body.ccToken
			}),
			amount: currentRecord.getValue({
				fieldId: 'total'
			}) || '0.00',
			cvn: currentRecord.getValue({
				fieldId: app.config.transaction.body.csc
			}),
			cardHolderName: currentRecord.getValue({
				fieldId: app.config.transaction.body.ccHolderName
			}),
			operation: 'DO_CC_AUTH',
			address: {
				processAvs: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.processAvs
				}),
				streetAddress1: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.streetAddress1
				}),
				streetAddress2: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.streetAddress2
				}),
				streetAddress3: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.streetAddress3
				}),
				city: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.city
				}),
				state: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.state
				}),
				province: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.province
				}),
				postalCode: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.postalCode
				}),
				country: currentRecord.getValue({
					fieldId: app.config.transaction.body.address.country
				}),
				type: app.config.defaultAddressType
			}
		};
	};

	/* determine the payment operation value to populate based on the transaction */
	getDefaultPaymentOperation = function getDefaultPaymentOperation(type) {
		switch (type) {
			case record.Type.SALES_ORDER:
				return app.config.list.payment_operation.options.AUTH_REQUEST;
			break;

			// case record.Type.INVOICE:
			// 	return app.config.list.payment_operation.options.SALE_REQUEST;
			// break;

			case record.Type.CASH_REFUND:
				return app.config.list.payment_operation.options.REFUND;
			break;
			case record.Type.CASH_SALE:
				return app.config.list.payment_operation.options.CAPTURE;
			break;
			default: {
				throw "500: No default payment operation for type: " + type;
			}
		}
	};

	/** 
	 * Function triggered when a field value changes.
	 *
	 * @param {Object} scriptContext
	 * @param {N/record.Record} scriptContext.currentRecord
	 */
	fieldChanged = function fieldChanged(scriptContext) {

		try {

			var currentRecord = scriptContext.currentRecord;
			var fieldId = scriptContext.fieldId;
			var fieldValue = currentRecord.getValue({fieldId: fieldId});
			var paymentMethod = currentRecord.getValue({fieldId: 'paymentmethod'});

			/* Toggle address fields displaytype regardless of fieldValue */
			if (fieldId == app.config.transaction.body.address.processAvs) {
				toggleAddressFields(currentRecord, fieldValue);
			}

			/* Always allow fields to be cleared */
			if (!fieldValue || !fieldId) {
				return true;
			}

			/* Remove spaces from credit card number */
			if (fieldId == app.config.transaction.body.creditCardNumber) {
				currentRecord.setValue({
					fieldId: app.config.transaction.body.creditCardNumber,
					value: fieldValue.replace(/\s/g, ''),
					ignoreFieldChange: true
				});
				return true;
			}

			/* When the customer field is set, check if it should default the Heartland payment method */
			else if (fieldId == 'entity') {

				if (settings.autoSetHeartlandDefaultPayment) {
					setDefaultPaymentOperation(currentRecord);
					return true;
				}

				var lookupFields = search.lookupFields({
					type: search.Type.CUSTOMER,
					id: fieldValue,
					columns: [app.config.entity.defaultCard]
				});

				var fieldOptions = {
					fieldId: app.config.transaction.body.creditCards,
					value: lookupFields[app.config.entity.defaultCard][0].value
				};

				/* Delay setting the CC, because NetSuite is attempting to source in the default CC data */
				setTimeout(function(){currentRecord.setValue(fieldOptions);}, 1500);
			}

			/* Clear the Heartland CC selector when payment method changes to something other than Heartland */
			else if (fieldId == 'paymentmethod') {

				if (!pageInitialized) {
					return true;
				}

				var currentPaymentMethod = currentRecord.getValue({fieldId: 'paymentmethod'});

				if (currentPaymentMethod && currentPaymentMethod != settings.heartlandPaymentMethodId) {

					return clearHeartlandFields(currentRecord);
				}
			}

			/* If a change happens in Heartland CC field, make sure the Heartland payment method is set */
			else if (fieldId == app.config.transaction.body.creditCardNumber) {

				if (paymentMethod != settings.heartlandPaymentMethodId) {
					if (confirm(app.config.language.paymentMethodIsNotHeartland)) {
						window.console && console.log('562');

						currentRecord.setValue({fieldId: 'paymentmethod', value: settings.heartlandPaymentMethodId});
						return true;
					} else {
						return false;
					}
				}
				return true;
			}

			/* Handle field driven field reset */
			else if (fieldId == app.config.transaction.body.reset) {

				var returnValue = clearHeartlandFields(currentRecord);

				currentRecord.setValue({
					fieldId: app.config.transaction.body.reset,
					value: false,
					ignoreFieldChange: true
				});

				return returnValue;
			}
		} catch(e) {
			window.console && console.error(JSON.stringify(e), e);
			throw app.handleError(e);
		}
		
		return true;
	};

	/* we need to clear/disable the address fields, need to include the adress fields in the update */
	toggleAddressFields = function toggleAddressFields(currentRecord, avsEnabled) {

		for (var field in app.config.transaction.body.address) {

			/* don't hide the process avs field */
			if (app.config.transaction.body.address[field] == app.config.transaction.body.address.processAvs) {
				continue;
			}
			var screenField = app.config.transaction.body.address[field];
			var fieldObject = currentRecord.getField({fieldId: screenField});
			var isDisabled = fieldObject.isDisabled;
			var isDisplay = fieldObject.isDisplay;
			
			fieldObject.isDisplay = avsEnabled;
			fieldObject.isVisble = avsEnabled;
			fieldObject.isDisabled = !avsEnabled;
			
			if (!avsEnabled) {
				fieldObject.setValuedefaultValue = '';
			}
		}
	};

	/* Handle resetting all the Heartland fields on this transaction */
	clearHeartlandFields = function clearHeartlandFields (currentRecord) {

		heartlandTransactionBodyFields.forEach(function(field, index, arrayInput) {

			if (typeof field != 'string') {
				return;
			}

			var FieldOptions = {
				fieldId: field,
				value: ''
			};
			
			try {

				/* don't unset the field that was just set/unset */
				if (FieldOptions.fieldId == app.config.transaction.body.reset
					|| FieldOptions.fieldId == app.config.transaction.body.doNotStoreCard) {
					FieldOptions.skipped = true;

					return true;
				}

				currentRecord.setValue(FieldOptions);
			} catch(e) {
				window.console && console.error('e', JSON.stringify(e));

				// above setValue function call fails when the field type is checkbox, so handle checkbox here
				FieldOptions.value = true;
				currentRecord.setValue(FieldOptions);
			}
		});
		
		return true;
	};

	/* Check the transaction paymentmethod, if it is not, and is refundable, clear the heartland fields @todo review this */
	isHeartlandPayment = function isHeartlandPayment(paymentmethod) {

		if (!paymentmethod) {
			return false;
		}

		var currentRec = currentRecord.get();
		var refunded = false;

		//	if there is no heartland payment information set, or the transaction is already refund, return
		var isRefundable = true;
		
		if (paymentmethod != settings.heartlandPaymentMethodId && currentRec.type === record.Type.CASH_REFUND) {
		
			isRefundable = true;
		}

		// reset heartland billing fields
		if (!refunded && isRefundable) {
			console.log(685);
			currentRec.setValue({
				fieldId: app.config.transaction.body.reset,
				value: true
			});
		}

		/* has the order already been refunded? we need to record that transaction's id */
		return isRefundable && !refunded;
	};

	return {
		pageInit: pageInit,
		saveRecord: saveRecord,
		fieldChanged: fieldChanged
	};
});