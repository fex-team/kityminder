/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-7-10
 * Time: 下午3:07
 * To change this template use File | Settings | File Templates.
 */
KM.ui.define('colorsplitbutton',{

    tpl : '<div class="kmui-splitbutton <%if (name){%>kmui-splitbutton-<%= name %><%}%>"  unselectable="on" <%if(title){%>data-original-title="<%=title%>"<%}%>><div class="kmui-btn"  unselectable="on" ><%if(icon){%><div  unselectable="on" class="kmui-icon-<%=icon%> kmui-icon"></div><%}%><div class="kmui-splitbutton-color-label" <%if (color) {%>style="background: <%=color%>"<%}%>></div><%if(text){%><%=text%><%}%></div>'+
            '<div  unselectable="on" class="kmui-btn kmui-dropdown-toggle" >'+
            '<div  unselectable="on" class="kmui-caret"><\/div>'+
            '</div>'+
            '</div>',
    defaultOpt: {
        color: ''
    },
    init: function( options ){

        var me = this;

        me.supper.init.call( me, options );

    },
    colorLabel: function(){
        return this.root().find('.kmui-splitbutton-color-label');
    }

}, 'splitbutton');