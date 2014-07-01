(function(utils) {
    //todo 这里先写死成中文
    var content = '<div class="hyperlink-content" style="padding:20px;width:360px;">';
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
    content += '<input id="hyperlink_href"/>';
    content += '<button id="hyperlink_insert">插入</button>';
    content += '</div>';



    KM.registerWidget('hyperlink', {
        tpl: content,
        initContent: function(km) {
            var lang = km.getLang('dialogs.hyperlink'),
                html;
            if (lang) {
                html = $.parseTmpl(this.tpl, utils.extend({
                    'container': 'hyperlink'
                }, lang));
            }
            this.root().html(html);
        },
        initEvent: function(km, $w) {
            var $btn = $w.find('#hyperlink_insert');
            $btn.attr('disabled', 'disabled');
            var $href = $w.find('#hyperlink_href').on('input', function() {
                var url = $href.val();
                if (!/^https?\:\/\/(\w+\.)+\w+/.test(url)) {
                    $href.css('color', 'red');
                    $href.data('error', true);
                    $btn.attr('disabled', 'disabled');
                } else {
                    $href.css('color', 'black');
                    $href.data('error', false);
                    $btn.removeAttr('disabled');
                }
            });
            $btn.on('click', function() {
                if ($btn.attr('disabled')) return;
                var url = $w.find('#hyperlink_href').val();
                km.execCommand('hyperlink', url);
                $w.kmui().hide();
            });
            $w.find('#hyperlink_href').on('keydown', function(e) {
                if (e.keyCode === 13) {
                    $btn.click();
                }
            });
            var url = km.queryCommandValue('hyperlink');
            var $input = $w.find('#hyperlink_href');
            $input.val(url || 'http://');
            setTimeout(function() {
                $input.select();
            });
        },
        width: 400
    });
})(KM.Utils);