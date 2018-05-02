function update_transaction_segments(type){
	if (type=='edit'||type=='create'){
		try {
			var field=nlapiLookupField(nlapiGetRecordType(),nlapiGetRecordId(),'custbody_seg_update');
			var vat=nlapiSearchRecord('transaction','customsearch_transaction_div_update_2',new nlobjSearchFilter('internalid',null,'anyof',nlapiGetRecordId()));
			if (vat!=null){
				nlapiSetFieldValue('custbody_seg_update','F');
				return;
			}
			//if (field=='F'){
				try {
				nlapiSetFieldValue('custbody_seg_update','F');
				if (nlapiGetRecordType()!='intercompanyjournalentry'){
					var sub=nlapiGetFieldValue('subsidiary');
					var div=nlapiLookupField('subsidiary',sub,'custrecord_division',true);
					try {
						nlapiSetFieldText('custbody_cseg_division_seg',div);
					}
					catch(e){
						
					}
				}
				var subids=['expense','item','line'];
				
				for (var i=0; i<subids.length; i++)
				{
					var sublist=subids[i];
					var lines=nlapiGetLineItemCount(sublist);
					for (var j=1; j<=lines; j++){
						if (nlapiGetRecordType()=='intercompanyjournalentry'){
							var sub=nlapiGetLineItemValue(sublist,'linesubsidiary',j);
							var div=nlapiLookupField('subsidiary',sub,'custrecord_division',true);
						}
						if (nlapiGetUser()!=-4)
						nlapiLogExecution('ERROR',j,div);
					try {
						nlapiSelectLineItem(sublist, j)
						//nlapiSetCurrentLineItemText(sublist,'custcol_cseg_division_seg',j,div);
						nlapiSetCurrentLineItemText(sublist,'custcol_cseg_division_seg',div);
						nlapiCommitLineItem(sublist);
					}
					catch(e){
						
					}
					}
				}
				var subids=['expense','item','line'];
                  if (nlapiGetRecordType()!='intercompanyjournalentry'){
					var sub=nlapiGetFieldValue('subsidiary');
					var div=nlapiLookupField('subsidiary',sub,'custrecord_division');
				}
				
				for (var i=0; i<subids.length; i++)
				{
					var sublist=subids[i];
					var lines=nlapiGetLineItemCount(sublist);
					for (var j=1; j<=lines; j++){
                      if (nlapiGetRecordType()=='intercompanyjournalentry'){
							var sub=nlapiGetLineItemValue(sublist,'linesubsidiary',j);
							var div=nlapiLookupField('subsidiary',sub,'custrecord_division');
						}
						try {
							var ent=nlapiGetLineItemValue(sublist,'entity',j);
							var as=nlapiLookupField('entity',ent,'custentity_cseg_bch_trip_segmt',true);
						}
						catch(e){
							
						}
						try {
							var ent=nlapiGetLineItemValue(sublist,'customer',j);
							var as=nlapiLookupField('entity',ent,'custentity_cseg_bch_trip_segmt',true);
                          var cat=nlapiLookupField('entity',ent,'category');
						}
						catch(e){
							
						}
						//nlapiSetLineItemText(sublist,'custentity_cseg_bch_trip_segmt',j,as);
                      if (cat==1&&div==1){
						if (nlapiGetUser()!=-4)
						nlapiLogExecution('ERROR','ent '+ent,as);
						nlapiSelectLineItem(sublist, j)
						nlapiSetCurrentLineItemText(sublist,'custcol_cseg_bch_trip_segmt',as);
						//nlapiSetCurrentLineItemText(sublist,'custentity_cseg_bch_trip_segmt',as);
						nlapiCommitLineItem(sublist);
                      }
					}
				}
				}
				catch(e){
					nlapiLogExecution('ERROR','error',e.message);
				}
			//}
		}
		catch(e){
			
		}
	}
}






function sched(){
	var res=nlapiSearchRecord('transaction','customsearch_transaction_div_update');
	
	var look={'Bill':'vendorbill',
		'Bill Credit':'vendorcredit',
		'Bill Payment':'vendorpayment',
		'Check':'check',
		'Credit Card':'creditcardcharge',
		'Credit Memo':'creditmemo',
		'Customer Refund':'customerrefund',
		'Deposit':'deposit',
		'Expense Report':'expensereport',
		'Fixed Asset Depreciation Entry':'customtransaction_fam_depr_jrn',
		'Invoice':'invoice',
		'Item Fulfillment':'itemfulfillment',
		'Item Receipt':'itemreceipt',
		'Journal':'journalentry',
		'Payment':'customerpayment',
              'Bill Payment':'vendorpayment',
	}
    
	for (var i=0;res!=null&&i<res.length;i++){
		var id=res[i].getValue('internalid',null,'group');
		var type=res[i].getText('type',null,'group');
      var left=nlapiGetContext().getRemainingUsage();
      if (left<100){
        nlapiScheduleScript('customscript_update_segments','customdeploy1');
        return;
      }
		try {
		  var rec=nlapiLoadRecord(look[type],id);
		  rec.setFieldValue('custbody_seg_update','F');
		  nlapiSubmitRecord(rec,false,true);
          nlapiSubmitField(look[type],id,['custbody_uperror','custbody_uperrortext'],['F',''])
		}
		catch(e){
			nlapiLogExecution('ERROR','error',e.message+' '+look[type]+' '+id);
			if (e.message=='Transaction type specified is incorrect.' && look[type]=='journalentry'){
				try {
					var rec=nlapiLoadRecord('intercompanyjournalentry',id);
					rec.setFieldValue('custbody_seg_update','F');
                  nlapiSubmitRecord(rec,false,true);
                  nlapiSubmitField('intercompanyjournalentry',id,['custbody_uperror','custbody_uperrortext'],['F',''])
		}
				catch(e){
					nlapiLogExecution('ERROR','error 1',e.message);
                  try {
                  nlapiSubmitField('intercompanyjournalentry',id,['custbody_uperror','custbody_uperrortext'],['T',e.message]);
                  }
                  catch(e){
                    
                  }
				}
			}
          else{
            try {
                  nlapiSubmitField(look[type],id,['custbody_uperror','custbody_uperrortext'],['T',e.message]);
                  }
                  catch(e){
                    
                  }
            
          }
		}
	}
}
function set_segs(t,i){
	try {
  var rec=nlapiLoadRecord(t,i);
  rec.setFieldValue('custbody_seg_update','F');
  nlapiSubmitRecord(rec);
	}
	catch(e){
		nlapiLogExecution('ERROR','error',e.message);
	}
  
}