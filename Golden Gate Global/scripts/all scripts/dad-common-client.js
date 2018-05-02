/**
 * © 2014 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 */

function foo(data) {
    alert(JSON.stringify(data));
}

var dadGlobal = dadGlobal || {};
dadGlobal.TITLE = 'File Drag and Drop';
dadGlobal.HIDDEN_HELP_NOTIFICATION = true;
dadGlobal.HIDDEN_HELP_NOTIFICATION_TIMEOUT = 20000;
dadGlobal.MAXIMUM_PARALLEL_UPLOADS = 4;

/**
 * Gets the number of files currently uploading. Does not include those in
 * waiting.
 * 
 * @returns
 */
function dadGetUploadingCount() {
    var hash = dadGlobal.currentUploadHash;
    return Object.keys(hash).length;
}

/**
 * Uploads the next file in the waiting list
 */
function dadProcessNextWaitingFile() {
    if (dadGlobal.filesInWaiting.length === 0) {
        // no more files in waiting
        return;
    }

    if (dadGetUploadingCount() >= dadGlobal.MAXIMUM_PARALLEL_UPLOADS) {
        // still more pending uploads
        return;
    }

    var item = dadGlobal.filesInWaiting.shift();
    dadUploadFile(item.file, item.folderId, item.header, item.textBox, item.subListId, item.lineId);
}

/**
 * Action performed when the Select Folder button is clicked
 */
function dadFolderSelectedFromFileCabinet() {
    var jsonFolder = dadGetSelectedFolderFromFileCabinet();
    if (dadHasNoValue(jsonFolder) || dadHasNoValue(jsonFolder.folderId)) {
        // uiShowInfo('Select a folder first.');

        // bring dadFileCabinetFolderPicker below error dialogbox
        Ext.get('dadFileCabinetFolderPicker').setStyle({
            'z-index' : '9000'
        });
        Ext.Msg.hide();
        Ext.MessageBox.show({
            title : 'No Folder Selected',
            msg : 'You must select a destination folder for this record.',
            buttons : Ext.MessageBox.OK,
            icon : Ext.MessageBox.ERROR,
            style : {
                'position' : 'absolute'
            },
            fn : function() {
                // bring dadFileCabinetFolderPicker above error dialogbox
                Ext.get('dadFileCabinetFolderPicker').setStyle({
                    'z-index' : '10000'
                });
            }
        });

        Ext.select('.x-window-bl').setStyle({
            'background-color' : '#E4E4E4'
        });

        Ext.select('.x-window-br').setStyle({
            'padding-left' : '17px'
        });

        return;
    }

    var folderId = jsonFolder.folderId;
    var isfolderInactive = nlapiLookupField('folder', folderId, 'isinactive');
    if (isfolderInactive === 'T') {
        Ext.get('dadFileCabinetFolderPicker').setStyle({
            'z-index' : '9000'
        });
        Ext.Msg.hide();
        Ext.MessageBox.show({
            title : 'Inactive Folder',
            msg : 'You are uploading to an inactive folder. Please select a different folder.',
            buttons : Ext.MessageBox.OK,
            icon : Ext.MessageBox.ERROR,
            style : {
                'position' : 'absolute',
                'z-index' : '10000'
            }
        });
        return;
    }

    // Update the global variables
    dadGlobal.folderId = jsonFolder.folderId;
    dadGlobal.folderFullName = jsonFolder.folderFullName;

    dadHideFileCabinetFolderPicker();

}

/**
 * Hides the folder picker
 */
function dadHideFileCabinetFolderPicker() {
    Ext.Msg.hide();
    var xPicker = Ext.get('dadFileCabinetFolderPicker');
    if (xPicker === null) {
        // probably in the file cabinet
        return;
    }
    if (xPicker.isVisible() === false) {
        return;
    }

    xPicker.hide();

    clearInterval(dadGlobal.dadDisplaySelectedFolderNameHandle);

    Ext.Msg.hide();

}

/**
 * Hides the folder picker on ESC
 */
function dadHideFolderPickerOnEscape() {
    jDnd(document).keyup(function(e) {
        if (e.keyCode == 27 /* esc */) {
            dadHideFileCabinetFolderPicker();
        }
    });
}

/**
 * Gets the selected folder and saves the id and name in global var
 * 
 * @returns {object} keys: folderId, folderFullName
 */
