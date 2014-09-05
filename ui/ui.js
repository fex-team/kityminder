/**
 * @fileOverview
 *
 * KityMinder UI 注册及加载机制
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

(function() {
    var uiQueue = [];

    /* 注册一个新的 UI 交互 */
    KityMinder.registerUI = function(id, deps, ui) {
        if (typeof(deps) == 'function') {
            ui = deps;
            deps = null;
        }
        uiQueue.push({
            id: id,
            ui: ui,
            deps: deps
        });
    };

    kity.extendClass(Minder, {
        /* 为实例注册 UI 交互 */
        initUI: function() {
            var ui = this._ui = {};
            var minder = this;

            uiQueue.forEach(function(uiDeal) {
                var deps = uiDeal.deps;
                if (deps) deps = deps.map(function(dep) {
                    return minder.getUI(dep);
                });
                ui[uiDeal.id] = uiDeal.ui.apply(null, [minder].concat(deps || []));
            });

            // 阻止非脑图事件冒泡
            $('body').delegate('#panel, #tab-container, .fui-dialog, #main-menu', 'keydown keyup', function(e) {
                e.stopPropagation();
            });

            minder.getPaper().addClass('loading-target');

            this.fire('interactchange');
            this.fire('uiready');
        },

        /* 获得实例的 UI 实例 */
        getUI: function(id) {
            return this._ui[id];
        }
    });

    $.extend($, {
        pajax: function() {
            var defered = $.ajax.apply($, arguments);
            return Promise.resolve(defered);
        }
    });

})();