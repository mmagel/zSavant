
function afterSubmit(type){
    if (type == 'create' || type == 'edit' || type == 'xedit') {
        var internalid = nlapiGetRecordId();
        var exup_rec = nlapiLookupField('customrecord_external_updates', internalid, ['custrecord_external_updates_status', 'custrecord_external_updates_type'], true);
        var exup_status = exup_rec.custrecord_external_updates_status || '';
        var exup_type = exup_rec.custrecord_external_updates_type || '';
        nlapiLogExecution('DEBUG', 'afterSubmit:', 'exup_status: ' + exup_status + ' exup_type: ' + exup_type);
        if (!exup_status) {
            var scheduled_script;
            switch (exup_type) {
                case 'Customer Update':
                    scheduled_script = {
                        id: 'customscript_external_updates_scheduled',
                        deploy: 'customdeploy_exup_customer_update_'
                    };
                    break;
            }
            var deploy_suffix = 1;
            if (scheduled_script) {
                var results = nlapiScheduleScript(scheduled_script.id, scheduled_script.deploy + deploy_suffix);
                nlapiLogExecution('DEBUG', 'SCHEDULED SCRIPT attempt 1', scheduled_script.deploy + deploy_suffix + ': ' + results);
                if (results != 'QUEUED') {
                    results = nlapiScheduleScript(scheduled_script.id, scheduled_script.deploy + (++deploy_suffix));
                    nlapiLogExecution('DEBUG', 'SCHEDULED SCRIPT attempt 2', scheduled_script.deploy + deploy_suffix + ': ' + results);
                }
            }
        }
    }
    return true;
}