/**
 * Copyright NetSuite, Inc. 2011 All rights reserved.
 * For NetSuite SC Solution Center's internal use only.
 * Not for distribution outside of NetSuite.
 *
 * @fileOverview Core Library
 *
 * The objective of this library is quick prototyping of reports.
 * It is not intended for production use.
 *
 * The NetSuite SC Solution Center does not guarantee the performance
 * nor correctness of this library and is not obligated to fix any
 * defect nor provide any support and/or documentation.
 *
 * Functions as of this date are not yet stable nor optimized.
 * Implementation is changing between different projects.
 *
 * @author <a href="ali@netsuite.com">August Li</a>
 * @version 1.00 Version
 */

/**
 * @namespace NetSuite namespace. Singleton. All functions and classes are prefixed with "ns" to avoid conflicts with other codes.
 */
var ns = {
    _website: 'https://system.netsuite.com',
    _multiselectSeparator: '\u0005',
    _itemMatrixOptionsSeparator: '\u0004',
    _itemMatrixOptionSeparator: '\u0003',
    _recordTypeSeparator: '#',
    _fieldSeparator: '.',
    _companyInfo: null,
    _records: {},
    _timezone: null,
   _months : [ 'January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December' ],
    _days : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    //NetSuite uses float for integer columns, to force integer formatting, add column name here.
    _integerFields : {
        'binonhandavail' : true,
        'binonhandcount' : true,
        'locationbinquantityavailable' : true,
        'locationpreferredstocklevel' : true,
        'locationquantityavailable' : true,
        'locationquantitybackordered' : true,
        'locationquantitycommitted' : true,
        'locationquantityintransit' : true,
        'locationquantityonhand' : true,
        'locationquantityonorder' : true,
        'locationreorderpoint' : true,
        'memberquantity' : true,
        'preferredstocklevel' : true,
        'quantity' : true,
        'quantitybilled' : true,
        'quantitypacked' : true,
        'quantitypicked' : true,
        'quantityrevcommitted' : true,
        'quantityshiprecv' : true,
        'quantityavailable' : true,
        'quantitybackordered' : true,
        'quantitycommitted' : true,
        'quantityonhand' : true,
        'quantityonorder' : true,
        'reorderpoint' : true,
        'safetystocklevel' : true,
        'transferorderquantitycommitted' : true,
        'transferorderquantitypacked' : true,
        'transferorderquantitypicked' : true,
        'transferorderquantityreceived' : true,
        'transferorderquantityshipped' : true
    },
    _tzLookup: {
        'Etc/GMT+12': '-12',
        'Pacific/Samoa': '-11',
        'Pacific/Honolulu': '-10',
        'America/Anchorage': '-9',
        'America/Los_Angeles': '-8',
        'America/Tijuana': '-8',
        'America/Denver': '-7',
        'America/Phoenix': '-7',
        'America/Chihuahua': '-7',
        'America/Chicago': '-6',
        'America/Regina': '-6',
        'America/Guatemala': '-6',
        'America/Mexico_City': '-6',
        'America/New_York': '-5',
        'US/East-Indiana': '-5',
        'America/Bogota': '-5',
        'America/Caracas': '-4.5',
        'America/Halifax': '-4',
        'America/La_Paz': '-4',
        'America/Manaus': '-4',
        'America/Santiago': '-4',
        'America/St_Johns': '-3.5',
        'America/Sao_Paulo': '-3',
        'America/Buenos_Aires': '-3',
        'Etc/GMT+3': '-3',
        'America/Godthab': '-3',
        'America/Montevideo': '-3',
        'America/Noronha': '-2',
        'Etc/GMT+1': '-1',
        'Atlantic/Azores': '-1',
        'Europe/London': '+0',
        'Atlantic/Reykjavik': '+0',
        'Europe/Warsaw': '+1',
        'Europe/Paris': '+1',
        'Etc/GMT-1': '+1',
        'Europe/Amsterdam': '+1',
        'Europe/Budapest': '+1',
        'Africa/Cairo': '+2',
        'Europe/Istanbul': '+2',
        'Asia/Jerusalem': '+2',
        'Asia/Amman': '+2',
        'Asia/Beirut': '+2',
        'Africa/Johannesburg': '+2',
        'Europe/Kiev': '+2',
        'Europe/Minsk': '+2',
        'Africa/Windhoek': '+2',
        'Asia/Riyadh': '+3',
        'Europe/Moscow': '+3',
        'Asia/Baghdad': '+3',
        'Africa/Nairobi': '+3',
        'Asia/Tehran': '+3.5',
        'Asia/Muscat': '+4',
        'Asia/Baku': '+4',
        'Asia/Yerevan': '+4',
        'Etc/GMT-3': '+4',
        'Asia/Kabul': '+4.5',
        'Asia/Karachi': '+5',
        'Asia/Yekaterinburg': '+5',
        'Asia/Tashkent': '+5',
        'Asia/Calcutta': '+5.5',
        'Asia/Katmandu': '+5.75',
        'Asia/Almaty': '+6',
        'Asia/Dhaka': '+6',
        'Asia/Rangoon': '+6.5',
        'Asia/Bangkok': '+7',
        'Asia/Krasnoyarsk': '+7',
        'Asia/Hong_Kong': '+8',
        'Asia/Kuala_Lumpur': '+8',
        'Asia/Taipei': '+8',
        'Australia/Perth': '+8',
        'Asia/Irkutsk': '+8',
        'Asia/Manila': '+8',
        'Asia/Seoul': '+9',
        'Asia/Tokyo': '+9',
        'Asia/Yakutsk': '+9',
        'Australia/Darwin': '+9.5',
        'Australia/Adelaide': '+9.5',
        'Australia/Sydney': '+10',
        'Australia/Brisbane': '+10',
        'Australia/Hobart': '+10',
        'Pacific/Guam': '+10',
        'Asia/Vladivostok': '+10',
        'Asia/Magadan': '+11',
        'Pacific/Kwajalein': '+12',
        'Pacific/Auckland': '+12',
        'Pacific/Tongatapu': '+13'
    },
    _entityType: {
        'cashrefund': 'customer',
        'cashsale': 'customer',
        'creditmemo': 'customer',
        'expensereport': 'employee',
        'estimate': 'customer',
        'invoice': 'customer',
        'purchaseorder': 'vendor',
        'returnauthorization': 'customer',
        'salesorder': 'customer',
        'vendorbill': 'vendor',
        'vendorcredit': 'vendor',
        'vendorpayment': 'vendor',
        'workorder': 'customer',
        'job': 'job'
    },
    _fieldType: {
        'salesrep': 'employee',
        'supervisor': 'employee',
        'partner': 'partner',
        'opportunity': 'opportunity',
        'subsidiary': 'subsidiary',
        'job': 'job'
    },

    /**
     * Gets the date time today adjusted to the company's timezone setting or gmt.
     * @this {Object}
     * @param {string=} gmt Optional. If gmt is specified, it is used instead of company information timezone.
     * @return {Date} Date today, adjusted to proper timezone
     */
    getToday : function(gmt) {
        var dt = new Date();
        var offset = (gmt!=null) ? gmt : ns._tzLookup[ns.getTimezone()];
        if (ns.isAssigned(offset)) {
            var utc = dt.getTime() + (dt.getTimezoneOffset() * 60000);
            var nd = new Date(utc + (3600000 * offset));
            dt = new Date(nd.toLocaleString());
        }
        return dt;
    },

    /**
     * Get the date for this week's monday.
     * @this {Object}
     * @return {Date} Date of monday this week
     */
    getMondayThisWeek : function() {
        var startDate = ns.getToday(), day = startDate.getDay();
        if (day == 0) {
            day = 7;
        }
        startDate = nlapiAddDays(startDate, (0 - day) + 1);
        return startDate;
    },

    /**
     * Retrieve company information
     * @this {Object}
     * @param {string} field Company field name
     * @return {string} Company field value
     */
    getCompanyInfo : function(field) {
        if (ns.isNotAssigned(ns._companyInfo)) {
            ns._companyInfo = nlapiLoadConfiguration('companyinformation');
        }
        return ns._companyInfo.getFieldValue(field);
    },

    /**
     * Get company timezone in GMT
     * @this {Object}
     * @return {string} Company timezone setting
     */
    getTimezone : function() {
        if (ns.isNotAssigned(ns._timezone)) {
            ns._timezone = ns.getCompanyInfo('timezone');
        }
        return ns._timezone;
    },

    /**
     * Check if array contains the specified value
     * @param {Array} arr
     * @param {string|number|Object} itm Item to look for.
     * @return {boolean} True if found, otherwise False.
     */
    arrayContains : function(arr, itm) {
        if (ns.isAssigned(arr)) {
            for ( var i = 0, len = arr.length; i < len; i++) {
                if (itm == arr[i]) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Return the index for an item in an array
     * @param {Array} arr
     * @param {string|number|Object} itm Item to look for.
     * @return {number} -1 if not found, otherwise index of item is returned.
     */
    arrayIndexOf : function(arr, itm) {
        if (ns.isAssigned(arr)) {
            for ( var i = 0, len = arr.length; i < len; i++) {
                if (itm == arr[i]) {
                    return i;
                }
            }
        }
        return -1;
    },

    /**
     * Fill an array with specified value
     * @param {Array} arr Array to fill
     * @param {Object|string|number|null} val Value to be used in filling
     */
    arrayFill : function(arr, val) {
        if (ns.isAssigned(arr)) {
            for ( var i = 0, len = arr.length; i < len; i++) {
                arr[i] = val;
            }
        }
    },

    /**
     * Splits the multiselect text return by NetSuite into an array.
     * @this {Object}
     */
    multiselect : function(text) {
        if (ns.isAssigned(text)) {
            text = text.split(ns._multiselectSeparator);
        }
        return text;
    },

    /**
     * Returns true when value is not undefined nor null.
     * @param {string|number|Object|null} value
     * @return {boolean} True if has value, otherwise false.
     */
    isAssigned : function(value) {
        return (value != null);
    },

    /**
     * Returns true when value is undefined or null.
     * @this {Object}
     * @param {string|number|Object|null} value
     * @return {boolean} True if no value, otherwise false.
     */
    isNotAssigned : function(value) {
        return (value == null);
    },

    /**
     * Returns true when value is not undefined, null nor an empty string
     * @this {Object}
     * @param {string|number|Object|null} value
     * @return {boolean} True if not empty, otherwise false.
     */
    isNotEmpty : function(value) {
        return value != null && value != '';
    },

    /**
     * Returns true when value is undefined, null or an empty string
     * @this {Object}
     * @param {string|number|Object|null} value
     * @return {boolean} True if empty, otherwise false.
     */
    isEmpty : function(value) {
        return value == null || value == '';
    },

    /**
     * Returns true when value is true
     * @this {Object}
     * @param {string|number|Object|null} value
     * @return {boolean} True if value is true or 'T' or 'Y', otherwise false.
     */
    isTrue : function(value) {
        return (value === true || value === 'T' || value === 'Y');
    },
    /**
     * Return true when value is false
     * @this {Object}
     * @param {string|number|Object|null} value
     * @return {boolean} False if value is true or 'T' or 'Y', otherwise true.
     */
    isFalse : function(value) {
        return !ns.isTrue(value);
    },
    /**
     * Returns the first parameter if it is not undefined nor null,
     * otherwise returns the second parameter.
     * @this {Object}
     * @param {string|number|Object|null} value
     * @param {string|number|Object|null} valueIfNotAssigned
     * @return {string|number|Object|null} Value is returned if has been assigned, otherwise valueIfNotAssigned is returned.
     */
    nvl : function(value, valueIfNotAssigned) {
        return (value != null) ? value : valueIfNotAssigned;
    },

    /**
     * Add a trailing character to text if it does not exists.
     * @param {string} value Text string
     * @param {string} ch Character to add, if it does not exists at end of text.
     * @return {string} Text string
     */
    addLastChar : function(value, ch) {
        value = ns.trim(value);
        if (value.charAt(value.length - 1) != ch) {
            value += ch;
        }
        return value;
    },

    /**
     * Return text field if it is not null, otherwise returns value field from search result (nlobjSearchResult).
     * @param {Object} rec Search result record (nlobjSearchResult).
     * @param {string} field Field name
     * @return {Object|string|number|null} Value of field
     */
    getSearchField : function(rec, field) {
        var value = rec.getText(field);
        if (value == null) {
            value = rec.getValue(field);
        }
        return value;
    },

    /**
     * Return text field if it is not null, otherwise returns value field from record (nlobjRecord).
     * @param {Object} rec Search result record (nlobjRecord).
     * @param {string} field Field name
     * @return {Object|string|number|null} Value of field
     */
    getRecordField : function(rec, field) {
        var value = rec.getFieldText(field);
        if (value == null) {
            value = rec.getFieldValue(field);
        }
        return value;
    },

    /**
     * Return Array of text fields if it is not null, otherwise returns values field from record (nlobjRecord).
     * @param {Object} rec Search result record (nlobjRecord).
     * @param {string} field Field name
     * @return {Array|null} Array of values of field
     */
    getRecordFields : function(rec, field) {
        var value = rec.getFieldTexts(field);
        if (value == null) {
            value = rec.getFieldValues(field);
        }
        return value;
    },

    /**
     * Get field text/value based on given parameters.
     * @this {Object}
     * @param {string} recType Record Type
     * @param {number} recId Record Id
     * @param {string} fieldName Name of field in record.
     * @param {boolean} asValue Force to return value instead of text. Used to get internal ids.
     * @param {boolean} asFormatted Formatted value. Optional. Default to true.
     * @return {string|Object|number|null} Value
     */
    _getSingleField : function(recType, recId, fieldName, asValue, asFormatted) {
        if (recId == null) {
            //this is a special case, it means that for rec.field1.field2.field3
            //somewhere the field value is empty and not necessarily that field name is invalid
            //return empty string in this case because it means unpopulated value
            return '';
            //throw 'ns._getSingleField: Null internal id encountered for '+fieldName+' for '+recType+'.';
        }
        var value = null;
        var key = recId + '|' + recType;
        var rec = null;
        if (ns.isAssigned(ns._records[key])) {
            rec = ns._records[key];
        } else {
            rec = nlapiLoadRecord(recType, recId);
            //caching
            ns._records[key] = rec;
        }
        if (rec) {
            if (ns.isNotAssigned(asFormatted)) {
                asFormatted = true;
            }
            var col = rec.getField(fieldName);
            if (col) { //check if valid field name
                if (asValue === true) {
                    value = rec.getFieldValue(fieldName);
                } else {
                    value = ns.getRecordField(rec, fieldName);
                    if (asFormatted) {
                        value = ns.format(col.getType(), col.getName(), value);
                    }
                }
            } else {
                try {
                    var res = nlapiSearchRecord(recType, null,
                                    [ new nlobjSearchFilter("internalid", null, "is", recId) ],
                                    [ new nlobjSearchColumn(fieldName, null) ]);
                    if (res) {
                        if (asValue === true) {
                            value = rec.getValue(fieldName);
                        } else {
                            value = ns.getSearchField(res[0], fieldName);
                            if (asFormatted) {
                                value = ns.format(((res[0].getAllColumns())[0]).type, fieldName, value);
                            }
                        }
                    }
                } catch (e) {
                    //throw 'ns._getSingleField: Invalid field name '+fieldName+' for '+recType+' with internal id '+recId+'.';
                    value = null;
                }
            }
        }
        return value;
    },

    /**
     * Recursive parsing of rec.field.field.field
     * @this {Object}
     * @param {string} recordType
     * @param {number} recordId
     * @param {string} token "field.subfield" format (no prefix, no curly brackets)
     * @param {boolean} asValue Optional.
     * @param {boolean} asFormatted Optional.
     * @returns {string|number|Object|null} Record value
     */
    getField : function(recordType, recordId, token, asValue, asFormatted) {
        if (recordId == null) {
            return '';
        }
        var value = null, pos = token.indexOf(ns._fieldSeparator);
        if (pos == -1) { //rec.field
            return ns._getSingleField(recordType, recordId, token, asValue, asFormatted);
        } else {
            var field = token.substring(0, pos), subField = token.substring(pos + 1), fieldRecType = null, posSep = field
                            .indexOf(ns._recordTypeSeparator), posNext = subField.indexOf(ns._fieldSeparator);
            if (posSep > -1) { //has #
                fieldRecType = field.substring(posSep + 1);
                field = field.substring(0, posSep);
            } else {
                if (field == 'entity') {
                    fieldRecType = ns._entityType[recordType];
                } else {
                    fieldRecType = ns._fieldType[field];
                }
            }
            if (fieldRecType == null) {
                throw 'ns.getField: Unknown record type for ' + field + ' in token "' + token
                                + '". Try using {rec.field#rectype.subfield} instead.';
            }
            if (posNext == -1) { //rec.field.subfield
                return ns._getSingleField(fieldRecType, ns._getSingleField(recordType, recordId, field, true,
                                false), subField, asValue, asFormatted);
            } else { //rec.field.subfield.nextsubfield
                return ns.getField(fieldRecType, ns._getSingleField(recordType, recordId, field, true, false),
                                subField, asValue);
            }
        }
    },

    /**
     * Get file content (text) from file cabinet
     * @param {number} fileId File Id
     * @return {string} Text content
     */
    getFileContent : function(fileId) {
        return nlapiLoadFile(fileId).getValue();
    },

    /**
     * Get file URL for file in file cabinet
     * @param {number} fileId File Id
     * @return {string} URL
     */
    getFileUrl : function(fileId) {
        return ns._website + nlapiLoadFile(fileId).getURL();
    },

    /**
     * List out members of an object or items of an array for debugging purpose.
     * @this {Object}
     * @param {Array|Object} obj Array or object whose values to list.
     * @param {number=} max Maximum number of levels. Optional. Defaults to 10.
     * @param {number=} level Current level. Optional. Used by function only, not passed by user.
     * @return {string} Content of object or array as JSON string
     */
    dump : function(obj, max, level) {
        level = (level == null) ? 1 : level + 1;
        max = (max == null) ? 10 : max;
        var str = [];
        if (obj == null) {
            str.push("null");
        } else {
            if (typeof obj == "object") {
                if (level > max) {
                    str.push("[object]");
                } else {
                    var isArray = (obj instanceof Array);
                    str.push((isArray) ? "[ " : "{ ");
                    var first = true;
                    for ( var prop in obj) {
                        var val = ns.dump(obj[prop], max, level);
                        if (first) {
                            first = false;
                        } else {
                            str.push(", ");
                        }
                        if (isArray) {
                            str.push(val);
                        } else {
                            str.push("\n");
                            for ( var i = 0; i < level; i++) {
                                str.push("  ");
                            }
                            str.push(prop);
                            str.push(" : ");
                            str.push(val);
                        }
                    }
                    str.push((isArray) ? " ]" : " }");
                }
            } else {
                if (typeof obj == "string") {
                    str.push("'");
                    str.push(obj);
                    str.push("'");
                } else {
                    str.push(obj);
                }
            }
        }
        return str.join("");
    },

    /**
     * Recursively translates a JavaScript object into JSON string.
     * Limitation: object must not reference itself, this will cause an endless loop.
     *
     * @param {Object} obj JavaScript object
     * @return {string} JSON string
     */
    objectToJson : function(obj) {
        var str = [];
        if (obj == null) {
            str.push('null');
        } else {
            if (typeof obj == "object") {
                var isArray = (obj instanceof Array);
                str.push((isArray) ? '[' : '{');
                var first = true;
                for ( var prop in obj) {
                    var val = ns.objectToJson(obj[prop]);
                    if (first) {
                        first = false;
                    } else {
                        str.push(',');
                    }
                    if (isArray) {
                        str.push(val); //array does not support string, only numbers
                    } else {
                        str.push(prop);
                        str.push(':');
                        str.push(val);
                    }
                }
                str.push((isArray) ? ']' : '}');
            } else {
                if (typeof obj == "string") {
                    str.push('"');
                    str.push(ns.stringToJson(obj));
                    str.push('"');
                } else {
                    str.push(obj);
                }
            }
        }
        return str.join("");
    },

    /**
     * Converts a JSON string to javascript object.
     *
     * @param {string} text JSON string
     * @return {Object} Javascript object
     */
    jsonToObject : function(text) {
        return eval('(' + text + ')');
    },

    /**
     * Return a formatted number.
     * This is a base function. Use the other wrapper functions that call this function for formatting.
     * @param {number} amount Amount
     * @param {string} currencyPrefix Currency char before amount, default to ''
     * @param {string} currencySuffix Currency char after amount, default to ''
     * @param {string} negativePrefix Negative char before amount, default to '('
     * @param {string} negativeSuffix Negative char after amount, default to ')'
     * @param {number} decimalPlaces Decimal places, default to 2
     * @param {string} thousandSeperator Thousand separator, default to comma ','
     * @param {string} decimalChar Decimal character, default to period '.'
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted number
     * @see ns.currency
     * @see ns.decimal
     * @see ns.integer
     * @see ns.euro
     * @see ns.gbp
     * @see ns.usd
     * @see ns.yen
     * @see ns.currencyZero
     * @see ns.decimalZero
     * @see ns.integerZero
     * @see ns.euroZero
     * @see ns.gbpZero
     * @see ns.usdZero
     * @see ns.yenZero
     */
    number : function(amount, currencyPrefix, currencySuffix, negativePrefix, negativeSuffix, decimalPlaces,
                      thousandSeperator, decimalChar, nullText) {
        //Original number formatting function code by Stephen Chapman, Modified by August Li
        //Source: http://javascript.about.com/library/blnumfmt.htm
        //copyright Stephen Chapman 24th March 2006, 22nd August 2008
        //permission to use this function is granted provided
        //that this copyright notice is retained intact
        if (ns.isEmpty(amount)) {
            return (nullText != null) ? nullText : '';
        }
        if (typeof amount == 'string') {
            amount = parseFloat(amount);
        }
        if (typeof amount != 'number') {
            throw nlapiCreateError('INVALID_AMOUNT', 'ns.number: Invalid amount: ' + amount);
        }
        if (ns.isNotAssigned(decimalPlaces)) {
            decimalPlaces = 2;
        }
        thousandSeperator = thousandSeperator!=null ? thousandSeperator : ',';
        decimalChar = decimalChar!=null ? decimalChar : '.';
        currencyPrefix = currencyPrefix != null ? currencyPrefix : '';
        currencySuffix = currencySuffix != null ? currencySuffix : '';
        negativePrefix = negativePrefix != null ? negativePrefix : '(';
        negativeSuffix = negativeSuffix != null ? negativeSuffix : ')';
        var x = (decimalPlaces === 0) ? amount : Math.round(amount * Math.pow(10, decimalPlaces));
        if (x >= 0) {
            negativePrefix = negativeSuffix = '';
        }
        var y = ('' + Math.abs(x)).split('');
        var z = y.length - decimalPlaces;
        if (decimalPlaces > 0) {
            if (z < 0) {
                z--;
            }
            for ( var i = z; i < 0; i++) {
                y.unshift('0');
            }
            if (z < 0) {
                z = 1;
            }
            y.splice(z, 0, decimalChar);
            if (y[0] == decimalChar) {
                y.unshift('0');
            }
        }
        while (z > 3) {
            z -= 3;
            y.splice(z, 0, thousandSeperator);
        }
        return currencyPrefix + negativePrefix + y.join('') + negativeSuffix + currencySuffix;
    },

    /**
     * Return formatted currency.
     * <pre>(999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted currency
     */
    currency : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '', '', '(', ')', 2, ',', '.', nullText);
    },

    /**
     * Return formatted currency with $ symbol.
     * <pre>($999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted currency
     */
    usd : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '$', '', '(', ')', 2, ',', '.', nullText);
    },

    /**
     * Return formatted currency with Euro symbol.
     * <pre>(&#8364;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted currency
     */
    euro : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '&#8364;', '', '(', ')', 2, ',', '.', nullText);
    },

    /**
     * Return formatted currency with GBP symbol.
     * <pre>(&#163;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted currency
     */
    gbp : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '&#163;', '', '(', ')', 2, ',', '.', nullText);
    },

    /**
     * Return formatted currency with Yen symbol.
     * <pre>(&#165;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    yen : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '&#165;', '', '(', ')', 2, ',', '.', nullText);
    },

    /**
     * Return formatted decimal.
     * <pre>-999,999.99</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted decimal
     */
    decimal : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '', '', '-', '', 2, ',', '.', nullText);
    },

    /**
     * Return formatted integer.
     * Column attribute compatible.
     * <pre>-999,999</pre>
     * @param {number} amount Amount to format.
     * @param {string} nullText Value to use when null.
     * @return {string} Formatted integer
     */
    integer : function(amount, nullText) {
        //customize your report here
        return ns.number(amount, '', '', '-', '', 0, ',', '.', nullText);
    },

    /**
     * Return formatted currency, null is displayed as zero.
     * <pre>(999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    currencyZero : function(amount) {
        //customize your report here
        return ns.number(amount, '', '', '(', ')', 2, ',', '.', '0.00');
    },

    /**
     * Return formatted currency with $ symbol, null is displayed as zero.
     * <pre>($999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    usdZero : function(amount) {
        //customize your report here
        return ns.number(amount, '$', '', '(', ')', 2, ',', '.', '$0.00');
    },

    /**
     * Return formatted currency with Euro symbol, null is displayed as zero.
     * <pre>(&#8364;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    euroZero : function(amount) {
        //customize your report here
        return ns.number(amount, '&#8364;', '', '(', ')', 2, ',', '.', '&#8364;0.00');
    },

    /**
     * Return formatted currency with GBP symbol, null is displayed as zero.
     * <pre>(&#163;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    gbpZero : function(amount) {
        //customize your report here
        return ns.number(amount, '&#163;', '', '(', ')', 2, ',', '.', '&#163;0.00');
    },

    /**
     * Return formatted currency with Yen symbol, null is displayed as zero.
     * <pre>(&#165;999,999.99)</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted currency
     */
    yenZero : function(amount) {
        //customize your report here
        return ns.number(amount, '&#165;', '', '(', ')', 2, ',', '.', '&#165;0.00');
    },

    /**
     * Return formatted decimal, null is displayed as zero.
     * <pre>-999,999.99</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted decimal
     */
    decimalZero : function(amount) {
        //customize your report here
        return ns.number(amount, '', '', '-', '', 2, ',', '.', '0.00');
    },

    /**
     * Return formatted integer, null is displayed as zero.
     * Column attribute compatible.
     * <pre>-999,999</pre>
     * @param {number} amount Amount to format.
     * @return {string} Formatted integer
     */
    integerZero : function(amount) {
        //customize your report here
        return ns.number(amount, '', '', '-', '', 0, ',', '.', '0');
    },

    /**
     * Return part of a string separated by a delimiter and indicated by the index.
     * Empty string is returned if string is null or index is invalid.
     *
     * @param {string,null} value
     * @param {string} delimiter
     * @param {number} index
     * @return {string} Substring of the value
     */
    split : function(value, delimiter, index) {
        if (value != null) {
            var arr = value.split(delimiter);
            if (arr.length > index) {
                return arr[index];
            } else {
                return '';
            }
        }
        return '';
    },

    /**
     * Pad a string with specified character.
     * @param {string|number} value
     * @param {number} count Positive will pad on left side. Negative will pad on right side.
     * @param {string} padChar
     * @return {string} Padded value
     */
    pad : function(value, count, padChar) {
        if (ns.isAssigned(value)) {
            var filler = (new Array(Math.abs(count) - String(value).length + 1)).join(padChar);
            if (count > 0) {
                value = filler + value;
            } else {
                value = value + filler;
            }
            return value;
        } else {
            return '';
        }
    },

    /**
     * Internal function.
     * Used by date. Faster than using generic pad function.
     * @param {string|number} value
     * @param {boolean=} Whether to zero pad or not. Default is true.
     * @return {string} Padded value
     */
    _zeroPad : function(value, isZeroPad) {
        return (isZeroPad===false) ? value : ns.pad(value, 2, '0');
    },

    /**
     * Format a date according to given format.
     * Use ns.nsDate for dates from NetSuite.
     * <pre>
     * Format symbols:
     *    MM, MON, MONTH = Month
     *    mm = minutes
     *    YY, YYYY = Year
     *    DD = day
     *    DOW, DAYOFWEEK = day of week
     *    HH = hour
     *    HH24 = 24 hour
     *    SS = seconds
     *    AM, PM = am or pm
     * </pre>
     * @this {Object}
     * @param {string|Date} dateToFormat Date to format.
     * @param {string} formatString Format string.
     * @param {boolean} isZeroPad Optional. Default is true.
     * @return {string} Formatted date
     * @see ns.nsDate
     */
    date : function(dateToFormat, formatString, isZeroPad) {
        var text = '';
        if (ns.isAssigned(dateToFormat)) {
            if (typeof dateToFormat == 'string') {
                dateToFormat = Date.parse(dateToFormat);
            }
            if (!(typeof dateToFormat == 'object' && dateToFormat instanceof Date)) {
                throw nlapiCreateError('NOT_DATE_OBJECT', 'ns.date: Not a date object.');
            } else if (ns.isNotAssigned(dateToFormat) || isNaN(dateToFormat.getTime())) {
                throw nlapiCreateError('INVALID_DATE', 'ns.date: Invalid date parameter.');
            }
            if (ns.isNotAssigned(formatString)) {
                formatString = "MM-DD-YYYY";
                if (ns.isNotAssigned(formatString)) {
                    throw nlapiCreateError('MISSING_DATE_FORMAT', 'ns.date: No format assigned.');
                }
            }
            var day = dateToFormat.getDate(), dow = dateToFormat.getDay(), month = dateToFormat.getMonth() + 1, year = dateToFormat
                            .getFullYear(), hours = dateToFormat.getHours(), mins = dateToFormat.getMinutes(), secs = dateToFormat
                            .getSeconds(), ampm = (hours >= 12) ? "pm" : "am", hrs = (hours >= 12) ? hours - 12 : hours;
            if (hrs == 0) {
                hrs = 12;
            }
            text = formatString;
            text = text.replace(/(HH24|HH|mm|ss|SS|DD|YYYY|YY|MM|MONTH|Month|MON|Mon|DAYOFWEEK|DayOfWeek|DOW|Dow|AM|PM|am|pm)/g,
                        function(match) {
                            var len = match.length;
                            if (len == 2) {
                                if (match == 'DD') {
                                    return ns._zeroPad(day, isZeroPad);
                                } else if (match == 'YY') {
                                    return year.toString().substring(2);
                                } else if (match == 'MM') {
                                    return ns._zeroPad(month, isZeroPad);
                                } else if (match == 'HH') {
                                    return ns._zeroPad(hrs, isZeroPad);
                                } else if (match == 'mm') {
                                    return ns._zeroPad(mins, true);
                                } else if (match == 'SS' || match == 'ss') {
                                    return ns._zeroPad(secs, true);
                                } else if (match == 'am' || match == 'pm') {
                                    return ampm;
                                } else if (match == 'AM' || match == 'PM') {
                                    return ampm.toUpperCase();
                                }
                            } else if (len == 3) {
                                if (match == 'DOW') {
                                    return (ns._days[dow].substring(0, 3)).toUpperCase();
                                } else if (match == 'Dow') {
                                    return ns._days[dow].substring(0, 3);
                                } else if (match == 'MON') {
                                    return (ns._months[month - 1].substring(0, 3))
                                                    .toUpperCase();
                                } else if (match == 'Mon') {
                                    return ns._months[month - 1].substring(0, 3);
                                }
                            } else if (len == 4) {
                                if (match == 'HH24') {
                                    return ns._zeroPad(hours, isZeroPad);
                                } else if (match == 'YYYY') {
                                    return year;
                                }
                            } else if (match == 'MONTH') {
                                return (ns._months[month - 1]).toUpperCase();
                            } else if (match == 'Month') {
                                return ns._months[month - 1];
                            } else if (match == 'DAYOFWEEK') {
                                return (ns._days[dow]).toUpperCase();
                            } else if (match == 'DayOfWeek') {
                                return ns._days[dow];
                            }
                        });
        }
        return text;
    },

    /**
     * NetSuite date. Use this for values from NetSuite.
     * @param {string} dateToFormat NetSuite date (from saved search)
     * @param {string} formatString Format string. Optional.
     * @return {string} Formatted date
     * @see ns.date
     */
    nsDate : function(dateToFormat, formatString) {
        return ns.date(nlapiStringToDate(dateToFormat), formatString);
    },

    /**
     * Escape XML.
     * @param {string} xmlText Text to escape
     * @return {string} Escaped XML
     */
    stringToXml : function(xmlText) {
        if (ns.isEmpty(xmlText) || typeof xmlText != 'string') {
            return xmlText;
        } else {
            //NetSuite returns text already escape for < >
            var sXml = xmlText.replace(/&gt;/g, ">");
            sXml = sXml.replace(/&lt;/g, "<");
            sXml = sXml.replace(/&apos;/g, "'");
            sXml = sXml.replace(/&quot;/g, '"');
            sXml = nlapiEscapeXML(sXml); // & %
            sXml = sXml.replace(/\n/g, "<br/>");
            return sXml;
        }
    },

    /**
    * Escapes the text for HTML display (Not for PDF output, use stringToXml for PDF instead)
    *
    * @param {string} text Text to display
    * @param {boolean} includeCRLF Whether to translate CRLF to BR. Default is false.
    * @return {string} Escaped text
    */
    stringToHtml : function(text, includeCRLF) {
        return (text && typeof text == 'string') ?
          text.replace(/('|"|\{|\}|\[|\]|\,|<|>|\n|\r)/g, function(match) {
                switch (match) {
                case "'": return '&#39;';
                case '"': return '&#34;';
                case '{': return '&#123;';
                case '}': return '&#125;';
                case '[': return '&#91;';
                case ']': return '&#93;';
                case ',': return '&#44;';
                case '<': return '&#60;';
                case '>': return '&#62;';
                }
                // cr lf
                return (includeCRLF===true) ? '<br/>' : '';
            }) : text;
    },

    /**
     * Escapes the quotes on JSON string
     *
     * @param {string} text Text to escape
     * @return {string} Escaped text
     */
    stringToJson : function(text) {
        return (text && typeof text == 'string') ? text.replace(/(\\|'|"|\n|\r)/g, function(match) {
                    switch(match) {
                    case '\\': return '\\\\';
                    case '"':  return '\\"';
                    case '\'': return "\\'";
                    case '\n': return '\\n';
                    case '\r': return '\\r';
                    }
                }) : text;
    },

    /**
     * Return 'Y' if value is true, 'T' or 'Y', otherwise 'N'.
     * @param {string|boolean} value Value to check.
     * @return {string} 'Y' or 'N'
     */
    yn : function(value) {
        return ns.isTrue(value) ? 'Y' : 'N';
    },

    /**
     * Return 'Yes' if value is true, 'T' or 'Y', otherwise 'No'.
     * @param {string|boolean} value Value to check.
     * @return {string} 'Yes' or 'No'
     */
    yesNo : function(value) {
        return ns.isTrue(value) ? 'Yes' : 'No';
    },

    /**
     * Return 'True' if value is true, 'T' or 'Y', otherwise 'False'.
     * @param {string|boolean} value Value to check.
     * @return {string} 'True' or 'False'
     */
    trueFalse : function(value) {
        return ns.isTrue(value) ? 'True' : 'False';
    },

    /**
     * Return several lines as a single line, carriage returns converted to spaces.
     *
     * @param {string} value Text with several lines
     * @return {string} Text as a single line
     */
    singleLine : function(value) {
        if (value) {
            return value.replace(/\n/g, ' ');
        }
        return value;
    },

    /**
     * Return as title case.
     * @param {string} text Text to change
     * @return {string} Text in title case
     */
    titleCase : function(text) {
        if (ns.isNotEmpty(text)) {
            text = text.charAt(0).toString().toUpperCase() + text.substring(1);
        }
        return text;
    },

    /**
     * Shorten name by removing parent prefix in NetSuite. (e.g. 'Acera : Acera Website' will become 'Acera Website')
     * @this {Object}
     * @param {string|Array} text String or array of strings to process.
     * @return {string|Array} Shortened string or array of strings.
     */
    noParent : function(text) {
        if (ns.isAssigned(text)) {
            if (typeof text == 'string') {
                var pos = text.lastIndexOf(':');
                if (pos > -1) {
                    return text.substring(pos + 2);
                }
            } else {
                for(var i = 0; i < text.length; i++) {
                    text[i] = ns.noParent(text[i]);
                }
            }
        }
        return text;
    },

    /**
     * Trim spaces from both ends of text
     * @param {string} text Text to trim
     * @return {string} Trimmed text
     */
    trim : function(text) {
        return (text!=null) ? ns.ltrim(ns.rtrim(text)) : text;
    },

    /**
     * Trim spaces at left side
     * @param {string} text Text to trim
     * @return {string} Trimmed text
     */
    ltrim : function(text) {
        return (text!=null) ? text.replace(/^\s\s*/, '') : text;
    },

    /**
     * Trim spaces at right side
     * @param {string} text Text to trim
     * @return {string} Trimmed text
     */
    rtrim : function(text) {
        return (text!=null) ? text.replace(/\s\s*$/, '') : text;
    },
 
    /**
     * Return default formatter function based on column type.
     * Note that some integers are returned as float when using formulas.
     * @this {Object}
     * @param {string} colType NetSuite column type (from saved search)
     * @param {string} colName Column name (only used to determine integer from float)
     * @return {function(string):string|function(number):string|function(Date):string|null} Formatter function
     */
    _getDefaultFormatter : function(colType, colName) {
        if (colType == 'currency' || colType == 'currency2') {
            return ns.currency;
        } else if (colType == 'checkbox') {
            return ns.yesNo;
        } else if (colType == 'integer') {
            return ns.integer;
        } else if (colType == 'date') {
            return ns.nsDate;
        } else if (colType == 'float') {
            var isInteger = false;
            if (colName != undefined) {
                isInteger = ns._integerFields[colName];
            }
            return (isInteger) ? ns.integer : ns.decimal;
        } else {
            return null;
        }
    },

    /**
     * Format value based on column type.
     * @this {Object}
     * @param {string} colType NetSuite column type (from saved search)
     * @param {string} colName Column name (only used to determine integer from float)
     * @param {string|number|Date} value Value to format
     * @return {string} Formatted value
     */
    format : function(colType, colName, value) {
        var f = ns._getDefaultFormatter(colType, colName);
        return (f == null) ? value : f(value);
    },

    /**
     * Return parameters of the current url as a hash map (object).
     *
     * @return {Object} Map of parameters and their values.
     */
    getUrlParameters: function(){
        var map = {};
        if (window && window.location) { //window object available only in client side, not in server side
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
                map[key] = value;
            });
        }
        return map;
    }

}

