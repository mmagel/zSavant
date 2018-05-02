//icje aub on linw level
//je, bill, po sub on head
//class on line for all

function tran_ac_before_load(type,form,request){
	var context=nlapiGetContext();
//	nlapiLogExecution('ERROR','a',context.getExecutionContext());
	if (context.getExecutionContext()=='userinterface'){
		try {
		var classes=nlapiSearchRecord('classification',null,null,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custrecord_n101_cseg_asset_class')]);
		var subsidiaries=nlapiSearchRecord('subsidiary',null,null,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custrecord_division')]);
		var projects=nlapiCreateSearch('job',null, [new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custentity_cseg_asset_class'),new nlobjSearchColumn('category'),new nlobjSearchColumn('custentity_project_class')]);
		var allresults=projects.runSearch();
		var array=new Array();
		var j=-1;
		do {
			j++;
			var thisresults = allresults.getResults(j*1000,j*1000+1000);
			for (var i=0; thisresults!=null&&i<thisresults.length; i++){
				var arr=new Array();
				arr.push(thisresults[i].getValue('internalid'));
				arr.push(thisresults[i].getValue('custentity_cseg_asset_class'));
				arr.push(thisresults[i].getValue('category'));
				arr.push(thisresults[i].getValue('custentity_project_class'));
				array.push(arr);
			}
			
		} while(allresults.getResults(j*1000,j*1000+1000)!=null&&allresults.getResults(j*1000,j*1000+1000).length==1000);
		
		var trantype=nlapiGetRecordType();	
		if (trantype=='purchaseorder'||trantype=='vendorbill'){
			var subfield=form.addField('custpage_div','text','a').setDisplayType('hidden');//.setDisplayType('hidden')
			var clasfield=form.getSubList('item').addField('custpage_class','text','b').setDisplayType('hidden');//.setDisplayType('hidden')
			
			var catfield=form.getSubList('item').addField('custpage_cat','text','c').setDisplayType('hidden');
			if (trantype=='vendorbill'){
				
				form.getSubList('expense').addField('custpage_class','text','b').setDisplayType('hidden');
				form.getSubList('expense').addField('custpage_cat','text','c').setDisplayType('hidden');
			}
			var cat;
			var ac;
			if (type=='edit'||type=='copy'){
				var sub=nlapiGetFieldValue('subsidiary');
				
				if (sub!=null&&sub!=''){
					//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
					for (var i=0;i<subsidiaries.length; i++){
						if (subsidiaries[i].getValue('internalid')==sub){
							div=subsidiaries[i].getValue('custrecord_division');
							break;
						}
					}
					subfield.setDefaultValue(div);
				}
				var lines=nlapiGetLineItemCount('item');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					var clas=nlapiGetLineItemValue('item','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('item','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('item','customer',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('item','custpage_cat',i,cat);
					}
				}
				var lines=nlapiGetLineItemCount('expense');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					var clas=nlapiGetLineItemValue('expense','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('expense','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('expense','customer',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('expense','custpage_cat',i,cat);
					}
				}
			}
		}
		if (trantype=='journalentry'){
			var subfield=form.addField('custpage_div','text','a').setDisplayType('hidden');//.setDisplayType('hidden')
			var clasfield=form.getSubList('line').addField('custpage_class','text','b').setDisplayType('hidden');//.setDisplayType('hidden')
			var catfield=form.getSubList('line').addField('custpage_cat','text','c').setDisplayType('hidden');
			var ac;
			var cat;
			if (type=='edit'||type=='copy'){
				var sub=nlapiGetFieldValue('subsidiary');
				
				if (sub!=null&&sub!=''){
					//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
					for (var i=0;i<subsidiaries.length; i++){
						if (subsidiaries[i].getValue('internalid')==sub){
							div=subsidiaries[i].getValue('custrecord_division');
							break;
						}
					}
					subfield.setDefaultValue(div);
				}
				var lines=nlapiGetLineItemCount('line');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					var clas=nlapiGetLineItemValue('line','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('line','entity',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_cat',i,cat);
					}
				}
			}
		}
		if (trantype=='intercompanyjournalentry'){
			//var subfield=form.addField('custpage_div','text','a');//.setDisplayType('hidden')
			var clasfield=form.getSubList('line').addField('custpage_class','text','b').setDisplayType('hidden');//.setDisplayType('hidden')
			var catfield=form.getSubList('line').addField('custpage_cat','text','c').setDisplayType('hidden');
			var subfield=form.getSubList('line').addField('custpage_div','text','d').setDisplayType('hidden');
			var cat;
			var ac;
			var div;
			if (type=='edit'||type=='copy'){
				
				var lines=nlapiGetLineItemCount('line');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					div='';
					var clas=nlapiGetLineItemValue('line','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('line','entity',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_cat',i,cat);
					}
					var sub=nlapiGetLineItemValue('line','linesubsidiary',i);
					if (sub!=null&&sub!=''){
						//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
						for (var j=0;j<subsidiaries.length; j++){
						if (subsidiaries[j].getValue('internalid')==sub){
							div=subsidiaries[j].getValue('custrecord_division');
							break;
						}
					}
						nlapiSetLineItemValue('line','custpage_div',i,div);
					}
				}
			}
		}
		}
		catch (e){
			nlapiLogExecution('ERROR',nlapiGetRecordId(),e.message);
		}
	}
}
function set_ac_field_changed(type,name,linenum){
	var trantype=nlapiGetRecordType();	
	//alert(name);
	if (trantype=='purchaseorder'||trantype=='vendorbill'){
		if ((type=='item'||type=='expense')&&name=='customer'){
			var value=nlapiGetCurrentLineItemValue(type,name);
			if (value!=''&&value!=null){
				fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class','custentity_project_class']);
			}
			
			var div=nlapiGetFieldValue('custpage_div');
			
			
			if (fields!=null&&fields.category==2){
				//alert('a');
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
				}
				if (fields.custentity_cseg_asset_class!=''&&fields.custentity_cseg_asset_class!=null&&typeof fields.custentity_cseg_asset_class=='string'){
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',fields.custentity_cseg_asset_class);
					
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
				if (fields.custentity_project_class!=''&&fields.custentity_project_class!=null&&typeof fields.custentity_project_class=='string'){
					nlapiSetCurrentLineItemValue(type,'class',fields.custentity_project_class);
					
				}
				else {
					nlapiSetCurrentLineItemValue(type,'class','');
				}
			}
			else {
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
				}
				if (div==7){
					var ac=nlapiGetCurrentLineItemValue(type,'custpage_class');
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',ac);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
			}
		}
	}
	if (trantype=='journalentry'){
		if (type=='line'&&name=='entity'){
			var value=nlapiGetCurrentLineItemValue(type,name);
			//alert(value);
			if (value!=''&&value!=null)
				fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class','custentity_project_class']);
			else {
				fields=null;
			}
			var div=nlapiGetFieldValue('custpage_div');
			
			
			if (fields!=null&&fields.category==2){
				//alert('a');
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
				}
				if (fields.custentity_cseg_asset_class!=''&&fields.custentity_cseg_asset_class!=null&&typeof fields.custentity_cseg_asset_class=='string'){
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',fields.custentity_cseg_asset_class);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
				if (fields.custentity_project_class!=''&&fields.custentity_project_class!=null&&typeof fields.custentity_project_class=='string'){
					nlapiSetCurrentLineItemValue(type,'class',fields.custentity_project_class);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'class','');
				}
			}
			else {
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
				}
				if (div==7){
					var ac=nlapiGetCurrentLineItemValue(type,'custpage_class');
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',ac);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
			}
		}
	}
	if (trantype=='intercompanyjournalentry'){
		if (type=='line'&&name=='entity'){
			var value=nlapiGetCurrentLineItemValue(type,name);
			//alert(value);
			var fields=null;
			if (value!=''&&value!=null)
				fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class','custentity_project_class']);
			
			var div=nlapiGetCurrentLineItemValue(type,'custpage_div');
			
			
			if (fields!=null&&fields.category==2){
				//alert('a');
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
					
				}
				if (fields.custentity_cseg_asset_class!=''&&fields.custentity_cseg_asset_class!=null&&typeof fields.custentity_cseg_asset_class=='string'){
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',fields.custentity_cseg_asset_class);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
				if (fields.custentity_project_class!=''&&fields.custentity_project_class!=null&&typeof fields.custentity_project_class=='string'){
					nlapiSetCurrentLineItemValue(type,'class',fields.custentity_project_class);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'class','');
				}
			}
			else {
				if (fields!=null)
					nlapiSetCurrentLineItemValue(type,'custpage_cat',fields.category);
				else {
					nlapiSetCurrentLineItemValue(type,'custpage_cat','');
					
				}
				if (div==7){
					var ac=nlapiGetCurrentLineItemValue(type,'custpage_class');
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',ac);
				}
				else {
					nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class','');
				}
			}
		}
	}
	//alert(name)
	if (name=='subsidiary'||(name=='entity'&&type!='item'&&type!='line')){
		var sub=nlapiGetFieldValue('subsidiary');
		var cursub='';
		//alert(sub)
		if (sub!=null&&sub!=''&&sub!=cursub){
			var div=nlapiResolveURL('SUITELET','customscript_subdivsearch','customdeploy_subdivsearch');
			var resp=nlapiRequestURL(div+'&sub='+sub);
			//set division
			var division=JSON.parse(resp.getBody());
			nlapiSetFieldValue('custpage_div',division['division']);
		}
		else if (sub==null||sub=='') {
			nlapiSetFieldValue('custpage_div','');
		}
	}
	if (name=='linesubsidiary'&&type=='line'){
		var sub=nlapiGetCurrentLineItemValue(type,'linesubsidiary');
		var cursub='';
		if (sub!=null&&sub!=''&&sub!=cursub){
			var div=nlapiResolveURL('SUITELET','customscript_subdivsearch','customdeploy_subdivsearch');
			var resp=nlapiRequestURL(div+'&sub='+sub);
			//set division
			var division=JSON.parse(resp.getBody());
			nlapiSetCurrentLineItemValue(type,'custpage_div',division['division']);
		}
		else if (sub==null||sub=='') {
			nlapiSetCurrentLineItemValue(type,'custpage_div','');
		}
	}
	if (name=='class'&&(type=='item'||type=='line'||type=='expense')){
		
		var clas=nlapiGetCurrentLineItemValue(type,name);
		//alert(clas);
		if (clas!=null&&clas!=''){
			var div=nlapiResolveURL('SUITELET','customscript_classacsearch','customdeploy_classacsearch');
			var resp=nlapiRequestURL(div+'&class='+clas);
			var ac=JSON.parse(resp.getBody());
			var cat=nlapiGetCurrentLineItemValue(type,'custpage_cat');
			//alert(ac['ac']);
			nlapiSetCurrentLineItemValue(type,'custpage_class',ac['ac']);
			if (trantype=='intercompanyjournalentry')
				div=nlapiGetCurrentLineItemValue(type,'custpage_div');
			else
				div=nlapiGetFieldValue('custpage_div');
			//alert(ac['ac']);
			if (cat!=2&&div==7){
				nlapiSetCurrentLineItemValue(type,'custcol_cseg_asset_class',ac['ac']);
			}
		}
		else {
			nlapiSetCurrentLineItemValue(type,'custpage_class','');
		}
	}
  if (type==null&&nlapiGetLineItemCount('item')<1&&name=='nexus'){
		nlapiCancelLineItem('item');
	}
	if (type==null&&nlapiGetLineItemCount('expense')<1&&name=='nexus'){
		nlapiCancelLineItem('expense');
	}
}
function tran_save_record(){
	try {
		nlapiCancelLineItem('line');
	}
	catch(e){
		
	}
	try {
		nlapiCancelLineItem('item');
	}
	catch(e){
		
	}
	try {
		nlapiCancelLineItem('expense');
	}
	catch(e){
		
	}
	return true;
}
function set_ac_line_init(type){
	///var trantype=nlapiGetRecordType();	
	//if (trantype=='purchaseorder'||trantype=='vendorbill'){
	//	if (type=='item'){
	//		var div=nlapiGetFieldValue('custpage_div');
			
	//			if ((fields.custentity_cseg_asset_class==''||fields.custentity_cseg_asset_class==null)&&(ac==null||ac=='')){
	//				alert('Please enter a value for asset class.');
	//.			}
	//		}
	//	}
	
}
function set_ac_ps(type,name){
	var trantype=nlapiGetRecordType();	
	//alert(name);
	if (trantype=='purchaseorder'||trantype=='vendorbill'){
	if (name=='subsidiary'||(name=='entity'&&type==null)){
		var sub=nlapiGetFieldValue('subsidiary');
		var cursub='';
		//alert(sub)
		if (sub!=null&&sub!=''&&sub!=cursub){
			var div=nlapiResolveURL('SUITELET','customscript_subdivsearch','customdeploy_subdivsearch');
			var resp=nlapiRequestURL(div+'&sub='+sub);
			//set division
			var division=JSON.parse(resp.getBody());
			nlapiSetFieldValue('custpage_div',division['division']);
		}
		else if (sub==null||sub=='') {
			nlapiSetFieldValue('custpage_div','');
		}
	}
	}
}
function set_ac_validate_line(type){
	var trantype=nlapiGetRecordType();	
	if (trantype=='purchaseorder'||trantype=='vendorbill'){
		if (type=='item'||type=='expense'){
			var value=nlapiGetCurrentLineItemValue(type,'customer');
			var ac=nlapiGetCurrentLineItemValue(type,'custcol_cseg_asset_class');
			if (value!=''&&value!=null&&typeof value!='undefined'){
				var fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class']);
				if (fields!=null&&fields.category==2){
					if ((fields.custentity_cseg_asset_class==''||fields.custentity_cseg_asset_class==null)&&(ac==null||ac=='')){
						alert('Please enter a value for asset class.');
						return false;
					}
				}
			}
		}
	}
	else if (trantype=='journalentry'){
		if (type=='line'){
			var value=nlapiGetCurrentLineItemValue(type,'entity');
			var ac=nlapiGetCurrentLineItemValue(type,'custcol_cseg_asset_class');
			if (value!=''&&value!=null&&typeof value!='undefined'){
				var fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class']);
				if (fields!=null&&fields.category==2){
					if ((fields.custentity_cseg_asset_class==''||fields.custentity_cseg_asset_class==null)&&(ac==null||ac=='')){
						alert('Please enter a value for asset class.');
						return false;
					}
				}
			}
		}
    }
    // begin adding deposit class check - rbender @ 10/11/2017
	else if (trantype=='deposit'){
        nlapiLogExecution('DEBUG','deposit','detected');
        if (type=='other'){
              var value=nlapiGetCurrentLineItemValue(type,'entity');
              //var ac=nlapiGetCurrentLineItemValue(type,'custcol_cseg_asset_class');
            var ac=nlapiGetFieldValue('custbody_cseg_asset_class'); 
                nlapiLogExecution('DEBUG','deposit','val='+value+' *** ac='+ac);
            if (value!=''&&value!=null&&typeof value!='undefined'){
                    var fields=nlapiLookupField('customer',value,['category','custentity_cseg_asset_class']);
                    if (fields == null || fields ==''){nlapiLogExecution('DEBUG','deposit','fields=NULL');}
                    if (fields!=null&&fields.category==2){
                        nlapiLogExecution('DEBUG','deposit','fieldscat='+fields.category);
                        if ((fields.custentity_cseg_asset_class==''||fields.custentity_cseg_asset_class==null)&&(ac==null||ac=='')){
                            alert('Please enter a value for asset class.');
                            return false;
                        }
                    }
            }
        }
    }
      // end deposit class check

	else if (trantype=='intercompanyjournalentry'){
		if (type=='line'){
			var value=nlapiGetCurrentLineItemValue(type,'entity');
			var ac=nlapiGetCurrentLineItemValue(type,'custcol_cseg_asset_class');
			if (value!=''&&value!=null&&typeof value!='undefined'){
				var fields=nlapiLookupField('job',value,['category','custentity_cseg_asset_class']);
				if (fields!=null&&fields.category==2){
					if ((fields.custentity_cseg_asset_class==''||fields.custentity_cseg_asset_class==null)&&(ac==null||ac=='')){
						alert('Please enter a value for asset class.');
						return false;
					}
				}
			}
		}
	}
	return true;
}
function tran_ac_before_submit(type,form,request){
	var context=nlapiGetContext();
//	nlapiLogExecution('ERROR','a',context.getExecutionContext());
	if (context.getExecutionContext()=='csvimport'){
		var classes=nlapiSearchRecord('classification',null,null,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custrecord_n101_cseg_asset_class')]);
		var subsidiaries=nlapiSearchRecord('subsidiary',null,null,[new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custrecord_division')]);
		var projects=nlapiCreateSearch('job',null, [new nlobjSearchColumn('internalid'),new nlobjSearchColumn('custentity_cseg_asset_class'),new nlobjSearchColumn('category'),new nlobjSearchColumn('custentity_project_class')]);
		var allresults=projects.runSearch();
		var array=new Array();
		var j=-1;
		do {
			j++;
			var thisresults = allresults.getResults(j*1000,j*1000+1000);
			for (var i=0; thisresults!=null&&i<thisresults.length; i++){
				var arr=new Array();
				arr.push(thisresults[i].getValue('internalid'));
				arr.push(thisresults[i].getValue('custentity_cseg_asset_class'));
				arr.push(thisresults[i].getValue('category'));
				arr.push(thisresults[i].getValue('custentity_project_class'));
				array.push(arr);
			}
			
		} while(allresults.getResults(j*1000,j*1000+1000)!=null&&allresults.getResults(j*1000,j*1000+1000).length==1000);
		//nlapiLogExecution('ERROR','array length',array.length);
		var trantype=nlapiGetRecordType();	
		if (trantype=='purchaseorder'||trantype=='vendorbill'){
			//var subfield=form.addField('custpage_div','text','a');//.setDisplayType('hidden')
			//var clasfield=form.getSubList('item').addField('custpage_class','text','b');//.setDisplayType('hidden')
			//var catfield=form.getSubList('item').addField('custpage_cat','text','c');
			var cat;
			var ac;
			if (type=='edit'||type=='create'){
				var sub=nlapiGetFieldValue('subsidiary');
				
				if (sub!=null&&sub!=''){
					for (var i=0;i<subsidiaries.length; i++){
						if (subsidiaries[i].getValue('internalid')==sub){
							div=subsidiaries[i].getValue('custrecord_division');
							break;
						}
					}
					//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
					//subfield.setDefaultValue(div);
				}
				var lines=nlapiGetLineItemCount('item');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					var nsclass='';
					var clas=nlapiGetLineItemValue('item','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('item','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('item','customer',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('item','custpage_cat',i,cat);
					}
						if (cat==2){
							var pclass='';
							for (var j=0;j<array.length; j++){
								if (array[j][0]==proj){
									pclass=array[j][1];
									nsclass=array[j][3];
									break;
								}
							}
							nlapiSetLineItemValue('item','custcol_cseg_asset_class',i,pclass);
							nlapiSetLineItemValue('item','class',i,nsclass);
						}
						else if (div==7){
							nlapiSetLineItemValue('item','custcol_cseg_asset_class',i,ac);
						}
						else {
							nlapiSetLineItemValue('item','custcol_cseg_asset_class',i,'');
						}
				}
				var lines=nlapiGetLineItemCount('expense');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					var nsclass='';
					var clas=nlapiGetLineItemValue('expense','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('expense','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('expense','customer',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('expense','custpage_cat',i,cat);
					}
						if (cat==2){
							var pclass='';
							for (var j=0;j<array.length; j++){
								if (array[j][0]==proj){
									pclass=array[j][1];
									nsclass=array[j][3];
									break;
								}
							}
							nlapiSetLineItemValue('expense','custcol_cseg_asset_class',i,pclass);
							nlapiSetLineItemValue('expense','class',i,nsclass);
							//nlapiSetLineItemValue('expense','custcol_cseg_asset_class',i,nlapiLookupField('job',proj,'custentity_cseg_asset_class'));
						}
						else if (div==7){
							nlapiSetLineItemValue('expense','custcol_cseg_asset_class',i,ac);
						}
						else {
							nlapiSetLineItemValue('expense','custcol_cseg_asset_class',i,'');
						}
				}
			}
		}
		if (trantype=='journalentry'){
			//var subfield=form.addField('custpage_div','text','a');//.setDisplayType('hidden')
			//var clasfield=form.getSubList('line').addField('custpage_class','text','b');//.setDisplayType('hidden')
			//var catfield=form.getSubList('line').addField('custpage_cat','text','c');var cat;
			var ac;
			var cat;
			var nsclass;
			if (type=='edit'||type=='copy'||type=='create'){
				var sub=nlapiGetFieldValue('subsidiary');
				
				if (sub!=null&&sub!=''){
					//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
					for (var i=0;i<subsidiaries.length; i++){
						if (subsidiaries[i].getValue('internalid')==sub){
							div=subsidiaries[i].getValue('custrecord_division');
							break;
						}
					}
					//subfield.setDefaultValue(div);
				}
				var lines=nlapiGetLineItemCount('line');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					nsclass='';
					var clas=nlapiGetLineItemValue('line','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
						//	nlapiLogExecution('ERROR','clasvals '+j,clas+' '+classes[j].getValue('internalid')+' '+classes[j].getValue('custrecord_n101_cseg_asset_class'));
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('line','entity',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						
						for (var j=0;j<array.length; j++){
						//	nlapiLogExecution('ERROR',j,array[j][0]+' '+proj);
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						
						nlapiSetLineItemValue('line','custpage_cat',i,cat);
					}
					nlapiLogExecution('ERROR','vals1',cat+' . '+ac+' .  '+clas+' . '+proj+' '+div);
						if (cat==2){
							var pclass='';
							for (var j=0;j<array.length; j++){
								if (array[j][0]==proj){
									pclass=array[j][1];
									nsclass=array[j][3];
									break;
								}
							}
							//nlapiLogExecution('ERROR','vals2',cat+' '+ac+' '+pclass);
							nlapiSetLineItemValue('line','class',i,nsclass);
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,pclass);
						}
						else if (div==7){
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,ac);
						}
						else {
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,'');
						}
				}
			}
		}
		if (trantype=='intercompanyjournalentry'){
			//var subfield=form.addField('custpage_div','text','a');//.setDisplayType('hidden')
			//var clasfield=form.getSubList('line').addField('custpage_class','text','b');//.setDisplayType('hidden')
			//var catfield=form.getSubList('line').addField('custpage_cat','text','c');
			//var subfield=form.getSubList('line').addField('custpage_div','text','d');
			var cat;
			var ac;
			var div;
			var nsclass;
			if (type=='edit'||type=='copy'||type=='create'){
				
				var lines=nlapiGetLineItemCount('line');
				for (var i=1; i<=lines; i++){
					cat='';
					ac='';
					div='';
					nsclass='';
					var clas=nlapiGetLineItemValue('line','class',i)
					if (clas!=null&&clas!=''){
						//ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
						for (var j=0;j<classes.length; j++){
							if (classes[j].getValue('internalid')==clas){
								ac=classes[j].getValue('custrecord_n101_cseg_asset_class');
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_class',i,ac);
					}
					var proj=nlapiGetLineItemValue('line','entity',i)
					if (proj!=null&&proj!=''){
						//cat=nlapiLookupField('job',proj,'category');
						for (var j=0;j<array.length; j++){
							if (array[j][0]==proj){
								cat=array[j][2];
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_cat',i,cat);
					}
					var sub=nlapiGetLineItemValue('line','linesubsidiary',i);
					if (sub!=null&&sub!=''){
						//div=nlapiLookupField('subsidiary',sub,'custrecord_division');
						for (var j=0;j<subsidiaries.length; j++){
							if (subsidiaries[j].getValue('internalid')==sub){
								div=subsidiaries[j].getValue('custrecord_division');
								break;
							}
						}
						nlapiSetLineItemValue('line','custpage_div',i,div);
					}
						if (cat==2){
							var pclass='';
							for (var j=0;j<array.length; j++){
								if (array[j][0]==proj){
									pclass=array[j][1];
									nsclass==array[j][3];
									break;
								}
							}
							nlapiSetLineItemValue('line','class',i,nsclass);
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,pclass);
						}
						else if (div==7){
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,ac);
						}
						else {
							nlapiSetLineItemValue('line','custcol_cseg_asset_class',i,'');
						}
				}
			}
		}
	}
}
function subsidiary_div_search(request,response){
	var sub=request.getParameter('sub');
	var div;
	if (sub!=null&&sub!=''){
		div=nlapiLookupField('subsidiary',sub,'custrecord_division');
		divtext=nlapiLookupField('subsidiary',sub,'custrecord_division',true);
	}
	else {
		div='';
		divtext='';
	}
	var object=new Object();
	object['division']=div;
	object['divisiontext']=divtext;
	response.write(JSON.stringify(object));
}
function class_ac_search(request,response){
	var clas=request.getParameter('class');
	var ac;
	if (clas!=null&&clas!=''){
		ac=nlapiLookupField('classification',clas,'custrecord_n101_cseg_asset_class');
	}
	else {
		ac='';
	}
	var object=new Object();
	object['ac']=ac;
	response.write(JSON.stringify(object));
}
function proj_as_search(request,response){
	var ent=request.getParameter('ent');
	var as;
  var astext;
	if (ent!=null&&ent!=''){
		as=nlapiLookupField('entity',ent,'custentity_cseg_bch_trip_segmt');
      astext=nlapiLookupField('entity',ent,'custentity_cseg_bch_trip_segmt',true);
	}
	else {
		as='';
       astext='';
	}
	var object=new Object();
	object['as']=as;
    object['astext']=astext;
	response.write(JSON.stringify(object));
}