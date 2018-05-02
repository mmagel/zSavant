
/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/file'],

function(search,file) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
     var mySearch = search.load({
      id: 'customsearch_csvsearch'
     });
     
     log.debug('mySearch', mySearch);
     
     var columns = mySearch.columns;
     log.debug('mySearch', columns);
     log.debug('mySearch lenght', columns.length);
     
     //Creating arrays that will populate results
     var content = new Array();
     var cells = new Array();
     var headers = new Array();
     var temp = new Array();
     var x = 0;
     
     
     for(var i=0; i< columns.length; i++){
      headers[i] = columns[i].name;
      log.debug('col ',headers[i]);    
      
     } 
     
     content[x] =  headers;
     x =1;
     
     
     
     //Looping through the search results
     mySearch.run().each(function(result){
      log.debug('content',content);
      //looping through each columns
      for(var y=0; y< columns.length; y++){
       
          var searchResult = result.getValue({
           name: columns[y].name
          });
          temp[y] = searchResult;
          log.debug(temp[y],searchResult);  

         } 
     content[x] +=temp;
     x++; 
        return true; 
        });
     
     
      
      //Creating a string variable that will be used as CSV Content
      var contents='';
      
      for(var z =0; z<content.length;z++){
       contents +=content[z].toString() + '\n';
      }
    
     
     log.debug('contents',contents);
     var fileObj = file.create({
      name: 'testsearchcsv.csv',
      fileType: file.Type.CSV,
      contents: contents,
      description: 'This is description',
      folder: 144
     });
     
     var id = fileObj.save();
     log.debug('id',id );
     
     
    }

    return {
        execute: execute
    };
    
});