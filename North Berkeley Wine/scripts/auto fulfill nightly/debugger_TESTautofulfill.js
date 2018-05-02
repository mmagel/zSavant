
nlapiLogExecution('DEBUG','start','function');

    try{
        var rec = nlapiSearchRecord('transaction','customsearch883');       //load search record into an object
        var cols = rec[0].getAllColumns();                                  // get all columns of our search
        for (var j=0; rec != null && j < rec.length; j++){                  // cycle thru each row of search
            
            // for each line in the search try this:
            //try{
                var allerrs = '';
                var theitems = [];
                var theitemsindex = {};
                var thisloc = '';


                try{
                    //************ change soid ************************ */
                    var soid = 494773;//rec[j].getValue(cols[0]);                        // SO internal ID
                    var sorec = nlapiLoadRecord('salesorder', soid);            // load SO into obj

                        // cycle thru line items and push line item to an array of objects
                        // ex: theitems = [ {loc:"MLK",z:1}, {loc:"MLK",z:2}, {loc:"warehouse",z:3}, {loc:"MLK",z:4} ]
                        //     theitems = [ {loc:11,z:1}, {loc:11,z:2}, {loc:11,z:3} ]
                        //     theitems = [ {loc:11,z:1}, {loc:11,z:2}, {loc:1,z:3}, {loc:11,z:4}, {loc:23,z:5}, {loc:11,z:6} ]
                        //     theitems = [ {loc:11,z:1}, {loc:11,z:2}, {loc:1,z:3}, {loc:11,z:4}, {loc:23,z:5}, {loc:11,z:6}, {loc:99,z:7}, {loc:2,z:8}, {loc:666,z:9}, {loc:1,z:10}, {loc:1,z:11}, {loc:2,z:12}, {loc:666,z:13}, {loc:666,z:14} ]
                        var solines = sorec.getLineItemCount('item');
                        for (var z=1; z<= solines; z++){                                // loop thru line items
                            thisloc = sorec.getLineItemValue('item','location',z);
                            theitems.push({ 
                                loc: thisloc,                                           // loc = 7
                                z: z                                                    //   z = 1
                            });                                                         // once done I have all locations indexed in my theitems array
                        }

                    nlapiLogExecution('DEBUG','got lines='+solines,'');
                }catch(e){
                    nlapiLogExecution('ERROR','trying to build array of lines',e.message);
                }


                try{                                   // if locations are 'null' then use the header location
                    var headerloc = sorec.getFieldValue('location')
                    for(i=0; i< theitems.length; i++){
                        if( theitems[i].loc == null){ theitems[i].loc = headerloc }
                    }
                }catch(e){
                }


                try{                                                // sort array by location 
                    //theitems.sort( function(a,b) {
                    //    if(a.loc < b.loc) return -1;
                    //    if(a.loc > b.loc) return 1;
                    //    return 0;
                    //})

                    theitems.sort(function(a, b) {                  // simplier way to sort by loc
                        return parseFloat(a.loc) - parseFloat(b.loc);
                    });

                    nlapiLogExecution('DEBUG','sorted','theitems='+JSON.stringify(theitems));
                }catch(e){
                    nlapiLogExecution('ERROR','trying to sort array of lines',e.message);
                }





                try{                    //new array thats 1-dimensional (only the locations sorted)
                    locsonly = [];
                    theitems.forEach( function(a,b){ locsonly.push(a.loc) }  )
                }catch(e){
                    nlapiLogExecution('ERROR','trying to make 1D array of locations',e.message);
                }


 


                try{
                    //get the uniques
                    //uniquelocs = Array.from(new Set(locsonly)); //this is too modern (ES6) of javascript for netsuite, since netsuite is only ES5.1

                    var uniqueArray = function(arrArg) {
                        return arrArg.filter(function(elem, pos,arr) {
                          return arr.indexOf(elem) == pos;
                        });
                      };

                    var uniquelocs = uniqueArray(locsonly); //get the unqiues from the 1d array


                    nlapiLogExecution('DEBUG','uniques','uniqueloc='+JSON.stringify(uniquelocs));




                    //find where the lastIndexOf() is of each unique within theitems
                    wheretosplit = [];
                    for (i=0; i<uniquelocs.length; i++){
                        wheretosplit.push( theitems.map(function(d) { return d['loc']; }).lastIndexOf(uniquelocs[i]) );     //gives index where to split theitems array
                    }


                }catch(e){
                    nlapiLogExecution('ERROR','trying to create unique list and decide where to split',e.message);
                }




                try{
                    var locsep = [];
                    for (i=0; i< wheretosplit.length; i++){
                        if (i==0){   //start
                            locsep.push( theitems.slice(0,wheretosplit[i]+1) );
                        } else      //middle
                        if (i>0 && i<wheretosplit.length-1){
                            locsep.push( theitems.slice(wheretosplit[i-1]+1,wheretosplit[i]+1) );
                        } else      //end
                        if (i == wheretosplit.length-1){
                            locsep.push( theitems.slice(wheretosplit[i-1]+1,wheretosplit[i]+1) );
                        }
                    }
                    
                    nlapiLogExecution('DEBUG','seperate','uniqueloc='+ JSON.stringify(locsep)); // 	uniqueloc=[[{"loc":"2","z":1},{"loc":"2","z":2}]]
                }catch(e){
                    nlapiLogExecution('ERROR','trying to separate lines into their own array',e.message);
                }
                    

                //if locsep only contains 1 loc then remove(concat) the outtermost brackets

                //if its more than 1 loc then fulfill separately
                //ex: var locsep = [[{"loc":"2","z":1},{"loc":"2","z":3},{"loc":"2","z":4}],[{"loc":"5","z":5}],[{"loc":"6","z":2}]];
                //    var soitems = [{loc: "2", z: 1},{loc: "6", z: 2}, {loc: "2", z: 3}, {loc: "2", z: 4}, {loc: "5", z: 5}];

                // something like this:
                
                var stophere = "stpp";

                //if (locsep.length>1){
                        //for(var ii=0; ii<locsep[i].length; ii++){ 
                        //_.intersectionWith(theitems, locsep[i], _.isEqual);        
                        //}                    
                /*
                    for(var i=0; i<theitems.length; i++){ 
                        //console.log("i="+i);
                        for(var ii=0; ii<locsep.length; ii++){ 
                            //console.log("ii="+ii);
                            for(var iii=0; iii<locsep[ii].length; iii++){
                                //console.log("iii="+iii);
                                if ( theitems[i].z == locsep[ii][iii].z ){ console.log(theitems[i].z) }else{console.log("N")}
                            }
                            console.log("finished="+i);
                        }
                    }
                */
                //}
            

                // loop thru each locsep[i]
                // create fulfillment
                    // loop thru each theitems[ii]
                    // if (theitems[ii].loc == locsep[i][0].loc) { Y else N }
                    var lineset=[];
                    var fulfillrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', sorec );

                    for(var i=0; i<locsep.length; i++){
                        
                        for(var ii=0; ii<theitems.length; ii++){
                            if(theitems[ii].loc == locsep[i][0].loc){fulfillrec.setLineItemValue('item','itemreceive', theitems[ii].z, 'T')} else {fulfillrec.setLineItemValue('item','itemreceive', theitems[ii].z, 'F')}
                            if(theitems[ii].loc == locsep[i][0].loc){nlapiLogExecution('DEBUG','so line='+theitems[ii].z,'line='+ii+' T')}else{nlapiLogExecution('DEBUG','so line='+theitems[ii].z,'line='+ii+' F');}
                            if(theitems[ii].loc == locsep[i][0].loc){ lineset.push(ii+1+'. T '+locsep[i][0].loc) }else{ lineset.push(ii+1+'. F '+locsep[i][0].loc)}
                        }
                        var submitfulfillment = 'here';
                    }

/*
old     now1    now2     
1 F     T       F
2 T     F       T
3 T     T       T
4 T     T       T
5 T     F       T

*/

// ANOTHER IDEA
                    var x = 0;
                    for(var i=0; i<theitems.length; i++){   // LOOP THRU ALL ORDER LINES

                        // CHECK IF LINE[i] LOC = LOCSEP[x].LOC

                        x++ // IF NO MORE LOCSEP[x] THEN INCREASE
                    }







/*
                var fulfillrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', sorec );
                for(var ii=0; ii<locsep.length; ii++){  //each loc
                    for(var i=0; i<theitems.length; i++){

                    }
                }



                for(var i=0; i<theitems.length; i++){   //each SO item
                    for(var ii=0; ii<locsep.length; ii++){  //each loc
                        
                        if(theitems[i].loc == locsep[ii][0].loc){fulfillrec.setLineItemValue('item','itemreceive', theitems[i].z, 'T')} else {fulfillrec.setLineItemValue('item','itemreceive', theitems[i].z, 'F')}
                        var stpp=1;
                    }
                }
*/                


                /*
                //if (locsep.length>1){
                    theitems.filter( function(n) {
                        for(var ii=0; ii<locsep[i].length; ii++){ 
                            //make fresh fulfillment
                            var fulfillrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', sorec );
                            for(var ii=0; ii<locsep[i].length; ii++){
                                if( n.z != locsep[i][ii].z){fulfillrec.setLineItemValue('item','itemreceive',n.z,1)} else {fulfillrec.setLineItemValue('item','itemreceive',n.z,0)}  //{ return n.z}
                            }
                            //submit fulfillment	
                            var submitfulfillmenthere='OK'
                        }
                    })
                //}
*/

                var stophere = "and look at the fulfillment recs";


/*
                if (locsep.length>1){
                    for(var i=0; i<locsep.length; i++){     //cycle thru each locsep
                        var fulfillrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', sorec );
                        for(var ii=0; ii<locsep[i].length; ii++){   //cycle thru all objects in locsep[0]
                            //locsep[0] - if any locsep[0][0].z OR locsep[0][1].z 
                            //for(iii=1; iii<solines; iii++){ //cycle thru all lines on SO = fulfillment
                                if(iii == locsep[i][ii].z){fulfillrec.setLineItemValue('item','itemreceive',iii,1)} else {fulfillrec.setLineItemValue('item','itemreceive',iii,0)}
                            //}
                            //submit the fulfillment
                        }
                        
                    }
                }



*/







                    // slice array by wheretosplit index location, so the locsep will have an array for each location

                    
                    
                    //theitems.forEach(function(value, index) {
                    //    theitemsindex[value] = index;
                    //});

                    // transform sales order to itemfulfillment for each location


                    //console.log(locsep);

/*
                var newrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment' );

                nlapiLogExecution('DEBUG','SO:'+soid, 'so_internal_id:'+ soid + ' searchrow='+j);

                var numberofitems = newrec.getLineItemCount('item');
                for (var i=1; i<= numberofitems; i++){
                    newrec.setLineItemValue('item', 'itemreceive', i, 'T');
                }
*/

                nlapiLogExecution('DEBUG','so id='+soid,'once each SO is converted into proper fulfillment');
                //nlapiSubmitRecord(newrec, true);  //rec, dosourcing, skipmandatoryfields
                
                //1. create a record (or transform and remove all but selected line items)

                //2. put all line items in locsep[i] into the record

                //3. put anything else into the record (shipping info?)

                //4. submit the fulfillment record and so do the next one
/*
                var stpp=1;
                var fulfillrec = nlapiTransformRecord ( 'salesorder' , soid , 'itemfulfillment', sorec );
                var stpp=2;
                
                var alllines = [];
                //get a 1D array of all the z's (line numbers)
                for(i=0; i<locsep.length; i++){     // for each location
                    for(q=0; q<locsep[i].length; q++){
                        alllines.push(locsep[i][q].z);
                    }
                }
                // now we have alllines


                // now remove all the lines that arent this location
                for(i=0; i<locsep.length; i++){     // for each location
                    
                    
                    var removelines = [];
                    for(q=0; q<locsep[i].length; q++){      // select
                        removelines.push(locsep[i][q].z);
                    }


                    //now I got all the lines I want to keep for the 1st loc in removelines var
                    var alllinestoremove = alllines;
                    for(var w=0; w<alllines.length; w++){

                        for(var p=0; p<removelines.length; p++){
                            if(alllines[w] == removelines[p]){alllinestoremove.splice(w,2)}
                        }
                        //if(alllines.indexOf(removelines[rlindex]) !== -1){ alllines.pop[w] }
                        //if(rlindex < removelines.length ){ rlindex++; }
                        //console.log('now='+alllines)
                    }

                    // now alllinestoremove only contains what sould be removed
                    //
                    // conver to fulfillment, uncheck boxes, submit record, repeat



                    nlapiLogExecution('DEBUG','alllinestoremove',alllinestoremove);
                    var stophere='submithere';


                    for(var v=0; v<alllinestoremove.length; v++){
                        //fulfillrec.removeLineItem('item', alllinestoremove[v]);
                        fulfillrec.setLineItemValue('item','itemreceive',alllinestoremove,0)
                    }


                    //submit record here for the first location
                    var stophere='submithere';
                    // 

                }
                */







                
                            
                var stopper="stophere";





            //}catch(e){
            //    nlapiLogExecution('ERROR','err in search loop j='+j+' so='+soid, e.message);
            //    allerrs = allerrs + 'err in search loop j='+j+' so='+soid+ ' err='+ e.message +'\n';
            //}


        }   //search loop
    }catch(e){
        nlapiLogExecution('ERROR','uh-oh', e.message);
        allerrs = allerrs + 'uh-oh, err='+ e.message +'\n';
    }
    finally{

        try{
            if (allerrs.length>1){
                // nlapiSendEmail(11278,'rbender@sdmayer.com','NBW errors',allerrs);   //once everything's done email me a report
            }
        }catch(e){
            nlapiLogExecution('ERROR','email err', e.message);
        }

       
    }
    nlapiLogExecution('DEBUG','end','function');