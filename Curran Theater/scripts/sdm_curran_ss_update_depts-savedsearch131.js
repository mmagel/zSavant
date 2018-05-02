function adhoc_updatedept_ss131(){
    try{
        var rec = nlapiSearchRecord('transaction','customsearch131');  //load search record into an object
        var cols = rec[0].getAllColumns();                      // get all columns of our search
        for (var j=0; rec != null && j < rec.length; j++){      // cycle thru each row of search
            var lineid = rec[j].getValue(cols[0]);  //unique line key
            var rectype = rec[j].getValue(cols[4]); //JE, etc
            var dept = rec[j].getValue(cols[9]);    //dept
            var recid = rec[j].getValue(cols[11]);  //int id
            
            //translate what's on the saved search to what nlapiGetRecordType gives, we need this to lookup the record with nlapiLoadRecord (u could use if then statements, but it looks pretty-er with this switch/case method)
            switch( rectype ){
                case "VendBill":
                var realtype = 'vendorbill';
                var sublisttype = 'expense';
                break;

                case "VendCred":
                var realtype = 'vendorcredit';
                var sublisttype = 'expense';
                break;

                case "CardChrg":
                var realtype = 'creditcardcharge';
                var sublisttype = 'expense';
                break;

                case "CardRfnd":
                var realtype = 'creditcardrefund';
                var sublisttype = 'expense';
                break;

                case "CustInvc":
                var realtype = 'invoice';
                var sublisttype = 'item';
                break;

                case "Journal":
                var realtype = 'journalentry';
                var sublisttype = 'line';
                break;

                default:
                var realtype = 'NA';
                var sublisttype = 'NA';
                break;
            }
   
            var gotrec = nlapiLoadRecord(realtype, recid, {recordmode: 'dynamic'});  //put the record into an object called "gotrec"
            var lineitemcount = gotrec.getLineItemCount('line');

            if ( realtype == 'invoice' ){   // only invoices get set at header level
                var invoiceheaderdept = gotrec.getFieldValue( 'department');
                nlapiLogExecution('DEBUG', rectype,'invoice header was='+invoiceheaderdept+ ' should be=7');
                gotrec.setFieldValue('department',6);
                //var istheclassthere = gotrec.getFieldValue('class');
                //if (istheclassthere == null || istheclassthere == ''){ gotrec.setFieldValue('class', 1726); }   //class is required on invoice, if blank set it to "missing class" so we can submit the record
                nlapiSubmitRecord(gotrec);
            } else {    // everything else gets set at the line level on the line specific in the saved search
                for(i=1; i<=lineitemcount; i++){
                    
                    //var istheclassthere = gotrec.getLineItemValue(sublisttype, 'class', i);
                    //if (istheclassthere == null || istheclassthere == ''){ gotrec.setLineItemValue(sublisttype, 'class', i, 1726); }   //class is required on line items, if blank set it to "missing class" so we can submit the record

                    var currline = gotrec.getLineItemValue(sublisttype, 'lineuniquekey', i);
                    if ( lineid == currline ){
                        nlapiLogExecution('DEBUG', rectype+' id:'+recid, currline+' which is line #'+i+' was=' + dept +' should be=6 -gov='+nlapiGetContext().getRemainingUsage()  );
                        gotrec.setLineItemValue( sublisttype , 'department' , i , 6 );    //set the line to "theater general"
                        nlapiSubmitField 
                                               
                    }
                }
                //nlapiSubmitRecord(gotrec, false, true );    //rec, dosourcing, skipmandatoryfields
            }

            if(nlapiGetContext().getRemainingUsage() < 1000) {
                // reschedule the script to run immediately with 10,000 new governance points
                nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
                return; // exit the script
            }

            var stophere = "please";    //stopper for testing in debugger
        }   //finished looking at a row in search
        
    }catch(e){
        nlapiLogExecution('ERROR','uh-oh', e.message);
    }
}