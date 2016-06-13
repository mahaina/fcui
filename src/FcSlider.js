/**
 * FCUI (Fengchao UI)
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 滑块控件
 * @author Hou Yuxin (houyuxin@baidu.com)
 * @param {Function} require require
 * @return {Slider} 滑块控件
 */

define(function (require) {
    var _ = require('underscore');
    var oo = require('fc-core/oo');
    var lib = require('./lib');
    var ui = require('./main');
    var Control = require('./Control');
    var helper = require('./controlHelper');

    /**
     *  Slider原型
     */
    var proto = {};

    /**
     * 滑块输入控件
     *
     * 负责距离等场景的输入
     *
     * @extends {Control}
     * @param {Object} options 初始化参数
     * @constructor
     */
    proto.constructor = function (options) {
        Control.apply(this, arguments);
    };

    // 一些与样式相关的配置
    var originOffset = 10;
    var valueBarBaseWidth = 12;
    var slideButtonBaseLeft = 3;
    var slideLabelBaseLeft = -14;

    /**
     * 控件类型为`"FcSlider"`
     *
     * @type {string}
     * @readonly
     * @override
     */
    proto.type = 'FcSlider';

    /**
     * 初始化参数
     *
     *
     * @param {Object} [options] 构造函数传入的参数
     * @protected
     * @override
     */
    proto.initOptions = function (options) {
        /**
         * @cfg defaultProperties
         *
         * 默认属性值
         * defaultProperties.width {number} 默认slider宽度
         * defaultProperties.min {number} 可滑动最小值
         * defaultProperties.max {number} 可滑动最大值
         * defaultProperties.step {number} 滑动步进
         * defaultProperties.min {value} 滑动值
         * defaultProperties.isShowLabel {boolean} 是否显示提示label
         * defaultProperties.isShowMeasure {boolean} 是否显示度量单位
         * defaultProperties.min {string} 度量单位
         */
        var defaultProperties = {
            width: 200,
            min: 5,
            max: 100,
            step: 5,
            value: 50,
            isShowLabel: true,
            isShowMeasure: true,
            measure: 'km'
        };
        var properties = {};

        if (options.isShowMeasure === 'false') {
            options.isShowMeasure = false;
        }

        if (options.isShowLabel === 'false') {
            options.isShowLabel = false;
        }

        _.extend(properties, defaultProperties);

        _.extend(properties, options);

        if (!properties.hasOwnProperty('title') && this.main.title) {
            properties.title = this.main.title;
        }
        // range表示value的取值范围
        properties.range = properties.max - properties.min;
        // oldValue用于记录滑块滑动时，上一次value值
        properties.oldValue = +properties.value;
        // isSliding表示滑块是否正在滑动
        properties.isSliding = false;
        // precision表示step小数点位置
        var stepString = properties.step.toString();
        var decimal = stepString.indexOf('.');
        properties.precision = decimal === -1 ?
                    0 : stepString .length - decimal - 1;
        this.setProperties(properties);
    };


    /**
     * 初始化DOM结构
     *
     * @protected
     * @override
     */
    proto.initStructure = function () {
        // 如果主元素是输入元素，替换成`<div>`
        // 如果输入了非块级元素，则不负责
        if (lib.isInput(this.main)) {
            helper.replaceMain(this);
        }

        var tpl = ''
            + '<div class="${containerClass}">'
            + '<div class="${mainBarClass}"></div>'
            + '<div class="${valueBarClass}"></div>'
            + '<div class="${slideLabelClass}">'
            +   '<span class="${valueTextClass}">${value}</span>'
            + '</div>'
            + '<div class="${leftRuleClass}"></div>'
            + '<div class="${rightRuleClass}"></div>'
            + '<div class="${minLabelClass}">${min}</div>'
            + '<div class="${maxLabelClass}">${max}</div>'
            + '<div class="${slideButtonClass}"></div>'
            + '</div>';

        var html = lib.format(
            tpl,
            {
                containerClass: this.helper.getPartClassName('container'),
                mainBarClass: this.helper.getPartClassName('mainBar'),
                valueBarClass: this.helper.getPartClassName('valueBar'),
                slideLabelClass: this.helper.getPartClassName('slideLabel') +
                        (this.isShowLabel ? '' : ' state-hidden'),
                valueTextClass: this.helper.getPartClassName('valueText'),
                leftRuleClass: this.helper.getPartClassName('leftRule'),
                rightRuleClass: this.helper.getPartClassName('rightRule'),
                minLabelClass: this.helper.getPartClassName('minLabel'),
                maxLabelClass: this.helper.getPartClassName('maxLabel'),
                slideButtonClass: this.helper.getPartClassName('slideButton'),
                value: this.isShowMeasure ? this.value + this.measure : this.value,
                min: this.isShowMeasure ? this.min + this.measure : this.min,
                max: this.isShowMeasure ? this.max + this.measure : this.max
            }
        );

        this.main.innerHTML = html;

        if (typeof this.width !== 'undefined') {
            // 仅支持数字形式的width值
            this.main.style.width = this.width + 'px';
        }
        this.syncSliderView();
    };

    /**
     * 事件的初始化
     */
    proto.initEvents = function () {
        var helper = this.helper;

        var valueBar = lib.find(this.main, '.ui-fcslider-valueBar');
        var mainBar = lib.find(this.main, '.ui-fcslider-mainBar');

        var slideButton = lib.find(this.main, '.ui-fcslider-slideButton');

        helper.addDOMEvent(valueBar, 'click', _.bind(this._slideByClick, this));
        helper.addDOMEvent(mainBar, 'click', _.bind(this._slideByClick, this));

        helper.addDOMEvent(slideButton, 'mousedown', _.bind(this._start, this));

        helper.addDOMEvent(this.main, 'mouseup', _.bind(this._stop, this));
        helper.addDOMEvent(this.main, 'mouseleave', _.bind(this._stop, this));
        helper.addDOMEvent(this.main, 'mousemove', _.bind(this._slide, this));

        // ie9以下浏览器在拖动时会选择文字，这里做一下兼容
        if (lib.ie && lib.ie <= 9) {
            this.main.onselectstart = this.main.ondrag = function () {
                return false;
            };
        }
    };

    /**
     * 滑动停止
     * @param {Object} event 事件
     */
    proto._stop = function (event) {
        // 如果没有在滑动，就不用再stop了
        if (!this.isSliding) {
            return;
        }
        this.isSliding = false;
        this.fire('stop', {
            value: this.value,
            measure: this.measure
        });
    };

    /**
     * 滑动
     * @param {Object} event 事件
     */
    proto._slide = function (event) {
        if (!this.isSliding) {
            return;
        }
        lib.event.preventDefault(event);
        lib.event.getMousePosition(event);
        var position = {
            x: event.pageX,
            y: event.pageY
        };

        var value = this._normValueFromMouse(position);
        this.setValue(value);
        this.fire('slide');
    };

    /**
     * 滑动开始
     * @param {Object} event 事件
     */
    proto._start = function (event) {
        if (this.isSliding) {
            return;
        }
        this.isSliding = true;
        this.fire('start');
    };

    /**
     * 标尺点击事件处理函数
     * @param {Object} event 事件
     */
    proto._slideByClick = function (event) {
        this._start();
        lib.event.getMousePosition(event);
        var position = {
            x: event.pageX,
            y: event.pageY
        };

        var value = this._normValueFromMouse(position);
        this.setValue(value);
        this._stop();
    };

    /**
     * 根据鼠标位置计算value值
     * @param {Object} mousePos 鼠标位置信息
     * @return {number} value
     */
    proto._normValueFromMouse = function (mousePos) {
        var mainPosition = {
            left: lib.getOffset(this.main).left,
            top: lib.getOffset(this.main).top
        };
        // 目前slider仅支持水平方向，因此只计算水平方向就够了
        var offsetX = mousePos.x - mainPosition.left;
        // 可用的标尺宽度要抛去左右原点
        var avilableWidth = this.width - originOffset * 2;
        var deltaValue = (offsetX - originOffset) / avilableWidth * this.range;
        return this._trimAlignValue(+this.min + deltaValue);
    };

    /**
     * 根据min,max,step等标准化value值
     * @param {number} val 原始value
     * @return {number} value
     */
    proto._trimAlignValue = function (val) {
        if (val <= this.min) {
            return +this.min;
        }
        if (val >= this.max) {
            return +this.max;
        }
        var step = +this.step > 0 ? +this.step : 1;
        var valModStep = (val - +this.min) % step;
        var alignValue = val - valModStep;
        if (Math.abs(valModStep) * 2 >= step) {
            alignValue += (valModStep > 0) ? step : (-step);
        }
        return parseFloat(alignValue.toFixed(this.precision));
    };

    /**
     * 当value变化时，同步视图中需要变化的部分
     */
    proto.syncSliderView = function () {
        // 可用的标尺宽度要抛去左右原点
        var avilableWidth = this.width - originOffset * 2;
        var deltaWidth = avilableWidth * (this.value - +this.min) / this.range;

        lib.find(this.main, '.ui-fcslider-valueBar').style.width = (valueBarBaseWidth + deltaWidth) + 'px';
        lib.find(this.main, '.ui-fcslider-slideLabel').style.left = (slideLabelBaseLeft + deltaWidth) + 'px';
        lib.find(this.main, '.ui-fcslider-slideButton').style.left = (slideButtonBaseLeft + deltaWidth) + 'px';
        lib.find(this.main, '.ui-fcslider-valueText').innerHTML =
                this.isShowMeasure ? this.value + this.measure : this.value;
    };

    /**
     * 设置value值
     *
     * @param {number} value 设置的值
     */
    proto.setValue = function (value) {
        if (value !== this.oldValue) {
            this.setProperties({value: value});
            this.syncSliderView();
            this.fire('change', {
                value: value,
                measure: this.measure
            });
            this.oldValue = value;
        }
    };

    /**
     * 获取value值
     *
     * @return {number} 控件值
     */
    proto.getValue = function () {
        return +this.value;
    };

    var Slider = oo.derive(Control, proto);
    ui.register(Slider);

    return Slider;
});

