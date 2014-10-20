/* jshint -W079 */
var Minder = KityMinder.Minder = kity.createClass('KityMinder', {
    constructor: function(options) {
        this._options = Utils.extend(window.KITYMINDER_CONFIG || {}, options);

        var initQueue = Minder._initFnQueue.slice();

        // @see option.js
        // @see event.js
        // @see status.js
        // @see paper.js
        // @see select.js
        // @see key.js
        // @see contextmenu.js
        // @see module.js
        // @see data.js         
        // @see readonly.js
        // @see layout.js
        // @see theme.js
        while (initQueue.length) initQueue.shift().call(this, options);
        
        this.fire('ready');
    }
});
/* jshint +W079 */

Minder._initFnQueue = [];
Minder.registerInit = function(fn) {
    Minder._initFnQueue.push(fn);
};