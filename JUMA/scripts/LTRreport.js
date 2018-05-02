// Suitelet
// SS1.0    rBender@sdmayer.com     3/20/2018
//
// This is attempt to modularize and cleanup the JUMA LTR report
//

function sdm_report(request, response){
	if (request.getMethod() == 'GET' ){     // this should be where u choose the FY and Budget Category
            GET_request_page();
            //nlapiLogExecution('ERROR','err',e.message);
    }    
        else //if (request.getMethod() == 'POST') // POST     // this is where we would display the HTML table
    {        //POST_request_page();
        nlapiLogExecution('DEBUG','response','unformatted lastmonth='+request.getParameter('custpage_selectmonth' ) );
        var displayfy = request.getParameter('custpage_selectfield' );      // FY2018
        var displaytype = request.getParameter('custpage_selectdisplay' );  // monthly
        var lastmonth = parseFloat( request.getParameter('custpage_selectmonth' ) );  // last month
        nlapiLogExecution('DEBUG','response',displayfy + ' - '+displaytype + ' lastmonth='+lastmonth);

    
        //lastmonth = 1
        yr = ' 2018';   

        //get the 2018-1 budget by month
        var allbuds = [];
        allbuds = search_2018_1_budget_v3(allbuds,lastmonth,yr);
        nlapiLogExecution('DEBUG','allbuds[0] L='+allbuds.length, JSON.stringify( allbuds[0]) );


        //get all of the 2018 transactions
        var alltrx = [];
        alltrx = search_2018_1_transactions_v2(alltrx,lastmonth,yr);  //this needs to updated to get > 1000 results
        nlapiLogExecution('DEBUG','alltrx[0] L='+alltrx.length, JSON.stringify( alltrx[0]) );


        // map budgets to transactions
        var everything = [];
        everything = add_bud_chunks_to_trx(alltrx, allbuds);
        nlapiLogExecution('DEBUG','everything[0] L='+everything.length, JSON.stringify( everything[0]) );

        // group so theres a summary for each account
        everything = group_matches_by_account(everything);

        // add cols & print report
        addcolumnsandprintlist(everything, lastmonth, displaytype);


        var stopper=1;

    }

}
















    function GET_request_page(){
        var form = nlapiCreateForm("SDM - LTR Transaction Budget Report" );

        //form.setFieldValues('(Report may take more than 10 seconds to load)');

        var selectFY = form.addField('custpage_selectfield','select', 'Select Budget Year');
        //select.addSelectOption('','');
        selectFY.addSelectOption('FY2018', 'FY 2018-1');
        //selectFY.addSelectOption('FY2017', 'FY 2017');

        var selectdisplay = form.addField('custpage_selectdisplay','select', 'Select Display Type');
        //select.addSelectOption('','');
        selectdisplay.addSelectOption('detail', 'Detail');
        selectdisplay.addSelectOption('summary', 'Summary');
        //selectdisplay.addSelectOption('YTD', 'YTD Detail');
        //selectdisplay.addSelectOption('monthly', 'Monthly');

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






    function POST_request_page(){
        nlapiLogExecution('DEBUG','response','unformatted lastmonth='+request.getParameter('custpage_selectmonth' ) );
        var displayfy = request.getParameter('custpage_selectfield' );      // FY2018
        var displaytype = request.getParameter('custpage_selectdisplay' );  // monthly
        var lastmonth = parseFloat( request.getParameter('custpage_selectmonth' ) );  // last month
        nlapiLogExecution('DEBUG','response',displayfy + ' - '+displaytype + ' lastmonth='+lastmonth);

    



        var allbuds = [];
        search_2018_1_budget(allbuds);

        
        var alltrx = [];
        search_2018_1_transactions(alltrx);


        var everything = [];
        everything.push(alltrx);

        // combine
        // calculate


        // add cols & print report
        addcolumnsandprintlist(everything);




    }
























    function search_2018_1_budget(allbuds){
        //2018-1
        var search = nlapiLoadSearch('customrecord56', 'customsearch321');
        var budgetsearch = nlapiSearchRecord('customrecord56', 'customsearch321');
        var searchresults = search.runSearch();
        var resultIndex = 0;
        var resultStep = 1000;
        var resultSet;
        var cols = budgetsearch[0].getAllColumns();

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
    }













    function search_2018_1_transactions(alltrx){

        var search = nlapiLoadSearch('transaction', 'customsearch313');
        var transearch = nlapiSearchRecord('transaction', 'customsearch313');
        var searchresults = search.runSearch();
        var resultIndex = 0;
        var resultStep = 1000;
        var resultSet;
        var cols = transearch[0].getAllColumns();
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

                alltrx.push( {
                    "account"   :   account,
                    "month"     :   month,
                    "amount"    :   amount,
                    "dep"       :   dep,
                    "loc"       :   loc
                } );

                var stoppr=1;
            }
        } while (resultSet.length > 0)

    }










