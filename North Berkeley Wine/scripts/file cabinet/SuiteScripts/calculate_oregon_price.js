function line_init(type){
	if (type=='item'&&nlapiGetCurrentLineItemValue('item','item')!=''&&nlapiGetCurrentLineItemValue('item','item')!=null){
		var itemfields=nlapiLookupField('item',nlapiGetCurrentLineItemValue('item','item'),['baseprice','custitem7','custitem56']);
		var btg=itemfields.custitem56;
		var bpc=itemfields.custitem7;
		var baseprice=itemfields.baseprice;
		var oregonprice;
if (bpc==''||bpc==null){
			bpc=12;
		}
		if (btg!=null&&btg!=''){
			oregonprice=btg-0+12/bpc;
		}
		else {
			oregonprice=(baseprice*.9)-0+12/bpc;
		}
		//alert(oregonprice);
		nlapiSetCurrentLineItemValue('item','custcol_oregon_price',oregonprice,false);
	}
}
//bottles per case standard custitem7
//btg custitem56
function op_field_changed(type,name,linenum){
	if (type=='item'&&name=='item'){
		var itemfields=nlapiLookupField('item',nlapiGetCurrentLineItemValue('item','item'),['baseprice','custitem7','custitem56']);
		var btg=itemfields.custitem56;
		var bpc=itemfields.custitem7;
		var baseprice=itemfields.baseprice;
		var oregonprice;
		//alert(baseprice);
		if (bpc==''||bpc==null){
			bpc=12;
		}
		if (btg!=null&&btg!=''){
			oregonprice=btg-0+12/bpc;
		}
		else {
			oregonprice=(baseprice*.9)-0+12/bpc;
		}
		//alert(oregonprice);
		nlapiSetCurrentLineItemValue('item','custcol_oregon_price',oregonprice,false);
	}
}
function line_val(type){
	if (type=='item'&&nlapiGetCurrentLineItemValue('item','item')!=''&&nlapiGetCurrentLineItemValue('item','item')!=null){
		var itemfields=nlapiLookupField('item',nlapiGetCurrentLineItemValue('item','item'),['baseprice','custitem7','custitem56']);
		var btg=itemfields.custitem56;
		var bpc=itemfields.custitem7;
		var baseprice=itemfields.baseprice;
		var oregonprice;
if (bpc==''||bpc==null){
			bpc=12;
		}
		if (btg!=null&&btg!=''){
			oregonprice=btg-0+12/bpc;
		}
		else {
			oregonprice=(baseprice*.9)-0+12/bpc;
		}
		//alert(oregonprice);
		nlapiSetCurrentLineItemValue('item','custcol_oregon_price',oregonprice,false);
	}
	return true;
}