/**
 * @namespace UI Helper object for adding buttons and launching suitelets in User Scripts (beforeLoad events). Singleton.
 *
 * <pre>function beforeLoad(type, form) {
 *     ns.ui.init(type, form)
 *       .setCondition(function(){   //user defined function to return true for conditional buttons
 *            return (nlapiGetFieldValue('custbody_dc_master')==nlapiGetRecordId());
 *        })
 *       .addButton('Generate Quote PDF', '_dc_quote_suitelet');
 * }
 * </pre>
 *
 * Using parameters:
 * <pre>
 *    ns.ui.init(type, form)
 *    .setParameters(['report=summary'])
 *    .addButton('Print Summary', '_invoice_pdf')
 *    .setParameters(['report=detail'])
 *    .addButton('Print Detail', '_invoice_pdf');
 * </pre>
 * Literal values (with "=" sign):
 * <pre>setParameters(["report=summary"])    // custpage_report=summary will be added
 * </pre>
 * Field values (no "=" sign, field value will be taken from current record):
 * <pre>setParameters(["entity"])            // custpage_entity=&lt;entity internal id&gt; will be added
 * </pre>
 * @typedef {Object}
 */
ns.ui = {
    _nsType : null,
    _nsForm : null,
    _recType : null,
    _recId : null,
    _func : [],
    _params : [],
    /**
     * @constant
     * @public
     * @memberOf ns.ui
     */
    NEW_TAB : 0,
    /**
     * @constant
     * @public
     * @memberOf ns.ui
     */
    NEW_WIN : 1,
    /**
     * @constant
     * @public
     * @memberOf ns.ui
     */
    THIS_WIN : 2,

    /**
     * Pass the type and form from BeforeLoad function.
     * This needs to be the first thing called and should be done only once during beforeLoad.
     * Required.
     * @this {Object}
     * @param {string} type Display type.
     * @param {Object} form NetSuite form object (nlobjForm).
     * @return {Object} UI Object
     */
    init : function(type, form) {
        this._nsType = type;
        this._nsForm = form;
        this._recId = nlapiGetRecordId();
        this._recType = nlapiGetRecordType();
        this._count = 0;
        this._func = null;
        this._params = null;
        return this;
    },

    /**
     * Set a function to return true when it is ok to display the button, false if not.
     * This needs to be done right before calling addButton, this is cleared right after.
     * Optional.
     * @this {Object}
     * @param {function():boolean} conditionFunc
     * @return {Object} UI Object
     */
    setCondition : function(conditionFunc) {
        this._func = conditionFunc;
        return this;
    },

    /**
     * Set additional parameters to pass to suitelet.
     * This needs to be done right before calling addButton, this is cleared right after.
     * You can use this to pass field values or literal values.
     * <pre>Literal values (with "=" sign):
     * setParameters(["report=summary"])    // custpage_report=summary will be added
     * Field values (no "=" sign, field value will be taken from current record):
     * setParameters(["entity"])            // custpage_entity=&lt;entity internal id&gt; will be added
     * </pre>
     *
     * Optional.
     * @this {Object}
     * @param {Array} parameters Array of parameters. All parameters will be prefixed with "custpage_"
     * @return {Object} UI Object
     */
    setParameters : function(parameters) {
        this._params = parameters;
        return this;
    },

    /**
     * Add a button to call a suitelet.
     * Can be called multiple times.
     * @this {Object}
     * @param {string} label Button Label. Required.
     * @param {string} suffix Common suffix for script, deployment and button ids. Required.
     * @param {boolean=} mode ui.NEW_TAB, ui.NEW_WIN or ui.THIS_WIN. Optional. Default to ui.NEW_TAB.
     * @param {Array=} aType Array of possible types under which the button will be shown. Optional. Defaults to view.
     * @return {Object} UI Object
     */
    addButton : function(label, suffix, mode, aType) {
        if (ns.arrayContains(ns.nvl(aType, [ 'view' ]), this._nsType)
                        && (this._func == null || (this._func != null && this._func() === true))) {
            var linkURL = [
                nlapiResolveURL('suitelet', 'customscript' + suffix, 'customdeploy' + suffix, null),
                "&custpage_nocache=", new Date().getTime(),
                "&custpage_rec_id=",
                this._recId,
                "&custpage_rec_type=",
                this._recType ], params = [];
            if (this._params != null) {
                if (this._nsType == 'view') {
                    for ( var i = 0; i < this._params.length; i++) {
                        if (this._params[i].indexOf('=') == -1) {
                            params = params.concat([
                                "&custpage_",
                                this._params[i],
                                "=",
                                escape(nlapiGetFieldValue(this._params[i])) ]);
                        } else {
                            params.push("&custpage_" + this._params[i]);
                        }
                    }
                    params.push("'");
                } else {
                    for ( var i = 0; i < this._params.length; i++) {
                        if (params.length > 0) {
                            params.push("+'");
                        }
                        if (this._params[i].indexOf('=') == -1) {
                            params = params.concat([
                                "&custpage_",
                                this._params[i],
                                "='+escape(nlapiGetFieldValue('",
                                this._params[i],
                                "'))" ]);
                        } else {
                            params.push("&custpage_" + this._params[i]);
                        }
                    }
                }
            } else {
                linkURL.push("'");
            }
            var script = [];
            switch (ns.nvl(mode, this.NEW_TAB)) {
            case this.THIS_WIN:
                script.push("document.location='");
                script = script.concat(linkURL);
                script = script.concat(params);
                break;
            case this.NEW_WIN:
                script.push("window.open('");
                script = script.concat(linkURL);
                script = script.concat(params);
                script.push(", '', 'width=800, height=400, resizable=yes, scrollbars=yes')");
                break;
            default:
                script.push("window.open('");
                script = script.concat(linkURL);
                script = script.concat(params);
                script.push(", '_blank');");
            }
            this._nsForm.addButton('custpage' + suffix, label, script.join(''));
        }
        this._func = null;
        this._params = null;
        return this;
    }

};

