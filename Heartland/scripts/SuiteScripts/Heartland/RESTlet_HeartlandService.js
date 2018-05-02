/**
 * Created by huzaifa.sultanali on 12/15/2017.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['SuiteScripts/Heartland/lodash',
    'SuiteScripts/Heartland/globalpayments.api',
    'SuiteScripts/Heartland/utils',
    'N/log', 'N/record', 'N/search'], function (lodash, GP, utils, log, record, search) {

    function post(requestBody) {
      try {
            var result = postToHeartland(requestBody);
            log.debug({title: 'result', details: result});
	     return result;
      } catch(e){
        log.error({title: 'postToHeartland failed', details: [JSON.stringify(e), e]});
        return "" + e.code;
      }
    }

    function postToHeartland(requestBody) {
      
    


        log.debug('post');

        log.debug({
            title: 'requestBody',
            details: requestBody
        });

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
log.debug({title:'requestBody', details: requestBody});
        var ccData = JSON.parse(requestBody);
        ccData = ccData.postData;

        var card = new GP.CreditCardData();

        if (ccData.operation == 'DO_CC_AUTH') {

            if (!ccData.token) {

                card.number = ccData.number;
                card.expMonth = ccData.expMonth;
                card.expYear = ccData.expYear;
                card.cvn = ccData.cvn;
                card.cardHolderName = ccData.cardHolderName;

                //const address = new GP.Address();
                //address.state = "12345";

                log.debug({title:'card', details: card});

                card.tokenize()
                    .withCurrency("USD")
                    //.withAddress(address)
                    //.withAllowDuplicates(true)
                    .withRequestMultiUseToken(true)
                    .execute()
                    .then(function (token) {
                      log.debug({title: 'replace token', details: 'replaced: '+token});
                        resp = token;
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
      
      resp = resp || {}

        return JSON.stringify(resp);
    }

    return {
        post: post
    }

});