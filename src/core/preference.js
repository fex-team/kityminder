kity.extendClass( Minder, function(){

    var ROOTKEY = 'kityminder_preference';

    //创建存储机制
    var LocalStorage = ( function () {

        var storage = window.localStorage,
            LOCAL_FILE = "localStorage";

        return {

            saveLocalData: function ( key, data ) {

                if ( storage && data) {
                    storage.setItem( key, data  );
                    return true;
                }

                return false;

            },

            getLocalData: function ( key ) {

                if ( storage ) {
                    return storage.getItem( key );
                }

                return null;

            },

            removeItem: function ( key ) {

                if (storage) storage.removeItem( key );

            }

        };

    } )();
    return {
        setPreferences: function(key,value){
            var obj = {};
            if ( Utils.isString( key ) ) {
                obj[ key ] = value;
            } else {
                obj = key;
            }
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                utils.extend(data, obj);
            }else{
                data = obj;
            }
            LocalStorage.saveLocalData(ROOTKEY,JSON.stringify(data));
        },
        getPreferences: function(key){
            var data = LocalStorage.getLocalData(ROOTKEY);
            if(data){
                data = JSON.parse(data);
                return key ? data[key] : data;
            }
            return {};
        },
        resetPreferences: function(pres){
            var str = pres ? JSON.stringify(pres) : '';
            LocalStorage.saveLocalData(str);
        }
    };

}() );