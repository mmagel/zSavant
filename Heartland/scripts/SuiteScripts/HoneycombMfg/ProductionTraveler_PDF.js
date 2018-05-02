/**
 * Copyright NetSuite, Inc. 2013 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * Module description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Mar 2013     jbucoy		   Initial version
 *
 */
{
	var FLD_ID = 'id';
	
	var REC_WORK_ORDER = 'workorder';
	
	var REC_MFG_OPERATION_TASK = 'manufacturingoperationtask';
	var FLD_MOT_WO = 'workorder';
	
	var SS_PRODUCTION_TRAVELER = 'customsearch_jb_production_traveler';
}
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function productionTraveler(request, response)
{
	var idWO = request.getParameter(FLD_ID);
	ns.context.set('recId', idWO).set('recType', REC_WORK_ORDER);
	
	var pdf = new ns.PdfReport();
	pdf.addCss([
		'body { font-family: Helvetica; font-size: 10pt }',
		'.headertitle { font-size: 18pt; font-weight: bold; }',
		'.headerdetail { font-size: 10pt; padding: 0px 10px 0px 10px; }',
		'.row { padding: 2px 0px 2px 0px; }',
	]);
	
	//header
	var tableHeader = new ns.TableWiki();
	tableHeader.add('| {com.pagelogo}| | {func.fnHeader}|');
	
	pdf.setHeader(tableHeader, 40, 'header', 1);
	
	//main
	var aFilters = new Array();
	aFilters.push(new nlobjSearchFilter(FLD_MOT_WO, null, 'anyof', idWO));
	
	var tableSearch = new ns.TableSearch();
	tableSearch.setHeaderFunction(function(columns) {
		return new ns.TableWiki({cssPrefix: 'plain'}, [
		    '|b.row <u>Operation Sequence</u>|b <u>Name</u>|b <u>Workcenter</u>|b <u>Start Date</u>|b <u>End Date</u>|b <u>Qty Complete</u>|'
		]);
	});
	tableSearch.setRowFunction(function(columns, rowOffset, rec) {
		return new ns.TableWiki({cssPrefix: 'plain'}, [
		    '|.row {0}| {1}| {2}| {3}| {4}|R {5}|'
		]);
	});
	tableSearch.setSearch(REC_MFG_OPERATION_TASK, SS_PRODUCTION_TRAVELER, aFilters, null);
	
    pdf.add(tableSearch);
    
    //show pdf	
	pdf.download(response);
}

function fnHeader()
{
    return new ns.TableWiki()
    .setCssPrefix('plain')
    .add([
        '|2c.headertitle Production Traveler|',
        '|b.headerdetail Work Order #|.headerdetail {rec.tranid}|',
        '|b.headerdetail Customer|.headerdetail {rec.entity}|',
        '|b.headerdetail Item|.headerdetail {rec.assemblyitem}|',
        '|b.headerdetail Qty|.headerdetail {rec.quantity}|'
    ]);	
}