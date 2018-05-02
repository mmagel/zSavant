/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 */

/**
 * @author tcaguioa
 *
 *
 *
 *
 */
/**
 * Hi all, As you probably know, UI code refactoring is currently going on in
 * order to enable mobile view of records in our upcoming iPhone app. As a part
 * of this refactoring we had to make a few changes to the internal UI api used
 * by other developer teams. In particular, the following javascript variables
 * and functions are no longer supported: - window.ischanged - window.isvalid -
 * window.isinited and window.setIsInited() The variables were encapsulated in a
 * new NS.form javascript object that is defined in NLUtil.jsp. To access them
 * please use the following methods: - NS.form.setChanged(boolean) and
 * NS.form.isChanged() - NS.form.setValid(boolean) and NS.form.isValid() -
 * NS.form.setInited(boolean) and NS.form.isInited() In case you need to change
 * the state of parent window, it is possible prepend the calls with �parent.�
 * or �opener.� prefixes (e.g., parent.NS.form.setInited(true)). The main motive
 * for this change is to be able to perform actions in response to the change of
 * these attributes in the mobile app. IMPORTANT: All occurrences of the
 * deprecated variables in ML and NetLedger_Release_George were replaced. Please
 * check you feature branches and update them appropriately. Please let me or
 * the UI team know if you have any questions or comments regarding this change.
 * Thanks, Ondrej
 */
if (typeof NS == 'undefined') {
    NS = {};
    NS.form = {};
    NS.form.setChanged = function(bool) {
        window.ischanged = bool;
    };

    NS.form.isChanged = function(bool) {
        return window.ischanged;
    };
}

/**
 * @author user
 */
// add indexOf() for Array object since not all browsers support it
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

// browser flags
var dadGlobal = dadGlobal || {};
dadGlobal.browser = dadGlobal.browser || {};
dadGlobal.browser.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+
dadGlobal.browser.isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
dadGlobal.browser.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
dadGlobal.browser.isIE = /*@cc_on!@*/false || !!document.documentMode; // Internet Explorer 6-11
dadGlobal.browser.isEdge = !dadGlobal.browser.isIE && !!window.StyleMedia; // Edge 20+
dadGlobal.browser.isChrome = !!window.chrome && !!window.chrome.webstore; // Chrome 1+
dadGlobal.browser.isBlink = (dadGlobal.browser.isChrome || dadGlobal.browser.isOpera) && !!window.CSS; // Blink engine detection

function dadTemplateApply(tmpId, data) {
    var tmpPost = document.getElementById(tmpId).innerHTML;
    var myTplPost = new Ext.XTemplate('<tpl for=".">' + tmpPost + '</tpl>');
    return myTplPost.apply(document.getElementById(targetId), data, false);
}

function dadTemplateAppend(tmpId, targetId, data) {
    var tmpPost = document.getElementById(tmpId).innerHTML;
    var myTplPost = new Ext.XTemplate('<tpl for=".">' + tmpPost + '</tpl>');
    myTplPost.append(document.getElementById(targetId), data, false);
}

function addTrimFunctions() {

    // add trim functions if browser has no support
    if (typeof String.trim == 'undefined') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    if (typeof String.ltrim == 'undefined') {
        String.prototype.ltrim = function() {
            return this.replace(/^\s+/, "");
        };
    }

    if (typeof String.rtrim == 'undefined') {
        String.prototype.rtrim = function() {
            return this.replace(/\s+$/, "");
        };
    }
}

addTrimFunctions();

/**
 * Hides the New option in a select field
 */
function dadHideNewInOptionList() {
    var logger = new dadobjLogger('dadHideNewInOptionList', true);
    // S3 Issue 240819 : [SuiteSocial] the option -New- should be hidden even in other languages drop down item
    var els = document.getElementsByTagName('div');
    for (var i = 0; i < els.length; i++) {
        var text = els[i].innerHTML;
        if (text.length < 2) {
            continue;
        }
        
        // for the 'New' options, it is in the format '- New -' where the New changes per language
        if (text.substr(0, 2) == '- ') {
            els[i].style.display = 'none';
        }
    }
    logger.log('DONE');
}

function dadHandleResponse(xmlRequest) {
    if (xmlRequest.status !== 200) {
        // error
        uiShowError('dadHandleResponse() ' + 'An unexpected error occurred. xmlRequest.status=' + xmlRequest.status);
        return null;
    }
    if (xmlRequest.responseText.indexOf('ERROR:') > -1) {
        uiShowError('dadHandleResponse() ' + JSON.parse(xmlRequest.responseText));
        return false;
    }

    // <!--
    /**
     * For some reasons, the returned string sometimes contains debug
     * information from core. This debugging information start with <!--. If
     * this string is found, process only the string before this.
     */
    var responseText = xmlRequest.responseText;
    var position = responseText.indexOf('<!--');
    if (position > -1) {
        responseText = responseText.substr(0, position);
    }

    try {
        var returnObject = JSON.parse(responseText);
    } catch (e) {
        uiShowError('dadHandleResponse() xmlRequest.responseText=' + xmlRequest.responseText);
        return false;
    }

    return returnObject;
}





