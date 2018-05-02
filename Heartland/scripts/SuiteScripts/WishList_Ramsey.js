var WishList_ID = 8;
var removeItemUrl = "https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=7&deploy=1&compid=TSTDRV494075&h=62b56f93f98fb36dc6d4";
var clearWishListUrl = "https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=8&deploy=1&compid=TSTDRV494075&h=daedccbf70d7ed13f9d2";

var customWishList = 'custentity_itemswishlist';

var DEBUG=true;

function ViewWishList(params)
{
	var idCustomer = params.getParameter('idCustomer');
	var catalogue = params.getParameter('accountnbr');
	
	var cssUrl = "'http://shopping.netsuite.com/c."+catalogue+"/site/styleWL.css'";
	var imageRemoveUrl = "'http://shopping.netsuite.com/c."+catalogue+"/site/remove.gif'";
	var imageClearUrl = "'http://shopping.netsuite.com/c."+catalogue+"/site/clear.gif'";
	var imageAddToCartUrl = "'http://shopping.netsuite.com/c."+catalogue+"/site/addtocart.gif'";
	var viewWishListUrl = "'http://shopping.netsuite.com/s.nl/c."+catalogue+"/it.I/id." + WishList_ID  + "/.f'";
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', idCustomer, null );
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'entityid' );
	var searchresults = nlapiSearchRecord( 'customer', null, filters, columns );
	if(searchresults != null && searchresults.length > 0)
	{
		customer = nlapiLoadRecord('customer', idCustomer);
	}
	else
	{
		customer = nlapiLoadRecord('lead', idCustomer);
	}
	
	//var customer = nlapiLoadRecord('lead', idCustomer);
	
	var itemsWL = customer.getFieldValue(customWishList);
	var html = "<html><head><link href=" + cssUrl + " rel='stylesheet' type='text/css'></head>";
	html = html + "<script language='javascript'>";
	html = html + "function RedirectGProxy(){window.open('http://www.gproxy.com');}";
	if(itemsWL == null || itemsWL == "")
	{
		html = html + "</script>";
		html = html + "<body><table><tr><td class='arial12bold'><label>There are no items in your WishList</label></td></tr>";
		html = html + "<tr><td>&nbsp;</td></tr>"
	}
	else
	{	
		html = html + "function ajax_do(idItem, qty){window.parent.location = 'http://shopping.netsuite.com/app/site/backend/additemtocart.nl?c=" + catalogue + "&buyid=' + idItem + '&qty=' + qty;}";
		html = html + "var itemsCart = new Array(); function send(){var _multi = '';for (var i=0;i<itemsCart.length;i++){var _itm = itemsCart[i];_multi += _itm.id.replace('qty_','')+','+_itm.qty+';'; ajax_do(_itm.id.replace('qty_',''), _itm.qty);} window.parent.location = 'http://shopping.netsuite.com/s.nl/c." + catalogue + "/sc.3/.f' }"
		html = html + "function popItemX_ID(parid){for(var i=0;i<itemsCart.length;i++){if (itemsCart[i].id==parid){itemsCart.splice(i,1);}}}";
		html = html + "function qtyChanged(event){event = event || window.event;var qty = event.target || event.srcElement;popItemX_ID(qty.id);val=document.getElementById(qty.id).value;itemsCart[itemsCart.length]={id:qty.id,qty:val};}";
		html = html + "function Redirect(item){window.parent.location = 'http://shopping.netsuite.com/s.nl/c." + catalogue + "/it.A/id.' + item + '/.f';}";
		html = html + "function RemoveItem(item){window.location = '" + removeItemUrl + "&idCustomer=" + idCustomer + "&accountnbr=" + catalogue + "&idItem=' + item;}";
		html = html + "function ClearWishList(){window.location.href = '" + clearWishListUrl + "&accountnbr=" + catalogue + "&idCustomer=" + idCustomer + "';}";
		html = html + "function AddToCart(item){var qtyId = 'qty_' + item;var qty = document.getElementById(qtyId).value;ajax_do(item, qty);}"
		html = html + "</script>";
			
		var itemsWLArray = new Array();
		itemsWLArray = itemsWL.split(";");
		
		html = html + "<body><table width='500' border='0' cellpadding='0' cellspacing='0' class='border'><tr>";
    	html = html + "<td width='80' bgcolor='#999999' class='arial12bold'>Name</td>";
    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
    	html = html + "<td height='30' bgcolor='#999999' class='arial12bold'>Description</td>";
    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
    	html = html + "<td width='70' bgcolor='#999999' class='arial12bold'>Price</td>";
    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
    	html = html + "<td width='70' bgcolor='#999999' class='arial12bold'>Qty</td>";
    	html = html + "<td width='44' bgcolor='#999999' class='arial12bold'>&nbsp;</td>";
		html = html + "<td width='70' bgcolor='#999999' class='arial12bold'>&nbsp;</td></tr>";
    	for(var i = 0; i < itemsWLArray.length - 1; i++)
		{
			var item = itemsWLArray[i];
	
			// Get item type
			var arrSearchFilters = new Array();
			arrSearchFilters[0] = new nlobjSearchFilter('internalid', null, 'anyOf', item);
			
			var arrSearchColumns = new Array();
			nlapiLogExecution('DEBUG','Item', item);

			arrSearchColumns[0] = new nlobjSearchColumn('internalid');
			arrSearchColumns[1] = new nlobjSearchColumn('type');
			
			var itemResults =  nlapiSearchRecord('item', null, arrSearchFilters, arrSearchColumns);
	
			var rectype = itemResults[0].getRecordType();
			if (DEBUG)
			{
				nlapiLogExecution('DEBUG','Item Type', rectype);
				nlapiLogExecution('DEBUG','Item', item);
			}


			var itemRecord = nlapiLoadRecord(rectype, item);
			var itemName = itemRecord.getFieldValue('storedisplayname');
			var bgcolor = null;
			if(i % 2 == 0)
			{
				bgcolor = '#EBEBEB';
			}
			else
			{
				bgcolor = '#F8F8F8';
			}
    		html = html + "<tr><td height='25' bgcolor=" + bgcolor + " class='arial11normal'><label onClick='Redirect( " + item + ")'><a href='#'>" + itemName + "</a></label></td>";
    		var itemDescription = itemRecord.getFieldValue('salesdescription');
    		if(itemDescription == null)
			{
				itemDescription = "";
			}
			if((i + 1) % 4 == 0)
			{
		    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
			}
    		html = html + "<td bgcolor=" + bgcolor + " class='arial11normal'>" + itemDescription + "</td>";
			if((i + 1) % 4 == 0)
			{
		    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
			}
			var price = itemRecord.getLineItemValue('price1', 'price_1_', 1);
			if(price == null)
			{
				price = "";
			}
			else
			{
				price = "$" + price;
			}
	    	html = html + "<td bgcolor=" + bgcolor + " class='arial11normal'>" + price + "</td>";
			if((i + 1) % 4 == 0)
			{
		    	html = html + "<td width='1' rowspan='4' bgcolor='#CCCCCC'></td>";
			}
	    	html = html + "<td bgcolor=" + bgcolor + " class='arial11normal'><input type='text' style='width:40px;' value='1' id='qty_" + item + "' name='qty_" + item +  "' onblur='qtyChanged(event)'  /></td>";
	    	html = html + "<td bgcolor=" + bgcolor + " class='arial11normal'><a href='#'><img src=" + imageRemoveUrl + "  onClick='RemoveItem(" + item + ")' border='0'><a href='#'></td>";
	    	html = html + "<td bgcolor=" + bgcolor + "  align='right'><a href='#'><img src=" + imageAddToCartUrl + " width='94' height='28' onclick='AddToCart(" + item + ")' border='0'><a href='#'></td></tr>";
		}
      		html = html + "</table>";
	      	html = html + "<table width='500' border='0' cellpadding='0' cellspacing='0' class='border'>";
  		html = html + "<tr><td colspan='7' bgcolor='#FFFFFF' class='arial12bold' ><table width='100%' border='0' cellspacing='0' cellpadding='0'>";
  		html = html + "<tr><td align='right' bgcolor='#ebebeb'>&nbsp;</td><td width='1'></td><td width='104'><a href='#'><img src=" + imageClearUrl + " width='104' height='28' onclick='ClearWishList()' border='0'><a href='#'></td>";
		html = html + "</tr></table></td></tr></table>";
	}
	html = html + "<table>";
	html = html + "<tr><td >&nbsp;</td></tr>";
	html = html + "<tr><td style='font-size:12px' class='arial11normal'>Provided by <label onClick='RedirectGProxy()'><a href='#'>GProxy Design</a></label></td></tr>";
	html = html + "</table>";
	html = html + "</body></html>";
	response.write(html);
	response.setHeader('Custom-Header-Demo', 'Demo');
}


