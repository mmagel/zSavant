
function so_fc(type,name,linenum){
	if (type=='item'&&name=='item'){
		var item=nlapiGetCurrentLineItemValue(type,name);
		if (item!=''&&item!=null){
			var cp=nlapiGetCurrentLineItemValue(type,'custcol1');
				if (cp!=''&&cp!=null){
					nlapiSetCurrentLineItemValue(type,'quantity',cp);
				}
			
		}
	}
}