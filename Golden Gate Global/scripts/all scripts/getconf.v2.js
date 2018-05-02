/**
 * Created by Huzaifa on 11/20/2017.
 */

/*
 var Headers = {
 "content-type": "application/json",
 "X-DocuSign-Authentication": {
 "Username": "bwu@3gfund.com",
 "Password": "EEEEcccc5555",
 "IntegratorKey": "AARO-8e160fb2-dd59-4270-b0c8-bed4b7391685"
 }
 }*/

var Headers = {
    'content-type': 'application/json',
    "X-DocuSign-Authentication": "{\"Username\":\"bwu@3gfund.com\",\"Password\":\"EEEEcccc5555\",\"IntegratorKey\":\"AARO-8e160fb2-dd59-4270-b0c8-bed4b7391685\"}"
};

var engTemplateId = 'b1dea756-a854-4353-8666-936dfb770114';
var chTemplateId = '768f2111-32fc-4398-815a-87272701f79c';

function sendEnvelope(data, templateId, msgBody) {

    var url = 'https://na2.docusign.net/restapi/v2/accounts/1bf9e965-dec2-4778-8548-f96b11d087ba/envelopes';

    var emails = data.eMail.split(',');  // todo replace ; with , in netsuite custom record
    nlapiLogExecution('DEBUG', 'emails.length', emails.length);

    msgBody = msgBody.replace('[ADMIN EMAIL]', data.AdmineMail);
    msgBody = msgBody.replace('[LLC]', data.LLC.toUpperCase());
    msgBody = msgBody.replace('[MGMT]', data.MGMT.toUpperCase());

    var today = new Date();
    var dd = today.getDate();
    msgBody = msgBody.replace('[Date1]', dd.toString());

    for (var x = 0; x < emails.length; x++) {

        var JSONPostData = {
            "accountId": "1bf9e965-dec2-4778-8548-f96b11d087ba",
            "emailSubject": "Please confirm payment Instructions for Your EB-5 Investment – RESPONSE REQUIRED",
            "templateId": templateId,
            "templateRoles": [
                {
                    "roleName": "Signer",
                    "name": data.Name,
                    "email": emails[x],
                    "tabs": {
                        "textTabs": [
                            {
                                "tabLabel": "LLC1",
                                "value": data.LLC.toString().toUpperCase()
                            },
                            {
                                "tabLabel": "LLC2",
                                "value": data.LLC + ' (Investor ID: ' + data.ID + ')'.toString().toUpperCase()
                            },
                            {
                                "tabLabel": "Investor Name1",
                                "value": data.Name.toString().toUpperCase()
                            },
                            /*
                            {
                                "tabLabel": "Investor Name2",
                                "value": data.Name.toString().toUpperCase()
                            },*/
                            {
                                "tabLabel": "Investor Name3",
                                "value": data.Name.toString().toUpperCase()
                            },
                            {
                                "tabLabel": "Admin EMail",
                                "value": data.AdmineMail
                            },
                            {
                                "tabLabel": "CustId",
                                "value": data.custId
                            }
                        ]
                    }
                }
            ],
            'emailBlurb': msgBody,
            "status": "sent"
        };

        JSONPostData = JSON.stringify(JSONPostData);
        nlapiLogExecution('DEBUG', 'JSONPostData', JSONPostData);
        var response = nlapiRequestURL(url, JSONPostData, Headers);
        var body = response.getBody();
        nlapiLogExecution('DEBUG', 'DocuSign response', body);
        var JSONResp = JSON.parse(body);
        if (!JSONResp.statusDateTime)
            throw 'ERROR: ' + JSONPostData;
        nlapiLogExecution('DEBUG', 'JSONResp.statusDateTime', JSONResp.statusDateTime);
    }
}

function onStart() {

    var enletterFile = nlapiLoadFile(43189); // letter.txt
    var enmsgBody = enletterFile.getValue();

    var chletterFile = nlapiLoadFile(43190); // letter.ch.txt
    var chmsgBody = chletterFile.getValue();

    var search = nlapiLoadSearch('customrecord_investor_mailing_list', 'customsearch523');
    var resultSet = search.runSearch();
    var rowCount = 999;
    var r = resultSet.getResults(0, rowCount);

    do {
        nlapiLogExecution('DEBUG', 'r.length', r.length);
        for (var i = 0; i < r.length; i++) {

            var data = {

                Name: r[i].getValue('custrecord_ml_name'),
                ID: r[i].getValue('custrecord_ml_id'),
                Lang: r[i].getValue('custrecord_ml_lang'),
                AdmineMail: r[i].getValue('custrecord_ml_adm_email'),
                LLC: r[i].getValue('custrecord_ml_llc'),
                MGMT: r[i].getValue('custrecord_ml_mgmt'),
                eMail: r[i].getValue('custrecord_ml_email'),
                custId: r[i].getId()
            };

            if (data.Lang.toLowerCase() == 'english')
                sendEnvelope(data, engTemplateId, enmsgBody);

            if (data.Lang.toLowerCase() == 'chinese')
                sendEnvelope(data, chTemplateId, chmsgBody);

            nlapiSubmitField('customrecord_investor_mailing_list', data.custId, 'custrecord_ml_email_sent', 'T');
            checkGovernance(50);

        }
        rowCount++;
        if (r.length < 999) break;
        r = resultSet.getResults(rowCount, (rowCount + 999));
    } while (r && r.length > 0);
}