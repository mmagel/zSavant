// SS1.0 Client Script - Set Opp Pct - Robert Bender of SDM for Camberview

function fieldupdated(type,name){

    if (name == 'custbody_opp1' || name == 'custbody16'){
        var fee = 0;
        var opp = nlapiGetFieldValue('custbody16');
        var opp1 = nlapiGetFieldValue('custbody_opp1');

        if ( (opp != '' || opp != null) && (opp1 != '' || opp1 != null) ) {

            if (opp == 1){ fee = nlapiGetFieldValue('custbody_fee1'); }
            if (opp == 2){ fee = nlapiGetFieldValue('custbody_fee2'); }
            if (opp == 3){ fee = nlapiGetFieldValue('custbody_fee3'); }
            if (opp == 4){ fee = nlapiGetFieldValue('custbody_fee4'); }
            if (opp == 5){ fee = nlapiGetFieldValue('custbody_fee5'); }

            var opppct = (parseFloat(fee) / parseFloat(opp1))*100;

            if ((opppct != null || opppct != '') && (opppct>=0 && opppct<=100) ){
                nlapiSetFieldValue('custbody_opppct', opppct.toFixed(2));
            }
            
        }
    }

}


/* 

//testing
var opp1 = nlapiGetFieldValue('custbody_opp1');
fee = nlapiGetFieldValue('custbody_fee1')
var opp = nlapiGetFieldValue('custbody16');
var opppct = parseFloat(fee) / parseFloat(opp1);

        nlapiSetFieldValue('custbody_opppct', opppct.toFixed(2) );
*/