/**
 * @fileOverview
 *
 * 完成加载一个脑图文件的流程
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/fileloader', function(minder) {

    var doc = minder.getUI('doc');

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

        return doc.load({

            source: file.source,
            title: file.filename,
            content: file.data.content,
            protocol: protocol.name

        }).then(function(json) {

            $container.removeClass('loading');

            return {
                file: file,
                json: json
            };

        });
    }

    function error(err) {
        var notice = minder.getUI('widget/notice');
        notice.error('err_localfile_read', err);
        $container.removeClass('loading');
    }

    return {
        load: function(filePromise, source) {
            $container.addClass('loading');
            return Promise.resolve(filePromise).then(load)['catch'](error);
        },

        support: function(file) {
            return getProtocolByExtension(file.extension);
        }
    };
});