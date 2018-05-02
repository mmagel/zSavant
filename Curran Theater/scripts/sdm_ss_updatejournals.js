//useful links when scripting:
// SS 1.0 API = http://suitecoder.appspot.com/static/api.html
// NS usergroup = https://usergroup.netsuite.com/users/forum/platform-areas/customization/suitescript-custom-code/424370-rookie-script-writer-error-on-deployment
// Records Browser (finding the name of the sublist) = https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2016_2/script/record/journalentry.html
//
//customsearch128


function updatejournals(){

    try{
        var rec = nlapiSearchRecord('transaction','customsearch128');    //load the saved search by id (costs 10 governance units)
        var gov = 10; //start tracking the governance units.. limit of 10,000 per saved search script
        var cols = rec[0].getAllColumns();  // get all columns of our search
        for (var j=0; rec != null && j < rec.length; j++){      // cycle thru each row of search
            var gotid = rec[j].getValue('internalid', null, 'group');  // nlobjSearchResult.getValue ( name , join , summary )

            //now that we got the internal id of the JE, we can take a look inside the record to see the length of the sublist
            var myJE = nlapiLoadRecord('journalentry', gotid); // load the JE into an object (costs 10 governance units)

            var lines = myJE.getLineItemCount('line');   // nlobjRecord.getLineItemCount ( group )


                

                    for (i=1; i < lines+1; i++){  // loop thru the line items on the JE, line items start index with 1 instead of 0 (thats why I start at 1 and add 1 to the total number of lines)
                    
                        if (myJE.getLineItemValue('line' , 'class' , i) == '' || myJE.getLineItemValue('line' , 'class' , i) == null ){     // if class is blank 
                            myJE.setLineItemValue( 'line' , 'class' , i , 1726 )                                                            // then make it "missing JE class" ( id: 1726 )
                            nlapiLogExecution('ERROR','recupdate','id='+gotid+' didnt have a class set on line '+i);
                        }

                        myJE.setLineItemValue( 'line' , 'department' , i , 7 )    // nlobjRecord.setLineItemValue ( group , name , line , value )
                    
                    }

                    var stopper = 1; //put debugger stopper here

                    nlapiSubmitRecord(myJE);  //submit record to database, costs 20 governance units
                    
                    gov = gov + 30         
            


            nlapiLogExecution('DEBUG','recupdate','id='+gotid+' gov='+gov);

            if(nlapiGetContext().getRemainingUsage() < 1000) {
                // reschedule the script to run immediately with 10,000 new governance points
                nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
                nlapiLogExecution('DEBUG','gov','id='+gotid+' gov='+gov+' -gov usage function');
                return; // exit the script
            }
            if (gov >= 9970){ break; }  // i was orginally using this, but I think its unneccesary now
        }
    } catch(e){
        nlapiLogExecution('ERROR','recupdate','id='+gotid+' gov='+gov+' error='+e.message);
    }

}

