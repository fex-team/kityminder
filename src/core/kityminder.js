var KityMinderId = 0;
var KityMinder = km.KityMinder = kity.createClass("KityMinder", {
    constructor: function(id, option) {
        // 初始化
        this._initMinder(id, option || {});
        this._initEvents();
        this._initModules();
    },

    _initMinder: function(id, option) {
        this.id = id || KityMinderId++;

        this._rc = new kity.Group();
        this._paper = new kity.Paper(option.renderTo || document.body);
        this._paper.addShape(this._rc);

        this._root = new MinderNode(this);
        this._rc.addShape(this._root.getRenderContainer());
    }
});

//模块注册&暴露模块接口
(function() {
    var _modules;
    KityMinder.registerModule = function(name, module) {
        //初始化模块列表
        if (!_modules) {
            _modules = {};
        }
        _modules[name] = module;
    };
    KityMinder.getModules = function() {
        return _modules;
    };
})();

// 模块维护
kity.extendClass(KityMinder, (function() {
    var _commands = {}; //command池子
    var _query = {}; //query池子
    return {
        _initModules: function() {
            var _modules = KityMinder.getModules();
            if (_modules) {
                var me = this;
                for (var key in _modules) {
                    //执行模块初始化，抛出后续处理对象
                    var moduleDeals = _modules[key].call(me);

                    if (moduleDeals.ready) {
                        moduleDeals.ready.call(me);
                    }

                    //command加入命令池子
                    var moduleDealsCommands = moduleDeals.commands;
                    if (moduleDealsCommands) {
                        for (var _keyC in moduleDealsCommands) {
                            _commands[_keyC] = moduleDealsCommands[_keyC];
                        }
                    }

                    //绑定事件
                    var moduleDealsEvents = moduleDeals.events;
                    if (moduleDealsEvents) {
                        for (var _keyE in moduleDealsEvents) {
                            me.on(_keyE, moduleDealsEvents[_keyE]);
                        }
                    }

                }
            }
        },
        execCommand: function(name) {
            var me = this;
            var _action = new _commands[name]();
            console.log(_action);
            var args = arguments;
            args[0] = this;
            var _sendingArgs = (function() {
                var _args = [];
                for (var i = 1; i < args.length; i++) {
                    _args.push(args[i]);
                }
                return _args;
            })();
            console.log(args);
            var eventParams = {
                command: _action,
                commandName: name,
                commandArgs: _sendingArgs
            };
            var canceled = me._fire(new MinderEvent('beforecommand', eventParams, true));
            if (!canceled) {
                me._fire(new MinderEvent("precommand", eventParams, false));
                _action.execute.apply(_action, args);
                me._fire(new MinderEvent("command", eventParams, false));
                if (_action.isContentChanged()) {
                    me._firePharse('contentchange');
                }
                if (_action.isSelectionChanged()) {
                    me._firePharse('selectionchange');
                }
            }
        },

        queryCommandState: function(name) {
            if (!_commands[name]) {
                return false;
            }
            if (!_query[name]) {
                _query[name] = new _commands[name]();
            }
            if (_query[name].queryState) {
                return _query[name].queryState(this);
            } else {
                return 0;
            }
        },

        queryCommandValue: function(name) {
            if (!_commands[name]) {
                return false;
            }
            if (!_query[name]) {
                _query[name] = new _commands[name]();
            }
            if (_query[name].queryValue) {
                return _query[name].queryValue(this);
            } else {
                return 0;
            }

        }
    };
})());

// 节点控制
kity.extendClass(KityMinder, {

    getRoot: function() {
        return this._root;
    },

    traverse: function(node, fn) {
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            this.traverse(children[i], fn);
        }
        fn.call(this, node);
    },

    handelNodeInsert: function(node) {
        this.traverse(node, function(current) {
            this._rc.addShape(current.getRenderContainer());
        });
    },

    handelNodeRemove: function(node) {
        this.traverse(node, function(current) {
            this._rc.removeShape(current.getRenderContainer());
        });
    },

    update: function(node) {
        node = node || this._root;
        this.traverse(node, function(current) {
            var rc = current.getRenderContainer();
            var x = current.getData('x') || 0,
                y = current.getData('y') || 0;
            rc.setTransform(new kity.Matrix().translate(x, y));
            if (!rc.rect) {
                rc.rect = new kity.Rect();
                rc.addShape(rc.rect);
                rc.rect.fill('#eee');
                rc.rect.setRadius(5);
            }

            if (!rc.text) {
                rc.text = new kity.Text();
                rc.addShape(rc.text);
            }
            rc.text.setContent(current.getData('text') || '');
            var box = rc.text.getRenderBox();
            rc.rect.setPosition(box.x - 5, box.y - 5);
            rc.rect.setSize(box.width + 10, box.height + 10);
        });
    }
});

