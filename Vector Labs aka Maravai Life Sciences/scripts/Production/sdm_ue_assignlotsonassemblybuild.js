// assign lots for coomponents on Creation of Assembly Build transaction
//
// ex: if there are 3 lots with qty 10 each and the need is for 11 components
// then there would be 2 line items
// item1 lot A qty 10
// item1 lot B qty 1
//
// Keeping in mind when a WO is created those components are committed to the WO
// WO = 2947068
//var WOid = 2947068;
//var recid = 2947121;
//var rectype = 'assemblybuild';
//lots:
// 20170905B(1)
// ZD0113(184)

nlapiLogExecution('DEBUG','status','func not executed yet');

function assemblybuild_bl_assignlots(type){
    var currentContext = nlapiGetContext();
    nlapiLogExecution('DEBUG','status','assemb bld component lot assign func initiated');
    if (type=='create' && currentContext.getExecutionContext() == 'userinterface'){


        //nlapiCreateRecord(rectype, {recordmode: 'dynamic'});    create the AssemBuild
        //var rec = nlapiTransformRecord('workorder', 2947068, 'assemblybuild'); //transform WO to AB
        var rec = nlapiGetNewRecord();
        var stopper = 1;
        //var rec=nlapiLoadRecord(rectype,recid,{recordmode: 'dynamic'});
        var lines=rec.getLineItemCount('component');
        var totalav = 0;
        var finallot = '';
        var conditionmet = false;
        // 0. go thru line items on the assembly build transaction
        for (var i=1;i<=lines;i++){
            
            rec.selectLineItem('component',i);
            var item=rec.getCurrentLineItemValue('component','item');
            //var itemname=rec.getCurrentLineItemText('component','item');
            var quant=rec.getCurrentLineItemValue('component','quantity');
            var quantleft = quant;
            var compnum=num=nlapiGetCurrentLineItemValue('component','componentnumbers');
            var nums=nlapiSearchRecord('inventorynumber','customsearch238',new nlobjSearchFilter('item',null,'anyof',item));

            // 1. is the available qty in all lots combined => quant ?
            for (var j=0; nums!=null && j<nums.length; j++){
                totalav = totalav + parseInt(nums[j].getValue('quantityavailable'));
            }
            nlapiLogExecution('DEBUG','LotTotal',i+'-'+ item +'-'+totalav); 
            //var stopper = 'num 1 stopper';
            // 2. if yes then proceed, if no then error
            if (parseInt(totalav) >= parseInt(quant)){  //as long as there is enough available in all of the lots
                
                // 3. look at all the lots - one at a time
                for (var j=0; nums != null && j < nums.length && conditionmet==false; j++){
                    var id = nums[j].getValue('internalid');
                    var av = nums[j].getValue('quantityavailable');
                    var num = nums[j].getValue('inventorynumber');
                    nlapiLogExecution('DEBUG','ItemLot',i+'-'+ item +'-'+num); 
                    // 4. if av > 0 then add that as a line item (w quant=lot if quant=<lot)
                    if (av>0 && quantleft>0){

                        quantleft = parseInt(quantleft);
                        av = parseInt(av);

                        // 5. see if it would consume the whole lot or not (keep in mind qty already used)
                        // if quant required <= available in lot then use up what u can in this lot and get out
                        if (quantleft <= av){              
                            finallot = finallot + num + '(' + quantleft + ')\n';
                            quantleft = quantleft - av; //depricate quantity by what we just consumed 
                            var stopper = 2;
                            conditionmet = true;
                            rec.setCurrentLineItemValue('component','componentnumbers',finallot);
                            break;
                        }
                        nlapiLogExecution('DEBUG','values','quantleft='+quantleft+' & av='+av);
                        //console.log('quantleft='+quantleft+' & av='+av);
                        // 6. if quant required > available then consume this lot and move to next lot
                        if (quantleft > av){
                            finallot = finallot + num + '(' + av + ')\n';
                            quantleft = quantleft - av; //depricate quantity by what we just consumed
                            var stopper = 3;
                            rec.setCurrentLineItemValue('component','componentnumbers',finallot);
                        } else 
                            {
                                finallot = finallot + num + '(' + quantleft + ')\n';
                                quantleft = quantleft - av; //depricate quantity by what we just consumed
                                rec.setCurrentLineItemValue('component','componentnumbers',finallot);
                            }
                // 7. write the component item's lot # and values
                //rec.setCurrentLineItemValue('component','componentnumbers',finallot);
                    }

                
                var stopper = 4;                   
                }

            }
            
            nlapiLogExecution('DEBUG','currentline',i+'-'+ item +'-'+finallot);            
            rec.commitLineItem('component');  
            finallot = '';
            conditionmet = false;
        }
    //nlapiSubmitRecord(rec);
  
//var stopper = 12345;
    }

}

            
  