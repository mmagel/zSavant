/**
 * © 2014 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 26 Jun 2013 tcaguioa
 * 
 */
var dadGlobal = dadGlobal || {};
dadGlobal.folderWait = dadGlobal.folderWait || null;

function dadPerformActionOnFolderSelect() {
    var oldFolderId = nlapiGetFieldValue('custrecord_dad_ert_folder');
    if (oldFolderId != parent.dadGlobal.folderId) {
        nlapiSetFieldValue('custrecord_dad_ert_full_folder_name', parent.dadGlobal.folderFullName);
        nlapiSetFieldValue('custrecord_dad_ert_folder', parseInt(parent.dadGlobal.folderId, 10));
        NS.form.setChanged(true);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Access mode: create, copy, edit
 * @returns {Void}
 */
function dadClientPageInit(type) {
    try {
        // prevent typing into the folder name field
        Ext.get('custrecord_dad_ert_full_folder_name').set({
            readonly : 'true'
        });

        // make sure the folder name is updated
        var folderId = nlapiGetFieldValue('custrecord_dad_ert_folder');
        if (dadHasValue(folderId)) {
            var fullFolderName = dadGetFolderFullName(folderId);
            if (fullFolderName === '') {
                fullFolderName = 'Folder no longer exists.';
            }
            nlapiSetFieldValue('custrecord_dad_ert_full_folder_name', fullFolderName);
            NS.form.setChanged(false);
        }

        // on focus of folder, show folder browser
        Ext.get('custrecord_dad_ert_full_folder_name').on('focus', function(e) {
            // If inside the frame, it is possible that it is loaded using Setup
            // Assistant
            if (self !== parent) {

                dadGlobal.folderFullName = nlapiGetFieldValue('custrecord_dad_ert_full_folder_name');
                dadGlobal.folderId = nlapiGetFieldValue('custrecord_dad_ert_folder');

                if (dadHasValue(parent.dadShowFolderPickerInEnabledRecordTypeField)) {
                    parent.dadShowFolderPickerInEnabledRecordTypeField(dadGlobal.folderId, dadGlobal.folderFullName);
                }
            } else {
                dadShowFileCabinetFolderPicker();
            }

            // // var logger = dadobjLogger(arguments);
            // var xFolderName = Ext.get('custrecord_dad_ert_full_folder_name');
            // var xTree = Ext.get('dadTreeContainer');
            // xTree.setTop(xFolderName.getTop() + xFolderName.getHeight());
            // xTree.setLeft(xFolderName.getLeft());
            // xTree.setWidth(xFolderName.getWidth());
            // xTree.show();
            // dadGlobal.tree.show();
            //
            // var folderId = nlapiGetFieldValue('custrecord_dad_ert_folder');
            // if (dadHasValue(folderId)) {
            // var node = dadGlobal.tree.getNodeById(folderId);
            // if (dadHasNoValue(node)) {
            // // probably invalid folder id
            // return;
            // }
            // node.ensureVisible();
            // node.select();
            // }

        });

        if (type == 'edit' || type == 'create') {
            var isUseFolderPathPattern = nlapiGetFieldValue('custrecord_dad_ert_use_folder_pattern');
            dadEnableFolderPath(isUseFolderPathPattern);
        }
    } catch (ex) {
        dadHandleUnexpectedError(ex);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
    var isUseFolderPathPattern = nlapiGetFieldValue('custrecord_dad_ert_use_folder_pattern');
    if (isUseFolderPathPattern === 'F') {
        var folderName = nlapiGetFieldValue('custrecord_dad_ert_full_folder_name');
        var folderId = nlapiGetFieldValue('custrecord_dad_ert_folder');

        if (dadHasNoValue(folderName) || dadHasNoValue(folderId)) {
            uiShowError('Please provide value for Folder Name.');
            return false;
        }

        var isFolderInactive = nlapiLookupField('folder', folderId, 'isinactive');
        if (isFolderInactive === 'T') {
            uiShowError('Folder is inactive');
            return false;
        }

        try {
            nlapiLoadRecord('folder', folderId);
        } catch (e) {
            uiShowError('Folder does not exists.');
            // folder id does not exists
            return false;
        }
    } else {

        var folderPathPattern = nlapiGetFieldValue('custrecord_dad_ert_folder_path_pattern');
        if (dadHasNoValue(folderPathPattern)) {
            uiShowError('Please provide a value for Folder Path Pattern.');
            return false;
        }

        var newfolderPathPattern = folderPathPattern.replace(/{subsidiaryId}/gi, '{subsidiaryId}').replace(/{departmentId}/gi, '{departmentId}').replace(/{recordId}/gi, '{recordId}').replace(/{roleId}/gi, '{roleId}');
        nlapiSetFieldValue('custrecord_dad_ert_folder_path_pattern', newfolderPathPattern);
        var placeholders = newfolderPathPattern.split('}');

        // no placeholders
        if (placeholders.length == 1) {
            uiShowError('Folder Path Pattern should contain at least 1 placeholder');
            return false;
        }

        for (var i = 0; i < placeholders.length; i++) {
            var placeholder = placeholders[i];

            var posStart = placeholder.indexOf('{');
            if (posStart == -1 && i == placeholders.length - 1) {
                return true;
            }

            // no pair curly brace
            if (posStart == -1) {
                uiShowError('Invalid placeholder.');
                return false;
            }

            var placeHolderValue = placeholder.substring(posStart, placeholder.length) + '}';

            // check if placeholder is valid
            var validPlaceholder = '{subsidiaryId}{departmentId}{recordId}{roleId}';

            if (validPlaceholder.indexOf(placeHolderValue) == -1) {
                uiShowError('Invalid placeholder.');
                return false;
            }
        }
    }

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @param {String}
 *        name Field internal id
 * @param {Number}
 *        linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientValidateField(type, name, linenum) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @param {String}
 *        name Field internal id
 * @param {Number}
 *        linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
    if (name == 'custrecord_dad_ert_folder') {
        var folderId = nlapiGetFieldValue('custrecord_dad_ert_folder');

        // show folder name upon change in folder id
        var isFolderInactive = nlapiLookupField('folder', folderId, 'isinactive');
        if (isFolderInactive === 'T') {
            uiShowError('Folder is inactive');
            return;
        }

        dadWait('Getting folder full name...');
        var folderId = nlapiGetFieldValue(name);
        nlapiSetFieldValue('custrecord_dad_ert_full_folder_name', dadGetFolderFullName(folderId));
        Ext.Msg.hide();

    }

    if (name == 'custrecord_dad_ert_use_folder_pattern') {
        var isUseFolderPathPattern = nlapiGetFieldValue('custrecord_dad_ert_use_folder_pattern');
        dadEnableFolderPath(isUseFolderPathPattern);
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @param {String}
 *        name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *        type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {

    return true;
}

function dadEnableFolderPath(isUseFolderPathPattern) {
    if (isUseFolderPathPattern == 'T') {
        // If Use Folder Path Pattern is checked, disable and remove
        // value
        // of
        // Folder Id and Folder Name. Enable Folder Path Pattern. Upon
        // save,
        // make sure Folder Path Pattern has a value.
        nlapiDisableField('custrecord_dad_ert_full_folder_name', true);
        nlapiDisableField('custrecord_dad_ert_folder', true);
        nlapiDisableField('custrecord_dad_ert_folder_path_pattern', false);

    } else {
        // If Use Folder Path Pattern is unchecked, disable and remove
        // value
        // of
        // Folder Path Pattern and enable Folder Id and Folder Name.
        // Upon
        // save,
        // make sure Folder Id and Folder Name
        nlapiDisableField('custrecord_dad_ert_folder_path_pattern', true);
        nlapiDisableField('custrecord_dad_ert_full_folder_name', false);
        nlapiDisableField('custrecord_dad_ert_folder', false);
    }

}
