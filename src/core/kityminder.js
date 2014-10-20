var KityMinder = window.KM = window.KityMinder = function() {
    var instanceMap = {},
        instanceId = 0,
        uuidMap = {};
    return {
        version: '1.3.1',
        uuid: function(name) {
            name = name || 'unknown';
            uuidMap[name] = uuidMap[name] || 0;
            ++uuidMap[name];
            return name + '_' + uuidMap[name];
        },
        createMinder: function(renderTarget, options) {
            options = options || {};
            options.renderTo = Utils.isString(renderTarget) ? document.getElementById(renderTarget) : renderTarget;
            var minder = new Minder(options);
            this.addMinder(options.renderTo, minder);
            return minder;
        },
        addMinder: function(target, minder) {
            var id;
            if (typeof(target) === 'string') {
                id = target;
            } else {
                id = target.id || ("KM_INSTANCE_" + instanceId++);
            }
            instanceMap[id] = minder;
        },
        getMinder: function(target, options) {
            var id;
            if (typeof(target) === 'string') {
                id = target;
            } else {
                id = target.id || ("KM_INSTANCE_" + instanceId++);
            }
            return instanceMap[id] || this.createMinder(target, options);
        },
        //挂接多语言
        LANG: {}
    };
}();