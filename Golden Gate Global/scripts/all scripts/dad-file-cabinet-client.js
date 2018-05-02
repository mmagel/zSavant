/** * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.  */
/** * Module Description *  * Version Date Author Remarks 1.00 22 Apr 2014 jvelasquez *  */
var dadGlobal = dadGlobal || {};
dadGlobal.CREATE_PERMISSION = 2;
dadGlobal.filesInWaiting = [];    // files dropped will be placed here if the number of used connections is already. Sample item format: {key: file} where
dadGlobal.filesInWaitingKey = 0;  // This will be incremented every time a file is added in dadGlobal.filesInWaiting. This will be used as key of the hash
dadGlobal.folderFullName = 'Getting full folder name ...';
dadGlobal.browserSupported = true;
dadGlobal.filesBeingUploaded = 0;
dadGlobal.filesBeingUploadedBatch = 0;
dadGlobal.batchSize = 0;
dadGlobal.xmlRequests = [];  // one xmlRequest instance is used for each file
dadGlobal.uploadId = 0;  // this is used as current index for dadGlobal.xmlRequests
dadGlobal.currentUploadHash = {};  // holds the current uploads where each active upload is one property. The key is the upload id.
dadGlobal.dadIsDragEnter = false;  // flag if drag enter is triggered and drag exit is not yet triggered
dadGlobal.folderFullName = '';

var MIN_SUPPORTED_SAFARI_VERSION = 6.0;var MIN_SUPPORTED_IE_VERSION = 11.0;



setInterval(function()
{
    // and hide header of the netsuite page (advanced add)
    dadHideHeaderInFolderPicker();
}, 1000);



// continuously get the selected folder
setInterval(function()
{
    if (Ext.isIE)
    {
        getSelectedFolderForIE();
    }
    else
    {
        var folderName = jDnd('#dadFileCabinet').contents().find("#div__medialisthdr .uir-rightpaneentryform-header").text();
        if (dadHasNoValue(folderName))
        {
            folderName = 'none';
        }
        Ext.get('folderinfo').update(folderName);
        Ext.get('dndToolbar').hide();

        var markAllLink = jDnd('#dadFileCabinet').contents().find('#markall');
        if (markAllLink.length > 0)
        {
            jDnd('#dadFileCabinet').contents().find('.uir_control_bar').show();
        }

        var folderid = jQuery('#dadFileCabinet').contents().find("#folder").val();
        if (dadHasNoValue(folderid))
        {
            return;
        }
        dadGlobal.folderId = folderid;
    }
}, 1000);



// set the nav_tree
setInterval(function()
{

    // Issue: 297853 [DnD] New 14.2 UI: Folder tree does not expand inside
    // DnD e
    // get the variable nav_tree of the iframe and assign it as to variable
    // nav_tree of the parent page, we got nav_tree from the error message
    var iframeNavTree = jDnd('#dadFileCabinet').get(0).contentWindow.nav_tree;
    if (iframeNavTree)
    {
        nav_tree = iframeNavTree;
    }
}, 1000);



dadAddTrimFunctions();


Ext.onReady(function()
{
    dadPageInit();
});









function dadUploadFile(file, folderId, header, textBox, subListId, lineId)
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
    // dadGlobal.batchSize = dadGlobal.batchSize + file.size;

    // include other info
    var vFD = new FormData();
    vFD.append('file', file);
    // vFD.append('recordtype', null);
    // vFD.append('recordid', null);
    vFD.append('folderId', folderId);

    // if (header === null && textBox === null) {
    // vFD.append('subListId', subListId);
    // vFD.append('lineid', lineId);
    // } else {
    // vFD.append('subListId', '');
    // vFD.append('lineid', '');
    // if (dadHasValue(textBox)) {
    // vFD.append('textboxid', textBox.getAttribute('id'));
    // }
    // }

    xmlRequests.push(new XMLHttpRequest());
    // oXHR.upload.addEventListener('progress', uploadProgress, false);
    // oXHR.addEventListener('load', uploadFinish, false);
    // oXHR.addEventListener('error', uploadError, false);
    // oXHR.addEventListener('abort', uploadAbort, false);

    var uploadId = dadGlobal.uploadId;
    logger.log('uploadId=' + uploadId);
    logger.log('xmlRequests.length=' + xmlRequests.length);

    xmlRequests[uploadId].uploadId = uploadId;
    xmlRequests[uploadId].fileName = file.name;
    xmlRequests[uploadId].open('POST', url, true /* async */);
    xmlRequests[uploadId].onreadystatechange = function()
    {

        logger.log('this.readyState=' + this.readyState);
        logger.log('this.status=' + this.status);

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

            // Issue 310395 : [DnD] File Cabinet > File Cabinet iframe does not
            // refresh after uploading
            // Fix : This will refresh iframe per successful upload
            Ext.get('dadFileCabinet').dom.src = "/app/common/media/mediaitemfolders.nl?folder=" + dadGlobal.folderId + "&ifrmcntnr=T&" + (new Date());

            dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) - 1;

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
    dadGlobal.currentUploadHash[uploadId].startGetTime = null; // (new
    // Date()).getTime();
    dadGlobal.currentUploadHash[uploadId].uploadId = uploadId;
    xmlRequests[uploadId].send(vFD);
    if (dadHasNoValue(dadGlobal.dadShowUploadProgress))
    {
        dadGlobal.dadShowUploadProgress = setInterval('dadShowUploadProgress();', 1000);
    }

    dadGlobal.uploadId = uploadId + 1;
}