function AddToWishList(params)
{	
	var idCustomer = params.getParameter('idCustomer');
	var idItem = params.getParameter('idItem');
	var url = params.getParameter('url');
	while(url.indexOf("*") != -1)
	{
		url = url.replace("*","&");
	}
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', idCustomer, null );
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'entityid' );
	var searchresults = nlapiSearchRecord( 'customer', null, filters, columns );
	if(searchresults != null && searchresults.length > 0)
	{
		customer = nlapiLoadRecord('customer', idCustomer);
	}
	else
	{
		customer = nlapiLoadRecord('lead', idCustomer);
	}
	
	//var customer = nlapiLoadRecord('lead', idCustomer);
		
	if(customer.getFieldValue('lastname') == null)
	{
		customer.setFieldValue('lastname',' ');
	}
	
	var itemsWL = customer.getFieldValue(customWishList);
	if(itemsWL == null)
	{
		itemsWL = idItem + ";";
		customer.setFieldValue(customWishList, itemsWL);	
		nlapiSubmitRecord(customer, true);
	}
	else
	{
		var exists = false;	
		var itemsArray = new Array();
		itemsArray = itemsWL.split(';');
		for(var i = 0; i < itemsArray.length - 1; i++)
		{
			var itemID = itemsArray[i];
			if(itemID == idItem)
			{	
				exists = true;
			}
		}
		if(!exists)
		{
			itemsWL = itemsWL + idItem + ";";
			customer.setFieldValue(customWishList, itemsWL);	
			nlapiSubmitRecord(customer, true);
		}
	}	
	var html = "<html><script language='javascript'>";
	html = html + "function Redirect(){window.parent.location = '" + url + "';}";
	html = html + "</script>";
	html = html + "<body onLoad='Redirect()'></body></html>";
	response.write( html );
	response.setHeader('Custom-Header-Demo', 'Demo');
}

