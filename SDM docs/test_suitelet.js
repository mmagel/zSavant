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







