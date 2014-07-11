/*!
 * ====================================================
 * kityminder - v1.1.3 - 2014-07-11
 * https://github.com/fex-team/kityminder
 * GitHub: https://github.com/fex-team/kityminder.git 
 * Copyright (c) 2014 f-cube @ FEX; Licensed MIT
 * ====================================================
 */

(function(kity, window) {

var KityMinder = window.KM = window.KityMinder = function() {
    var instanceMap = {},
        instanceId = 0,
        uuidMap = {};
    return {
        version: '1.2.0',
        uuid: function(name) {
            name = name || 'unknown';
            uuidMap[name] = uuidMap[name] || 0;
            ++uuidMap[name];
            return name + '_' + uuidMap[name];
        },
        createMinder: function(renderTarget, options) {
            options = options || {};
            options.renderTo = Utils.isString(renderTarget) ? document.getElementById(renderTarget) : renderTarget;
            var minder = new Minder(options);
            this.addMinder(options.renderTo, minder);
            return minder;
        },
        addMinder: function(target, minder) {
            var id;
            if (typeof(target) === 'string') {
                id = target;
            } else {
                id = target.id || ("KM_INSTANCE_" + instanceId++);
            }
            instanceMap[id] = minder;
        },
        getMinder: function(target, options) {
            var id;
            if (typeof(target) === 'string') {
                id = target;
            } else {
                id = target.id || ("KM_INSTANCE_" + instanceId++);
            }
            return instanceMap[id] || this.createMinder(target, options);
        },
        //挂接多语言
        LANG: {}
    };
}();

var utils = Utils = KityMinder.Utils = {
    extend: kity.Utils.extend.bind(kity.Utils),

    listen: function(element, type, handler) {
        var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/),
            k = types.length;
        if (k)
            while (k--) {
                type = types[k];
                if (element.addEventListener) {
                    element.addEventListener(type, handler, false);
                } else {
                    if (!handler._d) {
                        handler._d = {
                            els: []
                        };
                    }
                    var key = type + handler.toString(),
                        index = utils.indexOf(handler._d.els, element);
                    if (!handler._d[key] || index == -1) {
                        if (index == -1) {
                            handler._d.els.push(element);
                        }
                        if (!handler._d[key]) {
                            handler._d[key] = function(evt) {
                                return handler.call(evt.srcElement, evt || window.event);
                            };
                        }
                        element.attachEvent('on' + type, handler._d[key]);
                    }
                }
            }
        element = null;
    },
    trim: function(str) {
        return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
    },
    each: function(obj, iterator, context) {
        if (obj == null) return;
        if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, i, obj[i], obj) === false)
                    return false;
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (iterator.call(context, key, obj[key], obj) === false)
                        return false;
                }
            }
        }
    },
    addCssRule: function(key, style, doc) {
        var head, node;
        if (style === undefined || style && style.nodeType && style.nodeType == 9) {
            //获取样式
            doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
            node = doc.getElementById(key);
            return node ? node.innerHTML : undefined;
        }
        doc = doc || document;
        node = doc.getElementById(key);

        //清除样式
        if (style === '') {
            if (node) {
                node.parentNode.removeChild(node);
                return true
            }
            return false;
        }

        //添加样式
        if (node) {
            node.innerHTML = style;
        } else {
            node = doc.createElement('style');
            node.id = key;
            node.innerHTML = style;
            doc.getElementsByTagName('head')[0].appendChild(node);
        }
    },
    keys: function(plain) {
        var keys = [];
        for (var key in plain) {
            if (plain.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    },
    proxy: function(fn, context) {
        return function() {
            return fn.apply(context, arguments);
        };
    },
    indexOf: function(array, item, start) {
        var index = -1;
        start = this.isNumber(start) ? start : 0;
        this.each(array, function(v, i) {
            if (i >= start && v === item) {
                index = i;
                return false;
            }
        });
        return index;
    },
    argsToArray: function(args, index) {
        return Array.prototype.slice.call(args, index || 0);
    },
    clonePlainObject: function(source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (utils.isObject(tmp) || utils.isArray(tmp)) {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clonePlainObject(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    compareObject: function(source, target) {
        var tmp;
        if (this.isEmptyObject(source) !== this.isEmptyObject(target)) {
            return false
        }
        if (this.getObjectLength(source) != this.getObjectLength(target)) {
            return false;
        }
        for (var p in source) {
            if (source.hasOwnProperty(p)) {
                tmp = source[p];
                if (target[p] === undefined) {
                    return false;
                }
                if (this.isObject(tmp) || this.isArray(tmp)) {
                    if (this.isObject(target[p]) !== this.isObject(tmp)) {
                        return false;
                    }
                    if (this.isArray(tmp) !== this.isArray(target[p])) {
                        return false;
                    }
                    if (this.compareObject(tmp, target[p]) === false) {
                        return false
                    }
                } else {
                    if (tmp != target[p]) {
                        return false
                    }
                }
            }
        }
        return true;
    },
    getObjectLength: function(obj) {
        if (this.isArray(obj) || this.isString(obj)) return obj.length;
        var count = 0;
        for (var key in obj)
            if (obj.hasOwnProperty(key)) count++;
        return count;
    },
    isEmptyObject: function(obj) {
        if (obj == null) return true;
        if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
        for (var key in obj)
            if (obj.hasOwnProperty(key)) return false;
        return true;
    },
    loadFile: function() {
        var tmpList = [];

        function getItem(doc, obj) {
            try {
                for (var i = 0, ci; ci = tmpList[i++];) {
                    if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                        return ci;
                    }
                }
            } catch (e) {
                return null;
            }

        }

        return function(doc, obj, fn) {
            var item = getItem(doc, obj);
            if (item) {
                if (item.ready) {
                    fn && fn();
                } else {
                    item.funs.push(fn)
                }
                return;
            }
            tmpList.push({
                doc: doc,
                url: obj.src || obj.href,
                funs: [fn]
            });
            if (!doc.body) {
                var html = [];
                for (var p in obj) {
                    if (p == 'tag') continue;
                    html.push(p + '="' + obj[p] + '"')
                }
                doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                return;
            }
            if (obj.id && doc.getElementById(obj.id)) {
                return;
            }
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for (var p in obj) {
                element.setAttribute(p, obj[p]);
            }
            element.onload = element.onreadystatechange = function() {
                if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                    item = getItem(doc, obj);
                    if (item.funs.length > 0) {
                        item.ready = 1;
                        for (var fi; fi = item.funs.pop();) {
                            fi();
                        }
                    }
                    element.onload = element.onreadystatechange = null;
                }
            };
            //            element.onerror = function () {
            //                throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file ')
            //            };
            doc.getElementsByTagName("head")[0].appendChild(element);
        }
    }(),
    clone: function(source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == 'object') {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    unhtml: function(str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function(a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<': '&lt;',
                    '&': '&amp;',
                    '"': '&quot;',
                    '>': '&gt;',
                    "'": '&#39;'
                }[a]
            }
        }) : '';
    },
    cloneArr:function(arr){
        return [].concat(arr);
    }

};

Utils.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object'], function(i, v) {
    KityMinder.Utils['is' + v] = function(obj) {
        return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
    }
});

var Command = kity.createClass( "Command", {
	constructor: function () {
		this._isContentChange = true;
		this._isSelectionChange = false;
	},

	execute: function ( minder, args ) {

	},

	setContentChanged: function ( val ) {
		this._isContentChange = !! val;
	},

	isContentChanged: function () {
		return this._isContentChange;
	},

	setSelectionChanged: function ( val ) {
		this._isSelectionChange = !! val;
	},

	isSelectionChanged: function () {
		return this._isContentChange;
	},

	queryState: function ( km ) {
		return 0;
	},

	queryValue: function ( km ) {
		return 0;
	},
	isNeedUndo: function () {
		return true;
	}
} );

var MinderNode = KityMinder.MinderNode = kity.createClass('MinderNode', {

    /**
     * 创建一个节点
     *
     * @param {KityMinder}    minder
     *     节点绑定的脑图的实例
     *
     * @param {String|Object} unknown
     *     节点的初始数据或文本
     */
    constructor: function(unknown) {
        this.parent = null;
        this.root = this;
        this.children = [];
        this.data = {};
        this.tmpData = {};

        this.initContainers();

        if (Utils.isString(unknown)) {
            this.setText(unknown);
        } else {
            this.setData(unknown);
        }
    },

    initContainers: function() {
        this.rc = new kity.Group().setId(KityMinder.uuid('minder_node'));
        this.rc.minderNode = this;
    },

    /**
     * 判断节点是否根节点
     */
    isRoot: function() {
        return this.root === this;
    },

    /**
     * 判断节点是否叶子
     */
    isLeaf: function() {
        return this.children.length === 0;
    },

    /**
     * 获取节点的根节点
     */
    getRoot: function() {
        return this.root || this;
    },

    /**
     * 获得节点的父节点
     */
    getParent: function() {
        return this.parent;
    },

    /**
     * 获得节点的深度
     */
    getLevel: function() {
        var level = 0,
            parent = this.parent;
        while (parent) {
            level++;
            parent = parent.parent;
        }
        return level;
    },

    /**
     * 获得节点的复杂度（即子树中节点的数量）
     */
    getComplex: function() {
        var complex = 0;
        this.traverse(function() {
            complex++;
        });
        return complex;
    },

    /**
     * 获得节点的类型（root|main|sub）
     */
    getType: function(type) {
        this.type = ['root', 'main', 'sub'][Math.min(this.getLevel(), 2)];
        return this.type;
    },

    /**
     * 判断当前节点是否被测试节点的祖先
     * @param  {MinderNode}  test 被测试的节点
     */
    isAncestorOf: function(test) {
        var p = test.parent;
        while (p) {
            if (p == this) return true;
            p = p.parent;
        }
        return false;
    },

    /**
     * 设置节点的文本数据
     * @param {String} text 文本数据
     */
    setText: function(text) {
        return this.setData('text', text);
    },

    /**
     * 获取节点的文本数据
     * @return {String}
     */
    getText: function() {
        return this.getData('text');
    },

    /**
     * 先序遍历当前节点树
     * @param  {Function} fn 遍历函数
     */
    preTraverse: function(fn, excludeThis) {
        var children = this.getChildren();
        if (!excludeThis) fn(this);
        for (var i = 0; i < children.length; i++) {
            children[i].preTraverse(fn);
        }
    },

    /**
     * 后序遍历当前节点树
     * @param  {Function} fn 遍历函数
     */
    postTraverse: function(fn, excludeThis) {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            children[i].postTraverse(fn);
        }
        if (!excludeThis) fn(this);
    },

    traverse: function(fn, excludeThis) {
        return this.postTraverse(fn, excludeThis);
    },

    getChildren: function() {
        return this.children;
    },

    getIndex: function() {
        return this.parent ? this.parent.children.indexOf(this) : -1;
    },

    insertChild: function(node, index) {
        if (index === undefined) {
            index = this.children.length;
        }
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.root = this.root;

        this.children.splice(index, 0, node);
    },

    appendChild: function(node) {
        return this.insertChild(node);
    },

    prependChild: function(node) {
        return this.insertChild(node, 0);
    },

    removeChild: function(elem) {
        var index = elem,
            removed;
        if (elem instanceof MinderNode) {
            index = this.children.indexOf(elem);
        }
        if (index >= 0) {
            removed = this.children.splice(index, 1)[0];
            removed.parent = null;
            removed.root = removed;
        }
    },

    getChild: function(index) {
        return this.children[index];
    },

    getFirstChild: function() {
        return this.children[0];
    },

    getLastChild: function() {
        return this.children[this.children.length - 1];
    },

    getData: function(name) {
        if (name === undefined) {
            return this.data;
        }
        return this.data[name];
    },

    setData: function(name, value) {
        if (name === undefined) {
            this.data = {};

        } else if (utils.isObject(name)) {
            Utils.extend(this.data, name);
        } else {
            if (value === undefined) {
                this.data[name] = null;
                delete this.data[name];
            } else {
                this.data[name] = value;
            }
        }
        return this;
    },

    getRenderContainer: function() {
        return this.rc;
    },

    getCommonAncestor: function(node) {
        return Utils.getNodeCommonAncestor(this, node);
    },

    contains: function(node) {
        return this == node || this.isAncestorOf(node);
    },

    clone: function() {
        function cloneNode(parent, isClonedNode) {
            var cloned = new KM.MinderNode();

            cloned.data = Utils.clonePlainObject(isClonedNode.getData());
            cloned.tmpData = Utils.clonePlainObject(isClonedNode.getTmpData());

            if (parent) {
                parent.appendChild(cloned);
            }
            for (var i = 0, ci;
                (ci = isClonedNode.children[i++]);) {
                cloneNode(cloned, ci);
            }
            return cloned;
        }
        return cloneNode(null, this);
    },

    equals: function(node,ignoreSelected) {
        var me = this;
        function restoreSelected(){
            if(isSelectedA){
                me.setSelectedFlag();
            }
            if(isSelectedB){
                node.setSelectedFlag();
            }
        }
        if(ignoreSelected){
            var isSelectedA = false;
            var isSelectedB = false;
            if(me.isSelected()){
                isSelectedA = true;
                me.clearSelectedFlag();
            }

            if(node.isSelected()){
                isSelectedB = true;
                node.clearSelectedFlag();
            }
        }
        if (node.children.length != this.children.length) {
            restoreSelected();
            return false;
        }
        if (utils.compareObject(node.getData(), me.getData()) === false) {
            restoreSelected();
            return false;
        }
        if (utils.compareObject(node.getTmpData(), me.getTmpData()) === false) {
            restoreSelected();
            return false;
        }
        for (var i = 0, ci;
            (ci = me.children[i]); i++) {
            if (ci.equals(node.children[i],ignoreSelected) === false) {
                restoreSelected();
                return false;
            }
        }
        restoreSelected();
        return true;

    },

    clearChildren: function() {
        this.children = [];
    },

    setTmpData: function(a, v) {
        var me = this;
        if (utils.isObject(a)) {
            utils.each(a, function(key, val) {
                me.setTmpData(key, val);
            });
        }
        if (v === undefined || v === null || v === '') {
            delete this.tmpData[a];
        } else {
            this.tmpData[a] = v;
        }
    },

    getTmpData: function(a) {
        if (a === undefined) {
            return this.tmpData;
        }
        return this.tmpData[a];
    },

    setValue: function(node) {
        this.data = {};
        this.setData(utils.clonePlainObject(node.getData()));
        this.tmpData = {};
        this.setTmpData(utils.clonePlainObject(node.getTmpData()));
        return this;
    }
});

MinderNode.getCommonAncestor = function(nodeA, nodeB) {
    if (nodeA instanceof Array) {
        return MinderNode.getCommonAncestor.apply(this, nodeA);
    }
    switch (arguments.length) {
        case 1:
            return nodeA.parent;

        case 2:
            if (nodeA.isAncestorOf(nodeB)) {
                return nodeA;
            }
            if (nodeB.isAncestorOf(nodeA)) {
                return nodeB;
            }
            var ancestor = nodeA.parent;
            while (ancestor && !ancestor.isAncestorOf(nodeB)) {
                ancestor = ancestor.parent;
            }
            return ancestor;

        default:
            return Array.prototype.reduce.call(arguments, function(prev, current) {
                return MinderNode.getCommonAncestor(prev, current);
            }, nodeA);
    }
};

//模块注册&暴露模块接口
( function () {
    var _modules;
    KityMinder.registerModule = function ( name, module ) {
        //初始化模块列表
        if ( !_modules ) {
            _modules = {};
        }
        _modules[ name ] = module;
    };
    KityMinder.getModules = function () {
        return _modules;
    };
} )();

var MinderEvent = kity.createClass('MindEvent', {
    constructor: function(type, params, canstop) {
        params = params || {};
        if (params.getType && params.getType() == 'ShapeEvent') {
            this.kityEvent = params;
            this.originEvent = params.originEvent;
            this.getPosition = params.getPosition.bind(params);
        } else if (params.target && params.preventDefault) {
            this.originEvent = params;
        } else {
            kity.Utils.extend(this, params);
        }
        this.type = type;
        this._canstop = canstop || false;
    },

    getTargetNode: function() {
        var findShape = this.kityEvent && this.kityEvent.targetShape;
        if (!findShape) return null;
        while (!findShape.minderNode && findShape.container) {
            findShape = findShape.container;
        }
        return findShape.minderNode || null;
    },

    stopPropagation: function() {
        this._stoped = true;
    },

    stopPropagationImmediately: function() {
        this._immediatelyStoped = true;
        this._stoped = true;
    },

    shouldStopPropagation: function() {
        return this._canstop && this._stoped;
    },

    shouldStopPropagationImmediately: function() {
        return this._canstop && this._immediatelyStoped;
    },
    preventDefault: function() {
        this.originEvent.preventDefault();
    },
    isRightMB: function() {
        var isRightMB = false;
        if (!this.originEvent) {
            return false;
        }
        if ("which" in this.originEvent)
            isRightMB = this.originEvent.which == 3;
        else if ("button" in this.originEvent)
            isRightMB = this.originEvent.button == 2;
        return isRightMB;
    }
});

var Minder = KityMinder.Minder = kity.createClass('KityMinder', {
    constructor: function(options) {
        this._options = Utils.extend(window.KITYMINDER_CONFIG || {}, options);
        this.setDefaultOptions(KM.defaultOptions);

        this._initEvents();
        this._initMinder();
        this._initSelection();
        this._initStatus();
        this._initShortcutKey();
        this._initContextmenu();
        this._initModules();

        if (this.getOptions('readOnly') === true) {
            this.setDisabled();
        }
        this.getRoot().render().layout();
        this.fire('ready');
    },

    getOptions: function(key) {
        var val;
        if (key) {
            val = this.getPreferences(key);
            return val === null || val === undefined ? this._options[key] : val;
        } else {
            val = this.getPreferences();
            if (val) {
                return utils.extend(val, this._options, true);
            } else {
                return this._options;
            }
        }
    },

    setDefaultOptions: function(key, val, cover) {
        var obj = {};
        if (Utils.isString(key)) {
            obj[key] = val;
        } else {
            obj = key;
        }
        utils.extend(this._options, obj, !cover);
    },

    setOptions: function(key, val) {
        this.setPreferences(key, val);
    },

    _initMinder: function() {

        this._paper = new kity.Paper();
        this._paper.getNode().setAttribute('contenteditable', true);
        this._paper.getNode().ondragstart = function(e) {
            e.preventDefault();
        };
        this._paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');

        this._addRenderContainer();

        this.setRoot(this.createNode(this.getLang().maintopic));

        if (this._options.renderTo) {
            this.renderTo(this._options.renderTo);
        }
    },

    _addRenderContainer: function() {
        this._rc = new kity.Group().setId(KityMinder.uuid('minder'));
        this._paper.addShape(this._rc);
    },

    renderTo: function(target) {
        this._paper.renderTo(this._renderTarget = target);
        this._bindEvents();
    },

    getRenderContainer: function() {
        return this._rc;
    },

    getPaper: function() {
        return this._paper;
    },
    getRenderTarget: function() {
        return this._renderTarget;
    },
    _initShortcutKey: function() {
        this._shortcutkeys = {};
        this._bindshortcutKeys();
    },
    addShortcutKeys: function(cmd, keys) {
        var obj = {},
            km = this;
        if (keys) {
            obj[cmd] = keys;
        } else {
            obj = cmd;
        }
        utils.each(obj, function(k, v) {
            km._shortcutkeys[k.toLowerCase()] = v;
        });

    },
    getShortcutKey: function(cmdName) {
        return this._shortcutkeys[cmdName];
    },
    _bindshortcutKeys: function() {
        var me = this,
            shortcutkeys = this._shortcutkeys;

        function checkkey(key, keyCode, e) {
            switch (key) {
                case 'ctrl':
                case 'cmd':
                    if (e.ctrlKey || e.metaKey) {
                        return true;
                    }
                    break;
                case 'alt':
                    if (e.altKey) {
                        return true;
                    }
                    break;
                case 'shift':
                    if (e.shiftKey) {
                        return true;
                    }

            }
            if (keyCode == keymap[key]) {
                return true;
            }
            return false;
        }
        me.on('keydown', function(e) {

            var originEvent = e.originEvent;
            var keyCode = originEvent.keyCode || originEvent.which;
            for (var i in shortcutkeys) {
                var keys = shortcutkeys[i].toLowerCase().split('+');
                var current = 0;
                utils.each(keys, function(i, k) {
                    if (checkkey(k, keyCode, originEvent)) {
                        current++;
                    }
                });

                if (current == keys.length) {
                    if (me.queryCommandState(i) != -1)
                        me.execCommand(i);
                    originEvent.preventDefault();
                    break;
                }

            }
        });
    },
    _initContextmenu: function() {
        this.contextmenus = [];
    },
    addContextmenu: function(item) {
        if (utils.isArray(item)) {
            this.contextmenus = this.contextmenus.concat(item);
        } else {
            this.contextmenus.push(item);
        }

        return this;
    },
    getContextmenu: function() {
        return this.contextmenus;
    },
    _initStatus: function() {
        this._status = 'normal';
        this._rollbackStatus = 'normal';
    },
    setStatus: function(status) {
        if (status) {
            this.fire('statuschange',{
                lastStatus:this._status,
                currentStatus:status
            });
            this._rollbackStatus = this._status;
            this._status = status;
        } else {
            this._status = '';
        }
        return this;
    },
    rollbackStatus: function() {
        this._status = this._rollbackStatus;
    },
    getStatus: function() {
        return this._status;
    },
    setDisabled: function() {
        var me = this;
        //禁用命令
        me.bkqueryCommandState = me.queryCommandState;
        me.bkqueryCommandValue = me.queryCommandValue;
        me.queryCommandState = function(type) {
            var cmd = this._getCommand(type);
            if (cmd && cmd.enableReadOnly === false) {
                return me.bkqueryCommandState.apply(me, arguments);
            }
            return -1;
        };
        me.queryCommandValue = function(type) {
            var cmd = this._getCommand(type);
            if (cmd && cmd.enableReadOnly === false) {
                return me.bkqueryCommandValue.apply(me, arguments);
            }
            return null;
        };
        this.setStatus('readonly');
        me.fire('interactchange');
    },
    setEnabled: function() {
        var me = this;

        if (me.bkqueryCommandState) {
            me.queryCommandState = me.bkqueryCommandState;
            delete me.bkqueryCommandState;
        }
        if (me.bkqueryCommandValue) {
            me.queryCommandValue = me.bkqueryCommandValue;
            delete me.bkqueryCommandValue;
        }

        this.rollbackStatus();

        me.fire('interactchange');
    }
});

Utils.extend(KityMinder, {
    compatibility: function(json) {

        var version = json.version || '1.1.3';

        function traverse(node, fn) {
            fn(node);
            if (node.children) node.children.forEach(function(child) {
                traverse(child, fn);
            });
        }

        /**
         * 脑图数据升级
         * v1.1.3 => v1.2.0
         * */
        function c_113_120(json) {
            // 原本的布局风格
            var ocs = json.data.currentstyle;
            delete json.data.currentstyle;

            // 为 1.2 选择模板，同时保留老版本文件的皮肤
            if (ocs == 'bottom') {
                json.template = 'structure';
                json.theme = 'snow';
            } else if (ocs == 'default') {
                json.template = 'default';
                json.theme = 'classic';
            }

            traverse(json, function(node) {
                var data = node.data;

                // 升级优先级、进度图标
                if ('PriorityIcon' in data) {
                    data.priority = data.PriorityIcon;
                    delete data.PriorityIcon;
                }
                if ('ProgressIcon' in data) {
                    data.progress = 1 + ((data.ProgressIcon - 1) << 1);
                    delete data.ProgressIcon;
                }

                // 删除过时属性
                delete data.point;
                delete data.layout;
            });
        }

        switch (version) {
            case '1.1.3':
                c_113_120(json);
            case '1.2.0':
        }

        return json;
    }
});

Utils.extend(KityMinder, {
    _protocals: {},
    registerProtocal: function(name, protocalDeal) {
        KityMinder._protocals[name] = protocalDeal();
    },
    findProtocal: function(name) {
        return KityMinder._protocals[name] || null;
    },
    getSupportedProtocals: function() {
        return Utils.keys(KityMinder._protocals).sort(function(a, b) {
            return KityMinder._protocals[b].recognizePriority - KityMinder._protocals[a].recognizePriority;
        });
    },
    getAllRegisteredProtocals: function() {
        return KityMinder._protocals;
    }
});

var DEFAULT_TEXT = {
    'root': 'maintopic',
    'main': 'topic',
    'sub': 'topic'
};

// 导入导出
kity.extendClass(Minder, {
    exportData: function(protocalName) {

        // 这里的 Json 是一个对象
        function exportNode(node) {
            var exported = {};
            exported.data = node.getData();
            var childNodes = node.getChildren();
            if (childNodes.length) {
                exported.children = [];
                for (var i = 0; i < childNodes.length; i++) {
                    exported.children.push(exportNode(childNodes[i]));
                }
            }
            return exported;
        }

        var json, protocal;

        json = exportNode(this.getRoot());
        protocal = KityMinder.findProtocal(protocalName);

        if (this._fire(new MinderEvent('beforeexport', {
            json: json,
            protocalName: protocalName,
            protocal: protocal
        }, true)) === true) return;

        json.template = this.getTemplate();
        json.theme = this.getTheme();
        json.version = KityMinder.version;

        if (protocal) {
            return protocal.encode(json, this);
        } else {
            return json;
        }
    },

    importData: function(local, protocalName) {
        var json, protocal;

        if (protocalName) {
            protocal = KityMinder.findProtocal(protocalName);
        } else {
            KityMinder.getSupportedProtocals().every(function(name) {
                var test = KityMinder.findProtocal(name);
                if (test.recognize && test.recognize(local)) {
                    protocal = test;
                }
                return !protocal;
            });
        }

        if (!protocal) {
            this.fire('unknownprotocal');
            throw new Error('Unsupported protocal: ' + protocalName);
        }

        var params = {
            local: local,
            protocalName: protocalName,
            protocal: protocal
        };

        // 是否需要阻止导入
        var stoped = this._fire(new MinderEvent('beforeimport', params, true));
        if (stoped) return this;

        try {
            json = params.json || (params.json = protocal.decode(local));
        } catch (e) {
            return this.fire('parseerror', { message: e.message });
        }

        if (typeof json === 'object' && 'then' in json) {
            var self = this;
            json.then(function(data) {
                params.json = data;
                self._doImport(data, params);
            }).error(function() {
                self.fire('parseerror');
            });
        } else {
            this._doImport(json, params);
        }
        return this;
    },

    _doImport: function(json, params) {

        function importNode(node, json, km) {
            var data = json.data;
            node.data = {};
            for (var field in data) {
                node.setData(field, data[field]);
            }

            node.setData('text', data.text || km.getLang(DEFAULT_TEXT[node.getType()]));

            var childrenTreeData = json.children || [];
            for (var i = 0; i < childrenTreeData.length; i++) {
                var childNode = km.createNode(null, node);
                importNode(childNode, childrenTreeData[i], km);
            }
            return node;
        }

        if (!json) return;

        this._fire(new MinderEvent('preimport', params, false));

        // 删除当前所有节点
        while (this._root.getChildren().length) {
            this.removeNode(this._root.getChildren()[0]);
        }

        json = KityMinder.compatibility(json);

        importNode(this._root, json, this);

        this.setTemplate(json.template || null);
        this.setTheme(json.theme || null);
        this.refresh();

        this.fire('import', params);

        this._firePharse({
            type: 'contentchange'
        });
        this._firePharse({
            type: 'interactchange'
        });
    }
});

// 事件机制
kity.extendClass(Minder, {
    _initEvents: function() {
        this._eventCallbacks = {};
    },
    _bindEvents: function() {
        this._bindPaperEvents();
        this._bindKeyboardEvents();
    },
    _resetEvents: function() {
        this._initEvents();
        this._bindEvents();
    },
    // TODO: mousemove lazy bind
    _bindPaperEvents: function() {
        this._paper.on('click dblclick mousedown contextmenu mouseup mousemove mousewheel DOMMouseScroll touchstart touchmove touchend dragenter dragleave drop', this._firePharse.bind(this));
        if (window) {
            window.addEventListener('resize', this._firePharse.bind(this));
            window.addEventListener('blur', this._firePharse.bind(this));
        }
    },
    _bindKeyboardEvents: function() {
        if ((navigator.userAgent.indexOf('iPhone') == -1) && (navigator.userAgent.indexOf('iPod') == -1) && (navigator.userAgent.indexOf('iPad') == -1)) {
            //只能在这里做，要不无法触发
            Utils.listen(document.body, 'keydown keyup keypress paste', this._firePharse.bind(this));
        }
    },
    _firePharse: function(e) {
        //        //只读模式下强了所有的事件操作
        //        if(this.readOnly === true){
        //            return false;
        //        }
        var beforeEvent, preEvent, executeEvent;

        if (e.type == 'DOMMouseScroll') {
            e.type = 'mousewheel';
            e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * -10;
            e.wheelDeltaX = e.originEvent.mozMovementX;
            e.wheelDeltaY = e.originEvent.mozMovementY;
        }

        beforeEvent = new MinderEvent('before' + e.type, e, true);
        if (this._fire(beforeEvent)) {
            return;
        }
        preEvent = new MinderEvent('pre' + e.type, e, true);
        executeEvent = new MinderEvent(e.type, e, true);

        this._fire(preEvent) ||
            this._fire(executeEvent) ||
            this._fire(new MinderEvent('after' + e.type, e, false));

        if (~'mousedown mouseup keydown keyup'.indexOf(e.type)) {
            this._interactChange(e);
        }
    },
    _interactChange: function(e) {
        var minder = this;

        clearTimeout(this._interactTimeout);
        this._interactTimeout = setTimeout(function() {
            var stoped = minder._fire(new MinderEvent('beforeinteractchange'));
            if (stoped) {
                return;
            }
            minder._fire(new MinderEvent('preinteractchange'));
            minder._fire(new MinderEvent('interactchange'));
        }, 20);
    },
    _listen: function(type, callback) {
        var callbacks = this._eventCallbacks[type] || (this._eventCallbacks[type] = []);
        callbacks.push(callback);
    },
    _fire: function(e) {


        var status = this.getStatus();

        var callbacks = this._eventCallbacks[e.type.toLowerCase()] || [];

        if (status) {

            callbacks = callbacks.concat(this._eventCallbacks[status + '.' + e.type.toLowerCase()] || []);
        }



        if (callbacks.length === 0) {
            return;
        }
        var lastStatus = this.getStatus();

        for (var i = 0; i < callbacks.length; i++) {

            callbacks[i].call(this, e);


            if (this.getStatus() != lastStatus || e.shouldStopPropagationImmediately()) {
                break;
            }
        }
        return e.shouldStopPropagation();
    },
    on: function(name, callback) {
        var km = this;
        utils.each(name.split(/\s+/), function(i, n) {
            km._listen(n.toLowerCase(), callback);
        });
        return this;
    },
    off: function(name, callback) {

        var types = name.split(/\s+/);
        var i, j, callbacks, removeIndex;
        for (i = 0; i < types.length; i++) {

            callbacks = this._eventCallbacks[types[i].toLowerCase()];
            if (callbacks) {
                removeIndex = null;
                for (j = 0; j < callbacks.length; j++) {
                    if (callbacks[j] == callback) {
                        removeIndex = j;
                    }
                }
                if (removeIndex !== null) {
                    callbacks.splice(removeIndex, 1);
                }
            }
        }
    },
    fire: function(type, params) {
        var e = new MinderEvent(type, params);
        this._fire(e);
        return this;
    }
});

// 模块声明周期维护
kity.extendClass(Minder, {
    _initModules: function() {
        var modulesPool = KityMinder.getModules();
        var modulesToLoad = this._options.modules || Utils.keys(modulesPool);

        this._commands = {};
        this._query = {};
        this._modules = {};
        this._renderers = {};

        var i, name, type, module, moduleDeals,
            dealCommands, dealEvents, dealRenderers;

        var me = this;
        for (i = 0; i < modulesToLoad.length; i++) {
            name = modulesToLoad[i];

            if (!modulesPool[name]) continue;

            // 执行模块初始化，抛出后续处理对象

            if (typeof(modulesPool[name]) == 'function') {
                moduleDeals = modulesPool[name].call(me);
            } else {
                moduleDeals = modulesPool[name];
            }
            this._modules[name] = moduleDeals;

            if (moduleDeals.init) {
                moduleDeals.init.call(me, this._options);
            }

            // command加入命令池子
            dealCommands = moduleDeals.commands;
            for (name in dealCommands) {
                this._commands[name.toLowerCase()] = new dealCommands[name]();
            }

            // 绑定事件
            dealEvents = moduleDeals.events;
            if (dealEvents) {
                for (type in dealEvents) {
                    me.on(type, dealEvents[type]);
                }
            }

            // 渲染器
            dealRenderers = moduleDeals.renderers;

            if (dealRenderers) {

                for (type in dealRenderers) {
                    this._renderers[type] = this._renderers[type] || [];

                    if (Utils.isArray(dealRenderers[type])) {
                        this._renderers[type] = this._renderers[type].concat(dealRenderers[type]);
                    } else {
                        this._renderers[type].push(dealRenderers[type]);
                    }
                }
            }

            if (moduleDeals.defaultOptions) {
                this.setDefaultOptions(moduleDeals.defaultOptions);
            }

            //添加模块的快捷键
            if (moduleDeals.addShortcutKeys) {
                this.addShortcutKeys(moduleDeals.addShortcutKeys);
            }

            //添加邮件菜单
            if (moduleDeals.contextmenu) {
                this.addContextmenu(moduleDeals.contextmenu);
            }
        }
    },

    _garbage: function() {
        this.clearSelect();

        while (this._root.getChildren().length) {
            this._root.removeChild(0);
        }
    },

    destroy: function() {
        var modules = this._modules;

        this._resetEvents();
        this._garbage();

        for (var key in modules) {
            if (!modules[key].destroy) continue;
            modules[key].destroy.call(this);
        }
    },

    reset: function() {
        var modules = this._modules;

        this._garbage();

        for (var key in modules) {
            if (!modules[key].reset) continue;
            modules[key].reset.call(this);
        }
    }
});

kity.extendClass(Minder, {
    _getCommand: function (name) {
        return this._commands[name.toLowerCase()];
    },

    _queryCommand: function (name, type, args) {
        var cmd = this._getCommand(name);
        if (cmd) {
            var queryCmd = cmd['query' + type];
            if (queryCmd)
                return queryCmd.apply(cmd, [this].concat(args));
        }
        return 0;
    },

    queryCommandState: function (name) {
        return this._queryCommand(name, "State", Utils.argsToArray(1));
    },

    queryCommandValue: function (name) {
        return this._queryCommand(name, "Value", Utils.argsToArray(1));
    },

    execCommand: function (name) {
        name = name.toLowerCase();

        var cmdArgs = Utils.argsToArray(arguments, 1),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand(name);

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if (!cmd) {
            return false;
        }

        if (!this._hasEnterExecCommand && cmd.isNeedUndo()) {
            this._hasEnterExecCommand = true;
            stoped = this._fire(new MinderEvent('beforeExecCommand', eventParams, true));

            if (!stoped) {
                //保存场景
                this._fire(new MinderEvent('saveScene'));

                this._fire(new MinderEvent("preExecCommand", eventParams, false));

                result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

                this._fire(new MinderEvent('execCommand', eventParams, false));

                //保存场景
                this._fire(new MinderEvent('saveScene'));

                if (cmd.isContentChanged()) {
                    this._firePharse(new MinderEvent('contentchange'));
                }
                if (cmd.isSelectionChanged()) {
                    this._firePharse(new MinderEvent('selectionchange'));
                }
                this._firePharse(new MinderEvent('interactchange'));
            }
            this._hasEnterExecCommand = false;
        } else {
            result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

            if (!this._hasEnterExecCommand) {
                if (cmd.isSelectionChanged()) {
                    this._firePharse(new MinderEvent('selectionchange'));
                }

                this._firePharse(new MinderEvent('interactchange'));
            }
        }

        return result === undefined ? null : result;
    }
});

kity.extendClass(Minder, {

    getRoot: function() {
        return this._root;
    },

    setRoot: function(root) {
        this._root = root;
        root.minder = this;
    },

    createNode: function(unknown, parent, index) {
        var node = new MinderNode(unknown);
        this.fire('nodecreate', {
            node: node
        });
        this.appendNode(node,parent, index);
        return node;
    },

    appendNode: function(node, parent, index) {
        if (parent) parent.insertChild(node, index);
        this.handelNodeCreate(node);
        this.fire('nodeattach', {
            node: node
        });
        return this;
    },

    removeNode: function(node) {
        if (node.parent) {
            node.parent.removeChild(node);
            this.handelNodeRemove(node);
            this.fire('noderemove', {
                node: node
            });
        }
    },

    handelNodeCreate: function(node) {
        var rc = this._rc;
        node.traverse(function(current) {
            current.attached = true;
            rc.addShape(current.getRenderContainer());
        });
        rc.addShape(node.getRenderContainer());
    },

    handelNodeRemove: function(node) {
        var rc = this._rc;
        node.traverse(function(current) {
            current.attached = false;
            rc.removeShape(current.getRenderContainer());
        });
    },

    getMinderTitle: function() {
        return this.getRoot().getText();
    }

});