function dadGetSelectedFolderFromFileCabinet() {
    // see showFolderContents.toString()
    var iframe = parent.document.getElementById('dadIframeFileCabinetFolderPicker');
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    var folderId = innerDoc.getElementById('folder').value;
    if (dadHasNoValue(folderId)) {
        return null;
    }
    var folderFullName = dadGetFolderFullName(folderId);
    var isFolderInactive = nlapiLookupField('folder', folderId, 'isinactive');
    if (isFolderInactive === 'T') {
        return folderId;
    }

    if (typeof dadPerformActionOnFolderSelect !== 'undefined' && isFolderInactive === 'F') {
        dadPerformActionOnFolderSelect();
    }
    return {
        folderId : folderId,
        folderFullName : folderFullName
    };
}

/**
 * Displays a popup that displays the file cabinet inside an iframe
 */
function dadShowFileCabinetFolderPicker(isFolderSelected) {
    parent.dadGlobal.folderWait = Ext.Msg.wait('...');

    if (dadHasNoValue(isFolderSelected)) {
        isFolderSelected = true;
    }

    var xFrame = Ext.get('dadIframeFileCabinetFolderPicker');
    if (isFolderSelected === true) {
        xFrame.dom.setAttribute('src', '/app/common/media/mediaitemfolders.nl?ifrmcntnr=T' + (dadHasValue(dadGlobal.folderId) ? '&folder=' + dadGlobal.folderId : ''));
    } else {
        xFrame.dom.setAttribute('src', '/app/common/media/mediaitemfolders.nl?ifrmcntnr=T');
    }

    xFrame.setWidth(jDnd(window).width() * 0.7);
    xFrame.setHeight(jDnd(window).height() * 0.7);

    var xPicker = Ext.get('dadFileCabinetFolderPicker');
    xPicker.show().center();

    setInterval(function() {

        var searchScript = dadFixFileCabinetSearchScript('dadIframeFileCabinetFolderPicker');
        var searchButton = jDnd('#dadIframeFileCabinetFolderPicker').contents().find('#mediasrch_b');
        searchButton.attr('onclick', searchScript);

        // and hide header of the netsuite page (advanced add)
        dadHideHeaderInFolderPicker();

        try {
            // Issue: 297853 [DnD] New 14.2 UI: Folder tree does not expand
            // inside
            // DnD e
            // get the variable nav_tree of the iframe and assign it as to
            // variable
            // nav_tree of the parent page, we got nav_tree from the error
            // message

            Ext.get('dadFileCabinetFolderPicker').center();

            var iframeNavTree = jDnd('#dadIframeFileCabinetFolderPicker').get(0).contentWindow.nav_tree;
            if (iframeNavTree) {
                nav_tree = iframeNavTree;
            }

            dadFixFolderChooserUI('dadIframeFileCabinetFolderPicker');
        } catch (e) {
            var logger = new dadobjLogger('Issue: 297853');
            logger.log('ERROR in Issue: 297853 [DnD] New 14.2 UI: Folder tree does not expand: e=' + e);
        }

    }, 1000);
}

/**
 * Fix the search script of the file cabinet search when it is embedded inside
 * an iframe. It seems we need to add the server_commands iframe in the same
 * iframe of the file cabinet. If we will use the parent server_commands, then
 * the whole page is refreshed as file cabinet.
 */
function dadFixFileCabinetSearchScript(folderPickerIframeId) {
    var searchScript = "document.body.style.cursor = 'arrow';";
    searchScript += "var iframe = parent.document.getElementById('" + folderPickerIframeId + "');";
    searchScript += "var innerDoc = iframe.contentDocument || iframe.contentWindow.document;";
    searchScript += "var s = innerDoc.getElementById('server_commands');";
    searchScript += "if (s == null) {";
    searchScript += "  var serverNode = parent.document.getElementById('server_commands');";
    searchScript += "  innerDoc.body.appendChild(serverNode);";
    searchScript += "}";
    searchScript += "var v = innerDoc.getElementById('mediasrch_t').value;";
    searchScript += "innerDoc.getElementById('mediakeyword').value = v;";
    searchScript += "innerDoc.getElementById('server_commands').src = '/app/common/media/mediaitemfolders.nl?frame=bf&treeid=nav_tree&mediakeyword=' + encode(v);";
    searchScript += "return false;";
    return searchScript;
}

/**
 * Executes a suitelet asynchronously and returns the response as object.
 * 
 * @param {Object}
 *        action
 * @param {Object}
 *        values
 */
