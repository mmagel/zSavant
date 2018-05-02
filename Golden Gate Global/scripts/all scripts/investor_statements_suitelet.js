/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 May 2015     AHalbleib
 *
 */

/**
 * @param {nlobjPortlet} portletObj Current portlet object
 * @param {Number} column Column position index: 1 = left, 2 = middle, 3 = right
 * @returns {Void}
 */
function update_statements(recType,recId){
	//update runs on customer(investor) record
	//if last quarter statement exists, use it as basis for this quarter and create/update statement
	//if not and there is disbursement transaction this quarter, create statement
	//look for je tagged to that investor or investor id (both line level fields on je) from undeployed to deployed equity account for that investor
	// about half of these accounts use investor field on account (possibly update all)
	//any amount above $500000 should be transferred to unearned admin fees acct. this should then be transferred to earned admin fees
	//in multi disbursement funds, look for second disbursement and add to capital contribution column
	//calculate interest for this amount separately ie(10 days of interest on 350 and 20 days interest on 500)
	var fields=nlapiLookupField('customer',recId,['subsidiary','custentity7']);
	var variables=nlapiSearchRecord('customrecord_sdm_inv_statement_vars',null,new nlobjSearchFilter('custrecord_subsidiary',null,'anyof',fields.subsidiary),
			[new nlobjSearchColumn('custrecord_sdm_fed_tax_rate'),
			 new nlobjSearchColumn('custrecord_sdm_rate_of_return'),
			 new nlobjSearchColumn('custrecord_1stdisbursement'),
			 new nlobjSearchColumn('custrecord_2nddisbursement'),
			 new nlobjSearchColumn('custrecord_sdm_2nd_disb_date')]);
	
	var fedtax='';
	var ror='';
	var firstdisbamt='';
	var seconddisbamt='';
	var seconddisbdate='';
	var date=new Date();
	var year=date.getFullYear();
	var thisqstart='';
	var thisqend='';
	var lastqstart='';
	var daysinq=0;
	var month=date.getMonth();
	var interest_payments='';
	if (month<3){
		thisqstart='10/1/'+(year-1);
		thisqend='12/'+daysInMonth(12,year-1)+'/'+(year-1);
		daysinq=daysInMonth(10,year-1)+daysInMonth(11,year-1)+daysInMonth(12,year-1);
		lastqstart='7/1/'+(year-1);
		interest_payments=nlapiSearchRecord('customrecord_sdm_quarterly_statement','customsearch338',
				[new nlobjSearchFilter('custrecord_sdm_is_quarter_start',null,'on',thisqstart),new nlobjSearchFilter('custrecord_sdm_is_investor_id',null,'is',String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''))]);		
	}
	else if (month<6){
		thisqstart='1/1/'+year;
		thisqend='3/'+daysInMonth(3,year)+'/'+year;
		daysinq=daysInMonth(1,year)+daysInMonth(2,year)+daysInMonth(3,year);
		lastqstart='10/1/'+(year-1);
	}
	else if (month<9){
		thisqstart='4/1/'+year;
		thisqend='6/'+daysInMonth(6,year)+'/'+year;
		daysinq=daysInMonth(4,year)+daysInMonth(5,year)+daysInMonth(6,year);
		lastqstart='1/1/'+(year);
	}
	else {
		thisqstart='7/1/'+year;
		thisqend='9/'+daysInMonth(9,year)+'/'+year;
		daysinq=daysInMonth(7,year)+daysInMonth(8,year)+daysInMonth(9,year);
		lastqstart='4/1/'+(year);
	}
	if (variables!=null){
		fedtax=variables[0].getValue('custrecord_sdm_fed_tax_rate');
		ror=variables[0].getValue('custrecord_sdm_rate_of_return');
		firstdisbamt=variables[0].getValue('custrecord_1stdisbursement');
		seconddisbamt=variables[0].getValue('custrecord_2nddisbursement');
		seconddisbdate=variables[0].getValue('custrecord_sdm_2nd_disb_date');
	}
	else {
		return;
	}
	//add filter for date to filter out all except last quarter
	//nlapiLogExecution('ERROR',22,fields.custentity7+' '+lastqstart+' '+thisqstart);
	var statement=nlapiSearchRecord('customrecord_sdm_quarterly_statement',null,[new nlobjSearchFilter('custrecord_sdm_is_quarter_start',null,'within',lastqstart,thisqstart),new nlobjSearchFilter('custrecord_sdm_is_investor_id',null,'is',String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''))],
	[new nlobjSearchColumn('custrecord_sdm_is_project'),
	 new nlobjSearchColumn('custrecord_sdm_is_investor_id'),
	 new nlobjSearchColumn('custrecord_disb_date'),
	 new nlobjSearchColumn('custrecord_sdm_is_quarter_start').setSort(false),
	 new nlobjSearchColumn('custrecord_sdm_is_quarter_end'),
	 new nlobjSearchColumn('custrecord_sdm_is_previous_balance'),
	 new nlobjSearchColumn('custrecord_sdm_is_prev_balance_nr'),
	 new nlobjSearchColumn('custrecord_sdm_is_capital_contribution'),
	 new nlobjSearchColumn('custrecord_sdm_is_admin_contributed'),
	 new nlobjSearchColumn('custrecord_sdm_is_admin_paid'),
	 new nlobjSearchColumn('custrecord_sdm_is_adj_capital'),
	 new nlobjSearchColumn('custrecord_sdm_is_interest_earned'),
	 new nlobjSearchColumn('custrecord_sdm_is_interest_earned_nr'),
	 new nlobjSearchColumn('custrecord_sdm_is_fed_tax_withheld'),
	 new nlobjSearchColumn('custrecord_sdm_is_fed_tax_withheld_nr'),
	 new nlobjSearchColumn('custrecord_sdm_is_pref_return'),
	 new nlobjSearchColumn('custrecord_sdm_is_pref_return_nr'),
	 new nlobjSearchColumn('custrecord_sdm_is_withdrawal'),
	 new nlobjSearchColumn('custrecord_sdm_is_curr_ending_capital'),
	 new nlobjSearchColumn('custrecord_sdm_is_curr_ending_capital_nr'),
	 new nlobjSearchColumn('custrecord_sdm_is_ti_r'),
	 new nlobjSearchColumn('custrecord_sdm_is_ti_nr'),
	 new nlobjSearchColumn('internalid')]);
	var state='';
	fedtax=variables[0].getValue('custrecord_sdm_fed_tax_rate');
	ror=variables[0].getValue('custrecord_sdm_rate_of_return');
	firstdisbamt=variables[0].getValue('custrecord_1stdisbursement');
	seconddisbamt=variables[0].getValue('custrecord_2nddisbursement');
	seconddisbdate=variables[0].getValue('custrecord_sdm_2nd_disb_date');
	var accrue=null;
	if (month<3){
		accrue=nlapiSearchRecord('customrecord_ye_wire_form',null,[new nlobjSearchFilter('custrecord_wire_iid',null,'is',String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, '')),new nlobjSearchFilter('custrecord_wire_accrue',null,'is','F')],new nlobjSearchColumn('internalid'));
		if (accrue==null)
			accrue=true;
		else
			accrue=false;
	}
	if (statement==null){
		//nlapiLogExecution('ERROR',1,1);
		//lookup if disbursement transaction last quarter for this investor. look for either investor link or text id. if so, create statement. if not, do nothing
		state=get_statement(null,null,fedtax,ror,firstdisbamt,seconddisbamt,seconddisbdate,thisqstart,daysinq,String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''),recId,thisqend,fields.subsidiary,interest_payments,accrue);
		
	}
	else if (statement.length==1){
		//nlapiLogExecution('ERROR',2,2);
		if (statement[0].getValue('custrecord_sdm_is_quarter_start')==thisqstart){
			//nlapiLogExecution('ERROR',3,3);
			state=get_statement(null,null,fedtax,ror,firstdisbamt,seconddisbamt,seconddisbdate,thisqstart,daysinq,String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''),recId,thisqend,fields.subsidiary,interest_payments,accrue);
			nlapiLogExecution('ERROR',3,3);
		}
		else {
			//nlapiLogExecution('ERROR',4,4);
			//create statement using last statement
			state=get_statement(nlapiCopyRecord('customrecord_sdm_quarterly_statement',statement[0].getValue('internalid')),statement[0],fedtax,ror,firstdisbamt,seconddisbamt,seconddisbdate,thisqstart,daysinq,String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''),recId,thisqend,fields.subsidiary,interest_payments,accrue);
			nlapiLogExecution('ERROR',4,4);
		}
	}
	else {
		//nlapiLogExecution('ERROR',5,statement.length);
		//update statement using last statement
		state=get_statement(nlapiCopyRecord('customrecord_sdm_quarterly_statement',statement[1].getValue('internalid')),statement[0],fedtax,ror,firstdisbamt,seconddisbamt,seconddisbdate,thisqstart,daysinq,String(fields.custentity7).replace(/ /g,'').replace(/[{()}]/g, ''),recId,thisqend,fields.subsidiary,interest_payments,accrue);
		nlapiLogExecution('ERROR',5,5);
	}
	if (state!=null){
		nlapiLogExecution('ERROR',5,'asdfasdfasdf');
		nlapiSubmitRecord(state);
	}
}
function get_statement(state,laststate,fedtax,ror,firstdisbamt,seconddisbamt,seconddisbdate,thisqstart,daysinq,investorid,recId,thisqend,sub,interest_payments,accrue){
	var daysinyear=365;
	var totalint=0;
	var withhold=0;
	ror=ror.split('%')[0]/100;
	fedtax=fedtax.split('%')[0]/100;
	if (new Date(thisqstart).getFullYear()%4==0){
		daysinyear=366;
	}
	if (state==null){
		nlapiLogExecution('ERROR','3','3');
		nlapiLogExecution('ERROR','last statement not found',investorid);
		//no previous statement exists
		var found=false;
    	//var filterExpr3  = [ 
    	//            		[
    	//            			['custcol1', 'equalto', investorid],
    	 //           			'OR' ,
    	 //           			['custcol7', 'anyof', recId]
    	 //           		],
    	 //           		'AND',
    	  //          		['account', 'anyof', 455],
    	   //         		'AND',
    	   //         		['type','anyof','journal']
    	    //        ];
		var thisqjournals=nlapiSearchRecord('transaction','customsearch192');
		//var thisqjournalsadmin=nlapiSearchRecord('transaction','customsearch209',filterExpr3);
		for (var i=0; thisqjournals!=null&&i<thisqjournals.length; i++){
			if (investorid==thisqjournals[i].getValue('custcol1')||recId==thisqjournals[i].getValue('custcol7')){
				state=nlapiCreateRecord('customrecord_sdm_quarterly_statement');
				var amount=thisqjournals[i].getValue('amount');
				var disbdate=thisqjournals[i].getValue('trandate');
				state.setFieldValue('custrecord_disb_date',disbdate);
				state.setFieldValue('custrecord_sdm_is_previous_balance',0);
				state.setFieldValue('custrecord_sdm_is_prev_balance_nr',0);
				state.setFieldValue('custrecord_sdm_is_capital_contribution',amount);
				//get admin fees
				state.setFieldValue('custrecord_sdm_is_adj_capital',amount);
				var firstdisbdays=(new Date(thisqend)-new Date(disbdate))/(1000*60*60*24)+1;
				if (seconddisbamt!=''&&seconddisbdate!=''){
					
					if (new Date(thisqstart)<=new Date(seconddisbdate)<=new Date(thisqend)){
						
						var seconddisbdays=(new Date(thisqend)-new Date(seconddisbdate))/(1000*60*60*24)+1;
						int1=firstdisbamt*ror*firstdisbdays/daysinyear;
						int2=seconddisbamt*ror*seconddisbdays/daysinyear;
						totalint=int1+int2;
						capcont=seconddisbamt;
						state.setFieldValue('custrecord_sdm_is_capital_contribution',seconddisbamt+amount);
						state.setFieldValue('custrecord_sdm_is_adj_capital',seconddisbamt+amount);
					}
					else if (new Date(seconddisbdate)<new Date(thisqstart)){
						totalint=(amount)*ror*firstdisbdays/daysinyear;
					}
					else{
						totalint=firstdisbamt*ror*firstdisbdays/daysinyear;
					}
				}
				else {
					
					totalint=firstdisbamt*ror*firstdisbdays/daysinyear;
				}
				//nlapiLogExecution("ERROR",totalint,withhold);
				withhold=totalint*fedtax;
				//nlapiLogExecution("ERROR",firstdisbamt+' '+ror,firstdisbdays+' '+daysinyear+' '+amount+' '+Math.round(totalint)+' '+Math.round(withhold));
				state.setFieldValue('custrecord_sdm_is_investor_id',investorid);
				var admincont=0;
				var adminpaid=0;
				if (sub==2||sub==3){
					admincont=45000;
					adminpaid=-45000;
				}
				state.setFieldValue('custrecord_sdm_is_admin_contributed',admincont);
				state.setFieldValue('custrecord_sdm_is_admin_paid',adminpaid);
				state.setFieldValue('custrecord_sdm_is_interest_earned',Math.round(totalint));
				state.setFieldValue('custrecord_sdm_is_interest_earned_nr',totalint);
				var withholdround=Math.round(withhold);
				
				var payment=0;
				var rounded=0;
				if (interest_payments!=''&&accrue!=null&&!accrue){
					payment=interest_payments[0].getValue('custrecord_sdm_is_pref_return');
					rounded=Math.round(parseFloat(payment)).toFixed(2);
					payment=parseFloat(payment).toFixed(2);
					state.setFieldValue('custrecord_sdm_is_pref_return',rounded);
					state.setFieldValue('custrecord_sdm_is_pref_return_nr',payment);
				}
				else {
					state.setFieldValue('custrecord_sdm_is_pref_return','');
					state.setFieldValue('custrecord_sdm_is_pref_return_nr','');
				}
				
				var ending_cap_rounded=parseFloat(amount)+parseFloat(parseFloat(Math.round(totalint))-parseFloat(Math.round(withhold)));
				var ending_cap_nr=parseFloat(parseFloat(amount)+parseFloat(parseFloat(totalint)-parseFloat(withhold)));
				if (accrue!=null&&!accrue){
					ending_cap_rounded-=rounded;
					ending_cap_nr-=payment;
				}
				if (ending_cap_rounded!=Math.round(ending_cap_nr)){
					if (ending_cap_rounded<Math.round(ending_cap_nr)){
						ending_cap_rounded++;
						withholdround--;
					}//dong xu, xiaochu xia, xie fengqiang
					else {
						ending_cap_rounded--;
						withholdround++;
					}
				}
				state.setFieldValue('custrecord_sdm_is_fed_tax_withheld',withholdround);
				state.setFieldValue('custrecord_sdm_is_fed_tax_withheld_nr',withhold);
				state.setFieldValue('custrecord_sdm_is_curr_ending_capital',ending_cap_rounded);
				state.setFieldValue('custrecord_sdm_is_curr_ending_capital_nr',ending_cap_nr);
				state.setFieldValue('custrecord_sdm_is_ti_r',Math.round(totalint));
				state.setFieldValue('custrecord_sdm_is_ti_nr',totalint);
				var job=nlapiSearchRecord('job',null,new nlobjSearchFilter('custentity7',null,'startswith',investorid),new nlobjSearchColumn('internalid'));
				if (job!=null){
					state.setFieldValue('custrecord_sdm_is_project',job[0].getValue('internalid'));
				}
				
				break;
			}
		}
		if (!found){
			nlapiLogExecution('AUDIT','Disbursement Not Found : '+investorid,recId);
		}
		//iterate through and compare cust id to asdfasdfasdf
	}
	else {
		nlapiLogExecution('ERROR','2','2');
		var amount=laststate.getValue('custrecord_sdm_is_curr_ending_capital');
		var amountnr=laststate.getValue('custrecord_sdm_is_curr_ending_capital_nr');
		state.setFieldValue('custrecord_sdm_is_previous_balance',laststate.getValue('custrecord_sdm_is_curr_ending_capital'));
		state.setFieldValue('custrecord_sdm_is_prev_balance_nr',amountnr);
		//capital contribution- if has 2nd disbursement amount, check if date within this quarter. if so, add to capital contribution
		state.setFieldValue('custrecord_sdm_is_capital_contribution',0);
		var capcont=0;
		if (seconddisbamt!=''&&seconddisbdate!=''){
			if ((new Date(thisqstart)<=new Date(seconddisbdate))&&(new Date(seconddisbdate)<=new Date(thisqend))){
				nlapiLogExecution('ERROR','1','1');
				var seconddisbdays=(new Date(thisqend)-new Date(seconddisbdate))/(1000*60*60*24)+1;
				int1=firstdisbamt*ror*daysinq/daysinyear;
				int2=seconddisbamt*ror*seconddisbdays/daysinyear;
				totalint=int1+int2;
				capcont=seconddisbamt;
				state.setFieldValue('custrecord_sdm_is_capital_contribution',seconddisbamt);
				state.setFieldValue('custrecord_sdm_is_adj_capital',parseFloat(parseFloat(laststate.getValue('custrecord_sdm_is_curr_ending_capital'))+parseFloat(seconddisbamt)));
			}
			else if (new Date(seconddisbdate)<new Date(thisqstart)){
				nlapiLogExecution('ERROR','4','4');
				totalint=parseFloat(parseFloat(firstdisbamt)+parseFloat(seconddisbamt))*ror*daysinq/daysinyear;
			}
			else{
				nlapiLogExecution('ERROR','5','5');
				totalint=firstdisbamt*ror*daysinq/daysinyear;
			}
		}
		else {
			nlapiLogExecution('ERROR','6','6');
			totalint=firstdisbamt*ror*daysinq/daysinyear;
		}
		nlapiLogExecution('ERROR','7','7');
		withhold=totalint*fedtax;
		state.setFieldValue('custrecord_sdm_is_investor_id',investorid);
		state.setFieldValue('custrecord_sdm_is_admin_contributed',0);
		state.setFieldValue('custrecord_sdm_is_admin_paid',0);
		state.setFieldValue('custrecord_sdm_is_interest_earned',Math.round(totalint));
		state.setFieldValue('custrecord_sdm_is_interest_earned_nr',totalint);
		state.setFieldValue('custrecord_sdm_is_project',laststate.getValue('custrecord_sdm_is_project'));
		state.setFieldValue('custrecord_sdm_is_interest_earned_nr',totalint);
		var withholdround=Math.round(withhold);
		
		var payment=0;
		var rounded=0;
		if (interest_payments!=''&&accrue!=null&&!accrue){
			if (interest_payments==null)
				return;
			payment=interest_payments[0].getValue('custrecord_sdm_is_pref_return');
			rounded=Math.round(parseFloat(payment)).toFixed(2);
			payment=parseFloat(payment).toFixed(2);
			state.setFieldValue('custrecord_sdm_is_pref_return',rounded);
			state.setFieldValue('custrecord_sdm_is_pref_return_nr',payment);
		}
		else {
			state.setFieldValue('custrecord_sdm_is_pref_return','');
			state.setFieldValue('custrecord_sdm_is_pref_return_nr','');
		}
		var ending_cap_rounded=parseFloat(amount)+capcont+parseFloat(parseFloat(Math.round(totalint))-parseFloat(Math.round(withhold)));
		var ending_cap_nr=parseFloat(parseFloat(amount)+capcont+parseFloat(parseFloat(totalint)-parseFloat(withhold)));
		
		if (accrue!=null&&!accrue){
			ending_cap_rounded-=rounded;
			ending_cap_nr-=payment;
		}
		nlapiLogExecution('ERROR',ending_cap_rounded,ending_cap_nr);
		if (ending_cap_rounded!=Math.round(ending_cap_nr)){
			if (ending_cap_rounded<Math.round(ending_cap_nr)){
				ending_cap_rounded++;
				withholdround--;
			}
			else {
				ending_cap_rounded--;
				withholdround++;
			}
		}
		state.setFieldValue('custrecord_sdm_is_fed_tax_withheld',withholdround);
		state.setFieldValue('custrecord_sdm_is_fed_tax_withheld_nr',withhold);
		//laststate.getValue('custrecord_sdm_is_curr_ending_capital');
		//laststate.getValue('custrecord_sdm_is_curr_ending_capital_nr');
		state.setFieldValue('custrecord_sdm_is_curr_ending_capital',ending_cap_rounded);
		state.setFieldValue('custrecord_sdm_is_curr_ending_capital_nr',ending_cap_nr);
		state.setFieldValue('custrecord_sdm_is_ti_r',Math.round(parseFloat(parseFloat(laststate.getValue('custrecord_sdm_is_ti_r'))+parseFloat(totalint))));
		state.setFieldValue('custrecord_sdm_is_ti_nr',parseFloat(parseFloat(laststate.getValue('custrecord_sdm_is_ti_r'))+parseFloat(totalint)));

	}
	if (state!=null){
		state.setFieldValue('custrecord_sdm_is_quarter_start',thisqstart);
		state.setFieldValue('custrecord_sdm_is_quarter_end',thisqend);
	}
	return state;
	
	
}
function download_statements(request,response) {
	if (request.getMethod()=='GET'){
		var form=nlapiCreateForm('Get Investor Statements');
		form.addField('custpage_tqs','date','This Quarter Start').setMandatory(true);
		form.addField('custpage_lqe','date','Last Quarter End').setMandatory(true);
		form.addField('custpage_tqe','date','This Quarter End').setMandatory(true);

		form.addField('custpage_sub','select','Subsidiary','subsidiary').setMandatory(true);
		
		form.addSubmitButton('Download');
		response.writePage(form);
		
	}
	else {
		
		var logo=nlapiLoadFile(nlapiGetContext().getSetting('SCRIPT','custscript_logo')).getURL();
		var sub=request.getParameter('custpage_sub');
		
		var lqe=new Date(request.getParameter('custpage_lqe'));
		var tqe=new Date(request.getParameter('custpage_tqe'));
		var tqs=request.getParameter('custpage_tqs');
		var tqet=request.getParameter('custpage_tqe');
		
		var statement_search=nlapiSearchRecord('customrecord_sdm_quarterly_statement',null,[new nlobjSearchFilter('subsidiary','custrecord_sdm_is_project','anyof',sub),new nlobjSearchFilter('custrecord_sdm_is_quarter_start',null,'on',tqs),new nlobjSearchFilter('custrecord_sdm_is_quarter_end',null,'on',tqet)],
				[new nlobjSearchColumn('custrecord_sdm_is_previous_balance'),
				 new nlobjSearchColumn('internalid'),
				 new nlobjSearchColumn('custrecord_sdm_is_adj_capital'),
				 new nlobjSearchColumn('custrecord_sdm_is_capital_contribution'),
				 new nlobjSearchColumn('custrecord_sdm_is_admin_contributed'),
				 new nlobjSearchColumn('custrecord_sdm_is_admin_paid'),
				 new nlobjSearchColumn('custrecord_sdm_is_pref_return'),
				 new nlobjSearchColumn('custrecord_sdm_is_withdrawal'),
				 new nlobjSearchColumn('custrecord_sdm_is_interest_earned'),
				 new nlobjSearchColumn('custrecord_sdm_is_fed_tax_withheld'),
				 new nlobjSearchColumn('custrecord_sdm_is_curr_ending_capital'),
				 new nlobjSearchColumn('custrecord_restocking_fee_paid'),
				 new nlobjSearchColumn('custrecord_is_cap_in_escrow'),
				 new nlobjSearchColumn('custrecord_is_cap_deployed'),
				 new nlobjSearchColumn('custrecord_ref_ad_fee'),
				 new nlobjSearchColumn('custrecord_admin_balance'),
				 new nlobjSearchColumn('subsidiary','custrecord_sdm_is_project').setSort(true),
				 new nlobjSearchColumn('internalid','custrecord_sdm_is_project'),
				 new nlobjSearchColumn('customer','custrecord_sdm_is_project'),
				 new nlobjSearchColumn('custentity35','custrecord_sdm_is_project'),
				 new nlobjSearchColumn('custentity23','custrecord_sdm_is_project'),
				 new nlobjSearchColumn('subsidiary','custrecord_sdm_is_project'),
				 new nlobjSearchColumn('companyname','custrecord_sdm_is_project')]);
		
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
				 [new nlobjSearchColumn('custrecord_sdm_rate_of_return'),new nlobjSearchColumn('custrecord_sdm_fed_tax_rate'),new nlobjSearchColumn('custrecord_show_admin'),new nlobjSearchColumn('custrecord_show_supp_info'),new nlobjSearchColumn('custrecord_show_escrow')]);
		 
		 var fields_search=nlapiSearchRecord('customrecord_is_fields',null,new nlobjSearchFilter('custrecord_fields_subsidiary',null,'anyof',sub),
				 new nlobjSearchColumn('internalid'));
		 var fields=nlapiLoadRecord('customrecord_is_fields',fields_search[0].getValue('internalid'));
		 var whole_pdf='';
		 var perc=variables[0].getValue('custrecord_sdm_rate_of_return');
		 var show_admin=variables[0].getValue('custrecord_show_admin');
		 var show_supp=variables[0].getValue('custrecord_show_supp_info');
		 for (var j=0; j<statement_search.length; j++){
			 
			 var result=statement_search[j];
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

			 pdf_string+=span(replace_tags(fields.getFieldValue('custrecordf'+1),result,tqe,lqe,perc)+' / ')+
			 span(replace_tags(fields.getFieldValue('custrecordf'+1+'ch'),result,tqe,lqe,perc),chfontstyle1)+'<br/>';
			 
			 pdf_string+=span(replace_tags(fields.getFieldValue('custrecordf'+2),result,tqe,lqe,perc)+' / ')+
			 span(replace_tags(fields.getFieldValue('custrecordf'+2+'ch'),result,tqe,lqe,perc),chfontstyle1)+'<br/>';
			 var name=result.getValue('companyname','custrecord_sdm_is_project').replace(/[{()}]/g, '');
			 if (name==''){
				 name=result.getText('customer','custrecord_sdm_is_project').replace(/[{()}]/g, '');
			 }
			 pdf_string+=span(name);
			 pdf_string=p(pdf_string,pstyle);
			 
			 var ts='';
			 var val='';
			 var adj=0;
			 
			 val=result.getValue('custrecord_sdm_is_previous_balance');
			 if (show_admin=='T'&&!(val==0||val==null||val=='')){
				 val=parseFloat(parseFloat(val)+parseFloat(result.getValue('custrecord_is_cap_in_escrow')));
				 if (parseFloat(result.getValue('custrecord_is_cap_in_escrow'))==0&&val<500000){
					 val+=parseFloat(150000);
				 }
			 }
			 //previous ending
			 nlapiLogExecution('ERROR',val,result.getValue('custrecord_is_cap_in_escrow'));
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+3),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+3+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(span((val==0||val==null||val=='')?'$'+nbsp(7)+'- &nbsp; &nbsp;':'$ &nbsp; &nbsp; &nbsp;'+format_number(val),style1),style1));

			 
			 adj+=parseFloat((val==null||val=='')?0:val);
			 //capital contribution
			 val=result.getValue('custrecord_sdm_is_capital_contribution');
			 if (show_admin=='T'&&(val!=0&&val!=null&&val!=''))
				 val=parseFloat(parseFloat(val)+parseFloat(result.getValue('custrecord_is_cap_in_escrow')));
			 if (sub==7&&val<500000&&result.getValue('custrecord_sdm_is_capital_contribution')!=''&&result.getValue('custrecord_sdm_is_capital_contribution')>0){
				 val+=parseFloat(150000);
			 }
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+4),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+4+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
			 adj+=parseFloat((val==null||val=='')?0:val);
			 //admin contributed
			 if (sub==7){
				 val=parseFloat(result.getValue('custrecord_admin_balance'));
				 if (result.getValue('custrecord_sdm_is_capital_contribution')!=''&&result.getValue('custrecord_sdm_is_capital_contribution')>0){
					 val=result.getValue('custrecord_sdm_is_admin_contributed');
					 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),result,tqe,lqe,perc)+' / ')+
							 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
							 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 }
				 else{	 
					 val=0;
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val-result.getValue('custrecord_ref_ad_fee'))+')',style1));
				 adj-=parseFloat((val==null||val=='')?0:val-result.getValue('custrecord_ref_ad_fee'));
				 }
			 }
				 else{
			 val=result.getValue('custrecord_sdm_is_admin_contributed');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+5),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+5+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
			 adj+=parseFloat((val==null||val=='')?0:val);
		 }
			 
			 if (sub==7&&result.getValue('custrecord_sdm_is_capital_contribution')!=''&&result.getValue('custrecord_sdm_is_capital_contribution')>0)
				 val=parseFloat(result.getValue('custrecord_sdm_is_admin_contributed')-result.getValue('custrecord_ref_ad_fee'))*-1;
			 else if (sub==7)
				 val=parseFloat(result.getValue('custrecord_admin_balance')-result.getValue('custrecord_ref_ad_fee'))*-1;
			 else if (show_admin=='F')                                                                                                                                  
				 val=result.getValue('custrecord_sdm_is_admin_paid');
			 else 
				 val=result.getValue('custrecord_restocking_fee_paid');
			 //restocking or admin paid
			// if (sub==7&&result.getValue('custrecord_sdm_is_capital_contribution')=='')
			//	 val=0;
				 
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+6),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+6+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td1(span((val==0||val==null||val=='')?nbsp(8)+'- &nbsp; &nbsp;':nbsp(4)+'('+format_number(val*-1)+')',pstyle2),style1));
			 if (sub==7&&result.getValue('custrecord_sdm_is_capital_contribution')!=''&&result.getValue('custrecord_sdm_is_capital_contribution')>0){
				 val=result.getValue('custrecord_ref_ad_fee');
				 adj+=parseFloat((val==null||val=='')?0:val);
			 }
			 
				 else{
				 adj+=parseFloat((val==null||val=='')?0:val);
				 }
			 //adjusted capital
			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 val=adj;
			 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+7),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+7+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(format_number(val),style1));
			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 //interest earned
			 val=result.getValue('custrecord_sdm_is_interest_earned');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+8),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+8+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
			 //tax withheld
			// val=result.getValue('custrecord_sdm_is_fed_tax_withheld')*-1;
			 val=result.getValue('custrecord_sdm_is_fed_tax_withheld');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+9),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+9+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val)+')',style1));
			 //return
			 val=result.getValue('custrecord_sdm_is_pref_return');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+10),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+10+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':'('+format_number(val)+')',style1));
			 //withdrawal
			 val=result.getValue('custrecord_sdm_is_withdrawal');
			 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+11),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+11+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td(span((val==0||val==null||val=='')? nbsp(8)+'- &nbsp; &nbsp;': nbsp(3)+'('+format_number(val*-1)+')',pstyle2),style1));

			 ts+=tr(td('&nbsp;',style1)+
					 td('&nbsp;',style1));
			 //current ending capital
			 val=result.getValue('custrecord_sdm_is_curr_ending_capital');
			 if (show_admin=='T')
				 val=parseFloat(parseFloat(val)+parseFloat(result.getValue('custrecord_is_cap_in_escrow')));
			 if (sub==7&&val<500000){
				 val+=parseFloat(150000);
			 }
			 var total;
			 if (sub==7){
				 val-=result.getValue('custrecord_admin_balance');
				 if (result.getValue('custrecord_ref_ad_fee')!='')
				 val+=parseFloat(result.getValue('custrecord_ref_ad_fee'));
				 total=val;
			 }
			 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+12),result,tqe,lqe,perc)+' / ')+
					 span(replace_tags(fields.getFieldValue('custrecordf'+12+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
					 td1(span((val==null||val==''||val==0)?'$'+nbsp(7)+' - &nbsp; &nbsp;':'$ &nbsp; &nbsp; &nbsp;'+format_number(val),pstyle1),style1));
			
			 if (show_supp=='T'){
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+13),result,tqe,lqe,perc)+' / ',['font-weight','bold'])+
						 span(replace_tags(fields.getFieldValue('custrecordf'+13+'ch'),result,tqe,lqe,perc),chfontstyle3),tdstyle1)+
						 td1('&nbsp;',style1));
				 
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 var adj=parseFloat(0);
				 val=result.getValue('custrecord_is_cap_deployed');
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+14),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+14+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 adj=parseFloat(parseFloat(adj)+parseFloat(val));
				 val=result.getValue('custrecord_is_cap_in_escrow');
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+15),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+15+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 adj=parseFloat(parseFloat(adj)+parseFloat(val));
				 val=parseFloat(result.getValue('custrecord_admin_balance'));
				 if (sub==7)
					 val=result.getValue('custrecord_ref_ad_fee');
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+16),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+16+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td((val==0||val==null||val=='')?'- &nbsp; &nbsp;':format_number(val),style1));
				 //if (result.getValue('custrecord_ref_ad_fee')!='')
				 //adj=parseFloat(parseFloat(adj)-parseFloat(val));
				 
				 val=result.getValue('custrecord_sdm_is_curr_ending_capital');
				 if (show_admin=='T')
					 val=parseFloat(parseFloat(val)+parseFloat(result.getValue('custrecord_is_cap_in_escrow')));
				 if (sub==7&&val<500000){
					 val+=parseFloat(150000);
				 }
				 if (sub==7)
					 val-=result.getValue('custrecord_admin_balance');
				 nlapiLogExecution('ERROR','ending capital and adjusted: '+val,adj);
				 val=val-adj;
				 var mystyle=style1;
				 if (sub==7){
					 mystyle=pstyle2;
					 var spaces=7;
					 if (val>1000)
						 spaces=6;
				 }
				 else spaces=1;
				 ts+=tr(td(span(nbsp(5)+replace_tags(fields.getFieldValue('custrecordf'+17),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+17+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td(span((val==0||val==null||val=='')?'- &nbsp; &nbsp;':nbsp(spaces)+format_number(val),mystyle),style1));
				 
				 val=result.getValue('custrecord_sdm_is_curr_ending_capital');
				 if (show_admin=='T')
					 val=parseFloat(parseFloat(val)+parseFloat(result.getValue('custrecord_is_cap_in_escrow')));
				 if (sub==7&&val<500000){
					 val+=parseFloat(150000);
				 }
				 if (sub==7){
					 val-=result.getValue('custrecord_admin_balance');
					 if (result.getValue('custrecord_ref_ad_fee')!='')
					 val+=parseFloat(result.getValue('custrecord_ref_ad_fee'));
				 }
				 ts+=tr(td(span(nbsp(10)+replace_tags(fields.getFieldValue('custrecordf'+18),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+18+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td1(span((val==null||val==''||val==0)?nbsp(8)+' - &nbsp; &nbsp;':'&nbsp; &nbsp; &nbsp; &nbsp;'+format_number(val),pstyle1),style1));
				 
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td('&nbsp;',style1)+
						 td('&nbsp;',style1));
				 ts+=tr(td(span(nbsp(9)+replace_tags(fields.getFieldValue('custrecordf'+19),result,tqe,lqe,perc)+' / ')+
						 span(replace_tags(fields.getFieldValue('custrecordf'+19+'ch'),result,tqe,lqe,perc),chfontstyle2),tdstyle1)+
						 td1('&nbsp;',style1));
			 }
			 pdf_string+=table(ts,tablestyle);
			 whole_pdf+=pdf_string+'<pbr/>';
		 }
		 var title='statements';
		 var pdf=nlapiXMLToPDF(add_container(whole_pdf,logo,title,''));
		 response.setContentType('PDF');
		 response.write(pdf);
	}
}
function nbsp(num){
	var string='';
	for (var i=0;i<num;i++){
		string+='&nbsp; ';
	}
	return string;
}
function replace_tags(string,result,tqe,lqe,perc){
	var replacename;
	
	if (result.getValue('custentity35')==''||result.getValue('custentity35')==null){
		replacename=result.getValue('custentity23','custrecord_sdm_is_project');
	}
	else {
		replacename=result.getValue('custentity35','custrecord_sdm_is_project');
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
	
	xmlbase+='<macro id="myHeader"><img width="230" align="center" height="100" src="'+logo.replace(/&/g,'&amp;').replace(/&amp;nbsp;/g,'&nbsp;')+'"/></macro>';
	xmlbase+='</macrolist></head><body size="A4" font-size="10" header="myHeader" header-height="4cm" align="center" footer="myFooter" footer-height="3cm">';
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