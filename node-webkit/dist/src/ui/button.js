//button 类
KM.ui.define('button', {
    tpl: '<<%if(!texttype){%>div class="kmui-btn kmui-btn-<%=icon%> <%if(name){%>kmui-btn-name-<%=name%><%}%>" unselectable="on" onmousedown="return false" <%}else{%>a class="kmui-text-btn"<%}%><% if(title) {%> data-original-title="<%=title%>" <%};%>> ' +
        '<% if(icon) {%><div unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><% }; %><%if(text) {%><span unselectable="on" onmousedown="return false" class="kmui-button-label"><%=text%></span><%}%>' +
        '<%if(caret && text){%><span class="kmui-button-spacing"></span><%}%>' +
        '<% if(caret) {%><span unselectable="on" onmousedown="return false" class="kmui-caret"></span><% };%></<%if(!texttype){%>div<%}else{%>a<%}%>>',
    defaultOpt: {
        text: '',
        title: '',
        icon: '',
        width: '',
        caret: false,
        texttype: false,
        click: function () {
        }
    },
    init: function (options) {
        var me = this;

        me.root($($.parseTmpl(me.tpl, options)))
            .click(function (evt) {
                me.wrapclick(options.click, evt)
            });

        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        })

        return me;
    },
    wrapclick: function (fn, evt) {
        if (!this.disabled()) {
            this.root().trigger('wrapclick');
            $.proxy(fn, this, evt)()
        }
        return this;
    },
    label: function (text) {
        if (text === undefined) {
            return this.root().find('.kmui-button-label').text();
        } else {
            this.root().find('.kmui-button-label').text(text);
            return this;
        }
    },
    disabled: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled', state);
        if(this.root().hasClass('kmui-disabled')){
            this.root().removeClass('kmui-hover')
        }
        return this;
    },
    active: function (state) {
        if (state === undefined) {
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active', state)

        return this;
    },
    mergeWith: function ($obj) {
        var me = this;
        me.data('$mergeObj', $obj);
        $obj.kmui().data('$mergeObj', me.root());
        if (!$.contains(document.body, $obj[0])) {
            $obj.appendTo(me.root());
        }
        me.on('click',function () {
            me.wrapclick(function () {
                $obj.kmui().show();
            })
        }).register('click', me.root(), function (evt) {
                $obj.hide()
            });
    }
});