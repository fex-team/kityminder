/*!
 * ====================================================
 * kity - v2.0.0 - 2014-07-23
 * https://github.com/fex-team/kity
 * GitHub: https://github.com/fex-team/kity.git 
 * Copyright (c) 2014 Baidu FEX; Licensed BSD
 * ====================================================
 */

(function () {
/**
 * cmd 内部定义
 */

// 模块存储
var _modules = {};

function define ( id, deps, factory ) {

    _modules[ id ] = {

        exports: {},
        value: null,
        factory: null

    };

    if ( arguments.length === 2 ) {

        factory = deps;

    }

    if ( _modules.toString.call( factory ) === '[object Object]' ) {

        _modules[ id ][ 'value' ] = factory;

    } else if ( typeof factory === 'function' ) {

        _modules[ id ][ 'factory' ] = factory;

    } else {

        throw new Error( 'define函数未定义的行为' );

    }

}

function require ( id ) {

    var module = _modules[ id ],
        exports = null;

    if ( !module ) {

        return null;

    }

    if ( module.value ) {

        return module.value;

    }


    exports = module.factory.call( null, require, module.exports, module );

    // return 值不为空， 则以return值为最终值
    if ( exports ) {

        module.exports = exports;

    }

    module.value = module.exports;

    return module.value;

}

function use ( id ) {

    return require( id );

}
define("animate/animator", [ "animate/timeline", "graphic/eventhandler", "animate/frame", "core/utils", "core/class", "animate/easing", "graphic/shape", "graphic/svg", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require) {
    function parseTime(str) {
        var value = parseFloat(str, 10);
        if (/ms/.test(str)) {
            return value;
        }
        if (/s/.test(str)) {
            return value * 1e3;
        }
        if (/min/.test(str)) {
            return value * 60 * 1e3;
        }
        return value;
    }
    var Timeline = require("animate/timeline");
    var easingTable = require("animate/easing");
    var Animator = require("core/class").createClass("Animator", {
        constructor: function(beginValue, finishValue, setter) {
            if (arguments.length == 1) {
                var opt = arguments[0];
                this.beginValue = opt.beginValue;
                this.finishValue = opt.finishValue;
                this.setter = opt.setter;
            } else {
                this.beginValue = beginValue;
                this.finishValue = finishValue;
                this.setter = setter;
            }
        },
        start: function(target, duration, easing, delay, callback) {
            if (arguments.length === 4 && typeof delay == "function") {
                callback = delay;
                delay = 0;
            }
            var timeline = this.create(target, duration, easing, callback);
            delay = parseTime(delay);
            if (delay > 0) {
                setTimeout(function() {
                    timeline.play();
                }, delay);
            } else {
                timeline.play();
            }
            return timeline;
        },
        create: function(target, duration, easing, callback) {
            var timeline;
            duration = duration && parseTime(duration) || Animator.DEFAULT_DURATION;
            easing = easing || Animator.DEFAULT_EASING;
            if (typeof easing == "string") {
                easing = easingTable[easing];
            }
            timeline = new Timeline(this, target, duration, easing);
            if (typeof callback == "function") {
                timeline.on("finish", callback);
            }
            return timeline;
        },
        reverse: function() {
            return new Animator(this.finishValue, this.beginValue, this.setter);
        }
    });
    Animator.DEFAULT_DURATION = 300;
    Animator.DEFAULT_EASING = "linear";
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        animate: function(animator, duration, easing, delay, callback) {
            var queue = this._KityAnimateQueue = this._KityAnimateQueue || [];
            var timeline = animator.create(this, duration, easing, callback);
            function dequeue() {
                queue.shift();
                if (queue.length) {
                    setTimeout(queue[0].t.play.bind(queue[0].t), queue[0].d);
                }
            }
            timeline.on("finish", dequeue);
            queue.push({
                t: timeline,
                d: delay
            });
            if (queue.length == 1) {
                setTimeout(timeline.play.bind(timeline), delay);
            }
            return this;
        },
        timeline: function() {
            return this._KityAnimateQueue[0].t;
        },
        stop: function() {
            var queue = this._KityAnimateQueue;
            if (queue) {
                while (queue.length) {
                    queue.shift().t.stop();
                }
            }
            return this;
        },
        pause: function() {
            var queue = this._KityAnimateQueue;
            if (queue) {
                while (queue.length) {
                    queue.shift().t.pause();
                }
            }
            return this;
        }
    });
    return Animator;
});
/**
 * Kity Animate Easing modified from jQuery Easing
 * Author: techird
 * Changes:
 *     1. make easing functions standalone
 *     2. remove the 'x' parameter
 */
/* ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */
define("animate/easing", [], function(require, exports, module) {
    var easings = {
        // t: current_time, b: begin_value, c: change_value, d: duration
        linear: function(t, b, c, d) {
            return c * (t / d) + b;
        },
        swing: function(t, b, c, d) {
            return easings.easeOutQuad(t, b, c, d);
        },
        ease: function(t, b, c, d) {
            return easings.easeInOutCubic(t, b, c, d);
        },
        easeInQuad: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * (--t * (t - 2) - 1) + b;
        },
        easeInCubic: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function(t, b, c, d) {
            return t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function(t, b, c, d) {
            return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function(t, b, c, d) {
            if (t === 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t === 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b;
        },
        easeOutElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t === 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b;
        },
        easeInOutElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t === 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * .3 * 1.5;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b;
        },
        easeInBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function(t, b, c, d) {
            return c - easings.easeOutBounce(d - t, 0, c, d) + b;
        },
        easeOutBounce: function(t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * 7.5625 * t * t + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
            }
        },
        easeInOutBounce: function(t, b, c, d) {
            if (t < d / 2) return easings.easeInBounce(t * 2, 0, c, d) * .5 + b;
            return easings.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    };
    return easings;
});
define("animate/frame", [], function(require, exports) {
    // 原生动画帧方法 polyfill
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(fn) {
        return setTimeout(fn, 1e3 / 60);
    };
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;
    var frameRequestId;
    // 等待执行的帧的集合，这些帧的方法将在下个动画帧同步执行
    var pendingFrames = [];
    /**
     * 添加一个帧到等待集合中
     *
     * 如果添加的帧是序列的第一个，至少有一个帧需要被执行，则下一个动画帧需要执行
     */
    function pushFrame(frame) {
        if (pendingFrames.push(frame) === 1) {
            frameRequestId = requestAnimationFrame(executePendingFrames);
        }
    }
    /**
     * 执行所有等待帧
     */
    function executePendingFrames() {
        var frames = pendingFrames;
        pendingFrames = [];
        while (frames.length) {
            executeFrame(frames.pop());
        }
        frameRequestId = 0;
    }
    /**
     * 请求一个帧，执行指定的动作。动作回调提供一些有用的信息
     *
     * @param {Function} action
     *
     *     要执行的动作，该动作回调有一个参数 frame，其中：
     *
     *     frame.time
     *         动作执行时的时间戳（ms）
     *
     *     frame.index
     *         当前执行的帧的编号（首帧为 0）
     *
     *     frame.dur
     *         上一帧至今经过的时间，单位 ms
     *
     *     frame.elapsed
     *         从首帧开始到当前帧经过的时间
     *
     *     frame.action
     *         指向当前的帧处理函数
     *
     *     frame.next()
     *         表示下一帧继续执行。如果不调用该方法，将不会执行下一帧。
     *
     */
    function requestFrame(action) {
        var frame = initFrame(action);
        pushFrame(frame);
        return frame;
    }
    /**
     * 释放一个已经请求过的帧，如果该帧在等待集合里，将移除，下个动画帧不会执行释放的帧
     */
    function releaseFrame(frame) {
        var index = pendingFrames.indexOf(frame);
        if (~index) {
            pendingFrames.splice(index, 1);
        }
        if (pendingFrames.length === 0) {
            cancelAnimationFrame(frameRequestId);
        }
    }
    /**
     * 初始化一个帧，主要用于后续计算
     */
    function initFrame(action) {
        var frame = {
            index: 0,
            time: +new Date(),
            elapsed: 0,
            action: action,
            next: function() {
                pushFrame(frame);
            }
        };
        return frame;
    }
    /**
     * 执行一个帧动作
     */
    function executeFrame(frame) {
        // 当前帧时间错
        var time = +new Date();
        // 当上一帧到当前帧经过的时间
        var dur = time - frame.time;
        //
        // http://stackoverflow.com/questions/13133434/requestanimationframe-detect-stop
        // 浏览器最小化或切换标签，requestAnimationFrame 不会执行。
        // 检测时间超过 200 ms（频率小于 5Hz ） 判定为计时器暂停，重置为一帧长度
        //
        if (dur > 200) {
            dur = 1e3 / 60;
        }
        frame.dur = dur;
        frame.elapsed += dur;
        frame.time = time;
        frame.action.call(null, frame);
        frame.index++;
    }
    // 暴露
    exports.requestFrame = requestFrame;
    exports.releaseFrame = releaseFrame;
});
define("animate/motionanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/geometry", "core/utils", "graphic/point", "graphic/vector", "graphic/matrix", "graphic/path", "graphic/svg" ], function(require) {
    var Animator = require("animate/animator");
    var g = require("graphic/geometry");
    var Path = require("graphic/path");
    var MotionAnimator = require("core/class").createClass("MotionAnimator", {
        base: Animator,
        constructor: function(path) {
            var me = this;
            this.callBase({
                beginValue: 0,
                finishValue: 1,
                setter: function(target, value) {
                    var path = me.motionPath instanceof Path ? me.motionPath.getPathData() : me.motionPath;
                    var point = g.pointAtPath(path, value);
                    target.setTranslate(point.x, point.y);
                    target.setRotate(point.tan.getAngle());
                }
            });
            this.updatePath(path);
        },
        updatePath: function(path) {
            this.motionPath = path;
        }
    });
    require("core/class").extendClass(Path, {
        motion: function(path, duration, easing, delay, callback) {
            return this.animate(new MotionAnimator(path), duration, easing, delay, callback);
        }
    });
    return MotionAnimator;
});
define("animate/opacityanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require) {
    var Animator = require("animate/animator");
    var OpacityAnimator = require("core/class").createClass("OpacityAnimator", {
        base: Animator,
        constructor: function(opacity) {
            this.callBase({
                beginValue: function(target) {
                    return target.getOpacity();
                },
                finishValue: opacity,
                setter: function(target, value) {
                    target.setOpacity(value);
                }
            });
        }
    });
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        fxOpacity: function(opacity, duration, easing, delay, callback) {
            return this.animate(new OpacityAnimator(opacity), duration, easing, delay, callback);
        },
        fadeTo: function() {
            return this.fxOpacity.apply(this, arguments);
        },
        fadeIn: function() {
            return this.fxOpacity.apply(this, [ 1 ].concat([].slice.call(arguments)));
        },
        fadeOut: function() {
            return this.fxOpacity.apply(this, [ 0 ].concat([].slice.call(arguments)));
        }
    });
    return OpacityAnimator;
});
define("animate/pathanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/geometry", "core/utils", "graphic/point", "graphic/vector", "graphic/matrix", "graphic/path", "graphic/svg" ], function(require) {
    var Animator = require("animate/animator");
    var g = require("graphic/geometry");
    var PathAnimator = require("core/class").createClass("OpacityAnimator", {
        base: Animator,
        constructor: function(path) {
            this.callBase({
                beginValue: function(target) {
                    this.beginPath = target.getPathData();
                    return 0;
                },
                finishValue: 1,
                setter: function(target, value) {
                    target.setPathData(g.pathTween(this.beginPath, path, value));
                }
            });
        }
    });
    var Path = require("graphic/path");
    require("core/class").extendClass(Path, {
        fxPath: function(path, duration, easing, delay, callback) {
            return this.animate(new PathAnimator(path), duration, easing, delay, callback);
        }
    });
    return PathAnimator;
});
define("animate/rotateanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require) {
    var Animator = require("animate/animator");
    var RotateAnimator = require("core/class").createClass("RotateAnimator", {
        base: Animator,
        constructor: function(deg, ax, ay) {
            this.callBase({
                beginValue: 0,
                finishValue: deg,
                setter: function(target, value, timeline) {
                    var delta = timeline.getDelta();
                    target.rotate(delta, ax, ay);
                }
            });
        }
    });
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        fxRotate: function(deg, duration, easing, delay, callback) {
            return this.animate(new RotateAnimator(deg), duration, easing, delay, callback);
        },
        fxRotateAnchor: function(deg, ax, ay, duration, easing, delay, callback) {
            return this.animate(new RotateAnimator(deg, ax, ay), duration, easing, delay, callback);
        }
    });
    return RotateAnimator;
});
define("animate/scaleanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require) {
    var Animator = require("animate/animator");
    var ScaleAnimator = require("core/class").createClass("ScaleAnimator", {
        base: Animator,
        constructor: function(sx, sy) {
            this.callBase({
                beginValue: 0,
                finishValue: 1,
                setter: function(target, value, timeline) {
                    var delta = timeline.getDelta();
                    var kx = Math.pow(sx, delta);
                    var ky = Math.pow(sy, delta);
                    target.scale(ky, kx);
                }
            });
        }
    });
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        fxScale: function(sx, sy, duration, easing, delay, callback) {
            return this.animate(new ScaleAnimator(sx, sy), duration, easing, delay, callback);
        }
    });
    return ScaleAnimator;
});
define("animate/timeline", [ "graphic/eventhandler", "core/utils", "graphic/shapeevent", "core/class", "animate/frame" ], function(require) {
    var EventHandler = require("graphic/eventhandler");
    var frame = require("animate/frame");
    var utils = require("core/utils");
    function getPercentValue(b, f, p) {
        return utils.paralle(b, f, function(b, f) {
            return b + (f - b) * p;
        });
    }
    function getDelta(v1, v2) {
        return utils.paralle(v1, v2, function(v1, v2) {
            return v2 - v1;
        });
    }
    function TimelineEvent(timeline, type, param) {
        this.timeline = timeline;
        this.target = timeline.target;
        this.type = type;
        for (var name in param) {
            if (param.hasOwnProperty(name)) {
                this[name] = param[name];
            }
        }
    }
    var Timeline = require("core/class").createClass("Timeline", {
        mixins: [ EventHandler ],
        constructor: function(animator, target, duration, easing) {
            this.callMixin();
            this.target = target;
            this.time = 0;
            this.duration = duration;
            this.easing = easing;
            this.animator = animator;
            this.beginValue = animator.beginValue;
            this.finishValue = animator.finishValue;
            this.setter = animator.setter;
            this.status = "ready";
        },
        nextFrame: function(frame) {
            if (this.status != "playing") {
                return;
            }
            this.time += frame.dur;
            this.setValue(this.getValue());
            if (this.time >= this.duration) {
                this.timeUp();
            }
            frame.next();
        },
        getPlayTime: function() {
            return this.rollbacking ? this.duration - this.time : this.time;
        },
        getTimeProportion: function() {
            return this.getPlayTime() / this.duration;
        },
        getValueProportion: function() {
            return this.easing(this.getPlayTime(), 0, 1, this.duration);
        },
        getValue: function() {
            var b = this.beginValue;
            var f = this.finishValue;
            var p = this.getValueProportion();
            return getPercentValue(b, f, p);
        },
        setValue: function(value) {
            this.lastValue = this.currentValue;
            this.currentValue = value;
            this.setter.call(this.target, this.target, value, this);
        },
        getDelta: function() {
            this.lastValue = this.lastValue === undefined ? this.beginValue : this.lastValue;
            return getDelta(this.lastValue, this.currentValue);
        },
        play: function() {
            var lastStatus = this.status;
            this.status = "playing";
            switch (lastStatus) {
              case "ready":
                if (utils.isFunction(this.beginValue)) {
                    this.beginValue = this.beginValue.call(this.target, this.target);
                }
                if (utils.isFunction(this.finishValue)) {
                    this.finishValue = this.finishValue.call(this.target, this.target);
                }
                this.time = 0;
                this.setValue(this.beginValue);
                this.frame = frame.requestFrame(this.nextFrame.bind(this));
                break;

              case "finished":
              case "stoped":
                this.time = 0;
                this.frame = frame.requestFrame(this.nextFrame.bind(this));
                break;

              case "paused":
                this.frame.next();
            }
            this.fire("play", new TimelineEvent(this, "play", {
                lastStatus: lastStatus
            }));
            return this;
        },
        pause: function() {
            this.status = "paused";
            this.fire("pause", new TimelineEvent(this, "pause"));
            frame.releaseFrame(this.frame);
            return this;
        },
        stop: function() {
            this.status = "stoped";
            this.setValue(this.finishValue);
            this.rollbacking = false;
            this.fire("stop", new TimelineEvent(this, "stop"));
            frame.releaseFrame(this.frame);
            return this;
        },
        timeUp: function() {
            if (this.repeatOption) {
                this.time = 0;
                if (this.rollback) {
                    if (this.rollbacking) {
                        this.decreaseRepeat();
                        this.rollbacking = false;
                    } else {
                        this.rollbacking = true;
                        this.fire("rollback", new TimelineEvent(this, "rollback"));
                    }
                } else {
                    this.decreaseRepeat();
                }
                if (!this.repeatOption) {
                    this.finish();
                } else {
                    this.fire("repeat", new TimelineEvent(this, "repeat"));
                }
            } else {
                this.finish();
            }
        },
        finish: function() {
            this.setValue(this.finishValue);
            this.status = "finished";
            this.fire("finish", new TimelineEvent(this, "finish"));
            frame.releaseFrame(this.frame);
        },
        decreaseRepeat: function() {
            if (this.repeatOption !== true) {
                this.repeatOption--;
            }
        },
        repeat: function(repeat, rollback) {
            this.repeatOption = repeat;
            this.rollback = rollback;
            return this;
        }
    });
    Timeline.requestFrame = frame.requestFrame;
    Timeline.releaseFrame = frame.releaseFrame;
    return Timeline;
});
define("animate/translateanimator", [ "animate/animator", "animate/timeline", "animate/easing", "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require) {
    var Animator = require("animate/animator");
    var TranslateAnimator = require("core/class").createClass("TranslateAnimator", {
        base: Animator,
        constructor: function(x, y) {
            this.callBase({
                x: 0,
                y: 0
            }, {
                x: x,
                y: y
            }, function(target, value, timeline) {
                var delta = timeline.getDelta();
                target.translate(delta.x, delta.y);
            });
        }
    });
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        fxTranslate: function(x, y, duration, easing, delay, callback) {
            return this.animate(new TranslateAnimator(x, y), duration, easing, delay, callback);
        }
    });
    return TranslateAnimator;
});
define("core/browser", [], function() {
    var browser = function() {
        var agent = navigator.userAgent.toLowerCase(), opera = window.opera, browser;
        browser = {
            ie: /(msie\s|trident.*rv:)([\w.]+)/.test(agent),
            opera: !!opera && opera.version,
            webkit: agent.indexOf(" applewebkit/") > -1,
            mac: agent.indexOf("macintosh") > -1,
            quirks: document.compatMode == "BackCompat"
        };
        browser.gecko = navigator.product == "Gecko" && !browser.webkit && !browser.opera && !browser.ie;
        var version = 0;
        // Internet Explorer 6.0+
        if (browser.ie) {
            version = (agent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2] || 0) * 1;
            browser.ie11Compat = document.documentMode == 11;
            browser.ie9Compat = document.documentMode == 9;
        }
        // Gecko.
        if (browser.gecko) {
            var geckoRelease = agent.match(/rv:([\d\.]+)/);
            if (geckoRelease) {
                geckoRelease = geckoRelease[1].split(".");
                version = geckoRelease[0] * 1e4 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
            }
        }
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = +RegExp["$1"];
        }
        if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
            browser.safari = +(RegExp["$1"] || RegExp["$2"]);
        }
        // Opera 9.50+
        if (browser.opera) version = parseFloat(opera.version());
        // WebKit 522+ (Safari 3+)
        if (browser.webkit) version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
        browser.version = version;
        browser.isCompatible = !browser.mobile && (browser.ie && version >= 6 || browser.gecko && version >= 10801 || browser.opera && version >= 9.5 || browser.air && version >= 1 || browser.webkit && version >= 522 || false);
        return browser;
    }();
    return browser;
});
/**
 * @description 创建一个类
 * @param {String}    fullClassName  类全名，包括命名空间。
 * @param {Plain}     defines        要创建的类的特性
 *     defines.constructor  {Function}       类的构造函数，实例化的时候会被调用。
 *     defines.base         {String}         基类的名称。名称要使用全名。（因为base是javascript未来保留字，所以不用base）
 *     defines.mixin        {Array<String>}  要混合到新类的类集合
 *     defines.<method>     {Function}       其他类方法
 *
 * TODO:
 *     Mixin 构造函数调用支持
 */