/** * Uploads the next file in the waiting list */
function dadProcessNextWaitingFile()
{
    if (dadGlobal.filesInWaiting.length === 0)
    {
        // no more files in waiting
        return;
    }

    if (dadGetUploadingCount() >= dadGlobal.MAXIMUM_PARALLEL_UPLOADS)
    {
        // still more pending uploads
        return;
    }

    var item = dadGlobal.filesInWaiting.shift();
    dadUploadFile(item.file, item.folderId, item.header, item.textBox, item.subListId, item.lineId);
}

/** * Cancels a file upload in waiting *  * @param evt * @param {string} *        key */
function dadAbortInWaiting(evt, key)
{
    for (var i = 0; i < dadGlobal.filesInWaiting.length; i++)
    {
        var item = dadGlobal.filesInWaiting[i];
        if (key == item.key)
        {
            dadGlobal.filesInWaiting.splice(i, 1);
        }
    }
    
    dadShowUploadProgress();
    dadStopPropagation(evt);

    return false;
}





function dadShowFolderInIframe(folderId)
{
    Ext.get('dadFileCabinet').dom.src = "/app/common/media/mediaitemfolders.nl?folder=" + folderId + "&ifrmcntnr=T&" + (new Date());
}




function getSelectedFolderForIE()
{

    var frameJQuery = getFrameJQuery();

    if (frameJQuery != undefined)
    {

        var folderName = frameJQuery("#div__medialisthdr .uir-rightpaneentryform-header").text();
        if (dadHasNoValue(folderName))
        {
            folderName = 'none';
        }
        Ext.get('folderinfo').update(folderName);
        Ext.get('dndToolbar').hide();

        var markAllLink = frameJQuery('#markall');
        if (markAllLink.length > 0)
        {
            frameJQuery('.uir_control_bar').show();
        }

        var folderid = frameJQuery("#folder").val();
        if (dadHasNoValue(folderid))
        {
            return;
        }
        dadGlobal.folderId = folderid;
    }
}



/** * Adds a event handler for beforeunload event. The handler prompts a warning * when leaving page while files are being uploaded. */
function dadAddBeforeUnloadEventHandler()
{
    window.addEventListener('beforeunload', function(e)
    {
        try
        {
            // get number of pending uploads
            var currentUploadHash = dadGlobal.currentUploadHash;
            var pendingUploadsCount = Object.keys(currentUploadHash).length;
            if (pendingUploadsCount > 0)
            {
                // display prompt to whether to stay or navigate
                // away from page
                // to user
                // When a non-empty string is assigned to the
                // returnValue Event
                // property, a dialog box appears,
                // asking the users for confirmation to leave
                // the page.
                // When no value is provided, the event is
                // processed silently.

                // from:
                // https://developer.mozilla.org/en-US/docs/Web/Reference/Events/beforeunload
                // For some reasons, Webkit-based browsers don't
                // follow the spec
                // for the dialog box. An almost cross-working
                // example would be
                // close from the below example.
                var confirmationMessage = "You have an upload in progress. Leaving the page will cancel the upload.\n\nThis page is asking you to confirm that you want to leave - data you have entered may not be saved.";
                e = e || window.event;
                e.returnValue = confirmationMessage; // Gecko
                // + IE
                if (Ext.isChrome || Ext.isSafari)
                {
                    return confirmationMessage; // Webkit,
                    // Safari,
                    // Chrome etc.
                }
            }
        } catch (e)
        {
            // ignore error since we do not know what happens
            // when an error
            // occurs on this event
        }
    }, false);
}



/** * Sets the text/html of the status *  * @param {Object} *        status */
function dadSetStatus(status)
{
    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadDropZoneBackgroundStatus').update(status);
}


