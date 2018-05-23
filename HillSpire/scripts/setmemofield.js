// This contains 2 scripts a UE and SS
// They work together to update the Journal Entry line item's memo with
// the transaction's memo body field
// essentially:  JE -> Amort Shcedule -> Bill -> Bill's memo body field 
//               ^ put the Bill's memo body field on the original JE line item that has the matching Amort Sched Number

// runs only when its scheduled
function amort_schedule_je_bs(type){
//	nlapiLogExecution('ERROR','type',type);
  //
	if (type=='edit'&&nlapiGetContext().getExecutionContext()=='scheduled'){
		nlapiSetFieldValue('memo','Amortization Journal Entry');
		var lines=nlapiGetLineItemCount('line');
		var arr=new Array();
		for (var i=1; i<=lines; i+=2){
			if (i<=lines){
				var sched=nlapiGetLineItemValue('line','schedulenum',i);
				nlapiLogExecution('ERROR','sched',sched+' '+nlapiGetRecordId() );
				if (sched!=null&&sched!=''){
					arr.push(sched);
					
				}
			}
		}
		if (arr.length>0){
			var arr1=new Array();
			var arr2=new Array();
			var schedules=nlapiSearchRecord('amortizationschedule','customsearch_amort_schedule',new nlobjSearchFilter('internalid',null,'anyof',arr));
			//nlapiLogExecution('ERROR','scheduels',schedules.length);
			for (var i=0;schedules!=null&&i<schedules.length; i++){
				var cols=schedules[i].getAllColumns();
				var billid=schedules[i].getValue('srctran');
				var schnumber=schedules[i].getValue('name');
				var memo=schedules[i].getValue(cols[4]);
				nlapiLogExecution('ERROR',i,memo);
				arr1.push(schnumber);
				arr2.push(memo);

			}
			for (var i=0; i<arr1.length; i++){
				var name=arr1[i];
				var memo=arr2[i];
				for (var j=1; j<=lines; j++){
					if (j<=lines){
						
						var sched=nlapiGetLineItemText('line','schedulenum',j);
						nlapiLogExecution('ERROR',i+' '+nlapiGetRecordId(),name+' '+memo+' '+sched);
						if (sched==name){
							nlapiSetLineItemValue('line','memo',j,memo);
						}
					}
				}
			}
		}
		
	}
}

// Scheduled Script
function set_memo(){
	var journals=nlapiSearchRecord('transaction','customsearch_amort_update_je');	//this doesnt exist.
  //nlapiLogExecution('ERROR','e',journals.length)
	for (var i=0; journals!=null&&i<journals.length;i++){
      try {
		var je=nlapiLoadRecord('journalentry',journals[i].getValue('internalid',null,'group'));
      var lines=je.getLineItemCount('line');
		var arr=new Array();
		for (var j=1; j<=lines; j+=2){
			if (j<=lines){
				var sched=je.getLineItemValue('line','schedulenum',j);
				//nlapiLogExecution('ERROR','sched',sched);
				if (sched!=null&&sched!=''){
					arr.push(sched);
					
				}
			}
		}
      if (arr.length>0){
        je.setFieldValue('custbody_memoset','T');
        nlapiSubmitRecord(je);
      }
      else {
        nlapiSubmitField('journalentry',je.getId(),'custbody_memoset','T');
        //return;
      }
		
		
      if (nlapiGetContext().getRemainingUsage()<100){
        nlapiScheduleScript('customscript_update_amort_memo','customdeploy_update_amort_memo');
        return;
      }
      }
  catch(e){
    nlapiLogExecution('ERROR','error',e.message);
  }
	}
  
}


