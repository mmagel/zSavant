// 
// This is a scheduled script to offload governance points from the markup UE before submit script
//
//
//

function markup_ss(){

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