/**
 * @class Load results from saved search into an array for later retrieval.
 * Intended for use with TableSearch.
 * @this {Object}
 * @param {string} savedSearchRecType
 * @param {string} savedSearchId
 * @param {Array} aSavedSearchFilters
 * @param {Array} aSavedSearchColumns
 * @return {Object} ArraySearch object
 */
ns.ArraySearch = function(savedSearchRecType, savedSearchId, aSavedSearchFilters, aSavedSearchColumns) {
    this._keySeparator = '|';
    this._savedSearchRecType = savedSearchRecType;
    this._savedSearchId = savedSearchId;
    this._aSavedSearchFilters = aSavedSearchFilters;
    this._aSavedSearchColumns = aSavedSearchColumns;
    return this;
}

/**
 * Get key separator.
 * @this {Object}
 */
ns.ArraySearch.prototype.getKeySeparator = function() {
    return this._keySeparator;
};

/**
 * Internal function.
 * @this {Object}
 * @param {Array} aColumns Array of column metadata.
 * @param {number|string} name Name or index of column.
 */
ns.ArraySearch.prototype._getColumn = function(aColumns, name) {
    var isNumber = !isNaN(name), len = aColumns.length;
    for ( var i = 0; i < len; i++) {
        if ((isNumber && i == name) || (!isNumber && aColumns[i].name == name)) {
            return aColumns[i];
        }
    }
    return null;
};

