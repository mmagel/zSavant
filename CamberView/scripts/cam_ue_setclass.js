// Invoice UE After Submit to get class from Project and assign to Invoice's class field for header & item lines
// Robert Bender for SDMayer
// 6-29-2017

function setclass_as(type){
    if (type=='create'){

        //var type = 'opportunity';
        //var rec = nlapiLoadRecord(type,122938	,{recordmode: 'dynamic'});

        //var type = 'invoice';
        //var rec = nlapiLoadRecord(type,122930	,{recordmode: 'dynamic'});  
              
        var rec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()	,{recordmode: 'dynamic'});
        var proj = nlapiLoadRecord('job',rec.getFieldValue('entity'), {recordmode: 'dynamic'});
        var projclass = proj.getFieldValue('custentity_sdm_projclass');
        rec.setFieldValue('class', projclass);  // set invoice header class field
		var lines = rec.getLineItemCount('item');
		for (var i = 1; i <= lines; i++){
			rec.selectLineItem('item',i);
			//var item = rec.getCurrentLineItemValue('item','item');
            //var itemclass = rec.getCurrentLineItemValue('item','class');
            try{
                rec.setCurrentLineItemValue('item','class',projclass);
                rec.commitLineItem('item');
            }
            catch(e){
				nlapiLogExecution('ERROR','error',e.message);
			}

        }
        
    nlapiSubmitRecord(rec);
    }
}
