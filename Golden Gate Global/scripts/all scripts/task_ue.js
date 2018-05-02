function task_before_load(type,form,request){
	var ev=request.getParameter('custpage_event');
	if (type=='create'&&ev!=null&&ev!=''){
		form.getField('custevent_sdm_task_event').setDefaultValue(ev);
		form.addField('custpage_event','select','','calendarevent').setDisplayType('hidden').setDefaultValue(ev);
	}
}
function task_after_submit(type){
	var ev=nlapiGetFieldValue('custpage_event');
	if (type=='create'&&ev!=null&&ev!=''&&ev==nlapiGetFieldValue('custevent_sdm_task_event')){
		nlapiSetRedirectURL('RECORD','calendarevent',ev);
	}
}
