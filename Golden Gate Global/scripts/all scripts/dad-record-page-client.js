/**
 * © 2014 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 */

var dadGlobal = dadGlobal || {};
dadGlobal.folderFullName = '';
dadGlobal.browserSupported = true;
dadGlobal.CREATE_PERMISSION = 2;
dadGlobal.filesBeingUploaded = 0;
dadGlobal.filesBeingUploadedBatch = 0;
dadGlobal.batchSize = 0;
dadGlobal.xmlRequests = [];        //one xmlRequest instance is used for each file
dadGlobal.uploadId = 0;            //this is used as current index for dadGlobal.xmlRequests
dadGlobal.filesInWaiting = [];     //files dropped will be placed here if the number of used connections is already. Sample item format: {key: file} where
dadGlobal.filesAttachmentQueue = [];
dadGlobal.filesInWaitingKey = 0;   //This will be incremented every time a file is added in dadGlobal.filesInWaiting. This will be used as key of the hash
dadGlobal.currentUploadHash = {};  //holds the current uploads where each active upload is one property. The key is the upload id.
dadGlobal.dadIsDragEnter = false;  //flag if drag enter is triggered and drag exit is not yet triggered

var MIN_SUPPORTED_SAFARI_VERSION = 6.0;
var MIN_SUPPORTED_IE_VERSION = 11.0;





//Global execution
(function globalExecution()
{
    dadAddTrimFunctions();


    if (typeof Ext != 'undefined')
    {
        Ext.onReady(function()
        {
            try
            {
                if (dadShouldShowDropZone())
                {
                    dadPageInit();
                }
                dadHideFolderPickerOnEscape();
            }
            catch (ex)
            {
                // comment next line in production
                dadHandleUnexpectedError(ex);
            }
        });
    }


    setInterval(function()
    {
        // attach files to record if queue is not empty
        while (dadGlobal.filesAttachmentQueue.length > 0)
        {
            var fileAttachment = dadGlobal.filesAttachmentQueue.pop();
            Ext.select('#mediaitem_mediaitem_display').set({
                'value': fileAttachment.name
            });
            Ext.select('#hddn_mediaitem_mediaitem_fs').set({
                'value': fileAttachment.id
            });
            mediaitem_machine.doAddEdit();
        }

    }, 1000);
} ());










/**
 * Adds a event handler for beforeunload event. The handler prompts a warning
 * when leaving page while files are being uploaded.
 */
function dadAddBeforeUnloadEventHandler() {
    window.addEventListener('beforeunload', function(e) {
        try {
            // get number of pending uploads
            var currentUploadHash = dadGlobal.currentUploadHash;
            var pendingUploadsCount = Object.keys(currentUploadHash).length;
            if (pendingUploadsCount > 0) {
                // display prompt to whether to stay or navigate away from page
                // to user
                // When a non-empty string is assigned to the returnValue Event
                // property, a dialog box appears,
                // asking the users for confirmation to leave the page.
                // When no value is provided, the event is processed silently.

                // from:
                // https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
                // For some reasons, Webkit-based browsers don't follow the spec
                // for the dialog box. An almost cross-working example would be
                // close from the below example.
                var confirmationMessage = "You have an upload in progress. Leaving the page will cancel the upload.\n\nThis page is asking you to confirm that you want to leave - data you have entered may not be saved.";
                e = e || window.event;
                e.returnValue = confirmationMessage; // Gecko + IE
                if (Ext.isChrome || Ext.isSafari) {
                    return confirmationMessage; // Webkit, Safari, Chrome etc.
                }
            }
        } catch (e) {
            // ignore error since we do not know what happens when an error
            // occurs on this event
        }
    }, false);
}

function dadOpenPopup(url) {
    var width = screen.width - 200;
    var height = screen.height - 300;
    var left = (screen.width - width) / 2;
    var top = (screen.height - height) / 2;
    top = top - 50; // position window slightly above so that we can see the
    // status bar
    var params = 'width=' + width + ', height=' + height;
    params += ', top=' + top + ', left=' + left;
    params += ', directories=no';
    params += ', location=no';
    params += ', menubar=no';
    params += ', resizable=no';
    params += ', scrollbars=no';
    params += ', status=no';
    params += ', toolbar=no';
    // dadWait('Opening popup window' + '...');
    // IN SS record popup for example, when a row is deleted, NetSuite redirects
    // to a listing instead of showing the form of the parent SS Form. We track
    // the original
    // url so that when we detected the listing, we change the location to this
    // URL
    window.open(url, "mywindow", params);
}

function dadShowFile(fileId) {
    var logger = new dadobjLogger(arguments);
    var url = nlapiResolveURL('mediaitem', fileId);
    logger.log('url=' + url);
    dadOpenPopup(url);
}

function dadDelete(fileId, link) {
    var logger = new dadobjLogger(arguments);
    Ext.get('dadDeleteStatus').update('<img src=/images/setup/hourglass.gif /> Deleting...');

    var param = {
        recordTypeScriptId : nlapiGetRecordType(),
        recordId : nlapiGetRecordId(),
        fileId : fileId
    };
    dadSuiteletProcessAsyncUser('deleteFile', param, function(data) {
        if (data != 'ok') {
            Ext.get('dadDeleteStatus').update('&nbsp;');
            uiShowError('File delete failed.');
            return;
        }

        dadSuiteletProcessAsync('deleteDadFile', param, function(data) {
            if (data != 'ok') {
                Ext.get('dadDeleteStatus').update('&nbsp;');
                uiShowError('deleteDadFile failed.');
                return;
            }
            // hide row
            var xLink = Ext.get(link);
            var selector = 'tr';
            var xRow = Ext.get(xLink.findParent(selector));
            xRow.fadeOut({
                callback : function() {
                    xRow.dom.style.display = 'none';
                }
            });
            Ext.get('dadDeleteStatus').update('&nbsp;');
            dadGlobal.dadWin.syncSize();
            logger.log('end');
        })
    });
}

function dadShowLineItemFiles(subListId) {
    var logger = new dadobjLogger(arguments);
    dadWait('Please wait...');

    // get current line
    var lineNum = nlapiGetCurrentLineItemIndex(subListId);
    if (lineNum == -1) {
        uiShowInfo('Select a line item.');
        return;
    }

    if (lineNum > nlapiGetLineItemCount(subListId)) {
        uiShowInfo('Select an existing line item.');
        return;
    }
    Ext.get('dadWindowHeader').update('Files Attached to Line: ' + lineNum);
    var lineId = nlapiGetLineItemValue(subListId, 'id', lineNum);
    var param = {
        recordTypeScriptId : nlapiGetRecordType(),
        recordId : nlapiGetRecordId(),
        subListId : subListId,
        lineId : lineId
    };
    dadSuiteletProcessAsync('getLineItemFiles', param, function(fileIds) {
        logger.log('getLineItemFiles; fileIds=' + fileIds);
        if (fileIds.length === 0) {
            uiShowInfo('No files attached for this line item');
            return;
        }
        var filters = [];
        filters.push([ 'internalid', 'anyof', fileIds ]);
        var columns = [];
        columns.push(new nlobjSearchColumn('created'));
        columns[0].setSort(true);
        columns.push(new nlobjSearchColumn('name'));
        columns.push(new nlobjSearchColumn('owner'));
        var results = nlapiSearchRecord('file', null, filters, columns);
        if (results === null) {
            uiShowInfo('No files attached for this line item');
            return;
        }
        var files = [];
        for (var i = 0; i < results.length; i++) {
            var file = {};
            var id = results[i].getId();
            var fileName = results[i].getValue('name');
            file['Date Created'] = results[i].getValue('created');
            file.File = '<a href=# onclick="dadShowFile(' + id + ', this); return false;">' + fileName + '</a>';
            // file['Uploaded By'] = results[i].getText('owner');
            file.Delete = '<a href=# onclick="dadDelete(' + id + ', this); return false;">Delete</a>';
            files.push(file);
        }

        var html = dadCreateTableHtml(files) + '<span id="dadDeleteStatus">&nbsp;</span>';

        Ext.Msg.hide();
        Ext.get('dadFilesContent').update(html);
        if (dadHasValue(dadGlobal.dadWin)) {
            dadGlobal.dadWin.show();
            return;
        }
        
        dadGlobal.dadWin = new Ext.Window({
            applyTo : 'dadFilesBox',
            renderTo : window,
            layout : 'fit',
            width : '700',
            height : 'auto',
            closeAction : 'hide',
            plain : false,
            modal : true,
            buttonAlign : 'center',
            buttons : [ {
                text : 'Close',
                handler : function() {
                    dadGlobal.dadWin.hide();
                }
            } ]
        });
        // dadGlobal.dadWin.center();
        var left = (Ext.getBody().getWidth() - dadGlobal.dadWin.getWidth()) / 2;
        var top = (Ext.getBody().getHeight() - dadGlobal.dadWin.getHeight()) / 2;
        dadGlobal.dadWin.show();
        Ext.select('#dadFilesBox .x-window-bl').setStyle({
            'backgroundColor' : 'white'
        });
        dadGlobal.dadWin.setPosition(left, top);
        logger.log('end');
    });
}






/**
 * Sets the text/html of the status
 * 
 * @param {Object}
 *        status
 */
function dadSetStatus(status) {
    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadRecordDropZoneBackgroundStatus').update(status);
}





/**
 * Actions to take when a file is dropped into the richtext editor
 * 
 * @param {Object}
 *        evt
 */
