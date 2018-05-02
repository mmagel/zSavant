/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Apr 2013     pblancaflor
 *
 */

function addOppItem() {
  var sItemId = getScriptParameter("custscript_hm_aoi_oi");
  
  nlapiSelectNewLineItem("item");
  nlapiSetCurrentLineItemValue("item", "item", sItemId, true, true);
  nlapiSetCurrentLineItemValue("item", "price", -1, true, true);
  nlapiSetCurrentLineItemValue("item", "rate", "0.00", true, true);
  nlapiSetCurrentLineItemValue("item", "amount", "0.00", true, true);
  nlapiCommitLineItem("item");
}

function getScriptParameter(sScriptParameterId) {
  var oContext = nlapiGetContext();
  
  var sScriptParameter = oContext.getSetting("SCRIPT", sScriptParameterId);
  
  return sScriptParameter;
}