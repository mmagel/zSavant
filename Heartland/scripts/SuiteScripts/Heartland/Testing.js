/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['SuiteScripts/Heartland/globalpayments.api', 'N/log', 'N/record'],
    function (GP, log, record) {

        function execute(context) {

            var resp = '';

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

            // Get multi-use token
            // can be done in separate transaction flow from authorization,
            // but both are done here for illustration purposes
            const card = new GP.CreditCardData();
            card.number = '4111111111111111';
            card.expMonth = '12';
            card.expYear = '2025';
            card.cvn = '123';
            card.cardHolderName = 'Joe Smith';

            const address = new GP.Address();
            address.postalCode = '12345';

            card.tokenize()
                .withCurrency("USD")
                //.withAddress(address)
                .withRequestMultiUseToken(true)
                .execute()
                .then(function (token) {

                    log.debug({
                        title: 'token',
                        details: JSON.stringify(token)
                    });

                    resp = token;
                });

            // create new CreditCardData object for the token
            const token = new GP.CreditCardData();

            log.debug({
                title: 'resp.token',
                details: resp.token
            });

            token.token = resp.token;
            token.expMonth = '12';
            token.expYear = '2025';

            // authorize the card via the multi-use token
            card.authorize(1)
                .withCurrency("USD")
                .execute()
                .then(function (authorization) {
                    log.debug({
                        title: 'authorization',
                        details: JSON.stringify(authorization)
                    });
                })
                .catch(function (error) {

                    log.debug({
                        title: 'error',
                        details: JSON.stringify(error)
                    });
                });
        }

        return {
            execute: execute
        }
    });