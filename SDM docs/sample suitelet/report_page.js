/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Feb 2014     AHalbleib
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */



function report_page(request, response){
	  if (request.getMethod() == 'GET' )
	  {
		  //asdf
		  //if (request.getParameter('custpage_file_name')!=null){
			//    mm=nlapiLoadRecord('customrecord_sdm_mm',request.getParameter('custpage_mm_id'));
			//	var report=nlapiCreateFile(request.getParameter('custpage_file_name'), 'CSV', mm.getFieldValue('custrecord_sdm_report_csv'));
			//	report.setFolder(67156);
			//	nlapiSubmitFile(report);
		 // }
	    //Create the form and add fields to it 
		var mm;
	    var form = nlapiCreateForm("Run Custom Report" );
	    //set client script
	    //form.setScript('customscript_sdm_set_script');
	    //form.addButton('custpage_back_button','Back');
	   // var menu=form.addField('custpage_report_menu', 'select', 'Report' ).setLayoutType('startrow','startcol');
	    
	    var filters=new Array();
	    filters[0] = new nlobjSearchFilter('scriptid', null, 'startswith', 'customscript_sdm_cr_');
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('name');
		columns[2] = new nlobjSearchColumn('scriptid');
		columns[3] = new nlobjSearchColumn('description');
		var report_list = nlapiSearchRecord('suitelet', null, filters, columns );
		for (var i=0; i<report_list.length; i++){
			var report_list_result = report_list[i];
			var report_name = report_list_result.getValue('name');
			var description=report_list_result.getValue('description');
			var script=nlapiLoadRecord('suitelet',report_list_result.getValue('internalid'));
			var url = nlapiResolveURL('SUITELET',script.getFieldValue('scriptid'),script.getFieldValue('scriptid').replace('customscript','customdeploy'));

			if (i==0){
				form.addField("custpage_reportlink"+i, "url", "", null ).setLayoutType('startrow','startcol').setDisplayType( "inline" ).setLinkText(report_name).setDefaultValue( "https://system.na1.netsuite.com" + url );
			}
			else {
				form.addField("custpage_reportlink"+i, "url", "", null ).setLayoutType('startrow').setDisplayType( "inline" ).setLinkText(report_name).setDefaultValue( "https://system.na1.netsuite.com" + url );
			}
			form.addField('custpage_report_desc'+i,'inlinehtml','').setLayoutType('startrow').setDisplayType( "inline" ).setDefaultValue('<div style="border-radius:5px; padding-left:3px; padding-top:3px; padding-right:3px; padding-bottom:3px; width:200px; font-size:12px;  background-color:aliceblue; border:dotted 1px;">'+description+'</div>');
		}

		if (request.getParameter('custpage_param0')!=null){		
			var i=0;
			while (request.getParameter('custpage_param'+i)!=null){
				//type is i, name is i+1
				var j=i+1;
				//name, type, label
				request.getParameter('custpage_param'+i);
				var param_field=form.addField('custpage_param'+i,request.getParameter('custpage_param'+i),request.getParameter('custpage_param'+j)).setLayoutType('startrow');
				
				 if (request.getParameter('custpage_param'+i+'_listval1')!=null){
					var k=1;
					while (request.getParameter('custpage_param'+i+'_listval'+k)!=null){
						if (request.getParameter('custpage_param_value'+i)!=null && request.getParameter('custpage_param_value'+i)==request.getParameter('custpage_param'+i+'_listval'+k)){
							param_field.addSelectOption(request.getParameter('custpage_param'+i+'_listval'+k),request.getParameter('custpage_param'+i+'_listtext'+k),true);
						}
						else {
						param_field.addSelectOption(request.getParameter('custpage_param'+i+'_listval'+k),request.getParameter('custpage_param'+i+'_listtext'+k),false);
						}
						k+=2;
					}
				}
				 else if (request.getParameter('custpage_param_value'+i)!=null){
						param_field.setDefaultValue(request.getParameter('custpage_param_value'+i));
					}
				i+=2;
			}
		}
		//report
	    if (request.getParameter('custpage_mm_id')!=null){
			mm=nlapiLoadRecord('customrecord_sdm_mm',request.getParameter('custpage_mm_id'));
			var mm_field=form.addField('custpage_mm_id','integer');
			mm_field.setDisplayType('hidden');
			mm_field.setDefaultValue(request.getParameter('custpage_mm_id'));
			report_html=form.addField('custpage_report_html', 'inlinehtml','Report Html').setLayoutType('startrow','startcol');
			report_html.setDefaultValue(mm.getFieldValue('custrecord_sdm_mm_report_html'));
		}
		
	    response.writePage(form);
		 }
	  //POST call
	  else
	  {
	    var form = nlapiCreateForm("Suitelet - POST call" );
			
	    //create the fields on the form and populate them with values from the previous screen 
	    var resultField1 = form.addField('custpage_res1', 'text', 'Text Field value entered: ' );
	    resultField1.setDefaultValue(request.getParameter('custpage_field1' ));
	    resultField1.setDisplayType('inline' );
			
	    var resultField2 = form.addField('custpage_res2', 'integer', 'Integer Field value entered: ' );
	    resultField2.setDefaultValue(request.getParameter('custpage_field2' ));
	    resultField2.setDisplayType('inline' );
			
	    var resultField3 = form.addField('custpage_res3', 'select', 'Select Field value entered: ', 'customer' );
	    resultField3.setDefaultValue(request.getParameter('custpage_field3' ));
	    resultField3.setDisplayType('inline' );
			
	    response.writePage(form);
	  }
}
