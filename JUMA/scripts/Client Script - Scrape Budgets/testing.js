/*
function cstest(type,status){

    var role = nlapiGetContext().role;

    if (role == "3"){
*/

    var budget_ids = [
        77256,
        77508,
        78288,
        78815,
        79504,
        76836,
        78994,
        74231,
        80656,
        78024,
        77772,
        80913,
        79682,
        81247,
        73835,
        79198,
        81459,
        78528,
        77028,
        76624,
        79210,
        79693,
        79516,
        82353,
        78516,
        81867,
        77760,
        78276,
        82077,
        78803,
        79492,
        77244,
        78012,
        77496,
        79186,
        81235,
        76612,
        81879,
        77280,
        80685,
        81292,
        78048,
        81471,
        77052,
        82125,
        78827,
        79741,
        80061,
        79878,
        79550,
        80453,
        75776,
        75968,
        76648,
        78312,
        75095,
        80961,
        80013,
        76600,
        77232,
        75548,
        74219,
        78504,
        77484,
        78000,
        77016,
        76824,
        78982,
        73823,
        76364,
        81447,
        78264,
        73591,
        75059,
        79480,
        81223,
        80418,
        80644,
        74795,
        79174,
        78791,
        77748,
        73862,
        78036,
        77784,
        81281,
        78300,
        80949,
        82269,
        82389,
        79006,
        75083,
        82113,
        78540,
        80441,
        80049,
        79870,
        79538,
        79729,
        74267,
        76848,
        79222,
        77040,
        77520,
        80680,
        77268,
        76636,
        79717,
        82101,
        80937,
        82257,
        82377,
        80668,
        75071,
        79862,
        74255,
        80037,
        79526,
        80429,
        81270,
        73853,
        80925,
        79854,
        79705,
        73844,
        80025,
        82089,
        82365,
        74243,
        81259,
        82245,
        73696,
        75848,
        75178,
        74327,
        74663,
        74579,
        76184,
        74855,
        75406,
        73448,
        73352,
        74951,
        73919,
        76052,
        74003,
        74087,
        74423,
        75680,
        75262,
        75430,
        75872,
        75704,
        73436,
        73340,
        73991,
        74411,
        75166,
        74315,
        75836,
        76172,
        74939,
        75250,
        74567,
        73684,
        75394,
        73907,
        74843,
        74651,
        76040,
        74075,
        75668,
        76740,
        73648,
        75884,
        78612,
        75286,
        75214,
        82185,
        76220,
        73720,
        80793,
        81364,
        82413,
        81807,
        80314,
        80157,
        73955,
        81915,
        78108,
        80549,
        73376,
        76472,
        82317,
        81056,
        77340,
        74027,
        79610,
        77580,
        77100,
        76884,
        73292,
        79918,
        77856,
        74891,
        79054,
        74363,
        74987,
        74699,
        74603,
        75632,
        81639,
        73472,
        75442,
        79294,
        78898,
        74447,
        74111,
        75716,
        78372,
        81567,
        78600,
        81045,
        74975,
        79282,
        81903,
        80302,
        77556,
        78874,
        77832,
        78576,
        80537,
        79906,
        76716,
        75620,
        75190,
        73280,
        74339,
        79030,
        78084,
        76196,
        77316,
        73636,
        81555,
        80145,
        74867,
        74675,
        81033,
        77076,
        80781,
        73931,
        81627,
        76860,
        79258,
        79598,
        81352,
        76448,
        82293,
        78348,
        82401,
        77844,
        77568,
        78886,
        77088,
        81795,
        76728,
        78096,
        79270,
        79042,
        78588,
        77328,
        82305,
        78360,
        76872,
        76460,
        82173,
        75418,
        73460,
        73943,
        75274,
        74099,
        74879,
        75202,
        73364,
        74351,
        73708,
        74435,
        75860,
        76208,
        74015,
        75692,
        74591,
        74687,
        74963,
        75154,
        73895,
        74303,
        74063,
        75812,
        74399,
        74639,
        73979,
        73672,
        73424,
        75656,
        76148,
        75238,
        74831,
        74927,
        73328,
        75370,
        74555,
        75800,
        75358,
        76016,
        76136,
        75608,
        76424,
        76696,
        82149,
        81771,
        79754,
        82497,
        80073,
        81328,
        80465,
        82281,
        82137,
        75143,
        81783,
        74291,
        82161,
        74183,
        77412,
        76556,
        79408,
        76956,
        76280,
        73519,
        80853,
        77688,
        81423,
        78444,
        82461,
        77172,
        75035,
        81163,
        75490,
        74747,
        78192,
        73787,
        79114,
        75932,
        77940,
        82341,
        74495,
        78707,
        81711,
        76944,
        75011,
        74723,
        78934,
        78683,
        81687,
        81139,
        76244,
        80370,
        79102,
        73496,
        77916,
        82437,
        76544,
        77160,
        80194,
        81831,
        81603,
        78168,
        81981,
        75740,
        75908,
        78432,
        76076,
        79384,
        75466,
        77664,
        73763,
        74159,
        74471,
        76788,
        77400,
        75310,
        76580,
        74759,
        78468,
        79432,
        80609,
        79138,
        76304,
        75944,
        78958,
        73799,
        79658,
        76812,
        78216,
        77436,
        76980,
        74195,
        81187,
        74507,
        77196,
        78731,
        75502,
        73543,
        77712,
        77964,
        75752,
        76292,
        81855,
        79646,
        76968,
        76800,
        81435,
        77700,
        80218,
        79420,
        78204,
        80865,
        82017,
        81175,
        75322,
        76568,
        77952,
        77184,
        80394,
        73531,
        79126,
        78719,
        78456,
        78946,
        77424,
        81615,
        76256,
        79990,
        80621,
        80877,
        76316,
        80597,
        79978,
        79830,
        80382,
        80585,
        75023,
        79966,
        74483,
        81843,
        80841,
        76268,
        82449,
        81699,
        73507,
        82233,
        73775,
        79634,
        81412,
        74735,
        75920,
        79818,
        74171,
        82005,
        80206,
        75478,
        81151,
        79396,
        77676,
        77928,
        81993,
        78180,
        78695,
        76592,
        81723,
        81199,
        79444,
        82473,
        80632,
        80406,
        79842,
        79670,
        73555,
        78743,
        80889,
        76992,
        80001,
        78839,
        79562,
        76660,
        80697,
        81304,
        78850,
        80973,
        79574,
        73613,
        79246,
        74531,
        76684,
        77808,
        78862,
        76376,
        77532,
        81483,
        78060,
        73603,
        75788,
        79234,
        81316,
        75980,
        80985,
        77292,
        82485,
        77064,
        78552,
        79742,
        76672,
        75560,
        75107,
        78324,
        74807,
        79018,
        77796,
        81759,
        79586,
        78564,
        77544,
        78072,
        78336,
        76704,
        77820,
        77304,
        81891,
        79372,
        78671,
        79348,
        79360,
        78659,
        82221,
        80525,
        80133,
        79807,
        80769,
        80290,
        81543,
        79894,
        81495,
        79761,
        80477,
        80709,
        80230,
        80085,
        80997,
        81021,
        81519,
        80501,
        80254,
        80109,
        79783,
        81507,
        79772,
        80489,
        81009,
        80721,
        80242,
        80097,
        80745,
        81340,
        81531,
        79882,
        80278,
        80121,
        80513,
        79795,
        80266,
        80733,
        80757,
        76436,
        77988,
        77460,
        76352,
        75537,
        82065,
        82029,
        79456,
        78228,
        79150,
        78970,
        78755,
        77724,
        77208,
        78480,
        77448,
        77976,
        75047,
        74051,
        73316,
        75956,
        74519,
        77004,
        77220,
        76088,
        73811,
        75764,
        75514,
        76328,
        74207,
        82041,
        78240,
        78767,
        74387,
        73400,
        74627,
        74771,
        75334,
        79162,
        76124,
        74915,
        77472,
        73567,
        76340,
        82053,
        81211,
        80901,
        78252,
        75526,
        81735,
        78779,
        74783,
        73579,
        78492,
        77736,
        79468,
        81747,
        76100,
        75346,
        73871,
        74543,
        76400,
        74819,
        75131,
        75992,
        74279,
        75584,
        73625,
        73412,
        73883,
        76388,
        75572,
        75119,
        76112,
        76004,
        76412,
        75596,
        75382,
        76028,
        76160,
        75824,
        79336,
        78647,
        76508,
        81104,
        79318,
        74135,
        81939,
        77616,
        73744,
        79622,
        76232,
        75226,
        78624,
        73660,
        82197,
        77124,
        74615,
        74039,
        81663,
        78910,
        74123,
        73732,
        80817,
        76908,
        79306,
        75454,
        74999,
        80181,
        77880,
        76496,
        78132,
        77604,
        76764,
        73304,
        81819,
        81388,
        77364,
        78396,
        73388,
        76064,
        74711,
        75644,
        74903,
        82329,
        79942,
        74375,
        81927,
        80337,
        75896,
        75728,
        75298,
        74459,
        81579,
        82425,
        81092,
        79078,
        80561,
        73967,
        73484,
        79090,
        80358,
        78922,
        78420,
        80193,
        81400,
        79954,
        78156,
        77388,
        77904,
        81969,
        77148,
        80573,
        81127,
        81675,
        80829,
        76532,
        77652,
        82209,
        76932,
        81591,
        77640,
        80349,
        81957,
        81080,
        81116,
        81945,
        77376,
        76920,
        78408,
        74147,
        79324,
        76776,
        77136,
        78144,
        73751,
        77892,
        76520,
        78636,
        77628,
        81651,
        78120,
        77352,
        78384,
        76484,
        79066,
        77112,
        77592,
        76896,
        76752,
        77868,
        79930,
        81376,
        80326,
        81068,
        80169,
        80805
    ];