function search_2018_1_transactions_v2(alltrx,lastmonth,yr){

    switch (lastmonth){
        case 1:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount} when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount}  when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;
        
        case 2:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Mar"+yr+"' then {amount} when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount}  when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 3:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount}  when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 4:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'May"+yr+"' then {amount}  when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 5:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 6:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Jul"+yr+"' then {amount} when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 7:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Aug"+yr+"' then {amount} when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 8:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount}  when {postingperiod} = 'Aug"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Sep"+yr+"' then {amount} when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 9:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount}  when {postingperiod} = 'Aug"+yr+"' then {amount}  when {postingperiod} = 'Sep"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Oct"+yr+"' then {amount} when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 10:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount}  when {postingperiod} = 'Aug"+yr+"' then {amount}  when {postingperiod} = 'Sep"+yr+"' then {amount}  when {postingperiod} = 'Oct"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Nov"+yr+"' then {amount} when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 11:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount}  when {postingperiod} = 'Aug"+yr+"' then {amount}  when {postingperiod} = 'Sep"+yr+"' then {amount}  when {postingperiod} = 'Oct"+yr+"' then {amount}  when {postingperiod} = 'Nov"+yr+"' then {amount} else 0 end";
            var chunkb = "case when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            break;

        case 12:
            var chunka = "case when {postingperiod} = 'Jan"+yr+"' then {amount} when {postingperiod} = 'Feb"+yr+"' then {amount} when {postingperiod} = 'Mar"+yr+"' then {amount}  when {postingperiod} = 'Apr"+yr+"' then {amount} when {postingperiod} = 'May"+yr+"' then {amount} when {postingperiod} = 'Jun"+yr+"' then {amount}  when {postingperiod} = 'Jul"+yr+"' then {amount}  when {postingperiod} = 'Aug"+yr+"' then {amount}  when {postingperiod} = 'Sep"+yr+"' then {amount}  when {postingperiod} = 'Oct"+yr+"' then {amount}  when {postingperiod} = 'Nov"+yr+"' then {amount}  when {postingperiod} = 'Dec"+yr+"' then {amount} else 0 end";
            var chunkb = "0";
            break;
    }



    var filters = [
        ["postingperiod","rel","TFY"], 
        "AND", 
        ["accounttype","anyof","Income","Expense","OthIncome","OthExpense","COGS"], 
        "AND", 
        ["department","anyof","@ALL@"], 
        "AND", 
        ["location","anyof","@ALL@"], 
        "AND", 
        ["class","anyof","@ALL@"]
    ];


    var columns = new Array();
    columns[0] = new nlobjSearchColumn("account",null,"GROUP").setSort(false);
    columns[1] = new nlobjSearchColumn("department",null,"GROUP");
    columns[2] = new nlobjSearchColumn("location",null,"GROUP");
    columns[3] = new nlobjSearchColumn("formulacurrency",null,"SUM").setFormula(chunka);
    columns[4] = new nlobjSearchColumn("formulacurrency",null,"SUM").setFormula(chunkb);
        

    var search = nlapiCreateSearch("transaction", filters, columns);
    

    //for(i=0; i< transactionSearch.length; i++){
        var results=search.runSearch();
        var res=results.getResults(0,1000);
        
        var alltrx = []
        for(i=0; i<res.length; i++){
            key = res[i].getText(columns[0])+res[i].getText(columns[1])+res[i].getText(columns[2]);
            alltrx.push({ 'account' :  res[i].getText(columns[0]), 
                           'dep' :  res[i].getText(columns[1]),
                           'loc' :  res[i].getText(columns[2]),
                           'chunka' :  parseFloat(res[i].getValue(columns[3])),
                           'chunkb' :  parseFloat(res[i].getValue(columns[4])),
                           'key'    :  key
            });
        }
        

        //var rcols = res.getColumns();
        //var a = rcols.getValue(hist_cols[1]);

    //}
    return alltrx;
    
}







