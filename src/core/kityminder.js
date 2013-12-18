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

// 模块注册
KityMinder.registerModule = function( name, module ) {
    //初始化模块列表
    this._modules = this._modules||{};
    this._modules[name] = module;
};

// 模块维护
kity.extendClass(KityMinder, {
    _initModules: function() {
        var me = this;
        me.commands = {};//command池子
        me.actions = [];//操作记录栈
        var _modules = KityMinder._modules;
        if(_modules){
            for(var key in _modules){
                //执行模块初始化，抛出后续处理对象
                var moduleDeals = 
                    _modules[key].call(me);
                console.log(moduleDeals);

                moduleDeals["ready"]&&moduleDeals["ready"].call(this);

                //command加入命令池子
                var moduleDealsCommands = moduleDeals["commands"];
                if(moduleDealsCommands){
                    for(var _key in moduleDealsCommands){
                        me.commands[_key] = moduleDealsCommands[_key];
                    }
                }
                
                //绑定事件
                var moduleDealsEvents = moduleDeals["events"];
                if(moduleDealsEvents){
                    for(var _key in moduleDealsEvents){
                        var bindEvs = _key.split(" ");
                        console.log(bindEvs);
                        var func = moduleDealsEvents[_key];
                        for (var _i = 0; _i < bindEvs.length; _i++){
                            me.on(bindEvs[_i],func);
                        }
                    }
                }

            }
        }
    }
});

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
            if(!rc.textContainer) {
                rc.textContainer = new kity.Text();
                rc.addShape(rc.textContainer);
            }
            rc.textContainer.setContent(current.getData('text') || '');
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

// 命令机制
kity.extendClass(KityMinder, {
    execCommand: function( name ) {
        var _action = new this.commands[name]();
        console.log(_action);
        var args = arguments;
        arguments[0] = this;
        _action["execute"]&&_action["execute"].apply(null,args);
        this.actions.push(_action);
    },

    queryCommandState: function( name ) {

    },

    queryCommandValue: function( name ) {

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