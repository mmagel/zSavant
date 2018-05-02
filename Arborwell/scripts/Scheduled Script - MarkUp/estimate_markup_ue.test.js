/*

 */

function estimate_add_markup(type) {
  
    var disablemarkup = nlapiGetFieldValue('custbody_disablemarkup');
    if (disablemarkup != 'T'){

    var markUpItem = 1621; // 3% markup // 2% markup 1612
    var user = nlapiGetUser();

    var recordType = nlapiGetRecordType();
    var recordStatus = nlapiGetFieldValue('status');
    nlapiLogExecution('DEBUG', 'recordStatus', recordStatus);

    if (recordType == 'salesorder') {

        if (recordStatus == 'Pending Approval'
            || recordStatus == 'Pending Fulfillment'
            || !recordStatus) {
        }
        else
            return;
    }

    var disp = nlapiGetFieldValue('custbody_waive_disposal');
    var markupindex = -1;
    var markupamt = parseFloat(0);
    var rate = nlapiLookupField('otherchargeitem', markUpItem, 'custitem_markup_multiplier');

    if (type == 'create' || type == 'edit' || type == 'copy') {

        var markuplines = 0;

        var lines = nlapiGetLineItemCount('item');
        if ( user != 36558 ){
            for (var i = 1; i <= lines; i++) {

                nlapiSelectLineItem('item', i);
                var sched = nlapiGetCurrentLineItemValue('item', 'custcol_tax_schedule');
                var amount = parseFloat(nlapiGetCurrentLineItemValue('item', 'amount'));
                var item = nlapiGetCurrentLineItemValue('item', 'item');
                var wt = nlapiLookupField('item', item, 'class');
                var markline = nlapiGetCurrentLineItemValue('item', 'custcol_markline');

                if (item != markUpItem && disp != 'T' && (wt == 2 || wt == 8)) {
                    markupamt = parseFloat(parseFloat(markupamt) + parseFloat(amount * rate)).toFixed(2);
                    //nlapiLogExecution('DEBUG', i, parseFloat(amount * rate));
                }

                //nlapiLogExecution('DEBUG', i, markline + ' ' + item + ' ' + amount);
                if (item == markUpItem && markline == 'T') {
                    markupindex = i;
                }
            }

            nlapiLogExecution('DEBUG', 'markupindex', markupindex);
            nlapiLogExecution('DEBUG', 'markupamt', markupamt);

            if (markupamt > 0) {
                if (markupindex == -1) {
                    nlapiSelectNewLineItem('item');
                }
                else {
                    nlapiSelectLineItem('item', markupindex);
                }
                nlapiSetCurrentLineItemValue('item', 'item', markUpItem); //partial use tax
                nlapiSetCurrentLineItemValue('item', 'quantity', 1);
                nlapiSetCurrentLineItemValue('item', 'rate', markupamt);
                nlapiSetCurrentLineItemValue('item', 'custcol_markline', 'T');
                
                nlapiCommitLineItem('item');
            }

            else {
                if (markupindex != -1) {
                    nlapiRemoveLineItem('item', markupindex);
                }
            }
        } else if (user == 36558) {    // else call scheduled script to do the work
            // set param
            var recid = parseInt( nlapiGetRecordId() );
                    
            var script_id = 'customscript_estimate_addmarkup_ss' //'customscript585' //'customscript585'  //context.getScriptId();
            var deploy_id = 'customdeploy1'  //context.getDeploymentId();
            var params = {
                'custscript_recid': recid
            };
            nlapiLogExecution('DEBUG', 'Rescheduling Script: '+script_id+' deployment: '+deploy_id, 'params: '+JSON.stringify(params));
            
            // call scheduled script
            nlapiScheduleScript(script_id, deploy_id, params);
        }
    }

      }//custbody_disablemarkup
      
}


/*
function onBeforeLoad(type, form, request) {
     form.setScript('customscript_sdm_trxs_client');
}
*/


function onBeforeSubmit(type) {

    /*
    var user = nlapiGetUser();
    //if (user == 3) {
        if (type == 'edit') {

            var oldRecord = nlapiGetOldRecord();
            var oldTotal = parseFloat(oldRecord.getFieldValue('total'));
            var total = parseFloat(nlapiGetFieldValue('total'));

            var custbody_aw_est_approval_status_old = oldRecord.getFieldText('custbody_aw_est_approval_status');

            if (custbody_aw_est_approval_status_old == 'Approved' && oldTotal != total) {
                //throw "This transaction was previously approved. No further changes are allowed"
                nlapiLogExecution('DEBUG', 'approvalprocess', 'changed after approval');
            }
        }
        //}*/

    estimate_add_markup(type);
}