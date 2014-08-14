KityMinder.registerUI('image', ['attachment'], function (minder, $attachment) {

    var $imageButtonMenu = new FUI.ButtonMenu({
        id: 'image-button-menu',
        text: minder.getLang('ui.image'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.image')
        }],
        menu: {
            items: [minder.getLang('ui.removeimage')]
        }
    }).appendTo($attachment);

    $imageButtonMenu.bindCommandState(minder, 'image');

    var $imageDialog = new FUI.Dialog({
        width: 500,
        height: 400,
        caption: minder.getLang('ui.image')
    }).appendTo(document.getElementById('content-wrapper'));

    $imageDialog.on('ok', function() {
        minder.execCommand('image', $url.val());
    });

    $imageDialog.on('open', function() {
        $url.val(minder.queryCommandValue('image'));
        $preview.attr('src', '');
        error(false);
    });

    var $dialogBody = $($imageDialog.getBodyElement());

    $dialogBody.html([
        '<p><label>图片地址：</label><input type="url" class="image-url" /></p>',
        '<p><label>提示文本：</label><input type="text" class="image-title /"></p>',
        '<img class="image-preview" src="" style="max-height: 200px;" />'
    ].join(''));

    var $url = $dialogBody.find('.image-url');
    var $preview = $dialogBody.find('.image-preview');
    var $ok = $imageDialog.getButton(0);
    var $errorMsg = $('<span class="validate-error"></span>');

    function error(value) {
        if (value) {
            $url.addClass('validate-error');
            $errorMsg.text('图片无法加载');
            $ok.disable();
        } else {
            $url.removeClass('validate-error');
            $errorMsg.text('');
            $ok.enable();
        }
        return value;
    }

    $url.after($errorMsg);

    $url.on('input', function() {
        var url = $url.val();
        if (/^https?\:\/\/(\w+\.)+\w+/.test(url)) {
            $preview.attr('src', url);
            error(false);
            $ok.disable();
            $preview.addClass('loading');
        } else {
            error(true);
        }
    });

    $preview.on('load', function() {
        error(false);
        $preview.removeClass('loading');
    }).on('error', function() {
        if($preview.attr('src')) error(true);
        $preview.removeClass('loading');
    });

    $imageButtonMenu.on('buttonclick', function() {
        $imageDialog.open();
        $url[0].focus();
    });

    $imageButtonMenu.on('select', function() {
        minder.execCommand('removeimage');
    });

    return $imageButtonMenu;
});