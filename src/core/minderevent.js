var MinderEvent = kity.createClass('MindEvent', {
    constructor: function (type, params, cancelable) {
        kity.Utils.extend(this, params || {});
        this.type = type;
        this.cancelable = cancelable || false;
    },

    cancel: function() {
        this.canceled = true;
    },

    cancelImmediately: function() {
        this.immediatelyCanceld = true;
        this.canceled = true;
    },

    shouldCancel: function() {
        return this.cancelable && this.canceled;
    },

    shouldCancelImmediately: function() {
        return this.cancelable && this.immediatelyCanceld;
    }
});