// 事件机制
kity.extendClass(KityMinder, {
    _initEvents: function() {
        this._eventCallbacks = {};
        this._bindPaperEvents();
        this._bindKeyboardEvents();
    },
    // TODO: mousemove lazy bind
    _bindPaperEvents: function() {
        var minder = this;
        this._paper.on('click mousedown mouseup mousemove', this._firePharse.bind(this));
    },
    _bindKeyboardEvents: function() {
        var minder = this;
        var listen = function(name, callback) {
            if (window.addEventListener) {
                window.addEventListener(name, callback);
            } else if (window.attachEvent) {
                window.attachEvent(name, callback);
            }
        };
        var events = 'keydown keyup keypress'.split(' ');
        for (var i = 0; i < events.length; i++) {
            listen(events[i], this._firePharse.bind(this));
        }
    },
    _firePharse: function(e) {
        var beforeEvent, preEvent, executeEvent;
        beforeEvent = new MinderEvent('before' + e.type, e, true);
        if (this._fire(beforeEvent)) {
            return;
        }
        preEvent = new MinderEvent('pre' + e.type, e, false);
        executeEvent = new MinderEvent(e.type, e, false);
        this._fire(preEvent);
        this._fire(executeEvent);
        if (~'mousedown mouseup keydown keyup'.indexOf(e.type)) {
            this._interactChange(e);
        }
    },
    _interactChange: function(e) {
        var minder = this;
        clearTimeout(this.interactTimeout);
        this.interactTimeout = setTimeout(function() {
            var canceled = minder._fire(new MinderEvent('beforeinteractchange'));
            if (canceled) {
                return;
            }
            minder._fire(new MinderEvent('preinteractchange'));
            minder._fire(new MinderEvent('interactchange'));
        }, 300);
    },
    _listen: function(type, callback) {
        var callbacks = this._eventCallbacks[type] || (this._eventCallbacks[type] = []);
        callbacks.push(callback);
    },
    _fire: function(e) {
        var callbacks = this._eventCallbacks[e.type];
        if (!callbacks) {
            return false;
        }
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(this, e);
            if (e.shouldCancelImmediately()) {
                break;
            }
        }
        return e.shouldCancel();
    },
    on: function(name, callback) {
        var types = name.split(' ');
        for (var i = 0; i < types.length; i++) {
            this._listen(types[i], callback);
        }
        return this;
    },
    off: function(name, callback) {
        var types = name.split(' ');
        var i, j, callbacks, removeIndex;
        for (i = 0; i < types.length; i++) {
            callbacks = this._eventCallbacks[types[i]];
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


// 导入导出
kity.extendClass(KityMinder, {
    exportData: function(node) {
        var exported = {};
        node = node || this.getRoot();
        exported.data = node.getData();
        var childNodes = node.getChildren();
        if (childNodes.length) {
            exported.children = [];
            for (var i = 0; i < childNodes.length; i++) {
                exported.children.push(this.exportData(childNodes[i]));
            }
        }
        return exported;
    },

    importData: function(treeData) {
        function importToNode(treeData, node) {
            var data = treeData.data;
            for (var field in data) {
                node.setData(field, data[field]);
            }

            var childrenTreeData = treeData.children;
            if (!childrenTreeData) return;
            for (var i = 0; i < childrenTreeData.length; i++) {
                var childNode = new MinderNode();
                importToNode(childrenTreeData[i], childNode);
                node.appendChild(childNode);
            }
        }

        var params = {
            importData: treeData
        };

        var canceled = this._fire(new MinderEvent('beforeimport', params, true));

        if (canceled) return this;

        this._fire(new MinderEvent('preimport', params, false));

        while (this._root.getChildren().length) {
            this._root.removeChild(0);
        }
        importToNode(treeData, this._root);

        this._fire(new MinderEvent('import', params, false));
        this._firePharse({
            type: 'contentchange'
        });
        return this;
    }
});

// 选区管理
kity.extendClass(KityMinder, {
    getSelectedNodes: function() {
        return this._selectedNodes || (this._selectedNodes = []);
    },

    select: function(nodes) {
        var selection = this.getSelectedNodes();
        if (false === nodes instanceof Array) nodes = [nodes];
        for (var i = 0; i < nodes.length; i++) {
            if (selection.indexOf(nodes[i]) === -1) {
                selection.push(nodes[i]);
            }
        }
        return this;
    },

    selectSingle: function(node) {
        return this.clearSelect().select(node);
    },

    toggleSelect: function(nodes) {
        var selection = this.getSelectedNodes();
        var needAdd = [],
            needRemove = [];
        if (false === nodes instanceof Array) nodes = [nodes];
        for (var i = 0; i < nodes.length; i++) {
            if (selection.indexOf(nodes[i]) === -1) {
                needAdd.push(nodes[i]);
            } else {
                needRemove.push(nodes[i]);
            }
        }
        this.clearSelect(needRemove);
        this.select(needAdd);
    },

    clearSelect: function(nodes) {
        if (!nodes) {
            this._selectedNodes = [];
            return this;
        }
        if (false === nodes instanceof Array) nodes = [nodes];
        var originSelection = this.getSelectedNodes();
        var newSelection = [];
        for (var i = 0; i < originSelection.length; i++) {
            if (nodes.indexOf(originSelection[i]) === -1) {
                newSelection.push(originSelection[i]);
            }
        }
        this._selectedNodes = newSelection;
        return this;
    }
});