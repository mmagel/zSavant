function send_investor_statement(recType,recId){	
	
	var logo=nlapiLoadFile(nlapiGetContext().getSetting('SCRIPT','custscript_mu_logo')).getURL();
	
	var lqe=new Date(nlapiGetContext().getSetting('SCRIPT','custscript_mu_lqe'));
	var tqe=new Date(nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqe'));
	var tqs=nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqs');
	var tqet=nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqe');
	var emailtest=nlapiGetContext().getSetting('SCRIPT','custscript_is_test');
	var ccggg=nlapiGetContext().getSetting('SCRIPT','custscript_ccggg');
	var statement=nlapiLoadRecord(recType,recId);
	if (statement.getFieldValue('custrecord_sdm_is_quarter_start')!=tqs)
		return;
	
	
	var project=nlapiLoadRecord('job',statement.getFieldValue('custrecord_sdm_is_project'));
	var sub=project.getFieldValue('subsidiary');
	var email=project.getFieldValue('custentity_sdm_email');
	try {
		email=email.split(",");
	}
	catch (e){
		
	}
	if (emailtest!=''&&emailtest!=null&&emailtest.length>0){
		email=emailtest
	}
	var emailargs=get_statement(sub,lqe,tqe,tqs,tqet,logo,project,statement);
	var cc=null;
	if (ccggg=='T'){
		cc=['bwu@3gfund.com','ir@3gfund.com'];
	}
	nlapiLogExecution('ERROR',cc,ccggg+' '+email);

	try {
		nlapiSendEmail(7083,email,emailargs[1],emailargs[2],cc,null,{'entity':statement.getFieldValue('custrecord_sdm_is_project')},emailargs[0]);
		//nlapiSendEmail(7083,'accounting@3gfund.com',emailargs[1],emailargs[2],null,null,{'entity':statement.getFieldValue('custrecord_sdm_is_project')},emailargs[0]);
	}
	catch (e){
		nlapiLogExecution('ERROR','email send failed '+project.getFieldValue('custentity7'),e.message);
	}
}
function send_investor_statement_fromfile(recType,recId){	
	try {
	var logo=nlapiLoadFile(nlapiGetContext().getSetting('SCRIPT','custscript_mu_logo1')).getURL();
	
	var lqe=new Date(nlapiGetContext().getSetting('SCRIPT','custscript_mu_lqe1'));
	var tqe=new Date(nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqe1'));
	var tqs=nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqs1');
	var tqet=nlapiGetContext().getSetting('SCRIPT','custscript_mu_tqe1');
	var emailtest=nlapiGetContext().getSetting('SCRIPT','custscript_is_test1');
	var ccggg=nlapiGetContext().getSetting('SCRIPT','custscript_ccggg1');
	var project=nlapiLoadRecord(recType,recId);
	var sub=project.getFieldValue('subsidiary');
	var email=project.getFieldValue('custentity_sdm_email');
	try {
		email=email.split(",");
	}
	catch (e){
		
	}
	if (emailtest!=''&&emailtest!=null&&emailtest.length>0){
		email=emailtest
	}
	var statement=null;
	var emailargs=get_statement(sub,lqe,tqe,tqs,tqet,logo,project,statement);
	var cc=null;
	if (ccggg=='T'){
		cc=['bwu@3gfund.com','ir@3gfund.com'];
	}
	nlapiLogExecution('ERROR',cc,ccggg+' '+email);

	
		nlapiSendEmail(7083,email,emailargs[1],emailargs[2],cc,null,{'entity':project.getId()},emailargs[0]);
		//nlapiSendEmail(7083,'accounting@3gfund.com',emailargs[1],emailargs[2],null,null,{'entity':statement.getFieldValue('custrecord_sdm_is_project')},emailargs[0]);
	}
	catch (e){
		nlapiLogExecution('ERROR','email send failed '+recId,e.message);
	}
}
function get_statement(sub,lqe,tqe,tqs,tqet,logo,project,statement) {
	
		var pstyle=['align','center','font-weight','bold'];
		var chfontstyle1=['font-family','stsong'];
		var chfontstyle2=['font-family','stsong','align','left'];
		var chfontstyle3=['font-family','stsong','align','left','font-weight','bold'];
		var style1=['align','right'];
		var tdstyle1=['align','left','width','450'];
		var styledul=['align','right','border-bottom','1pt solid black'];
		var pstyle2=['align','right','border-bottom','1pt solid black'];
		var pstyle1=['align','right','border-bottom','1pt solid black','text-decoration','underline'];
		var tablestyle=['width','100%'];
		
		 var variables=nlapiSearchRecord('customrecord_sdm_inv_statement_vars',null,new nlobjSearchFilter('custrecord_subsidiary',null,'anyof',sub),
				 [new nlobjSearchColumn('custrecord_sdm_rate_of_return'),new nlobjSearchColumn('custrecord_sdm_fed_tax_rate'),new nlobjSearchColumn('custrecord_show_admin'),new nlobjSearchColumn('custrecord_show_supp_info'),
				  new nlobjSearchColumn('custrecord_show_escrow'),new nlobjSearchColumn('custrecord_email_subject'),new nlobjSearchColumn('custrecord_email_body')]);
		 
		 var fields_search=nlapiSearchRecord('customrecord_is_fields',null,new nlobjSearchFilter('custrecord_fields_subsidiary',null,'anyof',sub),
				 new nlobjSearchColumn('internalid'));
		 
		 var fields=nlapiLoadRecord('customrecord_is_fields',fields_search[0].getValue('internalid'));
		 
		 var whole_pdf='';
		 var perc=variables[0].getValue('custrecord_sdm_rate_of_return');
		 var show_admin=variables[0].getValue('custrecord_show_admin');
		 var show_supp=variables[0].getValue('custrecord_show_supp_info');
		 var subject=variables[0].getValue('custrecord_email_subject');
		 var body=variables[0].getValue('custrecord_email_body');
			 var pdf_string='';
			 var subname='';
			 if (sub==2){
				 subname='Golden State Investment Fund I, LLC';
			 }
			 else if (sub==3){
				 subname='Golden State Investment Fund II, LLC';
			 }
			 else if (sub==4){
				 subname='Golden State Investment Fund III, LLC';
			 }
			 else if (sub==7){
				 subname='SFBARC Fund 5, LLC';
			 }
			 else if (sub==6){
				 subname='3G Fund 6, LLC';
			 }
			 pdf_string+=span(subname+'<br/>');
			if (statement!=null){
			 pdf_string+=span(replace_tags(fields.getFieldValue('custrecordf'+1),statement,project,tqe,lqe,perc)+' / ')+
			 span(replace_tags(fields.getFieldValue('custrecordf'+1+'ch'),statement,project,tqe,lqe,perc),chfontstyle1)+'<br/>';
			 
			 pdf_string+=span(replace_tags(fields.getFieldValue('custrecordf'+2),statement,project,tqe,lqe,perc)+' / ')+
			 span(replace_tags(fields.getFieldValue('custrecordf'+2+'ch'),statement,project,tqe,lqe,perc),chfontstyle1)+'<br/>';
			 var name=project.getFieldValue('companyname').replace(/[{()}]/g, '');
			 if (name==''){
				 name=project.getFieldText('parent').replace(/[{()}]/g, '');
			 }
			 pdf_string+=span(name);
			 pdf_string=p(pdf_string,pstyle);
			 
			 var ts='';
			 var val='';
			 var adj=0;
			 
			 val=statement.getFieldValue('custrecord_sdm_is_previous_balance');
			 if (show_admin=='T'&&!(val==0||val==null||val=='')){
				 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
				 if (val2==''||val2==null||val2.length==0){
					 val2=0;
				 }
				 val=parseFloat(parseFloat(val)+parseFloat(val2));
				 if (parseFloat(statement.getFieldValue('custrecord_is_cap_in_escrow'))==0&&val<500000){
					 val+=parseFloat(150000);
				 }
			 }
			 //previous ending
			 //nlapiLogExecution('ERROR',val,statement.getFieldValue('custrecord_is_cap_in_escrow'));
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+3),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+3+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(span((val==0||val==null||val=='')?'$'+nbsp(7)+'- &nbsp; &nbsp;':'$ &nbsp; &nbsp; &nbsp;'+format_number(val),style1),style1));

			 
			 adj+=parseFloat((val==null||val=='')?0:val);
			 //capital contribution
			 val=statement.getFieldValue('custrecord_sdm_is_capital_contribution');
			 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
			 if (show_admin=='T'&&(val!=0&&val!=null&&val!='')&&(val2!=0&&val2!=null&&val2!=''))
				 val=parseFloat(parseFloat(val)+parseFloat(val2));
			 if (sub==7&&val<500000&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')!=''&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')>0){
				 val+=parseFloat(150000);
			 }
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+4),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+4+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
			 adj+=parseFloat((val==null||val=='')?0:val);
			 //admin contributed
			 if (sub==7){
				 val=parseFloat(statement.getFieldValue('custrecord_admin_balance'));
				 if (statement.getFieldValue('custrecord_sdm_is_capital_contribution')!=''&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')>0){
					 val=statement.getFieldValue('custrecord_sdm_is_admin_contributed');
					 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),statement,project,tqe,lqe,perc)+' / ')+
							 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
							 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 }
				 else{	 
					 val=0;
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val-statement.getFieldValue('custrecord_ref_ad_fee'))+')',style1));
				// adj-=parseFloat((val==null||val=='')?0:val-statement.getFieldValue('custrecord_ref_ad_fee'));
				 }
			 }
				 else{
					 val=statement.getFieldValue('custrecord_sdm_is_admin_contributed');
					 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),statement,project,tqe,lqe,perc)+' / ')+
							 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
							 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
					 adj+=parseFloat((val==null||val=='')?0:val);
		 }
			 
			 
			 if (sub==7&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')!=''&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')!=null&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')>0)
				 val=parseFloat(statement.getFieldValue('custrecord_sdm_is_admin_contributed')-statement.getFieldValue('custrecord_ref_ad_fee'))*-1;
			 else if (sub==7){
				 //val=parseFloat(statement.getFieldValue('custrecord_admin_balance')-statement.getFieldValue('custrecord_ref_ad_fee'))*-1;
				 val=0;
			 }
			 else if (show_admin=='F')                                                                                                                                  
				 val=statement.getFieldValue('custrecord_sdm_is_admin_paid');
			 else 
				 val=statement.getFieldValue('custrecord_restocking_fee_paid');
			 //restocking or admin paid
			// if (sub==7&&(statement.getFieldValue('custrecord_sdm_is_capital_contribution')==''||statement.getFieldValue('custrecord_sdm_is_capital_contribution')==null))
			//	 val=0;
