/**
 * @fileOverview
 *
 * 当前文档管理
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('doc', function(minder) {

    var ret = minder.getUI('eve').setup({});
    var current = { saved: true };
    var loading = false;
    var notice = minder.getUI('widget/notice');
    var finder = minder.getUI('widget/netdiskfinder');

    if (finder) finder.on('mv', trackFileMove);

    function trackFileMove(from, to) {

        if (current.source != 'netdisk') return;

        var fromPath = from.split('/');
        var toPath = to.split('/');

        function preCommonLength(a, b) {
            var i = 0;
            while ((i in a) && (i in b) && a[i] == b[i]) i++;
            return (i in b) ? 0 : i;
        }


        var originPath = current.path.split('/');
        var clen = preCommonLength(originPath, fromPath);
        if (clen) {
            var movedPath = toPath.concat(originPath.slice(clen));
            current.path = movedPath.join('/');
            current.title = movedPath.pop();
            ret.fire('docchange', current);
        }
    }

    var locked = false;

    ret.lock = function() { locked = true; };
    ret.unlock = function() { locked = false; };

    /**
     * 加载文档
     *
     * @param  {Object} doc 文档的属性，可包括：
     *     doc.content  {string} [Required] 文档内容
     *     doc.protocol {string} [Required] 内容所使用的编码协议
     *     doc.title    {string} 文档的标题
     *     doc.source   {string} 文档的来源
     *     doc.path     {string} 文档的路径
     *     doc.saved    {bool}   文档的保存状态
     *
     * @event docload(doc)
     *     doc - 文档解析之后的文档对象
     *
     * @return {Promise<doc>} 返回解析完之后的文档对象，解析的结果为 doc.data
     */
    function load(doc) {
        if (locked) return Promise.reject(new Error('doc was locked'));

        var restore = doc;

        current = doc;

        loading = true;

        return minder.importData(doc.content, doc.protocol).then(function(data) {

            doc.title = doc.title || minder.getMinderTitle();

            minder.execCommand('camera', minder.getRoot(), 300);

            doc.data = data;
            doc.json = JSON.stringify(data);

            ret.fire('docload', doc);
            ret.fire('docchange', doc);

            return doc;

        })['catch'](function(e) {
            current = restore;
            notice.error('err_doc_resolve', e);
        }).then(function(doc) {
            loading = false;
            if (doc)
                notice.info(minder.getLang('ui.load_success', doc.title));
            return doc;
        });
    }

    function save(doc) {
        current = doc;
        doc.data = minder.exportJson();
        doc.json = JSON.stringify(doc.data);
        doc.saved = true;

        ret.fire('docsave', doc);
        ret.fire('docchange', doc);
    }

    function getCurrent() {
        return current;
    }

    function checkSaved(noConfirm) {
        if (!fio.user.current()) return true;
        if (locked) return false;
        if (noConfirm) return current.saved;
        return current.saved || window.confirm(minder.getLang('ui.unsavedcontent', '* ' + current.title));
    }

    /* 绕开初始化时候的乱事件 */
    setTimeout(function() {
        minder.on('contentchange', function() {
            if (loading) return;

            if (current.source != 'netdisk') {

                current.title = minder.getMinderTitle();
                current.saved = false;

            } else {
                current.saved = current.json == JSON.stringify(minder.exportJson());
            }

            ret.fire('docchange', current);
        });
    }, 1000);


    ret.load = load;
    ret.save = save;
    ret.current = getCurrent;
    ret.checkSaved = checkSaved;

    return ret;
});