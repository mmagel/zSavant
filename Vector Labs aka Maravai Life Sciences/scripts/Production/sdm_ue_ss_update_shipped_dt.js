/* SCHEDULED SCRIPT
 * rbender@sdmayer.com for Vector Labs
 *
 *  One time script to update "custbody_mv_status_changed_to_shipped" on item fulfillments to correct datetime
 *
 */

function sdm_ss_update_shipped_dt(){
    var jsondata = [
        {
        "id": 3418199,
        "Date": "10/23/17 16:02"
        },
        {
        "id": 3418300,
        "Date": "10/23/17 15:36"
        },
        {
        "id": 3418834,
        "Date": "10/23/17 16:01"
        }
    ]

    var gov = 0;
    for(var i = 0; i < jsondata.length; i++) {
        var obj = jsondata[i];
        gov = gov + 30;     // max of 10,000 for scheduled script
        nlapiLogExecution('DEBUG','ss','id= '+obj.id+' dt='+obj.Date+' gov='+gov);


        try{
            var rec = nlapiLoadRecord('itemfulfillment',obj.id);    //+10gov
            var sysdate = obj.Date;
            sysdate = sysdate + ":00";  // add seconds so it will work in field
            rec.setFieldValue('custbody_mv_status_changed_to_shipped', sysdate);
            nlapiSubmitRecord(rec); //+20gov
        }catch(e){
            nlapiLogExecution('ERROR','ss','err='+e.message+' id= '+obj.id+' dt='+obj.Date+' gov='+gov);
        }

    }
    
}