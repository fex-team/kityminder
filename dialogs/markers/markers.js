(function(){
    var utils = KM.utils;
    function hrefStartWith(href, arr) {
        href = href.replace(/^\s+|\s+$/g, '');
        for (var i = 0, ai; ai = arr[i++];) {
            if (href.indexOf(ai) == 0) {
                return true;
            }
        }
        return false;
    }

    KM.registerWidget('markers', {
        tpl: "<style type=\"text/css\">" +
            ".kmui-dialog-link .kmui-link-table{font-size: 12px;margin: 10px;line-height: 30px}" +
            ".kmui-dialog-link .kmui-link-txt{width:300px;height:21px;line-height:21px;border:1px solid #d7d7d7;}" +
            "</style>" +
            "<table class=\"kmui-link-table\">" +
            "<tr>" +
            "<td><label for=\"href\"><%=lang_input_url%></label></td>" +
            "<td><input class=\"kmui-link-txt\" id=\"kmui-link-Jhref\" type=\"text\" /></td>" +
            "</tr>" +
            "<tr>" +
            "<td><label for=\"title\"><%=lang_input_title%></label></td>" +
            "<td><input class=\"kmui-link-txt\" id=\"kmui-link-Jtitle\" type=\"text\"/></td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan=\"2\">" +
            "<label for=\"target\"><%=lang_input_target%></label>" +
            "<input id=\"kmui-link-Jtarget\" type=\"checkbox\"/>" +
            "</td>" +
            "</tr>" +

            "</table>",
        initContent: function (km) {
            var lang = km.getLang('dialogs.markers');
            if (lang) {
                var html = $.parseTmpl(this.tpl, lang.static);
            }
            this.root().html(html);
        },
        initEvent: function (km, $w) {
            var link = km.queryCommandValue('link');
            if(link){
                $('#kmui-link-Jhref',$w).val(utils.html($(link).attr('href')));
                $('#kmui-link-Jtitle',$w).val($(link).attr('title'));
                $(link).attr('target') == '_blank' && $('#kmui-link-Jtarget').attr('checked',true)
            }
        },
        buttons: {
            'ok': {
                exec: function (km, $w) {
                    var href = $('#kmui-link-Jhref').val().replace(/^\s+|\s+$/g, '');

                    if (href) {
                        km.execCommand('link', {
                            'href': href,
                            'target': $("#kmui-link-Jtarget:checked").length ? "_blank" : '_self',
                            'title': $("#kmui-link-Jtitle").val().replace(/^\s+|\s+$/g, ''),
                            '_href': href
                        });
                    }
                }
            },
            'cancel':{}
        },
        width: 400
    })
})();

