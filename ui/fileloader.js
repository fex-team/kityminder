KityMinder.registerUI('fileloader', function (minder) {

    var $container = $(minder.getRenderTarget());

    var supports = minder.getSupportedProtocols();

    function getProtocolByExtension(extension) {
        for (var protocol in supports) {
            if (supports[protocol].fileExtension == extension) return protocol;
        }
        return false;
    }

    function load(file) {
        var protocol = getProtocolByExtension(file.extension);
        minder.importData(file.data.content, protocol).then(function() {
            $container.removeClass('loading');
            minder.execCommand('camera', minder.getRoot(), 300);
        }, error);
    }

    function error(err) {
        window.alert('加载文件失败：' + err.message);
        $container.removeClass('loading');
    }

    return {
        load: function(filePromise) {
            $container.addClass('loading');
            Promise.resolve(filePromise).then(load, error);
        },

        support: function(file) {
            return getProtocolByExtension(file.extension);
        }
    };
});