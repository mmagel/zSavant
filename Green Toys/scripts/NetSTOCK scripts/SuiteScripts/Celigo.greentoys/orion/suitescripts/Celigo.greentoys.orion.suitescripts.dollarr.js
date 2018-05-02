this.run = function(request, response) {
	var nlapi = Celigo.suitescript.SuiteScript;
	var rec = nlapi.loadRecord('salesorder', 40130);

	response.write(JSON.stringify(rec, 0, 4));
	return;
	var r = new $R({
		"nlobjRecordType" : "itemfulfillment",
		"nlobjFieldIds" : {
			"shipstatus" : "C",
			"celigo_nlobjTransformId" : 40130,
			"_entity" : "Montclaire Toy House",
			"custbody_celigo_freightamount" : "0.0000",
			"custbody8" : "THIRDPARTY",
			"custbody7" : "2-Samples",
			"shippeddate" : "05/02/2016",
			"custbody_celigo_totalcartons" : "14",
			"celigo_replaceAllLinespackage" : "T",
			"celigo_replaceAllLinespackageups" : "T",
			"celigo_replaceAllLinespackagefedex" : "T",
			"celigo_recordmode_dynamic" : "T"
		},
		"nlobjSublistIds" : {
			"item" : {
				"lines" : [ {
					"item" : 85,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "8"
				}, {
					"item" : 2051,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "8"
				}, {
					"item" : 1341,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "1"
				}, {
					"item" : 2052,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "4"
				}, {
					"item" : 800,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "12"
				}, {
					"item" : 137,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "6"
				}, {
					"item" : 73,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "6"
				}, {
					"item" : 138,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "6"
				}, {
					"item" : 128,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "12"
				}, {
					"item" : 2061,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "4"
				}, {
					"item" : 105,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "4"
				}, {
					"item" : 91,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "6"
				}, {
					"item" : 513,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "6"
				}, {
					"item" : 69,
					"custcol_celigo_cartonnum" : "",
					"itemreceive" : "T",
					"custcol_celigo_istaped" : "",
					"quantity" : "9"
				} ]
			},
			"package" : {
				"lines" : [ {
					"packagedescr" : "AIRA-1028",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "CHP1-1151",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "CHST-1146",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "CPCK-1152",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "CSCA-1106",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "DTK01R",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "FRBA-1038",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "FTK01R",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "KYSA-1037",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "RBH1-1155",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "RKTA-1041",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "SEAA-1031",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "TEA01R",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				}, {
					"packagedescr" : "TUG01R-A",
					"packagetrackingnumber" : "WILL CALL",
					"packageweight" : 1
				} ]
			}
		},
		"documentIndex" : 0,
		"allIndex" : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ]
	});

	try {
		var id = r.save();
		response.write("done!" + id);
	} catch (e) {
		response.write("Failed \t" + e);
	}
}