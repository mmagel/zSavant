function boxNetSuitelet(request, response)
{
	var sso_name = request.getParameter('sso_name');
	var company_id = request.getParameter('company_id');
	var record_id = request.getParameter('record_id');
	var record_type = request.getParameter('record_type');
	var record_email = request.getParameter('record_email');
	var record_name = request.getParameter('record_name') || record_type + ' ' + record_id;  // otherwise, tag will be blank
	record_name = record_name.charAt(0).toUpperCase() + record_name.slice(1); //uppercase
	// convert prospect -> lead, customer -> lead
	if (record_type == 'prospect' || record_type == 'customer')
	{
		record_type = 'lead';
	}
	var role = request.getParameter('role');
	var environment = request.getParameter('environment');
	var context_email = request.getParameter('context_email');
	var contactseparateboxlogin = nlapiGetContext().getSetting('SCRIPT', 'custscriptcontactseparateboxloginsllive');
	// do SSO, and get iframe URL
	var url = nlapiOutboundSSO(sso_name);
	var url_split = url.split('?');
	url = url_split[0];
	var token = url_split[1];
	var token_split = token.split('=');
	token = token_split[1];
	var token_params = {
		'oauth_token': token
		,'role': role
		,'environment': environment
		,'partner_enterprise_id': company_id
	};
	
	if (contactseparateboxlogin == 'T' && context_email)
	{
		token_params.context_email = context_email;
	}
	
	var token_params_string = '{';
	for (key in token_params)
	{
		token_params_string += '"' + key + '":"' + token_params[key] + '",';
	}
	// get rid of trailing comma
	token_params_string = token_params_string.substring(0, token_params_string.length - 1);
	token_params_string += '}';
	
	var url_params = {
		'token': token_params_string
		,'partner_object_name': record_name
		,'partner_object_type': record_type
		,'partner_object_id': record_id
		,'partner_object_email': record_email
	};
	
	var url_params_string = '';
	for (key in url_params)
	{
		url_params_string += key + '=' + encodeURIComponent(url_params[key]) + '&';
	}
	// get rid of trailing ampersand
	url_params_string = url_params_string.substring(0, url_params_string.length - 1);
	
	url += '?' + url_params_string;
	
	//var content = '<iframe src="' + url + '" align="center" style="width: 100%; height:600px; margin:0; border:0; padding:0"></iframe>';
	var content = '<script type="text/javascript">window.location = "' + url + '";</script>';
	response.write(content);
}