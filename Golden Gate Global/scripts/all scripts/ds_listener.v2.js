/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Dec 2014     AHalbleib
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function send_request(recType, recId) {
    //f1c EF1B1636-0D84-49F8-B971-67CC5375EC02
    //f1nc 92A50F18-559A-42EC-94FD-1A0A90681125
    //f2c 7E7E81F1-96CB-4383-ABF4-B8605A70EA01
    //f2nc 8106F909-7D20-4D1A-80E9-E58E9CE7A57D
    //f3c 0DAFC65F-995B-4F53-A056-09FC1E1A04F4
    //f3nc 7394F772-B1D5-4530-B7D9-B8352ADD4575
    //f5c 3BD27464-D2A4-4075-8E39-11FA8B1AA8B5
    //f5nc 03129231-5D80-4174-9659-9ACDFE56EEF6
    //f6c 7BE37167-05B5-411A-A9AC-8D747E1CEE25
    //f6nc 2936C04B-127C-4A96-9CDF-3CDF42110D54
    //name, id, name + id, address, email
    //e27db481-2d98-4fc1-b988-fcbe699c1d7d

    //jiang, liming
    //liu, jianying
    //chen, qin
    //tao, qingying
    //zhang, jiewen
    //zhuo, yuhao
    //wang, li
    //other funds 猎人角项目
//	Fund 7: 布鲁克林湾项目
//Fund 8: 国王队项目
    var invprojectname = '猎人角项目';
    var fields = nlapiLookupField(recType, recId, ['custentity23', 'custentity7', 'companyname', 'custentity_sdm_mailingeb5doc', 'custentity_sdm_email', 'subsidiary', 'custentity35', 'custentity_sdm_gender']);
    var gender = fields.custentity_sdm_gender;

    var datech = "2016年11月15日";
    var date = '11/15/2016';
    //add gender specific title
    var chname = fields.custentity35;
    var chln = '';
    if (chname != null && chname != '') {
        nlapiLogExecution('DEBUG', 'chln', chname.substring(0, 1));
        chln = chname.substring(0, 1);
    }
    //return;
    var id = fields.custentity7;
    nlapiLogExecution('DEBUG', id, id);
    var source = fields.subsidiary;
    //source=nlapiGetContext().getSetting('SCRIPT','custscript_sub');
    country = nlapiGetContext().getSetting('SCRIPT', 'custscript_country');
    var title = '';
    var chtitle = '';
    var fund = '';
    var address = fields.custentity_sdm_mailingeb5doc;
    var email = fields.custentity_sdm_email;
    //email='accounting@3gfund.com';
    var chnameid = chname + ' ' + id;

    var aiq = nlapiSearchRecord('opportunity', null,
        new nlobjSearchFilter('custbody_investor_id', null, 'is', id),
        new nlobjSearchColumn('internalid'));
    if (aiq == null) {
        nlapiLogExecution('DEBUG', 'no aiq', id);
        return;
    }
    aiq = aiq[0].getValue('internalid');

    var aiqfields = nlapiLookupField('opportunity', aiq, ['custbody24', 'custbody29', 'custbody148', 'custbody149']);
    var fn = aiqfields.custbody148;
    var ln = aiqfields.custbody149;
    if (chln == '') {
        chln = ln;
    }
    //var chln=aiqfields.custbody149;
    var nameid = fn + ' ' + ln + ' ' + id;
    var name = fn + ' ' + ln;
    var maritalstat = aiqfields.custbody29;

    if (gender == 1) {
        title = 'Mr. ';
        chtitle = '先生';
    }
    else if (maritalstat == 4 || maritalstat == 6 || maritalstat == 7) {
        title = 'Mrs.';
        chtitle = '女士';
    }
    else {
        title = 'Ms.';
        chtitle = '小姐';
    }

    var template = '';
    var body = '';
    //var country=aiqfields.custbody24;

    //f1c EF1B1636-0D84-49F8-B971-67CC5375EC02
    //f1nc 92A50F18-559A-42EC-94FD-1A0A90681125
    //f2c 7E7E81F1-96CB-4383-ABF4-B8605A70EA01
    //f2nc 8106F909-7D20-4D1A-80E9-E58E9CE7A57D
    //f3c 0DAFC65F-995B-4F53-A056-09FC1E1A04F4
    //f3nc 7394F772-B1D5-4530-B7D9-B8352ADD4575
    //f5c 3BD27464-D2A4-4075-8E39-11FA8B1AA8B5
    //f5nc 03129231-5D80-4174-9659-9ACDFE56EEF6
    //f6c 7BE37167-05B5-411A-A9AC-8D747E1CEE25
    //f6nc 2936C04B-127C-4A96-9CDF-3CDF42110D54
    if (source == 2) {
        fund = 'GSIF Fund I';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = 'FDBD4A51-3A04-4C1E-826A-71644047904B';
        else
            template = 'A1AD2AD1-AD69-4DC6-A93A-A85AC39DEF43';
    }
    if (source == 3) {
        fund = 'GSIF Fund II';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = '08631FA3-7B1D-4A22-BA52-79D80A568314';
        else
            template = 'B8C8B959-99FF-40FB-B295-AE4BD4DD5786';
    }
    if (source == 4) {
        fund = 'GSIF Fund III';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = 'E1D2A8C4-91EF-4A4E-B136-C8BD6491DA42';
        else
            template = '096B69F5-BEC9-4988-BBDA-CE01C4DBC2AC';
    }
    if (source == 7) {
        fund = 'SFBARC Fund 5';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = '505A914F-6DD0-453B-AD61-AED93D83AA66';
        else
            template = '5DF6F9F1-F3F8-4423-A907-C82C74228151';
    }
    if (source == 6) {
        fund = '3G Fund 6';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = 'BFFF32D5-F23A-4A69-A511-A1010CBC7156';
        else
            template = '688099F4-159D-4193-B0F8-9D9776BF23B5';
    }
    if (source == 12) {
        //	Fund 7: 布鲁克林湾项目
//Fund 8: 国王队项目
        invprojectname = '布鲁克林湾项目';
        fund = '3G Fund 7';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = 'F3CB2583-1593-40F6-BC33-2EA2F08C6F44';
        else
            template = '6E275AC1-8F95-4D1C-8AB0-37693A6A9BEF';
    }
    if (source == 10) {
        invprojectname = '国王队项目';
        fund = '3G Fund 8k';
        if (country.toLowerCase() == 'china' || country.toLowerCase() == 'ch')
            template = '8B138217-C042-4056-8ACF-C5F8B570CC03';
        else
            template = 'B9BE426B-9255-4ED2-B2BB-75D09FC58B07';
    }
    var url = 'https://na2.docusign.net/restapi/v2/accounts/1bf9e965-dec2-4778-8548-f96b11d087ba/envelopes';
    var method = 'POST';
    nlapiLogExecution('DEBUG', 'vals', title + ' ' + nameid + ' \n' + address + ' ' + name);
    var headers = {
        'content-type': 'application/json',
        "X-DocuSign-Authentication": "{\"Username\":\"bwu@3gfund.com\",\"Password\":\"EEEEcccc5555\",\"IntegratorKey\":\"AARO-8e160fb2-dd59-4270-b0c8-bed4b7391685\"}"
    };
    //"font": "arial",
    // "fontColor": null,
    // "fontSize": null,
    //nlapiLogExecution('DEBUG',get_ch_subject(datech,fund),get_ch_body(datech,fund));
    if (country.toLowerCase() != 'china' && country.toLowerCase() != 'ch') {
        body = "{\n  \"emailSubject\": \"" + get_en_subject(date, fund) + "\",\n  \"emailBlurb\": \"" + get_en_body(date, fund, title + ' ' + ln, id) + "\",\n  \"customFields\": {\n    \"textCustomFields\": [\n {\n        \"value\": \"" + source + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"Source\"\n      }, {\n        \"value\": \"" + id + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"InvId\"\n      },    {\n        \"value\": \"" + recId + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"CusId\"\n      },\n      {\n        \"value\": \"" + aiq + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"AIQID\"\n      }    ]\n  },\n  \"templateId\": \"" + template + "\",\n  \"templateRoles\": [\n    {\n      \"tabs\": {\n        \"textTabs\": [\n            ]\n      },\n      \"roleName\": \"Signer\",\n      \"name\": \"" + name + "\",\n      \"email\": \"" + email + "\"\n    }\n  ],\n  \"status\": \"sent\",\n  \"eventNotification\": {\n    \"RecipientEvents\": [\n      {}\n    ],\n    \"EnvelopeEvents\": [\n      {}\n    ]\n  }\n}";
    }
    else {
        var nametit = chln + chtitle;
        body = "{\n  \"emailSubject\": \"" + get_ch_subject(datech, fund, invprojectname) + "\",\n  \"emailBlurb\": \"" + get_ch_body(datech, fund, id, nametit) + "\",\n  \"customFields\": {\n    \"textCustomFields\": [\n {\n        \"value\": \"" + source + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"Source\"\n      }, {\n        \"value\": \"" + id + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"InvId\"\n      },    {\n        \"value\": \"" + recId + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"CusId\"\n      },\n      {\n        \"value\": \"" + aiq + "\",\n        \"required\": \"true\",\n        \"show\": \"true\",\n        \"name\": \"AIQID\"\n      }    ]\n  },\n  \"templateId\": \"" + template + "\",\n  \"templateRoles\": [\n    {\n      \"tabs\": {\n        \"textTabs\": [\n          " +
            "]\n      },\n      \"roleName\": \"Signer\",\n      \"name\": \"" + name + "\",\n      \"email\": \"" + email + "\"\n ," +
            " \"emailNotification\": {\"emailSubject\": \"" + get_ch_subject(datech, fund, invprojectname) + "\",\n  \"emailBody\": \"" + get_ch_body(datech, fund, id, nametit) + "\",\n\"supportedLanguage\": \"zh_CN\" }}\n  ],\n  \"status\": \"sent\",\n  \"eventNotification\": {\n    \"RecipientEvents\": [\n      {}\n    ],\n    \"EnvelopeEvents\": [\n      {}\n    ]\n  }\n}";
    }
    var restresponse = nlapiRequestURL(url, body, headers, method);
    var responsebody = JSON.parse(restresponse.getBody());
    success = true;
    for (i in responsebody) {
        if (i == 'error')
            success = false;
        nlapiLogExecution('DEBUG', i, responsebody[i]);
    }
    if (success)
        nlapiSubmitField('job', recId, 'custentity_send_datareq', 'F');
}

