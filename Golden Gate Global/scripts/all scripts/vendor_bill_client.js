/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Jul 2014     AHalbleib
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function vendor_bill_field_changed(type, name, linenum){
	if (name=='entity'){
		var vendor=nlapiLoadRecord('vendor',nlapiGetFieldValue('entity'));
		if (vendor.getFieldValue('customform')==8){
			var base_amt=vendor.getFieldValue('custentity137');
			var advance=vendor.getFieldValue('custentity138');
			var incentive=vendor.getFieldValue('custentity139');
			var participation=vendor.getFieldValue('custentity140');
                        var base_amtd=vendor.getFieldValue('custentity202');
			var advanced=vendor.getFieldValue('custentity203');
			var incentived=vendor.getFieldValue('custentity204');
			var participationd=vendor.getFieldValue('custentity205');
			if (base_amt!=null&&base_amt.length>0){
				nlapiSetFieldValue('custbody_sdm_baseamount',base_amt);
			}
			if (advance!=null&&advance.length>0){
				nlapiSetFieldValue('custbody_sdm_advance',advance);
			}
			if (incentive!=null&&incentive.length>0){
				nlapiSetFieldValue('custbody_sdm_incentive',incentive);
			}
			if (participation!=null&&participation.length>0){
				nlapiSetFieldValue('custbody_sdm_participation',participation);
			}
nlapiSetFieldValue('custbodysdm_basewiredate',base_amtd);
nlapiSetFieldValue('custbodysdm_advancewiredate',advanced);
nlapiSetFieldValue('custbodysdm_incentivewiredate',incentived);
nlapiSetFieldValue('custbodysdm_participationwiredate',participationd);
		}
	}
}
function vendor_bill_validate_field(type,name,linenum){
//if (nlapiGetUser()==1102)
//alert(type+' '+name+' '+linenum);
	if (type=='expense'&&name=='custcol7'){

		var vendor=nlapiGetFieldValue('entity');
		if (vendor==null||vendor.length==0){
			return false;
		}
		else {
			var customer=nlapiGetCurrentLineItemValue(type,name);
			var proj=nlapiSearchRecord('job',null,new nlobjSearchFilter('parent',null,'anyof',customer),new nlobjSearchColumn('custentity37'));
			var match=false;
			for (var i=0; proj!=null&&i<proj.length; i++){
				if (vendor==proj[i].getValue('custentity37')){
					match=true;
				}
			}
			return match;
		}
	}
	return true;
}