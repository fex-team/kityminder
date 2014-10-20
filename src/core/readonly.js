/**
 * @fileOverview
 *
 * 
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
Minder.registerInit(function(options) {
    if (options.readOnly) {
        this.setDisabled();
    }
});
kity.extendClass(Minder, {

    disable: function() {
        var me = this;
        //禁用命令
        me.bkqueryCommandState = me.queryCommandState;
        me.bkqueryCommandValue = me.queryCommandValue;
        me.queryCommandState = function(type) {
            var cmd = this._getCommand(type);
            if (cmd && cmd.enableReadOnly) {
                return me.bkqueryCommandState.apply(me, arguments);
            }
            return -1;
        };
        me.queryCommandValue = function(type) {
            var cmd = this._getCommand(type);
            if (cmd && cmd.enableReadOnly) {
                return me.bkqueryCommandValue.apply(me, arguments);
            }
            return null;
        };
        this.setStatus('readonly');
        me._interactChange();
    },

    enable: function() {
        var me = this;

        if (me.bkqueryCommandState) {
            me.queryCommandState = me.bkqueryCommandState;
            delete me.bkqueryCommandState;
        }
        if (me.bkqueryCommandValue) {
            me.queryCommandValue = me.bkqueryCommandValue;
            delete me.bkqueryCommandValue;
        }

        this.setStatus('normal');

        me._interactChange();
    }
});