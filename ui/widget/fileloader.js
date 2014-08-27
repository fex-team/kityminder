/**
 * @fileOverview
 *
 * 完成加载一个脑图文件的流程
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/fileloader', function(minder) {

    var $container = $(minder.getRenderTarget());

    var supports = minder.getSupportedProtocols();

    function getProtocolByExtension(extension) {
        for (var protocol in supports) {
            if (supports[protocol].fileExtension == extension) return supports[protocol];
        }
        return false;
    }

    function load(file) {
        var protocol = getProtocolByExtension(file.extension);

        return minder.importData(file.data.content, protocol.name).then(function(json) {

            var $title = minder.getUI('topbar/title');
            $title.setTitle(file.filename);
            $container.removeClass('loading');
            minder.execCommand('camera', minder.getRoot(), 300);

            return {
                file: file,
                json: json
            };

        });
    }

    function error(err) {
        window.alert('加载文件失败：' + err.message);
        $container.removeClass('loading');
    }

    return {
        load: function(filePromise) {
            $container.addClass('loading');
            return Promise.resolve(filePromise).then(load)['catch'](error);
        },

        support: function(file) {
            return getProtocolByExtension(file.extension);
        }
    };
});