/**
 * Internal function.
 * @param {boolean|Object} value
 * @param {string} name
 * @param {boolean} defaultValue
 * @param {string} param
 * @return {boolean|Object|null}
 */
ns.ArraySearch.prototype._getSetting = function(value, name, defaultValue, param) {
    var t = (typeof value);
    if (t == 'boolean') {
        return value;
    } else if (t == 'object') {
        return (value[name]) ? value[name] : defaultValue;
    } else {
        throw nlapiCreateError('INVALID_SETTING', 'Invalid ' + param + ' parameter type to ArraySearch.');
    }
};

/**
 * Return all records in an (ordered) array. No keys are used. Array is accessed sequentially.
 * @this {Object}
 * @param {boolean} asIndividualArray Optional. If True, result is an object with each property named after the field name and the property is an array of values. (Useful when you need to get values as an array (e.g. array of internal ids) for another saved search.) Default is True.
 *                                    If False, result is an array of objects where each object and the object's property contains values for the fields.
 * @param {boolean|Object} asValue Optional. Get as value, not text. Default is to get as Text if available. Can be boolean (for all) or associated array (per column) e.g. { colName1: true, colName2: false }.
 * @param {boolean|Object} asFormatted Optional. True to format, otherwise false. Default is true. Can be boolean (for all) or associated array (per column) e.g. { colName1: true, colName2: false }.
 * @return {Array|null|Object} Array of objects containing all field values
 * <pre>//asIndividualArrray == true, each property corresponds to a field and is an array of values
 * for(var i=0; i&lt;output.length; i++) {
 *     alert(<b>output.fieldname[i]</b>);
 *     alert(<b>output.fieldname2[i]</b>);
 * }
 * //asIndividualArrray == false, output is an array of objects, each object (equivalent to a row) contains field values
 * for(var i=0; i&lt;output.length; i++) {
 *     alert(<b>(output[i]).fieldname</b>);
 *     alert(<b>(output[i]).fieldname2</b>);
 * }
 * </pre>
 * Note that fieldName will use Label (if available) over Name. Similar names will be suffixed with count (e.g. colName, colName2, colName3).
 * This behavior is different from TableSearch.
 */
