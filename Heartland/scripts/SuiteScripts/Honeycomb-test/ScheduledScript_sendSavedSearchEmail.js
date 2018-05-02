/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N', 'N/email', 'N/file', 'N/format', 'N/http', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/xml'],
/**
 * @param {N} N
 * @param {email} email
 * @param {file} file
 * @param {format} format
 * @param {http} http
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 * @param {xml} xml
 */
function(N, email, file, format, http, record, render, runtime, search, xml) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {

    		var vendorSearchObj = search.create({
	    		   type: "vendor",
	    		   filters: 
	    		   ],
	    		   columns: [
	    		      search.createColumn({
	    		         name: "entityid",
	    		         sort: search.Sort.ASC
	    		      }),
	    		      "email",
	    		      "phone"
	    		   ]
	    		});
	    		var searchResultCount = vendorSearchObj.runPaged().count;
	    		vendorSearchObj.run().each(function(result){
	    		   // .run().each has a limit of 4,000 results
	    		   return true;
	    		});

    }

    return {
        execute: execute
    };
    
});
