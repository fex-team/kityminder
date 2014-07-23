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
        this.fire('nodecreate', { node: node });
        this.appendNode(node,parent, index);
        return node;
    },

    appendNode: function(node, parent, index) {
        if (parent) parent.insertChild(node, index);
        this.attachNode(node);
        return this;
    },

    removeNode: function(node) {
        if (node.parent) {
            node.parent.removeChild(node);
            this.detachNode(node);
            this.fire('noderemove', { node: node });
        }
    },

    attachNode: function(node) {
        var rc = this._rc;
        node.traverse(function(current) {
            current.attached = true;
            rc.addShape(current.getRenderContainer());
        });
        rc.addShape(node.getRenderContainer());
        this.fire('nodeattach', {
            node: node
        });
    },

    detachNode: function(node) {
        var rc = this._rc;
        node.traverse(function(current) {
            current.attached = false;
            rc.removeShape(current.getRenderContainer());
        });
        this.fire('nodedetach', {
            node: node
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