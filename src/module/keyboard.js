KityMinder.registerModule( "KeyboardModule", function () {
    return {
        "events": {
            keydown: function ( e ) {
                console.log( e );
            }
        }
    };
} );