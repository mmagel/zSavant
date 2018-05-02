/*
 * Copyright 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * @fileOverview Common library used by client and server
 * @author tcaguioa
 */

/**
 * @namespace Global object for storing global variables
 */
var dadGlobal = dadGlobal || {};





/**
 * Returns the actual folder path given the pattern
 * 
 * @param {string}
 *        folderPathPattern. Example:
 *        \FinanceFolder\Subsidiary{subsidiaryId}\Record{recordId}\Role{roleId}
 * @returns {string}. Example:
 *          \FinanceFolder\Subsidiary123\Record{recordId-uniquevalue}\Role456
 */
function dadGetActualFolderPath(folderPathPattern)
{
    var userId = nlapiGetUser();
    var subsidiaryId = nlapiGetContext().getSubsidiary();
    var departmentId = nlapiGetContext().getDepartment();
    var recordId = nlapiGetRecordId();
    var roleId = nlapiGetContext().getRole();

    if (dadHasNoValue(recordId))
    {
        var dt = new Date();
        var month = dt.getMonth() + 1; // getMonth() returns 0 to 11
        var day = dt.getDate();
        var year = dt.getFullYear();
        var hh = dt.getHours();
        var ss = dt.getSeconds();
        var ms = dt.getMilliseconds();

        recordId = '{temp-' + year + '-' + month + '-' + day + '-' + hh + '-' + ss + '-' + ms + '-' + userId + '}';
    }

    var actualFolderPath = folderPathPattern.replace('{subsidiaryId}', subsidiaryId)
                                            .replace('{departmentId}', departmentId)
                                            .replace('{recordId}', recordId)
                                            .replace('{roleId}', roleId);

    return actualFolderPath;
}





/**
 * Return true if the current user has access to a folder. It does not check if
 * the folder doesnot exists.
 * 
 * @param folderId
 * @returns {Boolean}
 */
function dadHasFolderAccess(folderId)
{
    var results = nlapiSearchRecord('folder', null, ['internalid', 'anyof', folderId]);
    
    return (results !== null);
}





function dadGetFolderFullName(folderId)
{
    var sw = new dadobjStopWatch();

    var columns = [
        new nlobjSearchColumn('name'),
        new nlobjSearchColumn('parent')
    ];

    var filters = [
        ['internalid', 'anyof', folderId]
    ];
    
    var results = nlapiSearchRecord('folder', null, filters, columns);
    if (results === null)  // probably no access or wrong folder id
    {
        return '';
    }
    
    var result = results[0];
    var fullName = result.getValue('name');
    var parentId = result.getValue('parent');

    while (dadHasValue(parentId))
    {
        folderId = parentId;

        filters = [
            ['internalid', 'anyof', folderId]
        ];
        
        results = nlapiSearchRecord('folder', null, filters, columns);
        if (results === null)  // probably no access to a parent folder
        {
            return fullName;
        }

        result = results[0];
        fullName = result.getValue('name') + ' \> ' + fullName;
        parentId = result.getValue('parent');
    }
    
    return fullName;
}





/**
 * Creates a random unique number
 */
function dadRandom()
{
    return (new Date()).getTime() + Math.floor((Math.random() * 1000) + 1);
}





/**
 * Creates a span markup given the text and color
 * 
 * @param {Object}
 *        str The text/innerHTML of the span
 * @param {Object}
 *        color the font color
 */
function dadColor(str, color)
{
    return '<span style="color: ' + color + '">' + str + '</span>';
}





/**
 * Shortcut function for making a html markup bold
 * 
 * @param {Object}
 *        markup The markup that will be surrounded with bold tags
 * @return {string} Markup surrounded with bold tags
 */
function dadBold(markup, color)
{
    return '<b>' + markup + '</b>';
}





/**
 * Creates a span with green font
 * 
 * @param {Object}
 *        str
 */
function dadGreen(str)
{
    return dadColor(str, 'green');
}





