/**
 * @file select两列显示扩展
 *
 * @author Ming Liu(liuming07@baidu.com)
 */

define(function (require) {
    var lib = require('fcui/lib');
    var ui = require('fcui/main');
    var Extension = require('fcui/Extension');
    var FcSelect = require('fcui/FcSelect');
    var helper = require('fcui/controlHelper');
    var Control = require('fcui/Control');
    var u = require('underscore');

    /**
     * 扩展FcSelect
     */
    function ExtendFcSelectTwoRow() {
        Extension.apply(this, arguments);
    }

    /**
     * 扩展名称
     * @type {String}
     */
    ExtendFcSelectTwoRow.prototype.type = 'FcSelectTwoRow'; 

    /**
     * 模板扩展
     * @type {String}
     */
    ExtendFcSelectTwoRow.prototype.itemTemplate = '<p style="position:relative;"><span title="${title}" style="display:inline-block;width:85%;">${text}</span><span style="display:inline-block;position:absolute;width:14%;text-align:right">${value}</span></p>';


    /**
     * 获取每个节点显示的内容扩展
     *
     * @param {meta.SelectItem} item 当前节点的数据项
     * @return {string} 返回HTML片段
     */
    ExtendFcSelectTwoRow.prototype.getItemHTML = function (item) {
        var isShowValue =
            this.main.getAttribute('data-ui-extension-fcselecttworow-showvalue-option');
        var text = u.escape(item.name || item.text);
        var data = {
            text: text.length > 20 ? text.substring(0, 20) + '...' : text,
            value: isShowValue === 'false' ? '' : u.escape(item.value),
            title: text
        };
        return lib.format(this.itemTemplate, data);
    };

    /**
     * 激活扩展
     */
    ExtendFcSelectTwoRow.prototype.activate = function () {
        var target = this.target;
        if (!(target instanceof FcSelect)) {
            return;
        }
        target.itemTemplate = this.itemTemplate;
        target.getItemHTML = this.getItemHTML;
        Extension.prototype.activate.apply(this, arguments);
    };

    /**
     * 取消扩展的激活状态
     */
    ExtendFcSelectTwoRow.prototype.inactive = function () {
        var target = this.target;
        if (!(target instanceof FcSelect)) {
            return;
        }
        Extension.prototype.inactivate.apply(this, arguments);
    };

    lib.inherits(ExtendFcSelectTwoRow, Extension);
    ui.registerExtension(ExtendFcSelectTwoRow);

    return ExtendFcSelectTwoRow;
});