function dadFileDrop(evt)
{
    var logger = new dadobjLogger(arguments);

    dadGlobal.dadIsDragEnter = false;
    var e = evt || window.event;
    var target = e.target || e.srcElement;
    var isPublic = e.ctrlKey ? true : false;  //Flag if file is publicly available

    // [DnD] Highlight on textbox is not removed after fail upload of file
    if (target.getAttribute('type') == 'text' || target.outerHTML.indexOf('<textarea') === 0)
    {
        Ext.get(target).setStyle('backgroundColor', '');
    }

    // hide first so that alerts will display properly
    if (dadHasValue(dadGlobal.folderTooltip))
    {
        dadGlobal.folderTooltip.hide();
    }

    // TODO: move checking in page load
    var userPermission = nlapiGetContext().getPermission('LIST_FILECABINET');
    // user has either view or no access to documents and files
    if (userPermission < dadGlobal.CREATE_PERMISSION)
    {
        dadGlobal.folderId = null;
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
        uiShowWarning('You do not have access to Documents and Files. Contact your account administrator to request for access.', dadGlobal.TITLE, function()
        {
        });
        return dadStopPropagation(evt);
    }

    if (dadHasNoValue(dadGlobal.folderId) && dadHasNoValue(dadGlobal.folderPathPattern))
    {
        // no target folder selected
        uiShowWarning('Please select a target folder.', dadGlobal.TITLE, function()
        {
            dadChangeTargetFolder(false);
        });
        return dadStopPropagation(evt);
    }

    if (dadCreateSubFolderIfNeeded() === false)
    {
        return dadStopPropagation(evt);
    }

    var isFolderInactive = nlapiLookupField('folder', dadGlobal.folderId, 'isinactive');
    if (isFolderInactive === 'T')
    {
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
        uiShowWarning('You are uploading to an inactive folder. Please select a different folder.', dadGlobal.TITLE, function()
        {
            dadChangeTargetFolder();
        });
        return dadStopPropagation(evt);
    }

    dadGetCurrentFolderNameIfNeeded();
    if (dadGlobal.folderFullName === '')
    {
        dadGlobal.folderId = null;
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
        uiShowWarning('You do not have access to this folder. Please select a different folder.', dadGlobal.TITLE, function()
        {
            dadChangeTargetFolder();
        });
        return dadStopPropagation(evt);
    }

    dadGlobal.dadIsDragEnter = false;
    Ext.get('dadInfo').hide();
    var lineId = null;
    var header = null;
    var textBox = null;
    var subListId = null;

    if (target.id == 'dadRecordDropZone')
    {
        header = target;
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
    }
    else if (dadIsInput(target) === true)
    {
        // text boxes
        Ext.get(target).setStyle('backgroundColor', 'transparent');
        textBox = target;
    }
    else
    {
        // line item, now get the row of the line item
        var outerHTML = target.outerHTML || '';
        if (outerHTML.indexOf('<tr') == -1)
        {
            target = Ext.get(target).findParent('tr');
        }

        // get line index from the id
        var pos = target.id.indexOf('_row_') + 5;
        var lineNum = parseInt(target.id.substr(pos), 10);

        // get sublits id
        pos = target.id.indexOf('_row_');
        subListId = target.id.substr(0, pos);

        lineId = nlapiGetLineItemValue(subListId, 'id', lineNum);
        if (dadHasNoValue(lineId))
        {
            uiShowWarning('Line item should be saved first before any file can be attached to it.');
            return;
        }
        
        Ext.get(target).select('td').setStyle('backgroundColor', Ext.isSafari ? '' : 'transparent');
    }

    var files = evt.dataTransfer.files;
    var count = files.length;
    if (count === 0)
    {
        logger.log('no files');
        return dadStopPropagation(evt);
    }

    // check file size
    var fileNames = [];
    var fileObjects = [];
    for (var i = 0; i < count; i++)
    {
        var file = files[i];
        fileNames.push(file.name);
        fileObjects.push(file);

        // check file size, do not allow more than 9.99mb
        var MAXIMUM_IMAGE_SIZE = 10475274;
        if (file.size > MAXIMUM_IMAGE_SIZE)
        {
            Ext.MessageBox.show({
                title: dadGlobal.TITLE,
                msg: 'The file ' + file.name + ' exceeds the maximum file size of 10MB.',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING
            });
            
            return dadStopPropagation(evt);
        }
    }
    
    // check if file object is file or folder
    dadCheckIsFileOrFolder();
    
    function dadCheckIsFileOrFolder() {
        // check remaining from array
        if (fileObjects.length == 0) {
            // if no more, then proceed
            dadCheckExistingFiles();
            return;
        }
        
        // get a file object (first element from the array)
        var file = fileObjects.shift();

        // check if file object is a folder
        var reader = new FileReader();
        reader.onload = function(e) {
            // it's a file; call same function to check next element
            dadCheckIsFileOrFolder();
        };
        reader.onerror = function(e) {
            // it's a folder
            Ext.MessageBox.show({
                title: dadGlobal.TITLE,
                msg: 'You cannot upload a folder through File Drag and Drop.',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING
            });
            return dadStopPropagation(evt);
        };
        reader.readAsText(file);
    }

    function dadCheckExistingFiles() {

        var param = {
            scriptId: nlapiGetRecordType(),
            fileNames: fileNames,
            folderId: dadGlobal.folderId
        };
        
        dadSetStatus('Checking existing files...');
        dadSuiteletProcessAsync('getExistingFiles', param, function(existingFileNames)
        {
            if (existingFileNames.length === 0)
            {
                // no existing files
                jDnd('#dadRecordDropZoneBackground').effect('highlight', {}, 3000);
                dadUploadNow(isPublic);
                return dadStopPropagation(evt);
            }
            
            // there are existing files
            Ext.get('dadInfo').update('Existing files found.');
            var fileNamesStr = '';
            for (var f = 0; f < existingFileNames.length; f++)
            {
                fileNamesStr = fileNamesStr + '<br>' + existingFileNames[f];
            }
            var question = existingFileNames.length > 1 ? 'The following existing files will be overwritten: ' : 'This existing file will be overwritten: ';
            question = question + fileNamesStr + '.<br><br>Continue?';
            Ext.MessageBox.confirm(dadGlobal.TITLE, question, function(btn)
            {
                if (btn == 'no')
                {
                    Ext.get('dadInfo').hide();
                    dadResetStatus();
                    uiShowInfo('No files were copied.');
                    return dadStopPropagation(evt);
                }
                jDnd('#dadRecordDropZoneBackground').effect('highlight', {}, 3000);
                dadUploadNow(isPublic);
            });
        });

    }

    function dadUploadNow(isPublic)
    {
        var logger = new dadobjLogger(arguments, false);

        dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) + count;
        var status = 'Uploading ' + dadGlobal.filesBeingUploaded + ' file' + (dadGlobal.filesBeingUploaded == 1 ? '' : 's') + '...';
        Ext.get("dadInfo").update(status);
        dadSetStatus(status);

        if (dadHasNoValue(dadGlobal.url))
        {
            dadGlobal.url = nlapiResolveURL('SUITELET', 'customscript_dad_user_service_sl', 'customdeploy_dad_user_service_sl');
        }

        _NanoBar.Create(lineId, target);

        for (var i = 0; i < count; i++)
        {
            var file = files[i];
            dadUploadFile(file, dadGlobal.folderId, header, textBox, subListId, lineId, isPublic);
        }

        // show detailed progress
        // dadShowFolderMenu();
    }

    return dadStopPropagation(evt);
}





function dadUploadFile(file, folderId, header, textBox, subListId, lineId, isPublic)
{
    var logger = new dadobjLogger(arguments, false);

    dadGlobal.batchSize = dadGlobal.batchSize + file.size;
    if (dadGetUploadingCount() >= dadGlobal.MAXIMUM_PARALLEL_UPLOADS)
    {
        dadGlobal.filesInWaitingKey = dadGlobal.filesInWaitingKey + 1;
        dadGlobal.filesInWaiting.push({
            key: dadGlobal.filesInWaitingKey.toString(),
            file: file,
            folderId: folderId,
            header: header,
            textBox: textBox,
            subListId: subListId,
            lineId: lineId
        });
        return;
    }

    var xmlRequests = dadGlobal.xmlRequests;
    var url = dadGlobal.url;
    dadGlobal.filesBeingUploadedBatch = dadGlobal.filesBeingUploadedBatch + 1;

    // include other info
    var vFD = new FormData();
    vFD.append('file', file);
    vFD.append('recordtype', nlapiGetRecordType());
    vFD.append('recordid', nlapiGetRecordId());
    vFD.append('folderId', folderId);
    vFD.append("ispublic", isPublic ? "T" : "F");

    if (header === null && textBox === null)
    {
        vFD.append('subListId', subListId);
        vFD.append('lineid', lineId);
    }
    else
    {
        vFD.append('subListId', '');
        vFD.append('lineid', '');
    }

    if (dadHasValue(textBox))
    {
        vFD.append('textboxid', textBox.getAttribute('id'));
    }
    
    

    xmlRequests.push(new XMLHttpRequest());
    // oXHR.upload.addEventListener('progress', uploadProgress, false);
    // oXHR.addEventListener('load', uploadFinish, false);
    // oXHR.addEventListener('error', uploadError, false);
    // oXHR.addEventListener('abort', uploadAbort, false);

    var uploadId = dadGlobal.uploadId;

    xmlRequests[uploadId].uploadId = uploadId;
    xmlRequests[uploadId].fileName = file.name;
    xmlRequests[uploadId].open('POST', url, true /* async */);
    xmlRequests[uploadId].onreadystatechange = function()
    {
        // 'Uploading...';
        if (this.readyState == 4 && this.status != 200)
        {
            // if upload is cancelled or other conditions
            dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) - 1;
            logger.log('ERROR: this.status=' + this.status);
            dadProcessNextWaitingFile();
        }

        if (this.readyState == 4 && this.status == 200)
        {
            _NanoBar.Finish(uploadId);

            // upload completed
            var returnValue = dadHandleResponse(this);
            delete dadGlobal.currentUploadHash[this.uploadId];

            var dadFile = returnValue;

            // check error
            if (dadHasValue(dadFile.error))
            {
                dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) - 1;
                uiShowWarning(dadFile.error);
                return;
            }

            var recordId = nlapiGetRecordId();
            if (dadHasNoValue(recordId))
            {
                dadGlobal.filesAttachmentQueue.push({ id: dadFile.fileId, name: file.name });
            }
            else
            {
                // Edit mode
                var mediaItemRecordTypes = ['assemblyitem', 'lotnumberedassemblyitem', 'serializedassemblyitem'];

                if (mediaItemRecordTypes.indexOf(nlapiGetRecordType()) > -1)
                {
                    // Check first if fileId exists in the sublist
                    var mediaExists = false;
                    var mediaItemCount = nlapiGetLineItemCount('mediaitem');

                    for (var mediaItemIndex = 1; mediaItemIndex <= mediaItemCount; mediaItemIndex++)
                    {
                        var mediaItemId = nlapiGetLineItemValue('mediaitem', 'mediaitem', mediaItemIndex);
                        if (dadFile.fileId == mediaItemId)
                        {
                            mediaExists = true;
                            break;
                        }
                    }

                    if (!mediaExists)
                    {
                        nlapiSelectNewLineItem('mediaitem');
                        nlapiSetCurrentLineItemValue('mediaitem', 'mediaitem', dadFile.fileId, true, true);
                        nlapiCommitLineItem('mediaitem');
                    }
                }
            }

            if (dadHasValue(dadFile.textboxid))
            {
                // append url to textbox
                var textBox = Ext.get(dadFile.textboxid).dom;
                textBox.value = (textBox.value == null || textBox.value == "" ? "" : textBox.value + ' ') + dadFile.fileName + ' https://' + window.location.hostname + nlapiResolveURL('mediaitem', dadFile.fileId);
                NS.form.setChanged(true);
            }

            if (dadHasValue(recordId))
            {
                // addOrUpdateOrDeleteDadFile
                var param = {
                    recordTypeScriptId: nlapiGetRecordType(),
                    recordId: nlapiGetRecordId(),
                    returnValue: returnValue
                };

                dadSuiteletProcessAsync('addOrUpdateOrDeleteDadFile', param, function(data)
                {
                    dadSetStatus(xmlRequests[uploadId].upload.fileName + ' upload completed.');
                });
            }

            dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) - 1;

            // update folder icon to show it has files
            var img = Ext.get('dadImgFolderInfo');
            img.dom.setAttribute('src', dadGlobal.DROPZONE_FOLDER_HAS_FILES_ICON);
            img.dom.setAttribute('title', 'Files have been attached to this record. Click the folder icon to open the Files subtab on the record page.');

            dadProcessNextWaitingFile();
        }
    };

    // progress bar
    xmlRequests[uploadId].upload.fileName = file.name;
    xmlRequests[uploadId].upload.uploadId = uploadId;
    xmlRequests[uploadId].upload.addEventListener("progress", function(e)
    {
        dadGlobal.currentUploadHash[this.uploadId].loaded = e.loaded;
    }, false);

    dadGlobal.currentUploadHash[uploadId] = {};
    dadGlobal.currentUploadHash[uploadId].fileName = file.name;
    dadGlobal.currentUploadHash[uploadId].fileSize = file.size;
    dadGlobal.currentUploadHash[uploadId].loaded = 0;
    dadGlobal.currentUploadHash[uploadId].startGetTime = null;
    dadGlobal.currentUploadHash[uploadId].uploadId = uploadId;

    xmlRequests[uploadId].send(vFD);
    if (dadHasNoValue(dadGlobal.dadShowUploadProgress))
    {
        dadGlobal.dadShowUploadProgress = setInterval('dadShowUploadProgress();', 1000);
    }

    dadGlobal.uploadId = uploadId + 1;

    _NanoBar.AddUploadId(lineId, uploadId);

    return uploadId;
}





