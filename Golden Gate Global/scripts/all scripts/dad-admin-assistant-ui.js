/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2014     jvelasquez
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType **
 * @param {String}
 *        type Access mode: create, copy, edit
 * @returns {Void}
 */
var dadGlobal = dadGlobal || {};
dadGlobal.defaultGlobalFolderInterval = dadGlobal.defaultGlobalFolderInterval || null;
dadGlobal.defaultRecordTypeFolderNameInterval = dadGlobal.defaultRecordTypeFolderNameInterval || null;
dadGlobal.REC_ENABLED_RECORD_TYPE = 'customrecord_dad_enabled_record_type';
dadGlobal.MAX_FOLDERNAME_CHARS = 37;





function clientPageInit(type)
{
    try
    {
        dadCustomizeUIAssistantSteps();
        dadInitAssistantSteps();
        dadInitNextButton();

        setTimeout('jDnd(\'#div__scrollbody\').scrollTop(0);', 2000);
        jDnd(window).scroll(function()
        {
            if (Ext.get('dadFileCabinetFolderPicker').isVisible())
            {
                window.scrollTo(0, 0);
            }
        });

        setInterval(function()
        {
            var jIframe = jDnd('#dadRecordTypeFrame');
            if (dadHasValue(jIframe.contents().find("#_back")))
            {
                jIframe.contents().find("#_back").on('click', function(e)
                {
                    var xFrame = Ext.get('dadRecordTypeFrame');
                    var url = nlapiResolveURL('RECORD', 'customrecord_dad_enabled_record_type');
                    url = url.replace('custrecordentry', 'custrecordentrylist') + '&ifrmcntnr=T';
                    xFrame.dom.setAttribute('src', url);
                    return true;
                });
            }
            jDnd('#dadIframeFileCabinetFolderPicker').contents().find('#tbl_copyaction, #tbl_new, #tbl_moveaction').hide();
        }, 1000);

        dadHideFolderPickerOnEscape();
    }
    catch (e)
    {
        dadHandleUnexpectedError(e);
    }
}





function dadClientFieldChanged(type, name, linenum)
{
    if (name == "custscript_dnd_chkenablefeature")
    {
        _OnFieldChanged_EnableFeature();
    }
    else if (name == "custscript_dad_default_folder")
    {
        var defaultFolder = nlapiGetFieldValue("custscript_dad_default_folder");
        if ((defaultFolder == null || defaultFolder == ""))
        {
            nlapiSetFieldValue('custscript_dad_default_folder_id', "");
        }
    }
}





function _OnFieldChanged_EnableFeature()
{
    if (nlapiGetFieldValue("custscript_dnd_chkenablefeature") == "T")
    {
        var defaultFolder = nlapiGetFieldValue("custscript_dad_default_folder");
        var recTypesCount = _GetRecordTypesCount();
        
        if ((defaultFolder == null || defaultFolder == "") && recTypesCount == 0)
        {
            alert("File Drag and Drop is enabled, but a destination folder has not been set on this account.  If no destination folder is specified, the drop zone will not be visible on record pages. Set either a global or record-specific destination folder to view the drop zone on record pages.");
        }
    }
}





function _GetRecordTypesCount()
{
    var columns = [
        new nlobjSearchColumn("internalid", null, "COUNT")
    ];

    var filter = [
        ["isinactive", "IS", "F"]
    ];

    var sr = nlapiSearchRecord("customrecord_dad_enabled_record_type", null, filter, columns);

    return sr[0].getValue("internalid", null, "COUNT");
}





/**
 * Customizes the UI skinning of each steps in the UI Assistant.
 */