kity.extendClass(MinderNode, {
    getMinder: function() {
        return this.getRoot().minder;
    }
});

// 选区管理
kity.extendClass(Minder, {
    _initSelection: function() {
        this._selectedNodes = [];
    },
    renderChangedSelection: function(last) {
        var current = this.getSelectedNodes();
        var changed = [];
        var i = 0;

        current.forEach(function(node) {
            if (last.indexOf(node) == -1) {
                changed.push(node);
                node.setTmpData('selected', true);
            }
        });

        last.forEach(function(node) {
            if (current.indexOf(node) == -1) {
                changed.push(node);
                node.setTmpData('selected', false);
            }
        });

        while (i < changed.length) changed[i++].render();
    },
    getSelectedNodes: function() {
        //不能克隆返回，会对当前选区操作，从而影响querycommand
        return this._selectedNodes;
    },
    getSelectedNode: function() {
        return this.getSelectedNodes()[0] || null;
    },
    removeAllSelectedNodes: function() {
        var me = this;
        var last = this._selectedNodes.splice(0);
        this._selectedNodes = [];
        this.renderChangedSelection(last);
        return this.fire('selectionclear');
    },
    removeSelectedNodes: function(nodes) {
        var me = this;
        var last = this._selectedNodes.slice(0);
        nodes = Utils.isArray(nodes) ? nodes : [nodes];
        Utils.each(nodes, function(i, n) {
            var index;
            if ((index = me._selectedNodes.indexOf(n)) === -1) return;
            me._selectedNodes.splice(index, 1);
        });
        this.renderChangedSelection(last);
        return this;
    },
    select: function(nodes, isSingleSelect) {
        var lastSelect = this.getSelectedNodes().slice(0);
        if (isSingleSelect) {
            this._selectedNodes = [];
        }
        var me = this;
        nodes = Utils.isArray(nodes) ? nodes : [nodes];
        Utils.each(nodes, function(i, n) {
            if (me._selectedNodes.indexOf(n) !== -1) return;
            me._selectedNodes.push(n);
        });
        this.renderChangedSelection(lastSelect);
        return this;
    },

    //当前选区中的节点在给定的节点范围内的保留选中状态，
    //没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
    toggleSelect: function(node) {
        if (Utils.isArray(node)) {
            node.forEach(this.toggleSelect.bind(this));
        } else {
            if (node.isSelected()) this.removeSelectedNodes(node);
            else this.select(node);
        }
        return this;
    },

    isSingleSelect: function() {
        return this._selectedNodes.length == 1;
    },

    getSelectedAncestors: function(includeRoot) {
        var nodes = this.getSelectedNodes().slice(0),
            ancestors = [],
            judge;

        // 根节点不参与计算
        var rootIndex = nodes.indexOf(this.getRoot());
        if (~rootIndex && !includeRoot) {
            nodes.splice(rootIndex, 1);
        }

        // 判断 nodes 列表中是否存在 judge 的祖先
        function hasAncestor(nodes, judge) {
            for (var i = nodes.length - 1; i >= 0; --i) {
                if (nodes[i].isAncestorOf(judge)) return true;
            }
            return false;
        }

        // 按照拓扑排序
        nodes.sort(function(node1, node2) {
            return node1.getLevel() - node2.getLevel();
        });

        // 因为是拓扑有序的，所以只需往上查找
        while ((judge = nodes.pop())) {
            if (!hasAncestor(nodes, judge)) {
                ancestors.push(judge);
            }
        }

        return ancestors;
    }
});

kity.extendClass(MinderNode, {
    isSelected: function() {
        return this.getTmpData('selected');
    },
    clearSelectedFlag:function(){
        this.setTmpData('selected');
    },
    setSelectedFlag:function(){
        this.setTmpData('selected',true);
    }
});

var keymap = KityMinder.keymap = (function(origin) {
    var ret = {};
    for (var key in origin) {
        if (origin.hasOwnProperty(key)) {
            ret[key] = origin[key];
            ret[key.toLowerCase()] = origin[key];
        }
    }
    return ret;
})({
    'Backspace': 8,
    'Tab': 9,
    'Enter': 13,

    'Shift': 16,
    'Control': 17,
    'Alt': 18,
    'CapsLock': 20,

    'Esc': 27,

    'Spacebar': 32,

    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,


    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,

    'direction':{
        37:1,
        38:1,
        39:1,
        40:1
    },
    'Insert': 45,

    'Del': 46,

    'NumLock': 144,

    'Cmd': 91,
    'CmdFF':224,
    'F2': 113,
    'F3': 114,
    'F4': 115,

    '=': 187,
    '-': 189,

    'b': 66,
    'i': 73,
    //回退
    'z': 90,
    'y': 89,

    //复制粘贴
    'v': 86,
    'x': 88,
    'c': 67,

    's': 83,

    'n': 78,
    '/': 191,
    '.': 190,
    controlKeys:{
        16:1,
        17:1,
        18:1,
        20:1,
        91:1,
        224:1
    },
    'notContentChange': {
        13: 1,
        9: 1,

        33: 1,
        34: 1,
        35: 1,
        36: 1,

        16: 1,
        17: 1,
        18: 1,
        20: 1,
        91: 1,

        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,

        113: 1,
        114: 1,
        115: 1,
        144: 1,
        27: 1
    },

    'isSelectedNodeKey': {
        //上下左右
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        13: 1,
        9: 1
    },
    'a':65

});

//添加多语言模块
kity.extendClass( Minder, {
    getLang: function ( path ) {

        var lang = KM.LANG[ this.getOptions( 'lang' ) ];
        if ( !lang ) {
            throw Error( "not import language file" );
        }
        path = ( path || "" ).split( "." );
        for ( var i = 0, ci; ci = path[ i++ ]; ) {
            lang = lang[ ci ];
            if ( !lang ) break;
        }
        return lang;
    }
} );

//这里只放不是由模块产生的默认参数
KM.defaultOptions = {
    zIndex : 1000,
    lang:'zh-cn',
    readyOnly:false
};

kity.extendClass( Minder, function(){

    var ROOTKEY = 'kityminder_preference';

    //创建存储机制
    var LocalStorage = ( function () {

        var storage = window.localStorage,
            LOCAL_FILE = "localStorage";

        return {

            saveLocalData: function ( key, data ) {

                if ( storage && data) {
                    storage.setItem( key, data  );
                    return true;
                }

                return false;

            },

            getLocalData: function ( key ) {

                if ( storage ) {
                    return storage.getItem( key );
                }

                return null;

            },

            removeItem: function ( key ) {

                storage && storage.removeItem( key );

            }

        };

    } )();
    return {
        setPreferences:function(key,value){
            var obj = {};
            if ( Utils.isString( key ) ) {
                obj[ key ] = value;
            } else {
                obj = key;
            }
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                utils.extend(data, obj);
            }else{
                data = obj;
            }
            LocalStorage.saveLocalData(ROOTKEY,JSON.stringify(data));
        },
        getPreferences:function(key){
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                return key ? data[key] : data
            }
            return null;
        },
        resetPreferences:function(pres){
            var str = pres ? JSON.stringify(pres) : '';
            LocalStorage.saveLocalData(str)
        }
    }

}() );

/**
 * 浏览器判断模块
 * @file
 * @module UE.browser
 * @since 1.2.6.1
 */

/**
 * 提供浏览器检测的模块
 * @unfile
 * @module KM.browser
 */
var browser = KityMinder.browser = function(){
    var agent = navigator.userAgent.toLowerCase(),
        opera = window.opera,
        browser = {
        /**
         * @property {boolean} ie 检测当前浏览器是否为IE
         * @example
         * ```javascript
         * if ( UE.browser.ie ) {
         *     console.log( '当前浏览器是IE' );
         * }
         * ```
         */
        ie		:  /(msie\s|trident.*rv:)([\w.]+)/.test(agent),

        /**
         * @property {boolean} opera 检测当前浏览器是否为Opera
         * @example
         * ```javascript
         * if ( UE.browser.opera ) {
         *     console.log( '当前浏览器是Opera' );
         * }
         * ```
         */
        opera	: ( !!opera && opera.version ),

        /**
         * @property {boolean} webkit 检测当前浏览器是否是webkit内核的浏览器
         * @example
         * ```javascript
         * if ( UE.browser.webkit ) {
         *     console.log( '当前浏览器是webkit内核浏览器' );
         * }
         * ```
         */
        webkit	: ( agent.indexOf( ' applewebkit/' ) > -1 ),

        /**
         * @property {boolean} mac 检测当前浏览器是否是运行在mac平台下
         * @example
         * ```javascript
         * if ( UE.browser.mac ) {
         *     console.log( '当前浏览器运行在mac平台下' );
         * }
         * ```
         */
        mac	: ( agent.indexOf( 'macintosh' ) > -1 ),

        /**
         * @property {boolean} quirks 检测当前浏览器是否处于“怪异模式”下
         * @example
         * ```javascript
         * if ( UE.browser.quirks ) {
         *     console.log( '当前浏览器运行处于“怪异模式”' );
         * }
         * ```
         */
        quirks : ( document.compatMode == 'BackCompat' ),

        ipad :  ( agent.indexOf( 'ipad' ) > -1 )
    };

    /**
    * @property {boolean} gecko 检测当前浏览器内核是否是gecko内核
    * @example
    * ```javascript
    * if ( UE.browser.gecko ) {
    *     console.log( '当前浏览器内核是gecko内核' );
    * }
    * ```
    */
    browser.gecko =( navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

    var version = 0;

    // Internet Explorer 6.0+
    if ( browser.ie ){

        var v1 =  agent.match(/(?:msie\s([\w.]+))/);
        var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
        if(v1 && v2 && v1[1] && v2[1]){
            version = Math.max(v1[1]*1,v2[1]*1);
        }else if(v1 && v1[1]){
            version = v1[1]*1;
        }else if(v2 && v2[1]){
            version = v2[1]*1;
        }else{
            version = 0;
        }

        browser.ie11Compat = document.documentMode == 11;
        /**
         * @property { boolean } ie9Compat 检测浏览器模式是否为 IE9 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie9Compat ) {
         *     console.log( '当前浏览器运行在IE9兼容模式下' );
         * }
         * ```
         */
        browser.ie9Compat = document.documentMode == 9;

        /**
         * @property { boolean } ie8 检测浏览器是否是IE8浏览器
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8 ) {
         *     console.log( '当前浏览器是IE8浏览器' );
         * }
         * ```
         */
        browser.ie8 = !!document.documentMode;

        /**
         * @property { boolean } ie8Compat 检测浏览器模式是否为 IE8 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie8Compat ) {
         *     console.log( '当前浏览器运行在IE8兼容模式下' );
         * }
         * ```
         */
        browser.ie8Compat = document.documentMode == 8;

        /**
         * @property { boolean } ie7Compat 检测浏览器模式是否为 IE7 兼容模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie7Compat ) {
         *     console.log( '当前浏览器运行在IE7兼容模式下' );
         * }
         * ```
         */
        browser.ie7Compat = ( ( version == 7 && !document.documentMode )
                || document.documentMode == 7 );

        /**
         * @property { boolean } ie6Compat 检测浏览器模式是否为 IE6 模式 或者怪异模式
         * @warning 如果浏览器不是IE， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.ie6Compat ) {
         *     console.log( '当前浏览器运行在IE6模式或者怪异模式下' );
         * }
         * ```
         */
        browser.ie6Compat = ( version < 7 || browser.quirks );

        browser.ie9above = version > 8;

        browser.ie9below = version < 9;

    }

    // Gecko.
    if ( browser.gecko ){
        var geckoRelease = agent.match( /rv:([\d\.]+)/ );
        if ( geckoRelease )
        {
            geckoRelease = geckoRelease[1].split( '.' );
            version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
        }
    }

    /**
     * @property { Number } chrome 检测当前浏览器是否为Chrome, 如果是，则返回Chrome的大版本号
     * @warning 如果浏览器不是chrome， 则该值为undefined
     * @example
     * ```javascript
     * if ( UE.browser.chrome ) {
     *     console.log( '当前浏览器是Chrome' );
     * }
     * ```
     */
    if (/chrome\/(\d+\.\d)/i.test(agent)) {
        browser.chrome = + RegExp['\x241'];
    }

    /**
     * @property { Number } safari 检测当前浏览器是否为Safari, 如果是，则返回Safari的大版本号
     * @warning 如果浏览器不是safari， 则该值为undefined
     * @example
     * ```javascript
     * if ( UE.browser.safari ) {
     *     console.log( '当前浏览器是Safari' );
     * }
     * ```
     */
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
    	browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
    }


    // Opera 9.50+
    if ( browser.opera )
        version = parseFloat( opera.version() );

    // WebKit 522+ (Safari 3+)
    if ( browser.webkit )
        version = parseFloat( agent.match( / applewebkit\/(\d+)/ )[1] );

    /**
     * @property { Number } version 检测当前浏览器版本号
     * @remind
     * <ul>
     *     <li>IE系列返回值为5,6,7,8,9,10等</li>
     *     <li>gecko系列会返回10900，158900等</li>
     *     <li>webkit系列会返回其build号 (如 522等)</li>
     * </ul>
     * @example
     * ```javascript
     * console.log( '当前浏览器版本号是： ' + UE.browser.version );
     * ```
     */
    browser.version = version;

    /**
     * @property { boolean } isCompatible 检测当前浏览器是否能够与UEditor良好兼容
     * @example
     * ```javascript
     * if ( UE.browser.isCompatible ) {
     *     console.log( '浏览器与UEditor能够良好兼容' );
     * }
     * ```
     */
    browser.isCompatible =
        !browser.mobile && (
        ( browser.ie && version >= 6 ) ||
        ( browser.gecko && version >= 10801 ) ||
        ( browser.opera && version >= 9.5 ) ||
        ( browser.air && version >= 1 ) ||
        ( browser.webkit && version >= 522 ) ||
        false );
    return browser;
}();
//快捷方式
var ie = browser.ie,
    webkit = browser.webkit,
    gecko = browser.gecko,
    opera = browser.opera;

/**
 * 布局支持池子管理
 */
Utils.extend(KityMinder, {
    _layout: {},

    registerLayout: function(name, layout) {
        KityMinder._layout[name] = layout;
        if (!KityMinder._defaultLayout) {
            KityMinder._defaultLayout = name;
        }
    }
});

/**
 * MinderNode 上的布局支持
 */
kity.extendClass(MinderNode, {

    /**
     * 获得当前节点的布局名称
     *
     * @return {String}
     */
    getLayout: function() {
        var layout = this.getData('layout');

        layout = layout || (this.isRoot() ? KityMinder._defaultLayout : this.parent.getLayout());

        return layout;
    },

    getOrder: function() {
        return this.getData('order') || this.getIndex();
    },

    setOrder: function(order) {
        return this.setData('order', order);
    },

    getOrderHint: function(refer) {
        return this.parent.getLayoutInstance().getOrderHint(this);
    },

    getExpandPosition: function() {
        return this.getLayoutInstance().getExpandPosition();
    },

    getLayoutInstance: function() {
        var LayoutClass = KityMinder._layout[this.getLayout()];
        var layout = new LayoutClass();
        return layout;
    },

    /**
     * 设置当前节点相对于父节点的布局变换
     */
    setLayoutTransform: function(matrix) {
        this._layoutTransform = matrix;
    },

    /**
     * 获取当前节点相对于父节点的布局变换
     */
    getLayoutTransform: function() {
        return this._layoutTransform || new kity.Matrix();
    },

    /**
     * 设置当前节点相对于父节点的布局向量
     */
    setLayoutVector: function(vector) {
        this._layoutVector = vector;
        return this;
    },

    /**
     * 获取当前节点相对于父节点的布局向量
     */
    getLayoutVector: function(vector) {
        return this._layoutVector || new kity.Vector();
    },

    /**
     * 获取节点相对于全局的布局变换
     */
    getGlobalLayoutTransform: function() {
        return this._lastLayoutTransform || new kity.Matrix();
    },

    getLayoutBox: function() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformBox(this.getContentBox());
    },

    getLayoutPoint: function() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformPoint(new kity.Point());
    },

    getLayoutOffset: function() {
        var data = this.getData('layout_' + this.getLayout() + '_offset');
        if (data) return new kity.Point(data.x, data.y);
        return new kity.Point();
    },

    setLayoutOffset: function(p) {
        this.setData('layout_' + this.getLayout() + '_offset', p ? {
            x: p.x,
            y: p.y
        } : null);
        return this;
    },

    setVertexIn: function(p) {
        this._vertexIn = p;
    },

    setVertexOut: function(p) {
        this._vertexOut = p;
    },

    getVertexIn: function() {
        return this._vertexIn || new kity.Point();
    },

    getVertexOut: function() {
        return this._vertexOut || new kity.Point();
    },

    getLayoutVertexIn: function() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexIn());
    },

    getLayoutVertexOut: function() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexOut());
    },

    getLayoutRoot: function() {
        if (this.isLayoutRoot()) {
            return this;
        }
        return this.parent.getLayoutRoot();
    },

    isLayoutRoot: function() {
        return this.getData('layout') || this.isRoot();
    },

    layout: function(name, duration) {
        if (name) {
            if (name == 'inherit') {
                this.setData('layout');
            } else {
                this.setData('layout', name);
            }
        }

        this.getMinder().layout(duration);

        return this;
    }
});

kity.extendClass(Minder, {

    layout: function(duration) {

        this.getRoot().traverse(function(node) {
            node.setLayoutTransform(null);
        });

        function layoutNode(node) {

            // layout all children first
            // 剪枝：收起的节点无需计算
            if (node.isExpanded()) {
                node.children.forEach(function(child) {
                    layoutNode(child);
                });
            }

            var layout = node.getLayoutInstance();
            layout.doLayout(node);
        }

        layoutNode(this.getRoot());

        this.applyLayoutResult(this.getRoot(), duration);

        return this.fire('layout');
    },

    refresh: function(duration) {
        this.getRoot().preTraverse(function(node) { node.render(); });
        this.layout(duration).fire('contentchange').fire('interactchange');
        return this;
    },

    applyLayoutResult: function(root, duration) {
        root = root || this.getRoot();
        var me = this;

        function applyMatrix(node, matrix) {
            node.getRenderContainer().setMatrix(node._lastLayoutTransform = matrix);
            me.fire('layoutapply', {
                node: node,
                matrix: matrix
            });
        }

        function apply(node, pMatrix) {
            var matrix = node.getLayoutTransform().merge(pMatrix);
            var lastMatrix = node._lastLayoutTransform || new kity.Matrix();

            var offset = node.getLayoutOffset();
            matrix.translate(offset.x, offset.y);

            matrix.m.e = Math.round(matrix.m.e);
            matrix.m.f = Math.round(matrix.m.f);

            if (!matrix.equals(lastMatrix) || true) {

                // 如果当前有动画，停止动画
                if (node._layoutTimeline) {
                    node._layoutTimeline.stop();
                    delete node._layoutTimeline;
                }

                // 如果要求以动画形式来更新，创建动画
                if (duration > 0) {
                    node._layoutTimeline = new kity.Animator(lastMatrix, matrix, applyMatrix)
                        .start(node, duration, 'ease')
                        .on('finish', function() {
                            // 可能性能低的时候会丢帧
                            clearTimeout(node._lastFixTimeout);
                            node._lastFixTimeout = setTimeout(function() {
                                applyMatrix(node, matrix);
                                me.fire('layoutfinish', {
                                    node: node,
                                    matrix: matrix
                                });
                            });
                        });
                }

                // 否则直接更新
                else {
                    applyMatrix(node, matrix);
                    me.fire('layoutfinish', {
                        node: node,
                        matrix: matrix
                    });
                }
            }

            for (var i = 0; i < node.children.length; i++) {
                apply(node.children[i], matrix);
            }
        }

        apply(root, root.parent ? root.parent.getGlobalLayoutTransform() : new kity.Matrix());
        return this;
    },
});


/**
 * @class Layout 布局基类，具体布局需要从该类派生
 */
var Layout = kity.createClass('Layout', {

    /**
     * @abstract
     *
     * 子类需要实现的布局算法，该算法输入一个节点，排布该节点的子节点（相对父节点的变换）
     *
     * @param  {MinderNode} node 需要布局的节点
     *
     * @example
     *
     * doLayout: function(node) {
     *     var children = node.getChildren();
     *     // layout calculation
     *     children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
     * }
     */
    doLayout: function(node) {
        throw new Error('Not Implement: Layout.doLayout()');
    },

    /**
     * 工具方法：获取给点的节点所占的布局区域
     *
     * @param  {MinderNode[]} nodes 需要计算的节点
     *
     * @return {Box} 计算结果
     */
    getBranchBox: function(nodes) {
        var box = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };
        var g = KityMinder.Geometry;
        var i, node, matrix, contentBox;
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();
            contentBox = node.getContentBox();
            box = g.mergeBox(box, matrix.transformBox(contentBox));
        }

        return box;
    },

    /**
     * 工具方法：计算给定的节点的子树所占的布局区域
     *
     * @param  {MinderNode} nodes 需要计算的节点
     *
     * @return {Box} 计算的结果
     */
    getTreeBox: function(nodes) {

        var i, node, matrix, treeBox;

        var g = KityMinder.Geometry;

        var box = {
            x: 0,
            y: 0,
            height: 0,
            width: 0
        };

        if (!(nodes instanceof Array)) nodes = [nodes];

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            matrix = node.getLayoutTransform();

            treeBox = node.getContentBox();

            if (node.children.length) {
                treeBox = g.mergeBox(treeBox, this.getTreeBox(node.children));
            }

            box = g.mergeBox(box, matrix.transformBox(treeBox));
        }

        return box;
    },

    getOrderHint: function(node) {
        return [];
    }
});

/* global Renderer: true */

utils.extend(KityMinder, {
    _connectProviders: {},

    _defaultConnectProvider: function(node, parent, connection) {
        connection.setPathData([
            'M', parent.getLayoutPoint(),
            'L', node.getLayoutPoint()
        ]);
    },

    registerConnectProvider: function(layout, provider) {
        KityMinder._connectProviders[layout] = provider;
    },

    getConnectProvider: function(layout) {
        return KityMinder._connectProviders[layout] || KityMinder._defaultConnectProvider;
    }
});

kity.extendClass(Minder, {

    createConnect: function(node) {
        if (node.isRoot()) return;

        var connection = new kity.Path();

        node._connection = connection;

        if (!this._connectContainer) {
            this._connectContainer = new kity.Group().setId(KityMinder.uuid('minder_connect_group'));
            this.getRenderContainer().prependShape(this._connectContainer);
        }

        this._connectContainer.addShape(connection);
    },

    removeConnect: function(node) {
        var me = this;
        node.traverse(function(node) {
            me._connectContainer.removeShape(node._connection);
        });
    },

    updateConnect: function(node) {

        var connection = node._connection;
        var parent = node.parent;

        if (!parent) return;

        if (parent.isCollapsed()) {
            connection.setVisible(false);
            return;
        }
        connection.setVisible(true);

        var provider = KityMinder.getConnectProvider(parent.getLayout());

        var strokeColor = node.getStyle('connect-color') || 'white',
            strokeWidth = node.getStyle('connect-width') || 2;

        connection.stroke(strokeColor, strokeWidth);

        provider(node, parent, connection, strokeWidth, strokeColor);
    }
});

KityMinder.registerModule('Connect', {
    events: {
        'nodeattach': function(e) {
            this.createConnect(e.node);
        },
        'noderemove': function(e) {
            this.removeConnect(e.node);
        },
        'layoutapply noderender': function(e) {
            this.updateConnect(e.node);
        }
    }
});

var Renderer = KityMinder.Renderer = kity.createClass('Renderer', {
    constructor: function(node) {
        this.node = node;
    },

    create: function() {
        throw new Error('Not implement: Renderer.create()');
    },

    shouldRender: function() {
        return true;
    },

    update: function() {
        throw new Error('Not implement: Renderer.update()');
    },

    getRenderShape: function() {
        return this._renderShape || null;
    },

    setRenderShape: function(shape) {
        this._renderShape = shape;
    }
});

kity.extendClass(Minder, {

    _createRendererForNode: function(node) {

        var registered = this._renderers;
        var renderers = [];

        ['center', 'left', 'right', 'top', 'bottom', 'outline', 'outside'].forEach(function(section) {
            if (registered['before' + section]) {
                renderers = renderers.concat(registered['before' + section]);
            }
            if (registered[section]) {
                renderers = renderers.concat(registered[section]);
            }
            if (registered['after' + section]) {
                renderers = renderers.concat(registered['after' + section]);
            }
        });

        node._renderers = renderers.map(function(Renderer) {
            return new Renderer(node);
        });
    },

    renderNode: function(node) {

        var rendererClasses = this._renderers;
        var g = KityMinder.Geometry;
        var i, latestBox, renderer;

        if (!node._renderers) {
            this._createRendererForNode(node);
        }

        this.fire('beforerender', {node: node});

        node._contentBox = g.wrapBox({
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        });

        node._renderers.forEach(function(renderer) {

            // 判断当前上下文是否应该渲染
            if (renderer.shouldRender(node)) {

                // 应该渲染，但是渲染图形没创建过，需要创建
                if (!renderer.getRenderShape()) {
                    renderer.setRenderShape(renderer.create(node));
                    if (renderer.bringToBack) {
                        node.getRenderContainer().prependShape(renderer.getRenderShape());
                    } else {
                        node.getRenderContainer().appendShape(renderer.getRenderShape());
                    }
                }

                // 强制让渲染图形显示
                renderer.getRenderShape().setVisible(true);

                // 更新渲染图形
                latestBox = renderer.update(renderer.getRenderShape(), node, node._contentBox);

                // 合并渲染区域
                if (latestBox) {
                    node._contentBox = g.mergeBox(node._contentBox, latestBox);
                }
            }

            // 如果不应该渲染，但是渲染图形创建过了，需要隐藏起来
            else if (renderer.getRenderShape()) {
                renderer.getRenderShape().setVisible(false);
            }

        });

        this.fire('noderender', {
            node: node
        });
    }
});

kity.extendClass(MinderNode, {
    render: function() {
        if (!this.attached) return;
        this.getMinder().renderNode(this);
        return this;
    },
    getRenderer: function(type) {
        var rs = this._renderers;
        for (var i = 0; i < rs.length; i++) {
            if (rs[i].getType() == type) return rs[i];
        }
        return null;
    },
    getContentBox: function() {
        //if (!this._contentBox) this.render();
        return this.parent && this.parent.isCollapsed() ? new kity.Box() : this._contentBox;
    }
});

var cssLikeValueMatcher = {
    left: function(value) {
        return 3 in value && value[3] ||
            1 in value && value[1] ||
            value[0];
    },
    right: function(value) {
        return 1 in value && value[1] || value[0];
    },
    top: function(value) {
        return value[0];
    },
    bottom: function(value) {
        return 2 in value && value[2] || value[0];
    }
};

Utils.extend(KityMinder, {
    _themes: {},

    /**
     * 注册一个主题
     *
     * @param  {String} name  主题的名称
     * @param  {Plain} theme 主题的样式描述
     *
     * @example
     *     KityMinder.registerTheme('default', {
     *         'root-color': 'red',
     *         'root-stroke': 'none',
     *         'root-padding': [10, 20]
     *     });
     */
    registerTheme: function(name, theme) {
        KityMinder._themes[name] = theme;
    },

    getThemeList: function() {
        return KityMinder._themes;
    }
});

kity.extendClass(Minder, {

    /**
     * 切换脑图实例上的主题
     * @param  {String} name 要使用的主题的名称
     */
    useTheme: function(name) {

        this.setTheme(name);
        this.refresh(800);

        return true;
    },

    setTheme: function(name) {
        this._theme = name || null;
        this.getPaper().getContainer().style.background = this.getStyle('background');
    },

    /**
     * 获取脑图实例上的当前主题
     * @return {[type]} [description]
     */
    getTheme: function(node) {
        return this._theme || this.getOptions('defaultTheme');
    },

    getThemeItems: function(node) {
        var theme = this.getTheme(node);
        return KityMinder._themes[this.getTheme(node)];
    },

    /**
     * 获得脑图实例上的样式
     * @param  {String} item 样式名称
     */
    getStyle: function(item, node) {
        var items = this.getThemeItems(node);
        var segment, dir, selector, value, matcher;

        if (item in items) return items[item];

        // 尝试匹配 CSS 数组形式的值
        // 比如 item 为 'pading-left'
        // theme 里有 {'padding': [10, 20]} 的定义，则可以返回 20
        segment = item.split('-');
        if (segment.length < 2) return null;

        dir = segment.pop();
        item = segment.join('-');

        if (item in items) {
            value = items[item];
            if (Utils.isArray(value) && (matcher = cssLikeValueMatcher[dir])) {
                return matcher(value);
            }
            if (!isNaN(value)) return value;
        }

        return null;
    },

    /**
     * 获取指定节点的样式
     * @param  {String} name 样式名称，可以不加节点类型的前缀
     */
    getNodeStyle: function(node, name) {
        var value = this.getStyle(node.getType() + '-' + name, node);
        return value !== null ? value : this.getStyle(name, node);
    }
});

kity.extendClass(MinderNode, {
    getStyle: function(name) {
        return this.getMinder().getNodeStyle(this, name);
    }
});

KityMinder.registerModule('Theme', {
    defaultOptions: {
        defaultTheme: 'fresh-blue'
    },
    commands: {
        'theme': kity.createClass('ThemeCommand', {
            base: Command,

            execute: function(km, name) {
                return km.useTheme(name);
            },

            queryValue: function(km) {
                return km.getTheme() || 'default';
            }
        })
    }
});

utils.extend(KityMinder, {
    _templates: {},
    registerTemplate: function(name, supports) {
        KityMinder._templates[name] = supports;
    },
    getTemplateList: function() {
        return KityMinder._templates;
    }
});

KityMinder.registerTemplate('default', {});

kity.extendClass(Minder, (function() {
    var originGetTheme = Minder.prototype.getTheme;
    return {
        useTemplate: function(name, duration) {
            this.setTemplate(name);
            this.refresh(duration || 800);
        },

        getTemplate: function() {
            return this._template || null;
        },

        setTemplate: function(name) {
            this._template = name || null;
        },

        getTemplateSupports: function() {
            return KityMinder._templates[this._template] || null;
        },

        getTheme: function(node) {
            var supports = this.getTemplateSupports();
            if (supports && supports.getTheme) {
                return supports.getTheme(node);
            }
            return originGetTheme.call(this, node);
        }
    };
})());


kity.extendClass(MinderNode, (function() {
    var originGetLayout = MinderNode.prototype.getLayout;
    return {
        getLayout: function() {
            var supports = this.getMinder().getTemplateSupports();
            if (supports && supports.getLayout) {
                return supports.getLayout(this);
            }
            return originGetLayout.call(this);
        }
    };
})());

KityMinder.registerModule('TemplateModule', {
    commands: {
        'template': kity.createClass('TemplateCommand', {
            base: Command,

            execute: function(minder, name) {
                minder.useTemplate(name);
            },

            queryValue: function(minder) {
                return minder.getTemplate() || 'default';
            }
        })
    }
});

/* global Layout:true */

KityMinder.registerLayout('default', kity.createClass({
    base: Layout,

    doLayout: function(node) {
        var layout = this;

        if (node.isLayoutRoot()) {
            this.doLayoutRoot(node);
        } else {
            this.arrange(node, node.children, layout.getSide(node));
        }
    },

    getSide: function(node) {
        while (!node.parent.isLayoutRoot()) {
            node = node.parent;
        }
        var mainIndex = node.getIndex();
        var length = node.parent.children.length;
        return mainIndex < length / 2 ? 'right' : 'left';
    },

    doLayoutRoot: function(root) {
        var mains = root.getChildren();
        var group = {
            left: [],
            right: []
        };
        var _this = this;

        mains.forEach(function(main) {
            group[_this.getSide(main)].push(main);
        });

        this.arrange(root, group.left, 'left');
        this.arrange(root, group.right, 'right');
    },

    arrange: function(parent, children, side) {
        if (!children.length) return;
        var _this = this;

        // children 所占的总树高
        var totalTreeHeight = 0;

        // 计算每个 child 的树所占的矩形区域
        var childTreeBoxes = children.map(function(node, index, children) {
            var box = _this.getTreeBox([node]);

            // 计算总树高，需要把竖直方向上的 margin 加入计算
            totalTreeHeight += box.height;

            if (index > 0) {
                totalTreeHeight += children[index - 1].getStyle('margin-bottom');
                totalTreeHeight += node.getStyle('margin-top');
            }

            return box;
        });

        var nodeContentBox = parent.getContentBox();
        var i, x, y, child, childTreeBox, childContentBox;
        var transform, offset;

        y = -totalTreeHeight / 2;

        if (side != 'left') {
            parent.setVertexOut(new kity.Point(nodeContentBox.right, nodeContentBox.cy));
            parent.setLayoutVector(new kity.Vector(1, 0));
        } else {
            parent.setVertexOut(new kity.Point(nodeContentBox.left, nodeContentBox.cy));
            parent.setLayoutVector(new kity.Vector(-1, 0));
        }

        for (i = 0; i < children.length; i++) {
            child = children[i];
            childTreeBox = childTreeBoxes[i];
            childContentBox = child.getContentBox();

            if (!childContentBox.height) continue;

            // 水平方向上的布局
            if (side == 'right') {
                x = nodeContentBox.right - childContentBox.left;
                x += parent.getStyle('margin-right') + child.getStyle('margin-left');
            } else {
                x = nodeContentBox.left - childContentBox.right;
                x -= parent.getStyle('margin-left') + child.getStyle('margin-right');
            }

            if (i > 0) {
                y += children[i].getStyle('margin-top');
            }

            // 竖直方向上的布局
            y -= childTreeBox.top;

            // 设置布局结果
            transform = new kity.Matrix().translate(x, y);

            child.setLayoutTransform(transform);

            y += childTreeBox.bottom + child.getStyle('margin-bottom');
        }

        if (parent.isRoot()) {
            var branchBox = this.getBranchBox(children);
            var dy = branchBox.cy - nodeContentBox.cy;

            children.forEach(function(child) {
                child.getLayoutTransform().translate(0, -dy);
            });
        }
    },

    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = 5;

        hint.push({
            type: 'up',
            node: node,
            area: {
                x: box.x,
                y: box.top - node.getStyle('margin-top') - offset,
                width: box.width,
                height: node.getStyle('margin-top')
            },
            path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
        });

        hint.push({
            type: 'down',
            node: node,
            area: {
                x: box.x,
                y: box.bottom + offset,
                width: box.width,
                height: node.getStyle('margin-bottom')
            },
            path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
        });
        return hint;
    }
}));

var connectMarker = new kity.Marker().pipe(function() {
    var r = 7;
    var dot = new kity.Circle(r - 1);
    this.addShape(dot);
    this.setRef(r - 1, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
    this.dot = dot;
    this.node.setAttribute('markerUnits', 'userSpaceOnUse');
});

KityMinder.registerConnectProvider('default', function(node, parent, connection, width, color) {

    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();

    var start, end, vector;
    var abs = Math.abs;
    var pathData = [];
    var side = box.x > pBox.x ? 'right' : 'left';

    node.getMinder().getPaper().addResource(connectMarker);

    switch (node.getType()) {

        case 'main':

            start = new kity.Point(pBox.cx, pBox.cy);
            end = side == 'left' ?
                new kity.Point(box.right + 2, box.cy) :
                new kity.Point(box.left - 2, box.cy);

            vector = kity.Vector.fromPoints(start, end);
            pathData.push('M', start);
            pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);

            connection.setMarker(connectMarker);
            connectMarker.dot.fill(color);

            break;

        case 'sub':

            var radius = node.getStyle('connect-radius');
            var underY = box.bottom + 3;
            var startY = parent.getType() == 'sub' ? pBox.bottom + 3 : pBox.cy;
            var p1, p2, p3, mx;

            if (side == 'right') {
                p1 = new kity.Point(pBox.right + 10, startY);
                p2 = new kity.Point(box.left, underY);
                p3 = new kity.Point(box.right + 10, underY);
            } else {
                p1 = new kity.Point(pBox.left - 10, startY);
                p2 = new kity.Point(box.right, underY);
                p3 = new kity.Point(box.left - 10, underY);
            }

            mx = (p1.x + p2.x) / 2;

            if (width % 2 === 0) {
                p1.y += 0.5;
                p2.y += 0.5;
                p3.y += 0.5;
            }

            pathData.push('M', p1);
            pathData.push('C', mx, p1.y, mx, p2.y, p2);
            pathData.push('L', p3);

            connection.setMarker(null);

            break;
    }

    connection.setPathData(pathData);
});