ns.ArraySearch.prototype.search = function(asIndividualArray, asValue, asFormatted) {
    var result = null, aColumns = null, colCount = 0, isFirstRun = true, res = nlapiSearchRecord(
                    this._savedSearchRecType, this._savedSearchId, this._aSavedSearchFilters, this._aSavedSearchColumns);
    if (res) {
        if (ns.isNotAssigned(asIndividualArray)) {
            asIndividualArray = true;
        }
        if (ns.isNotAssigned(asFormatted)) {
            asFormatted = true;
        }
        if (ns.isNotAssigned(asValue)) {
            asValue = false;
        }
        result = (asIndividualArray) ? {} : [];
        var resLen = res.length;
        for ( var rowCount = 0; rowCount < resLen; rowCount++) {
            var rec = res[rowCount];
            if (isFirstRun) {
                aColumns = rec.getAllColumns();
                colCount = aColumns.length;
                isFirstRun = false;
            }
            var rowItem = {};
            for ( var i = 0; i < colCount; i++) {
                var col = aColumns[i], name = ns.nvl(col.label, col.name), baseName = name, count = 2;
                //ensure unique field names
                while (rowItem[name]) {
                    name = baseName + count;
                    count++;
                }
                var value = this._getSetting(asValue, name, false, 'asValue') ? rec.getValue(col) : ns.getSearchField(rec, col);
                value = this._getSetting(asFormatted, name, true, 'asFormatted') ? ns.format(col.type,
                                col.name, value) : value;
                rowItem[name] = value;
                if (asIndividualArray) {
                    if (result[name] == null) {
                        result[name] = [ value ];
                    } else {
                        (result[name]).push(value);
                    }
                }
            }
            if (asIndividualArray == false) {
                result.push(rowItem);
            }
        }
    }
    nlapiLogExecution('DEBUG', 'ArraySearch.searchSimple: search id=' + this._savedSearchId, (ns.dump(result))
                    .substring(0, 3000));
    return result;
};

