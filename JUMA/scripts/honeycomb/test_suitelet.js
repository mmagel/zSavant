/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2017     rob
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */



// steps of the Auitelet

// on GET
// display form with selection for
//      dropdown for Fiscal Year
//      dropdown for Budget Category
//      Submit button

// then POST
//displays a HTML table of the result after:
//      1. get the budget of the FY and category from the record via search
//      2. get the LTR_transaction results for the FY
//      3. put budget and transactions in their own array
//      4. combine arrays like with SQL commands    (alasql?)
//      5. output array to HTML table










function onStart(request, response) {

    if (request.getMethod() == 'GET') {
        nlapiLogExecution('DEBUG', 'GET');
        try{
            var testform = nlapiCreateForm('test');
            testform.setScript('customscript_testclient');
            testform.addSubmitButton();
            testform.addField( 'budgetcategory' , 'select' , 'Budget Category' );
            testform.addField( 'htmldata' , 'longtext' , 'html data field' );
            var htmldata = nlapiGetFieldValue('htmldata');
            //if (runtime.executionContext === runtime.ContextType.USEREVENT)
            response.writePage(testform);

        }catch(e){
            nlapiLogExecution('ERROR', 'GET', e.message);
        }

    }

    if (request.getMethod() == 'POST') {
        nlapiLogExecution('DEBUG', 'POST');
        try{
            var formdata = request.getParameter('htmldata');
            newform = nlapiCreateForm('testresponse');
            //newform.addField( 'htmldataback' , 'inlinehtml' , 'html data field' );
            //newform.addTitleHtml(formdata);

            request.writePage(newform);
        }catch(e){
            nlapiLogExecution('DEBUG', 'POST', e.message);
        }

    }

}










function demoList(request, response)
{
     var list = nlapiCreateList('Simple List');
 
     // You can set the style of the list to grid, report, plain, or normal, or you can get the
    // default list style that users currently have specified in their accounts.
     list.setStyle(request.getParameter('style'));
     
     var column = list.addColumn('number', 'text', 'Number', 'left');
     column.setURL(nlapiResolveURL('RECORD','salesorder'));
     column.addParamToURL('id','id', true);
 
     list.addColumn('trandate', 'date', 'Date', 'left');
     list.addColumn('name_display', 'text', 'Customer', 'left');
     list.addColumn('salesrep_display', 'text', 'Sales Rep', 'left');
     list.addColumn('amount', 'currency', 'Amount', 'right');
 
     var returncols = new Array();
     returncols[0] = new nlobjSearchColumn('trandate');
     returncols[1] = new nlobjSearchColumn('number');
     returncols[2] = new nlobjSearchColumn('name');
     returncols[3] = new nlobjSearchColumn('salesrep');
     returncols[4] = new nlobjSearchColumn('amount');
 
     var results = nlapiSearchRecord('estimate', null, new nlobjSearchFilter('mainline',null,'is','T'), returncols);
     list.addRows( results );
 
     list.addPageLink('crosslink', 'Create Phone Call', nlapiResolveURL('TASKLINK','EDIT_CALL'));
     list.addPageLink('crosslink', 'Create Sales Order',
        nlapiResolveURL('TASKLINK','EDIT_TRAN_SALESORD'));
 
     list.addButton('custombutton', 'Simple Button', ''alert('Hello World')'');
     response.writePage( list );
}