/**
 * Hides a netsuite button
 * 
 * @param {Object}
 *        label The label of the button
 */
function dadHideNsButton(label) {
    var el = Ext.select('input[value="' + label + '"]').elements[0];
    if (dadHasNoValue(el)) {
        return;
    }
    if (dadHasNoValue(el.parentNode)) {
        return;
    }
    if (dadHasNoValue(el.parentNode.parentNode)) {
        return;
    }
    el.parentNode.parentNode.style.display = 'none';
}





/**
 * TODO: not working consistently This is used in hiding the row where the Add
 * button is located in sublists
 * 
 * @param {Object}
 *        formElementIds Array of form ids of sublists. The ids can be obtained
 *        by using firebug
 */
function dadHideAddButtonRow(formElementId)
{
    var logger = new dadobjLogger(arguments);

    var id = formElementId;

    var tb = Ext.get(id).dom.children[0];
    tb.children[0].children[0].style.display = 'none';
}





function getFirefoxNotice() {
    if (Ext.isGecko) {
        // browser = "Firefox";
        return '<br /><br />If a dialog box displays with the message below, check "Don\'t ask me again" and click "Continue" button in the displayed dialog box.<br /><br /><i>"A script on this page may be busy, or it may have stopped responding. You can stop the script now, open the script in the debugger, or let the script continue."</i><br />';
    }
    return '';
}






function outerHTML(node)
{
    return node.outerHTML || new XMLSerializer().serializeToString(node);
}






/*
 * removes all lines ina sublist
 */
function uiClearSublist(sublistId)
{
    var logger = new dadobjLogger('uiClearSublist');
    if (dadHasNoValue(sublistId))
    {
        return;
    }
    
    // Issue: 212985 [SuiteSocial] Confirm deletions in assistant sublists do not show the confirm delete in multiple deletions
    batchDeletion = true;

    var loop = 0;
    
    if (nlapiGetLineItemCount(sublistId) == -1)
    {
        return;
    }
    
    while (nlapiGetLineItemCount(sublistId) > 0)
    {
        nlapiSelectLineItem(sublistId, 1);
        nlapiRemoveLineItem(sublistId);

        loop++;
        if (loop > 1000)
        {
            return;
        }
    }
    
    // Issue: 212985 [SuiteSocial] Confirm deletions in assistant sublists
    batchDeletion = false;
}





/*
 * browser independent implementation of indexOf since IE does not support it
 */
function uiArrayIndexOf(arr, obj)
{
    if (Array.indexOf)
    {
        return arr.indexOf(obj);
    }

    // no support
    for (var i = 0; i < arr.length; i++)
    {
        if (arr[i] == obj)
        {
            return i;
        }
    }

    return -1;
}





function uiImplementMissingFunctions()
{
    // jSOn implementation
    var JSON = JSON || {};
    
    // implement JSON.stringify serialization
    JSON.stringify = JSON.stringify || Ext.encode;
    JSON.parse = JSON.parse || Ext.decode;
}





// jSOn implementation
var JSON = JSON || {};
// // implement JSON.stringify serialization
JSON.stringify = JSON.stringify || Ext.encode;
JSON.parse = JSON.parse || Ext.decode;

/**
 * Displays an information
 * 
 * @param {Object}
 *        info
 * @param {Object}
 *        title
 */
function uiShowInfo(info, title, fn) {

    if (dadHasNoValue(title)) {
        title = 'Information';
    }

    Ext.MessageBox.show({
        title : title,
        msg : info,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.INFO,
        fn : fn
    });
}

/**
 * Displays a warning
 * 
 * @param {Object}
 *        info
 * @param {Object}
 *        title
 */
function uiShowWarning(info, title, fn) {

    if (dadHasNoValue(title)) {
        title = 'Warning';
    }
    var config = {
        title : title,
        msg : info,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.WARNING
    };
    if (typeof fn == 'function') {
        config.fn = fn;
    }

    Ext.MessageBox.show(config);
}

/**
 * Displays an error such as run-time errors and validation errors
 * 
 * @deprecated Use uiShowError
 * @param {Object}
 *        error
 * @param {Object}
 *        title
 */
function showError(error, title) {

    if (dadHasNoValue(title)) {
        title = 'Error';
    }

    Ext.MessageBox.show({
        title : title,
        msg : error,
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.ERROR
    });

    Ext.select('.x-window-bl').setStyle({
        'background-color' : '#E4E4E4'
    });

    Ext.select('.x-window-br').setStyle({
        'padding-left' : '17px'
    });
}

function uiShowError(error, title) {
    showError(error, title);
}