/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('bottom', kity.createClass({

    base: Layout,

    doLayout: function(node) {

        var children = node.getChildren();

        if (!children.length) {
            return false;
        }

        var me = this;

        // 子树的总宽度（包含间距）
        var totalTreeWidth = 0;

        // 父亲所占的区域
        var nodeContentBox = node.getContentBox();

        // 为每一颗子树准备的迭代变量
        var i, x0, x, y, child, childTreeBox, childContentBox, matrix;

        // 先最左对齐
        x0 = x = nodeContentBox.left;

        for (i = 0; i < children.length; i++) {

            child = children[i];
            childContentBox = child.getContentBox();
            childTreeBox = this.getTreeBox(child);
            matrix = new kity.Matrix();

            // 忽略无宽度的节点（收起的）
            if (!childContentBox.width) continue;

            if (i > 0) {
                x += child.getStyle('margin-left');
            }

            x -= childTreeBox.left;

            // arrange x
            matrix.translate(x, 0);

            // 为下个位置准备
            x += childTreeBox.right;

            if (i < children.length - 1) x += child.getStyle('margin-right');

            y = nodeContentBox.bottom - childTreeBox.top +
                node.getStyle('margin-bottom') + child.getStyle('margin-top');

            matrix.translate(0, y);

            // 设置结果
            child.setLayoutTransform(matrix);
            child.setVertexIn(new kity.Point(childContentBox.cx, childContentBox.top));

        }

        // 设置布局矢量为向下
        node.setLayoutVector(new kity.Vector(0, 1));

        // 设置流出顶点
        node.setVertexOut(new kity.Point(nodeContentBox.cx, nodeContentBox.bottom));

        var dx = (x - x0 - nodeContentBox.width) / 2;

        children.forEach(function(child) {
            child.getLayoutTransform().translate(-dx, 0);
        });
    },

    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = 3;

        hint.push({
            type: 'up',
            node: node,
            area: {
                x: box.left - node.getStyle('margin-left') - offset,
                y: box.top,
                width: node.getStyle('margin-left'),
                height: box.height
            },
            path: ['M', box.left - offset, box.top, 'L', box.left - offset, box.bottom]
        });

        hint.push({
            type: 'down',
            node: node,
            area: {
                x: box.right + offset,
                y: box.top,
                width: node.getStyle('margin-right'),
                height: box.height
            },
            path: ['M', box.right + offset, box.top, 'L', box.right + offset, box.bottom]
        });
        return hint;
    }
}));

KityMinder.registerConnectProvider('bottom', function(node, parent, connection) {
    var pout = parent.getLayoutVertexOut(),
        pin = node.getLayoutVertexIn();
    var pathData = [];
    var r = Math.round;
    pathData.push('M', new kity.Point(r(pout.x), pout.y));
    pathData.push('L', new kity.Point(r(pout.x), pout.y + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(r(pin.x), pout.y + parent.getStyle('margin-bottom')));
    pathData.push('L', new kity.Point(r(pin.x), pin.y));
    connection.setMarker(null);
    connection.setPathData(pathData);
});

/* global Layout:true */
window.layoutSwitch = true;
KityMinder.registerLayout('filetree', kity.createClass({
    base: Layout,

    doLayout: function(node) {
        var layout = this;

        if (node.isLayoutRoot()) {
            this.doLayoutRoot(node);
        } else {
            this.arrange(node);
        }
    },
    doLayoutRoot: function(root) {
        this.arrange(root);
    },
    arrange: function(node) {
        var children = node.getChildren();
        var _this = this;
        if (!children.length) {
            return false;
        } else {
            // 计算每个 child 的树所占的矩形区域
            var childTreeBoxes = children.map(function(node, index, children) {
                var box = _this.getTreeBox([node]);
                return box;
            });
            var nodeContentBox = node.getContentBox();
            var i, x, y, child, childTreeBox, childContentBox;
            var transform = new kity.Matrix();

            node.setVertexOut(new kity.Point(0, nodeContentBox.bottom));
            node.setLayoutVector(new kity.Vector(0, 1));

            y = nodeContentBox.bottom + node.getStyle('margin-bottom');

            for (i = 0; i < children.length; i++) {
                child = children[i];
                childTreeBox = childTreeBoxes[i];
                childContentBox = child.getContentBox();

                x = child.getStyle('margin-left') - childContentBox.left;

                if (!childContentBox.width) continue;

                y += child.getStyle('margin-top');
                y -= childTreeBox.top;

                // 设置布局结果
                transform = new kity.Matrix().translate(x, y);

                child.setLayoutTransform(transform);

                y += childTreeBox.bottom + child.getStyle('margin-bottom');
            }
        }
    },
    getOrderHint: function(node) {
        var hint = [];
        var box = node.getLayoutBox();
        var offset = node.getLevel() > 1 ? 3 : 5;

        hint.push({
            type: 'up',
            node: node,
            area: {
                x: box.x,
                y: box.top - node.getStyle('margin-top') - offset,
                width: box.width,
                height: node.getStyle('margin-top')
            },
            path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
        });

        hint.push({
            type: 'down',
            node: node,
            area: {
                x: box.x,
                y: box.bottom + offset,
                width: box.width,
                height: node.getStyle('margin-bottom')
            },
            path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
        });
        return hint;
    }
}));

KityMinder.registerConnectProvider('filetree', function(node, parent, connection) {
    var box = node.getLayoutBox(),
        pBox = parent.getLayoutBox();
    var pathData = [];
    var left = parent.getLayoutPoint().x;
    var r = Math.round;
    pathData.push('M', new kity.Point(r(left), r(pBox.bottom)));
    pathData.push('L', new kity.Point(r(left), r(box.cy)));
    pathData.push('L', new kity.Point(r(box.left), r(box.cy)));
    connection.setPathData(pathData);
});

KityMinder.registerTheme('classic', {
    'background': '#3A4144 url(themes/default/images/grid.png) repeat',

    'root-color': '#430',
    'root-background': '#e9df98',
    'root-stroke': '#e9df98',
    'root-font-size': 24,
    'root-padding': [15, 25],
    'root-margin': [30, 100],
    'root-radius': 30,
    'root-space': 10,
    'root-shadow': 'rgba(0, 0, 0, .25)',

    'main-color': '#333',
    'main-background': '#a4c5c0',
    'main-stroke': '#a4c5c0',
    'main-font-size': 16,
    'main-padding': [6, 20],
    'main-margin': 20,
    'main-radius': 10,
    'main-space': 5,
    'main-shadow': 'rgba(0, 0, 0, .25)',

    'sub-color': 'white',
    'sub-background': 'none',
    'sub-stroke': 'none',
    'sub-font-size': 12,
    'sub-padding': [5, 10],
    'sub-margin': [15, 20],
    'sub-tree-margin': 30,
    'sub-radius': 5,
    'sub-space': 5,

    'connect-color': 'white',
    'connect-width': 2,
    'connect-radius': 5,

    'selected-background': 'rgb(254, 219, 0)',
    'selected-stroke': 'rgb(254, 219, 0)',
    'selected-color': 'black',

    'marquee-background': 'rgba(255,255,255,.3)',
    'marquee-stroke': 'white',

    'drop-hint-color': 'yellow',
    'sub-drop-hint-width': 2,
    'main-drop-hint-width': 4,
    'root-drop-hint-width': 4,

    'order-hint-area-color': 'rgba(0, 255, 0, .5)',
    'order-hint-path-color': '#0f0',
    'order-hint-path-width': 1,

    'text-selection-color': 'rgb(27,171,255)'
});

KityMinder.registerTheme('snow', {
    'background': '#3A4144 url(themes/default/images/grid.png) repeat',

    'root-color': '#430',
    'root-background': '#e9df98',
    'root-stroke': '#e9df98',
    'root-font-size': 24,
    'root-padding': [15, 25],
    'root-margin': 30,
    'root-radius': 5,
    'root-space': 10,
    'root-shadow': 'rgba(0, 0, 0, .25)',

    'main-color': '#333',
    'main-background': '#a4c5c0',
    'main-stroke': '#a4c5c0',
    'main-font-size': 16,
    'main-padding': [6, 20],
    'main-margin': [20, 40],
    'main-radius': 5,
    'main-space': 5,
    'main-shadow': 'rgba(0, 0, 0, .25)',

    'sub-color': 'black',
    'sub-background': 'white',
    'sub-stroke': 'white',
    'sub-font-size': 12,
    'sub-padding': [5, 10],
    'sub-margin': [10, 20],
    'sub-radius': 5,
    'sub-space': 5,

    'connect-color': 'white',
    'connect-width': 2,
    'connect-radius': 5,

    'selected-background': 'rgb(254, 219, 0)',
    'selected-stroke': 'rgb(254, 219, 0)',

    'marquee-background': 'rgba(255,255,255,.3)',
    'marquee-stroke': 'white',

    'drop-hint-color': 'yellow',
    'drop-hint-width': 4,

    'order-hint-area-color': 'rgba(0, 255, 0, .5)',
    'order-hint-path-color': '#0f0',
    'order-hint-path-width': 1,

    'text-selection-color': 'rgb(27,171,255)'
});

(function() {
    function hsl(h, s, l) {
        return kity.Color.createHSL(h, s, l);
    }

    function generate(h) {
        return {
            'background': '#fbfbfb',

            'root-color': 'white',
            'root-background': hsl(h, 37, 60),
            'root-stroke': hsl(h, 37, 60),
            'root-font-size': 16,
            'root-padding': [12, 24],
            'root-margin': [30, 100],
            'root-radius': 5,
            'root-space': 10,


            'main-color': 'black',
            'main-background': hsl(h, 33, 95),
            'main-stroke': hsl(h, 37, 60),
            'main-stroke-width': 1,
            'main-font-size': 14,
            'main-padding': [6, 20],
            'main-margin': 20,
            'main-radius': 3,
            'main-space': 5,

            'sub-color': 'black',
            'sub-background': 'none',
            'sub-stroke': 'none',
            'sub-font-size': 12,
            'sub-padding': [5, 10],
            'sub-margin': [15, 20],
            'sub-tree-margin': 30,
            'sub-radius': 5,
            'sub-space': 5,

            'connect-color': hsl(h, 37, 60),
            'connect-width': 1,
            'connect-radius': 5,

            'selected-stroke': hsl(h, 26, 30),
            'selected-stroke-width': '3',

            'marquee-background': hsl(h, 100, 80).set('a', 0.1),
            'marquee-stroke': hsl(h, 37, 60),

            'drop-hint-color': hsl(h, 26, 35),
            'drop-hint-width': 5,

            'order-hint-area-color': hsl(h, 100, 30).set('a', 0.5),
            'order-hint-path-color': hsl(h, 100, 25),
            'order-hint-path-width': 1,

            'text-selection-color': hsl(h, 100, 20)
        };
    }

    var plans = {
        red: 0,
        soil: 25,
        green: 122,
        blue: 204,
        purple: 246,
        pink: 334
    };

    for (var name in plans) {
        KityMinder.registerTheme('fresh-' + name, generate(plans[name]));
    }

})();

KityMinder.registerTemplate('structure', {

    getLayout: function(node) {
        return 'bottom';
    }
});

KityMinder.registerTemplate('filetree', {

    getLayout: function(node) {
        if (node.getData('layout')) return node.getData('layout');
        if (node.isRoot()) return 'bottom';

        return 'filetree';
    }
});

var AppendChildCommand = kity.createClass('AppendChildCommand', {
    base: Command,
    execute: function(km, text) {
        var parent = km.getSelectedNode();
        if (!parent) {
            return null;
        }
        parent.expand();
        var node = km.createNode(text, parent);
        km.select(node, true);
        node.render();
        node._lastLayoutTransform = parent._lastLayoutTransform;
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var AppendSiblingCommand = kity.createClass('AppendSiblingCommand', {
    base: Command,
    execute: function(km, text) {
        var sibling = km.getSelectedNode();
        var parent = sibling.parent;
        if (!parent) {
            return km.execCommand('AppendChildNode', text);
        }
        var node = km.createNode(text, parent, sibling.getIndex() + 1);
        km.select(node, true);
        node.render();
        node._lastLayoutTransform = sibling._lastLayoutTransform;
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var RemoveNodeCommand = kity.createClass('RemoverNodeCommand', {
    base: Command,
    execute: function(km, text) {
        var nodes = km.getSelectedNodes();
        var ancestor = MinderNode.getCommonAncestor.apply(null, nodes);

        nodes.forEach(function(node) {
            if (!node.isRoot()) km.removeNode(node);
        });

        km.select(ancestor || km.getRoot(), true);
        km.layout(300);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
});

var EditNodeCommand = kity.createClass('EditNodeCommand', {
    base: Command,
    execute: function(km) {
        var selectedNode = km.getSelectedNode();
        if (!selectedNode) {
            return null;
        }
        km.select(selectedNode, true);
        km.textEditNode(selectedNode);
    },
    queryState: function(km) {
        var selectedNode = km.getSelectedNode();
        if (!selectedNode) {
            return -1;
        } else {
            return 0;
        }
    },
    isNeedUndo: function() {
        return false;
    }
});

KityMinder.registerModule('NodeModule', function() {
    return {
        commands: {
            'AppendChildNode': AppendChildCommand,
            'AppendSiblingNode': AppendSiblingCommand,
            'RemoveNode': RemoveNodeCommand,
            'EditNode': EditNodeCommand
        },
        'contextmenu': [{
            label: this.getLang('node.appendsiblingnode'),
            exec: function() {
                this.execCommand('AppendSiblingNode', this.getLang('topic'));
            },
            cmdName: 'appendsiblingnode'
        }, {
            label: this.getLang('node.appendchildnode'),
            exec: function() {
                this.execCommand('AppendChildNode', this.getLang('topic'));
            },
            cmdName: 'appendchildnode'
        }, {
            label: this.getLang('node.editnode'),
            exec: function() {
                this.execCommand('EditNode');
            },
            cmdName: 'editnode'
        }, {
            label: this.getLang('node.removenode'),
            cmdName: 'RemoveNode'
        }, {
            divider: 1
        }]
    };
});

/* global Renderer: true */

var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
    base: Renderer,

    create: function() {
        return new kity.Text()
            .setId(KityMinder.uuid('node_text'))
            .setVerticalAlign('middle');
    },

    update: function(text, node) {
        this.setTextStyle(node, text.setContent(node.getText()));
        var box = text.getBoundaryBox();
        var r = Math.round;
        if (kity.Browser.ie) {
            box.y += 1;
        }
        return new kity.Box(r(box.x), r(box.y), r(box.width), r(box.height));
    },

    setTextStyle: function(node, text) {
        var hooks = TextRenderer._styleHooks;
        hooks.forEach(function(hook) {
            hook(node, text);
        });
    }
});

utils.extend(TextRenderer, {
    _styleHooks: [],

    registerStyleHook: function(fn) {
        TextRenderer._styleHooks.push(fn);
    }
});

kity.extendClass(MinderNode,{
    getTextShape : function() {
        return  this.getRenderer('TextRenderer').getRenderShape();
    }
});
KityMinder.registerModule('text', {
    'renderers': {
        center: TextRenderer
    }
});

/* global Renderer: true */

KityMinder.registerModule('Expand', function() {
    var minder = this;
    var EXPAND_STATE_DATA = 'expandState',
        STATE_EXPAND = 'expand',
        STATE_COLLAPSE = 'collapse';

    /**
     * 该函数返回一个策略，表示递归到节点指定的层数
     *
     * 返回的策略表示把操作（展开/收起）进行到指定的层数
     * 也可以给出一个策略指定超过层数的节点如何操作，默认不进行任何操作
     *
     * @param {int} deep_level 指定的层数
     * @param {Function} policy_after_level 超过的层数执行的策略
     */
    function generateDeepPolicy(deep_level, policy_after_level) {

        return function(node, state, policy, level) {
            var children, child, i;

            node.setData(EXPAND_STATE_DATA, state);
            level = level || 1;

            children = node.getChildren();

            for (i = 0; i < children.length; i++) {
                child = children[i];

                if (level <= deep_level) {
                    policy(child, state, policy, level + 1);
                } else if (policy_after_level) {
                    policy_after_level(child, state, policy, level + 1);
                }
            }

        };
    }

    /**
     * 节点展开和收缩的策略常量
     *
     * 策略是一个处理函数，处理函数接受 3 个参数：
     *
     * @param {MinderNode} node   要处理的节点
     * @param {Enum}       state  取值为 "expand" | "collapse"，表示要对节点进行的操作是展开还是收缩
     * @param {Function}   policy 提供当前策略的函数，方便递归调用
     */
    var EXPAND_POLICY = MinderNode.EXPAND_POLICY = {

        /**
         * 策略 1：只修改当前节点的状态，不递归子节点的状态
         */
        KEEP_STATE: function(node, state, policy) {
            node.setData(EXPAND_STATE_DATA, state);
        },

        generateDeepPolicy: generateDeepPolicy,

        /**
         * 策略 2：把操作进行到儿子
         */
        DEEP_TO_CHILD: generateDeepPolicy(2),

        /**
         * 策略 3：把操作进行到叶子
         */
        DEEP_TO_LEAF: generateDeepPolicy(Number.MAX_VALUE)
    };

    function setExpandState(node, state, policy) {
        policy = policy || EXPAND_POLICY.KEEP_STATE;
        policy(node, state, policy);
        node.traverse(function(node) {
            node.render();
        });
        node.getMinder().layout(200);
    }

    // 将展开的操作和状态读取接口拓展到 MinderNode 上
    kity.extendClass(MinderNode, {

        /**
         * 使用指定的策略展开节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        expand: function(policy) {
            setExpandState(this, STATE_EXPAND, policy);
            return this;
        },

        /**
         * 使用指定的策略收起节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        collapse: function(policy) {
            setExpandState(this, STATE_COLLAPSE, policy);
            return this;
        },

        /**
         * 判断节点当前的状态是否为展开
         */
        isExpanded: function() {
            var expanded = this.getData(EXPAND_STATE_DATA) !== STATE_COLLAPSE;
            return expanded && (this.isRoot() || this.parent.isExpanded());
        },

        /**
         * 判断节点当前的状态是否为收起
         */
        isCollapsed: function() {
            return !this.isExpanded();
        }
    });
    var ExpandNodeCommand = kity.createClass('ExpandNodeCommand', {
        base: Command,
        execute: function(km) {
            var nodes = km.getRoot().getChildren();
            nodes.forEach(function(node) {
                node.expand(EXPAND_POLICY.DEEP_TO_LEAF);
            });
        },
        queryState: function(km) {
            return 0;
        }
    });
    var CollapseNodeCommand = kity.createClass('CollapseNodeCommand', {
        base: Command,
        execute: function(km) {
            var nodes = km.getRoot().getChildren();
            nodes.forEach(function(node) {
                node.collapse();
            });
        },
        queryState: function(km) {
            return 0;
        }
    });
    var Expander = kity.createClass('Expander', {
        base: kity.Group,

        constructor: function(node) {
            this.callBase();
            this.radius = 5;
            this.outline = new kity.Circle(this.radius).stroke('gray').fill('white');
            this.sign = new kity.Path().stroke('black');
            this.addShapes([this.outline, this.sign]);
            this.initEvent(node);
            this.setId(KityMinder.uuid('node_expander'));
            this.setStyle('cursor', 'pointer');
        },

        initEvent: function(node) {
            this.on('mousedown', function(e) {
                if (node.isExpanded()) {
                    node.collapse();
                } else {
                    node.expand();
                }
                e.stopPropagation();
                e.preventDefault();
            });
            this.on('dblclick click mouseup', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });
        },

        setState: function(state) {
            if (state == 'hide') {
                this.setVisible(false);
                return;
            }
            this.setVisible(true);
            var pathData = ['M', 1.5 - this.radius, 0, 'L', this.radius - 1.5, 0];
            if (state == STATE_COLLAPSE) {
                pathData.push(['M', 0, 1.5 - this.radius, 'L', 0, this.radius - 1.5]);
            }
            this.sign.setPathData(pathData);
        }
    });

    var ExpanderRenderer = kity.createClass('ExpanderRenderer', {
        base: Renderer,

        create: function(node) {
            if (node.isRoot()) return;
            this.expander = new Expander(node);
            node.getRenderContainer().prependShape(this.expander);
            node.expanderRenderer = this;
            this.node = node;
            return this.expander;
        },

        shouldRender: function(node) {
            return !node.isRoot();
        },

        update: function(expander, node, box) {
            if (!node.parent) return;

            var visible = node.parent.isExpanded();

            expander.setState(visible && node.children.length ? node.getData(EXPAND_STATE_DATA) : 'hide');

            var vector = node.getLayoutVector().normalize(expander.radius + node.getStyle('stroke-width'));
            var position = node.getVertexOut().offset(vector);

            this.expander.setTranslate(position);
        }
    });
    return {
        commands: {
            'ExpandNode': ExpandNodeCommand,
            'CollapseNode': CollapseNodeCommand
        },
        events: {
            'layoutapply': function(e) {
                var r = e.node.getRenderer('ExpanderRenderer');
                if (r.getRenderShape()) {
                    r.update(r.getRenderShape(), e.node);
                }
            },
            'beforerender': function(e) {
                var node = e.node;
                var visible = !node.parent || node.parent.isExpanded();
                node.getRenderContainer().setVisible(visible);
                if (!visible) e.stopPropagation();
            },
            'normal.keydown': function(e) {
                if (this.getStatus() == 'textedit') return;
                if (e.originEvent.keyCode == keymap['/']) {
                    var expanded = this.getSelectedNode().isExpanded();
                    this.getSelectedNodes().forEach(function(node) {
                        if (expanded) node.collapse();
                        else node.expand();
                    });
                    e.preventDefault();
                    e.stopPropagationImmediately();
                }
            }
        },
        renderers: {
            outside: ExpanderRenderer
        }
    };
});

/* global Renderer: true */


var OutlineRenderer = kity.createClass('OutlineRenderer', {
    base: Renderer,

    create: function(node) {

        var outline = new kity.Rect()
            .setId(KityMinder.uuid('node_outline'));

        this.bringToBack = true;

        return outline;
    },

    update: function(outline, node, box) {

        var paddingLeft = node.getStyle('padding-left'),
            paddingRight = node.getStyle('padding-right'),
            paddingTop = node.getStyle('padding-top'),
            paddingBottom = node.getStyle('padding-bottom');

        var outlineBox = {
            x: box.x - paddingLeft,
            y: box.y - paddingTop,
            width: box.width + paddingLeft + paddingRight,
            height: box.height + paddingTop + paddingBottom
        };

        var prefix = node.isSelected() ? 'selected-' : '';

        outline
            .setPosition(outlineBox.x, outlineBox.y)
            .setSize(outlineBox.width, outlineBox.height)
            .setRadius(node.getStyle('radius'))
            .fill(node.getStyle(prefix + 'background') || node.getStyle('background'))
            .stroke(node.getStyle(prefix + 'stroke' || node.getStyle('stroke')),
                node.getStyle(prefix + 'stroke-width'));

        return outlineBox;
    }
});

var ShadowRenderer = kity.createClass('ShadowRenderer', {
    base: Renderer,

    create: function(node) {
        this.bringToBack = true;
        return new kity.Rect();
    },

    shouldRender: function(node) {
        return node.getStyle('shadow');
    },

    update: function(shadow, node, box) {
        shadow.setPosition(box.x + 4, box.y + 5)
            .setSize(box.width, box.height)
            .fill(node.getStyle('shadow'))
            .setRadius(node.getStyle('radius'));
    }
});

var wireframeOption = /wire/.test(window.location.href);
var WireframeRenderer = kity.createClass('WireframeRenderer', {
    base: Renderer,

    create: function() {
        var wireframe = new kity.Group();
        var oxy = this.oxy = new kity.Path()
            .stroke('#f6f')
            .setPathData('M0,-50L0,50M-50,0L50,0');

        var box = this.wireframe = new kity.Rect()
            .stroke('lightgreen');

        return wireframe.addShapes([oxy, box]);
    },

    shouldRender: function() {
        return wireframeOption;
    },

    update: function(created, node, box) {
        this.wireframe
            .setPosition(box.x, box.y)
            .setSize(box.width, box.height);
    }
});

KityMinder.registerModule('OutlineModule', function() {
    return {
        renderers: {
            outline: OutlineRenderer,
            outside: [ShadowRenderer, WireframeRenderer]
        }
    };
});

KityMinder.Geometry = (function() {
    var g = {};
    var min = Math.min,
        max = Math.max,
        abs = Math.abs;
    var own = Object.prototype.hasOwnProperty;

    g.isNumberInRange = function(number, range) {
        return number > range[0] && number < range[1];
    };

    g.getDistance = function(p1, p2) {
        return kity.Vector.fromPoints(p1, p2).length();
    };

    function wrapBox(box) {
        box.width = box.right - box.left;
        box.height = box.bottom - box.top;
        box.x = box.left;
        box.y = box.top;
        box.cx = box.x + box.width / 2;
        box.cy = box.y + box.height / 2;
        return box;
    }

    function uniformBox(box) {
        // duck check
        if ('x' in box) {
            box.left = box.x;
            box.right = box.x + box.width;
            box.top = box.y;
            box.bottom = box.y + box.height;
        }
    }

    g.wrapBox = wrapBox;

    g.getBox = function(p1, p2) {
        return wrapBox({
            left: min(p1.x, p2.x),
            right: max(p1.x, p2.x),
            top: min(p1.y, p2.y),
            bottom: max(p1.y, p2.y)
        });
    };

    g.mergeBox = function(b1, b2) {
        uniformBox(b1);
        uniformBox(b2);
        return wrapBox({
            left: min(b1.left, b2.left),
            right: max(b1.right, b2.right),
            top: min(b1.top, b2.top),
            bottom: max(b1.bottom, b2.bottom)
        });
    };

    g.getBoxRange = function(box) {
        return {
            x: [box.left, box.right],
            y: [box.top, box.bottom]
        };
    };

    g.getBoxVertex = function(box) {
        return {
            leftTop: {
                x: box.left,
                y: box.top
            },
            rightTop: {
                x: box.right,
                y: box.top
            },
            leftBottom: {
                x: box.left,
                y: box.bottom
            },
            rightBottom: {
                x: box.right,
                y: box.bottom
            }
        };
    };

    g.isPointInsideBox = function(p, b) {
        uniformBox(b);
        var ranges = g.getBoxRange(b);
        return g.isNumberInRange(p.x, ranges.x) && g.isNumberInRange(p.y, ranges.y);
    };

    g.getIntersectBox = function(b1, b2) {
        uniformBox(b1);
        uniformBox(b2);
        var minx = max(b1.left, b2.left),
            miny = max(b1.top, b2.top),
            maxx = min(b1.right, b2.right),
            maxy = min(b1.bottom, b2.bottom);
        return minx < maxx && miny < maxy ? wrapBox({
            left: minx,
            right: maxx,
            top: miny,
            bottom: maxy
        }) : null;
    };

    g.snapToSharp = function(unknown) {
        if (utils.isNumber(unknown)) {
            return (unknown | 0) + 0.5;
        }
        if (utils.isArray(unknown)) {
            return unknown.map(g.snapToSharp);
        }
        ['x', 'y', 'left', 'top', 'right', 'bottom'].forEach(function(n) {
            if (own.call(unknown, n)) {
                unknown[n] = g.snapToSharp(unknown[n]);
            }
        });
        return unknown;
    };

    g.expandBox = function(box, sizeX, sizeY) {
        if (sizeY === undefined) {
            sizeY = sizeX;
        }
        return wrapBox({
            left: box.left - sizeX,
            top: box.top - sizeY,
            right: box.right + sizeX,
            bottom: box.bottom + sizeY
        });
    };

    return g;
})();

KityMinder.registerModule("HistoryModule", function() {

    var km = this;

    var Scene = kity.createClass('Scene', {
        constructor: function(root,inputStatus) {
            this.data = root.clone();
            this.inputStatus = inputStatus;
        },
        getData: function() {
            return this.data;
        },
        cloneData: function() {
            return this.getData().clone();
        },
        equals: function(scene) {
            return this.getData().equals(scene.getData());

        },
        isInputStatus:function(){
            return this.inputStatus;
        },
        setInputStatus:function(status){
            this.inputStatus = status;
        }
    });
    var HistoryManager = kity.createClass('HistoryManager', {
        constructor: function(km) {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.km = km;
        },
        undo: function() {
            if (this.hasUndo) {
                var currentScene = this.list[this.index];
                //如果是输入文字时的保存，直接回复当前场景
                if(currentScene && currentScene.isInputStatus()){
                    this.saveScene();
                    this.restore(--this.index);
                    currentScene.setInputStatus(false);
                    return;
                }
                if(this.list.length == 1){
                    this.restore(0);
                    return;
                }
                if (!this.list[this.index - 1] && this.list.length == 1) {
                    this.reset();
                    return;
                }
                while (this.list[this.index].equals(this.list[this.index - 1])) {
                    this.index--;
                    if (this.index === 0) {
                        return this.restore(0);
                    }
                }
                this.restore(--this.index);
            }
        },
        redo: function() {
            if (this.hasRedo) {
                while (this.list[this.index].equals(this.list[this.index + 1])) {
                    this.index++;
                    if (this.index == this.list.length - 1) {
                        return this.restore(this.index);
                    }
                }
                this.restore(++this.index);
            }
        },
        partialRenewal: function(target) {
            var selectedNodes = [];
            function compareNode(source, target) {
                if (source.getText() != target.getText()) {
                    return false;
                }
                if (utils.compareObject(source.getData(), target.getData()) === false) {
                    return false;
                }
                if (utils.compareObject(source.getTmpData(), target.getTmpData()) === false) {
                    return false;
                }
                return true;
            }

            function appendChildNode(parent, child) {
                if (child.isSelected()) {
                    selectedNodes.push(child);
                }
                km.appendNode(child,parent);
                child.render();

                var children = utils.cloneArr(child.children);
                for (var i = 0, ci; ci = children[i++];) {
                    appendChildNode(child, ci);
                }
            }

            function traverseNode(srcNode, tagNode) {

                if (compareNode(srcNode, tagNode) === false) {
                    srcNode.setValue(tagNode);
                }
                //todo，这里有性能问题，变成全部render了
                srcNode.render();
                if (srcNode.isSelected()) {
                    selectedNodes.push(srcNode);
                }
                for (var i = 0, j = 0, si, tj;
                    (si = srcNode.children[i], tj = tagNode.children[j], si || tj); i++, j++) {
                    if (si && !tj) {
                        i--;
                        km.removeNode(si);
                    } else if (!si && tj) {
                        j--;
                        appendChildNode(srcNode, tj);
                    } else {
                        traverseNode(si, tj);
                    }
                }
            }

            traverseNode(km.getRoot(), target);
            km.layout();

            km.select(selectedNodes,true);

            selectedNodes = [];

        },
        restore: function(index) {
            index = index === undefined ? this.index : index;
            var scene = this.list[index];
            this.partialRenewal(scene.cloneData());
            this.update();
            this.km.fire('restoreScene');
            this.km.fire('contentChange');
        },
        getScene: function(inputStatus) {
            return new Scene(this.km.getRoot(),inputStatus);
        },
        saveScene: function(inputStatus) {
            var currentScene = this.getScene(inputStatus);
            var lastScene = this.list[this.index];
            if (lastScene && lastScene.equals(currentScene)) {
                if(inputStatus){
                    lastScene.setInputStatus(true);
                    this.update();
                }
                return;
            }
            this.list = this.list.slice(0, this.index + 1);
            this.list.push(currentScene);
            //如果大于最大数量了，就把最前的剔除
            if (this.list.length > this.km.getOptions('maxUndoCount')) {
                this.list.shift();
            }
            this.index = this.list.length - 1;
            //跟新undo/redo状态
            this.update();
        },
        update: function() {

            this.hasRedo = !!this.list[this.index + 1];
            this.hasUndo = !!this.list[this.index - 1];
            var currentScene = this.list[this.index];
            if(currentScene && currentScene.isInputStatus()){
                this.hasUndo = true;
            }

        },
        reset: function() {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
        }
    });
    //为km实例添加history管理
    this.historyManager = new HistoryManager(this);


    return {
        defaultOptions: {
            maxUndoCount: 20,
            maxInputCount: 20
        },
        "commands": {
            "undo": kity.createClass("UndoCommand", {
                base: Command,

                execute: function(km) {
                    km.historyManager.undo();
                },

                queryState: function(km) {
                    return km.historyManager.hasUndo ? 0 : -1;
                },

                isNeedUndo: function() {
                    return false;
                }
            }),
            "redo": kity.createClass("RedoCommand", {
                base: Command,

                execute: function(km) {
                    km.historyManager.redo();
                },

                queryState: function(km) {
                    return km.historyManager.hasRedo ? 0 : -1;
                },
                isNeedUndo: function() {
                    return false;
                }
            })
        },
        addShortcutKeys: {
            "Undo": "ctrl+z", //undo
            "Redo": "ctrl+y" //redo
        },
        "events": {
            "saveScene": function(e) {
                this.historyManager.saveScene(e.inputStatus);
            },
            "import": function() {
                this.historyManager.reset();
//                this.historyManager.saveScene();
            }
        }
    };
});

KityMinder.registerModule('ProgressModule', function() {
    var minder = this;

    var PROGRESS_DATA = 'progress';

    // 进度图标的图形
    var ProgressIcon = kity.createClass('ProgressIcon', {
        base: kity.Group,

        constructor: function(value) {
            this.callBase();
            this.setSize(20);
            this.create();
            this.setValue(value);
            this.setId(KityMinder.uuid('node_progress'));
        },

        setSize: function(size) {
            this.width = this.height = size;
        },

        create: function() {

            var circle = new kity.Circle(8)
                .stroke('#29A6BD', 2)
                .fill('white');

            var pie = new kity.Pie(6, 0, -90)
                .fill('#29A6BD');

            var check = new kity.Path()
                .getDrawer()
                    .moveTo(-3, -1)
                    .lineTo(-1, 2)
                    .lineTo(3, -3)
                .getPath()
                .stroke('white', 2)
                .setVisible(false);

            this.addShapes([circle, pie, check]);
            this.circle = circle;
            this.pie = pie;
            this.check = check;
        },

        setValue: function(value) {
            this.pie.setAngle(360 * (value - 1) / 8);
            this.check.setVisible(value == 9);
        }
    });

    var ProgressCommand = kity.createClass('ProgressCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData(PROGRESS_DATA, value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData(PROGRESS_DATA);
                if (val) break;
            }
            return val;
        },

        queryState: function(km) {
            return km.getSelectedNodes().length ? 0 : -1;
        }
    });

    return {
        'commands': {
            'progress': ProgressCommand
        },
        'renderers': {
            left: kity.createClass('ProgressRenderer', {
                base: KityMinder.Renderer,

                create: function(node) {
                    return new ProgressIcon();
                },

                shouldRender: function(node) {
                    return node.getData(PROGRESS_DATA);
                },

                update: function(icon, node, box) {
                    var data = node.getData(PROGRESS_DATA);
                    var spaceLeft = node.getStyle('space-left');
                    var x, y;

                    icon.setValue(data);

                    x = box.left - icon.width - spaceLeft;
                    y = -icon.height / 2;
                    icon.setTranslate(x + icon.width / 2, y + icon.height / 2);

                    return {
                        x: x,
                        y: y,
                        width: icon.width,
                        height: icon.height
                    };
                }
            })
        }
    };
});

KityMinder.registerModule('PriorityModule', function() {
    var minder = this;

    // 进度图标使用的颜色
    var PRIORITY_COLORS = ['', '#A92E24', '#29A6BD',
        '#1E8D54', '#eb6100', '#876DDA', '#828282',
        '#828282', '#828282', '#828282'
    ];
    var PRIORITY_DATA = 'priority';

    // 进度图标的图形
    var PriorityIcon = kity.createClass('PriorityIcon', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.setSize(20);
            this.create();
            this.setId(KityMinder.uuid('node_priority'));
        },

        setSize: function(size) {
            this.width = this.height = size;
        },

        create: function() {
            var bg, number;

            bg = new kity.Rect()
                .setRadius(3)
                .setPosition(0.5, 0.5)
                .setSize(this.width, this.height);

            number = new kity.Text()
                .setX(this.width / 2 + 0.5).setY(this.height / 2 - 0.5)
                .setTextAnchor('middle')
                .setVerticalAlign('middle')
                .setFontSize(12)
                .fill('white');
            number.mark = 'hello';

            this.addShapes([bg, number]);
            this.bg = bg;
            this.number = number;
        },

        setValue: function(value) {
            var bg = this.bg,
                number = this.number;

            if (PRIORITY_COLORS[value]) {
                bg.fill(PRIORITY_COLORS[value]);
                number.setContent(value);
            }
        }
    });

    // 提供的命令
    var PriorityCommand = kity.createClass('SetPriorityCommand', {
        base: Command,
        execute: function(km, value) {
            var nodes = km.getSelectedNodes();
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].setData(PRIORITY_DATA, value).render();
            }
            km.layout();
        },
        queryValue: function(km) {
            var nodes = km.getSelectedNodes();
            var val;
            for (var i = 0; i < nodes.length; i++) {
                val = nodes[i].getData(PRIORITY_DATA);
                if (val) break;
            }
            return val;
        },

        queryState: function(km) {
            return km.getSelectedNodes().length ? 0 : -1;
        }
    });
    return {
        'commands': {
            'priority': PriorityCommand,
        },
        'renderers': {
            left: kity.createClass('PriorityRenderer', {
                base: KityMinder.Renderer,

                create: function(node) {
                    return new PriorityIcon();
                },

                shouldRender: function(node) {
                    return node.getData(PRIORITY_DATA);
                },

                update: function(icon, node, box) {
                    var data = node.getData(PRIORITY_DATA);
                    var spaceLeft = node.getStyle('space-left'),
                        x, y;

                    icon.setValue(data);
                    x = box.left - icon.width - spaceLeft;
                    y = -icon.height / 2;

                    icon.setTranslate(x, y);

                    return {
                        x: x,
                        y: y,
                        width: icon.width,
                        height: icon.height
                    };
                }
            })
        }
    };
});