/**
 * Returns information about the object.
 * 
 * @param {Object}
 *        obj
 */
function dadGetObjectDetail(obj)
{
    // Calling JSON.stringify on some nl objects like nlobjAssistant,
    // nlobjResponse,nlobjRequest and nlobjSelectOptions throws an error even
    // when inside a try catch statement
    var objS = obj.toString();

    if (['nlobjAssistant'].indexOf(objS) > -1)
    {
        return objS;
    }

    if (objS.indexOf('nlobjResponse') > -1)
    {
        return objS;
    }
    
    if (objS.indexOf('nlobjRequest') > -1)
    {
        return objS;
    }
    
    if (objS.indexOf('nlobjForm') > -1)
    {
        return objS;
    }

    if (obj instanceof Array)
    {
        if (obj[0] && obj[0].getId && obj[0].getText)
        {
            var detail = 'nlobjSelectOptions[' + obj.length + ']';
            if (obj.length <= 10)
            {
                // show items if they are not more than 10
                detail += '[';
                var count = obj.length;
                for (var i = 0; i < count; i++)
                {
                    var option = obj[0];
                    detail += '{id: ' + option.getId() + ', text:' + option.getText() + '}';
                }
                detail += ']';
            }
            return detail;
        }
    }

    // Calling JSON.stringify on nlobjSelectOption throws an error
    if (obj && obj.getId && obj.getText)
    {
        var detail = 'nlobjSelectOption';
        detail += '{id: ' + obj.getId() + ', text:' + obj.getText() + '}';
        return detail;
    }


    // for other objects
    try
    {
        detail = JSON.stringify(obj);
    }
    catch (e)
    {
        return null;
    }
    
    return detail;
}





/**
 * Obtains debugging information from the built in object arguments
 * 
 * @param {object}
 *        args Built-in arguments object from a function
 * @return {string} The details of a function's arguments
 */
function dadGetArgumentDetails(args)
{
    var details = '';
    
    try
    {
        // get the function name and parameters
        var fullFunc = args.callee.toString();
        var funcAndArgs = fullFunc.substr(0, fullFunc.indexOf('{')).replace('function ', '');
        
        // get array of argument name
        var paramsStr = funcAndArgs.replace(args.callee.name, '').replace(')', '').replace('(', '');
        var params = paramsStr.split(',');
        details = dadGetNewLine(1) + 'Function=' + funcAndArgs.replace('\n', ' ');
        
        if (args.length > 0)
        {
            details += dadGetNewLine() + 'ARGUMENTS:' + dadGetNewLine(1);
            for (var i = 0; i < args.length; i++)
            {
                var paramName = 'arg' + i;

                if (dadHasValue(params[i]))
                {
                    paramName = params[i].trim();
                }
                var arg = '';
                
                if (typeof args[i] == 'object')
                {
                    // is it an array
                    if (args[i] instanceof Array)
                    {
                        for (var x = 0; x < args[i].length; x++)
                        {
                            arg += dadGetObjectDetail(args[i]);
                        }
                    }
                    else
                    {
                        arg += dadGetObjectDetail(args[i]);
                    }
                }
                else
                {
                    arg = args[i];
                }
                
                details += paramName + '=' + arg + '<br />';
            }
        }
    }
    catch (e)
    {
        nlapiLogExecution('debug', 'dadGetArgumentDetails', 'error in dadGetArgumentDetails e=' + e);
    }
    
    return details;
}






/**
 * Error handling routine
 * 
 * @param {Object}
 *        e Exception
 * @param {Object}
 *        customMessage Any message you want included
 */
