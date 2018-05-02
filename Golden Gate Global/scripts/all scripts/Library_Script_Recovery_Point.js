var global_context = nlapiGetContext();
var global_start_time = new Date();

function checkGovernance(governance_threshold, message) {
	elapsed_time_threshold = 55;
	governance_threshold = governance_threshold + 100 || 200;
	message = message || '';
	var points = global_context.getRemainingUsage();
	var current_time = new Date();
	var elapsed_time = ((current_time - global_start_time) / 60000).toFixed(2); // elapsed time in minutes
	// nlapiLogExecution('AUDIT', 'checkGovernance', 'points remaining: ' + points + (message ? ' message: ' + message : '') + '  --  elapsed_time: ' + elapsed_time + ' minutes');
	if (points < governance_threshold || elapsed_time >= elapsed_time_threshold) {
		// try {
			setRecoveryPoint();
		// } catch (e) {
			// var script_info = getScriptInfo();
			// nlapiLogExecution('DEBUG', 'Rescheduling Script');
			// nlapiScheduleScript(script_info.script_id, script_info.deploy_id);
			// throw e;
		// }

		//nlapiLogExecution('DEBUG', 'nlapiYieldScript', 'Attempting to Yield Script...');
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution("ERROR", "Failed to yield script, exiting: Reason = " + state.reason + " / Size = " + state.size);
			throw "Failed to yield script";
		} else if (state.status == 'RESUME') {
			nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason + ".  Size = " + state.size);
		}
		// state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
	}
	return points;
}

function setRecoveryPoint() {
	if (typeof SCRIPT_RESCHEDULED != 'undefined'){
		SCRIPT_RESCHEDULED = true;
	}
	nlapiLogExecution('DEBUG', 'setRecoveryPoint', 'Setting Recovery Point...');
	var state = nlapiSetRecoveryPoint(); //100 point governance
	if (state.status == 'SUCCESS') return; //we successfully create a new recovery point
	if (state.status == 'RESUME') { //a recovery point was previously set, we are resuming due to some unforeseen error
		nlapiLogExecution("ERROR", "Resuming script because of " + state.reason + ".  Size = " + state.size);
		handleRecoveryFailure(state);
	} else if (state.status == 'FAILURE') { //we failed to create a new recovery point
		nlapiLogExecution("ERROR", "Failed to create recovery point. Reason = " + state.reason + " / Size = " + state.size);
		handleRecoveryFailure(state);
	}
}

function handleRecoveryFailure(failure) {
	nlapiLogExecution('ERROR', 'handleRecoveryFailure', 'Failed: ' + JSON.stringify(failure));
	if (failure.reason == 'SS_MAJOR_RELEASE') throw "Major Update of NetSuite in progress, shutting down all processes";
	if (failure.reason == 'SS_CANCELLED') throw "Script Cancelled due to UI interaction";
	if (failure.reason == 'SS_EXCESSIVE_MEMORY_FOOTPRINT') {
		throw "Exceeded Memory Footprint";
		// cleanUpMemory();
		// setRecoveryPoint();
	} //avoid infinite loop
	if (failure.reason == 'SS_DISALLOWED_OBJECT_REFERENCE') throw "Could not set recovery point because of a reference to a non-recoverable object: " + failure.information;
}

function cleanUpMemory() {
	// ...set references to null, dump values seen in maps, etc
}