function dadSuiteletProcessAsync(action, values, callback, useAdminCredentials) {
    var logger = new dadobjLogger('dadSuiteletProcessAsync', false, '');
    logger.log('====================================================================');
    logger.log('AJAX CALL action=' + action + '; values=' + JSON.stringify(values));
    if (typeof useAdminCredentials == 'undefined') {
        useAdminCredentials = true;
    }
    var xmlRequest = new XMLHttpRequest();
    try {
        // var logger = new dadobjLogger(arguments);
        window.status = 'Processing ' + action + '... ';
        // logger.log('action=' + action);
        var data = {};
        data.action = action;
        data.values = values;
        var url = null;
        // logger.log('useAdminCredentials=' + useAdminCredentials);

        if (useAdminCredentials) {
            if (dadHasNoValue(dadGlobal.dadSuiteletProcessAsyncUrl)) {
                url = nlapiResolveURL('SUITELET', 'customscript_dad_admin_service_sl', 'customdeploy_dad_admin_service_sl');
                dadGlobal.dadSuiteletProcessAsyncUrl = url;
            } else {
                url = dadGlobal.dadSuiteletProcessAsyncUrl;
            }
        } else {
            if (dadHasNoValue(dadGlobal.dadSuiteletProcessAsyncUrlUser)) {
                url = nlapiResolveURL('SUITELET', 'customscript_dad_user_service_sl', 'customdeploy_dad_user_service_sl');
                dadGlobal.dadSuiteletProcessAsyncUrlUser = url;
            } else {
                url = dadGlobal.dadSuiteletProcessAsyncUrlUser;
            }
        }

        xmlRequest.onreadystatechange = function() {
            // logger.log('xmlRequest.readyState=' + xmlRequest.readyState);
            // logger.log('xmlRequest.status=' + xmlRequest.status);
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    // success
                    var returnValue = dadHandleResponse(xmlRequest);
                    callback(returnValue);
                } else {
                    var text = xmlRequest.responseText;
                    if (text.indexOf('Please provide more detailed keywords so your search does not return too many results') > -1) {
                        setTimeout("Ext.get('placeHolderColleagueOthers').update('Please provide more detailed keywords so your search does not return too many results', 'SuiteSocial');", 500);
                        callback([]);
                        return;

                    }
                    // uiShowError(text, 'Unexpected Error');
                    callback([]);
                    return;
                    // if(text.indexOf('Could not determine customer compid') >
                    // -1){
                    // uiShowError('Check if you are still logged into
                    // NetSuite.', 'Unexpected Error');
                    // return;
                    // }
                }
                window.status = 'Ready';
            }
        };
        // parameters
        logger.log('url=' + url);
        xmlRequest.open('POST', url, true /* async */);
        xmlRequest.setRequestHeader("Content-Type", "application/json");
        xmlRequest.send(JSON.stringify(data));
        return;
    } catch (e) {
        dadHandleUnexpectedError(e);
        alert('dadSuiteletProcessAsync(). action=' + JSON.stringify(action) + '; values=' + JSON.stringify(values) + dadGetErrorDetails(e) + '<br />xmlRequest.responseText=' + xmlRequest.responseText);
    }
}

function dadSuiteletProcessAsyncUser(action, values, callback) {
    dadSuiteletProcessAsync(action, values, callback, false /* useAdminCredentials */);
}

function dadGetSpot() {
    dadGlobal.spot = dadGlobal.spot || new E4D.create('E4D.ux.Spotlight', {
        easing : 'null',
        duration : 0
    });
    return dadGlobal.spot;
}

function dadHideHelp() {
    var logger = new dadobjLogger(arguments);
    logger.log('dadGlobal.tooltips.length=' + dadGlobal.tooltips.length);
    for (var i = 0; i < dadGlobal.tooltips.length; i++) {
        try {
            dadGlobal.tooltips[i].hide();
        } catch (e) {
            logger.error(e);
        }
    }
    dadGlobal.tooltips = [];
    logger.log('end');
}

dadGlobal.tooltips = [];