function dadHandleError(e, customMessage)
{
    try
    {
        var fullMessage = 'EXECUTION CONTEXT' + dadGetNewLine() + dadGetContextDetails() + dadGetNewLine(1) + 'customMessage=' + customMessage + dadGetNewLine(2);
        var isInBrowser = (typeof document != 'undefined');
        if (dadHasNoValue(customMessage))
        {
            customMessage = '';
        }

        fullMessage += dadGetErrorDetails(e);



        if (isInBrowser)  //client-side stack trace
        {
            var clientStackTrace = '';
            if (dadHasValue(Error))
            {
                var err = new Error();
                clientStackTrace = err.stack;
                fullMessage += 'CLIENT STACK TRACE=' + clientStackTrace + dadGetNewLine(2);
            }
            if (typeof console != 'undefined')
            {
                if (typeof console.error != 'undefined')
                {
                    console.error(dadGlobal.TITLE + ' Error: ' + fullMessage);
                    return fullMessage;
                }

                if (typeof console.log != 'undefined')
                {
                    console.log(dadGlobal.TITLE + ' Error: ' + fullMessage);
                    return fullMessage;
                }
            }

            nlapiLogExecution('error', dadGlobal.TITLE, 'Error in dadHandleError(); fullMessage=' + fullMessage);
            
            return fullMessage;
        }
        else  //server-side stack trace
        {
            var html = fullMessage.replace(new RegExp('\n', 'gi'), '<br />');
            nlapiLogExecution('error', dadGlobal.TITLE + ' Error', html);
        }
        
        return fullMessage;
    }
    catch (e)
    {
        nlapiLogExecution('error', 'File Drag and Drop Runtime error', 'Error in dadHandleError(); e=' + e);
    }
}





/**
 * @class This is used in measuring execution time in milli-seconds
 */
function dadobjStopWatch()
{

    dadGlobal = dadGlobal || {};
    if (dadHasNoValue(dadGlobal.startOfScriptMilliseconds))
    {
        dadGlobal.startOfScriptMilliseconds = (new Date()).getTime();
    }

    var startMilliSeconds = (new Date()).getTime();
    var lastCallToMeasure = (new Date()).getTime();

    /**
    * @public
    * @description Starts the timer
    */
    this.start = function()
    {
        startMilliSeconds = (new Date()).getTime();
    };

    /**
    * @public
    * @description Returns the current elapsed time (in ms) and resets the
    *              start time
    */
    this.stop = function()
    {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        startMilliSeconds = currentMilliSeconds;
        return ms;
    };

    /**
    * @public
    * @description Returns the current elapsed time (in ms) WITHOUT resedading
    *              the start time (from the last call to start or stop)
    */
    this.measure = function()
    {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        return ms;
    };

    /**
    * Returns the current elapsed time (in ms) from start of the script call
    */
    this.measureFromScript = function()
    {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - dadGlobal.startOfScriptMilliseconds;
        return ms;
    };

    /**
    * Returns the current elapsed time (in ms) from start of the function call
    */
    this.measureFromFunction = function()
    {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - startMilliSeconds;
        return ms;
    };

    /**
    * Returns the current elapsed time (in ms) starting from the last call to
    * measureSegment but WITHOUT resedading the start time (from the last call
    * to start or stop)
    */
    this.measureSegment = function()
    {
        var currentMilliSeconds = (new Date()).getTime();
        var ms = currentMilliSeconds - lastCallToMeasure;
        lastCallToMeasure = currentMilliSeconds;
        return ms;
    };
}