//https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=274c2d89-4181-4108-bd89-bab82398f8d7&EnvelopeField_CustId=13464
function listen(request, response) {

    var XMLRequest = request.getBody();

    var f = nlapiCreateFile('myxml.xml', 'XMLDOC', XMLRequest);
    f.setFolder(-15);
    nlapiSubmitFile(f);

    //nlapiLogExecution('DEBUG', 'here', 'here');
    if (request.getMethod() == 'POST' && (XMLRequest != null || XMLRequest != '')) {

        //nlapiLogExecution('DEBUG', 'body', XMLRequest);

        var node = nlapiStringToXML(XMLRequest); //Conver the XML String to XML Document

        //var node=nlapiSelectNode(xml_doc, "//*[name()='DocuSignEnvelopeInformation']");
        var node1 = nlapiSelectNode(node, "//*[name()='DocuSignEnvelopeInformation']");
        //node=nlapiSelectNode(node, "//*[name()='DocumentPDFs']");
        var i, child = '';
        var projectId, custId, cust = '';
        var aiq = '';
        var acctnum = '';
        var ben = '';
        var benbank = '';
        var chips = '';
        var iname1 = '';
        var iname2 = '';
        var iname3 = '';
        var inameid = '';
        var swift = '';
        var source = '';
        var iid = '';
        var radio = '';
        var customfields = nlapiSelectNodes(node1, "//*[name()='CustomField']");
        var custfields = nlapiSelectNodes(node1, "//*[name()='TabStatus']");
        if (custfields != null)
            nlapiLogExecution("DEBUG", 'tab status', custfields.length);
        for (i = 0; i < custfields.length; i++) {
            child = custfields[i].firstChild;
            while (child.nodeName != 'TabLabel') {
                child = child.nextSibling;
            }
            //Beneficiary Bank
            //SWIFT Number
            //Routing Number
            //Beneficiary
            //Bank Account Number
            //for (x in child)
            //nlapiLogExecution('DEBUG',x,child[x]);
            nlapiLogExecution('DEBUG', child.nodeName, child.getTextContent());
            if (child.getTextContent() == 'Account Number') {
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    acctnum = child.getTextContent();
                //nlapiLogExecution('DEBUG', 'acctnum', acctnum);
            }
            else if (child.getTextContent() == 'Investor Name2') {  // beneficiary
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    ben = child.getTextContent();
            }
            else if (child.getTextContent() == 'Beneficiary Bank') {
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    benbank = child.getTextContent();
            }
            else if (child.getTextContent() == 'CHIPS Number') {
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    chips = child.getTextContent();
            }
            else if (child.getTextContent() == 'SWIFT Number') {
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    swift = child.getTextContent();
            }

            else if (child.getTextContent() == 'Radio Group 1') {

                child = child.nextSibling;
                var selected = child.getTextContent();
                child = child.nextSibling;

                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }

                if ((selected == 'Radio1')
                    && child.getTextContent() == 'X')
                    radio = 1; // Please accrue my annual preferred returns and pay them together with the return of my principal payment, or during a future round of annual preferred-return distributions.
                else if ((selected == 'Radio2')
                    && child.getTextContent() == 'X')
                    radio = 2; // Please wire my annual preferred return to the following bank account on a yearly basis:

                nlapiLogExecution('DEBUG', 'radio', radio + ' ' + child.getTextContent());
            }

            else if (child.getTextContent() == 'CustId') {
                child = child.nextSibling;
                while (child.nodeName != 'TabValue') {
                    child = child.nextSibling;
                }
                if (child.getTextContent() != '')
                    custId = child.getTextContent();

                if (!custId)
                    throw "customrecord_investor_mailing_list id is missing";

                nlapiLogExecution('DEBUG', 'customrecord_investor_mailing_list id', custId);
                var investorId = nlapiLookupField('customrecord_investor_mailing_list', custId, 'custrecord_ml_id');
                nlapiLogExecution('DEBUG', 'investor id', investorId);
                var r = nlapiSearchRecord('job', null,
                    [new nlobjSearchFilter('custentity7', null, 'is', investorId)]);
                projectId = r[0].getId();
                if (!projectId) throw 'Project record not found: customrecord_investor_mailing_list id ' + custId;

                nlapiSubmitField('job', projectId, 'custentity_bec', 'F');

                r = nlapiSearchRecord('opportunity', null,
                    [new nlobjSearchFilter('custbody_investor_id', null, 'is', investorId)]);
                aiq = r[0].getId();
                if (!aiq) throw 'AIQ record not found: customrecord_investor_mailing_list id ' + custId;
            }
        }

        /*
         for (i = 0; i < customfields.length; i++) {
         child = customfields[i].firstChild;
         while (child.nodeName != 'Name') {
         child = child.nextSibling;
         }
         if (child.firstChild.nodeValue == 'CustId') {
         child = child.nextSibling;
         while (child.nodeName != 'Value') {
         child = child.nextSibling;
         }
         cust = child.firstChild.nodeValue;
         nlapiLogExecution('DEBUG', 'cust', cust);
         }
         if (child.firstChild.nodeValue == 'AIQID') {
         child = child.nextSibling;
         while (child.nodeName != 'Value') {
         child = child.nextSibling;
         }
         aiq = child.firstChild.nodeValue;
         nlapiLogExecution('DEBUG', 'aiq', aiq);
         }
         if (child.firstChild.nodeValue == 'Source') {
         child = child.nextSibling;
         while (child.nodeName != 'Value') {
         child = child.nextSibling;
         }
         source = child.firstChild.nodeValue;
         nlapiLogExecution('DEBUG', 'source', source);
         }
         if (child.firstChild.nodeValue == 'InvId') {
         child = child.nextSibling;
         while (child.nodeName != 'Value') {
         child = child.nextSibling;
         }
         iid = child.firstChild.nodeValue;
         nlapiLogExecution('DEBUG', 'iid', iid);
         }
         }
         */

        var pdfname = '';
        var pdfvalue = '';

        var pdfs = nlapiSelectNodes(node1, "//*[name()='DocumentPDF']");
        for (i = 0; i < pdfs.length; i++) {
            child = pdfs[i].firstChild;
            nlapiLogExecution('DEBUG', 'pdf name ' + i, child.firstChild.nodeValue);
            if (child.firstChild.nodeValue == 'bankinfo.pdf') {
                pdfname = child.firstChild.nodeValue;
                child = child.nextSibling;
                while (child.nodeName != 'PDFBytes') {
                    child = child.nextSibling;
                }
                pdfvalue = child.firstChild.nodeValue;
            }
        }
        //var rec=nlapiCreateRecord('customrecord_t');
        //rec.setFieldValue('custrecord_t',XMLRequest);
        //nlapiSubmitRecord(rec);
        var makefile = true;
        /*
         if (cust.length == 0) {
         makefile = false;
         nlapiLogExecution('DEBUG', 'customer id missing', 'the netsuite customer id was not found in the xml request.');
         }
         */
        if (pdfname.length == 0) {
            makefile = false;
            nlapiLogExecution('DEBUG', 'pdf name missing', 'the pdf name was not found.');
        }
        if (pdfvalue.length == 0) {
            makefile = false;
            nlapiLogExecution('DEBUG', 'pdf value missing', 'the pdf bytes were not found.');
        }


        nlapiLogExecution('DEBUG', 'fields', projectId + ' ' + aiq + ' ' + radio + ' '
            + benbank + ' ' + swift + ' ' + chips + ' ' + ben + ' ' + acctnum);

        if (makefile == true) {

            var year = new Date().getFullYear();

            var file = nlapiCreateFile(investorId + ' ' + year.toString() + ' ' + pdfname, 'PDF', pdfvalue);
            file.setFolder(141);
            var fid = nlapiSubmitFile(file);
            nlapiAttachRecord('file', fid, 'job', projectId);
            //nlapiAttachRecord('file',fid,'salesorder',order);
            //nlapiSubmitField('salesorder',order,'custbody_tandc_attached','T');
            //var regex=/[0-9]/;

            //nlapiAttachRecord('file',fid,'salesorder',order2);
            //nlapiSubmitField('salesorder',order2,'custbody_tandc_attached','T');
            var wire_rec = nlapiCreateRecord('customrecord_ye_wire_form');
            wire_rec.setFieldValue('custrecord_wire_year', year.toString());
            wire_rec.setFieldValue('custrecord_ben', ben);
            wire_rec.setFieldValue('custrecord_wire_bankname', benbank);
            wire_rec.setFieldValue('custrecord_wire_swift', swift);
            wire_rec.setFieldValue('custrecord_wire_routing_number', chips);
            wire_rec.setFieldValue('custrecord_wire_acct_num', acctnum);
            wire_rec.setFieldValue('custrecord_wire_project', projectId);
            wire_rec.setFieldValue('custrecord_wire_aiq', aiq);
            wire_rec.setFieldValue('custrecord_wire_iid', investorId);
            if (chips.toLowerCase() == 'na' || chips.toLowerCase() == 'n/a') {
                wire_rec.setFieldValue('custrecord_domestic_wire', 2);
            }
            else {
                wire_rec.setFieldValue('custrecord_domestic_wire', 1);
            }

            if (source == 2)
                source = 1;
            if (source == 3)
                source = 2;
            if (source == 4)
                source = 3;
            if (source == 7)
                source = 4;
            if (source == 6)
                source = 5;
            //wire_rec.setFieldValue('custrecord_wire_source_acct',source);

            if (radio == 1)
                wire_rec.setFieldValue('custrecord_wire_accrue', 'T');

            nlapiSubmitRecord(wire_rec);

            nlapiSubmitField('job', projectId, 'custentity_bec', 'T');

            nlapiLogExecution('DEBUG', 'success', 'success');
        }
    }
}


