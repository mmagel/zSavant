/**
 * Created by Huzaifa on 9/10/2017.
 */

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['SuiteScripts/Heartland/lodash',
		'SuiteScripts/Heartland/globalpayments.api2.js',
		'SuiteScripts/Heartland/utils', 'N/record', 'N/log'],
	function (lodash, GP, utils, record, log) {

		function beforeSubmit(context) {

			if (context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.EDIT) {

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

				var resp = {}, newRecord = context.newRecord;

				//var updFlds = newRecord.getValue({fieldId: 'custbody_heartl_update_fields'});
				//var gtwResp = newRecord.getValue({fieldId: 'custbody_heart_gtw_resp'});
				var authCC = newRecord.getValue({fieldId: 'custbody_heartl_do_cc_auth'});
				var amount = parseFloat(newRecord.getValue({fieldId: 'total'}));
				var token = newRecord.getValue({fieldId: 'custbody_heartl_cc_token'});

				const card = new GP.CreditCardData();

				var expiration = newRecord.getValue({
					fieldId: 'custbody_heartl_expiration'
				});
				if (expiration) {
					// Parse the expiration date
					var split = expiration.split('/');
					if (split.length == 2) {
						var month = split[0].replace(/^\s+|\s+$/g, '');
						var year = split[1].replace(/^\s+|\s+$/g, '');
					}
					card.expMonth = month;
					card.expYear = year;
				}

				if (authCC) {

					if (newRecord.type == 'salesorder') {

						card.token = token;

						log.debug({
							title: 'card, amount',
							details: [card,amount]
						});

						card.authorize(amount)
							.withCurrency("USD")
							.execute()
							.then(function (authorization) {
								log.debug({
									title: 'authorization',
									details: authorization
								});

								resp = authorization;
var transaction = {};


                // card.authorize(amount)
                //     .withCurrency('USD')
                //     .execute()
                //     .then( function(authorize2) {
                        var transactionId = authorization.transactionReference.transactionId;
                        log.debug({title:'transactionId', details: transactionId});
                        var capture = GP.Transaction.fromId(transactionId)
                        .capture(amount) /* is it possible that our amount is different from the serverside? */
                        .execute();

                        log.debug({title: 'capture', details: capture});
                        transaction.authorization = authorization;
                        transaction.capture = capture;
                        log.debug({title:'transaction', details: transaction});
                        
                //     })
                // .catch(function(err){log.error({title: 'auth/capture error', details: err});});




							})
							.catch(function (error) {

								log.error({
									title: 'auth error',
									details: JSON.stringify(error)
								});
							});
					}

					if (!lodash.isEmpty(resp)) {
						log.debug({
									title: '100',
									details: 100
								});
						if (resp.responseCode == '00') {

							/**
							 ** newRecord.setValue({
								fieldId: 'custbody_heartl_ccs',
								value: ''
							});
							 */
							newRecord.setValue({
								fieldId: 'custbody_heartl_expiration',
								value: ''
							});
							newRecord.setValue({
								fieldId: 'custbody_heartl_cc_auth',
								value: resp.transactionReference.authCode
							});
							newRecord.setValue({
								fieldId: 'custbody_heartl_do_cc_auth',
								value: false
							});
							newRecord.setValue({
								fieldId: 'custbody_heartl_trx_id',
								value: resp.transactionReference.transactionId
							});
							newRecord.setValue({
								fieldId: 'custbody_heartl_ref_num',
								value: resp.referenceNumber
							});

							/*
							newRecord.setValue({
								fieldId: 'custbody_heartl_update_fields',
								value: false
							});*/
							newRecord.setValue({
								fieldId: 'custbody_heart_gtw_resp',
								value: JSON.stringify(resp)
							});
							
							//return true;
						}
						else {
							throw 'ERROR\n\nHeartland credit card gateway error\n' + resp.responseMessage;
							//return false;
						}
					}
					else {
						throw 'UNEXPECTED ERROR\n\nNo response from Heartland credit card gateway';
						//return false;
					}
				}
			}

			/*
			if (recordType == 'cashsale') {

				// if no token, get token and charge cc

				// if token, charge cc

				// on success, clear token
			}

			if (recordType == 'cashrefund' && !recordId && heartlTrxId) {

				// use saved heartland transaction id to refund CC

			}
			*/
			log.debug({title:'end of before submit', details: 181});
		}

		return {
			beforeSubmit: beforeSubmit
		};
	});