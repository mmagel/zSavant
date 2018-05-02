function customer_deposit_before_load(type,form,request){
	
	if (type=='create'){
		if (request!=null){
			var so=request.getParameter('salesorder');
			if (so!=null&&so!=''&&typeof so!= 'undefined'){
				var orionsub=nlapiLookupField('salesorder',so,'custbody_orion_subtotal');
				nlapiSetFieldValue('payment',orionsub);
			}
	}
	}
}