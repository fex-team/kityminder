utils.extend(KityMinder, {
    _templates: {},
    registerTemplate: function(name, supports) {
        KityMinder._templates[name] = supports;
    }
});

kity.extendClass(Minder, (function() {
    var originGetTheme = Minder.prototype.getTheme;
    return {
        useTemplate: function(name) {
            this._template = name;

            this.getRoot().traverse(function(node) {
                node.render();
            });

            this.layout(300);
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

            queryCommandValue: function(minder) {
                return minder._template;
            }
        })
    }
});