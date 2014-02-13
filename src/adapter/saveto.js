KM.registerUI('saveto', function( name ) {

    var me = this,
        label = me.getLang('tooltips.' + name),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;


    utils.each(KityMinder.getAllRegisteredProtocals(),function(k){

        options.value.push(k);
        options.items.push(k);
        options.autowidthitem.push($.wordCountAdaptive( k ) );
    });


    //实例化
    $combox =  $.kmuibuttoncombobox(options).css('zIndex',me.getOptions('zIndex') + 1);
    comboboxWidget =  $combox.kmui();

    comboboxWidget.on('comboboxselect', function( evt, res ){
        alert(me.exportData(res.value));
    }).on("beforeshow", function(){
        if( $combox.parent().length === 0 ) {
            $combox.appendTo(  me.$container.find('.kmui-dialog-container') );
        }
    }).on('aftercomboboxselect',function(){
            this.setLabelWithDefaultValue()
        });



    return comboboxWidget.button().addClass('kmui-combobox');

});