function dadCustomizeUIAssistantSteps()
{
    var step = nlapiGetFieldValue('step');
    if (step === 'recordtypestep')
    {
        var jIframe = jDnd('#dadRecordTypeFrame');
        if (jIframe.length === 0)
        {
            return;
        }

        // Removes the page title
        jIframe.contents().find(".uir-page-title").remove();

        var xTblWidth = Ext.get('tbl__innerscroll').getWidth();

        // Removes page border
        Ext.get('dadRecordTypeFrame').setStyle({
            autoScroll: false,
            border: 0,
            width: (xTblWidth - 20) + 'px'
        });
    }
    else if (step === 'summary')
    {
        var jIframe = jDnd('#dadRecordTypeFrame');
        if (jIframe.length === 0)
        {
            return;
        }

        // Removes page border
        Ext.get('dadRecordTypeFrame').setStyle({
            autoScroll: false,
            border: 0
        });

        // Removes the actions form such as create new record type,
        // customize view, filters etc.
        jIframe.contents().find("#footer_actions_form").remove();
    }
}





/**
 * Initializes any data or events needed for certain steps.
 */
function dadInitAssistantSteps()
{
    var step = nlapiGetFieldValue('step');
    if (step === 'globalpreferencestep')
    {
        // Initialize the global variables
        dadGlobal.folderFullName = nlapiGetFieldValue('custscript_dad_default_folder');
        dadGlobal.folderId = nlapiGetFieldValue('custscript_dad_default_folder_id');
        if (dadGlobal.folderFullName.length > dadGlobal.MAX_FOLDERNAME_CHARS)
        {
            Ext.get('custscript_dad_default_folder').setWidth(500);
        }

        // Initialize the folder picker
        dadInitFolderPicker();

        jDnd('#custscript_dad_default_folder').on('click', function(e)
        {
            dadShowFolderPickerInDefaultGlobalFolderDestinationField();
        });

        // dadSaveAccountPreference is the Choose Button id
        jDnd('#dadFileCabinetFolderPicker').contents().find("#dadSaveAccountPreference").on('click', function(e)
        {
            dadFolderSelectedFromFileCabinet();
            dadUpdateFileDragAndDropPreference();
            dadStopDefaultGlobalFolderDestinationInterval();
        });

        // When folder picker cancel is clicked.
        jDnd('#dadFileCabinetFolderPicker').contents().find("#dadCancel").on('click', function(e)
        {
            dadHideFolderPicker();
            dadStopDefaultGlobalFolderDestinationInterval();
        });
    }
    else if (step === 'recordtypestep')
    {

        // Initialize the folder picker
        dadInitFolderPicker();

        // dadSaveAccountPreference is the Choose Button id
        jDnd('#dadFileCabinetFolderPicker').contents().find("#dadSaveAccountPreference").on('click', function(e)
        {
            if (jDnd('#dadRecordTypeFrame')[0].id === 'dadRecordTypeFrame')
            {
                dadFolderSelectedFromFileCabinet();
                jDnd('#dadRecordTypeFrame')[0].contentWindow.dadPerformActionOnFolderSelect();
            }
        });

        // When folder picker cancel is clicked.
        jDnd('#dadFileCabinetFolderPicker').contents().find("#dadCancel").on('click', function(e)
        {
            dadHideFolderPicker();
            dadStopRecordTypeFolderNameInterval();
        });

        jDnd('#dadRecordTypeFrame').load(function()
        {
            var action = jDnd('#dadRecordTypeFrame').contents().find('#main_form').attr('action');
            var disabled = false;
            var disabledActions = ['/app/common/custom/custrecordentry.nl'];
            if (disabledActions.indexOf(action) > -1)
            {
                disabled = true;
            }
            dadDisableSaveAndNextButton(disabled);
        });

    }
    else if (step === 'summary')
    {
        Ext.get('td_rghtpane_title').update('Summary');
    }
}





/**
 * Initializes the Folder Picker.
 */
