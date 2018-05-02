function sales_order_field_changed(type,name,linenum){
	
	if (nlapiGetRecordType()=='salesorder'){
	if (type=='item'&&name=='item'&&nlapiGetFieldValue('entity')!=null&&nlapiGetFieldValue('entity')!=''){
		var name=nlapiGetCurrentLineItemValue(type,name);
		if (name!=''&&name!=null&&typeof name!='undefined'){
			var skus=nlapiSearchRecord('customrecord_customer_sku',null,
					[new nlobjSearchFilter('custrecord_cs_item',null,'anyof',name),new nlobjSearchFilter('custrecord_cs_customer',null,'anyof',nlapiGetFieldValue('entity'))],
					[new nlobjSearchColumn('custrecord_cs_item'),new nlobjSearchColumn('custrecord_cs_sku')]);
			if (skus!=null){
				nlapiSetCurrentLineItemValue('item','custcol_customer_sku',skus[0].getValue('custrecord_cs_sku'),false);
			}
		}
	}
if (name=='entity'){
var entity=nlapiGetFieldValue('entity');
if (entity!=null&&entity!=''){
			var araging15=nlapiSearchRecord('transaction','customsearch277',new nlobjSearchFilter('internalid','customer','anyof',entity));
			if (araging15!=null){
				nlapiSetFieldValue('custbody_credverif','T',false);
			}
else {
nlapiSetFieldValue('custbody_credverif','F',false);
}
}
}
var status=nlapiGetFieldValue('status');
if (type=='item'&&name=='custcol_cps_orion_linereadytoship'&&status!=null&&status.indexOf('Fulfill')>-1){
	//alert(+' '+nlapiGetFieldValue('statusref'));
	var orion=nlapiGetCurrentLineItemValue('item','custcol_cps_orion_linereadytoship');
	if (orion=='T'){
		nlapiSetCurrentLineItemValue('item','commitinventory',1);
	}
	else {
		nlapiSetCurrentLineItemValue('item','commitinventory',3);
	}
	//nlapiSetCurrentLineItemValue('item','commitmentfirm',orion,false);
	
}
//1= commit available
//3= dont commit
if (name=='shipmethod'){
	var lines=nlapiGetLineItemCount('item');
	var total=parseFloat(0);
	var discounts=new Array();
	for (var i=1;i<=lines;i++){
		var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
					var itemtype=nlapiGetLineItemValue('item','itemtype',i);
		if (nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
			
			var rate=nlapiGetLineItemValue('item','rate',i);
			if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
				rate=rate.substring(0,rate.length-1);
				discounts.push(rate*.01);
				//alert(rate);
			}
			else if (itemtype=='Discount'){
							var amount=parseFloat(nlapiGetLineItemValue('item','amount',i));
							total+=amount; 
						}
			else {
				var amount=parseFloat(rate*unf);
				total+=amount; 
			}
		}
	}
	var shipmethod=nlapiGetFieldText('shipmethod');
	if(shipmethod!=null&& shipmethod.indexOf('%')!=-1){
		shipmethod=shipmethod.replace(/\D/g,'');
		shipmethod=parseFloat(shipmethod);
		if (typeof shipmethod=='number')
			discounts.push(shipmethod*.01);
		//alert(shipmethod);
	}
	var subtotal=total;
	for (var i=0;i<discounts.length;i++){
		total+=discounts[i]*subtotal;
	}
	nlapiSetFieldValue('custbody_orion_subtotal',total);
}
	}
}
function delete_val(type){
	if (type=='item'){
		if (nlapiGetRecordType()=='salesorder'){
			var status=nlapiGetFieldValue('status');
			if (status!=null){
				if (status.indexOf('Fulfill')>-1){
					var lines=nlapiGetLineItemCount('item');
					var total=parseFloat(0);
					for (var i=1;i<=lines;i++){
						//nlapiSelectLineItem('item',i);
						//nlapiSetCurrentLineItemValue('item','commitmentfirm',nlapiGetCurrentLineItemValue('item','custcol_cps_orion_linereadytoship'));
						var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
						if (nlapiGetCurrentLineItemIndex('item')!=i&&nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
							var amount=parseFloat(rate*unf);
							total+=amount; 
						}
					}
					nlapiSetFieldValue('custbody_orion_subtotal',total);
				}
			}
		}
	}
	return true;
}
function insert_delete_val(type){
	if (type=='item'){
		if (nlapiGetRecordType()=='salesorder'){

					var lines=nlapiGetLineItemCount('item');
					var total=parseFloat(0);
					var discounts=new Array();
					for (var i=1;i<=lines;i++){
						var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
					var itemtype=nlapiGetLineItemValue('item','itemtype',i);
						if (nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
							
							var rate=nlapiGetLineItemValue('item','rate',i);
							if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
								rate=rate.substring(0,rate.length-1);
								discounts.push(rate*.01);
								//alert(rate);
							}
							else if (itemtype=='Discount'){
							var amount=parseFloat(nlapiGetLineItemValue('item','amount',i));
							total+=amount; 
						}
							else {
								var amount=parseFloat(rate*unf);
								total+=amount; 
							}
						}
					}
					var shipmethod=nlapiGetFieldText('shipmethod');
					if(shipmethod!=null&& shipmethod.indexOf('%')!=-1){
						shipmethod=shipmethod.replace(/\D/g,'');
						shipmethod=parseFloat(shipmethod);
						if (typeof shipmethod=='number')
							discounts.push(shipmethod*.01);
						
					}
					var subtotal=total;
					for (var i=0;i<discounts.length;i++){
						total+=discounts[i]*subtotal;
					}
					nlapiSetFieldValue('custbody_orion_subtotal',total);

		}
	}
	return true;
}

