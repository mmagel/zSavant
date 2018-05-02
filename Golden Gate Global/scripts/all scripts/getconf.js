function print_wires(recType,recId){
	//chang hong 2875
	try {
	var churl='https://system.na1.netsuite.com/core/media/media.nl?id=16849&c=3741441&h=46af6b6b0180a6e186c5&_xt=.pdf';
	var engurl='https://system.na1.netsuite.com/core/media/media.nl?id=16850&c=3741441&h=4a81ea8adf84d0db5869&_xt=.pdf';
	var fields=nlapiLookupField(recType,recId,['custrecord_wire_project','custrecord_wire_bankname',
	      'custrecord_domestic_wire','custrecord_wire_source_acct','custrecord_wire_swift','custrecord_wire_routing_number',
	      'custrecord_wire_acct_num','custrecord_wire_amount','custrecord_ben','custrecord_wire_iid']);
	var source=nlapiLookupField('job',fields.custrecord_wire_project,'subsidiary');
	var beneficiary=nlapiLookupField('job',fields.custrecord_wire_project,'custentity23');
	var iid=nlapiLookupField('job',fields.custrecord_wire_project,'custentity7');
	if (fields.custrecord_ben==''){
		var aa=beneficiary.split(',');
		beneficiary=aa[1]+' '+aa[0];
	}
	else {
		beneficiary=fields.custrecord_ben;
	}

	var bank=fields.custrecord_wire_bankname;
	var dori=fields.custrecord_domestic_wire;
	var src_acct=nlapiLookupField(recType,recId,'custrecord_wire_source_acct',true);
	var swift=fields.custrecord_wire_swift;
	var routing=fields.custrecord_wire_routing_number;
	var acct_num=fields.custrecord_wire_acct_num;
	//var amount=is[0].getValue('custrecord_sdm_is_pref_return');
	var fund='';
	var phone='1-415-986-8888 X188';
	var pdf='';
	var num='';
var country=nlapiGetContext().getSetting('SCRIPT','custscript_c');
var lang='';


	
	var aiq=nlapiSearchRecord('opportunity',null,new nlobjSearchFilter('custbody_investor_id',null,'is',iid),new nlobjSearchColumn('internalid'));
	if (aiq==null){
		nlapiLogExecution('ERROR','no aiq',iid);
		return;
	}
	aiq=aiq[0].getValue('internalid');
	var chname=nlapiLookupField('job',fields.custrecord_wire_project,'custentity35');
	//var chname=fields.custentity35;
	var chln='';
	if (chname!=null&&chname!=''){
		//nlapiLogExecution('ERROR','chln',chname.substring(0,1));
		chln=chname.substring(0,1);
	}
	var chnameid=chname+' '+iid;
	var aiqfields=nlapiLookupField('opportunity',aiq,['custbody24','custbody29','custbody148','custbody149']);
	var fn=aiqfields.custbody148;
	var ln=aiqfields.custbody149;
	if (chln==''){
		chln=ln;
	}
	//var chln=aiqfields.custbody149;
	var nameid=fn+' '+ln+' '+id;
	var name=fn+' '+ln;
	var maritalstat=aiqfields.custbody29;
	var gender=nlapiLookupField('job',fields.custrecord_wire_project,'custentity_sdm_gender');
	if (gender==1){
		title='Mr. ';
		chtitle='先生';
	}	
	else if (maritalstat==4||maritalstat==6||maritalstat==7){
		title='Mrs.';
		chtitle='女士';
	} 
	else {
		title='Ms.';
		chtitle='小姐';
	}
	var ennametit=title+' '+ln
	var nametit=chln+chtitle;
	
	
	if (source==2){
		 fund='Fund I';
		 longfund='Golden State Investment Fund I, LLC';
		 gsrv='GSRV I Management, LLC';
		if (country.toLowerCase()=='china'||country.toLowerCase()=='ch'){
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16849&c=3741441&h=46af6b6b0180a6e186c5&_xt=.pdf';
		}
		else {
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16850&c=3741441&h=4a81ea8adf84d0db5869&_xt=.pdf';
		}
	}
	if (source==3){
		fund='Fund II';
		longfund='Golden State Investment Fund II, LLC';
		gsrv='GSRV II Management, LLC';
		if (country.toLowerCase()=='china'||country.toLowerCase()=='ch'){
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16875&c=3741441&h=bcb62d7657fb4773e441&_xt=.pdf';
		}
		else {
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16874&c=3741441&h=e6134fbda9431023fece&_xt=.pdf';
		}
	}
	if (source==4){
		fund='Fund III';
		longfund='Golden State Investment Fund III, LLC';
		gsrv='GSRV III Management, LLC';
		if (country.toLowerCase()=='china'||country.toLowerCase()=='ch'){
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16873&c=3741441&h=3213eaa2e9a8e62edeb1&_xt=.pdf';
		}
		else {
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16872&c=3741441&h=61552eb4d110d41ac7b8&_xt=.pdf';
		}
	}
	if (source==7){
		fund='Fund 5';
		longfund='SFBARC FUND 5, LLC';
		gsrv='SFBARC FUND 5 Management, LLC';
		if (country.toLowerCase()=='china'||country.toLowerCase()=='ch'){
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16870&c=3741441&h=848db47accd40946eeb7&_xt=.pdf';
		}
		else {
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16871&c=3741441&h=bea91d7d2ffd17fc542a&_xt=.pdf';
		}
	}
	if (source==6){
		fund='Fund 6';
		longfund='3G Fund 6, LLC';
		gsrv='3G Fund 6 Management, LLC';
		if (country.toLowerCase()=='china'||country.toLowerCase()=='ch'){
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16869&c=3741441&h=970d511b2a9ab383144e&_xt=.pdf';
		}
		else {
			template='https://system.na1.netsuite.com/core/media/media.nl?id=16868&c=3741441&h=7a1ee79c885da8fd9c6b&_xt=.pdf';
		}
	}
	if (country=='china'){
		titlename=chln+chtitle;
		var sub=get_ch_subject();
		body=get_ch_body(fund,titlename,iid,longfund,gsrv,'https://system.na1.netsuite.com/core/media/media.nl?id=444&c=3741441&h=2fdfca9a35c55e253508',nlapiLookupField('customrecord_sdm_inv_statement_vars',6,'custrecord_email_body'));
		lang='ch';
	}
	else{
		lang='en';
		titlename=ennametit;
		var body=get_en_body(fund,titlename,iid,longfund,gsrv,'https://system.na1.netsuite.com/core/media/media.nl?id=444&c=3741441&h=2fdfca9a35c55e253508',nlapiLookupField('customrecord_sdm_inv_statement_vars',6,'custrecord_email_body'));
		var sub=get_en_subject();
	}
	pdf=template;
var xml=get_xml(pdf);

	//nlapiLogExecution('ERROR','test',bank+' '+swift+' '+routing+' '+beneficiary+' '+acct_num+' '+country);
	if (country=='china'){
		var arr=getchindeces(source);
	xml+='<div top="'+arr[0]+'" left="274" ><p>'+getnb(bank)+'</p></div>';
	xml+='<div top="'+arr[1]+'" left="274" ><p>'+getnb(swift)+'</p></div>';
	xml+='<div top="'+arr[2]+'" left="274" ><p>'+getnb(routing)+'</p></div>';
	xml+='<div top="'+arr[3]+'" left="274" ><p>'+getnb(beneficiary)+'</p></div>';
	xml+='<div top="'+arr[4]+'" left="274" ><p>'+getnb(acct_num)+'</p></div>';
	}
	else {
		xml+='<div top="230" left="300" ><p>'+getnb(bank)+'</p></div>';
	xml+='<div top="222" left="300" ><p>'+getnb(swift)+'</p></div>';
	xml+='<div top="212" left="300" ><p>'+getnb(routing)+'</p></div>';
	xml+='<div top="198" left="300" ><p>'+getnb(beneficiary)+'</p></div>';
	xml+='<div top="188" left="300" ><p>'+getnb(acct_num)+'</p></div>';
	}

	//xml+='<pbr/><p>&nbsp;</p>';
	xml+='<pbr/><p>&nbsp;</p>'
	xml+='<pbr/><p>&nbsp;</p>'
	xml+='</body></pdf>';
	xml=nlapiXMLToPDF(xml.replace(/&/g,'&amp;').replace(/&amp;nbsp;/g,'&nbsp;'));
	xml.setName(iid+' '+beneficiary+' '+lang+'.pdf');

	

	xml.setFolder(12592);
	nlapiSubmitFile(xml);
	var email=nlapiLookupField('job',fields.custrecord_wire_project,'custentity_sdm_email');
	if (email.indexOf(',')>-1){
		email=email.split(',');
	}
	else if (email.indexOf(';')>-1){
		email=email.split(';');
	}
  nlapiSendEmail(7453,email,sub,body,null,null,{entity:fields.custrecord_wire_project},xml);
	}
	catch(e){
		nlapiLogExecution('ERROR',iid,e.message);
	}
}
function getchindeces(s){
	if (s==2){
		return [230,222,222,224,226];
	}
	if (s==3){
		return [244,236,238,230,232];
	}
	if (s==4){
		return [244,236,238,230,232];
	}
	if (s==7){
		return [234,224,230,226,226];
	}
	if (s==6){
		return [236,224,228,224,226];
	}
	return [230,222,222,224,226];
}
function getnb(s){
	if (s==''||s==null||typeof s=='undefined'){
		return '&nbsp;'
	}
	return s;
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
function get_en_subject(){
	return "Please confirm payment Instructions for Your EB-5 Investment – RESPONSE REQUIRED";
}
function get_en_body(fund,titlename,iid,longfund,gsrv,sig,sdmsig){
var mess='';
mess+='Dear '+ fund +  ' investor '+ titlename+', Investor ID '+ iid+':<br/><br/>';
 
mess+='As an EB-5 investor and member of '+longfund+', this email is to confirm the wiring instructions for your annual interest payment.<br/><br/>';
 
mess+='Currently, you have chosen to receive your annual preferred return. Please review the attached file with bank account information you have provided to us previously.<br/><br/>';
 
mess+='<b>If you wish to continue receiving your annual preferred return into the above bank account, please just reply to this email and copy the following text into your message:</b><br/><br/>';
 
mess+='<b>“Yes, I confirm the wire information in your letter is correct.”</b><br/><br/>';
 
mess+='If you want to change your payment option and/or wire instruction, please provide a response to the questions on the third page of the attached PDF and sign the bottom of the page as confirmation by sending a signed notification letter to us via email to: accounting@3gfund.com by November 15, 2016. <br/><br/>';
 
mess+='If we do not receive your response by November 15, 2016, we will assume that you consent for us to use the current bank information in our system (as shown in the attached document) to receive your annual preferred return.<br/><br/>';
 
mess+='Please let us know if you have any questions or comments.<br/><br/>';
 
mess+='Sincerely,<br/><br/>';
 
mess+=longfund +'<br/>'
mess+=  ' a California limited liability company<br/><br/>';                                   
                                                                                                         
mess+='By:'+ gsrv+'<br/>';
mess+=    '     a California limited liability company<br/><br/>Its Manager<br/>';
mess+=       '<img src="'+sig+'"/> <br/><br/><br/><br/><br/>'  ;
 
 
 
 
 
mess+='Name: Ginny Fang<br/>';
mess+='Title:   CEO<br/><br/>';

mess+=sdmsig;
return mess;
}
function get_ch_subject(){
	return "关于您EB-5投资金利息支付方式说明 – 请及时回复";
}
function get_ch_body(fund,titlename,iid,longfund,gsrv,sig,sdmsig){
	var mess='';
mess+='尊敬的投资人'+titlename+', 投资者编号'+iid+',您好，<br/><br/>';

mess+='鉴于您是'+longfund+'的一名EB-5投资者，我们借由此邮件确认您收取年息所使用的银行账户信息。<br/><br/>';

mess+='您现在的选择为每年如期接收您的年息。请确认附件中您以前提供的银行信息是否正确。<br/><br/>';
mess+='<b>如您希望继续用相同的银行账户接受您的年息，请回复本邮件并将以下文本复制在您的回复中：</b><br/>';
mess+='<b>“是的，确认来信中的银行信息是正确的。”</b><br/><br/>';

mess+='如果您希望改变您关于支付方式的选择或/并更改您的银行信息，请在附件第三页填写提供您新的选择及信息并签字。请于2016年11月15日之前将完整并签字的表格以电子邮件的方式发往Fund，收件人地址为：accounting@3gfund.com.<br/><br/>';

mess+='如果我们在截止日期2016年11月15日前没有收到您的回复，我们会按照您已确认本附件所示的银行信息进行处理。<br/><br/>';

mess+='此致<br/>';
mess+='敬礼<br/>';


mess+=longfund+'<br/><br/>';
mess+='加利福尼亚州的一家有限责任公司<br/><br/>';                                
                                                                                                         
mess+='By: '+gsrv;
mess+='     加利福尼亚州的一家有限责任公司<br/>';
mess+='     负责人<br/><br/>';
mess+=       '<img src="'+sig+'"/><br/><br/><br/><br/><br/>'  ;
 

mess+='Name: Ginny Fang<br/>';
mess+='Title:   首席执行官<br/><br/>';

mess+=sdmsig;

return mess;
}