/** * Actions to take when a file is dropped into the richtext editor *  * @param {Object} *        evt */
function dadFileDrop(evt)
{
    dadWait();
    try
    {
        var logger = new dadobjLogger(arguments);
        dadGlobal.dadIsDragEnter = false;
        evt = evt || window.event;
        Ext.Msg.hide();
        Ext.get('dadInfo').hide();
        var e = evt || window.event;
        var target = e.target || e.srcElement;
        var header = null;

        if (target.id == 'dadDropZone')
        {
            header = target;
            Ext.get('dadDropZoneBackground').setStyle('backgroundColor', 'transparent');
        }

        var folderName = jDnd('#folderinfo').text();
        if (folderName === 'none')
        {
            Ext.MessageBox.show({
                title: dadGlobal.TITLE,
                msg: 'Please select a folder destination',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING
            });
            return dadStopPropagation(evt);
        }

        var files = evt.dataTransfer.files;
        var count = files.length;
        if (count === 0)
        {
            logger.log('no files');
            return dadStopPropagation(evt);
        }

        var isFolderInactive = nlapiLookupField('folder', dadGlobal.folderId, 'isinactive');
        if (isFolderInactive === 'T')
        {
            dadGlobal.folderId = null;
            uiShowWarning('You are uploading to an inactive folder. Please select a different folder.', dadGlobal.TITLE, function()
            {
            });
            return dadStopPropagation(evt);
        }

        // check if there are existing files
        var fileNames = [];        var fileObjects = [];
        for (var i = 0; i < count; i++)
        {
            var file = files[i];
            logger.log('file=' + JSON.stringify(file));
            logger.log('file.name=' + file.name);
            fileNames.push(file.name);            fileObjects.push(file);

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
        // check if file object is file or folder        dadCheckIsFileOrFolder();                function dadCheckIsFileOrFolder() {            // check remaining from array            if (fileObjects.length == 0) {                // if no more, then proceed                dadCheckExistingFiles();                return;            }                        // get a file object (first element from the array)            var file = fileObjects.shift();            // check if file object is a folder            var reader = new FileReader();            reader.onload = function(e) {                // it's a file; call same function to check next element                dadCheckIsFileOrFolder();            };            reader.onerror = function(e) {                // it's a folder                Ext.MessageBox.show({                    title: dadGlobal.TITLE,                    msg: 'You cannot upload a folder through File Drag and Drop.',                    buttons: Ext.MessageBox.OK,                    icon: Ext.MessageBox.WARNING                });                return dadStopPropagation(evt);            };            reader.readAsText(file);        }        function dadCheckExistingFiles() {            var param = {};            // param.scriptId = nlapiGetRecordType();            param.fileNames = fileNames;            param.folderId = dadGlobal.folderId;            logger.log('fileNames=' + JSON.stringify(fileNames));            dadSetStatus('Checking existing files...');            dadSuiteletProcessAsync('getExistingFiles', param, function(existingFileNames)            {                logger.log('existingFileNames=' + JSON.stringify(existingFileNames));                if (existingFileNames.length === 0)                {                    // no existing files                    jDnd('#dadDropZoneBackground').effect('highlight', {}, 3000);                    dadUploadNow();                    return dadStopPropagation(evt);                }                // there are existing files                Ext.get('dadInfo').update('Existing files found.');                var fileNamesStr = '';                for (var f = 0; f < existingFileNames.length; f++)                {                    fileNamesStr = fileNamesStr + '<br>' + existingFileNames[f];                }                var question = existingFileNames.length > 1 ? 'The following existing files will be overwritten: ' : 'This existing file will be overwritten: ';                question = question + fileNamesStr + '.<br><br>Continue?';                Ext.MessageBox.confirm(dadGlobal.TITLE, question, function(btn)                {                    if (btn == 'no')                    {                        Ext.get('dadInfo').hide();                        dadResetStatus();                        uiShowInfo('No files were copied.');                        return dadStopPropagation(evt);                    }                    jDnd('#dadDropZoneBackground').effect('highlight', {}, 3000);                    dadUploadNow();                });            });        }        
    }
    catch (e)
    {
        // TODO: handle exception
        alert(e.toString());
        return dadStopPropagation(evt);
    }

    return dadStopPropagation(evt);
    
    

    function dadUploadNow()
    {

        var logger = new dadobjLogger(arguments, false);
        logger.log('count=' + count);

        dadGlobal.filesBeingUploaded = parseInt(dadGlobal.filesBeingUploaded, 10) + count;
        var status = 'Uploading ' + dadGlobal.filesBeingUploaded + ' file' + (dadGlobal.filesBeingUploaded == 1 ? '' : 's') + '...';
        Ext.get("dadInfo").update(status);
        dadSetStatus(status);

        if (dadHasNoValue(dadGlobal.url))
        {
            dadGlobal.url = nlapiResolveURL('SUITELET', 'customscript_dad_user_service_sl', 'customdeploy_dad_user_service_sl');
        }

        for (var i = 0; i < count; i++)
        {
            var file = files[i];
            dadUploadFile(file, dadGlobal.folderId, null, null, null, null);
        }
        // show detailed progress
        // dadShowFolderMenu();
    }
}





function dadShowUploadProgress()
{
    var logger = new dadobjLogger(arguments, false);
    // if (dadGlobal.dadIsDragEnter) {
    // logger.log('dadGlobal.dadIsDragEnter=' + dadGlobal.dadIsDragEnter);
    // return;
    // }

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
        clearInterval(dadGlobal.dadShowUploadProgress);
        delete dadGlobal.dadShowUploadProgress;
        if (dadGlobal.folderTooltip)
        {
            dadGlobal.folderTooltip.syncSize();
        }

        if (dadGlobal.isMultipleFiles)
        {
            dadSetStatus('Your files have been uploaded successfully.');
            dadGlobal.isMultipleFiles = false;
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
        // logger.log('o.fileSize=' + o.fileSize);
        totalBytesSize = totalBytesSize + o.fileSize;
        logger.log('o.loaded=' + o.loaded);
        if (o.loaded === 0)
        {
            // do not include yet in computation of seconds remaining since it
            // will result in infinity seconds
            continue;
        }
        totalBytesRemain = totalBytesRemain + (o.fileSize - o.loaded);
        if (dadHasNoValue(o.startGetTime))
        {
            o.startGetTime = (new Date()).getTime();
        }

        var secondsElapsed = (currentGetTime - o.startGetTime) / 1000;
        logger.log('secondsElapsed=' + secondsElapsed);
        var bytesPerSecond = o.loaded / secondsElapsed;
        logger.log('bytesPerSecond=' + bytesPerSecond);
        logger.log('o.fileSize - o.loaded=' + (o.fileSize - o.loaded));
        var secondsRemaining = (o.fileSize - o.loaded) / bytesPerSecond;
        logger.log('secondsRemaining=' + secondsRemaining);
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
    // add the longest seconds remaining and the estimated time for the largest
    // file in queue
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
    // var completed = parseInt(100 * (dadGlobal.filesBeingUploadedBatch -
    // pendingUploadsCount) / dadGlobal.filesBeingUploadedBatch);
    if (completed > 100)
    {
        completed = 100;
    }
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

    // var fullWidth = Ext.get('dadDropZone').getWidth() - 30;
    var fullWidth = Ext.get('dadDropZone').getWidth();

    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadDropZoneBackgroundStatus').update(status);
    // logger.log('completed=' + completed + '; dadGlobal.batchSize=' +
    // dadGlobal.batchSize / 1000000 + '; totalBytesRemain=' + totalBytesRemain
    // / 1000000);
    var width = fullWidth * completed / 100;
    if (width > fullWidth)
    {
        width = fullWidth;
    }
    var xBar = Ext.get('dadDropZoneBackgroundBar');
    xBar.show();
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
    for (var p in currentUploadHash)
    {
        var o = currentUploadHash[p];
        logger.log('o=' + JSON.stringify(o));
        logger.log('o.fileSize=' + o.fileSize);
        totalBytesSize = totalBytesSize + o.fileSize;
        logger.log('o.loaded=' + o.loaded);

        totalBytesLoaded = totalBytesLoaded + o.loaded;
        var secondsElapsed = (currentGetTime - o.startGetTime) / 1000;
        logger.log('secondsElapsed=' + secondsElapsed);

        var htmlImgCancel = Ext.get('dadTplImageCancelCache').dom.innerHTML;
        if (secondsElapsed === 0 || o.loaded === 0)
        {
            // will result in infinity seconds
            html = '<div class="dadProgressBarBox"><div class="dadProgressStatus"><div class="dadFileStatusText">' + o.fileName + ' &middot; ' + ' Waiting in queue...</div>' + '<a href=# class="dadFileCancelLink" onclick="dadAbortUpload(event, ' + o.uploadId + '); return false;" title="Cancel" style="margin-left: 18px !important;">' + htmlImgCancel + '</a></div></div>';
            dadProgressBars.insertHtml('beforeEnd', html);
            continue;
        }

        var bytesPerSecond = o.loaded / secondsElapsed;
        logger.log('bytesPerSecond=' + bytesPerSecond);
        logger.log('o.fileSize - o.loaded=' + (o.fileSize - o.loaded));
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

        // logger.log('secondsRemaining=' + secondsRemaining);
        // totalSecondsRemaining = totalSecondsRemaining + secondsRemaining;
        status = o.fileName;
        if (secondsRemaining === 0)
        {
            status = status + ' &middot; less than a second left';
        } else
        {
            status = status + ' &middot; ' + secondsRemaining + ' second' + (secondsRemaining > 1 ? 's' : '') + ' left'
        }

        status = status.replace(/ /g, '&nbsp;');
        var progressBar = '<div class="dadProgressBar" style="width: ' + width + '">&nbsp;</div>'
        // Issue: 259152 [DnD] Allow canceling of files in queue
        // this comment just shows the location of the change.
        // the actual change is in CL 600387
        var progressStatus = '<div class="dadProgressStatus"><div class="dadFileStatusText">' + status + '</div></div><a href=# class="dadFileCancelLink" onclick="dadAbortUpload(event, ' + o.uploadId + '); return false;" title="Cancel">' + htmlImgCancel + '</a>';
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
            var progressStatus = '<div class="dadProgressStatus" style="border:1px"><div class="dadFileStatusText">' + status + '</div></div><a href=# class="dadFileCancelLink" onclick="dadAbortInWaiting(event, \'' + item.key + '\'); return false;" title="Cancel">' + htmlImgCancel + '</a>';
            html = '<div class="dadProgressBarBox clearfix">' + progressBar + progressStatus + '</div>';

            dadProgressBars.insertHtml('beforeEnd', html);

        } catch (e)
        {
            // possible the item has been cancelled
        }
    }

    jDnd(".dadFileCancelLink").click(function(event)
    {
        event.stopPropagation();
    });

    dadGlobal.folderTooltip.syncSize();

    dadApplyCSSToCabinetFolderTooltip();
}





function dadAbortUpload(evt, uploadId)
{
    dadSetStatus(dadGlobal.xmlRequests[uploadId].upload.fileName + ' upload cancelled.');
    dadGlobal.xmlRequests[uploadId].abort();
    delete dadGlobal.currentUploadHash[uploadId];

    dadProcessNextWaitingFile();

    evt = evt || window.event;
    dadStopPropagation(evt);
}



/** * Returns true if the passed element is a NS textbox or textarea *  * @param {Object} *        el */
function dadIsInput(el)
{
    if (typeof el.getAttribute == 'undefined')
    {
        // this happens in line items
        return false;
    }

    var cls = el.getAttribute('class');
    
    return ['input textarea', 'inputreq textarea', 'input', 'inputreq'].indexOf(cls) > -1;
}



/** * Event handler for other drag-and-drop events. Used for demo purposes. *  * @param {Object} *        evt */
function dadNoOperationHandler(evt)
{
    return dadStopPropagation(evt);
}





function dadDragEnter(e)
{
    var logger = new dadobjLogger(arguments);
    e = e || window.event;
    var target = e.target || e.srcElement;

    dadResetStatus();
    dadGlobal.dadIsDragEnter = true;

    var xDadInfo = Ext.get('dadInfo');
    if (target.id == 'dadDropZone')
    {
        // record level
        // highlight drop zone
        Ext.get(target.id + 'Background').setStyle('backgroundColor', 'lightgreen');
    } else if (dadIsInput(target) === true)
    {
        // text boxes
        Ext.get(target).setStyle('backgroundColor', 'lightgreen');
    } else
    {
        // line item level
        Ext.get('dadInfo').update('Drop your file here to attach to this line item');
        // find the parent table row
        // for some reasons, calling Ext.get() on a literal returns null, so get
        // parent if needed
        var notNullTarget = Ext.get(target) || Ext.get(target.parentNode);
        var xTr = (notNullTarget).findParent('tr', 50, true);
        xTr.select('td').setStyle('backgroundColor', 'lightgreen');

        logger.log('xTr.dom.id=' + xTr.dom.id);

        // get parent table
        var xTable = xTr.findParent('.listtable', 50, true);
        logger.log('xTable.dom.id=' + xTable.dom.id);
        var listId = xTable.dom.id.replace('_splits', '');
        logger.log('listId=' + listId);
        var lineNum = xTr.dom.id.replace(listId + '_row_', '');
        lineNum = parseInt(lineNum, 10);
        if (nlapiGetLineItemValue(listId, 'id', lineNum) == '')
        {
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





function dadDragExit(e)
{
    var logger = new dadobjLogger(arguments);
    e = e || window.event;

    dadGlobal.dadIsDragEnter = false;

    var target = e.target || e.srcElement;
    if (target.id == 'dadDropZone')
    {
        Ext.get(target.id + 'Background').setStyle('backgroundColor', 'transparent');
    }
    else if (dadIsInput(target) === true)
    {
        // text boxes
        Ext.get(target).setStyle('backgroundColor', '');
    }
    else
    {
        if ((target.outerHTML || '').indexOf('<tr') == -1)
        {
            if (Ext.get(target) === null)
            {
                // target might be a text content
                return;
            }
            
            target = Ext.get(target).findParent('tr');
        }
        
        Ext.get(target).select('td').setStyle('backgroundColor', 'transparent');
    }
    
    Ext.get('dadInfo').hide();
    logger.log('end');

    return dadStopPropagation(e);
}



/** * Add drag and drop events to an element *  * @param {Object} *        el */
function dadAddDnDEvents(el)
{
    dadAddEvent(el, "drop", dadFileDrop);
    dadAddEvent(el, "dragenter", dadDragEnter);
    dadAddEvent(el, "dragover", dadNoOperationHandler);
    if (dadGlobal.browser.isFirefox)
    {
        // FF
        dadAddEvent(el, "dragexit", dadDragExit);
    }
    else
    {
        // chrome, safari
        dadAddEvent(el, "dragleave", dadDragExit);
    }
}





function dadPositionRecordDropZone()
{
    var logger = new dadobjLogger(arguments, true);
    var BORDER_RIGHT = 25;
    var dInsertBefore = Ext.select('.uir-page-title-firstline').elements[0];
    var xInsertBefore = Ext.get(dInsertBefore);
    if (xInsertBefore === null)
    {
        logger.error('xInsertBefore ===  null');
    }

    var xHeader = Ext.get('div__header');
    var xInsertBeforeTop = xInsertBefore.getTop();
    var width = Ext.get('dadDropZoneBackgroundStatus').getWidth();
    var xRecordDropZoneBackground = Ext.get('dadDropZoneBackground');
    var xRecordDropZone = Ext.get('dadDropZone');    var dropZoneWidth = width + 10;
    xRecordDropZone.setWidth(dropZoneWidth);
    xRecordDropZoneBackground.setWidth(width);
    xRecordDropZone.setTop(xInsertBeforeTop);
    xRecordDropZone.setLeft(xHeader.getWidth() - dropZoneWidth - 1 - BORDER_RIGHT);
    xRecordDropZone.show();

    xRecordDropZoneBackground.setHeight(xRecordDropZone.getHeight());
    xRecordDropZoneBackground.setTop(xRecordDropZone.getTop());
    xRecordDropZoneBackground.setLeft(xRecordDropZone.getLeft());
    xRecordDropZoneBackground.show();
}





function dadShowMenu()
{
    if (dadGlobal.browserSupported === false)
    {
        return;
    }
    
    if (dadGlobal.folderTooltip)
    {
        // dadGlobal.folderTooltip.show();
        return;
    }
    
    if (dadGlobal.userPermission === false)
    {
        return;
    }

    var DND_HELP = "/app/help/helpcenter.nl?topic=DOC_FileDragAndDrop";
    
    // ========================================
    // show destination folder
    // ========================================
    var html = '<b>Drop Zone</b><br><br>';
    html = html + 'You can upload multiple files simultaneously.';
    html = html + '<hr>';

    // ========================================
    // pending uploads
    // ========================================
    html = html + 'Pending uploads:';
    html = html + '<div id="dadProgressBars" style="border: 0px dotted red">';
    html = html + 'None';
    html = html + '</div>';

    var sendCommentsLinkMarkup = "<a id='dadSendCommentsLink' href='#' onclick='dadSendComments(); return false;' title='Rate File Drag and Drop.' class='dottedlink'>Rate Us</a>";
    html += '<br>';
    html += sendCommentsLinkMarkup;
    html += ' | ';
    html += "<a href='" + DND_HELP + "' target='_blank' title='Click here to view the File Drag and Drop help.' class='dottedlink'>Help</a>";

    var target = 'dadDropZone';
    var tooltipId = target + 'Tooltip';
    var tooltip = (new Ext.ToolTip({
        title: '',
        id: tooltipId,
        target: target,
        anchor: 'top',
        html: html,
        autoHide: false,
        autoShow: true,
        hideDelay: 10000,
        dismissDelay: 0,
        anchorOffset: 0,
        width: 400,
        height: 'auto',
        bodyStyle: 'background-color: white',
        listeners: {

            'hide': function()
            {
                this.destroy();
                delete dadGlobal.folderTooltip;
            },
            'renderX': function()
            {
                this.header.on('click', function(e)
                {
                    e.stopEvent();
                    Ext.Msg.alert('Link', 'Link to something interesting.');

                }, this, {
                    delegate: 'a'
                });
            }
        }
    }));
    
    dadGlobal.folderTooltip = tooltip;
    tooltip.show();
    dadApplyCSSToCabinetFolderTooltip();

    // show individual file progress if needed
    var currentUploadHash = dadGlobal.currentUploadHash;
    var pendingUploadsCount = Object.keys(currentUploadHash).length;
    if (pendingUploadsCount > 0)
    {
        dadShowUploadProgress();
    }

    return false;
}





function dadResetStatus()
{
    var logger = new dadobjLogger(arguments);
    var status = 'Drop files here.';
    status = status.replace(/ /g, '&nbsp;');
    Ext.get('dadDropZoneBackgroundBar').hide();
    if (Ext.get('dadDropZoneBackgroundStatus').dom.innerHTML != status)
    {
        Ext.get('dadDropZoneBackgroundStatus').update(status);
    }
 
    logger.end();
}



/** * Attaches an event to an element *  * @param {Object} *        elem Element * @param {Object} *        evnt Event * @param {Object} *        func Function */
function dadAddEvent(elem, evnt, func)
{
    if (elem.addEventListener) // W3C DOM
        elem.addEventListener(evnt, func, false);
    else if (elem.attachEvent)
    { // IE DOM
        elem.attachEvent("on" + evnt, func);
    }
    else
    { // No much to do
        elem[evnt] = func;
    }
}



function dadPageInit()
{
    var logger = new dadobjLogger(arguments);

    jDnd(window).scroll(function()
    {
        window.scrollTo(0, 0);
    });

    Ext.getBody().setStyle({
        overflow: 'hidden'
    });

    Ext.select('.uir-page-title .page-title-menu').hide();
    dadSuiteletProcessAsync('getIconsByName', 'value', function(iconURLs)
    {
        dadGlobal.DROPZONE_FOLDER_ICON = iconURLs['dad-image-dropzone-folder.png'];
        dadGlobal.UPLOAD_CANCEL_ICON = iconURLs['dad-image-icon-cancel.png'];

        var img = Ext.get('dadImgFolderInfo');
        img.dom.setAttribute('src', dadGlobal.DROPZONE_FOLDER_ICON);
        img.dom.style.visibility = "visible";
        
        Ext.get('dadImgFolderInfo').show();

        // Load the image immediately so that it is cached on first page load.
        Ext.get('dadImageCancel').dom.setAttribute('src', dadGlobal.UPLOAD_CANCEL_ICON);
    });

    // check browser
    if (isBrowserSupported())
    {
        dadResetStatus();
        dadPositionRecordDropZone();

        var userPermission = nlapiGetContext().getPermission('LIST_FILECABINET');
        // user has either view or no access to documents and files
        if (userPermission < dadGlobal.CREATE_PERMISSION)
        {
            dadGlobal.userPermission = false;
            dadSetStatus('You do not have access to Documents and Files. Contact your account administrator to request for access.');            dadPositionRecordDropZone();
        }
        else
        {
            var dRecordDropZone = Ext.get('dadDropZone').dom;
            dadAddDnDEvents(dRecordDropZone);

            dadSuiteletProcessAsync('getAccountPreference', 'value', function(paramAcctPref)
            {
                var defaultFolderId = paramAcctPref.defGlobalDestnFolder;
                if (dadHasValue(defaultFolderId))
                {
                    dadShowFolderInIframe(defaultFolderId);
                }
            });

            dadAddBeforeUnloadEventHandler();
        }
        Ext.get('dadImgFolderInfo').show();

    }
    else
    {
        dadGlobal.browserSupported = false;
        dadSetStatus('Use the latest version of NetSuite supported browsers to enable file drag and drop.');
        dadPositionRecordDropZone();

        if (Ext.isSafari)
        {
            Ext.get('dadDropZoneBackgroundStatus').setWidth(484);
        }

        Ext.get('dadDropZoneBackgroundStatus').setStyle({
            'color': 'rgb(251, 69,30)',
            'padding-left': '30px'
        });

        Ext.get('dadDropZone').setStyle({
            'border': '2px dashed rgb(251, 69,30)'
        });

        Ext.get('dadDropZone').dom.title = '';
    }

    Ext.get('dadFileCabinet').dom.setAttribute('src', '/app/common/media/mediaitemfolders.nl?whence=&ifrmcntnr=T');
    dadResizeElements();
    Ext.get('dadFileCabinet').show();

    jDnd(window).resize(function()
    {
        dadPositionRecordDropZone();
        dadResizeElements();

    });
    jDnd(Ext.getBody()).resize(function()
    {
        dadPositionRecordDropZone();
        dadResizeElements();
    });

    jDnd('body').click(function(e)
    {
        if (dadHasValue(dadGlobal.folderTooltip) && (e.target.id !== 'dadDropZone'))
        {
            dadGlobal.folderTooltip.hide();
        }
    });

    /* make the search file work */
    setInterval(function()
    {
        // add server commands
        var jIframe = jDnd('#dadFileCabinet');
        if (jIframe.contents().find('#server_commands').get(0) === undefined)
        {
            var serverCommandsMarkup = '<iframe src="javascript:false" id="server_commands" name="server_commands" style="display:none" height="0"></iframe>';
            jIframe.contents().find('#div__body').append(serverCommandsMarkup);
        }
        jDnd('#dadFileCabinet').contents().find(".uir-page-title").remove();
        // change wait cursor code to arrow
        var jSearchButton = jIframe.contents().find('#mediasrch_b');
        if (jSearchButton.length === 0)
        {
            return;
        }
        var onClickCode = jSearchButton.get(0).getAttribute('onclick');
        onClickCode = onClickCode.replace("wait", 'arrow');
        jSearchButton.attr('onclick', onClickCode);
    }, 1000);

    jDnd('#dadFileCabinet').load(function()
    {
        jDnd('#dadFileCabinet').contents().find('.uir_control_bar').hide();
        jDnd('#dadFileCabinet').contents().find('#tbl_copyaction, #tbl_new, #tbl_moveaction').hide();
        jDnd('#dadFileCabinet').contents().find("body").on('click', function(e)
        {
            if (dadHasValue(dadGlobal.folderTooltip) && (e.target.id !== 'dadDropZone'))
            {
                dadGlobal.folderTooltip.hide();
            }
        });
        
        dadResizeElements();
    });
}





function isBrowserSupported()
{
    if (Ext.isChrome || Ext.isGecko)
    {
        return true;
    }

    var userAgent = window.navigator.userAgent;
    if (Ext.isSafari)
    {
        var startIndex = userAgent.indexOf('Version/') + 8; // 8 is the length of Version/
        var endIndex = userAgent.indexOf(' ', startIndex); //Look for the space after the version number
        var versionNo = parseFloat(userAgent.substring(startIndex, endIndex));
        
        return versionNo >= MIN_SUPPORTED_SAFARI_VERSION;
    }

    if (Ext.isIE)
    {
        var startIndex = userAgent.indexOf('MSIE ') + 5; // 5 is the length of MSIE<space> 
        var endIndex = userAgent.indexOf(';', startIndex); //Look for the space after the version number
        var versionNo = parseFloat(userAgent.substring(startIndex, endIndex));

        return versionNo >= MIN_SUPPORTED_IE_VERSION;
    }
}



/** * Adds trim functions if browser has no support */
function dadAddTrimFunctions()
{
    if (typeof String.trim == 'undefined')
    {
        String.prototype.trim = function()
        {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    if (typeof String.ltrim == 'undefined')
    {
        String.prototype.ltrim = function()
        {
            return this.replace(/^\s+/, "");
        };
    }

    if (typeof String.rtrim == 'undefined')
    {
        String.prototype.rtrim = function()
        {
            return this.replace(/\s+$/, "");
        };
    }
}



function dadResizeElements()
{
    var logger = new dadobjLogger(arguments);
    var xDropZone = Ext.get('dadDropZone');
    var xFrame = Ext.get('dadFileCabinet');
    var xHeader = Ext.get('div__header');

    // set iframe height
    dadGlobal.HEIGHT_ALLOWANCE = -70;
    var iframeHeight = Ext.getBody().getViewSize().height - xDropZone.getTop() - xDropZone.getHeight() - dadGlobal.HEIGHT_ALLOWANCE;
    xFrame.setHeight(iframeHeight);

    // set width
    var headerWidth = parseInt(xHeader.getWidth() - 70);
    logger.log('headerWidth=' + headerWidth);
    xFrame.setWidth(headerWidth + 20);

    Ext.getBody().setStyle({
        overflow: 'hidden'
    });
}





function dadApplyCSSToCabinetFolderTooltip()
{
    Ext.select('#dadDropZoneTooltip .x-tip-body').setStyle({
        'padding': '20px 20px 20px 20px',
        'font-size': '13px',
        'color': '#545454',
        'font-family': 'Open Sans,Helvetica,sans-serif',
        'border-bottom-style': 'none',
        'background-color': '#f0f0f0',
        'width': 'auto'
    });

    Ext.select('#dadDropZoneTooltip .x-tip-body hr').setStyle({
        'height': '2px',
        'border-color': 'rgba(235, 235, 235, 0.5)',
        'margin': '6px 0 7px 0'
    });

    Ext.select('.x-tip-mc').setStyle({
        'background-color': '#f0f0f0',
        'box-shadow': 'rgba(0, 0, 0, 0.6) 0px 2px 4px'
    });

    Ext.select('#dadDropZoneTooltip .dottedlink').setStyle({
        'color': '#336699',
        'border-bottom-style': 'none'

    });

    Ext.select('#dadDropZoneTooltip .dottedlink').on('mouseover', function(e)
    {
        Ext.get(e.target.id).setStyle({
            'border-bottom-style': 'solid',
            'border-bottom-color': '#336699'
        });
    });

    Ext.select('#dadDropZoneTooltip .dottedlink').on('mouseout', function(e)
    {
        Ext.get(e.target.id).setStyle({
            'border-bottom-style': 'none'
        });
    });

    Ext.select('.x-tip-bl').hide();
}





function getFrameJQuery()
{
    var jIframe = document.getElementById("dadFileCabinet");
    var win = jIframe.contentWindow || jIframe.contentDocument;
    return win.jQuery;
}



