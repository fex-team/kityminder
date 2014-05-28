(function (utils) {
    KM.registerWidget('markers', {
        tpl: "<style>" +
            ".kmui-dialog-<%= container %> .priority .icon{background:url(dialogs/markers/images/iconpriority.png) 0 0}" +
            ".kmui-dialog-<%= container %> .progress .icon{background:url(dialogs/markers/images/iconprogress.png) 0 0}" +
            ".kmui-dialog-<%= container %> .icon.p2{background-position: -20px 0}" +
            ".kmui-dialog-<%= container %> .icon.p3{background-position: -40px 0}" +
            ".kmui-dialog-<%= container %> .icon.p4{background-position: -60px 0}" +
            ".kmui-dialog-<%= container %> .icon.p5{background-position: -80px 0}" +
            ".kmui-dialog-<%= container %> .icon.p6{background-position: -100px 0}" +
            ".kmui-dialog-<%= container %> .icon.p7{background-position: -120px 0}" +
            ".kmui-dialog-<%= container %> .icon.p8{background-position: -140px 0}" +
            ".kmui-dialog-<%= container %> .icon.p9{background-position: -160px 0}" +
            ".kmui-dialog-<%= container %> .icon.p0{background-position: -180px 0}" +
            ".kmui-dialog-<%= container %> ul li{width:40%;display:inline-block}" +
            ".kmui-dialog-<%= container %> h4{padding:5px 10px; margin:0; background:#eee}" +
            "</style>" +
            "<h4><%= priority %></h3>" +
            "<ul class='icon-list priority'>" +
            "<li value='1' type='priority'><span class='icon p1'></span><span><%= priority %>1</span></li>" +
            "<li value='2' type='priority'><span class='icon p2'></span><span><%= priority %>2</span></li>" +
            "<li value='3' type='priority'><span class='icon p3'></span><span><%= priority %>3</span></li>" +
            "<li value='4' type='priority'><span class='icon p4'></span><span><%= priority %>4</span></li>" +
            "<li value='5' type='priority'><span class='icon p5'></span><span><%= priority %>5</span></li>" +
            "<li value='6' type='priority'><span class='icon p6'></span><span><%= priority %>6</span></li>" +
            "<li value='7' type='priority'><span class='icon p7'></span><span><%= priority %>7</span></li>" +
            "<li value='8' type='priority'><span class='icon p8'></span><span><%= priority %>8</span></li>" +
            "<li value='9' type='priority'><span class='icon p9'></span><span><%= priority %>9</span></li>" +
            "<li value='0' type='priority'><span class='icon p0'></span><span><%= none %></span></li>" +
            "</ul>" +
            "<h4><%= progress.title %></h4>" +
            "<ul class='icon-list progress'>" +
            "<li value='1' type='progress'><span class='icon p1'></span><span><%= progress.notdone %></span></li>" +
            "<li value='2' type='progress'><span class='icon p2'></span><span><%= progress.done1 %></span></li>" +
            "<li value='3' type='progress'><span class='icon p3'></span><span><%= progress.done2 %></span></li>" +
            "<li value='4' type='progress'><span class='icon p4'></span><span><%= progress.done3 %></span></li>" +
            "<li value='5' type='progress'><span class='icon p5'></span><span><%= progress.done4 %></span></li>" +
            "<li value='6' type='progress'><span class='icon p6'></span><span><%= progress.done5 %></span></li>" +
            "<li value='7' type='progress'><span class='icon p7'></span><span><%= progress.done6 %></span></li>" +
            "<li value='8' type='progress'><span class='icon p8'></span><span><%= progress.done7 %></span></li>" +
            "<li value='9' type='progress'><span class='icon p9'></span><span><%= progress.done %></span></li>" +
            "<li value='0' type='progress'><span class='icon p0'></span><span><%= none %></span></li>" +
            "</ul>",
        initContent: function (km, $w) {
            var lang = km.getLang('dialogs.markers');
            if (lang) {
                var html = $.parseTmpl(this.tpl, utils.extend({
                    'container': 'markers'
                }, lang));
            }
            this.root().html(html);
            var valPri = km.queryCommandValue("priority") || 0;
            var valPro = km.queryCommandValue("progress") || 0;
            $w.find("li[type='priority']").removeClass("active");
            $w.find("li[type='priority'][value='" + valPri + "']").addClass("active");
            $w.find("li[type='progress']").removeClass("active");
            $w.find("li[type='progress'][value='" + valPro + "']").addClass("active");
        },
        initEvent: function (km, $w) {
            $w.on("click", "li", function () {
                var $this = $(this);
                $this.siblings().removeClass("active");
                var val = $this.val();
                var type = $this.attr("type");
                km.execCommand(type, val);
            });
            km.on('interactchange', function (e) {
                var valPri = this.queryCommandValue("priority");
                var valPro = this.queryCommandValue("progress");
                $w.find("li[type='priority']").removeClass("active");
                $w.find("li[type='priority'][value='" + valPri + "']").addClass("active");
                $w.find("li[type='progress']").removeClass("active");
                $w.find("li[type='progress'][value='" + valPro + "']").addClass("active");
            });
        },
        width: 200

    })
})(KM.Utils);