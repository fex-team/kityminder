KityMinder.registerProtocol('json', function(minder) {

    return {
        fileDescription: 'KityMinder',
        fileExtension: '.km',
        dataType: 'text',
        mineType: 'application/json',

        encode: function(json) {
            return JSON.stringify(json);
        },

        decode: function(local) {
            return JSON.parse(local);
        }
    };
});