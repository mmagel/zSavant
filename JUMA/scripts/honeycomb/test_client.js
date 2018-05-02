



    function makeHttpObject() {
        try {return new XMLHttpRequest();}
        catch (error) {}
        try {return new ActiveXObject("Msxml2.XMLHTTP");}
        catch (error) {}
        try {return new ActiveXObject("Microsoft.XMLHTTP");}
        catch (error) {}
    
        throw new Error("Could not create HTTP request object.");
    }









function get_budget_rows(z, frag, budget_ids, tables, alltables){
//search thru each row and then each column of that row
var rows = parseFloat( frag[z].getElementById("budget_splits").rows.length );
var cols = parseFloat( frag[z].getElementById("budget_splits").rows[0].cells.length );
rowhead = "";
rowdata = [];

//when in a row loop thru each column
for (y=0; y<rows-1; y++){
    if (y % 2 == 1){ var etc = "hl" }else{ var etc = "" }   //only odds have hl added to class
    //first get header for row
    console.log(frag[z].querySelector("#budgetrow"+y+" > td.uir-list-row-cell.listtext"+etc).textContent );
    rowhead = frag[z].querySelector("#budgetrow"+y+" > td.uir-list-row-cell.listtext"+etc).textContent;

    rowdata[0] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+2+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[1] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+3+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[2] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+4+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[3] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+5+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[4] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+6+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[5] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+7+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[6] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+8+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[7] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+9+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[8] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+10+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[9] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+11+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[10] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+12+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[11] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+13+")").textContent).replace(/[^0-9\.-]+/g,""));
    rowdata[12] =  Number((frag[z].querySelector("#budgetrow"+y+" > td:nth-child("+14+")").textContent).replace(/[^0-9\.-]+/g,""));
    dept = frag[z].querySelector("#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > div > span.uir-field.inputreadonly > span").textContent;
    loc = frag[z].querySelector("#main_form > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(4) > td > div > span.uir-field.inputreadonly > span").textContent;
        
    //does_rec_exist(rowhead,rowdata,dept,loc)
    budgetrow.push(budget_ids[z], rowhead, rowdata, dept, loc, "\r\n");
    console.log(budgetrow);

    // every row = make 12 rows for that account

    var yr =" 2017";
    var themonth =""
    for(v=0;v<12;v++){
        if (v==0){themonth ="Jan"+yr}
        else if(v==1){themonth ="Feb"+yr}
        else if(v==2){themonth ="Mar"+yr} 
        else if(v==3){themonth ="Apr"+yr} 
        else if(v==4){themonth ="May"+yr} 
        else if(v==5){themonth ="Jun"+yr} 
        else if(v==6){themonth ="Jul"+yr} 
        else if(v==7){themonth ="Aug"+yr} 
        else if(v==8){themonth ="Sep"+yr} 
        else if(v==9){themonth ="Oct"+yr} 
        else if(v==10){themonth ="Nov"+yr} 
        else if(v==11){themonth ="Dec"+yr}
//console.log("amnt="+rowdata[v]+" typeof="+typeof(rowdata[v]));
        if(rowdata[v] > 0){
            tables = tables 
            + "<tr>"     //internal id = <td>"+budget_ids[z] +"</td>
            +"<td>"+ rowhead +"</td>"               //account
            +"<td>"+ themonth +"</td>"               //month
            +"<td>"+ rowdata[v] +"</td>"            //amnt
            +"<td>"+ dept +"</td>"
            +"<td>"+ loc  +"</td></tr>";
        }

    }


  
    

/*
    tables = tables 
    + "<tr><td>"+budget_ids[z] +"</td>"
    +"<td>"+ rowhead +"</td>"
    +"<td>"+ rowdata[0] +"</td>"
    +"<td>"+ rowdata[1] +"</td>"
    +"<td>"+ rowdata[2] +"</td>"
    +"<td>"+ rowdata[3] +"</td>"
    +"<td>"+ rowdata[4] +"</td>"
    +"<td>"+ rowdata[5] +"</td>"
    +"<td>"+ rowdata[6] +"</td>"
    +"<td>"+ rowdata[7] +"</td>"
    +"<td>"+ rowdata[8] +"</td>"
    +"<td>"+ rowdata[9] +"</td>"
    +"<td>"+ rowdata[10] +"</td>"
    +"<td>"+ rowdata[11] +"</td>"
    +"<td>"+ rowdata[12] +"</td>"
    +"<td>"+ dept +"</td>"
    +"<td>"+ loc  +"</td></tr>";
*/

    //return(budgetrow);
} // completed one row     








//console.log("tables type="+typeof(tables));
alltables = nlapiGetFieldValue('htmldata');