function dadGetErrorDetails(ex)
{
    var errorDetails = '';
    
    try
    {
        errorDetails = 'ERROR DETAILS' + dadGetNewLine();
        errorDetails += 'ex=' + ex.toString() + dadGetNewLine();

        if (ex.getDetails)
        {
            errorDetails += 'Details: ' + ex.getDetails() + dadGetNewLine();
        }
        
        if (ex.getCode)
        {
            errorDetails += 'Code: ' + ex.getCode() + dadGetNewLine();
        }
        
        if (ex.getId)
        {
            errorDetails += 'Id: ' + ex.getId() + dadGetNewLine();
        }
        
        if (ex.getStackTrace)
        {
            errorDetails += 'StackTrace: ' + ex.getStackTrace() + dadGetNewLine();
        }
        
        if (ex.getUserEvent)
        {
            errorDetails += 'User event: ' + ex.getUserEvent() + dadGetNewLine();
        }
        
        if (ex.getInternalId)
        {
            errorDetails += 'Internal Id: ' + ex.getInternalId() + dadGetNewLine();
        }
        
        if (ex.rhinoException)
        {
            errorDetails += 'RhinoException: ' + ex.rhinoException.toString() + dadGetNewLine();
        }
        
        if (ex.stack)
        {
            errorDetails += 'Stack=' + ex.stack;
        }


        if (ex instanceof nlobjError)
        {
            errorDetails += 'Type: nlobjError' + dadGetNewLine();
        }
        else if (dadHasValue(ex.rhinoException))
        {
            errorDetails += 'Type: rhinoException' + dadGetNewLine();
        }
        else
        {
            errorDetails += 'Type: Generic Error' + dadGetNewLine();
        }
    }
    catch (e)
    {
        errorDetails += ' Error in dadGetErrorDetails=' + e;
    }
    
    return errorDetails;
}





/**
 * Returns details about the execution context
 * 
 * @return {string}
 */
function dadGetContextDetails()
{
    var detail = '';
    try
    {
        var userId = nlapiGetUser();
        var context = nlapiGetContext();
        detail += 'Company: ' + context.getCompany() + dadGetNewLine();
        
        
        try
        {
            if (context.getFeature('departments'))
            {
                detail += 'Department: ' + nlapiGetDepartment() + dadGetNewLine();
            }
        }
        catch (e)
        {
            detail += 'Department: error ' + e + dadGetNewLine();
        }

        
        try
        {
            if (context.getFeature('locations'))
            {
                detail += 'Location: ' + nlapiGetLocation() + dadGetNewLine();
            }
        }
        catch (e)
        {
            detail += 'Location: error ' + e + dadGetNewLine();
        }

        
        try
        {
            if (context.getFeature('subsidiaries'))
            {
                detail += 'Subsidiary: ' + nlapiGetSubsidiary() + dadGetNewLine();
            }
        }
        catch (e)
        {
            detail += 'Subsidiary: error ' + e + dadGetNewLine();
        }

        
        detail += 'User Id: ' + userId + dadGetNewLine();
        detail += 'User Name: ' + context.getName() + dadGetNewLine();
        detail += 'Role: ' + nlapiGetRole() + dadGetNewLine();
        detail += 'Role Center: ' + context.getRoleCenter() + dadGetNewLine();
        
        
        try
        {
            detail += 'DeploymentId: ' + context.getDeploymentId() + dadGetNewLine();
        }
        catch (e)
        {
            detail += 'DeploymentId: error ' + e + dadGetNewLine();
        }

        
        detail += 'User Email: ' + context.getEmail() + dadGetNewLine();
        detail += 'Environment: ' + context.getEnvironment() + dadGetNewLine();
        detail += 'ExecutionContext: ' + context.getExecutionContext() + dadGetNewLine();
        detail += 'Name: ' + context.getName() + dadGetNewLine();
        detail += 'ScriptId: ' + context.getScriptId() + dadGetNewLine();
        detail += 'Version: ' + context.getVersion() + dadGetNewLine();

    }
    catch (e)
    {
        detail = 'Error in dadGetContextDetails(); ' + e;
    }
    return detail;
}





/**
 * Returns newlines depending on the execution context
 * 
 * @param {integer}
 *        repeat Number of newlines to return
 */
function dadGetNewLine(repeat)
{
    if (typeof repeat == 'undefined')
    {
        repeat = 1;
    }
    
    var newline = '';
    for (var i = 1; i <= repeat; i++)
    {
        newline += '\n';
    }
    
    return newline;
}





/**
 * Browser and server independent implementation of indexOf since IE does not
 * support it
 * 
 * @param {object[]}
 *        arr
 * @param {object}
 *        obj
 */
