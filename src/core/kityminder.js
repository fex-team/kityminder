var KityMinder = km.KityMinder = kity.createClass("KityMinder", {
    constructor: function (id, option) {
        // 初始化
        this._initMinder(id, option || {});
        this._initModules();
        this._initEvents();
    },

    _initMinder: function(id, option) {
        this.id = id;

        this.rc = new kity.Group();
        this.paper = new kity.Paper(option.renderTo || document.body);
        this.paper.addShape(this.rc);

        this.root = new MinderNode(this);
        this.rc.addShape(this.root.getRenderContainer());
    }
});

//模块注册&暴露模块接口
(function(){
    var _modules;
    KityMinder.registerModule = function( name, module ) {
        //初始化模块列表
        if(!_modules){_modules = {};}
        _modules[name] = module;
    };
    KityMinder.getModules = function(){
        return _modules;
    };
})();

// 模块维护
kity.extendClass(KityMinder, (function(){
    var _commands = {};//command池子
    var _query = {};//query池子
    return {
        _initModules: function() {
            var _modules = KityMinder.getModules();
            if(_modules){
                var me = this;
                for(var key in _modules){
                    //执行模块初始化，抛出后续处理对象
                    var moduleDeals = _modules[key].call(me);
                    console.log(moduleDeals);

                    if(moduleDeals.ready)
                        {
                            moduleDeals.ready.call(me);
                        }

                    //command加入命令池子
                    var moduleDealsCommands = moduleDeals.commands;
                    if(moduleDealsCommands){
                        for(var _keyC in moduleDealsCommands){
                            _commands[_keyC] = moduleDealsCommands[_keyC];
                        }
                    }
                        
                    //绑定事件
                    var moduleDealsEvents = moduleDeals.events;
                    if(moduleDealsEvents){
                        for(var _keyE in moduleDealsEvents){
                            var bindEvs = _keyE.split(" ");
                            var func = moduleDealsEvents[_keyE];
                            for (var _i = 0; _i < bindEvs.length; _i++){
                                me.on(bindEvs[_i],func);
                            }
                        }
                    }

                }
            }
        },
        execCommand: function( name ) {
            var me = this;
            var _action = new _commands[name]();
            console.log(_action);
            var args = arguments;
            args[0] = this;
            if(_action.execute){
                me.fire("beforecommand",_action);
                me.on("precommand",function(e){
                    if(e.target===_action){_action.execute.apply(null,args);}
                    me.fire("command",_action);
                });
            }
        },

        queryCommandState: function( name ) {
            if(!_commands[name]){return false;}
            if(!_query[name]){
                _query[name] = new _commands[name]();
            }
            if(_query[name].queryState){
                return _query[name].queryState(this);
            } else {
                return 0;
            }
        },

        queryCommandValue: function( name ) {
            if(!_commands[name]){return false;}
            if(!_query[name]){
                _query[name] = new _commands[name]();
            }
            if(_query[name].queryValue){
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
        return this.root;
    },

    traverse: function( node, fn ) {
        var children = node.getChildren();
        for(var i = 0; i < children.length; i++) {
            this.traverse(children[i], fn);
        }
        fn.call(this, node);
    },

    handelNodeInsert: function(node) {
        this.traverse(node, function(current) {
            this.rc.addShape(current.getRenderContainer());
        });
    },

    handelNodeRemove: function(node) {
        this.traverse(node, function(current) {
            this.rc.removeShape(current.getRenderContainer());
        });
    },

    update: function( node ) {
        node = node || this.root;
        this.traverse(node, function(current) {
            var rc = current.getRenderContainer();
            var x = current.getData('x') || 0,
                y = current.getData('y') || 0;
            rc.setTransform(new kity.Matrix().translate(x, y));
            if(!rc.rect) {
                rc.rect = new kity.Rect();
                rc.addShape(rc.rect);
                rc.rect.fill('#eee');
                rc.rect.setRadius(5);
            }

            if(!rc.text) {
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
        this.paper.on('click mousedown mouseup mousemove', this._firePharse.bind(this));
    },
    _bindKeyboardEvents: function() {
        var minder = this;
        var listen = function(name, callback) {
            if(window.addEventListener) {
                window.addEventListener(name, callback);
            } else if(window.attachEvent) {
                window.attachEvent(name, callback);
            }
        };
        var events = 'keydown keyup keypress'.split(' ');
        for(var i = 0; i < events.length; i++) {
            listen(events[i], this._firePharse.bind(this));
        }
    },
    _firePharse: function(e) {
        var beforeEvent, preEvent, executeEvent;
        beforeEvent = new MinderEvent('before' + e.type, e, true);
        if( this._fire(beforeEvent) ) {
            return;
        }
        preEvent = new MinderEvent('pre' + e.type, e, false);
        executeEvent = new MinderEvent(e.type, e, false);
        this._fire(preEvent);
        this._fire(executeEvent);
        if(~'mousedown mouseup keydown keyup'.indexOf(e.type)) {
            this._interactChange(e);
        }
    },
    _interactChange: function(e) {
        var minder = this;
        clearTimeout(this.interactTimeout);
        this.interactTimeout = setTimeout(function() {
            var canceled = minder._fire(new MinderEvent('beforeinteractchange'));
            if(canceled) {
                return;
            }
            minder._fire(new MinderEvent('preinteractchange'));
            minder._fire(new MinderEvent('interactchange'));
        }, 300);
    },
    _listen: function( type, callback ) {
        var callbacks = this._eventCallbacks[type] || (this._eventCallbacks[type] = []);
        callbacks.push( callback );
    },
    _fire: function( e ) {
        var callbacks = this._eventCallbacks[e.type];
        if(!callbacks) {
            return false;
        }
        for(var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(this, e);
            if(e.shouldCancelImmediately()) {
                break;
            }
        }
        return e.shouldCancel();
    },
    on: function( name, callback ) {
        var types = name.split(' ');
        for(var i = 0; i < types.length; i++) {
            this._listen( types[i], callback );
        }
        return this;
    },
    off: function( name, callback ) {
        var types = name.split(' ');
        var i, j, callbacks, removeIndex;
        for(i = 0; i < types.length; i++) {
            callbacks = this._eventCallbacks[ types[i] ];
            if(callbacks) {
                removeIndex = null;
                for(j = 0; j < callbacks.length; j++) {
                    if(callbacks[j] == callback) {
                        removeIndex = j;
                    }
                }
                if(removeIndex !== null) {
                    callbacks.splice(removeIndex, 1);
                }
            }
        }
    },
    fire: function( type, params ) {
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
        if(childNodes.length) {
            exported.children = [];
            for(var i = 0; i < childNodes.length; i++) {
                exported.children.push(this.exportData(childNodes[i]));
            }
        }
        return exported;
    },

    importData: function( treeData ) {
        function importToNode(treeData, node) {
            var data = treeData.data;
            for(var field in data) {
                node.setData(field, data[field]);
            }

            var childrenTreeData = treeData.children;
            if(!childrenTreeData) return;
            for(var i = 0; i < childrenTreeData.length; i++) {
                var childNode = new MinderNode();
                importToNode(childrenTreeData[i], childNode);
                node.appendChild(childNode);
            }
        }
        var params = { importData: treeData };
        var canceled = this._fire(new MinderEvent('beforeimport', params , true));
        if(canceled) return this;

        this._fire(new MinderEvent('preimport', params, false));

        while(this.root.getChildren().length) {
            this.root.removeChild(0);
        }
        importToNode(treeData, this.root);

        this._fire(new MinderEvent('import', params, false));
        return this;
    }
});

// 选区管理
kity.extendClass(KityMinder, {
    getSelectedNodes: function() {

    },

    select: function( nodes ) {

    },

    selectSingle: function( node ) {

    },

    toggleSelect: function( nodes ) {

    },

    clearSelect: function( nodes ) {

    }
});