if (alltables == '' || alltables == null){
    //try{
        //var uniquetables = removeDuplicateRows($(alltables));
    //}catch(e){
        console.log("alltables=null or blank");
    //}
    //alltables = alltables.replace(/undefined/g, "<table>");
    //alltables = alltables.substr(9);
    //alltables = alltables.replace('undefined','<table>');
}

//console.log("alltables="+uniquetables);
nlapiSetFieldValue('htmldata', alltables + tables );

//document.write(tables);  
}


/*
var requestCount = 5,
    requestComplete = 0,
    onAjaxComplete = function () {
        requestComplete++;
        if (requestComplete >= requestCount) {
            // all ajax requests complete
            console.log('*************Complete');
        }
    };

for (var i=0; i<requestCount; i++) {
    Ext.Ajax.request({
        // @todo: ajax request config
        success: function () {onAjaxComplete();},
        failure: function () {onAjaxComplete();}
    });
}  
*/



function loadbudget(z, budget_ids, tables, requestComplete,requestCount, alltables){


var request = makeHttpObject();
request.open("GET", "https://system.netsuite.com/app/accounting/transactions/budgets.nl?id="+budget_ids[z], true);
request.send(null);
    onAjaxComplete = function () {
        requestComplete++;
        if (requestComplete >= requestCount) {
            // all ajax requests complete
            console.log('*************Complete');
            //console.log(nlapiGetFieldValue('htmldata'));
            var uniquetables = nlapiGetFieldValue('htmldata');

            function removeDuplicateRows($table){
                function getVisibleRowText($row){
                    return $row.find('td').text().toLowerCase();
                    //console.log("REMOVEDUPES="+$row.find('td:visible').text() );
                }
                $table.find('tr').each(function(index, row){
                    var $row = $(row);
                    $row.nextAll('tr').each(function(index, next){
                        var $next = $(next);
                        if(getVisibleRowText($next) == getVisibleRowText($row))
                            $next.remove();
                    })
                });
            }
            uniquetables = removeDuplicateRows(uniquetables) ; 
            console.log( uniquetables );
            //console.log('unique='+uniquetables);
            //nlapiSetFieldValue('htmldata',uniquetables);
        }
    };
request.onreadystatechange = function(){


    if (request.readyState == 4){
     htmldata = request.responseText;
     frag[z] = document.createRange().createContextualFragment(htmldata);
    //console.log('*********** budget_id='+budget_ids[z]+' ************');
    get_budget_rows(z, frag, budget_ids, tables, alltables);
    //tables = tables + frag[z].getElementById("budget_splits").innerHTML;
    //console.log(frag[z].getElementById("budget_splits").innerHTML);
    //document.write(tables);
    console.log('z='+z+ ' status='+request.status);

        if (request.readyState==4 && request.status==200)
        {
            // This is when your Ajax request is complete 
            //console.log("100% finished!");
            //xtra = '<table>'+"<tr><td>budget_ids[z]</td>"+"<td>custrecord_account</td>"+"<td> Month </td>"+"<td> Amount </td>"+"<td> dept </td>"+"<td> loc  </td></tr>";
            //nlapiSetFieldValue('htmldata',xtra + tables); 
            onAjaxComplete()
        }
    } //rdy state == 4

};  //func
}



function initscript(){

    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
        });
      }
    /*
        document.write(
            '<table>'
            +"<tr><td>budget_ids["+z+"]</td>"
            +"<td>custrecord_account</td>"
            +"<td> Month </td>"
            +"<td> Amount </td>"
            +"<td> dept </td>"
            +"<td> loc  </td></tr>");
    */
    

    //getElementById("budget_splits")
    var budget_ids = [1063,1064,1050,1062];
    var requestCount = budget_ids.length;
    var requestComplete = 0;

    frag = [];
    var tables ='';
    var alltables = "";
    console.log('TESTTTTTT');
/*    var times = 1;
    if(times == 1){
            var tables = '<table>'
        +"<tr><td>budget_ids[z]</td>"
        +"<td>custrecord_account</td>"
        +"<td> Month </td>"
        +"<td> Amount </td>"
        +"<td> dept </td>"
        +"<td> loc  </td></tr>";
        times = 2;
    }
*/
    budgetrow = ["budget_ids[z]", "rowhead", "rowdata", "dept", "loc2"];
    myrec = [] ;    //empty array to store all recs we will submit
    //check to see if cust record [z] exists LOAD it, if not then
    //CREATE custom budget record [z] then store it as an object
    for (z=0; z< budget_ids.length; z++){   //loop thru all budget internal ids     
        loadbudget(z, budget_ids, tables, requestComplete,requestCount,alltables);
    } //end budget_ids loop
    //tables = tables + '</table>';
    //console.log("100% finished!");
    console.log('z='+z);
}