function dadArrayIndexOf(arr, obj)
{
    if (arr.indexOf)
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





/**
 * Prepend non breaking space on the string if the string length is less than
 * the desired length
 * 
 * @param {string}
 *        s
 * @param {integer}
 *        length - the desired length of the string
 * @returns {String}
 */
function dadPad(s, length)
{
    var diff = length - s.length;
    if (diff > 0)
    {
        for (var i = 1; i <= diff; i++)
        {
            s = '&nbsp;' + s;
        }
    }
    else
    {
        s = s.substr(0, length);
    }
    
    return s;
}





/**
 * Append non breaking space on the string if the string length is less than the
 * desired length
 * 
 * @param {string}
 *        s
 * @param {integer}
 *        length - the desired length of the string
 * @returns {String}
 */
function dadPadRight(s, length)
{
    var diff = length - s.length;
    if (diff > 0)
    {
        for (var i = 1; i <= diff; i++)
        {
            s = s + '&nbsp;';
        }
    }
    else
    {
        s = s.substr(0, length);
    }
    
    return s;
}





/**
 * Adds commas to a number
 * 
 * @param {string}
 *        nStr
 * @returns {string}
 */
function dadAddCommas(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1))
    {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}





/**
 * Used in logging
 * 
 * @param {string}
 *        msg
 * @param {string}
 *        otherDetails Not being used?
 * @param {string}
 *        source Not being used?
 */
function dadLog(msg, otherDetails, source, type)
{
    var completeMsg = msg; // + ': ' + eval(msg);
    if (dadHasNoValue(type))
    {
        type = 'debug';
    }

    if (!dadHasNoValue(otherDetails))
    {
        completeMsg = completeMsg + ' otherDetails=' + otherDetails + '; ';
    }
    
    if (!dadHasNoValue(source))
    {
        completeMsg = source + '() ' + completeMsg + '; ';
    }
    
    if (typeof document !== 'undefined')
    {
        if (typeof console !== 'undefined')
        {
            console.log(completeMsg);
        }
    }
    else
    {
        completeMsg = '(' + nlapiGetContext().getRemainingUsage() + ') ' + completeMsg;
        nlapiLogExecution(type, 'dadobjLogger', completeMsg);
    }
    
    return completeMsg;
}





/**
 * Logs an error
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function dadLogError(msg, otherDetails, source)
{
    if (typeof document !== 'undefined' && typeof console !== 'undefined')
    {
        msg = 'ERROR: ' + msg;
        dadLog();
    }
    else
    {
        // msg = '<span style="background-color: pink">' + msg + '</span>';
        dadLog(msg, otherDetails, source, 'error');
    }
    
    return msg;
}





/**
 * Logs a successful activity
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function dadLogOk(msg, otherDetails, source)
{
    if (typeof document !== 'undefined' && typeof console !== 'undefined')
    {
        msg = 'SUCCESS: ' + msg;
        dadLog(msg);
    }
    else
    {
        dadLog(msg, otherDetails, source, 'debug');
    }
    
    return msg;
}





/**
 * Logs a warning
 * 
 * @param {Object}
 *        msg
 * @param {Object}
 *        otherDetails
 * @param {Object}
 *        source
 */
function dadLogWarn(msg, otherDetails, source)
{
    if (typeof document !== 'undefined' && typeof console !== 'undefined')
    {
        msg = 'WARNING: ' + msg;
        dadLog(msg);
    }
    else
    {
        dadLog(msg, otherDetails, source, 'debug');
    }
    
    return msg;
}





/**
 * @class Object used in logging. Used in both client and server
 * @example // sample 1 var logger = new dadobjlogger(arguments); // sample 2
 *          var logger = new dadobjlogger(arguments, false, 'getData()');
 * @param {Object}
 *        args 'arguments' is a built-in object in functions. Pass 'arguments'
 *        always.
 * @param {Boolean}
 *        (optional) isDisabled Set to true to temporarily disable logging.
 *        Default to false.
 * @param {String}
 *        commonLog (optional) All succeeding calls to log will prepend the
 *        commonLog .
 * @return {void}
 */
