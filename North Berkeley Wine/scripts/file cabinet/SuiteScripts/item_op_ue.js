
function set_orergon_price_after_submit(type){
try { 
		var itemfields=nlapiLookupField('item',nlapiGetRecordId(),['baseprice','custitem7','custitem56']);
		var btg=itemfields.custitem56;
		var bpc=itemfields.custitem7;
		var baseprice=itemfields.baseprice;
		var oregonprice;
		if (bpc==''|bpc==null){
			bpc=12;
		}
		if (btg!=null&&btg!=''){
			oregonprice=btg-0+12/bpc;
		}
		else {
			oregonprice=(baseprice*.9)-0+12/bpc;
		}
		//alert(oregonprice);
		nlapiSubmitField('inventoryitem',nlapiGetRecordId(),'custitem_oregon_price',oregonprice,false);
}
catch(e){
	nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
}
}