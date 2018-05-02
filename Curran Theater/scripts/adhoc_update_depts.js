    try{
        var rec = nlapiSearchRecord('transaction','customsearch130');  //load search record into an object
        var cols = rec[0].getAllColumns();                      // get all columns of our search
        for (var j=0; rec != null && j < rec.length; j++){      // cycle thru each row of search
            var lineid = rec[j].getValue(cols[0]);
            var rectype = rec[j].getValue(cols[3]);
            var dept = rec[j].getValue(cols[8]);
            var recid = rec[j].getValue(cols[10]);
            
            //translate what's on the saved search to what nlapiGetRecordType gives, we need this to lookup the record with nlapiLoadRecord (u could use if then statements, but it looks pretty-er with this switch/case method)
            switch( rectype ){
                case "VendBill":
                var realtype = 'vendorbill';
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
   
            var gotrec = nlapiLoadRecord(realtype, recid);  //put the record into an object called "gotrec"

            if ( realtype == 'invoice' ){   // only invoices get set at header level
                var invoiceheaderdept = gotrec.getFieldValue( 'department');
                nlapiLogExecution('DEBUG', rectype,'invoice header was='+invoiceheaderdept+ ' should be=7');
                gotrec.setFieldValue('department',7);
                var istheclassthere = gotrec.getFieldValue('class');
                if (istheclassthere == null || istheclassthere == ''){ gotrec.setFieldValue('class', 1726); }   //class is required on invoice, if blank set it to "missing class" so we can submit the record
                nlapiSubmitRecord(gotrec);
            } else {    // everything else gets set at the line level on the line specific in the saved search
                nlapiLogExecution('DEBUG', rectype, ' was=' + dept +' should be=7'  );
                gotrec.setLineItemValue( sublisttype , 'department' , lineid , 7 );
                nlapiSubmitRecord(gotrec);
            }

            var stophere = "please";    //stopper for testing in debugger
        }
        
    }catch(e){
        nlapiLogExecution('ERROR','uh-oh', e.message);
    }