nlapiLogExecution('ERROR','restock',val);
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+6),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+6+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td1(span((val==0||val==null||val=='')?nbsp(8)+'- &nbsp; &nbsp;':nbsp(4)+'('+format_number(val*-1)+')',pstyle2),style1));
			 
			 if (sub==7&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')!=''&&statement.getFieldValue('custrecord_sdm_is_capital_contribution')>0){
				 val=statement.getFieldValue('custrecord_ref_ad_fee');
				 adj+=parseFloat((val==null||val=='')?0:val);
			 }
			 
				 else{
				 adj+=parseFloat((val==null||val=='')?0:val);
				 }
			 
			 //adjusted capital
			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 val=adj;
			 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+7),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+7+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(format_number(val),style1));
			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 //interest earned
			 val=statement.getFieldValue('custrecord_sdm_is_interest_earned');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+8),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+8+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
			 //tax withheld
			 val=statement.getFieldValue('custrecord_sdm_is_fed_tax_withheld')*1;
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+9),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+9+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val)+')',style1));
			 //return
			 val=statement.getFieldValue('custrecord_sdm_is_pref_return');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+10),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+10+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val)+')',style1));
			 //withdrawal
			 val=statement.getFieldValue('custrecord_sdm_is_withdrawal');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+11),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+11+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(span((val==0||val==null||val=='')? nbsp(8)+'- &nbsp; &nbsp;': nbsp(3)+'('+format_number(val*-1)+')',pstyle2),style1));

			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 //current ending capital
			 val=statement.getFieldValue('custrecord_sdm_is_curr_ending_capital');
			 if (show_admin=='T'){
				 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
				 if (val2==''||val2==null||val2.length==0){
					 val2=0;
				 }
				 //+parseFloat(val2)
				 val=parseFloat(parseFloat(val));
			 }
			 if (sub==7&&val<500000){
				 val+=parseFloat(150000);
			 }
			 if (sub==7){
				// val-=statement.getFieldValue('custrecord_admin_balance');
				 if (statement.getFieldValue('custrecord_ref_ad_fee')!=''&&statement.getFieldValue('custrecord_ref_ad_fee')!=null)
				 val+=parseFloat(statement.getFieldValue('custrecord_ref_ad_fee'));
			 }
			 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+12),statement,project,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+12+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td1(span((val==null||val==''||val==0)?'$'+nbsp(7)+' - &nbsp; &nbsp;':'$ &nbsp; &nbsp; &nbsp;'+format_number(val),pstyle1),style1));
			
			 if (show_supp=='T'){
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+13),statement,project,tqe,lqe,perc)+' / ',['font-weight','bold'])+
						 span(replace_tags(fields.getFieldValue('custrecordf'+13+'ch'),statement,project,tqe,lqe,perc),chfontstyle3),tdstyle1)+
						 td1('&nbsp;',style1));
				 
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 var adj=parseFloat(0);
				 val=statement.getFieldValue('custrecord_is_cap_deployed');
				// if (val==''||val==0||val.length==0)
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+14),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+14+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 adj=parseFloat(parseFloat(adj)+parseFloat(val));
				 val=statement.getFieldValue('custrecord_is_cap_in_escrow');
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+15),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+15+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
						 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
				 if (val==''||val==null||val.length==0){
					 val=0;
				 }
				 adj=parseFloat(parseFloat(adj)+parseFloat(val));
				 nlapiLogExecution('ERROR','adj',adj);
				 val=parseFloat(statement.getFieldValue('custrecord_admin_balance'));
				 
				 if (sub==7)
					 val=statement.getFieldValue('custrecord_ref_ad_fee');
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+16),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+16+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 if (sub!=7)
				 adj=parseFloat(parseFloat(adj)+parseFloat(val));
			 nlapiLogExecution('ERROR','adj1',adj);
				 val=statement.getFieldValue('custrecord_sdm_is_curr_ending_capital');
				 if (show_admin=='T'){
					 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
				 if (val2==''||val2==null||val2.length==0){
					 val2=0;
				 }
				 //+parseFloat(val2)
					 val=parseFloat(parseFloat(val));
				 }
				 nlapiLogExecution('ERROR','val1',val);
				 if (sub==7&&val<500000){
					 val+=parseFloat(150000);
				 }
				 //if (sub==7)
					 //val-=statement.getFieldValue('custrecord_admin_balance');
				// nlapiLogExecution('ERROR','ending capital and adjusted: '+val,adj);
				 val=val-adj;
				 nlapiLogExecution('ERROR','val2',val);
				 var mystyle=style1;
				 if (sub==7){
					 mystyle=pstyle2;
					 var spaces=7;
					 if (val>1000)
						 spaces=6;
				 }
				 else spaces=1;
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+17),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+17+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td(span((val==0||val==null||val=='')?'- &nbsp; &nbsp;':nbsp(spaces)+format_number(val),mystyle),style1));
				 
				 val=statement.getFieldValue('custrecord_sdm_is_curr_ending_capital');
				 if (show_admin=='T'){
					 var val2=statement.getFieldValue('custrecord_is_cap_in_escrow');
					if (val2==''||val2==null||val2.length==0){
						val2=0;
					}
					//+parseFloat(val2)
					 val=parseFloat(parseFloat(val));
				 }
				 
				 if (sub==7&&val<500000){
					 val+=parseFloat(150000);
				 }
				 if (sub==7){
					 //val-=statement.getFieldValue('custrecord_admin_balance');
					 if (statement.getFieldValue('custrecord_ref_ad_fee')!=''&&statement.getFieldValue('custrecord_ref_ad_fee')!=null)
					 val+=parseFloat(statement.getFieldValue('custrecord_ref_ad_fee'));
				 }
				  nlapiLogExecution('ERROR','val2',val);
				 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+18),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+18+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td1(span((val==null||val==''||val==0)?nbsp(8)+' - &nbsp; &nbsp;':'&nbsp; &nbsp; &nbsp; &nbsp;'+format_number(val),pstyle1),style1));
				 
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td(span(nbsp(9)+replace_tags(fields.getFieldValue('custrecordf'+19),statement,project,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+19+'ch'),statement,project,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td1('&nbsp;',style1));
			 }
			 pdf_string+=table(ts,tablestyle);
			 whole_pdf+=pdf_string;

		 var title='statements';
		 var pdf=nlapiXMLToPDF(add_container(whole_pdf,logo,title,''));
		 pdf.setName(project.getFieldText('parent')+'.pdf');
			}
			else {
				var invid=project.getFieldValue('custentity7');
				invid=invid.split('-');
				invid=invid[1]+'-'+invid[2];
				var pdf=nlapiSearchRecord('file',null,[new nlobjSearchFilter('name',null,'contains',invid),new nlobjSearchFilter('folder',null,'anyof',[23515,23516,23517,23518,23519])],new nlobjSearchColumn('internalid'));
				
				if (pdf!=null){
					pdf=nlapiLoadFile(pdf[0].getValue('internalid'));
				}
				else {
					throw 'no file ';
				}
			}
		 return [pdf,subject,body];
}
function nbsp(num){
	var string='';
	for (var i=0;i<num;i++){
		string+='&nbsp; ';
	}
	return string;
}
function replace_tags(string,statement,project,tqe,lqe,perc){
	var replacename;
	
	if (statement.getFieldValue('custentity35')==''||statement.getFieldValue('custentity35')==null){
		replacename=project.getFieldValue('custentity23');
	}
	else {
		replacename=project.getFieldValue('custentity35');
	}
	
	string=string.replace('thisqyear',tqe.getFullYear());
	string=string.replace('thisqmonth',tqe.getMonth()+1);
	string=string.replace('thisqday',tqe.getDate());
	string=string.replace('lastqyear',lqe.getFullYear());
	string=string.replace('lastqmonth',lqe.getMonth()+1);
	string=string.replace('lastqday',lqe.getDate());
	string=string.replace('thisqendtext',get_date_text(tqe));
	string=string.replace('lastqendtext',get_date_text(lqe));
	string=string.replace('name',replacename);
	string=string.replace('perc',perc);
	return string;
}
function get_date_text(date){
	var datestring=month_to_text(date.getMonth());
	datestring+=' '+date.getDate()+', '+date.getFullYear();
	return datestring;
}
function add_container(bodystring,logo,title,dates){
	
	var xmlbase=get_xml();
	
	xmlbase+='<macro id="myHeader"><img width="200" align="center" height="88" src="'+logo.replace(/&/g,'&amp;').replace(/&amp;nbsp;/g,'&nbsp;')+'"/></macro>';
	xmlbase+='</macrolist></head><body size="A4" font-size="10" header="myHeader" header-height="3.5cm" align="center" footer="myFooter" footer-height="3cm">';
	return xmlbase+bodystring+'</body></pdf>';
}
function get_xml(){
	var xml = "<?xml version=\"1.0\"?>" +
	'<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">'+
	'<pdf><head><meta name="title" value="Investor Statements"/><macrolist><macro id="myFooter">'+
	'<p align="center" font-size="10">235 Montgomery Street, 28th Floor, San Francisco, CA 94104 | 415.691.4040 | sdmayer.com </p></macro>';
	
	return xml;
}
function get_header_table(employee,id,region){
	var string='';
	string+=tr(td('Employee: ',['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif'])+td(employee,['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif']));
	string+=tr(td('Arborwell Employee ID: ',['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif'])+td(id,['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif']));
	string+=tr(td('Region: ',['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif'])+td(region,['align','left','font-size','9','font-family','Calibri, Candara, Segoe, Optima, Arial, sans-serif']));
	return table(string,['border','.3','cellborder','.3','margin-bottom','.6cm']);
}
function table(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<table'+attr_string+'>'+value+'</table>';
}
function tr(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=style[i]+':'+bfo_attr[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<tr'+attr_string+'>'+value+'</tr>';
}
function span(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<span'+attr_string+'>'+value+'</span>';
}
function div(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<span'+attr_string+'>'+value+'</span>';
}
function td(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<td'+attr_string+'><p'+attr_string+ '>'+value+'</p></td>';
}
function td1(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<td'+attr_string+'><p>'+value+'</p></td>';
}
function p(value,bfo_attr,style){
	var attr_string='';
	if (bfo_attr!=null){
		for (var i=0; i<bfo_attr.length; i+=2){
			attr_string+=' '+bfo_attr[i]+'="'+bfo_attr[i+1]+'"';
		}
	}
	if (style!=null){
		attr_string+=' style="';
		for (var i=0; i<style.length; i+=2){
			attr_string+=style[i]+':'+style[i+1]+'; ';
		}
		attr_string+='"';
	}
	return '<p'+attr_string+ '>'+value+'</p>';
}
function month_to_text(month){
	if (month==0){
		return 'January';
	}
	if (month==1){
		return 'February';
	}
	if (month==2){
		return 'March';
	}
	if (month==3){
		return 'April';
	}
	if (month==4){
		return 'May';
	}
	if (month==5){
		return 'June';
	}
	if (month==6){
		return 'July';
	}
	if (month==7){
		return 'August';
	}
	if (month==8){
		return 'September';
	}
	if (month==9){
		return 'October';
	}
	if (month==10){
		return 'November';
	}
	if (month==11){
		return 'December';
	}
	return '';
	}
function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
function format_money(int){
    var n = int, 
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
       return '$ &nbsp; &nbsp; &nbsp;'+s+(j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
    }
function format_number(int){
    var n = int, 
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
       return s+(j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
    }