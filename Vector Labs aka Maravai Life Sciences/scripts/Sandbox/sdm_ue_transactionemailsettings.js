//
// Robert Bender @ SDM for Vector
// 10-17-2017
/*
Sales Order: 
custbody2 = Email Invoice checkbox on SO
tobeemailed = Email Sales Order checkbox on SO
email = email addresses textbox on SO

Customer Record:
emailtransactions = checkbox preference
email = customer email (usually their AP person)

*/

        // beforesubmit UserEvent on SO function
function salesorderemailsettings(type, status){

    nlapiLogExecution('DEBUG','script','type='+type+' status='+status);
    if (type == 'create' || type == 'edit'){
        nlapiLogExecution('DEBUG','script','init script func of '+type);
        var trantype = nlapiGetRecordType();

        if (trantype == 'salesorder'){
            soid = parseInt(nlapiGetRecordId());
            custid = parseInt(nlapiGetFieldValue('entity'));
            custemailpref = nlapiLookupField('customer',custid,'emailtransactions');
            custemailaddy = nlapiLookupField('customer',custid,'email');
            emailSO = nlapiGetFieldValue('tobeemailed');
            emailaddy = nlapiGetFieldValue('email');

            if (custemailpref == 'T' && emailSO == 'T'){    //send email to both address on tran & cust rec
                var emailconcat = emailaddy + ';' + custemailaddy;
                if (emailaddy == custemailaddy){ 
                    nlapiSetFieldValue('tobeemailed','T'); 
                    nlapiLogExecution('DEBUG','email','emails match');
                } 
                else {
                    nlapiSetFieldValue('email',emailconcat);
                    nlapiSetFieldValue('tobeemailed','T'); 
                    nlapiLogExecution('DEBUG','email','concatted');
                }
                nlapiLogExecution('DEBUG','email','successfully emailed SO to '+emailconcat+ ' typeof='+ typeof(emailconcat) +' ('+emailaddy+';'+custemailaddy+')'); 
                } 
                else 
                { 
                nlapiSetFieldValue('tobeemailed','F');
                nlapiLogExecution('DEBUG','email','did NOT email SO'); 
                }
            
        }

    }


}


// init Client Script on Invoice (cashsale) creation function
function init_invoice_emailsettings(type){
    nlapiLogExecution('DEBUG','script','inv- type='+type+' status='+status);
    if (type == 'create' || type == 'copy'){ 
        try
        {
            custid = parseInt(nlapiGetFieldValue('entity'));
            custemailpref = nlapiLookupField('customer',custid,'emailtransactions');
            custemailaddy = nlapiLookupField('customer',custid,'email');
            createdfrom = parseInt(nlapiGetFieldValue('createdfrom'));
            emailaddy = nlapiLookupField('salesorder', createdfrom ,'email');
            emailInv = nlapiLookupField('salesorder', createdfrom ,'custbody2');
        }
        catch(e)
        {
            nlapiLogExecution('ERROR','vars',e.message); 
        } 


            if (custemailpref == 'T' && emailInv == 'T'){   //send email to both address on tran & cust rec
                if (emailaddy != custemailaddy){ 
                    var emailconcat = String(emailaddy + ';' + custemailaddy);
                    // nlapiSendEmail ( from , to , subject , body , cc , bcc , records , files )
                    //nlapiSendEmail ( 'rbender@sdmayer.com' , 'rbender@sdmayer.com' , 'test subject' , 'Please open the attached file to view your Invoice.\n\nTo view the attachment, you first need the free Adobe Acrobat Reader. If you don\'t have it yet, visit Adobe\'s Web site http://www.adobe.com/products/acrobat/readstep.html to download it.' , '' , '' , {entity: custid, record: invid, recordtype: invoice} , nlobjRecord )
                    // nlapiSetFieldValue('email',emailconcat); 
                    //nlapiSetFieldValue('tobeemailed','T'); 
                } else { 
                    var emailconcat = emailaddy; 
                }
                //var records = new Object();
                //records['entity'] = '-6';
                //var records = {}
                try{
                    nlapiSetFieldValue('email',emailconcat);
                    nlapiSetFieldValue('tobeemailed','T');
                    //nlapiSendEmail ( 'rbender@sdmayer.com' , 'rbender@sdmayer.com' , 'test subject' , 'Please open the attached file to view your Invoice.\n\nTo view the attachment, you first need the free Adobe Acrobat Reader. If you don\'t have it yet, visit Adobe\'s Web site http://www.adobe.com/products/acrobat/readstep.html to download it.' , '' , '' , {entity: 7040, record: 2948088, recordtype: trantype} , nlobjRecord );                
                    nlapiLogExecution('DEBUG','email','successfully emailed Inv'); 
                }catch(e){
                    nlapiLogExecution('DEBUG','email',e.message);
                }

            } else { 
                nlapiSetFieldValue('email',emailconcat);
                nlapiSetFieldValue('tobeemailed','F');
                nlapiLogExecution('DEBUG','email','did NOT email Invoice'); 
            }


    }
}




            /*
            if (trantype == 'cashsale' && type == 'create' ){
                nlapiLogExecution('DEBUG','script','init cashsale script func');
                invid = parseInt(nlapiGetRecordId());
                custid = parseInt(nlapiGetFieldValue('entity'));
                custemailpref = nlapiLookupField('customer',custid,'emailtransactions');
                custemailaddy = nlapiLookupField('customer',custid,'email');
                createdfrom = parseInt(nlapiGetFieldValue('createdfrom'));
                emailaddy = nlapiLookupField('salesorder', createdfrom ,'email');
                emailInv = nlapiLookupField('salesorder', createdfrom ,'custbody2');
                userid = nlapiGetUser();
                useremail = nlapiLookupField('employee',userid,'email');
    
                if (custemailpref == 'T' && emailInv == 'T'){   //send email to both address on tran & cust rec
                    if (emailaddy != custemailaddy){ 
                        var emailconcat = emailaddy+';'+custemailaddy;
                        // nlapiSendEmail ( from , to , subject , body , cc , bcc , records , files )
                        //nlapiSendEmail ( 'rbender@sdmayer.com' , 'rbender@sdmayer.com' , 'test subject' , 'Please open the attached file to view your Invoice.\n\nTo view the attachment, you first need the free Adobe Acrobat Reader. If you don\'t have it yet, visit Adobe\'s Web site http://www.adobe.com/products/acrobat/readstep.html to download it.' , '' , '' , {entity: custid, record: invid, recordtype: invoice} , nlobjRecord )
                        // nlapiSetFieldValue('email',emailconcat); 
                        //nlapiSetFieldValue('tobeemailed','T'); 
                    } else { 
                        var emailconcat = emailaddy; 
                    }
                    //var records = new Object();
                    //records['entity'] = '-6';
                    //var records = {}
                    try{
                        nlapiSendEmail ( 'rbender@sdmayer.com' , 'rbender@sdmayer.com' , 'test subject' , 'Please open the attached file to view your Invoice.\n\nTo view the attachment, you first need the free Adobe Acrobat Reader. If you don\'t have it yet, visit Adobe\'s Web site http://www.adobe.com/products/acrobat/readstep.html to download it.' , '' , '' , {entity: 7040, record: 2948088, recordtype: trantype} , nlobjRecord );                
                        nlapiLogExecution('DEBUG','email','successfully emailed Inv'); 
                    }catch(e){
                        nlapiLogExecution('DEBUG','email',e.message);
                    }
    
                } else { 
                    //nlapiSetFieldValue('tobeemailed','F'); 
                    nlapiLogExecution('DEBUG','email','did NOT email Invoice'); 
                }
            }
            */