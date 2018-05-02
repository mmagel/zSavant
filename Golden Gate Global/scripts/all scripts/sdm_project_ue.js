function project_before_submit(type){
	if (type=='create'||type=='edit'){
				//conditional green card end date
				var conditional_end_date=nlapiGetFieldValue('custentity232');
				if (conditional_end_date!=''&&conditional_end_date!=null){
					//projected green card filing date
					nlapiSetFieldValue('custentity146',nlapiDateToString(nlapiAddDays(new Date(conditional_end_date),-90)));
				}
                else {
                    nlapiSetFieldValue('custentity146','');
                }
		var vendor=nlapiGetFieldValue('custentity37');
		if (vendor!=null&&vendor!=''){
			vendor=nlapiLoadRecord('vendor',vendor);
			var new_record=nlapiGetNewRecord();
			//i-526 uscis recieved
			if ((new_record.getFieldValue('custentity162')!=null&&new_record.getFieldValue('custentity162')!='')&&(type=='create'||nlapiLookupField('job',nlapiGetRecordId(),'custentity162')!=new_record.getFieldValue('custentity162'))){
				var pof=vendor.getFieldValue('custentity_pay_on_file');
				var poa=vendor.getFieldValue('custentity_pay_on_approve');
				var incentive=vendor.getFieldValue('custentity_gets_filing_incentive');
				if (incentive=='T'&&pof=='T'){
					var date=new Date();
					var recdate=new Date(new_record.getFieldValue('custentity162'));
					if (date.getFullYear()==recdate.getFullYear()){
						var client=nlapiGetFieldText('parent');
						var vendorname=vendor.getFieldValue('entityid');
						if (poa=='F')
						nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 USCIS Recieved Date Entered for Investor '+client+'.','I-526 USCIS Received Date: '+
								new_record.getFieldValue('custentity162')+'\n Name of Referrer: '+vendorname+'\nInvestor: '+
								client+'\n Fees Due: administrative fee (all) and incentive.',null,null,{'entity':1102});
						else 
							nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 USCIS Recieved Date Entered for Investor '+client+'.','I-526 USCIS Received Date: '+
									new_record.getFieldValue('custentity162')+'\n Name of Referrer: '+vendorname+'\nInvestor: '+
									client+'\n Fees Due: administrative fee (part one) and incentive.',null,null,{'entity':1102});
					}
				}
				else if (pof=='T'){
					var client=nlapiGetFieldText('parent');
					var vendorname=vendor.getFieldValue('entityid');
					if (poa=='F')
						nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 USCIS Recieved Date Entered for Investor '+client+'.','I-526 USCIS Received Date: '+
								new_record.getFieldValue('custentity162')+'\n Name of Referrer: '+vendorname+'\nInvestor: '+
								client+'\n Fees Due: administrative fee (all).',null,null,{'entity':1102});
					else 
						nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 USCIS Recieved Date Entered for Investor '+client+'.','I-526 USCIS Received Date: '+
								new_record.getFieldValue('custentity162')+'\n Name of Referrer: '+vendorname+'\nInvestor: '+
								client+'\n Fees Due: administrative fee (part one).',null,null,{'entity':1102});
					
				}
				else if (incentive=='T'){
					var client=nlapiGetFieldText('parent');
					var vendorname=vendor.getFieldValue('entityid');
					nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 USCIS Recieved Date Entered for Investor '+client+'.','I-526 USCIS Received Date: '+
							new_record.getFieldValue('custentity162')+'\n Name of Referrer: '+vendorname+'\nInvestor: '+
							client+'\n Fees Due: incentive.',null,null,{'entity':1102});
				}
			}
			//i-526 approved?
			if (new_record.getFieldValue('custentityi526')!=null&&new_record.getFieldValue('custentityi526')==1&&(type=='create'||nlapiLookupField('job',nlapiGetRecordId(),'custentityi526')!=new_record.getFieldValue('custentityi526'))){
				var pof=vendor.getFieldValue('custentity_pay_on_file');
				var poa=vendor.getFieldValue('custentity_pay_on_approve');
				if (poa=='T'){
					var client=nlapiGetFieldText('parent');
					var vendorname=vendor.getFieldValue('entityid');
					if (pof=='T')
						nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 Approved for Investor '+client+'.','Name of Referrer: '+vendorname+'\nInvestor: '+
								client+'\n Fees Due: Administrative fee (all).',null,null,{'entity':1102});
					else
						nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment(s) Due: I-526 Approved for Investor '+client+'.','Name of Referrer: '+vendorname+'\nInvestor: '+
								client+'\n Fees Due: Administrative fee (part two).',null,null,{'entity':1102});
				}
			}
		}
	}
}
//runs on project
function check_backend_incentive(recType,recId){
	var project=nlapiLoadRecord(recType,recId);
	var vendor=nlapiLoadRecord('vendor',project.getFieldValue('custentity37'));
	if (vendor.getFieldValue('custentity_gets_backend_fee')=='T'){
		var client=project.getFieldText('parent');
		var vendorname=vendor.getFieldValue('entityid');
		var year=new Date().getFullYear();
		//var notes=nlapiSearchRecord(null,'customsearch153');
		//for (var i=0; notes!=null&&i<notes.length; i++){
		//	var cols=notes[i].getAllColumns();
		//	if (notes[i].getValue(cols[0])==recId){			
		//		nlapiSendEmail(1102,1102,'Referral Payment(s) Due: I-526 Approved for Investor '+client+'.','Name of Referrer: '+vendorname+'\nInvestor: '+
		//				client+'\n Fees Due: Administrative fee (part two).');
		//	}
		//}
		var first=project.getFieldValue('custentity_fund_disburse_date');
		var second=project.getFieldValue('custentity228');
		nlapiLogExecution('ERROR','a',first+' '+second);
		if (first!=null&&first!=''){
			if (new Date(first).getFullYear()==year){
				nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment (backend fee) Due: First disbursement date was on '+first+' for client '+client+'.','Name of Referrer: '+vendorname+'\nInvestor: '+
						client+'\n Fees Due: Annual Backend Fee.',null,null,{'entity':1102});
			}
		}
		if (second!=null&&second!=''){
			if (new Date(second).getFullYear()==year){
				nlapiSendEmail(1102,'ir@3gfund.com','Referral Payment (backend fee) Due: Second disbursement date was on '+second+' for client '+client+'.','Name of Referrer: '+vendorname+'\nInvestor: '+
									client+'\n Fees Due: Annual Backend Fee.',null,null,{'entity':1102});
			}
		}
	}
}
//runs on project chen, cijuan 5917
//li kun 1721
function update_referral_fee_balance(recType,recId){
	var project=nlapiLoadRecord(recType,recId);
	var cust=project.getFieldValue('parent');
	var referrer=project.getFieldValue('custentity37');
	if (referrer!=null&&referrer!=''){
		var bills=nlapiSearchRecord('vendorbill','customsearch152',[new nlobjSearchFilter('entity',null,'anyof',referrer),new nlobjSearchFilter('custcol7',null,'anyof',cust),new nlobjSearchFilter('mainline',null,'is','F'),new nlobjSearchFilter('type',null,'anyof','VendBill')]);
		var admin_total=parseFloat(0);
		var other_total=parseFloat(0);
		//custentity39-admin referral fee
		//custentity40-other referral fee
		for (var i=0; bills!=null&&i<bills.length;i++){
			nlapiLogExecution('ERROR',i,bills[i].getValue('statusref',null,'group')+' '+bills[i].getText('statusref',null,'group')+' '+bills[i].getValue('amount',null,'sum')+' '+bills[i].getValue('type',null,'group'));
			if (bills[i].getText('statusref',null,'group')=='Paid In Full'){
				var refnum=bills[i].getValue('custcol_referral_fee_portion',null,'group');
				if (refnum==1||refnum==2||refnum==3){
					admin_total+=parseFloat(bills[i].getValue('amount',null,'sum'));
				}
				else if (refnum==4||refnum==5){
					other_total+=parseFloat(bills[i].getValue('amount',null,'sum'));
				}
			}
		}
		project.setFieldValue('custentity39',admin_total);
		project.setFieldValue('custentity40',other_total);
		nlapiSubmitRecord(project);
	}
}






