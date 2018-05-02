// test UE
// &
// test SS


function ue_test(form, type){
     //  CALL THE SCHEDULED SCRIPT AND PASS THE PARAMETERS
    var use =  nlapiGetContext().getRemainingUsage();
    var recid = parseInt( nlapiGetRecordId() );
    var context = nlapiGetContext();
   //  nlapiGetContext().setSetting('SESSION','testsessionobject','test value');

//    nlapiScheduleScript('customscript585', 'customdeploy1');
//    nlapiLogExecution('DEBUG','ue','called ss, use='+use);


            //var script_id = context.getScriptId();
            //var deploy_id = context.getDeploymentId();
            //var params = {
            //    custscriptue_id : recid
            //};
            //nlapiLogExecution('DEBUG', 'UE Script: '+script_id+' deployment: '+deploy_id, 'params: '+JSON.stringify(params));
            //nlapiScheduleScript(script_id, deploy_id, params);




    
    var script_id = 'customscript585' //'customscript585' //'customscript585'  //context.getScriptId();
    var deploy_id = 'customdeploy1'  //context.getDeploymentId();
    var params = {
        'custscriptsoid': recid,
        'custscript_test': recid
    };
    nlapiLogExecution('DEBUG', 'Rescheduling Script: '+script_id+' deployment: '+deploy_id, 'params: '+JSON.stringify(params));

    nlapiScheduleScript(script_id, deploy_id, params);




    //nlapiScheduleScript('customscript585', 'customdeploy1', params);



/*
var script_id = context.getScriptId();
           var deploy_id = context.getDeploymentId();
           var params = {
               custscript_integrationhubresponsetype: doResponseType,
               custscript_integrationhubbatchsize: intHubBatchSize,
               custscript_inthubdataqupdtrestleturl: intHubDataQUpdtRESTletURL,
               custscript_restletendpointforbatchupdaut: intHubDataQUpdtRESTletURLAuth,
               custscript_int_hub_status_to_process: status_to_process
           };
           nlapiLogExecution('DEBUG', 'Rescheduling Script: '+script_id+' deployment: '+deploy_id, 'params: '+JSON.stringify(params));
           var status = nlapiScheduleScript(script_id, deploy_id, params);
*/

/*
    var poMRtask = task.create({taskType: task.TaskType.MAP_REDUCE});
    poMRtask.scriptId = 'customscript_nes_pr_generator_mr';
    poMRtask.deploymentId = 'customdeploy_nes_pr_generator_mr';
    poMRtask.params = {
        custscript_pr_generator_mr_so: theGlobalOrderNumber,
        custscript_pr_generator_mr_wo: theGlobalWOID,
        custscript_pr_generator_mr_email: theGlobalUserEmail,
        custscript_pr_generator_mr_superv_email: theGlobalSupervisorEmail
    };
    var poMRtaskID = poMRtask.submit();
*/

}

function ss_test(type){

    //try{
        // GET ID FROM THE USER EVENT SCRIPT
        //var recID = nlapiGetContext().getSetting('SCRIPT', 'custscript_custom_recID');

        //nlapiGetContext().getSetting('customscript585', 'custscriptsoid');

        //var use =  nlapiGetContext().getRemainingUsage();
        //nlapiLogExecution('DEBUG','ss id','ss id='+use);


        //var testparam = nlapiGetContext().getSetting('SESSION', 'testsessionobject');
        //nlapiLogExecution('debug','test param',testparam);
        var context = nlapiGetContext();
        var script_id = context.getScriptId();
        //var deploy_id = context.getDeploymentId();


        var abc = nlapiGetContext().getSetting('SCRIPT', 'custscriptsoid');
        nlapiLogExecution('DEBUG','ss','ss completed, param='+abc);

        var test = nlapiGetContext().getSetting('SCRIPT', 'custscript_test');
        nlapiLogExecution('DEBUG','ss','ss completed, param='+test);

    //} catch(e) {
    //    nlapiLogExecution('DEBUG','err','errored out');
    //}


}