function dadShowUploadProgress()
{
    var logger = new dadobjLogger(arguments, true);
    if (dadGlobal.dadIsDragEnter)
    {
        logger.log('dadGlobal.dadIsDragEnter=' + dadGlobal.dadIsDragEnter);
        return;
    }

    var currentUploadHash = dadGlobal.currentUploadHash;
    var pendingUploadsCount = Object.keys(currentUploadHash).length;
    if (pendingUploadsCount > 1)
    {
        dadGlobal.isMultipleFiles = true;
    }
    if (pendingUploadsCount === 0)
    {
        dadGlobal.batchSize = 0;
        // no more uploads
        if (Ext.get('dadProgressBars'))
        {
            Ext.get('dadProgressBars').update('None');
        }

        // Ext.get('dadRecordDropZoneBackgroundBar').hide();
        clearInterval(dadGlobal.dadShowUploadProgress);
        delete dadGlobal.dadShowUploadProgress;
        if (dadGlobal.folderTooltip)
        {
            dadGlobal.folderTooltip.syncSize();
        }
        // automatically refresh after all the files have been uploaded, in
        // order to see the updated list of files for this record.
        if (dadHasValue(Ext.get('mediaitemtxt')))
            dadTriggerEvent('mediaitemtxt', 'click');

        if (dadGlobal.isMultipleFiles)
        {
            setTimeout('dadSetStatus(\'Files successfully uploaded.\');', 3000);
            dadGlobal.isMultipleFiles = false;
        }

        // Issue 326234 : [DnD] On Transaction forms, attempting to save the
        // record while files are being uploaded and staying in page will no
        // longer allow users to save their record
        // Fix will check first if form is transactional and on create mode.
        // After upload of files, it will set submitted value to false
        var recordId = nlapiGetRecordId();
        var tranId = nlapiGetFieldValue('tranid');
        if (dadHasNoValue(recordId) && tranId !== null)
        {
            Ext.get('main_form').dom.submitted.value = 'F';
        }
        setTimeout('dadResetStatus();', 10000);
        return;
    }

    // there are still pending uploads
    var totalBytesSize = 0;
    var totalBytesLoaded = 0;
    var totalBytesRemain = 0;
    var totalSecondsElapsed = 0;
    var currentGetTime = (new Date()).getTime();
    var secondsRemainingLongest = 0;
    for (var p in currentUploadHash)
    {
        var o = currentUploadHash[p];
        totalBytesSize = totalBytesSize + o.fileSize;

        if (o.loaded === 0)
        {
            // do not include yet in computation of seconds remaining since it will result in infinity seconds
            continue;
        }
        
        totalBytesRemain = totalBytesRemain + (o.fileSize - o.loaded);
        if (dadHasNoValue(o.startGetTime))
        {
            o.startGetTime = (new Date()).getTime();
        }

        var secondsElapsed = (currentGetTime - o.startGetTime) / 1000;
        var bytesPerSecond = o.loaded / secondsElapsed;
        var secondsRemaining = (o.fileSize - o.loaded) / bytesPerSecond;

        if (secondsRemaining < 0)
        {
            secondsRemaining = 0;
        }
        
        if (secondsRemaining > secondsRemainingLongest)
        {
            secondsRemainingLongest = secondsRemaining;
        }
        
        totalSecondsElapsed = totalSecondsElapsed + secondsElapsed;
        totalBytesLoaded = totalBytesLoaded + o.loaded;
        totalBytesSize = totalBytesSize + o.fileSize;

        _NanoBar.AddProgress(o.uploadId, o.loaded, o.fileSize);
    }

    // get largest file size in waiting
    var largestFileSizeInQueue = 0;
    for (var i = 0; i < dadGlobal.filesInWaiting.length; i++)
    {
        if (!dadGlobal.filesInWaiting[i])
        {
            // file might have been cancelled
            continue;
        }
        var file = dadGlobal.filesInWaiting[i].file;
        totalBytesRemain = totalBytesRemain + file.size;
        if (file.size > largestFileSizeInQueue)
        {
            largestFileSizeInQueue = file.size;
        }
    }

    var bytesPerSecond = totalBytesLoaded / totalSecondsElapsed;
    // add the longest seconds remaining and the estimated time for the largest file in queue
    var totalSecondsRemaining = secondsRemainingLongest;
    if (bytesPerSecond > 0)
    {
        var fileCountInQueue = dadGlobal.filesInWaiting.length;
        var batchCountInQueue = fileCountInQueue / dadGlobal.MAXIMUM_PARALLEL_UPLOADS;
        batchCountInQueue = parseInt(batchCountInQueue, 10);
        if (fileCountInQueue % dadGlobal.MAXIMUM_PARALLEL_UPLOADS > 0)
        {
            batchCountInQueue = batchCountInQueue + 1;
        }
        var secondsInQueue = batchCountInQueue * largestFileSizeInQueue / bytesPerSecond;
        totalSecondsRemaining = totalSecondsRemaining + secondsInQueue;
    }

    var completed = parseInt(100 * (dadGlobal.batchSize - totalBytesRemain) / dadGlobal.batchSize, 10);
    if (completed > 100)
    {
        completed = 100;
    }
    
    pendingUploadsCount = pendingUploadsCount + dadGlobal.filesInWaiting.length;
    var status = 'Uploading ' + pendingUploadsCount + ' file' + (pendingUploadsCount == 1 ? '' : 's');
    var totalSecondsRemainingRounded = Math.round(totalSecondsRemaining);
    if (totalSecondsRemainingRounded > 1)
    {
        status = status + ' &middot; ' + totalSecondsRemainingRounded + ' seconds left';
    } else if (totalSecondsRemainingRounded == 1)
    {
        status = status + ' &middot; ' + totalSecondsRemainingRounded + ' second left';
    } else
    {
        if (totalSecondsRemaining > 0 && completed > 0)
        {
            status = status + ' &middot; less than 1 second left';
        }
    }

    var fullWidth = Ext.get('dadRecordDropZone').getWidth() - 3;

    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadRecordDropZoneBackgroundStatus').update(status);
    var width = fullWidth * completed / 100;
    if (width > fullWidth)
    {
        width = fullWidth;
    }
    var xBar = Ext.get('dadRecordDropZoneBackgroundBar');
    xBar.show();
    // xBar.dom.style.width = width;
    xBar.setWidth(width);
    // ===================================================
    // each file
    // ===================================================
    var dadProgressBars = Ext.get('dadProgressBars');
    if (dadProgressBars === null)
    {
        // tooltip not displayed so exit
        return;
    }
    dadProgressBars.update('');
    var dadProgressBarsWidth = dadProgressBars.getWidth();
    var htmlImgCancel = Ext.get('dadTplImageCancelCache').dom.innerHTML;
    for (var p in currentUploadHash)
    {
        var o = currentUploadHash[p];

        totalBytesSize = totalBytesSize + o.fileSize;
        totalBytesLoaded = totalBytesLoaded + o.loaded;
        var secondsElapsed = (currentGetTime - o.startGetTime) / 1000;

        if (secondsElapsed === 0 || o.loaded === 0)
        {
            // will result in infinity seconds
            var html = '<div class="dadProgressBarBox"><div class="dadProgressStatus"><div class="dadFileStatusText">' + o.fileName + ' &middot; ' + ' Waiting in queue...</div>' + '<div class="dadCancelLink"><a href=# onclick="dadAbortUpload(event, ' + o.uploadId + '); return false;" title="Cancel">' + htmlImgCancel + '</a></div></div></div>';
            dadProgressBars.insertHtml('beforeEnd', html);
            continue;
        }

        var bytesPerSecond = o.loaded / secondsElapsed;
        var secondsRemaining = (o.fileSize - o.loaded) / bytesPerSecond;
        if (secondsRemaining < 0)
        {
            secondsRemaining = 0;
        }
        secondsRemaining = Math.round(secondsRemaining);

        var completed = Math.round(100 * o.loaded / o.fileSize);
        if (completed > 100)
        {
            completed = 100;
        }
        var width = Math.round(o.loaded / o.fileSize * dadProgressBarsWidth) + 'px';

        status = o.fileName;
        if (secondsRemaining === 0)
        {
            status = status + ' &middot; less than a second left';
        }
        else
        {
            status = status + ' &middot; ' + secondsRemaining + ' second' + (secondsRemaining > 1 ? 's' : '') + ' left';
        }

        status = status.replace(/ /g, '&nbsp;');
        var progressBar = '<div class="dadProgressBar" style="width: ' + width + '">&nbsp;</div>';
        // Issue: 259152 [DnD] Allow canceling of files in queue
        // this comment just shows the location of the change.
        // the actual change is in CL 600387
        var progressStatus = '<div class="dadProgressStatus" style="border:1px"><div class="dadFileStatusText">' + status + '</div></div><a href=# class="dadCancelLink" onclick="dadAbortUpload(event, ' + o.uploadId + '); return false;" title="Cancel">' + htmlImgCancel + '</a>';
        html = '<div class="dadProgressBarBox clearfix">' + progressBar + progressStatus + '</div>';
        dadProgressBars.insertHtml('beforeEnd', html);
    }

    // progress of files in waiting
    for (var i = 0; i < dadGlobal.filesInWaiting.length; i++)
    {
        try
        {
            var item = dadGlobal.filesInWaiting[i];
            var width = '0px';
            var progressBar = '<div class="dadProgressBar" style="width: ' + width + '">&nbsp;</div>';
            var status = item.file.name + ' &middot; Waiting in queue...';
            var progressStatus = '<div class="dadProgressStatus" style="border:1px"><div class="dadFileStatusText">' + status + '</div></div><a href=# class="dadCancelLink" onclick="dadAbortInWaiting(event, \'' + item.key + '\'); return false;" title="Cancel">' + htmlImgCancel + '</a>';
            html = '<div class="dadProgressBarBox clearfix">' + progressBar + progressStatus + '</div>';

            dadProgressBars.insertHtml('beforeEnd', html);

        } catch (e)
        {
            // possible the item has been cancelled
        }
    }
    dadGlobal.folderTooltip.syncSize();

    dadApplyCSSToFolderTooltip();
}





