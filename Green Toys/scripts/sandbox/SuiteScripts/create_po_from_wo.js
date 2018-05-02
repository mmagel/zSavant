// create_po_from_wo.js
// Robert Bender of SDMayer for Green Toys 6-22-2017
// this is a UE After Submit that creates a PO.
// if WO is created (planned) then create PO for all the backordered line items

function wo_as(type){
    if (type == 'create'){
        nlapiLogExecution('ERROR','type',type);
        var rec=nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()	,{recordmode: 'dynamic'});
		var lines=rec.getLineItemCount('item');
		
        var newpo = nlapiCreateRecord('purchaseorder', {recordmode: 'dynamic'});
        var povendor = 'SDM Test Vendor'; //56;//nlapiLookupField('vendor', 56, 'entity');
        var poapprover = 'SDMtest'; //9233;//nlapiLookupField('employee', 9233, 'entityid');

        for (var i=1;i<=lines;i++){
			rec.selectLineItem('item',i);
			var item=rec.getCurrentLineItemValue('item','item');
			var quant=rec.getCurrentLineItemValue('item','quantity');
            //var descrip=num=nlapiGetCurrentLineItemValue('item','description');
            //nlapiCreateRecord()
            //record.setLineItemValue('item', 'item', record.getLineItemCount('item'), 21);
            //record.setLineItemValue('item', 'quantity', record.getLineItemCount('item'), 1);
            newpo.selectNewLineItem('item');
            newpo.setCurrentLineItemValue('item','item',item);
            newpo.setCurrentLineItemValue('item','quantity',quant);
            //newpo.insertLineItem('item','item',i);
            newpo.commitLineItem('item');
        }
        // add vendor (entity) & PO approver(custbody_sdm_custapprover) & location?
        newpo.setFieldValue('entity',povendor,false);
        newpo.setFieldValue('custbody_sdm_custapprover',poapprover,false);
        nlapiSubmitRecord(newpo, true, true);
    }
}