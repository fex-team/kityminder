var cssLikeValueMatcher = {
    left: function(value) {
        return 3 in value && value[3] ||
            1 in value && value[1] ||
            value[0];
    },
    right: function(value) {
        return 1 in value && value[1] || value[0];
    },
    top: function(value) {
        return value[0];
    },
    bottom: function(value) {
        return 2 in value && value[2] || value[0];
    }
};

Utils.extend(KityMinder, {
    _themes: {},

    /**
     * 注册一个主题
     *
     * @param  {String} name  主题的名称
     * @param  {Plain} theme 主题的样式描述
     *
     * @example
     *     KityMinder.registerTheme('default', {
     *         'root-color': 'red',
     *         'root-stroke': 'none',
     *         'root-padding': [10, 20]
     *     });
     */
    registerTheme: function(name, theme) {
        KityMinder._themes[name] = theme;
    },

    getThemeList: function() {
        return KityMinder._themes;
    }
});

kity.extendClass(Minder, {

    /**
     * 切换脑图实例上的主题
     * @param  {String} name 要使用的主题的名称
     */
    useTheme: function(name) {

        this.setTheme(name);
        this.refresh(800);

        return true;
    },

    setTheme: function(name) {
        this._theme = name || null;
        this.getRenderTarget().style.background = this.getStyle('background');
        this.fire('themechange', {
            theme: name
        });
    },

    /**
     * 获取脑图实例上的当前主题
     * @return {[type]} [description]
     */
    getTheme: function(node) {
        return this._theme || this.getOptions('defaultTheme');
    },

    getThemeItems: function(node) {
        var theme = this.getTheme(node);
        return KityMinder._themes[this.getTheme(node)];
    },

    /**
     * 获得脑图实例上的样式
     * @param  {String} item 样式名称
     */
    getStyle: function(item, node) {
        var items = this.getThemeItems(node);
        var segment, dir, selector, value, matcher;

        if (item in items) return items[item];

        // 尝试匹配 CSS 数组形式的值
        // 比如 item 为 'pading-left'
        // theme 里有 {'padding': [10, 20]} 的定义，则可以返回 20
        segment = item.split('-');
        if (segment.length < 2) return null;

        dir = segment.pop();
        item = segment.join('-');

        if (item in items) {
            value = items[item];
            if (Utils.isArray(value) && (matcher = cssLikeValueMatcher[dir])) {
                return matcher(value);
            }
            if (!isNaN(value)) return value;
        }

        return null;
    },

    /**
     * 获取指定节点的样式
     * @param  {String} name 样式名称，可以不加节点类型的前缀
     */
    getNodeStyle: function(node, name) {
        var value = this.getStyle(node.getType() + '-' + name, node);
        return value !== null ? value : this.getStyle(name, node);
    }
});

kity.extendClass(MinderNode, {
    getStyle: function(name) {
        return this.getMinder().getNodeStyle(this, name);
    }
});

KityMinder.registerModule('Theme', {
    defaultOptions: {
        defaultTheme: 'fresh-blue'
    },
    commands: {
        'theme': kity.createClass('ThemeCommand', {
            base: Command,

            execute: function(km, name) {
                return km.useTheme(name);
            },

            queryValue: function(km) {
                return km.getTheme() || 'default';
            }
        })
    }
});

Minder.registerInit(function() {
    this.setTheme();
});