function search_2018_1_budget_v3(allbuds,lastmonth,yr){

    var searchResult = nlapiSearchRecord('customrecord56', 'customsearch323');
    var cols = searchResult[0].getAllColumns();


    for ( var i = 0; searchResult != null && i < searchResult.length; i++ )
    {
        var searchResultRow = searchResult[i];
        var account = searchResultRow.getValue(cols[0]),
            dep = searchResultRow.getValue(cols[13]),
            loc = searchResultRow.getValue(cols[14]),
            jan = parseFloat( searchResultRow.getValue( cols[1] )),
            feb = parseFloat( searchResultRow.getValue( cols[2] )),
            mar = parseFloat( searchResultRow.getValue( cols[3] )),
            apr = parseFloat( searchResultRow.getValue( cols[4] )),
            may = parseFloat( searchResultRow.getValue( cols[5] )),
            jun = parseFloat( searchResultRow.getValue( cols[6] )),
            jul = parseFloat( searchResultRow.getValue( cols[7]) ),
            aug = parseFloat( searchResultRow.getValue( cols[8]) ),
            sep = parseFloat( searchResultRow.getValue( cols[9]) ),
            oct = parseFloat( searchResultRow.getValue( cols[10]) ),
            nov = parseFloat( searchResultRow.getValue( cols[11]) ),
            dec = parseFloat( searchResultRow.getValue( cols[12]) ),
            key = account+dep+loc;

            switch (lastmonth){
                case 1:
                    var chunka = jan
                    var chunkb = feb + mar + apr + may + jun + jul + aug + sep + oct + nov + dec
                    break;
                
                case 2:
                    var chunka = jan + feb
                    var chunkb = mar + apr + may + jun + jul + aug + sep + oct + nov + dec                    
                    break;
        
                case 3:
                    var chunka = jan + feb + mar
                    var chunkb = apr + may + jun + jul + aug + sep + oct + nov + dec                    
                    break;
        
                case 4:
                    var chunka = jan + feb + mar + apr
                    var chunkb = may + jun + jul + aug + sep + oct + nov + dec                    
                    break; 
        
                case 5:
                    var chunka = jan + feb + mar + apr + may
                    var chunkb = jun + jul + aug + sep + oct + nov + dec                    
                    break; 
        
                case 6:
                    var chunka = jan + feb + mar + apr + may + jun
                    var chunkb = jul + aug + sep + oct + nov + dec                    
                    break; 
        
                case 7:
                    var chunka = jan + feb + mar + apr + may + jun + jul
                    var chunkb = aug + sep + oct + nov + dec                    
                    break; 
        
                case 8:
                    var chunka = jan + feb + mar + apr + may + jun + jul + aug
                    var chunkb = sep + oct + nov + dec                    
                    break; 
        
                case 9:
                    var chunka = jan + feb + mar + apr + may + jun + jul + aug + sep
                    var chunkb = oct + nov + dec                    
                    break;
        
                case 10:
                    var chunka = jan + feb + mar + apr + may + jun + jul + aug + sep + oct
                    var chunkb = nov + dec                    
                    break;
        
                case 11:
                    var chunka = jan + feb + mar + apr + may + jun + jul + aug + sep + oct + nov
                    var chunkb = dec                    
                    break;
        
                case 12:
                    var chunka = jan + feb + mar + apr + may + jun + jul + aug + sep + oct + nov + dec
                    var chunkb = 0                    
                    break;
            }
            if (chunka == null){ chunka = 0; }
            if (chunkb == null){ chunkb = 0; }

        allbuds.push( {
            "account"   :   account,
            "chunkabud" :   chunka,
            "chunkbbud" :   chunkb,
            "dep"       :   dep,
            "loc"       :   loc,
            "key"       :   key
        } );
    }
    return allbuds;
}











