/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file
 * @author Han Bing Feng (hanbingfeng@baidu.com)
 */

define(function (require) {
    var _ = require('underscore');
    var Tab = require('fcui/main').alias('FcTab', require('esui/Tab'));

    /**
     * @property {Object} tabConfig
     * 配置一个tab
     *
     * @property {string} tabConfig.panel
     * tab所打开的panel名字
     *
     * @property {string} tabConfig.title
     * tab的显示名字
     */

    /**
     * 根据panel, 在tabsConfig中寻找对应名字, 返回其index
     * @param {string} panel
     * @param {Array<tabConfig>} tabsConfig
     * @return 找到的tab index, 或null, 如果没找到
     */
    Tab.getIndexForPanel = function (panel, tabsConfig) {
        var index = _.findIndex(tabsConfig, function(tabConfig) {
            return tabConfig.panel === panel;
        });

        if (index > -1) {
            return index;
        }

        return null;
    };

    return Tab;
});
