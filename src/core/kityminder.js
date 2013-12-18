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

};

// 模块维护
kity.extendClass(KityMinder, {
    _initModules: function() {

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