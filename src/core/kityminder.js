var KityMinder = window.KM = window.KityMinder = {};

KityMinder.version = '1.0.0.0';

KityMinder.createMinder = function ( renderTarget, options ) {
    options = options || {};
    options.renderTo = renderTarget;
    return new Minder( options );
};

var instanceMap = {}, instanceId = 0;
KityMinder.addMinderInstance = function ( target, minder ) {
    var id;
    if ( typeof ( target ) === 'string' ) {
        id = target;
    } else {
        id = target.id || ( "KM_INSTANCE_" + instanceId++ );
    }
    instanceMap[ id ] = minder;
};

KityMinder.getMinder = function ( id ) {
    return instanceMap[ id ] || null;
};