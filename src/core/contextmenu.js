/**
 * @fileOverview
 *
 * 添加模块上下文菜单支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

Minder.registerInit(function() {
    this._initContextMenu();
});

kity.extendClass(Minder, {
    _initContextMenu: function() {
        this.contextmenus = [];
    },
    addContextMenu: function(item) {
        if (utils.isArray(item)) {
            this.contextmenus = this.contextmenus.concat(item);
        } else {
            this.contextmenus.push(item);
        }

        return this;
    },
    getContextMenu: function() {
        return this.contextmenus;
    }
});