KityMinder.registerModule('image', function() {
    function loadImageSize(url, callback) {
        var img = document.createElement('img');
        img.onload = function() {
            callback(img.width, img.height);
        };
        img.onerror = function() {
            callback(null);
        };
        img.src = url;
    }

    function fitImageSize(width, height, maxWidth, maxHeight) {
        var ratio = width / height,
            fitRatio = maxWidth / maxHeight;

        // 宽高比大于最大尺寸的宽高比，以宽度为标准适应
        if (ratio > fitRatio && width > maxWidth) {
            width = maxWidth;
            height = maxWidth / ratio;
        } else if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight / ratio;
        }

        return {
            width: width | 0,
            height: height | 0
        };
    }

    var ImageCommand = kity.createClass('ImageCommand', {
        base: Command,

        execute: function(km, url) {
            var nodes = km.getSelectedNodes();

            loadImageSize(url, function(width, height) {
                if (!width) return;
                utils.each(nodes, function(i, n) {
                    var size = fitImageSize(
                        width, height,
                        km.getOptions('maxImageWidth'),
                        km.getOptions('maxImageHeight'));
                    n.setData('image', url);
                    n.setData('imageSize', size);
                    n.render();
                });
                km.fire("saveScene");
                km.layout(300);
            });

        },
        queryState: function(km) {
            var nodes = km.getSelectedNodes(),
                result = 0;
            if (nodes.length === 0) {
                return -1;
            }
            utils.each(nodes, function(i, n) {
                if (n && n.getData('image')) {
                    result = 0;
                    return false;
                }
            });
            return result;
        },
        queryValue: function(km) {
            var node = km.getSelectedNode();
            return node.getData('image');
        }
    });

    var RemoveImageCommand = kity.createClass('RemoveImageCommand', {
        base: Command,

        execute: function(km) {
            var nodes = km.getSelectedNodes();
            utils.each(nodes, function(i, n) {
                n.setData('image').render();
            });
            km.layout(300);
        },
        queryState: function(km) {
            var nodes = km.getSelectedNodes();

            if (nodes.length === 0) {
                return -1;
            }
            var image = false;
            utils.each(nodes, function(i, n) {
                if (n.getData('image')) {
                    image = true;
                    return false;
                }
            });
            if (image) {
                return 0;
            }
            return -1;
        }
    });

    var ImageRenderer = kity.createClass('ImageRenderer', {
        base: KityMinder.Renderer,

        create: function(node) {
            return new kity.Image(node.getData('image'));
        },

        shouldRender: function(node) {
            return node.getData('image');
        },

        update: function(image, node, box) {
            var url = node.getData('image');
            var size = node.getData('imageSize');
            var spaceTop = node.getStyle('space-top');

            if (!size) return;

            var x = box.cx - size.width / 2;
            var y = box.y - size.height - spaceTop;

            image
                .setUrl(url)
                .setX(x | 0)
                .setY(y | 0)
                .setWidth(size.width | 0)
                .setHeight(size.height | 0);

            return new kity.Box(x | 0, y | 0, size.width | 0, size.height | 0);
        }
    });

    return {
        'defaultOptions': {
            'maxImageWidth': 200,
            'maxImageHeight': 200
        },
        'commands': {
            'image': ImageCommand,
            'removeimage': RemoveImageCommand
        },
        'renderers': {
            'top': ImageRenderer
        }
    };
});

KityMinder.registerModule('Resource', function() {

    /**
     * 自动使用的颜色序列
     */
    var RESOURCE_COLOR_SERIES = [51, 303, 75, 200, 157, 0, 26, 254].map(function(h) {
        return kity.Color.createHSL(h, 100, 85);
    });

    var RESOURCE_COLOR_OVERFLOW = kity.Color.createHSL(0, 0, 95);

    /**
     * 在 Minder 上拓展一些关于资源的支持接口
     */
    kity.extendClass(Minder, {

        /**
         * 获取脑图中某个资源对应的颜色
         *
         * 如果存在同名资源，则返回已经分配给该资源的颜色，否则分配给该资源一个颜色，并且返回
         *
         * 如果资源数超过颜色序列数量，返回白色
         *
         * @param {String} resource 资源名称
         * @return {Color}
         */
        getResourceColor: function(resource) {
            var colorMapping = this._getResourceColorIndexMapping();
            var nextIndex;

            if (!colorMapping.hasOwnProperty(resource)) {
                // 找不到找下个可用索引
                nextIndex = this._getNextResourceColorIndex();
                colorMapping[resource] = nextIndex;
            }

            // 资源过多，找不到可用索引颜色，统一返回白色
            return RESOURCE_COLOR_SERIES[colorMapping[resource]] || RESOURCE_COLOR_OVERFLOW;
        },

        /**
         * 获得已使用的资源的列表
         *
         * @return {Array}
         */
        getUsedResource: function() {
            var mapping = this._getResourceColorIndexMapping();
            var used = [],
                resource;

            for (resource in mapping) {
                if (mapping.hasOwnProperty(resource)) {
                    used.push(resource);
                }
            }

            return used;
        },

        /**
         * 获取脑图下一个可用的资源颜色索引
         *
         * @return {int}
         */
        _getNextResourceColorIndex: function() {
            // 获取现有颜色映射
            //     resource => color_index
            var colorMapping = this._getResourceColorIndexMapping();

            var resource, used, i;

            used = [];

            // 抽取已经使用的值到 used 数组
            for (resource in colorMapping) {
                if (colorMapping.hasOwnProperty(resource)) {
                    used.push(colorMapping[resource]);
                }
            }

            // 枚举所有的可用值，如果还没被使用，返回
            for (i = 0; i < RESOURCE_COLOR_SERIES.length; i++) {
                if (!~used.indexOf(i)) return i;
            }

            // 没有可用的颜色了
            return -1;
        },

        // 获取现有颜色映射
        //     resource => color_index
        _getResourceColorIndexMapping: function() {
            return this._resourceColorMapping || (this._resourceColorMapping = {});
        }

    });


    /**
     * @class 设置资源的命令
     *
     * @example
     *
     * // 设置选中节点资源为 "张三"
     * minder.execCommand('resource', ['张三']);
     *
     * // 添加资源 "李四" 到选中节点
     * var resource = minder.queryCommandValue();
     * resource.push('李四');
     * minder.execCommand('resource', resource);
     *
     * // 清除选中节点的资源
     * minder.execCommand('resource', null);
     */
    var ResourceCommand = kity.createClass('ResourceCommand', {

        base: Command,

        execute: function(minder, resource) {
            var nodes = minder.getSelectedNodes();

            if (typeof(resource) == 'string') {
                resource = [resource];
            }

            nodes.forEach(function(node) {
                node.setData('resource', resource).render();
            });

            minder.layout(200);
        },

        queryValue: function(minder) {
            var nodes = minder.getSelectedNodes();
            var resource = [];

            nodes.forEach(function(node) {
                var nodeResource = node.getData('resource');

                if (!nodeResource) return;

                nodeResource.forEach(function(name) {
                    if (!~resource.indexOf(name)) {
                        resource.push(name);
                    }
                });
            });

            return resource;
        },

        queryState: function(km) {
            return km.getSelectedNode() ? 0 : -1;
        }
    });

    /**
     * @class 资源的覆盖图形
     *
     * 该类为一个资源以指定的颜色渲染一个动态的覆盖图形
     */
    var ResourceOverlay = kity.createClass('ResourceOverlay', {
        base: kity.Group,

        constructor: function() {
            this.callBase();

            var text, rect;

            rect = this.rect = new kity.Rect().setRadius(4);

            text = this.text = new kity.Text()
                .setFontSize(12)
                .setVerticalAlign('middle');

            this.addShapes([rect, text]);
        },

        setValue: function(resourceName, color) {
            var paddingX = 8,
                paddingY = 4,
                borderRadius = 4;
            var text, box, rect;

            text = this.text;

            if (resourceName == this.lastResourceName) {

                box = this.lastBox;

            } else {

                text.setContent(resourceName);

                box = text.getBoundaryBox();
                this.lastResourceName = resourceName;
                this.lastBox = box;

            }

            text.setX(paddingX).fill(color.dec('l', 70));

            rect = this.rect;
            rect.setPosition(0, box.y - paddingY);
            this.width = Math.round(box.width + paddingX * 2);
            this.height = Math.round(box.height + paddingY * 2);
            rect.setSize(this.width, this.height);
            rect.fill(color);
        }
    });

    /**
     * @class 资源渲染器
     */
    var ResourceRenderer = kity.createClass('ResourceRenderer', {
        base: KityMinder.Renderer,

        create: function(node) {
            this.overlays = [];
            return new kity.Group();
        },

        shouldRender: function(node) {
            return node.getData('resource') && node.getData('resource').length;
        },

        update: function(container, node, box) {
            var spaceRight = node.getStyle('space-right');

            var overlays = this.overlays;
            var resource = node.getData('resource');
            var minder = node.getMinder();
            var i, overlay, x;

            x = 0;
            for (i = 0; i < resource.length; i++) {
                x += spaceRight;

                overlay = overlays[i];
                if (!overlay) {
                    overlay = new ResourceOverlay();
                    overlays.push(overlay);
                    container.addShape(overlay);
                }
                overlay.setVisible(true);
                overlay.setValue(resource[i], minder.getResourceColor(resource[i]));
                overlay.setTranslate(x, -1);

                x += overlay.width;
            }

            while ((overlay = overlays[i++])) overlay.setVisible(false);

            container.setTranslate(box.right, 0);

            return {
                x: box.right,
                y: Math.round(-overlays[0].height / 2),
                width: x,
                height: overlays[0].height
            };
        }
    });

    return {
        commands: {
            'resource': ResourceCommand
        },

        renderers: {
            right: ResourceRenderer
        }
    };
});

var ViewDragger = kity.createClass("ViewDragger", {
    constructor: function(minder) {
        this._minder = minder;
        this._enabled = false;
        this._bind();
    },
    isEnabled: function() {
        return this._enabled;
    },
    setEnabled: function(value) {
        var paper = this._minder.getPaper();
        paper.setStyle('cursor', value ? 'pointer' : 'default');
        paper.setStyle('cursor', value ? '-webkit-grab' : 'default');
        this._enabled = value;
    },
    move: function(offset, duration) {
        if (!duration) {
            this._minder.getRenderContainer().translate(offset.x | 0, offset.y | 0);
        }
        else {
            this._minder.getRenderContainer().fxTranslate(offset.x | 0, offset.y | 0, duration, 'easeOutCubic');
        }
    },

    _bind: function() {
        var dragger = this,
            isTempDrag = false,
            lastPosition = null,
            currentPosition = null;

        this._minder.on('normal.mousedown normal.touchstart readonly.mousedown readonly.touchstart', function(e) {

            if (e.originEvent.button == 2) {
                e.originEvent.preventDefault(); // 阻止中键拉动
            }
            // 点击未选中的根节点临时开启
            if (e.getTargetNode() == this.getRoot() || e.originEvent.button == 2) {
                lastPosition = e.getPosition();
                isTempDrag = true;
            }
        })

        .on('normal.mousemove normal.touchmove readonly.touchmove readonly.mousemove', function(e) {
            if (!isTempDrag) return;
            var offset = kity.Vector.fromPoints(lastPosition, e.getPosition());
            if (offset.length() > 3) this.setStatus('hand');
        })

        .on('hand.beforemousedown hand.beforetouchstart', function(e) {
            // 已经被用户打开拖放模式
            if (dragger.isEnabled()) {
                lastPosition = e.getPosition();
                e.stopPropagation();
            }
        })

        .on('hand.beforemousemove hand.beforetouchmove', function(e) {
            if (lastPosition) {
                currentPosition = e.getPosition();

                // 当前偏移加上历史偏移
                var offset = kity.Vector.fromPoints(lastPosition, currentPosition);
                dragger.move(offset);
                e.stopPropagation();
                e.preventDefault();
                e.originEvent.preventDefault();
                lastPosition = currentPosition;
            }
        })

        .on('mouseup touchend', function(e) {
            lastPosition = null;

            // 临时拖动需要还原状态
            if (isTempDrag) {
                dragger.setEnabled(false);
                isTempDrag = false;
                this.rollbackStatus();
            }
        });
    }
});

KityMinder.registerModule('View', function() {

    var km = this;

    var ToggleHandCommand = kity.createClass('ToggleHandCommand', {
        base: Command,
        execute: function(minder) {

            if (minder.getStatus() != 'hand') {
                minder.setStatus('hand');
            } else {
                minder.rollbackStatus();
            }
            this.setContentChanged(false);

        },
        queryState: function(minder) {
            return minder.getStatus() == 'hand' ? 1 : 0;
        },
        enableReadOnly: false
    });

    var CameraCommand = kity.createClass('CameraCommand', {
        base: Command,
        execute: function(km, focusNode, duration) {
            focusNode = focusNode || km.getRoot();
            var viewport = km.getPaper().getViewPort();
            var offset = focusNode.getRenderContainer().getRenderBox('view');
            var dx = viewport.center.x - offset.x - offset.width / 2,
                dy = viewport.center.y - offset.y;
            var dragger = km._viewDragger;

            dragger.move(new kity.Point(dx, dy), duration);
            this.setContentChanged(false);
        },
        enableReadOnly: false
    });

    var MoveCommand = kity.createClass('MoveCommand', {
        base: Command,

        execute: function(km, dir) {
            var dragger = this._viewDragger;
            var size = km._lastClientSize;
            switch (dir) {
                case 'up':
                    dragger.move(new kity.Point(0, -size.height / 2));
                    break;
                case 'down':
                    dragger.move(new kity.Point(0, size.height / 2));
                    break;
                case 'left':
                    dragger.move(new kity.Point(-size.width / 2, 0));
                    break;
                case 'right':
                    dragger.move(new kity.Point(size.width / 2, 0));
                    break;
            }
        }
    });

    return {
        init: function() {
            this._viewDragger = new ViewDragger(this);
        },
        commands: {
            'hand': ToggleHandCommand,
            'camera': CameraCommand,
            'move': MoveCommand
        },
        events: {
            keyup: function(e) {
                if (e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0) {
                    this.execCommand('hand');
                    e.preventDefault();
                }
            },
            statuschange: function(e) {
                this._viewDragger.setEnabled(e.currentStatus == 'hand');
            },
            mousewheel: function(e) {
                var dx, dy;
                e = e.originEvent;
                if (e.ctrlKey || e.shiftKey) return;
                if ('wheelDeltaX' in e) {

                    dx = e.wheelDeltaX || 0;
                    dy = e.wheelDeltaY || 0;

                } else {

                    dx = 0;
                    dy = e.wheelDelta;

                }

                this._viewDragger.move({
                    x: dx / 2.5,
                    y: dy / 2.5
                });

                e.preventDefault();
            },
            'normal.dblclick readonly.dblclick': function(e) {
                if (e.kityEvent.targetShape instanceof kity.Paper) {
                    this.execCommand('camera', this.getRoot(), 800);
                }
            },
            ready: function() {
                this.execCommand('camera', null, 0);
                this._lastClientSize = {
                    width: this.getRenderTarget().clientWidth,
                    height: this.getRenderTarget().clientHeight
                };
            },
            resize: function(e) {
                var a = {
                        width: this.getRenderTarget().clientWidth,
                        height: this.getRenderTarget().clientHeight
                    },
                    b = this._lastClientSize;
                this.getRenderContainer().translate(
                    (a.width - b.width) / 2 | 0, (a.height - b.height) / 2 | 0);
                this._lastClientSize = a;
            }
        }
    };
});

var GM = KityMinder.Geometry;

// 矩形的变形动画定义

var MoveToParentCommand = kity.createClass('MoveToParentCommand', {
    base: Command,
    execute: function(minder, nodes, parent) {
        var node;
        for (var i = nodes.length - 1; i >= 0; i--) {
            node = nodes[i];
            if (node.parent) {
                node.parent.removeChild(node);
                parent.appendChild(node);
                node.render();
            }
        }
        parent.expand();
        minder.select(nodes, true);
    }
});

var DropHinter = kity.createClass('DropHinter', {
    base: kity.Group,

    constructor: function() {
        this.callBase();
        this.rect = new kity.Rect();
        this.addShape(this.rect);
    },

    render: function(target) {
        this.setVisible(!!target);
        if (target) {
            this.rect
                .setBox(target.getLayoutBox())
                .setRadius(target.getStyle('radius') || 0)
                .stroke(
                    target.getStyle('drop-hint-color') || 'yellow',
                    target.getStyle('drop-hint-width') || 2
            );
            this.bringTop();
        }
    }
});

var OrderHinter = kity.createClass('OrderHinter', {
    base: kity.Group,

    constructor: function() {
        this.callBase();
        this.area = new kity.Rect();
        this.path = new kity.Path();
        this.addShapes([this.area, this.path]);
    },

    render: function(hint) {
        this.setVisible(!!hint);
        if (hint) {
            this.area.setBox(hint.area);
            this.area.fill(hint.node.getStyle('order-hint-area-color') || 'rgba(0, 255, 0, .5)');
            this.path.setPathData(hint.path);
            this.path.stroke(
                hint.node.getStyle('order-hint-path-color') || '#0f0',
                hint.node.getStyle('order-hint-path-width') || 1);
        }
    }
});

// 对拖动对象的一个替代盒子，控制整个拖放的逻辑，包括：
//    1. 从节点列表计算出拖动部分
//    2. 计算可以 drop 的节点，产生 drop 交互提示
var TreeDragger = kity.createClass('TreeDragger', {

    constructor: function(minder) {
        this._minder = minder;
        this._dropHinter = new DropHinter();
        this._orderHinter = new OrderHinter();
        minder.getRenderContainer().addShapes([this._dropHinter, this._orderHinter]);
    },

    dragStart: function(position) {
        // 只记录开始位置，不马上开启拖放模式
        // 这个位置同时是拖放范围收缩时的焦点位置（中心）
        this._startPosition = position;
    },

    dragMove: function(position) {
        // 启动拖放模式需要最小的移动距离
        var DRAG_MOVE_THRESHOLD = 10;

        if (!this._startPosition) return;

        this._dragPosition = position;

        if (!this._dragMode) {
            // 判断拖放模式是否该启动
            if (GM.getDistance(this._dragPosition, this._startPosition) < DRAG_MOVE_THRESHOLD) {
                return;
            }
            if (!this._enterDragMode()) {
                return;
            }
        }

        var movement = kity.Vector.fromPoints(this._startPosition, this._dragPosition);
        var minder = this._minder;

        for (var i = 0; i < this._dragSources.length; i++) {
            this._dragSources[i].setLayoutOffset(this._dragSourceOffsets[i].offset(movement));
            minder.applyLayoutResult(this._dragSources[i]);
        }

        if (!this._dropTest()) {
            this._orderTest();
        } else {
            this._renderOrderHint(this._orderSucceedHint = null);
        }
    },

    dragEnd: function() {
        this._startPosition = null;

        if (!this._dragMode) {
            return;
        }
        if (this._dropSucceedTarget) {

            this._dragSources.forEach(function(source) {
                source.setLayoutOffset(null);
            });

            this._minder.execCommand('movetoparent', this._dragSources, this._dropSucceedTarget);

        } else if (this._orderSucceedHint) {

            var hint = this._orderSucceedHint;
            var index = hint.node.getIndex();

            var sourceIndexes = this._dragSources.map(function(source) {
                // 顺便干掉布局偏移
                source.setLayoutOffset(null);
                return source.getIndex();
            });

            var maxIndex = Math.max.apply(Math, sourceIndexes);
            var minIndex = Math.min.apply(Math, sourceIndexes);

            if (index < minIndex && hint.type == 'down') index++;
            if (index > maxIndex && hint.type == 'up') index--;

            hint.node.setLayoutOffset(null);

            this._minder.execCommand('arrange', this._dragSources, index);
            this._renderOrderHint(null);
        } else {
            this._minder.fire('savescene');
        }
        this._leaveDragMode();
        this._minder.fire('contentchange');
    },

    // 进入拖放模式：
    //    1. 计算拖放源和允许的拖放目标
    //    2. 标记已启动
    _enterDragMode: function() {
        this._calcDragSources();
        if (!this._dragSources.length) {
            this._startPosition = null;
            return false;
        }
        this._fadeDragSources(0.5);
        this._calcDropTargets();
        this._calcOrderHints();
        this._dragMode = true;
        return true;
    },

    // 从选中的节点计算拖放源
    //    并不是所有选中的节点都作为拖放源，如果选中节点中存在 A 和 B，
    //    并且 A 是 B 的祖先，则 B 不作为拖放源
    //
    //    计算过程：
    //       1. 将节点按照树高排序，排序后只可能是前面节点是后面节点的祖先
    //       2. 从后往前枚举排序的结果，如果发现枚举目标之前存在其祖先，
    //          则排除枚举目标作为拖放源，否则加入拖放源
    _calcDragSources: function() {
        this._dragSources = this._minder.getSelectedAncestors();
        this._dragSourceOffsets = this._dragSources.map(function(src) {
            return src.getLayoutOffset();
        });
    },

    _fadeDragSources: function(opacity) {
        this._dragSources.forEach(function(source) {
            source.getRenderContainer().fxOpacity(opacity, 200);
        });
    },


    // 计算拖放目标可以释放的节点列表（释放意味着成为其子树），存在这条限制规则：
    //    - 不能拖放到拖放目标的子树上（允许拖放到自身，因为多选的情况下可以把其它节点加入）
    //
    //    1. 加入当前节点（初始为根节点）到允许列表
    //    2. 对于当前节点的每一个子节点：
    //       (1) 如果是拖放目标的其中一个节点，忽略（整棵子树被剪枝）
    //       (2) 如果不是拖放目标之一，以当前子节点为当前节点，回到 1 计算
    //    3. 返回允许列表
    //
    _calcDropTargets: function() {

        function findAvailableParents(nodes, root) {
            var availables = [],
                i;
            availables.push(root);
            root.getChildren().forEach(function(test) {
                for (i = 0; i < nodes.length; i++) {
                    if (nodes[i] == test) return;
                }
                availables = availables.concat(findAvailableParents(nodes, test));
            });
            return availables;
        }

        this._dropTargets = findAvailableParents(this._dragSources, this._minder.getRoot());
        this._dropTargetBoxes = this._dropTargets.map(function(source) {
            return source.getLayoutBox();
        });
    },

    _calcOrderHints: function() {
        var sources = this._dragSources;
        var ancestor = MinderNode.getCommonAncestor(sources);

        // 只有一个元素选中，公共祖先是其父
        if (ancestor == sources[0]) ancestor = sources[0].parent;

        if (sources.length === 0 || ancestor != sources[0].parent) {
            this._orderHints = [];
            return;
        }

        var siblings = ancestor.children;

        this._orderHints = siblings.reduce(function(hint, sibling) {
            if (sources.indexOf(sibling) == -1) {
                hint = hint.concat(sibling.getOrderHint());
            }
            return hint;
        }, []);
    },

    _leaveDragMode: function() {
        this._fadeDragSources(1);
        this._dragMode = false;
        this._dropSucceedTarget = null;
        this._orderSucceedHint = null;
        this._renderDropHint(null);
        this._renderOrderHint(null);
    },

    _drawForDragMode: function() {
        this._text.setContent(this._dragSources.length + ' items');
        this._text.setPosition(this._startPosition.x, this._startPosition.y + 5);
        this._minder.getRenderContainer().addShape(this);
    },

    _boxTest: function(targets, targetBoxMapper, judge) {
        var sourceBoxes = this._dragSources.map(function(source) {
            return source.getLayoutBox();
        });

        var i, j, target, sourceBox, targetBox;

        judge = judge || function(intersectBox, sourceBox, targetBox) {
            return intersectBox;
        };

        for (i = 0; i < targets.length; i++) {

            target = targets[i];
            targetBox = targetBoxMapper.call(this, target, i);

            for (j = 0; j < sourceBoxes.length; j++) {
                sourceBox = sourceBoxes[j];

                var intersectBox = GM.getIntersectBox(sourceBox, targetBox);
                if (judge(intersectBox, sourceBox, targetBox)) {
                    return target;
                }
            }
        }

        return null;
    },

    _dropTest: function() {
        this._dropSucceedTarget = this._boxTest(this._dropTargets, function(target, i) {
            return this._dropTargetBoxes[i];
        }, function(intersectBox, sourceBox, targetBox) {
            function area(box) {
                return box.width * box.height;
            }
            if (!intersectBox) return false;
            // 面积判断
            if (area(intersectBox) > 0.5 * Math.min(area(sourceBox), area(targetBox))) return true;
            if (intersectBox.width + 1 >= Math.min(sourceBox.width, targetBox.width)) return true;
            if (intersectBox.height + 1 >= Math.min(sourceBox.height, targetBox.height)) return true;
            return false;
        });
        this._renderDropHint(this._dropSucceedTarget);
        return !!this._dropSucceedTarget;
    },

    _orderTest: function() {
        this._orderSucceedHint = this._boxTest(this._orderHints, function(hint) {
            return hint.area;
        });
        this._renderOrderHint(this._orderSucceedHint);
        return !!this._orderSucceedHint;
    },

    _renderDropHint: function(target) {
        this._dropHinter.render(target);
    },

    _renderOrderHint: function(hint) {
        this._orderHinter.render(hint);
    },
    preventDragMove: function() {
        this._startPosition = null;
    }
});

KityMinder.registerModule('DragTree', function() {
    var dragger;

    return {
        init: function() {
            dragger = new TreeDragger(this);
        },
        events: {
            'normal.mousedown inputready.mousedown': function(e) {
                // 单选中根节点也不触发拖拽
                if (e.originEvent.button) return;
                if (e.getTargetNode() && e.getTargetNode() != this.getRoot()) {
                    dragger.dragStart(e.getPosition(this.getRenderContainer()));
                }
            },
            'normal.mousemove': function(e) {
                dragger.dragMove(e.getPosition(this.getRenderContainer()));
            },
            'normal.mouseup': function(e) {
                dragger.dragEnd(e.getPosition(this.getRenderContainer()));
                e.stopPropagation();
                this.fire('contentchange');
            },
            'statuschange': function(e) {
                if (e.lastStatus == 'textedit' && e.currentStatus == 'normal') {
                    dragger.preventDragMove();
                }
            }
        },
        commands: {
            'movetoparent': MoveToParentCommand
        }
    };
});

KityMinder.registerModule('DropFile', function() {

    var social,
        draftManager,
        importing = false;

    function init() {
        var container = this.getPaper().getContainer();
        container.addEventListener('dragover', onDragOver);
        container.addEventListener('drop', onDrop.bind(this));
    }

    function onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }

    function onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        var minder = this;

        if (kity.Browser.ie && Number(kity.Browser.version) < 10) {
            alert('文件导入对 IE 浏览器仅支持 10 以上版本');
            return;
        }

        var files = e.dataTransfer.files;

        if (files) {
            var file = files[0];
            importMinderFile(minder, file);
        }
    }

    function importMinderFile(minder, file, encoding) {
        if (!file) return;

        var ext = /(.)\w+$/.exec(file.name);
        
        if (!ext) return alert('不支持导入此类文件！');
        
        ext = ext[0];

        if ((/xmind/g).test(ext)) { //xmind zip
            importSync(minder, file, 'xmind');
        } else if ((/mmap/g).test(ext)) { // mindmanager zip
            importSync(minder, file, 'mindmanager');
        } else if ((/mm/g).test(ext)) { //freemind xml
            importAsync(minder, file, 'freemind', encoding);
        } else if (/km/.test(ext)) { // txt json
            importAsync(minder, file, 'json', encoding);
        } else if (/txt/.test(ext)) {
            importAsync(minder, file, 'plain', encoding);
        } else {
            alert('不支持导入此类文件!');
        }
    }

    function afterImport() {
        if (!importing) return;
        createDraft(this);
        social.setRemotePath(null, false);
        this.execCommand('camera', this.getRoot(), 800);
        setTimeout(function() {
            social.watchChanges(true);
        }, 10);
        importing = false;
    }

    // 同步加载文件
    function importSync(minder, file, protocal) {
        social = social || window.social;
        social.watchChanges(false);
        importing = true;
        minder.importData(file, protocal); //zip文件的import是同步的
    }

    // 异步加载文件
    function importAsync(minder, file, protocal, encoding) {
        var reader = new FileReader();
        reader.onload = function (e) {
            importSync(minder, e.target.result, protocal);
        };
        reader.readAsText(file, encoding || 'utf8');
    }

    function createDraft(minder) {
        draftManager = window.draftManager || (window.draftManager = new window.DraftManager(minder));
        draftManager.create();
    }

    kity.extendClass(Minder, {
        importFile: function(file, encoding) {
            importMinderFile(this, file, encoding);
            return this;
        }
    });

    return {
        events: {
            'ready': init,
            'import': afterImport
        }
    };
});

