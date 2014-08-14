kity.extendClass(FUI.Widget, {
    setEnable: function(value) {
        if (value === false) this.disable();
        else this.enable();
    },

    setActive: function(value) {
        if (value === false) this.removeClass('active');
        else this.addClass('active');
    },

    bindCommandState: function(minder, command, valueHandle) {
        var $widget = this;
        minder.on('interactchange', function() {
            $widget.setEnable(this.queryCommandState(command) !== -1);
            $widget.setActive(this.queryCommandState(command) === 1);
            if (valueHandle) valueHandle.call($widget, this.queryCommandValue(command));
        });
    }
});