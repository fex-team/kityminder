/**
 * @fileOverview
 *
 * 配置面板
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ui/menu/preference/preference', function (minder) {
    var $menu = minder.getUI('menu/menu');
    var ret = minder.getUI('eve').setup({});
    var $panel = $menu.createSub('preference');

    // 同步用户配置文件
    function syncPreference() {

        // 配置文件在网盘的路径
        var remotePreferencesPath = '/apps/kityminder/app.preferences';

        // 记录远端配置的和本地配置的版本
        // - 远端配置保存在 json 内容的 version 字段中
        // - 本地配置用 localStorage 来记录
        var remoteVersion = 0,
            localVersion = localStorage.preferencesVersion || 0;

        // 远端配置和本地配置的内容
        var remotePreferences, localPreferences;

        downloadPreferences();

        // 绑定实例上配置改变的事件，配置有变需要上传
        minder.on('preferenceschange', function() {
            localStorage.preferencesVersion = ++localVersion;
            uploadPreferences();
        });

        // 下载远端配置
        function downloadPreferences() {

            // 比较远端和本地版本
            // - 远端版本较新则设置本地版本为远端版本
            // - 本地版本较新则上传本地版本
            function merge(remote) {

                if (!remote) return;

                remote = JSON.parse(remote.data.content);

                remoteVersion = remote.version;

                remotePreferences = remote.preferences;
                localPreferences = minder.getPreferences();

                if (localVersion < remoteVersion) {
                    minder.resetPreferences(remotePreferences);
                } else if (localVersion > remoteVersion) {
                    uploadPreferences();
                }

            }

            // 下载配置的过程
            // 需要先获得下载的 URL 再使用 ajax 请求内容
            fio.file.read({
                path: remotePreferencesPath,
                dataType: 'text'
            }).then(merge);
        }

        // 上传本地配置
        function uploadPreferences() {

            localPreferences = minder.getPreferences();

            // 上传的数据需要附带版本信息
            var data = {
                version: localVersion,
                preferences: localPreferences
            };

            fio.file.write({
                path: remotePreferencesPath,
                content: JSON.stringify(data),
                ondup: fio.file.DUP_OVERWRITE
            });
        }
    }
});