//demo templates
//f1c E27DB481-2D98-4FC1-B988-FCBE699C1D7D
//f1nc C1F4F2CF-98BD-4723-BC48-5E089591A69B
//f2c AB5109E7-EA94-4E9C-A1D0-A6102AB01768
//f2nc 266790BC-88C5-4D6B-924F-3C6883DCAC6F
//f3c 729F0262-5548-4587-9FB4-0FEB1D5AD445
//f3nc 1B63AFEB-F7AA-498C-97E9-D2BCDB568C9D
//f5c DC2EE76F-4213-43AD-8990-29D9BD5305FA
//f5nc 5DD4D915-38DC-4236-A875-4636AC8D17E0
//f6c 5A965919-B470-4162-9CB7-36475774EE15
//f6nc E75C530D-BCED-4A60-BF9F-5AD8E49B1BF4
//name, id, name + id, address, email
//e27db481-2d98-4fc1-b988-fcbe699c1d7d

function get_en_subject(date, fund) {
    var subj = nlapiLookupField('customrecord_wire_subj_body', 1, 'custrecord_engsub');
    subj = subj.split('***').join(fund);
    return subj;
}
function get_en_body(date, fund, name, id) {
    var body = nlapiLookupField('customrecord_wire_subj_body', 1, 'custrecord_eng_body');
    body = body.split('***').join(fund);
    body = body.split('---').join(name);
    body = body.split('|||').join(id);
    return body;
}
function get_ch_subject(date, fund, project) {
    //return project+"投资利息收益银行信息 – 请于2016年11月15日前回复";
    var subj = nlapiLookupField('customrecord_wire_subj_body', 1, 'custrecord_chsub');
    subj = subj.split('***').join(fund);
    subj = subj.split('###').join(project);
    return subj;
}
function get_ch_body(date, fund, id, name) {
    var body = nlapiLookupField('customrecord_wire_subj_body', 1, 'custrecord_eng_body');
    body = body.split('***').join(fund);
    body = body.split('---').join(name);
    body = body.split('|||').join(id);
    return body;
}