KityMinder.registerModule("KeyboardModule", function() {
    var min = Math.min,
        max = Math.max,
        abs = Math.abs,
        sqrt = Math.sqrt,
        exp = Math.exp;

    function buildPositionNetwork(root) {
        var pointIndexes = [],
            p;
        root.traverse(function(node) {
            p = node.getLayoutBox();

            // bugfix: 不应导航到收起的节点（判断其尺寸是否存在）
            if (p.width && p.height) {
                pointIndexes.push({
                    left: p.x,
                    top: p.y,
                    right: p.x + p.width,
                    bottom: p.y + p.height,
                    width: p.width,
                    height: p.height,
                    node: node,
                    text: node.getText()
                });
            }
        });
        for (var i = 0; i < pointIndexes.length; i++) {
            findClosestPointsFor(pointIndexes, i);
        }
    }


    // 这是金泉的点子，赞！
    // 求两个不相交矩形的最近距离
    function getCoefedDistance(box1, box2) {
        var xMin, xMax, yMin, yMax, xDist, yDist, dist, cx, cy;
        xMin = min(box1.left, box2.left);
        xMax = max(box1.right, box2.right);
        yMin = min(box1.top, box2.top);
        yMax = max(box1.bottom, box2.bottom);

        xDist = xMax - xMin - box1.width - box2.width;
        yDist = yMax - yMin - box1.height - box2.height;

        if (xDist < 0) dist = yDist;
        else if (yDist < 0) dist = xDist;
        else dist = sqrt(xDist * xDist + yDist * yDist);

        return {
            cx: dist,
            cy: dist
        };
    }

    function findClosestPointsFor(pointIndexes, iFind) {
        var find = pointIndexes[iFind];
        var most = {},
            quad;
        var current, dist;

        for (var i = 0; i < pointIndexes.length; i++) {

            if (i == iFind) continue;
            current = pointIndexes[i];

            dist = getCoefedDistance(current, find);

            // left check
            if (current.right < find.left) {
                if (!most.left || dist.cx < most.left.dist) {
                    most.left = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // right check
            if (current.left > find.right) {
                if (!most.right || dist.cx < most.right.dist) {
                    most.right = {
                        dist: dist.cx,
                        node: current.node
                    };
                }
            }

            // top check
            if (current.bottom < find.top) {
                if (!most.top || dist.cy < most.top.dist) {
                    most.top = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }

            // bottom check
            if (current.top > find.bottom) {
                if (!most.down || dist.cy < most.down.dist) {
                    most.down = {
                        dist: dist.cy,
                        node: current.node
                    };
                }
            }
        }
        find.node._nearestNodes = {
            right: most.right && most.right.node || null,
            top: most.top && most.top.node || null,
            left: most.left && most.left.node || null,
            down: most.down && most.down.node || null
        };
    }


    function navigateTo(km, direction) {
        var referNode = km.getSelectedNode();
        if (!referNode) {
            km.select(km.getRoot());
            buildPositionNetwork(km.getRoot());
            return;
        }
        var nextNode = referNode._nearestNodes[direction];
        if (nextNode) {
            km.select(nextNode, true);
        }
    }
    return {

        'events': {
            'contentchange layoutfinish': function() {
                buildPositionNetwork(this.getRoot());
            },
            'normal.keydown': function(e) {

                var keys = KityMinder.keymap;
                var node = e.getTargetNode();
                var lang = this.getLang();

                if (this.receiver) this.receiver.keydownNode = node;

                var keyEvent = e.originEvent;

                if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey) return;

                switch (keyEvent.keyCode) {
                    case keys.Enter:
                        this.execCommand('AppendSiblingNode', lang.topic);
                        e.preventDefault();
                        break;
                    case keys.Tab:
                        this.execCommand('AppendChildNode', lang.topic);
                        e.preventDefault();
                        break;
                    case keys.Backspace:
                    case keys.Del:
                        e.preventDefault();
                        this.execCommand('RemoveNode');
                        break;
                    case keys.F2:
                        e.preventDefault();
                        this.execCommand('EditNode');
                        break;

                    case keys.Left:
                        navigateTo(this, 'left');
                        e.preventDefault();
                        break;
                    case keys.Up:
                        navigateTo(this, 'top');
                        e.preventDefault();
                        break;
                    case keys.Right:
                        navigateTo(this, 'right');
                        e.preventDefault();
                        break;
                    case keys.Down:
                        navigateTo(this, 'down');
                        e.preventDefault();
                        break;
                }

            },
            'normal.keyup': function(e) {
                if (browser.ipad) {
                    var keys = KityMinder.keymap;
                    var node = e.getTargetNode();
                    var lang = this.getLang();

                    if (this.receiver) this.receiver.keydownNode = node;

                    var keyEvent = e.originEvent;

                    if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey) return;

                    switch (keyEvent.keyCode) {
                        case keys.Enter:
                            this.execCommand('AppendSiblingNode', lang.topic);
                            e.preventDefault();
                            break;

                        case keys.Backspace:
                        case keys.Del:
                            e.preventDefault();
                            this.execCommand('RemoveNode');
                            break;

                    }
                }

            }
        }
    };
});

KityMinder.registerModule('Select', function() {
    var minder = this;
    var rc = minder.getRenderContainer();
    var g = KityMinder.Geometry;

    // 在实例上渲染框选矩形、计算框选范围的对象
    var marqueeActivator = (function() {

        // 记录选区的开始位置（mousedown的位置）
        var startPosition = null;

        // 选区的图形
        var marqueeShape = new kity.Path();

        // 标记是否已经启动框选状态
        //    并不是 mousedown 发生之后就启动框选状态，而是检测到移动了一定的距离（MARQUEE_MODE_THRESHOLD）之后
        var marqueeMode = false;
        var MARQUEE_MODE_THRESHOLD = 10;

        return {
            selectStart: function(e) {
                // 只接受左键
                if (e.originEvent.button) return;

                // 清理不正确状态
                if (startPosition) {
                    return this.selectEnd();
                }

                startPosition = g.snapToSharp(e.getPosition(rc));
            },
            selectMove: function(e) {
                if (minder.getStatus() == 'textedit') {
                    return;
                }
                if (!startPosition) return;

                var p1 = startPosition,
                    p2 = e.getPosition(rc);

                // 检测是否要进入选区模式
                if (!marqueeMode) {
                    // 距离没达到阈值，退出
                    if (g.getDistance(p1, p2) < MARQUEE_MODE_THRESHOLD) {
                        return;
                    }
                    // 已经达到阈值，记录下来并且重置选区形状
                    marqueeMode = true;
                    rc.addShape(marqueeShape);
                    marqueeShape
                        .fill(minder.getStyle('marquee-background'))
                        .stroke(minder.getStyle('marquee-stroke')).setOpacity(0.8).getDrawer().clear();
                }

                var marquee = g.getBox(p1, p2),
                    selectedNodes = [];

                // 使其犀利
                marquee.left = Math.round(marquee.left);
                marquee.top = Math.round(marquee.top);
                marquee.right = Math.round(marquee.right);
                marquee.bottom = Math.round(marquee.bottom);

                // 选区形状更新
                marqueeShape.getDrawer().pipe(function() {
                    this.clear();
                    this.moveTo(marquee.left, marquee.top);
                    this.lineTo(marquee.right, marquee.top);
                    this.lineTo(marquee.right, marquee.bottom);
                    this.lineTo(marquee.left, marquee.bottom);
                    this.close();
                });

                // 计算选中范围
                minder.getRoot().traverse(function(node) {
                    var renderBox = node.getLayoutBox();
                    if (g.getIntersectBox(renderBox, marquee)) {
                        selectedNodes.push(node);
                    }
                });

                // 应用选中范围
                minder.select(selectedNodes, true);

                // 清除多余的东西
                window.getSelection().removeAllRanges()
            },
            selectEnd: function(e) {
                if (startPosition) {
                    startPosition = null;
                }
                if (marqueeMode) {
                    marqueeShape.fadeOut(200, 'ease', 0, function() {
                        if (marqueeShape.remove) marqueeShape.remove();
                    });
                    marqueeMode = false;
                }
            }
        };
    })();

    var lastDownNode = null, lastDownPosition = null;
    return {
        'init': function() {
            window.addEventListener('mouseup', function() {
                marqueeActivator.selectEnd();
            });
        },
        'events': {
            'normal.mousedown textedit.mousedown inputready.mousedown': function(e) {

                var downNode = e.getTargetNode();

                // 没有点中节点：
                //     清除选中状态，并且标记选区开始位置
                if (!downNode) {
                    this.removeAllSelectedNodes();
                    marqueeActivator.selectStart(e);

                    this.setStatus('normal');
                }

                // 点中了节点，并且按了 shift 键：
                //     被点中的节点切换选中状态
                else if (e.originEvent.shiftKey) {
                    this.toggleSelect(downNode);
                }

                // 点中的节点没有被选择：
                //     单选点中的节点
                else if (!downNode.isSelected()) {
                    this.select(downNode, true);
                }

                // 点中的节点被选中了，并且不是单选：
                //     完成整个点击之后需要使其变为单选。
                //     不能马上变为单选，因为可能是需要拖动选中的多个节点
                else if (!this.isSingleSelect()) {
                    lastDownNode = downNode;
                    lastDownPosition = e.getPosition(this.getRenderContainer());
                }
            },
            'normal.mousemove textedit.mousemove inputready.mousemove': marqueeActivator.selectMove,
            'normal.mouseup textedit.mouseup inputready.mouseup': function(e) {
                var upNode = e.getTargetNode();

                // 如果 mouseup 发生在 lastDownNode 外，是无需理会的
                if (upNode && upNode == lastDownNode) {
                    var upPosition = e.getPosition(this.getRenderContainer());
                    var movement = kity.Vector.fromPoints(lastDownPosition, upPosition);
                    if (movement.length() < 1) this.select(lastDownNode, true);
                    lastDownNode = null;
                }

                // 清理一下选择状态
                marqueeActivator.selectEnd(e);
            },
            //全选操作
            'normal.keydown inputready.keydown':function(e){


                var keyEvent = e.originEvent;

                if ( (keyEvent.ctrlKey || keyEvent.metaKey) && keymap.a == keyEvent.keyCode){
                    var selectedNodes = [];

                    this.getRoot().traverse(function(node){
                        selectedNodes.push(node);
                    });
                    this.select(selectedNodes,true);
                    e.preventDefault();
                }
            }
        }
    };
});

/* global Renderer: true */

KityMinder.registerModule('TextEditModule', function() {
    var km = this;
    var sel = new Minder.Selection();
    var range = new Minder.Range();
    var receiver = new Minder.Receiver(this,sel,range);


    this.receiver = receiver;

    //鼠标被点击，并未太抬起时为真
    var mouseDownStatus = false;

    var lastEvtPosition, dir = 1;

    //当前是否有选区存在
    var selectionReadyShow = false;

    function inputStatusReady(node){
        if (node && km.isSingleSelect() && node.isSelected()) {

            var color = node.getStyle('text-selection-color');

            //准备输入状态
            var textShape = node.getTextShape();

            sel.setHide()
                .setStartOffset(0)
                .setEndOffset(textShape.getContent().length)
                .setColor(color);


            receiver
                .setMinderNode(node)
                .updateContainerRangeBySel();

            if(browser.ie ){
                var timer = setInterval(function(){
                    var nativeRange = range.nativeSel.getRangeAt(0);
                    if(!nativeRange || nativeRange.collapsed){
                        range.select();
                    }else {
                        clearInterval(timer);
                    }
                });
            }


            receiver.minderNode.setTmpData('_lastTextContent',receiver.textShape.getContent());

            km.setStatus('inputready');

        }

    }

    km.textEditNode = function(node){
        inputStatusReady(node);
        km.setStatus('textedit');
        receiver.updateSelectionShow();
    };
    return {
        'events': {
            'ready': function() {
                document.body.appendChild(receiver.container);
            },

            'normal.beforemousedown textedit.beforemousedown inputready.beforemousedown': function(e) {
                //右键直接退出
                if (e.isRightMB()) {
                    return;
                }


                if(receiver.minderNode){
                    var textShape = receiver.minderNode.getTextShape();
                    if(textShape && textShape.getOpacity() === 0){
                        receiver.minderNode.setText(receiver.minderNode.getTmpData('_lastTextContent'));
                        receiver.minderNode.render();
                        receiver.minderNode.getTextShape().setOpacity(1);
                        km.layout(300);
                    }

                }
                mouseDownStatus = true;

                selectionReadyShow = sel.isShow();

                sel.setHide();

                var node = e.getTargetNode();

                //点击在之前的选区上
                if (!node) {
                    var selectionShape = e.kityEvent.targetShape;
                    if (selectionShape && selectionShape.getType() == 'Selection') {
                        node = receiver.getMinderNode();
                        e.stopPropagationImmediately();
                    }

                }

                if(node){

                    var textShape = node.getTextShape();
                    textShape.setStyle('cursor', 'default');
                    if (this.isSingleSelect() && node.isSelected()) {
                        sel.collapse(true);
                        sel.setColor(node.getStyle('text-selection-color'));
                        receiver
                            .setMinderNode(node)
                            .setCurrentIndex(e.getPosition(this.getRenderContainer()))
                            .setRange(range)
                            .setReady();

                        lastEvtPosition = e.getPosition(this.getRenderContainer());

                        if(selectionReadyShow){

                            textShape.setStyle('cursor', 'text');

                            receiver.updateSelection();
                            setTimeout(function() {
                                sel.setShow();
                            }, 200);
                            km.setStatus('textedit');

                        }

                        return;

                    }
                }
                //模拟光标没有准备好
                receiver.clearReady();
                //当点击空白处时，光标需要消失
                receiver.clear();

            },
            'inputready.keyup':function(e){
                if(sel.isHide()){
                    inputStatusReady(this.getSelectedNode());
                }
            },

            //当节点选区通过键盘发生变化时，输入状态要准备好
            'normal.keyup': function(e) {
                var node = this.getSelectedNode();
                if (node) {
                    if (this.isSingleSelect() && node.isSelected() && !sel.isShow() ) {
                        var orgEvt = e.originEvent,
                            keyCode = orgEvt.keyCode;
                        if (keymap.isSelectedNodeKey[keyCode] &&
                            !orgEvt.ctrlKey &&
                            !orgEvt.metaKey &&
                            !orgEvt.shiftKey &&
                            !orgEvt.altKey) {
                                inputStatusReady(node);
                        }
                    }
                }
            },
            'normal.mouseup textedit.mouseup inputready.mouseup': function(e) {

                mouseDownStatus = false;

                var node = e.getTargetNode();


                if (node && !selectionReadyShow && receiver.isReady()) {

                    sel.collapse(true);

                    sel.setColor(node.getStyle('text-selection-color'));



                    node.getTextShape().setStyle('cursor', 'text');

                    receiver.updateSelection();

                    //必须再次focus，要不不能呼出键盘
                    if(browser.ipad){
                        receiver.focus();
                    }

                    setTimeout(function() {
                        sel.setShow();
                    }, 200);


                    lastEvtPosition = e.getPosition(this.getRenderContainer());

                    km.setStatus('textedit');

                    return;
                }

                //当选中节点后，输入状态准备
                if(sel.isHide()){
                    inputStatusReady(e.getTargetNode());
                }else {
                    //当有光标时，要同步选区
                    if(!sel.collapsed){

                        receiver.updateContainerRangeBySel();
                    }


                }




            },
            'textedit.beforemousemove inputready.beforemousemove': function(e) {
                if(browser.ipad){
                    return;
                }
                //ipad下不做框选
                if (mouseDownStatus && receiver.isReady() && selectionReadyShow) {


                    e.stopPropagationImmediately();

                    var offset = e.getPosition(this.getRenderContainer());
                    dir = offset.x > lastEvtPosition.x ? 1 : (offset.x < lastEvtPosition.x ? -1 : dir);
                    receiver.updateSelectionByMousePosition(offset, dir)
                        .updateSelectionShow(dir)
                        .updateContainerRangeBySel();

                    lastEvtPosition = e.getPosition(this.getRenderContainer());

                }else if(mouseDownStatus && !selectionReadyShow){
                    //第一次点中，第二次再次点中进行拖拽
                    km.setStatus('normal');
                    receiver.clearReady();
                }
            },
            'normal.dblclick textedit.dblclick inputready.dblclick': function(e) {

                var node = e.getTargetNode();
                if(node){
                    inputStatusReady(e.getTargetNode());

                    km.setStatus('textedit');

                    receiver.updateSelectionShow();
                }

            },
            'restoreScene': function() {
                receiver.clear();
                inputStatusReady(this.getSelectedNode());
            },
            'stopTextEdit': function() {
                receiver.clear();
                km.setStatus('normal');
            },
            'resize': function(e) {
                sel.setHide();
            },
            'execCommand': function(e) {
                var cmds = {
                    'appendchildnode': 1,
                    'appendsiblingnode': 1,
                    'editnode': 1
                };
                if (cmds[e.commandName]) {
                    inputStatusReady(km.getSelectedNode());
                    receiver.updateSelectionShow();
                    return;

                }

                if(sel.isShow()){
                    receiver.updateTextOffsetData().updateSelection();
                }
            },
            'layoutfinish':function(e){
                if (e.node === receiver.minderNode && (this.getStatus() == 'textedit' || this.getStatus() == 'inputready') ) {//&& selectionReadyShow
                    receiver
                        .setBaseOffset()
                        .setContainerStyle();
                }
            },
            'selectionclear': function() {
                var node = km.getSelectedNode();
                if(node){
                    inputStatusReady(node);
                }else{
                    km.setStatus('normal');
                    receiver.clear();
                }


            },
            'blur': function() {
                receiver.clear();
            },
            'textedit.import': function() {
                km.setStatus('normal');
                receiver.clear();
            },
            'textedit.mousewheel': function() {
                receiver.setContainerStyle();
            }

        }
    };
});

Minder.Range = kity.createClass('Range',{
    constructor : function(){
        this.nativeRange = document.createRange();
        this.nativeSel = window.getSelection();
    },
    hasNativeRange : function(){
        return this.nativeSel.rangeCount !== 0 ;
    },
    select:function(){
        var start = this.nativeRange.startContainer;
        if(start.nodeType == 1 && start.childNodes.length === 0){
            var char = document.createTextNode('\u200b');
            start.appendChild(char);
            this.nativeRange.setStart(char,1);
            this.nativeRange.collapse(true);
        }
        try{
            this.nativeSel.removeAllRanges();
        }catch(e){

        }

        this.nativeSel.addRange(this.nativeRange);
        return this;
    },
    setStart:function(node,index){
        try{
            this.nativeRange.setStart(node,index);
        }catch(error){
            console.log(error);
        }

        return this;
    },
    setEnd:function(node,index){
        this.nativeRange.setEnd(node,index);
        return this;
    },
    getStart:function(){
        var range = this.nativeSel.getRangeAt(0);
        return {
            startContainer:range.startContainer,
            startOffset:range.startOffset
        };
    },
    getStartOffset:function(){
        return this.nativeRange.startOffset;
    },
    getEndOffset:function(){
        return this.nativeRange.endOffset;
    },
    collapse:function(toStart){
        this.nativeRange.collapse(toStart === true);
        return this;
    },
    isCollapsed:function(){
        return this.nativeRange.collapsed;
    },
    insertNode:function(node){
        this.nativeRange.insertNode(node);
        return this;
    },
    updateNativeRange:function(){

        this.nativeRange = this.nativeSel.getRangeAt(0);
        return this;
    }

});

//接收者
Minder.Receiver = kity.createClass('Receiver', {
    clear: function() {
        this.container.innerHTML = '';
        if (this.selection) {
            this.selection.setHide();
        }
        if (this.range) {
            this.range.nativeSel.removeAllRanges();
        }
        this.index = 0;
        this.isTypeText = false;
        this.lastMinderNode = null;
        return this;
    },
    constructor: function(km,sel,range) {
        var me = this;
        this.setKityMinder(km);

        var _div = document.createElement('div');
        _div.setAttribute('contenteditable', true);
        _div.className = 'km_receiver';

        this.container = _div;

        if(browser.ipad) {
            utils.listen(this.container, 'keydown keypress keyup input', function(e) {
                me.keyboardEvents.call(me, new MinderEvent(e.type == 'keyup' ? 'beforekeyup' : e.type, e));
                if(e.type == 'keyup'){
                    if(me.km.getStatus() == 'normal'){
                        me.km.fire( 'keyup', e);
                    }

                }

            });
        }
        utils.addCssRule('km_receiver_css', ' .km_receiver{white-space:nowrap;position:absolute;padding:0;margin:0;word-wrap:break-word;' + (/\?debug#?/.test(location.href)?'':'clip:rect(1em 1em 1em 1em);'));
        this.km.on('inputready.beforekeyup inputready.beforekeydown textedit.beforekeyup normal.keydown normal.keyup textedit.beforekeydown textedit.keypress textedit.paste', utils.proxy(this.keyboardEvents, this));
        this.timer = null;
        this.index = 0;
        this.selection = sel;
        this.range = range;
    },
    setRange: function(range, index) {

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart(text || this.container, this.index)
        range.collapse(true);
        var me = this;

        setTimeout(function() {
            me.container.focus();
            range.select();
        });
        return this;
    },
    setTextShape: function(textShape) {
        if (!textShape) {
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        // techird: add cache
        if (textShape._lastContent != textShape.getContent()) {
            this.container.innerHTML = utils.unhtml(textShape.getContent());
            textShape._lastContent = textShape.getContent();
        }
        return this;
    },
    setTextShapeSize: function(size) {
        this.textShape.setSize(size);
        return this;
    },
    getTextShapeHeight: function() {
        return this.textShape.getRenderBox().height;
    },
    setKityMinder: function(km) {
        this.km = km;
        return this;
    },
    setMinderNode: function(node) {
        this.minderNode = node;
        //追加selection到节点
        this._addSelection();
        //更新minderNode下的textshape
        this.setTextShape(node.getTextShape());
        //更新textshape的baseOffset
        this.setBaseOffset();
        //更新接受容器的样式
        this.setContainerStyle();
        //更新textOffsetData数据
        this.updateTextOffsetData();
        //更新选取高度
        this.setSelectionHeight();
        //更新接收容器内容
        this.setContainerTxt();

        return this;
    },
    _addSelection:function(){
        if (this.selection.container) this.selection.remove();
        this.minderNode.getRenderContainer().addShape(this.selection);
    },
    getMinderNode:function(){
        return this.minderNode;
    },
    keyboardEvents: function(e) {


        var me = this;
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;

        function setTextToContainer() {

            clearTimeout(me.timer);
            if (!me.range.hasNativeRange()) {
                return;
            }


            if(keymap.controlKeys[keyCode]){
                return;
            }
            //当第一次输入内容时进行保存
            if(me.lastMinderNode !== me.minderNode && !keymap.notContentChange[keyCode]){
                me.km.fire('saveScene',{
                    inputStatus:true
                });
                me.lastMinderNode = me.minderNode;
            }
            var text = me.container.textContent.replace(/[\u200b\t\r\n]/g, '');

            //#46 修复在ff下定位到文字后方空格光标不移动问题
            if (browser.gecko && /\s$/.test(text)) {
                text += '\u200b';
            }


            //如果接受框已经空了，并且已经添加了占位的a了就什么都不做了
            if(text.length === 0 && me.textShape.getOpacity() === 0){
                return;
            }

            if (text.length === 0) {
                me.minderNode.setTmpData('_lastTextContent',me.textShape.getContent());
                me.minderNode.setText('a');
            }else {
                me.minderNode.setText(text);
                if (me.textShape.getOpacity() === 0) {
                    me.textShape.setOpacity(1);
                }
            }


            me.setContainerStyle();
            me.minderNode.getRenderContainer().bringTop();
            me.minderNode.render();
            //移动光标不做layout
            if(!keymap.notContentChange[keyCode]){
                clearTimeout(me.inputTextTimer);

                me.inputTextTimer = setTimeout(function(){
                    me.km.layout(300);
                },250);
            }


            me.textShape = me.minderNode.getRenderer('TextRenderer').getRenderShape();
            if (text.length === 0) {
                me.textShape.setOpacity(0);
            }
            me.setBaseOffset();
            me.updateTextOffsetData();
            me.updateRange();
            me.updateSelectionByRange();

            me.updateSelectionShow();
            me.timer = setTimeout(function() {
                if(me.selection.isShow())
                    me.selection.setShow();
            }, 200);

            me.km.setStatus('textedit');
        }

        function restoreTextContent(){
            if(me.minderNode){
                var textShape = me.minderNode.getTextShape();
                if(textShape && textShape.getOpacity() === 0){
                    me.minderNode.setText(me.minderNode.getTmpData('_lastTextContent'));
                    me.minderNode.render();
                    me.minderNode.getTextShape().setOpacity(1);
                    me.km.layout(300);
                }

            }
        }
        switch (e.type) {

            case 'input':
                if (browser.ipad) {
                    setTimeout(function() {
                        setTextToContainer();
                    });
                }
                break;
            case 'beforekeydown':
                this.isTypeText = keyCode == 229 || keyCode === 0;

                switch (keyCode) {
                    case keymap.Enter:
                    case keymap.Tab:
                        if(this.selection.isShow()){
                            this.clear();
                            this.km.setStatus('inputready');
                            clearTimeout(me.inputTextTimer);
                            e.preventDefault();
                        }else{
                            this.km.setStatus('normal');
                            this.km.fire('contentchange');
                        }
                        restoreTextContent();
                        return;
                    case keymap.left:
                    case keymap.right:
                    case keymap.up:
                    case keymap.down:
                    case keymap.Backspace:
                    case keymap.Del:
                    case keymap['/']:
                        if(this.selection.isHide()){
                            restoreTextContent();
                            this.km.setStatus('normal');
                            return;
                        }
                        break;
                    case keymap.Control:
                    case keymap.Alt:
                    case keymap.Cmd:
                    case keymap.F2:
                        if(this.selection.isHide() && this.km.getStatus() != 'inputready'){
                            this.km.setStatus('normal');
                            return;
                        }

                }

                if (e.originEvent.ctrlKey || e.originEvent.metaKey) {

                    //选中节点时的复制粘贴，要变成normal
                    if(this.selection.isHide() && {
                        86:1,
                        88:1,
                        67:1
                    }[keyCode]){
                        restoreTextContent();
                        this.km.setStatus('normal');
                        return;
                    }

                    //粘贴
                    if (keyCode == keymap.v) {

                        setTimeout(function () {
                            me.range.updateNativeRange().insertNode($('<span>$$_kityminder_bookmark_$$</span>')[0]);
                            me.container.innerHTML = utils.unhtml(me.container.textContent.replace(/[\u200b\t\r\n]/g, ''));
                            var index = me.container.textContent.indexOf('$$_kityminder_bookmark_$$');
                            me.container.textContent = me.container.textContent.replace('$$_kityminder_bookmark_$$', '');
                            me.range.setStart(me.container.firstChild, index).collapse(true).select();
                            setTextToContainer(keyCode);
                        }, 100);
                        return;
                    }
                    //剪切
                    if (keyCode == keymap.x) {
                        setTimeout(function () {
                            setTextToContainer(keyCode);
                        }, 100);
                        return;
                    }


                }
                //针对不能连续删除做处理
                if(keymap.Del  == keyCode || keymap.Backspace == keyCode)
                    setTextToContainer(keyCode);
                break;

            case 'beforekeyup':
                switch (keyCode) {
                    case keymap.Enter:
                    case keymap.Tab:
                    case keymap.F2:
                        if(browser.ipad){
                            if(this.selection.isShow()){
                                this.clear();
                                this.km.setStatus('inputready');
                                clearTimeout(me.inputTextTimer);
                                e.preventDefault();
                            }else{
                                this.km.setStatus('normal');
                                this.km.fire('contentchange');
                            }
                            restoreTextContent();
                            return;
                        }
                        if (keymap.Enter == keyCode && (this.isTypeText || browser.mac && browser.gecko)) {
                            setTextToContainer(keyCode);
                        }
                        if (this.keydownNode === this.minderNode) {
                            this.rollbackStatus();
                            this.clear();
                        }
                        e.preventDefault();
                        return;
                    case keymap.Del:
                    case keymap.Backspace:
                    case keymap.Spacebar:
                        if(browser.ipad){
                            if(this.selection.isHide()){
                                this.km.setStatus('normal');
                                return;
                            }

                        }
                        setTextToContainer(keyCode);
                        return;
                }
                if (this.isTypeText) {
                    setTextToContainer(keyCode);
                    return;
                }
                if (browser.mac && browser.gecko){
                    setTextToContainer(keyCode);
                    return;
                }
                setTextToContainer(keyCode);

                return true;

            case 'keyup':
                var node = this.km.getSelectedNode();
                if(this.km.getStatus() == 'normal' && node && this.selection.isHide()){
                    if (node && this.km.isSingleSelect() && node.isSelected()) {

                        var color = node.getStyle('text-selection-color');

                        //准备输入状态
                        var textShape = node.getTextShape();

                        this.selection.setHide()
                            .setStartOffset(0)
                            .setEndOffset(textShape.getContent().length)
                            .setColor(color);


                        this
                            .setMinderNode(node)
                            .updateContainerRangeBySel();

                        if(browser.ie ){
                            var timer = setInterval(function(){
                                var nativeRange = this.range.nativeSel.getRangeAt(0);
                                if(!nativeRange || nativeRange.collapsed){
                                    this.range.select();
                                }else {
                                    clearInterval(timer);
                                }
                            });
                        }


                        this.minderNode.setTmpData('_lastTextContent',this.textShape.getContent());

                        this.km.setStatus('inputready');

                    }
                }

        }

    },

    updateIndex: function() {
        this.index = this.range.getStart().startOffset;
        return this;
    },
    updateTextOffsetData: function() {
        this.textShape.textData = this.getTextOffsetData();
        return this;
    },
    setSelection: function(selection) {
        this.selection = selection;
        return this;
    },
    updateSelection: function() {
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset(this.index).collapse(true);
        if (this.index == this.textData.length) {
            if (this.index === 0) {
                this.selection.setPosition(this.getBaseOffset());
            } else {
                this.selection.setPosition({
                    x: this.textData[this.index - 1].x + this.textData[this.index - 1].width,
                    y: this.textData[this.index - 1].y
                });
            }


        } else {
            this.selection.setPosition(this.textData[this.index]);
        }
        return this;
    },
    getBaseOffset: function(refer) {
        return this.textShape.getRenderBox(refer || this.km.getRenderContainer());
    },
    setBaseOffset: function() {
        this.offset = this.textShape.getRenderBox(this.km.getRenderContainer());
        return this;
    },
    setContainerStyle: function() {
        var textShapeBox = this.getBaseOffset('screen');
        this.container.style.cssText = ';left:' + (browser.ipad ? '-' : '') +
            textShapeBox.x + 'px;top:' + (textShapeBox.y + (/\?debug#?/.test(location.href)?30:0)) +
            'px;width:' + textShapeBox.width + 'px;height:' + textShapeBox.height + 'px;';

        return this;
    },
    getTextOffsetData: function() {
        var text = this.textShape.getContent();
        var box;
        this.textData = [];

        for (var i = 0, l = text.length; i < l; i++) {
            try {
                box = this.textShape.getExtentOfChar(i);
            } catch (e) {
                console.log(e);
            }

            this.textData.push({
                x: box.x ,
                y: box.y,
                width: box.width,
                height: box.height
            });
        }
        return this;
    },
    setCurrentIndex: function(offset) {
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        //要剪掉基数
        this._getRelativeValue(offset);
        utils.each(this.textData, function(i, v) {
            //点击开始之前
            if (i === 0 && offset.x <= v.x) {
                me.index = 0;
                return false;
            }
            if (offset.x >= v.x && offset.x <= v.x + v.width) {
                if (offset.x - v.x > v.width / 2) {
                    me.index = i + 1;

                } else {
                    me.index = i;

                }
                hadChanged = true;
                return false;
            }
            if (i == me.textData.length - 1 && offset.x >= v.x) {
                me.index = me.textData.length;
                return false;
            }
        });

        return this;

    },
    setSelectionHeight: function() {
        this.selection.setHeight(this.getTextShapeHeight());
        return this;
    },
    _getRelativeValue:function(offset){
        offset.x = offset.x - this.offset.x;
        offset.y = offset.y - this.offset.y;
    },
    updateSelectionByMousePosition: function(offset, dir) {
        //要剪掉基数
        this._getRelativeValue(offset);
        var me = this;
        utils.each(this.textData, function(i, v) {
            //点击开始之前
            if (i === 0 && offset.x <= v.x) {
                me.selection.setStartOffset(0);
                return false;
            }

            if (i == me.textData.length - 1 && offset.x >= v.x) {
                me.selection.setEndOffset(me.textData.length);
                return false;
            }
            if (offset.x >= v.x && offset.x <= v.x + v.width) {

                if (me.index == i) {
                    if (i === 0) {
                        me.selection.setStartOffset(i);
                    }
                    if (offset.x <= v.x + v.width / 2) {
                        me.selection.collapse(true);
                    } else {
                        me.selection.setEndOffset(i + ((me.selection.endOffset > i ||
                            dir == 1) && i != me.textData.length - 1 ? 1 : 0));
                    }

                } else if (i > me.index) {
                    me.selection.setStartOffset(me.index);
                    me.selection.setEndOffset(i + 1);
                } else {
                    if (dir == 1) {
                        me.selection.setStartOffset(i + (offset.x >= v.x + v.width / 2 &&
                            i != me.textData.length - 1 ? 1 : 0));
                    } else {
                        me.selection.setStartOffset(i);
                    }

                    me.selection.setEndOffset(me.index);
                }

                return false;
            }
        });
        return this;
    },
    updateSelectionShow: function() {
        var startOffset = this.textData[this.selection.startOffset],
            endOffset = this.textData[this.selection.endOffset],
            width = 0;
        if (this.selection.collapsed) {
            if(startOffset === undefined){

                var tmpOffset = this.textData[this.textData.length - 1];
                tmpOffset = utils.clone(tmpOffset);
                tmpOffset.x = tmpOffset.x + tmpOffset.width;
                startOffset = tmpOffset;
            }
            this.selection.updateShow(startOffset, 2);
            return this;
        }
        if (!endOffset) {
            try {
                var lastOffset = this.textData[this.textData.length - 1];
                width = lastOffset.x - startOffset.x + lastOffset.width;
            } catch (e) {
                console.log(e);
            }

        } else {
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow(startOffset, width);
        return this;
    },
    updateRange: function() {
        this.range.updateNativeRange();
        return this;
    },
    updateContainerRangeBySel:function(){
        var me = this;
        var node = this.container.firstChild;
        this.range.setStart(node, this.selection.startOffset);
        this.range.setEnd(node, this.selection.endOffset);
        if(browser.gecko){
            this.container.focus();
            setTimeout(function(){
                me.range.select();
            });
        }else{
            this.range.select();
        }
        return this;
    },
    updateSelectionByRange:function(){
        this.selection.setStartOffset(this.range.getStartOffset());
        this.selection.setEndOffset(this.range.getEndOffset());
        return this;
    },
    setIndex: function(index) {
        this.index = index;
        return this;
    },
    setContainerTxt: function(txt) {
        this.container.textContent = txt || this.textShape.getContent();
        return this;
    },
    setReady:function(){
        this._ready = true;
    },
    clearReady:function(){
        this._ready = false;
    },
    isReady:function(){
        return this._ready;
    },
    focus:function(){
        this.container.focus();
    }
});

//模拟光标
Minder.Selection = kity.createClass( 'Selection', {
    base: kity.Rect,
    constructor: function ( height, color, width ) {
        this.callBase();
        this.height = height || 20;
        this.setAttr('id','_kity_selection');
        this.width = 2;
        this.fill('rgb(27,171,255)');
        this.setHide();
        this.timer = null;
        this.collapsed = true;
        this.startOffset = this.endOffset = 0;
        this.setOpacity(0.5);
        this.setStyle('cursor','text');
        this._show = false;

    },
    setColor:function(color){
        this.fill(color);
    },
    collapse : function(toStart){
        this.setOpacity(1);
        this.width = 2;
        this.collapsed = true;
        if(toStart){
            this.endOffset = this.startOffset;

        }else{
            this.startOffset = this.endOffset;
        }
        return this;
    },
    setStartOffset:function(offset){
        this.startOffset = offset;
        if(this.startOffset >= this.endOffset){
            this.collapse(true);
            return this;
        }
        this.collapsed = false;
        this.setOpacity(0.5);
        return this;
    },
    setEndOffset:function(offset){
        this.endOffset = offset;
        if(this.endOffset <= this.startOffset){
           this.startOffset = offset;
           this.collapse(true);
            return this;
        }
        this.collapsed = false;
        this.setOpacity(0.5);
        return this;
    },
    updateShow : function(offset,width){
        if(width){
            this.setShowHold();
        }
        this.setPosition(offset).setWidth(width);
        this.bringTop();
        return this;
    },
    setPosition: function ( offset ) {
        try {
            // 这两个是神奇的 0.5 —— SVG 要边缘锐利，你需要一些对齐
            this.x = Math.round(offset.x) - 0.5;
            this.y = Math.round(offset.y) - 1.5;

        } catch ( e ) {
           console.log(e);
        }
        this.update();
        return this;
    },
    setHeight: function ( height ) {
        this.height = Math.round(height) + 2;
        return this;
    },
    setHide: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', 'none' );
        this._show = false;
        return this;
    },
    setShowHold: function () {
        clearInterval( this.timer );
        this.setStyle( 'display', '' );
        this._show = true;
        return this;
    },
    setShow: function () {
        clearInterval( this.timer );
        var me = this,
            state = '';

        me.setStyle( 'display', '' );
        me._show = true;
        if(this.collapsed){
            me.setOpacity(1);
            this.timer = setInterval( function () {
                me.setStyle( 'display', state );
                state = state ? '' : 'none';
            }, 400 );
        }
        return this;
    },
    isShow:function(){
        return this._show;
    },
    isHide:function(){
        return !this._show;
    }
} );

KityMinder.registerModule('basestylemodule', function() {
    var km = this;

    function getNodeDataOrStyle(node, name) {
        return node.getData(name) || node.getStyle(name);
    }

    KityMinder.TextRenderer.registerStyleHook(function(node, text) {
        text.setFont({
            weight: getNodeDataOrStyle(node, 'font-weight'),
            style: getNodeDataOrStyle(node, 'font-style')
        });
    });
    return {
        'commands': {
            'bold': kity.createClass('boldCommand', {
                base: Command,

                execute: function(km) {

                    var nodes = km.getSelectedNodes();
                    if (this.queryState('bold') == 1) {
                        utils.each(nodes, function(i, n) {
                            n.setData('font-weight').render();
                        });
                    } else {
                        utils.each(nodes, function(i, n) {
                            n.setData('font-weight', 'bold').render();
                        });
                    }
                    km.layout();
                },
                queryState: function() {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if (nodes.length === 0) {
                        return -1;
                    }
                    utils.each(nodes, function(i, n) {
                        if (n && n.getData('font-weight')) {
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            }),
            'italic': kity.createClass('italicCommand', {
                base: Command,

                execute: function(km) {

                    var nodes = km.getSelectedNodes();
                    if (this.queryState('italic') == 1) {
                        utils.each(nodes, function(i, n) {
                            n.setData('font-style').render();
                        });
                    } else {
                        utils.each(nodes, function(i, n) {
                            n.setData('font-style', 'italic').render();
                        });
                    }

                    km.layout();
                },
                queryState: function() {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if (nodes.length === 0) {
                        return -1;
                    }
                    utils.each(nodes, function(i, n) {
                        if (n && n.getData('font-style')) {
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            })
        },
        addShortcutKeys: {
            'bold': 'ctrl+b', //bold
            'italic': 'ctrl+i' //italic
        }
    };
});

KityMinder.registerModule("fontmodule", function() {
    function getNodeDataOrStyle(node, name) {
        return node.getData(name) || node.getStyle(name);
    }

    KityMinder.TextRenderer.registerStyleHook(function(node, text) {
        var dataColor = node.getData('color');
        var selectedColor = node.getStyle('selected-color');
        var styleColor = node.getStyle('color');
        text.fill(dataColor || (node.isSelected() && selectedColor ? selectedColor : styleColor));
        text.setFont({
            family: getNodeDataOrStyle(node, 'font-family'),
            size: getNodeDataOrStyle(node, 'font-size')
        });
    });

    return {
        defaultOptions: {
            'fontfamily': [{
                name: 'songti',
                val: '宋体,SimSun'
            }, {
                name: 'yahei',
                val: '微软雅黑,Microsoft YaHei'
            }, {
                name: 'kaiti',
                val: '楷体,楷体_GB2312, SimKai'
            }, {
                name: 'heiti',
                val: '黑体, SimHei'
            }, {
                name: 'lishu',
                val: '隶书, SimLi'
            }, {
                name: 'andaleMono',
                val: 'andale mono'
            }, {
                name: 'arial',
                val: 'arial, helvetica,sans-serif'
            }, {
                name: 'arialBlack',
                val: 'arial black,avant garde'
            }, {
                name: 'comicSansMs',
                val: 'comic sans ms'
            }, {
                name: 'impact',
                val: 'impact,chicago'
            }, {
                name: 'timesNewRoman',
                val: 'times new roman'
            }, {
                name: 'sans-serif',
                val: 'sans-serif'
            }],
            'fontsize': [10, 12, 16, 18, 24, 32, 48]
        },
        "commands": {
            "forecolor": kity.createClass("fontcolorCommand", {
                base: Command,

                execute: function(km, color) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('color', color);
                        n.render();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('color');
                    }
                    return 'mixed';
                }

            }),
            "backgroundcolor": kity.createClass("backgroudcolorCommand", {
                base: Command,

                execute: function(km, color) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('background', color);
                        n.render();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                },
                queryValue: function(km) {
                    if (km.getSelectedNodes().length == 1) {
                        return km.getSelectedNodes()[0].getData('background');
                    }
                    return 'mixed';
                }

            }),
            "fontfamily": kity.createClass("fontfamilyCommand", {
                base: Command,

                execute: function(km, family) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('font-family', family);
                        n.render();
                        km.layout();
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                }
            }),
            "fontsize": kity.createClass("fontsizeCommand", {
                base: Command,

                execute: function(km, size) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('font-size', size);
                        n.render();
                        km.layout(300);
                    });
                },
                queryState: function(km) {
                    return km.getSelectedNodes().length == 0 ? -1 : 0
                }
            })
        }
    };
});

KityMinder.registerModule('Zoom', function() {
    var me = this;

    var timeline;

    me.setDefaultOptions('zoom', [10, 20, 30, 50, 80, 100, 120, 150, 200]);

    function fixPaperCTM(paper) {
        var node = paper.shapeNode;
        var ctm = node.getCTM();
        var matrix = new kity.Matrix(ctm.a, ctm.b, ctm.c, ctm.d, (ctm.e | 0) + 0.5, (ctm.f | 0) + 0.5);
        node.setAttribute('transform', 'matrix(' + matrix.toString() + ')');
    }

    kity.extendClass(Minder, {
        zoom: function(value) {
            var paper = this.getPaper();
            var viewport = paper.getViewPort();
            viewport.zoom = value / 100;
            viewport.center = {
                x: viewport.center.x,
                y: viewport.center.y
            };
            paper.setViewPort(viewport);
            if (value == 100) fixPaperCTM(paper);
        }
    });

    function zoomMinder(minder, value) {
        var paper = minder.getPaper();
        var viewport = paper.getViewPort();

        if (!value) return;

        var animator = new kity.Animator({
            beginValue: minder._zoomValue,
            finishValue: value,
            setter: function(target, value) {
                target.zoom(value);
            }
        });
        minder._zoomValue = value;
        if (timeline) {
            timeline.pause();
        }
        timeline = animator.start(minder, 300, 'easeInOutSine');
    }

    var ZoomCommand = kity.createClass('Zoom', {
        base: Command,
        execute: zoomMinder,
        queryValue: function(minder) {
            return minder._zoomValue;
        }
    });

    var ZoomInCommand = kity.createClass('ZoomInCommand', {
        base: Command,
        execute: function(minder) {
            zoomMinder(minder, this.nextValue(minder));
        },
        queryState: function(minder) {
            return (~this.nextValue(minder));
        },
        nextValue: function(minder) {
            var stack = minder.getOptions('zoom'),
                i;
            for (i = 0; i < stack.length; i++) {
                if (stack[i] > minder._zoomValue) return stack[i];
            }
            return 0;
        },
        enableReadOnly: false
    });

    var ZoomOutCommand = kity.createClass('ZoomOutCommand', {
        base: Command,
        execute: function(minder) {
            zoomMinder(minder, this.nextValue(minder));
        },
        queryState: function(minder) {
            return (~this.nextValue(minder));
        },
        nextValue: function(minder) {
            var stack = minder.getOptions('zoom'),
                i;
            for (i = stack.length - 1; i >= 0; i--) {
                if (stack[i] < minder._zoomValue) return stack[i];
            }
            return 0;
        },
        enableReadOnly: false
    });

    return {
        init: function() {
            this._zoomValue = 100;
        },
        commands: {
            'zoom-in': ZoomInCommand,
            'zoom-out': ZoomOutCommand,
            'zoom': ZoomCommand
        },
        events: {
            'normal.keydown': function(e) {
                var me = this;
                var originEvent = e.originEvent;
                var keyCode = originEvent.keyCode || originEvent.which;
                if (keymap['='] == keyCode) {
                    me.execCommand('zoom-in');
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (keymap['-'] == keyCode) {
                    me.execCommand('zoom-out');
                    e.stopPropagation();
                    e.preventDefault();

                }
            },
            'normal.mousewheel readonly.mousewheel': function(e) {
                if (!e.originEvent.ctrlKey) return;
                var delta = e.originEvent.wheelDelta;
                var me = this;

                if (!kity.Browser.mac) {
                    delta = -delta;
                }

                // 稀释
                if (Math.abs(delta) > 100) {
                    clearTimeout(this._wheelZoomTimeout);
                } else {
                    return;
                }

                this._wheelZoomTimeout = setTimeout(function() {
                    var value;
                    var lastValue = me.getPaper()._zoom || 1;
                    if (delta < 0) {
                        me.execCommand('zoom-in');
                    } else if (delta > 0) {
                        me.execCommand('zoom-out');
                    }
                }, 100);

                e.originEvent.preventDefault();
            }
        }
    };
});

KityMinder.registerModule("hyperlink", function() {
    var linkShapePath = "M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z";
    return {
        "commands": {
            "hyperlink": kity.createClass("hyperlink", {
                base: Command,

                execute: function(km, url) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('hyperlink', url);
                        n.render();
                    });
                    km.layout();
                },
                queryState: function(km) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if (nodes.length === 0) {
                        return -1;
                    }
                    utils.each(nodes, function(i, n) {
                        if (n && n.getData('hyperlink')) {
                            result = 0;
                            return false;
                        }
                    });
                    return result;
                },
                queryValue: function(km) {
                    var node = km.getSelectedNode();
                    return node.getData('hyperlink');
                }
            }),
            "unhyperlink": kity.createClass("hyperlink", {
                base: Command,

                execute: function(km) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function(i, n) {
                        n.setData('hyperlink');
                        n.render();
                    });
                    km.layout();
                },
                queryState: function(km) {
                    var nodes = km.getSelectedNodes();

                    if (nodes.length === 0) {
                        return -1;
                    }
                    var link = false;
                    utils.each(nodes, function(i, n) {
                        if (n.getData('hyperlink')) {
                            link = true;
                            return false;
                        }
                    });
                    if (link) {
                        return 0;
                    }
                    return -1;
                }
            })
        },
        'renderers': {
            right: kity.createClass('hyperlinkrender', {
                base: KityMinder.Renderer,

                create: function() {

                    var link = new kity.HyperLink();
                    var linkshape = new kity.Path();
                    var outline = new kity.Rect(24, 22, -2, -6, 4).fill('rgba(255, 255, 255, 0)');


                    linkshape.setPathData(linkShapePath).fill('#666');
                    link.addShape(outline);
                    link.addShape(linkshape);
                    link.setTarget('_blank');
                    link.setStyle('cursor', 'pointer');


                    link.on('mouseover', function() {
                        outline.fill('rgba(255, 255, 200, .8)');
                    }).on('mouseout', function() {
                        outline.fill('rgba(255, 255, 255, 0)');
                    });
                    return link;
                },

                shouldRender: function(node) {

                    return node.getData('hyperlink');
                },

                update: function(link, node, box) {

                    var href = node.getData('hyperlink');
                    link.setHref(href);
                    link.setAttr('xlink:title', href);
                    var spaceRight = node.getStyle('space-right');

                    link.setTranslate(box.right + spaceRight + 2, -5);
                    return {
                        x: box.right + spaceRight,
                        y: -11,
                        width: 24,
                        height: 22
                    };
                }
            })
        }

    };
});

kity.extendClass(MinderNode, {
    arrange: function(index) {
        var parent = this.parent;
        if (!parent) return;
        var sibling = parent.children;

        if (index < 0 || index >= sibling.length) return;
        sibling.splice(this.getIndex(), 1);
        sibling.splice(index, 0, this);
        return this;
    }
});

function asc(nodeA, nodeB) {
    return nodeA.getIndex() - nodeB.getIndex();
}
function desc(nodeA, nodeB) {
    return -asc(nodeA, nodeB);
}

var ArrangeUpCommand = kity.createClass('ArrangeUpCommand', {
    base: Command,

    execute: function(km) {
        var nodes = km.getSelectedNodes();
        nodes.sort(asc);
        var lastIndexes = nodes.map(function(node) {
            return node.getIndex();
        });
        nodes.forEach(function(node, index) {
            node.arrange(lastIndexes[index] - 1);
        });
        km.layout(300);
    }
});

var ArrangeDownCommand = kity.createClass('ArrangeUpCommand', {
    base: Command,

    execute: function(km) {
        var nodes = km.getSelectedNodes();
        nodes.sort(desc);
        var lastIndexes = nodes.map(function(node) {
            return node.getIndex();
        });
        nodes.forEach(function(node, index) {
            node.arrange(lastIndexes[index] + 1);
        });
        km.layout(300);
    }
});

var ArrangeCommand = kity.createClass('ArrangeCommand', {
    base: Command,

    execute: function(km, nodes, index) {
        nodes = nodes && nodes.slice() || km.getSelectedNodes().slice();

        if (!nodes.length) return;

        var ancestor = MinderNode.getCommonAncestor(nodes);

        if (ancestor != nodes[0].parent) return;

        var indexed = nodes.map(function(node) {
            return {
                index: node.getIndex(),
                node: node
            };
        });

        var asc = Math.min.apply(Math, indexed.map(function(one) { return one.index; })) >= index;

        indexed.sort(function(a, b) {
            return asc ? (b.index - a.index) : (a.index - b.index);
        });

        indexed.forEach(function(one) {
            one.node.arrange(index);
        });

        km.layout(300);
    }
});

KityMinder.registerModule('ArrangeModule', {
    commands: {
        'arrangeup': ArrangeUpCommand,
        'arrangedown': ArrangeDownCommand,
        'arrange': ArrangeCommand
    },
    addShortcutKeys: {
        'arrangeup': 'alt+Up',
        'arrangedown': 'alt+Down'
    }
});

KityMinder.registerModule( "pasteModule", function () {
    var km = this,

        _cacheNodes = [],

        _selectedNodes = [],

        _copystatus= false,

        _curstatus = false;

    function appendChildNode(parent, child) {
        _selectedNodes.push(child);
        km.appendNode(child,parent);
        child.render();
        child.setLayoutOffset(null);
        var children = utils.cloneArr(child.children);
        for (var i = 0, ci; ci = children[i++]; ) {
            appendChildNode(child, ci);
        }
    }

    function getNodes(arr,isCut){
        _cacheNodes = [];
        for(var i= 0,ni;ni=arr[i++];){
            _cacheNodes.push(ni.clone());
            if(isCut && !ni.isRoot()){
                km.removeNode(ni);
            }
        }
    }
    return {
        'events': {
            'normal.keydown': function (e) {
                var keys = KityMinder.keymap;

                var keyEvent = e.originEvent;

                if (keyEvent.ctrlKey || keyEvent.metaKey) {

                    switch (keyEvent.keyCode) {
                        case keys.c:
                            getNodes(km.getSelectedAncestors(true));
                            _copystatus = true;
                            break;
                        case keys.x:
                            getNodes(km.getSelectedAncestors(),true);
                            km.layout(300);
                            _curstatus = true;
                            break;
                        case keys.v:
                            if(_cacheNodes.length){
                                var node = km.getSelectedNode();
                                if(node){
                                    km.fire('saveScene');
                                    for(var i= 0,ni;ni=_cacheNodes[i++];){
                                        appendChildNode(node,ni.clone());
                                    }
                                    km.layout(300);
                                    km.select(_selectedNodes,true);
                                    _selectedNodes = [];
                                    km.fire('saveScene');
                                }
                            }

                    }
                }


            }
        }

    };
} );

/*! jQuery UI - v1.10.4 - 2014-02-18
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.draggable.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function(e,t){function i(t,i){var s,a,o,r=t.nodeName.toLowerCase();return"area"===r?(s=t.parentNode,a=s.name,t.href&&a&&"map"===s.nodeName.toLowerCase()?(o=e("img[usemap=#"+a+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var s=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,s,a=e(this[0]);a.length&&a[0]!==document;){if(n=a.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(s=parseInt(a.css("zIndex"),10),!isNaN(s)&&0!==s))return s;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++s)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),s=isNaN(n);return(s||n>=0)&&i(t,!s)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function s(t,i,n,s){return e.each(a,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),s&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var a="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,s(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,s(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var s,a=e.ui[t].prototype;for(s in n)a.plugins[s]=a.plugins[s]||[],a.plugins[s].push([i,n[s]])},call:function(e,t,i){var n,s=e.plugins[t];if(s&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;s.length>n;n++)e.options[s[n][0]]&&s[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",s=!1;return t[n]>0?!0:(t[n]=1,s=t[n]>0,t[n]=0,s)}})})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l={},c=i.split(".")[0];i=i.split(".")[1],o=c+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[c]=t[c]||{},a=t[c][i],r=t[c][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(i,n){return t.isFunction(n)?(l[i]=function(){var t=function(){return s.prototype[i].apply(this,arguments)},e=function(t){return s.prototype[i].apply(this,t)};return function(){var i,s=this._super,o=this._superApply;return this._super=t,this._superApply=e,i=n.apply(this,arguments),this._super=s,this._superApply=o,i}}(),e):(l[i]=n,e)}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix||i:i},l,{constructor:r,namespace:c,widgetName:i,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),1===arguments.length)return o[i]===e?null:o[i];o[i]=s}else{if(1===arguments.length)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&t.effects.effect[r]?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,a="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!a&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return t.ui.ie&&(!document.documentMode||9>document.documentMode)&&!e.button?this._mouseUp(e):this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t){t.widget("ui.draggable",t.ui.mouse,{version:"1.10.4",widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1,drag:null,start:null,stop:null},_create:function(){"original"!==this.options.helper||/^(?:r|a|f)/.test(this.element.css("position"))||(this.element[0].style.position="relative"),this.options.addClasses&&this.element.addClass("ui-draggable"),this.options.disabled&&this.element.addClass("ui-draggable-disabled"),this._mouseInit()},_destroy:function(){this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy()},_mouseCapture:function(e){var i=this.options;return this.helper||i.disabled||t(e.target).closest(".ui-resizable-handle").length>0?!1:(this.handle=this._getHandle(e),this.handle?(t(i.iframeFix===!0?"iframe":i.iframeFix).each(function(){t("<div class='ui-draggable-iframeFix' style='background: #fff;'></div>").css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1e3}).css(t(this).offset()).appendTo("body")}),!0):!1)},_mouseStart:function(e){var i=this.options;return this.helper=this._createHelper(e),this.helper.addClass("ui-draggable-dragging"),this._cacheHelperProportions(),t.ui.ddmanager&&(t.ui.ddmanager.current=this),this._cacheMargins(),this.cssPosition=this.helper.css("position"),this.scrollParent=this.helper.scrollParent(),this.offsetParent=this.helper.offsetParent(),this.offsetParentCssPosition=this.offsetParent.css("position"),this.offset=this.positionAbs=this.element.offset(),this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left},this.offset.scroll=!1,t.extend(this.offset,{click:{left:e.pageX-this.offset.left,top:e.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()}),this.originalPosition=this.position=this._generatePosition(e),this.originalPageX=e.pageX,this.originalPageY=e.pageY,i.cursorAt&&this._adjustOffsetFromHelper(i.cursorAt),this._setContainment(),this._trigger("start",e)===!1?(this._clear(),!1):(this._cacheHelperProportions(),t.ui.ddmanager&&!i.dropBehaviour&&t.ui.ddmanager.prepareOffsets(this,e),this._mouseDrag(e,!0),t.ui.ddmanager&&t.ui.ddmanager.dragStart(this,e),!0)},_mouseDrag:function(e,i){if("fixed"===this.offsetParentCssPosition&&(this.offset.parent=this._getParentOffset()),this.position=this._generatePosition(e),this.positionAbs=this._convertPositionTo("absolute"),!i){var s=this._uiHash();if(this._trigger("drag",e,s)===!1)return this._mouseUp({}),!1;this.position=s.position}return this.options.axis&&"y"===this.options.axis||(this.helper[0].style.left=this.position.left+"px"),this.options.axis&&"x"===this.options.axis||(this.helper[0].style.top=this.position.top+"px"),t.ui.ddmanager&&t.ui.ddmanager.drag(this,e),!1},_mouseStop:function(e){var i=this,s=!1;return t.ui.ddmanager&&!this.options.dropBehaviour&&(s=t.ui.ddmanager.drop(this,e)),this.dropped&&(s=this.dropped,this.dropped=!1),"original"!==this.options.helper||t.contains(this.element[0].ownerDocument,this.element[0])?("invalid"===this.options.revert&&!s||"valid"===this.options.revert&&s||this.options.revert===!0||t.isFunction(this.options.revert)&&this.options.revert.call(this.element,s)?t(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){i._trigger("stop",e)!==!1&&i._clear()}):this._trigger("stop",e)!==!1&&this._clear(),!1):!1},_mouseUp:function(e){return t("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)}),t.ui.ddmanager&&t.ui.ddmanager.dragStop(this,e),t.ui.mouse.prototype._mouseUp.call(this,e)},cancel:function(){return this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear(),this},_getHandle:function(e){return this.options.handle?!!t(e.target).closest(this.element.find(this.options.handle)).length:!0},_createHelper:function(e){var i=this.options,s=t.isFunction(i.helper)?t(i.helper.apply(this.element[0],[e])):"clone"===i.helper?this.element.clone().removeAttr("id"):this.element;return s.parents("body").length||s.appendTo("parent"===i.appendTo?this.element[0].parentNode:i.appendTo),s[0]===this.element[0]||/(fixed|absolute)/.test(s.css("position"))||s.css("position","absolute"),s},_adjustOffsetFromHelper:function(e){"string"==typeof e&&(e=e.split(" ")),t.isArray(e)&&(e={left:+e[0],top:+e[1]||0}),"left"in e&&(this.offset.click.left=e.left+this.margins.left),"right"in e&&(this.offset.click.left=this.helperProportions.width-e.right+this.margins.left),"top"in e&&(this.offset.click.top=e.top+this.margins.top),"bottom"in e&&(this.offset.click.top=this.helperProportions.height-e.bottom+this.margins.top)},_getParentOffset:function(){var e=this.offsetParent.offset();return"absolute"===this.cssPosition&&this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])&&(e.left+=this.scrollParent.scrollLeft(),e.top+=this.scrollParent.scrollTop()),(this.offsetParent[0]===document.body||this.offsetParent[0].tagName&&"html"===this.offsetParent[0].tagName.toLowerCase()&&t.ui.ie)&&(e={top:0,left:0}),{top:e.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:e.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if("relative"===this.cssPosition){var t=this.element.position();return{top:t.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:t.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var e,i,s,n=this.options;return n.containment?"window"===n.containment?(this.containment=[t(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,t(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,t(window).scrollLeft()+t(window).width()-this.helperProportions.width-this.margins.left,t(window).scrollTop()+(t(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):"document"===n.containment?(this.containment=[0,0,t(document).width()-this.helperProportions.width-this.margins.left,(t(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top],undefined):n.containment.constructor===Array?(this.containment=n.containment,undefined):("parent"===n.containment&&(n.containment=this.helper[0].parentNode),i=t(n.containment),s=i[0],s&&(e="hidden"!==i.css("overflow"),this.containment=[(parseInt(i.css("borderLeftWidth"),10)||0)+(parseInt(i.css("paddingLeft"),10)||0),(parseInt(i.css("borderTopWidth"),10)||0)+(parseInt(i.css("paddingTop"),10)||0),(e?Math.max(s.scrollWidth,s.offsetWidth):s.offsetWidth)-(parseInt(i.css("borderRightWidth"),10)||0)-(parseInt(i.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(e?Math.max(s.scrollHeight,s.offsetHeight):s.offsetHeight)-(parseInt(i.css("borderBottomWidth"),10)||0)-(parseInt(i.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom],this.relative_container=i),undefined):(this.containment=null,undefined)},_convertPositionTo:function(e,i){i||(i=this.position);var s="absolute"===e?1:-1,n="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent;return this.offset.scroll||(this.offset.scroll={top:n.scrollTop(),left:n.scrollLeft()}),{top:i.top+this.offset.relative.top*s+this.offset.parent.top*s-("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top)*s,left:i.left+this.offset.relative.left*s+this.offset.parent.left*s-("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)*s}},_generatePosition:function(e){var i,s,n,a,o=this.options,r="absolute"!==this.cssPosition||this.scrollParent[0]!==document&&t.contains(this.scrollParent[0],this.offsetParent[0])?this.scrollParent:this.offsetParent,l=e.pageX,h=e.pageY;return this.offset.scroll||(this.offset.scroll={top:r.scrollTop(),left:r.scrollLeft()}),this.originalPosition&&(this.containment&&(this.relative_container?(s=this.relative_container.offset(),i=[this.containment[0]+s.left,this.containment[1]+s.top,this.containment[2]+s.left,this.containment[3]+s.top]):i=this.containment,e.pageX-this.offset.click.left<i[0]&&(l=i[0]+this.offset.click.left),e.pageY-this.offset.click.top<i[1]&&(h=i[1]+this.offset.click.top),e.pageX-this.offset.click.left>i[2]&&(l=i[2]+this.offset.click.left),e.pageY-this.offset.click.top>i[3]&&(h=i[3]+this.offset.click.top)),o.grid&&(n=o.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY,h=i?n-this.offset.click.top>=i[1]||n-this.offset.click.top>i[3]?n:n-this.offset.click.top>=i[1]?n-o.grid[1]:n+o.grid[1]:n,a=o.grid[0]?this.originalPageX+Math.round((l-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX,l=i?a-this.offset.click.left>=i[0]||a-this.offset.click.left>i[2]?a:a-this.offset.click.left>=i[0]?a-o.grid[0]:a+o.grid[0]:a)),{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+("fixed"===this.cssPosition?-this.scrollParent.scrollTop():this.offset.scroll.top),left:l-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+("fixed"===this.cssPosition?-this.scrollParent.scrollLeft():this.offset.scroll.left)}},_clear:function(){this.helper.removeClass("ui-draggable-dragging"),this.helper[0]===this.element[0]||this.cancelHelperRemoval||this.helper.remove(),this.helper=null,this.cancelHelperRemoval=!1},_trigger:function(e,i,s){return s=s||this._uiHash(),t.ui.plugin.call(this,e,[i,s]),"drag"===e&&(this.positionAbs=this._convertPositionTo("absolute")),t.Widget.prototype._trigger.call(this,e,i,s)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}}),t.ui.plugin.add("draggable","connectToSortable",{start:function(e,i){var s=t(this).data("ui-draggable"),n=s.options,a=t.extend({},i,{item:s.element});s.sortables=[],t(n.connectToSortable).each(function(){var i=t.data(this,"ui-sortable");i&&!i.options.disabled&&(s.sortables.push({instance:i,shouldRevert:i.options.revert}),i.refreshPositions(),i._trigger("activate",e,a))})},stop:function(e,i){var s=t(this).data("ui-draggable"),n=t.extend({},i,{item:s.element});t.each(s.sortables,function(){this.instance.isOver?(this.instance.isOver=0,s.cancelHelperRemoval=!0,this.instance.cancelHelperRemoval=!1,this.shouldRevert&&(this.instance.options.revert=this.shouldRevert),this.instance._mouseStop(e),this.instance.options.helper=this.instance.options._helper,"original"===s.options.helper&&this.instance.currentItem.css({top:"auto",left:"auto"})):(this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",e,n))})},drag:function(e,i){var s=t(this).data("ui-draggable"),n=this;t.each(s.sortables,function(){var a=!1,o=this;this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this.instance._intersectsWith(this.instance.containerCache)&&(a=!0,t.each(s.sortables,function(){return this.instance.positionAbs=s.positionAbs,this.instance.helperProportions=s.helperProportions,this.instance.offset.click=s.offset.click,this!==o&&this.instance._intersectsWith(this.instance.containerCache)&&t.contains(o.instance.element[0],this.instance.element[0])&&(a=!1),a})),a?(this.instance.isOver||(this.instance.isOver=1,this.instance.currentItem=t(n).clone().removeAttr("id").appendTo(this.instance.element).data("ui-sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return i.helper[0]},e.target=this.instance.currentItem[0],this.instance._mouseCapture(e,!0),this.instance._mouseStart(e,!0,!0),this.instance.offset.click.top=s.offset.click.top,this.instance.offset.click.left=s.offset.click.left,this.instance.offset.parent.left-=s.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=s.offset.parent.top-this.instance.offset.parent.top,s._trigger("toSortable",e),s.dropped=this.instance.element,s.currentItem=s.element,this.instance.fromOutside=s),this.instance.currentItem&&this.instance._mouseDrag(e)):this.instance.isOver&&(this.instance.isOver=0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",e,this.instance._uiHash(this.instance)),this.instance._mouseStop(e,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),s._trigger("fromSortable",e),s.dropped=!1)})}}),t.ui.plugin.add("draggable","cursor",{start:function(){var e=t("body"),i=t(this).data("ui-draggable").options;e.css("cursor")&&(i._cursor=e.css("cursor")),e.css("cursor",i.cursor)},stop:function(){var e=t(this).data("ui-draggable").options;e._cursor&&t("body").css("cursor",e._cursor)}}),t.ui.plugin.add("draggable","opacity",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("opacity")&&(n._opacity=s.css("opacity")),s.css("opacity",n.opacity)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._opacity&&t(i.helper).css("opacity",s._opacity)}}),t.ui.plugin.add("draggable","scroll",{start:function(){var e=t(this).data("ui-draggable");e.scrollParent[0]!==document&&"HTML"!==e.scrollParent[0].tagName&&(e.overflowOffset=e.scrollParent.offset())},drag:function(e){var i=t(this).data("ui-draggable"),s=i.options,n=!1;i.scrollParent[0]!==document&&"HTML"!==i.scrollParent[0].tagName?(s.axis&&"x"===s.axis||(i.overflowOffset.top+i.scrollParent[0].offsetHeight-e.pageY<s.scrollSensitivity?i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop+s.scrollSpeed:e.pageY-i.overflowOffset.top<s.scrollSensitivity&&(i.scrollParent[0].scrollTop=n=i.scrollParent[0].scrollTop-s.scrollSpeed)),s.axis&&"y"===s.axis||(i.overflowOffset.left+i.scrollParent[0].offsetWidth-e.pageX<s.scrollSensitivity?i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft+s.scrollSpeed:e.pageX-i.overflowOffset.left<s.scrollSensitivity&&(i.scrollParent[0].scrollLeft=n=i.scrollParent[0].scrollLeft-s.scrollSpeed))):(s.axis&&"x"===s.axis||(e.pageY-t(document).scrollTop()<s.scrollSensitivity?n=t(document).scrollTop(t(document).scrollTop()-s.scrollSpeed):t(window).height()-(e.pageY-t(document).scrollTop())<s.scrollSensitivity&&(n=t(document).scrollTop(t(document).scrollTop()+s.scrollSpeed))),s.axis&&"y"===s.axis||(e.pageX-t(document).scrollLeft()<s.scrollSensitivity?n=t(document).scrollLeft(t(document).scrollLeft()-s.scrollSpeed):t(window).width()-(e.pageX-t(document).scrollLeft())<s.scrollSensitivity&&(n=t(document).scrollLeft(t(document).scrollLeft()+s.scrollSpeed)))),n!==!1&&t.ui.ddmanager&&!s.dropBehaviour&&t.ui.ddmanager.prepareOffsets(i,e)}}),t.ui.plugin.add("draggable","snap",{start:function(){var e=t(this).data("ui-draggable"),i=e.options;e.snapElements=[],t(i.snap.constructor!==String?i.snap.items||":data(ui-draggable)":i.snap).each(function(){var i=t(this),s=i.offset();this!==e.element[0]&&e.snapElements.push({item:this,width:i.outerWidth(),height:i.outerHeight(),top:s.top,left:s.left})})},drag:function(e,i){var s,n,a,o,r,l,h,c,u,d,p=t(this).data("ui-draggable"),g=p.options,f=g.snapTolerance,m=i.offset.left,_=m+p.helperProportions.width,v=i.offset.top,b=v+p.helperProportions.height;for(u=p.snapElements.length-1;u>=0;u--)r=p.snapElements[u].left,l=r+p.snapElements[u].width,h=p.snapElements[u].top,c=h+p.snapElements[u].height,r-f>_||m>l+f||h-f>b||v>c+f||!t.contains(p.snapElements[u].item.ownerDocument,p.snapElements[u].item)?(p.snapElements[u].snapping&&p.options.snap.release&&p.options.snap.release.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=!1):("inner"!==g.snapMode&&(s=f>=Math.abs(h-b),n=f>=Math.abs(c-v),a=f>=Math.abs(r-_),o=f>=Math.abs(l-m),s&&(i.position.top=p._convertPositionTo("relative",{top:h-p.helperProportions.height,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r-p.helperProportions.width}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l}).left-p.margins.left)),d=s||n||a||o,"outer"!==g.snapMode&&(s=f>=Math.abs(h-v),n=f>=Math.abs(c-b),a=f>=Math.abs(r-m),o=f>=Math.abs(l-_),s&&(i.position.top=p._convertPositionTo("relative",{top:h,left:0}).top-p.margins.top),n&&(i.position.top=p._convertPositionTo("relative",{top:c-p.helperProportions.height,left:0}).top-p.margins.top),a&&(i.position.left=p._convertPositionTo("relative",{top:0,left:r}).left-p.margins.left),o&&(i.position.left=p._convertPositionTo("relative",{top:0,left:l-p.helperProportions.width}).left-p.margins.left)),!p.snapElements[u].snapping&&(s||n||a||o||d)&&p.options.snap.snap&&p.options.snap.snap.call(p.element,e,t.extend(p._uiHash(),{snapItem:p.snapElements[u].item})),p.snapElements[u].snapping=s||n||a||o||d)}}),t.ui.plugin.add("draggable","stack",{start:function(){var e,i=this.data("ui-draggable").options,s=t.makeArray(t(i.stack)).sort(function(e,i){return(parseInt(t(e).css("zIndex"),10)||0)-(parseInt(t(i).css("zIndex"),10)||0)});s.length&&(e=parseInt(t(s[0]).css("zIndex"),10)||0,t(s).each(function(i){t(this).css("zIndex",e+i)}),this.css("zIndex",e+s.length))}}),t.ui.plugin.add("draggable","zIndex",{start:function(e,i){var s=t(i.helper),n=t(this).data("ui-draggable").options;s.css("zIndex")&&(n._zIndex=s.css("zIndex")),s.css("zIndex",n.zIndex)},stop:function(e,i){var s=t(this).data("ui-draggable").options;s._zIndex&&t(i.helper).css("zIndex",s._zIndex)}})})(jQuery);

(function ($) {
    //对jquery的扩展
    $.parseTmpl = function parse(str, data) {
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' + 'with(obj||{}){__p.push(\'' + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/<%=([\s\S]+?)%>/g,function (match, code) {
            return "'," + code.replace(/\\'/g, "'") + ",'";
        }).replace(/<%([\s\S]+?)%>/g,function (match, code) {
                return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('";
            }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "');}return __p.join('');";
        var func = new Function('obj', tmpl);
        return data ? func(data) : func;
    };
    $.extend2 = function (t, s) {
        var a = arguments,
            notCover = $.type(a[a.length - 1]) == 'boolean' ? a[a.length - 1] : false,
            len = $.type(a[a.length - 1]) == 'boolean' ? a.length - 1 : a.length;
        for (var i = 1; i < len; i++) {
            var x = a[i];
            for (var k in x) {
                if (!notCover || !t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    };

    $.IE6 = !!window.ActiveXObject && parseFloat(navigator.userAgent.match(/msie (\d+)/i)[1]) == 6;

    //所有ui的基类
    var _eventHandler = [];
    var _widget = function () {
    };
    var _prefix = 'kmui';
    _widget.prototype = {
        on: function (ev, cb) {
            this.root().on(ev, $.proxy(cb, this));
            return this;
        },
        off: function (ev, cb) {
            this.root().off(ev, $.proxy(cb, this));
            return this;
        },
        trigger: function (ev, data) {
            return  this.root().trigger(ev, data) === false ? false : this;
        },
        root: function ($el) {
            return this._$el || (this._$el = $el);
        },
        destroy: function () {

        },
        data: function (key, val) {
            if (val !== undefined) {
                this.root().data(_prefix + key, val);
                return this;
            } else {
                return this.root().data(_prefix + key)
            }
        },
        register: function (eventName, $el, fn) {
            _eventHandler.push({
                'evtname': eventName,
                '$els': $.isArray($el) ? $el : [$el],
                handler: $.proxy(fn, $el)
            })
        }
    };

    //从jq实例上拿到绑定的widget实例
    $.fn.kmui = function (obj) {
        return obj ? this.data('kmuiwidget', obj) : this.data('kmuiwidget');
    };

    function _createClass(ClassObj, properties, supperClass) {
        ClassObj.prototype = $.extend2(
            $.extend({}, properties),
            (KM.ui[supperClass] || _widget).prototype,
            true
        );
        ClassObj.prototype.supper = (KM.ui[supperClass] || _widget).prototype;
        //父class的defaultOpt 合并
        if( KM.ui[supperClass] && KM.ui[supperClass].prototype.defaultOpt ) {

            var parentDefaultOptions = KM.ui[supperClass].prototype.defaultOpt,
                subDefaultOptions = ClassObj.prototype.defaultOpt;

            ClassObj.prototype.defaultOpt = $.extend( {}, parentDefaultOptions, subDefaultOptions || {} );

        }
        return ClassObj
    }

    var _guid = 1;

    function mergeToJQ(ClassObj, className) {
        $[_prefix + className] = ClassObj;
        $.fn[_prefix + className] = function (opt) {
            var result, args = Array.prototype.slice.call(arguments, 1);

            this.each(function (i, el) {
                var $this = $(el);
                var obj = $this.kmui();
                if (!obj) {
                    ClassObj(!opt || !$.isPlainObject(opt) ? {} : opt, $this);
                    $this.kmui(obj)
                }
                if ($.type(opt) == 'string') {
                    if (opt == 'this') {
                        result = obj;
                    } else {
                        result = obj[opt].apply(obj, args);
                        if (result !== obj && result !== undefined) {
                            return false;
                        }
                        result = null;
                    }

                }
            });

            return result !== null ? result : this;
        }
    }

    KM.ui = {
        define: function (className, properties, supperClass) {
            var ClassObj = KM.ui[className] = _createClass(function (options, $el) {
                    var _obj = function () {
                    };
                    $.extend(_obj.prototype, ClassObj.prototype, {
                            guid: className + _guid++,
                            widgetName: className
                        }
                    );
                    var obj = new _obj;
                    if ($.type(options) == 'string') {
                        obj.init && obj.init({});
                        obj.root().kmui(obj);
                        obj.root().find('a').click(function (evt) {
                            evt.preventDefault()
                        });
                        return obj.root()[_prefix + className].apply(obj.root(), arguments)
                    } else {
                        $el && obj.root($el);
                        obj.init && obj.init(utils.clonePlainObject(!options || $.isPlainObject(options) ? $.extend2(options || {}, obj.defaultOpt || {}, true) : options));
                        try{
                            obj.root().find('a').click(function (evt) {
                                evt.preventDefault()
                            });
                        }catch(e){
                        }

                        return obj.root().kmui(obj);
                    }

                },properties, supperClass);

            mergeToJQ(ClassObj, className);
        }
    };

    $(function () {
        $(document).on('click mouseup mousedown dblclick mouseover', function (evt) {
            $.each(_eventHandler, function (i, obj) {
                if (obj.evtname == evt.type) {
                    $.each(obj.$els, function (i, $el) {
                        if ($el[0] !== evt.target && !$.contains($el[0], evt.target)) {
                            obj.handler(evt);
                        }
                    })
                }
            })
        })
    })
})(jQuery);

//button 类
KM.ui.define('button', {
    tpl: '<<%if(!texttype){%>div class="kmui-btn kmui-btn-<%=icon%> <%if(name){%>kmui-btn-name-<%=name%><%}%>" unselectable="on" onmousedown="return false" <%}else{%>a class="kmui-text-btn"<%}%><% if(title) {%> data-original-title="<%=title%>" <%};%>> ' +
        '<% if(icon) {%><div unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><% }; %><%if(text) {%><span unselectable="on" onmousedown="return false" class="kmui-button-label"><%=text%></span><%}%>' +
        '<%if(caret && text){%><span class="kmui-button-spacing"></span><%}%>' +
        '<% if(caret) {%><span unselectable="on" onmousedown="return false" class="kmui-caret"></span><% };%></<%if(!texttype){%>div<%}else{%>a<%}%>>',
    defaultOpt: {
        text: '',
        title: '',
        icon: '',
        width: '',
        caret: false,
        texttype: false,
        click: function () {
        }
    },
    init: function (options) {
        var me = this;

        me.root($($.parseTmpl(me.tpl, options)))
            .click(function (evt) {
                me.wrapclick(options.click, evt)
            });

        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        })

        return me;
    },
    wrapclick: function (fn, evt) {
        if (!this.disabled()) {
            this.root().trigger('wrapclick');
            $.proxy(fn, this, evt)()
        }
        return this;
    },
    label: function (text) {
        if (text === undefined) {
            return this.root().find('.kmui-button-label').text();
        } else {
            this.root().find('.kmui-button-label').text(text);
            return this;
        }
    },
    disabled: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled', state);
        if(this.root().hasClass('kmui-disabled')){
            this.root().removeClass('kmui-hover')
        }
        return this;
    },
    active: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active', state)

        return this;
    },
    mergeWith: function ($obj) {
        var me = this;
        me.data('$mergeObj', $obj);
        $obj.kmui().data('$mergeObj', me.root());
        if (!$.contains(document.body, $obj[0])) {
            $obj.appendTo(me.root());
        }
        me.on('click',function () {
            me.wrapclick(function () {
                $obj.kmui().show();
            })
        }).register('click', me.root(), function (evt) {
                $obj.hide()
            });
    }
});

//toolbar 类
(function () {
    KM.ui.define('toolbar', {
        tpl: '<div class="kmui-toolbar"  ><div class="kmui-btn-toolbar" unselectable="on" onmousedown="return false"  ></div></div>'
          ,
        init: function () {
            var $root = this.root($(this.tpl));
            this.data('$btnToolbar', $root.find('.kmui-btn-toolbar'))
        },
        appendToBtnmenu : function(data){
            var $cont = this.data('$btnToolbar');
            data = $.isArray(data) ? data : [data];
            $.each(data,function(i,$item){
                $cont.append($item)
            })
        }
    });
})();


//menu 类
KM.ui.define('menu',{
    show : function($obj,dir,fnname,topOffset,leftOffset){
        fnname = fnname || 'position';
        if(this.trigger('beforeshow') === false){
            return;
        }else{

            this.root().css($.extend({display:'block'},$obj ? {
                top : $obj[fnname]().top + ( dir == 'right' ? 0 : $obj.outerHeight()) - (topOffset || 0),
                left : $obj[fnname]().left + (dir == 'right' ?  $obj.outerWidth() : 0) -  (leftOffset || 0)
            }:{}))
            this.trigger('aftershow');
        }
        $obj.addClass('active');
    },
    hide : function(all){
        var $parentmenu;
        if(this.trigger('beforehide') === false){
            return;
        } else {

            if($parentmenu = this.root().data('parentmenu')){
                if($parentmenu.data('parentmenu')|| all)
                    $parentmenu.kmui().hide();
            }
            this.root().css('display','none');
            this.trigger('afterhide');
        }
        var $obj = this.data('$mergeObj');
        if ($obj) $obj.removeClass('active');
    },
    attachTo : function($obj){
        var me = this;
        if(!$obj.data('$mergeObj')){
            $obj.data('$mergeObj',me.root());
            if($obj.kmui()){
                $obj.on('wrapclick',function(evt){
                    me.supper.show.call(me,$obj,'','offset',15)
                });
            }else{
                $obj.on('click',function(evt){
                    me.supper.show.call(me,$obj,'','offset',15)
                })
            }

            me.register('click',$obj,function(evt){
               me.hide()
            });
            me.data('$mergeObj',$obj)
        }
    }
});

//dropmenu 类
KM.ui.define( 'dropmenu', {
    tmpl: '<ul class="kmui-dropdown-menu" aria-labelledby="dropdownMenu" >' +
        '<%if(data && data.length){for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li id="<%= ci.id%>" <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>" data-label="<%= ci.label%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}}%>' +
        '<%}%>' +
        '</ul>',
    subTmpl: '<%if(data && data.length){for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>" data-label="<%= ci.label%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}}%>' +
        '<%}%>',
    defaultOpt: {
        data: [],
        anchor: 'top',
        click: function () {}
    },
    setData: function ( items ) {

        this.root().html( $.parseTmpl( this.subTmpl, items ) );

        return this;
    },
    position: function ( offset ) {
        this.root().css( {
            left: offset.x,
            top: offset.y
        } );
        return this;
    },
    show: function () {
        if ( this.trigger( 'beforeshow' ) === false ) {
            return;
        } else {
            this.root().css( {
                display: 'block'
            } );
            this.trigger( 'aftershow' );
        }
        return this;
    },
    init: function ( options ) {
        var me = this;
        var eventName = {
            click: 1,
            mouseover: 1,
            mouseout: 1
        };

        this.root( $( $.parseTmpl( this.tmpl, options ) ) ).on( 'click', 'li[class!="kmui-disabled kmui-divider kmui-dropdown-submenu"]', function ( evt ) {
            $.proxy( options.click, me, evt, $( this ).data( 'value' ), $( this ).data( 'label' ), $( this ) )();
        } ).find( 'li' ).each( function ( i, el ) {
            var $this = $( this );
            if ( !$this.hasClass( "kmui-disabled kmui-divider kmui-dropdown-submenu" ) ) {
                var data = options.data[ i ];
                $.each( eventName, function ( k ) {
                    if ( data[ k ] ) {
                        $this[ k ]( function ( evt ) {
                            $.proxy( data[ k ], el )( evt, data, me.root );
                        } );
                    }
                } );
            }
        } );

    },
    _initEvent: function () {
        this.root().on( 'mouseover', 'li[class="kmui-dropdown-submenu', function ( e ) {
            var $submenu = $( this ).data( 'widget' );
            $submenu.kmui().show( $( this ), 'right', 'position', 5, 2 );
        } );
    },
    disabled: function ( cb ) {
        $( 'li[class!=kmui-divider]', this.root() ).each( function () {
            var $el = $( this );
            if ( cb === true ) {
                $el.addClass( 'kmui-disabled' );
            } else if ( $.isFunction( cb ) ) {
                $el.toggleClass( 'kmui-disabled', cb( $el ) );
            } else {
                $el.removeClass( 'kmui-disabled' );
            }

        } );
    },
    val: function ( val ) {
        var currentVal;
        $( 'li[class!="kmui-divider kmui-disabled kmui-dropdown-submenu"]', this.root() ).each( function () {
            var $el = $( this );
            if ( val === undefined ) {
                if ( $el.find( 'em.kmui-dropmenu-checked' ).length ) {
                    currentVal = $el.data( 'value' );
                    return false;
                }
            } else {
                $el.find( 'em' ).toggleClass( 'kmui-dropmenu-checked', $el.data( 'value' ) == val );
            }
        } );
        if ( val === undefined ) {
            return currentVal;
        }
    },
    appendItem: function ( item ) {
        var itemTpl = '<%if(item.divider){%><li class="kmui-divider"></li><%}else{%>' +
            '<li id="<%= item.id%>" <%if(item.active||item.disabled){%>class="<%= item.active|| \'\' %> <%=item.disabled||\'\' %>" <%}%> data-value="<%= item.value%>" data-label="<%= item.label%>">' +
            '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= item.label%></a>' +
            '</li><%}%>';
        var html = $.parseTmpl( itemTpl, item );
        var $item = $( html ).click( item.click );
        this.root().append( $item );
        return $item;
    },
    addSubmenu: function ( label, menu, index ) {
        index = index || 0;

        var $list = $( 'li[class!=kmui-divider]', this.root() );
        var $node = $( '<li class="kmui-dropdown-submenu"><a tabindex="-1" href="#">' + label + '</a></li>' ).append( menu );
        $node.data( 'widget', menu );
        if ( index >= 0 && index < $list.length ) {
            $node.insertBefore( $list[ index ] );
        } else if ( index < 0 ) {
            $node.insertBefore( $list[ 0 ] );
        } else if ( index >= $list.length ) {
            $node.appendTo( $list );
        }
    }
}, 'menu' );

//splitbutton 类
///import button
KM.ui.define('splitbutton',{
    tpl :'<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
                '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
        '</div>',
    defaultOpt:{
        text:'',
        title:'',
        click:function(){}
    },
    init : function(options){
        var me = this;
        me.root( $($.parseTmpl(me.tpl,options)));
        me.root().find('.kmui-btn:first').click(function(evt){
            if(!me.disabled()){
                $.proxy(options.click,me)();
            }
        });
        me.root().find('.kmui-dropdown-toggle').click(function(){
            if(!me.disabled()){
                me.trigger('arrowclick')
            }
        });
        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        });

        return me;
    },
    wrapclick:function(fn,evt){
        if(!this.disabled()){
            $.proxy(fn,this,evt)()
        }
        return this;
    },
    disabled : function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled',state).find('.kmui-btn').toggleClass('kmui-disabled',state);
        return this;
    },
    active:function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active',state).find('.kmui-btn:first').toggleClass('kmui-active',state);
        return this;
    },
    mergeWith:function($obj){
        var me = this;
        me.data('$mergeObj',$obj);
        $obj.kmui().data('$mergeObj',me.root());
        if(!$.contains(document.body,$obj[0])){
            $obj.appendTo(me.root());
        }
        me.root().delegate('.kmui-dropdown-toggle','click',function(){
            me.wrapclick(function(){
                $obj.kmui().show();
            })
        });
        me.register('click',me.root().find('.kmui-dropdown-toggle'),function(evt){
            $obj.hide()
        });
    }
});

/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-7-10
 * Time: 下午3:07
 * To change this template use File | Settings | File Templates.
 */
KM.ui.define('colorsplitbutton',{

    tpl : '<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><div class="kmui-splitbutton-color-label" <%if (color) {%>style="background: <%=color%>"<%}%>></div><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
            '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
            '</div>',
    defaultOpt: {
        color: ''
    },
    init: function( options ){

        var me = this;

        me.supper.init.call( me, options );

    },
    colorLabel: function(){
        return this.root().find('.kmui-splitbutton-color-label');
    }

}, 'splitbutton');

//popup 类
KM.ui.define('popup', {
    tpl: '<div class="kmui-dropdown-menu kmui-popup"'+
        '<%if(!<%=stopprop%>){%>onmousedown="return false"<%}%>'+
        '><div class="kmui-popup-body" unselectable="on" onmousedown="return false"><%=subtpl%></div>' +
        '<div class="kmui-popup-caret"></div>' +
        '</div>',
    defaultOpt: {
        stopprop:false,
        subtpl: '',
        width: '',
        height: ''
    },
    init: function (options) {
        this.root($($.parseTmpl(this.tpl, options)));
        return this;
    },
    mergeTpl: function (data) {
        return $.parseTmpl(this.tpl, {subtpl: data});
    },
    show: function ($obj, posObj) {
        if (!posObj) posObj = {};

        var fnname = posObj.fnname || 'position';
        if (this.trigger('beforeshow') === false) {
            return;
        } else {
            this.root().css($.extend({display: 'block'}, $obj ? {
                top: $obj[fnname]().top + ( posObj.dir == 'right' ? 0 : $obj.outerHeight()) - (posObj.offsetTop || 0),
                left: $obj[fnname]().left + (posObj.dir == 'right' ? $obj.outerWidth() : 0) - (posObj.offsetLeft || 0),
                position: 'absolute'
            } : {}));

            this.root().find('.kmui-popup-caret').css({
                top: posObj.caretTop || 0,
                left: posObj.caretLeft || 0,
                position: 'absolute'
            }).addClass(posObj.caretDir || "up")

        }
        this.trigger("aftershow");
    },
    hide: function () {
        this.root().css('display', 'none');
        this.trigger('afterhide');
    },
    attachTo: function ($obj, posObj) {
        var me = this
        if (!$obj.data('$mergeObj')) {
            $obj.data('$mergeObj', me.root());
            $obj.on('wrapclick', function (evt) {
                me.show($obj, posObj)
            });
            me.register('click', $obj, function (evt) {
                me.hide()
            });
            me.data('$mergeObj', $obj)
        }
    },
    getBodyContainer: function () {
        return this.root().find(".kmui-popup-body");
    }
});

//scale 类
KM.ui.define('scale', {
    tpl: '<div class="kmui-scale" unselectable="on">' +
        '<span class="kmui-scale-hand0"></span>' +
        '<span class="kmui-scale-hand1"></span>' +
        '<span class="kmui-scale-hand2"></span>' +
        '<span class="kmui-scale-hand3"></span>' +
        '<span class="kmui-scale-hand4"></span>' +
        '<span class="kmui-scale-hand5"></span>' +
        '<span class="kmui-scale-hand6"></span>' +
        '<span class="kmui-scale-hand7"></span>' +
        '</div>',
    defaultOpt: {
        $doc: $(document),
        $wrap: $(document)
    },
    init: function (options) {
        if(options.$doc) this.defaultOpt.$doc = options.$doc;
        if(options.$wrap) this.defaultOpt.$wrap = options.$wrap;
        this.root($($.parseTmpl(this.tpl, options)));
        this.initStyle();
        this.startPos = this.prePos = {x: 0, y: 0};
        this.dragId = -1;
        return this;
    },
    initStyle: function () {
        utils.cssRule('kmui-style-scale', '.kmui-scale{display:none;position:absolute;border:1px solid #38B2CE;cursor:hand;}' +
            '.kmui-scale span{position:absolute;left:0;top:0;width:7px;height:7px;overflow:hidden;font-size:0px;display:block;background-color:#3C9DD0;}'
            + '.kmui-scale .kmui-scale-hand0{cursor:nw-resize;top:0;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand1{cursor:n-resize;top:0;margin-top:-4px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand2{cursor:ne-resize;top:0;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand3{cursor:w-resize;top:50%;margin-top:-4px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand4{cursor:e-resize;top:50%;margin-top:-4px;left:100%;margin-left:-3px;}'
            + '.kmui-scale .kmui-scale-hand5{cursor:sw-resize;top:100%;margin-top:-3px;left:0;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand6{cursor:s-resize;top:100%;margin-top:-3px;left:50%;margin-left:-4px;}'
            + '.kmui-scale .kmui-scale-hand7{cursor:se-resize;top:100%;margin-top:-3px;left:100%;margin-left:-3px;}');
    },
    _eventHandler: function (e) {
        var me = this,
            $doc = me.defaultOpt.$doc;
        switch (e.type) {
            case 'mousedown':
                var hand = e.target || e.srcElement, hand;
                if (hand.className.indexOf('kmui-scale-hand') != -1) {
                    me.dragId = hand.className.slice(-1);
                    me.startPos.x = me.prePos.x = e.clientX;
                    me.startPos.y = me.prePos.y = e.clientY;
                    $doc.bind('mousemove', $.proxy(me._eventHandler, me));
                }
                break;
            case 'mousemove':
                if (me.dragId != -1) {
                    me.updateContainerStyle(me.dragId, {x: e.clientX - me.prePos.x, y: e.clientY - me.prePos.y});
                    me.prePos.x = e.clientX;
                    me.prePos.y = e.clientY;
                    me.updateTargetElement();
                }
                break;
            case 'mouseup':
                if (me.dragId != -1) {
                    me.dragId = -1;
                    me.updateTargetElement();
                    var $target = me.data('$scaleTarget');
                    if ($target.parent()) me.attachTo(me.data('$scaleTarget'));
                }
                $doc.unbind('mousemove', $.proxy(me._eventHandler, me));
                break;
            default:
                break;
        }
    },
    updateTargetElement: function () {
        var me = this,
            $root = me.root(),
            $target = me.data('$scaleTarget');
        $target.css({width: $root.width(), height: $root.height()});
        me.attachTo($target);
    },
    updateContainerStyle: function (dir, offset) {
        var me = this,
            $dom = me.root(),
            tmp,
            rect = [
                //[left, top, width, height]
                [0, 0, -1, -1],
                [0, 0, 0, -1],
                [0, 0, 1, -1],
                [0, 0, -1, 0],
                [0, 0, 1, 0],
                [0, 0, -1, 1],
                [0, 0, 0, 1],
                [0, 0, 1, 1]
            ];

        if (rect[dir][0] != 0) {
            tmp = parseInt($dom.offset().left) + offset.x;
            $dom.css('left', me._validScaledProp('left', tmp));
        }
        if (rect[dir][1] != 0) {
            tmp = parseInt($dom.offset().top) + offset.y;
            $dom.css('top', me._validScaledProp('top', tmp));
        }
        if (rect[dir][2] != 0) {
            tmp = $dom.width() + rect[dir][2] * offset.x;
            $dom.css('width', me._validScaledProp('width', tmp));
        }
        if (rect[dir][3] != 0) {
            tmp = $dom.height() + rect[dir][3] * offset.y;
            $dom.css('height', me._validScaledProp('height', tmp));
        }
    },
    _validScaledProp: function (prop, value) {
        var $ele = this.root(),
            $wrap = this.defaultOpt.$doc,
            calc = function(val, a, b){
                return (val + a) > b ? b - a : value;
            };

        value = isNaN(value) ? 0 : value;
        switch (prop) {
            case 'left':
                return value < 0 ? 0 : calc(value, $ele.width(), $wrap.width());
            case 'top':
                return value < 0 ? 0 : calc(value, $ele.height(),$wrap.height());
            case 'width':
                return value <= 0 ? 1 : calc(value, $ele.offset().left, $wrap.width());
            case 'height':
                return value <= 0 ? 1 : calc(value, $ele.offset().top, $wrap.height());
        }
    },
    show: function ($obj) {
        var me = this;
        if ($obj) me.attachTo($obj);
        me.root().bind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.bind('mouseup', $.proxy(me._eventHandler, me));
        me.root().show();
        me.trigger("aftershow");
    },
    hide: function () {
        var me = this;
        me.root().unbind('mousedown', $.proxy(me._eventHandler, me));
        me.defaultOpt.$doc.unbind('mouseup', $.proxy(me._eventHandler, me));
        me.root().hide();
        me.trigger('afterhide')
    },
    attachTo: function ($obj) {
        var me = this,
            imgPos = $obj.offset(),
            $root = me.root(),
            $wrap = me.defaultOpt.$wrap,
            posObj = $wrap.offset();

        me.data('$scaleTarget', $obj);
        me.root().css({
            position: 'absolute',
            width: $obj.width(),
            height: $obj.height(),
            left: imgPos.left - posObj.left - parseInt($wrap.css('border-left-width')) - parseInt($root.css('border-left-width')),
            top: imgPos.top - posObj.top - parseInt($wrap.css('border-top-width')) - parseInt($root.css('border-top-width'))
        });
    },
    getScaleTarget: function () {
        return this.data('$scaleTarget')[0];
    }
});

//colorpicker 类
KM.ui.define('colorpicker', {
    tpl: function (opt) {
        var COLORS = (
            'ffffff,000000,eeece1,1f497d,4f81bd,c0504d,9bbb59,8064a2,4bacc6,f79646,' +
                'f2f2f2,7f7f7f,ddd9c3,c6d9f0,dbe5f1,f2dcdb,ebf1dd,e5e0ec,dbeef3,fdeada,' +
                'd8d8d8,595959,c4bd97,8db3e2,b8cce4,e5b9b7,d7e3bc,ccc1d9,b7dde8,fbd5b5,' +
                'bfbfbf,3f3f3f,938953,548dd4,95b3d7,d99694,c3d69b,b2a2c7,92cddc,fac08f,' +
                'a5a5a5,262626,494429,17365d,366092,953734,76923c,5f497a,31859b,e36c09,' +
                '7f7f7f,0c0c0c,1d1b10,0f243e,244061,632423,4f6128,3f3151,205867,974806,' +
                'c00000,ff0000,ffc000,ffff00,92d050,00b050,00b0f0,0070c0,002060,7030a0,').split(',');

        var html = '<div unselectable="on" onmousedown="return false" class="kmui-colorpicker<%if (name){%> kmui-colorpicker-<%=name%><%}%>" >' +
            '<table unselectable="on" onmousedown="return false">' +
            '<tr><td colspan="10">'+opt.lang_themeColor+'</td> </tr>' +
            '<tr class="kmui-colorpicker-firstrow" >';

        for (var i = 0; i < COLORS.length; i++) {
            if (i && i % 10 === 0) {
                html += '</tr>' + (i == 60 ? '<tr><td colspan="10">'+opt.lang_standardColor+'</td></tr>' : '') + '<tr' + (i == 60 ? ' class="kmui-colorpicker-firstrow"' : '') + '>';
            }
            html += i < 70 ? '<td><a unselectable="on" onmousedown="return false" title="' + COLORS[i] + '" class="kmui-colorpicker-colorcell"' +
                ' data-color="#' + COLORS[i] + '"' +
                ' style="background-color:#' + COLORS[i] + ';border:solid #ccc;' +
                (i < 10 || i >= 60 ? 'border-width:1px;' :
                    i >= 10 && i < 20 ? 'border-width:1px 1px 0 1px;' :
                        'border-width:0 1px 0 1px;') +
                '"' +
                '></a></td>' : '';
        }
        html += '</tr></table></div>';
        return html;
    },
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.supper.mergeTpl(me.tpl(options)),options)));

        me.root().on("click",function (e) {
            me.trigger('pickcolor',  $(e.target).data('color'));
        });
    }
}, 'popup');