/**
 * Perform a saved search and load the results into an associative array
 * with concatenated row and column keys for later retrieval.
 * Intended for use with TableSearch.
 * @this {Object}
 * @param {string} rowKey Row field (usually internalid) that
 *         will be used to form part of the index.
 * @param {null|Array|string} columnKey String or array of string
 *         with the first entry as column key and the succeeding
 *         fields as additional info that will be stored in
 *         columnValues. The values for column key will be stored
 *         in columnKeyValues.
 * @param {boolean|Object} asValue Get as value, not text. Default is to get as Text if available. Can be boolean (for all) or associated array (per column) e.g. { colName1: true, colName2: false }.
 * @param {boolean|Object} asFormatted True to format, otherwise false. Default is true. Can be boolean (for all) or associated array (per column) e.g. { colName1: true, colName2: false }.
 * @return {Object|null} Returns an associative array. The following functions
 * <table width="100%">
 * <tr><td width="150px">rowKey</td><td>Row field used in creating index</td></tr>
 * <tr><td valign="top">columnKey</td><td>Column field used in creating index</td></tr>
 * <tr><td valign="top">data</td><td>Array of object containing all record fields
 *   with concatenated row (and column, if specified) values as index.
 *   This is an associative array order is not preserved.<br/>
 *   Use data[key] to access an item or use For In loop to iterate.<br/>
 * <pre>for(var key in output.data) {
 *     alert(output.data[key]);
 * }</pre></td></tr>
 * <tr><td valign="top">columnKeyValues</td><td>Array of column key value.
 *   Order is preserved since this is a normal array.<br/>
 * <pre>for(var i=0; i&lt;output.columnKeyValues.length; i++) {
 *      alert(output.columnKeyValues[i]);
 * }</pre></td><tr>
 * <tr><td valign="top">columnValues</td><td>Array of objects containing the column key value and
 *   other column values (when columnKey parameter is an array).
 *   Order is matched to columnKeyValues array, but you need to access this with a fieldname aside from the index.
 *   This will be null if column key is string.
 * <pre>for(var i=0; i&lt;output.columnValues.length; i++) {
 *      alert(output.columnValues[i]['fieldname']);
 * }</pre>
 * </td></tr>
 * </table>
 * Note that fieldName will use Label (if available) over Name. Similar names will be suffixed with count (e.g. colName, colName2, colName3).
 * This behavior is different from TableSearch.
 */
