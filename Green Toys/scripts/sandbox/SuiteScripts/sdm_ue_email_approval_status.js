//Estimate & SO - After Submit
//Emails when status & approver changes
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       8 Aug 2018      rBender
 *
 */
/**
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @returns {Void}
 */

//email when pending approval to manager
//email when approved to sales rep AND/OR creator of record
//email when rejected to sales rep AND/OR creator of record

function email_on_as(type){
    nlapiLogExecution('DEBUG', 'type=', type);

    try{

        if (type == 'create'){
            //if create notify the manager
            var newrec = nlapiGetNewRecord();
            var newstatus = newrec.getFieldValue('status');
            var newapprovalstatus = newrec.getFieldValue('custbody_aw_est_approval_status');
            var newapprover = newrec.getFieldValue('custbody_aw_est_approver');
        }


        if ( type == 'edit' || type== 'xedit' ){
            var oldrec = nlapiGetOldRecord();
            var newrec = nlapiGetNewRecord();

            if (oldrec){
                nlapiLogExecution('DEBUG','oldrec',oldrec);
                var oldstatus = oldrec.getFieldValue('status');
                var oldapprovalstatus = oldrec.getFieldValue('partner');
                var oldapprover = oldrec.getFieldValue('partner');

                var newstatus = newrec.getFieldValue('status');
                var newapprovalstatus = newrec.getFieldValue('partner');
                var newapprover = newrec.getFieldValue('partner');

                //var oldapprovalstatus = oldrec.getFieldValue('custbody_aw_est_approval_status');
                //var oldapprover = oldrec.getFieldValue('custbody_aw_est_approver');
                nlapiLogExecution('DEBUG','oldrec status',oldstatus);

                // 39010 = Robert Bender
                var efrom = 9230,  //39010
                    eto = 9230,
                    esubject = 'subject here',
                    ebody = 'old status='+oldstatus+' new statys='+newstatus+
                            ' \nold approval status='+oldapprovalstatus+' new approval status='+newapprovalstatus+
                            '\nold approver='+oldapprover+' new approver='+newapprover,
                    ecc = '',
                    ebcc = '',
                    erecords = oldrec,
                    efiles = '';

                nlapiSendEmail ( efrom , eto , esubject , ebody )   // , ecc , ebcc , erecords , efiles 
            }

        } //endif edit

        
    } catch(e){
        nlapiLogExecution('ERROR', 'CATCH', e.message);
    }

}