//   var budget_ids = [
//        64335
//    ];

frag = [];



        function makeHttpObject() {
            try {return new XMLHttpRequest();}
            catch (error) {}
            try {return new ActiveXObject("Msxml2.XMLHTTP");}
            catch (error) {}
            try {return new ActiveXObject("Microsoft.XMLHTTP");}
            catch (error) {}
        
            throw new Error("Could not create HTTP request object.");
        }









function get_budget_rows(z, frag, budget_ids){
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
        rowhead = rowhead.replace(/,/g , "@");  //if theres commas in the account name it screws up the array

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

        var yr =" 2018";
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

            if(rowdata[v] != 0){
                tables = tables 
                + "<tr><td>"+budget_ids[z] +"</td>"     //internal id
                +"<td>"+ rowhead +"</td>"  //maybe should be: rowhead.replace(/@/g , ",");  //account
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
}






function loadbudget(z, budget_ids){
    var request = makeHttpObject();
    request.open("GET", "https://system.na1.netsuite.com/app/accounting/transactions/budgets.nl?id="+budget_ids[z], true);
    request.send(null);
    request.onreadystatechange = function(){
        if (request.readyState == 4){
         htmldata = request.responseText;
         frag[z] = document.createRange().createContextualFragment(htmldata);
        //console.log('*********** budget_id='+budget_ids[z]+' ************');
        get_budget_rows(z, frag, budget_ids)
        //tables = tables + frag[z].getElementById("budget_splits").innerHTML;
        //console.log(frag[z].getElementById("budget_splits").innerHTML);

        } //rdy state == 4
    };  //func
}




//getElementById("budget_splits")


var tables = '<table>'
        +"<tr><td>budget_ids[z]</td>"
        +"<td>custrecord_account</td>"
        +"<td> Month </td>"
        +"<td> Amount </td>"
        +"<td> dept </td>"
        +"<td> loc  </td></tr>";




budgetrow = ["budget_ids[z]", "rowhead", "rowdata", "dept", "loc"];
myrec = [] ;    //empty array to store all recs we will submit

    //check to see if cust record [z] exists LOAD it, if not then
    //CREATE custom budget record [z] then store it as an object
for (z=0; z< budget_ids.length; z++){   //loop thru all budget internal ids     

    loadbudget(z, budget_ids);

} //end budget_ids loop
//tables = tables + '</table>';
console.log("100% finished!");