ns.ArraySearch.prototype.keyedSearch = function(rowKey, columnKey, asValue, asFormatted) {
    var result = {}, isNull = ns.isNotAssigned(columnKey), isArray = (typeof columnKey == 'object' && columnKey instanceof Array), colKey = (isNull) ? null
                    : ((isArray) ? columnKey[0] : columnKey), colKeyValues = [], colKeySecondaryValues = (isNull) ? null
                    : ((isArray) ? [] : null), aColumns = null, colCount = 0, isFirstRun = true, colKeyObj = null, rowKeyObj = null, colKeyLen = (isNull) ? 0
                    : columnKey.length, colItemObj = (isNull) ? null : new Array(colKeyLen), res = nlapiSearchRecord(
                    this._savedSearchRecType, this._savedSearchId, this._aSavedSearchFilters, this._aSavedSearchColumns);
    if (res) {
        if (ns.isNotAssigned(asFormatted)) {
            asFormatted = true;
        }
        if (ns.isNotAssigned(asValue)) {
            asValue = false;
        }
        var resLen = res.length;
        for ( var rowCount = 0; rowCount < resLen; rowCount++) {
            var rec = res[rowCount];
            if (isFirstRun) {
                aColumns = rec.getAllColumns();
                rowKeyObj = this._getColumn(aColumns, rowKey);
                if (ns.isNotAssigned(rowKeyObj)) {
                    throw nlapiCreateError('INVALID_ROW_KEY', 'ArraySearch: Invalid row key: ' + rowKey);
                }
                colCount = aColumns.length;
                if (!isNull) {
                    colKeyObj = this._getColumn(aColumns, colKey);
                    if (ns.isNotAssigned(colKeyObj)) {
                        throw nlapiCreateError('INVALID_COLUMN_KEY', 'ArraySearch: Invalid column key: ' + colKey);
                    }
                    if (isArray) {
                        for ( var i = 0; i < colKeyLen; i++) {
                            colItemObj[i] = this._getColumn(aColumns, columnKey[i]);
                            if (ns.isNotAssigned(colItemObj[i])) {
                                throw nlapiCreateError('INVALID_COLUMN', 'ArraySearch: Invalid column: ' + columnKey[i]);
                            }
                        }
                    }
                }
                isFirstRun = false;
            }
            var key = rec.getValue(rowKeyObj);
            if (!isNull) {
                var colKeyValue = rec.getValue(colKeyObj);
                key += this.keySeparator + colKeyValue;
                if (!ns.arrayContains(colKeyValues, colKeyValue)) {
                    colKeyValues.push(colKeyValue);
                    if (isArray) {
                        var columnItem = {};
                        for ( var i = 0; i < colKeyLen; i++) {
                            columnItem[columnKey[i]] = ns.getSearchField(rec, colItemObj[i]);
                        }
                        colKeySecondaryValues.push(columnItem);
                    }
                }
            }
            var rowItem = new Object();
            for ( var i = 0; i < colCount; i++) {
                var col = aColumns[i], name = ns.nvl(col.label, col.name), baseName = name, count = 2;
                //ensure unique field names
                while (rowItem[name]) {
                    name = baseName + count;
                    count++;
                }
                var value = this._getSetting(asValue, name, false, 'asValue') ? rec.getValue(col) : ns.getSearchField(rec, col);
                rowItem[name] = this._getSetting(asFormatted, name, true, 'asFormatted') ? ns.format(
                                col.type, col.name, value) : value;
            }
            result[key] = rowItem;
        }
    }
    nlapiLogExecution('DEBUG', 'ArraySearch: search id=' + this._savedSearchId + ' rowKey=' + rowKey + ' columnKey='
                    + colKey, ('columnKeyValues=' + ns.dump(colKeyValues) + '<br/>' + 'columnValues='
                    + ns.dump(colKeySecondaryValues) + '<br/>' + 'data=' + ns.dump(result))
                    .substring(0, 3000));
    return {
        data : (result.length == 0) ? null : result,
        rowKey : rowKey,
        columnKey : colKey,
        columnKeyValues : colKeyValues,
        columnValues : colKeySecondaryValues
    };
};