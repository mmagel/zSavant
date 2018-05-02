this.run = function(request, response) {
	var r = new $R(
			{
				"nlobjRecordType" : "itemfulfillment",
				"nlobjFieldIds" : {
					"shipstatus" : "C",
					"celigo_nlobjTransformId" : 8264,
					"entity" : "Whole Foods, Inc - PARENT : Whole Foods -ADN - Addison",
					"custbody_celigo_freightamount" : "0.0000",
					"custbody8" : "COLLECT",
					"custbody7" : "1-Must Ship",
					"shippeddate" : "03/07/2016",
					"shipmethod" : "",
					"custbody_celigo_totalcartons" : "34",
					"celigo_replaceAllLines_package" : "T",
					"celigo_replaceAllLines_packageups" : "T",
					"celigo_replaceAllLines_packageusp" : "T",
					"celigo_replaceAllLines_packagefedex" : "T",
					"celigo_recordmode_dynamic" : true
				},
				"nlobjSublistIds" : {
					"item" : {
						"lines" : [ {
							"item" : 85,
							"custcol_celigo_cartonnum" : "",
							"itemreceive" : "T",
							"custcol_celigo_istaped" : "",
							"quantity" : "224"
						}, {
							"item" : 132,
							"custcol_celigo_cartonnum" : "",
							"itemreceive" : "T",
							"custcol_celigo_istaped" : "",
							"quantity" : "36"
						} ]
					},
					"package" : {
						"lines" : [ {
							"packagedescr" : "AIRA-1028",
							"packagetrackingnumber" : "TEST13456",
							"packageweight" : 1
						}, {
							"packagedescr" : "TRNB-1054",
							"packagetrackingnumber" : "TEST13456",
							"packageweight" : 1
						} ]
					},
					"packageusp" : {
						"lines" : [ {
							"packagedescrusp" : "AIRA-1028",
							"packagetrackingnumberusp" : "TEST13456",
							"packageweightusp" : 1
						}, {
							"packagedescrusp" : "TRNB-1054",
							"packagetrackingnumberusp" : "TEST13456",
							"packageweightusp" : 1
						} ]
					},
					"packageups" : {
						"lines" : [ {
							"packagedescrups" : "AIRA-1028",
							"packagetrackingnumberups" : "TEST13456",
							"packageweightups" : 1
						}, {
							"packagedescrups" : "TRNB-1054",
							"packagetrackingnumberups" : "TEST13456",
							"packageweightups" : 1
						} ]
					},
					"packagefedex" : {
						"lines" : [ {
							"packagedescrfedex" : "AIRA-1028",
							"packagetrackingnumberfedex" : "TEST13456",
							"packageweightfedex" : 1
						}, {
							"packagedescrfedex" : "TRNB-1054",
							"packagetrackingnumberfedex" : "TEST13456",
							"packageweightfedex" : 1
						} ]
					}
				},
				"documentIndex" : 0,
				"allIndex" : [ 0, 1 ]
			});

	try {
		var id = r.save();
		nlapiLogExecution('AUDIT', 'id', id);
	} catch (e) {
		response.write(e);
	}
}