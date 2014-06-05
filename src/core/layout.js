var Layout = kity.createClass('Layout', {
    doLayout: function(node) {
        throw new Error('Not Implement: Layout.doLayout()');
    }
});

Utils.extend(KityMinder, {
    _layout: {},

    registerLayout: function(name, layout) {
        KityMinder._layout[name] = layout;
        if (!KityMinder._defaultLayout) {
            KityMinder._defaultLayout = name;
        }
    }
});

kity.extendClass(MinderNode, {
    getLayout: function() {
        var layout = this.getData('layout');

        layout = layout || (this.isRoot() ? KityMinder._defaultLayout : this.parent.getLayout());

        return layout;
    },

    layout: function(name) {
        if (name) {
            this.setData('layout', name);
        }
        var LayoutClass = KityMinder._layout[this.getLayout()];
        var layout = new LayoutClass();
        layout.doLayout(this);
        return this;
    },

    getTreeBox: function() {
        var box = this.getContentBox();
        this.getChildren().forEach(function(child) {
            box = KityMinder.Geometry.mergeBox(child.getTreeBox(), box);
        });
        return box;
    }
});