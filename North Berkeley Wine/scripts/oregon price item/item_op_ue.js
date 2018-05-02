function set_orergon_price_after_submit(type){
try { 
		var itemfields=nlapiLookupField('item',nlapiGetRecordId(),['baseprice','custitem7','custitem56']);
		var btg=itemfields.custitem56; //BTG
		var bpc=itemfields.custitem7; // BOTTLES PER CASE - STANDARD
  		var blitzprice = itemfields.custitem76 //BLITZ PRICE
		var baseprice=itemfields.baseprice;
        var oregonprice;
        
        //rb
        if ( ( blitzprice !='' || blitzprice !=null )&&( bpc!='' || bpc!=null) ){
            oregonprice = (blitzprice / bpc)+1;
        } else 
        if (btg !='' || btg !=null){
            oregonprice = btg+1;
        } else {
            oregonprice = (baseprice * .9) +1
        }
        // end rb
        
/*
// aaron's original code (I think he confused the | with || operators)
		if (bpc==''|bpc==null){
			bpc=12;
		}
		if (btg!=null&&btg!=''){
			oregonprice=btg-0+12/bpc;
		}
		else {
			oregonprice=(baseprice*.9)-0+12/bpc;
        }
*/

		//alert(oregonprice);
		nlapiSubmitField('inventoryitem',nlapiGetRecordId(),'custitem_oregon_price',oregonprice,false);
}
catch(e){
	nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
}
}