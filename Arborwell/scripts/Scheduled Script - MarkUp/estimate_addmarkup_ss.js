// estimate_addmarkup_ss.js - rBender@sdmayer.com - 4/20/2018
// This is a scheduled script to add markup where the # lines exceeds the governance limit for the UE script
// 

function estimate_addmarkup_ss(){

    var context = nlapiGetContext();
    var script_id = context.getScriptId();

    var recid = nlapiGetContext().getSetting('SCRIPT', 'custscript_recid');
    var rec = nlapiLoadRecord ( 'estimate' , recid );

    nlapiLogExecution('DEBUG', 'ss-starting', 'script_id='+script_id+ ' recid='+recid);

    var markUpItem = 1621; // 3% markup // 2% markup 1612
    //var user = nlapiGetUser();

    var recordType = rec.getRecordType();
    var recordStatus = rec.getFieldValue('status');

    var disp = rec.getFieldValue('custbody_waive_disposal');
    var markupindex = -1;
    var markupamt = parseFloat(0);
    var rate = nlapiLookupField('otherchargeitem', markUpItem, 'custitem_markup_multiplier');





        var markuplines = 0;

        var lines = rec.getLineItemCount('item');
        for (var i = 1; i <= lines; i++) {

            rec.selectLineItem('item', i);
            var sched = rec.getCurrentLineItemValue('item', 'custcol_tax_schedule');
            var amount = parseFloat(rec.getCurrentLineItemValue('item', 'amount'));
            var item = rec.getCurrentLineItemValue('item', 'item');
            var wt = nlapiLookupField('item', item, 'class');
            var markline = rec.getCurrentLineItemValue('item', 'custcol_markline');

            if (item != markUpItem && disp != 'T' && (wt == 2 || wt == 8)) {
                markupamt = parseFloat(parseFloat(markupamt) + parseFloat(amount * rate)).toFixed(2);
                //nlapiLogExecution('DEBUG', i, parseFloat(amount * rate));
            }

            //nlapiLogExecution('DEBUG', i, markline + ' ' + item + ' ' + amount);
            if (item == markUpItem && markline == 'T') {
                markupindex = i;
            }
        }

        nlapiLogExecution('DEBUG', 'ss-markupindex', markupindex);
        nlapiLogExecution('DEBUG', 'ss-markupamt', markupamt);

        if (markupamt > 0) {
            if (markupindex == -1) {
                rec.selectNewLineItem('item');
            }
            else {
                rec.selectLineItem('item', markupindex);
            }
            rec.setCurrentLineItemValue('item', 'item', markUpItem); //partial use tax
            rec.setCurrentLineItemValue('item', 'quantity', 1);
            rec.setCurrentLineItemValue('item', 'rate', markupamt);
            rec.setCurrentLineItemValue('item', 'custcol_markline', 'T');
            
            rec.commitLineItem('item');
            nlapiLogExecution('DEBUG','commit new line item', 'index='+ markupindex+ ' | item='+markUpItem+' | amnt='+markupamt );
        }

        else {
            if (markupindex != -1) {
                rec.removeLineItem('item', markupindex);
            }
        }


        var use =  nlapiGetContext().getRemainingUsage();
        nlapiLogExecution('DEBUG', 'ss-done, submitted', 'lines='+ lines +' remaining usage='+use);

        nlapiSubmitRecord(rec,{disabletriggers:true, enablesourcing:false, ignoremandatoryfields:true});
        
}
















function TEST_estimate_addmarkup_ss(){

    var markUpItem = 1621; // 3% markup // 2% markup 1612
    var user = nlapiGetUser();
    var recordType = nlapiGetRecordType();
    var recordStatus = nlapiGetFieldValue('status');
    var disp = nlapiGetFieldValue('custbody_waive_disposal');
    var markupindex = -1;
    var markupamt = parseFloat(0);
    var rate = nlapiLookupField('otherchargeitem', markUpItem, 'custitem_markup_multiplier');
    var markuplines = 0;
    var lines = nlapiGetLineItemCount('item');

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

}

