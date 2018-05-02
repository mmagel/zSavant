//  SS1.0   rbender@sdmayer.com for NBW
//  fulfill nightly the SOs on the list
//  my saved search = 881
//       JL's edits = 883  <--- this is what the runs script off of

function sdm_nbw_ss_autofulfill(){
try{
    nlapiLogExecution('DEBUG','start','function');
    var allerrs = '';
    var theloc = [];
    var thelocindex = {};
    var thisloc = '';
    var rec = nlapiSearchRecord('transaction','customsearch883');  //load search record into an object
    var cols = rec[0].getAllColumns(); 
    

    for (var j=0; rec != null && j < rec.length; j++){      // cycle thru each row of search
    try{
        // cycle thru line items and push line item to an array of objects
        // ex: theloc = [ {loc:"MLK",z:1}, {loc:"MLK",z:2}, {loc:"warehouse",z:3}, {loc:"MLK",z:4} ]
        //     theloc = [ {loc:11,z:1}, {loc:11,z:2}, {loc:11,z:3} ]
        //     theloc = [ {loc:11,z:1}, {loc:11,z:2}, {loc:1,z:3}, {loc:11,z:4}, {loc:23,z:5}, {loc:11,z:6} ]
        //     theloc = [ {loc:11,z:1}, {loc:11,z:2}, {loc:1,z:3}, {loc:11,z:4}, {loc:23,z:5}, {loc:11,z:6}, {loc:99,z:7}, {loc:2,z:8}, {loc:666,z:9}, {loc:1,z:10}, {loc:1,z:11}, {loc:2,z:12}, {loc:666,z:13}, {loc:666,z:14} ]
        var soid = rec[j].getValue(cols[0]);  //SO internal ID
        //var soid = 515407   // for debugging purposes only

        var sorec = nlapiLoadRecord('salesorder', soid); // load so into obj


        // theloc = array of locations & line number
        var solines = sorec.getLineItemCount('item');
        var alllines = [];
        for (var z=1; z<= solines; z++){
            alllines.push(z);
            //thisloc = sorec.getLineItemValue('item','location',z);
            if (sorec.getLineItemValue('item', 'location', 1) != null ) { thisloc = sorec.getLineItemValue('item','location',z); } else { thisloc = sorec.getFieldValue('location'); }
            theloc.push({ 
                loc: thisloc,
                line: z
            });
        }


        // if header location is set and the line level location is not set AND
        // fulfill for the line = 0 THEN
        



        // theloc = sort array by location
        theloc.sort( function(a,b) {
            if(a.loc < b.loc) return -1;
            if(a.loc > b.loc) return 1;
            return 0;
        })

        //new array thats 1-dimensional (only the locations sorted)
        var locsonly = [];
        theloc.forEach( function(a,b){ locsonly.push(a.loc) }  )


        //get the uniques
        var uniqueArray = function(arrArg) {
            return arrArg.filter(function(elem, pos,arr) {
                return arr.indexOf(elem) == pos;
            });
        };
        var uniquelocs = uniqueArray(locsonly); //get the unqiues from the 1d array


        //find where the lastIndexOf() is of each unique within theloc
        wheretosplit = [];
        for (i=0; i<uniquelocs.length; i++){
            wheretosplit.push( theloc.map(function(d) { return d['loc']; }).lastIndexOf(uniquelocs[i]) );//gives index where to split theloc array
        }
        

        // slice array by wheretosplit index location, so the locsep will have an array for each location
        var locsep = [];
        for (i=0; i< wheretosplit.length; i++){
            if (i==0){   //start
                locsep.push( theloc.slice(0,wheretosplit[i]+1) );
            } else      //middle
            if (i>0 && i<wheretosplit.length-1){
                locsep.push( theloc.slice(wheretosplit[i-1]+1,wheretosplit[i]+1) );
            } else      //end
            if (i == wheretosplit.length-1){
                locsep.push( theloc.slice(wheretosplit[i-1]+1,wheretosplit[i]+1) );
            }
        }



        // on second thought, it would have made more sense to set all the fulfillment lines to FALSE and then turn on only the true ones:
        for(var i=0; i<locsep.length; i++){     // eachc chunk of locations

            var newrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', {recordmode: 'dynamic'} );  
            var fulfillmentlines = newrec.getLineItemCount('item');

            // set all lines in fulfillment to F
            for (var x=1; x<= fulfillmentlines; x++){                   
                newrec.setLineItemValue('item', 'itemreceive', x, 'F');
            }

            for(var ii=0; ii<locsep[i].length; ii++ ){  // each item within each location chunk
                newrec.setLineItemValue('item', 'itemreceive', locsep[i][ii].line, 'T');
            }

            // submit fulfillment rec here
            nlapiSubmitRecord(newrec, true);  //rec, dosourcing, skipmandatoryfields
        }


        var stopper="stophere";
        nlapiLogExecution('DEBUG','SO:'+soid, 'so_internal_id:'+ soid + ' searchrow='+j);



        // ******************************* Submit rec & governance - only commented out for debugger **********************************
        
            if(nlapiGetContext().getRemainingUsage() < 1000) {
                // reschedule the script to run immediately with 10,000 new governance points
                nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
                nlapiLogExecution('ERROR','governance', '<1000 - gov='+nlapiGetContext().getRemainingUsage() );
                return; // exit the script
            }
        
        // ******************************************************************************************************************************
                    

        var stopper="stophere";
    }catch(e){
        nlapiLogExecution('ERROR','err in search loop j='+j+' so='+soid, e.message);
        allerrs = allerrs + 'err in search loop j='+j+' so='+soid+ ' err='+ e.message +'\n';
    }   // try-catch inside loop
    }   // main search loop


}catch(e){
    nlapiLogExecution('ERROR','uh-oh', e.message);
    allerrs = allerrs + 'uh-oh, err='+ e.message +'\n';
}finally{
    if (allerrs.length>1){
        nlapiSendEmail(11278,'rbender@sdmayer.com','NBW errors',allerrs);   // once everything's done email me a report
    }
} // try-catch for function
    



    nlapiLogExecution('DEBUG','end','function');

} // end function