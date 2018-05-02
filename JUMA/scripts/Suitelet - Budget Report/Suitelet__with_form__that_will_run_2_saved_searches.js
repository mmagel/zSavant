/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/ui/serverWidget', 
		'N/email', 
		'N/runtime', 
		'N/search',
		'N/file',
		'N/config',
		'N/format',
		'N/record',
		'N/log'],
		
/**
 * @param {ui} ui
 * @param {email} email
 * @param {runtime} runtime
 * @param {search} search
 * @param {file} file
 * @param {config} config
 * @param {format} format
 * @param {record} record
 * @param {log} log
 */
function(ui, email, runtime, search, file, config, format, record, log) {

	function runBothSearches() {

		var s1Results = search.load({
			id: 'customsearch_my_so_search1'
		})
		.run();

		var s2Results = search.load({
			id: 'customsearch_my_so_search2'
		})
		.run();

		// Do something with the results of each...
		// util.each(s1Results, function(result) {

		//});
	}

	/**
     * Initialise form
     *
     * @param {Object} context
     */
	function initForm(context, postResult) {
		
		var form = ui.createForm({
            title: 'Foo'
        });

        form.addSubmitButton({
            label: 'Submit'
        });
        
        context.response.writePage(form);
	}


	/**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	if (context.request.method === 'GET') {
            initForm(context);
        } 
    	else {
    		//...
        }
    }

    return {
        onRequest: onRequest
    };
});