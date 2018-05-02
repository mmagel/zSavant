function sales_order_shipto_client(type,name,linenum){
	if (name=='custbody_st_location'){
		var st=nlapiGetFieldValue(name);
		if (st!=''&&st!=null){
			nlapiSetFieldValue('shipaddresslist','',false);
			var con=nlapiLookupField('customrecord_customer_parent',st,['custrecord_shipto_name','custrecord_shipto_customer','custrecord_shipto_country','custrecord_shipto_state'],true);
			var f=nlapiLookupField('customrecord_customer_parent',st,
			['custrecord_shipto_customer',
			'custrecord_shipto_zip',
			'custrecord_shipto_country',
			'custrecord_shipto_state',
			'custrecord_shipto_city','custrecord_shipto_address2','custrecord_shipto_address1','custrecord_shipto_name','custrecord_phone']);
			nlapiSetFieldValue('custbody_st_contact',f.custrecord_shipto_name,false);
			nlapiSetFieldValue('custbody_st_customer',f.custrecord_shipto_customer,false);

			
			var string=nlapiLookupField('contact',f.custrecord_shipto_name,'entityid')+'\n'+nlapiLookupField('customer',f.custrecord_shipto_customer,'altname')+'\n'+f.custrecord_shipto_address1+'\n'+ ((f.custrecord_shipto_address2!=null&&f.custrecord_shipto_address2!='')?(f.custrecord_shipto_address2+'\n'):'')
			+f.custrecord_shipto_city+' '+con.custrecord_shipto_state+' '+f.custrecord_shipto_zip+'\n'+con.custrecord_shipto_country;
			//addr.setFieldValue()
			
			//alert(string+' '+f.custrecord_shipto_address2);
			//nlapiSetFieldValue('shippingaddress', string);
			nlapiSetFieldValue('shipaddress', string);
		}
		else {
			nlapiSetFieldValue('shipaddresslist','');
		}
	}
	if (name=='custbody_st_customer'||name=='custbody_st_contact'){
		var filters=new Array();
		var cust=nlapiGetFieldValue('custbody_st_customer');
		var con=nlapiGetFieldValue('custbody_st_contact');
		if (nlapiGetUser()==13)
		//alert('a b'+cust+' '+con);
		if (con!=''&&con!=null){
			filters.push(new nlobjSearchFilter('custrecord_shipto_name',null,'anyof',con));
		}
		if (cust!=''&&cust!=null){
			filters.push(new nlobjSearchFilter('custrecord_shipto_customer',null,'anyof',cust));
		}
		nlapiRemoveSelectOption('custpage_shipto',null);
		if (filters.length>0){
			var search=nlapiCreateSearch('customrecord_customer_parent',filters,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('name')]);
			var results=search.runSearch();
			//alert('a');
			nlapiInsertSelectOption('custpage_shipto',0,'',true);
			//alert('3');
			results.forEachResult(function(searchResult)
			{
//alert('c');
				nlapiInsertSelectOption('custpage_shipto',searchResult.getValue('internalid'),searchResult.getValue('name'),false);
//alert('b');
				return true;                // return true to keep iterating
			});
		}
	}
	if (name=='custpage_shipto'){
		var val=nlapiGetFieldValue(name);
		if (val!=''&&val!=null){
			nlapiSetFieldValue('custbody_st_location',val);
		}
	}
}
function so_before_submit(type){
if ((type=='create')&&nlapiGetContext().getExecutionContext()=='webservices'&&nlapiGetUser()==251787){
  nlapiSetFieldValue('custbody_source_edi','T');
}
	if ((type=='create')&&nlapiGetContext().getExecutionContext()=='userinterface'){
		var st=nlapiGetFieldValue('custbody_st_location');

		if (st!=''&&st!=null){

			var con=nlapiLookupField('customrecord_customer_parent',st,['custrecord_shipto_name','custrecord_shipto_customer','custrecord_shipto_country','custrecord_shipto_state'],true);
			var f=nlapiLookupField('customrecord_customer_parent',st,
			['custrecord_shipto_customer',
			'custrecord_shipto_zip',
			'custrecord_shipto_country',
			'custrecord_shipto_state',
			'custrecord_shipto_city','custrecord_shipto_address2','custrecord_shipto_address1','custrecord_shipto_name','custrecord_phone']);
			nlapiSetFieldValue('custbody_st_contact',f.custrecord_shipto_name,false);
			nlapiSetFieldValue('custbody_st_customer',f.custrecord_shipto_customer,false);
			//nlapiRemoveSubrecord('shippingaddress');
			addr=nlapiEditSubrecord('shippingaddress');
			if (addr==null){
				nlapiLogExecution('ERROR','123','123');
				addr=nlapiCreateSubrecord('shippingaddress');
			}
			//attention
			//addressee
			//addr1
			//addr2
			//city state zip
			//country
			var custname=nlapiLookupField('customer',f.custrecord_shipto_customer,'altname');
			var conname=nlapiLookupField('contact',f.custrecord_shipto_name,'entityid');
			addr.setFieldValue('addressee', custname);

			addr.setFieldValue('attention',conname);

			addr.setFieldValue('addr1', f.custrecord_shipto_address1);

			addr.setFieldValue('addr2', f.custrecord_shipto_address2);
//
			addr.setFieldValue('city',f.custrecord_shipto_city);

			addr.setFieldText('state',con.custrecord_shipto_state ); 
			
			addr.setFieldValue('zip', f.custrecord_shipto_zip);

			addr.setFieldText('country', con.custrecord_shipto_country); 
			
			addr.setFieldValue('addrphone', f.custrecord_phone); 
			if (f.custrecord_phone==''||f.custrecord_phone==''){
			addr.setFieldValue('addrphone', '6506973600');
		}
			var string=conname+'\n'+custname+'\n'+f.custrecord_shipto_address1+'\n'+ ((f.custrecord_shipto_address2!=null&&f.custrecord_shipto_address2!='')?(f.custrecord_shipto_address2+'\n'):'')
			+f.custrecord_shipto_city+' '+con.custrecord_shipto_state+' '+f.custrecord_shipto_zip+'\n'+con.custrecord_shipto_country;
			
			addr.setFieldValue('addrtext', string); 
			
			addr.commit();

			
		}
		else if (type=='create'){
			addr=nlapiEditSubrecord('shippingaddress');
			if (addr!=null){
				var ph=addr.getFieldValue('addrphone'); 
				if (ph==null||ph==''){
					addr.setFieldValue('addrphone', '6506973600'); 
					addr.commit();
				}
			}
		}
}
else if (type=='create'){
			addr=nlapiEditSubrecord('shippingaddress');
			if (addr!=null){
				var ph=addr.getFieldValue('addrphone'); 
				if (ph==null||ph==''){
					addr.setFieldValue('addrphone', '6506973600'); 
					addr.commit();
				}
			}
		}
		if (type=='create'){
			var acct=nlapiGetFieldValue('custbody_shippingacct');
		//	var acct=nlapiLookupField('customer',cust,'custentity_customer_shipping');
			if (acct!='' && acct!=null && typeof acct != 'undefined'){
				nlapiSetFieldValue('shipcarrier','nonups');
				//nlapiSetFieldValue('shipmethod',5589);
				nlapiSetFieldValue('shippingcost',0);
			}
		}
}
function so_after_submit(type){
	if ((type=='edit')&&nlapiGetContext().getExecutionContext()=='userinterface'){
		var rec=nlapiLoadRecord('salesorder',nlapiGetRecordId());
		var st=rec.getFieldValue('custbody_st_location');

		if (st!=''&&st!=null){

			var con=nlapiLookupField('customrecord_customer_parent',st,['custrecord_shipto_name','custrecord_shipto_customer','custrecord_shipto_country','custrecord_shipto_state'],true);
			var f=nlapiLookupField('customrecord_customer_parent',st,
			['custrecord_shipto_customer',
			'custrecord_shipto_zip',
			'custrecord_shipto_country',
			'custrecord_shipto_state',
			'custrecord_shipto_city','custrecord_shipto_address2','custrecord_shipto_address1','custrecord_shipto_name','custrecord_phone']);
			rec.setFieldValue('custbody_st_contact',f.custrecord_shipto_name,false);
			rec.setFieldValue('custbody_st_customer',f.custrecord_shipto_customer,false);
			//nlapiRemoveSubrecord('shippingaddress');
			rec.setFieldValue('shipaddress', '');
			var addr;
			addr=rec.editSubrecord('shippingaddress');
			if (addr==null){
				nlapiLogExecution('ERROR','123','123');
				addr=rec.createSubrecord('shippingaddress');
			}
			//attention
			//addressee
			//addr1
			//addr2
			//city state zip
			//country
			var custname=nlapiLookupField('customer',f.custrecord_shipto_customer,'altname');
			var conname=nlapiLookupField('contact',f.custrecord_shipto_name,'entityid');
			addr.setFieldValue('addressee', custname);

			addr.setFieldValue('attention',conname);

			addr.setFieldValue('addr1', f.custrecord_shipto_address1);

			addr.setFieldValue('addr2', f.custrecord_shipto_address2);
//
			addr.setFieldValue('city',f.custrecord_shipto_city);

			addr.setFieldText('state', con.custrecord_shipto_state); 
			
			addr.setFieldValue('zip', f.custrecord_shipto_zip);

			addr.setFieldText('country', con.custrecord_shipto_country); 
			
			addr.setFieldValue('addrphone', f.custrecord_phone);
		if (f.custrecord_phone==''||f.custrecord_phone==''){
			addr.setFieldValue('addrphone', '6506973600');
		}
			var string=conname+'\n'+custname+'\n'+f.custrecord_shipto_address1+'\n'+ ((f.custrecord_shipto_address2!=null&&f.custrecord_shipto_address2!='')?(f.custrecord_shipto_address2+'\n'):'')
			+f.custrecord_shipto_city+' '+con.custrecord_shipto_state+' '+f.custrecord_shipto_zip+'\n'+con.custrecord_shipto_country;
			
			addr.setFieldValue('addrtext', string); 
			addr.commit();
			nlapiSubmitRecord(rec);
		}
		else if (type=='edit'){
			addr=rec.editSubrecord('shippingaddress');
			nlapiLogExecution('ERROR','1','222');
			if (addr!=null){
				var ph=addr.getFieldValue('addrphone'); 
				if (ph==null||ph==''){
					addr.setFieldValue('addrphone', '6506973600'); 
					addr.commit();
					nlapiSubmitRecord(rec);
				}
			}
		}
}
else if (type=='edit'){
	var rec=nlapiLoadRecord('salesorder',nlapiGetRecordId());
			addr=rec.editSubrecord('shippingaddress');
			if (addr!=null){
				var ph=addr.getFieldValue('addrphone'); 
				if (ph==null||ph==''){
					addr.setFieldValue('addrphone', '6506973600'); 
					addr.commit();
					nlapiSubmitRecord(rec);
				}
			}
		}
}
function add_shipto_bl(type,form,request){

	if (type=='create'||type=='edit'){
		var stfield=form.addField('custpage_shipto','select','Ship To Location - Filtered',null,'shipping');
		form.insertField(stfield,'shipaddress');
		if (type=='edit'){
			var filters=new Array();
			var cust=nlapiGetFieldValue('custbody_st_customer');
			var con=nlapiGetFieldValue('custbody_st_contact');
			if (con!=''&&con!=null){
				filters.push(new nlobjSearchFilter('custrecord_shipto_name',null,'anyof',con));
			}
			if (cust!=''&&cust!=null){
				filters.push(new nlobjSearchFilter('custrecord_shipto_customer',null,'anyof',cust));
			}

			if (filters.length>0){
				var search=nlapiCreateSearch('customrecord_customer_parent',filters,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('name')]);
				var results=search.runSearch();
				//alert('a');
				stfield.addSelectOption(0,'',true);
				//alert('3');
				results.forEachResult(function(searchResult)
				{
					stfield.addSelectOption(searchResult.getValue('internalid'),searchResult.getValue('name'),false);
					return true;                // return true to keep iterating
				});
			}
		}
		form.addField('custpage_shiptocus','checkbox');
		var htm=form.addField('custpage_stbutton','inlinehtml','',null,'shipping');
		
		form.insertField(htm,'shipaddress');
		htm.setDefaultValue('<button onclick="new_shipto(); return false;">Modify/Add Current Ship To Location</button>&nbsp; &nbsp;<button onclick="new_shipto_concl(); return false;">Create New Ship To From Selected Contact/Customer</button>')
	}
}
function new_shipto_concl(){
	var con=nlapiGetFieldValue('custbody_st_contact');
	var cl=nlapiGetFieldValue('custbody_st_customer');
	if (cl!=''&&cl!=null&&con!=''&&con!=null){
		nlOpenWindow('https://system.na1.netsuite.com/app/common/custom/custrecordentry.nl?rectype=56&label=Ship+To+Location&target=shipping:custbody_st_location&label=Ship+To+Location'+'&cl='+cl+'&con='+con,'_blank','');
	}
	else {
		alert('No contact and/or customer selected..');
	}
}
function new_shipto(){
	var id=nlapiGetFieldValue('custbody_st_location');
	if (id!=''&&id!=null){
		//alert();
		nlOpenWindow('https://system.na1.netsuite.com/app/common/custom/custrecordentry.nl?rectype=56&label=Ship+To+Location&target=shipping:custbody_st_location&label=Ship+To+Location'+'&recid='+id,'_blank','');
	}
	else {
		alert('No ship to selected.');
	}
}
function shipto_bl(type,form,request){
	
	if (type=='create'){
		var val=request.getParameter('recid');
		if (val!=null&&val!=''){
			var vals=nlapiLookupField(nlapiGetRecordType(),val,['name','custrecord_shipto_name',
			'custrecord_shipto_address1','custrecord_shipto_address2',
			'custrecord_shipto_city','custrecord_shipto_state','custrecord_shipto_country','custrecord_shipto_zip','custrecord_shipto_customer','custrecord_phone']);
			for (i in vals){
				form.getField(i).setDefaultValue(vals[i]);
			}
			return;
		}
		var con=request.getParameter('con');
		var cl=request.getParameter('cl');
		if (cl!=null&&cl!=''&&con!=null&&con!=''){
		
			form.getField('custrecord_shipto_name').setDefaultValue(con);
			form.getField('custrecord_shipto_customer').setDefaultValue(cl);
			return;
		}
	}
}

function shipto_before_submit(type){

		var contact=nlapiGetFieldValue('custrecord_shipto_name');
  if (contact!=''&&contact!=null){
		var cname=nlapiLookupField('contact',contact,'entityid')
		var cust=nlapiGetFieldText('custrecord_shipto_customer');
		var addr1=nlapiGetFieldValue('custrecord_shipto_address1');
		var addr2=nlapiGetFieldValue('custrecord_shipto_address2');
		var string=cname;
		string+=' : '+cust+' : '+addr1;
		if (addr2!=''&&addr2!=null){
			string+=' : '+addr2;
		}
		nlapiSetFieldValue('name',string);
		contact=nlapiGetFieldValue('custrecord_shipto_name');
		cust=nlapiGetFieldValue('custrecord_shipto_customer');
		nlapiSubmitField('contact',contact,'company',cust);
  
		return true;
  }
  else {
  	return false;
  }
}