/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-5-29
 * Time: 下午8:01
 * To change this template use File | Settings | File Templates.
 */

(function(){

    var widgetName = 'combobox',
        itemClassName = 'kmui-combobox-item',
        HOVER_CLASS = 'kmui-combobox-item-hover',
        ICON_CLASS = 'kmui-combobox-checked-icon',
        labelClassName = 'kmui-combobox-item-label';

    KM.ui.define( widgetName, ( function(){

        return {
            tpl: "<ul class=\"dropdown-menu kmui-combobox-menu<%if (comboboxName!=='') {%> kmui-combobox-<%=comboboxName%><%}%>\" unselectable=\"on\" onmousedown=\"return false\" role=\"menu\" aria-labelledby=\"dropdownMenu\">" +
                "<%if(autoRecord) {%>" +
                "<%for( var i=0, len = recordStack.length; i<len; i++ ) {%>" +
                "<%var index = recordStack[i];%>" +
                "<li class=\"<%=itemClassName%><%if( selected == index ) {%> kmui-combobox-checked<%}%><%if( disabled[ index ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=index%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ index ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=items[index]%></label>" +
                "</li>" +
                "<%}%>" +
                "<%if( i ) {%>" +
                "<li class=\"kmui-combobox-item-separator\"></li>" +
                "<%}%>" +
                "<%}%>" +
                "<%for( var i=0, label; label = items[i]; i++ ) {%>" +
                "<li class=\"<%=itemClassName%><%if( selected == i && enabledSelected ) {%> kmui-combobox-checked<%}%> kmui-combobox-item-<%=i%><%if( disabled[ i ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=i%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ i ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=label%></label>" +
                "</li>" +
                "<%}%>" +
                "</ul>",
            defaultOpt: {
                //记录栈初始列表
                recordStack: [],
                //可用项列表
                items: [],
		        //item对应的值列表
                value: [],
                comboboxName: '',
                selected: '',
                //初始禁用状态
                disabled: {},
                //自动记录
                autoRecord: true,
                //最多记录条数
                recordCount: 5,
                enabledRecord:true,
                enabledSelected:true
            },
            init: function( options ){

                var me = this;

                $.extend( me._optionAdaptation( options ), me._createItemMapping( options.recordStack, options.items ), {
                    itemClassName: itemClassName,
                    iconClass: ICON_CLASS,
                    labelClassName: labelClassName
                } );

                this._transStack( options );

                me.root( $( $.parseTmpl( me.tpl, options ) ) );

                this.data( 'options', options ).initEvent();

            },
            initEvent: function(){

                var me = this;

                me.initSelectItem();

                this.initItemActive();

            },
            setLabelWithDefaultValue : function(){
                var $btn = this.data('button');
                $btn.kmui().label($btn.data('original-title'))
            },
            /**
             * 初始化选择项
             */
            initSelectItem: function(){

                var me = this,
                    options = me.data( "options" ),
                    labelClass = "."+labelClassName;

                me.root().delegate('.' + itemClassName, 'click', function(){

                    var $li = $(this),
                        index = $li.attr('data-item-index');

                    if ( options.disabled[ index ] ) {
                        return false;
                    }

                    me.trigger('comboboxselect', {
                        index: index,
                        label: $li.find(labelClass).text(),
                        value: me.data('options').value[ index ]
                    }).select( index );

                    me.hide();
                    me.trigger('aftercomboboxselect');
                    return false;

                });

            },
            initItemActive: function(){
                var fn = {
                    mouseenter: 'addClass',
                    mouseleave: 'removeClass'
                };
                if ($.IE6) {
                    this.root().delegate( '.'+itemClassName,  'mouseenter mouseleave', function( evt ){
                        $(this)[ fn[ evt.type ] ]( HOVER_CLASS );
                    }).one('afterhide', function(){
                    });
                }
            },
            /**
             * 选择给定索引的项
             * @param index 项索引
             * @returns {*} 如果存在对应索引的项，则返回该项；否则返回null
             */
            select: function( index ){


                var options = this.data( 'options' ),
                    itemCount = options.itemCount,
                    items = options.autowidthitem;

                if ( items && !items.length ) {
                    items = options.items;
                }

                // 禁用
                if ( options.disabled[ index ] ) {
                    return null;
                }

                if( itemCount == 0 ) {
                    return null;
                }

                if( index < 0 ) {

                    index = itemCount + index % itemCount;

                } else if ( index >= itemCount ) {

                    index = itemCount-1;

                }

                this.trigger( 'changebefore', items[ index ] );


                this._update( index );

                this.trigger( 'changeafter', items[ index ] );

                return null;

            },
            selectItemByLabel: function( label ){

                var itemMapping = this.data('options').itemMapping,
                    me = this,
                    index = null;

                !$.isArray( label ) && ( label = [ label ] );

                $.each( label, function( i, item ){

                    index = itemMapping[ item ];

                    if( index !== undefined ) {

                        me.select( index );
                        return false;

                    }

                } );

            },
            selectItemByValue: function( value ){

                var values = this.data('options').value,
                    me = this,
                    i;

                for (i = 0; i < values.length; i++) {
                    if (values[i] == value) return me.select(i);
                }

                return false;

            },
            getItems: function () {
                return this.data( "options" ).items;
            },
            traverseItems:function(fn){
                var values = this.data('options').value;
                var labels = this.data('options').items;
                $.each(labels,function(i,label){
                    fn(label,values[i])
                });
                return this;
            },
            getItemMapping: function () {
                return this.data( "options" ).itemMapping;
            },

            disableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                options.disabled[ index ] = true;

                this._repaint();

            },

            disableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.disableItemByIndex( index );
                }

                return false;

            },

            enableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                delete options.disabled[ index ];

                this._repaint();

            },

            enableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.enableItemByIndex( index );
                }

                return false;

            },

            /**
             * 转换记录栈
             */
            _transStack: function( options ) {

                var temp = [],
                    itemIndex = -1,
                    selected = -1;

                $.each( options.recordStack, function( index, item ){

                    itemIndex = options.itemMapping[ item ];

                    if( $.isNumeric( itemIndex ) ) {

                        temp.push( itemIndex );

                        //selected的合法性检测
                        if( item == options.selected ) {
                            selected = itemIndex;
                        }

                    }

                } );

                options.recordStack = temp;
                options.selected = selected;
                temp = null;

            },
            _optionAdaptation: function( options ) {

                if( !( 'itemStyles' in options ) ) {

                    options.itemStyles = [];

                    for( var i = 0, len = options.items.length; i < len; i++ ) {
                        options.itemStyles.push('');
                    }

                }

                options.autowidthitem = options.autowidthitem || options.items;
                options.itemCount = options.items.length;

                return options;

            },
            _createItemMapping: function( stackItem, items ){

                var temp = {},
                    result = {
                        recordStack: [],
                        mapping: {}
                    };

                $.each( items, function( index, item ){
                    temp[ item ] = index;
                } );

                result.itemMapping = temp;

                $.each( stackItem, function( index, item ){

                    if( temp[ item ] !== undefined ) {
                        result.recordStack.push( temp[ item ] );
                        result.mapping[ item ] = temp[ item ];
                    }

                } );

                return result;

            },
            _update: function ( index ) {

                var options = this.data("options"),
                    newStack = [];

                if(this.data('options').enabledRecord){
                    $.each( options.recordStack, function( i, item ){

                        if( item != index ) {
                            newStack.push( item );
                        }

                    } );

                    //压入最新的记录
                    newStack.unshift( index );

                    if( newStack.length > options.recordCount ) {
                        newStack.length = options.recordCount;
                    }

                    options.recordStack = newStack;
                }

                options.selected = index;

                this._repaint();

                newStack = null;

            },

            _repaint: function () {

                var newChilds = $( $.parseTmpl( this.tpl, this.data("options") ) );

                //重新渲染
                this.root().html( newChilds.html() );

                newChilds = null;

            }
        };

    } )(), 'menu' );

})();


