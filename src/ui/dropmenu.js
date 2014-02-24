//dropmenu 类
KM.ui.define('dropmenu', {
    tmpl: '<ul class="kmui-dropdown-menu" aria-labelledby="dropdownMenu" >' +
        this.subTmpl +
        '</ul>',
    subTmpl: '<%if(data && data.length){for(var i=0,ci;ci=data[i++];){%>' +
        '<%if(ci.divider){%><li class="kmui-divider"></li><%}else{%>' +
        '<li <%if(ci.active||ci.disabled){%>class="<%= ci.active|| \'\' %> <%=ci.disabled||\'\' %>" <%}%> data-value="<%= ci.value%>">' +
        '<a href="#" tabindex="-1"><em class="kmui-dropmenu-checkbox"><i class="kmui-icon-ok"></i></em><%= ci.label%></a>' +
        '</li><%}}%>' +
        '<%}%>',
    defaultOpt: {
        data: [],
        click: function () {
        }
    },
    setData:function(items){
        this.root().html($.parseTmpl(this.subTmpl,items));
        return this;
    },
    position:function(offset){
        this.root().offset(offset);
        return this;
    },
    show:function(){
        if(this.trigger('beforeshow') === false){
            return;
        }else{
            this.root().css({display:'block'});
            this.trigger('aftershow');
        }
        return this;
    },
    init: function (options) {
        var me = this;
        var eventName = {
            click: 1,
            mouseover: 1,
            mouseout: 1
        };

        this.root($($.parseTmpl(this.tmpl, options))).on('click', 'li[class!="kmui-disabled kmui-divider kmui-dropdown-submenu"]',function (evt) {
            $.proxy(options.click, me, evt, $(this).data('value'), $(this))()
        }).find('li').each(function (i, el) {
                var $this = $(this);
                if (!$this.hasClass("kmui-disabled kmui-divider kmui-dropdown-submenu")) {
                    var data = options.data[i];
                    $.each(eventName, function (k) {
                        data[k] && $this[k](function (evt) {
                            $.proxy(data[k], el)(evt, data, me.root)
                        })
                    })
                }
            })

    },
    disabled: function (cb) {
        $('li[class!=kmui-divider]', this.root()).each(function () {
            var $el = $(this);
            if (cb === true) {
                $el.addClass('kmui-disabled')
            } else if ($.isFunction(cb)) {
                $el.toggleClass('kmui-disabled', cb(li))
            } else {
                $el.removeClass('kmui-disabled')
            }

        });
    },
    val: function (val) {
        var currentVal;
        $('li[class!="kmui-divider kmui-disabled kmui-dropdown-submenu"]', this.root()).each(function () {
            var $el = $(this);
            if (val === undefined) {
                if ($el.find('em.kmui-dropmenu-checked').length) {
                    currentVal = $el.data('value');
                    return false
                }
            } else {
                $el.find('em').toggleClass('kmui-dropmenu-checked', $el.data('value') == val)
            }
        });
        if (val === undefined) {
            return currentVal
        }
    },
    addSubmenu: function (label, menu, index) {
        index = index || 0;

        var $list = $('li[class!=kmui-divider]', this.root());
        var $node = $('<li class="kmui-dropdown-submenu"><a tabindex="-1" href="#">' + label + '</a></li>').append(menu);

        if (index >= 0 && index < $list.length) {
            $node.insertBefore($list[index]);
        } else if (index < 0) {
            $node.insertBefore($list[0]);
        } else if (index >= $list.length) {
            $node.appendTo($list);
        }
    }
}, 'menu');