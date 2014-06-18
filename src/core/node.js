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
    preTraverse: function(fn) {
        var children = this.getChildren();
        var value = fn(this);
        for (var i = 0; i < children.length; i++) {
            value = children[i].preTraverse(fn, value);
        }
    },

    /**
     * 后序遍历当前节点树
     * @param  {Function} fn 遍历函数
     */
    postTraverse: function(fn) {
        var children = this.getChildren();
        var value;
        for (var i = 0; i < children.length; i++) {
            value = children[i].postTraverse(fn, value);
        }
        fn(this, value);
    },

    traverse: function(fn) {
        return this.postTraverse(fn);
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

    equals: function(node) {
        if (node.children.length != this.children.length) {
            return false;
        }
        if (utils.compareObject(node.getData(), this.getData()) === false) {
            return false;
        }
        if (utils.compareObject(node.getTmpData(), this.getTmpData()) === false) {
            return false;
        }
        for (var i = 0, ci;
            (ci = this.children[i]); i++) {
            if (ci.equals(node.children[i]) === false) {
                return false;
            }
        }
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