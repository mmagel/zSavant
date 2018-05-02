// SuiteGL - Custom Lines - Adding new class to GL Lines
//nlapiLogExecution('DEBUG','SuiteGL','SuiteGL init'); 

// account id = 1 for 1000 checking
// account id = 8 for 1104 WIP

function customizeGlImpact(transactionRecord, standardLines, customLines, book)
   {
        //var context = nlapiGetContext();
        nlapiLogExecution('DEBUG','SuiteGLfunc','SuiteGL init'); 

        var tranclass = transactionRecord.getFieldValue('class');
        var assetclass = transactionRecord.getFieldValue('custbody6');

        //transactionRecord.setFieldValue('class',4);
        //var stdLine = standardLines.getLine(0);
        //stdLine.setClassId(4);

        var newLine = customLines.addNewLine();
        newLine.setCreditAmount(1);
        newLine.setAccountId(2);
        newLine.setClassId(3);
        newLine.setMemo("testing credit accnt");
        
        var newLine = customLines.addNewLine();
        newLine.setDebitAmount(1);
        newLine.setAccountId(9);
        newLine.setClassId(4);
        newLine.setMemo("testing debit aacnt");

        /*
        var newLine = customLines.addNewLine();
        newLine.setCreditAmount(standardLines.getLine(0).getCreditAmount());
        newLine.setAccountId(standardLines.getLine(0).getAccountId());
        newLine.setClassId(assetclass);

        var newLine = customLines.addNewLine();
        newLine.setDebitAmount(standardLines.getLine(0).getDebitAmount());
        newLine.setAccountId(standardLines.getLine(0).getAccountId());
        //newLine.setMemo("Payment catches both revenue and cash.");
        */


        //newLine.setMemo("testing custom lines."); 
/*
            for (var i = 0; i < standardLines.getCount(); i++) 
            {
                var currLine = standardLines.getLine(i);
                var recType = transactionRecord.getRecordType();
                if (recType == 'deposit') 
                {
                    //var custRecord = nlapiLoadRecord('customer',currLine.getEntityId());
                    var tranclass = transactionRecord.getFieldValue('class');
                    var assetclass = transactionRecord.getFieldValue('custbody6');
                    // get record properties here
                    nlapiLogExecution('DEBUG','classes','class='+tranclass+' - assetclass='+assetclass); 
                    


                    //var newLine = customLines.addNewLine();
                    //nlapiLogExecution('DEBUG','test',
                    //standardLines
                    //newLine.setClassId(assetclass);
                    //currLine.setClassId(assetclass);
                }

            }

*/

            /*

            */

            //nlapiLogExecution('ERROR','error',e.message);

   }