/**
 * Cancels a file upload in waiting
 * 
 * @param evt
 * @param {string}
 *        key
 */
function dadAbortInWaiting(evt, key) {
    for (var i = 0; i < dadGlobal.filesInWaiting.length; i++) {
        var item = dadGlobal.filesInWaiting[i];
        if (key == item.key) {
            dadGlobal.filesInWaiting.splice(i, 1);
        }
    }
    dadShowUploadProgress();
    dadStopPropagation(evt);

    return false;
}

function dadAbortUpload(evt, uploadId) {
    dadSetStatus(dadGlobal.xmlRequests[uploadId].upload.fileName + ' upload cancelled.');
    dadGlobal.xmlRequests[uploadId].abort();
    delete dadGlobal.currentUploadHash[uploadId];

    dadShowUploadProgress();

    dadProcessNextWaitingFile();

    evt = evt || window.event;
    dadStopPropagation(evt);
}

/**
 * Returns true if the passed element is a NS textbox or textarea
 * 
 * @param {Object}
 *        el
 */
function dadIsInput(el) {
    if (typeof el.getAttribute == 'undefined') {
        // this happens in line items
        return false;
    }

    var cls = el.getAttribute('class');
    return [ 'input textarea', 'inputreq textarea', 'input', 'inputreq' ].indexOf(cls) > -1;
}

/**
 * Event handler for other drag-and-drop events. Used for demo purposes.
 * 
 * @param {Object}
 *        evt
 */
function dadNoOperationHandler(evt) {
    return dadStopPropagation(evt);
}





function dadDragEnter(e) {
    var logger = new dadobjLogger(arguments);
    e = e || window.event;
    var target = e.target || e.srcElement;

    dadResetStatus();
    dadGlobal.dadIsDragEnter = true;

    var xDadInfo = Ext.get('dadInfo');

    if (target.id == 'dadRecordDropZone') {
        // record level
        // highlight drop zone
        Ext.get(target.id + 'Background').setStyle('backgroundColor', 'lightgreen');
    } else if (dadIsInput(target) === true) {
        // text boxes
        Ext.get(target).setStyle('backgroundColor', 'lightgreen');
    } else {
        // line item level
        Ext.get('dadInfo').update('Drop your file here to attach it to this line item');
        // find the parent table row
        // for some reasons, calling Ext.get() on a literal returns null, so get
        // parent if needed
        var notNullTarget = Ext.get(target) || Ext.get(target.parentNode);
        var xTr = (notNullTarget).findParent('tr', 50, true);
        jDnd('#' + xTr.dom.id + ' td').each(function() {
            this.style.setProperty('background-color', 'lightgreen', 'important');
        });
        logger.log('xTr.dom.id=' + xTr.dom.id);

        // get parent table
        var xTable = xTr.findParent('.listtable', 50, true);
        logger.log('xTable.dom.id=' + xTable.dom.id);
        var listId = xTable.dom.id.replace('_splits', '');
        logger.log('listId=' + listId);
        var lineNum = xTr.dom.id.replace(listId + '_row_', '');
        lineNum = parseInt(lineNum, 10);
        if (nlapiGetLineItemValue(listId, 'id', lineNum) == '') {
            xTr.select('td').setStyle('backgroundColor', 'pink');
            Ext.get('dadInfo').update('The line item needs to be saved before you can attach file.');
        }
        // check if new, if yes, do not allow drop
        xDadInfo.setTop(xTr.getTop() - Ext.get('dadInfo').getHeight());
        xDadInfo.setLeft(e.clientX + 30);
        Ext.get('dadInfo').show();
    }

    return dadStopPropagation(e);
}

function dadDragExit(e) {
    var logger = new dadobjLogger(arguments);
    e = e || window.event;

    dadGlobal.dadIsDragEnter = false;

    var target = e.target || e.srcElement;
    if (target.id == 'dadRecordDropZone') {
        Ext.get(target.id + 'Background').setStyle('backgroundColor', 'transparent');
    } else if (dadIsInput(target) === true) {
        // text boxes
        Ext.get(target).setStyle('backgroundColor', '');
    } else {
        if (Ext.get(target) === null) {
            // target might be a text content
            return;
        }
        target = Ext.get(target).findParent('tr');
        jDnd('#' + target.id + ' td').each(function() {
            this.style.removeProperty('background-color');
        });
    }
    Ext.get('dadInfo').hide();
    logger.log('end');

    return dadStopPropagation(e);
}

/**
 * Get the list of editable sub list id
 */
function dadGetEditableSublists() {
    var logger = new dadobjLogger(arguments, true);
    var editableSubLists = [];
    if (dadHasNoValue(nlapiGetFieldValue('custpage_dad_sublists'))) {
        return editableSubLists;
    }
    var subListIds = JSON.parse(nlapiGetFieldValue('custpage_dad_sublists'));
    for (var i = 0; i < subListIds.length; i++) {
        var splitId = subListIds[i] + '_splits';
        // look for the listtextnonedit which can only be found on editable
        // sublists
        if (dadHasNoValue(Ext.get(splitId)))
            continue;

        if (Ext.get(splitId).select('.listtextnonedit').elements.length > 0 && (Ext.isChrome || Ext.isGecko || Ext.isSafari)) {
            // editable
            editableSubLists.push(subListIds[i]);
            var element = Ext.get('tbl_custpage_dad_button_' + splitId.replace('_splits', ''));
            if (element != null) {
                element.dom.style.display = 'block';
            }
        } else {
            // hide Show Files from Selected Item button for non-editable sub
            // lists
            var element = Ext.get('tbl_custpage_dad_button_' + splitId.replace('_splits', ''));
            if (element != null) {
            	element.dom.style.display = 'none';
            }
        }
    }
    logger.log('end');
    return editableSubLists;
}

/**
 * attach events to line items
 */
function dadSetDragAndDropEventsForLineItems() {
    var logger = new dadobjLogger(arguments, true);
    for (var s = 0; s < dadGetEditableSublists().length; s++) {
        var elId = dadGetEditableSublists()[s] + '_splits';
        var els = Ext.select('#' + elId + ' > tbody > tr').elements;
        logger.log('els.length=' + els.length);
        for (var i = 0; i < els.length; i++) {
            var id = els[i].id;
            if (id.indexOf('_row_') == -1) {
                continue;
            }
            dadAddDnDEvents(els[i]);
        }
    }
}

/**
 * Add drag and drop events to an element
 * 
 * @param {Object}
 *        el
 */
function dadAddDnDEvents(el) {
    dadAddEvent(el, "drop", dadFileDrop);
    dadAddEvent(el, "dragenter", dadDragEnter);
    dadAddEvent(el, "dragover", dadNoOperationHandler);
    if (dadGlobal.browser.isFirefox) {
        // FF
        dadAddEvent(el, "dragexit", dadDragExit);
    } else {
        // chrome, safari
        dadAddEvent(el, "dragleave", dadDragExit);
    }
}

/**
 * Needed for: I want to insert the complete link of the file being uploaded
 * unto an editable text field of a form, that way the link will append at the
 * end of any existing text of that field.
 */
function dadSetDragAndDropEventsForTextboxes() {
    var logger = new dadobjLogger(arguments);
    // select all optional NS input single line text boxes
    var selector = 'input[type=text][class=input]';
    var els = jDnd(selector);
    // logger.log('els.length=' + els.length);
    for (var i = 0; i < els.length; i++) {
        dadAddDnDEvents(els[i]);
    }
    // select all required NS input single line text boxes
    var selector = 'input[type=text][class=inputreq]';
    var els = jDnd(selector);
    // logger.log('els.length=' + els.length);
    for (var i = 0; i < els.length; i++) {
        dadAddDnDEvents(els[i]);
    }

    // select all NS input text area (multi-line)
    var selector = 'textarea';
    var els = jDnd(selector);
    // logger.log('els.length=' + els.length);
    for (var i = 0; i < els.length; i++) {
        dadAddDnDEvents(els[i]);
    }
}

