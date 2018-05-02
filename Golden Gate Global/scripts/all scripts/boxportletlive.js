/**
 * @author hnguyen
 */

function flashPortlet(portlet, column)
{
	portlet.setTitle('Box Files');
	
	var role = nlapiGetRole();
	var environment = nlapiGetContext().getEnvironment();
	var company_id = nlapiGetContext().getCompany();
	// do SSO, and get iframe URL
	var url = nlapiOutboundSSO('customssoboxlive');
	var url_split = url.split('?');
	url = url_split[0];
	var token = url_split[1];
	var token_split = token.split('=');
	token = token_split[1];
	
	var context = nlapiGetContext();
	var context_email = context.getEmail(); 
	var role_center = context.getRoleCenter();
	var contactseparateboxlogin = context.getSetting('SCRIPT', 'custscriptcontactseparateboxloginpllive');
	
	var token_params = {
		'oauth_token': token
		,'role': role
		,'environment': environment
		,'partner_enterprise_id': company_id
	};
	
	// If Customer Center or Partner Center, we append the email to the user identifier
	// This is because Contacts inherit the user ID of the parent Customer or Partner, and we need a way to distinguish
	// between contacts.
	if (contactseparateboxlogin == 'T' && (role_center == 'CUSTOMER' || role_center == 'PARTNERCENTER'))
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
		'token': encodeURIComponent(token_params_string)
	}
	
	var url_params_string = '';
	for (key in url_params)
	{
		url_params_string += key + '=' + url_params[key] + '&';
	}
	// get rid of trailing ampersand
	url_params_string = url_params_string.substring(0, url_params_string.length - 1);
	
	url += '?' + url_params_string;
	
	var content = '<iframe src="' + url + '" align="center" style="width: 100%; height:600px; margin:0; border:0; padding:0"></iframe>';
	//var content = '<script type="text/javascript">window.location = "' + url + '";</script>';
	portlet.setHtml(content);
}