function dadInitFolderPicker() {
    var xFrame = Ext.get('dadIframeFileCabinetFolderPicker');
    if (dadHasValue(dadGlobal.folderId)) {
        xFrame.dom.setAttribute('src', '/app/common/media/mediaitemfolders.nl?ifrmcntnr=T' + (dadHasValue(dadGlobal.folderId) ? '&folder=' + dadGlobal.folderId : ''));
    } else {
        xFrame.dom.setAttribute('src', '/app/common/media/mediaitemfolders.nl?ifrmcntnr=T');
    }

    xFrame.setWidth(jDnd(window).width() * 0.7);
    xFrame.setHeight(jDnd(window).height() * 0.5);
}

/**
 * Shows the File Cabinet Folder Picker in the center of the frame
 * 
 * @param isFolderSelected
 *        If folder is selected, opens the new folder picker with selected
 *        folder.
 */
function dadShowFolderPickerInCenter() {
    var xPicker = Ext.get('dadFileCabinetFolderPicker');
    xPicker.appendTo(Ext.get('div__body'));
    xPicker.center();
    xPicker.show();
}

/**
 * Shows the File Cabinet Folder Picker when Default Global Folder Destination
 * Text field is clicked by the user.
 */
function dadShowFolderPickerInDefaultGlobalFolderDestinationField() {
    Ext.Msg.wait('...');

    // Show file cabinet centered inside the frame
    dadShowFolderPickerInCenter();

    // Start interval for default global folder if not started
    if (dadHasNoValue(dadGlobal.defaultGlobalFolderInterval)) {
        dadGlobal.defaultGlobalFolderInterval = setInterval(dadUpdateFolderPickerNavTree, 1000);
    }
}

/**
 * Callback function for updating Folder Picker nav tree
 */
function dadUpdateFolderPickerNavTree() {
    try {

        var searchScript = dadFixFileCabinetSearchScript('dadIframeFileCabinetFolderPicker');
        var searchButton = jDnd('#dadIframeFileCabinetFolderPicker').contents().find('#mediasrch_b');
        searchButton.attr('onclick', searchScript);

        var iframeNavTree = jDnd('#dadIframeFileCabinetFolderPicker').get(0).contentWindow.nav_tree;
        if (iframeNavTree) {
            nav_tree = iframeNavTree;
            // When clicking + to expand folder, the browser also throws
            // parent.nav_tree undefined. So, we have to set the
            // parent.nav_tree also
            parent.nav_tree = iframeNavTree;
        }

        dadFixFolderChooserUI('dadIframeFileCabinetFolderPicker');
    } catch (e) {
        var logger = new dadobjLogger('Issue: 297853');
        logger.log('ERROR in Issue: 297853 [DnD] New 14.2 UI: Folder tree does not expand: e=' + e);
    }
}

/**
 * Stops the interval call for updating nav tree when default global folder
 * destination is focused.
 */
function dadStopDefaultGlobalFolderDestinationInterval() {
    if (dadHasValue(dadGlobal.defaultGlobalFolderInterval)) {
        clearInterval(dadGlobal.defaultGlobalFolderInterval);
        dadGlobal.defaultGlobalFolderInterval = null;
    }
}

/**
 * Stops the interval call for updating nav tree when record type folder name is
 * focused.
 */
function dadStopRecordTypeFolderNameInterval() {
    if (dadHasValue(dadGlobal.defaultRecordTypeFolderNameInterval)) {
        clearInterval(dadGlobal.defaultRecordTypeFolderNameInterval);
        dadGlobal.defaultRecordTypeFolderNameInterval = null;
    }
}

/**
 * Updates the UI values of drag and drop preferences.
 */
function dadUpdateFileDragAndDropPreference() {
    nlapiSetFieldValue('custscript_dad_default_folder', dadGlobal.folderFullName);
    nlapiSetFieldValue('custscript_dad_default_folder_id', dadGlobal.folderId);

    if (dadGlobal.folderFullName.length > dadGlobal.MAX_FOLDERNAME_CHARS) {
        Ext.get('custscript_dad_default_folder').setWidth(500);
    } else {
        Ext.get('custscript_dad_default_folder').setWidth(285);
    }

}





