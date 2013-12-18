var Command = kity.createClass( "Command", {

    constructor:function(){
        
    },

    execute: function (minder, args) {

    },

    revert: function() {

    },

    setContentChanged: function( val ) {
        
    },

    isContentChanged: function() {
        return false;
    },  

    setSelectionChanged: function(val) {

    },

    isSelectionChanged: function() {
        return false;
    }
});

Command.queryState: function(km) {
        return 0;
    }

Command.queryValue: function(km) {
        return 0;
    }