define("core/class", [], function(require, exports) {
    // just to bind context
    Function.prototype.bind = Function.prototype.bind || function(thisObj) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.apply(thisObj, args);
    };
    // 所有类的基类
    function Class() {}
    Class.__KityClassName = "Class";
    // 提供 base 调用支持
    Class.prototype.base = function(name) {
        var caller = arguments.callee.caller;
        var method = caller.__KityMethodClass.__KityBaseClass.prototype[name];
        return method.apply(this, Array.prototype.slice.call(arguments, 1));
    };
    // 直接调用 base 类的同名方法
    Class.prototype.callBase = function() {
        var caller = arguments.callee.caller;
        var method = caller.__KityMethodClass.__KityBaseClass.prototype[caller.__KityMethodName];
        return method.apply(this, arguments);
    };
    Class.prototype.mixin = function(name) {
        var caller = arguments.callee.caller;
        var mixins = caller.__KityMethodClass.__KityMixins;
        if (!mixins) {
            return this;
        }
        var method = mixins[name];
        return method.apply(this, Array.prototype.slice.call(arguments, 1));
    };
    Class.prototype.callMixin = function() {
        var caller = arguments.callee.caller;
        var methodName = caller.__KityMethodName;
        var mixins = caller.__KityMethodClass.__KityMixins;
        if (!mixins) {
            return this;
        }
        var method = mixins[methodName];
        if (methodName == "constructor") {
            for (var i = 0, l = method.length; i < l; i++) {
                method[i].call(this);
            }
            return this;
        } else {
            return method.apply(this, arguments);
        }
    };
    Class.prototype.pipe = function(fn) {
        if (typeof fn == "function") {
            fn.call(this, this);
        }
        return this;
    };
    Class.prototype.getType = function() {
        return this.__KityClassName;
    };
    Class.prototype.getClass = function() {
        return this.constructor;
    };
    // 检查基类是否调用了父类的构造函数
    // 该检查是弱检查，假如调用的代码被注释了，同样能检查成功（这个特性可用于知道建议调用，但是出于某些原因不想调用的情况）
    function checkBaseConstructorCall(targetClass, classname) {
        var code = targetClass.toString();
        if (!/this\.callBase/.test(code)) {
            throw new Error(classname + " : 类构造函数没有调用父类的构造函数！为了安全，请调用父类的构造函数");
        }
    }
    var KITY_INHERIT_FLAG = "__KITY_INHERIT_FLAG_" + +new Date();
    function inherit(constructor, BaseClass, classname) {
        var KityClass = eval("(function " + classname + "( __inherit__flag ) {" + "if( __inherit__flag != KITY_INHERIT_FLAG ) {" + "KityClass.__KityConstructor.apply(this, arguments);" + "}" + "this.__KityClassName = KityClass.__KityClassName;" + "})");
        KityClass.__KityConstructor = constructor;
        KityClass.prototype = new BaseClass(KITY_INHERIT_FLAG);
        for (var methodName in BaseClass.prototype) {
            if (BaseClass.prototype.hasOwnProperty(methodName) && methodName.indexOf("__Kity") !== 0) {
                KityClass.prototype[methodName] = BaseClass.prototype[methodName];
            }
        }
        KityClass.prototype.constructor = KityClass;
        return KityClass;
    }
    function mixin(NewClass, mixins) {
        if (false === mixins instanceof Array) {
            return NewClass;
        }
        var i, length = mixins.length, proto, method;
        NewClass.__KityMixins = {
            constructor: []
        };
        for (i = 0; i < length; i++) {
            proto = mixins[i].prototype;
            for (method in proto) {
                if (false === proto.hasOwnProperty(method) || method.indexOf("__Kity") === 0) {
                    continue;
                }
                if (method === "constructor") {
                    // constructor 特殊处理
                    NewClass.__KityMixins.constructor.push(proto[method]);
                } else {
                    NewClass.prototype[method] = NewClass.__KityMixins[method] = proto[method];
                }
            }
        }
        return NewClass;
    }
    function extend(BaseClass, extension) {
        if (extension.__KityClassName) {
            extension = extension.prototype;
        }
        for (var methodName in extension) {
            if (extension.hasOwnProperty(methodName) && methodName.indexOf("__Kity") && methodName != "constructor") {
                var method = BaseClass.prototype[methodName] = extension[methodName];
                method.__KityMethodClass = BaseClass;
                method.__KityMethodName = methodName;
            }
        }
        return BaseClass;
    }
    Class.prototype._accessProperty = function() {
        return this._propertyRawData || (this._propertyRawData = {});
    };
    exports.createClass = function(classname, defines) {
        var constructor, NewClass, BaseClass;
        if (arguments.length === 1) {
            defines = arguments[0];
            classname = "AnonymousClass";
        }
        BaseClass = defines.base || Class;
        if (defines.hasOwnProperty("constructor")) {
            constructor = defines.constructor;
            if (BaseClass != Class) {
                checkBaseConstructorCall(constructor, classname);
            }
        } else {
            constructor = function() {
                this.callBase.apply(this, arguments);
                this.callMixin.apply(this, arguments);
            };
        }
        NewClass = inherit(constructor, BaseClass, classname);
        NewClass = mixin(NewClass, defines.mixins);
        NewClass.__KityClassName = constructor.__KityClassName = classname;
        NewClass.__KityBaseClass = constructor.__KityBaseClass = BaseClass;
        NewClass.__KityMethodName = constructor.__KityMethodName = "constructor";
        NewClass.__KityMethodClass = constructor.__KityMethodClass = NewClass;
        // 下面这些不需要拷贝到原型链上
        delete defines.mixins;
        delete defines.constructor;
        delete defines.base;
        NewClass = extend(NewClass, defines);
        return NewClass;
    };
    exports.extendClass = extend;
});
define("core/utils", [], function() {
    var utils = {
        each: function(obj, iterator, context) {
            if (obj === null) {
                return;
            }
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) {
                        return false;
                    }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === false) {
                            return false;
                        }
                    }
                }
            }
        },
        extend: function(t) {
            var a = arguments, notCover = this.isBoolean(a[a.length - 1]) ? a[a.length - 1] : false, len = this.isBoolean(a[a.length - 1]) ? a.length - 1 : a.length;
            for (var i = 1; i < len; i++) {
                var x = a[i];
                for (var k in x) {
                    if (!notCover || !t.hasOwnProperty(k)) {
                        t[k] = x[k];
                    }
                }
            }
            return t;
        },
        deepExtend: function(t, s) {
            var a = arguments, notCover = this.isBoolean(a[a.length - 1]) ? a[a.length - 1] : false, len = this.isBoolean(a[a.length - 1]) ? a.length - 1 : a.length;
            for (var i = 1; i < len; i++) {
                var x = a[i];
                for (var k in x) {
                    if (!notCover || !t.hasOwnProperty(k)) {
                        if (this.isObject(t[k]) && this.isObject(x[k])) {
                            this.deepExtend(t[k], x[k], notCover);
                        } else {
                            t[k] = x[k];
                        }
                    }
                }
            }
            return t;
        },
        clone: function(obj) {
            var cloned = {};
            for (var m in obj) {
                if (obj.hasOwnProperty(m)) {
                    cloned[m] = obj[m];
                }
            }
            return cloned;
        },
        copy: function(obj) {
            if (typeof obj !== "object") return obj;
            if (typeof obj === "function") return null;
            return JSON.parse(JSON.stringify(obj));
        },
        queryPath: function(path, obj) {
            var arr = path.split(".");
            var i = 0, tmp = obj, l = arr.length;
            while (i < l) {
                if (arr[i] in tmp) {
                    tmp = tmp[arr[i]];
                    i++;
                    if (i >= l || tmp === undefined) {
                        return tmp;
                    }
                } else {
                    return undefined;
                }
            }
        },
        getValue: function(value, defaultValue) {
            return value !== undefined ? value : defaultValue;
        },
        flatten: function(arr) {
            var result = [], length = arr.length, i;
            for (i = 0; i < length; i++) {
                if (arr[i] instanceof Array) {
                    result = result.concat(utils.flatten(arr[i]));
                } else {
                    result.push(arr[i]);
                }
            }
            return result;
        },
        /**
         * 平行地对 v1 和 v2 进行指定的操作
         *
         *    如果 v1 是数字，那么直接进行 op 操作
         *    如果 v1 是对象，那么返回一个对象，其元素是 v1 和 v2 同名的每个元素平行地进行 op 操作的结果
         *    如果 v1 是数组，那么返回一个数组，其元素是 v1 和 v2 同索引的每个元素平行地进行 op 操作的结果
         *
         * @param  {Number|Object|Array} v1
         * @param  {Number|Object|Array} v2
         * @param  {Function} op
         * @return {Number|Object|Array}
         */
        paralle: function(v1, v2, op) {
            var Class, field, index, name, value;
            // 数组
            if (v1 instanceof Array) {
                value = [];
                for (index = 0; index < v1.length; index++) {
                    value.push(utils.paralle(v1[index], v2[index], op));
                }
                return value;
            }
            // 对象
            if (v1 instanceof Object) {
                // 如果值是一个支持原始表示的实例，获取其原始表示
                Class = v1.getClass && v1.getClass();
                if (Class && Class.parse) {
                    v1 = v1.valueOf();
                    v2 = v2.valueOf();
                    value = utils.paralle(v1, v2, op);
                    value = Class.parse(value);
                } else {
                    value = {};
                    for (name in v1) {
                        if (v1.hasOwnProperty(name) && v2.hasOwnProperty(name)) {
                            value[name] = utils.paralle(v1[name], v2[name], op);
                        }
                    }
                }
                return value;
            }
            // 是否数字
            if (false === isNaN(parseFloat(v1))) {
                return op(v1, v2);
            }
            return value;
        },
        /**
         * 创建 op 操作的一个平行化版本
         */
        parallelize: function(op) {
            return function(v1, v2) {
                return utils.paralle(v1, v2, op);
            };
        }
    };
    utils.each([ "String", "Function", "Array", "Number", "RegExp", "Object", "Boolean" ], function(v) {
        utils["is" + v] = function(obj) {
            return Object.prototype.toString.apply(obj) == "[object " + v + "]";
        };
    });
    return utils;
});
/**
 * 颜色矩阵运算效果封装
 */
define("filter/effect/colormatrixeffect", [ "filter/effect/effect", "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var Effect = require("filter/effect/effect"), Utils = require("core/utils");
    var ColorMatrixEffect = require("core/class").createClass("ColorMatrixEffect", {
        base: Effect,
        constructor: function(type, input) {
            this.callBase(Effect.NAME_COLOR_MATRIX);
            this.set("type", Utils.getValue(type, ColorMatrixEffect.TYPE_MATRIX));
            this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
        }
    });
    Utils.extend(ColorMatrixEffect, {
        // 类型常量
        TYPE_MATRIX: "matrix",
        TYPE_SATURATE: "saturate",
        TYPE_HUE_ROTATE: "hueRotate",
        TYPE_LUMINANCE_TO_ALPHA: "luminanceToAlpha",
        // 矩阵常量
        MATRIX_ORIGINAL: "10000010000010000010".split("").join(" "),
        MATRIX_EMPTY: "00000000000000000000".split("").join(" ")
    });
    return ColorMatrixEffect;
});
/**
 * 高斯模糊效果封装
 */
define("filter/effect/compositeeffect", [ "filter/effect/effect", "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var Effect = require("filter/effect/effect"), Utils = require("core/utils");
    var CompositeEffect = require("core/class").createClass("CompositeEffect", {
        base: Effect,
        constructor: function(operator, input, input2) {
            this.callBase(Effect.NAME_COMPOSITE);
            this.set("operator", Utils.getValue(operator, CompositeEffect.OPERATOR_OVER));
            if (input) {
                this.set("in", input);
            }
            if (input2) {
                this.set("in2", input2);
            }
        }
    });
    Utils.extend(CompositeEffect, {
        // operator 常量
        OPERATOR_OVER: "over",
        OPERATOR_IN: "in",
        OPERATOR_OUT: "out",
        OPERATOR_ATOP: "atop",
        OPERATOR_XOR: "xor",
        OPERATOR_ARITHMETIC: "arithmetic"
    });
    return CompositeEffect;
});
/**
 * 像素级别的矩阵卷积运算效果封装
 */
define("filter/effect/convolvematrixeffect", [ "filter/effect/effect", "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var Effect = require("filter/effect/effect"), Utils = require("core/utils");
    var ConvolveMatrixEffect = require("core/class").createClass("ConvolveMatrixEffect", {
        base: Effect,
        constructor: function(edgeMode, input) {
            this.callBase(Effect.NAME_CONVOLVE_MATRIX);
            this.set("edgeMode", Utils.getValue(edgeMode, ConvolveMatrixEffect.MODE_DUPLICATE));
            this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
        }
    });
    Utils.extend(ConvolveMatrixEffect, {
        MODE_DUPLICATE: "duplicate",
        MODE_WRAP: "wrap",
        MODE_NONE: "none"
    });
    return ConvolveMatrixEffect;
});
/*
 * 效果类
 * 该类型的对象不存储任何内部属性， 所有操作都是针对该类对象所维护的节点进行的
 */
define("filter/effect/effect", [ "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var svg = require("graphic/svg"), Effect = require("core/class").createClass("Effect", {
        constructor: function(type) {
            this.node = svg.createNode(type);
        },
        getId: function() {
            return this.node.id;
        },
        setId: function(id) {
            this.node.id = id;
            return this;
        },
        set: function(key, value) {
            this.node.setAttribute(key, value);
            return this;
        },
        get: function(key) {
            return this.node.getAttribute(key);
        },
        getNode: function() {
            return this.node;
        },
        // 返回该效果的result
        toString: function() {
            return this.node.getAttribute("result") || "";
        }
    });
    require("core/utils").extend(Effect, {
        // 特效名称常量
        NAME_GAUSSIAN_BLUR: "feGaussianBlur",
        NAME_OFFSET: "feOffset",
        NAME_COMPOSITE: "feComposite",
        NAME_COLOR_MATRIX: "feColorMatrix",
        NAME_CONVOLVE_MATRIX: "feConvolveMatrix",
        // 输入常量
        INPUT_SOURCE_GRAPHIC: "SourceGraphic",
        INPUT_SOURCE_ALPHA: "SourceAlpha",
        INPUT_BACKGROUND_IMAGE: "BackgroundImage",
        INPUT_BACKGROUND_ALPHA: "BackgroundAlpha",
        INPUT_FILL_PAINT: "FillPaint",
        INPUT_STROKE_PAINT: "StrokePaint"
    });
    return Effect;
});
/**
 * 高斯模糊效果封装
 */
define("filter/effect/gaussianblureffect", [ "filter/effect/effect", "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var Effect = require("filter/effect/effect"), Utils = require("core/utils");
    return require("core/class").createClass("GaussianblurEffect", {
        base: Effect,
        constructor: function(stdDeviation, input) {
            this.callBase(Effect.NAME_GAUSSIAN_BLUR);
            this.set("stdDeviation", Utils.getValue(stdDeviation, 1));
            this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
        }
    });
});
/**
 * 偏移效果封装
 */
define("filter/effect/offseteffect", [ "filter/effect/effect", "graphic/svg", "core/class", "core/utils" ], function(require, exports, module) {
    var Effect = require("filter/effect/effect"), Utils = require("core/utils");
    return require("core/class").createClass("OffsetEffect", {
        base: Effect,
        constructor: function(dx, dy, input) {
            this.callBase(Effect.NAME_OFFSET);
            this.set("dx", Utils.getValue(dx, 0));
            this.set("dy", Utils.getValue(dy, 0));
            this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
        }
    });
});
/*
 * Effect所用的container
 */
define("filter/effectcontainer", [ "core/class", "graphic/container" ], function(require) {
    return require("core/class").createClass("EffectContainer", {
        base: require("graphic/container"),
        addEffect: function(point, pos) {
            return this.addItem.apply(this, arguments);
        },
        prependEffect: function() {
            return this.prependItem.apply(this, arguments);
        },
        appendEffect: function() {
            return this.appendItem.apply(this, arguments);
        },
        removeEffect: function(pos) {
            return this.removeItem.apply(this, arguments);
        },
        addEffects: function() {
            return this.addItems.apply(this, arguments);
        },
        setEffects: function() {
            return this.setItems.apply(this, arguments);
        },
        getEffect: function() {
            return this.getItem.apply(this, arguments);
        },
        getEffects: function() {
            return this.getItems.apply(this, arguments);
        },
        getFirstEffect: function() {
            return this.getFirstItem.apply(this, arguments);
        },
        getLastEffect: function() {
            return this.getLastItem.apply(this, arguments);
        },
        handleAdd: function(effectItem, pos) {
            var count = this.getEffects().length, nextEffectItem = this.getItem(pos + 1);
            // 最后一个节点， 直接追加
            if (count === pos + 1) {
                this.node.appendChild(effectItem.getNode());
                return;
            }
            this.node.insertBefore(effectItem.getNode(), nextEffectItem.getNode());
        }
    });
});
/**
 * Filter 基类
 */
define("filter/filter", [ "graphic/svg", "core/class", "filter/effectcontainer", "graphic/container", "graphic/shape", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    var svg = require("graphic/svg");
    var Class = require("core/class");
    var Filter = Class.createClass("Filter", {
        mixins: [ require("filter/effectcontainer") ],
        constructor: function(x, y, width, height) {
            this.node = svg.createNode("filter");
            if (x !== undefined) {
                this.set("x", x);
            }
            if (y !== undefined) {
                this.set("y", y);
            }
            if (width !== undefined) {
                this.set("width", width);
            }
            if (height !== undefined) {
                this.set("height", height);
            }
        },
        getId: function() {
            return this.id;
        },
        setId: function(id) {
            this.node.id = id;
            return this;
        },
        set: function(key, value) {
            this.node.setAttribute(key, value);
            return this;
        },
        get: function(key) {
            return this.node.getAttribute(key);
        },
        getNode: function() {
            return this.node;
        }
    });
    var Shape = require("graphic/shape");
    Class.extendClass(Shape, {
        applyFilter: function(filter) {
            var filterId = filter.get("id");
            if (filterId) {
                this.node.setAttribute("filter", "url(#" + filterId + ")");
            }
            return this;
        }
    });
    return Filter;
});
/*
 * 高斯模糊滤镜
 */
define("filter/gaussianblurfilter", [ "filter/effect/gaussianblureffect", "filter/effect/effect", "core/utils", "core/class", "filter/filter", "graphic/svg", "filter/effectcontainer", "graphic/shape" ], function(require, exports, module) {
    var GaussianblurEffect = require("filter/effect/gaussianblureffect");
    return require("core/class").createClass("GaussianblurFilter", {
        base: require("filter/filter"),
        constructor: function(stdDeviation) {
            this.callBase();
            this.addEffect(new GaussianblurEffect(stdDeviation));
        }
    });
});
/*
 * 投影滤镜
 */
define("filter/projectionfilter", [ "filter/effect/gaussianblureffect", "filter/effect/effect", "core/utils", "core/class", "graphic/svg", "filter/effect/colormatrixeffect", "graphic/color", "graphic/standardcolor", "filter/effect/compositeeffect", "filter/effect/offseteffect", "filter/filter", "filter/effectcontainer", "graphic/shape" ], function(require, exports, module) {
    var GaussianblurEffect = require("filter/effect/gaussianblureffect"), Effect = require("filter/effect/effect"), ColorMatrixEffect = require("filter/effect/colormatrixeffect"), Color = require("graphic/color"), Utils = require("core/utils"), CompositeEffect = require("filter/effect/compositeeffect"), OffsetEffect = require("filter/effect/offseteffect");
    return require("core/class").createClass("ProjectionFilter", {
        base: require("filter/filter"),
        constructor: function(stdDeviation, dx, dy) {
            this.callBase();
            this.gaussianblurEffect = new GaussianblurEffect(stdDeviation, Effect.INPUT_SOURCE_ALPHA);
            this.gaussianblurEffect.set("result", "gaussianblur");
            this.addEffect(this.gaussianblurEffect);
            this.offsetEffect = new OffsetEffect(dx, dy, this.gaussianblurEffect);
            this.offsetEffect.set("result", "offsetBlur");
            this.addEffect(this.offsetEffect);
            this.colorMatrixEffect = new ColorMatrixEffect(ColorMatrixEffect.TYPE_MATRIX, this.offsetEffect);
            this.colorMatrixEffect.set("values", ColorMatrixEffect.MATRIX_ORIGINAL);
            this.colorMatrixEffect.set("result", "colorOffsetBlur");
            this.addEffect(this.colorMatrixEffect);
            this.compositeEffect = new CompositeEffect(CompositeEffect.OPERATOR_OVER, Effect.INPUT_SOURCE_GRAPHIC, this.colorMatrixEffect);
            this.addEffect(this.compositeEffect);
        },
        // 设置投影颜色
        setColor: function(color) {
            var matrix = null, originMatrix = null, colorValue = [];
            if (Utils.isString(color)) {
                color = Color.parse(color);
            }
            if (!color) {
                return this;
            }
            matrix = ColorMatrixEffect.MATRIX_EMPTY.split(" ");
            colorValue.push(color.get("r"));
            colorValue.push(color.get("g"));
            colorValue.push(color.get("b"));
            // rgb 分量更改
            for (var i = 0, len = colorValue.length; i < len; i++) {
                matrix[i * 5 + 3] = colorValue[i] / 255;
            }
            // alpha 分量更改
            matrix[18] = color.get("a");
            this.colorMatrixEffect.set("values", matrix.join(" "));
            return this;
        },
        // 设置投影透明度
        setOpacity: function(opacity) {
            var matrix = this.colorMatrixEffect.get("values").split(" ");
            matrix[18] = opacity;
            this.colorMatrixEffect.set("values", matrix.join(" "));
            return this;
        },
        // 设置阴影偏移量
        setOffset: function(dx, dy) {
            this.setOffsetX(dx);
            this.setOffsetY(dy);
        },
        setOffsetX: function(dx) {
            this.offsetEffect.set("dx", dx);
        },
        setOffsetY: function(dy) {
            this.offsetEffect.set("dy", dy);
        },
        setDeviation: function(deviation) {
            this.gaussianblurEffect.set("stdDeviation", deviation);
        }
    });
});
/**
 * 贝塞尔曲线
 */
define("graphic/bezier", [ "core/class", "graphic/pointcontainer", "graphic/container", "graphic/path", "core/utils", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    return require("core/class").createClass("Bezier", {
        mixins: [ require("graphic/pointcontainer") ],
        base: require("graphic/path"),
        constructor: function(bezierPoints) {
            this.callBase();
            bezierPoints = bezierPoints || [];
            this.changeable = true;
            this.setBezierPoints(bezierPoints);
        },
        getBezierPoints: function() {
            return this.getPoints();
        },
        setBezierPoints: function(bezierPoints) {
            return this.setPoints(bezierPoints);
        },
        //当点集合发生变化时采取的动作
        onContainerChanged: function() {
            if (this.changeable) {
                this.update();
            }
        },
        update: function() {
            var drawer = null, bezierPoints = this.getBezierPoints();
            //单独的一个点不画任何图形
            if (bezierPoints.length < 2) {
                return;
            }
            drawer = this.getDrawer();
            drawer.clear();
            var vertex = bezierPoints[0].getVertex(), forward = null, backward = null;
            drawer.moveTo(vertex.x, vertex.y);
            for (var i = 1, len = bezierPoints.length; i < len; i++) {
                vertex = bezierPoints[i].getVertex();
                backward = bezierPoints[i].getBackward();
                forward = bezierPoints[i - 1].getForward();
                drawer.bezierTo(forward.x, forward.y, backward.x, backward.y, vertex.x, vertex.y);
            }
            return this;
        }
    });
});
/**
 * 贝塞尔点
 */
