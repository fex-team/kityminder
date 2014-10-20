/**
 * @fileOverview
 *
 * 显示并更新脑图文件的标题
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/title', function(minder) {
    var $title = $('<h1>').appendTo('#panel');

    var _title = minder.getLang('ui.untitleddoc');
    var _saved = false;

    function update() {

        function setTitle(title) {
            $title.text(title);
            document.title = title + ' - 百度脑图';
        }

        if (_saved) {
            setTitle(_title);
        } else {
            setTitle('* ' + _title);
        }
    }

    update();

    return {
        $title: $title,

        setTitle: function(title, saved) {
            _title = title;

            return this.setSaved(saved);
        },

        getTitle: function() {
            return _title;
        },

        setSaved: function(saved) {

            _saved = saved !== false;

            update();

            return this;
        }
    };
});