function dadSetHelp(el, title, helpContent, anchor, anchorOffset)
{
    title = title || '';
    var target = null;
    if (typeof el == 'string')
    {
        if (dadHasValue(el))
        {
            if (Ext.get(el) === null)
            {
                return;
            }
            target = Ext.get(el).dom;
        }
    }
    else
    {
        target = el;
    }

    if (dadHasNoValue(target.id))
    {
        target.id = 'random' + dadRandom();
    }

    if (typeof anchor == 'undefined')
    {
        anchor = 'top';
    }
    
    if (typeof anchorOffset == 'undefined')
    {
        anchorOffset = 0;
    }
    
    
    var tooltip = (new Ext.ToolTip({
        title: title,
        ids: target.id + 'Tooltip',
        target: target,
        anchor: anchor,
        html: helpContent,
        autoWidth: false,
        maxWidth: 400,
        autoHide: false,
        closable: false,
        autoShow: false,
        hideDelay: 0,
        dismissDelay: 0,
        anchorOffset: anchorOffset,
        style: {
            color: 'red'
        },
        listeners: {
            'hide': function()
            {
                this.destroy();
                if (dadHasValue(dadGlobal.spot))
                {
                    dadGlobal.spot.hide();
                    delete dadGlobal.spot;
                }
            },
            'clickX': function()
            {
                if (dadGlobal.spot)
                {
                    dadGlobal.spot.hide();
                    delete dadGlobal.spot;
                }
                dadHideHelp();
            }
        }
    }));
    tooltip.show();
    dadGlobal.tooltips.push(tooltip);
}





function dadHideHeaderInFolderPicker() {
	
	if (Ext.isIE) {
		dadHideHeaderInFolderPickerForIE();
		return;
	}

    try {
        var jIframe = jDnd('#dadIframeFileCabinetFolderPicker');
        if (jIframe.length === 0) {
            jIframe = jDnd('#dadFileCabinet');
            if (jIframe.length === 0) {
                return;
            }
        }
        jIframe.contents().find("#div__header").remove();
        jIframe.contents().find("#tbl_copyaction, #tbl_new, #tbl_moveaction").hide();
    } catch (e) {
        var logger = new dadobjLogger('dadHideHeaderInFolderPicker');
        logger.log('ERROR: e=' + e);
    }
}

function dadHideHeaderInFolderPickerForIE() {

    try {

    	jIframe = document.getElementById("dadFileCabinet");
    	if (jIframe != undefined) {
            var win = jIframe.contentWindow||jIframe.contentDocument;
            if (win != undefined) {
                var frameJQuery = win.jQuery;
                
                frameJQuery("#div__header").remove();
                frameJQuery("#tbl_copyaction, #tbl_new, #tbl_moveaction").hide();
                
            }
    		
    	}

    } catch (e) {
        var logger = new dadobjLogger('dadHideHeaderInFolderPickerForIE');
        logger.log('ERROR: e=' + e);
    }
}

/**
 * Used in getting user feedback
 */
function dadSendComments() {
    // hide balloon
    dadGlobal.folderTooltip.hide();
    // show send message popup window
    var msg = "<textarea id='dadComments' rows='10' style='width: 100%; font-size: 8pt'>";
    msg += '\r\n';
    msg += '\r\n';
    msg += '\r\n';
    msg += 'User: ' + nlapiGetContext().getName() + '\r\n';
    msg += 'Role: ' + jQuery('#dadRoleName').html() + '\r\n';
    msg += 'Email: ' + nlapiGetContext().getEmail() + '\r\n';
    msg += 'Company: ' + nlapiGetContext().getCompany() + '\r\n';
    msg += '</textarea>';
    msg += '<div style="background-color: white; border: 1px solid gray; margin-top: 2px; padding: 2px; vertical-align: middle; font-size: 8pt"><span style="top: -3px; position: relative">Rating:</span> ' + dadGetRatingMarkup() + '</div>';
    Ext.Msg.show({
        title : 'File Drag and Drop &raquo; Let us know what you think',
        msg : msg,
        width : 480,
        buttons : Ext.MessageBox.OKCANCEL,
        multiline : false,
        fn : dadSendCommentsCallback,
        animEl : 'addAddressBtn',
        icon : Ext.MessageBox.INFO,
        buttons : {
            ok : "Send",
            cancel : "Cancel"
        }
    });

    setTimeout("Ext.get('dadComments').dom.focus();", 500);

    return false;
}

/**
 * Submits the private message.
 * 
 * @param {Object}
 *        buttonId
 * @param {Object}
 *        text
 * @param {Object}
 *        opt
 */
function dadSendCommentsCallback(buttonId, text, opt) {

    if (buttonId == 'cancel') {
        return false;
    }
    var msg = Ext.get('dadComments').dom.value.trim();
    if (msg === '') {
        uiShowWarning('Please provide message.', null, function() {
            dadSendComments();
        });
        return;
    }
    nlapiSendEmail(nlapiGetContext().getUser(), 'suitelabs-support@netsuite.com', 'File Drag and Drop Feedback', msg + '\r\nRating: ' + dadGlobal.rating + (dadGlobal.rating == 1 ? ' star' : ' stars'));

    if (Ext.isChrome) {
        alert('Your message has been sent.', 'Confirmation');
    } else {
        uiShowInfo('Your message has been sent.', 'Confirmation');
    }
}

