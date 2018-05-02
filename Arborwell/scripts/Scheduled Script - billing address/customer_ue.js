/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Sep 2014     AHalbleib
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function customer_before_submit(type){

}
function customer_after_submit(type) {
	if (type=='edit'){
		var old_rec=nlapiGetOldRecord();
		var search=nlapiLoadSearch('transaction','customsearch_open_est_so');
		var old_lines=old_rec.getLineItemCount('addressbook');
		var new_rec=nlapiGetNewRecord();
		var new_lines=nlapiGetLineItemCount('addressbook');
		for (var i=1; i<=old_lines; i++){
			
			var id=old_rec.getLineItemValue('addressbook','internalid',i);
			var address1=old_rec.getLineItemValue('addressbook','addr1',i);
			var address2=old_rec.getLineItemValue('addressbook','addr2',i);
			var address3=old_rec.getLineItemValue('addressbook','addr3',i);
			var att=old_rec.getLineItemValue('addressbook','attention',i);
			var city=old_rec.getLineItemValue('addressbook','city',i);
			var country=old_rec.getLineItemValue('addressbook','country',i);
			var addressee=old_rec.getLineItemValue('addressbook','addressee',i);
			var state=old_rec.getLineItemValue('addressbook','state',i);
			var zip=old_rec.getLineItemValue('addressbook','zip',i);
			var label=old_rec.getLineItemValue('addressbook','label',i);
			var full=old_rec.getLineItemValue('addressbook','addrtext',i);
			
			
			for (var j=1; j<=new_lines; j++){
				nlapiSelectLineItem('addressbook',j);
				var subrec=nlapiViewCurrentLineItemSubrecord('addressbook','addressbookaddress');
				var new_id=nlapiGetLineItemValue('addressbook','internalid',j);
				var addr_id=nlapiGetLineItemValue('addressbook','addressid',j);
				if (subrec!=null){
				var new_address1 =subrec.getFieldValue('addr1');
				var new_address2=subrec.getFieldValue('addr2');
				var new_address3=subrec.getFieldValue('addr3');
				var new_att=subrec.getFieldValue('attention');
				var new_city=subrec.getFieldValue('city');
				var new_country=subrec.getFieldValue('country');
				var new_addressee=subrec.getFieldValue('addressee');
				var new_state=subrec.getFieldValue('state');
				var new_zip=subrec.getFieldValue('zip');
				var new_label=subrec.getFieldValue('label');
				var new_full=subrec.getFieldValue('addrtext');
				//nlapiLogExecution('ERROR','Addresses','Old Full Address: '+full+' New Full Address: '+new_full);
				//nlapiLogExecution('ERROR','Ids','Old Id:'+id+' New Id: '+new_id);
				if (new_id==id&&(new_address1!=address1||new_address2!=address2||new_address3!=address3
						||att!=new_att||city!=new_city||country!=new_country||addressee!=new_addressee
						||state!=new_state||zip!=new_zip||label!=new_label)){
					
					//nlapiLogExecution('ERROR','inif',new_address1);
					var filters=search.getFilters();
					for (var k=0; k<filters.length; k++){
					//	nlapiLogExecution('ERROR','filters '+k,filters[k].getName());
					}
					var new_filters=new Array();
					new_filters.push(filters[0]);
					new_filters.push(filters[1]);
					new_filters.push(filters[2]);
					new_filters.push(new nlobjSearchFilter('entity',null,'anyof',nlapiGetRecordId('internalid')));
					if (addressee!=null&&addressee.length>0){
					new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',addressee));
					}
					if (address1!=null&&address1.length>0){
					new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',address1));
					}
					if (address2!=null&&address2.length>0){
						new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',address2));
					}
					if (att!=null&&att.length>0){
						new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',att));
					}
					else {
						new_filters.push(new nlobjSearchFilter('billattention',null,'isempty'));
					}
					if (city!=null&&city.length>0){
					new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',city));
					}
					if (state!=null&&state.length>0){
					new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',state));
					}
					if (zip!=null&&zip.length>0){
					new_filters.push(new nlobjSearchFilter('billaddress',null,'contains',zip));
					}
					
					
					search.setFilters(new_filters);

					var results=search.runSearch();
					results=results.getResults(0,1000);
					if (results==null){
						//nlapiLogExecution('ERROR','here','here');
						//nlapiLogExecution('ERROR','results null',city+' '+state+' '+addressee+' '+zip+' '+att+' '+address1+' '+address2+' '+address3);
					}
					else {
						//nlapiLogExecution('ERROR','number of matches',results.length+' address: '+city+' '+state+' '+addressee+' '+zip+' '+att+' '+address1+' '+address2+' '+address3);
					}
					for (var k=0; results!=null&&k<results.length; k++){

							//nlapiLogExecution('ERROR','usage',nlapiGetContext().getRemainingUsage());
							make_record(k-1,results,new_address1,new_address2,new_address3,new_addressee,new_att,new_city,new_country,new_state,new_zip);
							break;
						//if (results[k].getText('type')=='Estimate'){
						//	var tran=nlapiLoadRecord('estimate',results[k].getValue('internalid'));
						//}
						//else {
						//	var tran=nlapiLoadRecord('salesorder',results[k].getValue('internalid'));
						//}
						//tran.setFieldValue('billaddress',new_full);
						//if (new_address1!=null){
						//	tran.setFieldValue('billaddr1',new_address1);
					//	}
					//	else {
					//		tran.setFieldValue('billaddr1','');
					//	}
					//	if (new_address2!=null){
					//		tran.setFieldValue('billaddr2',new_address2);
					//	}
					//	else {
					//		tran.setFieldValue('billaddr2','');
					///	}
					//	if (new_address3!=null){
					//		tran.setFieldValue('billaddr3',new_address3);
					//	}
					//	else {
					//		tran.setFieldValue('billaddr3','');
					//	}
					//	if (new_addressee!=null){
					//		tran.setFieldValue('billaddressee',new_addressee);
					//	}
					//	else {
					//		tran.setFieldValue('billaddressee','');
					//	}
					//	if (new_att!=null){
					//		tran.setFieldValue('billattention',new_att);
					//	}
					//	else {
					//		tran.setFieldValue('billattention','');
					//	}
					//	if (new_city!=null){
					//		tran.setFieldValue('billcity',new_city);
					//	}
					//	else {
					//		tran.setFieldValue('billcity','');
					//	}
					//	if (new_country!=null){
					//		tran.setFieldValue('billcountry',new_country);
					////	}
					//	else {
					//		tran.setFieldValue('billcountry','');
					//	}
					//	if (new_state!=null){
					//		tran.setFieldValue('billstate',new_state);
					//	}
					//	else {
					//		tran.setFieldValue('billstate','');
					//	}
					//	if (new_zip!=null){
					//		tran.setFieldValue('billzip',new_zip);
					//	}
					//	else {
					//		tran.setFieldValue('billzip','');
					//	}
					//	nlapiSubmitRecord(tran,true,false);
						
						
					}
				}
			}
			//nlapiLogExecution('ERROR','usage',nlapiGetContext().getRemainingUsage()+' '+i);
		}
		}
	}
}
function update (){
	var columns=new Array();
	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn('custrecord_tran_list'));
	columns.push(new nlobjSearchColumn('custrecord_billaddr1'));
	columns.push(new nlobjSearchColumn('custrecord_billaddr2'));
	columns.push(new nlobjSearchColumn('custrecord_billaddr3'));
	columns.push(new nlobjSearchColumn('custrecord_billaddressee'));
	columns.push(new nlobjSearchColumn('custrecord_billattention'));
	columns.push(new nlobjSearchColumn('custrecord_billcity'));
	columns.push(new nlobjSearchColumn('custrecord_billcountry'));
	columns.push(new nlobjSearchColumn('custrecord_billstate'));
	columns.push(new nlobjSearchColumn('custrecord_billzip'));
	var results=nlapiSearchRecord('customrecord_address_change_transaction',null,null,columns);
	for (var i=0; results!=null&&i<results.length; i++){
		var new_address1 =results[i].getValue('custrecord_billaddr1');
		var new_address2=results[i].getValue('custrecord_billaddr2');
		var new_address3=results[i].getValue('custrecord_billaddr3');
		var new_att=results[i].getValue('custrecord_billattention');
		var new_city=results[i].getValue('custrecord_billcity');
		var new_country=results[i].getValue('custrecord_billcountry');
		var new_addressee=results[i].getValue('custrecord_billaddressee');
		var new_state=results[i].getValue('custrecord_billstate');
		var new_zip=results[i].getValue('custrecord_billzip');
		var array=results[i].getValue('custrecord_tran_list');
		array=array.split(",");
		while (array.length>0){
			if (nlapiGetContext().getRemainingUsage()<50){
				nlapiSubmitField('customrecord_address_change_transaction',results[i].getValue('internalid'),'custrecord_tran_list',array.toString());
				return;
			}
			type=array.shift();
			id=array.shift();
			
			if (type=='Estimate'){
				nlapiLogExecution('ERROR','estimate',id);
				var tran=nlapiLoadRecord('estimate',id);
			}
			else {
				nlapiLogExecution('ERROR','sales order',id);
				var tran=nlapiLoadRecord('salesorder',id);
			}
			//tran.setFieldValue('billaddress',new_full);

			//RB 4/16/2018	-	only update if billto addy is blank
		if ( tran.getFieldValue('billaddress').length < 1 ){

			if (new_address1!=null){
				tran.setFieldValue('billaddr1',new_address1);
			}
			else {
				tran.setFieldValue('billaddr1','');
			}
			if (new_address2!=null){
				tran.setFieldValue('billaddr2',new_address2);
			}
			else {
				tran.setFieldValue('billaddr2','');
			}
			if (new_address3!=null){
				tran.setFieldValue('billaddr3',new_address3);
			}
			else {
				tran.setFieldValue('billaddr3','');
			}
			if (new_addressee!=null){
				tran.setFieldValue('billaddressee',new_addressee);
			}
			else {
				tran.setFieldValue('billaddressee','');
			}
			if (new_att!=null){
				tran.setFieldValue('billattention',new_att);
			}
			else {
				tran.setFieldValue('billattention','');
			}
			if (new_city!=null){
				tran.setFieldValue('billcity',new_city);
			}
			else {
				tran.setFieldValue('billcity','');
			}
			if (new_country!=null){
				tran.setFieldValue('billcountry',new_country);
			}
			else {
				tran.setFieldValue('billcountry','');
			}
			if (new_state!=null){
				tran.setFieldValue('billstate',new_state);
			}
			else {
				tran.setFieldValue('billstate','');
			}
			if (new_zip!=null){
				tran.setFieldValue('billzip',new_zip);
			}
			else {
				tran.setFieldValue('billzip','');
			}

		}

try{
			nlapiSubmitRecord(tran,true,true);
}
catch(e){}
		}
		nlapiDeleteRecord('customrecord_address_change_transaction',results[i].getValue('internalid'));
	}
	
}
function make_record(k,results,new_address1,new_address2,new_address3,new_addressee,new_att,new_city,new_country,new_state,new_zip){
	var record=nlapiCreateRecord('customrecord_address_change_transaction');
	var to_change_later=new Array();
	for (k=k+1; k<results.length; k++){
		to_change_later.push(results[k].getText('type'));
		to_change_later.push(results[k].getValue('internalid'));
	}
	if (to_change_later.toString()==''){
		return;
	}
	record.setFieldValue('custrecord_tran_list',to_change_later.toString());
	if (new_address1!=null){	
		record.setFieldValue('custrecord_billaddr1',new_address1);
	}
	else {
		record.setFieldValue('custrecord_billaddr1','');
	}
	if (new_address2!=null){
		record.setFieldValue('custrecord_billaddr2',new_address2);
	}
	else {
		record.setFieldValue('custrecord_billaddr2','');
	}
	if (new_address3!=null){
		record.setFieldValue('custrecord_billaddr3',new_address3);
	}
	else {
		record.setFieldValue('custrecord_billaddr3','');
	}
	if (new_addressee!=null){
		record.setFieldValue('custrecord_billaddressee',new_addressee);
	}
	else {
		record.setFieldValue('custrecord_billaddressee','');
	}
	if (new_att!=null){
		record.setFieldValue('custrecord_billattention',new_att);
	}
	else {
		record.setFieldValue('custrecord_billattention','');
	}
	if (new_city!=null){
		record.setFieldValue('custrecord_billcity',new_city);
	}
	else {
		record.setFieldValue('custrecord_billcity','');
	}
	if (new_country!=null){
		record.setFieldValue('custrecord_billcountry',new_country);
	}
	else {
		record.setFieldValue('custrecord_billcountry','');
	}
	if (new_state!=null){
		record.setFieldValue('custrecord_billstate',new_state);
	}
	else {
		record.setFieldValue('custrecord_billstate','');
	}
	if (new_zip!=null){
		record.setFieldValue('custrecord_billzip',new_zip);
	}
	else {
		record.setFieldValue('custrecord_billzip','');
	}
try{
	nlapiSubmitRecord(record);
}
catch(e){}
	
}
function tran_bef_lo(type,form,request){
	var filters=new Array();
	filters.push(new nlobjSearchFilter('mainline',null,'is','F'));
	filters.push(new nlobjSearchFilter('type',null,'anyof',['Estimate','SalesOrd']));
	filters.push(new nlobjSearchFilter('trandate',null,'onorafter','9/1/2014'));
	var results=nlapiSearchRecord('transaction',null,filters,[new nlobjSearchColumn('statusref'),new nlobjSearchColumn('type')]);
	for (var i=0; i<results.length; i++){
		//nlapiLogExecution('ERROR',results[i].getValue('type')+' '+results[i].getValue('statusref'),results[i].getText('statusref'));
	}
}