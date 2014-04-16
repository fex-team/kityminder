/**
 * Created with JetBrains PhpStorm.
 * User: hn
 * Date: 13-5-29
 * Time: 下午8:01
 * To change this template use File | Settings | File Templates.
 */

(function(){

    var widgetName = 'combobox',
        itemClassName = 'kmui-combobox-item',
        HOVER_CLASS = 'kmui-combobox-item-hover',
        ICON_CLASS = 'kmui-combobox-checked-icon',
        labelClassName = 'kmui-combobox-item-label';

    KM.ui.define( widgetName, ( function(){

        return {
            tpl: "<ul class=\"dropdown-menu kmui-combobox-menu<%if (comboboxName!=='') {%> kmui-combobox-<%=comboboxName%><%}%>\" unselectable=\"on\" onmousedown=\"return false\" role=\"menu\" aria-labelledby=\"dropdownMenu\">" +
                "<%if(autoRecord) {%>" +
                "<%for( var i=0, len = recordStack.length; i<len; i++ ) {%>" +
                "<%var index = recordStack[i];%>" +
                "<li class=\"<%=itemClassName%><%if( selected == index ) {%> kmui-combobox-checked<%}%><%if( disabled[ index ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=index%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ index ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=items[index]%></label>" +
                "</li>" +
                "<%}%>" +
                "<%if( i ) {%>" +
                "<li class=\"kmui-combobox-item-separator\"></li>" +
                "<%}%>" +
                "<%}%>" +
                "<%for( var i=0, label; label = items[i]; i++ ) {%>" +
                "<li class=\"<%=itemClassName%><%if( selected == i && enabledSelected ) {%> kmui-combobox-checked<%}%> kmui-combobox-item-<%=i%><%if( disabled[ i ] === true ) {%> kmui-combobox-item-disabled<%}%>\" data-item-index=\"<%=i%>\" unselectable=\"on\" onmousedown=\"return false\">" +
                "<span class=\"kmui-combobox-icon\" unselectable=\"on\" onmousedown=\"return false\"></span>" +
                "<label class=\"<%=labelClassName%>\" style=\"<%=itemStyles[ i ]%>\" unselectable=\"on\" onmousedown=\"return false\"><%=label%></label>" +
                "</li>" +
                "<%}%>" +
                "</ul>",
            defaultOpt: {
                //记录栈初始列表
                recordStack: [],
                //可用项列表
                items: [],
		        //item对应的值列表
                value: [],
                comboboxName: '',
                selected: '',
                //初始禁用状态
                disabled: {},
                //自动记录
                autoRecord: true,
                //最多记录条数
                recordCount: 5,
                enabledRecord:true,
                enabledSelected:true
            },
            init: function( options ){

                var me = this;

                $.extend( me._optionAdaptation( options ), me._createItemMapping( options.recordStack, options.items ), {
                    itemClassName: itemClassName,
                    iconClass: ICON_CLASS,
                    labelClassName: labelClassName
                } );

                this._transStack( options );

                me.root( $( $.parseTmpl( me.tpl, options ) ) );

                this.data( 'options', options ).initEvent();

            },
            initEvent: function(){

                var me = this;

                me.initSelectItem();

                this.initItemActive();

            },
            setLabelWithDefaultValue : function(){
                var $btn = this.data('button');
                $btn.kmui().label($btn.data('original-title'))
            },
            /**
             * 初始化选择项
             */
            initSelectItem: function(){

                var me = this,
                    options = me.data( "options" ),
                    labelClass = "."+labelClassName;

                me.root().delegate('.' + itemClassName, 'click', function(){

                    var $li = $(this),
                        index = $li.attr('data-item-index');

                    if ( options.disabled[ index ] ) {
                        return false;
                    }

                    me.trigger('comboboxselect', {
                        index: index,
                        label: $li.find(labelClass).text(),
                        value: me.data('options').value[ index ]
                    }).select( index );

                    me.hide();
                    me.trigger('aftercomboboxselect');
                    return false;

                });

            },
            initItemActive: function(){
                var fn = {
                    mouseenter: 'addClass',
                    mouseleave: 'removeClass'
                };
                if ($.IE6) {
                    this.root().delegate( '.'+itemClassName,  'mouseenter mouseleave', function( evt ){
                        $(this)[ fn[ evt.type ] ]( HOVER_CLASS );
                    }).one('afterhide', function(){
                    });
                }
            },
            /**
             * 选择给定索引的项
             * @param index 项索引
             * @returns {*} 如果存在对应索引的项，则返回该项；否则返回null
             */
            select: function( index ){


                var options = this.data( 'options' ),
                    itemCount = options.itemCount,
                    items = options.autowidthitem;

                if ( items && !items.length ) {
                    items = options.items;
                }

                // 禁用
                if ( options.disabled[ index ] ) {
                    return null;
                }

                if( itemCount == 0 ) {
                    return null;
                }

                if( index < 0 ) {

                    index = itemCount + index % itemCount;

                } else if ( index >= itemCount ) {

                    index = itemCount-1;

                }

                this.trigger( 'changebefore', items[ index ] );


                this._update( index );

                this.trigger( 'changeafter', items[ index ] );

                return null;

            },
            selectItemByLabel: function( label ){

                var itemMapping = this.data('options').itemMapping,
                    me = this,
                    index = null;

                !$.isArray( label ) && ( label = [ label ] );

                $.each( label, function( i, item ){

                    index = itemMapping[ item ];

                    if( index !== undefined ) {

                        me.select( index );
                        return false;

                    }

                } );

            },
            getItems: function () {
                return this.data( "options" ).items;
            },
            traverseItems:function(fn){
                var values = this.data('options').value;
                var labels = this.data('options').items;
                $.each(labels,function(i,label){
                    fn(label,values[i])
                });
                return this;
            },
            getItemMapping: function () {
                return this.data( "options" ).itemMapping;
            },

            disableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                options.disabled[ index ] = true;

                this._repaint();

            },

            disableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.disableItemByIndex( index );
                }

                return false;

            },

            enableItemByIndex: function ( index ) {

                var options = this.data( "options" );
                delete options.disabled[ index ];

                this._repaint();

            },

            enableItemByLabel: function ( label ) {

                var itemMapping = this.data('options').itemMapping,
                    index = itemMapping[ label ];

                if ( typeof index === "number" ) {
                    return this.enableItemByIndex( index );
                }

                return false;

            },

            /**
             * 转换记录栈
             */
            _transStack: function( options ) {

                var temp = [],
                    itemIndex = -1,
                    selected = -1;

                $.each( options.recordStack, function( index, item ){

                    itemIndex = options.itemMapping[ item ];

                    if( $.isNumeric( itemIndex ) ) {

                        temp.push( itemIndex );

                        //selected的合法性检测
                        if( item == options.selected ) {
                            selected = itemIndex;
                        }

                    }

                } );

                options.recordStack = temp;
                options.selected = selected;
                temp = null;

            },
            _optionAdaptation: function( options ) {

                if( !( 'itemStyles' in options ) ) {

                    options.itemStyles = [];

                    for( var i = 0, len = options.items.length; i < len; i++ ) {
                        options.itemStyles.push('');
                    }

                }

                options.autowidthitem = options.autowidthitem || options.items;
                options.itemCount = options.items.length;

                return options;

            },
            _createItemMapping: function( stackItem, items ){

                var temp = {},
                    result = {
                        recordStack: [],
                        mapping: {}
                    };

                $.each( items, function( index, item ){
                    temp[ item ] = index;
                } );

                result.itemMapping = temp;

                $.each( stackItem, function( index, item ){

                    if( temp[ item ] !== undefined ) {
                        result.recordStack.push( temp[ item ] );
                        result.mapping[ item ] = temp[ item ];
                    }

                } );

                return result;

            },
            _update: function ( index ) {

                var options = this.data("options"),
                    newStack = [];
                debugger
                if(this.data('options').enabledRecord){
                    $.each( options.recordStack, function( i, item ){

                        if( item != index ) {
                            newStack.push( item );
                        }

                    } );

                    //压入最新的记录
                    newStack.unshift( index );

                    if( newStack.length > options.recordCount ) {
                        newStack.length = options.recordCount;
                    }

                    options.recordStack = newStack;
                }

                options.selected = index;

                this._repaint();

                newStack = null;

            },

            _repaint: function () {

                var newChilds = $( $.parseTmpl( this.tpl, this.data("options") ) );

                //重新渲染
                this.root().html( newChilds.html() );

                newChilds = null;

            }
        };

    } )(), 'menu' );

})();
