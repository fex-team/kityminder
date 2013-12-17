var KityMinder = kity.createClass("KityMinder", {
    constructor: function (id, option) {
        // 初始化
        this._initModules();
        this._initEvents();
    }
});

KityMinder.version = '1.0.0.0';
KityMinder.debug = true;

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

    },

    update: function( node ) {

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