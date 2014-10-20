/**
 * @fileOverview
 *
 * 状态切换控制
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

Minder.registerInit(function() {
    this._initStatus();
});

kity.extendClass(Minder, {

    _initStatus: function() {
        this._status = 'normal';
        this._rollbackStatus = 'normal';
    },

    setStatus: (function() {
        var sf = ~window.location.href.indexOf('status');
        var tf = ~window.location.href.indexOf('trace');

        // 在 readonly 模式下，只有 force 为 true 才能切换回来
        return function(status, force) {
            if (this._status == 'readonly' && !force) return this;
            if (status != this._status) {
                this._rollbackStatus = this._status;
                this._status = status;
                this.fire('statuschange', {
                    lastStatus: this._rollbackStatus,
                    currentStatus: this._status
                });
                if (sf) {
                    console.log(window.event.type, this._rollbackStatus, '->', this._status);
                    if (tf) {
                        console.trace();
                    }
                }
            }
            return this;
        };
    })(),

    rollbackStatus: function() {
        this.setStatus(this._rollbackStatus);
    },
    getRollbackStatus:function(){
        return this._rollbackStatus;
    },
    getStatus: function() {
        return this._status;
    }
});