define("graphic/bezierpoint", [ "graphic/shapepoint", "core/class", "graphic/point", "graphic/vector", "graphic/matrix" ], function(require, exports, module) {
    var ShapePoint = require("graphic/shapepoint");
    var Vector = require("graphic/vector");
    var BezierPoint = require("core/class").createClass("BezierPoint", {
        constructor: function(x, y, isSmooth) {
            //顶点
            this.vertex = new ShapePoint(x, y);
            //控制点
            this.forward = new ShapePoint(x, y);
            this.backward = new ShapePoint(x, y);
            //是否平滑
            this.setSmooth(isSmooth === undefined || isSmooth);
            this.setSymReflaction(true);
        },
        clone: function() {
            var newPoint = new BezierPoint(), tmp = null;
            tmp = this.getVertex();
            newPoint.setVertex(tmp.x, tmp.y);
            tmp = this.getForward();
            newPoint.setForward(tmp.x, tmp.y);
            tmp = this.getBackward();
            newPoint.setBackward(tmp.x, tmp.y);
            newPoint.setSmooth(newPoint.isSmooth());
            return newPoint;
        },
        setVertex: function(x, y) {
            this.vertex.setPoint(x, y);
            this.update();
            return this;
        },
        moveTo: function(x, y) {
            var oldForward = this.forward.getPoint(), oldBackward = this.backward.getPoint(), oldVertex = this.vertex.getPoint(), //移动距离
            distance = {
                left: x - oldVertex.x,
                top: y - oldVertex.y
            };
            // 更新
            this.forward.setPoint(oldForward.x + distance.left, oldForward.y + distance.top);
            this.backward.setPoint(oldBackward.x + distance.left, oldBackward.y + distance.top);
            this.vertex.setPoint(x, y);
            this.update();
        },
        setForward: function(x, y) {
            this.forward.setPoint(x, y);
            //更新后置点
            if (this.smooth) {
                this.updateAnother(this.forward, this.backward);
            }
            this.update();
            return this;
        },
        setBackward: function(x, y) {
            this.backward.setPoint(x, y);
            //更新前置点
            if (this.smooth) {
                this.updateAnother(this.backward, this.forward);
            }
            this.update();
            return this;
        },
        setSymReflaction: function(value) {
            this.symReflaction = value;
        },
        isSymReflaction: function() {
            return this.symReflaction;
        },
        updateAnother: function(p, q) {
            var v = this.getVertex(), pv = Vector.fromPoints(p.getPoint(), v), vq = Vector.fromPoints(v, q.getPoint());
            vq = Vector.normalize(pv, this.isSymReflaction() ? pv.length() : vq.length());
            q.setPoint(v.x + vq.x, v.y + vq.y);
        },
        setSmooth: function(isSmooth) {
            this.smooth = !!isSmooth;
            return this;
        },
        getVertex: function() {
            return this.vertex.getPoint();
        },
        getForward: function() {
            return this.forward.getPoint();
        },
        getBackward: function() {
            return this.backward.getPoint();
        },
        isSmooth: function() {
            return this.smooth;
        },
        update: function() {
            if (!this.container) {
                return this;
            }
            //新增参数 this， 把当前引起变化的点传递过去， 以便有需要的地方可以获取到引起变化的源
            if (this.container.update) this.container.update(this);
        }
    });
    return BezierPoint;
});
define("graphic/box", [ "core/class" ], function(require, exports, module) {
    var Box = require("core/class").createClass("Box", {
        constructor: function(x, y, width, height) {
            var box = arguments[0];
            if (box && typeof box === "object") {
                x = box.x;
                y = box.y;
                width = box.width;
                height = box.height;
            }
            if (width < 0) {
                x -= width = -width;
            }
            if (height < 0) {
                y -= height = -height;
            }
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            this.left = this.x;
            this.right = this.x + this.width;
            this.top = this.y;
            this.bottom = this.y + this.height;
            this.cx = this.x + this.width / 2;
            this.cy = this.y + this.height / 2;
        },
        getRangeX: function() {
            return [ this.left, this.right ];
        },
        getRangeY: function() {
            return [ this.left, this.right ];
        },
        merge: function(another) {
            var xMin = Math.min(this.x, another.x), xMax = Math.max(this.right, another.right), yMin = Math.min(this.y, another.y), yMax = Math.max(this.bottom, another.bottom);
            return new Box(xMin, yMin, xMax - xMin, yMax - yMin);
        },
        expand: function(ex, ey, ew, eh) {
            return new Box(this.x + ex, this.y + ey, this.width - ex + ew, this.height - ey + eh);
        },
        valueOf: function() {
            return [ this.x, this.y, this.width, this.height ];
        },
        toString: function() {
            return this.valueOf().join(" ");
        }
    });
    return Box;
});
define("graphic/circle", [ "core/class", "graphic/ellipse", "core/utils", "graphic/point", "graphic/path" ], function(require, exports, module) {
    return require("core/class").createClass("Circle", {
        base: require("graphic/ellipse"),
        constructor: function(radius, cx, cy) {
            this.callBase(radius, radius, cx, cy);
        },
        getRadius: function() {
            return this.getRadiusX();
        },
        setRadius: function(radius) {
            return this.callBase(radius, radius);
        }
    });
});
define("graphic/clip", [ "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box", "graphic/shapecontainer", "graphic/container" ], function(require, exports, module) {
    var Class = require("core/class");
    var Shape = require("graphic/shape");
    var Clip = Class.createClass("Clip", {
        base: Shape,
        mixins: [ require("graphic/shapecontainer") ],
        constructor: function() {
            this.callBase("clipPath");
        },
        clip: function(shape) {
            shape.getNode().setAttribute("clip-path", "url(#" + this.getId() + ")");
            return this;
        }
    });
    Class.extendClass(Shape, {
        clipWith: function(clip) {
            clip.clip(this);
            return this;
        }
    });
    return Clip;
});
define("graphic/color", [ "core/utils", "graphic/standardcolor", "core/class" ], function(require, exports, module) {
    var Utils = require("core/utils"), StandardColor = require("graphic/standardcolor"), ColorUtils = {}, Color = require("core/class").createClass("Color", {
        constructor: function() {
            var colorValue = null;
            //parse构造
            if (typeof arguments[0] === "string") {
                colorValue = ColorUtils.parseToValue(arguments[0]);
                //解析失败
                if (colorValue === null) {
                    colorValue = {
                        r: 0,
                        g: 0,
                        b: 0,
                        h: 0,
                        s: 0,
                        l: 0,
                        a: 1
                    };
                }
            } else {
                colorValue = {
                    r: arguments[0] | 0,
                    g: arguments[1] | 0,
                    b: arguments[2] | 0,
                    //alpha 默认为1
                    a: parseFloat(arguments[3]) || 1
                };
                colorValue = ColorUtils.overflowFormat(colorValue);
                //获取hsl分量
                colorValue = Utils.extend(colorValue, ColorUtils.rgbValueToHslValue(colorValue));
            }
            this._color = colorValue;
        },
        set: function(name, value) {
            var values = null;
            //设置的值非法
            if (!Color._MAX_VALUE[name]) {
                throw new Error("Color set(): Illegal parameter");
            }
            if (name !== "a") {
                value = Math.floor(value);
            }
            if (name == "h") {
                value = (value + 360) % 360;
            }
            this._color[name] = Math.max(Color._MIN_VALUE[name], Math.min(Color._MAX_VALUE[name], value));
            if ("rgb".indexOf(name) !== -1) {
                this._color = Utils.extend(this._color, ColorUtils.rgbValueToHslValue(this._color));
            } else if ("hsl".indexOf(name) !== -1) {
                this._color = Utils.extend(this._color, ColorUtils.hslValueToRGBValue(this._color));
            }
            return this;
        },
        inc: function(name, value) {
            value = this.get(name) + value;
            if (name == "h") {
                value = (value + 360) % 360;
            } else {
                value = Math.min(Color._MAX_VALUE[name], value);
                value = Math.max(Color._MIN_VALUE[name], value);
            }
            return this.clone().set(name, value);
        },
        dec: function(name, value) {
            return this.inc(name, -value);
        },
        clone: function() {
            return new Color(this.toRGBA());
        },
        get: function(name) {
            if (!Color._MAX_VALUE[name]) {
                return null;
            }
            return this._color[name];
        },
        getValues: function() {
            return Utils.clone(this._color);
        },
        valueOf: function() {
            return this.getValues();
        },
        toRGB: function() {
            return ColorUtils.toString(this._color, "rgb");
        },
        toRGBA: function() {
            return ColorUtils.toString(this._color, "rgba");
        },
        toHEX: function() {
            return ColorUtils.toString(this._color, "hex");
        },
        toHSL: function() {
            return ColorUtils.toString(this._color, "hsl");
        },
        toHSLA: function() {
            return ColorUtils.toString(this._color, "hsla");
        },
        //默认实现是调用toRGB或者toRGBA
        toString: function() {
            if (this._color.a === 1) {
                return this.toRGB();
            }
            return this.toRGBA();
        }
    });
    //Color 静态方法
    Utils.extend(Color, {
        //各分量可表示的最大值
        _MAX_VALUE: {
            r: 255,
            g: 255,
            b: 255,
            h: 360,
            s: 100,
            l: 100,
            a: 1
        },
        //各分量最小值
        _MIN_VALUE: {
            r: 0,
            g: 0,
            b: 0,
            h: 0,
            s: 0,
            l: 0,
            a: 0
        },
        //分量常量
        R: "r",
        G: "g",
        B: "b",
        H: "h",
        S: "s",
        L: "l",
        A: "a",
        parse: function(valStr) {
            var rgbValue;
            if (Utils.isString(valStr)) {
                rgbValue = ColorUtils.parseToValue(valStr);
            }
            if (Utils.isObject(valStr) && "r" in valStr) {
                rgbValue = valStr;
            }
            //解析失败， 返回一个默认color实例
            if (rgbValue === null) {
                return new Color();
            }
            return new Color(rgbValue.r, rgbValue.g, rgbValue.b, rgbValue.a);
        },
        createHSL: function(h, s, l) {
            return Color.createHSLA(h, s, l, 1);
        },
        createHSLA: function(h, s, l, a) {
            var colorValue = null;
            s += "%";
            l += "%";
            colorValue = [ "hsla(" + h, s, l, a + ")" ];
            return Color.parse(colorValue.join(", "));
        },
        createRGB: function(r, g, b) {
            return Color.createRGBA(r, g, b, 1);
        },
        createRGBA: function(r, g, b, a) {
            return new Color(r, g, b, a);
        }
    });
    //内部工具对象
    Utils.extend(ColorUtils, {
        parseToValue: function(valStr) {
            var rgbaValue = {};
            /* 优先检测在调色板中是否有对应的颜色 */
            valStr = StandardColor.EXTEND_STANDARD[valStr] || StandardColor.COLOR_STANDARD[valStr] || valStr;
            /* 颜色转换 */
            //hex格式
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(valStr)) {
                rgbaValue = ColorUtils.hexToValue(valStr);
            } else if (/^(rgba?)/i.test(valStr)) {
                rgbaValue = ColorUtils.rgbaToValue(valStr);
            } else if (/^(hsla?)/i.test(valStr)) {
                rgbaValue = ColorUtils.hslaToValue(valStr);
            } else {
                return null;
            }
            return ColorUtils.overflowFormat(rgbaValue);
        },
        hexToValue: function(hexStr) {
            var result = {}, keys = [ "r", "g", "b" ];
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hexStr)) {
                hexStr = RegExp.$1.split("");
                Utils.each(keys, function(key, index) {
                    if (hexStr.length === 3) {
                        result[key] = ColorUtils.toNumber(hexStr[index] + hexStr[index]);
                    } else {
                        result[key] = ColorUtils.toNumber(hexStr[index * 2] + hexStr[index * 2 + 1]);
                    }
                });
                //转换出hsl值
                result = Utils.extend(result, ColorUtils.rgbValueToHslValue(result));
                result.a = 1;
                return result;
            }
            return null;
        },
        rgbaToValue: function(rgbaStr) {
            var result = {}, hasAlpha = false, keys = [ "r", "g", "b" ];
            if (/^(rgba?)/i.test(rgbaStr)) {
                hasAlpha = RegExp.$1.length === 4;
                rgbaStr = rgbaStr.replace(/^rgba?/i, "").replace(/\s+/g, "").replace(/[^0-9,.]/g, "").split(",");
                Utils.each(keys, function(key, index) {
                    result[key] = rgbaStr[index] | 0;
                });
                //转换出hsl值
                result = Utils.extend(result, ColorUtils.rgbValueToHslValue(result));
                result.a = hasAlpha ? parseFloat(rgbaStr[3]) : 1;
                return result;
            }
            return null;
        },
        hslaToValue: function(hslaStr) {
            var result = {}, hasAlpha = false;
            if (/^(hsla?)/i.test(hslaStr)) {
                hasAlpha = RegExp.$1.length === 4;
                hslaStr = hslaStr.replace(/^hsla?/i, "").replace(/\s+/g, "").replace(/[^0-9,.]/g, "").split(",");
                //记录hsl值
                result.h = hslaStr[0] | 0;
                result.s = hslaStr[1] | 0;
                result.l = hslaStr[2] | 0;
                //转换出rgb值
                result = Utils.extend(result, ColorUtils.hslValueToRGBValue(result));
                //hsl值转换为rgb值
                result = ColorUtils.hslValueToRGBValue(result);
                result.a = hasAlpha ? parseFloat(hslaStr[3]) : 1;
                return result;
            }
            return null;
        },
        //hsl值对象转换为rgb值对象
        hslValueToRGBValue: function(hslValue) {
            function trans(v1, v2, vH) {
                if (vH < 0) {
                    vH += 1;
                } else if (vH > 1) {
                    vH -= 1;
                }
                if (6 * vH < 1) {
                    return v1 + (v2 - v1) * 6 * vH;
                } else if (2 * vH < 1) {
                    return v2;
                } else if (3 * vH < 2) {
                    return v1 + (v2 - v1) * (2 / 3 - vH) * 6;
                }
                return v1;
            }
            var q = null, p = null, result = {};
            hslValue = Utils.extend({}, hslValue);
            hslValue.h = hslValue.h / 360;
            hslValue.s = hslValue.s / 100;
            hslValue.l = hslValue.l / 100;
            //分量计算
            if (hslValue.s === 0) {
                result.r = result.g = result.b = hslValue.l;
            } else {
                if (hslValue.l < .5) {
                    q = hslValue.l * (1 + hslValue.s);
                } else {
                    q = hslValue.l + hslValue.s - hslValue.l * hslValue.s;
                }
                p = 2 * hslValue.l - q;
                result.r = trans(p, q, hslValue.h + 1 / 3);
                result.g = trans(p, q, hslValue.h);
                result.b = trans(p, q, hslValue.h - 1 / 3);
            }
            result.r = Math.min(Math.round(result.r * 255), 255);
            result.g = Math.min(Math.round(result.g * 255), 255);
            result.b = Math.min(Math.round(result.b * 255), 255);
            return result;
        },
        //rgb值对象转换为hsl值对象
        rgbValueToHslValue: function(rgbValue) {
            var max = null, min = null, result = {};
            rgbValue = Utils.extend({}, rgbValue);
            rgbValue.r = rgbValue.r / 255;
            rgbValue.g = rgbValue.g / 255;
            rgbValue.b = rgbValue.b / 255;
            max = Math.max(rgbValue.r, rgbValue.g, rgbValue.b);
            min = Math.min(rgbValue.r, rgbValue.g, rgbValue.b);
            //h分量计算
            if (max === min) {
                result.h = 0;
            } else if (max === rgbValue.r) {
                if (rgbValue.g >= rgbValue.b) {
                    result.h = 60 * (rgbValue.g - rgbValue.b) / (max - min);
                } else {
                    result.h = 60 * (rgbValue.g - rgbValue.b) / (max - min) + 360;
                }
            } else if (max === rgbValue.g) {
                result.h = 60 * (rgbValue.b - rgbValue.r) / (max - min) + 120;
            } else if (max === rgbValue.b) {
                result.h = 60 * (rgbValue.r - rgbValue.g) / (max - min) + 240;
            }
            //l分量计算
            result.l = (max + min) / 2;
            //s分量计算
            if (result.l === 0 || max === min) {
                result.s = 0;
            } else if (result.l > 0 && result.l <= .5) {
                result.s = (max - min) / (max + min);
            } else {
                result.s = (max - min) / (2 - max - min);
            }
            //格式化hsl结果
            result.h = Math.round(result.h);
            result.s = Math.round(result.s * 100);
            result.l = Math.round(result.l * 100);
            return result;
        },
        toString: function(colorValue, type) {
            var vals = [];
            colorValue = Utils.extend({}, colorValue);
            if (type.indexOf("hsl") !== -1) {
                colorValue.s += "%";
                colorValue.l += "%";
            }
            if (type !== "hex") {
                Utils.each(type.split(""), function(key) {
                    vals.push(colorValue[key]);
                });
                return (type + "(" + vals.join(", ") + ")").toLowerCase();
            } else {
                vals.push(ColorUtils.toHexValue(+colorValue.r));
                vals.push(ColorUtils.toHexValue(+colorValue.g));
                vals.push(ColorUtils.toHexValue(+colorValue.b));
                return ("#" + vals.join("")).toLowerCase();
            }
        },
        //16进制的2个数字转化为10进制， 如果转化失败， 返回0
        toNumber: function(value) {
            return Number("0x" + value) | 0;
        },
        toHexValue: function(value) {
            var result = value.toString(16);
            return result.length === 1 ? "0" + result : result;
        },
        //溢出控制
        overflowFormat: function(value) {
            var tmpValue = Utils.extend({}, value), keys = "rgba";
            Utils.each(keys.split(""), function(key) {
                if (!tmpValue.hasOwnProperty(key)) {
                    return;
                }
                //上溢出
                tmpValue[key] = Math.min(Color._MAX_VALUE[key], tmpValue[key]);
                //下溢出
                tmpValue[key] = Math.max(Color._MIN_VALUE[key], tmpValue[key]);
            });
            return tmpValue;
        }
    });
    return Color;
});
define("graphic/container", [ "core/class" ], function(require, exports, module) {
    function itemRemove() {
        this.container.removeItem(this);
        return this;
    }
    return require("core/class").createClass("Container", {
        getItems: function() {
            return this.items || (this.items = []);
        },
        getItem: function(index) {
            return this.getItems()[index];
        },
        getFirstItem: function() {
            return this.getItem(0);
        },
        getLastItem: function() {
            return this.getItem(this.getItems().length - 1);
        },
        indexOf: function(item) {
            return this.getItems().indexOf(item);
        },
        eachItem: function(fn) {
            var items = this.getItems(), length = items.length, i;
            for (i = 0; i < length; i++) {
                fn.call(this, i, items[i]);
            }
            return this;
        },
        addItem: function(item, pos, noEvent) {
            var items = this.getItems(), length = items.length;
            if (~items.indexOf(item)) {
                return this;
            }
            if (!(pos >= 0 && pos < length)) {
                pos = length;
            }
            items.splice(pos, 0, item);
            if (typeof item === "object") {
                item.container = this;
                item.remove = itemRemove;
            }
            this.handleAdd(item, pos);
            if (!noEvent) {
                this.onContainerChanged("add", [ item ]);
            }
            return this;
        },
        addItems: function(items) {
            for (var i = 0, l = items.length; i < l; i++) {
                this.addItem(items[i], -1, true);
            }
            this.onContainerChanged("add", items);
            return this;
        },
        setItems: function(items) {
            return this.clear().addItems(items);
        },
        appendItem: function(item) {
            return this.addItem(item);
        },
        prependItem: function(item) {
            return this.addItem(item, 0);
        },
        removeItem: function(pos, noEvent) {
            if (typeof pos !== "number") {
                return this.removeItem(this.indexOf(pos));
            }
            var items = this.getItems(), length = items.length, item = items[pos];
            if (item === undefined) {
                return this;
            }
            items.splice(pos, 1);
            if (item.container) {
                delete item.container;
            }
            if (item.remove) {
                delete item.remove;
            }
            this.handleRemove(item, pos);
            if (!noEvent) {
                this.onContainerChanged("remove", [ item ]);
            }
            return this;
        },
        clear: function() {
            var removed = [];
            var item;
            while (item = this.getFirstItem()) {
                removed.push(item);
                this.removeItem(0, true);
            }
            this.onContainerChanged("remove", removed);
            return this;
        },
        onContainerChanged: function(type, items) {},
        handleAdd: function(item, index) {},
        handleRemove: function(item, index) {}
    });
});
/*
 * 曲线
 * */
define("graphic/curve", [ "core/utils", "core/class", "graphic/path", "graphic/shape", "graphic/svg", "graphic/geometry", "graphic/pointcontainer", "graphic/container" ], function(require, exports, module) {
    var Utils = require("core/utils"), CurveUtil = {
        /*
             * 获取由两个以上的点组成的曲线的平移线
             * @param points 曲线上的点的集合， 集合中的点的数量必须大于2
             * @return 平移线数组
             */
        getCurvePanLines: function(points, smoothFactor) {
            //计算原始点的中点坐标
            var centerPoints = CurveUtil.getCenterPoints(points), //注意：计算中点连线的中点坐标， 得出平移线
            panLines = CurveUtil.getPanLine(points.length, centerPoints);
            //平移线移动到顶点
            return CurveUtil.getMovedPanLines(points, panLines, smoothFactor);
        },
        /*
             * 计算给定点集合的连线的中点
             * @param points
             */
        getCenterPoints: function(points) {
            var centerPoints = {}, key = null;
            for (var i = 0, j = 0, len = points.length; i < len; i++) {
                //j是下一个点的索引
                j = i === len - 1 ? 0 : i + 1;
                key = i + "," + j;
                //计算中点坐标
                centerPoints[key] = {
                    x: (points[i].x + points[j].y) / 2,
                    y: (points[i].x + points[j].y) / 2
                };
            }
            return centerPoints;
        },
        /*
             * 对getCenterPoints()接口获取到的数据做处理， 计算出各个顶点对应的平移线数据
             * @param length 集合中点的个数
             * @param points 点集合， 该集合应该是getCenterPoints()接口返回的数据
             */
        getPanLine: function(length, points) {
            var result = {}, //顶点索引
            pointIndex = null;
            for (var i = 0, j; i < length; i++) {
                var point1 = null, point2 = null;
                //计算当前点
                j = (i + 1) % length;
                //保存当前处理的顶点索引
                pointIndex = j;
                point1 = points[i + "," + j];
                //计算下一个点
                i = j;
                j = (i + 1) % length;
                point2 = points[i + "," + j];
                result[pointIndex] = {
                    points: [ {
                        x: point1.x,
                        y: point1.y
                    }, {
                        x: point2.x,
                        y: point2.y
                    } ],
                    center: {
                        x: (point1.x + point2.x) / 2,
                        y: (point1.y + point2.y) / 2
                    }
                };
                //还原i值
                i = (pointIndex + length - 1) % length;
            }
            return result;
        },
        /*
             * 计算平移线移动到顶点后的位置
             * @param points 顶点集合
             * @param panLines 平移线集合
             */
        getMovedPanLines: function(points, panLines, smoothFactor) {
            var result = {};
            Utils.each(points, function(point, index) {
                //当前平移线
                var currentPanLine = panLines[index], //平移线中点
                center = currentPanLine.center, //移动距离
                distance = {
                    x: center.x - point.x,
                    y: center.y - point.y
                };
                var currentResult = result[index] = {
                    points: [],
                    center: {
                        x: point.x,
                        y: point.y
                    }
                };
                //计算控制点到顶点的距离， 并且应用平滑系数到距离上
                Utils.each(currentPanLine.points, function(controlPoint, index) {
                    var moved = {
                        x: controlPoint.x - distance.x,
                        y: controlPoint.y - distance.y
                    };
                    var vertex = currentResult.center;
                    var dx = moved.x - vertex.x;
                    var dy = moved.y - vertex.y;
                    moved.x = vertex.x + smoothFactor * dx;
                    moved.y = vertex.y + smoothFactor * dy;
                    currentResult.points.push(moved);
                });
            });
            return result;
        }
    };
    return require("core/class").createClass("Curve", {
        base: require("graphic/path"),
        mixins: [ require("graphic/pointcontainer") ],
        constructor: function(points, isColse) {
            this.callBase();
            this.setPoints(points || []);
            this.closeState = !!isColse;
            this.changeable = true;
            this.smoothFactor = 1;
            this.update();
        },
        //当点集合发生变化时采取的动作
        onContainerChanged: function() {
            if (this.changeable) {
                this.update();
            }
        },
        setSmoothFactor: function(factor) {
            this.smoothFactor = factor < 0 ? 0 : factor;
            this.update();
            return this;
        },
        getSmoothFactor: function() {
            return this.smoothFactor;
        },
        update: function() {
            var points = this.getPoints(), withControlPoints = null, drawer = this.getDrawer(), curPoint = null, curControlPoint = null, prevControlPoint = null;
            drawer.clear();
            if (points.length === 0) {
                return this;
            } else {
                drawer.moveTo(points[0]);
            }
            if (points.length === 1) {
                return this;
            }
            if (points.length === 2) {
                drawer.lineTo(points[1]);
                return this;
            }
            //获取已转换过后的带控制点的所有点
            withControlPoints = CurveUtil.getCurvePanLines(points, this.getSmoothFactor());
            for (var i = 1, len = points.length; i < len; i++) {
                //当前顶点
                curPoint = withControlPoints[i].center;
                //当前控制点
                if (this.closeState || i != len - 1) {
                    curControlPoint = withControlPoints[i].points[0];
                } else {
                    //非闭合状态下最后一个点的处理
                    curControlPoint = withControlPoints[i].center;
                }
                if (this.closeState || i != 1) {
                    prevControlPoint = withControlPoints[i - 1].points[1];
                } else {
                    //非闭合状态下第一个点的处理
                    prevControlPoint = withControlPoints[i - 1].center;
                }
                drawer.bezierTo(prevControlPoint.x, prevControlPoint.y, curControlPoint.x, curControlPoint.y, curPoint.x, curPoint.y);
            }
            //处理闭合
            if (this.closeState) {
                curPoint = withControlPoints[0].center;
                curControlPoint = withControlPoints[0].points[0];
                prevControlPoint = withControlPoints[points.length - 1].points[1];
                drawer.bezierTo(prevControlPoint.x, prevControlPoint.y, curControlPoint.x, curControlPoint.y, curPoint.x, curPoint.y);
            }
            return this;
        },
        close: function() {
            this.closeState = true;
            return this.update();
        },
        open: function() {
            this.closeState = false;
            return this.update();
        },
        isClose: function() {
            return !!this.closeState;
        }
    });
});
define("graphic/data", [ "core/class" ], function(require, exports, module) {
    return require("core/class").createClass("Data", {
        constructor: function() {
            this._data = {};
        },
        setData: function(name, value) {
            this._data[name] = value;
            return this;
        },
        getData: function(name) {
            return this._data[name];
        },
        removeData: function(name) {
            delete this._data[name];
            return this;
        }
    });
});
define("graphic/defbrush", [ "core/class", "graphic/resource", "graphic/svg" ], function(require, exports, module) {
    return require("core/class").createClass("GradientBrush", {
        base: require("graphic/resource"),
        constructor: function(nodeType) {
            this.callBase(nodeType);
        }
    });
});
define("graphic/ellipse", [ "core/utils", "graphic/point", "core/class", "graphic/path", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    var Utils = require("core/utils"), Point = require("graphic/point");
    return require("core/class").createClass("Ellipse", {
        base: require("graphic/path"),
        constructor: function(rx, ry, cx, cy) {
            this.callBase();
            this.rx = rx || 0;
            this.ry = ry || 0;
            this.cx = cx || 0;
            this.cy = cy || 0;
            this.update();
        },
        update: function() {
            var rx = this.rx, ry = this.ry, x1 = this.cx + rx, x2 = this.cx - rx, y = this.cy;
            var drawer = this.getDrawer();
            drawer.clear();
            drawer.moveTo(x1, y);
            drawer.arcTo(rx, ry, 0, 1, 1, x2, y);
            drawer.arcTo(rx, ry, 0, 1, 1, x1, y);
            return this;
        },
        getRadius: function() {
            return {
                x: this.rx,
                y: this.ry
            };
        },
        getRadiusX: function() {
            return this.rx;
        },
        getRadiusY: function() {
            return this.ry;
        },
        getCenter: function() {
            return new Point(this.cx, this.cy);
        },
        getCenterX: function() {
            return this.cx;
        },
        getCenterY: function() {
            return this.cy;
        },
        setRadius: function(rx, ry) {
            this.rx = rx;
            this.ry = ry;
            return this.update();
        },
        setRadiusX: function(rx) {
            this.rx = rx;
            return this.update();
        },
        setRadiusY: function(ry) {
            this.ry = ry;
            return this.update();
        },
        setCenter: function(cx, cy) {
            if (arguments.length == 1) {
                var p = Point.parse(arguments[0]);
                cx = p.x;
                cy = p.y;
            }
            this.cx = cx;
            this.cy = cy;
            return this.update();
        },
        setCenterX: function(cx) {
            this.cx = cx;
            return this.update();
        },
        setCenterY: function(cy) {
            this.cy = cy;
            return this.update();
        }
    });
});
/*
 * kity event 实现
 */
