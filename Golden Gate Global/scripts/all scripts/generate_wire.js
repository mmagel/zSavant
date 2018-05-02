function print_wires(recType,recId){
	//chang hong 2875
	var domurl='https://system.na1.netsuite.com/core/media/media.nl?id=428&c=3741441&h=cf23dc446a3c654495e4&_xt=.pdf';
	var inturl='https://system.na1.netsuite.com/core/media/media.nl?id=427&c=3741441&h=2cedc69eb727beaf9321&_xt=.pdf';
	var fields=nlapiLookupField(recType,recId,['custrecord_wire_project','custrecord_wire_bankname',
	      'custrecord_domestic_wire','custrecord_wire_source_acct','custrecord_wire_swift','custrecord_wire_routing_number',
	      'custrecord_wire_acct_num','custrecord_wire_amount','custrecord_ben','custrecord_wire_iid']);
	var source=nlapiLookupField('job',fields.custrecord_wire_project,'subsidiary');
	var beneficiary=nlapiLookupField('job',fields.custrecord_wire_project,'custentity23');
	if (fields.custrecord_ben==''){
		var aa=beneficiary.split(',');
		beneficiary=aa[1]+' '+aa[0];
	}
	else {
		beneficiary=fields.custrecord_ben;
	}
	var is=nlapiSearchRecord('customrecord_sdm_quarterly_statement',null,
			[new nlobjSearchFilter('custrecord_sdm_is_investor_id',null,'is',fields.custrecord_wire_iid),new nlobjSearchFilter('custrecord_sdm_is_quarter_end',null,'on','12/31/2015')],new nlobjSearchColumn('custrecord_sdm_is_pref_return'));
	var bank=fields.custrecord_wire_bankname;
	var dori=fields.custrecord_domestic_wire;
	var src_acct=nlapiLookupField(recType,recId,'custrecord_wire_source_acct',true);
	var swift=fields.custrecord_wire_swift;
	var routing=fields.custrecord_wire_routing_number;
	var acct_num=fields.custrecord_wire_acct_num;
	var amount=is[0].getValue('custrecord_sdm_is_pref_return');
	var fund='';
	var phone='1-415-986-8888 X188';
	var pdf='';
	var num='';
	nlapiLogExecution('ERROR','dori',dori);
	nlapiLogExecution('ERROR','dori',routing);
	if (dori==1){
		pdf=domurl;
		num=routing;
	}
	else {
		pdf=inturl;
		num=swift;
	}
	if (source==2){
		src_acct='80-03012229';
		 fund='Golden State Investment Fund I, LLC';
	}
	if (source==3){
		src_acct='80-03022897';
		fund='Golden State Investment Fund II, LLC';
	}
	if (source==4){
		src_acct='86-24000827';
		fund='Golden State Investment Fund III, LLC';
	}
	if (source==7){
		src_acct='86-08004654';
		fund='SFBARC Fund 5, LLC';
	}
	if (source==6){
		src_acct='86-08004589';
		fund='3g Fund 6, LLC';
	}
	nlapiLogExecution('ERROR','pdf',pdf);
	var xml=get_xml(pdf);
	//xml+='<p>&nbsp;</p></body></pdf>';
	xml+='<div><div top="12" left="190"><p>'+format_number(amount)+'</p></div>';
	xml+='<div top="36" left="425"><p>'+src_acct+'</p></div>';
	xml+='<div top="95" left="-8"><p>'+fund+'</p></div>';
	xml+='<div top="58" left="322"><p>'+phone+'</p></div>';
	
	xml+='<div top="70" left="-8"><p>'+bank+'</p></div>';
	xml+='<div top="30" left="282"><p>'+beneficiary+'</p></div>';
	
	xml+='<div top="110" left="-8"><p>'+num+'</p></div>';
	xml+='<div top="-6" left="282"><p>'+acct_num+'</p></div>';
	//ginny
	var gin='https://system.na1.netsuite.com/core/media/media.nl?id=6193&c=3741441&h=ba3a53b4fb92e2973380';
	//steve
	var steve='https://system.na1.netsuite.com/core/media/media.nl?id=443&c=3741441&h=44f9067269a2bf90b3b1';
	var date=nlapiDateToString(new Date);
	xml+='<div top="146" left="10"><img width="60" height="18" src="'+steve+'"/></div>';
	xml+='<div top="122" left="188"><p>'+date+'</p></div>';
	xml+='<div top="80" left="300"><img width="52" height="26" src="'+gin+'"/></div>';
	xml+='<div top="58" left="468"><p>'+date+'</p></div>';
	xml+='</div><pbr/><p>&nbsp;</p></body></pdf>';
	xml=nlapiXMLToPDF(xml.replace(/&/g,'&amp;').replace(/&amp;nbsp;/g,'&nbsp;'));
	xml.setName(fields.custrecord_wire_iid+' '+beneficiary+'.pdf');
	if (dori!=1){
	//int
	xml.setFolder(143);
	}
	else {
	//dom
	xml.setFolder(144);
	}
	nlapiSubmitFile(xml);
	//nlapiSendEmail(7083,'ahalbleib@sdmayer.com','test','test',null,null,null,xml);
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
	'<pdf><body background-pdf="'+url+'" font-size="12">';
	
	return xml;
}