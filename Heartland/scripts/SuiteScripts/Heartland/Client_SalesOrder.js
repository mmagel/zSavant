/**
 * Created by huzaifa.sultanali on 9/6/2017.
 */

function onSave() {

    try {

        //alert(1);

        // Grab references to the field elements
        var card = nlapiGetFieldValue('ccnumber');
        var expiration = nlapiGetFieldValue('ccexpiredate');
        var cvv = '123'; //document.getElementById('standardCardCvv');

        // Parse the expiration date
        var split = expiration.split('/');
        var month = split[0].replace(/^\s+|\s+$/g, '');
        var year = split[1].replace(/^\s+|\s+$/g, '');

        //alert(month + ':' + year);

        // Create a new `HPS` object with the necessary configuration
        (new Heartland.HPS({
            publicKey: 'pkapi_cert_f2PVUhLj6jRBSCtTL5',
            cardNumber: card.replace(/\D/g, ''),
            cardCvv: cvv.replace(/\D/g, ''),
            cardExpMonth: month.replace(/\D/g, ''),
            cardExpYear: year.replace(/\D/g, ''),
            // Callback when a token is received from the service
            success: function (resp) {

                alert('Here is a single-use token: ' + resp.token_value);

                var validServicesConfig = {
                    secretApiKey: "skapi_cert_MTHmAQBzLV8Az7J-Bw0NNiftmI7VPCClwvpAOd-dCg",
                    versionNumber: "1234",
                    developerId: "123456"
                };
                var uri = "https://cert.api2.heartlandportico.com/hps.exchange.posgateway/posgatewayservice.asmx";

                var creditService = new HpsCreditService(
                    validServicesConfig,
                    uri
                );

                return true;

            },
            // Callback when an error is received from the service
            error: function (resp) {
                alert('There was an error: ' + resp.error.message);
            }
            // Immediately call the tokenize method to get a token
        })).tokenize();
    } catch (e) {
        alert('There was an issue submitting. Are all of the fields filled out?');
        return false;
    }
}

var ccValidated = false;

(function (document, Heartland) {

    // Enhance the payment fields
    //Heartland.Card.attachNumberEvents('#ccnumber');
    //Heartland.Card.attachExpirationEvents('#ccexpiredate');
    //Heartland.Card.attachCvvEvents('#standardCardCvv');

    // Attach a handler to interrupt the form submission
    Heartland.Events.addHandler(document.getElementById('main_form'), 'submit', function (e) {
        // Prevent the form from continuing to the `action` address
        e.preventDefault();

        try {

            // Grab references to the field elements
            var card = document.getElementById('custbody_heartl_ccnumber');
            var expiration = document.getElementById('ccexpiredate');
            var cvv = document.getElementById('custbody_heartl_csc');

            // Parse the expiration date
            var split = expiration.value.split('/');
            var month = split[0].replace(/^\s+|\s+$/g, '');
            var year = split[1].replace(/^\s+|\s+$/g, '');

            // Create a new `HPS` object with the necessary configuration
            (new Heartland.HPS({
                publicKey: 'pkapi_cert_f2PVUhLj6jRBSCtTL5',
                cardNumber: card.value.replace(/\D/g, ''),
                cardCvv: cvv.value.replace(/\D/g, ''),
                cardExpMonth: month.replace(/\D/g, ''),
                cardExpYear: year.replace(/\D/g, ''),
                // Callback when a token is received from the service
                success: function (resp) {
                    alert('Here is a single-use token: ' + resp.token_value);
                    ccValidated = true;
                },
                // Callback when an error is received from the service
                error: function (resp) {
                    alert('There was an error: ' + resp.error.message);
                }
                // Immediately call the tokenize method to get a token
            })).tokenize();
        } catch (e) {
            alert('There was an issue submitting. Are all of the fields filled out?');
        }

        /*
        while (true) {
            if (ccValidated)
                break;
        }
        jQuery('#main_form').submit();
        */
    });
}(document, Heartland));