/**
 * Combox 抽象基类
 * User: hn
 * Date: 13-5-29
 * Time: 下午8:01
 * To change this template use File | Settings | File Templates.
 */

(function(){

    var widgetName = 'buttoncombobox';

    KM.ui.define( widgetName, ( function(){

        return {
            defaultOpt: {
                //按钮初始文字
                label: '',
                title: ''
            },
            init: function( options ) {

                var me = this;

                var btnWidget = $.kmuibutton({
                    caret: true,
                    name: options.comboboxName,
                    title: options.title,
                    text: options.label,
                    click: function(){
                        me.show( this.root() );
                    }
                });

                me.supper.init.call( me, options );

                //监听change， 改变button显示内容
                me.on('changebefore', function( e, label ){
                    btnWidget.kmuibutton('label', label );
                });

                me.data( 'button', btnWidget );

                me.attachTo(btnWidget)

            },
            button: function(){
                return this.data( 'button' );
            }
        }

    } )(), 'combobox' );

})();


/*modal 类*/
KM.ui.define( 'modal', {
    tpl: '<div class="kmui-modal" tabindex="-1" >' +
        '<div class="kmui-modal-header">' +
        '<div class="kmui-close" data-hide="modal"></div>' +
        '<h3 class="kmui-title"><%=title%></h3>' +
        '</div>' +
        '<div class="kmui-modal-body"  style="<%if(width){%>width:<%=width%>px;<%}%>' +
        '<%if(height){%>height:<%=height%>px;<%}%>">' +
        ' </div>' +
        '<% if(cancellabel || oklabel) {%>' +
        '<div class="kmui-modal-footer">' +
        '<div class="kmui-modal-tip"></div>' +
        '<%if(oklabel){%><div class="kmui-btn kmui-btn-primary" data-ok="modal"><%=oklabel%></div><%}%>' +
        '<%if(cancellabel){%><div class="kmui-btn" data-hide="modal"><%=cancellabel%></div><%}%>' +
        '</div>' +
        '<%}%></div>',
    defaultOpt: {
        title: "",
        cancellabel: "",
        oklabel: "",
        width: '',
        height: '',
        backdrop: true,
        keyboard: true
    },
    init: function ( options ) {
        var me = this;

        me.root( $( $.parseTmpl( me.tpl, options || {} ) ) );

        me.data( "options", options );
        if ( options.okFn ) {
            me.on( 'ok', $.proxy( options.okFn, me ) )
        }
        if ( options.cancelFn ) {
            me.on( 'beforehide', $.proxy( options.cancelFn, me ) )
        }

        me.root().delegate( '[data-hide="modal"]', 'click', $.proxy( me.hide, me ) )
            .delegate( '[data-ok="modal"]', 'click', $.proxy( me.ok, me ) );

        $( '[data-hide="modal"],[data-ok="modal"]', me.root() ).hover( function () {
            $( this ).toggleClass( 'kmui-hover' )
        } );

        setTimeout( function () {
            $( '.kmui-modal' ).draggable( {
                handle: '.kmui-modal-header'
            } );
        }, 100 );
    },
    toggle: function () {
        var me = this;
        return me[ !me.data( "isShown" ) ? 'show' : 'hide' ]();
    },
    show: function () {
        var me = this;

        me.trigger( "beforeshow" );

        if ( me.data( "isShown" ) ) return;

        me.data( "isShown", true );

        me.escape();

        me.backdrop( function () {
            me.autoCenter();
            me.root()
                .show()
                .focus()
                .trigger( 'aftershow' );
        } );

        $( '.kmui-modal' ).draggable( {
            handle: '.kmui-modal-header'
        } );
    },
    showTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).html( text ).fadeIn();
    },
    hideTip: function ( text ) {
        $( '.kmui-modal-tip', this.root() ).fadeOut( function () {
            $( this ).html( '' );
        } );
    },
    autoCenter: function () {
        //ie6下不用处理了
        !$.IE6 && this.root().css( "margin-left", -( this.root().width() / 2 ) );
    },
    hide: function () {
        var me = this;

        me.trigger( "beforehide" );

        if ( !me.data( "isShown" ) ) return;

        me.data( "isShown", false );

        me.escape();

        me.hideModal();
    },
    escape: function () {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).keyboard ) {
            me.root().on( 'keyup', function ( e ) {
                e.which == 27 && me.hide();
            } )
        } else if ( !me.data( "isShown" ) ) {
            me.root().off( 'keyup' );
        }
    },
    hideModal: function () {
        var me = this;
        me.root().hide();
        me.backdrop( function () {
            me.removeBackdrop();
            me.trigger( 'afterhide' );
        } )
    },
    removeBackdrop: function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    },
    backdrop: function ( callback ) {
        var me = this;
        if ( me.data( "isShown" ) && me.data( "options" ).backdrop ) {
            me.$backdrop = $( '<div class="kmui-modal-backdrop" />' ).click(
                me.data( "options" ).backdrop == 'static' ?
                $.proxy( me.root()[ 0 ].focus, me.root()[ 0 ] ) : $.proxy( me.hide, me )
            )
        }
        me.trigger( 'afterbackdrop' );
        callback && callback();

    },
    attachTo: function ( $obj ) {
        var me = this
        if ( !$obj.data( '$mergeObj' ) ) {

            $obj.data( '$mergeObj', me.root() );
            $obj.on( 'wrapclick', function () {
                me.toggle( $obj )
            } );
            me.data( '$mergeObj', $obj )
        }
    },
    ok: function () {
        var me = this;
        me.trigger( 'beforeok' );
        if ( me.trigger( "ok", me ) === false ) {
            return;
        }
        me.hide();
    },
    getBodyContainer: function () {
        return this.root().find( '.kmui-modal-body' )
    }
} );

/*tooltip 类*/
KM.ui.define('tooltip', {
    tpl: '<div class="kmui-tooltip" unselectable="on" onmousedown="return false"><div class="kmui-tooltip-arrow" unselectable="on" onmousedown="return false"></div><div class="kmui-tooltip-inner" unselectable="on" onmousedown="return false"></div></div>',
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.tpl, options || {})));
    },
    content: function (e) {
        var me = this,
            title = $(e.currentTarget).attr("data-original-title");

        me.root().find('.kmui-tooltip-inner')['text'](title);
    },
    position: function (e) {
        var me = this,
            $obj = $(e.currentTarget);

        me.root().css($.extend({display: 'block'}, $obj ? {
            top: $obj.outerHeight(),
            left: (($obj.outerWidth() - me.root().outerWidth()) / 2)
        } : {}))
    },
    show: function (e) {
        if ($(e.currentTarget).hasClass('kmui-disabled')) return;

        var me = this;
        me.content(e);
        me.root().appendTo($(e.currentTarget));
        me.position(e);
        me.root().css('display', 'block');
    },
    hide: function () {
        var me = this;
        me.root().css('display', 'none')
    },
    attachTo: function ($obj) {
        var me = this;

        function tmp($obj) {
            var me = this;

            if (!$.contains(document.body, me.root()[0])) {
                me.root().appendTo($obj);
            }

            me.data('tooltip', me.root());

            $obj.each(function () {
                if ($(this).attr("data-original-title")) {
                    $(this).on('mouseenter', $.proxy(me.show, me))
                        .on('mouseleave click', $.proxy(me.hide, me))

                }
            });

        }

        if ($.type($obj) === "undefined") {
            $("[data-original-title]").each(function (i, el) {
                tmp.call(me, $(el));
            })

        } else {
            if (!$obj.data('tooltip')) {
                tmp.call(me, $obj);
            }
        }
    }
});


/*tab 类*/
KM.ui.define('tab', {
    init: function (options) {
        var me = this,
            slr = options.selector;

        if ($.type(slr)) {
            me.root($(slr, options.context));
            me.data("context", options.context);

            $(slr, me.data("context")).on('click', function (e) {
                me.show(e);
            });
        }
    },
    show: function (e) {

        var me = this,
            $cur = $(e.target),
            $ul = $cur.closest('ul'),
            selector,
            previous,
            $target,
            e;

        selector = $cur.attr('data-context');
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');

        var $tmp = $cur.parent('li');

        if (!$tmp.length || $tmp.hasClass('kmui-active')) return;

        previous = $ul.find('.kmui-active:last a')[0];

        e = $.Event('beforeshow', {
            target: $cur[0],
            relatedTarget: previous
        });

        me.trigger(e);

        if (e.isDefaultPrevented()) return;

        $target = $(selector, me.data("context"));

        me.activate($cur.parent('li'), $ul);
        me.activate($target, $target.parent(), function () {
            me.trigger({
                type: 'aftershow', relatedTarget: previous
            })
        });
    },
    activate: function (element, container, callback) {
        if (element === undefined) {
            return $(".kmui-tab-item.kmui-active",this.root()).index();
        }

        var $active = container.find('> .kmui-active');

        $active.removeClass('kmui-active');

        element.addClass('kmui-active');

        callback && callback();
    }
});



//button 类
KM.ui.define('separator', {
    tpl: '<div class="kmui-separator" unselectable="on" onmousedown="return false" ></div>',
    init: function (options) {
        var me = this;
        me.root($($.parseTmpl(me.tpl, options)));
        return me;
    }
});

/**
 * 宽度自适应工具函数
 * @param word 单词内容
 * @param hasSuffix 是否含有后缀
 */
$.wordCountAdaptive  = function( word, hasSuffix ) {

    var $tmpNode = $('<span>' ).html( word ).css( {
            display: 'inline',
            position: 'absolute',
            top: -10000000,
            left: -100000
        } ).appendTo( document.body),
        width = $tmpNode.width();

    $tmpNode.remove();
    $tmpNode = null;

    if( width < 50 ) {

        return word;

    } else {

        word = word.slice( 0, hasSuffix ? -4 : -1 );

        if( !word.length ) {
            return '...';
        }

        return $.wordCountAdaptive( word + '...', true );

    }
};