function dadHideNonEditSublist() {
    var logger = new dadobjLogger(arguments, true);
    var subListIds = JSON.parse(nlapiGetFieldValue('custpage_dad_sublists'));
    for (var i = 0; i < subListIds.length; i++) {
        var splitId = subListIds[i] + '_splits';
        // look for the listtextnonedit which can only be found on editable
        // sublists
        if (Ext.get(splitId).select('.listtextnonedit').elements.length === 0) {
            // not editable
            Ext.get('tbl_custpage_dad_button_' + subListIds[i]).dom.style.display = 'none';
        } else {
            Ext.get('tbl_custpage_dad_button_' + subListIds[i]).dom.style.display = 'block';
        }
    }
    logger.log('end');
}

function dadPositionRecordDropZone() {
    var logger = new dadobjLogger(arguments, true);

    var xRecordDropZoneBackground = Ext.get('dadRecordDropZoneBackground');
    var xRecordDropZone = Ext.get('dadRecordDropZone');

    // Get top alignment
    var dRecordStatus = Ext.select('.uir-record-status').elements[0];
    var dHTMLElemTop = dRecordStatus;
    if (dadHasNoValue(dHTMLElemTop)) {
        dHTMLElemTop = Ext.select('.uir-page-title').elements[0];
    }
    if (dadHasNoValue(dHTMLElemTop)) {
        // page must be on an iframe, skip showing dropzone
        return false;
    }
    var xHTMLElemTop = Ext.get(dHTMLElemTop);
    var alignTop = xHTMLElemTop.getTop() + xHTMLElemTop.getHeight();

    // Get left alignment
    var dHeaderButtons = Ext.select('.uir-header-buttons').elements[0];
    var xHeaderButtons = Ext.get(dHeaderButtons);
    if (xHeaderButtons === null) {
        logger.error('extAlignLeft ===  null');
    }
    var xRecordDropZoneBgStatus = Ext.get('dadRecordDropZoneBackgroundStatus');
    var width = xRecordDropZoneBgStatus.getWidth();
    var dropZoneWidth = width + 10;
    var paddingBodyLeft = Ext.get('div__body').getPadding('l');
    var alignLeft = (paddingBodyLeft + xHeaderButtons.getWidth()) - width - 6;

    // Change CSS when record status does not exist
    if (dadHasNoValue(dRecordStatus)) {
        xRecordDropZoneBackground.setStyle('margin-top', '0px');
        xRecordDropZone.setStyle('margin-top', '0px');
    }

    // Set dropzone coordinates
    xRecordDropZone.setWidth(dropZoneWidth);
    xRecordDropZone.setTop(alignTop);
    xRecordDropZone.setLeft(alignLeft);
    xRecordDropZone.show();

    // Set dropzone background coordinates
    xRecordDropZoneBackground.setWidth(width);
    xRecordDropZoneBackground.setHeight(xRecordDropZone.getHeight());
    xRecordDropZoneBackground.setTop(alignTop);
    xRecordDropZoneBackground.setLeft(alignLeft);
    xRecordDropZoneBackground.show();
    
    return true;
}

/**
 * Displays the folder picker and selects the current folder
 */
function dadChangeTargetFolder(isFolderSelected) {

    if (dadGlobal.folderTooltip) {
        dadGlobal.folderTooltip.hide();
    }

    dadShowFileCabinetFolderPicker(isFolderSelected);
}

function dadShowFolderMenu(event) {
    // check if folder icon is clicked, then show Files tab, otherwise, show folder menu
    if (dadHasValue(event)) {
        if (dadHasValue(event.target)) {
            if (event.target.id == 'dadImgFolderInfo' && dadHasValue(event.target.title)) {
                dadWait('Scrolling to Files tab...');
                dadShowFilesTab();
                return;
            }
        }
    }
    
    // show folder menu
    dadWait();
    setTimeout(dadShowFolderMenuNoDelay, 50);
}

function dadShowFolderMenuNoDelay() {
    Ext.Msg.hide();
    dadHideHelp();

    var logger = new dadobjLogger(arguments);
    if (dadGlobal.browserSupported === false) {
        return;
    }

    var userPermission = nlapiGetContext().getPermission('LIST_FILECABINET');
    // user has either view or no access to documents and files
    if (userPermission < dadGlobal.CREATE_PERMISSION) {
        uiShowWarning('You do not have access to Documents and Files. Contact your account administrator to request for access.', dadGlobal.TITLE, function() {
        });
        return false;
    }

    if (dadGlobal.folderTooltip) {
        // dadGlobal.folderTooltip.show();
        return;
    }

    if (dadHasNoValue(dadGlobal.folderId) && dadHasNoValue(dadGlobal.folderPathPattern)) {
        uiShowWarning('Please select a target folder.', dadGlobal.TITLE, function() {
            dadChangeTargetFolder(false);
        });
        return;
    }

    if (dadCreateSubFolderIfNeeded() === false) {
        return;
    }

    var isFolderInactive = nlapiLookupField('folder', dadGlobal.folderId, 'isinactive');
    if (isFolderInactive === 'T') {
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
        uiShowWarning('You are uploading to an inactive folder. Please select a different folder.', dadGlobal.TITLE, function() {
            dadChangeTargetFolder(false);
        });
        return false;
    }
    dadGetCurrentFolderNameIfNeeded();
    if (dadGlobal.folderFullName === '') {
        dadGlobal.folderId = null;
        Ext.get('dadRecordDropZoneBackground').setStyle('backgroundColor', 'transparent');
        uiShowWarning('You do not have access to this folder. Please select a different folder.', dadGlobal.TITLE, function() {
            dadChangeTargetFolder(false);
        });
        return false;
    }
    // ========================================
    // show destination folder
    // ========================================
    var html = '<b>Drop Zone</b>';
    html = html + '<br /><br />';
    html = html + 'You can upload multiple files simultaneously.';
    html = html + '<hr>';
    html = html + 'Destination folder:<br />' + dadGlobal.folderFullName;
    html = html + '<br />';
    html = html + '<a href="#" class="dottedlink" onclick="dadChangeTargetFolder(); return false;" title="Click to select a different destination folder for this instance. This will be reverted to the default folder when the page is refreshed.">Change</a>';
    html = html + ' | ';
    html = html + '<a target=_blank onclick="dadGlobal.folderTooltip.hide(); return true;" href="/app/common/media/mediaitemfolders.nl?folder=' + dadGlobal.folderId + '" class=dottedlink title="Click to open this folder in a new tab." >Open in new tab</a>';
    html = html + '<hr>';
    // ========================================
    // pending uploads
    // ========================================
    html = html + 'Pending uploads:';
    html = html + '<div id="dadProgressBars" style="border: 0px dotted red">';
    html = html + 'None';
    html = html + '</div>';

    var sendCommentsLinkMarkup = "<a id='dadSendCommentsLink' href='#' onclick='dadSendComments(); return false;' title='Rate File Drag and Drop.' class='dottedlink'>Rate Us</a>";
    var tutorialLink = "<a id='dadHelpLink' href='#' onclick='dadHelp(); return false;' title='Click here to launch the tutorial.' class='dottedlink'>Tutorial</a>";
    var helpLink = "<a href='/app/help/helpcenter.nl?topic=DOC_FileDragAndDrop' target='_blank' title='Click here to view the File Drag and Drop help.' class='dottedlink'>Help</a>";

    html += '<br>';
    html += sendCommentsLinkMarkup;
    html += ' | ';
    html += tutorialLink;
    html += ' | ';
    html += helpLink;

    var target = 'dadRecordDropZone';
    var tooltipId = target + 'Tooltip';
    var tooltip = (new Ext.ToolTip({
        title : '',
        // position : 'absolute',
        id : tooltipId,
        target : target,
        anchor : 'top',
        html : html,
        autoHide : false,
        autoShow : true,
        hideDelay : 10000,
        dismissDelay : 0,
        anchorOffset : 0,
        width : 400,
        height : 'auto',
        listeners : {

            'hide' : function() {
                this.destroy();
                delete dadGlobal.folderTooltip;
                // restore zindex of the shadow
                Ext.select('.x-shadow').setStyle({
                    zIndex : 20001
                });
            },
            'renderX' : function() {

                this.header.on('click', function(e) {
                    e.stopEvent();
                    Ext.Msg.alert('Link', 'Link to something interesting.');

                }, this, {
                    delegate : 'a'
                });
            }
        }
    }));
    dadGlobal.folderTooltip = tooltip;
    tooltip.show();

    Ext.select('.x-tip-mc').setStyle({
        'background-color' : 'white'
    });
    
    if (Ext.isIE) {
    	Ext.select('.x-ie-shadow').hide();
    }

    // HACK: change the zindex of the tooltip so that it is not in front of the
    // netsuite menu
    Ext.get('dadRecordDropZoneTooltip').setStyle({
        zIndex : 401
    });
    // we also need to adjust the zindex of the shadow
    Ext.select('.x-shadow').setStyle({
        zIndex : 400
    });

    dadApplyCSSToFolderTooltip();

    // show individual file progress if needed
    var currentUploadHash = dadGlobal.currentUploadHash;
    var pendingUploadsCount = Object.keys(currentUploadHash).length;
    if (pendingUploadsCount > 0) {
        dadShowUploadProgress();
    }

    return false;
}

function dadGetCurrentFolderNameIfNeeded() {
    // check first if the folder name has been obtained
    if (dadGlobal.folderFullName === '') {
        dadWait('Getting folder details...');
        if (dadCreateSubFolderIfNeeded() === false) {
            return false;
        }
        dadGlobal.folderFullName = dadGetFolderFullName(dadGlobal.folderId);
        Ext.Msg.hide();
    }
    return true;
}

