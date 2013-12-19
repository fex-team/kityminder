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
    var _modules = {};
    KityMinder.registerModule = function( name, module ) {
        //初始化模块列表
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
            var _action = new _commands[name]();
            console.log(_action);
            var args = arguments;
            args[0] = this;
            if(_action.execute){
                _action.fire("beforecommand");
                _action.on("precommand",function(e){
                    _action.execute.apply(null,args);
                    _action.fire("command");
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

    },
    on: function( name, callback ) {
        
    },
    once: function( name, callback ) {

    },
    off: function( name, callback ) {

    },
    fire: function( name, params ) {

    }
});


// 导入导出
kity.extendClass(KityMinder, {
    export: function() {

    },

    import: function() {

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