function RemoveFromWishList(params)
{
	var idCustomer = params.getParameter('idCustomer');
	var idItem = params.getParameter('idItem');
	var catalogue = params.getParameter('accountnbr');
	
	var viewWishListUrl = "'http://shopping.netsuite.com/s.nl/c."+catalogue+"/it.I/id." + WishList_ID  + "/.f'";
		
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', idCustomer, null );
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'entityid' );
	var searchresults = nlapiSearchRecord( 'customer', null, filters, columns );
	if(searchresults != null && searchresults.length > 0)
	{
		customer = nlapiLoadRecord('customer', idCustomer);
	}
	else
	{
		customer = nlapiLoadRecord('lead', idCustomer);
	}
	
	//var customer = nlapiLoadRecord('lead', idCustomer);
	
	var itemsWL = customer.getFieldValue(customWishList);
	var itemsArray = new Array();
	itemsArray = itemsWL.split(';');
	var newItems = "";
	for(var i = 0; i < itemsArray.length - 1; i++)
	{
		var itemID = itemsArray[i];
		if(itemID != idItem)
		{
			newItems = newItems + itemsArray[i] + ";";
		}
	}
	customer.setFieldValue(customWishList, newItems);	
	nlapiSubmitRecord(customer, true);
	
	var html = "<html><script language='javascript'>";
	html = html + "function Redirect(){window.parent.location = " + viewWishListUrl + ";}";
	html = html + "</script>";
	html = html + "<body onLoad='Redirect()'></body></html>";
	response.write( html );
	response.setHeader('Custom-Header-Demo', 'Demo');
}

function ClearWishList(params)
{
	var idCustomer = params.getParameter('idCustomer');
	var catalogue = params.getParameter('accountnbr');
	
	var viewWishListUrl = "'http://shopping.netsuite.com/s.nl/c."+catalogue+"/it.I/id." + WishList_ID  + "/.f'";
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', idCustomer, null );
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'entityid' );
	var searchresults = nlapiSearchRecord( 'customer', null, filters, columns );
	if(searchresults != null && searchresults.length > 0)
	{
		customer = nlapiLoadRecord('customer', idCustomer);
	}
	else
	{
		customer = nlapiLoadRecord('lead', idCustomer);
	}
	
	//var customer = nlapiLoadRecord('lead', idCustomer);
	
	customer.setFieldValue(customWishList, null);
	nlapiSubmitRecord(customer, true);
	
	var html = "<html><script language='javascript'>";
	html = html + "function Redirect(){window.parent.location = " + viewWishListUrl + ";}";
	html = html + "</script>";
	html = html + "<body onLoad='Redirect()'></body></html>";
	response.write( html );
	response.setHeader('Custom-Header-Demo', 'Demo');
}
