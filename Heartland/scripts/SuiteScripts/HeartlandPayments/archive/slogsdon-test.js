/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['SuiteScripts/Heartland/globalpayments.api', 'N/log'], function (GP, log) {

    function execute(context) {

        var resp = {};

        log.debug('execute');

        var config = new GP.ServicesConfig();
        config.secretApiKey = "skapi_cert_MefZAQABn14AwHnnoi0AU5gwRtJztgm-woaoiGEukQ";  //"skapi_cert_MTeSAQAfG1UA9qQDrzl-kz4toXvARyieptFwSKP24w";
        config.serviceUrl = "https://cert.api2.heartlandportico.com";

        GP.ServicesContainer.configure(config);

        var card = new GP.CreditCardData();
        card.number = "4111111111111111";
        card.expMonth = "12";
        card.expYear = "2025";
        card.cvn = "123";
        card.cardHolderName = "Joe Smith";

        const address = new GP.Address();
        address.state = "12345";

        card.tokenize()
            .withCurrency("USD")
            .withAddress(address)
            .execute()
            .then(function (token) {

                /*
                log.debug({
                    title: "token",
                    details: token
                });
                */

                resp = token;
            });

        // card.tokenize();

        log.debug('token: ' + JSON.stringify(resp));

        /*
         card.authorize("14")
         .withCurrency("USD")
         .withAllowDuplicates(true)
         .execute()
         .then(function (authorization) {
         log.debug({
         title: "authorization response",
         details: authorization
         });
         return authorization;
         });

         card.authorize()
         */
    }

    return {
        execute: execute
    };

});