function clean_up_allbuds(allbuds){


    var res = alasql('SELECT account, dep, loc, SUM(jan) AS jan, SUM(feb) AS feb, SUM(mar) AS mar, SUM(apr) AS apr, SUM(may) AS may, SUM(jun) AS jun, SUM(jul) AS jul, SUM(aug) AS aug, SUM(sep) AS sep, SUM(oct) AS oct, SUM(nov) AS nov, SUM(dec) AS dec FROM ? GROUP BY account, dep, loc',[allbuds]); 
    return res;
/*
    
    // create a key for every budget
    var a = _.forEach(allbuds, function(n){
        if(n.jan>0){ combo = 'jan' + n.jan};
        if(n.feb>0){ combo = 'feb' + n.feb};
        if(n.mar>0){ combo = 'mar' + n.mar};
        if(n.apr>0){ combo = 'apr' + n.apr};
        if(n.may>0){ combo = 'may' + n.may};
        if(n.jun>0){ combo = 'jun' + n.jun};
        if(n.jul>0){ combo = 'jul' + n.jul};
        if(n.aug>0){ combo = 'aug' + n.aug};
        if(n.sep>0){ combo = 'sep' + n.sep};
        if(n.oct>0){ combo = 'oct' + n.oct};
        if(n.nov>0){ combo = 'nov' + n.nov};
        if(n.dec>0){ combo = 'dec' + n.dec};
        n.key = n.account+n.dep+n.loc+combo } );

    //remove dupes    
    a = _.uniqBy(a, 'key')

    //for each group, combine the month values
    var c = _.groupBy(b, 'account')

    for(i=0; i<c.length; i++){

    }
*/

}




function chunks_for_allbuds(allbuds){

    for(i=0; i<allbuds.length; i++){

        switch (lastmonth){
            case 1:
                allbuds[i].chunka = allbuds[i].jan
                allbuds[i].chunkb = allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;
            
            case 2:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb
                allbuds[i].chunkb = allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 3:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar
                allbuds[i].chunkb = allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 4:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr
                allbuds[i].chunkb = allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 5:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may
                allbuds[i].chunkb = allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 6:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun
                allbuds[i].chunkb = allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 7:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul
                allbuds[i].chunkb = allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 8:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug
                allbuds[i].chunkb = allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 9:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep 
                allbuds[i].chunkb = allbuds[i].oct + allbuds[i].nov + allbuds[i].dec;
                break;

            case 10:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct
                allbuds[i].chunkb = allbuds[i].nov + allbuds[i].dec;
                break;

            case 11:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov
                allbuds[i].chunkb = allbuds[i].dec;
                break;

            case 12:
                allbuds[i].chunka = allbuds[i].jan + allbuds[i].feb + allbuds[i].mar + allbuds[i].apr + allbuds[i].may + allbuds[i].jun + allbuds[i].jul + allbuds[i].aug + allbuds[i].sep + allbuds[i].oct + allbuds[i].nov + allbuds[i].dec
                allbuds[i].chunkb = 0;
                break;
        }
    }
}



// includes the ones that dont have a budget
function add_bud_chunks_to_trx(alltrx, allbuds){
    keymatch=0;
    matches = [];
    for(i=0; i < alltrx.length; i++){
        for(ii=0; ii < allbuds.length; ii++){
            if( alltrx[i].key == allbuds[ii].key ){
                alltrx[i].budchunka = allbuds[ii].chunkabud;
                alltrx[i].budchunkb = allbuds[ii].chunkbbud;
                matches.push(alltrx[i]);
                keymatch = keymatch + 1;
                //nlapiLogExecution('DEBUG','key matched i='+i+' ii='+ii, alltrx[i].key+' == '+allbuds[ii].key );
            }
        }
    }
    // since only half matched, add the remaining that didn't witht their 0 budget
    for(i=0; i < alltrx.length; i++){
        if(alltrx[i].budchunka == null || alltrx[i].budchunkb == null){
            alltrx[i].budchunka = 0;
            alltrx[i].budchunkb = 0;
            matches.push(alltrx[i]);
        }
    }

    nlapiLogExecution('DEBUG','key matched', 'matches ='+keymatch+' out of '+ alltrx.length );
    return matches;
}




