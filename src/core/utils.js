var Utils = KityMinder.Utils = {};

Utils.extend = kity.Utils.extend.bind( kity.Utils );

Utils.listen = function ( element, type, callback ) {
    ( element.addEventListener || element.attachEvent )( type, callback );
};

Utils.keys = function ( plain ) {
    var keys = [];
    for ( var key in plain ) {
        if ( plain.hasOwnProperty( key ) ) {
            keys.push( key );
        }
    }
    return keys;
};