function dadobjLogger(args, isDisabled, commonLog)
{
    commonLog = commonLog || '';
    var sw = new dadobjStopWatch();
    var _disabled = false;

    if (dadHasValue(isDisabled))
    {
        _disabled = isDisabled;
    }

    var _commonLog;
    var _argumentsDetails = '';
    if (typeof args == 'object')
    {
        _commonLog = (args.callee.name || commonLog) + '()';
        _argumentsDetails = dadGetArgumentDetails(args);
    }
    else
    {
        _commonLog = commonLog + ' ' + args + '()';
    }



    this.auditReset = function(msg)
    {
        return sw.measureSegment();
    };



    this.audit = function(msg)
    {
        if (_disabled === false)
        {
            var MAX_ARG_LENGTH = 100;
            if (dadHasValue(msg))
            {
                msg = msg + '; ' + _argumentsDetails;
            } else
            {
                msg = _argumentsDetails;
            }

            if (msg.length > MAX_ARG_LENGTH)
            {
                msg = msg.substr(0, MAX_ARG_LENGTH);
            }

            var finalMsg = _commonLog + ' ';
            finalMsg += dadPad(dadAddCommas(sw.measureFromScript()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += dadPad(dadAddCommas(sw.measureFromFunction()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += dadPad(dadAddCommas(sw.measureSegment()), 6) + ' ms; &nbsp;&nbsp;';
            finalMsg += msg;

            finalMsg = '<span style="font-family: courier new">' + finalMsg + '</span>';
            dadLog(finalMsg, null, null, 'audit');
        }
    };



    this.auditToConsole = function(msg)
    {
        if (_disabled === false)
        {
            var MAX_ARG_LENGTH = 100;
            if (dadHasValue(msg))
            {
                msg = msg + '; ' + _argumentsDetails;
            }
            else
            {
                msg = _argumentsDetails;
            }

            if (msg.length > MAX_ARG_LENGTH)
            {
                msg = msg.substr(0, MAX_ARG_LENGTH);
            }

            var finalMsg = _commonLog + ' ';
            finalMsg += sw.measureFromScript() + ' ms; ';
            finalMsg += sw.measureFromFunction() + ' ms;';
            finalMsg += sw.measureSegment() + ' ms;';
            finalMsg += msg;

            dadLog(finalMsg, null, null, 'audit');
        }
    };



    this.log = function(msg)
    {
        if (_disabled === false)
        {
            dadLog(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    
    
    
    /**
    * @public
    * @description Logs everytime even if _disabled is true
    * @param {Object}
    *        msg
    */
    this.logAlways = function(msg)
    {
        dadLog(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
    };



    /**
    * @public
    * @description Logs an error. In NetSuite, error log entries have red
    *              background.
    * @param {Object}
    *        msg
    */
    this.error = function(msg)
    {
        if (_disabled === false)
        {
            dadLogError(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    
    
    
    /**
    * @public
    * @description Logs a warning. In NetSuite, warning log entries have yellow
    *              background.
    * @param {Object}
    *        msg
    */
    this.warn = function(msg)
    {
        if (_disabled === false)
        {
            dadLogWarn(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };
    
    
    
    /**
    * @public
    * @description Logs a successful activity. In NetSuite, 'successful' log
    *              entries have green background.
    * @param {Object}
    *        msg
    */
    this.ok = function(msg)
    {
        if (_disabled === false)
        {
            dadLogOk(_commonLog + ' ' + sw.measure() + 'ms; ' + msg);
        }
    };



    this.end = function(msg)
    {
        var shortArgumentsDetails = '';
        if (dadHasValue(msg))
        {
            msg = 'END ' + shortArgumentsDetails + '; ' + msg;
        }
        else
        {
            msg = 'END ' + shortArgumentsDetails;
        }

        if (_disabled === false)
        {
            this.log(msg);
        }
    };



    /**
    * @public
    * @description Enable or disables logging
    * @param {Boolean}
    *        isDisabled
    */
    this.setDisabled = function(isDisabled)
    {
        _disabled = isDisabled;
    };



    this.log(_argumentsDetails);
}





/**
 * Returns true is the param is undefined or null or empty
 * 
 * @param {any}
 *        param
 * @return {boolean}
 */
function dadHasNoValue(param)
{
    if (typeof param == 'undefined')
    {
        return true;
    }
    
    if (param === null)
    {
        return true;
    }
    
    if (param === '')
    {
        return true;
    }

    return false;
}





/**
 * Returns true is the param is undefined or null or empty
 * 
 * @param {any}
 *        param
 * @return {boolean}
 */
function dadHasValue(param)
{
    return !dadHasNoValue(param);
}





/**
 * This handles unexpected errors and sends it to the user specified in script
 * parameter.
 * 
 * @param ex
 *        Exception to be handled.
 */
function dadHandleUnexpectedError(ex, customMsg)
{
    try
    {
        var errorMsg = 'dadHandleUnexpectedError(). Unexpected error: ' + dadGetErrorDetails(ex) + '; customMsg=' + customMsg;
        nlapiLogExecution('error', 'File Drag and Drop Error', errorMsg);

        var empId = nlapiGetContext().getPreference('custscript_dad_error_message_recipient');
        if (dadHasValue(empId))
        {
            nlapiSendEmail(nlapiGetUser(), empId, 'File Drag and Drop Error', 'Unexpected error: ' + dadGetErrorDetails(ex));
        }
        
        return errorMsg;
    }
    catch (e)
    {
        var errorMsg = 'dadHandleUnexpectedError(). Unexpected error: ' + dadGetErrorDetails(e);
        nlapiLogExecution('error', 'File Drag and Drop Error: dadHandleUnexpectedError()', errorMsg);
        return errorMsg;
    }
}





/**
 * Returns the HTML markup of a netsuite looking table
 * 
 * @param {Array}
 *        entities An array of JSON objects
 * @param {Object}
 *        noDataMessage The message displayed when there is no data
 * @return {String}
 */
 
//This does not belong in a server library.  UI-related detail should be in client scripts.  Otherwise we are forced to test client code at the server side.
function dadCreateTableHtml(entities, noDataMessage)
{
    if (entities.length === 0)
    {
        return noDataMessage || 'No data'.tl() + '.';
    }

    var html = "<div class='subtabblock' style='padding: 4px; margin-left: 0px; margin-right: 0px; overflow: visible'>";
    html += '<table width=100% cellspacing=0 class="smalltextnolink" style="font: normal 14px Open Sans, Helvetica, sans-serif; border: 1px solid #B4B4B4;">';

    // create headers
    var firstEntity = entities[0];
    html += '<tr style="font-weight: bold" class="listheadertdwht listheadertextb">';
    for (var p in firstEntity)
    {
        html += '<td style="font: normal 14px Open Sans, Helvetica, sans-serif;">';
        html += p;
        html += '</td>';
    }
    html += '</tr>';

    // rows
    var isOdd = true;
    for (var i = 0; i < entities.length; i++)
    {
        html += '<tr>';

        var entity = entities[i];
        for (p in firstEntity)
        {
            html += '<td class="listtexthlwht" style="vertical-align: top; font: normal 14px Open Sans, Helvetica, sans-serif;">';
            html += dadHasValue(entity[p]) ? entity[p] : ('&nbsp;' + 'none');
            html += '</td>';
        }
        html += '</tr>';

        isOdd = isOdd === false;
    }

    // close table
    html += '</table>';
    html += '</div>';

    return html;
}





function createTableHtml(entities, noDataMessage)
{
    return dadCreateTableHtml(entities, noDataMessage);
}





/**
 * Throws error if user has no access to record
 * 
 * @param {String}
 *        record type script id
 * @param {String}
 *        record id
 * @return {String}
 */
function dadCheckUserAccess(recordTypeScriptId, recordId)
{
    var recentlyAccessedRecords = nlapiGetContext().getSessionObject('dadRecentlyAccessedRecords');
    if (dadHasNoValue(recentlyAccessedRecords))
    {
        recentlyAccessedRecords = [];
    }
    else
    {
        recentlyAccessedRecords = JSON.parse(recentlyAccessedRecords);
    }

    var key = recordTypeScriptId + recordId;
    if (recentlyAccessedRecords.indexOf(key) == -1)
    {
        throw 'You dont have access to this record. recordTypeScriptId=' + recordTypeScriptId + '; recordId=' + recordId + '; key=' + key + '; recentlyAccessedRecords=' + JSON.stringify(recentlyAccessedRecords);
    }
}





/**
 * Creates the passed folder if it does not exists yet. It also creates the
 * parent folders if they don't exists yet.
 * 
 * @param {string}
 *        folderPath. Example:
 *        \FinanceFolder\Subsidiary123\Record{recordId}\Role456
 * @returns {Object} A JSON object with keys: <br>
 *          passedFolderId: This is the id of the passed folder. This is set
 *          even if the folder already exists. <br>
 *          recordFolderId: This is the id of the folder where the recordId
 *          placeholder was found. No need to set this if the "record" folder
 *          (the folder of recordFolderId) already exists. In the example, this
 *          folder is \FinanceFolder\Subsidiary123\Record{recordId}
 */
function dadCreateFolderPath(folderPath)
{
    // Your implementation will need to check existence of parent folders starting from the root folder (FinanceFolder) and so on.
    var jsonFolderPath = {
        recordFolderId: null
    };
    
    var folders = folderPath.split('\\');
    var tempParentFolder = null;

    for (var i = 0; i < folders.length; i++)
    {
        if (dadHasNoValue(folders[i]))
        {
            continue;
        }

        var folderName = folders[i];
        var folderId = dadValidateFolderPath(folderName, tempParentFolder);
        
        if (dadHasNoValue(folderId))
        {
            var r = nlapiCreateRecord('folder');
            r.setFieldValue('name', folderName);
            r.setFieldValue('parent', tempParentFolder);
            
            try
            {
                tempParentFolder = nlapiSubmitRecord(r);
            }
            catch (e)
            {
                Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
                uiShowWarning('You have no access to the destination folder. You should change the destination folder before you can drag and drop files.', dadGlobal.TITLE, function()
                {
                    dadChangeTargetFolder();
                });
                
                return null;
            }
        }
        else
        {
            tempParentFolder = folderId;
        }

        jsonFolderPath.passedFolderId = tempParentFolder;
        dadGlobal.folderId = tempParentFolder;

        if (folderName.indexOf('{temp') > -1)
        {
            jsonFolderPath.recordFolderId = tempParentFolder;
            nlapiSetFieldValue('custpage_dad_record_folder_id', jsonFolderPath.recordFolderId);
        }
    }

    return jsonFolderPath;
}





/**
 * Validates if folder exists
 * 
 * @param {string}
 *        folderName : This is the name of the folder to be searched
 *        parentFolder: Parent folder id of the searched folder
 * @returns {string} folderId : This is the id of the searched folder
 */
function dadValidateFolderPath(folderName, parentFolder)
{
    var filters = [
        ['name', 'is', folderName],
        'and',
        ['parent', 'anyof', dadHasValue(parentFolder) ? parentFolder : '@NONE@']
    ];

    var results = nlapiSearchRecord('folder', null, filters);

    return dadHasNoValue(results) ? null : results[0].getId();
}