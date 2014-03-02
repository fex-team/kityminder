//splitbutton 类
///import button
KM.ui.define('splitbutton',{
    tpl :'<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
                '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
        '</div>',
    defaultOpt:{
        text:'',
        title:'',
        click:function(){}
    },
    init : function(options){
        var me = this;
        me.root( $($.parseTmpl(me.tpl,options)));
        me.root().find('.kmui-btn:first').click(function(evt){
            if(!me.disabled()){
                $.proxy(options.click,me)();
            }
        });
        me.root().find('.kmui-dropdown-toggle').click(function(){
            if(!me.disabled()){
                me.trigger('arrowclick')
            }
        });
        me.root().hover(function () {
            if(!me.root().hasClass("kmui-disabled")){
                me.root().toggleClass('kmui-hover')
            }
        });

        return me;
    },
    wrapclick:function(fn,evt){
        if(!this.disabled()){
            $.proxy(fn,this,evt)()
        }
        return this;
    },
    disabled : function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-disabled')
        }
        this.root().toggleClass('kmui-disabled',state).find('.kmui-btn').toggleClass('kmui-disabled',state);
        return this;
    },
    active:function(state){
        if(state === undefined){
            return this.root().hasClass('kmui-active')
        }
        this.root().toggleClass('kmui-active',state).find('.kmui-btn:first').toggleClass('kmui-active',state);
        return this;
    },
    mergeWith:function($obj){
        var me = this;
        me.data('$mergeObj',$obj);
        $obj.kmui().data('$mergeObj',me.root());
        if(!$.contains(document.body,$obj[0])){
            $obj.appendTo(me.root());
        }
        me.root().delegate('.kmui-dropdown-toggle','click',function(){
            me.wrapclick(function(){
                $obj.kmui().show();
            })
        });
        me.register('click',me.root().find('.kmui-dropdown-toggle'),function(evt){
            $obj.hide()
        });
    }
});