function dadResetStatus() {
    var logger = new dadobjLogger(arguments);
    var status = 'Drop files here. Click for more options.';
    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadRecordDropZoneBackgroundBar').hide();
    if (Ext.get('dadRecordDropZoneBackgroundStatus').dom.innerHTML != status) {
        Ext.get('dadRecordDropZoneBackgroundStatus').update(status);
    }
    // S3 - Issue 262998 : [DnD] I want to close the drag & drop balloon after
    // all files in queue have been uploaded, together with the confirmation
    // message appearing after upload completion.
    if (dadHasValue(dadGlobal.folderTooltip)) {
        dadGlobal.folderTooltip.hide();
    }
    logger.end();
}

/**
 * Attaches an event to an element
 * 
 * @param {Object}
 *        elem Element
 * @param {Object}
 *        evnt Event
 * @param {Object}
 *        func Function
 */
function dadAddEvent(elem, evnt, func) {
    if (elem.addEventListener) // W3C DOM
        elem.addEventListener(evnt, func, false);
    else if (elem.attachEvent) { // IE DOM
        elem.attachEvent("on" + evnt, func);
    } else { // No much to do
        elem[evnt] = func;
    }
}





function dadCreateSubFolderIfNeeded()
{
    var logger = new dadobjLogger(arguments);
    if (dadHasValue(dadGlobal.folderId))
    {
        return true;
    }

    if (dadHasNoValue(dadGlobal.folderPathPattern))
    {
        dadChangeTargetFolder(false);
        return;
    }

    dadWait('Getting target folder...');
    // check if subfolder already exists, if not create
    // var parentFolderId = dadGlobal.recordTypeSettingFolderId;
    var actualFolderPath = dadGetActualFolderPath(dadGlobal.folderPathPattern);
    var sw = new dadobjStopWatch();

    var jsonFolderPath = dadCreateFolderPath(actualFolderPath);
    if (jsonFolderPath === null)
    {
        return false;
    }

    dadGlobal.folderId = jsonFolderPath.passedFolderId;

    return true;
}





function dadPageInit()
{
    var logger = new dadobjLogger(arguments);

    if (!dadPositionRecordDropZone()) {
        return;
    }
    dadResetStatus();

    jDnd(window).scroll(function()
    {
        if (Ext.get('dadFileCabinetFolderPicker').isVisible())
        {
            window.scrollTo(0, 0);
        }
    });

    var recordTypeScriptId = nlapiGetRecordType();
    if (recordTypeScriptId === null)
    {
        logger.log('recordTypeScriptId === null');
        return;
    }

    dadSuiteletProcessAsync('getIconsByName', 'value', function(iconURLs)
    {
        dadGlobal.DROPZONE_FOLDER_ICON = iconURLs['dad-image-dropzone-folder.png'];
        dadGlobal.DROPZONE_FOLDER_HAS_FILES_ICON = iconURLs['dad-image-dropzone-folder-has-files.png'];
        dadGlobal.TOOLTIP_HELP_ICON = iconURLs['dad-image-tooltip-help.png'];
        dadGlobal.UPLOAD_CANCEL_ICON = iconURLs['dad-image-icon-cancel.png'];

        // check no. of files
        var filesCount = dadGetFilesCount();

        var img = Ext.get('dadImgFolderInfo');
        img.dom.setAttribute('src', filesCount > 0 ? dadGlobal.DROPZONE_FOLDER_HAS_FILES_ICON : dadGlobal.DROPZONE_FOLDER_ICON);
        img.dom.style.visibility = "visible";
        if (filesCount > 0) {
            img.dom.setAttribute('title', 'Files have been attached to this record. Click the folder icon to open the Files subtab on the record page.');   
        }


        // Load the image immediately so that it is cached on first page load.
        Ext.get('dadImageCancel').dom.setAttribute('src', dadGlobal.UPLOAD_CANCEL_ICON);
    });

    // check browser
    if (isBrowserSupported())
    {
        // get settings for this record type
        var userPermission = nlapiGetContext().getPermission('LIST_FILECABINET');
        dadSuiteletProcessAsync('getRecordTypeSettings', recordTypeScriptId, function(recordTypeSetting)
        {
            dadSuiteletProcessAsyncUser('getUserPreference', 'value', function(paramUserPref)
            {
                dadGlobal.paramUserPref = paramUserPref;

                logger.log('recordTypeSetting=' + JSON.stringify(recordTypeSetting));
                if (JSON.stringify(recordTypeSetting) == '{}')
                {
                    // no record type level setting, get account level folder
                    var folderId = nlapiGetContext().getPreference('custscript_dad_default_dnd_folder_destin');
                    dadGlobal.folderId = folderId;
                }
                else
                {

                    if (dadHasValue(recordTypeSetting.folderId))
                    {
                        dadGlobal.folderId = recordTypeSetting.folderId;
                    }
                    else
                    {
                        dadGlobal.folderPathPattern = recordTypeSetting.folderPathPattern;
                    }
                }

                // get folder full name
                dadShowInAppNotification(dadGlobal.paramUserPref.suppressTutorial, 'dadRecordDropZone');
                dadApplyCSSToFolderTooltip();

                Ext.get('dadImgFolderInfo').show();

                // set fixed width
                var x = Ext.get('dadRecordDropZoneBackgroundStatus');
                x.setWidth(x.getWidth());

                if (userPermission < dadGlobal.CREATE_PERMISSION)
                {
                    dadGlobal.userPermission = false;
                    dadSetStatus('You do not have access to Documents and Files.');
                    dadPositionRecordDropZone();
                    Ext.get('dadRecordDropZoneBackgroundStatus').setWidth('auto');
                }
                // });
                // END of get folder full name
            });
        });

        // user has either view or no access to documents and files
        if (userPermission >= dadGlobal.CREATE_PERMISSION)
        {
            var dRecordDropZone = Ext.get('dadRecordDropZone').dom;
            dadAddDnDEvents(dRecordDropZone);

            dadSetDragAndDropEventsForTextboxes();
            // for line items, we need to regularly attach the events since the
            // line
            // items are re-created
            // when selected line item changes or when a new line item is being
            // added
            dadSetDragAndDropEventsForLineItems();
            setInterval('dadSetDragAndDropEventsForLineItems();', 3000);

            // Issue: 259062 [DnD] Prompt a warning when leaving page while
            // files
            // are being uploaded.
            dadAddBeforeUnloadEventHandler();
        }
    }
    else
    {
        dadGlobal.browserSupported = false;
        dadSetStatus('Use the latest version of NetSuite supported browsers to enable file drag and drop.');
        // 294549 Defect [DnD] New 14.2 UI: Status message 'Use the latest
        // version of Chrome or Firefox to enable file drag and drop.' is
        // truncated in the dropzone
        dadPositionRecordDropZone();
        Ext.get('dadRecordDropZoneBackgroundStatus').setWidth('auto');

        Ext.get('dadRecordDropZoneBackgroundStatus').setStyle({
            'color': 'rgb(251, 69,30)',
            'padding-left': '30px'
        });

        Ext.get('dadRecordDropZone').setStyle({
            'border': '2px dashed rgb(251, 69,30)'
        });

        Ext.get('dadRecordDropZone').dom.title = '';

        setTimeout(function()
        {
            Ext.select('#dadRecordDropZoneBackground, #dadRecordDropZone, #dadImgFolderInfo, #dadRecordDropZoneBackgroundStatus').fadeOut();
        }, 3000);

        return;
    }

    jDnd(window).resize(function()
    {
        dadPositionRecordDropZone();
    });
    
    jDnd(Ext.getBody()).resize(function()
    {
        dadPositionRecordDropZone();
    });

    // ===========================================================================================
    // re-position the drop zone on don changed like when the timeline is
    // collapsed or expanded
    // ===========================================================================================
    // this is to make sure the drop zone is in position after the page loads
    // since it is possible that
    // other scripts like the transaction timeline will insert html at the
    // elements before the drop zone
    dadGlobal.isDOMSubtreeModified = false;
    jDnd(document).bind('DOMSubtreeModified', function()
    {
        dadGlobal.isDOMSubtreeModified = true;
    });

    jDnd('body').click(function(e)
    {
        if (dadHasValue(dadGlobal.folderTooltip) && (e.target.id !== 'dadRecordDropZone'))
        {
            dadGlobal.folderTooltip.hide();
        }
    });

    // then check every 3 seconds if the DOMSubtreeModified was modified
    setInterval(function()
    {
        // var logger = new dadobjLogger('Check
        // dadGlobal.isDOMSubtreeModified');
        if (dadGlobal.isDOMSubtreeModified)
        {
            dadPositionRecordDropZone();
            dadGlobal.isDOMSubtreeModified = false;
        }
    }, 3000);
    // end
    // ============================================================================================
}





function isBrowserSupported() {

	if (Ext.isChrome || Ext.isGecko) {
		return true;
	}

	var userAgent = window.navigator.userAgent;
	if (Ext.isSafari) {
		var startIndex = userAgent.indexOf('Version/') + 8; // 8 is the length of Version/
		var endIndex = userAgent.indexOf(' ', startIndex); //Look for the space after the version number
		var versionNo = parseFloat(userAgent.substring(startIndex, endIndex));
		if (versionNo >= MIN_SUPPORTED_SAFARI_VERSION) {
			return true;
		}
		return false;
	}
	
	if (Ext.isIE) {
		var startIndex = userAgent.indexOf('MSIE ') + 5; // 5 is the length of MSIE<space> 
		var endIndex = userAgent.indexOf(';', startIndex); //Look for the space after the version number
		var versionNo = parseFloat(userAgent.substring(startIndex, endIndex));
		if (versionNo >= MIN_SUPPORTED_IE_VERSION) {
			return true;
		}
		return false;
		
	}
}

/**
 * Adds trim functions if browser has no support
 */
