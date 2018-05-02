/**
 * Heartland MultiUse Tokens
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['SuiteScripts/Heartland/globalpayments.api'], function(GP){

	function getMultiUseToken() {
		const config = new GP.ServicesConfig();

		config.secretApiKey = 'skapi_cert_MefZAQABn14AwHnnoi0AU5gwRtJztgm-woaoiGEukQ';

		config.serviceUrl = 'https://cert.api2.heartlandportico.com';

		 

		GP.ServicesContainer.configure(config);

		 

		// Get multi-use token

		// can be done in separate transaction flow from authorization,

		// but both are done here for illustration purposes

		const card = new GP.CreditCardData();

		card.number = '411111******1111';
		card.expMonth = '12';
		card.expYear = '2025';
		card.cvn = '123';

		card.cardHolderName = 'Joe Smith';

		const address = new GP.Address();

		address.postalCode = '12345';

		card.tokenize()
		.withCurrency('USD')
		.withAddress(address)
		.execute()
		.then(function(response) {

			console.log(response);

			// create new CreditCardData object for the token

			const token = new GP.CreditCardData();

			token.token = response.token;

			token.expMonth = '12';
			token.expYear = '2025';

			// authorize the card via the multi-use token

			var result = token.authorize(10)
				.withCurrency("USD")
				.execute()
				.then(function(authorization) {

					log.debug("auth:", authorization);

				})

				.catch(function(err){ log.error(err);});

				log.debug({title: 'result', details: result});

		}).catch(function(error) { log.error(error);});
	}
	return {
		onRequest: getMultiUseToken
	};
});