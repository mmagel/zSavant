//
// for each tran search line, filter the budget search
//

function sdm_report(request, response){
	if (request.getMethod() == 'GET' ){     // this should be where u choose the FY and Budget Category

        try{
            var form = nlapiCreateForm("View Transaction Budget Report (Report may take more than 10 seconds to load)" );

            //form.setFieldValues('(Report may take more than 10 seconds to load)');

            var selectFY = form.addField('custpage_selectfield','select', 'Select Budget Year');
            //select.addSelectOption('','');
            selectFY.addSelectOption('FY2018', 'FY 2018');
            selectFY.addSelectOption('FY2017', 'FY 2017');

            var selectdisplay = form.addField('custpage_selectdisplay','select', 'Select Display Type');
            //select.addSelectOption('','');
            selectdisplay.addSelectOption('detail', 'detail');
            selectdisplay.addSelectOption('YTDsum', 'YTD Summary');
            selectdisplay.addSelectOption('YTD', 'YTD Detail');
            selectdisplay.addSelectOption('monthly', 'Monthly');

            var selectmonth = form.addField('custpage_selectmonth','select', 'Select YTD Cutoff Month');
            //select.addSelectOption('','');
            selectmonth.addSelectOption(1, 'Jan');
            selectmonth.addSelectOption(2, 'Feb');
            selectmonth.addSelectOption(3, 'Mar');
            selectmonth.addSelectOption(4, 'Apr');
            selectmonth.addSelectOption(5, 'May');
            selectmonth.addSelectOption(6, 'Jun');
            selectmonth.addSelectOption(7, 'Jul');
            selectmonth.addSelectOption(8, 'Aug');
            selectmonth.addSelectOption(9, 'Sep');
            selectmonth.addSelectOption(10, 'Oct');
            selectmonth.addSelectOption(11, 'Nov');
            selectmonth.addSelectOption(12, 'Dec');

            form.addSubmitButton('Submit');

            response.writePage(form);


        }
        catch(e){
            nlapiLogExecution('ERROR','err',e.message);
        }



        
    } 
    
    else //if (request.getMethod() == 'POST') // POST     // this is where we would display the HTML table
    
    {
        nlapiLogExecution('DEBUG','response','unformatted lastmonth='+request.getParameter('custpage_selectmonth' ) );
        var displayfy = request.getParameter('custpage_selectfield' );      // FY2018
        var displaytype = request.getParameter('custpage_selectdisplay' );  // monthly
        var lastmonth = parseFloat( request.getParameter('custpage_selectmonth' ) );  // last month
        nlapiLogExecution('DEBUG','response',displayfy + ' - '+displaytype + ' lastmonth='+lastmonth);

            //dumpResponse(request,response);
            //console.log(response);
            
                        //var form = nlapiCreateForm("Transaction Budget Report (Loading... Please wait)" );
            //response.writePage(form);
            var form = nlapiCreateForm("Transaction Budget Report" );
            var list = nlapiCreateList('Transaction Budget Report');

            // THIS IS IT

            var search = nlapiLoadSearch('customrecord_budgetsbymonth', 'customsearch317');
            var budgetsearch = nlapiSearchRecord('customrecord_budgetsbymonth', 'customsearch317');
            var searchresults = search.runSearch();
            var resultIndex = 0;
            var resultStep = 1000;
            var resultSet;
            var cols = budgetsearch[0].getAllColumns();
            var allarr = [];
            var eachmonthbud = [];
            var budgetarr = [];
            do {
                resultSet = searchresults.getResults(resultIndex, resultIndex + resultStep);    // retrieves all possible results up to the 1000 max  returned
                resultIndex = resultIndex + resultStep;                     // increment the starting point for the next batch of records
                for(var i = 0; !!resultSet && i < resultSet.length; i++){   // loop through the search results
                // Your code goes here to work on a the current resultSet (upto 1000 records per pass)
                    var account = budgetsearch[i].getValue(cols[0]),
                    month = budgetsearch[i].getValue(cols[1]),
                    amount = parseFloat( budgetsearch[i].getValue(cols[2]) ),
                    dep = budgetsearch[i].getText(cols[3]),
                    loc = budgetsearch[i].getText(cols[4]);
                    //fy = budgetsearch[j].getValue(cols[5]),
                    //cat = budgetsearch[j].getValue(cols[6]);
                    //jsondata = '{"account" : "'+account+'",   "month" : "'+month+'", "amount:" : "'+amount+'",  "dep" : "'+dep+'", "loc" : "'+loc+'","category" : "budget"}';
                    //budgetarr.push( jsondata );
                    allarr.push( {"account"   :   account,"month"     :   month,"amount"    :   amount,"dep"       :   dep,"loc"       :   loc,"category"  :   "budget" } );

                    eachmonthbud.push( {"account"   :   account, "month"     :   month, "amount"    :   amount })

                    var stoppr=1;
                }
            } while (resultSet.length > 0)

            var stopper=1;


            var search = nlapiLoadSearch('transaction', 'customsearch313');
            var transearch = nlapiSearchRecord('transaction', 'customsearch313');
            var searchresults = search.runSearch();
            var resultIndex = 0;
            var resultStep = 1000;
            var resultSet;
            var cols = transearch[0].getAllColumns();
            var tranarr = [];
            do {
                resultSet = searchresults.getResults(resultIndex, resultIndex + resultStep);    // retrieves all possible results up to the 1000 max  returned
                resultIndex = resultIndex + resultStep;                     // increment the starting point for the next batch of records
                for(var i = 0; !!resultSet && i < resultSet.length; i++){   // loop through the search results
                // Your code goes here to work on a the current resultSet (upto 1000 records per pass)
                    var account = transearch[i].getText(cols[0]),
                    month = transearch[i].getText(cols[1]),
                    amount = transearch[i].getValue(cols[2]),
                    dep = transearch[i].getText(cols[3]),
                    loc = transearch[i].getText(cols[4]);
                    //fy = budgetsearch[j].getValue(cols[5]),
                    //cat = budgetsearch[j].getValue(cols[6]);
                    //jsondata = '{"account" : "'+account+'",  "month" : "'+month+'", "amount:" : "'+amount+'", "dep" : "'+dep+'", "loc" : "'+loc+'","category" : "transaction"}';

                    //tranarr.push( jsondata );
                    allarr.push( {
                        "account"   :   account,
                        "month"     :   month,
                        "amount"    :   amount,
                        "dep"       :   dep,
                        "loc"       :   loc,
                        "category"  :   "transaction"
                    } );

                    var stoppr=1;
                }
            } while (resultSet.length > 0)




            //var budandtran = tranarr+budgetarr;

            var stpp=1;



            //filter out only the busgets that match trans
            var transonly = _.filter(allarr, {'category':'transaction'});
            var budsonly = _.filter(allarr, {'category':'budget'});


            //match only with budgets that have same account, dep, month, and loc as trans
            var matches = [];
            var uniquematches = [];
            var matchcheck = '';
            for (var i=0; i< transonly.length; i++){
                var taccount = transonly[i].account,
                    tdep = transonly[i].dep,
                    tloc = transonly[i].loc,
                    tmonth = transonly[i].month;

                    //var taccount = "5120 Revenue from program-related sales & fees : Staffing Services",
                    //tdep = "ENT",
                    //tloc = "SAC : Golden 1 Center",
                    //tmonth = "Jan 2018";

                    //var matchcheck = _.map(budsonly, function(o) {
                    //    if (o.account == taccount && o.dep == tdep && o.loc == tloc && o.month == tmonth) return o;
                    //});
                if (_.filter(budsonly, _.matches({'account': taccount, 'dep':tdep , 'loc':tloc , 'month':tmonth }) ) != []){
                    matches[i] = ( _.filter(budsonly, _.matches({'account': taccount, 'dep':tdep , 'loc':tloc , 'month':tmonth }) ) );
                        uniquematches[i] = _.uniqBy(matches[i], function (e) {return e.id; });
                        //uniquematches[i] = uniquematches[i] + {'tranamount': transonly[i].amount};
                }
                    
            // I could add the transonly amount to the uniquematches amount here

                


                //nlapiLogExecution('DEBUG','matchcheck',JSON.stringify(matchcheck) );


                //if ( matchcheck != null || matchcheck != '' || matchcheck != [] || matchcheck != undefined){
                //    matches.push(matchcheck);
            // }
                //matches.push( _.filter(allarr, {'account': transonly[i].account, 'dep':transonly[i].dep , 'loc':transonly[i].loc , 'month':transonly[i].month, 'category': 'budget' }) );
            }

            //matches = _.without(matches, undefined);

            //nlapiLogExecution('DEBUG','matches',JSON.stringify(matches) );

            // transonly[2] should MATCH a budget rec



            // filter out repeats

            // uniquematches = _.uniqBy(matches, function (e) {
            //    return e.id;
            //  });
            nlapiLogExecution('DEBUG','uniquematches='+uniquematches.length,JSON.stringify(uniquematches) );
            /*

            */
            // find match with the tran
            //for (i=0; i< uniquematches.length; i++){
            //    //uniquematches[i]
            //    var tranmatch = _.filter(transonly, {'account': uniquematches[i].account, 'dep':uniquematches[i].dep , 'loc':uniquematches[i].loc , 'month':uniquematches[i].month });
            //}

            //nlapiLogExecution('DEBUG','tranmatch',JSON.stringify(tranmatch) );


            var stpp =2;


            // find difference between the two
            var finalresult = [];
            for (i=0; i< uniquematches.length; i++){

                if (uniquematches[i] == ''){
                    finalresult.push( {
                        "account"   :   transonly[i].account,
                        "month"     :   transonly[i].month,
                        "amount"    :   transonly[i].amount,
                        "dep"       :   transonly[i].dep,
                        "loc"       :   transonly[i].loc,
                        "budget"    :   0,
                        "difference" : transonly[i].amount
                    } );

                } else {
                    var diff =  parseFloat( uniquematches[i][0].amount ) - parseFloat( transonly[i].amount ) ;

                    finalresult.push( {
                        "account"   :   transonly[i].account,
                        "month"     :   transonly[i].month,
                        "amount"    :   transonly[i].amount,
                        "dep"       :   transonly[i].dep,
                        "loc"       :   transonly[i].loc,
                        "budget"    :   uniquematches[i][0].amount,
                        "difference" : diff.toFixed(2)
                    }  );
                }

            }

            nlapiLogExecution('DEBUG','finalresult='+finalresult.length ,JSON.stringify(finalresult) );

            var stpp =3;







// **************************************************************      MONTHLY     **************************************************************************








        try{



            if (displaytype == 'monthly'){
                //output to table

                var htmldata ='<table style="border-spacing: 15px;">' +'<tr><th>Account</th><th>Month</th><th>Location</th><th>Department</th><th>Transactions Amount</th><th>Budget</th><th>Difference</th></tr>';
                var results = [];
                allJSONdata = [];

                for(var i = 0; i < finalresult.length; i++)
                {
                    var obj = finalresult[i];

                    allJSONdata.push({
                        "account" :   obj.account , 
                        "month" :   obj.month, 
                        "loc" :   obj.loc, 
                        "dep" :   obj.dep, 
                        "amount" :    parseFloat(obj.amount).toFixed(2), 
                        "budget" :   parseFloat(obj.budget).toFixed(2), 
                        "diff" :   parseFloat(obj.difference).toFixed(2)
                    });

                    htmldata = htmldata + '<tr><td>' + obj.account + '</td><td>' + obj.month + '</td><td>' + obj.loc+ '</td><td>' + obj.dep + '</td><td>' + obj.amount + '</td><td>' + obj.budget  + '</td><td>'+ obj.difference + '</td></tr>';

                    results.push({
                        "a" :   obj.account , 
                        "b" :   obj.month, 
                        "c" :   obj.loc, 
                        "d" :   obj.dep, 
                        "e" :   obj.amount, 
                        "f" :   obj.budget, 
                        "g" :   obj.difference
                        
                    }); //"h" :   0
                }
                htmldata = htmldata+'</table>';

                
                
                //form = htmldata;
                //document.write(htmldata);


                list.addButton('custpage_export_button', 'Export to CSV', 'exportCsv()');
                function exportCsv() { window.location += '&export=T'; }
                if(request.getParameter('export') == 'T')
                {
                    var csv = results; // run the search, and store the comma-delimited results in this variable
                    response.writePage(csv);
                    return;
                }

                // LIST
                list.setStyle(request.getParameter('style'));
        
                var column = list.addColumn('a', 'text', 'Account', 'left');
                //column.setURL(nlapiResolveURL('RECORD','salesorder'));
                //column.addParamToURL('id','id', true);
            
                list.addColumn('b', 'date', 'Month', 'left');
                list.addColumn('c', 'text', 'Location', 'left');
                list.addColumn('d', 'text', 'Department', 'left');
                list.addColumn('e', 'currency', 'Transaction Totals', 'right');
                list.addColumn('f', 'currency', 'Budget Amount', 'right');
                list.addColumn('g', 'currency', 'Budget Remaining', 'right');
                //list.addColumn('h', 'currency', 'Projected EOY Budget', 'right');  //to dat trans amount + remaining budget

                
                list.addRows( results );
                // END LIST
                //response.write( htmldata );
                form.addField('html', 'inlinehtml', null,null,null).setDefaultValue(htmldata); 


                allJSONdata = JSON.stringify(allJSONdata);
                //response.write(allJSONdata);
                response.writePage(list);

            }
            















// **************************************************************  detail  **********************************************************************************




            if (displaytype == 'detail'){
                //output to table

                //var htmldata ='<table style="border-spacing: 15px;">' +'<tr><th>Account</th><th>Month</th><th>Location</th><th>Department</th><th>Transactions Amount</th><th>Budget</th><th>Difference</th></tr>';
                var results = [];
                allJSONdata = [];

                for(var i = 0; i < finalresult.length; i++)
                {
                    var obj = finalresult[i];

                    allJSONdata.push({
                        "account" :   obj.account , 
                        "month" :   obj.month, 
                        "loc" :   obj.loc, 
                        "dep" :   obj.dep, 
                        "amount" :    parseFloat(obj.amount).toFixed(2), 
                        "budget" :   parseFloat(obj.budget).toFixed(2), 
                        "diff" :   parseFloat(obj.difference).toFixed(2)
                    });

                    //htmldata = htmldata + '<tr><td>' + obj.account + '</td><td>' + obj.month + '</td><td>' + obj.loc+ '</td><td>' + obj.dep + '</td><td>' + obj.amount + '</td><td>' + obj.budget  + '</td><td>'+ obj.difference + '</td></tr>';

                    results.push({
                        "a" :   obj.account , 
                        "b" :   obj.month, 
                        "c" :   obj.loc, 
                        "d" :   obj.dep, 
                        "e" :   obj.amount, 
                        "f" :   obj.budget, 
                        "g" :   obj.difference
                        
                    }); //"h" :   0
                }
                //htmldata = htmldata+'</table>';






                //2018-1
                var search = nlapiLoadSearch('customrecord56', 'customsearch321');
                var budgetsearch = nlapiSearchRecord('customrecord56', 'customsearch321');
                var searchresults = search.runSearch();
                var resultIndex = 0;
                var resultStep = 1000;
                var resultSet;
                var cols = budgetsearch[0].getAllColumns();
                var allbuds = [];
                //var eachmonthbud = [];
                //var budgetarr = [];
                do {
                    resultSet = searchresults.getResults(resultIndex, resultIndex + resultStep);    // retrieves all possible results up to the 1000 max  returned
                    resultIndex = resultIndex + resultStep;                     // increment the starting point for the next batch of records
                    for(var i = 0; !!resultSet && i < resultSet.length; i++){   // loop through the search results
                    // Your code goes here to work on a the current resultSet (upto 1000 records per pass)
                        var account = budgetsearch[i].getValue(cols[0]),
                        m1 = parseFloat(budgetsearch[i].getValue(cols[1])),
                        m2 = parseFloat(budgetsearch[i].getValue(cols[2])),
                        m3 = parseFloat(budgetsearch[i].getValue(cols[3])),
                        m4 = parseFloat(budgetsearch[i].getValue(cols[4])),
                        m5 = parseFloat(budgetsearch[i].getValue(cols[5])),
                        m6 = parseFloat(budgetsearch[i].getValue(cols[6])),
                        m7 = parseFloat(budgetsearch[i].getValue(cols[7])),
                        m8 = parseFloat(budgetsearch[i].getValue(cols[8])),
                        m9 = parseFloat(budgetsearch[i].getValue(cols[9])),
                        m10 = parseFloat(budgetsearch[i].getValue(cols[10])),
                        m11 = parseFloat(budgetsearch[i].getValue(cols[11])),
                        m12 = parseFloat(budgetsearch[i].getValue(cols[12])),
                        dep = budgetsearch[i].getValue(cols[13]),
                        loc = budgetsearch[i].getValue(cols[14]);
                        //fy = budgetsearch[j].getValue(cols[5]),
                        //cat = budgetsearch[j].getValue(cols[6]);
                        //jsondata = '{"account" : "'+account+'",   "month" : "'+month+'", "amount:" : "'+amount+'",  "dep" : "'+dep+'", "loc" : "'+loc+'","category" : "budget"}';
                        //budgetarr.push( jsondata );
                        //allarr.push( {"account"   :   account,"month"     :   month,"amount"    :   amount,"dep"       :   dep,"loc"       :   loc,"category"  :   "budget" } );
    
                        allbuds.push( {
                            "account"   :   account, 
                            "jan"     :   m1, 
                            "feb"    :   m2, 
                            "mar"    :   m3, 
                            "apr"    :   m4, 
                            "may"    :   m5, 
                            "jun"    :   m6, 
                            "jul"    :   m7, 
                            "aug"    :   m8, 
                            "sep"    :   m9, 
                            "oct"    :   m10, 
                            "nov"    :   m11, 
                            "dec"    :   m12,
                            "dep"    :   dep,
                            "loc"    :   loc
                        })
    
                        var stoppr=1;
                    }
                } while (resultSet.length > 0)



var stoppp=1;







                
                
                //form = htmldata;
                //document.write(htmldata);
/*

                list.addButton('custpage_export_button', 'Export to CSV', 'exportCsv()');
                function exportCsv() { window.location += '&export=T'; }
                if(request.getParameter('export') == 'T')
                {
                    var csv = results; // run the search, and store the comma-delimited results in this variable
                    response.writePage(csv);
                    return;
                }

                // LIST
                list.setStyle(request.getParameter('style'));
        
                var column = list.addColumn('a', 'text', 'Account', 'left');
                //column.setURL(nlapiResolveURL('RECORD','salesorder'));
                //column.addParamToURL('id','id', true);
            
                list.addColumn('b', 'date', 'Month', 'left');
                list.addColumn('c', 'text', 'Location', 'left');
                list.addColumn('d', 'text', 'Department', 'left');
                list.addColumn('e', 'currency', 'Transaction Totals', 'right');
                list.addColumn('f', 'currency', 'Budget Amount', 'right');
                list.addColumn('g', 'currency', 'Budget Remaining', 'right');
                //list.addColumn('h', 'currency', 'Projected EOY Budget', 'right');  //to dat trans amount + remaining budget

                
                list.addRows( results );
                // END LIST
                //response.write( htmldata );
                //form.addField('html', 'inlinehtml', null,null,null).setDefaultValue(htmldata); 

*/
                //allJSONdata = JSON.stringify(allJSONdata);
                //response.write(allJSONdata);



                //  sum up and group by account

                var b = _.groupBy(allJSONdata, 'account')
                b = _.map(b)
                bb = _.values(b) // indexed array by account

                //get all the accounts in one flat array
                var allaccounts = [];
                for(i=0; i<bb.length; i++){
                    allaccounts.push(bb[i][0].account)
                }

                



                // how to push to new array with SUMMED amounts
                // c = final result
                // bb = input array
                var c = [];
                for(z=0; z<bb.length; z++){
                    var amnt = 0;
                    var yr = ' 2018';
                    var bud = 0;
                    var diff = 0;
                    var monthdata = [];
                    var monthvalue=0
                    var janamnt=0 
                    var janbud=0
                    var febamnt=0
                    var febbud=0
                    var maramnt=0, marbud=0,
                    apramnt=0, aprbud=0,
                    mayamnt=0, maybud=0,
                    junamnt=0, junbud=0,
                    julamnt=0, julbud=0, 
                    augamnt=0, augbud=0,
                    sepamnt=0, sepbud=0,
                    octamnt=0, octbud=0,
                    novamnt=0, novbud=0,
                    decamnt=0, decbud=0;
                    

                    for (i=0; i<bb[z].length; i++){
                        
                        if ( bb[z][i].month == 'Jan'+yr ){ monthvalue = 1 ; janamnt=janamnt+ parseFloat(bb[z][i].amount); janbud = janbud + parseFloat( bb[z][i].budget ) }  
                        if ( bb[z][i].month == 'Feb'+yr ){ monthvalue = 2 ; febamnt=febamnt+ parseFloat(bb[z][i].amount); febbud = febbud + parseFloat( bb[z][i].budget ) }
                        if ( bb[z][i].month == 'Mar'+yr ){ monthvalue = 3 ; maramnt=maramnt+ parseFloat(bb[z][i].amount); marbud = marbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Apr'+yr ){ monthvalue = 4 ; apramnt=apramnt+ parseFloat(bb[z][i].amount); aprbud = aprbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'May'+yr ){ monthvalue = 5 ; mayamnt=mayamnt+ parseFloat(bb[z][i].amount); maybud = maybud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Jun'+yr ){ monthvalue = 6 ; junamnt=junamnt+ parseFloat(bb[z][i].amount); junbud = junbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Jul'+yr ){ monthvalue = 7 ; julamnt=julamnt+ parseFloat(bb[z][i].amount); julbud = julbud + parseFloat( bb[z][i].budget )}  
                        if ( bb[z][i].month == 'Aug'+yr ){ monthvalue = 8 ; augamnt=augamnt+ parseFloat(bb[z][i].amount); augbud = augbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Sep'+yr ){ monthvalue = 9 ; sepamnt=sepamnt+ parseFloat(bb[z][i].amount); sepbud = sepbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Oct'+yr ){ monthvalue = 10 ; octamnt=octamnt+ parseFloat(bb[z][i].amount); octbud = octbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Nov'+yr ){ monthvalue = 11 ; novamnt=novamnt+ parseFloat(bb[z][i].amount); novbud = novbud + parseFloat( bb[z][i].budget )}
                        if ( bb[z][i].month == 'Dec'+yr ){ monthvalue = 12 ; decamnt=decamnt+ parseFloat(bb[z][i].amount); decbud = decbud + parseFloat( bb[z][i].budget )}
                        amnt = amnt + parseFloat( bb[z][i].amount )  
                        bud = bud + parseFloat( bb[z][i].budget )
                        diff = diff + parseFloat( bb[z][i].difference )  
                        
                        //console.log('monthvalue='+monthvalue);
                        //if (bb[z][i].month = 'Jan'+yr){ janamnt = janamnt + parseFloat(bb[z][i].amount); janbud = janbud + parseFloat(bb[z][i].budget); }
                        //if (bb[z][i].month = 'Feb'+yr){ febamnt = febamnt + parseFloat(bb[z][i].amount); febbud = febbud + parseFloat(bb[z][i].budget); }
                    }
                    
                    amnt = amnt.toFixed(2)
                    diff = diff.toFixed(2)
                    bud = bud.toFixed(2)
                    janamnt = janamnt.toFixed(2)
                    janbud = janbud.toFixed(2)
                    febamnt = febamnt.toFixed(2)
                    febbud = febbud.toFixed(2)

                    monthdata.push( {janamount : janamnt, janbudget : janbud}, {febamount : febamnt, febbudget :febbud}, {maramount : maramnt, marbudget : marbud}, {apramount : apramnt, aprbudget : aprbud}, {mayamount : mayamnt, maybudget : maybud}, {junamount : junamnt, junbudget : junbud}, {julamount : julamnt, julbudget : julbud}, {augamount : augamnt, augbudget : augbud}, {sepamount : sepamnt, sepbudget : sepbud}, {octamount : octamnt, octbudget : octbud}, {novamount : novamnt, novbudget : novbud}, {decamount : decamnt, decbudget : decbud}  );
                    //monthdata.push( {janamount : janamnt, janbudget : janbud}, {febamount : febamnt, febbudget :febbud}  );

                    c.push( { account : bb[z][0].account, amount : amnt, budget : bud, monthdata : monthdata}  );
                }

                

                c = _.sortBy(c, ['account']);

                
                var q = [];
                for (i=0; i<bb.length; i++){
                    q.push({account : bb[i][0].account, month:'', location:'', department:'', todateactuals:0, chunkabud:0, chunkbbud:0, ytdvariance:0, remaining:0, remainingfybudget:0, projectedeoybudget:0, transactions : bb[i] });
                        
                }
                
                
                var yr = ' 2018';
                var totalbud = 0;
                var janamnt=0 
                var janbud=0
                var febamnt=0
                var febbud=0
                var maramnt=0, marbud=0,
                apramnt=0, aprbud=0,
                mayamnt=0, maybud=0,
                junamnt=0, junbud=0,
                julamnt=0, julbud=0, 
                augamnt=0, augbud=0,
                sepamnt=0, sepbud=0,
                octamnt=0, octbud=0,
                novamnt=0, novbud=0,
                decamnt=0, decbud=0;
                var chunkatran=0, chunkabud =0;
                var chunkbtran=0, chunkbbud =0;
                // lastmonth = month val selected


                for(i=0; i<q.length; i++){

                    //get the total of all the transactions
                    var totaltran = 0;
                    var totalbud = 0;
                    var janamnt=0 
                    var janbud=0
                    var febamnt=0
                    var febbud=0
                    var maramnt=0, marbud=0,
                    apramnt=0, aprbud=0,
                    mayamnt=0, maybud=0,
                    junamnt=0, junbud=0,
                    julamnt=0, julbud=0, 
                    augamnt=0, augbud=0,
                    sepamnt=0, sepbud=0,
                    octamnt=0, octbud=0,
                    novamnt=0, novbud=0,
                    decamnt=0, decbud=0;
                    var chunkatran=0, chunkabud =0;
                    var chunkbtran=0, chunkbbud =0;

                    for (ii=0; ii<q[i].transactions.length; ii++){
                        totaltran = totaltran + parseFloat(q[i].transactions[ii].amount)
                        totalbud = totalbud + parseFloat(q[i].transactions[ii].budget)

                        if ( q[i].transactions[ii].month == 'Jan'+yr ){ monthvalue = 1 ; janamnt=janamnt+ parseFloat(q[i].transactions[ii].amount); janbud = janbud + parseFloat( q[i].transactions[ii].budget ) }  
                        if ( q[i].transactions[ii].month == 'Feb'+yr ){ monthvalue = 2 ; febamnt=febamnt+ parseFloat(q[i].transactions[ii].amount); febbud = febbud + parseFloat( q[i].transactions[ii].budget ) }
                        if ( q[i].transactions[ii].month == 'Mar'+yr ){ monthvalue = 3 ; maramnt=maramnt+ parseFloat(q[i].transactions[ii].amount); marbud = marbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Apr'+yr ){ monthvalue = 4 ; apramnt=apramnt+ parseFloat(q[i].transactions[ii].amount); aprbud = aprbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'May'+yr ){ monthvalue = 5 ; mayamnt=mayamnt+ parseFloat(q[i].transactions[ii].amount); maybud = maybud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Jun'+yr ){ monthvalue = 6 ; junamnt=junamnt+ parseFloat(q[i].transactions[ii].amount); junbud = junbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Jul'+yr ){ monthvalue = 7 ; julamnt=julamnt+ parseFloat(q[i].transactions[ii].amount); julbud = julbud + parseFloat( q[i].transactions[ii].budget )}  
                        if ( q[i].transactions[ii].month == 'Aug'+yr ){ monthvalue = 8 ; augamnt=augamnt+ parseFloat(q[i].transactions[ii].amount); augbud = augbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Sep'+yr ){ monthvalue = 9 ; sepamnt=sepamnt+ parseFloat(q[i].transactions[ii].amount); sepbud = sepbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Oct'+yr ){ monthvalue = 10 ; octamnt=octamnt+ parseFloat(q[i].transactions[ii].amount); octbud = octbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Nov'+yr ){ monthvalue = 11 ; novamnt=novamnt+ parseFloat(q[i].transactions[ii].amount); novbud = novbud + parseFloat( q[i].transactions[ii].budget )}
                        if ( q[i].transactions[ii].month == 'Dec'+yr ){ monthvalue = 12 ; decamnt=decamnt+ parseFloat(q[i].transactions[ii].amount); decbud = decbud + parseFloat( q[i].transactions[ii].budget )}

                        //not right.. should get budget from saved search not the trans
                        //if (monthvalue <= lastmonth){ chunkatran=chunkatran+parseFloat(q[i].transactions[ii].amount); chunkabud=chunkabud+parseFloat(q[i].transactions[ii].budget); }
                        //else                        { chunkbtran=chunkbtran+parseFloat(q[i].transactions[ii].amount); chunkbbud=chunkbbud+parseFloat(q[i].transactions[ii].budget); }


                    }

                    // update the summary
                    q[i].todateactuals = totaltran;
                    //q[i].totalbud = totalbud;
                    
                    if (lastmonth == 1){ 
                        q[i].chunkabud = janbud; 
                        q[i].chunkbbud = febbud + marbud+aprbud+maybud+junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt; 
                        q[i].chunkbtran = febamnt + maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 2){ 
                        q[i].chunkabud = janbud+febbud; 
                        q[i].chunkbbud = marbud+aprbud+maybud+junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt; 
                        q[i].chunkbtran = maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 3){ 
                        q[i].chunkabud = janbud+febbud+marbud; 
                        q[i].chunkbbud = aprbud+maybud+junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt; 
                        q[i].chunkbtran = apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 4){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud; 
                        q[i].chunkbbud = maybud+junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt; 
                        q[i].chunkbtran = mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 5){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud; 
                        q[i].chunkbbud = junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt; 
                        q[i].chunkbtran = junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 6){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud; 
                        q[i].chunkbbud = julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt; 
                        q[i].chunkbtran = julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 7){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud; 
                        q[i].chunkbbud = augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt; 
                        q[i].chunkbtran = augamnt+sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 8){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud+augbud; 
                        q[i].chunkbbud = sepbud+octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt; 
                        q[i].chunkbtran = sepamnt+octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 9){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud+augbud+sepbud; 
                        q[i].chunkbbud = octbud+novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt; 
                        q[i].chunkbtran = octamnt+novamnt+decamnt; 
                    } else if (lastmonth == 10){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud+augbud+sepbud+octbud; 
                        q[i].chunkbbud = novbud+decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt; 
                        q[i].chunkbtran = novamnt+decamnt; 
                    } else if (lastmonth == 11){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud+augbud+sepbud+octbud+novbud; 
                        q[i].chunkbbud = decbud; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt; 
                        q[i].chunkbtran = decamnt; 
                    } else if (lastmonth == 12){ 
                        q[i].chunkabud = janbud+febbud+marbud+aprbud+maybud+junbud+julbud+augbud+sepbud+octbud+novbud+decbud; 
                        q[i].chunkbbud = 0; 
                        q[i].chunkatran = janamnt+febamnt+maramnt+apramnt+mayamnt+junamnt+julamnt+augamnt+sepamnt+octamnt+novamnt+decamnt; 
                        q[i].chunkbtran = 0; 
                    }





                    //q[i].chunkabud = chunkabud;
                    //q[i].chunkbbud = chunkbbud;
                    q[i].ytdvariance = chunkabud - totaltran;
                    q[i].remaining = chunkbbud - totaltran;
                    q[i].remainingfybudget = chunkbbud - chunkabud;
                    q[i].projectedeoybudget = totaltran + (chunkbbud - chunkabud);

                }

                q = _.sortBy(q, ['account']);

                nlapiLogExecution('DEBUG','*******q[0]=', JSON.stringify(q[0].chunkabud));


                //[
                //  { account     : 5120 Revenue from program-related sales & fees : Staffing Services}
                //  totalamount : 5000
                //  totalbudget : 9000
                //      month : Jan 2018    
                //

                // get one array with all of the account totals as objects
                // get another array with all the account transactions as objects
                // merge together by account key
                // Iterate over first array of objects


               // _.map(a, function(obj) {
                    // add the properties from second array matching the userID
                    // to the object from first array and return the updated object
               //     return _.assign(obj, _.find(b, {userId: obj.userId}));
               // });

var colb = '';
var colc = '';
if (lastmonth ==1){ colb = 'Jan'; colc = 'Feb'}
if (lastmonth ==2){ colb = 'Feb'; colc = 'Mar'}
if (lastmonth ==3){ colb = 'Mar'; colc = 'Apr'}
if (lastmonth ==4){ colb = 'Apr'; colc = 'May'}
if (lastmonth ==5){ colb = 'May'; colc = 'Jun'}
if (lastmonth ==6){ colb = 'Jun'; colc = 'Jul'}
if (lastmonth ==7){ colb = 'Jul'; colc = 'Aug'}
if (lastmonth ==8){ colb = 'Aug'; colc = 'Sep'}
if (lastmonth ==9){ colb = 'Sep'; colc = 'Oct'}
if (lastmonth ==10){ colb = 'Oct'; colc = 'Nov'}
if (lastmonth ==11){ colb = 'Nov'; colc = 'Dec'}
if (lastmonth ==12){ colb = 'Dec'; colc = 'N/A'}

                // NEW LIST
                list.setStyle(request.getParameter('style'));
        
                var column =    list.addColumn('id', 'text', 'ID', 'left');
                                list.addColumn('sumaccount', 'text', 'Summary Account', 'left');
                                list.addColumn('detailaccount', 'text', 'Detail Account', 'left');
                                    list.addColumn('month', 'date', 'Month', 'left');
                                    list.addColumn('location', 'text', 'Location', 'left');
                                    list.addColumn('department', 'text', 'Department', 'left');
                                    list.addColumn('totalbudget', 'currency', 'Total Budget', 'left');
                                list.addColumn('a', 'currency', 'A. To Date Actuals', 'right');
                                list.addColumn('b', 'currency', 'B. Budget Amount (Jan-'+colb+')', 'right');
                                list.addColumn('c', 'currency', 'C. Budget Amount ('+colc+'-Dec)', 'right');
                                list.addColumn('d', 'currency', 'D. YTD Variance (B-A)', 'right');
                                list.addColumn('e', 'currency', 'E. Remaining (C-A)', 'right');
                                list.addColumn('f', 'currency', 'F. Remaining FY Budget', 'right');
                                list.addColumn('g', 'currency', 'G. Projected EOY Budget', 'right');

                
                nlapiLogExecution('DEBUG','c='+c.length +' q='+q.length, JSON.stringify(c));
                nlapiLogExecution('DEBUG','eachmonthbud='+eachmonthbud.length, JSON.stringify(eachmonthbud) );



                // need to group account and month and SUM amount
                //  
                // account1
                // |________month1
                //        |_month2
                //        |_month3

                var output = _(eachmonthbud)
                                .groupBy('account')
                                .map()
                                .value();

                _.forEach(output, function(value, key) {
                    output[key] = _.groupBy(output[key], function(item) {
                        return item.month;
                    });
                    });


                    for (i=0; i<output.length; i++){
                        output[i] = _.map(output[i])
                    }

                    nlapiLogExecution('DEBUG','1,q='+q.length, JSON.stringify(q) );
                    nlapiLogExecution('DEBUG','1.output='+output.length, JSON.stringify(output) );

                var yr=' 2018';

                for (i=0; i< output.length; i++){   //account





                    for(ii=0; ii < output[i].length; ii++){  //month group

                                            var amnt = 0;
                    output[i].janbud=0;
                    output[i].febbud=0;
                    output[i].marbud=0;
                    output[i].aprbud=0;
                    output[i].maybud=0;
                    output[i].junbud=0;
                    output[i].julbud=0;
                    output[i].augbud=0;
                    output[i].sepbud=0;
                    output[i].octbud=0;
                    output[i].novbud=0;
                    output[i].decbud=0;
                    
                        for(iii=0; iii < output[i][ii].length; iii++){  //each month budget amount
                            amnt = output[i][ii][iii].amount;
                        
                            //output[i][ii].month = output[i][ii][0].month
                            //output[i][ii].account = output[i][ii][0].account
                            //output[i][ii].amnt = amnt      
                            if(output[i][ii][iii].month == 'Jan'+yr){output[i].janbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Feb'+yr){output[i].febbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Mar'+yr){output[i].marbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Apr'+yr){output[i].aprbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'May'+yr){output[i].maybud = output[i].janbud + amnt}    
                            if(output[i][ii][iii].month == 'Jun'+yr){output[i].junbud = output[i].janbud + amnt}    
                            if(output[i][ii][iii].month == 'Jul'+yr){output[i].julbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Aug'+yr){output[i].augbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Sep'+yr){output[i].sepbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Oct'+yr){output[i].octbud = output[i].janbud + amnt} 
                            if(output[i][ii][iii].month == 'Nov'+yr){output[i].novbud = output[i].janbud + amnt}    
                            if(output[i][ii][iii].month == 'Dec'+yr){output[i].decbud = output[i].janbud + amnt} 
                            output[i].account = output[i][0][0].account
                        }
                        
                    }

                    
                    //output[i].janbud = 
                }


            
                // now update main account with totals from children


                nlapiLogExecution('DEBUG','2.q='+q.length, JSON.stringify(q) );
                nlapiLogExecution('DEBUG','2.output='+output.length, JSON.stringify(output) );



                nlapiLogExecution('DEBUG','q check', 'q0='+q[0].account );
                nlapiLogExecution('DEBUG','o check',' output0='+output[0].account);


                nlapiLogExecution('DEBUG','-output[i].janbud-', output[0].janbud  );
                
                //nlapiLogExecution('DEBUG','-output[ii].janbud-', output[0].janbud  );


                //now loop thru Qs again and update the budget month amount for each one
                for(var i=0; i< q.length; i++){ //60
                    q[i].janbudget=0;
                    q[i].febbudget=0;
                    q[i].marbudget=0;
                    q[i].aprbudget=0;
                    q[i].maybudget=0;
                    q[i].junbudget=0;
                    q[i].julbudget=0;
                    q[i].augbudget=0;
                    q[i].sepbudget=0;
                    q[i].octbudget=0;
                    q[i].novbudget=0;
                    q[i].decbudget=0;
                    //nlapiLogExecution('DEBUG','-q[i].janbudget-', q[i].janbudget  );

                    for(var ii=0; ii< output.length; ii++){ //6

                        if(q[i].account == output[ii].account){                        
                            q[i].janbudget = output[ii].janbud;
                            q[i].febbudget = output[ii].febbud;
                            q[i].marbudget = output[ii].marbud;
                            q[i].aprbudget = output[ii].aprbud;
                            q[i].maybudget = output[ii].maybud;
                            q[i].junbudget = output[ii].junbud;
                            q[i].julbudget = output[ii].julbud;
                            q[i].augbudget = output[ii].augbud;
                            q[i].sepbudget = output[ii].sepbud;
                            q[i].octbudget = output[ii].octbud;
                            q[i].novbudget = output[ii].novbud;
                            q[i].decbudget = output[ii].decbud;
                        }

                    }

                }
                nlapiLogExecution('DEBUG','q0 check',' q[0].monthdata[0].janbudget='+q[0].janbudget);
                nlapiLogExecution('DEBUG','o0 check',' output[0].janbud='+output[0].janbud);

                nlapiLogExecution('DEBUG','3.q='+q.length, JSON.stringify(q) );
                nlapiLogExecution('DEBUG','3.output='+output.length, JSON.stringify(output) );


                var accountbuds = _(allbuds)
                        .groupBy('account')
                        .map()
                        .value();
                for(i=0; i<accountbuds.length; i++){
                    accountbuds[i].account = accountbuds[i][0].account
                    accountbuds[i].m1 =  _.sumBy(accountbuds[i], 'jan')
                    accountbuds[i].m2 =  _.sumBy(accountbuds[i], 'feb')
                    accountbuds[i].m3 =  _.sumBy(accountbuds[i], 'mar')
                    accountbuds[i].m4 =  _.sumBy(accountbuds[i], 'apr')
                    accountbuds[i].m5 =  _.sumBy(accountbuds[i], 'may')
                    accountbuds[i].m6 =  _.sumBy(accountbuds[i], 'jun')
                    accountbuds[i].m7 =  _.sumBy(accountbuds[i], 'jul')
                    accountbuds[i].m8 =  _.sumBy(accountbuds[i], 'aug')
                    accountbuds[i].m9 =  _.sumBy(accountbuds[i], 'sep')
                    accountbuds[i].m10 =  _.sumBy(accountbuds[i], 'oct')
                    accountbuds[i].m11 =  _.sumBy(accountbuds[i], 'nov')
                    accountbuds[i].m12 =  _.sumBy(accountbuds[i], 'dec')
                }











                //now that I got all the data I need to:
                // 0. go back and remove dupes from original search
                // 1. group by dep+loc+month
                // 2. take that groupping and divide into chunka and chunkb
                // 3. display that and use it calculate account total

                // group by dep + loc
                for ( i=0; i<q.length; i++ ){
                    for ( ii=0; ii<q[i].transactions.length; ii++){
                        q[i].transactions[ii].trankey = q[i].transactions[ii].loc+q[i].transactions[ii].dep
                    }
                }

                // split chunks
                









                //                account,  month,  loc,    dep,    a.todateactual, b.chunka,   c.chunkb,        d.ytdvar,   e.remaining,    f.remainingfy,  g.projectedeoy    
                var everything = [];
                var intid = 0;
                for(i=0; i<q.length; i++){
                    intid = intid +1

                    for(x=0; x<accountbuds.length; x++){
                        if (q[i].account == accountbuds[x].account){

                            if ( parseFloat(lastmonth) == 1){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 );
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            } else if ( parseFloat(lastmonth) == 2){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            } else if ( parseFloat(lastmonth) == 3){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 4){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m5 )+parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }   else if ( parseFloat(lastmonth) == 5){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 6){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 7){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 8){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 ) +parseFloat( accountbuds[x].m8 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }   else if ( parseFloat(lastmonth) == 9){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 10){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+parseFloat( accountbuds[x].m10 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m11 )+parseFloat( accountbuds[x].m12 )
                            }   else if ( parseFloat(lastmonth) == 11){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+ parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 )  ;
                                q[i].chunkbbud =  parseFloat( accountbuds[x].m12 )
                            }  else if ( parseFloat(lastmonth) == 12){ 
                                q[i].chunkabud =  parseFloat( accountbuds[x].m1 )+parseFloat( accountbuds[x].m2 )+parseFloat( accountbuds[x].m3 )+parseFloat( accountbuds[x].m4 )+parseFloat( accountbuds[x].m5 )+ parseFloat( accountbuds[x].m6 )+parseFloat( accountbuds[x].m7 )+parseFloat( accountbuds[x].m8 )+parseFloat( accountbuds[x].m9 )+ parseFloat( accountbuds[x].m10 )+parseFloat( accountbuds[x].m11 ) +parseFloat( accountbuds[x].m12 ) ;
                                q[i].chunkbbud =  0
                            } 



                        }
                    }

                    
                    //here i need to get the budget amounts from var c to make cols b,c,d,e,f,g


                    //var monthgroupped = _.groupBy( q[0].transactions, 'month')
                    var yr = ' 2018'

                    //get totals for each month for each account

                    for(i=0; i<q.length; i++){
                        var jantotal = 0,
                        febtotal = 0,
                        martotal = 0,
                        aprtotal = 0,
                        maytotal = 0,
                        juntotal = 0,
                        jultotal = 0,
                        augtotal = 0,
                        septotal = 0,
                        octtotal = 0,
                        novtotal = 0,
                        dectotal = 0;
                        for(ii=0; ii<q[i].transactions.length; ii++){
                            if (q[i].transactions[ii].month == 'Jan'+yr){jantotal =jantotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Feb'+yr){febtotal =febtotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Mar'+yr){martotal =martotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Apr'+yr){aprtotal =aprtotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'May'+yr){maytotal =maytotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Jun'+yr){juntotal =juntotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Jul'+yr){jultotal =jultotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Aug'+yr){augtotal =augtotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Sep'+yr){septotal =septotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Oct'+yr){octtotal =octtotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Nov'+yr){novtotal =novtotal + parseFloat(q[i].transactions[ii].amount) }
                            if (q[i].transactions[ii].month == 'Dec'+yr){dectotal =dectotal + parseFloat(q[i].transactions[ii].amount) }
                        }
                        q[i].jantotal = jantotal;
                        q[i].febtotal = febtotal;
                        q[i].martotal = martotal;
                        q[i].aprtotal = aprtotal;
                        q[i].maytotal = maytotal;
                        q[i].jultotal = jultotal;
                        q[i].augtotal = augtotal;
                        q[i].septotal = septotal;
                        q[i].octtotal = octtotal;
                        q[i].novtotal = novtotal;
                        q[i].dectotal = dectotal;

                        //if ( parseFloat(lastmonth) == 1){ 
                        //}
                    }





                    q[i].chunkscombined = parseFloat( q[i].chunkabud ) + parseFloat( q[i].chunkbbud ); 
                    q[i].ytdvariance = q[i].chunkabud - q[i].todateactuals;
                    q[i].remaining = q[i].chunkbbud - q[i].todateactuals;
                    q[i].remainingfybudget = q[i].chunkbbud - q[i].chunkabud;
                    q[i].projectedeoybudget = q[i].todateactuals + (q[i].chunkbbud - q[i].chunkabud);

                    nlapiLogExecution('DEBUG','*******q[0]=', JSON.stringify(q[0].chunkabud));

                    everything.push({
                        'id'            : intid,
                        'sumaccount'    : '<b>'+q[i].account+'</b>', 
                        'detailaccount' : '',
                        'month'         : '', 
                        'location'      : '', 
                        'department'    : '',  
                        'totalbudget'   : parseFloat(q[i].chunkscombined ),  
                        'a'             : q[i].todateactuals, 
                        'b'             : q[i].chunkabud, 
                        'c'             : q[i].chunkbbud, 
                        'd'             : q[i].ytdvariance, 
                        'e'             : q[i].remaining, 
                        'f'             : q[i].remainingfybudget, 
                        'g'             : q[i].projectedeoybudget   
                    });

                    for(ii=0; ii<q[i].transactions.length; ii++){
                        intid = intid +1
                        everything.push( {
                            'id'         : intid,
                            'sumaccount'    : '',
                            'detailaccount'    : q[i].transactions[ii].account , 
                            'month'      : q[i].transactions[ii].month, 
                            'location'   : q[i].transactions[ii].loc, 
                            'department' : q[i].transactions[ii].dep, 
                            'totalbudget': parseFloat(q[i].transactions[ii].budget),  
                            'a'          : q[i].transactions[ii].amount, 
                            'b'          : '',
                            'c'          : '',
                            'd'          : '',
                            'e'          : '',
                            'f'          : '',
                            'g'          : '' 
                        });

                    }

                }
                








                nlapiLogExecution('DEBUG','######-q[6]', JSON.stringify(q[5]) );

                nlapiLogExecution('DEBUG','q='+q.length+' o='+output.length, ' ' );


                list.addRows( everything );
                response.writePage(list);
                //response.writePage(list);

            }





































// **************************************************************  YTD  **********************************************************************************


            // combine account, loc, dep, YTD totals
            // add budget year total, 
        if (displaytype == 'YTD'){

            var yr=' 2018';
            //var lastmonth = 1;
            for (var i=0; i < transonly.length; i++)
            {
                if ( transonly[i].month == 'Jan'+yr ){ transonly[i].monthvalue = 1 }  
                if ( transonly[i].month == 'Feb'+yr ){ transonly[i].monthvalue = 2 }
                if ( transonly[i].month == 'Mar'+yr ){ transonly[i].monthvalue = 3 }
                if ( transonly[i].month == 'Apr'+yr ){ transonly[i].monthvalue = 4 }
                if ( transonly[i].month == 'May'+yr ){ transonly[i].monthvalue = 5 }
                if ( transonly[i].month == 'Jun'+yr ){ transonly[i].monthvalue = 6 }
                if ( transonly[i].month == 'Jul'+yr ){ transonly[i].monthvalue = 7 }  
                if ( transonly[i].month == 'Aug'+yr ){ transonly[i].monthvalue = 8 }
                if ( transonly[i].month == 'Sep'+yr ){ transonly[i].monthvalue = 9 }
                if ( transonly[i].month == 'Oct'+yr ){ transonly[i].monthvalue = 10 }
                if ( transonly[i].month == 'Nov'+yr ){ transonly[i].monthvalue = 11 }
                if ( transonly[i].month == 'Dec'+yr ){ transonly[i].monthvalue = 12 }
            }

            // sort desc last = last month
            transonly = _.sortBy(transonly, ['monthvalue']);

            //last transaction month
            //lastmonth = transonly[transonly.length-1].monthvalue;

            var results = [];
            var testarr = [];
            var transamountarr = [];
            for (var i=0; i< transonly.length; i++)
            {                // add all assoc. budget months to trans
                //transonly[i].push () 
                //testarr[i] = _.uniqBy(_.filter(budsonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep }), function (e) {return e.id; }) 
                testarr[i] = _.filter(budsonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep });
                transamountarr[i] = _.filter(transonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep });

                if (testarr[i].length > 0){
                    for(z=0; z<testarr[i].length; z++ )
                    {
                        if(testarr[i][z].month == 'Jan'+yr){ transonly[i].budget1 = parseFloat(testarr[i][z].amount) ; } 
                        if(testarr[i][z].month == 'Feb'+yr){ transonly[i].budget2 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Mar'+yr){ transonly[i].budget3 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Apr'+yr){ transonly[i].budget4 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'May'+yr){ transonly[i].budget5 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Jun'+yr){ transonly[i].budget6 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Jul'+yr){ transonly[i].budget7 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Aug'+yr){ transonly[i].budget8 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Sep'+yr){ transonly[i].budget9 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Oct'+yr){ transonly[i].budget10 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Nov'+yr){ transonly[i].budget11 = parseFloat(testarr[i][z].amount); } 
                        if(testarr[i][z].month == 'Dec'+yr){ transonly[i].budget12 = parseFloat(testarr[i][z].amount); } 
                        if ( transonly[i].month == testarr[i][z].month ){ transonly[i].budgetmonthamount = parseFloat(testarr[i][z].amount); }
                        //transonly[i].budgetmonthamount = testarr[i][z].amount;
                    }
                }

                if (transamountarr[i].length > 0)
                {
                    for(z=0; z<transamountarr[i].length; z++ )
                    {
                        if(transamountarr[i][z].month == 'Jan'+yr){ transonly[i].tranamount1 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Feb'+yr){ transonly[i].tranamount2 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Mar'+yr){ transonly[i].tranamount3 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Apr'+yr){ transonly[i].tranamount4 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'May'+yr){ transonly[i].tranamount5 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Jun'+yr){ transonly[i].tranamount6 = parseFloat(transamountarr[i][z].amount); }
                        if(transamountarr[i][z].month == 'Jul'+yr){ transonly[i].tranamount7 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Aug'+yr){ transonly[i].tranamount8 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Sep'+yr){ transonly[i].tranamount9 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Oct'+yr){ transonly[i].tranamount10 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Nov'+yr){ transonly[i].tranamount11 = parseFloat(transamountarr[i][z].amount); } 
                        if(transamountarr[i][z].month == 'Dec'+yr){ transonly[i].tranamount12 = parseFloat(transamountarr[i][z].amount); } 
                    }
                }

                //make nulls 0s
                if(transonly[i].budget1 == null){transonly[i].budget1 = 0}
                if(transonly[i].budget2 == null){transonly[i].budget2 = 0}
                if(transonly[i].budget3 == null){transonly[i].budget3 = 0}
                if(transonly[i].budget4 == null){transonly[i].budget4 = 0}
                if(transonly[i].budget5 == null){transonly[i].budget5 = 0}
                if(transonly[i].budget6 == null){transonly[i].budget6 = 0}
                if(transonly[i].budget7 == null){transonly[i].budget7 = 0}
                if(transonly[i].budget8 == null){transonly[i].budget8 = 0}
                if(transonly[i].budget9 == null){transonly[i].budget9 = 0}
                if(transonly[i].budget10 == null){transonly[i].budget10 = 0}
                if(transonly[i].budget11 == null){transonly[i].budget11 = 0}
                if(transonly[i].budget12 == null){transonly[i].budget12 = 0}

                if(transonly[i].tranamount1 == null){transonly[i].tranamount1 = 0}
                if(transonly[i].tranamount2 == null){transonly[i].tranamount2 = 0}
                if(transonly[i].tranamount3 == null){transonly[i].tranamount3 = 0}
                if(transonly[i].tranamount4 == null){transonly[i].tranamount4 = 0}
                if(transonly[i].tranamount5 == null){transonly[i].tranamount5 = 0}
                if(transonly[i].tranamount6 == null){transonly[i].tranamount6 = 0}
                if(transonly[i].tranamount7 == null){transonly[i].tranamount7 = 0}
                if(transonly[i].tranamount8 == null){transonly[i].tranamount8 = 0}
                if(transonly[i].tranamount9 == null){transonly[i].tranamount9 = 0}
                if(transonly[i].tranamount10 == null){transonly[i].tranamount10 = 0}
                if(transonly[i].tranamount11 == null){transonly[i].tranamount11 = 0}
                if(transonly[i].tranamount12 == null){transonly[i].tranamount12 = 0}



                transonly[i].combinedbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3 + transonly[i].budget4 + transonly[i].budget5 + transonly[i].budget6 + transonly[i].budget7 + transonly[i].budget8 + transonly[i].budget9 + transonly[i].budget10 + transonly[i].budget11 + transonly[i].budget12; 
                transonly[i].combinedtran = transonly[i].tranamount1 + transonly[i].tranamount2 + transonly[i].tranamount3 + transonly[i].tranamount4 + transonly[i].tranamount5 + transonly[i].tranamount6 + transonly[i].tranamount7 +transonly[i].tranamount8 + transonly[i].tranamount9 + transonly[i].tranamount10 + transonly[i].tranamount11 + transonly[i].tranamount12;


                // here I can chunk up both budget and tranamount using lastmonth var


                switch(lastmonth)
                {
                    case 1:
                    transonly[i].achunkbudget = transonly[i].budget1;
                    transonly[i].achunktran   = transonly[i].tranamount1;
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 2:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 3:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 4:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 5:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 6:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;
                    
                    case 7:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 8:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 9:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 10:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 11:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10+ transonly[i].budget11
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10+transonly[i].tranamount11
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;

                    case 12:
                    transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10+ transonly[i].budget11+ transonly[i].budget12
                    transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10+transonly[i].tranamount11+transonly[i].tranamount12
                    transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                    transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                    break;
                }


                results.push({
                    "a" :   transonly[i].account , 
                    "b" :   transonly[i].loc, 
                    "c" :   transonly[i].dep, 
                    "d" :   transonly[i].combinedtran, 
                    "e" :   transonly[i].achunkbudget,                                  //YTD Budget Amount
                    "f" :   transonly[i].combinedtran - transonly[i].achunkbudget,      //YTD Budget Variance
                    "g" :   transonly[i].bchunkbudget,                                  //Remaining FY Budget
                    "h" :   transonly[i].bchunkbudget + transonly[i].combinedtran,       //Projected EOY Budget
                    "i" :   transonly[i].combinedbudget
                });


                //uniquematches[i] = _.uniqBy(matches[i], function (e) {return e.id; });
            }



                // LIST
                list.setStyle(request.getParameter('style'));


                list.addButton('custpage_export_button', 'Export to CSV', 'exportCsv()');
                function exportCsv() { window.location += '&export=T'; }
                if(request.getParameter('export') == 'T')
                {
                    var csv = results; // run the search, and store the comma-delimited results in this variable
                    response.writePage(csv);
                    return;
                }

                var column = list.addColumn('a', 'text', 'Account', 'left');
                //column.setURL(nlapiResolveURL('RECORD','salesorder'));
                //column.addParamToURL('id','id', true);
            
                //list.addColumn('b', 'date', 'Month', 'left');
                list.addColumn('b', 'text', 'Location', 'left');
                list.addColumn('c', 'text', 'Department', 'left');
                list.addColumn('d', 'currency', 'YTD Transaction Amounts', 'right');
                list.addColumn('e', 'currency', 'YTD Budget Amount', 'right');
                list.addColumn('f', 'currency', 'YTD Budget Variance', 'right');
                list.addColumn('g', 'currency', 'Remaining FY Budget', 'right');
                list.addColumn('h', 'currency', 'Projected EOY Budget', 'right');   //col e + h
                list.addColumn('i', 'currency', 'Total Budget for '+yr+' Year', 'right');
                //list.addColumn('h', 'currency', 'Projected EOY Budget', 'right');  //to dat trans amount + remaining budget


                
                list.addRows( results );
                response.writePage(list);
                // END LIST
        }

            



       




























// **************************************************************   YTD SUM   **********************************************************************************






            if (displaytype == 'YTDsum'){

                var yr=' 2018';
                //var lastmonth = 1;
                for (var i=0; i < transonly.length; i++)
                {
                    if ( transonly[i].month == 'Jan'+yr ){ transonly[i].monthvalue = 1 }  
                    if ( transonly[i].month == 'Feb'+yr ){ transonly[i].monthvalue = 2 }
                    if ( transonly[i].month == 'Mar'+yr ){ transonly[i].monthvalue = 3 }
                    if ( transonly[i].month == 'Apr'+yr ){ transonly[i].monthvalue = 4 }
                    if ( transonly[i].month == 'May'+yr ){ transonly[i].monthvalue = 5 }
                    if ( transonly[i].month == 'Jun'+yr ){ transonly[i].monthvalue = 6 }
                    if ( transonly[i].month == 'Jul'+yr ){ transonly[i].monthvalue = 7 }  
                    if ( transonly[i].month == 'Aug'+yr ){ transonly[i].monthvalue = 8 }
                    if ( transonly[i].month == 'Sep'+yr ){ transonly[i].monthvalue = 9 }
                    if ( transonly[i].month == 'Oct'+yr ){ transonly[i].monthvalue = 10 }
                    if ( transonly[i].month == 'Nov'+yr ){ transonly[i].monthvalue = 11 }
                    if ( transonly[i].month == 'Dec'+yr ){ transonly[i].monthvalue = 12 }
                }
    
                // sort desc last = last month
                transonly = _.sortBy(transonly, ['monthvalue']);
    
                //last transaction month
                //lastmonth = transonly[transonly.length-1].monthvalue;
    
                var results = [];
                var testarr = [];
                var transamountarr = [];
                for (var i=0; i< transonly.length; i++){                // add all assoc. budget months to trans
                    //transonly[i].push () 
                    //testarr[i] = _.uniqBy(_.filter(budsonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep }), function (e) {return e.id; }) 
                    testarr[i] = _.filter(budsonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep });
                    transamountarr[i] = _.filter(transonly, {'account': transonly[i].account, 'loc': transonly[i].loc, 'dep': transonly[i].dep });
    
                    if (testarr[i].length > 0){
                        for(z=0; z<testarr[i].length; z++ ){
                            if(testarr[i][z].month == 'Jan'+yr){ transonly[i].budget1 = parseFloat(testarr[i][z].amount) ; } 
                            if(testarr[i][z].month == 'Feb'+yr){ transonly[i].budget2 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Mar'+yr){ transonly[i].budget3 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Apr'+yr){ transonly[i].budget4 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'May'+yr){ transonly[i].budget5 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Jun'+yr){ transonly[i].budget6 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Jul'+yr){ transonly[i].budget7 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Aug'+yr){ transonly[i].budget8 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Sep'+yr){ transonly[i].budget9 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Oct'+yr){ transonly[i].budget10 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Nov'+yr){ transonly[i].budget11 = parseFloat(testarr[i][z].amount); } 
                            if(testarr[i][z].month == 'Dec'+yr){ transonly[i].budget12 = parseFloat(testarr[i][z].amount); } 
                            if ( transonly[i].month == testarr[i][z].month ){ transonly[i].budgetmonthamount = parseFloat(testarr[i][z].amount); }
                            //transonly[i].budgetmonthamount = testarr[i][z].amount;
                        }
                    }
    
                    if (transamountarr[i].length > 0){
                        for(z=0; z<transamountarr[i].length; z++ ){
                            if(transamountarr[i][z].month == 'Jan'+yr){ transonly[i].tranamount1 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Feb'+yr){ transonly[i].tranamount2 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Mar'+yr){ transonly[i].tranamount3 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Apr'+yr){ transonly[i].tranamount4 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'May'+yr){ transonly[i].tranamount5 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Jun'+yr){ transonly[i].tranamount6 = parseFloat(transamountarr[i][z].amount); }
                            if(transamountarr[i][z].month == 'Jul'+yr){ transonly[i].tranamount7 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Aug'+yr){ transonly[i].tranamount8 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Sep'+yr){ transonly[i].tranamount9 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Oct'+yr){ transonly[i].tranamount10 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Nov'+yr){ transonly[i].tranamount11 = parseFloat(transamountarr[i][z].amount); } 
                            if(transamountarr[i][z].month == 'Dec'+yr){ transonly[i].tranamount12 = parseFloat(transamountarr[i][z].amount); } 
                        }
                    }
    
                    //make nulls 0s
                    if(transonly[i].budget1 == null){transonly[i].budget1 = 0}
                    if(transonly[i].budget2 == null){transonly[i].budget2 = 0}
                    if(transonly[i].budget3 == null){transonly[i].budget3 = 0}
                    if(transonly[i].budget4 == null){transonly[i].budget4 = 0}
                    if(transonly[i].budget5 == null){transonly[i].budget5 = 0}
                    if(transonly[i].budget6 == null){transonly[i].budget6 = 0}
                    if(transonly[i].budget7 == null){transonly[i].budget7 = 0}
                    if(transonly[i].budget8 == null){transonly[i].budget8 = 0}
                    if(transonly[i].budget9 == null){transonly[i].budget9 = 0}
                    if(transonly[i].budget10 == null){transonly[i].budget10 = 0}
                    if(transonly[i].budget11 == null){transonly[i].budget11 = 0}
                    if(transonly[i].budget12 == null){transonly[i].budget12 = 0}
    
                    if(transonly[i].tranamount1 == null){transonly[i].tranamount1 = 0}
                    if(transonly[i].tranamount2 == null){transonly[i].tranamount2 = 0}
                    if(transonly[i].tranamount3 == null){transonly[i].tranamount3 = 0}
                    if(transonly[i].tranamount4 == null){transonly[i].tranamount4 = 0}
                    if(transonly[i].tranamount5 == null){transonly[i].tranamount5 = 0}
                    if(transonly[i].tranamount6 == null){transonly[i].tranamount6 = 0}
                    if(transonly[i].tranamount7 == null){transonly[i].tranamount7 = 0}
                    if(transonly[i].tranamount8 == null){transonly[i].tranamount8 = 0}
                    if(transonly[i].tranamount9 == null){transonly[i].tranamount9 = 0}
                    if(transonly[i].tranamount10 == null){transonly[i].tranamount10 = 0}
                    if(transonly[i].tranamount11 == null){transonly[i].tranamount11 = 0}
                    if(transonly[i].tranamount12 == null){transonly[i].tranamount12 = 0}
    
    
    
                    transonly[i].combinedbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3 + transonly[i].budget4 + transonly[i].budget5 + transonly[i].budget6 + transonly[i].budget7 + transonly[i].budget8 + transonly[i].budget9 + transonly[i].budget10 + transonly[i].budget11 + transonly[i].budget12; 
                    transonly[i].combinedtran = transonly[i].tranamount1 + transonly[i].tranamount2 + transonly[i].tranamount3 + transonly[i].tranamount4 + transonly[i].tranamount5 + transonly[i].tranamount6 + transonly[i].tranamount7 +transonly[i].tranamount8 + transonly[i].tranamount9 + transonly[i].tranamount10 + transonly[i].tranamount11 + transonly[i].tranamount12;
    
    
                    // here I can chunk up both budget and tranamount using lastmonth var
    
    
                    switch(lastmonth){
                        case 1:
                        transonly[i].achunkbudget = transonly[i].budget1;
                        transonly[i].achunktran   = transonly[i].tranamount1;
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 2:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 3:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 4:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 5:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 6:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
                        
                        case 7:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 8:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 9:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 10:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 11:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10+ transonly[i].budget11
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10+transonly[i].tranamount11
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
    
                        case 12:
                        transonly[i].achunkbudget = transonly[i].budget1 + transonly[i].budget2 + transonly[i].budget3+ transonly[i].budget4+ transonly[i].budget5+ transonly[i].budget6+ transonly[i].budget7+ transonly[i].budget8+ transonly[i].budget9+ transonly[i].budget10+ transonly[i].budget11+ transonly[i].budget12
                        transonly[i].achunktran   = transonly[i].tranamount1 +transonly[i].tranamount2+transonly[i].tranamount3 +transonly[i].tranamount4+transonly[i].tranamount5 +transonly[i].tranamount6+transonly[i].tranamount7+transonly[i].tranamount8+transonly[i].tranamount9+transonly[i].tranamount10+transonly[i].tranamount11+transonly[i].tranamount12
                        transonly[i].bchunkbudget = transonly[i].combinedbudget - transonly[i].achunkbudget;
                        transonly[i].bchunktran   = transonly[i].combinedtran - transonly[i].achunktran;
                        break;
                    }
    



    
                    results.push({
                        "account" :   transonly[i].account , 
                        "combinedtran" :   transonly[i].combinedtran, 
                        "achunk" :   transonly[i].achunkbudget,                                  //YTD Budget Amount
                        "variance" :    transonly[i].achunkbudget - transonly[i].combinedtran,      //YTD Budget Variance
                        "bchunk" :   transonly[i].bchunkbudget,                                  //Remaining FY Budget
                        "eoy" :   transonly[i].bchunkbudget + transonly[i].combinedtran       //Projected EOY Budget
                    });
    
    
                    //uniquematches[i] = _.uniqBy(matches[i], function (e) {return e.id; });
                }


                nlapiLogExecution('DEBUG','results', JSON.stringify(results) );


                    // combine like Account, Dep, Loc
                    sumcombinedtran = 0;
                    sumachunk = 0;
                    sumvariance = 0;
                    sumbchunk = 0;
                    sumeoy = 0;
                    sumresults = [];
                    totalincome = 0;
                    totalincomeb = 0;
                    totalincomec = 0;
                    totalincomed = 0;
                    totalincomee = 0;
                    totalincomesum = 0;
                    totalcogsa = 0;
                    totalcogsb = 0;
                    totalcogsc = 0;
                    totalcogsd = 0;
                    totalcogse = 0;
                    totalcogssum = 0;
                    totalexpense = 0;
                    totalexpenseb = 0;
                    totalexpensec = 0;
                    totalexpensed = 0;
                    totalexpensee = 0;
                    totalexpensesum = 0;
                    totalnetincomea = 0;
                    totalnetincomeb = 0;
                    totalnetincomec = 0;
                    totalnetincomed = 0;
                    totalnetincomee = 0;
                    totalnetincomesum = 0;
                    sumremaining = 0 ;
    
                    var fg = _.groupBy(results, 'account');
                    var eachfg = _.map(fg, fg.account);
    
                    for(var i=0; i<eachfg.length; i++){
                        for(var z=0; z<eachfg[i].length; z++){
                            sumcombinedtran = sumcombinedtran + parseFloat( eachfg[i][z].combinedtran ) ;
                            sumachunk = sumachunk + parseFloat( eachfg[i][z].achunk ) ;
                            sumvariance = sumvariance + parseFloat( eachfg[i][z].variance ) ;
                            sumbchunk = sumbchunk + parseFloat( eachfg[i][z].bchunk ) ;
                            sumremaining = sumbchunk - sumcombinedtran;
                            sumeoy = sumeoy + parseFloat( eachfg[i][z].eoy ) ;

                            //sumbudget = sumbudget + parseFloat( eachfg[i][z].budget ) ;
                            //sumdifference= sumdifference + parseFloat( eachfg[i][z].difference ) ;
                        }
                        sumresults.push({
                            account : eachfg[i][0].account,
                            sumcombinedtran : sumcombinedtran.toFixed(2),
                            
                            sumachunk : sumachunk.toFixed(2),
                            sumbchunk : sumbchunk.toFixed(2),
                            sumvariance : sumvariance.toFixed(2),
                            sumremaining : sumremaining.toFixed(2),
                            sumeoy : sumeoy.toFixed(2)
                        })
                        //sum up by income & expense
                        // income
                        if( parseInt(sumresults[i].account[0]) <= 5 ){  
                            totalincome = totalincome +   parseFloat( sumresults[i].sumcombinedtran);
                            
                            totalincomec = totalincomec + parseFloat( sumresults[i].sumachunk); 
                            totalincomed = totalincomed + parseFloat( sumresults[i].sumbchunk); 
                            totalincomeb = totalincomeb + parseFloat( sumresults[i].sumvariance); 
                            totalincomesum = totalincomesum + parseFloat( sumresults[i].sumremaining); 
                            totalincomee = totalincomee + parseFloat( sumresults[i].sumeoy); 
                        }

                        //expense
                        if( parseInt(sumresults[i].account[0]) > 6 ){  
                            totalexpense = totalexpense +   parseFloat( sumresults[i].sumcombinedtran); 
                            totalexpensec = totalexpensec + parseFloat( sumresults[i].sumachunk); 
                            totalexpensed = totalexpensed + parseFloat( sumresults[i].sumbchunk); 
                            totalexpenseb = totalexpenseb + parseFloat( sumresults[i].sumvariance); 
                            totalexpensesum = totalexpensesum + parseFloat( sumresults[i].sumremaining); 
                            totalexpensee = totalexpensee + parseFloat( sumresults[i].sumeoy); 
                        }

                        //COGS
                        if( parseInt(sumresults[i].account[0]) == 6 ){  
                            totalcogsa = totalcogsa +   parseFloat( sumresults[i].sumcombinedtran); 
                            totalcogsb = totalcogsb + parseFloat( sumresults[i].sumvariance); 
                            totalcogsc = totalcogsc + parseFloat( sumresults[i].sumachunk); 
                            totalcogsd = totalcogsd + parseFloat( sumresults[i].sumbchunk); 
                            totalcogssum = totalcogssum + parseFloat( sumresults[i].sumremaining); 
                            totalcogse = totalcogse + parseFloat( sumresults[i].sumeoy); 
                        }
    
                    }


                nlapiLogExecution('DEBUG','sumresults', JSON.stringify(sumresults) );





                var totalcombinedtran = 0;
                var totalvariance = 0;
                var totalachunk = 0;
                var totalbchunk = 0;
                var totaleoy = 0;
                var totalsum = 0;

                for(var i=0; i<sumresults.length; i++){
                    totalcombinedtran = totalcombinedtran + parseFloat( sumresults[i].sumcombinedtran );
                    totalvariance = totalvariance + parseFloat( sumresults[i].sumvariance );
                    totalachunk = totalachunk + parseFloat( sumresults[i].sumachunk );
                    totalbchunk = totalbchunk + parseFloat( sumresults[i].sumbchunk );
                    totaleoy = totaleoy + parseFloat( sumresults[i].sumeoy );
                    totalsum = totalsum + parseFloat( sumresults[i].sumremaining );
                }

                grossprofita = totalincome - totalcogsa;
                grossprofitb = totalincomeb - totalcogsb;
                grossprofitc = totalincomec - totalcogsc;
                grossprofitd = totalincomed - totalcogsd;
                grossprofite = totalincomee - totalcogse;
                grossprofitsum = grossprofitb - grossprofita;

                totalnetincomea = grossprofita - totalexpense;
                totalnetincomeb = grossprofitb - totalexpenseb;
                totalnetincomec = grossprofitc - totalexpensec;
                totalnetincomed = grossprofitd - totalexpensed;
                totalnetincomee = grossprofite - totalexpensee;
                totalnetincomesum = totalnetincomeb - totalnetincomea;


                sumresults.push({
                    account : '<b>Total Gross Profits</b>',
                    sumcombinedtran :   grossprofita.toFixed(2),
                    sumachunk :         grossprofitc.toFixed(2),
                    sumbchunk :         grossprofitd.toFixed(2),
                    sumvariance :       grossprofitb.toFixed(2),
                    sumremaining    :   grossprofitsum.toFixed(2),
                    sumeoy :            grossprofite.toFixed(2)
                });
                //gross profit - expenses
                sumresults.push({
                    account : '<b>Total Net Income</b>',
                    sumcombinedtran :   totalnetincomea.toFixed(2),
                    sumachunk :         totalnetincomec.toFixed(2),
                    sumbchunk :         totalnetincomed.toFixed(2),
                    sumvariance :       totalnetincomeb.toFixed(2),
                    sumremaining    :   totalnetincomesum.toFixed(2),
                    sumeoy :            totalnetincomee.toFixed(2)
                });

                sumresults.push({
                    account : '<b>Total Income</b>',
                    sumcombinedtran :   totalincome.toFixed(2),
                    sumachunk :         totalincomec.toFixed(2),
                    sumbchunk :         totalincomed.toFixed(2),
                    sumvariance :       totalincomeb.toFixed(2),
                    sumremaining    :   totalincomesum.toFixed(2),
                    sumeoy :            totalincomee.toFixed(2)
                });
                sumresults.push({
                    account : '<b>Total Expense</b>',
                    sumcombinedtran :   totalexpense.toFixed(2),
                    sumachunk :         totalexpensec.toFixed(2),
                    sumbchunk :         totalexpensed.toFixed(2),
                    sumvariance :       totalexpenseb.toFixed(2),
                    sumremaining    :   totalexpensesum.toFixed(2),
                    sumeoy :            totalexpensee.toFixed(2)
                });

                sumresults.push({
                    account : '<b>TOTAL</b>',
                    sumcombinedtran : totalcombinedtran.toFixed(2),
                    sumachunk : totalachunk.toFixed(2),
                    sumbchunk : totalbchunk.toFixed(2),
                    sumvariance : totalvariance.toFixed(2),
                    sumremaining    :   totalsum.toFixed(2),
                    sumeoy : totaleoy.toFixed(2)
                });
                //sumcombinedtran : '<b>'+totalcombinedtran.toFixed(2)+'</b>',
                //sumvariance : '<b>'+totalvariance.toFixed(2)+'</b>',
                //sumachunk : '<b>'+totalachunk.toFixed(2)+'</b>',
                //sumbchunk : '<b>'+totalbchunk.toFixed(2)+'</b>',
                //sumeoy : '<b>'+totaleoy.toFixed(2)+'</b>'
   
    
    

                    function exportCsv() 
                    {
                        //window.location += '&export=T'; 
                        var yourScriptType = 'SCRIPTLET';	//****** put your script type  ******
                        var folderID = 335;			        //****** put your file cabinet csv folder id ******
                        var data = ['a','b','c\n','1234'];
                        var csvContent = "";
                        data.forEach(function(infoArray, index){
                            dataString = infoArray.join(",");
                            csvContent += index < data.length ? dataString+ "\n" : dataString;
                        });
                        var file = nlapiCreateFile(jrec.scripttype.name+".csv", 'CSV', csvContent);
                        file.setFolder(folderID);
                        var fileId= nlapiSubmitFile(file)
                    }

                    if(request.getParameter('export') == 'T')
                    {
                        var csv = results; // run the search, and store the comma-delimited results in this variable
                        response.writePage(csv);
                        return;
                    }

                    // LIST
                    list.setStyle(request.getParameter('style'));
    
                    list.addButton('custpage_export_button', 'Export to CSV', 'exportCsv');





                    /*
                    var searchresult = nlapiSearchRecord('script',null,idoc_filters,idoc_columns);
                    var data = [];
                    var header =["Name","Script ID","Script Type","Owner","ID","Inactive?"];
                    data.push(header);
                    for(var x = 0;x<searchresult.length;x++){

                    var rec = nlapiLoadRecord('script',searchresult[x].getId());
                    var jrec= JSON.parse(JSON.stringify(rec));

                    var row = [];
                    row.push((!!rec.getFieldValue('name'))?rec.getFieldValue('name'):"");
                    row.push((!!rec.getFieldValue('scriptid'))?rec.getFieldValue('scriptid'):"");
                    row.push((!!jrec.scripttype.name)?jrec.scripttype.name:"");
                    row.push((!!rec.getFieldText('owner'))?rec.getFieldText('owner'):"");
                    row.push(rec.getId());
                    data.push(row)
                    }
                    }*/
























    

                    if (lastmonth == 1){amnth='Jan'}
                    if (lastmonth == 2){amnth='Feb'}
                    if (lastmonth == 3){amnth='Mar'}
                    if (lastmonth == 4){amnth='Apr'}
                    if (lastmonth == 5){amnth='May'}
                    if (lastmonth == 6){amnth='Jun'}
                    if (lastmonth == 7){amnth='Jul'}
                    if (lastmonth == 8){amnth='Aug'}
                    if (lastmonth == 9){amnth='Sep'}
                    if (lastmonth == 10){amnth='Oct'}
                    if (lastmonth == 11){amnth='Nov'}
                    if (lastmonth == 12){amnth='Dec'}

                    //if (lastmonth == 1){bmnth='Jan'}
                    if (lastmonth == 1){bmnth='Feb'}
                    if (lastmonth == 2){bmnth='Mar'}
                    if (lastmonth == 3){bmnth='Apr'}
                    if (lastmonth == 4){bmnth='May'}
                    if (lastmonth == 5){bmnth='Jun'}
                    if (lastmonth == 6){bmnth='Jul'}
                    if (lastmonth == 7){bmnth='Aug'}
                    if (lastmonth == 8){bmnth='Sep'}
                    if (lastmonth == 9){bmnth='Oct'}
                    if (lastmonth == 10){bmnth='Nov'}
                    if (lastmonth == 11){bmnth='Dec'}
                    if (lastmonth == 12){bmnth='N/A'}



                    var column = list.addColumn('account', 'text', 'Account', 'left');
                    //column.setURL(nlapiResolveURL('RECORD','salesorder'));
                    //column.addParamToURL('id','id', true);
                
                    //list.addColumn('b', 'date', 'Month', 'left');
                    //list.addColumn('b', 'text', 'Location', 'left');
                    //list.addColumn('c', 'text', 'Department', 'left');
                    list.addColumn('sumcombinedtran', 'currency', 'A. YTD Transaction Amounts', 'right');
                    list.addColumn('sumachunk', 'currency', 'B. YTD Budget Amount \n (Jan-'+amnth+')', 'right');
                    list.addColumn('sumbchunk', 'currency', 'C. Remaining FY Budget\n ('+bmnth+'-Dec)', 'right');
                    list.addColumn('sumvariance', 'currency', 'D. YTD Budget Variance (B-A)', 'right');
                    list.addColumn('sumremaining', 'currency', 'E. Remaining (C-A)', 'right');
                    list.addColumn('sumeoy', 'currency', 'F. Projected EOY Budget', 'right');   //col e + h
                    //list.addColumn('i', 'currency', 'Total Budget for '+yr+' Year', 'right');
                    //list.addColumn('h', 'currency', 'Projected EOY Budget', 'right');  //to dat trans amount + remaining budget
    
    
                    
                    list.addRows( sumresults );

                    response.writePage(list);
                    // END LIST
            }
    


            

    }catch(e){
        nlapiLogExecution('ERROR','err',e.message);
    }



















        //var sublist = form.addSubList('sublist','inlineeditor', 'Inline Editor Sublist');
        //sublist.addField('sublist1', 'date', 'Date');
        //sublist.addField('sublist2', 'text', 'Text');


        //response.writePage(form);
        response.writePage(list);
        //response.write(allJSONdata);

    }

} //end func





