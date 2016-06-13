/**
 * FCUI (Fengchao UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 带出价系数的二级地域控件
 * @author Wang Yi(wangyi25@baidu.com)
 * @date Thu Jun 11 2015
 */

define(function (require) {
    var _ = require('underscore');
    var fc = require('fc-core');
    var ui = require('./main');
    var lib = require('./lib');
    var InputControl = require('./InputControl');

    var overrides = {
        /**
         * FcPriceFactorRegion控件的构造函数
         *
         * @constructor
         */
        constructor: function () {
            this.$super(arguments);
        },

        /**
         * 控件类型
         *
         * @type {string}
         */
        type: 'FcPriceFactorRegion',

        /**
         * 初始化控件需要使用的选项
         *
         * @override
         */
        initOptions: function (options) {
            /**
             * 默认选项配置
             */
            var properties = {
                /**
                 * 是否显示出价系数，默认显示
                 *
                 * @type {boolean}
                 */
                hasFactor: true,

                /**
                 * 是否显示地域状态图例，默认显示
                 *
                 * @type {boolean}
                 */
                hasLegend: true,

                /**
                 * 出价系数数据项，当hasFactor为true时有效
                 *
                 * @type {Array.<Object>}
                 */
                datasource: [],

                /**
                 * 已投放的地域id列表，当hasFactor为true时有效
                 *
                 * @type {Array.<number>}
                 */
                availableRegions: [],

                /**
                 * 已选地域列表每页显示的项目数，默认为10
                 *
                 * @type {number}
                 */
                selectedPageSize: 10,

                /**
                 * 已选择的地域id列表
                 *
                 * @type {Array.<number>}
                 */
                rawValue: []
            };
            this.helper.extractOptionsFromInput(this.main, properties);
            // 将字符串形式的值转为数组
            if (options.value) {
                options.rawValue = options.value.split(',');
            }
            _.extend(properties, options);
            // 将数据项数组转为以地域id为索引的map
            if (properties.hasFactor) {
                properties.datamap = _.indexBy(properties.datasource, 'regionId');
            }
            this.setProperties(properties);
        },

        /**
         * 初始化控件的DOM结构，仅在第一次渲染时调用
         *
         * @override
         */
        initStructure: function () {
            // 构建地域选择区域
            var selectorHtml = this.getRegionSelectorHtml();
            // 构建已选地域列表
            var listHtml = this.getSelectedRegionListHtml();
            this.main.innerHTML = [selectorHtml, listHtml].join('');
        },

        /**
         * 获取地域选择区域的HTML片段
         *
         * @return {string} 地域选择区域的HTML片段
         */
        getRegionSelectorHtml: function () {
            var me = this;
            var tplSelectorArea = '<div class="${selectorAreaClass}" id="${selectorAreaId}">${regionItems}</div>';
            // 依次构建每个区域下的内容
            var regionItemsHtml = _.reduce(FcPriceFactorRegion.REGION_LIST, function (memo, region) {
                memo.push(me.createRegionItem(region));
                return memo;
            }, [])
            return lib.format(tplSelectorArea, {
                selectorAreaClass: me.helper.getPartClasses('selector-area').join(' '),
                selectorAreaId: me.helper.getId('selector-area'),
                regionItems: regionItemsHtml.join('')
            });
        },

        /**
         * 创建各区域的DOM结构
         *
         * @param {Object} region 区域对象
         * @param {string} region.id 区域id
         * @param {string} region.text 区域名称
         * @param {Array.<Object>} region.provinces|region.children 区域下的一级地域列表
         * @return {string} 区域的HTML片段
         */
        createRegionItem: function (region) {
            var me = this;
            var tplRegionItem = [
                '<div class="${regionItemClass}">',
                    '<div class="${regionNameClass}" value="${regionId}">${regionName}</div>',
                    '<div class="${regionProvincesClass}">${provinces}</div>',
                '</div>'
            ].join('');
            var subRegions = region.provinces || region.children;
            // 依次构建每个一级地域选项
            var provincesHtml = _.reduce(subRegions, function (memo, item) {
                memo.push(me.createProvinceItem(item));
                return memo;
            }, []);
            return lib.format(tplRegionItem, {
                regionItemClass: me.helper.getPartClasses('region-item').join(' '),
                regionNameClass: me.helper.getPartClasses('region-name').join(' '),
                regionProvincesClass: me.helper.getPartClasses('region-provinces').join(' '),
                regionId: region.id,
                regionName: region.text,
                provinces: provincesHtml.join('')
            });
        },

        /**
         * 创建一级地域的DOM结构
         *
         * @param {Object} province 一级地域对象
         * @param {number} province.id 一级地域id
         * @param {string} province.text 一级地域名称
         * @param {Array.<Object>=} province.cities 一级地域下的二级地域列表
         * @return {string} 一级地域的HTML片段
         */
        createProvinceItem: function (province) {
            var tplProvinceItem = [
                '<div class="${provinceItemClass}">',
                    '<div class="${provinceInfoClass}" data-region-level="1" data-region-id="${provinceId}">',
                        '<span class="${provinceNameClass}" title="${provinceNameTitle}">${provinceName}</span>',
                        '${regionFactor}',
                    '</div>',
                    '${citiesLayer}',
                '</div>'
            ].join('');
            var citiesLayer = '';
            // 构建二级地域浮层
            if (province.cities && province.cities.length) {
                citiesLayer = this.createCitiesLayer(province.cities, province.id);
            }
            var provinceInfoClass = this.helper.getPartClasses('province-info');
            var regionFactor = '';
            // 设置一级地域的出价系数与投放状态
            if (this.hasFactor) {
                regionFactor = this.getFactorContent(province);
                if (_.contains(this.availableRegions, province.id)) {
                    provinceInfoClass = provinceInfoClass.concat(this.helper.getPartClasses('region-available'));
                } else {
                    provinceInfoClass = provinceInfoClass.concat(this.helper.getPartClasses('region-unavailable'));
                }
            }
            var titleSuffix = regionFactor.replace(/(<.+?>)/g, '');
            return lib.format(tplProvinceItem, {
                provinceItemClass: this.helper.getPartClasses('province-item').join(' '),
                provinceInfoClass: provinceInfoClass.join(' '),
                provinceNameClass: this.helper.getPartClasses('province-name').join(' '),
                provinceId: province.id,
                provinceName: province.text,
                provinceNameTitle: [province.text, titleSuffix].join(' '),
                regionFactor: regionFactor,
                citiesLayer: citiesLayer
            });
        },

        /**
         * 创建二级地域浮层的DOM结构
         *
         * @param {Array.<Object>} cities 二级地域列表
         * @param {number} provinceId 二级地域所属一级地域的id
         * @return {string} 二级地域浮层的HTML片段
         */
        createCitiesLayer: function (cities, provinceId) {
            var me = this;
            var tplCitiesLayer = '<div class="${citiesLayerClass}">${citiesLayerContent}</div>';
            var tplCityItem = [
                '<div class="${cityItemClass}" data-region-level="2" data-region-id="${cityId}">',
                    '<span class="${cityNameClass}" title="${cityNameTitle}">${cityName}</span>',
                    '${regionFactor}',
                '</div>'
            ].join('');
            // 依次构建二级地域的选项
            var citiesLayerContentHtml = _.reduce(cities, function (memo, city) {
                var cityItemClass = me.helper.getPartClasses('city-item');
                var regionFactor = '';
                // 设置二级地域的出价系数与投放状态
                if (me.hasFactor) {
                    regionFactor = me.getFactorContent(city);
                    if (_.contains(me.availableRegions, provinceId)
                        || _.contains(me.availableRegions, city.id)) {
                        cityItemClass = cityItemClass.concat(me.helper.getPartClasses('region-available'));
                    } else {
                        cityItemClass = cityItemClass.concat(me.helper.getPartClasses('region-unavailable'));
                    }
                }
                var titleSuffix = regionFactor.replace(/(<.+?>)/g, '');
                memo.push(lib.format(tplCityItem, {
                    cityItemClass: cityItemClass.join(' '),
                    cityNameClass: me.helper.getPartClasses('city-name').join(' '),
                    cityId: city.id,
                    cityName: city.text,
                    cityNameTitle: [city.text, titleSuffix].join(' '),
                    regionFactor: regionFactor
                }));
                return memo;
            }, []);
            return lib.format(tplCitiesLayer, {
                citiesLayerClass: me.helper.getPartClasses('province-cities-layer').join(' '),
                citiesLayerContent: citiesLayerContentHtml.join('')
            });
        },

        /**
         * 获取地域出价系数相关HTML内容
         *
         * @param {Object} region 地域对象
         * @param {number} region.id 地域id
         * @param {string} region.text 地域名称
         * @param {Array.<Object>=} region.cities 城市列表，仅一级地域有
         * @return {string} 地域出价系数相关HTML内容
         */
        getFactorContent: function (region) {
            var me = this;
            var regionFactorContent = '';
            var tplRegionFactor = [
                '<span class="${regionFactorClass}">',
                    '${regionFactor}',
                '</span>'
            ].join('');
            var regionData = me.datamap[region.id];
            if (regionData) {
                // 设置的有出价系数，则显示该系数
                regionFactorContent = regionData.factor;
            } else if (region.cities && !_.contains(me.availableRegions, region.id)) {
                // 如果是未投放的一级地域，且其下有投放中的二级地域，则显示二级地域的投放情况
                var totalCitiesCount = region.cities.length;
                var availableCitiesCount = _.filter(region.cities, function (city) {
                    return _.contains(me.availableRegions, city.id);
                }).length;
                regionFactorContent = availableCitiesCount > 0
                    ? ('<em>' + availableCitiesCount + '</em>/' + totalCitiesCount) : '';
            }
            if (!regionFactorContent) {
                return '';
            }
            return lib.format(tplRegionFactor, {
                regionFactorClass: me.helper.getPartClasses('region-factor').join(' '),
                regionFactor: regionFactorContent
            });
        },

        /**
         * 获取已选地域列表的HTML片段
         *
         * @return {string} 已选地域列表的HTML片段
         */
        getSelectedRegionListHtml: function () {
            var tplSelectedList = [
                '<div class="${selectedListClass}">',
                    '<div class="${selectedListTitleClass}">已选地域：</div>',
                    '<div class="${selectedListViewerClass}">',
                        '<div class="${selectedListViewerLeftClass}">',
                            '<span class="font-icon font-icon-largeable-caret-left"></span>',
                        '</div>',
                        '<div class="${selectedListViewerContentClass}" id="${selectedListViewerContentId}"',
                            ' data-current-page="0"></div>',
                        '<div class="${selectedListViewerRightClass}">',
                            '<span class="font-icon font-icon-largeable-caret-right"></span>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');
            var selectedListHtml = lib.format(tplSelectedList, {
                selectedListClass: this.helper.getPartClasses('selected-list').join(' '),
                selectedListTitleClass: this.helper.getPartClasses('selected-list-title').join(' '),
                selectedListViewerClass: this.helper.getPartClasses('selected-list-viewer').join(' '),
                selectedListViewerLeftClass: this.helper.getPartClasses('selected-list-viewer-left').join(' '),
                selectedListViewerRightClass: this.helper.getPartClasses('selected-list-viewer-right').join(' '),
                selectedListViewerContentClass: this.helper.getPartClasses('selected-list-viewer-content').join(' '),
                selectedListViewerContentId: this.helper.getId('selected-list-viewer-content')
            });
            var html = [selectedListHtml];
            // 构建地域状态图例内容
            if (this.hasLegend) {
                var tplSelectorLegend = [
                    '<div class="${selectorLegendClass}">',
                        '<span class="${legendColorClass} ${legendUnavailableColorClass}"></span>',
                        '<span class="${legendTextClass}">未投放地区</span>',
                        '<span class="${legendColorClass} ${legendAvailableColorClass}"></span>',
                        '<span class="${legendTextClass}">已投放地区</span>',
                        '<span class="${legendColorClass} ${legendSelectedColorClass}"></span>',
                        '<span class="${legendTextClass}">已选择地区</span>',
                    '</div>'
                ].join('');
                var legendHtml = lib.format(tplSelectorLegend, {
                    selectorLegendClass: this.helper.getPartClasses('selector-legend').join(' '),
                    legendColorClass: this.helper.getPartClasses('selector-legend-color').join(' '),
                    legendUnavailableColorClass: this.helper.getPartClasses('selector-legend-color-unavailable').join(' '),
                    legendAvailableColorClass: this.helper.getPartClasses('selector-legend-color-available').join(' '),
                    legendSelectedColorClass: this.helper.getPartClasses('selector-legend-color-selected').join(' '),
                    legendTextClass: this.helper.getPartClasses('selector-legend-text').join(' ')
                });
                html.unshift(legendHtml);
            }
            return html.join('');
        },

        /**
         * 初始化与DOM元素的事件交互，仅在第一次渲染时调用
         */
        initEvents: function () {
            // 绑定地域点击选择事件
            this.helper.addDOMEvent(this.main, 'click', _.bind(this.regionSelectClickHandler, this));
            // 绑定地域列表点击删除事件
            this.helper.addDOMEvent(this.main, 'click', _.bind(this.regionDeleteClickHandler, this));
            // 绑定地域列表点击切换显示事件
            this.helper.addDOMEvent(this.main, 'click', _.bind(this.regionAlternationClickHandler, this));
        },

        /**
         * 地域点击选择事件处理
         *
         * @param {DOMEvent} event 点击事件
         */
        regionSelectClickHandler: function (event) {
            var target = event.target;
            while (target && target !== this.main) {
                // 判断是否为可点击的地域项
                if (lib.hasAttribute(target, 'data-region-id')
                    && lib.hasAttribute(target, 'data-region-level')
                    && !lib.hasClass(target, 'ui-fcpricefactorregion-selected-region-item')) {
                    // 若是带出价系数的地域控件，则判断该地域项是否处于投放中，只有投放中才可点击
                    if (this.hasFactor
                        && lib.hasClass(target, 'ui-fcpricefactorregion-region-unavailable')) {
                        return;
                    }
                    var region = {
                        id: target.getAttribute('data-region-id'),
                        level: target.getAttribute('data-region-level'),
                        name: target.firstChild.innerHTML
                    };
                    // 切换地域项选中状态
                    this.toggleSelectedRegionItem(target);
                    // 同步地域选中状态至已选列表
                    this.syncChangeToSelectedList(region);
                    // 同步地域状态至控件值
                    this.syncRawValue(region);
                }
                target = target.parentNode;
            }
        },

        /**
         * 切换地域项的选中状态
         *
         * @param {HTMLElement} target 点击的地域项元素
         */
        toggleSelectedRegionItem: function (target) {
            var provinceItemClasses = this.helper.getPartClasses('province-info');
            var cityItemClasses = this.helper.getPartClasses('city-item');
            var partClasses = lib.hasClass(target, provinceItemClasses[0])
                ? provinceItemClasses : cityItemClasses;
            _.each(partClasses, function (className) {
                var seletedClass = className + '-selected';
                lib.toggleClass(target, seletedClass);
            });
        },

        /**
         * 同步地域选中状态至已选列表
         *
         * @param {Object} region 点击的地域对象
         */
        syncChangeToSelectedList: function (region) {
            var selectedListViewerContent = this.helper.getPart('selected-list-viewer-content');
            var selectedItems = selectedListViewerContent.childNodes;
            var isSelected = false;
            // 判断已选列表中是否已经存在该地域，若存在，则从列表中删除
            if (selectedItems.length) {
                isSelected = _.some(selectedItems, function (item) {
                    var isSame = item.getAttribute('data-region-id') === region.id;
                    if (isSame) {
                        lib.removeNode(item);
                    }
                    return isSame;
                });
            }
            // 如果列表中不存在该地域，则添加至列表中
            if (!isSelected) {
                var tplSelectedItemContent = '<span class="${selectedItemNameClass}">${regionName}</span><span class="font-icon font-icon-times"></span>';
                var selectedItem = document.createElement('div');
                selectedItem.className = this.helper.getPartClasses('selected-region-item').join(' ');
                selectedItem.setAttribute('title', region.name);
                selectedItem.setAttribute('data-region-id', region.id);
                selectedItem.setAttribute('data-region-level', region.level);
                selectedItem.innerHTML = lib.format(tplSelectedItemContent, {
                    selectedItemNameClass: this.helper.getPartClasses('selected-region-item-name').join(' '),
                    regionName: region.name
                });
                selectedListViewerContent.appendChild(selectedItem);
            }
            // 刷新列表显示
            this.refreshSelectedList();
        },

        /**
         * 刷新已选地域列表
         */
        refreshSelectedList: function () {
            var me = this;
            var selectedList = me.helper.getPart('selected-list-viewer-content');
            var currentPage = +selectedList.getAttribute('data-current-page');
            var selectedItems = selectedList.childNodes
            var itemHideClasses = me.helper.getPartClasses('selected-region-item-hide');
            // 遍历已选的地域项，若处在当前页，则显示，否则隐藏
            _.each(selectedItems, function (item, index) {
                var targetPage = Math.floor(index / me.selectedPageSize);
                if (targetPage === currentPage) {
                    lib.removeClasses(item, itemHideClasses);
                } else {
                    lib.addClasses(item, itemHideClasses);
                }
            });
        },

        /**
         * 同步地域状态至控件值
         *
         * @param {Object} region 地域对象
         * @param {string} region.id 地域id
         */
        syncRawValue: function (region) {
            var regionId = +region.id;
            var rawValue = this.getRawValue();
            if (!_.contains(rawValue, regionId)) {
                rawValue.push(regionId);
            } else {
                rawValue = _.without(rawValue, regionId);
            }
            this.setRawValue(rawValue);
            this.fire('change');
        },

        /**
         * 地域列表点击删除事件处理
         *
         * @param {DOMEvent} event 点击事件
         */
        regionDeleteClickHandler: function (event) {
            var target = event.target;
            if (lib.hasClass(target, 'font-icon-times')) {
                var selectedItem = target.parentNode;
                var regionId = selectedItem.getAttribute('data-region-id');
                var selectorArea = this.helper.getPart('selector-area');
                var regionItem = selectorArea.querySelector('[data-region-id="' + regionId + '"]');
                this.toggleSelectedRegionItem(regionItem);
                lib.removeNode(selectedItem);
                this.refreshSelectedList();
                this.syncRawValue({id: regionId});
            }
        },

        /**
         * 地域列表点击切换显示事件
         *
         * @param {DOMEvent} event 点击事件
         */
        regionAlternationClickHandler: function (event) {
            var target = event.target;
            if (lib.hasClass(target, 'font-icon-largeable-caret-left')
                || lib.hasClass(target, 'font-icon-largeable-caret-right')) {
                var selectedList = this.helper.getPart('selected-list-viewer-content');
                var selectedItems = selectedList.childNodes;
                var currentPage = +selectedList.getAttribute('data-current-page');
                var totalPage = Math.ceil(selectedItems.length / this.selectedPageSize);
                var pageChange = lib.hasClass(target, 'font-icon-largeable-caret-right') ? 1 : -1;
                var targetPage = totalPage ? ((currentPage + pageChange) + totalPage) % totalPage : 0;
                selectedList.setAttribute('data-current-page', targetPage);
                this.refreshSelectedList();
            }
        },

        /**
         * 获取已选择的地域对象列表
         *
         * @return {Array.<Object>} 已选地域对象列表
         */
        getSelectedRegions: function () {
            var selectedList = this.helper.getPart('selected-list-viewer-content');
            var selectedRegions = _.map(selectedList.childNodes, function (item) {
                return {
                    id: +item.getAttribute('data-region-id'),
                    level: +item.getAttribute('data-region-level'),
                    name: item.firstChild.innerHTML
                };
            });
            return selectedRegions;
        }
    };

    /**
     * 带出价系数的二级地域控件类
     *
     * @class
     * @extends InputControl
     */
    var FcPriceFactorRegion = fc.oo.derive(InputControl, overrides);

    /**
     * 二级地域选项
     *
     * @const
     * @type {Array.<Object>}
     */
    FcPriceFactorRegion.REGION_LIST = [
        {
            id: 'NorthChina',
            text: '华北地区',
            provinces: [
                {
                    id: 1,
                    text: '北京'
                },
                {
                    id: 3,
                    text: '天津'
                },
                {
                    id: 13,
                    text: '河北',
                    cities: [
                        {id: 327, text: '石家庄'},
                        {id: 304, text: '保定'},
                        {id: 305, text: '沧州'},
                        {id: 306, text: '承德'},
                        {id: 330, text: '邯郸'},
                        {id: 332, text: '衡水'},
                        {id: 307, text: '廊坊'},
                        {id: 325, text: '秦皇岛'},
                        {id: 329, text: '唐山'},
                        {id: 326, text: '邢台'},
                        {id: 331, text: '张家口'}
                    ]
                },
                {
                    id: 26,
                    text: '山西',
                    cities: [
                        {id: 214, text: '太原'},
                        {id: 209, text: '长治'},
                        {id: 217, text: '大同'},
                        {id: 205, text: '晋城'},
                        {id: 206, text: '晋中'},
                        {id: 211, text: '临汾'},
                        {id: 210, text: '吕梁'},
                        {id: 213, text: '朔州'},
                        {id: 212, text: '忻州'},
                        {id: 215, text: '阳泉'},
                        {id: 216, text: '运城'}
                    ]
                },
                {
                    id: 22,
                    text: '内蒙古',
                    cities: [
                        {id: 167, text: '呼和浩特'},
                        {id: 159, text: '阿拉善盟'},
                        {id: 162, text: '巴彦淖尔'},
                        {id: 169, text: '包头'},
                        {id: 158, text: '赤峰'},
                        {id: 168, text: '鄂尔多斯'},
                        {id: 166, text: '呼伦贝尔'},
                        {id: 161, text: '通辽'},
                        {id: 164, text: '乌海'},
                        {id: 163, text: '乌兰察布'},
                        {id: 165, text: '锡林郭勒盟'},
                        {id: 160, text: '兴安盟'}
                    ]
                }
            ]
        },
        {
            id: 'NorthEast',
            text: '东北地区',
            provinces: [
                {
                    id: 21,
                    text: '辽宁',
                    cities: [
                        {id: 153, text: '沈阳'},
                        {id: 151, text: '鞍山'},
                        {id: 145, text: '本溪'},
                        {id: 147, text: '朝阳'},
                        {id: 155, text: '大连'},
                        {id: 144, text: '丹东'},
                        {id: 152, text: '抚顺'},
                        {id: 150, text: '阜新'},
                        {id: 157, text: '葫芦岛'},
                        {id: 146, text: '锦州'},
                        {id: 148, text: '辽阳'},
                        {id: 149, text: '盘锦'},
                        {id: 154, text: '铁岭'},
                        {id: 156, text: '营口'}
                    ]
                },
                {
                    id: 18,
                    text: '吉林',
                    cities: [
                        {id: 40, text: '长春'},
                        {id: 39, text: '白城'},
                        {id: 42, text: '白山'},
                        {id: 38, text: '吉林'},
                        {id: 41, text: '辽源'},
                        {id: 43, text: '四平'},
                        {id: 44, text: '松原'},
                        {id: 45, text: '通化'},
                        {id: 47, text: '延边'}
                    ]
                },
                {
                    id: 15,
                    text: '黑龙江',
                    cities: [
                        {id: 335, text: '哈尔滨'},
                        {id: 342, text: '大庆'},
                        {id: 343, text: '大兴安岭'},
                        {id: 344, text: '鹤岗'},
                        {id: 345, text: '黑河'},
                        {id: 333, text: '鸡西'},
                        {id: 334, text: '佳木斯'},
                        {id: 336, text: '牡丹江'},
                        {id: 337, text: '齐齐哈尔'},
                        {id: 338, text: '七台河'},
                        {id: 340, text: '双鸭山'},
                        {id: 339, text: '绥化'},
                        {id: 341, text: '伊春'}
                    ]
                }
            ]
        },
        {
            id: 'EastChina',
            text: '华东地区',
            provinces: [
                {
                    id: 2,
                    text: '上海'
                },
                {
                    id: 19,
                    text: '江苏',
                    cities: [
                        {id: 55, text: '南京'},
                        {id: 54, text: '常州'},
                        {id: 53, text: '淮安'},
                        {id: 57, text: '连云港'},
                        {id: 56, text: '南通'},
                        {id: 60, text: '宿迁'},
                        {id: 59, text: '苏州'},
                        {id: 61, text: '泰州'},
                        {id: 62, text: '无锡'},
                        {id: 58, text: '徐州'},
                        {id: 63, text: '盐城'},
                        {id: 64, text: '扬州'},
                        {id: 65, text: '镇江'}
                    ]
                },
                {
                    id: 32,
                    text: '浙江',
                    cities: [
                        {id: 280, text: '杭州'},
                        {id: 282, text: '湖州'},
                        {id: 273, text: '嘉兴'},
                        {id: 272, text: '金华'},
                        {id: 275, text: '丽水'},
                        {id: 276, text: '宁波'},
                        {id: 274, text: '衢州'},
                        {id: 277, text: '绍兴'},
                        {id: 279, text: '台州'},
                        {id: 278, text: '温州'},
                        {id: 281, text: '舟山'}
                    ]
                },
                {
                    id: 9,
                    text: '安徽',
                    cities: [
                        {id: 142, text: '合肥'},
                        {id: 128, text: '安庆'},
                        {id: 141, text: '蚌埠'},
                        {id: 143, text: '亳州'},
                        {id: 129, text: '巢湖'},
                        {id: 130, text: '池州'},
                        {id: 131, text: '滁州'},
                        {id: 140, text: '阜阳'},
                        {id: 127, text: '淮北'},
                        {id: 133, text: '淮南'},
                        {id: 132, text: '黄山'},
                        {id: 135, text: '六安'},
                        {id: 134, text: '马鞍山'},
                        {id: 137, text: '宿州'},
                        {id: 138, text: '铜陵'},
                        {id: 139, text: '芜湖'},
                        {id: 136, text: '宣城'}
                    ]
                },
                {
                    id: 5,
                    text: '福建',
                    cities: [
                        {id: 81, text: '福州'},
                        {id: 50, text: '龙岩'},
                        {id: 49, text: '南平'},
                        {id: 51, text: '宁德'},
                        {id: 48, text: '莆田'},
                        {id: 52, text: '泉州'},
                        {id: 66, text: '三明'},
                        {id: 70, text: '厦门'},
                        {id: 80, text: '漳州'}
                    ]
                },
                {
                    id: 20,
                    text: '江西',
                    cities: [
                        {id: 72, text: '南昌'},
                        {id: 78, text: '抚州'},
                        {id: 77, text: '赣州'},
                        {id: 68, text: '吉安'},
                        {id: 69, text: '景德镇'},
                        {id: 67, text: '九江'},
                        {id: 71, text: '萍乡'},
                        {id: 74, text: '上饶'},
                        {id: 73, text: '新余'},
                        {id: 75, text: '宜春'},
                        {id: 76, text: '鹰潭'}
                    ]
                },
                {
                    id: 25,
                    text: '山东',
                    cities: [
                        {id: 196, text: '济南'},
                        {id: 223, text: '滨州'},
                        {id: 200, text: '德州'},
                        {id: 220, text: '东营'},
                        {id: 222, text: '菏泽'},
                        {id: 197, text: '济宁'},
                        {id: 198, text: '莱芜'},
                        {id: 199, text: '聊城'},
                        {id: 201, text: '临沂'},
                        {id: 202, text: '青岛'},
                        {id: 203, text: '日照'},
                        {id: 208, text: '泰安'},
                        {id: 204, text: '潍坊'},
                        {id: 218, text: '威海'},
                        {id: 219, text: '烟台'},
                        {id: 221, text: '枣庄'},
                        {id: 207, text: '淄博'}
                    ]
                }
            ]
        },
        {
            id: 'CentralChina',
            text: '华中地区',
            provinces: [
                {
                    id: 14,
                    text: '河南',
                    cities: [
                        {id: 322, text: '郑州'},
                        {id: 309, text: '安阳'},
                        {id: 323, text: '鹤壁'},
                        {id: 476, text: '济源'},
                        {id: 308, text: '焦作'},
                        {id: 310, text: '开封'},
                        {id: 312, text: '漯河'},
                        {id: 311, text: '洛阳'},
                        {id: 315, text: '南阳'},
                        {id: 313, text: '平顶山'},
                        {id: 316, text: '濮阳'},
                        {id: 321, text: '三门峡'},
                        {id: 320, text: '商丘'},
                        {id: 317, text: '新乡'},
                        {id: 318, text: '信阳'},
                        {id: 319, text: '许昌'},
                        {id: 324, text: '周口'},
                        {id: 314, text: '驻马店'}
                    ]
                },
                {
                    id: 16,
                    text: '湖北',
                    cities: [
                        {id: 371, text: '武汉'},
                        {id: 377, text: '鄂州'},
                        {id: 366, text: '恩施'},
                        {id: 349, text: '黄冈'},
                        {id: 348, text: '黄石'},
                        {id: 346, text: '荆门'},
                        {id: 347, text: '荆州'},
                        {id: 364, text: '潜江'},
                        {id: 368, text: '神农架'},
                        {id: 369, text: '十堰'},
                        {id: 367, text: '随州'},
                        {id: 373, text: '天门'},
                        {id: 375, text: '咸宁'},
                        {id: 372, text: '仙桃'},
                        {id: 370, text: '襄阳'},
                        {id: 365, text: '孝感'},
                        {id: 376, text: '宜昌'}
                    ]
                },
                {
                    id: 17,
                    text: '湖南',
                    cities: [
                        {id: 352, text: '长沙'},
                        {id: 351, text: '常德'},
                        {id: 353, text: '郴州'},
                        {id: 360, text: '衡阳'},
                        {id: 350, text: '怀化'},
                        {id: 354, text: '娄底'},
                        {id: 355, text: '邵阳'},
                        {id: 356, text: '湘潭'},
                        {id: 357, text: '湘西'},
                        {id: 359, text: '益阳'},
                        {id: 362, text: '永州'},
                        {id: 361, text: '岳阳'},
                        {id: 358, text: '张家界'},
                        {id: 363, text: '株洲'}
                    ]
                }
            ]
        },
        {
            id: 'SouthChina',
            text: '华南地区',
            provinces: [
                {
                    id: 4,
                    text: '广东',
                    cities: [
                        {id: 84, text: '广州'},
                        {id: 85, text: '潮州'},
                        {id: 116, text: '东莞'},
                        {id: 90, text: '佛山'},
                        {id: 115, text: '河源'},
                        {id: 117, text: '惠州'},
                        {id: 82, text: '江门'},
                        {id: 83, text: '揭阳'},
                        {id: 86, text: '茂名'},
                        {id: 88, text: '梅州'},
                        {id: 89, text: '清远'},
                        {id: 91, text: '汕头'},
                        {id: 92, text: '汕尾'},
                        {id: 94, text: '韶关'},
                        {id: 93, text: '深圳'},
                        {id: 109, text: '阳江'},
                        {id: 111, text: '云浮'},
                        {id: 110, text: '湛江'},
                        {id: 114, text: '肇庆'},
                        {id: 112, text: '中山'},
                        {id: 113, text: '珠海'}
                    ]
                },
                {
                    id: 8,
                    text: '海南',
                    cities: [
                        {id: 302, text: '海口'},
                        {id: 493, text: '白沙黎族自治县'},
                        {id: 488, text: '保亭黎族苗族自治县'},
                        {id: 492, text: '昌江黎族自治县'},
                        {id: 487, text: '澄迈县'},
                        {id: 303, text: '儋州'},
                        {id: 484, text: '定安县'},
                        {id: 296, text: '东方'},
                        {id: 490, text: '乐东黎族自治县'},
                        {id: 491, text: '临高县'},
                        {id: 486, text: '陵水黎族自治县'},
                        {id: 297, text: '琼海'},
                        {id: 489, text: '琼中黎族苗族自治县'},
                        {id: 298, text: '三亚'},
                        {id: 485, text: '屯昌县'},
                        {id: 301, text: '万宁'},
                        {id: 299, text: '文昌'},
                        {id: 300, text: '五指山'}
                    ]
                },
                {
                    id: 12,
                    text: '广西',
                    cities: [
                        {id: 99, text: '南宁'},
                        {id: 108, text: '百色'},
                        {id: 104, text: '北海'},
                        {id: 478, text: '崇左'},
                        {id: 98, text: '防城港'},
                        {id: 96, text: '贵港'},
                        {id: 95, text: '桂林'},
                        {id: 106, text: '河池'},
                        {id: 107, text: '贺州'},
                        {id: 100, text: '来宾'},
                        {id: 101, text: '柳州'},
                        {id: 102, text: '钦州'},
                        {id: 103, text: '梧州'},
                        {id: 105, text: '玉林'}
                    ]
                }
            ]
        },
        {
            id: 'SouthWest',
            text: '西南地区',
            provinces: [
                {
                    id: 33,
                    text: '重庆'
                },
                {
                    id: 28,
                    text: '四川',
                    cities: [
                        {id: 226, text: '成都'},
                        {id: 252, text: '阿坝'},
                        {id: 247, text: '巴中'},
                        {id: 250, text: '达州'},
                        {id: 232, text: '德阳'},
                        {id: 236, text: '甘孜'},
                        {id: 224, text: '广安'},
                        {id: 225, text: '广元'},
                        {id: 233, text: '乐山'},
                        {id: 228, text: '凉山'},
                        {id: 234, text: '泸州'},
                        {id: 227, text: '眉山'},
                        {id: 229, text: '绵阳'},
                        {id: 231, text: '南充'},
                        {id: 235, text: '内江'},
                        {id: 230, text: '攀枝花'},
                        {id: 237, text: '遂宁'},
                        {id: 251, text: '雅安'},
                        {id: 254, text: '宜宾'},
                        {id: 253, text: '自贡'},
                        {id: 238, text: '资阳'}
                    ]
                },
                {
                    id: 10,
                    text: '贵州',
                    cities: [
                        {id: 119, text: '安顺'},
                        {id: 124, text: '毕节'},
                        {id: 118, text: '贵阳'},
                        {id: 120, text: '六盘水'},
                        {id: 122, text: '黔东南'},
                        {id: 121, text: '黔南'},
                        {id: 123, text: '黔西南'},
                        {id: 125, text: '铜仁'},
                        {id: 126, text: '遵义'}
                    ]
                },
                {
                    id: 31,
                    text: '云南',
                    cities: [
                        {id: 284, text: '昆明'},
                        {id: 289, text: '保山'},
                        {id: 283, text: '楚雄'},
                        {id: 292, text: '大理'},
                        {id: 286, text: '德宏'},
                        {id: 482, text: '迪庆'},
                        {id: 293, text: '红河'},
                        {id: 285, text: '丽江'},
                        {id: 287, text: '临沧'},
                        {id: 481, text: '怒江'},
                        {id: 290, text: '普洱'},
                        {id: 288, text: '曲靖'},
                        {id: 291, text: '文山'},
                        {id: 483, text: '西双版纳'},
                        {id: 295, text: '玉溪'},
                        {id: 294, text: '昭通'}
                    ]
                },
                {
                    id: 29,
                    text: '西藏',
                    cities: [
                        {id: 269, text: '拉萨'},
                        {id: 498, text: '阿里'},
                        {id: 480, text: '昌都'},
                        {id: 270, text: '林芝'},
                        {id: 268, text: '那曲'},
                        {id: 271, text: '日喀则'},
                        {id: 497, text: '山南'}
                    ]
                }
            ]
        },
        {
            id: 'NorthWest',
            text: '西北地区',
            provinces: [
                {
                    id: 27,
                    text: '陕西',
                    cities: [
                        {id: 244, text: '西安'},
                        {id: 240, text: '安康'},
                        {id: 239, text: '宝鸡'},
                        {id: 248, text: '汉中'},
                        {id: 241, text: '商洛'},
                        {id: 242, text: '铜川'},
                        {id: 243, text: '渭南'},
                        {id: 245, text: '咸阳'},
                        {id: 246, text: '延安'},
                        {id: 249, text: '榆林'}
                    ]
                },
                {
                    id: 11,
                    text: '甘肃',
                    cities: [
                        {id: 258, text: '兰州'},
                        {id: 267, text: '白银'},
                        {id: 263, text: '定西'},
                        {id: 477, text: '甘南'},
                        {id: 257, text: '嘉峪关'},
                        {id: 256, text: '金昌'},
                        {id: 255, text: '酒泉'},
                        {id: 261, text: '临夏'},
                        {id: 259, text: '陇南'},
                        {id: 260, text: '平凉'},
                        {id: 262, text: '庆阳'},
                        {id: 265, text: '天水'},
                        {id: 264, text: '武威'},
                        {id: 266, text: '张掖'}
                    ]
                },
                {
                    id: 24,
                    text: '青海',
                    cities: [
                        {id: 175, text: '西宁'},
                        {id: 496, text: '果洛'},
                        {id: 494, text: '海北'},
                        {id: 176, text: '海东'},
                        {id: 479, text: '海南'},
                        {id: 177, text: '海西'},
                        {id: 495, text: '黄南'},
                        {id: 178, text: '玉树'}
                    ]
                },
                {
                    id: 23,
                    text: '宁夏',
                    cities: [
                        {id: 174, text: '银川'},
                        {id: 170, text: '固原'},
                        {id: 171, text: '石嘴山'},
                        {id: 172, text: '吴忠'},
                        {id: 173, text: '中卫'}
                    ]
                },
                {
                    id: 30,
                    text: '新疆',
                    cities: [
                        {id: 192, text: '乌鲁木齐'},
                        {id: 185, text: '阿克苏'},
                        {id: 499, text: '阿拉尔'},
                        {id: 182, text: '阿勒泰'},
                        {id: 191, text: '巴音郭楞'},
                        {id: 180, text: '博尔塔拉'},
                        {id: 181, text: '昌吉'},
                        {id: 179, text: '哈密'},
                        {id: 195, text: '和田'},
                        {id: 183, text: '喀什'},
                        {id: 184, text: '克拉玛依'},
                        {id: 186, text: '克孜勒苏柯尔克孜'},
                        {id: 187, text: '石河子'},
                        {id: 188, text: '塔城'},
                        {id: 500, text: '图木舒克'},
                        {id: 190, text: '吐鲁番'},
                        {id: 189, text: '五家渠'},
                        {id: 193, text: '伊犁'}
                    ]
                }
            ]
        },
        {
            id: 'Others',
            text: '其他地区',
            provinces: [
                {
                    id: 34,
                    text: '香港'
                },
                {
                    id: 36,
                    text: '澳门'
                },
                {
                    id: 35,
                    text: '台湾'
                }
            ]
        },
        {
            id: 'Abroad',
            text: '国外',
            children: [
                {
                    id: 7,
                    text: '日本'
                },
                {
                    id: 37,
                    text: '其他国家'
                }
            ]
        }
    ];

    ui.register(FcPriceFactorRegion);

    return FcPriceFactorRegion;
});