/**
 * Shows the In-App Help Notification which lasts for a few seconds.
 * 
 * @param suppress
 *        T hides the notification. Otherwise, shows notification.
 * @param target
 *        The target to show the notification.
 */
function dadShowInAppNotification(suppress, target) {
    var logger = new dadobjLogger(arguments);

    if (suppress === 'T') {
        logger.log('in-app notification suppressed');
        return;
    }

    // If notification is shown, it means checkbox is unchecked
    Ext.get('dadNotifChkboxDontShow').dom.checked = false;

    var jInAppNotif = jDnd('#dadInAppNotif');
    var html = jInAppNotif.html();
    if (dadHasNoValue(target)) {
        logger.log('no target');
        return;
    }

    var tooltipId = target + 'Tooltip';
    var tooltip = (new Ext.ToolTip({
        title : '',
        id : tooltipId,
        target : target,
        anchor : 'top',
        html : html,
        autoHide : false,
        autoShow : true,
        closable : true,
        hideDelay : 0,
        dismissDelay : 0,
        anchorOffset : 0,
        width : 400,
        height : 'auto',
        bodyStyle : 'background-color: white',
        listeners : {
            'hide' : function() {
                this.destroy();
                dadHideHelp();
            },
            'renderX' : function() {
                this.header.on('click', function(e) {
                    e.stopEvent();
                }, this, {
                    delegate : 'a'
                });
            }
        }
    }));
    dadGlobal.tooltips.push(tooltip);
    tooltip.show();

    // Making the tooltip closable=true prevents closing of tooltip when user
    // clicks outside tooltip. Hide the closeable part
    jInAppNotif.remove(); // To prevent duplicate div of in-app notif.
    Ext.select('#' + tooltipId + ' .x-tip-header').elements[0].remove();

    // Make the Tooltip go behind netsuite menu
    Ext.get(tooltipId).setStyle({
        zIndex : 401
    });
    Ext.select('.x-shadow').setStyle({
        zIndex : 400
    });

    // Add mouseover events
    tooltip.getEl().on('mouseover', function() {
        dadGlobal.HIDDEN_HELP_NOTIFICATION = false;
    });

    Ext.get(target).on('mouseover', function() {
        dadGlobal.HIDDEN_HELP_NOTIFICATION = false;
    });

    // Add mouse out events
    tooltip.getEl().on('mouseout', function() {
        dadGlobal.HIDDEN_HELP_NOTIFICATION = true;
    });

    // Add mouse out events
    Ext.get(target).on('mouseout', function() {
        dadGlobal.HIDDEN_HELP_NOTIFICATION = true;
    });

    setTimeout(dadCheckInAppNotificationStatus, dadGlobal.HIDDEN_HELP_NOTIFICATION_TIMEOUT);
}

/**
 * Checks if the mouse hovers the elements
 */
function dadCheckInAppNotificationStatus() {
    var logger = new dadobjLogger(arguments);
    logger.log('hide notification=' + dadGlobal.HIDDEN_HELP_NOTIFICATION);
    if (dadGlobal.tooltips.length <= 0) {
        dadGlobal.HIDDEN_HELP_NOTIFICATION = true;
    }

    if (dadGlobal.HIDDEN_HELP_NOTIFICATION) {
        dadHideHelp();
    } else {
        setTimeout(dadCheckInAppNotificationStatus, dadGlobal.HIDDEN_HELP_NOTIFICATION_TIMEOUT);
    }
}

/**
 * Fixes the UI issues of folder chooser like space above and below the file
 * chooser.
 */
function dadFixFolderChooserUI(pIframeId) {
    var jIframe = jDnd('#' + pIframeId);
    jIframe.contents().find('#div__footer').attr('style', 'visibility: visible; margin-top: 0px !important');

    var adjustedHeight = jIframe.height() - jIframe.contents().find('#div__nav_tree').offset().top - 1;
    jIframe.contents().find('#div__nav_tree').css('height', adjustedHeight + 'px');

    adjustedHeight = jIframe.height() - jIframe.contents().find('#div__body').offset().top - 1;
    jIframe.contents().find('#div__body').css('height', adjustedHeight + 'px');
}