function dadAddTrimFunctions() {
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





/**
 * hides the folder picker
 */
function dadCloseFolderPicker() {
    Ext.get('dadTreeContainer').hide();
    dadGlobal.tree.hide();
}

/**
 * Returns the list of folders the current user has access to. Object keys are
 * id, text, parent, leaf and iconCls Note that right now, only around 2,000
 * folders are supported.
 * 
 * @return {Objects[]}
 */
function dadGetFolders() {
    var logger = new dadobjLogger(arguments);
    // get first the root folders
    // TODO: Handle more than 2,000 folders
    var filters = [];
    filters.push([ 'parent', 'is', '@NONE@' ]);
    filters.push('and');
    filters.push([ 'isinactive', 'is', 'F' ]);
    var columns = [];
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('parent'));
    columns[0].setSort();
    var results = nlapiSearchRecord('folder', null, filters, columns);
    var folders = {};
    folders.root = [];
    folders.subfolders = [];
    var rootIds = [];
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var folder = {
            id : result.getId(),
            text : result.getValue('name'),
            parent : result.getValue('parent'),
            leaf : true,
            iconCls : 'dadNoIcon'
        };

        rootIds.push(result.getId());
        folders.root.push(folder);
    }

    // Get at most 1000 children for performance reasons
    filters = [];
    filters.push([ 'isinactive', 'is', 'F' ]);

    columns = [];
    columns.push(new nlobjSearchColumn('internalid'));
    columns[0].setSort();
    columns.push(new nlobjSearchColumn('name'));
    columns.push(new nlobjSearchColumn('parent'));
    results = nlapiSearchRecord('folder', null, filters, columns);
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        folder = {
            id : result.getId(),
            text : result.getValue('name'),
            parent : result.getValue('parent'),
            leaf : true
        };

        folders.subfolders.push(folder);
    }
    logger.end();
    return folders;
}





/**
 * Returns true if the record has file subtab and among the supported record
 * types.
 */
function dadShouldShowDropZone() {
    var logger = new dadobjLogger(arguments);
    var show = false;
    var recordType = nlapiGetRecordType();
    var supportedRecordTypes = [ 'downloaditem', 'assemblyitem', 'lotnumberedassemblyitem', 'serializedassemblyitem' ];
    if (supportedRecordTypes.indexOf(recordType) > 0) {
        show = true;
    } else if (dadHasValue(Ext.get('medialnk')) || dadHasValue(Ext.get('mediaitemlnk')) || dadHasValue(Ext.get('mediaitem_pane_hd'))) {
        show = true;
    }

    logger.log('show=' + show);
    return show;
}

/**
 * Displays the what new help tooltip
 */
function dadWhatsNewHelp() {
    var logger = new dadobjLogger(arguments);
    try {
        if (dadGlobal.paramUserPref.suppressTutorial == 'T') {
            return;
        }
        var item = 'overview';
        dadSpotlight(null, item);
    } catch (e) {
        dadHandleError(e);
    }
    logger.end();
}

/**
 * Shows the in-app help
 */
function dadHelp() {
    if (dadHasValue(dadGlobal.folderTooltip)) {
        dadGlobal.folderTooltip.hide();
    }

    dadHideHelp();

    var helpkey = 'overview';
    dadSpotlight(null, helpkey);
    return;
}

/**
 * The spotlight effect used in the in-app help
 * 
 * @param {Object}
 *        e
 * @param {Object}
 *        helpKey
 */
function dadSpotlight(e, helpKey) {
    var logger = new dadobjLogger(arguments);
    e = e || window.event;
    if (dadHasNoValue(helpKey)) {
        dadHideHelp();
        return false;
    }
    var title = '';
    var helpText = '';
    var anchor = 'top';
    var nextHelpKey = '';
    switch (helpKey) {
    case 'overview':
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;File Drag and Drop Overview</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'The File Drag and Drop SuiteApp enables you to conveniently upload single or multiple files from your computer to a record page. You can also attach multiple files directly to text fields or to editable sublists of supported record types, including custom records.';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'The maximum file size is 10MB.';
        helpText += '<br>';
        helpText += '<br>';
        helpText += "Click <a href='/app/help/helpcenter.nl?topic=DOC_FileDragAndDrop' target='_blank' class='dottedlink'>here</a> to view the help.";
        
        
        nextHelpKey = 'viewmodepref';
        break;
    case 'viewmodepref' :
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;Drop Zone</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'The File Drag and Drop feature can be enabled/disabled in view mode for the account through Setup > Company > General Prefernces > Custom Preferences.';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'It can also be enabled/disabled per user through Home > Set Preferences > Custom Preferences.';
        nextHelpKey = 'dadDropzone';
        break;
    case 'dadDropzone':
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;Drop Zone</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'Drag and drop files to the drop zone to upload multiple files simultaneously.';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'Click the drop zone to view additional options or to see your upload progress. To view the files attached to the record page, click the File Attachment icon on the drop zone. This opens the Files subtab on the record page.';
        nextHelpKey = 'dadTextFields';
        break;
    case 'dadTextFields':
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;Attach Files to Text Fields</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'You can also drag and drop files to a specific text field. Uploaded files will be attached to the record, and a link to the file will be available on the text field.';
        nextHelpKey = 'dadLineItems';
        dadShowTextFieldBox();
        break;
    case 'dadLineItems':
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;Attach Files to Line Items</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'You can also drag and drop files to line items. Before attaching a file to a line item that you have added, save the record first, and then open it in edit mode.';
        nextHelpKey = 'end';
        dadShowLineItemBox();
        break;
    case 'end':
        Ext.Msg.hide();
        helpText = '<b><img class="dadImgTooltipHelp" src="">&nbsp;&nbsp;End of Tutorial</b>';
        helpText += '<br>';
        helpText += '<br>';
        helpText += 'You can now start using File Drag and Drop.';
        break;
    default:
        break;
    }
    var el = dadGetHelpElementId(helpKey);

    helpText += '<br><br>';

    if (dadHasValue(helpText)) {
        dadHideHelp();
        helpText = '<div id="dadHelptext">' + helpText + '</div>';
        dadSetHelp(el, title, helpText, anchor);
    }

    jDnd('#dadHelptext').append(jDnd('#dadTooltipbuttons').clone());
    if (dadHasValue(Ext.select('#dadHelptext #dadTooltipbuttons'))) {
        Ext.select('#dadHelptext #dadTooltipbuttons').show();
        Ext.select('#dadHelptext #dadTooltipbuttons #dadbtnNext').on('click', function() {
            return dadSpotlight(e, nextHelpKey);
        });

        if (helpKey == 'end') {
            Ext.select('#dadHelptext #dadTooltipbuttons #tbl_dadbtnNext').remove();
        }
    }
    dadApplyCSSToFolderTooltip();

    dadGlobal.spot = dadGetSpot();
    if (Ext.get(el) !== null) {
        if (Ext.get(el).getWidth() === 0) {
            // hidden
        } else {
            dadGlobal.lastHelpEl = el;
            dadGlobal.spot.show(dadGlobal.lastHelpEl);
        }
    }
    if (e) {
        dadStopPropagation(e);
    }
    logger.log('end');
    return false;
}

function dadGetHelpElementId(helpKey) {
    var el;
    switch (helpKey) {
    case 'overview':
        el = 'dadRecordDropZone';
        break;
    case 'viewmodepref':
    	el = 'dadRecordDropZone';
        break;
    case 'dadDropzone':
        el = 'dadRecordDropZone';
        break;
    case 'dadLineItems':
        el = 'dadLineItemBox';
        break;
    case 'dadTextFields':
        el = 'dadTextFieldBox';
        break;
    case 'end':
        el = 'dadRecordDropZone';
        break;
    default:
        return helpKey;
    }
    return el;
}

function dadSuppressTutorial() {
    var logger = new dadobjLogger(arguments);
    dadSpotlight(undefined, '');
    uiShowInfo('To display the File Drag and Drop tutorial again, click Tutorial from the Drop zone');
    dadSuiteletProcessAsyncUser('suppressTutorial', 'any', function(isOK) {
        logger.log('isOK=' + isOK);
        if (isOK != 'ok') {
            uiShowError('error in suppressTutorial');
            return;
        }
    });
}





function _GetImageUrl(fileName)
{
    var sr = nlapiSearchRecord('file', null, ['name', 'is', fileName]);
    
    return sr == null ? undefined: nlapiResolveURL('mediaitem', sr[0].getId());
}





function dadShowTextFieldBox()
{
    var imageURL = _GetImageUrl('dad-image-textfield.png');
    
    var msg = '<html><div id="dadTextFieldBox"><img width="440px" height="140px" src=' + imageURL + '></html>';
    Ext.Msg.show({
        title: 'Text Field',
        msg: msg,
        minWidth: 500
    });

    Ext.select('.x-window-body').setStyle({
        'height': '150px'
    });

    Ext.select('.x-window-mc').setStyle({
        'background-color': 'white'
    });

    Ext.select('.x-shadow').setStyle({
        'height': '160px'
    });

    Ext.select('.x-window-bl').setStyle({
        'background-color': 'white'
    });
    
    return false;
}





function dadShowLineItemBox()
{
    var imageURL = _GetImageUrl('dad-image-lineitem-142.png');

    var msg = '<html><div id="dadLineItemBox"><img width="680px" height="140px" src=' + imageURL + '></html>';
    Ext.Msg.show({
        title: 'Line Item',
        msg: msg,
        minWidth: 700
    });

    Ext.select('.x-window-body').setStyle({
        'height': '150px'
    });

    Ext.select('.x-window-mc').setStyle({
        'background-color': 'white'
    });

    Ext.select('.x-shadow').setStyle({
        'height': '160px'
    });

    Ext.select('.x-window-bl').setStyle({
        'background-color': 'white'
    });
    
    return false;
}





function dadGetFolderLocation()
{
    return _GetImageUrl("dad-dropzone-folder.png");
}