utils.extend(KityMinder, function() {
    var _kityminderUI = {},
        _kityminderToolbarUI = {},
        _activeWidget = null,
        _widgetData = {},
        _widgetCallBack = {};
    return {
        registerUI: function(uiname, fn) {
            utils.each(uiname.split(/\s+/), function(i, name) {
                _kityminderUI[name] = fn;
            });
        },
        registerToolbarUI: function(uiname, fn) {
            utils.each(uiname.split(/\s+/), function(i, name) {
                _kityminderToolbarUI[name] = fn;
            });
        },
        loadUI: function(km) {
            utils.each(_kityminderUI, function(i, fn) {
                fn.call(km);
            });
        },
        _createUI: function(id) {
            var $cont = $('<div class="kmui-container"></div>'),
                $toolbar = $.kmuitoolbar(),
                $kmbody = $('<div class="kmui-editor-body"></div>'),
                $statusbar = $('<div class="kmui-statusbar"></div>');

            $cont.append($toolbar).append($kmbody).append($statusbar);
            $(utils.isString(id) ? '#' + id : id).append($cont);

            return {
                '$container': $cont,
                '$toolbar': $toolbar,
                '$body': $kmbody,
                '$statusbar': $statusbar
            };
        },
        _createToolbar: function($toolbar, km) {
            var toolbars = km.getOptions('toolbars');
            if (toolbars && toolbars.length) {
                var btns = [];
                $.each(toolbars, function(i, uiNames) {
                    $.each(uiNames.split(/\s+/), function(index, name) {
                        if (name == '|') {
                            if ($.kmuiseparator) btns.push($.kmuiseparator());
                        } else {
                            if (_kityminderToolbarUI[name]) {
                                var ui = _kityminderToolbarUI[name].call(km, name);
                                if (ui) btns.push(ui);
                            }

                        }

                    });
                    if (btns.length) $toolbar.kmui().appendToBtnmenu(btns);
                });
                $toolbar.append($('<div class="kmui-dialog-container"></div>'));
            } else {
                $toolbar.hide();
            }

        },
        _createStatusbar: function($statusbar, km) {

        },
        getKityMinder: function(id, options) {

            var containers = this._createUI(id);
            var km = this.getMinder(containers.$body.get(0), options);
            this._createToolbar(containers.$toolbar, km);
            this._createStatusbar(containers.$statusbar, km);
            km.$container = containers.$container;

            this.loadUI(km);
            return km.fire('interactchange');
        },
        registerWidget: function(name, pro, cb) {
            _widgetData[name] = $.extend2(pro, {
                $root: '',
                _preventDefault: false,
                root: function($el) {
                    return this.$root || (this.$root = $el);
                },
                preventDefault: function() {
                    this._preventDefault = true;
                },
                clear: false
            });
            if (cb) {
                _widgetCallBack[name] = cb;
            }
        },
        getWidgetData: function(name) {
            return _widgetData[name];
        },
        setWidgetBody: function(name, $widget, km) {
            if (!km._widgetData) {

                utils.extend(km, {
                    _widgetData: {},
                    getWidgetData: function(name) {
                        return this._widgetData[name];
                    },
                    getWidgetCallback: function(widgetName) {
                        var me = this;
                        return function() {
                            return _widgetCallBack[widgetName].apply(me, [me, $widget].concat(utils.argsToArray(arguments, 0)));
                        };
                    }
                });

            }
            var pro = _widgetData[name];
            if (!pro) {
                return null;
            }
            pro = km._widgetData[name];
            if (!pro) {
                pro = _widgetData[name];
                pro = km._widgetData[name] = $.type(pro) == 'function' ? pro : utils.clone(pro);
            }

            pro.root($widget.kmui().getBodyContainer());

            //清除光标
            km.fire('selectionclear');
            pro.initContent(km, $widget);

            //在dialog上阻止键盘冒泡，导致跟编辑输入冲突的问题
            $widget.on('keydown keyup keypress', function(e) {
                e.stopPropagation();
            });
            if (!pro._preventDefault) {
                pro.initEvent(km, $widget);
            }

            if (pro.width) $widget.width(pro.width);
        },
        setActiveWidget: function($widget) {
            _activeWidget = $widget;
        }
    };
}());

KM.registerToolbarUI( 'bold italic redo undo unhyperlink removeimage expandnode collapsenode hand zoom-in zoom-out',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function () {
                me.execCommand( name );
            },
            title: this.getLang( 'tooltips' )[ name ] || ''
        } );
        this.on( 'interactchange', function () {
            var state = this.queryCommandState( name );
            $btn.kmui().disabled( state == -1 ).active( state == 1 );
        } );
        return $btn;
    }
);

KM.registerToolbarUI('fontfamily fontsize', function (name) {

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions(name) || [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;

    if (options.items.length == 0) {
        return null;
    }
    switch (name) {



    case 'fontfamily':
        options = transForFontfamily(options);
        break;

    case 'fontsize':
        options = transForFontsize(options);
        break;

    }

    //实例化
    $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
    comboboxWidget = $combox.kmui();

    comboboxWidget.on('comboboxselect', function (evt, res) {
        me.execCommand(name, res.value);
    }).on("beforeshow", function () {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
    });


    //状态反射
    this.on('interactchange', function () {
        var state = this.queryCommandState(name),
            value = this.queryCommandValue(name);
        //设置按钮状态
        comboboxWidget.button().kmui().disabled(state == -1).active(state == 1);

        if (value) {
            //设置label
            value = value.replace(/['"]/g, '').toLowerCase().split(/['|"]?\s*,\s*[\1]?/);
            comboboxWidget.selectItemByLabel(value);
        }
    });

    return comboboxWidget.button().addClass('kmui-combobox');

    //字体参数转换
    function transForFontfamily(options) {

        var temp = null,
            tempItems = [];

        for (var i = 0, len = options.items.length; i < len; i++) {

            temp = options.items[i].val;
            tempItems.push(temp.split(/\s*,\s*/)[0]);
            options.itemStyles.push('font-family: ' + temp);
            options.value.push(temp);
            options.autowidthitem.push($.wordCountAdaptive(tempItems[i]));

        }

        options.items = tempItems;

        return options;

    }

    //字体大小参数转换
    function transForFontsize(options) {

        var temp = null,
            tempItems = [];

        options.itemStyles = [];
        options.value = [];

        for (var i = 0, len = options.items.length; i < len; i++) {

            temp = options.items[i];
            tempItems.push(temp);
            options.itemStyles.push('font-size: ' + temp + 'px; height:' + (temp + 2) + 'px; line-height: ' + (temp + 2) + 'px');
        }

        options.value = options.items;
        options.items = tempItems;
        options.autoRecord = false;

        return options;

    }

});

KM.registerToolbarUI('forecolor', function (name) {
    function getCurrentColor() {
        return $colorLabel.css('background-color');
    }

    var me = this,
        $colorPickerWidget = null,
        $colorLabel = null,
        $btn = null;

    this.on('interactchange', function () {
        var state = this.queryCommandState(name);
        $btn.kmui().disabled(state == -1).active(state == 1);
    });

    $btn = $.kmuicolorsplitbutton({
        icon: name,
        caret: true,
        name: name,
        title: this.getLang('tooltips')[name] || '',
        click: function () {
            var color = kity.Color.parse(getCurrentColor()).toHEX();
            if (color != '#000000') {
                me.execCommand(name, color);
            }
        }
    });

    $colorLabel = $btn.kmui().colorLabel();

    $colorPickerWidget = $.kmuicolorpicker({
        name: name,
        lang_clearColor: me.getLang('popupcolor')['clearColor'] || '',
        lang_themeColor: me.getLang('popupcolor')['themeColor'] || '',
        lang_standardColor: me.getLang('popupcolor')['standardColor'] || ''
    }).on('pickcolor', function (evt, color) {
        window.setTimeout(function () {
            $colorLabel.css("backgroundColor", color);
            me.execCommand(name, color);
        }, 0);
    }).on('show', function () {
        KM.setActiveWidget($colorPickerWidget.kmui().root());
    }).css('zIndex', me.getOptions('zIndex') + 1);

    $btn.kmui().on('arrowclick', function () {
        if (!$colorPickerWidget.parent().length) {
            me.$container.find('.kmui-dialog-container').append($colorPickerWidget);
        }
        $colorPickerWidget.kmui().show($btn, {
            caretDir: "down",
            offsetTop: -5,
            offsetLeft: 8,
            caretLeft: 11,
            caretTop: -8
        });
    }).register('click', $btn, function () {
        $colorPickerWidget.kmui().hide()
    });

    return $btn;

});

(function() {

    function doDownload(url, filename, type) {
        var content = url.split(',')[1];
        var $form = $('<form></form>').attr({
            'action': 'download.php',
            'method': 'POST',
            'accept-charset': 'utf-8'
        });

        var $content = $('<input />').attr({
            name: 'content',
            type: 'hidden',
            value: decodeURIComponent(content)
        }).appendTo($form);

        var $type = $('<input />').attr({
            name: 'type',
            type: 'hidden',
            value: type
        }).appendTo($form);

        var $filename = $('<input />').attr({
            name: 'filename',
            type: 'hidden',
            value: filename
        }).appendTo($form);

        $('<input name="iehack" value="&#9760;" />').appendTo($form);

        $form.appendTo('body').submit().remove();
    }

    function buildDataUrl(mineType, data) {
        return 'data:' + mineType + '; utf-8,' + encodeURIComponent(data);
    }

    function doExport(minder, type) {
        var data = minder.exportData(type);
        var protocal = KityMinder.findProtocal(type);
        var filename = minder.getMinderTitle() + protocal.fileExtension;
        var mineType = protocal.mineType || 'text/plain';

        if (typeof(data) == 'string') {

            doDownload(buildDataUrl(mineType, data), filename, 'text');

        } else if (data && data.then) {

            data.then(function(url) {
                doDownload(url, filename, 'base64');
            });

        }
    }

    kity.extendClass(Minder, {
        exportFile: function(type) {
            doExport(this, type);
            return this;
        }
    });

    KM.registerToolbarUI('saveto', function(name) {

        var me = this,
            label = me.getLang('tooltips.' + name),
            options = {
                label: label,
                title: label,
                comboboxName: name,
                items: [],
                itemStyles: [],
                value: [],
                autowidthitem: [],
                enabledRecord: false,
                enabledSelected: false
            },
            $combox = null,
            comboboxWidget = null;

        utils.each(KityMinder.getAllRegisteredProtocals(), function(k) {
            var p = KityMinder.findProtocal(k);
            if (p.encode) {
                var text = p.fileDescription + '（' + p.fileExtension + '）';
                options.value.push(k);
                options.items.push(text);
                options.autowidthitem.push($.wordCountAdaptive(text), true);
            }
        });


        //实例化
        $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
        comboboxWidget = $combox.kmui();

        comboboxWidget.on('comboboxselect', function(evt, res) {
            doExport(me, res.value);
        }).on('beforeshow', function() {
            if ($combox.parent().length === 0) {
                $combox.appendTo(me.$container.find('.kmui-dialog-container'));
            }
        }).on('aftercomboboxselect', function() {
            this.setLabelWithDefaultValue();
        });

        return comboboxWidget.button().addClass('kmui-combobox');

    });

})();

KM.registerUI( 'tooltips',
    function ( name ) {
        var km = this;
        //添加tooltip;
        if($.kmuitooltip){

            $("[data-original-title]",km.$container).each(function(i,n){
                var tooltips = km.getLang('tooltips');
                var tooltip = $(n).data('original-title');
                utils.each(tooltips,function(v,k){

                    if(k == tooltip && km.getShortcutKey(v)){
                        $(n).attr('data-original-title',tooltip + ' (' + km.getShortcutKey(v).toUpperCase() + ')');

                    }
                })
            });
            $.kmuitooltip('attachTo', $("[data-original-title]",km.$container)).css('z-index',km.getOptions('zIndex')+1);
        }
        km.$container.find('a').click(function(evt){
            evt.preventDefault()
        });
    }
);

KM.registerToolbarUI('template theme', function(name) {

    var values = utils.keys(name == 'template' ? KM.getTemplateList() : KM.getThemeList());

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: values.map(function(value) {
                return me.getLang(name)[value];
            }),
            itemStyles: [],
            value: values,
            autowidthitem: [],
            enabledRecord: false
        },
        $combox = null;

    //实例化
    $combox = $.kmuibuttoncombobox(options).css('zIndex', me.getOptions('zIndex') + 1);
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on('comboboxselect', function(evt, res) {
        me.execCommand(name, res.value);
    }).on('beforeshow', function() {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
    });
    var lastState, lastValue;
    //状态反射
    me.on('interactchange', function() {
        var state = this.queryCommandState(name),
            value = this.queryCommandValue(name);
        //设置按钮状态

        if (lastState != state)
            comboboxWidget.button().kmui().disabled(state == -1).active(state == 1);

        if (value && value != lastValue) {
            // 此处貌似性能很差，加入缓存
            comboboxWidget.selectItemByValue(value);
        }

        lastState = state;
        lastValue = value;

    });

    return comboboxWidget.button().addClass('kmui-combobox');
});

KM.registerToolbarUI('node', function(name) {
    var shortcutKeys = {
        'appendsiblingnode': 'Enter',
        'appendchildnode': 'Tab',
        'removenode': 'Del',
        'editnode': 'F2'
    };

    var me = this,
        msg = me.getLang('node'),
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: {
                'appendsiblingnode': 'appendsiblingnode',
                'appendchildnode': 'appendchildnode',
                'editnode': 'editnode',
                'removenode': 'removenode'
            },
            itemStyles: [],
            value: [],
            autowidthitem: [],
            enabledRecord: false,
            enabledSelected: false
        },
        $combox = null;

    if (options.items.length === 0) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox(transForInserttopic(options)).css('zIndex', me.getOptions('zIndex') + 1);
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on('comboboxselect', function(evt, res) {
        me.execCommand(res.value, me.getLang().topic);
    }).on('beforeshow', function() {
        if ($combox.parent().length === 0) {
            $combox.appendTo(me.$container.find('.kmui-dialog-container'));
        }
        var combox = $combox.kmui();

        combox.traverseItems(function(label, value) {
            if (me.queryCommandState(value) == -1) {
                combox.disableItemByLabel(label);
            } else {
                combox.enableItemByLabel(label);
            }
        });
    });
    //状态反射
    me.on('interactchange', function() {
        var state = 0;
        utils.each(shortcutKeys, function(k) {
            state = me.queryCommandState(k);
            if (state != -1) {
                return false;
            }
        });
        //设置按钮状态
        comboboxWidget.button().kmui().disabled(state == -1).active(state == 1);

    });
    //comboboxWidget.button().kmui().disabled(-1);
    return comboboxWidget.button().addClass('kmui-combobox');

    function transForInserttopic(options) {

        var tempItems = [];

        utils.each(options.items, function(k, v) {
            options.value.push(v);

            tempItems.push((msg[k] || k) + ' (' + shortcutKeys[v] + ')');
            options.autowidthitem.push($.wordCountAdaptive(tempItems[tempItems.length - 1]));
        });

        options.items = tempItems;
        return options;

    }

});

KM.registerUI( 'contextmenu', function () {
    var me = this;

    function getItemByLabel(label){
        var result;
        utils.each(me.getContextmenu(),function(i,item){
            if(item.label == label){
                result = item;
                return false;
            }
        });
        return result;
    }
    var $menu = $.kmuidropmenu({
        click:function(e,v,l){

            var item = getItemByLabel(l);

            if(item.exec){

                item.exec.apply(km)
            }else{
                me.execCommand(item.cmdName);
            }

            this.hide();
        }
    });
    me.$container.append($menu);
    me.on('contextmenu', function(e) {
        e.preventDefault();
    });
    me.on('mouseup', function (e) {
        //e.preventDefault();
        
        if (me.getStatus() == 'hand' || !e.isRightMB()) return;

        var node = e.getTargetNode();
        if(node){
            this.removeAllSelectedNodes();
            this.select(node);
        }


        var items = me.getContextmenu();
        var data = [];

        utils.each(items,function(i,item){
            if(item.divider){
                data.length &&  data.push(item);
                return;
            }
            if(me.queryCommandState(item.cmdName)!=-1){
                data.push({
                    label:item.label,
                    value:item.cmdName
                })
            }
        });
        if(data.length){
            var item = data[data.length-1];
            if(item.divider){
                data.pop();
            }
            var pos = e.getPosition('screen');
            var offset = $(me.getPaper().container).offset();
            pos.y -= offset.top;
            pos.x -= offset.left;
            $menu.kmui().setData({
                data:data
            }).position(pos).show();
        }

    });
    me.on('afterclick',function(){
        $menu.kmui().hide();
    });
    me.on('beforemousedown',function(e){
        if(e.isRightMB()){
            //e.stopPropagationImmediately();
        }
    })
} );



KM.registerToolbarUI('markers help preference resource', function(name) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang('tooltips')[name] || '',
            url: me.getOptions('KITYMINDER_HOME_URL') + 'dialogs/' + name + '/' + name + '.js',
        };

    var $btn = $.kmuibutton({
        icon: name,
        title: this.getLang('tooltips')[name] || ''
    });
    //加载模版数据
    utils.loadFile(document, {
        src: opt.url,
        tag: 'script',
        type: 'text/javascript',
        defer: 'defer'
    }, function() {

        $dialog = $.kmuimodal(opt);

        $dialog.attr('id', 'kmui-dialog-' + name).addClass('kmui-dialog-' + name)
            .find('.kmui-modal-body').addClass('kmui-dialog-' + name + '-body');

        $dialog.kmui().on('beforeshow', function() {
            var $root = this.root(),
                win = null,
                offset = null;
            if (!$root.parent()[0]) {
                me.$container.find('.kmui-dialog-container').append($root);
            }
            KM.setWidgetBody(name, $dialog, me);
        }).attachTo($btn);

        if (name == 'help') {
            $dialog.kmui().on('beforeshow', function() {
                $btn.kmui().active(true);
                $('.kmui-editor-body').addClass('blur');
            }).on('beforehide', function() {
                $btn.kmui().active(false);
                $('.kmui-editor-body').removeClass('blur');
            });
        }
    });

    me.on('interactchange', function() {
        var state = this.queryCommandState(name);
        $btn.kmui().disabled(state == -1).active(state == 1);
    });

    switch (name) {
        case 'markers':
            me.addContextmenu([{
                label: me.getLang('marker.marker'),
                exec: function() {
                    $dialog.kmui().show();
                },
                cmdName: 'markers'
            }]);
            break;
        case 'resource':
            me.addContextmenu([{
                label: me.getLang('resource.resource'),
                exec: function() {
                    $dialog.kmui().show();
                },
                cmdName: 'resource'
            }]);
    }
    return $btn;
});

KM.registerToolbarUI( 'hyperlink', function ( name ) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang( 'tooltips' )[ name ] || '',
            url: me.getOptions( 'KITYMINDER_HOME_URL' ) + 'dialogs/' + name + '/' + name + '.js'

        };

    var $btn = $.kmuibutton( {
        icon: name,
        title: this.getLang( 'tooltips' )[ name ] || ''
    } );
    //加载模版数据
    utils.loadFile( document, {
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    }, function () {

        $dialog = $.kmuimodal( opt );

        $dialog.attr( 'id', 'kmui-dialog-' + name ).addClass( 'kmui-dialog-' + name )
            .find( '.kmui-modal-body' ).addClass( 'kmui-dialog-' + name + '-body' );

        $dialog.kmui().on( 'beforeshow', function () {
            var $root = this.root(),
                win = null,
                offset = null;
            if ( !$root.parent()[ 0 ] ) {
                me.$container.find( '.kmui-dialog-container' ).append( $root );
            }
            KM.setWidgetBody( name, $dialog, me );
        } ).attachTo( $btn );


    } );

    me.addContextmenu( [ {
            label: me.getLang( 'hyperlink.hyperlink' ),
            exec: function (url) {
                $dialog.kmui().show();
            },
            cmdName: 'hyperlink'
        },{
            label: me.getLang( 'hyperlink.unhyperlink' ),
            exec: function () {
                this.execCommand( 'unhyperlink' )
            },
            cmdName: 'unhyperlink'
        }
    ]);

    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 )
    } );
    return $btn;
} );

KM.registerToolbarUI( 'image', function ( name ) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang( 'tooltips' )[ name ] || '',
            url: me.getOptions( 'KITYMINDER_HOME_URL' ) + 'dialogs/' + name + '/' + name + '.js'

        };

    var $btn = $.kmuibutton( {
        icon: name,
        title: this.getLang( 'tooltips' )[ name ] || ''
    } );

    //加载模版数据
    utils.loadFile( document, {
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    }, function () {

        $dialog = $.kmuimodal( opt );

        $dialog.attr( 'id', 'kmui-dialog-' + name ).addClass( 'kmui-dialog-' + name )
            .find( '.kmui-modal-body' ).addClass( 'kmui-dialog-' + name + '-body' );

        $dialog.kmui().on( 'beforeshow', function () {
            var $root = this.root(),
                win = null,
                offset = null;
            if ( !$root.parent()[ 0 ] ) {
                me.$container.find( '.kmui-dialog-container' ).append( $root );
            }
            KM.setWidgetBody( name, $dialog, me );
        } ).attachTo( $btn );


    } );

    me.addContextmenu( [ {
            label: me.getLang( 'image.image' ),
            exec: function (url) {
                $dialog.kmui().show();
            },
            cmdName: 'image'
        },{
            label: me.getLang( 'image.removeimage' ),
            exec: function () {
                this.execCommand( 'removeimage' );
            },
            cmdName: 'removeimage'
        }
    ]);

    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 );
    } );
    return $btn;
} );

KM.registerToolbarUI( 'zoom', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: me.getOptions( name ),
            autowidthitem: [],
            enabledRecord: false

        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( transForInserttopic( options ) ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand('zoom', res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } );
    var lastState, lastValue;
    //状态反射
    me.on( 'interactchange', function () {

        var state = this.queryCommandState( name ),
            value = this.queryCommandValue( name );

        if (state != lastState) {
            //设置按钮状态
            comboboxWidget.button().kmui().disabled( state == -1 ).active( state == 1 );
        }
        if ( value && value != lastValue ) {
            //设置label
            comboboxWidget.selectItemByLabel( value + '%' );
        }
        lastState = state;
        lastValue = value;

    } );
    //comboboxWidget.button().kmui().disabled(-1);
    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForInserttopic( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( v );
            tempItems.push( v + '%' );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;
        return options;

    }

} );

/*
    http://www.xmind.net/developer/
    Parsing XMind file
    XMind files are generated in XMind Workbook (.xmind) format, an open format
    that is based on the principles of OpenDocument. It consists of a ZIP
    compressed archive containing separate XML documents for content and styles,
    a .jpg image file for thumbnails, and directories for related attachments.
 */

KityMinder.registerProtocal('xmind', function() {

    // 标签 map
    var markerMap = {
        'priority-1': ['priority', 1],
        'priority-2': ['priority', 2],
        'priority-3': ['priority', 3],
        'priority-4': ['priority', 4],
        'priority-5': ['priority', 5],
        'priority-6': ['priority', 6],
        'priority-7': ['priority', 7],
        'priority-8': ['priority', 8],

        'task-start': ['progress', 1],
        'task-oct': ['progress', 2],
        'task-quarter': ['progress', 3],
        'task-3oct': ['progress', 4],
        'task-half': ['progress', 5],
        'task-5oct': ['progress', 6],
        'task-3quar': ['progress', 7],
        'task-7oct': ['progress', 8],
        'task-done': ['progress', 9]
    };

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',

        decode: function(local) {
            var successCall, errorCall;


            function processTopic(topic, obj) {

                //处理文本
                obj.data = {
                    text: topic.title
                };

                // 处理标签
                if (topic.marker_refs && topic.marker_refs.marker_ref) {
                    var markers = topic.marker_refs.marker_ref;
                    if (markers.length && markers.length > 0) {
                        for (var i in markers) {
                            var type = markerMap[markers[i]['marker_id']];
                            type && (obj.data[type[0]] = type[1]);
                        }
                    } else {
                        var type = markerMap[markers['marker_id']];
                        type && (obj.data[type[0]] = type[1]);
                    }
                }

                // 处理超链接
                if (topic['xlink:href']) {
                    obj.data.hyperlink = topic['xlink:href'];
                }
                //处理子节点
                var topics = topic.children && topic.children.topics;
                var subTopics = topics && (topics.topic || topics[0] && topics[0].topic);
                if (subTopics) {
                    var tmp = subTopics;
                    if (tmp.length && tmp.length > 0) { //多个子节点
                        obj.children = [];

                        for (var i in tmp) {
                            obj.children.push({});
                            processTopic(tmp[i], obj.children[i]);
                        }

                    } else { //一个子节点
                        obj.children = [{}];
                        processTopic(tmp, obj.children[0]);
                    }
                }
            }

            function xml2km(xml) {
                var json = $.xml2json(xml);
                var result = {};
                var sheet = json.sheet;
                var topic = utils.isArray(sheet) ? sheet[0].topic : sheet.topic;
                processTopic(topic, result);
                return result;
            }

            function onerror() {
                errorCall('ziperror');
            }

            function getEntries(file, onend) {
                zip.createReader(new zip.BlobReader(file), function(zipReader) {
                    zipReader.getEntries(onend);
                }, onerror);
            }
            return {
                then: function(callback) {

                    getEntries(local, function(entries) {
                        var hasMainDoc = false;
                        entries.forEach(function(entry) {
                            if (entry.filename == 'content.xml') {
                                hasMainDoc = true;
                                entry.getData(new zip.TextWriter(), function(text) {
                                    try {
                                        var km = xml2km($.parseXML(text));
                                        callback && callback(km);
                                    } catch (e) {
                                        errorCall && errorCall('parseerror');
                                    }
                                });
                            }
                        });

                        !hasMainDoc && errorCall && errorCall('parseerror');
                    });
                    return this;
                },
                error: function(callback) {
                    errorCall = callback;
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };

});

/*

    http://freemind.sourceforge.net/

    freemind文件后缀为.mm，实际格式为xml

*/

KityMinder.registerProtocal('freemind', function() {

    // 标签 map
    var markerMap = {
        'full-1': ['priority', 1],
        'full-2': ['priority', 2],
        'full-3': ['priority', 3],
        'full-4': ['priority', 4],
        'full-5': ['priority', 5],
        'full-6': ['priority', 6],
        'full-7': ['priority', 7],
        'full-8': ['priority', 8]
    };

    function processTopic(topic, obj) {

        //处理文本
        obj.data = {
            text: topic.TEXT
        };
        var i;

        // 处理标签
        if (topic.icon) {
            var icons = topic.icon;
            var type;
            if (icons.length && icons.length > 0) {
                for (i in icons) {
                    type = markerMap[icons[i].BUILTIN];
                    if (type) obj.data[type[0]] = type[1];
                }
            } else {
                type = markerMap[icons.BUILTIN];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic.LINK) {
            obj.data.hyperlink = topic.LINK;
        }

        //处理子节点
        if (topic.node) {

            var tmp = topic.node;
            if (tmp.length && tmp.length > 0) { //多个子节点
                obj.children = [];

                for (i in tmp) {
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            } else { //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xml) {
        var json = $.xml2json(xml);
        var result = {};
        processTopic(json.node, result);
        return result;
    }

    return {
        fileDescription: 'freemind格式文件',
        fileExtension: '.mm',

        decode: function(local) {
            return xml2km(local);
        },
        // recognize: null,
        recognizePriority: -1
    };

});

/* global zip:true */
/*
    http://www.mindjet.com/mindmanager/
    mindmanager的后缀为.mmap，实际文件格式是zip，解压之后核心文件是Document.xml
*/
KityMinder.registerProtocal('mindmanager', function() {

    var successCall, errorCall;

    // 标签 map
    var markerMap = {
        'urn:mindjet:Prio1': ['PriorityIcon', 1],
        'urn:mindjet:Prio2': ['PriorityIcon', 2],
        'urn:mindjet:Prio3': ['PriorityIcon', 3],
        'urn:mindjet:Prio4': ['PriorityIcon', 4],
        'urn:mindjet:Prio5': ['PriorityIcon', 5],
        '0': ['ProgressIcon', 1],
        '25': ['ProgressIcon', 2],
        '50': ['ProgressIcon', 3],
        '75': ['ProgressIcon', 4],
        '100': ['ProgressIcon', 5]
    };

    function processTopic(topic, obj) {
        //处理文本
        obj.data = {
            text: topic.Text && topic.Text.PlainText || ''
        }; // 节点默认的文本，没有Text属性

        // 处理标签
        if (topic.Task) {

            var type;
            if (topic.Task.TaskPriority) {
                type = markerMap[topic.Task.TaskPriority];
                if (type) obj.data[type[0]] = type[1];
            }

            if (topic.Task.TaskPercentage) {
                type = markerMap[topic.Task.TaskPercentage];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic.Hyperlink) {
            obj.data.hyperlink = topic.Hyperlink.Url;
        }

        //处理子节点
        if (topic.SubTopics && topic.SubTopics.Topic) {

            var tmp = topic.SubTopics.Topic;
            if (tmp.length && tmp.length > 0) { //多个子节点
                obj.children = [];

                for (var i in tmp) {
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            } else { //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xml) {
        var json = $.xml2json(xml);
        var result = {};
        processTopic(json.OneTopic.Topic, result);
        return result;
    }

    function onerror() {
        errorCall('ziperror');
    }

    function getEntries(file, onend) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
            zipReader.getEntries(onend);
        }, onerror);
    }

    return {
        fileDescription: 'mindmanager格式文件',
        fileExtension: '.mmap',
        decode: function(local) {
            return {
                then: function(callback) {
                    successCall = callback;
                    getEntries(local, function(entries) {
                        var hasMainDoc = false;
                        entries.forEach(function(entry) {
                            if (entry.filename == 'Document.xml') {
                                hasMainDoc = true;
                                entry.getData(new zip.TextWriter(), function(text) {
                                    try {
                                        var km = xml2km($.parseXML(text));
                                        if (successCall) successCall(km);
                                    } catch (e) {
                                        if (errorCall) errorCall('parseerror');
                                    }
                                });
                            }
                        });
                        if (!hasMainDoc && errorCall) errorCall('parseerror');
                    });
                    return this;
                },
                error: function(callback) {
                    errorCall = callback;
                }
            };
        },
        recognizePriority: -1
    };
});

KityMinder.registerProtocal('plain', function() {
    var LINE_ENDING = '\r',
        LINE_ENDING_SPLITER = /\r\n|\r|\n/,
        TAB_CHAR = '\t';

    function repeat(s, n) {
        var result = '';
        while (n--) result += s;
        return result;
    }

    function encode(json, level) {
        var local = '';
        level = level || 0;
        local += repeat(TAB_CHAR, level);
        local += json.data.text + LINE_ENDING;
        if (json.children) {
            json.children.forEach(function(child) {
                local += encode(child, level + 1);
            });
        }
        return local;
    }

    function isEmpty(line) {
        return !/\S/.test(line);
    }

    function getLevel(line) {
        var level = 0;
        while (line.charAt(level) === TAB_CHAR) level++;
        return level;
    }

    function getNode(line) {
        return {
            data: {
                text: line.replace(new RegExp('^' + TAB_CHAR + '*'), '')
            }
        };
    }

    function decode(local) {
        var json,
            parentMap = {},
            lines = local.split(LINE_ENDING_SPLITER),
            line, level, node;

        function addChild(parent, child) {
            var children = parent.children || (parent.children = []);
            children.push(child);
        }

        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            if (isEmpty(line)) continue;

            level = getLevel(line);
            node = getNode(line);

            if (level === 0) {
                if (json) {
                    throw new Error('Invalid local format');
                }
                json = node;
            } else {
                if (!parentMap[level - 1]) {
                    throw new Error('Invalid local format');
                }
                addChild(parentMap[level - 1], node);
            }
            parentMap[level] = node;
        }
        return json;
    }
    var lastTry, lastResult;

    function recognize(local) {
        if (!Utils.isString(local)) return false;
        lastTry = local;
        try {
            lastResult = decode(local);
        } catch (e) {
            lastResult = null;
        }
        return !!lastResult;
    }

    return {
        fileDescription: '大纲文本',
        fileExtension: '.txt',
        mineType: 'text/plain',
        encode: function(json) {
            return encode(json, 0);
        },
        decode: function(local) {
            if (lastTry == local && lastResult) {
                return lastResult;
            }
            return decode(local);
        },
        recognize: recognize,
        recognizePriority: -1
    };
});

KityMinder.registerProtocal('json', function() {
    function filter(key, value) {
        if (key == 'layout' || key == 'shicon') {
            return undefined;
        }
        return value;
    }
    return {
        fileDescription: 'KityMinder',
        fileExtension: '.km',
        mineType: 'application/json',
        encode: function(json) {
            return JSON.stringify(json, filter);
        },
        decode: function(local) {
            return JSON.parse(local);
        },
        recognize: function(local) {
            return Utils.isString(local) && local.charAt(0) == '{' && local.charAt(local.length - 1) == '}';
        },
        recognizePriority: 0
    };
});

if (!kity.Browser.ie) {
    KityMinder.registerProtocal('png', function() {
        function loadImage(url, callback) {
            var image = document.createElement('img');
            image.onload = callback;
            image.src = url;
        }

        return {
            fileDescription: 'PNG 图片',
            fileExtension: '.png',
            encode: function(json, km) {
                var originZoom = km._zoomValue;

                var paper = km.getPaper(),
                    paperTransform = paper.shapeNode.getAttribute('transform'),
                    domContainer = paper.container,
                    svgXml,
                    $svg,

                    bgDeclare = km.getStyle('background').toString(),
                    bgUrl = /url\((.+)\)/.exec(bgDeclare),
                    bgColor = kity.Color.parse(bgDeclare),

                    renderContainer = km.getRenderContainer(),
                    renderBox = renderContainer.getRenderBox(),
                    width = renderBox.width + 1,
                    height = renderBox.height + 1,
                    padding = 20,

                    canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    blob, DomURL, url, img, finishCallback;

                paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
                renderContainer.translate(-renderBox.x, -renderBox.y);

                svgXml = paper.container.innerHTML;

                renderContainer.translate(renderBox.x, renderBox.y);

                paper.shapeNode.setAttribute('transform', paperTransform);

                $svg = $(svgXml).filter('svg');
                $svg.attr({
                    width: renderBox.width + 1,
                    height: renderBox.height + 1,
                    style: 'font-family: Arial, "Microsoft Yahei","Heiti SC";'
                });

                // need a xml with width and height
                svgXml = $('<div></div>').append($svg).html();

                // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

                blob = new Blob([svgXml], {
                    type: 'image/svg+xml;charset=utf-8'
                });

                DomURL = window.URL || window.webkitURL || window;

                url = DomURL.createObjectURL(blob);

                canvas.width = width + padding * 2;
                canvas.height = height + padding * 2;

                function fillBackground(ctx, style) {
                    ctx.save();
                    ctx.fillStyle = style;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.restore();
                }

                function drawImage(ctx, image, x, y) {
                    ctx.drawImage(image, x, y);
                }

                function generateDataUrl(canvas) {
                    var url = canvas.toDataURL('png');
                    return url;
                }

                function drawSVG() {
                    loadImage(url, function() {
                        var svgImage = this;
                        var downloadUrl;
                        drawImage(ctx, svgImage, padding, padding);
                        DomURL.revokeObjectURL(url);
                        downloadUrl = generateDataUrl(canvas);
                        if (finishCallback) {
                            finishCallback(downloadUrl);
                        }
                    });
                }

                if (bgUrl) {
                    loadImage(bgUrl[1], function() {
                        fillBackground(ctx, ctx.createPattern(this, 'repeat'));
                        drawSVG();
                    });
                } else {
                    fillBackground(ctx, bgColor.toString());
                    drawSVG();
                }

                return {
                    then: function(callback) {
                        finishCallback = callback;
                    }
                };
            },
            recognizePriority: -1
        };
    });
}


if (!kity.Browser.ie) {
    KityMinder.registerProtocal('svg', function() {
        return {
            fileDescription: 'SVG 矢量图',
            fileExtension: '.svg',
            mineType: 'image/svg+xml',
            encode: function(json, km) {

                var paper = km.getPaper(),
                    paperTransform = paper.shapeNode.getAttribute('transform'),
                    svgXml,
                    $svg,

                    renderContainer = km.getRenderContainer(),
                    renderBox = renderContainer.getRenderBox(),
                    transform = renderContainer.getTransform(),
                    width = renderBox.width,
                    height = renderBox.height,
                    padding = 20;

                paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
                svgXml = km.getPaper().container.innerHTML;
                paper.shapeNode.setAttribute('transform', paperTransform);

                $svg = $(svgXml).filter('svg');
                $svg.attr({
                    width: width + padding * 2 | 0,
                    height: height + padding * 2 | 0,
                    style: 'font-family: Arial, "Microsoft Yahei",  "Heiti SC"; background: ' + km.getStyle('background')
                });
                $svg[0].setAttribute('viewBox', [renderBox.x - padding | 0,
                    renderBox.y - padding | 0,
                    width + padding * 2 | 0,
                    height + padding * 2 | 0
                ].join(' '));

                // need a xml with width and height
                svgXml = $('<div></div>').append($svg).html();

                svgXml = $('<div></div>').append($svg).html();

                // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

                // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                return svgXml;
            },
            recognizePriority: -1
        };
    });
}


})(kity, window)