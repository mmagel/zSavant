/**
 * helper.v2.js
 * @NApiVersion 2.x
 */
define([
    'N/log',
    'N/search',
    'N/record',
    'N/runtime',
    'SuiteBundles/Bundle 227444/HeartlandPayments/Heartland_Application_CM'
], function (log, search, record, runtime, app) {

    function isProduction() {
        return runtime.envType == 'PRODUCTION';
    }

    function addToken(ccData, token) {
        log.debug({title: 'ccData, token', details: [ccData, token]});

        if (!ccData || !token) {
            log.error({title: 'no ccData or token', details: [ccData, token]});
        }

        var oneTimeUse = String(ccData.oneTimeUse || false).substr(0,1).toUpperCase();

        var ccNumber = ccData.number.replace(/.(?=.{4,}$)/g, '*');

        var filters = [
            ['isinactive', search.Operator.IS, false],
            'AND',
            ['custrecord_heartl_customer', search.Operator.ANYOF, ccData.custId],
            'AND',
            ['name', search.Operator.IS, ccNumber],
            'AND',
            ['custrecord_heartl_one_time_use', search.Operator.IS, false]
        ];

        var columns = ['internalid'];

        var searchOptions = {
            type: 'customrecord_heartl_cc_tokens',
            filters: filters,
            columns: columns
        };

        log.debug({title: 'searchOptions', details: [searchOptions]});

        var s = search.create(searchOptions);

        var searchResult = s.run().getRange({
            start: 0,
            end: 1
        });

        if (searchResult.length == 1) {

            var recordId = searchResult[0].id;

            var options = {
                type: 'customrecord_heartl_cc_tokens',
                id: recordId,
                values: {
                    custrecord_heartl_customer: ccData.custId,
                    custrecord_heartl_ccname: ccData.cardHolderName,
                    custrecord_heartl_cc_token: token,
                    custrecord_heartl_ccexp: ccData.expMonth + '/' + ccData.expYear,
                    custrecord_heartl_one_time_use: oneTimeUse
                }
            };

            record.submitFields(options);

            return searchResult[0].id;

        } else {

            var recFields = {
                name: ccNumber,
                custrecord_heartl_customer: ccData.custId,
                custrecord_heartl_ccname: ccData.cardHolderName,
                custrecord_heartl_cc_token: token,
                custrecord_heartl_ccexp: ccData.expMonth + '/' + ccData.expYear,
                custrecord_heartl_one_time_use: oneTimeUse == 'T'
            };
          
            var rec = record.create({
                type: 'customrecord_heartl_cc_tokens',
                isDynamic: true
            });

            for (var key in recFields) {
                if (recFields.hasOwnProperty(key)) {
                  	var options = {
                        fieldId: key,
                        value: recFields[key]
                    };

                    rec.setValue(options);
                }
            }

            var id = rec.save();

            return id;

        }
    }

    // @todo needs to be revisited, this is failing to allow test card MC: 547300000000014
    function isCreditCardValid(value) {
        // accept only digits, dashes or spaces
        if (/[^0-9-\s]+/.test(value)) return false;

        // return true;

        // The Luhn Algorithm
        var nCheck = 0, nDigit = 0, bEven = false;
        value = value.replace(/\D/g, "");

        for (var n = value.length - 1; n >= 0; n--) {
            var cDigit = value.charAt(n),
                nDigit = parseInt(cDigit, 10);

            if (bEven) {
                if ((nDigit *= 2) > 9) nDigit -= 9;
            }

            nCheck += nDigit;
            bEven = !bEven;
        }

        return (nCheck % 10) == 0;
    }

    /* Updates the newRecord object with API response data */
    function updateNewRecord(newRecord, resp, appConfig) {

        try {
            var avsResponseCode = resp.avsResponseCode;
            var avsResponseMessage = resp.avsResponseMessage;
            var cvnResponseCode = resp.cvnResponseCode;
            var cvnResponseMessage = resp.cvnResponseMessage;

            newRecord.setValue({
                fieldId: appConfig.transaction.body.ccAuthCode,
                value: resp.transactionReference.authCode
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.transactionId,
                value: resp.transactionReference.transactionId
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.referenceNumber,
                value: resp.referenceNumber
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.gatewayResponse,
                value: JSON.stringify(resp)
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.avsResultCode,
                value: avsResponseCode
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.avsResultText,
                value: avsResponseMessage
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.cvvResultCode,
                value: cvnResponseCode
            });
            newRecord.setValue({
                fieldId: appConfig.transaction.body.cvvResultText,
                value: cvnResponseMessage
            });
        } catch(e) {
            throw appConfig.language.badGatewayResponse;
        }
    }

    function createHeartlandCreditCard(dataIn) {

        var address = new GP.Address();

        for (var field in dataIn.card.address) {

            // if (field == 'state') {
                // address.setState(dataIn.card.address[field]);
                // return;
            // }
            address[field] = dataIn.card.address[field];
        }

        var cardObj = new GP.CreditCardData();

        cardObj.number = dataIn.card.number;
        cardObj.expMonth = dataIn.card.expMonth;
        cardObj.expYear = dataIn.card.expYear;
        cardObj.cvn = dataIn.card.cvn;
        cardObj.cardHolderName = dataIn.card.cardHolderName;
        cardObj.address = address;

        return cardObj;
    }

    return {
        addToken: addToken,
        isCreditCardValid: isCreditCardValid,
        isProduction: isProduction,
        updateNewRecord: updateNewRecord,
        createHeartlandCreditCard: createHeartlandCreditCard
    };
});