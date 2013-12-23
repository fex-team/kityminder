var Utils = KityMinder.Utils = {};

Utils.extend = kity.Utils.extend;

Utils.listen = function ( element, type, callback ) {
    ( element.addEventListener || element.attachEvent )( name, callback );
};