define("graphic/eventhandler", [ "core/utils", "graphic/shapeevent", "graphic/matrix", "graphic/point", "core/class" ], function(require, exports, module) {
    // polyfill
    (function() {
        function CustomEvent(event, params) {
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: undefined
            };
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    })();
    var Utils = require("core/utils"), ShapeEvent = require("graphic/shapeevent");
    // 内部处理器缓存
    var INNER_HANDLER_CACHE = {}, // 用户处理器缓存
    USER_HANDLER_CACHE = {}, guid = 0;
    // 添加事件统一入口
    function _addEvent(type, handler, isOnce) {
        isOnce = !!isOnce;
        if (Utils.isString(type)) {
            type = type.match(/\S+/g);
        }
        Utils.each(type, function(currentType) {
            listen.call(this, this.node, currentType, handler, isOnce);
        }, this);
        return this;
    }
    // 移除事件统一入口
    function _removeEvent(type, handler) {
        var userHandlerList = null, eventId = this._EVNET_UID, isRemoveAll = handler === undefined;
        try {
            userHandlerList = USER_HANDLER_CACHE[eventId][type];
        } catch (e) {
            return;
        }
        //移除指定的监听器
        if (!isRemoveAll) {
            isRemoveAll = true;
            Utils.each(userHandlerList, function(fn, index) {
                if (fn === handler) {
                    // 不能结束， 需要查找完整个list， 避免丢失移除多次绑定同一个处理器的情况
                    delete userHandlerList[index];
                } else {
                    isRemoveAll = false;
                }
            });
        }
        //删除所有监听器
        if (isRemoveAll) {
            deleteDomEvent(this.node, type, INNER_HANDLER_CACHE[eventId][type]);
            delete USER_HANDLER_CACHE[eventId][type];
            delete INNER_HANDLER_CACHE[eventId][type];
        }
        return this;
    }
    // 执行绑定, 该方法context为shape或者mixin了eventhandler的对象
    function listen(node, type, handler, isOnce) {
        var eid = this._EVNET_UID, targetObject = this;
        // 初始化内部监听器
        if (!INNER_HANDLER_CACHE[eid]) {
            INNER_HANDLER_CACHE[eid] = {};
        }
        if (!INNER_HANDLER_CACHE[eid][type]) {
            // 内部监听器
            INNER_HANDLER_CACHE[eid][type] = function(e) {
                e = new ShapeEvent(e || window.event);
                Utils.each(USER_HANDLER_CACHE[eid][type], function(fn) {
                    var result;
                    if (fn) {
                        result = fn.call(targetObject, e);
                        //once 绑定， 执行完后删除
                        if (isOnce) {
                            targetObject.off(type, fn);
                        }
                    }
                    // 如果用户handler里return了false， 则该节点上的此后的同类型事件将不再执行
                    return result;
                }, targetObject);
            };
        }
        // 初始化用户监听器列表
        if (!USER_HANDLER_CACHE[eid]) {
            USER_HANDLER_CACHE[eid] = {};
        }
        if (!USER_HANDLER_CACHE[eid][type]) {
            USER_HANDLER_CACHE[eid][type] = [ handler ];
            // 绑定对应类型的事件
            // dom对象利用dom event进行处理， 非dom对象， 由消息分发机制处理
            if (!!node) {
                bindDomEvent(node, type, INNER_HANDLER_CACHE[eid][type]);
            }
        } else {
            USER_HANDLER_CACHE[eid][type].push(handler);
        }
    }
    // 绑定dom事件
    function bindDomEvent(node, type, handler) {
        if (node.addEventListener) {
            node.addEventListener(type, handler, false);
        } else {
            node.attachEvent("on" + type, handler);
        }
    }
    // 删除dom事件
    function deleteDomEvent(node, type, handler) {
        if (node.removeEventListener) {
            node.removeEventListener(type, handler, false);
        } else {
            node.detachEvent(type, handler);
        }
    }
    // 触发dom事件
    function triggerDomEvent(node, type, params) {
        var event = new CustomEvent(type, {
            bubbles: true,
            cancelable: true
        });
        event._kityParam = params;
        node.dispatchEvent(event);
    }
    // 发送消息
    function sendMessage(messageObj, type, msg) {
        var event = null, handler = null;
        try {
            handler = INNER_HANDLER_CACHE[messageObj._EVNET_UID][type];
            if (!handler) {
                return;
            }
        } catch (exception) {
            return;
        }
        event = Utils.extend({
            type: type,
            target: messageObj
        }, msg || {});
        handler.call(messageObj, event);
    }
    // 对外接口
    return require("core/class").createClass("EventHandler", {
        constructor: function() {
            this._EVNET_UID = ++guid;
        },
        addEventListener: function(type, handler) {
            return _addEvent.call(this, type, handler, false);
        },
        addOnceEventListener: function(type, handler) {
            return _addEvent.call(this, type, handler, true);
        },
        removeEventListener: function(type, handler) {
            return _removeEvent.call(this, type, handler);
        },
        on: function(type, handler) {
            return this.addEventListener.apply(this, arguments);
        },
        once: function(type, handler) {
            return this.addOnceEventListener.apply(this, arguments);
        },
        off: function() {
            return this.removeEventListener.apply(this, arguments);
        },
        fire: function(type, params) {
            return this.trigger.apply(this, arguments);
        },
        trigger: function(type, params) {
            if (this.node) {
                triggerDomEvent(this.node, type, params);
            } else {
                sendMessage(this, type, params);
            }
            return this;
        }
    });
});
define("graphic/geometry", [ "core/utils", "graphic/point", "core/class", "graphic/vector", "graphic/matrix", "graphic/box" ], function(require) {
    var utils = require("core/utils");
    var Point = require("graphic/point");
    var Vector = require("graphic/vector");
    var Matrix = require("graphic/matrix");
    var g = {};
    var pathCommand = /([achlmrqstvz])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?\s*)+)/gi, pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)\s*,?\s*/gi, paramCounts = {
        a: 7,
        c: 6,
        h: 1,
        l: 2,
        m: 2,
        q: 4,
        s: 4,
        t: 2,
        v: 1,
        z: 0
    };
    function pathClone(path) {
        var result, i, j, segment, segmentCopy;
        result = [];
        for (i = 0; i < path.length; i++) {
            segment = path[i];
            result.push(segmentCopy = []);
            for (j = 0; j < segment.length; j++) {
                segmentCopy.push(segment[j]);
            }
        }
        if (path.isUniform) result.isUniform = true;
        if (path.isAbsolute) result.isAbsolute = true;
        if (path.isCurve) result.isCurve = true;
        return result;
    }
    // 缓存函数
    // from raphael.js
    function cacher(f, scope, postprocessor) {
        function repush(array, item) {
            for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
                return array.push(array.splice(i, 1)[0]);
            }
        }
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0), args = arg.join("␀"), cache = newf.cache = newf.cache || {}, count = newf.count = newf.count || [];
            if (cache.hasOwnProperty(args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            if (count.length >= 1e3) {
                delete cache[count.shift()];
            }
            count.push(args);
            cache[args] = f.apply(scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }
    /**
     *
     * kity.g.pathToString(pathSegment)
     *
     * 返回表示 PathSegment 的字符串
     *
     * @param  {Array} pathSegment
     *     要表示的 Path Segment
     *
     * @return {String} 表示该 Path 的字符串
     *
     * @example
     *
     *     var pathSegment = [['M', 0, 0], ['L', 10, 10]]
     *     var pathString = kity.g.pathToString(pathSegment);
     *     // 返回 'M0,0L10,10'
     */
    g.pathToString = function(pathSegment) {
        pathSegment = pathSegment || this;
        if (typeof pathSegment == "string") return pathSegment;
        if (pathSegment instanceof Array) {
            pathSegment = utils.flatten(pathSegment);
            return pathSegment.join(",").replace(/,?([achlmqrstvxz]),?/gi, "$1");
        }
    };
    /**
     * kity.g.parsePathString(pathString)
     *
     * 解析 Path 字符串成 PathSegment
     *
     * @copyright rapheal.js
     *
     * @example
     *
     *     var seg = kity.g.parsePathString('M10,12l21-23-21.5,11z');
     *     // 返回: [['M', 10, 12], ['l', 21, -23], ['l', -21.5, 11], ['z']]
     *
     * @param  {String} pathString Path 字符串
     * @return {Array}
     */
    g.parsePathString = cacher(function(pathString) {
        var data = [];
        pathString.replace(pathCommand, function(a, b, c) {
            var params = [], name = b.toLowerCase();
            c.replace(pathValues, function(a, b) {
                if (b) params.push(+b);
            });
            if (name == "m" && params.length > 2) {
                data.push([ b ].concat(params.splice(0, 2)));
                name = "l";
                b = b == "m" ? "l" : "L";
            }
            if (name == "r") {
                data.push([ b ].concat(params));
            } else {
                while (params.length >= paramCounts[name]) {
                    data.push([ b ].concat(params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            }
        });
        data.isUniform = true;
        data.toString = g.pathToString;
        return data;
    });
    /**
     * kity.g.pathToAbsolute(path)
     *
     * 把路径转换为绝对路径的形式
     *
     * @param {Array|String} path
     *     要转换的 path 路径或者数组
     *
     * @return {Array}
     *     转换后的 Path Segment
     *
     * @example
     *
     *     var path = 'M10,10l50,50';
     *     var absPath = kity.g.pathToAbsolute(path);
     *     // 返回 [['M', 10, 10], ['L', 60, 60]]
     */
    g.pathToAbsolute = cacher(function(path) {
        var pathArray = path.isUniform ? path : g.parsePathString(g.pathToString(path));
        var res = [], x = 0, y = 0, mx = 0, my = 0, start = 0;
        var r, pa, i, j, k, ii, jj, kk;
        if (pathArray[0][0] == "M") {
            x = +pathArray[0][1];
            y = +pathArray[0][2];
            mx = x;
            my = y;
            start++;
            res[0] = [ "M", x, y ];
        }
        for (r, pa, i = start, ii = pathArray.length; i < ii; i++) {
            res.push(r = []);
            pa = pathArray[i];
            if (pa[0] != pa[0].toUpperCase()) {
                r[0] = pa[0].toUpperCase();
                switch (r[0]) {
                  case "A":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +(pa[6] + x);
                    r[7] = +(pa[7] + y);
                    break;

                  case "V":
                    r[1] = +pa[1] + y;
                    break;

                  case "H":
                    r[1] = +pa[1] + x;
                    break;

                  case "M":
                    mx = +pa[1] + x;
                    my = +pa[2] + y;
                    break;

                  default:
                    for (j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + (j % 2 ? x : y);
                    }
                }
            } else {
                for (k = 0, kk = pa.length; k < kk; k++) {
                    r[k] = pa[k];
                }
            }
            switch (r[0]) {
              case "Z":
                x = mx;
                y = my;
                break;

              case "H":
                x = r[1];
                break;

              case "V":
                y = r[1];
                break;

              case "M":
                mx = r[r.length - 2];
                my = r[r.length - 1];
                break;

              default:
                x = r[r.length - 2];
                y = r[r.length - 1];
            }
        }
        res.isUniform = true;
        res.isAbsolute = true;
        res.toString = g.pathToString;
        return res;
    });
    // 把圆弧绘制的曲线转化为对应的三次贝塞尔形式
    function a2c(x1, y1, rx, ry, angle, laf, sf, x2, y2, recursive) {
        // copy from raphael.js
        // for more information of where this math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var math = Math, PI = math.PI, abs = Math.abs, _120 = PI * 120 / 180, rad = PI / 180 * (+angle || 0), res = [], xy, rotate = function(x, y, rad) {
            var X = x * math.cos(rad) - y * math.sin(rad), Y = x * math.sin(rad) + y * math.cos(rad);
            return {
                x: X,
                y: Y
            };
        };
        var cos, sin, h, x, y, rx2, ry2, k, cx, cy, f1, f2, df, f2old, x2old, y2old, c1, s1, c2, s2, t, hx, hy, m1, m2, m3, m4, newres, i, ii;
        if (!recursive) {
            xy = rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            cos = math.cos(PI / 180 * angle);
            sin = math.sin(PI / 180 * angle);
            x = (x1 - x2) / 2;
            y = (y1 - y2) / 2;
            h = x * x / (rx * rx) + y * y / (ry * ry);
            if (h > 1) {
                h = math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            rx2 = rx * rx;
            ry2 = ry * ry;
            k = (laf == sf ? -1 : 1) * math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
            cx = k * rx * y / ry + (x1 + x2) / 2;
            cy = k * -ry * x / rx + (y1 + y2) / 2;
            f1 = math.asin(((y1 - cy) / ry).toFixed(9));
            f2 = math.asin(((y2 - cy) / ry).toFixed(9));
            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2;
            if (f1 < 0) f1 = PI * 2 + f1;
            if (f2 < 0) f2 = PI * 2 + f2;
            if (sf && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if (!sf && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        df = f2 - f1;
        if (abs(df) > _120) {
            f2old = f2;
            x2old = x2;
            y2old = y2;
            f2 = f1 + _120 * (sf && f2 > f1 ? 1 : -1);
            x2 = cx + rx * math.cos(f2);
            y2 = cy + ry * math.sin(f2);
            res = a2c(x2, y2, rx, ry, angle, 0, sf, x2old, y2old, [ f2, f2old, cx, cy ]);
        }
        df = f2 - f1;
        c1 = math.cos(f1);
        s1 = math.sin(f1);
        c2 = math.cos(f2);
        s2 = math.sin(f2);
        t = math.tan(df / 4);
        hx = 4 / 3 * rx * t;
        hy = 4 / 3 * ry * t;
        m1 = [ x1, y1 ];
        m2 = [ x1 + hx * s1, y1 - hy * c1 ];
        m3 = [ x2 + hx * s2, y2 - hy * c2 ];
        m4 = [ x2, y2 ];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [ m2, m3, m4 ].concat(res);
        } else {
            res = [ m2, m3, m4 ].concat(res).join().split(",");
            newres = [];
            for (i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    }
    // 把二次贝塞尔曲线参数转化为三次贝塞尔曲线参数
    function q2c(x1, y1, ax, ay, x2, y2) {
        // copy from raphael.js
        var _13 = 1 / 3, _23 = 2 / 3;
        return [ _13 * x1 + _23 * ax, _13 * y1 + _23 * ay, _13 * x2 + _23 * ax, _13 * y2 + _23 * ay, x2, y2 ];
    }
    /**
     * kity.g.pathToCurve(path)
     *
     * 把路径转换为贝塞尔路径
     *
     * @param  {Array|String} path
     *     要转换的 path 路径或数组
     *
     * @return {Array}
     *     转换后的 PathSegment，每一段都是 'C'
     */
    g.pathToCurve = cacher(function(path) {
        var i, j, command, param;
        var initPoint, currentPoint, endPoint, shouldClose, lastControlPoint, aussumedControlPoint;
        var controlPoint1, controlPoint2;
        var res = [];
        // 处理的路径要求是一个绝对路径
        if (!path.isAbsolute) path = g.pathToAbsolute(path);
        for (i = 0; i < path.length; i++) {
            command = path[i][0];
            param = path[i].slice(1);
            // 画笔移动
            if (command == "M") {
                initPoint = lastControlPoint = currentPoint = param;
                res.push(path[i]);
                continue;
            }
            // 路径闭合
            if (command == "Z") {
                shouldClose = true;
                command = "L";
                param = initPoint;
            }
            // 绘制命令的目的位置
            endPoint = param.slice(param.length - 2);
            // 对 'H' 命令的修正
            if (command == "H") {
                endPoint = [ param[0], currentPoint[1] ];
                command = "L";
            }
            // 对 'V' 命令的修正
            if (command == "V") {
                endPoint = [ currentPoint[0], param[0] ];
                command = "L";
            }
            // 对 'S' 命令求出隐含的控制点位置
            if (command == "S" || command == "T") {
                // 隐含控制点是上一个控制点关于当前位置的镜像
                aussumedControlPoint = [ currentPoint[0] + (currentPoint[0] - lastControlPoint[0]), currentPoint[1] + (currentPoint[1] - lastControlPoint[1]) ];
            }
            // 针对不同的命令求控制点
            switch (command) {
              case "L":
                controlPoint1 = currentPoint;
                controlPoint2 = endPoint;
                break;

              case "C":
                controlPoint1 = param.slice(0, 2);
                controlPoint2 = param.slice(2, 4);
                break;

              case "S":
                controlPoint1 = aussumedControlPoint.slice();
                controlPoint2 = param.slice(0, 2);
                break;

              case "Q":
                lastControlPoint = param.slice(0, 2);
                param = q2c.apply(null, currentPoint.concat(param));
                controlPoint1 = param.slice(0, 2);
                controlPoint2 = param.slice(2, 4);
                break;

              case "T":
                param = q2c.apply(null, currentPoint.concat(aussumedControlPoint).concat(param));
                controlPoint1 = param.slice(0, 2);
                controlPoint2 = param.slice(2, 4);
                break;

              case "A":
                param = a2c.apply(null, currentPoint.concat(param));
                j = 0;
                while (j in param) {
                    controlPoint1 = param.slice(j, j + 2);
                    controlPoint2 = param.slice(j + 2, j + 4);
                    endPoint = param.slice(j + 4, j + 6);
                    // 写入当前一段曲线
                    res.push([ "C" ].concat(controlPoint1).concat(controlPoint2).concat(endPoint));
                    j += 6;
                }
                break;
            }
            if (command != "A") {
                // 写入当前一段曲线
                res.push([ "C" ].concat(controlPoint1).concat(controlPoint2).concat(endPoint));
            }
            // 为下次循环准备当前位置
            currentPoint = endPoint;
            // 二次贝塞尔曲线自己已经记录了上个控制点的位置，其它的记录控制点 2 的位置
            if (command != "Q") {
                lastControlPoint = controlPoint2;
            }
            if (shouldClose) {
                res.push([ "Z" ]);
                shouldClose = false;
            }
        }
        res.isUniform = true;
        res.isAbsolute = true;
        res.isCurve = true;
        res.toString = g.pathToString;
        return res;
    });
    /**
     * 将贝塞尔曲线切成两部分
     *
     * @see http://stackoverflow.com/questions/18655135/divide-bezier-curve-into-two-equal-halves
     */
    function cutBezier(bezierArray, t) {
        function __(t) {
            return function(p, q) {
                return p + t * (q - p);
            };
        }
        var _ = __(t || .5), ba = bezierArray, ax = ba[0], ay = ba[1], bx = ba[2], by = ba[3], cx = ba[4], cy = ba[5], dx = ba[6], dy = ba[7], ex = _(ax, bx), ey = _(ay, by), fx = _(bx, cx), fy = _(by, cy), gx = _(cx, dx), gy = _(cy, dy), hx = _(ex, fx), hy = _(ey, fy), jx = _(fx, gx), jy = _(fy, gy), kx = _(hx, jx), ky = _(hy, jy);
        return [ [ ax, ay, ex, ey, hx, hy, kx, ky ], [ kx, ky, jx, jy, gx, gy, dx, dy ] ];
    }
    /**
     * kity.g.cutBezier(bezierArray, t)
     *
     * 在指定位置把贝塞尔曲线切割为两部分
     *
     * @param {Array} bezierArray
     *     表示贝塞尔曲线的一个数组 [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y]
     *     p1 和 p2 是贝塞尔曲线的起点和终点，c1 和 c2 是两个控制点
     *
     * @param {Number} t
     *     切割的位置（0 到 1）
     *
     * @return {Array}
     *     切割的两个贝塞尔曲线：[
     *         [p1x1, p1y1, c1x1, c1y1, c2x1, c2y1, p2x1, p2y1],
     *         [p1x2, p1y2, c1x2, c1y2, c2x2, c2y2, p2x2, p2y2]
     *     ]
     *
     */
    g.cutBezier = cacher(cutBezier);
    /**
     * 求一段贝塞尔曲线的子段
     *
     * @param {Array} bezierArray
     *     长度为 8 的数组，表示 [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y]
     *
     * @param {Number} t
     *     子段的结束位置（0 到 1）
     *
     * @param {Number} t0
     *     字段的开始位置（0 到 t），可不传，默认为 0
     *
     * @return {Array}
     *     长度为 8 的数组，表示给定贝塞尔曲线的子段
     */
    g.subBezier = function(bezierArray, t, t0) {
        var b2t = cutBezier(bezierArray, t)[0];
        return t0 ? cutBezier(b2t, t0 / t)[1] : b2t;
    };
    /**
     * 求贝塞尔曲线上的一个点
     *
     * @param {Array} bezierArray
     *     长度为 8 的数组，表示 [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y]
     *
     * @param {Number} t
     *     所求点的开始位置（0 到 1）
     *
     * @return {Point} p
     *     p.x: x 坐标
     *     p.y: y 坐标
     *     p.tan: 在 t 处的切线方向（类型为 kity.Vector，模为 1）
     */
    g.pointAtBezier = function(bezierArray, t) {
        var b2t = cutBezier(bezierArray, t)[0];
        var p = Point.parse(b2t.slice(6)), c = Point.parse(b2t.slice(4, 2)), v = Vector.fromPoints(c, p);
        if (t === 0) {
            p.tan = g.pointAtBezier(bezierArray, .01).tan;
        } else {
            p.tan = v.normalize();
        }
        return p;
    };
    /**
     * 求贝塞尔曲线的长度
     *
     * @param {Array} bezierArray
     *     长度为 8 的数组，表示 [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y]
     *
     * @param {Number} tolerate
     *     允许的误差，默认是 0.1
     *
     * @return {Number} 贝塞尔曲线的长度
     */
    g.bezierLength = cacher(function bezierLength(bezierArray) {
        // 表示（c[0]*t^4 + c[1]*t^3 + c[2]*t^2 + c[3]*t^1 + c[4])^(1/2)的函数
        function f(x) {
            var m = c0 * Math.pow(x, 4) + c1 * Math.pow(x, 3) + c2 * Math.pow(x, 2) + c3 * x + c4;
            if (m < 0) {
                m = 0;
            }
            return Math.pow(m, .5);
        }
        // 用Newton-Cotes型求积公式
        var arr = bezierArray;
        // 三次贝塞尔曲线函数求导后，求出对应的方程系数，用cx[],cy[]表示x`(t)和y`(t)的系数
        var cx0, cx1, cx2;
        var cy0, cy1, cy2;
        // 用c[]表示x`(t)^2 + y`(t)^2的结果的系数
        var c0, c1, c2, c3, c4;
        // 求x`(t) 和 y`(t)的系数
        cx0 = -3 * arr[0] + 9 * arr[2] - 9 * arr[4] + 3 * arr[6];
        cx1 = 6 * arr[0] - 12 * arr[2] + 6 * arr[4];
        cx2 = -3 * arr[0] + 3 * arr[2];
        cy0 = -3 * arr[1] + 9 * arr[3] - 9 * arr[5] + 3 * arr[7];
        cy1 = 6 * arr[1] - 12 * arr[3] + 6 * arr[5];
        cy2 = -3 * arr[1] + 3 * arr[3];
        // 求x`(t)^2 + y`(t)^2的结果的系数 c[]
        c0 = Math.pow(cx0, 2) + Math.pow(cy0, 2);
        c1 = 2 * (cx0 * cx1 + cy0 * cy1);
        c2 = 2 * (cx0 * cx2 + cy0 * cy2) + Math.pow(cx1, 2) + Math.pow(cy1, 2);
        c3 = 2 * (cx1 * cx2 + cy1 * cy2);
        c4 = Math.pow(cx2, 2) + Math.pow(cy2, 2);
        // 用cotes积分公式求值
        return (f(0) + f(1) + 4 * (f(.125) + f(.375) + f(.625) + f(.875)) + 2 * (f(.25) + f(.5) + f(.75))) / 24;
    });
    // 计算一个 pathSegment 中每一段的在整体中所占的长度范围，以及总长度
    // 方法要求每一段都是贝塞尔曲线
    var getBezierPathSegmentRanges = cacher(function(pathSegment) {
        var i, ii, segment, position, bezierLength, segmentRanges, totalLength;
        segmentRanges = [];
        // 总长度
        totalLength = 0;
        for (i = 0, ii = pathSegment.length; i < ii; i++) {
            segment = pathSegment[i];
            if (segment[0] == "M") {
                position = segment.slice(1);
                segmentRanges.push(null);
                continue;
            }
            if (segment[0] == "Z") {
                segmentRanges.push(null);
                continue;
            }
            bezierLength = g.bezierLength(position.concat(segment.slice(1)));
            segmentRanges.push([ totalLength, totalLength + bezierLength ]);
            totalLength += bezierLength;
            // 迭代当前位置
            position = segment.slice(4);
        }
        segmentRanges.totalLength = totalLength;
        return segmentRanges;
    });
    /**
     * 求一段路径的子路径
     *
     * @param  {Array|String} path
     *     原路径
     *
     * @param  {Number} t1
     *     要求的子路径的结束位置（0 到 1）
     *
     * @param  {Number} t0
     *     要求的子路径的开始位置（0 到 t1），可不传，默认为 0
     *
     * @return {Array}
     *     子路径的 PathSegment
     */
    g.subPath = function(path, t1, t0) {
        var dt;
        t0 = t0 || 0;
        dt = t1 - t0;
        dt = dt - (dt | 0);
        t0 = t0 - (t0 | 0);
        t1 = t0 + dt;
        if (t1 > 1) {
            return g.subPath(path, 1, t0).concat(g.subPath(path, t1 - 1));
        }
        if (!path.isCurve) {
            path = g.pathToCurve(path);
        }
        // path 每一段在整体中的长度区间
        var segmentRanges = getBezierPathSegmentRanges(path);
        // path 总长度
        var totalLength = segmentRanges.totalLength;
        // t1 和 t0 位置命中的长度位置
        var t1Length = totalLength * t1, t0Length = totalLength * (t0 || 0);
        // 产生的子路径
        var subPath = [];
        // 迭代变量，a 是一段的长度区间左值，b 是右值，d 是区间长度
        var i, ii, a, b, d;
        var position;
        var bezier, subBezier, stared;
        for (i = 0, ii = path.length; i < ii; i++) {
            if (path[i][0] == "M") {
                position = path[i].slice(1);
                if (stared) {
                    subPath.push(path[i].slice());
                }
                continue;
            }
            if (path[i][0] == "Z") {
                // subpath 路径不闭合
                continue;
            }
            a = segmentRanges[i][0];
            b = segmentRanges[i][1];
            d = b - a;
            bezier = position.concat(path[i].slice(1));
            if (t0Length > b) {
                // t0 和 t1 都右溢出
                // -----------------------------------
                //            t0   t1
                // |________|
                //
                // 需要跳过当前块
                position = bezier.slice(bezier.length - 2);
                continue;
            } else if (t0Length >= a) {
                // 命中 t0；t1 可能命中或右溢出
                // -----------------------------------
                //            t0   t1
                //     |______|__|
                //
                //     or:  |_|____|__|
                //
                // 取当前块 t0 到 t1 的部分
                subBezier = g.subBezier(bezier, Math.min((t1Length - a) / d, 1), (t0Length - a) / d);
                stared = true;
                position = subBezier.slice(0, 2);
                subPath.push([ "M" ].concat(subBezier.slice(0, 2)));
                subPath.push([ "C" ].concat(subBezier.slice(2)));
            } else if (t1Length >= b) {
                // t0 左溢出；t1 右溢出，整个块是需要的
                // -----------------------------------
                //       t0             t1
                //          |_________|
                //
                // 此时取整个块
                subPath.push(path[i].slice());
            } else if (t1Length >= a) {
                // t0 左溢出；t1 命中，取当前块 t1 之前的部分
                // -----------------------------------
                //            t0   t1
                //              |__|______|
                // 取当前块 t1 之前的部分
                subBezier = g.subBezier(bezier, (t1Length - a) / d);
                subPath.push([ "C" ].concat(subBezier.slice(2)));
                stared = false;
            } else {
                // 没有可以再要的了
                break;
            }
            position = bezier.slice(bezier.length - 2);
        }
        subPath.isAbsolute = true;
        subPath.isCurve = true;
        subPath.isUniform = true;
        subPath.toString = g.pathToString;
        return subPath;
    };
    /**
     * 求路径上的一个点
     *
     * @param  {Array|String} path
     *     要求点的路径
     *
     * @param  {Number} t
     *     要求的点的位置（0 到 1）
     *
     * @return {Point} p
     *     p.x: x 坐标
     *     p.y: y 坐标
     *     p.tan: 在 t 处的切线方向（类型为 kity.Vector，模为 1）
     */
    g.pointAtPath = function(path, t) {
        if (!path.isCurve) {
            path = g.pathToCurve(path);
        }
        var subPath = g.subPath(path, t);
        var lastCurve = subPath[subPath.length - 1][0] == "Z" ? subPath[subPath.length - 2] : subPath[subPath.length - 1];
        // 跳过 'C' 命令，只留参数
        lastCurve = lastCurve.slice(1);
        var p = Point.parse(lastCurve.slice(4)), c = Point.parse(lastCurve.slice(2, 4));
        p.tan = Vector.fromPoints(c, p).normalize();
        return p;
    };
    /**
     * 求一段路径的长度
     *
     * @param  {string|Array} path
     *     要求的路径
     *
     * @return {Number}
     *     路径的长度
     */
    g.pathLength = cacher(function(path) {
        if (!path.isCurve) {
            path = g.pathToCurve(path);
        }
        // path 每一段在整体中的长度区间
        var segmentRanges = getBezierPathSegmentRanges(path);
        return segmentRanges.totalLength;
    });
    /**
     * 求一段路径的关键点
     *
     * @param  {string|Array} path
     *     要求的路径
     *
     * @return {Array}
     *     关键点的集合
     */
    g.pathKeyPoints = cacher(function(path) {
        var i, ii, command, keyPoints;
        if (!path.isCurve) {
            path = g.pathToCurve(path);
        }
        keyPoints = [];
        for (i = 0, ii = path.length; i < ii; i++) {
            if (path[i][0] == "z") continue;
            keyPoints.push(path[i].slice(path[i].length - 2));
        }
        return keyPoints;
    });
    // 对比两个路径的关键位置，在合适的位置切割合适的路径，使得两个路径的段数一致
    // TODO: 使用插值算法，使对应点更合理
    var alignCurve = cacher(function(path1, path2) {
        if (!path1.isCurve) path1 = g.pathToCurve(path1);
        if (!path2.isCurve) path2 = g.pathToCurve(path2);
        var p1 = pathClone(path1);
        var p2 = pathClone(path2);
        p1.i = 0;
        p2.i = 0;
        p1.o = p2;
        p2.o = p1;
        function command(p, i) {
            return p[i || p.i] && p[i || p.i][0];
        }
        function param(p, i) {
            return p[i || p.i] && p[i || p.i].slice(1);
        }
        function point(p, i) {
            var _param = param(p, i);
            return _param && _param.slice(-2);
        }
        function fixZ(p) {
            if (command(p) == "Z") {
                p.splice(p.i, 1);
                return true;
            }
            return false;
        }
        function fixM(p) {
            if (command(p) == "M") {
                p.o.splice(p.o.i, 0, [ "M" ].concat(point(p.o, p.o.i - 1)));
                p.i++;
                p.o.i++;
                return true;
            }
            return false;
        }
        function fill(p) {
            var lastPoint;
            var i = 1;
            while (!lastPoint) {
                lastPoint = point(p, p.length - i++);
            }
            p.o.i = p.i;
            while (p.length < p.o.length) {
                if (fixZ(p.o)) continue;
                if (fixM(p.o)) continue;
                p.push([ "C" ].concat(lastPoint).concat(lastPoint).concat(lastPoint));
                p.i++;
                p.o.i++;
            }
        }
        while (p1.i < p1.length && p2.i < p2.length) {
            if (fixZ(p1) || fixZ(p2)) continue;
            if (command(p1) == command(p2)) {
                p1.i++;
                p2.i++;
                continue;
            }
            if (fixM(p1) || fixM(p2)) continue;
            p1.i++;
            p2.i++;
        }
        if (p1.i == p1.length) fill(p1);
        if (p2.i == p2.length) fill(p2);
        delete p1.i;
        delete p1.o;
        delete p2.i;
        delete p2.o;
        return [ p1, p2 ];
    });
    g.alignCurve = alignCurve;
    /**
     * 获得两个路径的补间结果
     *
     * @param  {string|Array} path1
     *     补间起始路径
     *
     * @param  {string|Array} path2
     *     补间结束路径
     *
     * @param  {Number} t
     *     补间比例，0 返回跟 path1 等效的结果；1 返回跟 path2 等效的结果
     *
     * @return {PathSegment}
     *     补间的结果
     */
    g.pathTween = function(path1, path2, t) {
        if (t === 0) return path1;
        if (t === 1) return path2;
        var aligned = alignCurve(path1, path2);
        var result = [], seg, i, j;
        path1 = aligned[0];
        path2 = aligned[1];
        for (i = 0; i < path1.length; i++) {
            result.push(seg = []);
            seg.push(path1[i][0]);
            for (j = 1; j < path1[i].length; j++) {
                seg.push(path1[i][j] + t * (path2[i][j] - path1[i][j]));
            }
        }
        result.isUniform = result.isCurve = result.isAbsolute = true;
        return result;
    };
    /**
     * 变换指定的路径
     *
     * @param  {String|Array} path
     *     需要变换的路径
     *
     * @param  {kity.Matrix} matrix
     *     使用的变换矩阵
     *
     * @return {Array}
     *     变换后的路径
     */
    g.transformPath = cacher(function(path, matrix) {
        var i, ii, j, result, seg, pair;
        if (!path.isCurve) {
            path = g.pathToCurve(path);
        }
        result = [];
        for (i = 0, ii = path.length; i < ii; i++) {
            result.push(seg = [ path[i][0] ]);
            for (j = 1; j < path[i].length; j += 2) {
                pair = path[i].slice(j, j + 2);
                pair = matrix.transformPoint(Point.parse(pair));
                result.push(pair);
            }
        }
        return result;
    });
    // entend
    require("core/class").extendClass(Matrix, {
        transformPath: function(path) {
            return g.transformPath(path, this);
        }
    });
    return g;
});
define("graphic/gradientbrush", [ "graphic/svg", "graphic/defbrush", "core/class", "graphic/resource", "graphic/color", "core/utils", "graphic/standardcolor" ], function(require, exports, module) {
    var svg = require("graphic/svg");
    var DefBrush = require("graphic/defbrush");
    var Color = require("graphic/color");
    return require("core/class").createClass("GradientBrush", {
        base: DefBrush,
        constructor: function(gradientNodeType) {
            this.callBase(gradientNodeType);
            this.stops = [];
        },
        addStop: function(offset, color, opacity) {
            var gstop = svg.createNode("stop");
            if (!(color instanceof Color)) {
                color = Color.parse(color);
            }
            if (opacity === undefined) {
                opacity = color.get("a");
            }
            gstop.setAttribute("offset", offset);
            gstop.setAttribute("stop-color", color.toRGB());
            if (opacity < 1) {
                gstop.setAttribute("stop-opacity", opacity);
            }
            this.node.appendChild(gstop);
            return this;
        }
    });
});
define("graphic/group", [ "graphic/shapecontainer", "graphic/container", "core/utils", "core/class", "graphic/shape", "graphic/svg", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    var ShapeContainer = require("graphic/shapecontainer");
    return require("core/class").createClass("Group", {
        mixins: [ ShapeContainer ],
        base: require("graphic/shape"),
        constructor: function Group() {
            this.callBase("g");
        }
    });
});
define("graphic/hyperlink", [ "graphic/shapecontainer", "graphic/container", "core/utils", "core/class", "graphic/shape", "graphic/svg", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    var ShapeContainer = require("graphic/shapecontainer");
    return require("core/class").createClass("HyperLink", {
        mixins: [ ShapeContainer ],
        base: require("graphic/shape"),
        constructor: function(url) {
            this.callBase("a");
            this.setHref(url);
        },
        setHref: function(href) {
            this.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
            return this;
        },
        getHref: function() {
            return this.node.getAttributeNS("xlink:href");
        },
        setTarget: function(target) {
            this.node.setAttribute("target", target);
            return this;
        },
        getTarget: function() {
            return this.node.getAttribute("target");
        }
    });
});
define("graphic/image", [ "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    return require("core/class").createClass("Image", {
        base: require("graphic/shape"),
        constructor: function(url, width, height, x, y) {
            this.callBase("image");
            this.url = url;
            this.width = width || 0;
            this.height = height || 0;
            this.x = x || 0;
            this.y = y || 0;
            this.update();
        },
        update: function() {
            this.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.url);
            this.node.setAttribute("x", this.x);
            this.node.setAttribute("y", this.y);
            this.node.setAttribute("width", this.width);
            this.node.setAttribute("height", this.height);
            return this;
        },
        setUrl: function(url) {
            this.url = url === "" ? null : url;
            return this.update();
        },
        getUrl: function() {
            return this.url;
        },
        setWidth: function(width) {
            this.width = width;
            return this.update();
        },
        getWidth: function() {
            return this.width;
        },
        setHeight: function(height) {
            this.height = height;
            return this.update();
        },
        getHeight: function() {
            return this.height;
        },
        setX: function(x) {
            this.x = x;
            return this.update();
        },
        getX: function() {
            return this.x;
        },
        setY: function(y) {
            this.y = y;
            return this.update();
        },
        getY: function() {
            return this.y;
        }
    });
});
define("graphic/line", [ "core/class", "graphic/path", "core/utils", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    return require("core/class").createClass("Line", {
        base: require("graphic/path"),
        constructor: function(x1, y1, x2, y2) {
            this.callBase();
            this.point1 = {
                x: x1 || 0,
                y: y1 || 0
            };
            this.point2 = {
                x: x2 || 0,
                y: y2 || 0
            };
            this.update();
        },
        setPoint1: function(x, y) {
            this.point1.x = x;
            this.point1.y = y;
            return this.update();
        },
        setPoint2: function(x, y) {
            this.point2.x = x;
            this.point2.y = y;
            return this.update();
        },
        getPoint1: function() {
            return {
                x: this.point1.x,
                y: this.point1.y
            };
        },
        getPoint2: function() {
            return {
                x: this.point2.x,
                y: this.point2.y
            };
        },
        update: function() {
            var drawer = this.getDrawer();
            drawer.clear();
            drawer.moveTo(this.point1.x, this.point1.y);
            drawer.lineTo(this.point2.x, this.point2.y);
            return this;
        }
    });
});
define("graphic/lineargradientbrush", [ "graphic/svg", "graphic/gradientbrush", "graphic/defbrush", "graphic/color", "core/class" ], function(require, exports, module) {
    var className = "LinearGradientBrush";
    var svg = require("graphic/svg");
    var GradientBrush = require("graphic/gradientbrush");
    return require("core/class").createClass(className, {
        base: GradientBrush,
        constructor: function(builder) {
            this.callBase("linearGradient");
            this.setStartPosition(0, 0);
            this.setEndPosition(1, 0);
            if (typeof builder == "function") {
                builder.call(this, this);
            }
        },
        setStartPosition: function(px, py) {
            this.node.setAttribute("x1", px);
            this.node.setAttribute("y1", py);
            return this;
        },
        setEndPosition: function(px, py) {
            this.node.setAttribute("x2", px);
            this.node.setAttribute("y2", py);
            return this;
        },
        getStartPosition: function() {
            return {
                x: +this.node.getAttribute("x1"),
                y: +this.node.getAttribute("y1")
            };
        },
        getEndPosition: function() {
            return {
                x: +this.node.getAttribute("x2"),
                y: +this.node.getAttribute("y2")
            };
        }
    });
});
define("graphic/marker", [ "graphic/point", "core/class", "graphic/resource", "graphic/svg", "graphic/shapecontainer", "graphic/container", "core/utils", "graphic/shape", "graphic/viewbox", "graphic/path", "graphic/geometry" ], function(require, exports, module) {
    var Point = require("graphic/point");
    var Marker = require("core/class").createClass("Marker", {
        base: require("graphic/resource"),
        mixins: [ require("graphic/shapecontainer"), require("graphic/viewbox") ],
        constructor: function() {
            this.callBase("marker");
            this.setOrient("auto");
        },
        setRef: function(x, y) {
            if (arguments.length === 1) {
                y = x.y;
                x = x.x;
            }
            this.node.setAttribute("refX", x);
            this.node.setAttribute("refY", y);
            return this;
        },
        getRef: function() {
            return new Point(+this.node.getAttribute("refX"), +this.node.getAttribute("refY"));
        },
        setWidth: function(width) {
            this.node.setAttribute("markerWidth", this.width = width);
            return this;
        },
        setOrient: function(orient) {
            this.node.setAttribute("orient", this.orient = orient);
            return this;
        },
        getOrient: function() {
            return this.orient;
        },
        getWidth: function() {
            return +this.width;
        },
        setHeight: function(height) {
            this.node.setAttribute("markerHeight", this.height = height);
            return this;
        },
        getHeight: function() {
            return +this.height;
        }
    });
    var Path = require("graphic/path");
    require("core/class").extendClass(Path, {
        setMarker: function(marker, pos) {
            pos = pos || "end";
            if (!marker) {
                this.node.removeAttribute("marker-" + pos);
            } else {
                this.node.setAttribute("marker-" + pos, marker.toString());
            }
            return this;
        }
    });
    return Marker;
});
/**
 * 蒙板
 */
define("graphic/mask", [ "core/class", "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box", "graphic/shapecontainer", "graphic/container" ], function(require, exports, module) {
    var Class = require("core/class");
    var Shape = require("graphic/shape");
    var Mask = Class.createClass("Mask", {
        base: Shape,
        mixins: [ require("graphic/shapecontainer") ],
        constructor: function() {
            this.callBase("mask");
        },
        mask: function(shape) {
            shape.getNode().setAttribute("mask", "url(#" + this.getId() + ")");
            return this;
        }
    });
    Class.extendClass(Shape, {
        maskWith: function(mask) {
            mask.mask(this);
            return this;
        }
    });
    return Mask;
});
define("graphic/matrix", [ "core/utils", "graphic/box", "core/class", "graphic/point" ], function(require, exports, module) {
    var utils = require("core/utils");
    var Box = require("graphic/box");
    var mPattern = /matrix\((.+)\)/i;
    var Point = require("graphic/point");
    // 注意，合并的结果是先执行m2，再执行m1的结果
    function mergeMatrixData(m2, m1) {
        return {
            a: m1.a * m2.a + m1.c * m2.b,
            b: m1.b * m2.a + m1.d * m2.b,
            c: m1.a * m2.c + m1.c * m2.d,
            d: m1.b * m2.c + m1.d * m2.d,
            e: m1.a * m2.e + m1.c * m2.f + m1.e,
            f: m1.b * m2.e + m1.d * m2.f + m1.f
        };
    }
    function d2r(deg) {
        return deg * Math.PI / 180;
    }
    var Matrix = require("core/class").createClass("Matrix", {
        constructor: function() {
            if (arguments.length) {
                this.setMatrix.apply(this, arguments);
            } else {
                this.setMatrix(1, 0, 0, 1, 0, 0);
            }
        },
        translate: function(x, y) {
            this.m = mergeMatrixData(this.m, {
                a: 1,
                c: 0,
                e: x,
                b: 0,
                d: 1,
                f: y
            });
            return this;
        },
        rotate: function(deg) {
            var rad = d2r(deg);
            var sin = Math.sin(rad), cos = Math.cos(rad);
            this.m = mergeMatrixData(this.m, {
                a: cos,
                c: -sin,
                e: 0,
                b: sin,
                d: cos,
                f: 0
            });
            return this;
        },
        scale: function(sx, sy) {
            if (sy === undefined) {
                sy = sx;
            }
            this.m = mergeMatrixData(this.m, {
                a: sx,
                c: 0,
                e: 0,
                b: 0,
                d: sy,
                f: 0
            });
            return this;
        },
        skew: function(degX, degY) {
            if (degY === undefined) {
                degY = degX;
            }
            var tx = Math.tan(d2r(degX)), ty = Math.tan(d2r(degY));
            this.m = mergeMatrixData(this.m, {
                a: 1,
                c: tx,
                e: 0,
                b: ty,
                d: 1,
                f: 0
            });
            return this;
        },
        /**
         * 获得反转矩阵
         *
         * 这是我解方程算出来的
         */
        inverse: function() {
            var m = this.m, a = m.a, b = m.b, c = m.c, d = m.d, e = m.e, f = m.f, k, aa, bb, cc, dd, ee, ff;
            k = a * d - b * c;
            aa = d / k;
            bb = -b / k;
            cc = -c / k;
            dd = a / k;
            ee = (c * f - e * d) / k;
            ff = (b * e - a * f) / k;
            return new Matrix(aa, bb, cc, dd, ee, ff);
        },
        setMatrix: function(a, b, c, d, e, f) {
            if (arguments.length === 1) {
                this.m = utils.clone(arguments[0]);
            } else {
                this.m = {
                    a: a,
                    b: b,
                    c: c,
                    d: d,
                    e: e,
                    f: f
                };
            }
            return this;
        },
        getMatrix: function() {
            return utils.clone(this.m);
        },
        getTranslate: function() {
            var m = this.m;
            return {
                x: m.e / m.a,
                y: m.f / m.d
            };
        },
        mergeMatrix: function(matrix) {
            return new Matrix(mergeMatrixData(this.m, matrix.m));
        },
        merge: function(matrix) {
            return this.mergeMatrix(matrix);
        },
        toString: function() {
            return this.valueOf().join(" ");
        },
        valueOf: function() {
            var m = this.m;
            return [ m.a, m.b, m.c, m.d, m.e, m.f ];
        },
        equals: function(matrix) {
            var m1 = this.m, m2 = matrix.m;
            return m1.a == m2.a && m1.b == m2.b && m1.c == m2.c && m1.d == m2.d && m1.e == m2.e && m1.f == m2.f;
        },
        transformPoint: function() {
            return Matrix.transformPoint.apply(null, [].slice.call(arguments).concat([ this.m ]));
        },
        transformBox: function(box) {
            return Matrix.transformBox(box, this.m);
        }
    });
    Matrix.parse = function(str) {
        var match;
        var f = parseFloat;
        if (str instanceof Array) {
            return new Matrix({
                a: str[0],
                b: str[1],
                c: str[2],
                d: str[3],
                e: str[4],
                f: str[5]
            });
        }
        if (match = mPattern.exec(str)) {
            var values = match[1].split(",");
            if (values.length != 6) {
                values = match[1].split(" ");
            }
            return new Matrix({
                a: f(values[0]),
                b: f(values[1]),
                c: f(values[2]),
                d: f(values[3]),
                e: f(values[4]),
                f: f(values[5])
            });
        }
        return new Matrix();
    };
    Matrix.transformPoint = function(x, y, m) {
        if (arguments.length === 2) {
            m = y;
            y = x.y;
            x = x.x;
        }
        return new Point(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f);
    };
    Matrix.transformBox = function(box, matrix) {
        var xMin = Number.MAX_VALUE, xMax = -Number.MAX_VALUE, yMin = Number.MAX_VALUE, yMax = -Number.MAX_VALUE;
        var bps = [ [ box.x, box.y ], [ box.x + box.width, box.y ], [ box.x, box.y + box.height ], [ box.x + box.width, box.y + box.height ] ];
        var bp, rp, rps = [];
        while (bp = bps.pop()) {
            rp = Matrix.transformPoint(bp[0], bp[1], matrix);
            rps.push(rp);
            xMin = Math.min(xMin, rp.x);
            xMax = Math.max(xMax, rp.x);
            yMin = Math.min(yMin, rp.y);
            yMax = Math.max(yMax, rp.y);
        }
        box = new Box({
            x: xMin,
            y: yMin,
            width: xMax - xMin,
            height: yMax - yMin
        });
        utils.extend(box, {
            closurePoints: rps
        });
        return box;
    };
    // 获得从 node 到 refer 的变换矩阵
    Matrix.getCTM = function(target, refer) {
        var ctm = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: 0,
            f: 0
        };
        var node = target.shapeNode || target.node;
        refer = refer || "parent";
        // 根据参照坐标系选区的不一样，返回不同的结果
        switch (refer) {
          case "screen":
            // 以浏览器屏幕为参照坐标系
            ctm = node.getScreenCTM();
            break;

          case "doc":
          case "paper":
            // 以文档（Paper）为参照坐标系
            ctm = node.getCTM();
            break;

          case "view":
          case "top":
            // 以顶层绘图容器（视野）为参照坐标系
            if (target.getPaper()) {
                ctm = node.getTransformToElement(target.getPaper().shapeNode);
            }
            break;

          case "parent":
            // 以父容器为参照坐标系
            if (target.node.parentNode) {
                ctm = node.getTransformToElement(target.node.parentNode);
            }
            break;

          default:
            // 其他情况，指定参照物
            if (refer.node) {
                ctm = node.getTransformToElement(refer.shapeNode || refer.node);
            }
        }
        return ctm ? new Matrix(ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f) : new Matrix();
    };
    return Matrix;
});
/**
 * 调色板
 */
define("graphic/palette", [ "graphic/standardcolor", "graphic/color", "core/utils", "core/class" ], function(require, exports, module) {
    //标准color
    var StandardColor = require("graphic/standardcolor"), Color = require("graphic/color"), Utils = require("core/utils");
    var Palette = require("core/class").createClass("Palette", {
        constructor: function() {
            this.color = {};
        },
        /*
         * 获取颜色名称所对应的颜色值的Color对象
         * @param name 需要获取的颜色名称
         * @return 对应颜色名称的color对象， 如果未找到对应的名称， 则返回null
         */
        get: function(name) {
            var colorValue = this.color[name] || StandardColor.EXTEND_STANDARD[name] || StandardColor.COLOR_STANDARD[name] || "";
            if (colorValue) {
                return new Color(colorValue);
            }
            return null;
        },
        /*
         * 获取给定名称的颜色的hex值表示
         * @param name 需要获取的颜色名称
         * @return 如果找到对应的名称， 则返回该名称所对应的hex格式的值， 否则， 返回一个空字符串
         */
        getColorValue: function(name) {
            return this.color[name] || StandardColor.EXTEND_STANDARD[name] || StandardColor.COLOR_STANDARD[name] || "";
        },
        /*
         * 向调色板实例添加自己独有的颜色名称，对已存在的颜色名称， 将会覆盖掉
         * @param name 新添加的颜色名称
         * @param value 新添加的颜色名称所对应的值， 可以是一个合法的颜色字符串或者是一个color对象
         * @return 新添加的颜色的值
         */
        add: function(name, value) {
            if (typeof value === "string") {
                this.color[name] = new Color(value).toRGBA();
            } else {
                this.color[name] = value.toRGBA();
            }
            return value;
        },
        /*
         * 删除调色板实例上用户自己添加的颜色， 该方法不能删除内置的颜色
         * @param name 需要删除的颜色名称
         * @return 删除是否成功的bool值
         */
        remove: function(name) {
            if (this.color.hasOwnProperty(name)) {
                delete this.color[name];
                return true;
            }
            return false;
        }
    });
    Utils.extend(Palette, {
        getColor: function(name) {
            var colorValue = StandardColor.EXTEND_STANDARD[name] || StandardColor.COLOR_STANDARD[name];
            if (colorValue) {
                return new Color(colorValue);
            }
            return null;
        },
        /*
         * 通过给定的名字获取标准的颜色值表示， 返回的值以hex的方式提供
         * @param name 需要获取的标准颜色名称
         * @return 名字所对应的颜色值的hex表示， 如果未找到对应名称的值， 则返回一个空字符串
         */
        getColorValue: function(name) {
            return StandardColor.EXTEND_STANDARD[name] || StandardColor.COLOR_STANDARD[name] || "";
        },
        /*
         * 向调色板添加颜色名称，新添加的颜色对所有的调色板对象都可见
         * 对已存在的颜色名称， 将会覆盖掉
         * @param name 新添加的颜色名称
         * @param value 新添加的颜色名称所对于的值， 应该是一个hex格式的颜色字符串， 如： ”#ff0000“
         * @return 新添加的颜色的值
         */
        addColor: function(name, value) {
            if (typeof value === "string") {
                StandardColor.EXTEND_STANDARD[name] = new Color(value).toRGBA();
            } else {
                StandardColor.EXTEND_STANDARD[name] = value.toRGBA();
            }
            return value;
        },
        /*
         * 删除用户自己添加的颜色， 该方法不能删除内置的颜色， 该方法不会影响调色板实例自由的颜色
         * @param name 需要删除的颜色名称
         * @return 删除是否成功的bool值
         */
        removeColor: function(name) {
            if (StandardColor.EXTEND_STANDARD.hasOwnProperty(name)) {
                delete StandardColor.EXTEND_STANDARD[name];
                return true;
            }
            return false;
        }
    });
    return Palette;
});
define("graphic/paper", [ "core/class", "core/utils", "graphic/svg", "graphic/container", "graphic/shapecontainer", "graphic/shape", "graphic/viewbox", "graphic/eventhandler", "graphic/shapeevent", "graphic/styled", "graphic/matrix", "graphic/box", "graphic/point", "graphic/data", "graphic/pen" ], function(require, exports, module) {
    var Class = require("core/class");
    var utils = require("core/utils");
    var svg = require("graphic/svg");
    var Container = require("graphic/container");
    var ShapeContainer = require("graphic/shapecontainer");
    var ViewBox = require("graphic/viewbox");
    var EventHandler = require("graphic/eventhandler");
    var Styled = require("graphic/styled");
    var Matrix = require("graphic/matrix");
    var Paper = Class.createClass("Paper", {
        mixins: [ ShapeContainer, EventHandler, Styled, ViewBox ],
        constructor: function(container) {
            this.callBase();
            this.node = this.createSVGNode();
            this.node.paper = this;
            this.node.appendChild(this.resourceNode = svg.createNode("defs"));
            this.node.appendChild(this.shapeNode = svg.createNode("g"));
            this.resources = new Container();
            this.setWidth("100%").setHeight("100%");
            if (container) {
                this.renderTo(container);
            }
            this.callMixin();
        },
        renderTo: function(container) {
            if (utils.isString(container)) {
                container = document.getElementById(container);
            }
            this.container = container;
            container.appendChild(this.node);
        },
        createSVGNode: function() {
            var node = svg.createNode("svg");
            node.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            node.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            return node;
        },
        getNode: function() {
            return this.node;
        },
        getContainer: function() {
            return this.container;
        },
        getWidth: function() {
            return this.node.clientWidth;
        },
        setWidth: function(width) {
            this.node.setAttribute("width", width);
            return this;
        },
        getHeight: function() {
            return this.node.clientHeight;
        },
        setHeight: function(height) {
            this.node.setAttribute("height", height);
            return this;
        },
        setViewPort: function(cx, cy, zoom) {
            var viewport, box;
            if (arguments.length == 1) {
                viewport = arguments[0];
                cx = viewport.center.x;
                cy = viewport.center.y;
                zoom = viewport.zoom;
            }
            zoom = zoom || 1;
            box = this.getViewBox();
            var matrix = new Matrix();
            var dx = box.x + box.width / 2 - cx, dy = box.y + box.height / 2 - cy;
            matrix.translate(-cx, -cy);
            matrix.scale(zoom);
            matrix.translate(cx, cy);
            matrix.translate(dx, dy);
            this.shapeNode.setAttribute("transform", "matrix(" + matrix + ")");
            this.viewport = {
                center: {
                    x: cx,
                    y: cy
                },
                offset: {
                    x: dx,
                    y: dy
                },
                zoom: zoom
            };
            return this;
        },
        getViewPort: function() {
            if (!this.viewport) {
                var box = this.getViewBox();
                return {
                    zoom: 1,
                    center: {
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2
                    },
                    offset: {
                        x: 0,
                        y: 0
                    }
                };
            }
            return this.viewport;
        },
        getViewPortTransform: function() {
            var m = this.shapeNode.getCTM();
            return new Matrix(m.a, m.b, m.c, m.d, m.e, m.f);
        },
        getTransform: function() {
            return this.getViewPortTransform().reverse();
        },
        addResource: function(resource) {
            this.resources.appendItem(resource);
            if (resource.node) {
                this.resourceNode.appendChild(resource.node);
            }
            return this;
        },
        removeResource: function(resource) {
            if (resource.remove) {
                resource.remove();
            }
            if (resource.node) {
                this.resourceNode.removeChild(resource.node);
            }
            return this;
        },
        getPaper: function() {
            return this;
        }
    });
    var Shape = require("graphic/shape");
    Class.extendClass(Shape, {
        getPaper: function() {
            var parent = this.container;
            while (parent && parent instanceof Paper === false) {
                parent = parent.container;
            }
            return parent;
        },
        isAttached: function() {
            return !!this.getPaper();
        },
        whenPaperReady: function(fn) {
            var me = this;
            function check() {
                var paper = me.getPaper();
                if (paper && fn) {
                    fn.call(me, paper);
                }
                return paper;
            }
            if (!check()) {
                this.on("add treeadd", function listen() {
                    if (check()) {
                        me.off("add", listen);
                        me.off("treeadd", listen);
                    }
                });
            }
            return this;
        }
    });
    return Paper;
});
define("graphic/path", [ "core/utils", "core/class", "graphic/shape", "graphic/svg", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box", "graphic/geometry", "graphic/point", "graphic/vector" ], function(require, exports, module) {
    var Utils = require("core/utils");
    var createClass = require("core/class").createClass;
    var Shape = require("graphic/shape");
    var svg = require("graphic/svg");
    var g = require("graphic/geometry");
    var slice = Array.prototype.slice, flatten = Utils.flatten;
    var PathDrawer = createClass("PathDrawer", {
        constructor: function(path) {
            this.segment = [];
            this.path = path;
            this.__clear = false;
        },
        getPath: function() {
            return this.path;
        },
        redraw: function() {
            this._transation = this._transation || [];
            return this.clear();
        },
        done: function() {
            var transation = this._transation;
            this._transation = null;
            this.push(transation);
            return this;
        },
        clear: function() {
            if (this._transation) {
                this._transation = [];
            } else {
                this.path.setPathData("M 0 0");
            }
            this._clear = true;
            return this;
        },
        push: function() {
            var segment = slice.call(arguments);
            var originData;
            if (this._transation) {
                this._transation.push(segment);
                return this;
            }
            if (this._clear) {
                originData = "";
                this._clear = false;
            } else {
                originData = this.path.getPathData();
            }
            originData = originData || "";
            this.path.setPathData(originData + g.pathToString(segment));
            return this;
        },
        moveTo: function(x, y) {
            return this.push("M", slice.call(arguments));
        },
        moveBy: function(dx, dy) {
            return this.push("m", slice.call(arguments));
        },
        lineTo: function(x, y) {
            return this.push("L", slice.call(arguments));
        },
        lineBy: function(dx, dy) {
            return this.push("l", slice.call(arguments));
        },
        arcTo: function(rx, ry, xr, laf, sf, x, y) {
            return this.push("A", slice.call(arguments));
        },
        arcBy: function(rx, ry, xr, laf, sf, dx, dy) {
            return this.push("a", arguments);
        },
        carcTo: function(r, laf, sf, x, y) {
            return this.push("A", [ r, r, 0 ].concat(slice.call(arguments, 1)));
        },
        carcBy: function(r, laf, sf, dx, dy) {
            return this.push("a", [ r, r, 0 ].concat(slice.call(arguments, 1)));
        },
        bezierTo: function(x1, y1, x2, y2, x, y) {
            return this.push("C", slice.call(arguments));
        },
        bezierBy: function(dx1, dy1, dx2, dy2, dx, dy) {
            return this.push("c", slice.call(arguments));
        },
        close: function() {
            return this.push("z");
        }
    });
    return createClass("Path", {
        base: Shape,
        constructor: function(data) {
            this.callBase("path");
            if (data) {
                this.setPathData(data);
            }
            this.node.setAttribute("fill", svg.defaults.fill);
            this.node.setAttribute("stroke", svg.defaults.stroke);
        },
        setPathData: function(data) {
            data = data || "M0,0";
            this.pathdata = g.pathToString(data);
            this.node.setAttribute("d", this.pathdata);
            this.trigger("shapeupdate", {
                type: "pathdata"
            });
            return this;
        },
        getPathData: function() {
            return this.pathdata || "";
        },
        getDrawer: function() {
            return new PathDrawer(this);
        },
        isClosed: function() {
            var data = this.getPathData();
            return !!~data.indexOf("z") || !!~data.indexOf("Z");
        }
    });
});
define("graphic/patternbrush", [ "graphic/defbrush", "core/class", "graphic/resource", "graphic/shapecontainer", "graphic/container", "core/utils", "graphic/shape", "graphic/svg" ], function(require, exports, module) {
    var DefBrush = require("graphic/defbrush");
    var ShapeContainer = require("graphic/shapecontainer");
    var svg = require("graphic/svg");
    return require("core/class").createClass("PatternBrush", {
        base: DefBrush,
        mixins: [ ShapeContainer ],
        constructor: function() {
            this.callBase("pattern");
            this.node.setAttribute("patternUnits", "userSpaceOnUse");
        },
        setX: function(x) {
            this.x = x;
            this.node.setAttribute("x", x);
            return this;
        },
        setY: function(y) {
            this.y = y;
            this.node.setAttribute("y", y);
            return this;
        },
        setWidth: function(width) {
            this.width = width;
            this.node.setAttribute("width", width);
            return this;
        },
        setHeight: function(height) {
            this.height = height;
            this.node.setAttribute("height", height);
            return this;
        },
        getWidth: function() {
            return this.width;
        },
        getHeight: function() {
            return this.height;
        }
    });
});
define("graphic/pen", [ "graphic/color", "core/utils", "graphic/standardcolor", "core/class" ], function(require, exports, module) {
    var Color = require("graphic/color");
    return require("core/class").createClass("Pen", {
        constructor: function(brush, width) {
            this.brush = brush;
            this.width = width || 1;
            this.linecap = null;
            this.linejoin = null;
            this.dashArray = null;
            this.opacity = 1;
        },
        getBrush: function() {
            return this.brush;
        },
        setBrush: function(brush) {
            this.brush = brush;
            return this;
        },
        setColor: function(color) {
            return this.setBrush(color);
        },
        getColor: function() {
            return this.brush instanceof Color ? this.brush : null;
        },
        getWidth: function() {
            return this.width;
        },
        setWidth: function(width) {
            this.width = width;
            return this;
        },
        getOpacity: function() {
            return this.opacity;
        },
        setOpacity: function(opacity) {
            this.opacity = opacity;
        },
        getLineCap: function() {
            return this.linecap;
        },
        setLineCap: function(linecap) {
            this.linecap = linecap;
            return this;
        },
        getLineJoin: function() {
            return this.linejoin;
        },
        setLineJoin: function(linejoin) {
            this.linejoin = linejoin;
            return this;
        },
        getDashArray: function() {
            return this.dashArray;
        },
        setDashArray: function(dashArray) {
            this.dashArray = dashArray;
            return this;
        },
        stroke: function(shape) {
            var node = shape.node;
            node.setAttribute("stroke", this.brush.toString());
            node.setAttribute("stroke-width", this.getWidth());
            if (this.getOpacity() < 1) {
                node.setAttribute("stroke-opacity", this.getOpacity());
            }
            if (this.getLineCap()) {
                node.setAttribute("stroke-linecap", this.getLineCap());
            }
            if (this.getLineJoin()) {
                node.setAttribute("stroke-linejoin", this.getLineJoin());
            }
            if (this.getDashArray()) {
                node.setAttribute("stroke-dasharray", this.getDashArray());
            }
        }
    });
});
define("graphic/pie", [ "core/class", "graphic/sweep", "graphic/point", "graphic/path" ], function(require, exports, module) {
    return require("core/class").createClass({
        base: require("graphic/sweep"),
        constructor: function(radius, angle, angleOffset) {
            this.callBase([ 0, radius ], angle, angleOffset);
        },
        getRadius: function() {
            return this.getSectionArray()[1];
        },
        setRadius: function(radius) {
            this.setSectionArray([ 0, radius ]);
        }
    });
});
/*
 * 点对象抽象
 */
define("graphic/point", [ "core/class" ], function(require, exports, module) {
    var Point = require("core/class").createClass("Point", {
        constructor: function(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        },
        offset: function(dx, dy) {
            if (arguments.length == 1) {
                dy = dx.y;
                dx = dx.x;
            }
            return new Point(this.x + dx, this.y + dy);
        },
        valueOf: function() {
            return [ this.x, this.y ];
        },
        toString: function() {
            return this.valueOf().join(" ");
        },
        spof: function() {
            return new Point((this.x | 0) + .5, (this.y | 0) + .5);
        }
    });
    Point.fromPolar = function(radius, angle, unit) {
        if (unit != "rad") {
            // deg to rad
            angle = angle / 180 * Math.PI;
        }
        return new Point(radius * Math.cos(angle), radius * Math.sin(angle));
    };
    Point.parse = function(unknown) {
        if (unknown instanceof Point) {
            return unknown;
        }
        if (typeof unknown == "string") {
            return Point.parse(unknown.split(/\s*[\s,]\s*/));
        }
        if ("0" in unknown && "1" in unknown) {
            return new Point(unknown[0], unknown[1]);
        }
    };
    return Point;
});
/**
 * 点集合容器
 */
define("graphic/pointcontainer", [ "core/class", "graphic/container" ], function(require, exports, module) {
    return require("core/class").createClass("PointContainer", {
        base: require("graphic/container"),
        constructor: function() {
            this.callBase();
        },
        addPoint: function(point, pos) {
            return this.addItem.apply(this, arguments);
        },
        prependPoint: function() {
            return this.prependItem.apply(this, arguments);
        },
        appendPoint: function() {
            return this.appendItem.apply(this, arguments);
        },
        removePoint: function(pos) {
            return this.removeItem.apply(this, arguments);
        },
        addPoints: function() {
            return this.addItems.apply(this, arguments);
        },
        setPoints: function() {
            return this.setItems.apply(this, arguments);
        },
        getPoint: function() {
            return this.getItem.apply(this, arguments);
        },
        getPoints: function() {
            return this.getItems.apply(this, arguments);
        },
        getFirstPoint: function() {
            return this.getFirstItem.apply(this, arguments);
        },
        getLastPoint: function() {
            return this.getLastItem.apply(this, arguments);
        }
    });
});
/*
 * 通过点来决定图形的公共父类
 */
define("graphic/poly", [ "core/utils", "core/class", "graphic/path", "graphic/shape", "graphic/svg", "graphic/geometry", "graphic/pointcontainer", "graphic/container" ], function(require, exports, module) {
    var Utils = require("core/utils");
    return require("core/class").createClass("Poly", {
        base: require("graphic/path"),
        mixins: [ require("graphic/pointcontainer") ],
        constructor: function(points, closeable) {
            this.callBase();
            //是否可闭合
            this.closeable = !!closeable;
            this.setPoints(points || []);
            this.changeable = true;
            this.update();
        },
        //当点集合发生变化时采取的动作
        onContainerChanged: function() {
            if (this.changeable) {
                this.update();
            }
        },
        update: function() {
            var drawer = this.getDrawer(), points = this.getPoints();
            drawer.clear();
            if (!points.length) {
                return this;
            }
            drawer.moveTo(points[0]);
            for (var i = 1, point, len = points.length; i < len; i++) {
                point = points[i];
                drawer.lineTo(point);
            }
            if (this.closeable && points.length > 2) {
                drawer.close();
            }
            return this;
        }
    });
});
define("graphic/polygon", [ "core/class", "graphic/poly", "core/utils", "graphic/path", "graphic/pointcontainer" ], function(require, exports, module) {
    return require("core/class").createClass("Polygon", {
        base: require("graphic/poly"),
        constructor: function(points) {
            this.callBase(points, true);
        }
    });
});
define("graphic/polyline", [ "core/class", "graphic/poly", "core/utils", "graphic/path", "graphic/pointcontainer" ], function(require, exports, module) {
    return require("core/class").createClass("Polyline", {
        base: require("graphic/poly"),
        constructor: function(points) {
            this.callBase(points);
        }
    });
});
define("graphic/radialgradientbrush", [ "graphic/gradientbrush", "graphic/svg", "graphic/defbrush", "graphic/color", "core/class" ], function(require, exports, module) {
    var GradientBrush = require("graphic/gradientbrush");
    return require("core/class").createClass("RadialGradientBrush", {
        base: GradientBrush,
        constructor: function(builder) {
            this.callBase("radialGradient");
            this.setCenter(.5, .5);
            this.setFocal(.5, .5);
            this.setRadius(.5);
            if (typeof builder == "function") {
                builder.call(this, this);
            }
        },
        setCenter: function(cx, cy) {
            this.node.setAttribute("cx", cx);
            this.node.setAttribute("cy", cy);
            return this;
        },
        getCenter: function() {
            return {
                x: +this.node.getAttribute("cx"),
                y: +this.node.getAttribute("cy")
            };
        },
        setFocal: function(fx, fy) {
            this.node.setAttribute("fx", fx);
            this.node.setAttribute("fy", fy);
            return this;
        },
        getFocal: function() {
            return {
                x: +this.node.getAttribute("fx"),
                y: +this.node.getAttribute("fy")
            };
        },
        setRadius: function(r) {
            this.node.setAttribute("r", r);
            return this;
        },
        getRadius: function() {
            return +this.node.getAttribute("r");
        }
    });
});
define("graphic/rect", [ "core/utils", "graphic/point", "core/class", "graphic/box", "graphic/path", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    var RectUtils = {}, Utils = require("core/utils"), Point = require("graphic/point"), Box = require("graphic/box");
    Utils.extend(RectUtils, {
        //根据传递进来的width、height和radius属性，
        //获取最适合的radius值
        formatRadius: function(width, height, radius) {
            var minValue = Math.floor(Math.min(width / 2, height / 2));
            return Math.min(minValue, radius);
        }
    });
    var Rect = require("core/class").createClass("Rect", {
        base: require("graphic/path"),
        constructor: function(width, height, x, y, radius) {
            this.callBase();
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
            this.radius = RectUtils.formatRadius(this.width, this.height, radius || 0);
            this.update();
        },
        update: function() {
            var x = this.x, y = this.y, w = this.width, h = this.height, r = this.radius;
            var drawer = this.getDrawer().redraw();
            if (!r) {
                // 直角
                drawer.push("M", x, y);
                drawer.push("h", w);
                drawer.push("v", h);
                drawer.push("h", -w);
                drawer.push("z");
            } else {
                //圆角
                w -= 2 * r;
                h -= 2 * r;
                drawer.push("M", x + r, y);
                drawer.push("h", w);
                drawer.push("a", r, r, 0, 0, 1, r, r);
                drawer.push("v", h);
                drawer.push("a", r, r, 0, 0, 1, -r, r);
                drawer.push("h", -w);
                drawer.push("a", r, r, 0, 0, 1, -r, -r);
                drawer.push("v", -h);
                drawer.push("a", r, r, 0, 0, 1, r, -r);
                drawer.push("z");
            }
            drawer.done();
            return this;
        },
        setWidth: function(width) {
            this.width = width;
            return this.update();
        },
        setHeight: function(height) {
            this.height = height;
            return this.update();
        },
        setSize: function(width, height) {
            this.width = width;
            this.height = height;
            return this.update();
        },
        setBox: function(box) {
            this.x = box.x;
            this.y = box.y;
            this.width = box.width;
            this.height = box.height;
            return this.update();
        },
        getBox: function() {
            return new Box(this.x, this.y, this.width, this.height);
        },
        getRadius: function() {
            return this.radius;
        },
        setRadius: function(radius) {
            this.radius = radius;
            return this.update();
        },
        getPosition: function() {
            return new Point(this.x, this.y);
        },
        setPosition: function(x, y) {
            if (arguments.length == 1) {
                var p = Point.parse(arguments[0]);
                y = p.y;
                x = p.x;
            }
            this.x = x;
            this.y = y;
            return this.update();
        },
        getWidth: function() {
            return this.width;
        },
        getHeight: function() {
            return this.height;
        },
        getPositionX: function() {
            return this.x;
        },
        getPositionY: function() {
            return this.y;
        },
        setPositionX: function(x) {
            this.x = x;
            return this.update();
        },
        setPositionY: function(y) {
            this.y = y;
            return this.update();
        }
    });
    return Rect;
});
define("graphic/regularpolygon", [ "graphic/point", "core/class", "graphic/path", "core/utils", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    var Point = require("graphic/point");
    return require("core/class").createClass("RegularPolygon", {
        base: require("graphic/path"),
        constructor: function(side, radius, x, y) {
            this.callBase();
            this.radius = radius || 0;
            this.side = Math.max(side || 3, 3);
            if (arguments.length > 2) {
                if (arguments.length == 3) {
                    y = x.y;
                    x = x.x;
                }
            }
            this.center = new Point(x, y);
            this.draw();
        },
        getSide: function() {
            return this.side;
        },
        setSide: function(side) {
            this.side = side;
            return this.draw();
        },
        getRadius: function() {
            return this.radius;
        },
        setRadius: function(radius) {
            this.radius = radius;
            return this.draw();
        },
        draw: function() {
            var radius = this.radius, side = this.side, step = Math.PI * 2 / side, drawer = this.getDrawer(), i;
            drawer.clear();
            drawer.moveTo(Point.fromPolar(radius, Math.PI / 2, "rad").offset(this.center));
            for (i = 0; i <= side; i++) {
                drawer.lineTo(Point.fromPolar(radius, step * i + Math.PI / 2, "rad").offset(this.center));
            }
            drawer.close();
            return this;
        }
    });
});
define("graphic/resource", [ "graphic/svg", "core/class" ], function(require, exports, module) {
    var svg = require("graphic/svg");
    return require("core/class").createClass("Resource", {
        constructor: function(nodeType) {
            this.callBase();
            this.node = svg.createNode(nodeType);
        },
        toString: function() {
            return "url(#" + this.node.id + ")";
        }
    });
});
define("graphic/ring", [ "core/class", "graphic/sweep", "graphic/point", "graphic/path" ], function(require, exports, module) {
    return require("core/class").createClass({
        base: require("graphic/sweep"),
        constructor: function(innerRadius, outerRadius) {
            this.callBase([ innerRadius, outerRadius ], 360, 0);
        },
        getInnerRadius: function() {
            return this.getSectionArray()[0];
        },
        getOuterRadius: function() {
            return this.getSectionArray()[1];
        },
        setInnerRadius: function(value) {
            this.setSectionArray([ value, this.getOuterRadius() ]);
        },
        setOuterRadius: function(value) {
            this.setSectionArray([ this.getInnerRadius(), value ]);
        }
    });
});
define("graphic/shape", [ "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/shapeevent", "core/class", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/box", "graphic/point", "graphic/pen", "graphic/color" ], function(require, exports, module) {
    var svg = require("graphic/svg");
    var utils = require("core/utils");
    var EventHandler = require("graphic/eventhandler");
    var Styled = require("graphic/styled");
    var Data = require("graphic/data");
    var Matrix = require("graphic/matrix");
    var Pen = require("graphic/pen");
    var slice = Array.prototype.slice;
    var Box = require("graphic/box");
    var Shape = require("core/class").createClass("Shape", {
        mixins: [ EventHandler, Styled, Data ],
        constructor: function Shape(tagName) {
            this.node = svg.createNode(tagName);
            this.node.shape = this;
            this.transform = {
                translate: null,
                rotate: null,
                scale: null,
                matrix: null
            };
            this.callMixin();
        },
        getId: function() {
            return this.node.id;
        },
        setId: function(id) {
            this.node.id = id;
            return this;
        },
        getNode: function() {
            return this.node;
        },
        getBoundaryBox: function() {
            var box;
            try {
                box = this.node.getBBox();
            } catch (e) {
                box = {
                    x: this.node.clientLeft,
                    y: this.node.clientTop,
                    width: this.node.clientWidth,
                    height: this.node.clientHeight
                };
            }
            return new Box(box);
        },
        getRenderBox: function(refer) {
            var box = this.getBoundaryBox();
            var matrix = this.getTransform(refer);
            return matrix.transformBox(box);
        },
        getWidth: function() {
            return this.getRenderBox().width;
        },
        getHeight: function() {
            return this.getRenderBox().height;
        },
        getSize: function() {
            var box = this.getRenderBox();
            delete box.x;
            delete box.y;
            return box;
        },
        setOpacity: function(value) {
            this.node.setAttribute("opacity", value);
            return this;
        },
        getOpacity: function() {
            var opacity = this.node.getAttribute("opacity");
            return opacity ? +opacity : 1;
        },
        setVisible: function(value) {
            if (value) {
                this.node.removeAttribute("display");
            } else {
                this.node.setAttribute("display", "none");
            }
            return this;
        },
        getVisible: function() {
            this.node.getAttribute("display");
        },
        hasAncestor: function(node) {
            var parent = this.container;
            while (parent) {
                if (parent === node) {
                    return true;
                }
                parent = parent.container;
            }
            return false;
        },
        getTransform: function(refer) {
            return Matrix.getCTM(this, refer);
        },
        clearTransform: function() {
            this.node.removeAttribute("transform");
            this.transform = {
                translate: null,
                rotate: null,
                scale: null,
                matrix: null
            };
            this.trigger("shapeupdate", {
                type: "transform"
            });
            return this;
        },
        _applyTransform: function() {
            var t = this.transform, result = [];
            if (t.translate) {
                result.push([ "translate(", t.translate, ")" ]);
            }
            if (t.rotate) {
                result.push([ "rotate(", t.rotate, ")" ]);
            }
            if (t.scale) {
                result.push([ "scale(", t.scale, ")" ]);
            }
            if (t.matrix) {
                result.push([ "matrix(", t.matrix, ")" ]);
            }
            this.node.setAttribute("transform", utils.flatten(result).join(" "));
            return this;
        },
        setMatrix: function(m) {
            this.transform.matrix = m;
            return this._applyTransform();
        },
        setTranslate: function(t) {
            this.transform.translate = t !== null && slice.call(arguments) || null;
            return this._applyTransform();
        },
        setRotate: function(r) {
            this.transform.rotate = r !== null && slice.call(arguments) || null;
            return this._applyTransform();
        },
        setScale: function(s) {
            this.transform.scale = s !== null && slice.call(arguments) || null;
            return this._applyTransform();
        },
        translate: function(dx, dy) {
            var m = this.transform.matrix || new Matrix();
            if (dy === undefined) {
                dy = 0;
            }
            this.transform.matrix = m.translate(dx, dy);
            return this._applyTransform();
        },
        rotate: function(deg) {
            var m = this.transform.matrix || new Matrix();
            this.transform.matrix = m.rotate(deg);
            return this._applyTransform();
        },
        scale: function(sx, sy) {
            var m = this.transform.matrix || new Matrix();
            if (sy === undefined) {
                sy = sx;
            }
            this.transform.matrix = m.scale(sx, sy);
            return this._applyTransform();
        },
        skew: function(sx, sy) {
            var m = this.transform.matrix || new Matrix();
            if (sy === undefined) {
                sy = sx;
            }
            this.transform.matrix = m.skew(sx, sy);
            return this._applyTransform();
        },
        stroke: function(pen, width) {
            if (pen && pen.stroke) {
                pen.stroke(this);
            } else if (pen) {
                // 字符串或重写了 toString 的对象
                this.node.setAttribute("stroke", pen.toString());
                if (width) {
                    this.node.setAttribute("stroke-width", width);
                }
            } else if (pen === null) {
                this.node.removeAttribute("stroe");
            }
            return this;
        },
        fill: function(brush) {
            // 字符串或重写了 toString 的对象
            if (brush) {
                this.node.setAttribute("fill", brush.toString());
            }
            if (brush === null) {
                this.node.removeAttribute("fill");
            }
            return this;
        },
        setAttr: function(a, v) {
            var me = this;
            if (utils.isObject(a)) {
                utils.each(a, function(val, key) {
                    me.setAttr(key, val);
                });
            }
            if (v === undefined || v === null || v === "") {
                this.node.removeAttribute(a);
            } else {
                this.node.setAttribute(a, v);
            }
            return this;
        },
        getAttr: function(a) {
            return this.node.getAttribute(a);
        }
    });
    return Shape;
});
define("graphic/shapecontainer", [ "graphic/container", "core/class", "core/utils", "graphic/shape", "graphic/svg", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    var Container = require("graphic/container");
    var utils = require("core/utils");
    var ShapeContainer = require("core/class").createClass("ShapeContainer", {
        base: Container,
        isShapeContainer: true,
        /* private */
        handleAdd: function(shape, index) {
            var parent = this.getShapeNode();
            parent.insertBefore(shape.node, parent.childNodes[index] || null);
            shape.trigger("add", {
                container: this
            });
            if (shape.notifyTreeModification) {
                shape.notifyTreeModification("treeadd", this);
            }
        },
        /* private */
        handleRemove: function(shape, index) {
            var parent = this.getShapeNode();
            parent.removeChild(shape.node);
            shape.trigger("remove", {
                container: this
            });
            if (shape.notifyTreeModification) {
                shape.notifyTreeModification("treeremove", this);
            }
        },
        /* private */
        notifyTreeModification: function(type, container) {
            this.eachItem(function(index, shape) {
                if (shape.notifyTreeModification) {
                    shape.notifyTreeModification(type, container);
                }
                shape.trigger(type, {
                    container: container
                });
            });
        },
        /* public */
        getShape: function(index) {
            return this.getItem(index);
        },
        /* public */
        addShape: function(shape, index) {
            return this.addItem(shape, index);
        },
        put: function(shape) {
            this.addShape(shape);
            return shape;
        },
        appendShape: function(shape) {
            return this.addShape(shape);
        },
        prependShape: function(shape) {
            return this.addShape(shape, 0);
        },
        replaceShape: function(replacer, origin) {
            var index = this.indexOf(origin);
            if (index === -1) {
                return;
            }
            this.removeShape(index);
            this.addShape(replacer, index);
            return this;
        },
        addShapeBefore: function(shape, refer) {
            var index = this.indexOf(refer);
            return this.addShape(shape, index);
        },
        addShapeAfter: function(shape, refer) {
            var index = this.indexOf(refer);
            return this.addShape(shape, index === -1 ? undefined : index + 1);
        },
        /* public */
        addShapes: function(shapes) {
            return this.addItems(shapes);
        },
        /* public */
        removeShape: function(index) {
            return this.removeItem(index);
        },
        getShapes: function() {
            return this.getItems();
        },
        getShapesByType: function(name) {
            var shapes = [];
            function getShapes(shape) {
                if (name.toLowerCase() == shape.getType().toLowerCase()) {
                    shapes.push(shape);
                }
                if (shape.isShapeContainer) {
                    utils.each(shape.getShapes(), function(n) {
                        getShapes(n);
                    });
                }
            }
            getShapes(this);
            return shapes;
        },
        /* public */
        getShapeById: function(id) {
            return this.getShapeNode().getElementById(id).shape;
        },
        arrangeShape: function(shape, index) {
            return this.removeShape(shape).addShape(shape, index);
        },
        /* protected */
        getShapeNode: function() {
            return this.shapeNode || this.node;
        }
    });
    var Shape = require("graphic/shape");
    require("core/class").extendClass(Shape, {
        bringTo: function(index) {
            this.container.arrangeShape(this, index);
            return this;
        },
        bringFront: function() {
            return this.bringTo(this.container.indexOf(this) + 1);
        },
        bringBack: function() {
            return this.bringTo(this.container.indexOf(this) - 1);
        },
        bringTop: function() {
            this.container.removeShape(this).addShape(this);
            return this;
        },
        bringRear: function() {
            return this.bringTo(0);
        },
        bringRefer: function(referShape, offset) {
            if (referShape.container) {
                if (this.remove) {
                    this.remove();
                }
                referShape.container.addShape(this, referShape.container.indexOf(referShape) + (offset || 0));
            }
            return this;
        },
        bringAbove: function(referShape) {
            return this.bringRefer(referShape);
        },
        bringBelow: function(referShape) {
            return this.bringRefer(referShape, 1);
        },
        replaceBy: function(newShape) {
            if (this.container) {
                newShape.bringAbove(this);
                this.remove();
            }
            return this;
        }
    });
    return ShapeContainer;
});
/*
 * 图形事件包装类
 * */
define("graphic/shapeevent", [ "graphic/matrix", "core/utils", "graphic/box", "graphic/point", "core/class" ], function(require, exprots, module) {
    var Matrix = require("graphic/matrix"), Utils = require("core/utils"), Point = require("graphic/point");
    return require("core/class").createClass("ShapeEvent", {
        constructor: function(event) {
            var target = null;
            // dom 事件封装对象
            if (!Utils.isObject(event.target)) {
                this.type = event.type;
                target = event.target;
                // use标签有特殊属性， 需要区别对待
                if (target.correspondingUseElement) {
                    target = target.correspondingUseElement;
                }
                this.originEvent = event;
                this.targetShape = target.shape || target.paper || event.currentTarget && (event.currentTarget.shape || event.currentTarget.paper);
                if (event._kityParam) {
                    Utils.extend(this, event._kityParam);
                }
            } else {
                Utils.extend(this, event);
            }
        },
        preventDefault: function() {
            var evt = this.originEvent;
            if (!evt) {
                return true;
            }
            if (evt.preventDefault) {
                evt.preventDefault();
                return evt.cancelable;
            } else {
                evt.returnValue = false;
                return true;
            }
        },
        //当前鼠标事件在用户坐标系中点击的点的坐标位置
        getPosition: function(refer, touchIndex) {
            if (!this.originEvent) {
                return null;
            }
            var eventClient = this.originEvent.touches ? this.originEvent.touches[touchIndex || 0] : this.originEvent;
            var target = this.targetShape;
            var targetNode = target.shapeNode || target.node;
            var pScreen = new kity.Point(eventClient && eventClient.clientX || 0, eventClient && eventClient.clientY || 0);
            var pTarget = Matrix.transformPoint(pScreen, targetNode.getScreenCTM().inverse());
            var pRefer = Matrix.getCTM(target, refer || "view").transformPoint(pTarget);
            return pRefer;
        },
        stopPropagation: function() {
            var evt = this.originEvent;
            if (!evt) {
                return true;
            }
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.cancelBubble = false;
            }
        }
    });
});
/*
 * 图形上的点抽象
 */
define("graphic/shapepoint", [ "core/class", "graphic/point" ], function(require, exports, module) {
    return require("core/class").createClass("ShapePoint", {
        base: require("graphic/point"),
        constructor: function(px, py) {
            this.callBase(px, py);
        },
        setX: function(x) {
            return this.setPoint(x, this.y);
        },
        setY: function(y) {
            return this.setPoint(this.x, y);
        },
        setPoint: function(x, y) {
            this.x = x;
            this.y = y;
            this.update();
            return this;
        },
        getPoint: function() {
            return this;
        },
        update: function() {
            if (this.container && this.container.update) {
                this.container.update();
            }
            return this;
        }
    });
});
/**
 * 标准颜色映射
 */
define("graphic/standardcolor", [], {
    COLOR_STANDARD: {
        aliceblue: "#f0f8ff",
        antiquewhite: "#faebd7",
        aqua: "#00ffff",
        aquamarine: "#7fffd4",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        bisque: "#ffe4c4",
        black: "#000000",
        blanchedalmond: "#ffebcd",
        blue: "#0000ff",
        blueviolet: "#8a2be2",
        brown: "#a52a2a",
        burlywood: "#deb887",
        cadetblue: "#5f9ea0",
        chartreuse: "#7fff00",
        chocolate: "#d2691e",
        coral: "#ff7f50",
        cornflowerblue: "#6495ed",
        cornsilk: "#fff8dc",
        crimson: "#dc143c",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgoldenrod: "#b8860b",
        darkgray: "#a9a9a9",
        darkgreen: "#006400",
        darkgrey: "#a9a9a9",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkseagreen: "#8fbc8f",
        darkslateblue: "#483d8b",
        darkslategray: "#2f4f4f",
        darkslategrey: "#2f4f4f",
        darkturquoise: "#00ced1",
        darkviolet: "#9400d3",
        deeppink: "#ff1493",
        deepskyblue: "#00bfff",
        dimgray: "#696969",
        dimgrey: "#696969",
        dodgerblue: "#1e90ff",
        firebrick: "#b22222",
        floralwhite: "#fffaf0",
        forestgreen: "#228b22",
        fuchsia: "#ff00ff",
        gainsboro: "#dcdcdc",
        ghostwhite: "#f8f8ff",
        gold: "#ffd700",
        goldenrod: "#daa520",
        gray: "#808080",
        green: "#008000",
        greenyellow: "#adff2f",
        grey: "#808080",
        honeydew: "#f0fff0",
        hotpink: "#ff69b4",
        indianred: "#cd5c5c",
        indigo: "#4b0082",
        ivory: "#fffff0",
        khaki: "#f0e68c",
        lavender: "#e6e6fa",
        lavenderblush: "#fff0f5",
        lawngreen: "#7cfc00",
        lemonchiffon: "#fffacd",
        lightblue: "#add8e6",
        lightcoral: "#f08080",
        lightcyan: "#e0ffff",
        lightgoldenrodyellow: "#fafad2",
        lightgray: "#d3d3d3",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightsalmon: "#ffa07a",
        lightseagreen: "#20b2aa",
        lightskyblue: "#87cefa",
        lightslategray: "#778899",
        lightslategrey: "#778899",
        lightsteelblue: "#b0c4de",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        limegreen: "#32cd32",
        linen: "#faf0e6",
        magenta: "#ff00ff",
        maroon: "#800000",
        mediumaquamarine: "#66cdaa",
        mediumblue: "#0000cd",
        mediumorchid: "#ba55d3",
        mediumpurple: "#9370db",
        mediumseagreen: "#3cb371",
        mediumslateblue: "#7b68ee",
        mediumspringgreen: "#00fa9a",
        mediumturquoise: "#48d1cc",
        mediumvioletred: "#c71585",
        midnightblue: "#191970",
        mintcream: "#f5fffa",
        mistyrose: "#ffe4e1",
        moccasin: "#ffe4b5",
        navajowhite: "#ffdead",
        navy: "#000080",
        oldlace: "#fdf5e6",
        olive: "#808000",
        olivedrab: "#6b8e23",
        orange: "#ffa500",
        orangered: "#ff4500",
        orchid: "#da70d6",
        palegoldenrod: "#eee8aa",
        palegreen: "#98fb98",
        paleturquoise: "#afeeee",
        palevioletred: "#db7093",
        papayawhip: "#ffefd5",
        peachpuff: "#ffdab9",
        peru: "#cd853f",
        pink: "#ffc0cb",
        plum: "#dda0dd",
        powderblue: "#b0e0e6",
        purple: "#800080",
        red: "#ff0000",
        rosybrown: "#bc8f8f",
        royalblue: "#4169e1",
        saddlebrown: "#8b4513",
        salmon: "#fa8072",
        sandybrown: "#f4a460",
        seagreen: "#2e8b57",
        seashell: "#fff5ee",
        sienna: "#a0522d",
        silver: "#c0c0c0",
        skyblue: "#87ceeb",
        slateblue: "#6a5acd",
        slategray: "#708090",
        slategrey: "#708090",
        snow: "#fffafa",
        springgreen: "#00ff7f",
        steelblue: "#4682b4",
        tan: "#d2b48c",
        teal: "#008080",
        thistle: "#d8bfd8",
        tomato: "#ff6347",
        turquoise: "#40e0d0",
        violet: "#ee82ee",
        wheat: "#f5deb3",
        white: "#ffffff",
        whitesmoke: "#f5f5f5",
        yellow: "#ffff00"
    },
    //标准扩展
    EXTEND_STANDARD: {}
});
define("graphic/star", [ "graphic/point", "core/class", "graphic/path", "core/utils", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    /**
     * @see http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
     */
    var defaultRatioForStar = {
        "3": .2,
        // yy
        "5": .38196601125,
        "6": .57735026919,
        "8": .541196100146,
        "10": .726542528005,
        "12": .707106781187
    };
    var Point = require("graphic/point");
    return require("core/class").createClass("Star", {
        base: require("graphic/path"),
        constructor: function(vertex, radius, shrink, offset, angleOffset) {
            this.callBase();
            this.vertex = vertex || 3;
            this.radius = radius || 0;
            this.shrink = shrink;
            this.offset = offset || new Point(0, 0);
            this.angleOffset = angleOffset || 0;
            this.draw();
        },
        getVertex: function() {
            return this.vertex;
        },
        setVertex: function(value) {
            this.vertex = value;
            return this.draw();
        },
        getRadius: function() {
            return this.radius;
        },
        setRadius: function(value) {
            this.radius = value;
            return this.draw();
        },
        getShrink: function() {
            return this.shrink;
        },
        setShrink: function(value) {
            this.shrink = value;
            return this.draw();
        },
        getOffset: function() {
            return this.offset;
        },
        setOffset: function(value) {
            this.offset = value;
            return this.draw();
        },
        getAngleOffset: function() {
            return this.angleOffset;
        },
        setAngleOffset: function(value) {
            this.angleOffset = value;
            return this.draw();
        },
        draw: function() {
            var innerRadius = this.radius, outerRadius = this.radius * (this.shrink || defaultRatioForStar[this.vertex] || .5), vertex = this.vertex, offset = this.offset, angleStart = 90, angleStep = 180 / vertex, angleOffset = this.angleOffset, drawer = this.getDrawer(), i, angle;
            drawer.clear();
            drawer.moveTo(Point.fromPolar(outerRadius, angleStart));
            for (i = 1; i <= vertex * 2; i++) {
                angle = angleStart + angleStep * i;
                // 绘制内点
                if (i % 2) {
                    drawer.lineTo(Point.fromPolar(innerRadius, angle + angleOffset).offset(offset));
                } else {
                    drawer.lineTo(Point.fromPolar(outerRadius, angle));
                }
            }
            drawer.close();
        }
    });
});
define("graphic/styled", [ "core/class" ], function(require, exports, module) {
    // polyfill for ie
    var ClassList = require("core/class").createClass("ClassList", {
        constructor: function(node) {
            this._node = node;
            this._list = node.className.toString().split(" ");
        },
        _update: function() {
            this._node.className = this._list.join(" ");
        },
        add: function(name) {
            this._list.push(name);
            this._update();
        },
        remove: function(name) {
            var index = this._list.indexOf(name);
            if (~index) {
                this._list.splice(index, 1);
            }
            this._update();
        },
        contains: function(name) {
            return !!~this._list.indexOf(name);
        }
    });
    function getClassList(node) {
        if (!node.classList) {
            node.classList = new ClassList(node);
        }
        return node.classList;
    }
    return require("core/class").createClass("Styled", {
        addClass: function(name) {
            getClassList(this.node).add(name);
            return this;
        },
        removeClass: function(name) {
            getClassList(this.node).remove(name);
            return this;
        },
        hasClass: function(name) {
            return getClassList(this.node).contains(name);
        },
        setStyle: function(styles) {
            if (arguments.length == 2) {
                this.node.style[arguments[0]] = arguments[1];
                return this;
            }
            for (var name in styles) {
                if (styles.hasOwnProperty(name)) {
                    this.node.style[name] = styles[name];
                }
            }
            return this;
        }
    });
});
define("graphic/svg", [], function(require, exports, module) {
    var doc = document;
    var id = 0;
    var svg = {
        createNode: function(name) {
            var node = doc.createElementNS(svg.ns, name);
            node.id = "kity_" + name + "_" + id++;
            return node;
        },
        defaults: {
            stroke: "none",
            fill: "none"
        },
        xlink: "http://www.w3.org/1999/xlink",
        ns: "http://www.w3.org/2000/svg"
    };
    return svg;
});
define("graphic/sweep", [ "graphic/point", "core/class", "graphic/path", "core/utils", "graphic/shape", "graphic/svg", "graphic/geometry" ], function(require, exports, module) {
    var Point = require("graphic/point");
    return require("core/class").createClass("Sweep", {
        base: require("graphic/path"),
        constructor: function(sectionArray, angle, angleOffset) {
            this.callBase();
            this.sectionArray = sectionArray || [];
            this.angle = angle || 0;
            this.angleOffset = angleOffset || 0;
            this.draw();
        },
        getSectionArray: function() {
            return this.sectionArray;
        },
        setSectionArray: function(value) {
            this.sectionArray = value;
            return this.draw();
        },
        getAngle: function() {
            return this.angle;
        },
        setAngle: function(value) {
            this.angle = value;
            return this.draw();
        },
        getAngleOffset: function() {
            return this.angleOffset;
        },
        setAngleOffset: function(value) {
            this.angleOffset = value;
            return this.draw();
        },
        draw: function() {
            var sectionArray = this.sectionArray, i;
            for (i = 0; i < sectionArray.length; i += 2) {
                this.drawSection(sectionArray[i], sectionArray[i + 1]);
            }
            return this;
        },
        drawSection: function(from, to) {
            var angleLength = this.angle && (this.angle % 360 ? this.angle % 360 : 360), angleStart = this.angleOffset, angleHalf = angleStart + angleLength / 2, angleEnd = angleStart + angleLength, drawer = this.getDrawer();
            drawer.redraw();
            if (angleLength === 0) {
                drawer.done();
                return;
            }
            drawer.moveTo(Point.fromPolar(from, angleStart));
            drawer.lineTo(Point.fromPolar(to, angleStart));
            if (to) {
                drawer.carcTo(to, 0, 1, Point.fromPolar(to, angleHalf));
                drawer.carcTo(to, 0, 1, Point.fromPolar(to, angleEnd));
            }
            drawer.lineTo(Point.fromPolar(from, angleEnd));
            if (from) {
                drawer.carcTo(from, 0, 1, Point.fromPolar(from, angleHalf));
                drawer.carcTo(from, 0, 1, Point.fromPolar(from, angleStart));
            }
            drawer.close();
            drawer.done();
        }
    });
});
define("graphic/text", [ "graphic/textcontent", "graphic/shape", "core/class", "graphic/shapecontainer", "graphic/container", "core/utils", "graphic/svg" ], function(require, exports, module) {
    var TextContent = require("graphic/textcontent");
    var ShapeContainer = require("graphic/shapecontainer");
    var svg = require("graphic/svg");
    var utils = require("core/utils");
    var offsetHash = {};
    function getTextBoundOffset(text) {
        var font = text._cachedFontHash;
        if (offsetHash[font]) {
            return offsetHash[font];
        }
        var textContent = text.getContent();
        text.setContent("test");
        var bbox = text.getBoundaryBox(), y = text.getY() + +text.node.getAttribute("dy");
        var topOffset = y - bbox.y, bottomOffset = topOffset - bbox.height;
        text.setContent(textContent);
        return offsetHash[font] = {
            top: topOffset,
            bottom: bottomOffset,
            middle: (topOffset + bottomOffset) / 2
        };
    }
    return require("core/class").createClass("Text", {
        base: TextContent,
        mixins: [ ShapeContainer ],
        constructor: function(content) {
            this.callBase("text");
            if (content !== undefined) {
                this.setContent(content);
            }
            this._buildFontHash();
        },
        _buildFontHash: function() {
            var style = window.getComputedStyle(this.node);
            this._cachedFontHash = [ style.fontFamily, style.fontSize, style.fontStretch, style.fontStyle, style.fontVariant, style.fontWeight ].join("-");
        },
        _fontChanged: function(font) {
            var last = this._lastFont;
            var current = utils.extend({}, last, font);
            if (!last) {
                last = font;
                return true;
            }
            var changed = last.family != current.family || last.size != current.size || last.style != current.style || last.weight != current.weight;
            last = current;
            return changed;
        },
        setX: function(x) {
            this.node.setAttribute("x", x);
            return this;
        },
        setPosition: function(x, y) {
            return this.setX(x).setY(y);
        },
        setY: function(y) {
            this.node.setAttribute("y", y);
            return this;
        },
        getX: function() {
            return +this.node.getAttribute("x") || 0;
        },
        getY: function() {
            return +this.node.getAttribute("y") || 0;
        },
        setFont: function(font) {
            this.callBase(font);
            if (this._fontChanged(font)) {
                this._buildFontHash();
                this.setVerticalAlign(this.getVerticalAlign());
            }
            return this;
        },
        setTextAnchor: function(anchor) {
            this.node.setAttribute("text-anchor", anchor);
            return this;
        },
        getTextAnchor: function() {
            return this.node.getAttribute("text-anchor") || "start";
        },
        // top/bottom/middle/baseline
        setVerticalAlign: function(align) {
            this.whenPaperReady(function() {
                var dy;
                switch (align) {
                  case "top":
                    dy = getTextBoundOffset(this).top;
                    break;

                  case "bottom":
                    dy = getTextBoundOffset(this).bottom;
                    break;

                  case "middle":
                    dy = getTextBoundOffset(this).middle;
                    break;

                  default:
                    dy = 0;
                }
                this.node.setAttribute("dy", dy);
            });
            this.verticalAlign = align;
            return this;
        },
        getVerticalAlign: function() {
            return this.verticalAlign || "baseline";
        },
        setStartOffset: function(offset) {
            // only for text path
            if (this.shapeNode != this.node) {
                this.shapeNode.setAttribute("startOffset", offset * 100 + "%");
            }
        },
        addSpan: function(span) {
            this.addShape(span);
            return this;
        },
        setPath: function(path) {
            var textpath = this.shapeNode;
            if (this.shapeNode == this.node) {
                // 当前还不是 textpath
                textpath = this.shapeNode = svg.createNode("textPath");
                while (this.node.firstChild) {
                    this.shapeNode.appendChild(this.node.firstChild);
                }
                this.node.appendChild(textpath);
            }
            textpath.setAttributeNS(svg.xlink, "xlink:href", "#" + path.node.id);
            this.setTextAnchor(this.getTextAnchor());
            return this;
        }
    });
});
define("graphic/textcontent", [ "graphic/shape", "graphic/svg", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box", "core/class" ], function(require, exports, module) {
    var Shape = require("graphic/shape");
    return require("core/class").createClass("TextContent", {
        base: Shape,
        constructor: function(nodeType) {
            // call shape constructor
            this.callBase(nodeType);
            this.shapeNode = this.shapeNode || this.node;
            this.shapeNode.setAttribute("text-rendering", "geometricPrecision");
        },
        clearContent: function() {
            while (this.shapeNode.firstChild) {
                this.shapeNode.removeChild(this.shapeNode.firstChild);
            }
            return this;
        },
        setContent: function(content) {
            this.shapeNode.textContent = content;
            return this;
        },
        getContent: function() {
            return this.shapeNode.textContent;
        },
        appendContent: function(content) {
            this.shapeNode.textContent += content;
            return this;
        },
        setSize: function(value) {
            return this.setFontSize(value);
        },
        setFontSize: function(value) {
            return this.setFont({
                size: value
            });
        },
        setFontFamily: function(value) {
            return this.setFont({
                family: value
            });
        },
        setFontBold: function(bold) {
            return this.setFont({
                weight: bold ? "bold" : "normal"
            });
        },
        setFontItalic: function(italic) {
            return this.setFont({
                style: italic ? "italic" : "normal"
            });
        },
        setFont: function(font) {
            var node = this.node;
            [ "family", "size", "weight", "style" ].forEach(function(section) {
                if (font[section] === null) {
                    node.removeAttribute("font-" + section);
                } else if (font[section]) {
                    node.setAttribute("font-" + section, font[section]);
                }
            });
            return this;
        },
        getExtentOfChar: function(index) {
            return this.node.getExtentOfChar(index);
        },
        getRotationOfChar: function(index) {
            return this.node.getRotationOfChar(index);
        },
        getCharNumAtPosition: function(x, y) {
            return this.node.getCharNumAtPosition(this.node.viewportElement.createSVGPoint(x, y));
        }
    });
});
define("graphic/textspan", [ "graphic/textcontent", "graphic/shape", "core/class", "graphic/styled" ], function(require, exports, module) {
    var TextContent = require("graphic/textcontent");
    var Styled = require("graphic/styled");
    return require("core/class").createClass("TextSpan", {
        base: TextContent,
        mixins: [ Styled ],
        constructor: function(content) {
            this.callBase("tspan");
            this.setContent(content);
        }
    });
});
/*
 * USE 功能
 */
define("graphic/use", [ "graphic/svg", "core/class", "graphic/shape", "core/utils", "graphic/eventhandler", "graphic/styled", "graphic/data", "graphic/matrix", "graphic/pen", "graphic/box" ], function(require, exports, module) {
    var Svg = require("graphic/svg");
    var Class = require("core/class");
    var Use = Class.createClass("Use", {
        base: require("graphic/shape"),
        constructor: function(shape) {
            this.callBase("use");
            this.ref(shape);
        },
        ref: function(shape) {
            if (!shape) {
                this.node.removeAttributeNS(Svg.xlink, "xlink:href");
                return this;
            }
            var shapeId = shape.getId();
            if (shapeId) {
                this.node.setAttributeNS(Svg.xlink, "xlink:href", "#" + shapeId);
            }
            // by techird
            // 作为 Use 的图形，如果没有 fill 和 stroke，移除默认的 'none' 值，用于 Use 覆盖
            if (shape.node.getAttribute("fill") === "none") {
                shape.node.removeAttribute("fill");
            }
            if (shape.node.getAttribute("stroke") === "none") {
                shape.node.removeAttribute("stroke");
            }
            return this;
        }
    });
    var Shape = require("graphic/shape");
    Class.extendClass(Shape, {
        // fast-use
        use: function() {
            return new Use(this);
        }
    });
    return Use;
});
define("graphic/vector", [ "graphic/point", "core/class", "graphic/matrix", "core/utils", "graphic/box" ], function(require, exports, module) {
    var Point = require("graphic/point");
    var Matrix = require("graphic/matrix");
    var Vector = require("core/class").createClass("Vector", {
        base: Point,
        constructor: function(x, y) {
            this.callBase(x, y);
        },
        square: function() {
            return this.x * this.x + this.y * this.y;
        },
        length: function() {
            return Math.sqrt(this.square());
        },
        add: function(q) {
            return new Vector(this.x + q.x, this.y + q.y);
        },
        minus: function(q) {
            return new Vector(this.x - q.x, this.y - q.y);
        },
        dot: function(q) {
            return this.x * q.x + this.y * q.y;
        },
        project: function(q) {
            return q.multipy(this.dot(q) / q.square());
        },
        normalize: function(length) {
            if (length === undefined) {
                length = 1;
            }
            return this.multipy(length / this.length());
        },
        multipy: function(scale) {
            return new Vector(this.x * scale, this.y * scale);
        },
        rotate: function(angle, unit) {
            if (unit == "rad") {
                angle = angle / Math.PI * 180;
            }
            var p = new Matrix().rotate(angle).transformPoint(this);
            return new Vector(p.x, p.y);
        },
        vertical: function() {
            return new Vector(this.y, -this.x);
        },
        reverse: function() {
            return this.multipy(-1);
        },
        getAngle: function() {
            var length = this.length();
            if (length === 0) return 0;
            var rad = Math.acos(this.x / length);
            var sign = this.y > 0 ? 1 : -1;
            return sign * 180 * rad / Math.PI;
        }
    });
    Vector.fromPoints = function(p1, p2) {
        return new Vector(p2.x - p1.x, p2.y - p1.y);
    };
    require("core/class").extendClass(Point, {
        asVector: function() {
            return new Vector(this.x, this.y);
        }
    });
    return Vector;
});
define("graphic/view", [ "graphic/shapecontainer", "graphic/container", "core/utils", "core/class", "graphic/shape", "graphic/viewbox", "graphic/view" ], function(require, exports, module) {
    var ShapeContainer = require("graphic/shapecontainer");
    var ViewBox = require("graphic/viewbox");
    return require("core/class").createClass("View", {
        mixins: [ ShapeContainer, ViewBox ],
        base: require("graphic/view"),
        constructor: function() {
            this.callBase("view");
        }
    });
});
define("graphic/viewbox", [ "core/class" ], function(require, exports, module) {
    return require("core/class").createClass("ViewBox", {
        getViewBox: function() {
            var attr = this.node.getAttribute("viewBox");
            if (attr === null) {
                // firefox:
                // 1. viewBox 没有设置过的时候获得的是 null
                // 2. svg 标签没有指定绝对大小的时候 clientWidth 和 clientHeigt 为 0，需要在父容器上查找
                // TODO: 第 2 条取得的不准确（假如有 padding 之类的）
                return {
                    x: 0,
                    y: 0,
                    width: this.node.clientWidth || this.node.parentNode.clientWidth,
                    height: this.node.clientHeight || this.node.parentNode.clientHeight
                };
            } else {
                attr = attr.split(" ");
                return {
                    x: +attr[0],
                    y: +attr[1],
                    width: +attr[2],
                    height: +attr[3]
                };
            }
        },
        setViewBox: function(x, y, width, height) {
            this.node.setAttribute("viewBox", [ x, y, width, height ].join(" "));
            return this;
        }
    });
});
define("kity", [ "core/utils", "core/class", "core/browser", "graphic/box", "graphic/bezier", "graphic/pointcontainer", "graphic/path", "graphic/bezierpoint", "graphic/shapepoint", "graphic/vector", "graphic/circle", "graphic/ellipse", "graphic/clip", "graphic/shape", "graphic/shapecontainer", "graphic/color", "graphic/standardcolor", "graphic/container", "graphic/curve", "graphic/point", "graphic/gradientbrush", "graphic/svg", "graphic/defbrush", "graphic/group", "graphic/hyperlink", "graphic/image", "graphic/line", "graphic/lineargradientbrush", "graphic/mask", "graphic/matrix", "graphic/marker", "graphic/resource", "graphic/viewbox", "graphic/palette", "graphic/paper", "graphic/eventhandler", "graphic/styled", "graphic/geometry", "graphic/patternbrush", "graphic/pen", "graphic/polygon", "graphic/poly", "graphic/polyline", "graphic/pie", "graphic/sweep", "graphic/radialgradientbrush", "graphic/rect", "graphic/regularpolygon", "graphic/ring", "graphic/data", "graphic/star", "graphic/text", "graphic/textcontent", "graphic/textspan", "graphic/use", "animate/animator", "animate/timeline", "animate/easing", "animate/opacityanimator", "animate/rotateanimator", "animate/scaleanimator", "animate/frame", "animate/translateanimator", "animate/pathanimator", "animate/motionanimator", "filter/filter", "filter/effectcontainer", "filter/gaussianblurfilter", "filter/effect/gaussianblureffect", "filter/projectionfilter", "filter/effect/effect", "filter/effect/colormatrixeffect", "filter/effect/compositeeffect", "filter/effect/offseteffect", "filter/effect/convolvematrixeffect" ], function(require, exports, module) {
    var kity = {}, utils = require("core/utils");
    kity.version = "2.0.0";
    utils.extend(kity, {
        // core
        createClass: require("core/class").createClass,
        extendClass: require("core/class").extendClass,
        Utils: utils,
        Browser: require("core/browser"),
        // shape
        Box: require("graphic/box"),
        Bezier: require("graphic/bezier"),
        BezierPoint: require("graphic/bezierpoint"),
        Circle: require("graphic/circle"),
        Clip: require("graphic/clip"),
        Color: require("graphic/color"),
        Container: require("graphic/container"),
        Curve: require("graphic/curve"),
        Ellipse: require("graphic/ellipse"),
        GradientBrush: require("graphic/gradientbrush"),
        Group: require("graphic/group"),
        HyperLink: require("graphic/hyperlink"),
        Image: require("graphic/image"),
        Line: require("graphic/line"),
        LinearGradientBrush: require("graphic/lineargradientbrush"),
        Mask: require("graphic/mask"),
        Matrix: require("graphic/matrix"),
        Marker: require("graphic/marker"),
        Palette: require("graphic/palette"),
        Paper: require("graphic/paper"),
        Path: require("graphic/path"),
        PatternBrush: require("graphic/patternbrush"),
        Pen: require("graphic/pen"),
        Point: require("graphic/point"),
        Polygon: require("graphic/polygon"),
        Polyline: require("graphic/polyline"),
        Pie: require("graphic/pie"),
        RadialGradientBrush: require("graphic/radialgradientbrush"),
        Rect: require("graphic/rect"),
        RegularPolygon: require("graphic/regularpolygon"),
        Ring: require("graphic/ring"),
        Shape: require("graphic/shape"),
        ShapePoint: require("graphic/shapepoint"),
        ShapeContainer: require("graphic/shapecontainer"),
        Sweep: require("graphic/sweep"),
        Star: require("graphic/star"),
        Text: require("graphic/text"),
        TextSpan: require("graphic/textspan"),
        Use: require("graphic/use"),
        Vector: require("graphic/vector"),
        g: require("graphic/geometry"),
        // animate
        Animator: require("animate/animator"),
        Easing: require("animate/easing"),
        OpacityAnimator: require("animate/opacityanimator"),
        RotateAnimator: require("animate/rotateanimator"),
        ScaleAnimator: require("animate/scaleanimator"),
        Timeline: require("animate/timeline"),
        TranslateAnimator: require("animate/translateanimator"),
        PathAnimator: require("animate/pathanimator"),
        MotionAnimator: require("animate/motionanimator"),
        // filter
        Filter: require("filter/filter"),
        GaussianblurFilter: require("filter/gaussianblurfilter"),
        ProjectionFilter: require("filter/projectionfilter"),
        // effect
        ColorMatrixEffect: require("filter/effect/colormatrixeffect"),
        CompositeEffect: require("filter/effect/compositeeffect"),
        ConvolveMatrixEffect: require("filter/effect/convolvematrixeffect"),
        Effect: require("filter/effect/effect"),
        GaussianblurEffect: require("filter/effect/gaussianblureffect"),
        OffsetEffect: require("filter/effect/offseteffect")
    });
    return window.kity = kity;
});

/* global use, inc: true */

/**
 * 模块暴露
 */

(function() {

    try {
        inc.use('kity');
    } catch (e) {
        use('kity');
    }

})();})();
