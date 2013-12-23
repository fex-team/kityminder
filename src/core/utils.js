var Utils = KityMinder.Utils = {};

Utils.extend = kity.Utils.extend.bind( kity.Utils );

Utils.listen = function ( element, type, callback ) {
    ( element.addEventListener || element.attachEvent )( type, callback );
};