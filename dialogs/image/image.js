(function(utils) {
    var content = '<div class="image-content" style="padding:20px;width:360px;">';
    content += '<style>';
    content += '.kmui-dialog-<%= container %> input{';
    content += 'width: 74%;';
    content += 'padding: 6px 12px;';
    content += 'font-size: 14px;';
    content += 'line-height: 1.42857143;';
    content += 'color: #555;';
    content += 'background-color: #fff;';
    content += 'background-image: none;';
    content += 'border: 1px solid #ccc;';
    content += 'border-radius: 4px; -webkit-box-shadow: inset 0 1px 1px rgba( 0, 0, 0, .075 );'
    content += 'box-shadow: inset 0 1px 1px rgba( 0, 0, 0, .075 ); -webkit-transition: border-color ease-in-out .15s,';
    content += 'box-shadow ease-in-out .15s;';
    content += 'transition: border-color ease-in-out .15s,';
    content += 'box-shadow ease-in-out .15s;';
    content += '}';
    content += '.kmui-dialog-<%= container %> input:focus{';
    content += 'border-color: #66afe9;';
    content += 'outline: 0;';
    content += '-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);';
    content += 'box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);';
    content += '}';
    content += '.kmui-dialog-<%= container %> button{';
    content += 'height:34px;';
    content += 'line-height:34px;';
    content += 'vertical-align:1px';
    content += '}';
    content += '</style>';
    content += '<input id="image_href"/>';
    content += '<button id="image_insert">插入</button>';
    content += '<hr style="height: 0; border: none; border-top: 1px solid #ccc;">';
    content += '<img id="image_preview" style="max-width: 360px;"/>';
    content += '</div>';



    KM.registerWidget('image', {
        tpl: content,
        initContent: function(km) {
            var lang = km.getLang('dialogs.image'),
                html;
            if (lang) {
                html = $.parseTmpl(this.tpl, utils.extend({
                    'container': 'image'
                }, lang));
            }
            this.root().html(html);
        },
        initEvent: function(km, $w) {
            var $btn = $w.find('#image_insert').attr('disabled', 'disabled');
            var $href = $w.find('#image_href').on('input', function() {
                var url = $href.val();
                if (!/^https?\:\/\/(\w+\.)+\w+/.test(url)) {
                    $href.css('color', 'red');
                    $href.data('error', true);
                } else {
                    $href.css('color', 'black');
                    $href.data('error', false);
                }
                $w.find('#image_preview').attr('src', $href.val());
            });
            $w.find('#image_preview').on('load', function() {
                $btn.removeAttr('disabled');
            }).on('error', function() {
                $btn.attr('disabled', 'disabled');
            });
            $btn.on('click', function() {
                if ($btn.attr('disabled')) return;
                km.execCommand('image', $href.val());
                $w.kmui().hide();
            });
            $href.on('keydown', function(e) {
                if (e.keyCode === 13) {
                    $btn.click();
                }
            });
            var url = km.queryCommandValue('image');
            var $input = $w.find('#image_href');
            $input.val(url || 'http://');
            if (url) $w.find('#image_preview').attr('src', url);
            setTimeout(function() {
                $input.select();
            });
        },
        width: 400
    });
})(KM.Utils);