// this function finds the groups of unique accounts and adds the summary account
function group_matches_by_account(everything){
    var uniqueaccounts = [];
    var uniqueindex = [];

    /*
    //this can go away
    for(i=0; i < everything.length; i++){
        if(uniqueaccounts.indexOf(everything[i].account) === -1){
            //uniqueindex.push(i);
            uniqueaccounts.push({ 'account' : everything[i].account });        
        }        
    }
    nlapiLogExecution('DEBUG','uniqueaccounts[0] & [1]',JSON.stringify(uniqueaccounts[0] + ' \n '+ uniqueaccounts[1]) );
    */

    //create array of the unique indexes
    var uaccount = everything[0].account 
    var adder = 0;
    var uniquechunka=0;
    var uniquechunkb=0;
    var uniquebudchunka=0;
    var uniquebudchunkb=0;
    var uniqueaccount = '';
    for(i=0; i < everything.length; i++){

        if(everything[i].account != uaccount){
            uniqueindex.push(i+adder);
            adder = adder +1
            uaccount = everything[i].account
        }
        
    }





    //uaccount = everything[i].account
    //uniqueaccount.push(everything[i].account);
   




    for(i=0; i < uniqueindex.length; i++){
        everything.splice(uniqueindex[i],0,{
            'account:'  : '',
            'dep'       : '',
            'loc'       : '',
            'chunka'    : 0,
            'chunkb'    : 0,
            'budchunka'    : 0,
            'budchunkb'    : 0
            });
    }



    var uniquechunka=0;
    var uniquechunkb=0;
    var uniquebudchunka=0;
    var uniquebudchunkb=0;
    var uniqueaccount = '';
    for(i=0; i < everything.length; i++){

        uniquechunka = uniquechunka + everything[i].chunka;
        uniquechunkb = uniquechunkb + everything[i].chunkb;
        uniquebudchunka = uniquebudchunka + everything[i].budchunka;
        uniquebudchunkb = uniquebudchunkb + everything[i].budchunkb;
        if(i>1){uniqueaccount = everything[i-1].account}; 


        if(everything[i].account == '' || everything[i].account == null){
            everything[i] = {
                'sumaccount': uniqueaccount,
                'account'   :   '',
                'dep'       : '',
                'loc'       : '',
                'chunka'    : uniquechunka,
                'chunkb'    : uniquechunkb,
                'budchunka'    : uniquebudchunka,
                'budchunkb'    : uniquebudchunkb
                } 
                var uniquechunka=0;
                var uniquechunkb=0;
                var uniquebudchunka=0;
                var uniquebudchunkb=0;
                var uniqueaccount = '';
        } else { everything[i].sumaccount = '';}




    }





/*
    //sum up the amounts in between the unique indexes
    uniqueindex.unshift(-1);
    var uniquechunka=0;
    var uniquechunkb=0;
    var uniquebudchunka=0;
    var uniquebudchunkb=0;
    var uniqueaccount = '';
    var ii = 0;
    for(i=0; i < everything.length; i++){

        if(i > uniqueindex[ii] && i < uniqueindex[ii+1]){
            uniquechunka = uniquechunka + everything[i].chunka;
            uniquechunkb = uniquechunkb + everything[i].chunkb;
            uniquebudchunka = uniquebudchunka + everything[i].budchunka;
            uniquebudchunkb = uniquebudchunkb + everything[i].budchunkb;
            uniqueaccount = everything[i].account;            
        }
        if(i == uniqueindex[ii+1]){
            var uniquechunka=0;
            var uniquechunkb=0;
            var uniquebudchunka=0;
            var uniquebudchunkb=0;
            i = i +1
            ii = ii +2
        }

    }


    /*
    // sum up each account
    for(ii=0; ii < uniqueaccounts.length; ii++){
        var uniquechunka=0;
        var uniquechunkb=0;
        var uniquebudchunka=0;
        var uniquebudchunkb=0;
        var uniqueaccount = '';
        var lasti=0;

        for(i=0; i < everything.length; i++){
            if(everything[i].account == uniqueaccounts[ii].account ){
                uniquechunka = uniquechunka + everything[i].chunka;
                uniquechunkb = uniquechunkb + everything[i].chunkb;
                uniquebudchunka = uniquebudchunka + everything[i].budchunka;
                uniquebudchunkb = uniquebudchunkb + everything[i].budchunkb;
                lasti = i;
                uniqueaccount = everything[i].account;
            }
        }
        
    }
    */

/*
    //add the summary after each group of detail accounts
    for(i=0; i < uniqueindex.length; i++){
        everything.splice(uniqueindex[i],0,{
        'account:'  : '<b>'+uniqueaccount+'</b>',
        'dep'       : '',
        'loc'       : '',
        'chunka'    : uniquechunka,
        'chunkb'    : uniquechunkb,
        'budchunka'    : uniquebudchunka,
        'budchunkb'    : uniquebudchunkb
        });
    }
    
*/
    

    nlapiLogExecution('DEBUG','unique accounts ='+uniqueaccounts.length+' out of '+ everything.length, JSON.stringify(uniqueaccounts) );

    nlapiLogExecution('DEBUG','everything0-6','var e = ['+JSON.stringify(everything[0]) +''+JSON.stringify(everything[1])+''+JSON.stringify(everything[2])+''+JSON.stringify(everything[3])+''+JSON.stringify(everything[27])+''+JSON.stringify(everything[50])+''+JSON.stringify(everything[56]+'];')  );
    
    nlapiLogExecution('DEBUG','unique acccount indexes L='+uniqueindex.length, 'var ui = ['+uniqueindex+'];');
    
    nlapiLogExecution('DEBUG','everything10','var e = [' + JSON.stringify(everything[10]) + ']' );

    return everything;
}







