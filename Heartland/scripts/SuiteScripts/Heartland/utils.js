/**
 * helper.v2.js
 * @NApiVersion 2.x
 */
define(['SuiteScripts/Heartland/lodash',
    'N/log', 'N/search', 'N/record'], function (lodash, log, search, record) {

    function addToken(ccData, token) {

        var ccNumber = ccData.number.replace(/.(?=.{4,}$)/g, '*');

        var filters = [
            search.createFilter({
                name: 'custrecord_heartl_customer',
                operator: search.Operator.ANYOF,
                values: [ccData.custId]
            }),
            search.createFilter({
                name: 'name',
                operator: search.Operator.IS,
                values: ccNumber
            })
        ];

        var columns = [search.createColumn({name: 'internalid'})];

        var s = search.create({
            'type': 'customrecord_heartl_cc_tokens',
            'filters': filters,
            'columns': columns
        });
        var searchResult = s.run().getRange({
            start: 0,
            end: 1
        });
        if (searchResult.length == 1) {

            log.debug({
                title: 'updating customrecord_heartl_cc_tokens',
                details: token
            });

            record.submitFields({
                type: 'customrecord_heartl_cc_tokens',
                id: searchResult[0].getValue({name: 'internalid'}),
                values: {
                    'custrecord_heartl_customer': ccData.custId,
                    'custrecord_heartl_ccname': ccData.cardHolderName,
                    'custrecord_heartl_cc_token': token,
                    'custrecord_heartl_ccexp': ccData.expMonth + '/' + ccData.expYear,
                    'custrecord_heartl_csc': ccData.cvn
                }
            });
        }
        else {

            log.debug({
                title: 'inserting customrecord_heartl_cc_tokens',
                details: token
            });

            var recFields = {
                'name': ccNumber,
                'custrecord_heartl_customer': ccData.custId,
                'custrecord_heartl_ccname': ccData.cardHolderName,
                'custrecord_heartl_cc_token': token,
                'custrecord_heartl_ccexp': ccData.expMonth + '/' + ccData.expYear,
                'custrecord_heartl_csc': ccData.cvn
            };
          
          log.debug({title: 'recFields', details: recFields});

            var rec = record.create({
                type: 'customrecord_heartl_cc_tokens'
            });

            for (var key in recFields) {
                if (recFields.hasOwnProperty(key)) {
                  	var options = {
                        fieldId: key,
                        value: recFields[key]
                    };
                    log.debug({title: 'options', details: options});

                    rec.setValue(options);
                }
            }
log.debug({
                        title: 'saving',
                        details: 'test'
                    });
var id =            rec.save();
                      log.debug({
                        title: 'token id',
                        details: id
                    });
        }
    }

    function isCreditCardValid(value) {
        // accept only digits, dashes or spaces
        if (/[^0-9-\s]+/.test(value)) return false;

        // The Luhn Algorithm. It's so pretty.
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

    return {
        addToken: addToken,
        isCreditCardValid: isCreditCardValid
    }

});