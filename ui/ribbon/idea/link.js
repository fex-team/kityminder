/**
 * @fileOverview
 *
 * 插入和管理超链接
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/link', function(minder) {

    var $attachment = minder.getUI('ribbon/idea/attachment');

    var $linkButtonMenu = new FUI.ButtonMenu({
        id: 'link-button-menu',
        text: minder.getLang('ui.link'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.link')
        }],
        menu: {
            items: [minder.getLang('ui.removelink')]
        }
    }).appendTo($attachment);

    $linkButtonMenu.bindCommandState(minder, 'hyperlink');

    var $linkDialog = new FUI.Dialog({
        width: 600,
        height: 200,
        caption: minder.getLang('ui.link')
    }).appendTo(document.getElementById('content-wrapper'));

    var $dialogBody = $($linkDialog.getBodyElement());

    $dialogBody.html([
        '<p><label>连接地址：</label><input type="url" class="link-href" /></p>',
        '<p><label>提示文本：</label><input type="text" class="link-title /"></p>'
    ].join(''));

    var $href = $dialogBody.find('.link-href');
    var $ok = $linkDialog.getButton(0);
    var $errorMsg = $('<span class="validate-error"></span>');

    function error(value) {
        if (value) {
            $href.addClass('validate-error');
            $errorMsg.text('地址格式错误');
            $ok.disable();
        } else {
            $href.removeClass('validate-error');
            $errorMsg.text('');
            $ok.enable();
        }
    }

    $href.after($errorMsg);

    $href.on('input', function() {
        var url = $href.val();
        error(!/^https?\:\/\/(\w+\.)+\w+/.test(url));
    });

    $linkButtonMenu.on('buttonclick', function() {
        $linkDialog.open();
        $href[0].focus();
    });

    $linkButtonMenu.on('select', function() {
        minder.execCommand('unhyperlink');
    });

    $linkDialog.on('ok', function() {
        minder.execCommand('hyperlink', $href.val());
    });

    $linkDialog.on('open', function() {
        $href.val(minder.queryCommandValue('hyperlink'));
        error(false);
    });

    $(minder.getPaper().getNode()).delegate('a', 'click', function(e) {
        var $a = $(e.target).closest('a');
        var href = $a.prop('href').baseVal;
        if (window.confirm(minder.getLang('ui.redirect', href))) {
            window.open(href, '_blank');
        }
        e.preventDefault();
    });

    return $linkButtonMenu;
});