function so_onload(type){
	
	if (nlapiGetRecordType()=='salesorder'){
		var status=nlapiGetFieldValue('status');
		//alert(status);
		if (status!=null){
			if (status.indexOf('Fulfill')>-1){
				var lines=nlapiGetLineItemCount('item');
				var total=parseFloat(0);
				var discounts=new Array();
				for (var i=1;i<=lines;i++){
					//nlapiSelectLineItem('item',i);
					var orion=nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i);
					//if (orion=='T'){
						//nlapiSetCurrentLineItemValue('item','commitinventory',1);
					//}
					//else {
						//nlapiSetCurrentLineItemValue('item','commitinventory',3);
					//}
					//nlapiSetCurrentLineItemValue('item','commitmentfirm',orion,false);
					var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
					var itemtype=nlapiGetLineItemValue('item','itemtype',i);
					
					if (nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
						
						var rate=nlapiGetLineItemValue('item','rate',i);
						if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
							rate=rate.substring(0,rate.length-1);
							discounts.push(rate*.01);
							//alert(rate);
						}
						else if (itemtype=='Discount'){
							var amount=parseFloat(nlapiGetLineItemValue('item','amount',i));
							total+=amount; 
						}
						else {
							var amount=parseFloat(rate*unf);
							total+=amount; 
						}
					}
					//nlapiCommitLineItem('item');
				}
				var shipmethod=nlapiGetFieldText('shipmethod');
				if(shipmethod!=null&& shipmethod.indexOf('%')!=-1){
					shipmethod=shipmethod.replace(/\D/g,'');
					shipmethod=parseFloat(shipmethod);
					if (typeof shipmethod=='number')
						discounts.push(shipmethod*.01);
					//alert(shipmethod);
				}
				var subtotal=total;
				
				for (var i=0;i<discounts.length;i++){
					total+=discounts[i]*subtotal;
				}
				nlapiSetFieldValue('custbody_orion_subtotal',total);
			}
			else {
				var lines=nlapiGetLineItemCount('item');
				var total=parseFloat(0);
				var discounts=new Array();
				for (var i=1;i<=lines;i++){
					var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
					var itemtype=nlapiGetLineItemValue('item','itemtype',i);
					if (nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
						
						var rate=nlapiGetLineItemValue('item','rate',i);
						if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
							rate=rate.substring(0,rate.length-1);
							discounts.push(rate*.01);
							//alert(rate);
						}
						else if (itemtype=='Discount'){
							var amount=parseFloat(nlapiGetLineItemValue('item','amount',i));
							total+=amount; 
						}
						else {
							var amount=parseFloat(rate*unf);
							total+=amount; 
						}
					}
				}
				var shipmethod=nlapiGetFieldText('shipmethod');
				if(shipmethod!=null&& shipmethod.indexOf('%')!=-1){
					shipmethod=shipmethod.replace(/\D/g,'');
					shipmethod=parseFloat(shipmethod);
					if (typeof shipmethod=='number')
						discounts.push(shipmethod*.01);
					//alert(shipmethod);
				}
				var subtotal=total;
				for (var i=0;i<discounts.length;i++){
					total+=discounts[i]*subtotal;
				}
				nlapiSetFieldValue('custbody_orion_subtotal',total);
			}
		}
		else {
			var lines=nlapiGetLineItemCount('item');
			var total=parseFloat(0);
			var discounts=new Array();
			for (var i=1;i<=lines;i++){
				var fulfilled=nlapiGetLineItemValue('item','quantityfulfilled',i);
					var qty=nlapiGetLineItemValue('item','quantity',i);
					var unf=qty-fulfilled;
					var itemtype=nlapiGetLineItemValue('item','itemtype',i);
				if (nlapiGetLineItemValue('item','custcol_cps_orion_linereadytoship',i)=='T'&&(unf>0||itemtype=='Discount')&&nlapiGetLineItemText('item','item',i)!='Subtotal'){
					
					var rate=nlapiGetLineItemValue('item','rate',i);
					if( itemtype=='Discount'&&rate.indexOf('%')!=-1){
						rate=rate.substring(0,rate.length-1);
						discounts.push(rate*.01);
						//alert(rate);
					}
					else if (itemtype=='Discount'){
							var amount=parseFloat(nlapiGetLineItemValue('item','amount',i));
							total+=amount; 
						}
					else {
						var amount=parseFloat(rate*unf);
						total+=amount; 
					}
				}
			}
			var shipmethod=nlapiGetFieldText('shipmethod');
			if(shipmethod!=null&& shipmethod.indexOf('%')!=-1){
				shipmethod=shipmethod.replace(/\D/g,'');
				shipmethod=parseFloat(shipmethod);
				if (typeof shipmethod=='number')
					discounts.push(shipmethod*.01);
				//alert(shipmethod);
			}
			var subtotal=total;
			if (subtotal!=0){
			for (var i=0;i<discounts.length;i++){
				total+=discounts[i]*subtotal;
			}
			}
			nlapiSetFieldValue('custbody_orion_subtotal',total);
		}
		if (type=='copy'){
			//alert(nlapiGetFieldValue('custpage_sd'));
			nlapiSetFieldValue('shipdate',nlapiGetFieldValue('custpage_sd'));
		}
	}
	else if (nlapiGetRecordType()=='invoice'&&type=='copy'){
        var theSOid =  parseInt(nlapiGetFieldValue('createdfrom'));     //rb - SO id needed to be converted to number
		var shipmeth=nlapiLookupField('salesorder',theSOid,'shipmethod');
//		var shipmeth=nlapiLookupField('salesorder',nlapiGetFieldValue('createdfrom'),'shipmethod');
		nlapiSetFieldValue('shipmethod',shipmeth);
		Shipping.calculateRates();
	}

}
function so_entity(type,name,linenum){
if (name=='entity'){
	if (nlapiGetFieldValue('entity')!=null&&nlapiGetFieldValue('entity')!=''){
		var lines=nlapiGetLineItemCount('item');
		var items=new Array();
		for (var i=1; i<=lines;i++){
			
			items.push(nlapiGetLineItemValue('item','item',i));
			
		}
		var skus=nlapiSearchRecord('customrecord_customer_sku',null,
				[new nlobjSearchFilter('custrecord_cs_item',null,'anyof',items),new nlobjSearchFilter('custrecord_cs_customer',null,'anyof',nlapiGetFieldValue('entity'))],
				[new nlobjSearchColumn('custrecord_cs_item'),new nlobjSearchColumn('custrecord_cs_sku')]);
		for (var i=0; skus!=null&&i<skus.length;i++){
			var item=skus[i].getValue('custrecord_cs_item');
			var sku=skus[i].getValue('custrecord_cs_sku');
			for (var j=1; j<=lines;j++){
				if (nlapiGetLineItemValue('item','item',j)==item){
					nlapiSelectLineItem('item',j);
					nlapiSetCurrentLineItemValue('item','custcol_customer_sku',sku,false);
					nlapiCommitLineItem('item');
				}
			}
		}
	}
	else {
		var lines=nlapiGetLineItemCount('item');
		for (var j=1; j<=lines;j++){
				nlapiSelectLineItem('item',j);
				nlapiSetCurrentLineItemValue('item','custcol_customer_sku','',false);
				nlapiCommitLineItem('item');
		}
	}
}
}