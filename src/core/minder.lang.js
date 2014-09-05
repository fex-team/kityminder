//添加多语言模块
kity.extendClass( Minder, {
    getLang: function ( path ) {

        var lang = KM.LANG[ this.getOptions( 'lang' ) ];
        if ( !lang ) {
            throw Error( "not import language file" );
        }
        path = ( path || "" ).split( "." );
        for ( var i = 0, ci; ci = path[ i++ ]; ) {
            lang = lang[ ci ];
            if ( !lang ) break;
        }

        if (typeof(lang) == 'string') {
            var args = arguments;
            return lang.replace(/\{(\d+)\}/ig, function(match, gindex) {
                return args[+gindex + 1] != undefined && args[+gindex + 1].toString() || match;
            });
        }
        return lang;
    }
} );