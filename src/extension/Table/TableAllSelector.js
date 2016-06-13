/**
 * @file fcui Table extension
 *     如果Table的select为multi，并且使用该extension，则table就有全选功能。
 *
 * @author Cory(kuanghongrui@baidu.com)
 */

define(function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var fcui = require('../../main');
    var Extension = require('../../Extension');
    var AllSelector = require('../../AllSelector');

    /**
     * 全选组件的宽度
     *
     * @const
     * @type {number}
     */
    var SELECT_ALL_WIDTH = 18;

    /**
     * 全选组件的高度
     *
     * @const
     * @type {number}
     */
    var SELECT_ALL_HEIGHT = 16;

    var TableAllSelector = fc.oo.derive(Extension, {
        /**
         * 类型声明
         * @type {string}
         */
        type: 'TableAllSelector',

        /**
         * 插件激活
         * @override
         */
        activate: function () {
            var me = this;
            var table = this.target;
            me._renderTableHead = table.renderHead;
            table.renderHead = function () {
                me._renderTableHead.apply(table, arguments);
                var coverHead = table.getCoverHead();
                if (table.select === 'multi') {
                    me.allSelector = me.renderAllSelector();
                    me.allSelector.on('change', _.bind(me.allSelectorChangeHandler, me));
                    table.on('rowselected', _.bind(me.rowSelectChangeHandler, me));
                    table.on('rowunselected', _.bind(me.rowSelectChangeHandler, me));
                    table.on('cancelselect', _.bind(me.cancleSelectHandler, me));
                    if (coverHead) {
                        me.coverAllSelector = me.renderAllSelector(coverHead);
                        me.coverAllSelector.set('value', me.allSelector.get('value'));
                        me.coverAllSelector.on('change', _.bind(me.coverAllSelectorChangeHandler, me));
                    }
                }
            };
        },

        /**
         * 渲染全选按钮
         * @param {HTMLElement} headNode 表头节点对象。
         * @return {AllSelector} 全选按钮
         */
        renderAllSelector: function (headNode) {
            var table = this.target;
            headNode = headNode || table.getHead();
            headNode.querySelectorAll('.ui-fctable-hcell .ui-fctable-select-all')[0].style.display = 'none';
            var allSelector = fcui.create('AllSelector', {
                width: SELECT_ALL_WIDTH,
                height: SELECT_ALL_HEIGHT
            });
            var hcellNode = headNode.querySelector('.ui-fctable-hcell .ui-fctable-hcell-text');
            hcellNode.className += ' ' + table.helper.getPartClasses('all-selector').join(' ');
            allSelector.appendTo(hcellNode);
            return allSelector;
        },

        /**
         *
         */
        coverAllSelectorChangeHandler: function () {
            this.allSelector.set('value', this.coverAllSelector.get('value'));
        },

        /**
         * 全选组件值的变化事件处理方法。
         * @param {Event} e e
         */
        allSelectorChangeHandler: function (e) {
            var table = this.target;
            var allSelector = this.allSelector;
            var selectedState = allSelector.get('value');
            var isSelectedAll = false;
            var selectedIndexTotal = 0;
            switch (selectedState) {
                case AllSelector.ALL_OPTIONS: // 全选
                    table.set('selectedIndex', -1);
                    isSelectedAll = true;
                    selectedIndexTotal = (table.summary || {}).totalCount || 0;
                    break;
                case AllSelector.CURRENT_PAGE_OPTIONS: // 当前页全选
                    table.set('selectedIndex', -1);
                    selectedIndexTotal = table.datasource.length;
                    break;
                case AllSelector.NONE_OPTION:
                    table.set('selectedIndex', []);
                    break;
                case AllSelector.SELECT_LESS_THAN_PAGE_OPTIONS:
                    selectedIndexTotal = table.selectedIndex.length;
                    break;
            }

            var coverAllSelector = this.coverAllSelector;
            if (coverAllSelector) {
                coverAllSelector.set('value', allSelector.get('value'));
            }

            if (selectedIndexTotal) {
                // 当前table的两层head，显示上层head的数目提示
                var selector = (coverAllSelector && coverAllSelector.layer.getZIndex() > allSelector.layer.getZIndex())
                    ? coverAllSelector
                    : allSelector;
                selector.set('count', selectedIndexTotal);
            }

            table.fire('selectall', {isSelectedAll: isSelectedAll});
        },

        /**
         * table行选择事件处理方法。
         * @param {Event} e e
         */
        rowSelectChangeHandler: function (e) {
            var table = this.target;
            var selectedIndex = table.get('selectedIndex');
            var allSelector = this.allSelector;
            var coverAllSelector = this.coverAllSelector;
            if (selectedIndex === -1 || selectedIndex.length) {
                var selectedIndexTotal = 0;
                if (selectedIndex === -1) {
                    selectedIndexTotal = table.datasource.length;
                }
                else {
                    selectedIndexTotal = selectedIndex.length;
                }
                var options = selectedIndexTotal === table.datasource.length
                    ? AllSelector.CURRENT_PAGE_OPTIONS
                    : AllSelector.SELECT_LESS_THAN_PAGE_OPTIONS;

                allSelector.set('value', options);
                if (coverAllSelector) {
                    coverAllSelector.set('value', options);
                }

                // 当前table的两层head，显示上层head的数目提示
                var selector = (coverAllSelector && coverAllSelector.layer.getZIndex() > allSelector.layer.getZIndex())
                    ? coverAllSelector
                    : allSelector;
                selector.set('count', selectedIndexTotal);
            }
            else {
                allSelector.set('value', AllSelector.NONE_OPTION);
                coverAllSelector && coverAllSelector.set('value', AllSelector.NONE_OPTION);
            }
        },

        /**
         * 取消全选和半选状态，供table之外对象调用。
         *     该方法被执行且生效的条件是table的所有行已被取消选中状态，即selectedIndex为空
         * @param {Event} e e
         */
        cancleSelectHandler: function (e) {
            var table = this.target;
            var selectedIndex = table.get('selectedIndex');
            if (selectedIndex && selectedIndex.length === 0) {
                var allSelector = this.allSelector;
                var coverAllSelector = this.coverAllSelector;

                allSelector.set('value', AllSelector.NONE_OPTION);
                coverAllSelector && coverAllSelector.set('value', AllSelector.NONE_OPTION);
            }
        }
    });
    fcui.registerExtension(TableAllSelector);
    return TableAllSelector;
});
