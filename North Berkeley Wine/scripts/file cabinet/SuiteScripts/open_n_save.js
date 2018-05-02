/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Aug 2014     AHalbleib
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function open_n_save(recType, recId) {
	var rec=nlapiLoadRecord(recType,recId);
	nlapiSubmitRecord(rec,true,true);
}