function dadApplyCSSToFolderTooltip() {

    Ext.select('.x-tip-body').setStyle({
        'padding' : '20px 20px 20px 20px',
        'font-size' : '13px',
        'color' : '#545454',
        'font-family' : 'Open Sans,Helvetica,sans-serif',
        'border-bottom-style' : 'none',
        'border-radius' : '0px',
        'background-color' : '#f0f0f0',
        'width' : 'auto'
    });

    Ext.select('.x-tip-mc').setStyle({
        'background-color' : '#f0f0f0',
        'box-shadow' : 'rgba(0, 0, 0, 0.6) 0px 2px 4px'
    });

    Ext.select('.x-tip-body hr').setStyle({
        'height' : '2px',
        'border-color' : 'rgba(235, 235, 235, 0.5)',
        'margin' : '6px 0 7px 0'
    });

    Ext.select('.dottedlink').setStyle({
        'color' : '#336699',
        'border-bottom-style' : 'none'

    });

    Ext.select('.dottedlink').on('mouseover', function(e) {
        Ext.get(e.target.id).setStyle({
            'border-bottom-style' : 'solid',
            'border-bottom-color' : '#336699'
        });
    });

    Ext.select('.dottedlink').on('mouseout', function(e) {
        var d = Ext.get(e.target.id);
        if (!d) {
            return;
        }
        d.setStyle({
            'border-bottom-style' : 'none'
        });
    });

    Ext.select('.dadCancelLink').on('mouseover', function(e) {
        Ext.get(e.target.id).setStyle({
            'border-bottom-style' : 'solid',
            'border-bottom-color' : '#336699'
        });
    });

    Ext.select('.dadCancelLink').on('mouseout', function(e) {
        Ext.get(e.target.id).setStyle({
            'border-bottom-style' : 'none'
        });
    });

    Ext.select('.x-tip-bl').hide();

    if (dadHasValue(Ext.select('.dadImgTooltipHelp'))) {
        Ext.select('.dadImgTooltipHelp').set({
            'src' : dadGlobal.TOOLTIP_HELP_ICON,
            'style' : {
                'vertical-align' : 'middle'
            }
        });
    }
}

/**
 * Sets the value of user preference suppress tutorial.
 */
function dadSetSuppressTutorial() {
    var logger = new dadobjLogger(arguments);

    // Seems we have to manually set the checked state of checkbox
    var jCheckBox = jDnd('#dadNotifChkboxDontShow');
    if (dadGlobal.paramUserPref.suppressTutorial == 'F') {
        dadGlobal.paramUserPref.suppressTutorial = 'T';
        jCheckBox.attr('checked', 'checked');
    } else {
        dadGlobal.paramUserPref.suppressTutorial = 'F';
        jCheckBox.removeAttr('checked');
    }

    var values = {};
    values.suppress = dadGlobal.paramUserPref.suppressTutorial;

    logger.log('values=' + JSON.stringify(values));
    dadSuiteletProcessAsyncUser('setSuppressTutorial', values, function(dataout) {
        logger.log('setSuppressTutorial = ' + JSON.stringify(dataout));
    });
}

/**
 * Gets the number of files attached to the record.
 */
function dadGetFilesCount() {
    var count = 0;

    // get current record info
    var recId = nlapiGetRecordId();
    var recType = nlapiGetRecordType();
    
    // if recId has no value, then it's a new record
    if (dadHasNoValue(recId)) {
        return count;
    }
    
    var filters = [ [ 'internalid', 'is', recId ] ];
    var columns = [];
    columns.push(new nlobjSearchColumn('internalid', null, 'group'));
    columns.push(new nlobjSearchColumn('name', 'file', 'count'));
    var results = nlapiSearchRecord(recType, null, filters, columns);
    if (dadHasValue(results)) {
        count = parseInt(results[0].getValue('name', 'file', 'count'));
    }
    return count;
}

/**
 * Shows the Files tab like clicking through Communication tab, then Files tab,
 * and scrolling up to it.
 */
function dadShowFilesTab() {
    // get all subtabs
    var tabs = jQuery('.uir-table-block.uir_form_tab_container > tbody > tr > td > table > tbody > tr > td > a');
    if (tabs != null) {
        if (tabs.length == 0) {
            Ext.Msg.hide();
            return;
        }
        
        // loop through subtabs
        var isCommTabFound = false;
        for (var i = 0; i < tabs.length; i++) {
            var jTab = jQuery(tabs[i]);
            // check if Communication tab
            if (jTab.text().toLowerCase() == 'communication') {
                // found comm tab
                isCommTabFound = true;
                var commTabSelector = '#' + jTab.attr('id');
                console.log('found Communication tab: ' + commTabSelector);

                // click on comm tab
                jQuery(commTabSelector).click();

                // add delay
                setTimeout(function() {
                    // click Files tab
                    var filesTabSelector = '#mediaitemtxt';
                    jQuery(filesTabSelector).click();
                    console.log('shown Files tab');

                    // scroll up
                    jQuery('html, body').animate({
                        scrollTop : jQuery(filesTabSelector).offset().top
                    }, 500);
                    
                    Ext.Msg.hide();
                }, 2000);

                break;
            }
        }
        if (!isCommTabFound) {
            Ext.Msg.hide();
        }
    } else {
        Ext.Msg.hide();
    }
}




(function(root) { "use strict"; var css = ".nanobar{width:100%;height:4px;z-index:9999;top:0}.bar{width:0;height:100%;transition:height .3s;background:#000}"; function addCss() { var s = document.getElementById("nanobarcss"); if (s === null) { s = document.createElement("style"); s.type = "text/css"; s.id = "nanobarcss"; document.head.insertBefore(s, document.head.firstChild); if (!s.styleSheet) return s.appendChild(document.createTextNode(css)); s.styleSheet.cssText = css } } function addClass(el, cls) { if (el.classList) el.classList.add(cls); else el.className += " " + cls } function createBar(rm) { var el = document.createElement("div"), width = 0, here = 0, on = 0, bar = { el: el, go: go }; addClass(el, "bar"); function move() { var dist = width - here; if (dist < .1 && dist > -.1) { place(here); on = 0; if (width === 100) { el.style.height = 0; setTimeout(function() { rm(el) }, 300) } } else { place(width - dist / 4); setTimeout(go, 16) } } function place(num) { width = num; el.style.width = width + "%" } function go(num) { if (num >= 0) { here = num; if (!on) { on = 1; move() } } else if (on) { move() } } return bar } function Nanobar(opts) { opts = opts || {}; var el = document.createElement("div"), applyGo, nanobar = { el: el, go: function(p) { applyGo(p); if (p === 100) { init() } } }; function rm(child) { el.removeChild(child) } function init() { var bar = createBar(rm); el.appendChild(bar.el); applyGo = bar.go } addCss(); addClass(el, "nanobar"); if (opts.id) el.id = opts.id; if (opts.classname) addClass(el, opts.classname); if (opts.target) { el.style.position = "relative"; opts.target.insertBefore(el, opts.target.firstChild) } else { el.style.position = "fixed"; document.getElementsByTagName("body")[0].appendChild(el) } init(); return nanobar } if (typeof exports === "object") { module.exports = Nanobar } else if (typeof define === "function" && define.amd) { define([], function() { return Nanobar }) } else { root.Nanobar = Nanobar } })(this);





var _NanoBar = {
    //    var style = document.createElement('style');
    //    style.type = 'text/css';
    //    style.innerHTML = '.nanoClass { position: relative; z-index: 99999; float:right; }';
    //    document.getElementsByTagName('head')[0].appendChild(style);

    _instances: {},

    Create: function _Create(actionId, target)
    {
        if (actionId === null || actionId === undefined || actionId == "")
        {
            return;
        }

        var options = {
            //classname: "nanoness",
            id: "npb_" + actionId,
            //target: target.type === undefined ? target.parentElement.firstChild : target.parentElement
            target: target.type === undefined ? target.firstChild : target.parentElement
        };

        _NanoBar._instances[actionId] = new Nanobar(options);
        _NanoBar._instances[actionId].Uploads = {};
        _NanoBar._instances[actionId].go(1);
    },

    Update: function _Update(uploadId)
    {
        if (actionId in _NanoBar._instances)
        {
            if (_NanoBar._instances[actionId].el.firstChild.style.width != "")
            {
                _NanoBar._instances[actionId].go(percent);
            }
        }
    },

    Finish: function _Finish(uploadId)
    {
        var logger = new dadobjLogger(arguments);

        for (var i in _NanoBar._instances)
        {
            var nb = _NanoBar._instances[i];
            if (nb == null)  //Cancelled?
            {
                return;
            }

            if (uploadId in nb.Uploads)
            {
                //Delete uploadId object
                delete nb.Uploads[uploadId];
                nb.Uploads[uploadId] = undefined;

                if (JSON.stringify({}) === JSON.stringify(nb.Uploads[uploadId]))  //No more uploadIds?
                {
                    //Complete progress bar
                    if (nb.el.firstChild.style.width != "")
                    {
                        nb.go(percent);
                    }

                    //Remove html element
                    var el = document.getElementById("npb_" + i);
                    if (el)
                    {
                        el.parentElement.removeChild(el);
                    }

                    //Complete nanobar instance
                    delete nb;
                    _NanoBar._instances[i] = undefined;
                }

                break;
            }
        }
    },

    AddUploadId: function _AddUploadId(actionId, uploadId)
    {
        if (actionId in _NanoBar._instances)
        {
            var nb = _NanoBar._instances[actionId];

            if (!(uploadId in nb.Uploads))
            {
                nb.Uploads[uploadId] = { Loaded: 0, Size: 0 };
            }
        }
    },

    AddProgress: function _AddProgress(uploadId, loaded, fileSize)
    {
        var logger = new dadobjLogger(arguments);


        for (var i in _NanoBar._instances)
        {
            var nb = _NanoBar._instances[i];
            if (nb == null)  //Cancelled?
            {
                continue;
            }

            if (uploadId in nb.Uploads)
            {
                nb.Uploads[uploadId].Loaded = loaded;
                nb.Uploads[uploadId].Size = fileSize;


                var totalLoaded = 0;
                var totalSize = 0;
                for (var j in nb.Uploads)
                {
                    if (nb.Uploads[j] == null)
                    {
                        continue;
                    }

                    totalLoaded += nb.Uploads[j].Loaded;
                    totalSize += nb.Uploads[j].Size;
                }

                var percent = totalSize == 0 ? 0 : (totalLoaded / totalSize) > 1 ? 100 : 100 * (totalLoaded / totalSize);

                if (nb.el.firstChild.style.width != "")
                {
                    nb.go(percent);

                    if (percent == 100)
                    {
                        //Remove html element
                        var el = document.getElementById("npb_" + i);
                        if (el)
                        {
                            el.parentElement.removeChild(el);
                        }
                    }
                }

                break;
            }
        }
    },

    CancelAction: function _Cancel(actionId)
    {
        if (actionId in _NanoBar._instances)
        {
            var nb = _NanoBar._instances[actionId];

            //Remove html element
            var el = document.getElementById("npb_" + actionId);
            if (el)
            {
                el.parentElement.removeChild(el);
            }

            //Delete nanobar
            delete nb;
            _NanoBar._instances[actionId] = undefined;
        }
    }
};
