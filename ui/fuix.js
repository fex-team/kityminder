/**
 * @fileOverview
 *
 * 拓展 FUI 组件的功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

kity.extendClass(FUI.Widget, {
    setEnable: function(value) {
        if (value === false) this.disable();
        else this.enable();
    },

    setActive: function(value) {
        if (value === false) this.removeClass('active');
        else this.addClass('active');
    },

    bindExecution: function(event, fn) {
        var widget = this;
        widget.on(event, function() {
            if (widget.interactFlag) return;
            fn.apply(widget, arguments);
        });
    },

    bindCommandState: function(minder, command, valueHandle) {
        var widget = this;
        minder.on('interactchange', function() {
            widget.interactFlag = true;
            if (valueHandle) {
                var value = this.queryCommandValue(command);
                if (value != widget.lastHandleCommandValue) {
                    valueHandle.call(widget, value);
                    widget.lastHandleCommandValue = value;
                }
            }
            widget.setEnable(this.queryCommandState(command) !== -1);
            widget.setActive(this.queryCommandState(command) === 1);
            widget.interactFlag = false;
        });
    }
});