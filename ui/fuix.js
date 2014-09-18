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
        widget.executionFlag = false;
        widget.on(event, function() {
            widget.executionFlag = true;
            fn.apply(widget, arguments);
            widget.executionFlag = false;
        });
    },

    bindCommandState: function(minder, command, valueHandle) {
        var widget = this;
        minder.on('interactchange', function() {
            widget.setEnable(this.queryCommandState(command) !== -1);
            widget.setActive(this.queryCommandState(command) === 1);
            if (valueHandle && !widget.executionFlag) valueHandle.call(widget, this.queryCommandValue(command));
        });
    }
});