function addcolumnsandprintlist(everything, lastmonth, displaytype){
    var list = nlapiCreateList('Transaction Budget Report');
    list.setStyle(request.getParameter('style'));

    // use lastmonth to find the months to display in column label
    colb='Jan';
    colc='Feb';
    if (lastmonth == 1 ){ colb = 'Jan'; colc = 'Feb'}
    if (lastmonth == 2 ){ colb = 'Feb'; colc = 'Mar'}
    if (lastmonth == 3 ){ colb = 'Mar'; colc = 'Apr'}
    if (lastmonth == 4 ){ colb = 'Apr'; colc = 'May'}
    if (lastmonth == 5 ){ colb = 'May'; colc = 'Jun'}
    if (lastmonth == 6 ){ colb = 'Jun'; colc = 'Jul'}
    if (lastmonth == 7 ){ colb = 'Jul'; colc = 'Aug'}
    if (lastmonth == 8 ){ colb = 'Aug'; colc = 'Sep'}
    if (lastmonth == 9 ){ colb = 'Sep'; colc = 'Oct'}
    if (lastmonth == 10 ){ colb = 'Oct'; colc = 'Nov'}
    if (lastmonth == 11 ){ colb = 'Nov'; colc = 'Dec'}
    if (lastmonth == 12 ){ colb = 'Dec'; colc = ''}



    var column =list.addColumn('id', 'text', 'ID', 'left');
                list.addColumn('sumaccount', 'text', 'Summary Account', 'left');
                list.addColumn('detailaccount', 'text', 'Detail Account', 'left');
                    list.addColumn('location', 'text', 'Location', 'left');
                    list.addColumn('department', 'text', 'Department', 'left');
                    list.addColumn('totalbudget', 'currency', 'Total Budget', 'left');
                list.addColumn('a', 'currency', 'A. To Date Actuals\n(TOTAL)', 'right');
                list.addColumn('b', 'currency', 'B. Budget Amount \n(Jan-'+colb+')', 'right');
                list.addColumn('c', 'currency', 'C. Budget Amount \n('+colc+'-Dec)', 'right');
                list.addColumn('d', 'currency', 'D. YTD Variance \n(B-A)', 'right');
                list.addColumn('e', 'currency', 'E. Remaining \n(C-A)', 'right');
                list.addColumn('f', 'currency', 'F. Remaining FY Budget \n(C-B)', 'right');
                list.addColumn('g', 'currency', 'G. Projected EOY Budget \n(remaining budget + Total)', 'right');  
             
    finalresult = [];
    id = 0;
    for(i=0; i< everything.length; i++){
        
        var combinedchunks  = parseFloat( (everything[i].chunka + everything[i].chunkb).toFixed(2) ),
            todate          = combinedchunks,
            budacol         = everything[i].budchunka,
            budbcol         = everything[i].budchunkb,
            variancecol     = everything[i].budchunka - todate,
            remaining       = everything[i].budchunkb - todate,
            remainingbudget = everything[i].budchunkb-everything[i].budchunka,
            EOY             = remainingbudget + todate;

        finalresult.push({
                'id'              : id,
                'sumaccount'      : '<b>' + everything[i].sumaccount + '</b>',
                'detailaccount'   : everything[i].account,
                'location'        : everything[i].loc,
                'department'      : everything[i].dep,
                'totalbudget'     : everything[i].budchunka + everything[i].budchunkb,
                'a'               : todate,
                'b'               : everything[i].budchunka,
                'c'               : everything[i].budchunkb,
                'd'               : everything[i].budchunka - todate,
                'e'               : everything[i].budchunkb - todate,
                'f'               : everything[i].budchunkb-everything[i].budchunka,
                'g'               : EOY
            });
            id = id + 1;
    }

    nlapiLogExecution('DEBUG','finalresult[6] L='+finalresult.length, JSON.stringify( finalresult[6]) );
    try{
        list.addRows( finalresult );
        response.writePage(list);           
    }catch(e){
        nlapiLogExecution('ERROR','writing list', e.message );
    }
   
}


