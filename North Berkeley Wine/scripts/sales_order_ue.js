/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Jul 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function sales_order_before_load(type, form, request){
	//if (type=='view'&&nlapiGetFieldValue('custbody_sdm_shipped')=='T' && nlapiGetFieldValue('custbody_sdm_just_shipped')=='T'){
	//	nlapiSubmitField('salesorder',nlapiGetRecordId(),'custbody_sdm_just_shipped','F');
	//	nlapiSetRedirectURL('RECORD','customrecord_nbi_shipping',nlapiGetFieldValue('custbody_sdm_shipping_record_num'),true);
	//}
	//&& nlapiGetRole()==1000 && 
	//nlapiGetFieldValue('customform')!=138 && nlapiGetFieldValue('customform')!=103
	nlapiLogExecution('ERROR',type,nlapiGetRole());

//set MLK B.O. and Retail O.R. on viewing SO
	if ((type=='view')&&nlapiGetRole()==3){
		var so=nlapiLoadRecord('salesorder',nlapiGetRecordId());
		var form_no=so.getValue('customform');
		nlapiLogExecution('ERROR',type,form_no);
		if (form_no==105){
            var lines = so.nlapiGetLineItemCount ( 'item' );
            var qtyOnOrder = '';
            var qtyBackOrdered = '';

            var inventoryLocation = 14;  //Vinlux : Retail = 14             
            for (i=1; i-1<lines; i++){
                var internalID = so.nlapiGetLineItemValue('item', 'item', i);
                var filters = new Array();
                filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
                filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
                var columns = new Array();
                columns[0] = new nlobjSearchColumn('locationquantityonorder'); 
                var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
                if (srchRslts != null && srchRslts.length > 0){
                    qtyOnOrder = srchRslts[0].getValue(columns[0]);
                }
                if (qtyOnOrder == null || qtyOnOrder == ''){ qtyOnOrder=0;}
                nlapiLogExecution('DEBUG', 'qtyOnOrder', 'qtyOnOrder='+qtyOnOrder);
                so.nlapiSetLineItemValue ( 'item' , 'custcol29' , i , qtyOnOrder );
            }

            var inventoryLocation = 1;  //  MLK:Retail = 1             
            for (i=1; i-1<lines; i++){
                var internalID = so.nlapiGetLineItemValue('item', 'item', i);
                var filters = new Array();
                filters[0] = new nlobjSearchFilter('internalid',null,'is', internalID);
                filters[1] = new nlobjSearchFilter('inventorylocation',null,'is', inventoryLocation);
                var columns = new Array();
                columns[1] = new nlobjSearchColumn('locationquantitybackordered');

                var srchRslts = nlapiSearchRecord('item',null,filters,columns); 
                if (srchRslts != null && srchRslts.length > 0){
                    qtyBackOrdered = srchRslts[0].getValue(columns[1]);
                }
                if (qtyBackOrdered == null || qtyBackOrdered == ''){ qtyBackOrdered=0;}
                nlapiLogExecution('DEBUG', 'qtyBackOrdered', ' qtyBackOrdered='+qtyBackOrdered);
                so.nlapiSetLineItemValue ( 'item' , 'custcol30' , i , qtyBackOrdered );
            }
		}
	}
// end setting field


	if ((type=='view'||type=='edit')&&nlapiGetRole()==1000){
		var rec=nlapiSearchRecord('salesorder',null,new nlobjSearchFilter('internalid',null,'is',nlapiGetRecordId()),new nlobjSearchColumn('customform'));
		var form_no=rec[0].getValue('customform');
		nlapiLogExecution('ERROR',type,form_no);
		if (form_no==101){
			form.getSubList('item').getField('isclosed').setDisplayType('hidden');
			form.getSubList('item').getField('costestimaterate').setDisplayType('hidden');
		}
	}	
	if (type!='create' && nlapiGetRecordId()!=null && nlapiGetRecordId().length>0){
		var rec=nlapiSearchRecord('salesorder',null,new nlobjSearchFilter('internalid',null,'is',nlapiGetRecordId()),new nlobjSearchColumn('customform'));
		var form_no=rec[0].getValue('customform');
	
		if (nlapiGetRole()==1000 && form_no==101){
			var results=nlapiSearchRecord('salesorder',null,new nlobjSearchFilter('customform',null,'is',138),new nlobjSearchColumn('internalid'));
			var so=nlapiLoadRecord('salesorder',results[0].getValue('internalid'));
			var fields=so.getAllFields();
			//var line_fields=so.getAllLineItemFields();
			var tabs=form.getTabs();
			var field;
			var array=['currency','exchangerate','totalcostestimate',
			           'estgrossprofit','estgrossprofitpercent','terms','paymentmethod','creditcard',
			           'ccnumber','ccexpiredate','ccname','ccstreet',
			           'cczipcode','getauth','ccapproved','pnrefnum',
			           'authcode','ccavsstreetmatch',
			           'ccavszipmatch','shipcomplete','custbody_sdm_shipped',
			           'custbody_sdm_ship_options','custbody_sdm_ship_instruction',
			           'SystemNote_FIELD','searchid','custbodyitemcount',
			           'custbody2','custbody3','custbody5',
			           'custbody9','ismultishipto',
			           'couponcode','promocode','discountitem',
			           'discountrate','ismultishipto','leadsource','partner','department','class'];
			
			for (var i=0; i<array.length; i++){
				field=form.getField(array[i]);
				if (field!=null){
					field.setDisplayType('hidden');
				}
			}
			if (form.getSubList('systemnotes')!=null){
				form.getSubList('systemnotes').setDisplayType('hidden');
			}
		}}
			var field=nlapiGetField('custbody_sdm_shipping_record');
			var field2=nlapiGetField('custbody_sdm_ship_status');
			if (field!=null){
			field.setDisplayType('inline');
			}
			if (field2!=null){
			field2.setDisplayType('inline');
			}
		if (type!='create' && type!='edit'&& type!='xedit'){
			form.setScript('customscript_sdm_sales_order_client');
			var status=nlapiGetFieldValue('status');
			var shipped=nlapiGetFieldValue('custbody_sdm_shipped');
			//only add button if sales order has already been approved
			var myform=nlapiGetFieldValue('custbody_customform');
			nlapiLogExecution('ERROR','form',myform);
			var role=nlapiGetRole();
			if ((status=='Pending Fulfillment' || status=='Pending Billing' || status=='Pending Billing/Partially Fulfilled' || status=='Partially Fulfilled' || status=='Billed') && shipped=='F'&&(myform==null||myform.length==0||myform==105||myform==101||myform==152)&&role!=1000){		
				form.addButton('custpage_ship','Ship','ship()');
			}
		}
}
function sales_order_before_submit(type){ 
	if (type=='edit'||type=='create'){
		nlapiSetFieldValue('custbody_customform',nlapiGetFieldValue('customform'));
	}
}
function sales_order_after_submit(type){
}
function ship(){
	location='https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=111&deploy=1&custpage_id='+nlapiGetRecordId();
}
function create_ship_record(request,response){
	if (request.getMethod()=='GET'){
		var so_id=request.getParameter('custpage_id');
		var so=nlapiLoadRecord('salesorder',so_id);
		var record=nlapiCreateRecord('customrecord_nbi_shipping');
		
		var customer=so.getFieldValue('entity');
		var email='';
		var comments='';
		var instruction='';
		var options='';

		record.setFieldValue('custrecord_ship_customer',customer);
		record.setFieldValue('custrecord_ship_tran',so_id);
		record.setFieldValue('custrecord_ship_date_created',nlapiDateToString(new Date()));
		//record.setFieldValue('custrecord_ship_status',1);
		var salesrep=so.getFieldValue('salesrep');
		if (salesrep!=null&&salesrep.length>0){
			record.setFieldValue('custrecord_ship_sales_rep',salesrep);
		}
		if (email!=null&&email.length>0){
			record.setFieldValue('custrecord_ship_to_email',email);
		}
		else {
			email=nlapiLookupField('customer',customer,'email');
			if (email!=null&&email.length>0){
				record.setFieldValue('custrecord_ship_to_email',email);
			}
		}
		var addr=so.getFieldValue('shipaddress');
		if (addr!=null && addr.length>0){
			record.setFieldValue('custrecord_ship_to_address',addr);
		}
		
		var ship_method=so.getFieldValue('shipmethod');
		if (ship_method!=null&&ship_method.length>0){
			record.setFieldValue('custrecord_ship_method',ship_method);
		}

		var ship_memo=so.getFieldValue('memo');
		if (ship_memo!=null&&ship_memo.length>0){
			record.setFieldValue('custrecord_ship_memo',ship_memo);
		}

		comments=nlapiLookupField('customer',customer,'comments');
		if (comments!=null&&comments.length>0){
			record.setFieldValue('custrecord_ship_comments',comments);
		}
		instruction=so.getFieldValue('custbody_sdm_ship_instruction');
		//if (instruction!=null&&instruction.length>0){
		//	record.setFieldValue('custrecord_ship_instruction',instruction);
		//}
		options=so.getFieldValues('custbody_sdm_ship_options');
		if (options!=null&&options.length>0){
			record.setFieldValues('custrecord_ship_options',options);
		}
		var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',customer);
		var column=new nlobjSearchColumn('internalid');
		var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
		
		var cust='';
		if (result!=null){
			cust=result[0].getValue('internalid');
			record.setFieldValue('custrecord_ship_cust_cust',cust);
		}
		var ship_id=nlapiSubmitRecord(record,false,true);
		//so.setFieldValue('custbody_sdm_shipping_record_num',ship_id);
		//so.setFieldValue('custbody_sdm_shipping_record',nlapiResolveURL('RECORD','customrecord_nbi_shipping',ship_id));
		//so.setFieldValue('custbody_sdm_shipped','T');
		//so.setFieldValue('custbody_sdm_just_shipped','T');
		nlapiSubmitField('salesorder',so_id,'custbody_sdm_shipping_record_num',ship_id);
		nlapiSubmitField('salesorder',so_id,'custbody_sdm_shipping_record',nlapiResolveURL('RECORD','customrecord_nbi_shipping',ship_id));
		//nlapiSubmitField('salesorder',so_id,'custbody_sdm_just_shipped','T');
		nlapiSubmitField('salesorder',so_id,'custbody_sdm_shipped','T');

		var lines=so.getLineItemCount('item');
		for (var i=1; i<=lines; i++){
			var ship_line=nlapiCreateRecord('customrecord_nbi_shipping_line');
			ship_line.setFieldValue('custrecord_shipline_parent',ship_id);
			ship_line.setFieldValue('custrecord_shipline_item',so.getLineItemValue('item','item',i));
			ship_line.setFieldValue('custrecord_shipline_qty',so.getLineItemValue('item','quantity',i));
			//ship_line.setFieldValue('custrecord_shipline_options',so.getLineItemValue('item','options',i));
			ship_line.setFieldValue('custrecord_shipline_date',so.getFieldValue('shipdate'));
			var stat=nlapiLookupField('item',so.getLineItemValue('item','item',i),'custitem_sdm_pending_prearr');
			if (stat=='T'){
				ship_line.setFieldValue('custrecord_shipline_status',1);
			}
			else {
				ship_line.setFieldValue('custrecord_shipline_status','');
			}
			ship_line.setFieldValue('custrecord_shipline_qty_shipped','0');
			ship_line.setFieldValue('custrecord_shipline_record_status',1);
			ship_line.setFieldValue('custrecord_cust_cust',cust);
			ship_line.setFieldValue('custrecord_shipline_instruction',instruction);
			ship_line.setFieldValue('custrecord_sdm_shipline_customer',customer);
			ship_line.setFieldValue('custrecord_sdm_shipline_transaction',so_id);
			//ship_line.setFieldValue('custrecord_shipline_date_actual',nlapiGetFieldValue('actualshipdate'));
			//ship_line.setFieldValue('custrecord_shipline_notes',nlapiGetLineItemValue('item','item',i));
			nlapiSubmitRecord(ship_line);
		}
		//nlapiSubmitRecord(so,false,true);
		nlapiSetRedirectURL('RECORD','customrecord_nbi_shipping',ship_id,true);
	}
}
function so_validate_field(type,name,linenum){
	if (name=='customform'){
		if (nlapiGetUser()!=817&&nlapiGetRole()!=3&&nlapiGetFieldValue(name)==160){
			return false;
		}
	}
	return true;
}
function old(){
	var so=nlapiLoadRecord('salesorder',nlapiGetRecordId());
	var record=nlapiCreateRecord('customrecord_nbi_shipping');
	
	var customer=record.getFieldValue('entity');
	var email='';
	var comments='';
	var instruction='';
	var options='';

	record.setFieldValue('custrecord_ship_customer',customer);
	record.setFieldValue('custrecord_ship_tran',nlapiGetRecordId());
	record.setFieldValue('custrecord_ship_date_created',nlapiDateToString(new Date()));
	//record.setFieldValue('custrecord_ship_status',1);
	var salesrep=so.getFieldValue('salesrep');
	if (salesrep!=null&&salesrep.length>0){
		record.setFieldValue('custrecord_ship_sales_rep',salesrep);
	}
	if (email!=null&&email.length>0){
		record.setFieldValue('custrecord_ship_to_email',email);
	}
	else {
		email=nlapiLookupField('customer',customer,'email');
		if (email!=null&&email.length>0){
			record.setFieldValue('custrecord_ship_to_email',email);
		}
	}
	var addr=so.getFieldValue('shipaddress');
	if (addr!=null && addr.length>0){
		record.setFieldValue('custrecord_ship_to_address',addr);
	}
	
	var ship_method=so.getFieldValue('shipmethod');
	if (ship_method!=null&&ship_method.length>0){
		record.setFieldValue('custrecord_ship_method',ship_method);
	}

	var ship_memo=so.getFieldValue('memo');
	if (ship_memo!=null&&ship_memo.length>0){
		record.setFieldValue('custrecord_ship_memo',ship_memo);
	}

	comments=nlapiLookupField('customer',customer,'comments');
	if (comments!=null&&comments.length>0){
		record.setFieldValue('custrecord_ship_comments',comments);
	}
	instruction=so.getFieldValue('custbody_sdm_ship_instruction');
	if (instruction!=null&&instruction.length>0){
		record.setFieldValue('custrecord_ship_instruction',instruction);
	}
	options=so.getFieldValues('custbody_sdm_ship_options');
	if (options!=null&&options.length>0){
		record.setFieldValues('custrecord_ship_options',options);
	}
	var filter=new nlobjSearchFilter('custrecord_link_id',null,'is',customer);
	var column=new nlobjSearchColumn('internalid');
	var result=nlapiSearchRecord('customrecord_sdm_cust',null,filter,column);
	
	var cust='';
	if (result!=null){
		cust=result[0].getValue('internalid');
		record.setFieldValue('custrecord_ship_cust_cust');
	}
	var ship_id=nlapiSubmitRecord(record,false,true);
	//so.setFieldValue('custbody_sdm_shipping_record_num',ship_id);
	//so.setFieldValue('custbody_sdm_shipping_record',nlapiResolveURL('RECORD','customrecord_nbi_shipping',ship_id));
	//so.setFieldValue('custbody_sdm_shipped','T');
	//so.setFieldValue('custbody_sdm_just_shipped','T');
	nlapiSubmitField('salesorder',nlapiGetRecordId(),'custbody_sdm_shipping_record_num',ship_id);
	nlapiSubmitField('salesorder',nlapiGetRecordId(),'custbody_sdm_shipping_record',nlapiResolveURL('RECORD','customrecord_nbi_shipping',ship_id));
	nlapiSubmitField('salesorder',nlapiGetRecordId(),'custbody_sdm_just_shipped','T');
	nlapiSubmitField('salesorder',nlapiGetRecordId(),'custbody_sdm_shipped','T');

	var lines=so.getLineItemCount('item');
	for (var i=1; i<=lines; i++){
		var ship_line=nlapiCreateRecord('customrecord_nbi_shipping_line');
		ship_line.setFieldValue('custrecord_shipline_parent',ship_id);
		ship_line.setFieldValue('custrecord_shipline_item',so.getLineItemValue('item','item',i));
		ship_line.setFieldValue('custrecord_shipline_qty',so.getLineItemValue('item','quantity',i));
		//ship_line.setFieldValue('custrecord_shipline_options',so.getLineItemValue('item','options',i));
		ship_line.setFieldValue('custrecord_shipline_date',so.getFieldValue('shipdate'));
		var stat=nlapiLookupField('item',so.getLineItemValue('item','item',i),'custitem_sdm_pending_prearr');
		if (stat=='T'){
			ship_line.setFieldValue('custrecord_shipline_status',1);
		}
		else {
			ship_line.setFieldValue('custrecord_shipline_status','');
		}
		ship_line.setFieldValue('custrecord_shipline_qty_shipped','0');
		ship_line.setFieldValue('custrecord_shipline_record_status',1);
		ship_line.setFieldValue('custrecord_cust_cust',cust);
		ship_line.setFieldValue('custrecord_shipline_instruction',instruction);
		ship_line.setFieldValue('custrecord_sdm_shipline_customer',customer);
		ship_line.setFieldValue('custrecord_sdm_shipline_transaction',nlapiGetRecordId());
		//ship_line.setFieldValue('custrecord_shipline_date_actual',nlapiGetFieldValue('actualshipdate'));
		//ship_line.setFieldValue('custrecord_shipline_notes',nlapiGetLineItemValue('item','item',i));
		nlapiSubmitRecord(ship_line);
	}
	nlapiSubmitRecord(so,false,true);
	location.reload();
}
function so_validate_line(type){
	if (type=='item'){
		var bottlecount=parseFloat(0);
		var lines=nlapiGetLineItemCount('item');
		var curr_line_count=nlapiGetCurrentLineItemValue('item','quantity');
		var curr_line_num=nlapiGetCurrentLineItemValue('item','line');
		//alert(curr_line_num);
		for (var i=1;i<=lines;i++){

			if (i!=curr_line_num&&(!isNaN(parseFloat(nlapiGetLineItemValue('item','quantity',i))))){

				bottlecount=parseFloat(parseFloat(bottlecount)+parseFloat(nlapiGetLineItemValue('item','quantity',i)));
			}
			else {

				bottlecount=parseFloat(parseFloat(bottlecount)+parseFloat(curr_line_count));
			}
		}
		nlapiSetFieldValue('custbody_total_bottles',bottlecount);
	}
	return true;
}
function so_validate_delete(type){
	if (type=='item'){
		var bottlecount=parseFloat(0);
		var lines=nlapiGetLineItemCount('item');
		var curr_line_count=nlapiGetCurrentLineItemValue('item','quantity');
		var curr_line_num=nlapiGetCurrentLineItemValue('item','line');
		for (var i=1;i<=lines;i++){
			if (i!=curr_line_num){
				bottlecount=parseFloat(parseFloat(bottlecount)+parseFloat(nlapiGetLineItemValue('item','quantity',i)));
			}
			else {
				//bottlecount=parseFloat(parseFloat(bottlecount)+parseFloat(curr_line_count));
			}
		}
		nlapiSetFieldValue('custbody_total_bottles',bottlecount);
	}
	return true;
}
function so_validate_insert(type){
	return true;
}
function sales_order_after_submit(type){
	if (type!='delete'){
		try {
		var bottles=nlapiSearchRecord(nlapiGetRecordType(),null,new nlobjSearchFilter('internalid',null,'anyof',nlapiGetRecordId()),new nlobjSearchColumn('quantity',null,'sum'));
		var bottlecount=bottles[0].getValue('quantity',null,'sum');
		nlapiSubmitField(nlapiGetRecordType(),nlapiGetRecordId(),'custbody_total_bottles',bottlecount);
		}
		catch(e) {
			
		}
	}
}