/**
 * Shows the File Cabinet Folder Picker when Record Type Folder Name is focused.
 */
function dadShowFolderPickerInEnabledRecordTypeField(pFolderId, pFolderFullName)
{
    Ext.Msg.wait('...');

    // Set the Global values of this document
    dadGlobal.folderId = pFolderId;
    dadGlobal.folderFullName = pFolderFullName;

    // Reinitialize folder picker again.
    dadInitFolderPicker();

    // Show file cabinet centered inside the frame
    dadShowFolderPickerInCenter();

    // Start interval for default global folder if not started
    if (dadHasNoValue(dadGlobal.defaultRecordTypeFolderNameInterval))
    {
        dadGlobal.defaultRecordTypeFolderNameInterval = setInterval(dadUpdateFolderPickerNavTree, 1000);
    }
}





function dadRecordTypeFolderSelectedFromFileCabinet() {
    var folderId = dadRecordTypeGetSelectedFolderFromFileCabinet();
    if (folderId === null) {
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

    dadHideFolderPicker();
}





function dadHideFolderPicker()
{
    if (dadHasValue(dadGlobal.folderWait))
    {
        dadGlobal.folderWait.hide();
    }

    Ext.Msg.hide();
    var xPicker = Ext.get('dadFileCabinetFolderPicker');
    if (xPicker === null)
    {
        return;
    }

    var xiPicker = jDnd('#dadRecordTypeFrame').contents().find("#dadFileCabinetFolderPicker");
    xiPicker.hide();
    xPicker.hide();

    clearInterval(dadGlobal.dadRecordTypeDisplaySelectedFolderNameHandle);
    clearInterval(dadGlobal.dadDisplaySelectedFolderNameHandle);
    Ext.Msg.hide();

    if (xPicker.isVisible() === false)
    {
        return;
    }
}





function dadRecordTypeGetSelectedFolderFromFileCabinet() {
    var jIframe = jDnd('#dadIframeFileCabinetFolderPicker');
    var folderName = jIframe.contents().find("#div__medialisthdr").text();
    var links = jIframe.contents().find("#div__medialisthdr a");
    if (links.length === 0) {
        return null;
    }

    var folderid = links[links.length - 1].href.replace('javascript:showFolderContents(', '').replace(')', '');
    var isFolderInactive = nlapiLookupField('folder', folderid, 'isinactive');
    if (isFolderInactive === 'T') {
        return folderid;
    }

    dadGlobal.folderId = folderid;
    dadGlobal.folderFullName = folderName;

    if (typeof dadPerformActionOnFolderSelect !== 'undefined' && isFolderInactive === 'F') {
        dadRTPerformActionOnFolderSelect();
    }
    return folderid;
}





function dadRTPerformActionOnFolderSelect() {
    jIframe = jDnd('#dadRecordTypeFrame');
    jIframe.contents().find("#custrecord_dad_ert_full_folder_name").text(dadGlobal.folderFullName);
    jIframe.contents().find("#custrecord_dad_ert_folder").text(parseInt(dadGlobal.folderId, 10));
}





/**
 * Updates the Next button to Save and Next
 */
function dadInitNextButton() {
    var nextButton = document.getElementById('next');
    if (nextButton.value !== 'Finish')
        nextButton.value = 'Save and Next >';
}





/**
 * Disables the Save and Next Button of the Assistant.
 * 
 * @param disabled
 *        true Button is disabled. False, enabled.
 */
function dadDisableSaveAndNextButton(disabled)
{
    if (disabled)
    {
        Ext.get('tr_next').removeClass('pgBntG');
        Ext.get('tr_next').addClass('pgBntGDis');
        Ext.get('next').dom.disabled = true;
    }
    else
    {
        Ext.get('tr_next').removeClass('pgBntGDis');
        Ext.get('tr_next').addClass('pgBntG');
        Ext.get('next').dom.disabled = false;
    }
}
