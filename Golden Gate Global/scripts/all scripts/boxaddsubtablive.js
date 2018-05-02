function customerBeforeLoadSS(type, form)
{
	var currentContext = nlapiGetContext();
	
	if ((currentContext.getExecutionContext() == 'userinterface') && (type == 'edit' || type == 'view'))
	{
		try {
			var subtabCount = form.getAllTabs();
			if (subtabCount.length > 1) {
				var company_id = currentContext.getCompany();
				var record_id = encodeURIComponent(nlapiGetRecordId() || '');
				var record_type = encodeURIComponent(nlapiGetRecordType() || '');
				try
				{
					var record = nlapiLoadRecord(record_type, record_id);
				}
				catch (e)
				{
					// such as insufficient permissions exception
					return;
				}
				var record_email = encodeURIComponent(record.getFieldValue('email') || '');
				var record_name = encodeURIComponent(record.getFieldValue('entityid') || '');

				// uses a custom field to allow the admin to define how to title their folders
				//@TODO: add more supported fields
				if (record.getFieldValue('custbodyboxfoldername'))
				{
					record_name = record.getFieldValue('custbodyboxfoldername');
				}
				//@TODO: migrate these to use a custom entity field and allow the admin to define how to title their folders
				else if (record_type == 'supportcase')
				{
					record_name = 'Case Number ' + record.getFieldValue('casenumber');
				}
				else if (record_type == 'issue')
				{
					record_name = 'Issue Number ' + record.getFieldValue('issuenumber');
				}
				else if (record_type == 'solution')
				{
					record_name = 'Solution Code ' + record.getFieldValue('solutioncode');
				}

				var boxNetTab = form.addTab('custpage_boxnet_tab', 'Box Files');
				var boxNetFrame = form.addField('custpage_boxnet_frame', 'inlinehtml', null, null, 'custpage_boxnet_tab');

				var sso_name = 'customssoboxlive';
				var context = nlapiGetContext();
				var environment = context.getEnvironment();
				var context_email = context.getEmail();
				var role_center = context.getRoleCenter();

				var url = nlapiResolveURL('SUITELET', 'customscriptboxsuiteletlive','customdeployboxsuiteletlive', null) + '&record_id=' + record_id + '&record_type=' + record_type + '&record_email=' + record_email + '&record_name=' + record_name + '&role=' + nlapiGetRole() + '&sso_name=' + sso_name + '&environment=' + environment + '&company_id='+company_id;

				// If Customer Center or Partner Center, we append the email to the user identifier
				// This is because Contacts inherit the user ID of the parent Customer or Partner, and we need a way to distinguish
				// between contacts.
				if (role_center == 'CUSTOMER' || role_center == 'PARTNERCENTER')
				{
					url += '&context_email=' + context_email;
				}

				var content = '<script type="text/javascript">';
				/* cross-browser function to get position */
				content += 'function get_position(obj) { var curtop = 0; if (obj.offsetParent) { do { curtop += obj.offsetTop; } while (obj = obj.offsetParent); } return curtop; }';
				/* cross-browser function to set height */
				content += 'function set_height() {if (typeof window.innerWidth != "undefined") { var viewport_height = window.innerHeight; } else if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != "undefined" && document.documentElement.clientWidth != 0) { var viewport_height = document.documentElement.clientHeight; } else { var viewport_height = document.body.clientHeight; } var frame = document.getElementById("boxnet_widget_frame"); var frame_pos = get_position(frame); if (viewport_height - frame_pos > 400) { frame.style.height = viewport_height - frame_pos; } else { frame.style.height = 400; }}';
				/* style modifications to subtab */
				content += 'var frame = document.getElementById("custpage_boxnet_frame_val");';
				content += 'var frame_table = frame.parentNode.parentNode.parentNode.parentNode;';
				//content += 'var frame_table_table = frame_table.parentNode.parentNode.parentNode.parentNode.parentNode;';
				content += 'var tab_div = document.getElementById("custpage_boxnet_tab_div");';
				//content += 'var filler_rows = tab_div.children[0].children[0].children;';
				content += 'frame_table.setAttribute("width", "100%");';
				content += 'frame_table.setAttribute("cellSpacing", "0");';
				//content += 'frame_table_table.style.padding = 0;';
				//content += 'for (var i = 0; i < filler_rows.length - 1; i++) { filler_rows[i].style.display = "none"; }';

				/* attach listeners for resizing widget */
				content += 'if ( typeof window.addEventListener != "undefined" ){ window.addEventListener( "load", set_height, false ); window.addEventListener( "resize", set_height, false ); }';
				content += 'else { window.attachEvent("onresize", set_height); window.attachEvent("onload", set_height); }';
				content += '</script>';

				/* display iframe */
				content += '<iframe id="boxnet_widget_frame" src="' + url + '" align="center" style="width: 100%; height:600px; margin:0; border:0; padding:0" frameborder="0"></iframe>';
				boxNetFrame.setDefaultValue(content);
			}
		}
		catch (e) {
			nlapiLogExecution('DEBUG', 'TEST', e.getMessage());
		}
	}
}