function uiGetErrorDetails(ex) {
    var errorDetails;
    if (ex instanceof nlobjError) {
        errorDetails = 'System error. code: ' + ex.getCode() + '<br />Details: ' + ex.getDetails();
        errorDetails += '<br />StackTrace: ' + ex.getStackTrace();
    } else if (dadHasValue(ex.rhinoException)) {
        errorDetails = 'System error. rhinoException: ' + ex.rhinoException.toString();
    } else {
        errorDetails = 'System error. ex: ' + ex.toString();
    }

    return errorDetails;
}

var gdadWaitPeriods = '.';
function dadWait(message) {
    if (!document) {
        // should run only on browsers
        return;
    }
    gdadWaitPeriods += '.';
    if (gdadWaitPeriods == '....') {
        gdadWaitPeriods = '.';
    }
    if (dadHasNoValue(message)) {
        message = 'Processing';
    }
    return Ext.Msg.wait(message, 'Please wait' + gdadWaitPeriods);
}

function dadSaveOk() {
    Ext.Msg.hide();
    // Ext.Msg.alert('Save', 'Save succeeded');
    // NS.form.setChanged(false); needs to be placed here since it seems
    // window.ischanged is set to true after the recalc event
    Ext.MessageBox.show({
        title : 'Save'.tl(),
        msg : 'Save succeeded'.tl(),
        buttons : Ext.MessageBox.OK,
        icon : Ext.MessageBox.INFO,
        fn : function() {
            NS.form.setChanged(false);
        }
    });
}





/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemToEntity(sublistId, columnIds, lineNumber)
{
    var entity = {};
    for (var j in columnIds)
    {
        var columnId = columnIds[j];
        // logger.log('columnId=' + columnId);
        entity[columnId] = nlapiGetLineItemValue(sublistId, columnId, lineNumber);
    }
    
    return entity;
}





/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemsToEntities(sublistId, columnIds) {

    var logger = new dadobjLogger('uiConvertSublistItemsToEntities');
    logger.log('sublistId=' + sublistId + '; columnIds=' + columnIds);
    var lineCount = nlapiGetLineItemCount(sublistId);
    logger.log('sublistId=' + sublistId + '; lineCount=' + lineCount);
    var entities = [];
    for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
        var entity = {};
        entity = uiConvertSublistItemToEntity(sublistId, columnIds, lineNumber);
        entities.push(entity);
    }
    logger.log('entities.length=' + entities.length);
    return entities;
}

/*
 * An entity here is composed of multiple name-value pairs. Example entity:
 * {name: 'teddy', age: 33} @param {nlobjSubList} sublist. Not sure what the API
 * requires this @param {string} sublistId @param {string[]} columnIds An array
 * of column ids from the sublist @return {object[]} An array of entities
 */
function uiConvertSublistItemToEntityText(sublistId, columnIds, lineNumber) {
    var logger = new dadobjLogger('uiConvertSublistItemToEntity', true);
    var entity = {};
    for ( var j in columnIds) {
        var columnId = columnIds[j];
        logger.log('columnId=' + columnId);
        var fld = nlapiGetLineItemField(sublistId, columnId, lineNumber);
        if (fld.getType() == 'select') {
            entity[columnId] = nlapiGetLineItemText(sublistId, columnId, lineNumber);
        } else {
            entity[columnId] = nlapiGetLineItemValue(sublistId, columnId, lineNumber);
        }
    }
    return entity;
}

/*
 * This is the same as uiConvertSublistItemsToEntities except that for select
 * columns, the text is obtained instead of the value An entity here is composed
 * of multiple name-value pairs. Example entity: {name: 'teddy', age: 33} @param
 * {nlobjSubList} sublist. Not sure what the API requires this @param {string}
 * sublistId @param {string[]} columnIds An array of column ids from the sublist
 * @return {object[]} An array of entities
 */
function uiConvertSublistItemsToEntitiesText(sublistId, columnIds) {

    var logger = new dadobjLogger('uiConvertSublistItemsToEntities', true);
    logger.log('sublistId=' + sublistId + '; columnIds=' + columnIds);
    var lineCount = nlapiGetLineItemCount(sublistId);
    logger.log('sublistId=' + sublistId + '; lineCount=' + lineCount);
    var entities = [];
    for (var lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
        var entity = {};
        entity = uiConvertSublistItemToEntityText(sublistId, columnIds, lineNumber);
        entities.push(entity);
    }
    logger.log('entities.length=' + entities.length);
    return entities;
}

/**
 * A more generic way of triggering events since
 * Ext.get('socialChannelsHeader').dom.click(); does not work on Safari
 * 
 * @param {Object}
 *        el
 * @param {Object}
 *        eventName
 */
function dadTriggerEvent(el, eventName) {
    try {
        if (typeof el == 'string') {
            el = Ext.get(el).dom;
        }
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, true, true);
        el.dispatchEvent(evt);
    } catch (e) {
        dadHandleError(e);
    }
}

/**
 * Stops the propagation of an event
 * 
 * @param {Object}
 *        e Event
 */
function dadStopPropagation(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    return false;
}
