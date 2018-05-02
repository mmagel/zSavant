function print_wires(recType,recId){
	//chang hong 2875
	try {
	var copyb='https://system.na1.netsuite.com/core/media/media.nl?id=6250&c=3741441&h=aa4f7216d69bb04f1ad2&_xt=.pdf';
	var copyc='https://system.na1.netsuite.com/core/media/media.nl?id=6251&c=3741441&h=855719156febe9e5a88e&_xt=.pdf';
	var copyd='https://system.na1.netsuite.com/core/media/media.nl?id=6252&c=3741441&h=f69b395b6185cb6dc633&_xt=.pdf';
	var fields=nlapiLookupField(recType,recId,['custentity_fed_tax_withheld','custentity_net_year_income',
	      'custentity_gross_year_income','custentity_address1','custentity_address2','custentity7','custentity236','custentity_sdm_email']);
	
	var source=nlapiLookupField(recType,recId,'subsidiary');
	var beneficiary=nlapiLookupField(recType,recId,'custentity23');
	var gggaddr1='One Sansome Street, Suite 2080';
	var gggaddr2='San Francisco, CA 94104';
	var investoraddr1=fields.custentity_address1;
	var investoraddr2=fields.custentity_address2;
	var iid=fields.custentity7;
	var gross_income=fields.custentity_gross_year_income;
	var net_income=fields.custentity_net_year_income;
	var tax=fields.custentity_fed_tax_withheld;
	var tax_rate=nlapiSearchRecord('customrecord_sdm_inv_statement_vars',null,new nlobjSearchFilter('custrecord_subsidiary',null,'anyof',source),new nlobjSearchColumn('custrecord_sdm_fed_tax_rate'))[0].getValue('custrecord_sdm_fed_tax_rate');
	var tin='';
	var code='01';
	var fund='';
	var phone='1-415-986-8888 X188';
	var pdf='';
	var num='';
	var cover='';
	var k1cover='';
	var email=fields.custentity_sdm_email;
	try {
		email=email.split(",");
	}
	catch (e){
		
	}
	//45-2103728
	if (source==2){
		tin='45-2103728';
		 fund='Golden State Investment Fund I, LLC';
		 cover=nlapiLoadFile(7143);
		 k1cover=nlapiLoadFile(10949);
	}
	if (source==3){
		tin='45-2654350';
		fund='Golden State Investment Fund II LLC';
		cover=nlapiLoadFile(7144);
		k1cover=nlapiLoadFile(10950);
	}//cao, xuan gu, xiaole
	if (source==4){
		tin='90-0776894';
		fund='Golden State Investment Fund III, LLC';
		cover=nlapiLoadFile(7145);
		k1cover=nlapiLoadFile(10624);
	}
	if (source==7){
		tin='38-3933725';
		fund='SFBARC Fund 5, LLC';
		cover=nlapiLoadFile(7146);
		k1cover=nlapiLoadFile(7147);
	}
	if (source==6){
		tin='37-1759080';
		fund='3g Fund 6, LLC';
		cover=nlapiLoadFile(7148);
	}
	//cheng, caixia
	//xu, yi 3
	//chang, hong 6
	//cao, xuan
	//cheng, linjun 1
	var file1=get_pdf(copyb,code,gross_income,tax_rate,net_income,tax,tin,fund,gggaddr1,gggaddr2,beneficiary,investoraddr1,investoraddr2,iid,'1042s Copy B');
	var file2=get_pdf(copyc,code,gross_income,tax_rate,net_income,tax,tin,fund,gggaddr1,gggaddr2,beneficiary,investoraddr1,investoraddr2,iid,'1042s Copy C');
	var file3=get_pdf(copyd,code,gross_income,tax_rate,net_income,tax,tin,fund,gggaddr1,gggaddr2,beneficiary,investoraddr1,investoraddr2,iid,'1042s Copy D');
	file1.setFolder(4652);
	var fid=nlapiSubmitFile(file1);
	//nlapiSendEmail(7083,'ahalbleib@sdmayer.com','test','test',null,null,null,[file1,file2,file3]);
	var emailtext=nlapiSearchRecord('customrecord_k11042',null,new nlobjSearchFilter('custrecord_k1_sub',null,'anyof',source),
			[new nlobjSearchColumn('custrecord_k1_subj'),new nlobjSearchColumn('custrecord_k1_included_body'),
			 new nlobjSearchColumn('custrecord_nok1_subj'),new nlobjSearchColumn('custrecord_nok1_body')]);
	var subject='';
	var body='';
	if (fields.custentity236=='T' && (source==7||source==4||source==2||source==3)){
		subject=emailtext[0].getValue('custrecord_k1_subj');
		body=emailtext[0].getValue('custrecord_k1_included_body');
		var k1s='';
		if (source==7){
			k1s=nlapiSearchRecord(null,'customsearch351');
		}
		else if (source==4){
			k1s=nlapiSearchRecord(null,'customsearch357');
		}
		else if (source==2){
			k1s=nlapiSearchRecord(null,'customsearch363');
		}
		else if (source==3){
			k1s=nlapiSearchRecord(null,'customsearch364');
		}
		var k1found=false;
		for (var i=0;i<k1s.length;i++){
			var cols=k1s[i].getAllColumns();
			if (k1s[i].getValue(cols[0]).search(iid)>-1){
				var k1=nlapiLoadFile(k1s[i].getValue(cols[1]));
				var k1id=k1s[i].getValue(cols[1]);
				k1found=true;
				break;
			}
		}
		nlapiLogExecution('ERROR','k1','1');
		if (k1found){
			//nlapiLogExecution('ERROR','k1','2');
			//nlapiSendEmail(7083,7083,subject,body,null,null,{'entity':recId},[k1,k1cover]);
			nlapiAttachRecord('file',k1id,'job',recId);
			//['bwu@3gfund.com','ir@3gfund.com']
			nlapiSendEmail(7083,email,subject,body,['bwu@3gfund.com','ir@3gfund.com'],null,{'entity':recId},[k1,k1cover]);
			//nlapiSendEmail(7083,'ahalbleib@sdmayer.com',subject,body,null,null,{'entity':recId},[file1,file2,file3,cover,k1,k1cover]);
			//nlapiSendEmail(7083,'ahalbleib@sdmayer.com',subject,body,null,null,{'entity':recId},[k1,k1cover]);
			
		}
		else {
			nlapiLogExecution('ERROR','no k1 found',iid);
		}
	}
	else {
			subject=emailtext[0].getValue('custrecord_nok1_subj');
			body=emailtext[0].getValue('custrecord_nok1_body');
			//'accounting@3gfund.com','bham@sdmayer.com',
			//nlapiSendEmail(7083,email,subject,body,['bwu@3gfund.com','ir@3gfund.com'],null,{'entity':recId},[file1,file2,file3,cover]);
	}
			nlapiAttachRecord('file',fid,'job',recId);
	}
	catch(e){
		nlapiLogExecution('ERROR','error',recId+' '+e.message);
	}
}
function get_pdf(pdf,income_code,gross_income,tax_rate,net_income,tax,tin,fund,fund_addr1,fund_addr2,recipient,rec_addr1,rec_addr2,iid,form){

	var xml=get_xml(pdf);
	//xml+='<p>&nbsp;</p></body></pdf>';
	xml+='<div><div position="absolute" top="54" left="25"><p>'+income_code+'</p></div>';
	xml+='<div position="absolute" top="54" left="60"><p>'+format_number(gross_income)+'</p></div>';
	xml+='<div position="absolute" top="54" left="167"><p>'+tax_rate+'</p></div>';
	xml+='<div position="absolute" top="54" left="245"><p>'+tax_rate+'</p></div>';
	
	xml+='<div position="absolute" top="42" left="340"><p>'+format_number(net_income)+'</p></div>';
	xml+='<div position="absolute" top="54" left="360"><p>'+format_number(tax*-1)+'</p></div>';
	
	xml+='<div position="absolute" top="100" left="25"><p>'+tin+'</p></div>';
	xml+='<div position="absolute" top="118" left="136"><p font-size="6pt">'+fund+'</p></div>';

	xml+='<div position="absolute" top="160" left="25">><p>'+income_code+'</p></div>';
	xml+='<div position="absolute" top="184" left="25">><p>'+fund_addr1+'</p></div>';
	xml+='<div position="absolute" top="208" left="25"><p>'+fund_addr2+'</p></div>';
	xml+='<div position="absolute" top="268" left="25">><p>'+recipient+'</p></div>';
	xml+='<div position="absolute" top="294" left="25"><p font-size="6pt">'+rec_addr1+'</p></div>';
	xml+='<div position="absolute" top="314" left="25"><p>'+rec_addr2+'</p></div>';
	xml+='<div position="absolute" top="294" left="282"><p font-size="6pt">'+fund+'</p></div>';
	xml+='<div position="absolute" top="294" left="390"><p>'+tin+'</p></div>';
	xml+='</div><pbr/><p>&nbsp;</p></body></pdf>';
	xml=nlapiXMLToPDF(xml.replace(/&/g,'&amp;').replace(/&amp;nbsp;/g,'&nbsp;'));
	xml.setName(iid+' '+form+'.pdf');
	return xml;
}
function format_number(int){
    var n = int, 
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
       return s+(j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }
function get_xml(url){
	var xml = "<?xml version=\"1.0\"?>" +
	'<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">'+
	'<pdf><body background-pdf="'+url+'" font-size="8">';
	
	return xml;
}