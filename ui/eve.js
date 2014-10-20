/**
 * @fileOverview
 *
 * 简版事件解耦功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('eve', function(minder) {
    return {
        setup: function(obj) {
            var callbacks = {};
            
            obj.on = function on(name, callback) {
                var list = callbacks[name] || (callbacks[name] = []);
                list.push(callback);
                return this;
            };
            
            obj.off = function off(name, callback) {
                var list = callbacks[name];
                if (list) {
                    var index = list.indexOf(callback);
                    if (~index) {
                        list.splice(index, 1);
                    } else {
                        callback[name] = null;
                    }
                }
                return this;
            };
            
            obj.once = function once(name, callback) {
                return this.on(name, function wrapped() {
                    callback.apply(obj, arguments);
                    obj.off(name, wrapped);
                });
            };
            
            obj.fire = function fire(name) {
                var list = callbacks[name];
                var args = [].slice.call(arguments, 1);
                if (list) list.forEach(function(callback) {
                    callback.apply(obj, args);
                });
                return this;
            };

            return obj;
        }
    };
});