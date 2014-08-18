/*!
 * ====================================================
 * kityminder - v1.2.1 - 2014-08-14
 * https://github.com/fex-team/kityminder
 * GitHub: https://github.com/fex-team/kityminder.git 
 * Copyright (c) 2014 f-cube @ FEX; Licensed MIT
 * ====================================================
 */

(function(window) {



/* lib/kity/dist/kity.js */
    /*!
     * ====================================================
     * kity - v2.0.0 - 2014-08-04
     * https://github.com/fex-team/kity
     * GitHub: https://github.com/fex-team/kity.git 
     * Copyright (c) 2014 Baidu FEX; Licensed BSD
     * ====================================================
     */

    (function () {
    var _p = {
        r: function(index) {
            if (_p[index].inited) {
                return _p[index].value;
            }
            if (typeof _p[index].value === "function") {
                var module = {
                    exports: {}
                }, returnValue = _p[index].value(null, module.exports, module);
                _p[index].inited = true;
                _p[index].value = returnValue;
                if (returnValue !== undefined) {
                    return returnValue;
                } else {
                    for (var key in module.exports) {
                        if (module.exports.hasOwnProperty(key)) {
                            _p[index].inited = true;
                            _p[index].value = module.exports;
                            return module.exports;
                        }
                    }
                }
            } else {
                _p[index].inited = true;
                return _p[index].value;
            }
        }
    };

    //src/animate/animator.js
    /**
     * @fileOverview
     *
     * 提供基本的动画支持
     */
    _p[0] = {
        value: function(require) {
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
            var Timeline = _p.r(8);
            var easingTable = _p.r(1);
            /**
         * @class kity.Animator
         * @catalog animate
         * @description 表示一个动画启动器，可以作用于不同的对象进行动画
         */
            var Animator = _p.r(11).createClass("Animator", {
                /**
             * @constructor
             * @for kity.Animator
             * @catalog animate
             *
             * @grammar new kity.Animator(beginValue, finishValue, setter)
             * @grammar new kity.Animator(option)
             *
             * @param  {any}      beginValue|opt.beginValue
             *     动画的起始值，允许的类型有数字、数组、字面量、kity.Point、kity.Vector、kity.Box、kity.Matrix
             *
             * @param  {any}      finishValue|opt.beginValue
             *     动画的结束值，类型应于起始值相同
             *
             * @param  {Function} setter|opt.setter
             *     值的使用函数，接受三个参数: function(target, value, timeline)
             *         target   {object}        动画的目标
             *         value    {any}           动画的当前值
             *         timeline {kity.Timeline} 动画当前的时间线对象
             */
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
                /**
             * @method start()
             * @for kity.Animator
             * @description 使用当前的动画器启动在指定目标上启动动画
             *
             * @grammar start(target, duration, easing, delay, callback) => {kity.Timeline}
             * @grammar start(target, option) => {kity.Timeline}
             *
             * @param  {object} target
             *     启动动画的目标
             *
             * @param  {Number|String} duration|option.duration
             *     [Optional] 动画的持续时间，如 300、"300ms"、"1.5min"
             *
             * @param  {String|Function} easing|option.easing
             *     [Optional] 动画使用的缓动函数，如 "ease"、"linear"、"swing"
             *
             * @param  {Number|String} delay|option.delay
             *     [Optional] 动画的播放延迟时间
             *
             * @param  {Function} callback|option.callback
             *     [Optional] 动画结束后的回调函数
             *
             * @example
             *
             * ```js
             * var turnRed = new kity.Animator(
             *     new kity.Color('yellow'),
             *     new kity.Color('red'),
             *     function(target, value) {
             *         target.fill(value);
             *     });
             *
             * turnRed.start(rect, 300, 'ease', function() {
             *     console.log('I am red!');
             * });
             * ```
             */
                start: function(target, duration, easing, delay, callback) {
                    if (arguments.length === 2 && typeof duration == "object") {
                        easing = duration.easing;
                        delay = duration.delay;
                        callback = duration.callback;
                        duration = duration.duration;
                    }
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
                /**
             * @method create()
             * @for kity.Animator
             * @description 使用当前的动画器为指定目标创建时间线
             *
             * @grammar create(target, duration, easing, callback) => {kity.Timeline}
             *
             * @param  {object}            target   要创建的时间线的目标
             * @param  {Number|String}     duration 要创建的时间线的长度，如 300、"5s"、"0.5min"
             * @param  {String|Function}   easing   要创建的时间线的缓动函数，如 'ease'、'linear'、'swing'
             * @param  {Function}          callback 时间线播放结束之后的回调函数
             *
             * @example
             *
             * ```js
             * var expand = new kity.Animator({
             *     beginValue: function(target) {
             *         return target.getBox();
             *     },
             *     finishValue: function(target) {
             *         return target.getBox().expand(100, 100, 100, 100);
             *     },
             *     setter: function(target, value) {
             *         target.setBox(value)
             *     }
             * });
             *
             * var timeline = expand.create(rect, 300);
             * timeline.repeat(3).play();
             * ```
             */
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
                /**
             * @method reverse()
             * @for kity.Animator
             * @grammar reverse() => {kity.Animator}
             * @description 创建一个与当前动画器相反的动画器
             *
             * @example
             *
             * ```js
             * var turnYellow = turnRed.reverse();
             * ```
             */
                reverse: function() {
                    return new Animator(this.finishValue, this.beginValue, this.setter);
                }
            });
            Animator.DEFAULT_DURATION = 300;
            Animator.DEFAULT_EASING = "linear";
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
                /**
             * @method animate()
             * @for kity.Shape
             * @description 在图形上播放使用指定的动画器播放动画，如果图形当前有动画正在播放，则会加入播放队列
             *
             * @grammar animate(animator, duration, easing, delay, callback)
             *
             * @param  {object}            animator 播放动画使用的动画器
             * @param  {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param  {Number|String}     delay    动画播放前的延时
             * @param  {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param  {Function}          callback 播放结束之后的回调函数
             *
             * @example
             *
             * ```js
             * rect.animate(turnRed, 300); // turnRect 是一个动画器
             * rect.animate(expand, 500);  // turnRect 播放结束后播放 expand
             * ```
             */
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
                /**
             * @method timeline()
             * @for kity.Shape
             * @description 获得当前正在播放的动画的时间线
             *
             * @grammar timeline() => {kity.Timeline}
             *
             * @example
             *
             * ```js
             * rect.timeline().repeat(2);
             * ```
             */
                timeline: function() {
                    return this._KityAnimateQueue[0].t;
                },
                /**
             * @method stop()
             * @for kity.Shape
             * @description 停止当前正在播放的动画
             *
             * @grammar stop() => {this}
             *
             * @example
             *
             * ```js
             * rect.stop(); // 停止 rect 上的动画
             * ```
             */
                stop: function() {
                    var queue = this._KityAnimateQueue;
                    if (queue) {
                        while (queue.length) {
                            queue.shift().t.stop();
                        }
                    }
                    return this;
                }
            });
            return Animator;
        }
    };

    //src/animate/easing.js
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
    _p[1] = {
        value: function(require, exports, module) {
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
                    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
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
                    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
                },
                easeInOutElastic: function(t, b, c, d) {
                    var s = 1.70158;
                    var p = 0;
                    var a = c;
                    if (t === 0) return b;
                    if ((t /= d / 2) == 2) return b + c;
                    if (!p) p = d * (.3 * 1.5);
                    if (a < Math.abs(c)) {
                        a = c;
                        var s = p / 4;
                    } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
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
                    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
                    return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
                },
                easeInBounce: function(t, b, c, d) {
                    return c - easings.easeOutBounce(d - t, 0, c, d) + b;
                },
                easeOutBounce: function(t, b, c, d) {
                    if ((t /= d) < 1 / 2.75) {
                        return c * (7.5625 * t * t) + b;
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
        }
    };

    /*
     *
     * TERMS OF USE - EASING EQUATIONS
     *
     * Open source under the BSD License.
     *
     * Copyright © 2001 Robert Penner
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     * Redistributions of source code must retain the above copyright notice, this list of
     * conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright notice, this list
     * of conditions and the following disclaimer in the documentation and/or other materials
     * provided with the distribution.
     *
     * Neither the name of the author nor the names of contributors may be used to endorse
     * or promote products derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
     * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
     *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
     * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     * OF THE POSSIBILITY OF SUCH DAMAGE.
     *
     */
    //src/animate/frame.js
    /**
     * @fileOverview
     *
     * 提供动画帧的基本支持
     */
    _p[2] = {
        value: function(require, exports) {
            // 原生动画帧方法 polyfill
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(fn) {
                return setTimeout(fn, 1e3 / 60);
            };
            var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;
            // 上一个请求的原生动画帧 id
            var frameRequestId;
            // 等待执行的帧动作的集合，这些帧的方法将在下个原生动画帧同步执行
            var pendingFrames = [];
            /**
         * 添加一个帧到等待集合中
         *
         * 如果添加的帧是序列的第一个，至少有一个帧需要被执行，则会请求一个原生动画帧来执行
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
         * @method kity.requestFrame
         * @catalog animate
         * @grammar kity.requestFrame(action) => {frame}
         * @description 请求一个帧，执行指定的动作。动作回调提供一些有用的信息
         *
         * @param {Function} action
         *
         *     要执行的动作，该动作回调有一个参数 frame，其中：
         *
         *     frame.time {Number}
         *         动作执行时的时间戳（ms）
         *
         *     frame.index {Number}
         *         当前执行的帧的编号（首帧为 0）
         *
         *     frame.dur {Number}
         *         上一帧至当前帧经过的时间，单位 ms
         *
         *     frame.elapsed {Number}
         *         从首帧开始到当前帧经过的时间，单位 ms
         *
         *     frame.action {Number}
         *         指向当前的帧处理函数
         *
         *     frame.next()
         *         表示下一帧继续执行。如果不调用该方法，将不会执行下一帧。
         *
         * @example
         *
         * ```js
         * kity.requestFrame(function(frame) {
         *     console.log('平均帧率:' + frame.elapsed / (frame.index + 1));
         *
         *     // 更新或渲染动作
         *
         *     frame.next(); //继续执行下一帧
         * });
         * ```
         */
            function requestFrame(action) {
                var frame = initFrame(action);
                pushFrame(frame);
                return frame;
            }
            /**
         * @method kity.releaseFrame
         * @catalog animate
         * @grammar kity.releaseFrame(frame)
         * @description 释放一个已经请求过的帧，如果该帧在等待集合里，将移除，下个动画帧不会执行释放的帧
         *
         * @param {frame} frame 使用 kity.requestFrame() 返回的帧
         *
         * @example
         *
         * ```js
         * var frame = kity.requestFrame(function() {....});
         * kity.releaseFrame(frame);
         * ```
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
        }
    };

    //src/animate/motionanimator.js
    /**
     * @fileOverview
     *
     * 路径动画器，可以让一个物体沿着某个轨迹运动
     */
    _p[3] = {
        value: function(require) {
            var Animator = _p.r(0);
            var g = _p.r(35);
            var Path = _p.r(47);
            var Shape = _p.r(61);
            /**
         * @class kity.MotionAnimator
         * @catalog animate
         * @base kity.Animator
         * @description 路径动画器，可以让一个物体沿着某个轨迹运动
         *
         * @example
         *
         * ```js
         * var motionAnimator = new MotionAnimator('M0,0C100,0,100,0,100,100L200,200');
         * motionAnimator.start(rect, 3000);
         * ```
         */
            var MotionAnimator = _p.r(11).createClass("MotionAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.MotionAnimator
             * @grammar new kity.MotionAnimator(path, doRotate)
             * @param {kity.Path|String|PathSegment} path 运动的轨迹，或者是 kity.Path 对象
             * @param {boolean} doRotate 是否让运动的目标沿着路径的切线方向旋转
             */
                constructor: function(path, doRotate) {
                    var me = this;
                    this.callBase({
                        beginValue: 0,
                        finishValue: 1,
                        setter: function(target, value) {
                            var path = me.motionPath instanceof Path ? me.motionPath.getPathData() : me.motionPath;
                            var point = g.pointAtPath(path, value);
                            target.setTranslate(point.x, point.y);
                            if (this.doRotate) target.setRotate(point.tan.getAngle());
                        }
                    });
                    /**
                 * @property doRotate
                 * @for kity.MotionAnimator
                 * @type {boolean}
                 * @description 是否让运动的目标沿着路径的切线方向旋转
                 *
                 * @example
                 *
                 * ```js
                 * motionAnimator.doRotate = true; // 目标沿着切线方向旋转
                 * ```
                 */
                    this.doRotate = doRotate;
                    /**
                 * @property motionPath
                 * @for kity.MotionAnimator
                 * @type  {kity.Path|String|PathSegment}
                 * @description 运动沿着的路径，可以在动画过程中更新
                 */
                    this.motionPath = path;
                }
            });
            _p.r(11).extendClass(Shape, {
                /**
             * @method motion()
             * @catalog animate
             * @for kity.Shape
             * @description 让图形沿着指定的路径运动
             *
             * @grammar motion(path, duration, easing, delay, callback) => this
             *
             * @param {kity.Path|String|PathSegment} path 运动的轨迹，或者是 kity.Path 对象
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                motion: function(path, duration, easing, delay, callback) {
                    return this.animate(new MotionAnimator(path), duration, easing, delay, callback);
                }
            });
            return MotionAnimator;
        }
    };

    //src/animate/opacityanimator.js
    /**
     * @fileOverview
     *
     * 透明度动画器，让图形动画过度到指定的透明度。
     */
    _p[4] = {
        value: function(require) {
            var Animator = _p.r(0);
            /**
         * @class kity.OpacityAnimator
         * @catalog animate
         * @base kity.Animator
         * @description 透明度动画器，让图形动画过度到指定的透明度
         */
            var OpacityAnimator = _p.r(11).createClass("OpacityAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.OpacityAnimator
             * @grammar new kity.OpacityAnimator(opacity)
             *
             * @param  {Number} opacity 目标透明度，取值范围 0 - 1
             */
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
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
                /**
             * @method fxOpacity()
             * @catalog animate
             * @for kity.Shape
             * @description 让图形的透明度以动画的形式过渡到指定的值
             *
             * @grammar fxOpacity(opacity, duration, easing, delay, callback) => {this}
             *
             * @param {Number}            opacity  动画的目标透明度
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fxOpacity: function(opacity, duration, easing, delay, callback) {
                    return this.animate(new OpacityAnimator(opacity), duration, easing, delay, callback);
                },
                /**
             * @method fadeTo()
             * @catalog animate
             * @for kity.Shape
             * @description 让图形的透明度以动画的形式过渡到指定的值
             *
             * @grammar fadeTo(opacity, duration, easing, delay, callback) => {this}
             *
             * @param {Number}            opacity  动画的目标透明度
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fadeTo: function() {
                    return this.fxOpacity.apply(this, arguments);
                },
                /**
             * @method fadeIn()
             * @catalog animate
             * @for kity.Shape
             * @description 让图形淡入
             *
             * @grammar fadeIn(duration, easing, delay, callback) => {this}
             *
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fadeIn: function() {
                    return this.fxOpacity.apply(this, [ 1 ].concat([].slice.call(arguments)));
                },
                /**
             * @method fadeOut()
             * @catalog animate
             * @for kity.Shape
             * @description 让图形淡出
             *
             * @grammar fadeIn(duration, easing, delay, callback) => {this}
             *
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fadeOut: function() {
                    return this.fxOpacity.apply(this, [ 0 ].concat([].slice.call(arguments)));
                }
            });
            return OpacityAnimator;
        }
    };

    //src/animate/pathanimator.js
    /**
     * @fileOverview
     *
     * 路径补间动画器，让图形从一个形状变为另一个形状
     */
    _p[5] = {
        value: function(require) {
            var Animator = _p.r(0);
            var g = _p.r(35);
            /**
         * @catalog animate
         *
         * @class kity.PathAnimator
         * @base kity.Animator
         * @description 路径补间动画器，让图形从一个形状变为另一个形状
         *
         * @example
         *
         * ```js
         * var path = new kity.Path('M0,0L0,100');
         * var pa = new kity.PathAnimator('M0,0C100,0,100,0,100,100');
         * pa.start(path, 300);
         * ```
         */
            var PathAnimator = _p.r(11).createClass("OpacityAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.PathAnimator
             *
             * @grammar new kity.Path.Animator(path)
             *
             * @param  {String|PathSegment} path 目标形状的路径数据
             *
             */
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
            var Path = _p.r(47);
            _p.r(11).extendClass(Path, {
                /**
             * @catalog animate
             *
             * @method fxPath()
             * @for kity.Shape
             * @description 以动画的形式把路径变换为新路径
             *
             * @grammar fxPath(path, duration, easing, delay, callback) => {this}
             *
             * @param {String|PathSegment}   path     要变换新路径
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fxPath: function(path, duration, easing, delay, callback) {
                    return this.animate(new PathAnimator(path), duration, easing, delay, callback);
                }
            });
            return PathAnimator;
        }
    };

    //src/animate/rotateanimator.js
    /**
     * @fileOverview
     *
     * 提供支持目标旋转的动画器
     */
    _p[6] = {
        value: function(require) {
            var Animator = _p.r(0);
            /**
         * @class kity.RotateAnimator
         * @base Animator
         * @description 提供支持目标旋转的动画器
         */
            var RotateAnimator = _p.r(11).createClass("RotateAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.RotateAnimator
             *
             * @grammar new kity.RotateAnimator(deg, ax, ay)
             *
             * @param  {Number} deg 要旋转的角度
             */
                constructor: function(deg) {
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
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
                /**
             * @method fxRotate()
             * @for kity.Shape
             * @description 让目标以动画旋转指定的角度
             *
             * @grammar fxRotate(deg, duration, easing, delay) => {this}
             *
             * @param {Number}            deg      要旋转的角度
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fxRotate: function(deg, duration, easing, delay, callback) {
                    return this.animate(new RotateAnimator(deg), duration, easing, delay, callback);
                }
            });
            return RotateAnimator;
        }
    };

    //src/animate/scaleanimator.js
    /**
     * @fileOverview
     *
     * 提供支持目标缩放的动画器
     */
    _p[7] = {
        value: function(require) {
            var Animator = _p.r(0);
            /**
         * @class kity.ScaleAnimator
         * @base kity.Animator
         * @description 提供支持目标缩放的动画器
         */
            var ScaleAnimator = _p.r(11).createClass("ScaleAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.ScaleAnimator
             *
             * @grammar new kity.ScaleAnimator(sx, sy)
             * @param  {Number} sx x 轴的缩放比例
             * @param  {Number} sy y 轴的缩放比例
             */
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
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
                /**
             * @method fxScale
             * @for kity.Shape
             * @description 动画缩放当前的图形
             *
             * @grammar fxScale(sx, sy, duration, easing, delay, callback) => {this}
             *
             * @param {Number} sx x 轴的缩放比例
             * @param {Number} sy y 轴的缩放比例
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fxScale: function(sx, sy, duration, easing, delay, callback) {
                    return this.animate(new ScaleAnimator(sx, sy), duration, easing, delay, callback);
                }
            });
            return ScaleAnimator;
        }
    };

    //src/animate/timeline.js
    /**
     * @fileOverview
     *
     * 动画时间线的实现
     */
    _p[8] = {
        value: function(require) {
            var EventHandler = _p.r(34);
            var frame = _p.r(2);
            var utils = _p.r(12);
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
            /**
         * @class kity.Timeline
         * @catalog animate
         * @mixins EventHandler
         * @description 动画时间线
         */
            var Timeline = _p.r(11).createClass("Timeline", {
                mixins: [ EventHandler ],
                /**
             * @constructor
             * @for kity.Timeline
             * @private
             * @description 时间线应该由动画器进行构造，不应手动创建
             *
             */
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
                /**
             * @private
             *
             * 让时间线进入下一帧
             */
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
                /**
             * @method getPlayTime()
             * @for kity.Timeline
             * @grammar getPlayTime() => {Number}
             * @description 获得当前播放的时间，取值区间为 [0, duration]
             */
                getPlayTime: function() {
                    return this.rollbacking ? this.duration - this.time : this.time;
                },
                /**
             * @method getTimeProportion()
             * @for kity.Timeline
             * @grammar getTimeProportion() => {Number}
             * @description 获得当前播放时间的比例，取值区间为 [0, 1]
             */
                getTimeProportion: function() {
                    return this.getPlayTime() / this.duration;
                },
                /**
             * @method getValueProportion()
             * @for kity.Timeline
             * @grammar getValueProportion() => {Number}
             * @description 获得当前播放时间对应值的比例，取值区间为 [0, 1]；该值实际上是时间比例值经过缓动函数计算之后的值。
             */
                getValueProportion: function() {
                    return this.easing(this.getPlayTime(), 0, 1, this.duration);
                },
                /**
             * @method getValue()
             * @for kity.Timeline
             * @grammar getValue() => {any}
             * @description 返回当前播放时间对应的值。
             */
                getValue: function() {
                    var b = this.beginValue;
                    var f = this.finishValue;
                    var p = this.getValueProportion();
                    return getPercentValue(b, f, p);
                },
                /**
             * @private
             *
             * 把值通过动画器的 setter 设置到目标上
             */
                setValue: function(value) {
                    this.lastValue = this.currentValue;
                    this.currentValue = value;
                    this.setter.call(this.target, this.target, value, this);
                },
                /**
             * @method getDelta()
             * @for kity.Timeline
             * @grammar getDelta() => {any}
             * @description 返回当前值和上一帧的值的差值
             */
                getDelta: function() {
                    this.lastValue = this.lastValue === undefined ? this.beginValue : this.lastValue;
                    return getDelta(this.lastValue, this.currentValue);
                },
                /**
             * @method play()
             * @for kity.Timeline
             * @grammar play() => {this}
             * @description 让时间线播放，如果时间线还没开始，或者已停止、已结束，则重头播放；如果是已暂停，从暂停的位置继续播放
             */
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
                    /**
                 * @event play
                 * @for kity.Timeline
                 * @description 在时间线播放后触发
                 *
                 * @param {String} event.lastStatus
                 *        表示播放前的上一个状态，可能取值为 'ready'、'finished'、'stoped'、'paused'
                 */
                    this.fire("play", new TimelineEvent(this, "play", {
                        lastStatus: lastStatus
                    }));
                    return this;
                },
                /**
             * @method pause()
             * @for kity.Timeline
             * @description 暂停当前的时间线
             *
             * @grammar pause() => {this}
             */
                pause: function() {
                    this.status = "paused";
                    /**
                 * @event pause
                 * @for kity.Timeline
                 * @description 暂停事件，在时间线暂停时触发
                 */
                    this.fire("pause", new TimelineEvent(this, "pause"));
                    frame.releaseFrame(this.frame);
                    return this;
                },
                /**
             * @method stop()
             * @for kity.Timeline
             * @description 停止当前时间线
             *
             * @grammar stop() => {this}
             */
                stop: function() {
                    this.status = "stoped";
                    this.setValue(this.finishValue);
                    this.rollbacking = false;
                    /**
                 * @event stop
                 * @for kity.Timeline
                 * @description 停止时间，在时间线停止时触发
                 */
                    this.fire("stop", new TimelineEvent(this, "stop"));
                    frame.releaseFrame(this.frame);
                    return this;
                },
                /**
             * @private
             *
             * 播放结束之后的处理
             */
                timeUp: function() {
                    if (this.repeatOption) {
                        this.time = 0;
                        if (this.rollback) {
                            if (this.rollbacking) {
                                this.decreaseRepeat();
                                this.rollbacking = false;
                            } else {
                                this.rollbacking = true;
                                /**
                             * @event rollback
                             * @for kity.Timeline
                             * @description 回滚事件，在时间线回滚播放开始的时候触发
                             */
                                this.fire("rollback", new TimelineEvent(this, "rollback"));
                            }
                        } else {
                            this.decreaseRepeat();
                        }
                        if (!this.repeatOption) {
                            this.finish();
                        } else {
                            /**
                         * @event repeat
                         * @for kity.Timeline
                         * @description 循环事件，在时间线循环播放开始的时候触发
                         */
                            this.fire("repeat", new TimelineEvent(this, "repeat"));
                        }
                    } else {
                        this.finish();
                    }
                },
                /**
             * @private
             *
             * 决定播放结束的处理
             */
                finish: function() {
                    this.setValue(this.finishValue);
                    this.status = "finished";
                    /**
                 * @event finish
                 * @for kity.Timeline
                 * @description 结束事件，在时间线播放结束后触发（包括重复和回滚都结束）
                 */
                    this.fire("finish", new TimelineEvent(this, "finish"));
                    frame.releaseFrame(this.frame);
                },
                /**
             * @private
             *
             *  循环次数递减
             */
                decreaseRepeat: function() {
                    if (this.repeatOption !== true) {
                        this.repeatOption--;
                    }
                },
                /**
             * @method repeat()
             * @for kity.Timeline
             * @description 设置时间线的重复选项
             *
             * @grammar repeat(repeat, rollback) => {this}
             *
             * @param  {Number|Boolean} repeat
             *     是否重复播放，设置为 true 无限循环播放，设置数值则循环指定的次数
             * @param  {Boolean} rollback
             *     指示是否要回滚播放。
             *     如果设置为真，一次事件到 duration 则一个来回算一次循环次数，否则播放完成一次算一次循环次数
             *
             */
                repeat: function(repeat, rollback) {
                    this.repeatOption = repeat;
                    this.rollback = rollback;
                    return this;
                }
            });
            Timeline.requestFrame = frame.requestFrame;
            Timeline.releaseFrame = frame.releaseFrame;
            return Timeline;
        }
    };

    //src/animate/translateanimator.js
    /**
     * @fileOverview
     *
     * 提供让图形移动的动画器
     */
    _p[9] = {
        value: function(require) {
            var Animator = _p.r(0);
            /**
         * @class kity.TranslateAnimator
         * @base kity.Animator
         * @description 提供让图形移动的动画器
         */
            var TranslateAnimator = _p.r(11).createClass("TranslateAnimator", {
                base: Animator,
                /**
             * @constructor
             * @for kity.TranslateAnimator
             * @grammar new kity.TranslateAnimator(x, y)
             * @param  {Number} x x 方向上需要移动的距离
             * @param  {Number} y y 方向上需要移动的距离
             */
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
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
                /**
             * @method fxTranslate()
             * @for kity.Shape
             * @description 让目标以动画平移指定的距离
             *
             * @grammar fxTranslate(x, y, duration, easing, delay, callback) => {this}
             *
             * @param {Number} x x 方向上需要移动的距离
             * @param {Number} y y 方向上需要移动的距离
             * @param {Number|String}     duration 动画的播放长度，如 300、"5s"、"0.5min"
             * @param {Number|String}     delay    动画播放前的延时
             * @param {String|Function}   easing   动画播放使用的缓动函数，如 'ease'、'linear'、'swing'
             * @param {Function}          callback 播放结束之后的回调函数
             */
                fxTranslate: function(x, y, duration, easing, delay, callback) {
                    return this.animate(new TranslateAnimator(x, y), duration, easing, delay, callback);
                }
            });
            return TranslateAnimator;
        }
    };

    //src/core/browser.js
    /**
     * @fileOverview
     *
     * 提供浏览器判断的一些字段
     */
    _p[10] = {
        value: function() {
            /**
         * @class kity.Browser
         * @catalog core
         * @static
         * @description 提供浏览器信息
         */
            var browser = function() {
                var agent = navigator.userAgent.toLowerCase(), opera = window.opera, browser;
                // 浏览器对象
                browser = {
                    /**
                 * @property ie
                 * @for kity.Browser
                 * @description 判断是否为 IE 浏览器
                 * @type {boolean}
                 */
                    ie: /(msie\s|trident.*rv:)([\w.]+)/.test(agent),
                    /**
                 * @property opera
                 * @for kity.Browser
                 * @description 判断是否为 Opera 浏览器
                 * @type {boolean}
                 */
                    opera: !!opera && opera.version,
                    /**
                 * @property webkit
                 * @for kity.Browser
                 * @description 判断是否为 Webkit 内核的浏览器
                 * @type {boolean}
                 */
                    webkit: agent.indexOf(" applewebkit/") > -1,
                    /**
                 * @property mac
                 * @for kity.Browser
                 * @description 判断是否为 Mac 下的浏览器
                 * @type {boolean}
                 */
                    mac: agent.indexOf("macintosh") > -1
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
                    /**
                 * @property chrome
                 * @for kity.Browser
                 * @description 判断是否为 Chrome 浏览器
                 * @type {boolean}
                 */
                    browser.chrome = +RegExp["$1"];
                }
                if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
                    browser.safari = +(RegExp["$1"] || RegExp["$2"]);
                }
                // Opera 9.50+
                if (browser.opera) version = parseFloat(opera.version());
                // WebKit 522+ (Safari 3+)
                if (browser.webkit) version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
                /**
             * @property version
             * @for kity.Browser
             * @description 获取当前浏览器的版本
             * @type {Number}
             */
                browser.version = version;
                browser.isCompatible = !browser.mobile && (browser.ie && version >= 6 || browser.gecko && version >= 10801 || browser.opera && version >= 9.5 || browser.air && version >= 1 || browser.webkit && version >= 522 || false);
                return browser;
            }();
            return browser;
        }
    };

    //src/core/class.js
    /**
     * @fileOverview
     *
     * 提供 Kity 的 OOP 支持
     */
    _p[11] = {
        value: function(require, exports) {
            // just to bind context
            Function.prototype.bind = Function.prototype.bind || function(thisObj) {
                var args = Array.prototype.slice.call(arguments, 1);
                return this.apply(thisObj, args);
            };
            /**
         * @class kity.Class
         * @catalog core
         * @description 所有 kity 类的基类
         * @abstract
         */
            function Class() {}
            exports.Class = Class;
            Class.__KityClassName = "Class";
            /**
         * @method base()
         * @for kity.Class
         * @protected
         * @grammar base(name, args...) => {any}
         * @description 调用父类指定名称的函数
         * @param {string} name 函数的名称
         * @param {parameter} args... 传递给父类函数的参数
         *
         * @example
         *
         * ```js
         * var Person = kity.createClass('Person', {
         *     toString: function() {
         *         return 'I am a person';
         *     }
         * });
         *
         * var Male = kity.createClass('Male', {
         *     base: Person,
         *
         *     toString: function() {
         *         return 'I am a man';
         *     },
         *
         *     speak: function() {
         *         return this.base('toString') + ',' + this.toString();
         *     }
         * })
         * ```
         */
            Class.prototype.base = function(name) {
                var caller = arguments.callee.caller;
                var method = caller.__KityMethodClass.__KityBaseClass.prototype[name];
                return method.apply(this, Array.prototype.slice.call(arguments, 1));
            };
            /**
         * @method callBase()
         * @for kity.Class
         * @protected
         * @grammar callBase(args...) => {any}
         * @description 调用父类同名函数
         * @param {parameter} args... 传递到父类同名函数的参数
         *
         * @example
         *
         * ```js
         * var Animal = kity.createClass('Animal', {
         *     constructor: function(name) {
         *         this.name = name;
         *     },
         *     toString: function() {
         *         return 'I am an animal name ' + this.name;
         *     }
         * });
         *
         * var Dog = kity.createClass('Dog', {
         *     constructor: function(name) {
         *         this.callBase(name);
         *     },
         *     toString: function() {
         *         return this.callBase() + ', a dog';
         *     }
         * });
         *
         * var dog = new Dog('Dummy');
         * console.log(dog.toString()); // "I am an animal name Dummy, a dog";
         * ```
         */
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
            /**
         * @method pipe()
         * @for kity.Class
         * @grammar pipe() => {this}
         * @description 以当前对象为上线文以及管道函数的第一个参数，执行一个管道函数
         * @param  {Function} fn 进行管道操作的函数
         *
         * @example
         *
         * ```js
         * var rect = new kity.Rect().pipe(function() {
         *     this.setWidth(500);
         *     this.setHeight(300);
         * });
         * ```
         */
            Class.prototype.pipe = function(fn) {
                if (typeof fn == "function") {
                    fn.call(this, this);
                }
                return this;
            };
            /**
         * @method getType()
         * @for kity.Class
         * @grammar getType() => {string}
         * @description 获得对象的类型
         *
         * @example
         *
         * ```js
         * var rect = new kity.Rect();
         * var circle = new kity.Circle();
         *
         * console.log(rect.getType()); // "Rect"
         * console.log(rect.getType()); // "Circle"
         * ```
         */
            Class.prototype.getType = function() {
                return this.__KityClassName;
            };
            /**
         * @method getClass()
         * @for kity.Class
         * @grammar getClass() => {Class}
         * @description 获得对象的类
         *
         * @example
         *
         * ```js
         * var rect = new kity.Rect();
         *
         * console.log(rect.getClass() === kity.Rect); // true
         * console.log(rect instanceof kity.Rect); // true
         * ```
         */
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
            /**
         * @method kity.createClass()
         * @grammar kity.createClass(classname, defines) => {Class}
         * @description 创建一个类
         * @param  {string} classname 类名，用于调试的时候查看，可选
         * @param  {object} defines   类定义
         *      defines.base {Class}
         *          定义的类的基类，如果不配置，则表示基类为 kity.Class
         *      defines.mixins {Class[]}
         *          定义的类要融合的类列表
         *      defines.constructor {Function}
         *          定义类的构造函数，如果父类显式定义了构造函数，需要在构造函数中使用 callBase() 方法调用父类的构造函数
         *      defines.* {Function}
         *          定义类的其它函数
         *
         * @example 创建一个类
         *
         * ```js
         * var Animal = kity.createClass('Animal', {
         *     constructor: function(name) {
         *         this.name = name;
         *     },
         *     toString: function() {
         *         return this.name;
         *     }
         * });
         *
         * var a = new Animal('kity');
         * console.log(a.toString()); // "kity"
         * ```
         *
         * @example 继承一个类
         *
         * ```js
         * var Cat = kity.createClass('Cat', {
         *     base: Animal,
         *     constructor: function(name, color) {
         *         // 调用父类构造函数
         *         this.callBase(name);
         *     },
         *     toString: function() {
         *         return 'A ' + this.color + ' cat, ' + this.callBase();
         *     }
         * });
         *
         * var cat = new Cat('kity', 'black');
         * console.log(cat.toString()); // "A black cat, kity"
         * ```
         *
         * @example 混合类的能力
         * ```js
         * var Walkable = kity.createClass('Walkable', {
         *     constructor: function() {
         *         this.speed = 'fast';
         *     },
         *     walk: function() {
         *         console.log('I am walking ' + this.speed);
         *     }
         * });
         *
         * var Dog = kity.createClass('Dog', {
         *     base: Animal,
         *     mixins: [Walkable],
         *     constructor: function(name) {
         *         this.callBase(name);
         *         this.callMixins();
         *     }
         * });
         *
         * var dog = new Dog('doggy');
         * console.log(dog.toString() + ' say:');
         * dog.walk();
         * ```
         */
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
            /**
         * @method kity.extendClass()
         * @grammar kity.extendClass(clazz, extension) => {Class}
         * @description 拓展一个已有的类
         *
         * @example
         *
         * ```js
         * kity.extendClass(Dog, {
         *     spark: function() {
         *         console.log('wao wao wao!');
         *     }
         * });
         *
         * new Dog().spark(); // "wao wao wao!";
         * ```
         */
            exports.extendClass = extend;
        }
    };

    //src/core/utils.js
    /**
     * @fileOverview
     *
     * 一些常用的工具方法
     */
    _p[12] = {
        value: function() {
            /**
         * @class kity.Utils
         * @catalog core
         * @static
         * @description 提供常用的工具方法
         */
            var utils = {
                /**
             * @method each()
             * @for kity.Utils
             * @grammar each(obj, interator, context)
             * @param  {Object|Array} obj 要迭代的对象或数组
             * @param  {Function} iterator 迭代函数
             * @param  {Any} context  迭代函数的上下文
             *
             * @example 迭代数组
             *
             * ```js
             * kity.Utils.each([1, 2, 3, 4, 5], function(value, index, array) {
             *     console.log(value, index);
             * });
             * // 1, 0
             * // 2, 1
             * // 3, 2
             * // 4, 3
             * // 5, 4
             * ```
             *
             * @example 迭代对象
             *
             * ```js
             * var obj = {
             *     name: 'kity',
             *     version: '1.2.1'
             * };
             * var param = [];
             * kity.Utils.each(obj, function(value, key, obj) {
             *     param.push(key + '=' + value);
             * });
             * console.log(param.join('&')); // "name=kity&version=1.2.1"
             * ```
             */
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
                /**
             * @method extend()
             * @for kity.Utils
             * @grammar extend(target, sources..., notCover) => {object}
             * @description 把源对象的属性合并到目标对象上
             * @param {object} target 目标对象
             * @param {parameter} sources 源对象
             * @param {boolean} notCover 是否不要覆盖源对象已有的属性
             *
             * @example
             *
             * ```js
             * var a = {
             *     key1: 'a1',
             *     key2: 'a2'
             * };
             *
             * var b = {
             *     key2: 'b2',
             *     key3: 'b3'
             * };
             *
             * var c = {
             *     key4: 'c4'
             * };
             *
             * var d = kity.extend(a, b, c);
             *
             * console.log(d === a); // true
             * console.log(a); // {key1: 'a1', key2: 'b2', key3: 'b3', key4: 'c4'}
             * ```
             */
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
                /**
             * @method deepExtend()
             * @for kity.Utils
             * @grammar deepExtend(target, sources..., notCover)
             * @description 把源对象的属性合并到目标对象上，如果属性是对象，会递归合并
             * @param {object} target 目标对象
             * @param {parameter} sources 源对象
             * @param {boolean} notCover 是否不要覆盖源对象已有的属性
             */
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
                /**
             * @method clone()
             * @for kity.Utils
             * @grammar clone(obj) => {object}
             * @description 返回一个对象的克隆副本（非深度复制）
             * @param  {object} obj 要克隆的对象
             *
             * @example
             *
             * ```js
             * var source = {
             *     key1: {
             *         key2: 'value2'
             *     },
             *     key3: 'value3'
             * };
             *
             * var target = kity.Utils.clone(source);
             *
             * console.log(target === source); // false
             * console.log(target.key1 === source.key1); // true
             * console.log(target.key3 === source.key3); // true
             * ```
             */
                clone: function(obj) {
                    var cloned = {};
                    for (var m in obj) {
                        if (obj.hasOwnProperty(m)) {
                            cloned[m] = obj[m];
                        }
                    }
                    return cloned;
                },
                /**
             * @method copy()
             * @for kity.Utils
             * @grammar copy(obj) => {object}
             * @description 返回一个对象的拷贝副本（深度复制）
             * @param  {object} obj 要拷贝的对象
             *
             * @example
             *
             * ```js
             * var source = {
             *     key1: {
             *         key2: 'value2'
             *     },
             *     key3: 'value3'
             * };
             *
             * var target = kity.Utils.copy(source);
             *
             * console.log(target === source); // false
             * console.log(target.key1 === source.key1); // false
             * console.log(target.key3 === source.key3); // true，因为是值类型
             * ```
             */
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
                /**
             * @method flatten()
             * @for kity.Utils
             * @grammar flatten(arr) => {Array}
             * @description 返回给定数组的扁平化版本
             * @param  {Array} arr 要扁平化的数组
             *
             * @example
             *
             * ```js
             * var flattened = kity.Utils.flatten([[1, 2], [2, 3], [[4, 5], [6, 7]]]);
             * console.log(flattened); // [1, 2, 3, 4, 5, 6, 7];
             * ```
             */
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
             * @method paralle()
             * @for kity.Utils
             * @grammar paralle() => {Any}
             *
             * @description 平行地对 v1 和 v2 进行指定的操作
             *
             *    如果 v1 是数字，那么直接进行 op 操作
             *    如果 v1 是对象，那么返回一个对象，其元素是 v1 和 v2 同键值的每个元素平行地进行 op 操作的结果
             *    如果 v1 是数组，那么返回一个数组，其元素是 v1 和 v2 同索引的每个元素平行地进行 op 操作的结果
             *
             * @param  {Number|Object|Array} v1 第一个操作数
             * @param  {Number|Object|Array} v2 第二个操作数
             * @param  {Function} op 操作函数
             *
             *
             *
             * @example
             *
             * ```js
             * var a = {
             *     value1: 1,
             *     value2: 2,
             *     value3: [3, 4, 5]
             * };
             *
             * var b = {
             *     value1: 2,
             *     value2: 3,
             *     value3: [4, 5, 6]
             * };
             *
             * var c = kity.Utils.paralle(a, b, function(v1, v2) {
             *     return v1 + v2;
             * });
             *
             * console.log(c.value1); // 3
             * console.log(c.value2); // 5
             * console.log(c.value3); // [7, 9, 11]
             *
             * ```
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
            /**
         * @method isString()
         * @for kity.Utils
         * @grammar isString(unknown) => {boolean}
         * @description 判断一个值是否为字符串类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isFunction()
         * @for kity.Utils
         * @grammar isFunction(unknown) => {boolean}
         * @description 判断一个值是否为函数类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isArray()
         * @for kity.Utils
         * @grammar isArray(unknown) => {boolean}
         * @description 判断一个值是否为数组类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isNumber()
         * @for kity.Utils
         * @grammar isNumber(unknown) => {boolean}
         * @description 判断一个值是否为数字类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isRegExp()
         * @for kity.Utils
         * @grammar isRegExp(unknown) => {boolean}
         * @description 判断一个值是否为正则表达式类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isObject()
         * @for kity.Utils
         * @grammar isObject(unknown) => {boolean}
         * @description 判断一个值是否为对象类型
         * @param  {any} unknown 要判断的值
         */
            /**
         * @method isBoolean()
         * @for kity.Utils
         * @grammar isBoolean(unknown) => {boolean}
         * @description 判断一个值是否为布尔类型
         * @param  {any} unknown 要判断的值
         */
            utils.each([ "String", "Function", "Array", "Number", "RegExp", "Object", "Boolean" ], function(v) {
                utils["is" + v] = function(obj) {
                    return Object.prototype.toString.apply(obj) == "[object " + v + "]";
                };
            });
            return utils;
        }
    };

    //src/filter/effect/colormatrixeffect.js
    /**
     * 颜色矩阵运算效果封装
     */
    _p[13] = {
        value: function(require, exports, module) {
            var Effect = _p.r(16), Utils = _p.r(12);
            var ColorMatrixEffect = _p.r(11).createClass("ColorMatrixEffect", {
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
        }
    };

    //src/filter/effect/compositeeffect.js
    /**
     * 高斯模糊效果封装
     */
    _p[14] = {
        value: function(require, exports, module) {
            var Effect = _p.r(16), Utils = _p.r(12);
            var CompositeEffect = _p.r(11).createClass("CompositeEffect", {
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
        }
    };

    //src/filter/effect/convolvematrixeffect.js
    /**
     * 像素级别的矩阵卷积运算效果封装
     */
    _p[15] = {
        value: function(require, exports, module) {
            var Effect = _p.r(16), Utils = _p.r(12);
            var ConvolveMatrixEffect = _p.r(11).createClass("ConvolveMatrixEffect", {
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
        }
    };

    //src/filter/effect/effect.js
    /*
     * 效果类
     * 该类型的对象不存储任何内部属性， 所有操作都是针对该类对象所维护的节点进行的
     */
    _p[16] = {
        value: function(require, exports, module) {
            var svg = _p.r(68), Effect = _p.r(11).createClass("Effect", {
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
            _p.r(12).extend(Effect, {
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
        }
    };

    //src/filter/effect/gaussianblureffect.js
    /**
     * 高斯模糊效果封装
     */
    _p[17] = {
        value: function(require, exports, module) {
            var Effect = _p.r(16), Utils = _p.r(12);
            return _p.r(11).createClass("GaussianblurEffect", {
                base: Effect,
                constructor: function(stdDeviation, input) {
                    this.callBase(Effect.NAME_GAUSSIAN_BLUR);
                    this.set("stdDeviation", Utils.getValue(stdDeviation, 1));
                    this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
                }
            });
        }
    };

    //src/filter/effect/offseteffect.js
    /**
     * 偏移效果封装
     */
    _p[18] = {
        value: function(require, exports, module) {
            var Effect = _p.r(16), Utils = _p.r(12);
            return _p.r(11).createClass("OffsetEffect", {
                base: Effect,
                constructor: function(dx, dy, input) {
                    this.callBase(Effect.NAME_OFFSET);
                    this.set("dx", Utils.getValue(dx, 0));
                    this.set("dy", Utils.getValue(dy, 0));
                    this.set("in", Utils.getValue(input, Effect.INPUT_SOURCE_GRAPHIC));
                }
            });
        }
    };

    //src/filter/effectcontainer.js
    /*
     * Effect所用的container
     */
    _p[19] = {
        value: function(require) {
            return _p.r(11).createClass("EffectContainer", {
                base: _p.r(29),
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
        }
    };

    //src/filter/filter.js
    /**
     * Filter 基类
     */
    _p[20] = {
        value: function(require, exports, module) {
            var svg = _p.r(68);
            var Class = _p.r(11);
            var Filter = Class.createClass("Filter", {
                mixins: [ _p.r(19) ],
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
            var Shape = _p.r(61);
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
        }
    };

    //src/filter/gaussianblurfilter.js
    /*
     * 高斯模糊滤镜
     */
    _p[21] = {
        value: function(require, exports, module) {
            var GaussianblurEffect = _p.r(17);
            return _p.r(11).createClass("GaussianblurFilter", {
                base: _p.r(20),
                constructor: function(stdDeviation) {
                    this.callBase();
                    this.addEffect(new GaussianblurEffect(stdDeviation));
                }
            });
        }
    };

    //src/filter/projectionfilter.js
    /*
     * 投影滤镜
     */
    _p[22] = {
        value: function(require, exports, module) {
            var GaussianblurEffect = _p.r(17), Effect = _p.r(16), ColorMatrixEffect = _p.r(13), Color = _p.r(28), Utils = _p.r(12), CompositeEffect = _p.r(14), OffsetEffect = _p.r(18);
            return _p.r(11).createClass("ProjectionFilter", {
                base: _p.r(20),
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
        }
    };

    //src/graphic/bezier.js
    /**
     * @fileOverview
     *
     * 贝塞尔曲线
     */
    _p[23] = {
        value: function(require, exports, module) {
            /**
         * @class kity.Bezier
         * @mixins kity.PointContainer
         * @base kity.Path
         * @description 绘制和使用贝塞尔曲线。贝塞尔曲线作为一个贝塞尔点的容器，任何贝塞尔点的改变都会更改贝塞尔曲线的外观
         *
         * @example
         *
         * ```js
         * var bezier = new kity.Bezier([
         *     new kity.BezierPoint(0, 0).setForward(100, 0),
         *     new kity.BezierPoint(100, 100).setBackward(100, 0)
         * ]);
         * ```
         */
            return _p.r(11).createClass("Bezier", {
                mixins: [ _p.r(52) ],
                base: _p.r(47),
                /**
             * @constructor
             * @for kity.Bezier
             *
             * @grammar new kity.Bezier(bezierPoints)
             *
             * @param  {kity.BezierPoints[]} bezierPoints 贝塞尔点集合，每个元素应该是 {kity.BezierPoint} 类型
             */
                constructor: function(bezierPoints) {
                    this.callBase();
                    bezierPoints = bezierPoints || [];
                    this.changeable = true;
                    this.setBezierPoints(bezierPoints);
                },
                /**
             * @method getBezierPoints()
             * @for kity.Bezier
             * @description 返回当前贝塞尔曲线的贝塞尔点集合
             *
             * @grammar getBezierPoints() => {kity.BezierPoints[]}
             *
             */
                getBezierPoints: function() {
                    return this.getPoints();
                },
                /**
             * @method setBezierPoints()
             * @for kity.Bezier
             * @description 设置当前贝塞尔曲线的贝塞尔点集合
             *
             * @grammar setBeizerPoints(bezierPoints) => {this}
             *
             * @param {kity.BezierPoint[]} bezierPoints 贝塞尔点集合
             */
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
        }
    };

    //src/graphic/bezierpoint.js
    /**
     * @fileOverview
     *
     * 表示一个贝塞尔点
     */
    _p[24] = {
        value: function(require, exports, module) {
            var ShapePoint = _p.r(64);
            var Vector = _p.r(74);
            /**
         * @class kity.BezierPoint
         *
         * @description 表示一个贝塞尔点
         *              一个贝塞尔点由顶点坐标（曲线经过的点）、前方控制点、后方控制点表示
         */
            var BezierPoint = _p.r(11).createClass("BezierPoint", {
                /**
             * @constructor
             * @for kity.BezierPoint
             *
             * @description 创建一个具有默认顶点坐标的贝塞尔点，两个控制点的坐标和顶点一致
             *
             * @param  {Number}  x        顶点的 x 坐标
             * @param  {Number}  y        顶点的 y 坐标
             * @param  {Boolean} isSmooth 指示当前贝塞尔点是否光滑，光滑会约束顶点和两个控制点共线
             */
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
                /**
             * @method clone()
             * @for kity.BezierPoint
             * @description 返回贝塞尔点的一份拷贝
             *
             * @grammar clone() => {kity.BezierPoint}
             */
                clone: function() {
                    var newPoint = new BezierPoint(), tmp = null;
                    tmp = this.getVertex();
                    newPoint.setVertex(tmp.x, tmp.y);
                    tmp = this.getForward();
                    newPoint.setForward(tmp.x, tmp.y);
                    tmp = this.getBackward();
                    newPoint.setBackward(tmp.x, tmp.y);
                    newPoint.setSymReflaction(this.isSymReflaction);
                    newPoint.setSmooth(this.isSmooth());
                    return newPoint;
                },
                /**
             * @method setVertex()
             * @for kity.BezierPoint
             * @description 设置贝塞尔点的顶点坐标，注意，控制点的坐标不会跟着变化。希望控制点的坐标跟着变化，请用 moveTo() 方法
             *
             * @grammar setVertex(x, y) => {this}
             *
             * @param {Number} x 顶点的 x 坐标
             * @param {Number} y 顶点的 y 坐标
             */
                setVertex: function(x, y) {
                    this.vertex.setPoint(x, y);
                    this.update();
                    return this;
                },
                /**
             * @method moveTo()
             * @for kity.BezierPoint
             * @description 同步移动整个贝塞尔点，使顶点的移动到指定的坐标中。控制点的位置相对顶点坐标固定。
             *
             * @grammar moveTo() => {this}
             *
             * @param  {Number} x 顶点的目标 x 坐标
             * @param  {Number} y 顶点的目标 y 坐标
             *
             */
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
                /**
             * @method setForward()
             * @for kity.BezierPoint
             * @description 设置前方控制点的位置，如果贝塞尔点光滑，后方控制点会跟着联动
             *
             * @grammar setForward(x, y) => {this}
             *
             * @param {Number} x 前方控制点的 x 坐标
             * @param {Number} y 前方控制点的 y 坐标
             */
                setForward: function(x, y) {
                    this.forward.setPoint(x, y);
                    //更新后置点
                    if (this.smooth) {
                        this.updateAnother(this.forward, this.backward);
                    }
                    this.update();
                    this.lastControlPointSet = this.forward;
                    return this;
                },
                /**
             * @method setBackward()
             * @for kity.BezierPoint
             * @description 设置后方控制点的位置，如果贝塞尔点光滑，前方控制点会跟着联动
             *
             * @grammar setBackward(x, y) => {this}
             *
             * @param {Number} x 后方控制点的 x 坐标
             * @param {Number} y 后方控制点的 y 坐标
             */
                setBackward: function(x, y) {
                    this.backward.setPoint(x, y);
                    //更新前置点
                    if (this.smooth) {
                        this.updateAnother(this.backward, this.forward);
                    }
                    this.update();
                    this.lastControlPointSet = this.backward;
                    return this;
                },
                /**
             * @method setSymReflaction()
             * @for kity.BezierPoint
             * @description 设定是否镜像两个控制点的位置
             *
             * @grammar setSymReflaction(value) => {this}
             *
             * @param {boolean} value 如果设置为 true，且贝塞尔点光滑，两个控制点离顶点的距离相等
             */
                setSymReflaction: function(value) {
                    this.symReflaction = value;
                    if (this.smooth) this.setSmooth(true);
                    return this;
                },
                /**
             * @method isSymReflaction()
             * @for kity.BezierPoint
             * @description 当前贝塞尔点的两个控制点是否被镜像约束
             *
             * @grammar isSymReflaction() => {boolean}
             */
                isSymReflaction: function() {
                    return this.symReflaction;
                },
                /**
             * @private
             *
             * 根据前方控制点或后方控制点更新另一方
             */
                updateAnother: function(p, q) {
                    var v = this.getVertex(), pv = Vector.fromPoints(p.getPoint(), v), vq = Vector.fromPoints(v, q.getPoint());
                    vq = pv.normalize(this.isSymReflaction() ? pv.length() : vq.length());
                    q.setPoint(v.x + vq.x, v.y + vq.y);
                    return this;
                },
                /**
             * @method setSmooth()
             * @for kity.BezierPoint
             * @description 设置贝塞尔点是否光滑，光滑会约束顶点和两个控制点共线
             *
             * @param {Boolean} isSmooth 设置为 true 让贝塞尔点光滑
             */
                setSmooth: function(isSmooth) {
                    var lc;
                    this.smooth = !!isSmooth;
                    if (this.smooth && (lc = this.lastControlPointSet)) {
                        this.updateAnother(lc, lc == this.forward ? this.backward : this.forward);
                    }
                    return this;
                },
                /**
             * @method isSmooth()
             * @for kity.BezierPoint
             * @description 判断贝塞尔点是否光滑
             *
             * @grammar isSmooth() => {boolean}
             */
                isSmooth: function() {
                    return this.smooth;
                },
                /**
             * @method getVertex()
             * @for kity.BezierPoint
             * @description 获得当前贝塞尔点的顶点
             *
             * @grammar getVertex() => {kity.ShapePoint}
             */
                getVertex: function() {
                    return this.vertex.getPoint();
                },
                /**
             * @method getForward()
             * @for kity.BezierPoint
             * @description 获得当前贝塞尔点的前方控制点
             *
             * @grammar getForward() => {kity.ShapePoint}
             */
                getForward: function() {
                    return this.forward.getPoint();
                },
                /**
             * @method getBackward()
             * @for kity.BezierPoint
             * @description 获得当前贝塞尔点的后方控制点
             *
             * @grammar getBackward() => {kity.ShapePoint}
             */
                getBackward: function() {
                    return this.backward.getPoint();
                },
                /**
             * @private
             *
             * 联动更新相关的贝塞尔曲线
             */
                update: function() {
                    if (!this.container) {
                        return this;
                    }
                    //新增参数 this， 把当前引起变化的点传递过去， 以便有需要的地方可以获取到引起变化的源
                    if (this.container.update) this.container.update(this);
                }
            });
            return BezierPoint;
        }
    };

    //src/graphic/box.js
    /**
     * @fileOverview
     *
     * 表示一个矩形区域
     */
    _p[25] = {
        value: function(require, exports, module) {
            /**
         * @class kity.Box
         * @description 表示一个矩形区域
         */
            var Box = _p.r(11).createClass("Box", {
                /**
             * @constructor
             * @for kity.Box
             *
             * @grammar new kity.Box(x, y, width, height)
             * @grammar new kity.Box(value)
             *
             * @param  {Number} x|value.x      矩形区域的 x 坐标
             * @param  {Number} y|value.y      矩形区域的 y 坐标
             * @param  {Number} width|value.width   矩形区域的宽度
             * @param  {Number} height|value.height 矩形区域的高度
             *
             * @example
             *
             * ```js
             * var box = new kity.Box(10, 20, 50, 50);
             * var box2 = new kity.Box({x: 10, y: 20, width: 50, height: 50});
             * ```
             */
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
                    /**
                 * @property x
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的 x 坐标
                 */
                    this.x = x || 0;
                    /**
                 * @property y
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的 y 坐标
                 */
                    this.y = y || 0;
                    /**
                 * @property width
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的宽度
                 */
                    this.width = width || 0;
                    /**
                 * @property height
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的高度
                 */
                    this.height = height || 0;
                    /**
                 * @property left
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的最左侧坐标，等价于 x 的值
                 */
                    this.left = this.x;
                    /**
                 * @property right
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的最右侧坐标，等价于 x + width 的值
                 */
                    this.right = this.x + this.width;
                    /**
                 * @property top
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的最上侧坐标，等价于 y 的值
                 */
                    this.top = this.y;
                    /**
                 * @property bottom
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的最下侧坐标，等价于 y + height 的值
                 */
                    this.bottom = this.y + this.height;
                    /**
                 * @property cx
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的中心 x 坐标
                 */
                    this.cx = this.x + this.width / 2;
                    /**
                 * @property cy
                 * @for kity.Box
                 * @type {Number}
                 * @readOnly
                 * @description 矩形区域的中心 y 坐标
                 */
                    this.cy = this.y + this.height / 2;
                },
                /**
             * @method getRangeX()
             * @for kity.Box
             * @description 获得矩形区域的 x 值域
             *
             * @grammar getRangeX() => {Number[]}
             *
             * @example
             *
             * var box = new kity.Box(10, 10, 30, 50);
             * console.log(box.getRangeX()); // [10, 40]
             */
                getRangeX: function() {
                    return [ this.left, this.right ];
                },
                /**
             * @method getRangeY()
             * @for kity.Box
             * @description 获得矩形区域的 y 值域
             *
             * @grammar getRangeY() => {Number[]}
             *
             * @example
             *
             * var box = new kity.Box(10, 10, 30, 50);
             * console.log(box.getRangeY()); // [10, 60]
             */
                getRangeY: function() {
                    return [ this.top, this.bottom ];
                },
                /**
             * @method merge()
             * @for kity.Box
             * @description 把当前矩形区域和指定的矩形区域合并，返回一个新的矩形区域（即包含两个源矩形区域的最小矩形区域）
             *
             * @grammar merge(another) => {kity.Box}
             * @param  {kity.Box} another 要合并的矩形区域
             *
             * @example
             *
             * ```js
             * var box1 = new kity.Box(10, 10, 50, 50);
             * var box2 = new kity.BOx(30, 30, 50, 50);
             * var box3 = box1.merge(box2);
             * console.log(box3.valueOf()); // [10, 10, 70, 70]
             * ```
             */
                merge: function(another) {
                    var left = Math.min(this.left, another.left), right = Math.max(this.right, another.right), top = Math.min(this.top, another.top), bottom = Math.max(this.bottom, another.bottom);
                    return new Box(left, top, right - left, bottom - top);
                },
                /**
             * @method expand()
             * @for kity.Box
             * @description 扩展（或收缩）当前的盒子，返回新的盒子
             *
             * @param {Number} top
             *     矩形区域的上边界往上扩展的值；如果是负数，则上边界往下收缩
             *
             * @param {Number} right
             *     [Optional] 矩形区域的右边界往右拓展的值；
             *                如果是负数，则右边界往左收缩；
             *                如果不设置该值，使用和 top 同样的值。
             *
             * @param {Number} bottom
             *     [Optional] 矩形区域的下边界往下拓展的值；
             *                如果是负数，则下边界往上收缩；
             *                如果不设置该值，使用和 top 同样的值。
             *
             * @param {Number} left
             *     [Optional] 矩形区域的左边界往左拓展的值;
             *                如果是负数，则左边界往右收缩;
             *                如果不设置该值，使用和 right 同样的值。
             *
             * @example
             *
             * ```js
             * var box = new kity.Box(10, 10, 20, 20);
             * var box1 = box.expand(10); // [0, 0, 40, 40]
             * var box2 = box.expand(10, 20); // [0, -10, 40, 60]
             * var box3 = box.expand(1, 2, 3, 4); // [9, 8, 24, 26]
             * ```
             */
                expand: function(top, right, bottom, left) {
                    if (arguments.length < 1) {
                        return new Box(this);
                    }
                    if (arguments.length < 2) {
                        right = top;
                    }
                    if (arguments.length < 3) {
                        bottom = top;
                    }
                    if (arguments.length < 4) {
                        left = right;
                    }
                    var x = this.left - left, y = this.top - top, width = this.width + right, height = this.height + top;
                    return new Box(x, y, width, height);
                },
                /**
             * @method valueOf()
             * @for kity.Box
             * @description 返回当前盒子的数组表示
             *
             * @grammar valueOf() => {Number[]}
             *
             * @example
             *
             * ```js
             * var box = new kity.Box(0, 0, 200, 50);
             * console.log(box.valueOf()); // [0, 0, 200, 50]
             * ```
             */
                valueOf: function() {
                    return [ this.x, this.y, this.width, this.height ];
                },
                /**
             * @method toString()
             * @for kity.Box
             * @description 返回当前盒子的字符串表示
             *
             * @grammar toString() => {String}
             *
             * @example
             *
             * ```js
             * var box = new kity.Box(0, 0, 200, 50);
             * console.log(box.toString()); // "0 0 200 50"
             */
                toString: function() {
                    return this.valueOf().join(" ");
                }
            });
            /**
         * @method parse()
         * @static
         * @for kity.Box
         * @description 解析一个字符串或数组为 kity.Box 对象
         *
         * @grammar kity.Box.parse(any) => {kity.Box}
         *
         * @param  {Number[]|String} any 要解析的字符串或数组
         *
         * @example
         *
         * ```js
         * console.log(kity.Box.parse('0 0 100 200'));
         * console.log(kity.Box.parse([0, 0, 100, 200]));
         * ```
         */
            Box.parse = function(any) {
                if (typeof any == "string") {
                    return Box.parse(any.split(/[\s,]+/).map(parseFloat));
                }
                if (any instanceof Array) {
                    return new Box(any[0], any[1], any[2], any[3]);
                }
                if ("x" in any) return new Box(any);
                return null;
            };
            return Box;
        }
    };

    //src/graphic/circle.js
    /**
     * @fileOverview
     *
     * 绘制和使用圆形
     */
    _p[26] = {
        value: function(require, exports, module) {
            /**
         * @class kity.Circle
         * @base kity.Ellipse
         * @description 表示一个圆形
         */
            return _p.r(11).createClass("Circle", {
                base: _p.r(33),
                /**
             * @constructor
             * @for kity.Circle
             *
             * @param  {Number} radius 半径
             * @param  {Number} cx     圆心 x 坐标
             * @param  {Number} cy     圆心 y 坐标
             */
                constructor: function(radius, cx, cy) {
                    this.callBase(radius, radius, cx, cy);
                },
                /**
             * @method
             * @for kity.Circle
             * @description 获取原型的半径
             */
                getRadius: function() {
                    return this.getRadiusX();
                },
                setRadius: function(radius) {
                    return this.callBase(radius, radius);
                }
            });
        }
    };

    //src/graphic/clip.js
    /**
     * @fileOverview
     *
     * 支持图形剪辑
     */
    _p[27] = {
        value: function(require, exports, module) {
            var Class = _p.r(11);
            var Shape = _p.r(61);
            var Clip = Class.createClass("Clip", {
                base: Shape,
                mixins: [ _p.r(62) ],
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
        }
    };

    //src/graphic/color.js
    _p[28] = {
        value: function(require, exports, module) {
            var Utils = _p.r(12), StandardColor = _p.r(65), ColorUtils = {}, Color = _p.r(11).createClass("Color", {
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
                            return v1 + (v2 - v1) * ((2 / 3 - vH) * 6);
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
        }
    };

    //src/graphic/container.js
    _p[29] = {
        value: function(require, exports, module) {
            function itemRemove() {
                this.container.removeItem(this);
                return this;
            }
            return _p.r(11).createClass("Container", {
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
        }
    };

    //src/graphic/curve.js
    /*
     * 曲线
     * */
    _p[30] = {
        value: function(require, exports, module) {
            var Utils = _p.r(12), CurveUtil = {
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
            return _p.r(11).createClass("Curve", {
                base: _p.r(47),
                mixins: [ _p.r(52) ],
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
        }
    };

    //src/graphic/data.js
    _p[31] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("Data", {
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
        }
    };

    //src/graphic/defbrush.js
    _p[32] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("GradientBrush", {
                base: _p.r(59),
                constructor: function(nodeType) {
                    this.callBase(nodeType);
                }
            });
        }
    };

    //src/graphic/ellipse.js
    _p[33] = {
        value: function(require, exports, module) {
            var Utils = _p.r(12), Point = _p.r(51);
            return _p.r(11).createClass("Ellipse", {
                base: _p.r(47),
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
        }
    };

    //src/graphic/eventhandler.js
    /*
     * kity event 实现
     */
    _p[34] = {
        value: function(require, exports, module) {
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
            var Utils = _p.r(12), ShapeEvent = _p.r(63);
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
            return _p.r(11).createClass("EventHandler", {
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
        }
    };

    //src/graphic/geometry.js
    _p[35] = {
        value: function(require) {
            var utils = _p.r(12);
            var Point = _p.r(51);
            var Vector = _p.r(74);
            var Matrix = _p.r(44);
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
            _p.r(11).extendClass(Matrix, {
                transformPath: function(path) {
                    return g.transformPath(path, this);
                }
            });
            return g;
        }
    };

    //src/graphic/gradientbrush.js
    _p[36] = {
        value: function(require, exports, module) {
            var svg = _p.r(68);
            var DefBrush = _p.r(32);
            var Color = _p.r(28);
            return _p.r(11).createClass("GradientBrush", {
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
        }
    };

    //src/graphic/group.js
    _p[37] = {
        value: function(require, exports, module) {
            var ShapeContainer = _p.r(62);
            return _p.r(11).createClass("Group", {
                mixins: [ ShapeContainer ],
                base: _p.r(61),
                constructor: function Group() {
                    this.callBase("g");
                }
            });
        }
    };

    //src/graphic/hyperlink.js
    _p[38] = {
        value: function(require, exports, module) {
            var ShapeContainer = _p.r(62);
            return _p.r(11).createClass("HyperLink", {
                mixins: [ ShapeContainer ],
                base: _p.r(61),
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
        }
    };

    //src/graphic/image.js
    _p[39] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("Image", {
                base: _p.r(61),
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
        }
    };

    //src/graphic/line.js
    _p[40] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("Line", {
                base: _p.r(47),
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
        }
    };

    //src/graphic/lineargradientbrush.js
    _p[41] = {
        value: function(require, exports, module) {
            var className = "LinearGradientBrush";
            var svg = _p.r(68);
            var GradientBrush = _p.r(36);
            return _p.r(11).createClass(className, {
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
        }
    };

    //src/graphic/marker.js
    _p[42] = {
        value: function(require, exports, module) {
            var Point = _p.r(51);
            var Marker = _p.r(11).createClass("Marker", {
                base: _p.r(59),
                mixins: [ _p.r(62), _p.r(76) ],
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
            var Path = _p.r(47);
            _p.r(11).extendClass(Path, {
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
        }
    };

    //src/graphic/mask.js
    /**
     * 蒙板
     */
    _p[43] = {
        value: function(require, exports, module) {
            var Class = _p.r(11);
            var Shape = _p.r(61);
            var Mask = Class.createClass("Mask", {
                base: Shape,
                mixins: [ _p.r(62) ],
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
        }
    };

    //src/graphic/matrix.js
    _p[44] = {
        value: function(require, exports, module) {
            var utils = _p.r(12);
            var Box = _p.r(25);
            var mPattern = /matrix\((.+)\)/i;
            var Point = _p.r(51);
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
            var Matrix = _p.r(11).createClass("Matrix", {
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
        }
    };

    //src/graphic/palette.js
    /**
     * 调色板
     */
    _p[45] = {
        value: function(require, exports, module) {
            //标准color
            var StandardColor = _p.r(65), Color = _p.r(28), Utils = _p.r(12);
            var Palette = _p.r(11).createClass("Palette", {
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
        }
    };

    //src/graphic/paper.js
    _p[46] = {
        value: function(require, exports, module) {
            var Class = _p.r(11);
            var utils = _p.r(12);
            var svg = _p.r(68);
            var Container = _p.r(29);
            var ShapeContainer = _p.r(62);
            var ViewBox = _p.r(76);
            var EventHandler = _p.r(34);
            var Styled = _p.r(67);
            var Matrix = _p.r(44);
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
            var Shape = _p.r(61);
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
        }
    };

    //src/graphic/path.js
    _p[47] = {
        value: function(require, exports, module) {
            var Utils = _p.r(12);
            var createClass = _p.r(11).createClass;
            var Shape = _p.r(61);
            var svg = _p.r(68);
            var g = _p.r(35);
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
        }
    };

    //src/graphic/patternbrush.js
    _p[48] = {
        value: function(require, exports, module) {
            var DefBrush = _p.r(32);
            var ShapeContainer = _p.r(62);
            var svg = _p.r(68);
            return _p.r(11).createClass("PatternBrush", {
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
        }
    };

    //src/graphic/pen.js
    _p[49] = {
        value: function(require, exports, module) {
            var Color = _p.r(28);
            return _p.r(11).createClass("Pen", {
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
        }
    };

    //src/graphic/pie.js
    _p[50] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass({
                base: _p.r(69),
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
        }
    };

    //src/graphic/point.js
    /*
     * 点对象抽象
     */
    _p[51] = {
        value: function(require, exports, module) {
            /**
         * @class kity.Point
         * @description 表示一个点
         */
            var Point = _p.r(11).createClass("Point", {
                /**
             * @constructor
             * @for kity.Point
             * @description 指定默认的 x 和 y 创建一个点
             * 
             * @param  {Number} x 点的 x 坐标
             * @param  {Number} y 点的 y 坐标
             */
                constructor: function(x, y) {
                    /**
                 * @property
                 * @for kity.Point
                 * @description 表示点的 x 坐标
                 * @type {Number}
                 */
                    this.x = x || 0;
                    /**
                 * @property
                 * @for kity.Point
                 * @description 表示点的 y 坐标
                 * @type {Number}
                 */
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
            /**
         * @static
         * @method fromPolar()
         * @for kity.Point
         * @grammar kity.Point.fromPolar(radius, angle, unit) => kity.Point
         * @param  {Number} radius 极坐标中的半径
         * @param  {Number} angle  极坐标中的角度
         * @param  {String} unit   角度使用的单位，默认为 'deg' (角度)，可以取值为 'rad'，表示传入的是弧度值
         */
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
        }
    };

    //src/graphic/pointcontainer.js
    /**
     * 点集合容器
     */
    _p[52] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("PointContainer", {
                base: _p.r(29),
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
        }
    };

    //src/graphic/poly.js
    /*
     * 通过点来决定图形的公共父类
     */
    _p[53] = {
        value: function(require, exports, module) {
            var Utils = _p.r(12);
            return _p.r(11).createClass("Poly", {
                base: _p.r(47),
                mixins: [ _p.r(52) ],
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
        }
    };

    //src/graphic/polygon.js
    _p[54] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("Polygon", {
                base: _p.r(53),
                constructor: function(points) {
                    this.callBase(points, true);
                }
            });
        }
    };

    //src/graphic/polyline.js
    _p[55] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("Polyline", {
                base: _p.r(53),
                constructor: function(points) {
                    this.callBase(points);
                }
            });
        }
    };

    //src/graphic/radialgradientbrush.js
    _p[56] = {
        value: function(require, exports, module) {
            var GradientBrush = _p.r(36);
            return _p.r(11).createClass("RadialGradientBrush", {
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
        }
    };

    //src/graphic/rect.js
    _p[57] = {
        value: function(require, exports, module) {
            var RectUtils = {}, Utils = _p.r(12), Point = _p.r(51), Box = _p.r(25);
            Utils.extend(RectUtils, {
                //根据传递进来的width、height和radius属性，
                //获取最适合的radius值
                formatRadius: function(width, height, radius) {
                    var minValue = Math.floor(Math.min(width / 2, height / 2));
                    return Math.min(minValue, radius);
                }
            });
            /**
         * @class kity.Rect
         * @description 表示一个矩形
         * @base kity.Path
         */
            var Rect = _p.r(11).createClass("Rect", {
                base: _p.r(47),
                /**
             * @constructor
             * @for kity.Rect
             * @grammar new kity.Rect(width, height, x, y, radius)
             * @param  {Number} width  矩形的初始化宽度
             * @param  {Number} height 矩形的初始化高度
             * @param  {Number} x      矩形的初始化 x 坐标
             * @param  {Number} y      矩形的初始化 y 坐标
             * @param  {Number} radius 矩形的初始化圆角大小
             */
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
                /**
             * @method setWidth
             * @for kity.Rect
             * @grammar setWidth(width) => kity.Rect
             * @description 设置矩形的宽度，设置后返回矩形实例本身
             * @param {Number} width 宽度值
             *
             * @example
             * ```js
             * rect.setWidth(300);
             * ```
             */
                setWidth: function(width) {
                    this.width = width;
                    return this.update();
                },
                /**
             * @method setHeight
             * @for  kity.Rect
             * @grammar setHeight(height) => kity.Rect
             * @description 设置矩形的高度，设置后返回矩形实例本身
             * @param {Number} height 高度值
             *
             * @example
             * ```js
             * rect.setHeight(200);
             * ```
             */
                setHeight: function(height) {
                    this.height = height;
                    return this.update();
                },
                /**
             * @method setSize
             * @for  kity.Rect
             * @grammar setSize(width, height) => kity.Rect
             * @description 设置矩形的尺寸，设置后返回矩形本身
             * @param {Number} width  矩形的宽度值
             * @param {Number} height 矩形的高度值
             *
             * @example
             * ```js
             * rect.setSize(300, 200);
             * ```
             */
                setSize: function(width, height) {
                    this.width = width;
                    this.height = height;
                    return this.update();
                },
                /**
             * @method setBox
             * @for kity.Rect
             * @grammar setBox(box) => kity.Rect
             * @description 使用一个 kity 的盒子数据，
             * @param {kity.Box} box 盒子数据
             */
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
        }
    };

    //src/graphic/regularpolygon.js
    _p[58] = {
        value: function(require, exports, module) {
            var Point = _p.r(51);
            return _p.r(11).createClass("RegularPolygon", {
                base: _p.r(47),
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
        }
    };

    //src/graphic/resource.js
    _p[59] = {
        value: function(require, exports, module) {
            var svg = _p.r(68);
            return _p.r(11).createClass("Resource", {
                constructor: function(nodeType) {
                    this.callBase();
                    this.node = svg.createNode(nodeType);
                },
                toString: function() {
                    return "url(#" + this.node.id + ")";
                }
            });
        }
    };

    //src/graphic/ring.js
    _p[60] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass({
                base: _p.r(69),
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
        }
    };

    //src/graphic/shape.js
    _p[61] = {
        value: function(require, exports, module) {
            var svg = _p.r(68);
            var utils = _p.r(12);
            var EventHandler = _p.r(34);
            var Styled = _p.r(67);
            var Data = _p.r(31);
            var Matrix = _p.r(44);
            var Pen = _p.r(49);
            var slice = Array.prototype.slice;
            var Box = _p.r(25);
            var Shape = _p.r(11).createClass("Shape", {
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
        }
    };

    //src/graphic/shapecontainer.js
    _p[62] = {
        value: function(require, exports, module) {
            var Container = _p.r(29);
            var utils = _p.r(12);
            var ShapeContainer = _p.r(11).createClass("ShapeContainer", {
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
            var Shape = _p.r(61);
            _p.r(11).extendClass(Shape, {
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
        }
    };

    //src/graphic/shapeevent.js
    /*
     * 图形事件包装类
     * */
    _p[63] = {
        value: function(require, exprots, module) {
            var Matrix = _p.r(44), Utils = _p.r(12), Point = _p.r(51);
            return _p.r(11).createClass("ShapeEvent", {
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
                    var pScreen = new Point(eventClient && eventClient.clientX || 0, eventClient && eventClient.clientY || 0);
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
        }
    };

    //src/graphic/shapepoint.js
    /*
     * 图形上的点抽象
     */
    _p[64] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("ShapePoint", {
                base: _p.r(51),
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
        }
    };

    //src/graphic/standardcolor.js
    /**
     * 标准颜色映射
     */
    _p[65] = {
        value: {
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
        }
    };

    //src/graphic/star.js
    _p[66] = {
        value: function(require, exports, module) {
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
            var Point = _p.r(51);
            return _p.r(11).createClass("Star", {
                base: _p.r(47),
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
        }
    };

    //src/graphic/styled.js
    _p[67] = {
        value: function(require, exports, module) {
            // polyfill for ie
            var ClassList = _p.r(11).createClass("ClassList", {
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
            return _p.r(11).createClass("Styled", {
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
        }
    };

    //src/graphic/svg.js
    _p[68] = {
        value: function(require, exports, module) {
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
        }
    };

    //src/graphic/sweep.js
    _p[69] = {
        value: function(require, exports, module) {
            var Point = _p.r(51);
            return _p.r(11).createClass("Sweep", {
                base: _p.r(47),
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
        }
    };

    //src/graphic/text.js
    _p[70] = {
        value: function(require, exports, module) {
            var TextContent = _p.r(71);
            var ShapeContainer = _p.r(62);
            var svg = _p.r(68);
            var utils = _p.r(12);
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
            return _p.r(11).createClass("Text", {
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
        }
    };

    //src/graphic/textcontent.js
    _p[71] = {
        value: function(require, exports, module) {
            var Shape = _p.r(61);
            return _p.r(11).createClass("TextContent", {
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
        }
    };

    //src/graphic/textspan.js
    _p[72] = {
        value: function(require, exports, module) {
            var TextContent = _p.r(71);
            var Styled = _p.r(67);
            return _p.r(11).createClass("TextSpan", {
                base: TextContent,
                mixins: [ Styled ],
                constructor: function(content) {
                    this.callBase("tspan");
                    this.setContent(content);
                }
            });
        }
    };

    //src/graphic/use.js
    /*
     * USE 功能
     */
    _p[73] = {
        value: function(require, exports, module) {
            var Svg = _p.r(68);
            var Class = _p.r(11);
            var Use = Class.createClass("Use", {
                base: _p.r(61),
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
            var Shape = _p.r(61);
            Class.extendClass(Shape, {
                // fast-use
                use: function() {
                    return new Use(this);
                }
            });
            return Use;
        }
    };

    //src/graphic/vector.js
    _p[74] = {
        value: function(require, exports, module) {
            var Point = _p.r(51);
            var Matrix = _p.r(44);
            var Vector = _p.r(11).createClass("Vector", {
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
            _p.r(11).extendClass(Point, {
                asVector: function() {
                    return new Vector(this.x, this.y);
                }
            });
            return Vector;
        }
    };

    //src/graphic/view.js
    _p[75] = {
        value: function(require, exports, module) {
            var ShapeContainer = _p.r(62);
            var ViewBox = _p.r(76);
            return _p.r(11).createClass("View", {
                mixins: [ ShapeContainer, ViewBox ],
                base: _p.r(75),
                constructor: function() {
                    this.callBase("view");
                }
            });
        }
    };

    //src/graphic/viewbox.js
    _p[76] = {
        value: function(require, exports, module) {
            return _p.r(11).createClass("ViewBox", {
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
        }
    };

    //src/kity.js
    /**
     * @fileOverview kity 暴露的方法或对象
     */
    _p[77] = {
        value: function(require, exports, module) {
            var kity = {}, utils = _p.r(12);
            kity.version = "2.0.0";
            utils.extend(kity, {
                // core
                createClass: _p.r(11).createClass,
                extendClass: _p.r(11).extendClass,
                Utils: utils,
                Browser: _p.r(10),
                // shape
                Box: _p.r(25),
                Bezier: _p.r(23),
                BezierPoint: _p.r(24),
                Circle: _p.r(26),
                Clip: _p.r(27),
                Color: _p.r(28),
                Container: _p.r(29),
                Curve: _p.r(30),
                Ellipse: _p.r(33),
                GradientBrush: _p.r(36),
                Group: _p.r(37),
                HyperLink: _p.r(38),
                Image: _p.r(39),
                Line: _p.r(40),
                LinearGradientBrush: _p.r(41),
                Mask: _p.r(43),
                Matrix: _p.r(44),
                Marker: _p.r(42),
                Palette: _p.r(45),
                Paper: _p.r(46),
                Path: _p.r(47),
                PatternBrush: _p.r(48),
                Pen: _p.r(49),
                Point: _p.r(51),
                PointContainer: _p.r(52),
                Polygon: _p.r(54),
                Polyline: _p.r(55),
                Pie: _p.r(50),
                RadialGradientBrush: _p.r(56),
                Rect: _p.r(57),
                RegularPolygon: _p.r(58),
                Ring: _p.r(60),
                Shape: _p.r(61),
                ShapePoint: _p.r(64),
                ShapeContainer: _p.r(62),
                Sweep: _p.r(69),
                Star: _p.r(66),
                Text: _p.r(70),
                TextSpan: _p.r(72),
                Use: _p.r(73),
                Vector: _p.r(74),
                g: _p.r(35),
                // animate
                Animator: _p.r(0),
                Easing: _p.r(1),
                OpacityAnimator: _p.r(4),
                RotateAnimator: _p.r(6),
                ScaleAnimator: _p.r(7),
                Timeline: _p.r(8),
                TranslateAnimator: _p.r(9),
                PathAnimator: _p.r(5),
                MotionAnimator: _p.r(3),
                requestFrame: _p.r(2).requestFrame,
                releaseFrame: _p.r(2).releaseFrame,
                // filter
                Filter: _p.r(20),
                GaussianblurFilter: _p.r(21),
                ProjectionFilter: _p.r(22),
                // effect
                ColorMatrixEffect: _p.r(13),
                CompositeEffect: _p.r(14),
                ConvolveMatrixEffect: _p.r(15),
                Effect: _p.r(16),
                GaussianblurEffect: _p.r(17),
                OffsetEffect: _p.r(18)
            });
            return window.kity = kity;
        }
    };

    var moduleMapping = {
        kity: 77
    };

    function use(name) {
        _p.r([ moduleMapping[name] ]);
    }
    /* global use, inc: true */

    /**
     * 模块暴露
     */
    use('kity');
    })();
/* lib/kity/dist/kity.js end */




/* src/core/kityminder.js */
    var KityMinder = window.KM = window.KityMinder = function() {
        var instanceMap = {},
            instanceId = 0,
            uuidMap = {};
        return {
            version: '1.2.1',
            uuid: function(name) {
                name = name || 'unknown';
                uuidMap[name] = uuidMap[name] || 0;
                ++uuidMap[name];
                return name + '_' + uuidMap[name];
            },
            createMinder: function(renderTarget, options) {
                options = options || {};
                options.renderTo = Utils.isString(renderTarget) ? document.getElementById(renderTarget) : renderTarget;
                var minder = new Minder(options);
                this.addMinder(options.renderTo, minder);
                return minder;
            },
            addMinder: function(target, minder) {
                var id;
                if (typeof(target) === 'string') {
                    id = target;
                } else {
                    id = target.id || ("KM_INSTANCE_" + instanceId++);
                }
                instanceMap[id] = minder;
            },
            getMinder: function(target, options) {
                var id;
                if (typeof(target) === 'string') {
                    id = target;
                } else {
                    id = target.id || ("KM_INSTANCE_" + instanceId++);
                }
                return instanceMap[id] || this.createMinder(target, options);
            },
            //挂接多语言
            LANG: {}
        };
    }();
/* src/core/kityminder.js end */




/* src/core/utils.js */
    var utils = Utils = KityMinder.Utils = {
        extend: kity.Utils.extend.bind(kity.Utils),

        listen: function(element, type, handler) {
            var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/),
                k = types.length;
            if (k)
                while (k--) {
                    type = types[k];
                    if (element.addEventListener) {
                        element.addEventListener(type, handler, false);
                    } else {
                        if (!handler._d) {
                            handler._d = {
                                els: []
                            };
                        }
                        var key = type + handler.toString(),
                            index = utils.indexOf(handler._d.els, element);
                        if (!handler._d[key] || index == -1) {
                            if (index == -1) {
                                handler._d.els.push(element);
                            }
                            if (!handler._d[key]) {
                                handler._d[key] = function(evt) {
                                    return handler.call(evt.srcElement, evt || window.event);
                                };
                            }
                            element.attachEvent('on' + type, handler._d[key]);
                        }
                    }
                }
            element = null;
        },
        trim: function(str) {
            return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
        },
        each: function(obj, iterator, context) {
            if (obj == null) return;
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, i, obj[i], obj) === false)
                        return false;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, key, obj[key], obj) === false)
                            return false;
                    }
                }
            }
        },
        addCssRule: function(key, style, doc) {
            var head, node;
            if (style === undefined || style && style.nodeType && style.nodeType == 9) {
                //获取样式
                doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
                node = doc.getElementById(key);
                return node ? node.innerHTML : undefined;
            }
            doc = doc || document;
            node = doc.getElementById(key);

            //清除样式
            if (style === '') {
                if (node) {
                    node.parentNode.removeChild(node);
                    return true
                }
                return false;
            }

            //添加样式
            if (node) {
                node.innerHTML = style;
            } else {
                node = doc.createElement('style');
                node.id = key;
                node.innerHTML = style;
                doc.getElementsByTagName('head')[0].appendChild(node);
            }
        },
        keys: function(plain) {
            var keys = [];
            for (var key in plain) {
                if (plain.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        },
        proxy: function(fn, context) {
            return function() {
                return fn.apply(context, arguments);
            };
        },
        indexOf: function(array, item, start) {
            var index = -1;
            start = this.isNumber(start) ? start : 0;
            this.each(array, function(v, i) {
                if (i >= start && v === item) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        argsToArray: function(args, index) {
            return Array.prototype.slice.call(args, index || 0);
        },
        clonePlainObject: function(source, target) {
            var tmp;
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    tmp = source[i];
                    if (utils.isObject(tmp) || utils.isArray(tmp)) {
                        target[i] = utils.isArray(tmp) ? [] : {};
                        utils.clonePlainObject(source[i], target[i])
                    } else {
                        target[i] = tmp;
                    }
                }
            }
            return target;
        },
        compareObject: function(source, target) {
            var tmp;
            if (this.isEmptyObject(source) !== this.isEmptyObject(target)) {
                return false
            }
            if (this.getObjectLength(source) != this.getObjectLength(target)) {
                return false;
            }
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    tmp = source[p];
                    if (target[p] === undefined) {
                        return false;
                    }
                    if (this.isObject(tmp) || this.isArray(tmp)) {
                        if (this.isObject(target[p]) !== this.isObject(tmp)) {
                            return false;
                        }
                        if (this.isArray(tmp) !== this.isArray(target[p])) {
                            return false;
                        }
                        if (this.compareObject(tmp, target[p]) === false) {
                            return false
                        }
                    } else {
                        if (tmp != target[p]) {
                            return false
                        }
                    }
                }
            }
            return true;
        },
        getObjectLength: function(obj) {
            if (this.isArray(obj) || this.isString(obj)) return obj.length;
            var count = 0;
            for (var key in obj)
                if (obj.hasOwnProperty(key)) count++;
            return count;
        },
        isEmptyObject: function(obj) {
            if (obj == null) return true;
            if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
            for (var key in obj)
                if (obj.hasOwnProperty(key)) return false;
            return true;
        },
        loadFile: function() {
            var tmpList = [];

            function getItem(doc, obj) {
                try {
                    for (var i = 0, ci; ci = tmpList[i++];) {
                        if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                            return ci;
                        }
                    }
                } catch (e) {
                    return null;
                }

            }

            return function(doc, obj, fn) {
                var item = getItem(doc, obj);
                if (item) {
                    if (item.ready) {
                        fn && fn();
                    } else {
                        item.funs.push(fn)
                    }
                    return;
                }
                tmpList.push({
                    doc: doc,
                    url: obj.src || obj.href,
                    funs: [fn]
                });
                if (!doc.body) {
                    var html = [];
                    for (var p in obj) {
                        if (p == 'tag') continue;
                        html.push(p + '="' + obj[p] + '"')
                    }
                    doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                    return;
                }
                if (obj.id && doc.getElementById(obj.id)) {
                    return;
                }
                var element = doc.createElement(obj.tag);
                delete obj.tag;
                for (var p in obj) {
                    element.setAttribute(p, obj[p]);
                }
                element.onload = element.onreadystatechange = function() {
                    if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                        item = getItem(doc, obj);
                        if (item.funs.length > 0) {
                            item.ready = 1;
                            for (var fi; fi = item.funs.pop();) {
                                fi();
                            }
                        }
                        element.onload = element.onreadystatechange = null;
                    }
                };
                //            element.onerror = function () {
                //                throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file ')
                //            };
                doc.getElementsByTagName("head")[0].appendChild(element);
            }
        }(),
        clone: function(source, target) {
            var tmp;
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    tmp = source[i];
                    if (typeof tmp == 'object') {
                        target[i] = utils.isArray(tmp) ? [] : {};
                        utils.clone(source[i], target[i])
                    } else {
                        target[i] = tmp;
                    }
                }
            }
            return target;
        },
        unhtml: function(str, reg) {
            return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function(a, b) {
                if (b) {
                    return a;
                } else {
                    return {
                        '<': '&lt;',
                        '&': '&amp;',
                        '"': '&quot;',
                        '>': '&gt;',
                        "'": '&#39;'
                    }[a]
                }
            }) : '';
        },
        cloneArr:function(arr){
            return [].concat(arr);
        }

    };

    Utils.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object'], function(i, v) {
        KityMinder.Utils['is' + v] = function(obj) {
            return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
        }
    });
/* src/core/utils.js end */




/* src/core/command.js */
    var Command = kity.createClass( "Command", {
    	constructor: function () {
    		this._isContentChange = true;
    		this._isSelectionChange = false;
    	},

    	execute: function ( minder, args ) {

    	},

    	setContentChanged: function ( val ) {
    		this._isContentChange = !! val;
    	},

    	isContentChanged: function () {
    		return this._isContentChange;
    	},

    	setSelectionChanged: function ( val ) {
    		this._isSelectionChange = !! val;
    	},

    	isSelectionChanged: function () {
    		return this._isContentChange;
    	},

    	queryState: function ( km ) {
    		return 0;
    	},

    	queryValue: function ( km ) {
    		return 0;
    	},
    	isNeedUndo: function () {
    		return true;
    	}
    } );
/* src/core/command.js end */




/* src/core/node.js */
    var MinderNode = KityMinder.MinderNode = kity.createClass('MinderNode', {

        /**
         * 创建一个节点
         *
         * @param {KityMinder}    minder
         *     节点绑定的脑图的实例
         *
         * @param {String|Object} unknown
         *     节点的初始数据或文本
         */
        constructor: function(unknown) {
            this.parent = null;
            this.root = this;
            this.children = [];
            this.data = {};
            this.tmpData = {};

            this.initContainers();

            if (Utils.isString(unknown)) {
                this.setText(unknown);
            } else {
                this.setData(unknown);
            }
        },

        initContainers: function() {
            this.rc = new kity.Group().setId(KityMinder.uuid('minder_node'));
            this.rc.minderNode = this;
        },

        /**
         * 判断节点是否根节点
         */
        isRoot: function() {
            return this.root === this;
        },

        /**
         * 判断节点是否叶子
         */
        isLeaf: function() {
            return this.children.length === 0;
        },

        /**
         * 获取节点的根节点
         */
        getRoot: function() {
            return this.root || this;
        },

        /**
         * 获得节点的父节点
         */
        getParent: function() {
            return this.parent;
        },

        /**
         * 获得节点的深度
         */
        getLevel: function() {
            var level = 0,
                parent = this.parent;
            while (parent) {
                level++;
                parent = parent.parent;
            }
            return level;
        },

        /**
         * 获得节点的复杂度（即子树中节点的数量）
         */
        getComplex: function() {
            var complex = 0;
            this.traverse(function() {
                complex++;
            });
            return complex;
        },

        /**
         * 获得节点的类型（root|main|sub）
         */
        getType: function(type) {
            this.type = ['root', 'main', 'sub'][Math.min(this.getLevel(), 2)];
            return this.type;
        },

        /**
         * 判断当前节点是否被测试节点的祖先
         * @param  {MinderNode}  test 被测试的节点
         */
        isAncestorOf: function(test) {
            var p = test.parent;
            while (p) {
                if (p == this) return true;
                p = p.parent;
            }
            return false;
        },

        /**
         * 设置节点的文本数据
         * @param {String} text 文本数据
         */
        setText: function(text) {
            return this.setData('text', text);
        },

        /**
         * 获取节点的文本数据
         * @return {String}
         */
        getText: function() {
            return this.getData('text');
        },

        /**
         * 先序遍历当前节点树
         * @param  {Function} fn 遍历函数
         */
        preTraverse: function(fn, excludeThis) {
            var children = this.getChildren();
            if (!excludeThis) fn(this);
            for (var i = 0; i < children.length; i++) {
                children[i].preTraverse(fn);
            }
        },

        /**
         * 后序遍历当前节点树
         * @param  {Function} fn 遍历函数
         */
        postTraverse: function(fn, excludeThis) {
            var children = this.getChildren();
            for (var i = 0; i < children.length; i++) {
                children[i].postTraverse(fn);
            }
            if (!excludeThis) fn(this);
        },

        traverse: function(fn, excludeThis) {
            return this.postTraverse(fn, excludeThis);
        },

        getChildren: function() {
            return this.children;
        },

        getIndex: function() {
            return this.parent ? this.parent.children.indexOf(this) : -1;
        },

        insertChild: function(node, index) {
            if (index === undefined) {
                index = this.children.length;
            }
            if (node.parent) {
                node.parent.removeChild(node);
            }
            node.parent = this;
            node.root = this.root;

            this.children.splice(index, 0, node);
        },

        appendChild: function(node) {
            return this.insertChild(node);
        },

        prependChild: function(node) {
            return this.insertChild(node, 0);
        },

        removeChild: function(elem) {
            var index = elem,
                removed;
            if (elem instanceof MinderNode) {
                index = this.children.indexOf(elem);
            }
            if (index >= 0) {
                removed = this.children.splice(index, 1)[0];
                removed.parent = null;
                removed.root = removed;
            }
        },

        getChild: function(index) {
            return this.children[index];
        },

        getFirstChild: function() {
            return this.children[0];
        },

        getLastChild: function() {
            return this.children[this.children.length - 1];
        },

        getData: function(name) {
            if (name === undefined) {
                return this.data;
            }
            return this.data[name];
        },

        setData: function(name, value) {
            if (name === undefined) {
                this.data = {};

            } else if (utils.isObject(name)) {
                Utils.extend(this.data, name);
            } else {
                if (value === undefined) {
                    this.data[name] = null;
                    delete this.data[name];
                } else {
                    this.data[name] = value;
                }
            }
            return this;
        },

        getRenderContainer: function() {
            return this.rc;
        },

        getCommonAncestor: function(node) {
            return Utils.getNodeCommonAncestor(this, node);
        },

        contains: function(node) {
            return this == node || this.isAncestorOf(node);
        },

        clone: function() {
            function cloneNode(parent, isClonedNode) {
                var cloned = new KM.MinderNode();

                cloned.data = Utils.clonePlainObject(isClonedNode.getData());
                cloned.tmpData = Utils.clonePlainObject(isClonedNode.getTmpData());

                if (parent) {
                    parent.appendChild(cloned);
                }
                for (var i = 0, ci;
                    (ci = isClonedNode.children[i++]);) {
                    cloneNode(cloned, ci);
                }
                return cloned;
            }
            return cloneNode(null, this);
        },

        equals: function(node,ignoreSelected) {
            var me = this;
            function restoreSelected(){
                if(isSelectedA){
                    me.setSelectedFlag();
                }
                if(isSelectedB){
                    node.setSelectedFlag();
                }
            }
            if(ignoreSelected){
                var isSelectedA = false;
                var isSelectedB = false;
                if(me.isSelected()){
                    isSelectedA = true;
                    me.clearSelectedFlag();
                }

                if(node.isSelected()){
                    isSelectedB = true;
                    node.clearSelectedFlag();
                }
            }
            if (node.children.length != this.children.length) {
                restoreSelected();
                return false;
            }
            if (utils.compareObject(node.getData(), me.getData()) === false) {
                restoreSelected();
                return false;
            }
            if (utils.compareObject(node.getTmpData(), me.getTmpData()) === false) {
                restoreSelected();
                return false;
            }
            for (var i = 0, ci;
                (ci = me.children[i]); i++) {
                if (ci.equals(node.children[i],ignoreSelected) === false) {
                    restoreSelected();
                    return false;
                }
            }
            restoreSelected();
            return true;

        },

        clearChildren: function() {
            this.children = [];
        },

        setTmpData: function(a, v) {
            var me = this;
            if (utils.isObject(a)) {
                utils.each(a, function(key, val) {
                    me.setTmpData(key, val);
                });
            }
            if (v === undefined || v === null || v === '') {
                delete this.tmpData[a];
            } else {
                this.tmpData[a] = v;
            }
        },

        getTmpData: function(a) {
            if (a === undefined) {
                return this.tmpData;
            }
            return this.tmpData[a];
        },

        setValue: function(node) {
            this.data = {};
            this.setData(utils.clonePlainObject(node.getData()));
            this.tmpData = {};
            this.setTmpData(utils.clonePlainObject(node.getTmpData()));
            return this;
        }
    });

    MinderNode.getCommonAncestor = function(nodeA, nodeB) {
        if (nodeA instanceof Array) {
            return MinderNode.getCommonAncestor.apply(this, nodeA);
        }
        switch (arguments.length) {
            case 1:
                return nodeA.parent;

            case 2:
                if (nodeA.isAncestorOf(nodeB)) {
                    return nodeA;
                }
                if (nodeB.isAncestorOf(nodeA)) {
                    return nodeB;
                }
                var ancestor = nodeA.parent;
                while (ancestor && !ancestor.isAncestorOf(nodeB)) {
                    ancestor = ancestor.parent;
                }
                return ancestor;

            default:
                return Array.prototype.reduce.call(arguments, function(prev, current) {
                    return MinderNode.getCommonAncestor(prev, current);
                }, nodeA);
        }
    };
/* src/core/node.js end */




/* src/core/module.js */
    //模块注册&暴露模块接口
    ( function () {
        var _modules;
        KityMinder.registerModule = function ( name, module ) {
            //初始化模块列表
            if ( !_modules ) {
                _modules = {};
            }
            _modules[ name ] = module;
        };
        KityMinder.getModules = function () {
            return _modules;
        };
    } )();
/* src/core/module.js end */




/* src/core/event.js */
    var MinderEvent = kity.createClass('MindEvent', {
        constructor: function(type, params, canstop) {
            params = params || {};
            if (params.getType && params.getType() == 'ShapeEvent') {
                this.kityEvent = params;
                this.originEvent = params.originEvent;
                this.getPosition = params.getPosition.bind(params);
            } else if (params.target && params.preventDefault) {
                this.originEvent = params;
            } else {
                kity.Utils.extend(this, params);
            }
            this.type = type;
            this._canstop = canstop || false;
        },

        getTargetNode: function() {
            var findShape = this.kityEvent && this.kityEvent.targetShape;
            if (!findShape) return null;
            while (!findShape.minderNode && findShape.container) {
                findShape = findShape.container;
            }
            return findShape.minderNode || null;
        },

        stopPropagation: function() {
            this._stoped = true;
        },

        stopPropagationImmediately: function() {
            this._immediatelyStoped = true;
            this._stoped = true;
        },

        shouldStopPropagation: function() {
            return this._canstop && this._stoped;
        },

        shouldStopPropagationImmediately: function() {
            return this._canstop && this._immediatelyStoped;
        },
        preventDefault: function() {
            this.originEvent.preventDefault();
        },
        isRightMB: function() {
            var isRightMB = false;
            if (!this.originEvent) {
                return false;
            }
            if ("which" in this.originEvent)
                isRightMB = this.originEvent.which == 3;
            else if ("button" in this.originEvent)
                isRightMB = this.originEvent.button == 2;
            return isRightMB;
        }
    });
/* src/core/event.js end */




/* src/core/minder.js */
    var Minder = KityMinder.Minder = kity.createClass('KityMinder', {
        constructor: function(options) {
            this._options = Utils.extend(window.KITYMINDER_CONFIG || {}, options);
            this.setDefaultOptions(KM.defaultOptions);

            this._initEvents();
            this._initMinder();
            this._initSelection();
            this._initStatus();
            this._initShortcutKey();
            this._initContextmenu();
            this._initModules();

            if (this.getOptions('readOnly') === true) {
                this.setDisabled();
            }
            this.refresh();
            this.setTheme();
            this.fire('ready');
        },

        getOptions: function(key) {
            var val;
            if (key) {
                val = this.getPreferences(key);
                return val === null || val === undefined ? this._options[key] : val;
            } else {
                val = this.getPreferences();
                if (val) {
                    return utils.extend(val, this._options, true);
                } else {
                    return this._options;
                }
            }
        },

        setDefaultOptions: function(key, val, cover) {
            var obj = {};
            if (Utils.isString(key)) {
                obj[key] = val;
            } else {
                obj = key;
            }
            utils.extend(this._options, obj, !cover);
        },

        setOptions: function(key, val) {
            this.setPreferences(key, val);
        },

        _initMinder: function() {

            this._paper = new kity.Paper();
            this._paper.getNode().setAttribute('contenteditable', true);
            this._paper.getNode().ondragstart = function(e) {
                e.preventDefault();
            };
            this._paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');

            this._addRenderContainer();

            this.setRoot(this.createNode(this.getLang().maintopic));

            if (this._options.renderTo) {
                this.renderTo(this._options.renderTo);
            }
        },

        _addRenderContainer: function() {
            this._rc = new kity.Group().setId(KityMinder.uuid('minder'));
            this._paper.addShape(this._rc);
        },

        renderTo: function(target) {
            this._paper.renderTo(this._renderTarget = target);
            this._bindEvents();
        },

        getRenderContainer: function() {
            return this._rc;
        },

        getPaper: function() {
            return this._paper;
        },
        getRenderTarget: function() {
            return this._renderTarget;
        },
        _initShortcutKey: function() {
            this._shortcutkeys = {};
            this._bindshortcutKeys();
        },
        addShortcutKeys: function(cmd, keys) {
            var obj = {},
                km = this;
            if (keys) {
                obj[cmd] = keys;
            } else {
                obj = cmd;
            }
            utils.each(obj, function(k, v) {
                km._shortcutkeys[k.toLowerCase()] = v;
            });

        },
        getShortcutKey: function(cmdName) {
            return this._shortcutkeys[cmdName];
        },
        _bindshortcutKeys: function() {
            var me = this,
                shortcutkeys = this._shortcutkeys;

            function checkkey(key, keyCode, e) {
                switch (key) {
                    case 'ctrl':
                    case 'cmd':
                        if (e.ctrlKey || e.metaKey) {
                            return true;
                        }
                        break;
                    case 'alt':
                        if (e.altKey) {
                            return true;
                        }
                        break;
                    case 'shift':
                        if (e.shiftKey) {
                            return true;
                        }

                }
                if (keyCode == keymap[key]) {
                    return true;
                }
                return false;
            }
            me.on('keydown', function(e) {

                var originEvent = e.originEvent;
                var keyCode = originEvent.keyCode || originEvent.which;
                for (var i in shortcutkeys) {
                    var keys = shortcutkeys[i].toLowerCase().split('+');
                    var current = 0;
                    utils.each(keys, function(i, k) {
                        if (checkkey(k, keyCode, originEvent)) {
                            current++;
                        }
                    });

                    if (current == keys.length) {
                        if (me.queryCommandState(i) != -1)
                            me.execCommand(i);
                        originEvent.preventDefault();
                        break;
                    }

                }
            });
        },
        _initContextmenu: function() {
            this.contextmenus = [];
        },
        addContextmenu: function(item) {
            if (utils.isArray(item)) {
                this.contextmenus = this.contextmenus.concat(item);
            } else {
                this.contextmenus.push(item);
            }

            return this;
        },
        getContextmenu: function() {
            return this.contextmenus;
        },
        _initStatus: function() {
            this._status = 'normal';
            this._rollbackStatus = 'normal';
        },
        setStatus: (function() {
            var sf = ~window.location.href.indexOf('status');
            var tf = ~window.location.href.indexOf('trace');

            return function(status) {
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
        getStatus: function() {
            return this._status;
        },
        setDisabled: function() {
            var me = this;
            //禁用命令
            me.bkqueryCommandState = me.queryCommandState;
            me.bkqueryCommandValue = me.queryCommandValue;
            me.queryCommandState = function(type) {
                var cmd = this._getCommand(type);
                if (cmd && cmd.enableReadOnly === false) {
                    return me.bkqueryCommandState.apply(me, arguments);
                }
                return -1;
            };
            me.queryCommandValue = function(type) {
                var cmd = this._getCommand(type);
                if (cmd && cmd.enableReadOnly === false) {
                    return me.bkqueryCommandValue.apply(me, arguments);
                }
                return null;
            };
            this.setStatus('readonly');
            me.fire('interactchange');
        },
        setEnabled: function() {
            var me = this;

            if (me.bkqueryCommandState) {
                me.queryCommandState = me.bkqueryCommandState;
                delete me.bkqueryCommandState;
            }
            if (me.bkqueryCommandValue) {
                me.queryCommandValue = me.bkqueryCommandValue;
                delete me.bkqueryCommandValue;
            }

            this.rollbackStatus();

            me.fire('interactchange');
        }
    });
/* src/core/minder.js end */




/* src/core/minder.data.compatibility.js */
    Utils.extend(KityMinder, {
        compatibility: function(json) {

            var version = json.version || '1.1.3';

            function traverse(node, fn) {
                fn(node);
                if (node.children) node.children.forEach(function(child) {
                    traverse(child, fn);
                });
            }

            /**
             * 脑图数据升级
             * v1.1.3 => v1.2.0
             * */
            function c_113_120(json) {
                // 原本的布局风格
                var ocs = json.data.currentstyle;
                delete json.data.currentstyle;

                // 为 1.2 选择模板，同时保留老版本文件的皮肤
                if (ocs == 'bottom') {
                    json.template = 'structure';
                    json.theme = 'snow';
                } else if (ocs == 'default') {
                    json.template = 'default';
                    json.theme = 'classic';
                }

                traverse(json, function(node) {
                    var data = node.data;

                    // 升级优先级、进度图标
                    if ('PriorityIcon' in data) {
                        data.priority = data.PriorityIcon;
                        delete data.PriorityIcon;
                    }
                    if ('ProgressIcon' in data) {
                        data.progress = 1 + ((data.ProgressIcon - 1) << 1);
                        delete data.ProgressIcon;
                    }

                    // 删除过时属性
                    delete data.point;
                    delete data.layout;
                });
            }

            switch (version) {
                case '1.1.3':
                    c_113_120(json);
                case '1.2.0':
            }

            return json;
        }
    });
/* src/core/minder.data.compatibility.js end */




/* src/core/minder.data.js */
    Utils.extend(KityMinder, {
        _protocals: {},
        registerProtocal: function(name, protocalDeal) {
            KityMinder._protocals[name] = protocalDeal();
        },
        findProtocal: function(name) {
            return KityMinder._protocals[name] || null;
        },
        getSupportedProtocals: function() {
            return Utils.keys(KityMinder._protocals).sort(function(a, b) {
                return KityMinder._protocals[b].recognizePriority - KityMinder._protocals[a].recognizePriority;
            });
        },
        getAllRegisteredProtocals: function() {
            return KityMinder._protocals;
        }
    });

    var DEFAULT_TEXT = {
        'root': 'maintopic',
        'main': 'topic',
        'sub': 'topic'
    };

    // 导入导出
    kity.extendClass(Minder, {
        exportData: function(protocalName) {

            // 这里的 Json 是一个对象
            function exportNode(node) {
                var exported = {};
                exported.data = node.getData();
                var childNodes = node.getChildren();
                if (childNodes.length) {
                    exported.children = [];
                    for (var i = 0; i < childNodes.length; i++) {
                        exported.children.push(exportNode(childNodes[i]));
                    }
                }
                return exported;
            }

            var json, protocal;

            json = exportNode(this.getRoot());
            protocal = KityMinder.findProtocal(protocalName);

            if (this._fire(new MinderEvent('beforeexport', {
                json: json,
                protocalName: protocalName,
                protocal: protocal
            }, true)) === true) return;

            json.template = this.getTemplate();
            json.theme = this.getTheme();
            json.version = KityMinder.version;

            if (protocal) {
                return protocal.encode(json, this);
            } else {
                return json;
            }
        },

        importData: function(local, protocalName) {
            var json, protocal;

            if (protocalName) {
                protocal = KityMinder.findProtocal(protocalName);
            } else {
                KityMinder.getSupportedProtocals().every(function(name) {
                    var test = KityMinder.findProtocal(name);
                    if (test.recognize && test.recognize(local)) {
                        protocal = test;
                    }
                    return !protocal;
                });
            }

            if (!protocal) {
                this.fire('unknownprotocal');
                throw new Error('Unsupported protocal: ' + protocalName);
            }

            var params = {
                local: local,
                protocalName: protocalName,
                protocal: protocal
            };

            // 是否需要阻止导入
            var stoped = this._fire(new MinderEvent('beforeimport', params, true));
            if (stoped) return this;

            try {
                json = params.json || (params.json = protocal.decode(local));
            } catch (e) {
                return this.fire('parseerror', { message: e.message });
            }

            if (typeof json === 'object' && 'then' in json) {
                var self = this;
                json.then(function(data) {
                    params.json = data;
                    self._doImport(data, params);
                }).error(function() {
                    self.fire('parseerror');
                });
            } else {
                this._doImport(json, params);
            }
            return this;
        },

        _doImport: function(json, params) {

            function importNode(node, json, km) {
                var data = json.data;
                node.data = {};
                for (var field in data) {
                    node.setData(field, data[field]);
                }

                node.setData('text', data.text || km.getLang(DEFAULT_TEXT[node.getType()]));

                var childrenTreeData = json.children || [];
                for (var i = 0; i < childrenTreeData.length; i++) {
                    var childNode = km.createNode(null, node);
                    importNode(childNode, childrenTreeData[i], km);
                }
                return node;
            }

            if (!json) return;

            this._fire(new MinderEvent('preimport', params, false));

            // 删除当前所有节点
            while (this._root.getChildren().length) {
                this.removeNode(this._root.getChildren()[0]);
            }

            json = KityMinder.compatibility(json);

            importNode(this._root, json, this);

            this.setTemplate(json.template || null);
            this.setTheme(json.theme || null);
            this.refresh();

            this.fire('import', params);

            this._firePharse({
                type: 'contentchange'
            });
            this._firePharse({
                type: 'interactchange'
            });
        }
    });
/* src/core/minder.data.js end */




/* src/core/minder.event.js */
    // 事件机制
    kity.extendClass(Minder, {
        _initEvents: function() {
            this._eventCallbacks = {};
        },
        _bindEvents: function() {
            this._bindPaperEvents();
            this._bindKeyboardEvents();
        },
        _resetEvents: function() {
            this._initEvents();
            this._bindEvents();
        },
        // TODO: mousemove lazy bind
        _bindPaperEvents: function() {
            this._paper.on('click dblclick keydown keyup keypress paste mousedown contextmenu mouseup mousemove mousewheel DOMMouseScroll touchstart touchmove touchend dragenter dragleave drop', this._firePharse.bind(this));
            if (window) {
                window.addEventListener('resize', this._firePharse.bind(this));
                window.addEventListener('blur', this._firePharse.bind(this));
            }
            this._renderTarget.onfocus = function() {
                console.log('focus');
            };
            this._renderTarget.onblur = function() {
                console.log('blur');
            };
        },
        _bindKeyboardEvents: function() {
            if ((navigator.userAgent.indexOf('iPhone') == -1) && (navigator.userAgent.indexOf('iPod') == -1) && (navigator.userAgent.indexOf('iPad') == -1)) {
                //只能在这里做，要不无法触发
                Utils.listen(document.body, 'keydown keyup keypress paste', this._firePharse.bind(this));
            }
        },
        _firePharse: function(e) {
            //        //只读模式下强了所有的事件操作
            //        if(this.readOnly === true){
            //            return false;
            //        }
            var beforeEvent, preEvent, executeEvent;

            if (e.type == 'DOMMouseScroll') {
                e.type = 'mousewheel';
                e.wheelDelta = e.originEvent.wheelDelta = e.originEvent.detail * -10;
                e.wheelDeltaX = e.originEvent.mozMovementX;
                e.wheelDeltaY = e.originEvent.mozMovementY;
            }

            beforeEvent = new MinderEvent('before' + e.type, e, true);
            if (this._fire(beforeEvent)) {
                return;
            }
            preEvent = new MinderEvent('pre' + e.type, e, true);
            executeEvent = new MinderEvent(e.type, e, true);

            this._fire(preEvent) ||
                this._fire(executeEvent) ||
                this._fire(new MinderEvent('after' + e.type, e, false));

            if (~'mousedown mouseup keydown keyup'.indexOf(e.type)) {
                this._interactChange(e);
            }
        },
        _interactChange: function(e) {
            var minder = this;

            clearTimeout(this._interactTimeout);
            this._interactTimeout = setTimeout(function() {
                var stoped = minder._fire(new MinderEvent('beforeinteractchange'));
                if (stoped) {
                    return;
                }
                minder._fire(new MinderEvent('preinteractchange'));
                minder._fire(new MinderEvent('interactchange'));
            }, 20);
        },
        _listen: function(type, callback) {
            var callbacks = this._eventCallbacks[type] || (this._eventCallbacks[type] = []);
            callbacks.push(callback);
        },
        _fire: function(e) {


            var status = this.getStatus();

            var callbacks = this._eventCallbacks[e.type.toLowerCase()] || [];

            if (status) {

                callbacks = callbacks.concat(this._eventCallbacks[status + '.' + e.type.toLowerCase()] || []);
            }



            if (callbacks.length === 0) {
                return;
            }
            var lastStatus = this.getStatus();

            for (var i = 0; i < callbacks.length; i++) {

                callbacks[i].call(this, e);


                if (this.getStatus() != lastStatus || e.shouldStopPropagationImmediately()) {
                    break;
                }
            }
            return e.shouldStopPropagation();
        },
        on: function(name, callback) {
            var km = this;
            utils.each(name.split(/\s+/), function(i, n) {
                km._listen(n.toLowerCase(), callback);
            });
            return this;
        },
        off: function(name, callback) {

            var types = name.split(/\s+/);
            var i, j, callbacks, removeIndex;
            for (i = 0; i < types.length; i++) {

                callbacks = this._eventCallbacks[types[i].toLowerCase()];
                if (callbacks) {
                    removeIndex = null;
                    for (j = 0; j < callbacks.length; j++) {
                        if (callbacks[j] == callback) {
                            removeIndex = j;
                        }
                    }
                    if (removeIndex !== null) {
                        callbacks.splice(removeIndex, 1);
                    }
                }
            }
        },
        fire: function(type, params) {
            var e = new MinderEvent(type, params);
            this._fire(e);
            return this;
        }
    });
/* src/core/minder.event.js end */




/* src/core/minder.module.js */
    // 模块声明周期维护
    kity.extendClass(Minder, {
        _initModules: function() {
            var modulesPool = KityMinder.getModules();
            var modulesToLoad = this._options.modules || Utils.keys(modulesPool);

            this._commands = {};
            this._query = {};
            this._modules = {};
            this._rendererClasses = {};

            var i, name, type, module, moduleDeals,
                dealCommands, dealEvents, dealRenderers;

            var me = this;
            for (i = 0; i < modulesToLoad.length; i++) {
                name = modulesToLoad[i];

                if (!modulesPool[name]) continue;

                // 执行模块初始化，抛出后续处理对象

                if (typeof(modulesPool[name]) == 'function') {
                    moduleDeals = modulesPool[name].call(me);
                } else {
                    moduleDeals = modulesPool[name];
                }
                this._modules[name] = moduleDeals;

                if (moduleDeals.init) {
                    moduleDeals.init.call(me, this._options);
                }

                // command加入命令池子
                dealCommands = moduleDeals.commands;
                for (name in dealCommands) {
                    this._commands[name.toLowerCase()] = new dealCommands[name]();
                }

                // 绑定事件
                dealEvents = moduleDeals.events;
                if (dealEvents) {
                    for (type in dealEvents) {
                        me.on(type, dealEvents[type]);
                    }
                }

                // 渲染器
                dealRenderers = moduleDeals.renderers;

                if (dealRenderers) {

                    for (type in dealRenderers) {
                        this._rendererClasses[type] = this._rendererClasses[type] || [];

                        if (Utils.isArray(dealRenderers[type])) {
                            this._rendererClasses[type] = this._rendererClasses[type].concat(dealRenderers[type]);
                        } else {
                            this._rendererClasses[type].push(dealRenderers[type]);
                        }
                    }
                }

                if (moduleDeals.defaultOptions) {
                    this.setDefaultOptions(moduleDeals.defaultOptions);
                }

                //添加模块的快捷键
                if (moduleDeals.addShortcutKeys) {
                    this.addShortcutKeys(moduleDeals.addShortcutKeys);
                }

                //添加邮件菜单
                if (moduleDeals.contextmenu) {
                    this.addContextmenu(moduleDeals.contextmenu);
                }
            }
        },

        _garbage: function() {
            this.clearSelect();

            while (this._root.getChildren().length) {
                this._root.removeChild(0);
            }
        },

        destroy: function() {
            var modules = this._modules;

            this._resetEvents();
            this._garbage();

            for (var key in modules) {
                if (!modules[key].destroy) continue;
                modules[key].destroy.call(this);
            }
        },

        reset: function() {
            var modules = this._modules;

            this._garbage();

            for (var key in modules) {
                if (!modules[key].reset) continue;
                modules[key].reset.call(this);
            }
        }
    });
/* src/core/minder.module.js end */




/* src/core/minder.command.js */
    kity.extendClass(Minder, {
        _getCommand: function (name) {
            return this._commands[name.toLowerCase()];
        },

        _queryCommand: function (name, type, args) {
            var cmd = this._getCommand(name);
            if (cmd) {
                var queryCmd = cmd['query' + type];
                if (queryCmd)
                    return queryCmd.apply(cmd, [this].concat(args));
            }
            return 0;
        },

        queryCommandState: function (name) {
            return this._queryCommand(name, "State", Utils.argsToArray(1));
        },

        queryCommandValue: function (name) {
            return this._queryCommand(name, "Value", Utils.argsToArray(1));
        },

        execCommand: function (name) {
            name = name.toLowerCase();

            var cmdArgs = Utils.argsToArray(arguments, 1),
                cmd, stoped, result, eventParams;
            var me = this;
            cmd = this._getCommand(name);

            eventParams = {
                command: cmd,
                commandName: name.toLowerCase(),
                commandArgs: cmdArgs
            };
            if (!cmd || !~this.queryCommandState(name)) {
                return false;
            }

            if (!this._hasEnterExecCommand && cmd.isNeedUndo()) {
                this._hasEnterExecCommand = true;
                stoped = this._fire(new MinderEvent('beforeExecCommand', eventParams, true));

                if (!stoped) {
                    //保存场景
                    this._fire(new MinderEvent('saveScene'));

                    this._fire(new MinderEvent("preExecCommand", eventParams, false));

                    result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

                    this._fire(new MinderEvent('execCommand', eventParams, false));

                    //保存场景
                    this._fire(new MinderEvent('saveScene'));

                    if (cmd.isContentChanged()) {
                        this._firePharse(new MinderEvent('contentchange'));
                    }
                    if (cmd.isSelectionChanged()) {
                        this._firePharse(new MinderEvent('selectionchange'));
                    }
                    this._firePharse(new MinderEvent('interactchange'));
                }
                this._hasEnterExecCommand = false;
            } else {
                result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

                if (!this._hasEnterExecCommand) {
                    if (cmd.isSelectionChanged()) {
                        this._firePharse(new MinderEvent('selectionchange'));
                    }

                    this._firePharse(new MinderEvent('interactchange'));
                }
            }

            return result === undefined ? null : result;
        }
    });
/* src/core/minder.command.js end */




/* src/core/minder.node.js */
    kity.extendClass(Minder, {

        getRoot: function() {
            return this._root;
        },

        setRoot: function(root) {
            this._root = root;
            root.minder = this;
        },

        createNode: function(unknown, parent, index) {
            var node = new MinderNode(unknown);
            this.fire('nodecreate', { node: node });
            this.appendNode(node,parent, index);
            return node;
        },

        appendNode: function(node, parent, index) {
            if (parent) parent.insertChild(node, index);
            this.attachNode(node);
            return this;
        },

        removeNode: function(node) {
            if (node.parent) {
                node.parent.removeChild(node);
                this.detachNode(node);
                this.fire('noderemove', { node: node });
            }
        },

        attachNode: function(node) {
            var rc = this._rc;
            node.traverse(function(current) {
                current.attached = true;
                rc.addShape(current.getRenderContainer());
            });
            rc.addShape(node.getRenderContainer());
            this.fire('nodeattach', {
                node: node
            });
        },

        detachNode: function(node) {
            var rc = this._rc;
            node.traverse(function(current) {
                current.attached = false;
                rc.removeShape(current.getRenderContainer());
            });
            this.fire('nodedetach', {
                node: node
            });
        },

        getMinderTitle: function() {
            return this.getRoot().getText();
        }

    });

    kity.extendClass(MinderNode, {
        getMinder: function() {
            return this.getRoot().minder;
        }
    });
/* src/core/minder.node.js end */




/* src/core/minder.select.js */
    // 选区管理
    kity.extendClass(Minder, {
        _initSelection: function() {
            this._selectedNodes = [];
        },
        renderChangedSelection: function(last) {
            var current = this.getSelectedNodes();
            var changed = [];
            var i = 0;

            current.forEach(function(node) {
                if (last.indexOf(node) == -1) {
                    changed.push(node);
                    node.setTmpData('selected', true);
                }
            });

            last.forEach(function(node) {
                if (current.indexOf(node) == -1) {
                    changed.push(node);
                    node.setTmpData('selected', false);
                }
            });

            if (changed.length) this.fire('interactchange');
            while (i < changed.length) changed[i++].render();
        },
        getSelectedNodes: function() {
            //不能克隆返回，会对当前选区操作，从而影响querycommand
            return this._selectedNodes;
        },
        getSelectedNode: function() {
            return this.getSelectedNodes()[0] || null;
        },
        removeAllSelectedNodes: function() {
            var me = this;
            var last = this._selectedNodes.splice(0);
            this._selectedNodes = [];
            this.renderChangedSelection(last);
            return this.fire('selectionclear');
        },
        removeSelectedNodes: function(nodes) {
            var me = this;
            var last = this._selectedNodes.slice(0);
            nodes = Utils.isArray(nodes) ? nodes : [nodes];
            Utils.each(nodes, function(i, n) {
                var index;
                if ((index = me._selectedNodes.indexOf(n)) === -1) return;
                me._selectedNodes.splice(index, 1);
            });
            this.renderChangedSelection(last);
            return this;
        },
        select: function(nodes, isSingleSelect) {
            var lastSelect = this.getSelectedNodes().slice(0);
            if (isSingleSelect) {
                this._selectedNodes = [];
            }
            var me = this;
            nodes = Utils.isArray(nodes) ? nodes : [nodes];
            Utils.each(nodes, function(i, n) {
                if (me._selectedNodes.indexOf(n) !== -1) return;
                me._selectedNodes.push(n);
            });
            this.renderChangedSelection(lastSelect);
            return this;
        },

        //当前选区中的节点在给定的节点范围内的保留选中状态，
        //没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
        toggleSelect: function(node) {
            if (Utils.isArray(node)) {
                node.forEach(this.toggleSelect.bind(this));
            } else {
                if (node.isSelected()) this.removeSelectedNodes(node);
                else this.select(node);
            }
            return this;
        },

        isSingleSelect: function() {
            return this._selectedNodes.length == 1;
        },

        getSelectedAncestors: function(includeRoot) {
            var nodes = this.getSelectedNodes().slice(0),
                ancestors = [],
                judge;

            // 根节点不参与计算
            var rootIndex = nodes.indexOf(this.getRoot());
            if (~rootIndex && !includeRoot) {
                nodes.splice(rootIndex, 1);
            }

            // 判断 nodes 列表中是否存在 judge 的祖先
            function hasAncestor(nodes, judge) {
                for (var i = nodes.length - 1; i >= 0; --i) {
                    if (nodes[i].isAncestorOf(judge)) return true;
                }
                return false;
            }

            // 按照拓扑排序
            nodes.sort(function(node1, node2) {
                return node1.getLevel() - node2.getLevel();
            });

            // 因为是拓扑有序的，所以只需往上查找
            while ((judge = nodes.pop())) {
                if (!hasAncestor(nodes, judge)) {
                    ancestors.push(judge);
                }
            }

            return ancestors;
        }
    });

    kity.extendClass(MinderNode, {
        isSelected: function() {
            return this.getTmpData('selected');
        },
        clearSelectedFlag:function(){
            this.setTmpData('selected');
        },
        setSelectedFlag:function(){
            this.setTmpData('selected',true);
        }
    });
/* src/core/minder.select.js end */




/* src/core/keymap.js */
    var keymap = KityMinder.keymap = (function(origin) {
        var ret = {};
        for (var key in origin) {
            if (origin.hasOwnProperty(key)) {
                ret[key] = origin[key];
                ret[key.toLowerCase()] = origin[key];
            }
        }
        return ret;
    })({
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,

        'Shift': 16,
        'Control': 17,
        'Alt': 18,
        'CapsLock': 20,

        'Esc': 27,

        'Spacebar': 32,

        'PageUp': 33,
        'PageDown': 34,
        'End': 35,
        'Home': 36,


        'Left': 37,
        'Up': 38,
        'Right': 39,
        'Down': 40,

        'direction':{
            37:1,
            38:1,
            39:1,
            40:1
        },
        'Insert': 45,

        'Del': 46,

        'NumLock': 144,

        'Cmd': 91,
        'CmdFF':224,
        'F2': 113,
        'F3': 114,
        'F4': 115,

        '=': 187,
        '-': 189,

        'b': 66,
        'i': 73,
        //回退
        'z': 90,
        'y': 89,

        //复制粘贴
        'v': 86,
        'x': 88,
        'c': 67,

        's': 83,

        'n': 78,
        '/': 191,
        '.': 190,
        controlKeys:{
            16:1,
            17:1,
            18:1,
            20:1,
            91:1,
            224:1
        },
        'notContentChange': {
            13: 1,
            9: 1,

            33: 1,
            34: 1,
            35: 1,
            36: 1,

            16: 1,
            17: 1,
            18: 1,
            20: 1,
            91: 1,

            //上下左右
            37: 1,
            38: 1,
            39: 1,
            40: 1,

            113: 1,
            114: 1,
            115: 1,
            144: 1,
            27: 1
        },

        'isSelectedNodeKey': {
            //上下左右
            37: 1,
            38: 1,
            39: 1,
            40: 1,
            13: 1,
            9: 1
        },
        'a':65

    });
/* src/core/keymap.js end */




/* src/core/minder.lang.js */
    //添加多语言模块
    kity.extendClass( Minder, {
        getLang: function ( path ) {

            var lang = KM.LANG[ this.getOptions( 'lang' ) ];
            if ( !lang ) {
                throw Error( "not import language file" );
            }
            path = ( path || "" ).split( "." );
            for ( var i = 0, ci; ci = path[ i++ ]; ) {
                lang = lang[ ci ];
                if ( !lang ) break;
            }
            return lang;
        }
    } );
/* src/core/minder.lang.js end */




/* src/core/minder.defaultoptions.js */
    //这里只放不是由模块产生的默认参数
    KM.defaultOptions = {
        zIndex : 1000,
        lang:'zh-cn',
        readyOnly:false
    };
/* src/core/minder.defaultoptions.js end */




/* src/core/minder.preference.js */
    kity.extendClass( Minder, function(){

        var ROOTKEY = 'kityminder_preference';

        //创建存储机制
        var LocalStorage = ( function () {

            var storage = window.localStorage,
                LOCAL_FILE = "localStorage";

            return {

                saveLocalData: function ( key, data ) {

                    if ( storage && data) {
                        storage.setItem( key, data  );
                        return true;
                    }

                    return false;

                },

                getLocalData: function ( key ) {

                    if ( storage ) {
                        return storage.getItem( key );
                    }

                    return null;

                },

                removeItem: function ( key ) {

                    storage && storage.removeItem( key );

                }

            };

        } )();
        return {
            setPreferences:function(key,value){
                var obj = {};
                if ( Utils.isString( key ) ) {
                    obj[ key ] = value;
                } else {
                    obj = key;
                }
                var data = LocalStorage.getLocalData(ROOTKEY);
                if(data){
                    data = JSON.parse(data);
                    utils.extend(data, obj);
                }else{
                    data = obj;
                }
                LocalStorage.saveLocalData(ROOTKEY,JSON.stringify(data));
            },
            getPreferences:function(key){
                var data = LocalStorage.getLocalData(ROOTKEY);
                if(data){
                    data = JSON.parse(data);
                    return key ? data[key] : data
                }
                return null;
            },
            resetPreferences:function(pres){
                var str = pres ? JSON.stringify(pres) : '';
                LocalStorage.saveLocalData(str)
            }
        }

    }() );
/* src/core/minder.preference.js end */




/* src/core/browser.js */
    /**
     * 浏览器判断模块
     * @file
     * @module UE.browser
     * @since 1.2.6.1
     */

    /**
     * 提供浏览器检测的模块
     * @unfile
     * @module KM.browser
     */
    var browser = KityMinder.browser = function(){
        var agent = navigator.userAgent.toLowerCase(),
            opera = window.opera,
            browser = {
            /**
             * @property {boolean} ie 检测当前浏览器是否为IE
             * @example
             * ```javascript
             * if ( UE.browser.ie ) {
             *     console.log( '当前浏览器是IE' );
             * }
             * ```
             */
            ie		:  /(msie\s|trident.*rv:)([\w.]+)/.test(agent),

            /**
             * @property {boolean} opera 检测当前浏览器是否为Opera
             * @example
             * ```javascript
             * if ( UE.browser.opera ) {
             *     console.log( '当前浏览器是Opera' );
             * }
             * ```
             */
            opera	: ( !!opera && opera.version ),

            /**
             * @property {boolean} webkit 检测当前浏览器是否是webkit内核的浏览器
             * @example
             * ```javascript
             * if ( UE.browser.webkit ) {
             *     console.log( '当前浏览器是webkit内核浏览器' );
             * }
             * ```
             */
            webkit	: ( agent.indexOf( ' applewebkit/' ) > -1 ),

            /**
             * @property {boolean} mac 检测当前浏览器是否是运行在mac平台下
             * @example
             * ```javascript
             * if ( UE.browser.mac ) {
             *     console.log( '当前浏览器运行在mac平台下' );
             * }
             * ```
             */
            mac	: ( agent.indexOf( 'macintosh' ) > -1 ),

            /**
             * @property {boolean} quirks 检测当前浏览器是否处于“怪异模式”下
             * @example
             * ```javascript
             * if ( UE.browser.quirks ) {
             *     console.log( '当前浏览器运行处于“怪异模式”' );
             * }
             * ```
             */
            quirks : ( document.compatMode == 'BackCompat' ),

            ipad :  ( agent.indexOf( 'ipad' ) > -1 )
        };

        /**
        * @property {boolean} gecko 检测当前浏览器内核是否是gecko内核
        * @example
        * ```javascript
        * if ( UE.browser.gecko ) {
        *     console.log( '当前浏览器内核是gecko内核' );
        * }
        * ```
        */
        browser.gecko =( navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

        var version = 0;

        // Internet Explorer 6.0+
        if ( browser.ie ){

            var v1 =  agent.match(/(?:msie\s([\w.]+))/);
            var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
            if(v1 && v2 && v1[1] && v2[1]){
                version = Math.max(v1[1]*1,v2[1]*1);
            }else if(v1 && v1[1]){
                version = v1[1]*1;
            }else if(v2 && v2[1]){
                version = v2[1]*1;
            }else{
                version = 0;
            }

            browser.ie11Compat = document.documentMode == 11;
            /**
             * @property { boolean } ie9Compat 检测浏览器模式是否为 IE9 兼容模式
             * @warning 如果浏览器不是IE， 则该值为undefined
             * @example
             * ```javascript
             * if ( UE.browser.ie9Compat ) {
             *     console.log( '当前浏览器运行在IE9兼容模式下' );
             * }
             * ```
             */
            browser.ie9Compat = document.documentMode == 9;

            /**
             * @property { boolean } ie8 检测浏览器是否是IE8浏览器
             * @warning 如果浏览器不是IE， 则该值为undefined
             * @example
             * ```javascript
             * if ( UE.browser.ie8 ) {
             *     console.log( '当前浏览器是IE8浏览器' );
             * }
             * ```
             */
            browser.ie8 = !!document.documentMode;

            /**
             * @property { boolean } ie8Compat 检测浏览器模式是否为 IE8 兼容模式
             * @warning 如果浏览器不是IE， 则该值为undefined
             * @example
             * ```javascript
             * if ( UE.browser.ie8Compat ) {
             *     console.log( '当前浏览器运行在IE8兼容模式下' );
             * }
             * ```
             */
            browser.ie8Compat = document.documentMode == 8;

            /**
             * @property { boolean } ie7Compat 检测浏览器模式是否为 IE7 兼容模式
             * @warning 如果浏览器不是IE， 则该值为undefined
             * @example
             * ```javascript
             * if ( UE.browser.ie7Compat ) {
             *     console.log( '当前浏览器运行在IE7兼容模式下' );
             * }
             * ```
             */
            browser.ie7Compat = ( ( version == 7 && !document.documentMode )
                    || document.documentMode == 7 );

            /**
             * @property { boolean } ie6Compat 检测浏览器模式是否为 IE6 模式 或者怪异模式
             * @warning 如果浏览器不是IE， 则该值为undefined
             * @example
             * ```javascript
             * if ( UE.browser.ie6Compat ) {
             *     console.log( '当前浏览器运行在IE6模式或者怪异模式下' );
             * }
             * ```
             */
            browser.ie6Compat = ( version < 7 || browser.quirks );

            browser.ie9above = version > 8;

            browser.ie9below = version < 9;

        }

        // Gecko.
        if ( browser.gecko ){
            var geckoRelease = agent.match( /rv:([\d\.]+)/ );
            if ( geckoRelease )
            {
                geckoRelease = geckoRelease[1].split( '.' );
                version = geckoRelease[0] * 10000 + ( geckoRelease[1] || 0 ) * 100 + ( geckoRelease[2] || 0 ) * 1;
            }
        }

        /**
         * @property { Number } chrome 检测当前浏览器是否为Chrome, 如果是，则返回Chrome的大版本号
         * @warning 如果浏览器不是chrome， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.chrome ) {
         *     console.log( '当前浏览器是Chrome' );
         * }
         * ```
         */
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = + RegExp['\x241'];
        }

        /**
         * @property { Number } safari 检测当前浏览器是否为Safari, 如果是，则返回Safari的大版本号
         * @warning 如果浏览器不是safari， 则该值为undefined
         * @example
         * ```javascript
         * if ( UE.browser.safari ) {
         *     console.log( '当前浏览器是Safari' );
         * }
         * ```
         */
        if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)){
        	browser.safari = + (RegExp['\x241'] || RegExp['\x242']);
        }


        // Opera 9.50+
        if ( browser.opera )
            version = parseFloat( opera.version() );

        // WebKit 522+ (Safari 3+)
        if ( browser.webkit )
            version = parseFloat( agent.match( / applewebkit\/(\d+)/ )[1] );

        /**
         * @property { Number } version 检测当前浏览器版本号
         * @remind
         * <ul>
         *     <li>IE系列返回值为5,6,7,8,9,10等</li>
         *     <li>gecko系列会返回10900，158900等</li>
         *     <li>webkit系列会返回其build号 (如 522等)</li>
         * </ul>
         * @example
         * ```javascript
         * console.log( '当前浏览器版本号是： ' + UE.browser.version );
         * ```
         */
        browser.version = version;

        /**
         * @property { boolean } isCompatible 检测当前浏览器是否能够与UEditor良好兼容
         * @example
         * ```javascript
         * if ( UE.browser.isCompatible ) {
         *     console.log( '浏览器与UEditor能够良好兼容' );
         * }
         * ```
         */
        browser.isCompatible =
            !browser.mobile && (
            ( browser.ie && version >= 6 ) ||
            ( browser.gecko && version >= 10801 ) ||
            ( browser.opera && version >= 9.5 ) ||
            ( browser.air && version >= 1 ) ||
            ( browser.webkit && version >= 522 ) ||
            false );
        return browser;
    }();
    //快捷方式
    var ie = browser.ie,
        webkit = browser.webkit,
        gecko = browser.gecko,
        opera = browser.opera;
/* src/core/browser.js end */




/* src/core/layout.js */
    /**
     * 布局支持池子管理
     */
    Utils.extend(KityMinder, {
        _layout: {},

        registerLayout: function(name, layout) {
            KityMinder._layout[name] = layout;
            if (!KityMinder._defaultLayout) {
                KityMinder._defaultLayout = name;
            }
        },

        getLayoutList: function() {
            return this._layout;
        }
    });

    /**
     * MinderNode 上的布局支持
     */
    kity.extendClass(MinderNode, {

        /**
         * 获得当前节点的布局名称
         *
         * @return {String}
         */
        getLayout: function() {
            var layout = this.getData('layout');

            layout = layout || (this.isRoot() ? KityMinder._defaultLayout : this.parent.getLayout());

            return layout;
        },

        getOrder: function() {
            return this.getData('order') || this.getIndex();
        },

        setOrder: function(order) {
            return this.setData('order', order);
        },

        getOrderHint: function(refer) {
            return this.parent.getLayoutInstance().getOrderHint(this);
        },

        getExpandPosition: function() {
            return this.getLayoutInstance().getExpandPosition();
        },

        getLayoutInstance: function() {
            var LayoutClass = KityMinder._layout[this.getLayout()];
            var layout = new LayoutClass();
            return layout;
        },

        /**
         * 设置当前节点相对于父节点的布局变换
         */
        setLayoutTransform: function(matrix) {
            this._layoutTransform = matrix;
        },

        /**
         * 获取当前节点相对于父节点的布局变换
         */
        getLayoutTransform: function() {
            return this._layoutTransform || new kity.Matrix();
        },

        /**
         * 设置当前节点相对于父节点的布局向量
         */
        setLayoutVector: function(vector) {
            this._layoutVector = vector;
            return this;
        },

        /**
         * 获取当前节点相对于父节点的布局向量
         */
        getLayoutVector: function(vector) {
            return this._layoutVector || new kity.Vector();
        },

        /**
         * 获取节点相对于全局的布局变换
         */
        getGlobalLayoutTransform: function() {
            return this._lastLayoutTransform || new kity.Matrix();
        },

        getLayoutBox: function() {
            var matrix = this.getGlobalLayoutTransform();
            return matrix.transformBox(this.getContentBox());
        },

        getLayoutPoint: function() {
            var matrix = this.getGlobalLayoutTransform();
            return matrix.transformPoint(new kity.Point());
        },

        getLayoutOffset: function() {
            var data = this.getData('layout_' + this.getLayout() + '_offset');
            if (data) return new kity.Point(data.x, data.y);
            return new kity.Point();
        },

        setLayoutOffset: function(p) {
            this.setData('layout_' + this.getLayout() + '_offset', p ? {
                x: p.x,
                y: p.y
            } : null);
            return this;
        },

        setVertexIn: function(p) {
            this._vertexIn = p;
        },

        setVertexOut: function(p) {
            this._vertexOut = p;
        },

        getVertexIn: function() {
            return this._vertexIn || new kity.Point();
        },

        getVertexOut: function() {
            return this._vertexOut || new kity.Point();
        },

        getLayoutVertexIn: function() {
            return this.getGlobalLayoutTransform().transformPoint(this.getVertexIn());
        },

        getLayoutVertexOut: function() {
            return this.getGlobalLayoutTransform().transformPoint(this.getVertexOut());
        },

        getLayoutRoot: function() {
            if (this.isLayoutRoot()) {
                return this;
            }
            return this.parent.getLayoutRoot();
        },

        isLayoutRoot: function() {
            return this.getData('layout') || this.isRoot();
        },

        layout: function(name, duration) {
            if (name) {
                if (name == 'inherit') {
                    this.setData('layout');
                } else {
                    this.setData('layout', name);
                }
            }

            this.getMinder().layout(duration);

            return this;
        }
    });

    kity.extendClass(Minder, {

        layout: function(duration) {

            this.getRoot().traverse(function(node) {
                node.setLayoutTransform(null);
            });

            function layoutNode(node) {

                // layout all children first
                // 剪枝：收起的节点无需计算
                if (node.isExpanded()) {
                    node.children.forEach(function(child) {
                        layoutNode(child);
                    });
                }

                var layout = node.getLayoutInstance();
                layout.doLayout(node);
            }

            layoutNode(this.getRoot());

            this.applyLayoutResult(this.getRoot(), duration);

            return this.fire('layout');
        },

        refresh: function(duration) {
            this.getRoot().renderTree();
            this.layout(duration).fire('contentchange').fire('interactchange');
            return this;
        },

        applyLayoutResult: function(root, duration) {
            root = root || this.getRoot();
            var me = this;
            var complex = root.getComplex();

            function consume() {
                if (!--complex) me.fire('layoutallfinish');
            }

            // 节点复杂度大于 100，关闭动画
            if (complex > 300) duration = 0;

            function applyMatrix(node, matrix) {
                node.getRenderContainer().setMatrix(node._lastLayoutTransform = matrix);
                me.fire('layoutapply', {
                    node: node,
                    matrix: matrix
                });
            }

            function apply(node, pMatrix) {
                var matrix = node.getLayoutTransform().merge(pMatrix);
                var lastMatrix = node._lastLayoutTransform || new kity.Matrix();

                var offset = node.getLayoutOffset();
                matrix.translate(offset.x, offset.y);

                matrix.m.e = Math.round(matrix.m.e);
                matrix.m.f = Math.round(matrix.m.f);


                // 如果当前有动画，停止动画
                if (node._layoutTimeline) {
                    node._layoutTimeline.stop();
                    node._layoutTimeline = null;
                }

                // 如果要求以动画形式来更新，创建动画
                if (duration) {
                    node._layoutTimeline = new kity.Animator(lastMatrix, matrix, applyMatrix)
                        .start(node, duration + 300, 'ease')
                        .on('finish', function() {
                            //可能性能低的时候会丢帧，手动添加一帧
                            kity.Timeline.requestFrame(function() {
                                applyMatrix(node, matrix);
                                me.fire('layoutfinish', {
                                    node: node,
                                    matrix: matrix
                                });
                                consume();
                            });
                        });
                }

                // 否则直接更新
                else {
                    applyMatrix(node, matrix);
                    me.fire('layoutfinish', {
                        node: node,
                        matrix: matrix
                    });
                    consume();
                }

                for (var i = 0; i < node.children.length; i++) {
                    apply(node.children[i], matrix);
                }
            }

            apply(root, root.parent ? root.parent.getGlobalLayoutTransform() : new kity.Matrix());
            return this;
        },
    });


    /**
     * @class Layout 布局基类，具体布局需要从该类派生
     */
    var Layout = kity.createClass('Layout', {

        /**
         * @abstract
         *
         * 子类需要实现的布局算法，该算法输入一个节点，排布该节点的子节点（相对父节点的变换）
         *
         * @param  {MinderNode} node 需要布局的节点
         *
         * @example
         *
         * doLayout: function(node) {
         *     var children = node.getChildren();
         *     // layout calculation
         *     children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
         * }
         */
        doLayout: function(node) {
            throw new Error('Not Implement: Layout.doLayout()');
        },

        /**
         * 工具方法：获取给点的节点所占的布局区域
         *
         * @param  {MinderNode[]} nodes 需要计算的节点
         *
         * @return {Box} 计算结果
         */
        getBranchBox: function(nodes) {
            var box = {
                x: 0,
                y: 0,
                height: 0,
                width: 0
            };
            var g = KityMinder.Geometry;
            var i, node, matrix, contentBox;
            for (i = 0; i < nodes.length; i++) {
                node = nodes[i];
                matrix = node.getLayoutTransform();
                contentBox = node.getContentBox();
                box = g.mergeBox(box, matrix.transformBox(contentBox));
            }

            return box;
        },

        /**
         * 工具方法：计算给定的节点的子树所占的布局区域
         *
         * @param  {MinderNode} nodes 需要计算的节点
         *
         * @return {Box} 计算的结果
         */
        getTreeBox: function(nodes) {

            var i, node, matrix, treeBox;

            var g = KityMinder.Geometry;

            var box = {
                x: 0,
                y: 0,
                height: 0,
                width: 0
            };

            if (!(nodes instanceof Array)) nodes = [nodes];

            for (i = 0; i < nodes.length; i++) {
                node = nodes[i];
                matrix = node.getLayoutTransform();

                treeBox = node.getContentBox();

                if (node.children.length) {
                    treeBox = g.mergeBox(treeBox, this.getTreeBox(node.children));
                }

                box = g.mergeBox(box, matrix.transformBox(treeBox));
            }

            return box;
        },

        getOrderHint: function(node) {
            return [];
        }
    });
/* src/core/layout.js end */




/* src/core/connect.js */
    /* global Renderer: true */

    utils.extend(KityMinder, {
        _connectProviders: {},

        _defaultConnectProvider: function(node, parent, connection) {
            connection.setPathData([
                'M', parent.getLayoutPoint(),
                'L', node.getLayoutPoint()
            ]);
        },

        registerConnectProvider: function(layout, provider) {
            KityMinder._connectProviders[layout] = provider;
        },

        getConnectProvider: function(layout) {
            return KityMinder._connectProviders[layout] || KityMinder._defaultConnectProvider;
        }
    });

    kity.extendClass(Minder, {

        createConnect: function(node) {
            if (node.isRoot()) return;

            var connection = new kity.Path();

            node._connection = connection;

            if (!this._connectContainer) {
                this._connectContainer = new kity.Group().setId(KityMinder.uuid('minder_connect_group'));
                this.getRenderContainer().prependShape(this._connectContainer);
            }

            this._connectContainer.addShape(connection);
            this.updateConnect(node);
        },

        removeConnect: function(node) {
            var me = this;
            node.traverse(function(node) {
                me._connectContainer.removeShape(node._connection);
            });
        },

        updateConnect: function(node) {

            var connection = node._connection;
            var parent = node.parent;

            if (!parent) return;

            if (parent.isCollapsed()) {
                connection.setVisible(false);
                return;
            }
            connection.setVisible(true);

            var provider = KityMinder.getConnectProvider(parent.getLayout());

            var strokeColor = node.getStyle('connect-color') || 'white',
                strokeWidth = node.getStyle('connect-width') || 2;

            connection.stroke(strokeColor, strokeWidth);

            provider(node, parent, connection, strokeWidth, strokeColor);
        }
    });

    KityMinder.registerModule('Connect', {
        events: {
            'nodeattach': function(e) {
                this.createConnect(e.node);
            },
            'nodedetach': function(e) {
                this.removeConnect(e.node);
            },
            'layoutapply layoutfinish noderender': function(e) {
                this.updateConnect(e.node);
            }
        }
    });
/* src/core/connect.js end */




/* src/core/render.js */
    var Renderer = KityMinder.Renderer = kity.createClass('Renderer', {
        constructor: function(node) {
            this.node = node;
        },

        create: function() {
            throw new Error('Not implement: Renderer.create()');
        },

        shouldRender: function() {
            return true;
        },

        update: function() {
            throw new Error('Not implement: Renderer.update()');
        },

        getRenderShape: function() {
            return this._renderShape || null;
        },

        setRenderShape: function(shape) {
            this._renderShape = shape;
        }
    });

    kity.extendClass(Minder, (function() {

        function createRendererForNode(node, registered) {
            var renderers = [];

            ['center', 'left', 'right', 'top', 'bottom', 'outline', 'outside'].forEach(function(section) {
                var before = 'before' + section;
                var after = 'after' + section;

                if (registered[before]) {
                    renderers = renderers.concat(registered[before]);
                }
                if (registered[section]) {
                    renderers = renderers.concat(registered[section]);
                }
                if (registered[after]) {
                    renderers = renderers.concat(registered[after]);
                }
            });

            node._renderers = renderers.map(function(Renderer) {
                return new Renderer(node);
            });
        }

        return {

            renderNodeBatch: function(nodes) {
                var rendererClasses = this._rendererClasses;
                var lastBoxes = [];
                var rendererCount = 0;
                var i, j, renderer, node;

                if (!nodes.length) return;

                for (j = 0; j < nodes.length; j++) {
                    node = nodes[j];
                    if (!node._renderers) {
                        createRendererForNode(node, rendererClasses);
                    }
                    node._contentBox = new kity.Box();
                    this.fire('beforerender', {
                        node: node
                    });
                }

                // 所有节点渲染器数量是一致的
                rendererCount = nodes[0]._renderers.length;

                for (i = 0; i < rendererCount; i++) {

                    // 获取延迟盒子数据
                    for (j = 0; j < nodes.length; j++) {
                        if (typeof(lastBoxes[j]) == 'function') {
                            lastBoxes[j] = lastBoxes[j]();
                        }
                        if (!(lastBoxes[j] instanceof kity.Box)) {
                            lastBoxes[j] = new kity.Box(lastBoxes[j]);
                        }
                    }

                    for (j = 0; j < nodes.length; j++) {
                        node = nodes[j];
                        renderer = node._renderers[i];

                        // 合并盒子
                        if (lastBoxes[j]) {
                            node._contentBox = node._contentBox.merge(lastBoxes[j]);
                        }

                        // 判断当前上下文是否应该渲染
                        if (renderer.shouldRender(node)) {

                            // 应该渲染，但是渲染图形没创建过，需要创建
                            if (!renderer.getRenderShape()) {
                                renderer.setRenderShape(renderer.create(node));
                                if (renderer.bringToBack) {
                                    node.getRenderContainer().prependShape(renderer.getRenderShape());
                                } else {
                                    node.getRenderContainer().appendShape(renderer.getRenderShape());
                                }
                            }

                            // 强制让渲染图形显示
                            renderer.getRenderShape().setVisible(true);

                            // 更新渲染图形
                            lastBoxes[j] = renderer.update(renderer.getRenderShape(), node, node._contentBox);
                        }

                        // 如果不应该渲染，但是渲染图形创建过了，需要隐藏起来
                        else if (renderer.getRenderShape()) {
                            renderer.getRenderShape().setVisible(false);
                            lastBoxes[j] = null;
                        }
                    }
                }

                for (j = 0; j < nodes.length; j++) {
                    this.fire('noderender', {
                        node: nodes[j]
                    });
                }
            },

            renderNode: function(node) {
                var rendererClasses = this._rendererClasses;
                var g = KityMinder.Geometry;
                var i, latestBox, renderer;

                if (!node._renderers) {
                    createRendererForNode(node, rendererClasses);
                }

                this.fire('beforerender', {
                    node: node
                });

                node._contentBox = g.wrapBox({
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                });

                node._renderers.forEach(function(renderer) {

                    // 判断当前上下文是否应该渲染
                    if (renderer.shouldRender(node)) {

                        // 应该渲染，但是渲染图形没创建过，需要创建
                        if (!renderer.getRenderShape()) {
                            renderer.setRenderShape(renderer.create(node));
                            if (renderer.bringToBack) {
                                node.getRenderContainer().prependShape(renderer.getRenderShape());
                            } else {
                                node.getRenderContainer().appendShape(renderer.getRenderShape());
                            }
                        }

                        // 强制让渲染图形显示
                        renderer.getRenderShape().setVisible(true);

                        // 更新渲染图形
                        latestBox = renderer.update(renderer.getRenderShape(), node, node._contentBox);

                        if (typeof(latestBox) == 'function') latestBox = latestBox();

                        // 合并渲染区域
                        if (latestBox) {
                            node._contentBox = g.mergeBox(node._contentBox, latestBox);
                        }
                    }

                    // 如果不应该渲染，但是渲染图形创建过了，需要隐藏起来
                    else if (renderer.getRenderShape()) {
                        renderer.getRenderShape().setVisible(false);
                    }

                });

                this.fire('noderender', {
                    node: node
                });
            }
        };
    })());

    kity.extendClass(MinderNode, {
        render: function() {
            if (!this.attached) return;
            this.getMinder().renderNode(this);
            return this;
        },
        renderTree: function() {
            if (!this.attached) return;
            var list = [];
            this.traverse(function(node) {
                list.push(node);
            });
            this.getMinder().renderNodeBatch(list);
            return this;
        },
        getRenderer: function(type) {
            var rs = this._renderers;
            for (var i = 0; i < rs.length; i++) {
                if (rs[i].getType() == type) return rs[i];
            }
            return null;
        },
        getContentBox: function() {
            //if (!this._contentBox) this.render();
            return this.parent && this.parent.isCollapsed() ? new kity.Box() : (this._contentBox || new kity.Box());
        }
    });
/* src/core/render.js end */




/* src/core/theme.js */
    var cssLikeValueMatcher = {
        left: function(value) {
            return 3 in value && value[3] ||
                1 in value && value[1] ||
                value[0];
        },
        right: function(value) {
            return 1 in value && value[1] || value[0];
        },
        top: function(value) {
            return value[0];
        },
        bottom: function(value) {
            return 2 in value && value[2] || value[0];
        }
    };

    Utils.extend(KityMinder, {
        _themes: {},

        /**
         * 注册一个主题
         *
         * @param  {String} name  主题的名称
         * @param  {Plain} theme 主题的样式描述
         *
         * @example
         *     KityMinder.registerTheme('default', {
         *         'root-color': 'red',
         *         'root-stroke': 'none',
         *         'root-padding': [10, 20]
         *     });
         */
        registerTheme: function(name, theme) {
            KityMinder._themes[name] = theme;
        },

        getThemeList: function() {
            return KityMinder._themes;
        }
    });

    kity.extendClass(Minder, {

        /**
         * 切换脑图实例上的主题
         * @param  {String} name 要使用的主题的名称
         */
        useTheme: function(name) {

            this.setTheme(name);
            this.refresh(800);

            return true;
        },

        setTheme: function(name) {
            this._theme = name || null;
            this.getRenderTarget().style.background = this.getStyle('background');
        },

        /**
         * 获取脑图实例上的当前主题
         * @return {[type]} [description]
         */
        getTheme: function(node) {
            return this._theme || this.getOptions('defaultTheme');
        },

        getThemeItems: function(node) {
            var theme = this.getTheme(node);
            return KityMinder._themes[this.getTheme(node)];
        },

        /**
         * 获得脑图实例上的样式
         * @param  {String} item 样式名称
         */
        getStyle: function(item, node) {
            var items = this.getThemeItems(node);
            var segment, dir, selector, value, matcher;

            if (item in items) return items[item];

            // 尝试匹配 CSS 数组形式的值
            // 比如 item 为 'pading-left'
            // theme 里有 {'padding': [10, 20]} 的定义，则可以返回 20
            segment = item.split('-');
            if (segment.length < 2) return null;

            dir = segment.pop();
            item = segment.join('-');

            if (item in items) {
                value = items[item];
                if (Utils.isArray(value) && (matcher = cssLikeValueMatcher[dir])) {
                    return matcher(value);
                }
                if (!isNaN(value)) return value;
            }

            return null;
        },

        /**
         * 获取指定节点的样式
         * @param  {String} name 样式名称，可以不加节点类型的前缀
         */
        getNodeStyle: function(node, name) {
            var value = this.getStyle(node.getType() + '-' + name, node);
            return value !== null ? value : this.getStyle(name, node);
        }
    });

    kity.extendClass(MinderNode, {
        getStyle: function(name) {
            return this.getMinder().getNodeStyle(this, name);
        }
    });

    KityMinder.registerModule('Theme', {
        defaultOptions: {
            defaultTheme: 'fresh-blue'
        },
        commands: {
            'theme': kity.createClass('ThemeCommand', {
                base: Command,

                execute: function(km, name) {
                    return km.useTheme(name);
                },

                queryValue: function(km) {
                    return km.getTheme() || 'default';
                }
            })
        }
    });
/* src/core/theme.js end */




/* src/core/template.js */
    utils.extend(KityMinder, {
        _templates: {},
        registerTemplate: function(name, supports) {
            KityMinder._templates[name] = supports;
        },
        getTemplateList: function() {
            return KityMinder._templates;
        }
    });

    KityMinder.registerTemplate('default', {});

    kity.extendClass(Minder, (function() {
        var originGetTheme = Minder.prototype.getTheme;
        return {
            useTemplate: function(name, duration) {
                this.setTemplate(name);
                this.refresh(duration || 800);
            },

            getTemplate: function() {
                return this._template || null;
            },

            setTemplate: function(name) {
                this._template = name || null;
            },

            getTemplateSupports: function() {
                return KityMinder._templates[this._template] || null;
            },

            getTheme: function(node) {
                var supports = this.getTemplateSupports();
                if (supports && supports.getTheme) {
                    return supports.getTheme(node);
                }
                return originGetTheme.call(this, node);
            }
        };
    })());


    kity.extendClass(MinderNode, (function() {
        var originGetLayout = MinderNode.prototype.getLayout;
        return {
            getLayout: function() {
                var supports = this.getMinder().getTemplateSupports();
                if (supports && supports.getLayout) {
                    return supports.getLayout(this);
                }
                return originGetLayout.call(this);
            }
        };
    })());

    KityMinder.registerModule('TemplateModule', {
        commands: {
            'template': kity.createClass('TemplateCommand', {
                base: Command,

                execute: function(minder, name) {
                    minder.useTemplate(name);
                    minder.execCommand('camera');
                },

                queryValue: function(minder) {
                    return minder.getTemplate() || 'default';
                }
            })
        }
    });
/* src/core/template.js end */




/* src/layout/default.js */
    /* global Layout:true */

    KityMinder.registerLayout('default', kity.createClass({
        base: Layout,

        doLayout: function(node) {
            var layout = this;

            if (node.isLayoutRoot()) {
                this.doLayoutRoot(node);
            } else {
                this.arrange(node, node.children, layout.getSide(node));
            }
        },

        getSide: function(node) {
            while (!node.parent.isLayoutRoot()) {
                node = node.parent;
            }
            var mainIndex = node.getIndex();
            var length = node.parent.children.length;
            return mainIndex < length / 2 ? 'right' : 'left';
        },

        doLayoutRoot: function(root) {
            var mains = root.getChildren();
            var group = {
                left: [],
                right: []
            };
            var _this = this;

            mains.forEach(function(main) {
                group[_this.getSide(main)].push(main);
            });

            this.arrange(root, group.left, 'left');
            this.arrange(root, group.right, 'right');
        },

        arrange: function(parent, children, side) {
            if (!children.length) return;
            var _this = this;

            // children 所占的总树高
            var totalTreeHeight = 0;

            // 计算每个 child 的树所占的矩形区域
            var childTreeBoxes = children.map(function(node, index, children) {
                var box = _this.getTreeBox([node]);

                // 计算总树高，需要把竖直方向上的 margin 加入计算
                totalTreeHeight += box.height;

                if (index > 0) {
                    totalTreeHeight += children[index - 1].getStyle('margin-bottom');
                    totalTreeHeight += node.getStyle('margin-top');
                }

                return box;
            });

            var nodeContentBox = parent.getContentBox();
            var i, x, y, child, childTreeBox, childContentBox;
            var transform, offset;

            y = -totalTreeHeight / 2;

            if (side != 'left') {
                parent.setVertexOut(new kity.Point(nodeContentBox.right, nodeContentBox.cy));
                parent.setLayoutVector(new kity.Vector(1, 0));
            } else {
                parent.setVertexOut(new kity.Point(nodeContentBox.left, nodeContentBox.cy));
                parent.setLayoutVector(new kity.Vector(-1, 0));
            }

            for (i = 0; i < children.length; i++) {
                child = children[i];
                childTreeBox = childTreeBoxes[i];
                childContentBox = child.getContentBox();

                if (!childContentBox.height) continue;

                // 水平方向上的布局
                if (side == 'right') {
                    x = nodeContentBox.right - childContentBox.left;
                    x += parent.getStyle('margin-right') + child.getStyle('margin-left');
                } else {
                    x = nodeContentBox.left - childContentBox.right;
                    x -= parent.getStyle('margin-left') + child.getStyle('margin-right');
                }

                if (i > 0) {
                    y += children[i].getStyle('margin-top');
                }

                // 竖直方向上的布局
                y -= childTreeBox.top;

                // 设置布局结果
                transform = new kity.Matrix().translate(x, y);

                child.setLayoutTransform(transform);

                y += childTreeBox.bottom + child.getStyle('margin-bottom');
            }

            if (parent.isRoot()) {
                var branchBox = this.getBranchBox(children);
                var dy = branchBox.cy - nodeContentBox.cy;

                children.forEach(function(child) {
                    child.getLayoutTransform().translate(0, -dy);
                });
            }
        },

        getOrderHint: function(node) {
            var hint = [];
            var box = node.getLayoutBox();
            var offset = 5;

            hint.push({
                type: 'up',
                node: node,
                area: {
                    x: box.x,
                    y: box.top - node.getStyle('margin-top') - offset,
                    width: box.width,
                    height: node.getStyle('margin-top')
                },
                path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
            });

            hint.push({
                type: 'down',
                node: node,
                area: {
                    x: box.x,
                    y: box.bottom + offset,
                    width: box.width,
                    height: node.getStyle('margin-bottom')
                },
                path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
            });
            return hint;
        }
    }));
/* src/layout/default.js end */




/* src/layout/default.connect.js */
    var connectMarker = new kity.Marker().pipe(function() {
        var r = 7;
        var dot = new kity.Circle(r - 1);
        this.addShape(dot);
        this.setRef(r - 1, 0).setViewBox(-r, -r, r + r, r + r).setWidth(r).setHeight(r);
        this.dot = dot;
        this.node.setAttribute('markerUnits', 'userSpaceOnUse');
    });

    KityMinder.registerConnectProvider('default', function(node, parent, connection, width, color) {

        var box = node.getLayoutBox(),
            pBox = parent.getLayoutBox();

        var start, end, vector;
        var abs = Math.abs;
        var pathData = [];
        var side = box.x > pBox.x ? 'right' : 'left';

        node.getMinder().getPaper().addResource(connectMarker);

        switch (node.getType()) {

            case 'main':

                start = new kity.Point(pBox.cx, pBox.cy);
                end = side == 'left' ?
                    new kity.Point(box.right + 2, box.cy) :
                    new kity.Point(box.left - 2, box.cy);

                vector = kity.Vector.fromPoints(start, end);
                pathData.push('M', start);
                pathData.push('A', abs(vector.x), abs(vector.y), 0, 0, (vector.x * vector.y > 0 ? 0 : 1), end);

                connection.setMarker(connectMarker);
                connectMarker.dot.fill(color);

                break;

            case 'sub':

                var radius = node.getStyle('connect-radius');
                var underY = box.bottom + 3;
                var startY = parent.getType() == 'sub' ? pBox.bottom + 3 : pBox.cy;
                var p1, p2, p3, mx;

                if (side == 'right') {
                    p1 = new kity.Point(pBox.right + 10, startY);
                    p2 = new kity.Point(box.left, underY);
                    p3 = new kity.Point(box.right + 10, underY);
                } else {
                    p1 = new kity.Point(pBox.left - 10, startY);
                    p2 = new kity.Point(box.right, underY);
                    p3 = new kity.Point(box.left - 10, underY);
                }

                mx = (p1.x + p2.x) / 2;

                if (width % 2 === 0) {
                    p1.y += 0.5;
                    p2.y += 0.5;
                    p3.y += 0.5;
                }

                pathData.push('M', p1);
                pathData.push('C', mx, p1.y, mx, p2.y, p2);
                pathData.push('L', p3);

                connection.setMarker(null);

                break;
        }

        connection.setPathData(pathData);
    });
/* src/layout/default.connect.js end */




/* src/layout/bottom.js */
    /* global Layout:true */
    window.layoutSwitch = true;
    KityMinder.registerLayout('bottom', kity.createClass({

        base: Layout,

        doLayout: function(node) {

            var children = node.getChildren();

            if (!children.length) {
                return false;
            }

            var me = this;

            // 子树的总宽度（包含间距）
            var totalTreeWidth = 0;

            // 父亲所占的区域
            var nodeContentBox = node.getContentBox();

            // 为每一颗子树准备的迭代变量
            var i, x0, x, y, child, childTreeBox, childContentBox, matrix;

            // 先最左对齐
            x0 = x = nodeContentBox.left;

            for (i = 0; i < children.length; i++) {

                child = children[i];
                childContentBox = child.getContentBox();
                childTreeBox = this.getTreeBox(child);
                matrix = new kity.Matrix();

                // 忽略无宽度的节点（收起的）
                if (!childContentBox.width) continue;

                if (i > 0) {
                    x += child.getStyle('margin-left');
                }

                x -= childTreeBox.left;

                // arrange x
                matrix.translate(x, 0);

                // 为下个位置准备
                x += childTreeBox.right;

                if (i < children.length - 1) x += child.getStyle('margin-right');

                y = nodeContentBox.bottom - childTreeBox.top +
                    node.getStyle('margin-bottom') + child.getStyle('margin-top');

                matrix.translate(0, y);

                // 设置结果
                child.setLayoutTransform(matrix);
                child.setVertexIn(new kity.Point(childContentBox.cx, childContentBox.top));

            }

            // 设置布局矢量为向下
            node.setLayoutVector(new kity.Vector(0, 1));

            // 设置流出顶点
            node.setVertexOut(new kity.Point(nodeContentBox.cx, nodeContentBox.bottom));

            var dx = (x - x0 - nodeContentBox.width) / 2;

            children.forEach(function(child) {
                child.getLayoutTransform().translate(-dx, 0);
            });
        },

        getOrderHint: function(node) {
            var hint = [];
            var box = node.getLayoutBox();
            var offset = 3;

            hint.push({
                type: 'up',
                node: node,
                area: {
                    x: box.left - node.getStyle('margin-left') - offset,
                    y: box.top,
                    width: node.getStyle('margin-left'),
                    height: box.height
                },
                path: ['M', box.left - offset, box.top, 'L', box.left - offset, box.bottom]
            });

            hint.push({
                type: 'down',
                node: node,
                area: {
                    x: box.right + offset,
                    y: box.top,
                    width: node.getStyle('margin-right'),
                    height: box.height
                },
                path: ['M', box.right + offset, box.top, 'L', box.right + offset, box.bottom]
            });
            return hint;
        }
    }));

    KityMinder.registerConnectProvider('bottom', function(node, parent, connection) {
        var pout = parent.getLayoutVertexOut(),
            pin = node.getLayoutVertexIn();
        var pathData = [];
        var r = Math.round;
        pathData.push('M', new kity.Point(r(pout.x), pout.y));
        pathData.push('L', new kity.Point(r(pout.x), pout.y + parent.getStyle('margin-bottom')));
        pathData.push('L', new kity.Point(r(pin.x), pout.y + parent.getStyle('margin-bottom')));
        pathData.push('L', new kity.Point(r(pin.x), pin.y));
        connection.setMarker(null);
        connection.setPathData(pathData);
    });
/* src/layout/bottom.js end */




/* src/layout/filetree.js */
    /* global Layout:true */
    window.layoutSwitch = true;
    KityMinder.registerLayout('filetree', kity.createClass({
        base: Layout,

        doLayout: function(node) {
            var layout = this;

            if (node.isLayoutRoot()) {
                this.doLayoutRoot(node);
            } else {
                this.arrange(node);
            }
        },
        doLayoutRoot: function(root) {
            this.arrange(root);
        },
        arrange: function(node) {
            var children = node.getChildren();
            var _this = this;
            if (!children.length) {
                return false;
            } else {
                // 计算每个 child 的树所占的矩形区域
                var childTreeBoxes = children.map(function(node, index, children) {
                    var box = _this.getTreeBox([node]);
                    return box;
                });
                var nodeContentBox = node.getContentBox();
                var i, x, y, child, childTreeBox, childContentBox;
                var transform = new kity.Matrix();

                node.setVertexOut(new kity.Point(0, nodeContentBox.bottom));
                node.setLayoutVector(new kity.Vector(0, 1));

                y = nodeContentBox.bottom + node.getStyle('margin-bottom');

                for (i = 0; i < children.length; i++) {
                    child = children[i];
                    childTreeBox = childTreeBoxes[i];
                    childContentBox = child.getContentBox();

                    x = child.getStyle('margin-left') - childContentBox.left;

                    if (!childContentBox.width) continue;

                    y += child.getStyle('margin-top');
                    y -= childTreeBox.top;

                    // 设置布局结果
                    transform = new kity.Matrix().translate(x, y);

                    child.setLayoutTransform(transform);

                    y += childTreeBox.bottom + child.getStyle('margin-bottom');
                }
            }
        },
        getOrderHint: function(node) {
            var hint = [];
            var box = node.getLayoutBox();
            var offset = node.getLevel() > 1 ? 3 : 5;

            hint.push({
                type: 'up',
                node: node,
                area: {
                    x: box.x,
                    y: box.top - node.getStyle('margin-top') - offset,
                    width: box.width,
                    height: node.getStyle('margin-top')
                },
                path: ['M', box.x, box.top - offset, 'L', box.right, box.top - offset]
            });

            hint.push({
                type: 'down',
                node: node,
                area: {
                    x: box.x,
                    y: box.bottom + offset,
                    width: box.width,
                    height: node.getStyle('margin-bottom')
                },
                path: ['M', box.x, box.bottom + offset, 'L', box.right, box.bottom + offset]
            });
            return hint;
        }
    }));

    KityMinder.registerConnectProvider('filetree', function(node, parent, connection) {
        var box = node.getLayoutBox(),
            pBox = parent.getLayoutBox();
        var pathData = [];
        var left = parent.getLayoutPoint().x;
        var r = Math.round;
        pathData.push('M', new kity.Point(r(left), r(pBox.bottom)));
        pathData.push('L', new kity.Point(r(left), r(box.cy)));
        pathData.push('L', new kity.Point(r(box.left), r(box.cy)));
        connection.setPathData(pathData);
    });
/* src/layout/filetree.js end */




/* src/theme/default.js */
    KityMinder.registerTheme('classic', {
        'background': '#3A4144 url(ui/theme/default/images/grid.png) repeat',

        'root-color': '#430',
        'root-background': '#e9df98',
        'root-stroke': '#e9df98',
        'root-font-size': 24,
        'root-padding': [15, 25],
        'root-margin': [30, 100],
        'root-radius': 30,
        'root-space': 10,
        'root-shadow': 'rgba(0, 0, 0, .25)',

        'main-color': '#333',
        'main-background': '#a4c5c0',
        'main-stroke': '#a4c5c0',
        'main-font-size': 16,
        'main-padding': [6, 20],
        'main-margin': 20,
        'main-radius': 10,
        'main-space': 5,
        'main-shadow': 'rgba(0, 0, 0, .25)',

        'sub-color': 'white',
        'sub-background': 'none',
        'sub-stroke': 'none',
        'sub-font-size': 12,
        'sub-padding': [5, 10],
        'sub-margin': [15, 20],
        'sub-tree-margin': 30,
        'sub-radius': 5,
        'sub-space': 5,

        'connect-color': 'white',
        'connect-width': 2,
        'connect-radius': 5,

        'selected-background': 'rgb(254, 219, 0)',
        'selected-stroke': 'rgb(254, 219, 0)',
        'selected-color': 'black',

        'marquee-background': 'rgba(255,255,255,.3)',
        'marquee-stroke': 'white',

        'drop-hint-color': 'yellow',
        'sub-drop-hint-width': 2,
        'main-drop-hint-width': 4,
        'root-drop-hint-width': 4,

        'order-hint-area-color': 'rgba(0, 255, 0, .5)',
        'order-hint-path-color': '#0f0',
        'order-hint-path-width': 1,

        'text-selection-color': 'rgb(27,171,255)'
    });
/* src/theme/default.js end */




/* src/theme/snow.js */
    KityMinder.registerTheme('snow', {
        'background': '#3A4144 url(ui/theme/default/images/grid.png) repeat',

        'root-color': '#430',
        'root-background': '#e9df98',
        'root-stroke': '#e9df98',
        'root-font-size': 24,
        'root-padding': [15, 25],
        'root-margin': 30,
        'root-radius': 5,
        'root-space': 10,
        'root-shadow': 'rgba(0, 0, 0, .25)',

        'main-color': '#333',
        'main-background': '#a4c5c0',
        'main-stroke': '#a4c5c0',
        'main-font-size': 16,
        'main-padding': [6, 20],
        'main-margin': [20, 40],
        'main-radius': 5,
        'main-space': 5,
        'main-shadow': 'rgba(0, 0, 0, .25)',

        'sub-color': 'black',
        'sub-background': 'white',
        'sub-stroke': 'white',
        'sub-font-size': 12,
        'sub-padding': [5, 10],
        'sub-margin': [10, 20],
        'sub-radius': 5,
        'sub-space': 5,

        'connect-color': 'white',
        'connect-width': 2,
        'connect-radius': 5,

        'selected-background': 'rgb(254, 219, 0)',
        'selected-stroke': 'rgb(254, 219, 0)',

        'marquee-background': 'rgba(255,255,255,.3)',
        'marquee-stroke': 'white',

        'drop-hint-color': 'yellow',
        'drop-hint-width': 4,

        'order-hint-area-color': 'rgba(0, 255, 0, .5)',
        'order-hint-path-color': '#0f0',
        'order-hint-path-width': 1,

        'text-selection-color': 'rgb(27,171,255)'
    });
/* src/theme/snow.js end */




/* src/theme/fresh.js */
    (function() {
        function hsl(h, s, l) {
            return kity.Color.createHSL(h, s, l);
        }

        function generate(h) {
            return {
                'background': '#fbfbfb',

                'root-color': 'white',
                'root-background': hsl(h, 37, 60),
                'root-stroke': hsl(h, 37, 60),
                'root-font-size': 16,
                'root-padding': [12, 24],
                'root-margin': [30, 100],
                'root-radius': 5,
                'root-space': 10,


                'main-color': 'black',
                'main-background': hsl(h, 33, 95),
                'main-stroke': hsl(h, 37, 60),
                'main-stroke-width': 1,
                'main-font-size': 14,
                'main-padding': [6, 20],
                'main-margin': 20,
                'main-radius': 3,
                'main-space': 5,

                'sub-color': 'black',
                'sub-background': 'none',
                'sub-stroke': 'none',
                'sub-font-size': 12,
                'sub-padding': [5, 10],
                'sub-margin': [15, 20],
                'sub-tree-margin': 30,
                'sub-radius': 5,
                'sub-space': 5,

                'connect-color': hsl(h, 37, 60),
                'connect-width': 1,
                'connect-radius': 5,

                'selected-stroke': hsl(h, 26, 30),
                'selected-stroke-width': '3',

                'marquee-background': hsl(h, 100, 80).set('a', 0.1),
                'marquee-stroke': hsl(h, 37, 60),

                'drop-hint-color': hsl(h, 26, 35),
                'drop-hint-width': 5,

                'order-hint-area-color': hsl(h, 100, 30).set('a', 0.5),
                'order-hint-path-color': hsl(h, 100, 25),
                'order-hint-path-width': 1,

                'text-selection-color': hsl(h, 100, 20)
            };
        }

        var plans = {
            red: 0,
            soil: 25,
            green: 122,
            blue: 204,
            purple: 246,
            pink: 334
        };

        for (var name in plans) {
            KityMinder.registerTheme('fresh-' + name, generate(plans[name]));
        }

    })();
/* src/theme/fresh.js end */




/* src/template/structure.js */
    KityMinder.registerTemplate('structure', {

        getLayout: function(node) {
            return 'bottom';
        }
    });

    KityMinder.registerTemplate('filetree', {

        getLayout: function(node) {
            if (node.getData('layout')) return node.getData('layout');
            if (node.isRoot()) return 'bottom';

            return 'filetree';
        }
    });
/* src/template/structure.js end */




/* src/module/node.js */
    var AppendChildCommand = kity.createClass('AppendChildCommand', {
        base: Command,
        execute: function(km, text) {
            var parent = km.getSelectedNode();
            if (!parent) {
                return null;
            }
            parent.expand();
            var node = km.createNode(text, parent);
            km.select(node, true);
            node.render();
            node._lastLayoutTransform = parent._lastLayoutTransform;
            km.layout(300);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    var AppendSiblingCommand = kity.createClass('AppendSiblingCommand', {
        base: Command,
        execute: function(km, text) {
            var sibling = km.getSelectedNode();
            var parent = sibling.parent;
            if (!parent) {
                return km.execCommand('AppendChildNode', text);
            }
            var node = km.createNode(text, parent, sibling.getIndex() + 1);
            km.select(node, true);
            node.render();
            node._lastLayoutTransform = sibling._lastLayoutTransform;
            km.layout(300);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    var RemoveNodeCommand = kity.createClass('RemoverNodeCommand', {
        base: Command,
        execute: function(km, text) {
            var nodes = km.getSelectedNodes();
            var ancestor = MinderNode.getCommonAncestor.apply(null, nodes);

            nodes.forEach(function(node) {
                if (!node.isRoot()) km.removeNode(node);
            });

            km.select(ancestor || km.getRoot(), true);
            km.layout(300);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            return selectedNode ? 0 : -1;
        }
    });

    var EditNodeCommand = kity.createClass('EditNodeCommand', {
        base: Command,
        execute: function(km) {
            var selectedNode = km.getSelectedNode();
            if (!selectedNode) {
                return null;
            }
            km.select(selectedNode, true);
            km.textEditNode(selectedNode);
        },
        queryState: function(km) {
            var selectedNode = km.getSelectedNode();
            if (!selectedNode) {
                return -1;
            } else {
                return 0;
            }
        },
        isNeedUndo: function() {
            return false;
        }
    });

    KityMinder.registerModule('NodeModule', function() {
        return {
            commands: {
                'AppendChildNode': AppendChildCommand,
                'AppendSiblingNode': AppendSiblingCommand,
                'RemoveNode': RemoveNodeCommand,
                'EditNode': EditNodeCommand
            },
            'contextmenu': [{
                label: this.getLang('node.appendsiblingnode'),
                exec: function() {
                    this.execCommand('AppendSiblingNode', this.getLang('topic'));
                },
                cmdName: 'appendsiblingnode'
            }, {
                label: this.getLang('node.appendchildnode'),
                exec: function() {
                    this.execCommand('AppendChildNode', this.getLang('topic'));
                },
                cmdName: 'appendchildnode'
            }, {
                label: this.getLang('node.editnode'),
                exec: function() {
                    this.execCommand('EditNode');
                },
                cmdName: 'editnode'
            }, {
                label: this.getLang('node.removenode'),
                cmdName: 'RemoveNode'
            }, {
                divider: 1
            }]
        };
    });
/* src/module/node.js end */




/* src/module/text.js */
    /* global Renderer: true */

    var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
        base: Renderer,

        create: function() {
            return new kity.Text()
                .setId(KityMinder.uuid('node_text'))
                .setVerticalAlign('middle')
                .setAttr('text-rendering', 'inherit');
        },

        update: function(text, node) {
            this.setTextStyle(node, text.setContent(node.getText()));
            var box = text.getBoundaryBox();
            var r = Math.round;
            if (kity.Browser.ie) {
                box.y += 1;
            }
            return function() {
                return new kity.Box(r(box.x), r(box.y), r(box.width), r(box.height));
            };
        },

        setTextStyle: function(node, text) {
            var hooks = TextRenderer._styleHooks;
            hooks.forEach(function(hook) {
                hook(node, text);
            });
        }
    });

    utils.extend(TextRenderer, {
        _styleHooks: [],

        registerStyleHook: function(fn) {
            TextRenderer._styleHooks.push(fn);
        }
    });

    kity.extendClass(MinderNode,{
        getTextShape : function() {
            return  this.getRenderer('TextRenderer').getRenderShape();
        }
    });
    KityMinder.registerModule('text', {
        'renderers': {
            center: TextRenderer
        }
    });
/* src/module/text.js end */




/* src/module/expand.js */
    /* global Renderer: true */

    KityMinder.registerModule('Expand', function() {
        var minder = this;
        var EXPAND_STATE_DATA = 'expandState',
            STATE_EXPAND = 'expand',
            STATE_COLLAPSE = 'collapse';

        /**
         * 该函数返回一个策略，表示递归到节点指定的层数
         *
         * 返回的策略表示把操作（展开/收起）进行到指定的层数
         * 也可以给出一个策略指定超过层数的节点如何操作，默认不进行任何操作
         *
         * @param {int} deep_level 指定的层数
         * @param {Function} policy_after_level 超过的层数执行的策略
         */
        function generateDeepPolicy(deep_level, policy_after_level) {

            return function(node, state, policy, level) {
                var children, child, i;

                node.setData(EXPAND_STATE_DATA, state);
                level = level || 1;

                children = node.getChildren();

                for (i = 0; i < children.length; i++) {
                    child = children[i];

                    if (level <= deep_level) {
                        policy(child, state, policy, level + 1);
                    } else if (policy_after_level) {
                        policy_after_level(child, state, policy, level + 1);
                    }
                }

            };
        }

        /**
         * 节点展开和收缩的策略常量
         *
         * 策略是一个处理函数，处理函数接受 3 个参数：
         *
         * @param {MinderNode} node   要处理的节点
         * @param {Enum}       state  取值为 "expand" | "collapse"，表示要对节点进行的操作是展开还是收缩
         * @param {Function}   policy 提供当前策略的函数，方便递归调用
         */
        var EXPAND_POLICY = MinderNode.EXPAND_POLICY = {

            /**
             * 策略 1：只修改当前节点的状态，不递归子节点的状态
             */
            KEEP_STATE: function(node, state, policy) {
                node.setData(EXPAND_STATE_DATA, state);
            },

            generateDeepPolicy: generateDeepPolicy,

            /**
             * 策略 2：把操作进行到儿子
             */
            DEEP_TO_CHILD: generateDeepPolicy(2),

            /**
             * 策略 3：把操作进行到叶子
             */
            DEEP_TO_LEAF: generateDeepPolicy(Number.MAX_VALUE)
        };

        function setExpandState(node, state, policy) {
            policy = policy || EXPAND_POLICY.KEEP_STATE;
            policy(node, state, policy);
            node.renderTree();
            node.getMinder().layout(100);
        }

        // 将展开的操作和状态读取接口拓展到 MinderNode 上
        kity.extendClass(MinderNode, {

            /**
             * 使用指定的策略展开节点
             * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
             */
            expand: function(policy) {
                setExpandState(this, STATE_EXPAND, policy);
                return this;
            },

            /**
             * 使用指定的策略收起节点
             * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
             */
            collapse: function(policy) {
                setExpandState(this, STATE_COLLAPSE, policy);
                return this;
            },

            /**
             * 判断节点当前的状态是否为展开
             */
            isExpanded: function() {
                var expanded = this.getData(EXPAND_STATE_DATA) !== STATE_COLLAPSE;
                return expanded && (this.isRoot() || this.parent.isExpanded());
            },

            /**
             * 判断节点当前的状态是否为收起
             */
            isCollapsed: function() {
                return !this.isExpanded();
            }
        });
        var ExpandNodeCommand = kity.createClass('ExpandNodeCommand', {
            base: Command,
            execute: function(km) {
                var nodes = km.getRoot().getChildren();
                nodes.forEach(function(node) {
                    node.expand(EXPAND_POLICY.DEEP_TO_LEAF);
                });
            },
            queryState: function(km) {
                return 0;
            }
        });
        var CollapseNodeCommand = kity.createClass('CollapseNodeCommand', {
            base: Command,
            execute: function(km) {
                var nodes = km.getRoot().getChildren();
                nodes.forEach(function(node) {
                    node.collapse();
                });
            },
            queryState: function(km) {
                return 0;
            }
        });
        var Expander = kity.createClass('Expander', {
            base: kity.Group,

            constructor: function(node) {
                this.callBase();
                this.radius = 5;
                this.outline = new kity.Circle(this.radius).stroke('gray').fill('white');
                this.sign = new kity.Path().stroke('black');
                this.addShapes([this.outline, this.sign]);
                this.initEvent(node);
                this.setId(KityMinder.uuid('node_expander'));
                this.setStyle('cursor', 'pointer');
            },

            initEvent: function(node) {
                this.on('mousedown', function(e) {
                    if (node.isExpanded()) {
                        node.collapse();
                    } else {
                        node.expand();
                    }
                    e.stopPropagation();
                    e.preventDefault();
                });
                this.on('dblclick click mouseup', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                });
            },

            setState: function(state) {
                if (state == 'hide') {
                    this.setVisible(false);
                    return;
                }
                this.setVisible(true);
                var pathData = ['M', 1.5 - this.radius, 0, 'L', this.radius - 1.5, 0];
                if (state == STATE_COLLAPSE) {
                    pathData.push(['M', 0, 1.5 - this.radius, 'L', 0, this.radius - 1.5]);
                }       
                this.sign.setPathData(pathData);
            }
        });

        var ExpanderRenderer = kity.createClass('ExpanderRenderer', {
            base: Renderer,

            create: function(node) {
                if (node.isRoot()) return;
                this.expander = new Expander(node);
                node.getRenderContainer().prependShape(this.expander);
                node.expanderRenderer = this;
                this.node = node;
                return this.expander;
            },

            shouldRender: function(node) {
                return !node.isRoot();
            },

            update: function(expander, node, box) {
                if (!node.parent) return;

                var visible = node.parent.isExpanded();

                expander.setState(visible && node.children.length ? node.getData(EXPAND_STATE_DATA) : 'hide');

                var vector = node.getLayoutVector().normalize(expander.radius + node.getStyle('stroke-width'));
                var position = node.getVertexOut().offset(vector);

                this.expander.setTranslate(position);
            }
        });
        return {
            commands: {
                'ExpandNode': ExpandNodeCommand,
                'CollapseNode': CollapseNodeCommand
            },
            events: {
                'layoutapply': function(e) {
                    var r = e.node.getRenderer('ExpanderRenderer');
                    if (r.getRenderShape()) {
                        r.update(r.getRenderShape(), e.node);
                    }
                },
                'beforerender': function(e) {
                    var node = e.node;
                    var visible = !node.parent || node.parent.isExpanded();
                    var minder = this;

                    node.getRenderContainer().setVisible(visible);
                    if (!visible) e.stopPropagation();
                },
                'normal.keydown': function(e) {
                    if (this.getStatus() == 'textedit') return;
                    if (e.originEvent.keyCode == keymap['/']) {
                        var node = this.getSelectedNode();
                        if (!node || node == this.getRoot()) return;
                        var expanded = node.isExpanded();
                        this.getSelectedNodes().forEach(function(node) {
                            if (expanded) node.collapse();
                            else node.expand();
                        });
                        e.preventDefault();
                        e.stopPropagationImmediately();
                    }
                }
            },
            renderers: {
                outside: ExpanderRenderer
            }
        };
    });
/* src/module/expand.js end */




/* src/module/outline.js */
    /* global Renderer: true */


    var OutlineRenderer = kity.createClass('OutlineRenderer', {
        base: Renderer,

        create: function(node) {

            var outline = new kity.Rect()
                .setId(KityMinder.uuid('node_outline'));

            this.bringToBack = true;

            return outline;
        },

        update: function(outline, node, box) {

            var paddingLeft = node.getStyle('padding-left'),
                paddingRight = node.getStyle('padding-right'),
                paddingTop = node.getStyle('padding-top'),
                paddingBottom = node.getStyle('padding-bottom');

            var outlineBox = {
                x: box.x - paddingLeft,
                y: box.y - paddingTop,
                width: box.width + paddingLeft + paddingRight,
                height: box.height + paddingTop + paddingBottom
            };

            var prefix = node.isSelected() ? 'selected-' : '';

            outline
                .setPosition(outlineBox.x, outlineBox.y)
                .setSize(outlineBox.width, outlineBox.height)
                .setRadius(node.getStyle('radius'))
                .fill(node.getData('background') || node.getStyle(prefix + 'background') || node.getStyle('background'))
                .stroke(node.getStyle(prefix + 'stroke' || node.getStyle('stroke')),
                    node.getStyle(prefix + 'stroke-width'));

            return outlineBox;
        }
    });

    var ShadowRenderer = kity.createClass('ShadowRenderer', {
        base: Renderer,

        create: function(node) {
            this.bringToBack = true;
            return new kity.Rect();
        },

        shouldRender: function(node) {
            return node.getStyle('shadow');
        },

        update: function(shadow, node, box) {
            shadow.setPosition(box.x + 4, box.y + 5)
                .setSize(box.width, box.height)
                .fill(node.getStyle('shadow'))
                .setRadius(node.getStyle('radius'));
        }
    });

    var wireframeOption = /wire/.test(window.location.href);
    var WireframeRenderer = kity.createClass('WireframeRenderer', {
        base: Renderer,

        create: function() {
            var wireframe = new kity.Group();
            var oxy = this.oxy = new kity.Path()
                .stroke('#f6f')
                .setPathData('M0,-50L0,50M-50,0L50,0');

            var box = this.wireframe = new kity.Rect()
                .stroke('lightgreen');

            return wireframe.addShapes([oxy, box]);
        },

        shouldRender: function() {
            return wireframeOption;
        },

        update: function(created, node, box) {
            this.wireframe
                .setPosition(box.x, box.y)
                .setSize(box.width, box.height);
        }
    });

    KityMinder.registerModule('OutlineModule', function() {
        return {
            renderers: {
                outline: OutlineRenderer,
                outside: [ShadowRenderer, WireframeRenderer]
            }
        };
    });
/* src/module/outline.js end */




/* src/module/geometry.js */
    KityMinder.Geometry = (function() {
        var g = {};
        var min = Math.min,
            max = Math.max,
            abs = Math.abs;
        var own = Object.prototype.hasOwnProperty;

        g.isNumberInRange = function(number, range) {
            return number > range[0] && number < range[1];
        };

        g.getDistance = function(p1, p2) {
            return kity.Vector.fromPoints(p1, p2).length();
        };

        function wrapBox(box) {
            box.width = box.right - box.left;
            box.height = box.bottom - box.top;
            box.x = box.left;
            box.y = box.top;
            box.cx = box.x + box.width / 2;
            box.cy = box.y + box.height / 2;
            return box;
        }

        function uniformBox(box) {
            // duck check
            if ('x' in box) {
                box.left = box.x;
                box.right = box.x + box.width;
                box.top = box.y;
                box.bottom = box.y + box.height;
            }
        }

        g.wrapBox = wrapBox;

        g.getBox = function(p1, p2) {
            return wrapBox({
                left: min(p1.x, p2.x),
                right: max(p1.x, p2.x),
                top: min(p1.y, p2.y),
                bottom: max(p1.y, p2.y)
            });
        };

        g.mergeBox = function(b1, b2) {
            uniformBox(b1);
            uniformBox(b2);
            return wrapBox({
                left: min(b1.left, b2.left),
                right: max(b1.right, b2.right),
                top: min(b1.top, b2.top),
                bottom: max(b1.bottom, b2.bottom)
            });
        };

        g.getBoxRange = function(box) {
            return {
                x: [box.left, box.right],
                y: [box.top, box.bottom]
            };
        };

        g.getBoxVertex = function(box) {
            return {
                leftTop: {
                    x: box.left,
                    y: box.top
                },
                rightTop: {
                    x: box.right,
                    y: box.top
                },
                leftBottom: {
                    x: box.left,
                    y: box.bottom
                },
                rightBottom: {
                    x: box.right,
                    y: box.bottom
                }
            };
        };

        g.isPointInsideBox = function(p, b) {
            uniformBox(b);
            var ranges = g.getBoxRange(b);
            return g.isNumberInRange(p.x, ranges.x) && g.isNumberInRange(p.y, ranges.y);
        };

        g.getIntersectBox = function(b1, b2) {
            uniformBox(b1);
            uniformBox(b2);
            var minx = max(b1.left, b2.left),
                miny = max(b1.top, b2.top),
                maxx = min(b1.right, b2.right),
                maxy = min(b1.bottom, b2.bottom);
            return minx < maxx && miny < maxy ? wrapBox({
                left: minx,
                right: maxx,
                top: miny,
                bottom: maxy
            }) : null;
        };

        g.snapToSharp = function(unknown) {
            if (utils.isNumber(unknown)) {
                return (unknown | 0) + 0.5;
            }
            if (utils.isArray(unknown)) {
                return unknown.map(g.snapToSharp);
            }
            ['x', 'y', 'left', 'top', 'right', 'bottom'].forEach(function(n) {
                if (own.call(unknown, n)) {
                    unknown[n] = g.snapToSharp(unknown[n]);
                }
            });
            return unknown;
        };

        g.expandBox = function(box, sizeX, sizeY) {
            if (sizeY === undefined) {
                sizeY = sizeX;
            }
            return wrapBox({
                left: box.left - sizeX,
                top: box.top - sizeY,
                right: box.right + sizeX,
                bottom: box.bottom + sizeY
            });
        };

        return g;
    })();
/* src/module/geometry.js end */




/* src/module/history.js */
    KityMinder.registerModule("HistoryModule", function() {

        var km = this;

        var Scene = kity.createClass('Scene', {
            constructor: function(root,inputStatus) {
                this.data = root.clone();
                this.inputStatus = inputStatus;
            },
            getData: function() {
                return this.data;
            },
            cloneData: function() {
                return this.getData().clone();
            },
            equals: function(scene) {
                return this.getData().equals(scene.getData());

            },
            isInputStatus:function(){
                return this.inputStatus;
            },
            setInputStatus:function(status){
                this.inputStatus = status;
            }
        });
        var HistoryManager = kity.createClass('HistoryManager', {
            constructor: function(km) {
                this.list = [];
                this.index = 0;
                this.hasUndo = false;
                this.hasRedo = false;
                this.km = km;
            },
            undo: function() {
                if (this.hasUndo) {
                    var currentScene = this.list[this.index];
                    //如果是输入文字时的保存，直接回复当前场景
                    if(currentScene && currentScene.isInputStatus()){
                        this.saveScene();
                        this.restore(--this.index);
                        currentScene.setInputStatus(false);
                        return;
                    }
                    if(this.list.length == 1){
                        this.restore(0);
                        return;
                    }
                    if (!this.list[this.index - 1] && this.list.length == 1) {
                        this.reset();
                        return;
                    }
                    while (this.list[this.index].equals(this.list[this.index - 1])) {
                        this.index--;
                        if (this.index === 0) {
                            return this.restore(0);
                        }
                    }
                    this.restore(--this.index);
                }
            },
            redo: function() {
                if (this.hasRedo) {
                    while (this.list[this.index].equals(this.list[this.index + 1])) {
                        this.index++;
                        if (this.index == this.list.length - 1) {
                            return this.restore(this.index);
                        }
                    }
                    this.restore(++this.index);
                }
            },
            partialRenewal: function(target) {
                var selectedNodes = [];
                function compareNode(source, target) {
                    if (source.getText() != target.getText()) {
                        return false;
                    }
                    if (utils.compareObject(source.getData(), target.getData()) === false) {
                        return false;
                    }
                    if (utils.compareObject(source.getTmpData(), target.getTmpData()) === false) {
                        return false;
                    }
                    return true;
                }

                function appendChildNode(parent, child) {
                    if (child.isSelected()) {
                        selectedNodes.push(child);
                    }
                    km.appendNode(child, parent);
                    child._lastLayoutTransform = parent._lastLayoutTransform;
                    child.render();

                    var children = utils.cloneArr(child.children);
                    for (var i = 0, ci; ci = children[i++];) {
                        appendChildNode(child, ci);
                    }
                }

                function traverseNode(srcNode, tagNode) {

                    if (compareNode(srcNode, tagNode) === false) {
                        srcNode.setValue(tagNode);
                    }
                    //todo，这里有性能问题，变成全部render了
                    srcNode.render();
                    if (srcNode.isSelected()) {
                        selectedNodes.push(srcNode);
                    }
                    for (var i = 0, j = 0, si, tj;
                        (si = srcNode.children[i], tj = tagNode.children[j], si || tj); i++, j++) {
                        if (si && !tj) {
                            i--;
                            km.removeNode(si);
                        } else if (!si && tj) {
                            j--;
                            appendChildNode(srcNode, tj);
                        } else {
                            traverseNode(si, tj);
                        }
                    }
                }

                traverseNode(km.getRoot(), target);
                km.layout(200);

                km.select(selectedNodes,true);

                selectedNodes = [];

            },
            restore: function(index) {
                index = index === undefined ? this.index : index;
                var scene = this.list[index];
                this.partialRenewal(scene.cloneData());
                this.update();
                this.km.fire('restoreScene');
                this.km.fire('contentChange');
            },
            getScene: function(inputStatus) {
                return new Scene(this.km.getRoot(),inputStatus);
            },
            saveScene: function(inputStatus) {
                var currentScene = this.getScene(inputStatus);
                var lastScene = this.list[this.index];
                if (lastScene && lastScene.equals(currentScene)) {
                    if(inputStatus){
                        lastScene.setInputStatus(true);
                        this.update();
                    }
                    return;
                }
                this.list = this.list.slice(0, this.index + 1);
                this.list.push(currentScene);
                //如果大于最大数量了，就把最前的剔除
                if (this.list.length > this.km.getOptions('maxUndoCount')) {
                    this.list.shift();
                }
                this.index = this.list.length - 1;
                //跟新undo/redo状态
                this.update();
            },
            update: function() {

                this.hasRedo = !!this.list[this.index + 1];
                this.hasUndo = !!this.list[this.index - 1];
                var currentScene = this.list[this.index];
                if(currentScene && currentScene.isInputStatus()){
                    this.hasUndo = true;
                }

            },
            reset: function() {
                this.list = [];
                this.index = 0;
                this.hasUndo = false;
                this.hasRedo = false;
            }
        });
        //为km实例添加history管理
        this.historyManager = new HistoryManager(this);


        return {
            defaultOptions: {
                maxUndoCount: 20,
                maxInputCount: 20
            },
            "commands": {
                "undo": kity.createClass("UndoCommand", {
                    base: Command,

                    execute: function(km) {
                        km.historyManager.undo();
                    },

                    queryState: function(km) {
                        return km.historyManager.hasUndo ? 0 : -1;
                    },

                    isNeedUndo: function() {
                        return false;
                    }
                }),
                "redo": kity.createClass("RedoCommand", {
                    base: Command,

                    execute: function(km) {
                        km.historyManager.redo();
                    },

                    queryState: function(km) {
                        return km.historyManager.hasRedo ? 0 : -1;
                    },
                    isNeedUndo: function() {
                        return false;
                    }
                })
            },
            addShortcutKeys: {
                "Undo": "ctrl+z", //undo
                "Redo": "ctrl+y" //redo
            },
            "events": {
                "saveScene": function(e) {
                    this.historyManager.saveScene(e.inputStatus);
                },
                "import": function() {
                    this.historyManager.reset();
    //                this.historyManager.saveScene();
                }
            }
        };
    });
/* src/module/history.js end */




/* src/module/progress.js */
    KityMinder.registerModule('ProgressModule', function() {
        var minder = this;

        var PROGRESS_DATA = 'progress';

        // 进度图标的图形
        var ProgressIcon = kity.createClass('ProgressIcon', {
            base: kity.Group,

            constructor: function(value) {
                this.callBase();
                this.setSize(20);
                this.create();
                this.setValue(value);
                this.setId(KityMinder.uuid('node_progress'));
            },

            setSize: function(size) {
                this.width = this.height = size;
            },

            create: function() {

                var circle = new kity.Circle(8)
                    .stroke('#29A6BD', 2)
                    .fill('white');

                var pie = new kity.Pie(6, 0, -90)
                    .fill('#29A6BD');

                var check = new kity.Path()
                    .getDrawer()
                        .moveTo(-3, -1)
                        .lineTo(-1, 2)
                        .lineTo(3, -3)
                    .getPath()
                    .stroke('white', 2)
                    .setVisible(false);

                this.addShapes([circle, pie, check]);
                this.circle = circle;
                this.pie = pie;
                this.check = check;
            },

            setValue: function(value) {
                this.pie.setAngle(360 * (value - 1) / 8);
                this.check.setVisible(value == 9);
            }
        });

        var ProgressCommand = kity.createClass('ProgressCommand', {
            base: Command,
            execute: function(km, value) {
                var nodes = km.getSelectedNodes();
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].setData(PROGRESS_DATA, value || null).render();
                }
                km.layout();
            },
            queryValue: function(km) {
                var nodes = km.getSelectedNodes();
                var val;
                for (var i = 0; i < nodes.length; i++) {
                    val = nodes[i].getData(PROGRESS_DATA);
                    if (val) break;
                }
                return val|| null;
            },

            queryState: function(km) {
                return km.getSelectedNodes().length ? 0 : -1;
            }
        });

        return {
            'commands': {
                'progress': ProgressCommand
            },
            'renderers': {
                left: kity.createClass('ProgressRenderer', {
                    base: KityMinder.Renderer,

                    create: function(node) {
                        return new ProgressIcon();
                    },

                    shouldRender: function(node) {
                        return node.getData(PROGRESS_DATA);
                    },

                    update: function(icon, node, box) {
                        var data = node.getData(PROGRESS_DATA);
                        var spaceLeft = node.getStyle('space-left');
                        var x, y;

                        icon.setValue(data);

                        x = box.left - icon.width - spaceLeft;
                        y = -icon.height / 2;
                        icon.setTranslate(x + icon.width / 2, y + icon.height / 2);

                        return {
                            x: x,
                            y: y,
                            width: icon.width,
                            height: icon.height
                        };
                    }
                })
            }
        };
    });
/* src/module/progress.js end */




/* src/module/priority.js */
    KityMinder.registerModule('PriorityModule', function() {
        var minder = this;

        // 进度图标使用的颜色
        var PRIORITY_COLORS = ['', '#A92E24', '#29A6BD',
            '#1E8D54', '#eb6100', '#876DDA', '#828282',
            '#828282', '#828282', '#828282'
        ];
        var PRIORITY_DATA = 'priority';

        // 进度图标的图形
        var PriorityIcon = kity.createClass('PriorityIcon', {
            base: kity.Group,

            constructor: function() {
                this.callBase();
                this.setSize(20);
                this.create();
                this.setId(KityMinder.uuid('node_priority'));
            },

            setSize: function(size) {
                this.width = this.height = size;
            },

            create: function() {
                var bg, number;

                bg = new kity.Rect()
                    .setRadius(3)
                    .setPosition(0.5, 0.5)
                    .setSize(this.width, this.height);

                number = new kity.Text()
                    .setX(this.width / 2 + 0.5).setY(this.height / 2 - 0.5)
                    .setTextAnchor('middle')
                    .setVerticalAlign('middle')
                    .setFontSize(12)
                    .fill('white');
                number.mark = 'hello';

                this.addShapes([bg, number]);
                this.bg = bg;
                this.number = number;
            },

            setValue: function(value) {
                var bg = this.bg,
                    number = this.number;

                if (PRIORITY_COLORS[value]) {
                    bg.fill(PRIORITY_COLORS[value]);
                    number.setContent(value);
                }
            }
        });

        // 提供的命令
        var PriorityCommand = kity.createClass('SetPriorityCommand', {
            base: Command,
            execute: function(km, value) {
                var nodes = km.getSelectedNodes();
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].setData(PRIORITY_DATA, value || null).render();
                }
                km.layout();
            },
            queryValue: function(km) {
                var nodes = km.getSelectedNodes();
                var val;
                for (var i = 0; i < nodes.length; i++) {
                    val = nodes[i].getData(PRIORITY_DATA);
                    if (val) break;
                }
                return val || null;
            },

            queryState: function(km) {
                return km.getSelectedNodes().length ? 0 : -1;
            }
        });
        return {
            'commands': {
                'priority': PriorityCommand,
            },
            'renderers': {
                left: kity.createClass('PriorityRenderer', {
                    base: KityMinder.Renderer,

                    create: function(node) {
                        return new PriorityIcon();
                    },

                    shouldRender: function(node) {
                        return node.getData(PRIORITY_DATA);
                    },

                    update: function(icon, node, box) {
                        var data = node.getData(PRIORITY_DATA);
                        var spaceLeft = node.getStyle('space-left'),
                            x, y;

                        icon.setValue(data);
                        x = box.left - icon.width - spaceLeft;
                        y = -icon.height / 2;

                        icon.setTranslate(x, y);

                        return {
                            x: x,
                            y: y,
                            width: icon.width,
                            height: icon.height
                        };
                    }
                })
            }
        };
    });
/* src/module/priority.js end */




/* src/module/image.js */
    KityMinder.registerModule('image', function() {
        function loadImageSize(url, callback) {
            var img = document.createElement('img');
            img.onload = function() {
                callback(img.width, img.height);
            };
            img.onerror = function() {
                callback(null);
            };
            img.src = url;
        }

        function fitImageSize(width, height, maxWidth, maxHeight) {
            var ratio = width / height,
                fitRatio = maxWidth / maxHeight;

            // 宽高比大于最大尺寸的宽高比，以宽度为标准适应
            if (width > maxWidth && ratio > fitRatio) {
                width = maxWidth;
                height = width / ratio;
            } else if (height > maxHeight) {
                height = maxHeight;
                width = height * ratio;
            }

            return {
                width: width | 0,
                height: height | 0
            };
        }

        var ImageCommand = kity.createClass('ImageCommand', {
            base: Command,

            execute: function(km, url) {
                var nodes = km.getSelectedNodes();

                loadImageSize(url, function(width, height) {
                    if (!width) return;
                    utils.each(nodes, function(i, n) {
                        var size = fitImageSize(
                            width, height,
                            km.getOptions('maxImageWidth'),
                            km.getOptions('maxImageHeight'));
                        n.setData('image', url);
                        n.setData('imageSize', size);
                        n.render();
                    });
                    km.fire("saveScene");
                    km.layout(300);
                });

            },
            queryState: function(km) {
                var nodes = km.getSelectedNodes(),
                    result = 0;
                if (nodes.length === 0) {
                    return -1;
                }
                utils.each(nodes, function(i, n) {
                    if (n && n.getData('image')) {
                        result = 0;
                        return false;
                    }
                });
                return result;
            },
            queryValue: function(km) {
                var node = km.getSelectedNode();
                return node.getData('image');
            }
        });

        var RemoveImageCommand = kity.createClass('RemoveImageCommand', {
            base: Command,

            execute: function(km) {
                var nodes = km.getSelectedNodes();
                utils.each(nodes, function(i, n) {
                    n.setData('image').render();
                });
                km.layout(300);
            },
            queryState: function(km) {
                var nodes = km.getSelectedNodes();

                if (nodes.length === 0) {
                    return -1;
                }
                var image = false;
                utils.each(nodes, function(i, n) {
                    if (n.getData('image')) {
                        image = true;
                        return false;
                    }
                });
                if (image) {
                    return 0;
                }
                return -1;
            }
        });

        var ImageRenderer = kity.createClass('ImageRenderer', {
            base: KityMinder.Renderer,

            create: function(node) {
                return new kity.Image(node.getData('image'));
            },

            shouldRender: function(node) {
                return node.getData('image');
            },

            update: function(image, node, box) {
                var url = node.getData('image');
                var size = node.getData('imageSize');
                var spaceTop = node.getStyle('space-top');

                if (!size) return;

                var x = box.cx - size.width / 2;
                var y = box.y - size.height - spaceTop;

                image
                    .setUrl(url)
                    .setX(x | 0)
                    .setY(y | 0)
                    .setWidth(size.width | 0)
                    .setHeight(size.height | 0);

                return new kity.Box(x | 0, y | 0, size.width | 0, size.height | 0);
            }
        });

        return {
            'defaultOptions': {
                'maxImageWidth': 200,
                'maxImageHeight': 200
            },
            'commands': {
                'image': ImageCommand,
                'removeimage': RemoveImageCommand
            },
            'renderers': {
                'top': ImageRenderer
            }
        };
    });
/* src/module/image.js end */




/* src/module/resource.js */
    KityMinder.registerModule('Resource', function() {

        /**
         * 自动使用的颜色序列
         */
        var RESOURCE_COLOR_SERIES = [51, 303, 75, 200, 157, 0, 26, 254].map(function(h) {
            return kity.Color.createHSL(h, 100, 85);
        });

        var RESOURCE_COLOR_OVERFLOW = kity.Color.createHSL(0, 0, 95);

        /**
         * 在 Minder 上拓展一些关于资源的支持接口
         */
        kity.extendClass(Minder, {

            /**
             * 获取脑图中某个资源对应的颜色
             *
             * 如果存在同名资源，则返回已经分配给该资源的颜色，否则分配给该资源一个颜色，并且返回
             *
             * 如果资源数超过颜色序列数量，返回白色
             *
             * @param {String} resource 资源名称
             * @return {Color}
             */
            getResourceColor: function(resource) {
                var colorMapping = this._getResourceColorIndexMapping();
                var nextIndex;

                if (!colorMapping.hasOwnProperty(resource)) {
                    // 找不到找下个可用索引
                    nextIndex = this._getNextResourceColorIndex();
                    colorMapping[resource] = nextIndex;
                }

                // 资源过多，找不到可用索引颜色，统一返回白色
                return RESOURCE_COLOR_SERIES[colorMapping[resource]] || RESOURCE_COLOR_OVERFLOW;
            },

            /**
             * 获得已使用的资源的列表
             *
             * @return {Array}
             */
            getUsedResource: function() {
                var mapping = this._getResourceColorIndexMapping();
                var used = [],
                    resource;

                for (resource in mapping) {
                    if (mapping.hasOwnProperty(resource)) {
                        used.push(resource);
                    }
                }

                return used;
            },

            /**
             * 获取脑图下一个可用的资源颜色索引
             *
             * @return {int}
             */
            _getNextResourceColorIndex: function() {
                // 获取现有颜色映射
                //     resource => color_index
                var colorMapping = this._getResourceColorIndexMapping();

                var resource, used, i;

                used = [];

                // 抽取已经使用的值到 used 数组
                for (resource in colorMapping) {
                    if (colorMapping.hasOwnProperty(resource)) {
                        used.push(colorMapping[resource]);
                    }
                }

                // 枚举所有的可用值，如果还没被使用，返回
                for (i = 0; i < RESOURCE_COLOR_SERIES.length; i++) {
                    if (!~used.indexOf(i)) return i;
                }

                // 没有可用的颜色了
                return -1;
            },

            // 获取现有颜色映射
            //     resource => color_index
            _getResourceColorIndexMapping: function() {
                return this._resourceColorMapping || (this._resourceColorMapping = {});
            }

        });


        /**
         * @class 设置资源的命令
         *
         * @example
         *
         * // 设置选中节点资源为 "张三"
         * minder.execCommand('resource', ['张三']);
         *
         * // 添加资源 "李四" 到选中节点
         * var resource = minder.queryCommandValue();
         * resource.push('李四');
         * minder.execCommand('resource', resource);
         *
         * // 清除选中节点的资源
         * minder.execCommand('resource', null);
         */
        var ResourceCommand = kity.createClass('ResourceCommand', {

            base: Command,

            execute: function(minder, resource) {
                var nodes = minder.getSelectedNodes();

                if (typeof(resource) == 'string') {
                    resource = [resource];
                }

                nodes.forEach(function(node) {
                    node.setData('resource', resource).render();
                });

                minder.layout(200);
            },

            queryValue: function(minder) {
                var nodes = minder.getSelectedNodes();
                var resource = [];

                nodes.forEach(function(node) {
                    var nodeResource = node.getData('resource');

                    if (!nodeResource) return;

                    nodeResource.forEach(function(name) {
                        if (!~resource.indexOf(name)) {
                            resource.push(name);
                        }
                    });
                });

                return resource;
            },

            queryState: function(km) {
                return km.getSelectedNode() ? 0 : -1;
            }
        });

        /**
         * @class 资源的覆盖图形
         *
         * 该类为一个资源以指定的颜色渲染一个动态的覆盖图形
         */
        var ResourceOverlay = kity.createClass('ResourceOverlay', {
            base: kity.Group,

            constructor: function() {
                this.callBase();

                var text, rect;

                rect = this.rect = new kity.Rect().setRadius(4);

                text = this.text = new kity.Text()
                    .setFontSize(12)
                    .setVerticalAlign('middle');

                this.addShapes([rect, text]);
            },

            setValue: function(resourceName, color) {
                var paddingX = 8,
                    paddingY = 4,
                    borderRadius = 4;
                var text, box, rect;

                text = this.text;

                if (resourceName == this.lastResourceName) {

                    box = this.lastBox;

                } else {

                    text.setContent(resourceName);

                    box = text.getBoundaryBox();
                    this.lastResourceName = resourceName;
                    this.lastBox = box;

                }

                text.setX(paddingX).fill(color.dec('l', 70));

                rect = this.rect;
                rect.setPosition(0, box.y - paddingY);
                this.width = Math.round(box.width + paddingX * 2);
                this.height = Math.round(box.height + paddingY * 2);
                rect.setSize(this.width, this.height);
                rect.fill(color);
            }
        });

        /**
         * @class 资源渲染器
         */
        var ResourceRenderer = kity.createClass('ResourceRenderer', {
            base: KityMinder.Renderer,

            create: function(node) {
                this.overlays = [];
                return new kity.Group();
            },

            shouldRender: function(node) {
                return node.getData('resource') && node.getData('resource').length;
            },

            update: function(container, node, box) {
                var spaceRight = node.getStyle('space-right');

                var overlays = this.overlays;
                var resource = node.getData('resource');
                var minder = node.getMinder();
                var i, overlay, x;

                x = 0;
                for (i = 0; i < resource.length; i++) {
                    x += spaceRight;

                    overlay = overlays[i];
                    if (!overlay) {
                        overlay = new ResourceOverlay();
                        overlays.push(overlay);
                        container.addShape(overlay);
                    }
                    overlay.setVisible(true);
                    overlay.setValue(resource[i], minder.getResourceColor(resource[i]));
                    overlay.setTranslate(x, -1);

                    x += overlay.width;
                }

                while ((overlay = overlays[i++])) overlay.setVisible(false);

                container.setTranslate(box.right, 0);

                return {
                    x: box.right,
                    y: Math.round(-overlays[0].height / 2),
                    width: x,
                    height: overlays[0].height
                };
            }
        });

        return {
            commands: {
                'resource': ResourceCommand
            },

            renderers: {
                right: ResourceRenderer
            }
        };
    });
/* src/module/resource.js end */




/* src/module/view.js */
    var ViewDragger = kity.createClass("ViewDragger", {
        constructor: function(minder) {
            this._minder = minder;
            this._enabled = false;
            this._bind();
        },
        isEnabled: function() {
            return this._enabled;
        },
        setEnabled: function(value) {
            var paper = this._minder.getPaper();
            paper.setStyle('cursor', value ? 'pointer' : 'default');
            paper.setStyle('cursor', value ? '-webkit-grab' : 'default');
            this._enabled = value;
        },
        move: function(offset, duration) {
            if (!duration) {
                this._minder.getRenderContainer().translate(offset.x | 0, offset.y | 0);
            } else {
                this._minder.getRenderContainer().fxTranslate(offset.x | 0, offset.y | 0, duration, 'easeOutCubic');
            }
        },

        _bind: function() {
            var dragger = this,
                isTempDrag = false,
                lastPosition = null,
                currentPosition = null;

            function dragEnd(e) {
                lastPosition = null;

                e.stopPropagation();

                // 临时拖动需要还原状态
                if (isTempDrag) {
                    dragger.setEnabled(false);
                    isTempDrag = false;
                    if (dragger._minder.getStatus() == 'hand')
                        dragger._minder.rollbackStatus();
                }
            }

            this._minder.on('normal.mousedown normal.touchstart ' +
                'inputready.mousedown inputready.touchstart ' +
                'readonly.mousedown readonly.touchstart', function(e) {
                    if (e.originEvent.button == 2) {
                        e.originEvent.preventDefault(); // 阻止中键拉动
                    }
                    // 点击未选中的根节点临时开启
                    if (e.getTargetNode() == this.getRoot() || e.originEvent.button == 2) {
                        lastPosition = e.getPosition();
                        isTempDrag = true;
                    }
                })

            .on('normal.mousemove normal.touchmove ' +
                'readonly.touchmove readonly.mousemove ' +
                'inputready.mousemove inputready.touchmove', function(e) {
                    if (!isTempDrag) return;
                    var offset = kity.Vector.fromPoints(lastPosition, e.getPosition());
                    if (offset.length() > 3) this.setStatus('hand');
                })

            .on('hand.beforemousedown hand.beforetouchstart', function(e) {
                // 已经被用户打开拖放模式
                if (dragger.isEnabled()) {
                    lastPosition = e.getPosition();
                    e.stopPropagation();
                }
            })

            .on('hand.beforemousemove hand.beforetouchmove', function(e) {
                if (lastPosition) {
                    currentPosition = e.getPosition();

                    // 当前偏移加上历史偏移
                    var offset = kity.Vector.fromPoints(lastPosition, currentPosition);
                    dragger.move(offset);
                    e.stopPropagation();
                    e.preventDefault();
                    e.originEvent.preventDefault();
                    lastPosition = currentPosition;
                }
            })

            .on('mouseup touchend', dragEnd);

            window.addEventListener('mouseup', dragEnd);
            dragger._minder.getRenderTarget().addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        }
    });

    KityMinder.registerModule('View', function() {

        var km = this;

        var ToggleHandCommand = kity.createClass('ToggleHandCommand', {
            base: Command,
            execute: function(minder) {

                if (minder.getStatus() != 'hand') {
                    minder.setStatus('hand');
                } else {
                    minder.rollbackStatus();
                }
                this.setContentChanged(false);

            },
            queryState: function(minder) {
                return minder.getStatus() == 'hand' ? 1 : 0;
            },
            enableReadOnly: false
        });

        var CameraCommand = kity.createClass('CameraCommand', {
            base: Command,
            execute: function(km, focusNode, duration) {
                focusNode = focusNode || km.getRoot();
                var viewport = km.getPaper().getViewPort();
                var offset = focusNode.getRenderContainer().getRenderBox('view');
                var dx = viewport.center.x - offset.x - offset.width / 2,
                    dy = viewport.center.y - offset.y;
                var dragger = km._viewDragger;

                dragger.move(new kity.Point(dx, dy), duration);
                this.setContentChanged(false);
            },
            enableReadOnly: false
        });

        var MoveCommand = kity.createClass('MoveCommand', {
            base: Command,

            execute: function(km, dir) {
                var dragger = this._viewDragger;
                var size = km._lastClientSize;
                switch (dir) {
                    case 'up':
                        dragger.move(new kity.Point(0, -size.height / 2));
                        break;
                    case 'down':
                        dragger.move(new kity.Point(0, size.height / 2));
                        break;
                    case 'left':
                        dragger.move(new kity.Point(-size.width / 2, 0));
                        break;
                    case 'right':
                        dragger.move(new kity.Point(size.width / 2, 0));
                        break;
                }
            }
        });

        return {
            init: function() {
                this._viewDragger = new ViewDragger(this);
            },
            commands: {
                'hand': ToggleHandCommand,
                'camera': CameraCommand,
                'move': MoveCommand
            },
            events: {
                keyup: function(e) {
                    if (e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0) {
                        this.execCommand('hand');
                        e.preventDefault();
                    }
                },
                statuschange: function(e) {
                    this._viewDragger.setEnabled(e.currentStatus == 'hand');
                },
                mousewheel: function(e) {
                    var dx, dy;
                    e = e.originEvent;
                    if (e.ctrlKey || e.shiftKey) return;
                    if ('wheelDeltaX' in e) {

                        dx = e.wheelDeltaX || 0;
                        dy = e.wheelDeltaY || 0;

                    } else {

                        dx = 0;
                        dy = e.wheelDelta;

                    }

                    this._viewDragger.move({
                        x: dx / 2.5,
                        y: dy / 2.5
                    });

                    e.preventDefault();
                },
                'normal.dblclick readonly.dblclick': function(e) {
                    if (e.kityEvent.targetShape instanceof kity.Paper) {
                        this.execCommand('camera', this.getRoot(), 800);
                    }
                },
                ready: function() {
                    this.execCommand('camera', null, 0);
                    this._lastClientSize = {
                        width: this.getRenderTarget().clientWidth,
                        height: this.getRenderTarget().clientHeight
                    };
                },
                resize: function(e) {
                    var a = {
                            width: this.getRenderTarget().clientWidth,
                            height: this.getRenderTarget().clientHeight
                        },
                        b = this._lastClientSize;
                    this.getRenderContainer().translate(
                        (a.width - b.width) / 2 | 0, (a.height - b.height) / 2 | 0);
                    this._lastClientSize = a;
                }
            }
        };
    });
/* src/module/view.js end */




/* src/module/dragtree.js */
    var GM = KityMinder.Geometry;

    // 矩形的变形动画定义

    var MoveToParentCommand = kity.createClass('MoveToParentCommand', {
        base: Command,
        execute: function(minder, nodes, parent) {
            var node;
            for (var i = nodes.length - 1; i >= 0; i--) {
                node = nodes[i];
                if (node.parent) {
                    node.parent.removeChild(node);
                    parent.appendChild(node);
                    node.render();
                }
            }
            parent.expand();
            minder.select(nodes, true);
        }
    });

    var DropHinter = kity.createClass('DropHinter', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.rect = new kity.Rect();
            this.addShape(this.rect);
        },

        render: function(target) {
            this.setVisible(!!target);
            if (target) {
                this.rect
                    .setBox(target.getLayoutBox())
                    .setRadius(target.getStyle('radius') || 0)
                    .stroke(
                        target.getStyle('drop-hint-color') || 'yellow',
                        target.getStyle('drop-hint-width') || 2
                );
                this.bringTop();
            }
        }
    });

    var OrderHinter = kity.createClass('OrderHinter', {
        base: kity.Group,

        constructor: function() {
            this.callBase();
            this.area = new kity.Rect();
            this.path = new kity.Path();
            this.addShapes([this.area, this.path]);
        },

        render: function(hint) {
            this.setVisible(!!hint);
            if (hint) {
                this.area.setBox(hint.area);
                this.area.fill(hint.node.getStyle('order-hint-area-color') || 'rgba(0, 255, 0, .5)');
                this.path.setPathData(hint.path);
                this.path.stroke(
                    hint.node.getStyle('order-hint-path-color') || '#0f0',
                    hint.node.getStyle('order-hint-path-width') || 1);
            }
        }
    });

    // 对拖动对象的一个替代盒子，控制整个拖放的逻辑，包括：
    //    1. 从节点列表计算出拖动部分
    //    2. 计算可以 drop 的节点，产生 drop 交互提示
    var TreeDragger = kity.createClass('TreeDragger', {

        constructor: function(minder) {
            this._minder = minder;
            this._dropHinter = new DropHinter();
            this._orderHinter = new OrderHinter();
            minder.getRenderContainer().addShapes([this._dropHinter, this._orderHinter]);
        },

        dragStart: function(position) {
            // 只记录开始位置，不马上开启拖放模式
            // 这个位置同时是拖放范围收缩时的焦点位置（中心）
            this._startPosition = position;
        },

        dragMove: function(position) {
            // 启动拖放模式需要最小的移动距离
            var DRAG_MOVE_THRESHOLD = 10;

            if (!this._startPosition) return;

            this._dragPosition = position;

            if (!this._dragMode) {
                // 判断拖放模式是否该启动
                if (GM.getDistance(this._dragPosition, this._startPosition) < DRAG_MOVE_THRESHOLD) {
                    return;
                }
                if (!this._enterDragMode()) {
                    return;
                }
            }

            var movement = kity.Vector.fromPoints(this._startPosition, this._dragPosition);
            var minder = this._minder;

            for (var i = 0; i < this._dragSources.length; i++) {
                this._dragSources[i].setLayoutOffset(this._dragSourceOffsets[i].offset(movement));
                minder.applyLayoutResult(this._dragSources[i]);
            }

            if (!this._dropTest()) {
                this._orderTest();
            } else {
                this._renderOrderHint(this._orderSucceedHint = null);
            }
        },

        dragEnd: function() {
            this._startPosition = null;

            if (!this._dragMode) {
                return;
            }

            this._fadeDragSources(1);

            if (this._dropSucceedTarget) {

                this._dragSources.forEach(function(source) {
                    source.setLayoutOffset(null);
                });

                this._minder.execCommand('movetoparent', this._dragSources, this._dropSucceedTarget);

            } else if (this._orderSucceedHint) {

                var hint = this._orderSucceedHint;
                var index = hint.node.getIndex();

                var sourceIndexes = this._dragSources.map(function(source) {
                    // 顺便干掉布局偏移
                    source.setLayoutOffset(null);
                    return source.getIndex();
                });

                var maxIndex = Math.max.apply(Math, sourceIndexes);
                var minIndex = Math.min.apply(Math, sourceIndexes);

                if (index < minIndex && hint.type == 'down') index++;
                if (index > maxIndex && hint.type == 'up') index--;

                hint.node.setLayoutOffset(null);

                this._minder.execCommand('arrange', this._dragSources, index);
                this._renderOrderHint(null);
            } else {
                this._minder.fire('savescene');
            }
            this._leaveDragMode();
            this._minder.fire('contentchange');
        },

        // 进入拖放模式：
        //    1. 计算拖放源和允许的拖放目标
        //    2. 标记已启动
        _enterDragMode: function() {
            this._calcDragSources();
            if (!this._dragSources.length) {
                this._startPosition = null;
                return false;
            }
            this._fadeDragSources(0.5);
            this._calcDropTargets();
            this._calcOrderHints();
            this._dragMode = true;
            this._minder.setStatus('dragtree');
            return true;
        },

        // 从选中的节点计算拖放源
        //    并不是所有选中的节点都作为拖放源，如果选中节点中存在 A 和 B，
        //    并且 A 是 B 的祖先，则 B 不作为拖放源
        //
        //    计算过程：
        //       1. 将节点按照树高排序，排序后只可能是前面节点是后面节点的祖先
        //       2. 从后往前枚举排序的结果，如果发现枚举目标之前存在其祖先，
        //          则排除枚举目标作为拖放源，否则加入拖放源
        _calcDragSources: function() {
            this._dragSources = this._minder.getSelectedAncestors();
            this._dragSourceOffsets = this._dragSources.map(function(src) {
                return src.getLayoutOffset();
            });
        },

        _fadeDragSources: function(opacity) {
            var minder = this._minder;
            this._dragSources.forEach(function(source) {
                source.getRenderContainer().fxOpacity(opacity, 200);
                source.traverse(function(node) {
                    if (opacity < 1) {
                        minder.detachNode(node);
                    } else {
                        minder.attachNode(node);
                    }
                }, true);
            });
        },


        // 计算拖放目标可以释放的节点列表（释放意味着成为其子树），存在这条限制规则：
        //    - 不能拖放到拖放目标的子树上（允许拖放到自身，因为多选的情况下可以把其它节点加入）
        //
        //    1. 加入当前节点（初始为根节点）到允许列表
        //    2. 对于当前节点的每一个子节点：
        //       (1) 如果是拖放目标的其中一个节点，忽略（整棵子树被剪枝）
        //       (2) 如果不是拖放目标之一，以当前子节点为当前节点，回到 1 计算
        //    3. 返回允许列表
        //
        _calcDropTargets: function() {

            function findAvailableParents(nodes, root) {
                var availables = [],
                    i;
                availables.push(root);
                root.getChildren().forEach(function(test) {
                    for (i = 0; i < nodes.length; i++) {
                        if (nodes[i] == test) return;
                    }
                    availables = availables.concat(findAvailableParents(nodes, test));
                });
                return availables;
            }

            this._dropTargets = findAvailableParents(this._dragSources, this._minder.getRoot());
            this._dropTargetBoxes = this._dropTargets.map(function(source) {
                return source.getLayoutBox();
            });
        },

        _calcOrderHints: function() {
            var sources = this._dragSources;
            var ancestor = MinderNode.getCommonAncestor(sources);

            // 只有一个元素选中，公共祖先是其父
            if (ancestor == sources[0]) ancestor = sources[0].parent;

            if (sources.length === 0 || ancestor != sources[0].parent) {
                this._orderHints = [];
                return;
            }

            var siblings = ancestor.children;

            this._orderHints = siblings.reduce(function(hint, sibling) {
                if (sources.indexOf(sibling) == -1) {
                    hint = hint.concat(sibling.getOrderHint());
                }
                return hint;
            }, []);
        },

        _leaveDragMode: function() {
            this._dragMode = false;
            this._dropSucceedTarget = null;
            this._orderSucceedHint = null;
            this._renderDropHint(null);
            this._renderOrderHint(null);
            this._minder.rollbackStatus();
        },

        _drawForDragMode: function() {
            this._text.setContent(this._dragSources.length + ' items');
            this._text.setPosition(this._startPosition.x, this._startPosition.y + 5);
            this._minder.getRenderContainer().addShape(this);
        },

        _boxTest: function(targets, targetBoxMapper, judge) {
            var sourceBoxes = this._dragSources.map(function(source) {
                return source.getLayoutBox();
            });

            var i, j, target, sourceBox, targetBox;

            judge = judge || function(intersectBox, sourceBox, targetBox) {
                return intersectBox;
            };

            for (i = 0; i < targets.length; i++) {

                target = targets[i];
                targetBox = targetBoxMapper.call(this, target, i);

                for (j = 0; j < sourceBoxes.length; j++) {
                    sourceBox = sourceBoxes[j];

                    var intersectBox = GM.getIntersectBox(sourceBox, targetBox);
                    if (judge(intersectBox, sourceBox, targetBox)) {
                        return target;
                    }
                }
            }

            return null;
        },

        _dropTest: function() {
            this._dropSucceedTarget = this._boxTest(this._dropTargets, function(target, i) {
                return this._dropTargetBoxes[i];
            }, function(intersectBox, sourceBox, targetBox) {
                function area(box) {
                    return box.width * box.height;
                }
                if (!intersectBox) return false;
                // 面积判断
                if (area(intersectBox) > 0.5 * Math.min(area(sourceBox), area(targetBox))) return true;
                if (intersectBox.width + 1 >= Math.min(sourceBox.width, targetBox.width)) return true;
                if (intersectBox.height + 1 >= Math.min(sourceBox.height, targetBox.height)) return true;
                return false;
            });
            this._renderDropHint(this._dropSucceedTarget);
            return !!this._dropSucceedTarget;
        },

        _orderTest: function() {
            this._orderSucceedHint = this._boxTest(this._orderHints, function(hint) {
                return hint.area;
            });
            this._renderOrderHint(this._orderSucceedHint);
            return !!this._orderSucceedHint;
        },

        _renderDropHint: function(target) {
            this._dropHinter.render(target);
        },

        _renderOrderHint: function(hint) {
            this._orderHinter.render(hint);
        },
        preventDragMove: function() {
            this._startPosition = null;
        }
    });

    KityMinder.registerModule('DragTree', function() {
        var dragger;

        return {
            init: function() {
                dragger = new TreeDragger(this);
                window.addEventListener('mouseup', function() {
                    dragger.dragEnd();
                });
            },
            events: {
                'normal.mousedown inputready.mousedown': function(e) {
                    // 单选中根节点也不触发拖拽
                    if (e.originEvent.button) return;
                    if (e.getTargetNode() && e.getTargetNode() != this.getRoot()) {
                        dragger.dragStart(e.getPosition(this.getRenderContainer()));
                    }
                },
                'normal.mousemove dragtree.mousemove': function(e) {
                    dragger.dragMove(e.getPosition(this.getRenderContainer()));
                },
                'normal.mouseup dragtree.beforemouseup': function(e) {
                    dragger.dragEnd();
                    //e.stopPropagation();
                    e.preventDefault();
                    this.fire('contentchange');
                },
                'statuschange': function(e) {
                    if (e.lastStatus == 'textedit' && e.currentStatus == 'normal') {
                        dragger.preventDragMove();
                    }
                }
            },
            commands: {
                'movetoparent': MoveToParentCommand
            }
        };
    });
/* src/module/dragtree.js end */




/* src/module/dropfile.js */
    KityMinder.registerModule('DropFile', function() {

        var social,
            draftManager,
            importing = false;

        function init() {
            var container = this.getPaper().getContainer();
            container.addEventListener('dragover', onDragOver);
            container.addEventListener('drop', onDrop.bind(this));
        }

        function onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
        }

        function onDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            var minder = this;

            if (kity.Browser.ie && Number(kity.Browser.version) < 10) {
                alert('文件导入对 IE 浏览器仅支持 10 以上版本');
                return;
            }

            var files = e.dataTransfer.files;

            if (files) {
                var file = files[0];
                importMinderFile(minder, file);
            }
        }

        function importMinderFile(minder, file, encoding) {
            if (!file) return;

            var ext = /(.)\w+$/.exec(file.name);
            
            if (!ext) return alert('不支持导入此类文件！');
            
            ext = ext[0];

            if ((/xmind/g).test(ext)) { //xmind zip
                importSync(minder, file, 'xmind');
            } else if ((/mmap/g).test(ext)) { // mindmanager zip
                importSync(minder, file, 'mindmanager');
            } else if ((/mm/g).test(ext)) { //freemind xml
                importAsync(minder, file, 'freemind', encoding);
            } else if (/km/.test(ext)) { // txt json
                importAsync(minder, file, 'json', encoding);
            } else if (/txt/.test(ext)) {
                importAsync(minder, file, 'plain', encoding);
            } else {
                alert('不支持导入此类文件!');
            }
        }

        function afterImport() {
            if (!importing) return;
            createDraft(this);
            social.setRemotePath(null, false);
            this.execCommand('camera', this.getRoot(), 800);
            setTimeout(function() {
                social.watchChanges(true);
            }, 10);
            importing = false;
        }

        // 同步加载文件
        function importSync(minder, file, protocal) {
            social = social || window.social;
            social.watchChanges(false);
            importing = true;
            minder.importData(file, protocal); //zip文件的import是同步的
        }

        // 异步加载文件
        function importAsync(minder, file, protocal, encoding) {
            var reader = new FileReader();
            reader.onload = function (e) {
                importSync(minder, e.target.result, protocal);
            };
            reader.readAsText(file, encoding || 'utf8');
        }

        function createDraft(minder) {
            draftManager = window.draftManager || (window.draftManager = new window.DraftManager(minder));
            draftManager.create();
        }

        kity.extendClass(Minder, {
            importFile: function(file, encoding) {
                importMinderFile(this, file, encoding);
                return this;
            }
        });

        return {
            events: {
                'ready': init,
                'import': afterImport
            }
        };
    });
/* src/module/dropfile.js end */




/* src/module/keyboard.js */
    KityMinder.registerModule('KeyboardModule', function() {
        var min = Math.min,
            max = Math.max,
            abs = Math.abs,
            sqrt = Math.sqrt,
            exp = Math.exp;

        function buildPositionNetwork(root) {
            var pointIndexes = [],
                p;
            root.traverse(function(node) {
                p = node.getLayoutBox();

                // bugfix: 不应导航到收起的节点（判断其尺寸是否存在）
                if (p.width && p.height) {
                    pointIndexes.push({
                        left: p.x,
                        top: p.y,
                        right: p.x + p.width,
                        bottom: p.y + p.height,
                        width: p.width,
                        height: p.height,
                        node: node,
                        text: node.getText()
                    });
                }
            });
            for (var i = 0; i < pointIndexes.length; i++) {
                findClosestPointsFor(pointIndexes, i);
            }
        }


        // 这是金泉的点子，赞！
        // 求两个不相交矩形的最近距离
        function getCoefedDistance(box1, box2) {
            var xMin, xMax, yMin, yMax, xDist, yDist, dist, cx, cy;
            xMin = min(box1.left, box2.left);
            xMax = max(box1.right, box2.right);
            yMin = min(box1.top, box2.top);
            yMax = max(box1.bottom, box2.bottom);

            xDist = xMax - xMin - box1.width - box2.width;
            yDist = yMax - yMin - box1.height - box2.height;

            if (xDist < 0) dist = yDist;
            else if (yDist < 0) dist = xDist;
            else dist = sqrt(xDist * xDist + yDist * yDist);

            return {
                cx: dist,
                cy: dist
            };
        }

        function findClosestPointsFor(pointIndexes, iFind) {
            var find = pointIndexes[iFind];
            var most = {},
                quad;
            var current, dist;

            for (var i = 0; i < pointIndexes.length; i++) {

                if (i == iFind) continue;
                current = pointIndexes[i];

                dist = getCoefedDistance(current, find);

                // left check
                if (current.right < find.left) {
                    if (!most.left || dist.cx < most.left.dist) {
                        most.left = {
                            dist: dist.cx,
                            node: current.node
                        };
                    }
                }

                // right check
                if (current.left > find.right) {
                    if (!most.right || dist.cx < most.right.dist) {
                        most.right = {
                            dist: dist.cx,
                            node: current.node
                        };
                    }
                }

                // top check
                if (current.bottom < find.top) {
                    if (!most.top || dist.cy < most.top.dist) {
                        most.top = {
                            dist: dist.cy,
                            node: current.node
                        };
                    }
                }

                // bottom check
                if (current.top > find.bottom) {
                    if (!most.down || dist.cy < most.down.dist) {
                        most.down = {
                            dist: dist.cy,
                            node: current.node
                        };
                    }
                }
            }
            find.node._nearestNodes = {
                right: most.right && most.right.node || null,
                top: most.top && most.top.node || null,
                left: most.left && most.left.node || null,
                down: most.down && most.down.node || null
            };
        }


        function navigateTo(km, direction) {
            var referNode = km.getSelectedNode();
            if (!referNode) {
                km.select(km.getRoot());
                buildPositionNetwork(km.getRoot());
                return;
            }
            var nextNode = referNode._nearestNodes[direction];
            if (nextNode) {
                km.select(nextNode, true);
            }
        }
        var lastFrame;
        return {
            'events': {
                'layoutallfinish': function() {
                    var root = this.getRoot();
                    function build() {
                        buildPositionNetwork(root);
                    }
                    kity.Timeline.releaseFrame(lastFrame);
                    lastFrame = kity.Timeline.requestFrame(build);
                },
                'inputready.beforekeydown': function(e) {
                    var keyEvent = e.originEvent;
                    if (keyEvent.shiftKey && keyEvent.keyCode == KityMinder.keymap.Tab) e.preventDefault();
                },
                'normal.keydown': function(e) {

                    var keys = KityMinder.keymap;
                    var node = e.getTargetNode();
                    var lang = this.getLang();

                    if (this.receiver) this.receiver.keydownNode = node;

                    var keyEvent = e.originEvent;

                    if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey) {
                        if ([keys.Tab].indexOf(keyEvent.keyCode)) e.preventDefault;
                        return;
                    }

                    switch (keyEvent.keyCode) {
                        case keys.Enter:
                            this.execCommand('AppendSiblingNode', lang.topic);
                            e.preventDefault();
                            break;
                        case keys.Tab:
                            this.execCommand('AppendChildNode', lang.topic);
                            e.preventDefault();
                            break;
                        case keys.Backspace:
                        case keys.Del:
                            e.preventDefault();
                            this.execCommand('RemoveNode');
                            break;
                        case keys.F2:
                            e.preventDefault();
                            this.execCommand('EditNode');
                            break;

                        case keys.Left:
                            navigateTo(this, 'left');
                            e.preventDefault();
                            break;
                        case keys.Up:
                            navigateTo(this, 'top');
                            e.preventDefault();
                            break;
                        case keys.Right:
                            navigateTo(this, 'right');
                            e.preventDefault();
                            break;
                        case keys.Down:
                            navigateTo(this, 'down');
                            e.preventDefault();
                            break;
                    }

                },
                'normal.keyup': function(e) {
                    if (browser.ipad) {
                        var keys = KityMinder.keymap;
                        var node = e.getTargetNode();
                        var lang = this.getLang();

                        if (this.receiver) this.receiver.keydownNode = node;

                        var keyEvent = e.originEvent;

                        if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.shiftKey) return;

                        switch (keyEvent.keyCode) {
                            case keys.Enter:
                                this.execCommand('AppendSiblingNode', lang.topic);
                                e.preventDefault();
                                break;

                            case keys.Backspace:
                            case keys.Del:
                                e.preventDefault();
                                this.execCommand('RemoveNode');
                                break;

                        }
                    }

                }
            }
        };
    });
/* src/module/keyboard.js end */




/* src/module/select.js */
    KityMinder.registerModule('Select', function() {
        var minder = this;
        var rc = minder.getRenderContainer();
        var g = KityMinder.Geometry;

        // 在实例上渲染框选矩形、计算框选范围的对象
        var marqueeActivator = (function() {

            // 记录选区的开始位置（mousedown的位置）
            var startPosition = null;

            // 选区的图形
            var marqueeShape = new kity.Path();

            // 标记是否已经启动框选状态
            //    并不是 mousedown 发生之后就启动框选状态，而是检测到移动了一定的距离（MARQUEE_MODE_THRESHOLD）之后
            var marqueeMode = false;
            var MARQUEE_MODE_THRESHOLD = 10;

            return {
                selectStart: function(e) {
                    // 只接受左键
                    if (e.originEvent.button) return;

                    // 清理不正确状态
                    if (startPosition) {
                        return this.selectEnd();
                    }

                    startPosition = g.snapToSharp(e.getPosition(rc));
                },
                selectMove: function(e) {
                    if (minder.getStatus() == 'textedit') {
                        return;
                    }
                    if (!startPosition) return;

                    var p1 = startPosition,
                        p2 = e.getPosition(rc);

                    // 检测是否要进入选区模式
                    if (!marqueeMode) {
                        // 距离没达到阈值，退出
                        if (g.getDistance(p1, p2) < MARQUEE_MODE_THRESHOLD) {
                            return;
                        }
                        // 已经达到阈值，记录下来并且重置选区形状
                        marqueeMode = true;
                        rc.addShape(marqueeShape);
                        marqueeShape
                            .fill(minder.getStyle('marquee-background'))
                            .stroke(minder.getStyle('marquee-stroke')).setOpacity(0.8).getDrawer().clear();
                    }

                    var marquee = g.getBox(p1, p2),
                        selectedNodes = [];

                    // 使其犀利
                    marquee.left = Math.round(marquee.left);
                    marquee.top = Math.round(marquee.top);
                    marquee.right = Math.round(marquee.right);
                    marquee.bottom = Math.round(marquee.bottom);

                    // 选区形状更新
                    marqueeShape.getDrawer().pipe(function() {
                        this.clear();
                        this.moveTo(marquee.left, marquee.top);
                        this.lineTo(marquee.right, marquee.top);
                        this.lineTo(marquee.right, marquee.bottom);
                        this.lineTo(marquee.left, marquee.bottom);
                        this.close();
                    });

                    // 计算选中范围
                    minder.getRoot().traverse(function(node) {
                        var renderBox = node.getLayoutBox();
                        if (g.getIntersectBox(renderBox, marquee)) {
                            selectedNodes.push(node);
                        }
                    });

                    // 应用选中范围
                    minder.select(selectedNodes, true);

                    // 清除多余的东西
                    window.getSelection().removeAllRanges();
                },
                selectEnd: function(e) {
                    if (startPosition) {
                        startPosition = null;
                    }
                    if (marqueeMode) {
                        marqueeShape.fadeOut(200, 'ease', 0, function() {
                            if (marqueeShape.remove) marqueeShape.remove();
                        });
                        marqueeMode = false;
                    }
                }
            };
        })();

        var lastDownNode = null, lastDownPosition = null;
        return {
            'init': function() {
                window.addEventListener('mouseup', function() {
                    marqueeActivator.selectEnd();
                });
            },
            'events': {
                'normal.mousedown textedit.mousedown inputready.mousedown': function(e) {

                    var downNode = e.getTargetNode();

                    // 没有点中节点：
                    //     清除选中状态，并且标记选区开始位置
                    if (!downNode) {
                        this.removeAllSelectedNodes();
                        marqueeActivator.selectStart(e);

                        this.setStatus('normal');
                    }

                    // 点中了节点，并且按了 shift 键：
                    //     被点中的节点切换选中状态
                    else if (e.originEvent.shiftKey) {
                        this.toggleSelect(downNode);
                    }

                    // 点中的节点没有被选择：
                    //     单选点中的节点
                    else if (!downNode.isSelected()) {
                        this.select(downNode, true);
                    }

                    // 点中的节点被选中了，并且不是单选：
                    //     完成整个点击之后需要使其变为单选。
                    //     不能马上变为单选，因为可能是需要拖动选中的多个节点
                    else if (!this.isSingleSelect()) {
                        lastDownNode = downNode;
                        lastDownPosition = e.getPosition(this.getRenderContainer());
                    }
                },
                'normal.mousemove textedit.mousemove inputready.mousemove': marqueeActivator.selectMove,
                'normal.mouseup textedit.mouseup inputready.mouseup': function(e) {
                    var upNode = e.getTargetNode();

                    // 如果 mouseup 发生在 lastDownNode 外，是无需理会的
                    if (upNode && upNode == lastDownNode) {
                        var upPosition = e.getPosition(this.getRenderContainer());
                        var movement = kity.Vector.fromPoints(lastDownPosition, upPosition);
                        if (movement.length() < 1) this.select(lastDownNode, true);
                        lastDownNode = null;
                    }

                    // 清理一下选择状态
                    marqueeActivator.selectEnd(e);
                },
                //全选操作
                'normal.keydown inputready.keydown':function(e){


                    var keyEvent = e.originEvent;

                    if ( (keyEvent.ctrlKey || keyEvent.metaKey) && keymap.a == keyEvent.keyCode){
                        var selectedNodes = [];

                        this.getRoot().traverse(function(node){
                            selectedNodes.push(node);
                        });
                        this.select(selectedNodes,true);
                        e.preventDefault();
                    }
                }
            }
        };
    });
/* src/module/select.js end */




/* src/module/editor.js */
    /* global Renderer: true */

    KityMinder.registerModule('TextEditModule', function() {
        var km = this;
        var sel = new Minder.Selection();
        var range = new Minder.Range();
        var receiver = new Minder.Receiver(this,sel,range);


        this.receiver = receiver;

        //鼠标被点击，并未太抬起时为真
        var mouseDownStatus = false;

        var lastEvtPosition, dir = 1;

        //当前是否有选区存在
        var selectionReadyShow = false;

        function inputStatusReady(node){
            if (node && km.isSingleSelect() && node.isSelected()) {

                var color = node.getStyle('text-selection-color');

                //准备输入状态
                var textShape = node.getTextShape();

                sel.setHide()
                    .setStartOffset(0)
                    .setEndOffset(textShape.getContent().length)
                    .setColor(color);


                receiver
                    .setMinderNode(node)
                    .updateContainerRangeBySel();

                if(browser.ie ){
                    var timer = setInterval(function(){
                        var nativeRange = range.nativeSel.getRangeAt(0);
                        if(!nativeRange || nativeRange.collapsed){
                            range.select();
                        }else {
                            clearInterval(timer);
                        }
                    });
                }


                receiver.minderNode.setTmpData('_lastTextContent',receiver.textShape.getContent());

                km.setStatus('inputready');

            }

        }

        km.textEditNode = function(node){
            inputStatusReady(node);
            km.setStatus('textedit');
            receiver.updateSelectionShow();
        };
        return {
            'events': {
                'ready': function() {
                    document.body.appendChild(receiver.container);
                },

                'normal.beforemousedown textedit.beforemousedown inputready.beforemousedown': function(e) {
                    //右键直接退出
                    if (e.isRightMB()) {
                        return;
                    }


                    if(receiver.minderNode){
                        var textShape = receiver.minderNode.getTextShape();
                        if(textShape && textShape.getOpacity() === 0){
                            receiver.minderNode.setText(receiver.minderNode.getTmpData('_lastTextContent'));
                            receiver.minderNode.render();
                            receiver.minderNode.getTextShape().setOpacity(1);
                            km.layout(300);
                        }

                    }
                    mouseDownStatus = true;

                    selectionReadyShow = sel.isShow();

                    sel.setHide();

                    var node = e.getTargetNode();

                    //点击在之前的选区上
                    if (!node) {
                        var selectionShape = e.kityEvent.targetShape;
                        if (selectionShape && selectionShape.getType() == 'Selection') {
                            node = receiver.getMinderNode();
                            e.stopPropagationImmediately();
                        }

                    }

                    if(node){

                        var textShape = node.getTextShape();
                        textShape.setStyle('cursor', 'default');
                        if (this.isSingleSelect() && node.isSelected()) {
                            sel.collapse(true);
                            sel.setColor(node.getStyle('text-selection-color'));
                            receiver
                                .setMinderNode(node)
                                .setCurrentIndex(e.getPosition(this.getRenderContainer()))
                                .setRange(range)
                                .setReady();

                            lastEvtPosition = e.getPosition(this.getRenderContainer());

                            if(selectionReadyShow){

                                textShape.setStyle('cursor', 'text');

                                receiver.updateSelection();
                                setTimeout(function() {
                                    sel.setShow();
                                }, 200);
                                km.setStatus('textedit');

                            }

                            return;

                        }
                    }
                    //模拟光标没有准备好
                    receiver.clearReady();
                    //当点击空白处时，光标需要消失
                    receiver.clear();

                },
                'inputready.keyup':function(e){
                    if(sel.isHide()){
                        inputStatusReady(this.getSelectedNode());
                    }
                },

                //当节点选区通过键盘发生变化时，输入状态要准备好
                'normal.keyup': function(e) {
                    var node = this.getSelectedNode();
                    if (node) {
                        if (this.isSingleSelect() && node.isSelected() && !sel.isShow() ) {
                            var orgEvt = e.originEvent,
                                keyCode = orgEvt.keyCode;
                            if (keymap.isSelectedNodeKey[keyCode] &&
                                !orgEvt.ctrlKey &&
                                !orgEvt.metaKey &&
                                !orgEvt.shiftKey &&
                                !orgEvt.altKey) {
                                    inputStatusReady(node);
                            }
                        }
                    }
                },
                'normal.mouseup textedit.mouseup inputready.mouseup': function(e) {

                    mouseDownStatus = false;

                    var node = e.getTargetNode();


                    if (node && !selectionReadyShow && receiver.isReady()) {

                        sel.collapse(true);

                        sel.setColor(node.getStyle('text-selection-color'));



                        node.getTextShape().setStyle('cursor', 'text');

                        receiver.updateSelection();

                        //必须再次focus，要不不能呼出键盘
                        if(browser.ipad){
                            receiver.focus();
                        }

                        setTimeout(function() {
                            sel.setShow();
                        }, 200);


                        lastEvtPosition = e.getPosition(this.getRenderContainer());

                        km.setStatus('textedit');

                        return;
                    }

                    //当选中节点后，输入状态准备
                    if(sel.isHide()){
                        inputStatusReady(e.getTargetNode());
                    }else {
                        //当有光标时，要同步选区
                        if(!sel.collapsed){

                            receiver.updateContainerRangeBySel();
                        }


                    }




                },
                'textedit.beforemousemove inputready.beforemousemove': function(e) {
                    if(browser.ipad){
                        return;
                    }
                    //ipad下不做框选
                    if (mouseDownStatus && receiver.isReady() && selectionReadyShow) {


                        e.stopPropagationImmediately();

                        var offset = e.getPosition(this.getRenderContainer());
                        dir = offset.x > lastEvtPosition.x ? 1 : (offset.x < lastEvtPosition.x ? -1 : dir);
                        receiver.updateSelectionByMousePosition(offset, dir)
                            .updateSelectionShow(dir)
                            .updateContainerRangeBySel();

                        lastEvtPosition = e.getPosition(this.getRenderContainer());

                    }else if(mouseDownStatus && !selectionReadyShow){
                        //第一次点中，第二次再次点中进行拖拽
                        km.setStatus('normal');
                        receiver.clearReady();
                    }
                },
                'normal.dblclick textedit.dblclick inputready.dblclick': function(e) {

                    var node = e.getTargetNode();
                    if(node){
                        inputStatusReady(e.getTargetNode());

                        km.setStatus('textedit');

                        receiver.updateSelectionShow();
                    }

                },
                'restoreScene': function() {
                    receiver.clear();
                    inputStatusReady(this.getSelectedNode());
                },
                'stopTextEdit': function() {
                    receiver.clear();
                    km.setStatus('normal');
                },
                'resize': function(e) {
                    sel.setHide();
                },
                'execCommand': function(e) {
                    var cmds = {
                        'appendchildnode': 1,
                        'appendsiblingnode': 1,
                        'editnode': 1
                    };
                    if (cmds[e.commandName]) {
                        inputStatusReady(km.getSelectedNode());
                        receiver.updateSelectionShow();
                        return;

                    }

                    if(sel.isShow()){
                        receiver.updateTextOffsetData().updateSelection();
                    }
                },
                'layoutfinish':function(e){
                    if (e.node === receiver.minderNode && (this.getStatus() == 'textedit' || this.getStatus() == 'inputready') ) {//&& selectionReadyShow
                        receiver
                            .setBaseOffset()
                            .setContainerStyle();
                    }
                },
                'selectionclear': function() {
                    var node = km.getSelectedNode();
                    if(node){
                        inputStatusReady(node);
                    }else{
                        km.setStatus('normal');
                        receiver.clear();
                    }


                },
                'blur': function() {
                    receiver.clear();
                },
                'textedit.import': function() {
                    km.setStatus('normal');
                    receiver.clear();
                },
                'textedit.mousewheel': function() {
                    receiver.setContainerStyle();
                }

            }
        };
    });
/* src/module/editor.js end */




/* src/module/editor.range.js */
    Minder.Range = kity.createClass('Range',{
        constructor : function(){
            this.nativeRange = document.createRange();
            this.nativeSel = window.getSelection();
        },
        hasNativeRange : function(){
            return this.nativeSel.rangeCount !== 0 ;
        },
        select:function(){
            var start = this.nativeRange.startContainer;
            if(start.nodeType == 1 && start.childNodes.length === 0){
                var char = document.createTextNode('\u200b');
                start.appendChild(char);
                this.nativeRange.setStart(char,1);
                this.nativeRange.collapse(true);
            }
            try{
                this.nativeSel.removeAllRanges();
            }catch(e){

            }

            this.nativeSel.addRange(this.nativeRange);
            return this;
        },
        setStart:function(node,index){
            try{
                this.nativeRange.setStart(node,index);
            }catch(error){
                console.log(error);
            }

            return this;
        },
        setEnd:function(node,index){
            this.nativeRange.setEnd(node,index);
            return this;
        },
        getStart:function(){
            var range = this.nativeSel.getRangeAt(0);
            return {
                startContainer:range.startContainer,
                startOffset:range.startOffset
            };
        },
        getStartOffset:function(){
            return this.nativeRange.startOffset;
        },
        getEndOffset:function(){
            return this.nativeRange.endOffset;
        },
        collapse:function(toStart){
            this.nativeRange.collapse(toStart === true);
            return this;
        },
        isCollapsed:function(){
            return this.nativeRange.collapsed;
        },
        insertNode:function(node){
            this.nativeRange.insertNode(node);
            return this;
        },
        updateNativeRange:function(){

            this.nativeRange = this.nativeSel.getRangeAt(0);
            return this;
        }

    });
/* src/module/editor.range.js end */




/* src/module/editor.receiver.js */
    //接收者
    Minder.Receiver = kity.createClass('Receiver', {
        clear: function() {
            this.container.innerHTML = '';
            if (this.selection) {
                this.selection.setHide();
            }
            if (this.range) {
                this.range.nativeSel.removeAllRanges();
            }
            this.index = 0;
            this.isTypeText = false;
            this.lastMinderNode = null;
            return this;
        },
        constructor: function(km,sel,range) {
            var me = this;
            this.setKityMinder(km);

            var _div = document.createElement('div');
            _div.setAttribute('contenteditable', true);
            _div.className = 'km_receiver';

            this.container = _div;

            if(browser.ipad) {
                utils.listen(this.container, 'keydown keypress keyup input', function(e) {
                    me.keyboardEvents.call(me, new MinderEvent(e.type == 'keyup' ? 'beforekeyup' : e.type, e));
                    if(e.type == 'keyup'){
                        if(me.km.getStatus() == 'normal'){
                            me.km.fire( 'keyup', e);
                        }

                    }

                });
            }
            utils.addCssRule('km_receiver_css', ' .km_receiver{white-space:nowrap;position:absolute;padding:0;margin:0;word-wrap:break-word;' + (/\?debug#?/.test(location.href)?'':'clip:rect(1em 1em 1em 1em);'));
            this.km.on('inputready.beforekeyup inputready.beforekeydown textedit.beforekeyup normal.keydown normal.keyup textedit.beforekeydown textedit.keypress textedit.paste', utils.proxy(this.keyboardEvents, this));
            this.timer = null;
            this.index = 0;
            this.selection = sel;
            this.range = range;
        },
        setRange: function(range, index) {

            this.index = index || this.index;

            var text = this.container.firstChild;
            this.range = range;
            range.setStart(text || this.container, this.index)
            range.collapse(true);
            var me = this;

            setTimeout(function() {
                me.container.focus();
                range.select();
            });
            return this;
        },
        setTextShape: function(textShape) {
            if (!textShape) {
                textShape = new kity.Text();
            }
            this.textShape = textShape;
            // techird: add cache
            if (textShape._lastContent != textShape.getContent()) {
                this.container.innerHTML = utils.unhtml(textShape.getContent());
                textShape._lastContent = textShape.getContent();
            }
            return this;
        },
        setTextShapeSize: function(size) {
            this.textShape.setSize(size);
            return this;
        },
        getTextShapeHeight: function() {
            return this.textShape.getRenderBox().height;
        },
        setKityMinder: function(km) {
            this.km = km;
            return this;
        },
        setMinderNode: function(node) {
            this.minderNode = node;
            //追加selection到节点
            this._addSelection();
            //更新minderNode下的textshape
            this.setTextShape(node.getTextShape());
            //更新textshape的baseOffset
            this.setBaseOffset();
            //更新接受容器的样式
            this.setContainerStyle();
            //更新textOffsetData数据
            this.updateTextOffsetData();
            //更新选取高度
            this.setSelectionHeight();
            //更新接收容器内容
            this.setContainerTxt();

            return this;
        },
        _addSelection:function(){
            if (this.selection.container) this.selection.remove();
            this.minderNode.getRenderContainer().addShape(this.selection);
        },
        getMinderNode:function(){
            return this.minderNode;
        },
        keyboardEvents: function(e) {


            var me = this;
            var orgEvt = e.originEvent;
            var keyCode = orgEvt.keyCode;

            function setTextToContainer() {

                clearTimeout(me.timer);
                if (!me.range.hasNativeRange()) {
                    return;
                }


                if(keymap.controlKeys[keyCode]){
                    return;
                }
                //当第一次输入内容时进行保存
                if(me.lastMinderNode !== me.minderNode && !keymap.notContentChange[keyCode]){
                    me.km.fire('saveScene',{
                        inputStatus:true
                    });
                    me.lastMinderNode = me.minderNode;
                }
                var text = me.container.textContent.replace(/[\u200b\t\r\n]/g, '');

                //#46 修复在ff下定位到文字后方空格光标不移动问题
                if (browser.gecko && /\s$/.test(text)) {
                    text += '\u200b';
                }


                //如果接受框已经空了，并且已经添加了占位的a了就什么都不做了
                if(text.length === 0 && me.textShape.getOpacity() === 0){
                    return;
                }

                if (text.length === 0) {
                    me.minderNode.setTmpData('_lastTextContent',me.textShape.getContent());
                    me.minderNode.setText('a');
                }else {
                    me.minderNode.setText(text);
                    if (me.textShape.getOpacity() === 0) {
                        me.textShape.setOpacity(1);
                    }
                }


                me.setContainerStyle();
                me.minderNode.getRenderContainer().bringTop();
                me.minderNode.render();
                //移动光标不做layout
                if(!keymap.notContentChange[keyCode]){
                    clearTimeout(me.inputTextTimer);

                    me.inputTextTimer = setTimeout(function(){
                        me.km.layout(300);
                    },250);
                }


                me.textShape = me.minderNode.getRenderer('TextRenderer').getRenderShape();
                if (text.length === 0) {
                    me.textShape.setOpacity(0);
                }
                me.setBaseOffset();
                me.updateTextOffsetData();
                me.updateRange();
                me.updateSelectionByRange();

                me.updateSelectionShow();
                me.timer = setTimeout(function() {
                    if(me.selection.isShow())
                        me.selection.setShow();
                }, 200);

                me.km.setStatus('textedit');
            }

            function restoreTextContent(){
                if(me.minderNode){
                    var textShape = me.minderNode.getTextShape();
                    if(textShape && textShape.getOpacity() === 0){
                        me.minderNode.setText(me.minderNode.getTmpData('_lastTextContent'));
                        me.minderNode.render();
                        me.minderNode.getTextShape().setOpacity(1);
                        me.km.layout(300);
                    }

                }
            }
            switch (e.type) {

                case 'input':
                    if (browser.ipad) {
                        setTimeout(function() {
                            setTextToContainer();
                        });
                    }
                    break;
                case 'beforekeydown':
                    this.isTypeText = keyCode == 229 || keyCode === 0;

                    switch (keyCode) {
                        case keymap.Enter:
                        case keymap.Tab:
                            if(this.selection.isShow()){
                                this.clear();
                                this.km.setStatus('inputready');
                                clearTimeout(me.inputTextTimer);
                                e.preventDefault();
                            }else{
                                this.km.setStatus('normal');
                                this.km.fire('contentchange');
                            }
                            restoreTextContent();
                            return;
                        case keymap.left:
                        case keymap.right:
                        case keymap.up:
                        case keymap.down:
                        case keymap.Backspace:
                        case keymap.Del:
                        case keymap['/']:
                            if(this.selection.isHide()){
                                restoreTextContent();
                                this.km.setStatus('normal');
                                return;
                            }
                            break;
                        case keymap.Control:
                        case keymap.Alt:
                        case keymap.Cmd:
                        case keymap.F2:
                            if(this.selection.isHide() && this.km.getStatus() != 'textedit'){
                                this.km.setStatus('normal');
                                return;
                            }

                    }

                    if (e.originEvent.ctrlKey || e.originEvent.metaKey) {

                        //选中节点时的复制粘贴，要变成normal
                        if(this.selection.isHide() && {
                            86:1,
                            88:1,
                            67:1
                        }[keyCode]){
                            restoreTextContent();
                            this.km.setStatus('normal');
                            return;
                        }

                        //粘贴
                        if (keyCode == keymap.v) {

                            setTimeout(function () {
                                me.range.updateNativeRange().insertNode($('<span>$$_kityminder_bookmark_$$</span>')[0]);
                                me.container.innerHTML = utils.unhtml(me.container.textContent.replace(/[\u200b\t\r\n]/g, ''));
                                var index = me.container.textContent.indexOf('$$_kityminder_bookmark_$$');
                                me.container.textContent = me.container.textContent.replace('$$_kityminder_bookmark_$$', '');
                                me.range.setStart(me.container.firstChild, index).collapse(true).select();
                                setTextToContainer(keyCode);
                            }, 100);
                            return;
                        }
                        //剪切
                        if (keyCode == keymap.x) {
                            setTimeout(function () {
                                setTextToContainer(keyCode);
                            }, 100);
                            return;
                        }


                    }
                    //针对不能连续删除做处理
                    if(keymap.Del  == keyCode || keymap.Backspace == keyCode)
                        setTextToContainer(keyCode);
                    break;

                case 'beforekeyup':
                    switch (keyCode) {
                        case keymap.Enter:
                        case keymap.Tab:
                        case keymap.F2:
                            if(browser.ipad){
                                if(this.selection.isShow()){
                                    this.clear();
                                    this.km.setStatus('inputready');
                                    clearTimeout(me.inputTextTimer);
                                    e.preventDefault();
                                }else{
                                    this.km.setStatus('normal');
                                    this.km.fire('contentchange');
                                }
                                restoreTextContent();
                                return;
                            }
                            if (keymap.Enter == keyCode && (this.isTypeText || browser.mac && browser.gecko)) {
                                setTextToContainer(keyCode);
                            }
                            if (this.keydownNode === this.minderNode) {
                                this.rollbackStatus();
                                this.clear();
                            }
                            e.preventDefault();
                            return;
                        case keymap.Del:
                        case keymap.Backspace:
                        case keymap.Spacebar:
                            if(browser.ipad){
                                if(this.selection.isHide()){
                                    this.km.setStatus('normal');
                                    return;
                                }

                            }
                            setTextToContainer(keyCode);
                            return;
                    }
                    if (this.isTypeText) {
                        setTextToContainer(keyCode);
                        return;
                    }
                    if (browser.mac && browser.gecko){
                        setTextToContainer(keyCode);
                        return;
                    }
                    setTextToContainer(keyCode);

                    return true;

                case 'keyup':
                    var node = this.km.getSelectedNode();
                    if(this.km.getStatus() == 'normal' && node && this.selection.isHide()){
                        if (node && this.km.isSingleSelect() && node.isSelected()) {

                            var color = node.getStyle('text-selection-color');

                            //准备输入状态
                            var textShape = node.getTextShape();

                            this.selection.setHide()
                                .setStartOffset(0)
                                .setEndOffset(textShape.getContent().length)
                                .setColor(color);


                            this
                                .setMinderNode(node)
                                .updateContainerRangeBySel();

                            if(browser.ie ){
                                var timer = setInterval(function(){
                                    var nativeRange = this.range.nativeSel.getRangeAt(0);
                                    if(!nativeRange || nativeRange.collapsed){
                                        this.range.select();
                                    }else {
                                        clearInterval(timer);
                                    }
                                });
                            }


                            this.minderNode.setTmpData('_lastTextContent',this.textShape.getContent());

                            this.km.setStatus('inputready');

                        }
                    }

            }

        },

        updateIndex: function() {
            this.index = this.range.getStart().startOffset;
            return this;
        },
        updateTextOffsetData: function() {
            this.textShape.textData = this.getTextOffsetData();
            return this;
        },
        setSelection: function(selection) {
            this.selection = selection;
            return this;
        },
        updateSelection: function() {
            this.selection.setShowHold();
            this.selection.bringTop();
            //更新模拟选区的范围
            this.selection.setStartOffset(this.index).collapse(true);
            if (this.index == this.textData.length) {
                if (this.index === 0) {
                    this.selection.setPosition(this.getBaseOffset());
                } else {
                    this.selection.setPosition({
                        x: this.textData[this.index - 1].x + this.textData[this.index - 1].width,
                        y: this.textData[this.index - 1].y
                    });
                }


            } else {
                this.selection.setPosition(this.textData[this.index]);
            }
            return this;
        },
        getBaseOffset: function(refer) {
            return this.textShape.getRenderBox(refer || this.km.getRenderContainer());
        },
        setBaseOffset: function() {
            this.offset = this.textShape.getRenderBox(this.km.getRenderContainer());
            return this;
        },
        setContainerStyle: function() {
            var textShapeBox = this.getBaseOffset('screen');
            this.container.style.cssText = ';left:' + (browser.ipad ? '-' : '') +
                textShapeBox.x + 'px;top:' + (textShapeBox.y + (/\?debug#?/.test(location.href)?30:0)) +
                'px;width:' + textShapeBox.width + 'px;height:' + textShapeBox.height + 'px;';

            return this;
        },
        getTextOffsetData: function() {
            var text = this.textShape.getContent();
            var box;
            this.textData = [];

            for (var i = 0, l = text.length; i < l; i++) {
                try {
                    box = this.textShape.getExtentOfChar(i);
                } catch (e) {
                    console.log(e);
                }

                this.textData.push({
                    x: box.x ,
                    y: box.y,
                    width: box.width,
                    height: box.height
                });
            }
            return this;
        },
        setCurrentIndex: function(offset) {
            var me = this;
            this.getTextOffsetData();
            var hadChanged = false;
            //要剪掉基数
            this._getRelativeValue(offset);
            utils.each(this.textData, function(i, v) {
                //点击开始之前
                if (i === 0 && offset.x <= v.x) {
                    me.index = 0;
                    return false;
                }
                if (offset.x >= v.x && offset.x <= v.x + v.width) {
                    if (offset.x - v.x > v.width / 2) {
                        me.index = i + 1;

                    } else {
                        me.index = i;

                    }
                    hadChanged = true;
                    return false;
                }
                if (i == me.textData.length - 1 && offset.x >= v.x) {
                    me.index = me.textData.length;
                    return false;
                }
            });

            return this;

        },
        setSelectionHeight: function() {
            this.selection.setHeight(this.getTextShapeHeight());
            return this;
        },
        _getRelativeValue:function(offset){
            offset.x = offset.x - this.offset.x;
            offset.y = offset.y - this.offset.y;
        },
        updateSelectionByMousePosition: function(offset, dir) {
            //要剪掉基数
            this._getRelativeValue(offset);
            var me = this;
            utils.each(this.textData, function(i, v) {
                //点击开始之前
                if (i === 0 && offset.x <= v.x) {
                    me.selection.setStartOffset(0);
                    return false;
                }

                if (i == me.textData.length - 1 && offset.x >= v.x) {
                    me.selection.setEndOffset(me.textData.length);
                    return false;
                }
                if (offset.x >= v.x && offset.x <= v.x + v.width) {

                    if (me.index == i) {
                        if (i === 0) {
                            me.selection.setStartOffset(i);
                        }
                        if (offset.x <= v.x + v.width / 2) {
                            me.selection.collapse(true);
                        } else {
                            me.selection.setEndOffset(i + ((me.selection.endOffset > i ||
                                dir == 1) && i != me.textData.length - 1 ? 1 : 0));
                        }

                    } else if (i > me.index) {
                        me.selection.setStartOffset(me.index);
                        me.selection.setEndOffset(i + 1);
                    } else {
                        if (dir == 1) {
                            me.selection.setStartOffset(i + (offset.x >= v.x + v.width / 2 &&
                                i != me.textData.length - 1 ? 1 : 0));
                        } else {
                            me.selection.setStartOffset(i);
                        }

                        me.selection.setEndOffset(me.index);
                    }

                    return false;
                }
            });
            return this;
        },
        updateSelectionShow: function() {
            var startOffset = this.textData[this.selection.startOffset],
                endOffset = this.textData[this.selection.endOffset],
                width = 0;
            if (this.selection.collapsed) {
                if(startOffset === undefined){

                    var tmpOffset = this.textData[this.textData.length - 1];
                    tmpOffset = utils.clone(tmpOffset);
                    tmpOffset.x = tmpOffset.x + tmpOffset.width;
                    startOffset = tmpOffset;
                }
                this.selection.updateShow(startOffset, 2);
                return this;
            }
            if (!endOffset) {
                try {
                    var lastOffset = this.textData[this.textData.length - 1];
                    width = lastOffset.x - startOffset.x + lastOffset.width;
                } catch (e) {
                    console.log(e);
                }

            } else {
                width = endOffset.x - startOffset.x;
            }

            this.selection.updateShow(startOffset, width);
            return this;
        },
        updateRange: function() {
            this.range.updateNativeRange();
            return this;
        },
        updateContainerRangeBySel:function(){
            var me = this;
            var node = this.container.firstChild;
            this.range.setStart(node, this.selection.startOffset);
            this.range.setEnd(node, this.selection.endOffset);
            if(browser.gecko){
                this.container.focus();
                setTimeout(function(){
                    me.range.select();
                });
            }else{
                this.range.select();
            }
            return this;
        },
        updateSelectionByRange:function(){
            this.selection.setStartOffset(this.range.getStartOffset());
            this.selection.setEndOffset(this.range.getEndOffset());
            return this;
        },
        setIndex: function(index) {
            this.index = index;
            return this;
        },
        setContainerTxt: function(txt) {
            this.container.textContent = txt || this.textShape.getContent();
            return this;
        },
        setReady:function(){
            this._ready = true;
        },
        clearReady:function(){
            this._ready = false;
        },
        isReady:function(){
            return this._ready;
        },
        focus:function(){
            this.container.focus();
        }
    });
/* src/module/editor.receiver.js end */




/* src/module/editor.selection.js */
    //模拟光标
    Minder.Selection = kity.createClass( 'Selection', {
        base: kity.Rect,
        constructor: function ( height, color, width ) {
            this.callBase();
            this.height = height || 20;
            this.setAttr('id','_kity_selection');
            this.width = 2;
            this.fill('rgb(27,171,255)');
            this.setHide();
            this.timer = null;
            this.collapsed = true;
            this.startOffset = this.endOffset = 0;
            this.setOpacity(0.5);
            this.setStyle('cursor','text');
            this._show = false;

        },
        setColor:function(color){
            this.fill(color);
        },
        collapse : function(toStart){
            this.setOpacity(1);
            this.width = 2;
            this.collapsed = true;
            if(toStart){
                this.endOffset = this.startOffset;

            }else{
                this.startOffset = this.endOffset;
            }
            return this;
        },
        setStartOffset:function(offset){
            this.startOffset = offset;
            if(this.startOffset >= this.endOffset){
                this.collapse(true);
                return this;
            }
            this.collapsed = false;
            this.setOpacity(0.5);
            return this;
        },
        setEndOffset:function(offset){
            this.endOffset = offset;
            if(this.endOffset <= this.startOffset){
               this.startOffset = offset;
               this.collapse(true);
                return this;
            }
            this.collapsed = false;
            this.setOpacity(0.5);
            return this;
        },
        updateShow : function(offset,width){
            if(width){
                this.setShowHold();
            }
            this.setPosition(offset).setWidth(width);
            this.bringTop();
            return this;
        },
        setPosition: function ( offset ) {
            try {
                // 这两个是神奇的 0.5 —— SVG 要边缘锐利，你需要一些对齐
                this.x = Math.round(offset.x) - 0.5;
                this.y = Math.round(offset.y) - 1.5;

            } catch ( e ) {
               console.log(e);
            }
            this.update();
            return this;
        },
        setHeight: function ( height ) {
            this.height = Math.round(height) + 2;
            return this;
        },
        setHide: function () {
            clearInterval( this.timer );
            this.setStyle( 'display', 'none' );
            this._show = false;
            return this;
        },
        setShowHold: function () {
            clearInterval( this.timer );
            this.setStyle( 'display', '' );
            this._show = true;
            return this;
        },
        setShow: function () {
            clearInterval( this.timer );
            var me = this,
                state = '';

            me.setStyle( 'display', '' );
            me._show = true;
            if(this.collapsed){
                me.setOpacity(1);
                this.timer = setInterval( function () {
                    me.setStyle( 'display', state );
                    state = state ? '' : 'none';
                }, 400 );
            }
            return this;
        },
        isShow:function(){
            return this._show;
        },
        isHide:function(){
            return !this._show;
        }
    } );
/* src/module/editor.selection.js end */




/* src/module/basestyle.js */
    KityMinder.registerModule('basestylemodule', function() {
        var km = this;

        function getNodeDataOrStyle(node, name) {
            return node.getData(name) || node.getStyle(name);
        }

        KityMinder.TextRenderer.registerStyleHook(function(node, text) {
            text.setFont({
                weight: getNodeDataOrStyle(node, 'font-weight'),
                style: getNodeDataOrStyle(node, 'font-style')
            });
        });
        return {
            'commands': {
                'bold': kity.createClass('boldCommand', {
                    base: Command,

                    execute: function(km) {

                        var nodes = km.getSelectedNodes();
                        if (this.queryState('bold') == 1) {
                            utils.each(nodes, function(i, n) {
                                n.setData('font-weight').render();
                            });
                        } else {
                            utils.each(nodes, function(i, n) {
                                n.setData('font-weight', 'bold').render();
                            });
                        }
                        km.layout();
                    },
                    queryState: function() {
                        var nodes = km.getSelectedNodes(),
                            result = 0;
                        if (nodes.length === 0) {
                            return -1;
                        }
                        utils.each(nodes, function(i, n) {
                            if (n && n.getData('font-weight')) {
                                result = 1;
                                return false;
                            }
                        });
                        return result;
                    }
                }),
                'italic': kity.createClass('italicCommand', {
                    base: Command,

                    execute: function(km) {

                        var nodes = km.getSelectedNodes();
                        if (this.queryState('italic') == 1) {
                            utils.each(nodes, function(i, n) {
                                n.setData('font-style').render();
                            });
                        } else {
                            utils.each(nodes, function(i, n) {
                                n.setData('font-style', 'italic').render();
                            });
                        }

                        km.layout();
                    },
                    queryState: function() {
                        var nodes = km.getSelectedNodes(),
                            result = 0;
                        if (nodes.length === 0) {
                            return -1;
                        }
                        utils.each(nodes, function(i, n) {
                            if (n && n.getData('font-style')) {
                                result = 1;
                                return false;
                            }
                        });
                        return result;
                    }
                })
            },
            addShortcutKeys: {
                'bold': 'ctrl+b', //bold
                'italic': 'ctrl+i' //italic
            }
        };
    });
/* src/module/basestyle.js end */




/* src/module/font.js */
    KityMinder.registerModule("fontmodule", function() {
        function getNodeDataOrStyle(node, name) {
            return node.getData(name) || node.getStyle(name);
        }

        KityMinder.TextRenderer.registerStyleHook(function(node, text) {
            var dataColor = node.getData('color');
            var selectedColor = node.getStyle('selected-color');
            var styleColor = node.getStyle('color');

            text.fill(dataColor || (node.isSelected() && selectedColor ? selectedColor : styleColor));

            text.setFont({
                family: getNodeDataOrStyle(node, 'font-family'),
                size: getNodeDataOrStyle(node, 'font-size')
            });
        });

        return {
            defaultOptions: {
                'fontfamily': [{
                    name: '宋体',
                    val: '宋体,SimSun'
                }, {
                    name: '微软雅黑',
                    val: '微软雅黑,Microsoft YaHei'
                }, {
                    name: '楷体',
                    val: '楷体,楷体_GB2312,SimKai'
                }, {
                    name: '黑体',
                    val: '黑体, SimHei'
                }, {
                    name: '隶书',
                    val: '隶书, SimLi'
                }, {
                    name: 'Andale Mono',
                    val: 'andale mono'
                }, {
                    name: 'Arial',
                    val: 'arial,helvetica,sans-serif'
                }, {
                    name: 'arialBlack',
                    val: 'arial black,avant garde'
                }, {
                    name: 'Comic Sans Ms',
                    val: 'comic sans ms'
                }, {
                    name: 'Impact',
                    val: 'impact,chicago'
                }, {
                    name: 'Times New Roman',
                    val: 'times new roman'
                }, {
                    name: 'Sans-Serif',
                    val: 'sans-serif'
                }],
                'fontsize': [10, 12, 16, 18, 24, 32, 48]
            },
            "commands": {
                "forecolor": kity.createClass("fontcolorCommand", {
                    base: Command,

                    execute: function(km, color) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('color', color);
                            n.render();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length == 0 ? -1 : 0
                    },
                    queryValue: function(km) {
                        if (km.getSelectedNodes().length == 1) {
                            return km.getSelectedNodes()[0].getData('color');
                        }
                        return 'mixed';
                    }

                }),
                "background": kity.createClass("backgroudCommand", {
                    base: Command,

                    execute: function(km, color) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('background', color);
                            n.render();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length == 0 ? -1 : 0
                    },
                    queryValue: function(km) {
                        if (km.getSelectedNodes().length == 1) {
                            return km.getSelectedNodes()[0].getData('background');
                        }
                        return 'mixed';
                    }

                }),
                "fontfamily": kity.createClass("fontfamilyCommand", {
                    base: Command,

                    execute: function(km, family) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('font-family', family);
                            n.render();
                            km.layout();
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length === 0 ? -1 : 0
                    },
                    queryValue: function(km) {
                        var node = km.getSelectedNode();
                        if (node) return node.getData('font-family');
                        return null;
                    }
                }),
                "fontsize": kity.createClass("fontsizeCommand", {
                    base: Command,

                    execute: function(km, size) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('font-size', size);
                            n.render();
                            km.layout(300);
                        });
                    },
                    queryState: function(km) {
                        return km.getSelectedNodes().length == 0 ? -1 : 0
                    },
                    queryValue: function(km) {
                        var node = km.getSelectedNode();
                        if (node) return node.getData('font-size');
                        return null;
                    }
                })
            }
        };
    });
/* src/module/font.js end */




/* src/module/zoom.js */
    KityMinder.registerModule('Zoom', function() {
        var me = this;

        var timeline;

        me.setDefaultOptions('zoom', [10, 20, 30, 50, 80, 100, 120, 150, 200]);

        function setTextRendering() {
            var value = me._zoomValue >= 100 ? 'optimize-speed' : 'geometricPrecision';
            me.getRenderContainer().setAttr('text-rendering', value);
        }

        function fixPaperCTM(paper) {
            var node = paper.shapeNode;
            var ctm = node.getCTM();
            var matrix = new kity.Matrix(ctm.a, ctm.b, ctm.c, ctm.d, (ctm.e | 0) + 0.5, (ctm.f | 0) + 0.5);
            node.setAttribute('transform', 'matrix(' + matrix.toString() + ')');
        }

        kity.extendClass(Minder, {
            zoom: function(value) {
                var paper = this.getPaper();
                var viewport = paper.getViewPort();
                viewport.zoom = value / 100;
                viewport.center = {
                    x: viewport.center.x,
                    y: viewport.center.y
                };
                paper.setViewPort(viewport);
                if (value == 100) fixPaperCTM(paper);
            },
            getZoomValue: function() {
                return this._zoomValue;
            }
        });

        function zoomMinder(minder, value) {
            var paper = minder.getPaper();
            var viewport = paper.getViewPort();

            if (!value) return;

            setTextRendering();

            if (minder.getRoot().getComplex() > 200) {
                minder._zoomValue = value;
                return minder.zoom(value);
            }
            var animator = new kity.Animator({
                beginValue: minder._zoomValue,
                finishValue: value,
                setter: function(target, value) {
                    target.zoom(value);
                }
            });
            minder._zoomValue = value;
            if (timeline) {
                timeline.pause();
            }
            timeline = animator.start(minder, 300, 'easeInOutSine', function() {});
        }

        var ZoomCommand = kity.createClass('Zoom', {
            base: Command,
            execute: zoomMinder,
            queryValue: function(minder) {
                return minder._zoomValue;
            }
        });

        var ZoomInCommand = kity.createClass('ZoomInCommand', {
            base: Command,
            execute: function(minder) {
                zoomMinder(minder, this.nextValue(minder));
            },
            queryState: function(minder) {
                return (~this.nextValue(minder));
            },
            nextValue: function(minder) {
                var stack = minder.getOptions('zoom'),
                    i;
                for (i = 0; i < stack.length; i++) {
                    if (stack[i] > minder._zoomValue) return stack[i];
                }
                return 0;
            },
            enableReadOnly: false
        });

        var ZoomOutCommand = kity.createClass('ZoomOutCommand', {
            base: Command,
            execute: function(minder) {
                zoomMinder(minder, this.nextValue(minder));
            },
            queryState: function(minder) {
                return (~this.nextValue(minder));
            },
            nextValue: function(minder) {
                var stack = minder.getOptions('zoom'),
                    i;
                for (i = stack.length - 1; i >= 0; i--) {
                    if (stack[i] < minder._zoomValue) return stack[i];
                }
                return 0;
            },
            enableReadOnly: false
        });

        return {
            init: function() {
                this._zoomValue = 100;
                setTextRendering();
            },
            commands: {
                'zoom-in': ZoomInCommand,
                'zoom-out': ZoomOutCommand,
                'zoom': ZoomCommand
            },
            events: {
                'normal.keydown': function(e) {
                    var me = this;
                    var originEvent = e.originEvent;
                    var keyCode = originEvent.keyCode || originEvent.which;
                    if (keymap['='] == keyCode) {
                        me.execCommand('zoom-in');
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    if (keymap['-'] == keyCode) {
                        me.execCommand('zoom-out');
                        e.stopPropagation();
                        e.preventDefault();

                    }
                },
                'normal.mousewheel readonly.mousewheel': function(e) {
                    if (!e.originEvent.ctrlKey) return;
                    var delta = e.originEvent.wheelDelta;
                    var me = this;

                    if (!kity.Browser.mac) {
                        delta = -delta;
                    }

                    // 稀释
                    if (Math.abs(delta) > 100) {
                        clearTimeout(this._wheelZoomTimeout);
                    } else {
                        return;
                    }

                    this._wheelZoomTimeout = setTimeout(function() {
                        var value;
                        var lastValue = me.getPaper()._zoom || 1;
                        if (delta < 0) {
                            me.execCommand('zoom-in');
                        } else if (delta > 0) {
                            me.execCommand('zoom-out');
                        }
                    }, 100);

                    e.originEvent.preventDefault();
                }
            }
        };
    });
/* src/module/zoom.js end */




/* src/module/hyperlink.js */
    KityMinder.registerModule("hyperlink", function() {
        var linkShapePath = "M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z";
        return {
            "commands": {
                "hyperlink": kity.createClass("hyperlink", {
                    base: Command,

                    execute: function(km, url) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('hyperlink', url);
                            n.render();
                        });
                        km.layout();
                    },
                    queryState: function(km) {
                        var nodes = km.getSelectedNodes(),
                            result = 0;
                        if (nodes.length === 0) {
                            return -1;
                        }
                        utils.each(nodes, function(i, n) {
                            if (n && n.getData('hyperlink')) {
                                result = 0;
                                return false;
                            }
                        });
                        return result;
                    },
                    queryValue: function(km) {
                        var node = km.getSelectedNode();
                        return node.getData('hyperlink');
                    }
                }),
                "unhyperlink": kity.createClass("hyperlink", {
                    base: Command,

                    execute: function(km) {
                        var nodes = km.getSelectedNodes();
                        utils.each(nodes, function(i, n) {
                            n.setData('hyperlink');
                            n.render();
                        });
                        km.layout();
                    },
                    queryState: function(km) {
                        var nodes = km.getSelectedNodes();

                        if (nodes.length === 0) {
                            return -1;
                        }
                        var link = false;
                        utils.each(nodes, function(i, n) {
                            if (n.getData('hyperlink')) {
                                link = true;
                                return false;
                            }
                        });
                        if (link) {
                            return 0;
                        }
                        return -1;
                    }
                })
            },
            'renderers': {
                right: kity.createClass('hyperlinkrender', {
                    base: KityMinder.Renderer,

                    create: function() {

                        var link = new kity.HyperLink();
                        var linkshape = new kity.Path();
                        var outline = new kity.Rect(24, 22, -2, -6, 4).fill('rgba(255, 255, 255, 0)');


                        linkshape.setPathData(linkShapePath).fill('#666');
                        link.addShape(outline);
                        link.addShape(linkshape);
                        link.setTarget('_blank');
                        link.setStyle('cursor', 'pointer');


                        link.on('mouseover', function() {
                            outline.fill('rgba(255, 255, 200, .8)');
                        }).on('mouseout', function() {
                            outline.fill('rgba(255, 255, 255, 0)');
                        });
                        return link;
                    },

                    shouldRender: function(node) {

                        return node.getData('hyperlink');
                    },

                    update: function(link, node, box) {

                        var href = node.getData('hyperlink');
                        link.setHref(href);
                        link.setAttr('xlink:title', href);
                        var spaceRight = node.getStyle('space-right');

                        link.setTranslate(box.right + spaceRight + 2, -5);
                        return {
                            x: box.right + spaceRight,
                            y: -11,
                            width: 24,
                            height: 22
                        };
                    }
                })
            }

        };
    });
/* src/module/hyperlink.js end */




/* src/module/arrange.js */
    kity.extendClass(MinderNode, {
        arrange: function(index) {
            var parent = this.parent;
            if (!parent) return;
            var sibling = parent.children;

            if (index < 0 || index >= sibling.length) return;
            sibling.splice(this.getIndex(), 1);
            sibling.splice(index, 0, this);
            return this;
        }
    });

    function asc(nodeA, nodeB) {
        return nodeA.getIndex() - nodeB.getIndex();
    }
    function desc(nodeA, nodeB) {
        return -asc(nodeA, nodeB);
    }

    function canArrange(km) {
        var selected = km.getSelectedNode();
        return selected && selected.parent && selected.parent.children.length > 1;
    }

    var ArrangeUpCommand = kity.createClass('ArrangeUpCommand', {
        base: Command,

        execute: function(km) {
            var nodes = km.getSelectedNodes();
            nodes.sort(asc);
            var lastIndexes = nodes.map(function(node) {
                return node.getIndex();
            });
            nodes.forEach(function(node, index) {
                node.arrange(lastIndexes[index] - 1);
            });
            km.layout(300);
        },

        queryState: function(km) {
            var selected = km.getSelectedNode();
            return selected ? 0 : -1;
        }
    });

    var ArrangeDownCommand = kity.createClass('ArrangeUpCommand', {
        base: Command,

        execute: function(km) {
            var nodes = km.getSelectedNodes();
            nodes.sort(desc);
            var lastIndexes = nodes.map(function(node) {
                return node.getIndex();
            });
            nodes.forEach(function(node, index) {
                node.arrange(lastIndexes[index] + 1);
            });
            km.layout(300);
        },

        queryState: function(km) {
            var selected = km.getSelectedNode();
            return selected ? 0 : -1;
        }
    });

    var ArrangeCommand = kity.createClass('ArrangeCommand', {
        base: Command,

        execute: function(km, nodes, index) {
            nodes = nodes && nodes.slice() || km.getSelectedNodes().slice();

            if (!nodes.length) return;

            var ancestor = MinderNode.getCommonAncestor(nodes);

            if (ancestor != nodes[0].parent) return;

            var indexed = nodes.map(function(node) {
                return {
                    index: node.getIndex(),
                    node: node
                };
            });

            var asc = Math.min.apply(Math, indexed.map(function(one) { return one.index; })) >= index;

            indexed.sort(function(a, b) {
                return asc ? (b.index - a.index) : (a.index - b.index);
            });

            indexed.forEach(function(one) {
                one.node.arrange(index);
            });

            km.layout(300);
        },

        queryState: function(km) {
            var selected = km.getSelectedNode();
            return selected ? 0 : -1;
        }
    });

    KityMinder.registerModule('ArrangeModule', {
        commands: {
            'arrangeup': ArrangeUpCommand,
            'arrangedown': ArrangeDownCommand,
            'arrange': ArrangeCommand
        },
        addShortcutKeys: {
            'arrangeup': 'alt+Up',
            'arrangedown': 'alt+Down'
        }
    });
/* src/module/arrange.js end */




/* src/module/paste.js */
    KityMinder.registerModule( "pasteModule", function () {
        var km = this,

            _cacheNodes = [],

            _selectedNodes = [],

            _copystatus= false,

            _curstatus = false;

        function appendChildNode(parent, child) {
            _selectedNodes.push(child);
            km.appendNode(child,parent);
            child.render();
            child.setLayoutOffset(null);
            var children = utils.cloneArr(child.children);
            for (var i = 0, ci; ci = children[i++]; ) {
                appendChildNode(child, ci);
            }
        }

        function getNodes(arr,isCut){
            _cacheNodes = [];
            for(var i= 0,ni;ni=arr[i++];){
                _cacheNodes.push(ni.clone());
                if(isCut && !ni.isRoot()){
                    km.removeNode(ni);
                }
            }
        }
        return {
            'events': {
                'normal.keydown': function (e) {
                    var keys = KityMinder.keymap;

                    var keyEvent = e.originEvent;

                    if (keyEvent.ctrlKey || keyEvent.metaKey) {

                        switch (keyEvent.keyCode) {
                            case keys.c:
                                getNodes(km.getSelectedAncestors(true));
                                _copystatus = true;
                                break;
                            case keys.x:
                                getNodes(km.getSelectedAncestors(),true);
                                km.layout(300);
                                _curstatus = true;
                                break;
                            case keys.v:
                                if(_cacheNodes.length){
                                    var node = km.getSelectedNode();
                                    if(node){
                                        km.fire('saveScene');
                                        for(var i= 0,ni;ni=_cacheNodes[i++];){
                                            appendChildNode(node,ni.clone());
                                        }
                                        km.layout(300);
                                        km.select(_selectedNodes,true);
                                        _selectedNodes = [];
                                        km.fire('saveScene');
                                    }
                                }

                        }
                    }


                }
            }

        };
    } );
/* src/module/paste.js end */




/* src/module/style.js */
    KityMinder.registerModule('StyleModule', function() {
        var styleNames = ['font-size', 'font-family', 'font-weight', 'font-style', 'background', 'color'];
        var styleClipBoard = null;

        function hasStyle(node) {
            var data = node.getData();
            for(var i = 0; i < styleNames.length; i++) {
                if (styleNames[i] in data) return true;
            }
        }

        return {
            "commands": {
                "copystyle": kity.createClass("CopyStyleCommand", {
                    base: Command,

                    execute: function(minder) {
                        var node = minder.getSelectedNode();
                        var nodeData = node.getData();
                        styleClipBoard = {};
                        styleNames.forEach(function(name) {
                            if (name in nodeData) styleClipBoard[name] = nodeData[name];
                            else {
                                styleClipBoard[name] = null;
                                delete styleClipBoard[name];
                            }
                        });
                        return styleClipBoard;
                    },

                    queryState: function(minder) {
                        var nodes = minder.getSelectedNodes();
                        if (nodes.length !== 1) return -1;
                        return hasStyle(nodes[0]) ? 0 : -1;
                    }
                }),

                "pastestyle": kity.createClass("PastStyleCommand", {
                    base: Command,

                    execute: function(minder) {
                        minder.getSelectedNodes().forEach(function(node) {
                            for (var name in styleClipBoard) {
                                if (styleClipBoard.hasOwnProperty(name))
                                    node.setData(name, styleClipBoard[name]);
                            }
                        });
                        minder.renderNodeBatch(minder.getSelectedNodes());
                        minder.layout(300);
                        return styleClipBoard;
                    },

                    queryState: function(minder) {
                        return (styleClipBoard && minder.getSelectedNodes().length) ? 0 : -1;
                    }
                }),

                "clearstyle": kity.createClass("ClearStyleCommand", {
                    base: Command,
                    execute: function(minder) {
                        minder.getSelectedNodes().forEach(function(node) {
                            styleNames.forEach(function(name) {
                                node.setData(name);
                            });
                        });
                        minder.renderNodeBatch(minder.getSelectedNodes());
                        minder.layout(300);
                        return styleClipBoard;
                    },

                    queryState: function(minder) {
                        var nodes = minder.getSelectedNodes();
                        if (!nodes.length) return -1;
                        for(var i = 0; i < nodes.length; i++) {
                            if (hasStyle(nodes[i])) return 0;
                        }
                        return -1;
                    }
                })
            }
        };
    });
/* src/module/style.js end */




/* src/protocal/xmind.js */
    /*
        http://www.xmind.net/developer/
        Parsing XMind file
        XMind files are generated in XMind Workbook (.xmind) format, an open format
        that is based on the principles of OpenDocument. It consists of a ZIP
        compressed archive containing separate XML documents for content and styles,
        a .jpg image file for thumbnails, and directories for related attachments.
     */

    KityMinder.registerProtocal('xmind', function() {

        // 标签 map
        var markerMap = {
            'priority-1': ['priority', 1],
            'priority-2': ['priority', 2],
            'priority-3': ['priority', 3],
            'priority-4': ['priority', 4],
            'priority-5': ['priority', 5],
            'priority-6': ['priority', 6],
            'priority-7': ['priority', 7],
            'priority-8': ['priority', 8],

            'task-start': ['progress', 1],
            'task-oct': ['progress', 2],
            'task-quarter': ['progress', 3],
            'task-3oct': ['progress', 4],
            'task-half': ['progress', 5],
            'task-5oct': ['progress', 6],
            'task-3quar': ['progress', 7],
            'task-7oct': ['progress', 8],
            'task-done': ['progress', 9]
        };

        return {
            fileDescription: 'xmind格式文件',
            fileExtension: '.xmind',

            decode: function(local) {
                var successCall, errorCall;


                function processTopic(topic, obj) {

                    //处理文本
                    obj.data = {
                        text: topic.title
                    };

                    // 处理标签
                    if (topic.marker_refs && topic.marker_refs.marker_ref) {
                        var markers = topic.marker_refs.marker_ref;
                        if (markers.length && markers.length > 0) {
                            for (var i in markers) {
                                var type = markerMap[markers[i]['marker_id']];
                                type && (obj.data[type[0]] = type[1]);
                            }
                        } else {
                            var type = markerMap[markers['marker_id']];
                            type && (obj.data[type[0]] = type[1]);
                        }
                    }

                    // 处理超链接
                    if (topic['xlink:href']) {
                        obj.data.hyperlink = topic['xlink:href'];
                    }
                    //处理子节点
                    var topics = topic.children && topic.children.topics;
                    var subTopics = topics && (topics.topic || topics[0] && topics[0].topic);
                    if (subTopics) {
                        var tmp = subTopics;
                        if (tmp.length && tmp.length > 0) { //多个子节点
                            obj.children = [];

                            for (var i in tmp) {
                                obj.children.push({});
                                processTopic(tmp[i], obj.children[i]);
                            }

                        } else { //一个子节点
                            obj.children = [{}];
                            processTopic(tmp, obj.children[0]);
                        }
                    }
                }

                function xml2km(xml) {
                    var json = $.xml2json(xml);
                    var result = {};
                    var sheet = json.sheet;
                    var topic = utils.isArray(sheet) ? sheet[0].topic : sheet.topic;
                    processTopic(topic, result);
                    return result;
                }

                function onerror() {
                    errorCall('ziperror');
                }

                function getEntries(file, onend) {
                    zip.createReader(new zip.BlobReader(file), function(zipReader) {
                        zipReader.getEntries(onend);
                    }, onerror);
                }
                return {
                    then: function(callback) {

                        getEntries(local, function(entries) {
                            var hasMainDoc = false;
                            entries.forEach(function(entry) {
                                if (entry.filename == 'content.xml') {
                                    hasMainDoc = true;
                                    entry.getData(new zip.TextWriter(), function(text) {
                                        try {
                                            var km = xml2km($.parseXML(text));
                                            callback && callback(km);
                                        } catch (e) {
                                            errorCall && errorCall('parseerror');
                                        }
                                    });
                                }
                            });

                            !hasMainDoc && errorCall && errorCall('parseerror');
                        });
                        return this;
                    },
                    error: function(callback) {
                        errorCall = callback;
                    }
                };

            },
            // recognize: recognize,
            recognizePriority: -1
        };

    });
/* src/protocal/xmind.js end */




/* src/protocal/freemind.js */
    /*

        http://freemind.sourceforge.net/

        freemind文件后缀为.mm，实际格式为xml

    */

    KityMinder.registerProtocal('freemind', function() {

        // 标签 map
        var markerMap = {
            'full-1': ['priority', 1],
            'full-2': ['priority', 2],
            'full-3': ['priority', 3],
            'full-4': ['priority', 4],
            'full-5': ['priority', 5],
            'full-6': ['priority', 6],
            'full-7': ['priority', 7],
            'full-8': ['priority', 8]
        };

        function processTopic(topic, obj) {

            //处理文本
            obj.data = {
                text: topic.TEXT
            };
            var i;

            // 处理标签
            if (topic.icon) {
                var icons = topic.icon;
                var type;
                if (icons.length && icons.length > 0) {
                    for (i in icons) {
                        type = markerMap[icons[i].BUILTIN];
                        if (type) obj.data[type[0]] = type[1];
                    }
                } else {
                    type = markerMap[icons.BUILTIN];
                    if (type) obj.data[type[0]] = type[1];
                }
            }

            // 处理超链接
            if (topic.LINK) {
                obj.data.hyperlink = topic.LINK;
            }

            //处理子节点
            if (topic.node) {

                var tmp = topic.node;
                if (tmp.length && tmp.length > 0) { //多个子节点
                    obj.children = [];

                    for (i in tmp) {
                        obj.children.push({});
                        processTopic(tmp[i], obj.children[i]);
                    }

                } else { //一个子节点
                    obj.children = [{}];
                    processTopic(tmp, obj.children[0]);
                }
            }
        }

        function xml2km(xml) {
            var json = $.xml2json(xml);
            var result = {};
            processTopic(json.node, result);
            return result;
        }

        return {
            fileDescription: 'freemind格式文件',
            fileExtension: '.mm',

            decode: function(local) {
                return xml2km(local);
            },
            // recognize: null,
            recognizePriority: -1
        };

    });
/* src/protocal/freemind.js end */




/* src/protocal/mindmanager.js */
    /* global zip:true */
    /*
        http://www.mindjet.com/mindmanager/
        mindmanager的后缀为.mmap，实际文件格式是zip，解压之后核心文件是Document.xml
    */
    KityMinder.registerProtocal('mindmanager', function() {

        var successCall, errorCall;

        // 标签 map
        var markerMap = {
            'urn:mindjet:Prio1': ['PriorityIcon', 1],
            'urn:mindjet:Prio2': ['PriorityIcon', 2],
            'urn:mindjet:Prio3': ['PriorityIcon', 3],
            'urn:mindjet:Prio4': ['PriorityIcon', 4],
            'urn:mindjet:Prio5': ['PriorityIcon', 5],
            '0': ['ProgressIcon', 1],
            '25': ['ProgressIcon', 2],
            '50': ['ProgressIcon', 3],
            '75': ['ProgressIcon', 4],
            '100': ['ProgressIcon', 5]
        };

        function processTopic(topic, obj) {
            //处理文本
            obj.data = {
                text: topic.Text && topic.Text.PlainText || ''
            }; // 节点默认的文本，没有Text属性

            // 处理标签
            if (topic.Task) {

                var type;
                if (topic.Task.TaskPriority) {
                    type = markerMap[topic.Task.TaskPriority];
                    if (type) obj.data[type[0]] = type[1];
                }

                if (topic.Task.TaskPercentage) {
                    type = markerMap[topic.Task.TaskPercentage];
                    if (type) obj.data[type[0]] = type[1];
                }
            }

            // 处理超链接
            if (topic.Hyperlink) {
                obj.data.hyperlink = topic.Hyperlink.Url;
            }

            //处理子节点
            if (topic.SubTopics && topic.SubTopics.Topic) {

                var tmp = topic.SubTopics.Topic;
                if (tmp.length && tmp.length > 0) { //多个子节点
                    obj.children = [];

                    for (var i in tmp) {
                        obj.children.push({});
                        processTopic(tmp[i], obj.children[i]);
                    }

                } else { //一个子节点
                    obj.children = [{}];
                    processTopic(tmp, obj.children[0]);
                }
            }
        }

        function xml2km(xml) {
            var json = $.xml2json(xml);
            var result = {};
            processTopic(json.OneTopic.Topic, result);
            return result;
        }

        function onerror() {
            errorCall('ziperror');
        }

        function getEntries(file, onend) {
            zip.createReader(new zip.BlobReader(file), function(zipReader) {
                zipReader.getEntries(onend);
            }, onerror);
        }

        return {
            fileDescription: 'mindmanager格式文件',
            fileExtension: '.mmap',
            decode: function(local) {
                return {
                    then: function(callback) {
                        successCall = callback;
                        getEntries(local, function(entries) {
                            var hasMainDoc = false;
                            entries.forEach(function(entry) {
                                if (entry.filename == 'Document.xml') {
                                    hasMainDoc = true;
                                    entry.getData(new zip.TextWriter(), function(text) {
                                        try {
                                            var km = xml2km($.parseXML(text));
                                            if (successCall) successCall(km);
                                        } catch (e) {
                                            if (errorCall) errorCall('parseerror');
                                        }
                                    });
                                }
                            });
                            if (!hasMainDoc && errorCall) errorCall('parseerror');
                        });
                        return this;
                    },
                    error: function(callback) {
                        errorCall = callback;
                    }
                };
            },
            recognizePriority: -1
        };
    });
/* src/protocal/mindmanager.js end */




/* src/protocal/plain.js */
    KityMinder.registerProtocal('plain', function() {
        var LINE_ENDING = '\r',
            LINE_ENDING_SPLITER = /\r\n|\r|\n/,
            TAB_CHAR = '\t';

        function repeat(s, n) {
            var result = '';
            while (n--) result += s;
            return result;
        }

        function encode(json, level) {
            var local = '';
            level = level || 0;
            local += repeat(TAB_CHAR, level);
            local += json.data.text + LINE_ENDING;
            if (json.children) {
                json.children.forEach(function(child) {
                    local += encode(child, level + 1);
                });
            }
            return local;
        }

        function isEmpty(line) {
            return !/\S/.test(line);
        }

        function getLevel(line) {
            var level = 0;
            while (line.charAt(level) === TAB_CHAR) level++;
            return level;
        }

        function getNode(line) {
            return {
                data: {
                    text: line.replace(new RegExp('^' + TAB_CHAR + '*'), '')
                }
            };
        }

        function decode(local) {
            var json,
                parentMap = {},
                lines = local.split(LINE_ENDING_SPLITER),
                line, level, node;

            function addChild(parent, child) {
                var children = parent.children || (parent.children = []);
                children.push(child);
            }

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];
                if (isEmpty(line)) continue;

                level = getLevel(line);
                node = getNode(line);

                if (level === 0) {
                    if (json) {
                        throw new Error('Invalid local format');
                    }
                    json = node;
                } else {
                    if (!parentMap[level - 1]) {
                        throw new Error('Invalid local format');
                    }
                    addChild(parentMap[level - 1], node);
                }
                parentMap[level] = node;
            }
            return json;
        }
        var lastTry, lastResult;

        function recognize(local) {
            if (!Utils.isString(local)) return false;
            lastTry = local;
            try {
                lastResult = decode(local);
            } catch (e) {
                lastResult = null;
            }
            return !!lastResult;
        }

        return {
            fileDescription: '大纲文本',
            fileExtension: '.txt',
            mineType: 'text/plain',
            encode: function(json) {
                return encode(json, 0);
            },
            decode: function(local) {
                if (lastTry == local && lastResult) {
                    return lastResult;
                }
                return decode(local);
            },
            recognize: recognize,
            recognizePriority: -1
        };
    });
/* src/protocal/plain.js end */




/* src/protocal/json.js */
    KityMinder.registerProtocal('json', function() {
        function filter(key, value) {
            if (key == 'layout' || key == 'shicon') {
                return undefined;
            }
            return value;
        }
        return {
            fileDescription: 'KityMinder',
            fileExtension: '.km',
            mineType: 'application/json',
            encode: function(json) {
                return JSON.stringify(json, filter);
            },
            decode: function(local) {
                return JSON.parse(local);
            },
            recognize: function(local) {
                return Utils.isString(local) && local.charAt(0) == '{' && local.charAt(local.length - 1) == '}';
            },
            recognizePriority: 0
        };
    });
/* src/protocal/json.js end */




/* src/protocal/png.js */
    if (!kity.Browser.ie) {
        KityMinder.registerProtocal('png', function() {
            function loadImage(url, callback) {
                var image = document.createElement('img');
                image.onload = callback;
                image.src = url;
            }

            return {
                fileDescription: 'PNG 图片',
                fileExtension: '.png',
                encode: function(json, km) {
                    var originZoom = km._zoomValue;

                    var paper = km.getPaper(),
                        paperTransform = paper.shapeNode.getAttribute('transform'),
                        domContainer = paper.container,
                        svgXml,
                        $svg,

                        bgDeclare = km.getStyle('background').toString(),
                        bgUrl = /url\((.+)\)/.exec(bgDeclare),
                        bgColor = kity.Color.parse(bgDeclare),

                        renderContainer = km.getRenderContainer(),
                        renderBox = renderContainer.getRenderBox(),
                        width = renderBox.width + 1,
                        height = renderBox.height + 1,
                        padding = 20,

                        canvas = document.createElement('canvas'),
                        ctx = canvas.getContext('2d'),
                        blob, DomURL, url, img, finishCallback;

                    paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
                    renderContainer.translate(-renderBox.x, -renderBox.y);

                    svgXml = paper.container.innerHTML;

                    renderContainer.translate(renderBox.x, renderBox.y);

                    paper.shapeNode.setAttribute('transform', paperTransform);

                    $svg = $(svgXml).filter('svg');
                    $svg.attr({
                        width: renderBox.width + 1,
                        height: renderBox.height + 1,
                        style: 'font-family: Arial, "Microsoft Yahei","Heiti SC";'
                    });

                    // need a xml with width and height
                    svgXml = $('<div></div>').append($svg).html();

                    // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                    svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

                    blob = new Blob([svgXml], {
                        type: 'image/svg+xml;charset=utf-8'
                    });

                    DomURL = window.URL || window.webkitURL || window;

                    url = DomURL.createObjectURL(blob);

                    canvas.width = width + padding * 2;
                    canvas.height = height + padding * 2;

                    function fillBackground(ctx, style) {
                        ctx.save();
                        ctx.fillStyle = style;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.restore();
                    }

                    function drawImage(ctx, image, x, y) {
                        ctx.drawImage(image, x, y);
                    }

                    function generateDataUrl(canvas) {
                        var url = canvas.toDataURL('png');
                        return url;
                    }

                    function drawSVG() {
                        loadImage(url, function() {
                            var svgImage = this;
                            var downloadUrl;
                            drawImage(ctx, svgImage, padding, padding);
                            DomURL.revokeObjectURL(url);
                            downloadUrl = generateDataUrl(canvas);
                            if (finishCallback) {
                                finishCallback(downloadUrl);
                            }
                        });
                    }

                    if (bgUrl) {
                        loadImage(bgUrl[1], function() {
                            fillBackground(ctx, ctx.createPattern(this, 'repeat'));
                            drawSVG();
                        });
                    } else {
                        fillBackground(ctx, bgColor.toString());
                        drawSVG();
                    }

                    return {
                        then: function(callback) {
                            finishCallback = callback;
                        }
                    };
                },
                recognizePriority: -1
            };
        });
    }
/* src/protocal/png.js end */




/* src/protocal/svg.js */

    if (!kity.Browser.ie) {
        KityMinder.registerProtocal('svg', function() {
            return {
                fileDescription: 'SVG 矢量图',
                fileExtension: '.svg',
                mineType: 'image/svg+xml',
                encode: function(json, km) {

                    var paper = km.getPaper(),
                        paperTransform = paper.shapeNode.getAttribute('transform'),
                        svgXml,
                        $svg,

                        renderContainer = km.getRenderContainer(),
                        renderBox = renderContainer.getRenderBox(),
                        transform = renderContainer.getTransform(),
                        width = renderBox.width,
                        height = renderBox.height,
                        padding = 20;

                    paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
                    svgXml = km.getPaper().container.innerHTML;
                    paper.shapeNode.setAttribute('transform', paperTransform);

                    $svg = $(svgXml).filter('svg');
                    $svg.attr({
                        width: width + padding * 2 | 0,
                        height: height + padding * 2 | 0,
                        style: 'font-family: Arial, "Microsoft Yahei",  "Heiti SC"; background: ' + km.getStyle('background')
                    });
                    $svg[0].setAttribute('viewBox', [renderBox.x - padding | 0,
                        renderBox.y - padding | 0,
                        width + padding * 2 | 0,
                        height + padding * 2 | 0
                    ].join(' '));

                    // need a xml with width and height
                    svgXml = $('<div></div>').append($svg).html();

                    svgXml = $('<div></div>').append($svg).html();

                    // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                    svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

                    // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                    return svgXml;
                },
                recognizePriority: -1
            };
        });
    }
/* src/protocal/svg.js end */




/* lib/jquery-2.1.0.min.js */
    /*! jQuery v2.1.0 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
    !function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k="".trim,l={},m=a.document,n="2.1.0",o=function(a,b){return new o.fn.init(a,b)},p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};o.fn=o.prototype={jquery:n,constructor:o,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=o.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return o.each(this,a,b)},map:function(a){return this.pushStack(o.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},o.extend=o.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||o.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(o.isPlainObject(d)||(e=o.isArray(d)))?(e?(e=!1,f=c&&o.isArray(c)?c:[]):f=c&&o.isPlainObject(c)?c:{},g[b]=o.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},o.extend({expando:"jQuery"+(n+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===o.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return a-parseFloat(a)>=0},isPlainObject:function(a){if("object"!==o.type(a)||a.nodeType||o.isWindow(a))return!1;try{if(a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}return!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=o.trim(a),a&&(1===a.indexOf("use strict")?(b=m.createElement("script"),b.text=a,m.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":k.call(a)},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?o.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),o.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||o.guid++,f):void 0},now:Date.now,support:l}),o.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=o.type(a);return"function"===c||o.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s="sizzle"+-new Date,t=a.document,u=0,v=0,w=eb(),x=eb(),y=eb(),z=function(a,b){return a===b&&(j=!0),0},A="undefined",B=1<<31,C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=D.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",M=L.replace("w","w#"),N="\\["+K+"*("+L+")"+K+"*(?:([*^$|!~]?=)"+K+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+M+")|)|)"+K+"*\\]",O=":("+L+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+N.replace(3,8)+")*)|.*)\\)|)",P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(O),U=new RegExp("^"+M+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L.replace("w","w*")+")"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=/'|\\/g,ab=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),bb=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{G.apply(D=H.call(t.childNodes),t.childNodes),D[t.childNodes.length].nodeType}catch(cb){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function db(a,b,d,e){var f,g,h,i,j,m,p,q,u,v;if((b?b.ownerDocument||b:t)!==l&&k(b),b=b||l,d=d||[],!a||"string"!=typeof a)return d;if(1!==(i=b.nodeType)&&9!==i)return[];if(n&&!e){if(f=Z.exec(a))if(h=f[1]){if(9===i){if(g=b.getElementById(h),!g||!g.parentNode)return d;if(g.id===h)return d.push(g),d}else if(b.ownerDocument&&(g=b.ownerDocument.getElementById(h))&&r(b,g)&&g.id===h)return d.push(g),d}else{if(f[2])return G.apply(d,b.getElementsByTagName(a)),d;if((h=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(h)),d}if(c.qsa&&(!o||!o.test(a))){if(q=p=s,u=b,v=9===i&&a,1===i&&"object"!==b.nodeName.toLowerCase()){m=ob(a),(p=b.getAttribute("id"))?q=p.replace(_,"\\$&"):b.setAttribute("id",q),q="[id='"+q+"'] ",j=m.length;while(j--)m[j]=q+pb(m[j]);u=$.test(a)&&mb(b.parentNode)||b,v=m.join(",")}if(v)try{return G.apply(d,u.querySelectorAll(v)),d}catch(w){}finally{p||b.removeAttribute("id")}}}return xb(a.replace(P,"$1"),b,d,e)}function eb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function fb(a){return a[s]=!0,a}function gb(a){var b=l.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function hb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function ib(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||B)-(~a.sourceIndex||B);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function jb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function kb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function lb(a){return fb(function(b){return b=+b,fb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function mb(a){return a&&typeof a.getElementsByTagName!==A&&a}c=db.support={},f=db.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},k=db.setDocument=function(a){var b,e=a?a.ownerDocument||a:t,g=e.defaultView;return e!==l&&9===e.nodeType&&e.documentElement?(l=e,m=e.documentElement,n=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){k()},!1):g.attachEvent&&g.attachEvent("onunload",function(){k()})),c.attributes=gb(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=gb(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(e.getElementsByClassName)&&gb(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=gb(function(a){return m.appendChild(a).id=s,!e.getElementsByName||!e.getElementsByName(s).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==A&&n){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ab,bb);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ab,bb);return function(a){var c=typeof a.getAttributeNode!==A&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==A?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==A&&n?b.getElementsByClassName(a):void 0},p=[],o=[],(c.qsa=Y.test(e.querySelectorAll))&&(gb(function(a){a.innerHTML="<select t=''><option selected=''></option></select>",a.querySelectorAll("[t^='']").length&&o.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||o.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll(":checked").length||o.push(":checked")}),gb(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&o.push("name"+K+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||o.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),o.push(",.*:")})),(c.matchesSelector=Y.test(q=m.webkitMatchesSelector||m.mozMatchesSelector||m.oMatchesSelector||m.msMatchesSelector))&&gb(function(a){c.disconnectedMatch=q.call(a,"div"),q.call(a,"[s!='']:x"),p.push("!=",O)}),o=o.length&&new RegExp(o.join("|")),p=p.length&&new RegExp(p.join("|")),b=Y.test(m.compareDocumentPosition),r=b||Y.test(m.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},z=b?function(a,b){if(a===b)return j=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===t&&r(t,a)?-1:b===e||b.ownerDocument===t&&r(t,b)?1:i?I.call(i,a)-I.call(i,b):0:4&d?-1:1)}:function(a,b){if(a===b)return j=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],k=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:i?I.call(i,a)-I.call(i,b):0;if(f===g)return ib(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)k.unshift(c);while(h[d]===k[d])d++;return d?ib(h[d],k[d]):h[d]===t?-1:k[d]===t?1:0},e):l},db.matches=function(a,b){return db(a,null,null,b)},db.matchesSelector=function(a,b){if((a.ownerDocument||a)!==l&&k(a),b=b.replace(S,"='$1']"),!(!c.matchesSelector||!n||p&&p.test(b)||o&&o.test(b)))try{var d=q.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return db(b,l,null,[a]).length>0},db.contains=function(a,b){return(a.ownerDocument||a)!==l&&k(a),r(a,b)},db.attr=function(a,b){(a.ownerDocument||a)!==l&&k(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!n):void 0;return void 0!==f?f:c.attributes||!n?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},db.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},db.uniqueSort=function(a){var b,d=[],e=0,f=0;if(j=!c.detectDuplicates,i=!c.sortStable&&a.slice(0),a.sort(z),j){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return i=null,a},e=db.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=db.selectors={cacheLength:50,createPseudo:fb,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ab,bb),a[3]=(a[4]||a[5]||"").replace(ab,bb),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||db.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&db.error(a[0]),a},PSEUDO:function(a){var b,c=!a[5]&&a[2];return V.CHILD.test(a[0])?null:(a[3]&&void 0!==a[4]?a[2]=a[4]:c&&T.test(c)&&(b=ob(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ab,bb).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=w[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&w(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==A&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=db.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),t=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&t){k=q[s]||(q[s]={}),j=k[a]||[],n=j[0]===u&&j[1],m=j[0]===u&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[u,n,m];break}}else if(t&&(j=(b[s]||(b[s]={}))[a])&&j[0]===u)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(t&&((l[s]||(l[s]={}))[a]=[u,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||db.error("unsupported pseudo: "+a);return e[s]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?fb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:fb(function(a){var b=[],c=[],d=g(a.replace(P,"$1"));return d[s]?fb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:fb(function(a){return function(b){return db(a,b).length>0}}),contains:fb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:fb(function(a){return U.test(a||"")||db.error("unsupported lang: "+a),a=a.replace(ab,bb).toLowerCase(),function(b){var c;do if(c=n?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===m},focus:function(a){return a===l.activeElement&&(!l.hasFocus||l.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:lb(function(){return[0]}),last:lb(function(a,b){return[b-1]}),eq:lb(function(a,b,c){return[0>c?c+b:c]}),even:lb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:lb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:lb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:lb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=jb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=kb(b);function nb(){}nb.prototype=d.filters=d.pseudos,d.setFilters=new nb;function ob(a,b){var c,e,f,g,h,i,j,k=x[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=Q.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?db.error(a):x(a,i).slice(0)}function pb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function qb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=v++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[u,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[s]||(b[s]={}),(h=i[d])&&h[0]===u&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function rb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function sb(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function tb(a,b,c,d,e,f){return d&&!d[s]&&(d=tb(d)),e&&!e[s]&&(e=tb(e,f)),fb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||wb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:sb(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=sb(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=sb(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ub(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],i=g||d.relative[" "],j=g?1:0,k=qb(function(a){return a===b},i,!0),l=qb(function(a){return I.call(b,a)>-1},i,!0),m=[function(a,c,d){return!g&&(d||c!==h)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>j;j++)if(c=d.relative[a[j].type])m=[qb(rb(m),c)];else{if(c=d.filter[a[j].type].apply(null,a[j].matches),c[s]){for(e=++j;f>e;e++)if(d.relative[a[e].type])break;return tb(j>1&&rb(m),j>1&&pb(a.slice(0,j-1).concat({value:" "===a[j-2].type?"*":""})).replace(P,"$1"),c,e>j&&ub(a.slice(j,e)),f>e&&ub(a=a.slice(e)),f>e&&pb(a))}m.push(c)}return rb(m)}function vb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,i,j,k){var m,n,o,p=0,q="0",r=f&&[],s=[],t=h,v=f||e&&d.find.TAG("*",k),w=u+=null==t?1:Math.random()||.1,x=v.length;for(k&&(h=g!==l&&g);q!==x&&null!=(m=v[q]);q++){if(e&&m){n=0;while(o=a[n++])if(o(m,g,i)){j.push(m);break}k&&(u=w)}c&&((m=!o&&m)&&p--,f&&r.push(m))}if(p+=q,c&&q!==p){n=0;while(o=b[n++])o(r,s,g,i);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=E.call(j));s=sb(s)}G.apply(j,s),k&&!f&&s.length>0&&p+b.length>1&&db.uniqueSort(j)}return k&&(u=w,h=t),r};return c?fb(f):f}g=db.compile=function(a,b){var c,d=[],e=[],f=y[a+" "];if(!f){b||(b=ob(a)),c=b.length;while(c--)f=ub(b[c]),f[s]?d.push(f):e.push(f);f=y(a,vb(e,d))}return f};function wb(a,b,c){for(var d=0,e=b.length;e>d;d++)db(a,b[d],c);return c}function xb(a,b,e,f){var h,i,j,k,l,m=ob(a);if(!f&&1===m.length){if(i=m[0]=m[0].slice(0),i.length>2&&"ID"===(j=i[0]).type&&c.getById&&9===b.nodeType&&n&&d.relative[i[1].type]){if(b=(d.find.ID(j.matches[0].replace(ab,bb),b)||[])[0],!b)return e;a=a.slice(i.shift().value.length)}h=V.needsContext.test(a)?0:i.length;while(h--){if(j=i[h],d.relative[k=j.type])break;if((l=d.find[k])&&(f=l(j.matches[0].replace(ab,bb),$.test(i[0].type)&&mb(b.parentNode)||b))){if(i.splice(h,1),a=f.length&&pb(i),!a)return G.apply(e,f),e;break}}}return g(a,m)(f,b,!n,e,$.test(a)&&mb(b.parentNode)||b),e}return c.sortStable=s.split("").sort(z).join("")===s,c.detectDuplicates=!!j,k(),c.sortDetached=gb(function(a){return 1&a.compareDocumentPosition(l.createElement("div"))}),gb(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||hb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&gb(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||hb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),gb(function(a){return null==a.getAttribute("disabled")})||hb(J,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),db}(a);o.find=t,o.expr=t.selectors,o.expr[":"]=o.expr.pseudos,o.unique=t.uniqueSort,o.text=t.getText,o.isXMLDoc=t.isXML,o.contains=t.contains;var u=o.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(o.isFunction(b))return o.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return o.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return o.filter(b,a,c);b=o.filter(b,a)}return o.grep(a,function(a){return g.call(b,a)>=0!==c})}o.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?o.find.matchesSelector(d,a)?[d]:[]:o.find.matches(a,o.grep(b,function(a){return 1===a.nodeType}))},o.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(o(a).filter(function(){for(b=0;c>b;b++)if(o.contains(e[b],this))return!0}));for(b=0;c>b;b++)o.find(a,e[b],d);return d=this.pushStack(c>1?o.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?o(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=o.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof o?b[0]:b,o.merge(this,o.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:m,!0)),v.test(c[1])&&o.isPlainObject(b))for(c in b)o.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=m.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=m,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):o.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(o):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),o.makeArray(a,this))};A.prototype=o.fn,y=o(m);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};o.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&o(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),o.fn.extend({has:function(a){var b=o(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(o.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?o(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&o.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?o.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(o(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(o.unique(o.merge(this.get(),o(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}o.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return o.dir(a,"parentNode")},parentsUntil:function(a,b,c){return o.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return o.dir(a,"nextSibling")},prevAll:function(a){return o.dir(a,"previousSibling")},nextUntil:function(a,b,c){return o.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return o.dir(a,"previousSibling",c)},siblings:function(a){return o.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return o.sibling(a.firstChild)},contents:function(a){return a.contentDocument||o.merge([],a.childNodes)}},function(a,b){o.fn[a]=function(c,d){var e=o.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=o.filter(d,e)),this.length>1&&(C[a]||o.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return o.each(a.match(E)||[],function(a,c){b[c]=!0}),b}o.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):o.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){o.each(b,function(b,c){var d=o.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&o.each(arguments,function(a,b){var c;while((c=o.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?o.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},o.extend({Deferred:function(a){var b=[["resolve","done",o.Callbacks("once memory"),"resolved"],["reject","fail",o.Callbacks("once memory"),"rejected"],["notify","progress",o.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return o.Deferred(function(c){o.each(b,function(b,f){var g=o.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&o.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?o.extend(a,d):d}},e={};return d.pipe=d.then,o.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&o.isFunction(a.promise)?e:0,g=1===f?a:o.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&o.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;o.fn.ready=function(a){return o.ready.promise().done(a),this},o.extend({isReady:!1,readyWait:1,holdReady:function(a){a?o.readyWait++:o.ready(!0)},ready:function(a){(a===!0?--o.readyWait:o.isReady)||(o.isReady=!0,a!==!0&&--o.readyWait>0||(H.resolveWith(m,[o]),o.fn.trigger&&o(m).trigger("ready").off("ready")))}});function I(){m.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),o.ready()}o.ready.promise=function(b){return H||(H=o.Deferred(),"complete"===m.readyState?setTimeout(o.ready):(m.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},o.ready.promise();var J=o.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===o.type(c)){e=!0;for(h in c)o.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,o.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(o(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};o.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=o.expando+Math.random()}K.uid=1,K.accepts=o.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,o.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(o.isEmptyObject(f))o.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,o.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{o.isArray(b)?d=b.concat(b.map(o.camelCase)):(e=o.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!o.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?o.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}o.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),o.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;
    while(c--)d=g[c].name,0===d.indexOf("data-")&&(d=o.camelCase(d.slice(5)),P(f,d,e[d]));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=o.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),o.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||o.isArray(c)?d=L.access(a,b,o.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=o.queue(a,b),d=c.length,e=c.shift(),f=o._queueHooks(a,b),g=function(){o.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:o.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),o.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?o.queue(this[0],a):void 0===b?this:this.each(function(){var c=o.queue(this,a,b);o._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&o.dequeue(this,a)})},dequeue:function(a){return this.each(function(){o.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=o.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===o.css(a,"display")||!o.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=m.createDocumentFragment(),b=a.appendChild(m.createElement("div"));b.innerHTML="<input type='radio' checked='checked' name='t'/>",l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";l.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return m.activeElement}catch(a){}}o.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=o.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof o!==U&&o.event.triggered!==b.type?o.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],n=q=h[1],p=(h[2]||"").split(".").sort(),n&&(l=o.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=o.event.special[n]||{},k=o.extend({type:n,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&o.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(n,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),o.event.global[n]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],n=q=h[1],p=(h[2]||"").split(".").sort(),n){l=o.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||o.removeEvent(a,n,r.handle),delete i[n])}else for(n in i)o.event.remove(a,n+b[j],c,d,!0);o.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,l,n,p=[d||m],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||m,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+o.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[o.expando]?b:new o.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:o.makeArray(c,[b]),n=o.event.special[q]||{},e||!n.trigger||n.trigger.apply(d,c)!==!1)){if(!e&&!n.noBubble&&!o.isWindow(d)){for(i=n.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||m)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:n.bindType||q,l=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),l&&l.apply(g,c),l=k&&g[k],l&&l.apply&&o.acceptData(g)&&(b.result=l.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||n._default&&n._default.apply(p.pop(),c)!==!1||!o.acceptData(d)||k&&o.isFunction(d[q])&&!o.isWindow(d)&&(h=d[k],h&&(d[k]=null),o.event.triggered=q,d[q](),o.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=o.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=o.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=o.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((o.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?o(e,this).index(i)>=0:o.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||m,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[o.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new o.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=m),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&o.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return o.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=o.extend(new o.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?o.event.trigger(e,null,b):o.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},o.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},o.Event=function(a,b){return this instanceof o.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.getPreventDefault&&a.getPreventDefault()?Z:$):this.type=a,b&&o.extend(this,b),this.timeStamp=a&&a.timeStamp||o.now(),void(this[o.expando]=!0)):new o.Event(a,b)},o.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z,this.stopPropagation()}},o.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){o.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!o.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),l.focusinBubbles||o.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){o.event.simulate(b,a.target,o.event.fix(a),!0)};o.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),o.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return o().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=o.guid++)),this.each(function(){o.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,o(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){o.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){o.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?o.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return o.nodeName(a,"table")&&o.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)o.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=o.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&o.nodeName(a,b)?o.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}o.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=o.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||o.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,n=a.length;n>m;m++)if(e=a[m],e||0===e)if("object"===o.type(e))o.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;o.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===o.inArray(e,d))&&(i=o.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f,g,h=o.event.special,i=0;void 0!==(c=a[i]);i++){if(o.acceptData(c)&&(f=c[L.expando],f&&(b=L.cache[f]))){if(d=Object.keys(b.events||{}),d.length)for(g=0;void 0!==(e=d[g]);g++)h[e]?o.event.remove(c,e):o.removeEvent(c,e,b.handle);L.cache[f]&&delete L.cache[f]}delete M.cache[c[M.expando]]}}}),o.fn.extend({text:function(a){return J(this,function(a){return void 0===a?o.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?o.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||o.cleanData(ob(c)),c.parentNode&&(b&&o.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(o.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return o.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(o.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,o.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,k=this.length,m=this,n=k-1,p=a[0],q=o.isFunction(p);if(q||k>1&&"string"==typeof p&&!l.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(k&&(c=o.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=o.map(ob(c,"script"),kb),g=f.length;k>j;j++)h=c,j!==n&&(h=o.clone(h,!0,!0),g&&o.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,o.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&o.contains(i,h)&&(h.src?o._evalUrl&&o._evalUrl(h.src):o.globalEval(h.textContent.replace(hb,"")))}return this}}),o.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){o.fn[a]=function(a){for(var c,d=[],e=o(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),o(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d=o(c.createElement(b)).appendTo(c.body),e=a.getDefaultComputedStyle?a.getDefaultComputedStyle(d[0]).display:o.css(d[0],"display");return d.detach(),e}function tb(a){var b=m,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||o("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||o.contains(a.ownerDocument,a)||(g=o.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d="padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",e=m.documentElement,f=m.createElement("div"),g=m.createElement("div");g.style.backgroundClip="content-box",g.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===g.style.backgroundClip,f.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",f.appendChild(g);function h(){g.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",e.appendChild(f);var d=a.getComputedStyle(g,null);b="1%"!==d.top,c="4px"===d.width,e.removeChild(f)}a.getComputedStyle&&o.extend(l,{pixelPosition:function(){return h(),b},boxSizingReliable:function(){return null==c&&h(),c},reliableMarginRight:function(){var b,c=g.appendChild(m.createElement("div"));return c.style.cssText=g.style.cssText=d,c.style.marginRight=c.style.width="0",g.style.width="1px",e.appendChild(f),b=!parseFloat(a.getComputedStyle(c,null).marginRight),e.removeChild(f),g.innerHTML="",b}})}(),o.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:0,fontWeight:400},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=o.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=o.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=o.css(a,"border"+R[f]+"Width",!0,e))):(g+=o.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=o.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===o.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):f[g]||(e=S(d),(c&&"none"!==c||!e)&&L.set(d,"olddisplay",e?c:o.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}o.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=o.camelCase(b),i=a.style;return b=o.cssProps[h]||(o.cssProps[h]=Fb(i,h)),g=o.cssHooks[b]||o.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(o.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||o.cssNumber[h]||(c+="px"),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]="",i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=o.camelCase(b);return b=o.cssProps[h]||(o.cssProps[h]=Fb(a.style,h)),g=o.cssHooks[b]||o.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||o.isNumeric(f)?f||0:e):e}}),o.each(["height","width"],function(a,b){o.cssHooks[b]={get:function(a,c,d){return c?0===a.offsetWidth&&zb.test(o.css(a,"display"))?o.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===o.css(a,"boxSizing",!1,e),e):0)}}}),o.cssHooks.marginRight=yb(l.reliableMarginRight,function(a,b){return b?o.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),o.each({margin:"",padding:"",border:"Width"},function(a,b){o.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(o.cssHooks[a+b].set=Gb)}),o.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(o.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=o.css(a,b[g],!1,d);return f}return void 0!==c?o.style(a,b,c):o.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?o(this).show():o(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}o.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(o.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?o.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=o.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){o.fx.step[a.prop]?o.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[o.cssProps[a.prop]]||o.cssHooks[a.prop])?o.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},o.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},o.fx=Kb.prototype.init,o.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(o.cssNumber[a]?"":"px"),g=(o.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(o.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,o.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=o.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k=this,l={},m=a.style,n=a.nodeType&&S(a),p=L.get(a,"fxshow");c.queue||(h=o._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,k.always(function(){k.always(function(){h.unqueued--,o.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],j=o.css(a,"display"),"none"===j&&(j=tb(a.nodeName)),"inline"===j&&"none"===o.css(a,"float")&&(m.display="inline-block")),c.overflow&&(m.overflow="hidden",k.always(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(n?"hide":"show")){if("show"!==e||!p||void 0===p[d])continue;n=!0}l[d]=p&&p[d]||o.style(a,d)}if(!o.isEmptyObject(l)){p?"hidden"in p&&(n=p.hidden):p=L.access(a,"fxshow",{}),f&&(p.hidden=!n),n?o(a).show():k.done(function(){o(a).hide()}),k.done(function(){var b;L.remove(a,"fxshow");for(b in l)o.style(a,b,l[b])});for(d in l)g=Ub(n?p[d]:0,d,k),d in p||(p[d]=g.start,n&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=o.camelCase(c),e=b[d],f=a[c],o.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=o.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=o.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:o.extend({},b),opts:o.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=o.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return o.map(k,Ub,j),o.isFunction(j.opts.start)&&j.opts.start.call(a,j),o.fx.timer(o.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}o.Animation=o.extend(Xb,{tweener:function(a,b){o.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),o.speed=function(a,b,c){var d=a&&"object"==typeof a?o.extend({},a):{complete:c||!c&&b||o.isFunction(a)&&a,duration:a,easing:c&&b||b&&!o.isFunction(b)&&b};return d.duration=o.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in o.fx.speeds?o.fx.speeds[d.duration]:o.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){o.isFunction(d.old)&&d.old.call(this),d.queue&&o.dequeue(this,d.queue)},d},o.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=o.isEmptyObject(a),f=o.speed(b,c,d),g=function(){var b=Xb(this,o.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=o.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&o.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=o.timers,g=d?d.length:0;for(c.finish=!0,o.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),o.each(["toggle","show","hide"],function(a,b){var c=o.fn[b];o.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),o.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){o.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),o.timers=[],o.fx.tick=function(){var a,b=0,c=o.timers;for(Lb=o.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||o.fx.stop(),Lb=void 0},o.fx.timer=function(a){o.timers.push(a),a()?o.fx.start():o.timers.pop()},o.fx.interval=13,o.fx.start=function(){Mb||(Mb=setInterval(o.fx.tick,o.fx.interval))},o.fx.stop=function(){clearInterval(Mb),Mb=null},o.fx.speeds={slow:600,fast:200,_default:400},o.fn.delay=function(a,b){return a=o.fx?o.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=m.createElement("input"),b=m.createElement("select"),c=b.appendChild(m.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=m.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var Yb,Zb,$b=o.expr.attrHandle;o.fn.extend({attr:function(a,b){return J(this,o.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){o.removeAttr(this,a)})}}),o.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?o.prop(a,b,c):(1===f&&o.isXMLDoc(a)||(b=b.toLowerCase(),d=o.attrHooks[b]||(o.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=o.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void o.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=o.propFix[c]||c,o.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&o.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?o.removeAttr(a,c):a.setAttribute(c,c),c}},o.each(o.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||o.find.attr;$b[b]=function(a,b,d){var e,f;
    return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;o.fn.extend({prop:function(a,b){return J(this,o.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[o.propFix[a]||a]})}}),o.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!o.isXMLDoc(a),f&&(b=o.propFix[b]||b,e=o.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),l.optSelected||(o.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),o.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){o.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;o.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(o.isFunction(a))return this.each(function(b){o(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=o.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(o.isFunction(a))return this.each(function(b){o(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?o.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(o.isFunction(a)?function(c){o(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=o(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;o.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=o.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,o(this).val()):a,null==e?e="":"number"==typeof e?e+="":o.isArray(e)&&(e=o.map(e,function(a){return null==a?"":a+""})),b=o.valHooks[this.type]||o.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=o.valHooks[e.type]||o.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),o.extend({valHooks:{select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(l.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&o.nodeName(c.parentNode,"optgroup"))){if(b=o(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=o.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=o.inArray(o(d).val(),f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),o.each(["radio","checkbox"],function(){o.valHooks[this]={set:function(a,b){return o.isArray(b)?a.checked=o.inArray(o(a).val(),b)>=0:void 0}},l.checkOn||(o.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),o.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){o.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),o.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=o.now(),dc=/\?/;o.parseJSON=function(a){return JSON.parse(a+"")},o.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&o.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=m.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(o.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,o.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=o.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&o.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}o.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":o.parseJSON,"text xml":o.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,o.ajaxSettings),b):tc(o.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=o.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?o(l):o.event,n=o.Deferred(),p=o.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(n.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=o.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=o.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===o.active++&&o.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(o.lastModified[d]&&v.setRequestHeader("If-Modified-Since",o.lastModified[d]),o.etag[d]&&v.setRequestHeader("If-None-Match",o.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(o.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(o.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?n.resolveWith(l,[r,x,v]):n.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--o.active||o.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return o.get(a,b,c,"json")},getScript:function(a,b){return o.get(a,void 0,b,"script")}}),o.each(["get","post"],function(a,b){o[b]=function(a,c,d,e){return o.isFunction(c)&&(e=e||d,d=c,c=void 0),o.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),o.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){o.fn[b]=function(a){return this.on(b,a)}}),o._evalUrl=function(a){return o.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},o.fn.extend({wrapAll:function(a){var b;return o.isFunction(a)?this.each(function(b){o(this).wrapAll(a.call(this,b))}):(this[0]&&(b=o(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(o.isFunction(a)?function(b){o(this).wrapInner(a.call(this,b))}:function(){var b=o(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=o.isFunction(a);return this.each(function(c){o(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){o.nodeName(this,"body")||o(this).replaceWith(this.childNodes)}).end()}}),o.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},o.expr.filters.visible=function(a){return!o.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(o.isArray(b))o.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==o.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}o.param=function(a,b){var c,d=[],e=function(a,b){b=o.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=o.ajaxSettings&&o.ajaxSettings.traditional),o.isArray(a)||a.jquery&&!o.isPlainObject(a))o.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},o.fn.extend({serialize:function(){return o.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=o.prop(this,"elements");return a?o.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!o(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=o(this).val();return null==c?null:o.isArray(c)?o.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),o.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=o.ajaxSettings.xhr();a.ActiveXObject&&o(a).on("unload",function(){for(var a in Dc)Dc[a]()}),l.cors=!!Fc&&"withCredentials"in Fc,l.ajax=Fc=!!Fc,o.ajaxTransport(function(a){var b;return l.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort"),f.send(a.hasContent&&a.data||null)},abort:function(){b&&b()}}:void 0}),o.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return o.globalEval(a),a}}}),o.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),o.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=o("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),m.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;o.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||o.expando+"_"+cc++;return this[a]=!0,a}}),o.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=o.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||o.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&o.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),o.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||m;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=o.buildFragment([a],b,e),e&&e.length&&o(e).remove(),o.merge([],d.childNodes))};var Ic=o.fn.load;o.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=a.slice(h),a=a.slice(0,h)),o.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&o.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?o("<div>").append(o.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},o.expr.filters.animated=function(a){return o.grep(o.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return o.isWindow(a)?a:9===a.nodeType&&a.defaultView}o.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=o.css(a,"position"),l=o(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=o.css(a,"top"),i=o.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),o.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},o.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){o.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,o.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===o.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),o.nodeName(a[0],"html")||(d=a.offset()),d.top+=o.css(a[0],"borderTopWidth",!0),d.left+=o.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-o.css(c,"marginTop",!0),left:b.left-d.left-o.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!o.nodeName(a,"html")&&"static"===o.css(a,"position"))a=a.offsetParent;return a||Jc})}}),o.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;o.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),o.each(["top","left"],function(a,b){o.cssHooks[b]=yb(l.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?o(a).position()[b]+"px":c):void 0})}),o.each({Height:"height",Width:"width"},function(a,b){o.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){o.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return o.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?o.css(b,c,g):o.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),o.fn.size=function(){return this.length},o.fn.andSelf=o.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return o});var Lc=a.jQuery,Mc=a.$;return o.noConflict=function(b){return a.$===o&&(a.$=Mc),b&&a.jQuery===o&&(a.jQuery=Lc),o},typeof b===U&&(a.jQuery=a.$=o),o});

/* lib/jquery-2.1.0.min.js end */




/* lib/promise-1.0.0.js */
    (function() {
    var define, requireModule, require, requirejs;

    (function() {
      var registry = {}, seen = {};

      define = function(name, deps, callback) {
        registry[name] = { deps: deps, callback: callback };
      };

      requirejs = require = requireModule = function(name) {
      requirejs._eak_seen = registry;

        if (seen[name]) { return seen[name]; }
        seen[name] = {};

        if (!registry[name]) {
          throw new Error("Could not find module " + name);
        }

        var mod = registry[name],
            deps = mod.deps,
            callback = mod.callback,
            reified = [],
            exports;

        for (var i=0, l=deps.length; i<l; i++) {
          if (deps[i] === 'exports') {
            reified.push(exports = {});
          } else {
            reified.push(requireModule(resolve(deps[i])));
          }
        }

        var value = callback.apply(this, reified);
        return seen[name] = exports || value;

        function resolve(child) {
          if (child.charAt(0) !== '.') { return child; }
          var parts = child.split("/");
          var parentBase = name.split("/").slice(0, -1);

          for (var i=0, l=parts.length; i<l; i++) {
            var part = parts[i];

            if (part === '..') { parentBase.pop(); }
            else if (part === '.') { continue; }
            else { parentBase.push(part); }
          }

          return parentBase.join("/");
        }
      };
    })();

    define("promise/all", 
      ["./utils","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        /* global toString */

        var isArray = __dependency1__.isArray;
        var isFunction = __dependency1__.isFunction;

        /**
          Returns a promise that is fulfilled when all the given promises have been
          fulfilled, or rejected if any of them become rejected. The return promise
          is fulfilled with an array that gives all the values in the order they were
          passed in the `promises` array argument.

          Example:

          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.resolve(2);
          var promise3 = RSVP.resolve(3);
          var promises = [ promise1, promise2, promise3 ];

          RSVP.all(promises).then(function(array){
            // The array here would be [ 1, 2, 3 ];
          });
          ```

          If any of the `promises` given to `RSVP.all` are rejected, the first promise
          that is rejected will be given as an argument to the returned promises's
          rejection handler. For example:

          Example:

          ```javascript
          var promise1 = RSVP.resolve(1);
          var promise2 = RSVP.reject(new Error("2"));
          var promise3 = RSVP.reject(new Error("3"));
          var promises = [ promise1, promise2, promise3 ];

          RSVP.all(promises).then(function(array){
            // Code here never runs because there are rejected promises!
          }, function(error) {
            // error.message === "2"
          });
          ```

          @method all
          @for RSVP
          @param {Array} promises
          @param {String} label
          @return {Promise} promise that is fulfilled when all `promises` have been
          fulfilled, or rejected if any of them become rejected.
        */
        function all(promises) {
          /*jshint validthis:true */
          var Promise = this;

          if (!isArray(promises)) {
            throw new TypeError('You must pass an array to all.');
          }

          return new Promise(function(resolve, reject) {
            var results = [], remaining = promises.length,
            promise;

            if (remaining === 0) {
              resolve([]);
            }

            function resolver(index) {
              return function(value) {
                resolveAll(index, value);
              };
            }

            function resolveAll(index, value) {
              results[index] = value;
              if (--remaining === 0) {
                resolve(results);
              }
            }

            for (var i = 0; i < promises.length; i++) {
              promise = promises[i];

              if (promise && isFunction(promise.then)) {
                promise.then(resolver(i), reject);
              } else {
                resolveAll(i, promise);
              }
            }
          });
        }

        __exports__.all = all;
      });
    define("promise/asap", 
      ["exports"],
      function(__exports__) {
        "use strict";
        var browserGlobal = (typeof window !== 'undefined') ? window : {};
        var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
        var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

        // node
        function useNextTick() {
          return function() {
            process.nextTick(flush);
          };
        }

        function useMutationObserver() {
          var iterations = 0;
          var observer = new BrowserMutationObserver(flush);
          var node = document.createTextNode('');
          observer.observe(node, { characterData: true });

          return function() {
            node.data = (iterations = ++iterations % 2);
          };
        }

        function useSetTimeout() {
          return function() {
            local.setTimeout(flush, 1);
          };
        }

        var queue = [];
        function flush() {
          for (var i = 0; i < queue.length; i++) {
            var tuple = queue[i];
            var callback = tuple[0], arg = tuple[1];
            callback(arg);
          }
          queue = [];
        }

        var scheduleFlush;

        // Decide what async method to use to triggering processing of queued callbacks:
        if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
          scheduleFlush = useNextTick();
        } else if (BrowserMutationObserver) {
          scheduleFlush = useMutationObserver();
        } else {
          scheduleFlush = useSetTimeout();
        }

        function asap(callback, arg) {
          var length = queue.push([callback, arg]);
          if (length === 1) {
            // If length is 1, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            scheduleFlush();
          }
        }

        __exports__.asap = asap;
      });
    define("promise/config", 
      ["exports"],
      function(__exports__) {
        "use strict";
        var config = {
          instrument: false
        };

        function configure(name, value) {
          if (arguments.length === 2) {
            config[name] = value;
          } else {
            return config[name];
          }
        }

        __exports__.config = config;
        __exports__.configure = configure;
      });
    define("promise/polyfill", 
      ["./promise","./utils","exports"],
      function(__dependency1__, __dependency2__, __exports__) {
        "use strict";
        /*global self*/
        var RSVPPromise = __dependency1__.Promise;
        var isFunction = __dependency2__.isFunction;

        function polyfill() {
          var local;

          if (typeof global !== 'undefined') {
            local = global;
          } else if (typeof window !== 'undefined' && window.document) {
            local = window;
          } else {
            local = self;
          }

          var es6PromiseSupport = 
            "Promise" in local &&
            // Some of these methods are missing from
            // Firefox/Chrome experimental implementations
            "resolve" in local.Promise &&
            "reject" in local.Promise &&
            "all" in local.Promise &&
            "race" in local.Promise &&
            // Older version of the spec had a resolver object
            // as the arg rather than a function
            (function() {
              var resolve;
              new local.Promise(function(r) { resolve = r; });
              return isFunction(resolve);
            }());

          if (!es6PromiseSupport) {
            local.Promise = RSVPPromise;
          }
        }

        __exports__.polyfill = polyfill;
      });
    define("promise/promise", 
      ["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],
      function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
        "use strict";
        var config = __dependency1__.config;
        var configure = __dependency1__.configure;
        var objectOrFunction = __dependency2__.objectOrFunction;
        var isFunction = __dependency2__.isFunction;
        var now = __dependency2__.now;
        var all = __dependency3__.all;
        var race = __dependency4__.race;
        var staticResolve = __dependency5__.resolve;
        var staticReject = __dependency6__.reject;
        var asap = __dependency7__.asap;

        var counter = 0;

        config.async = asap; // default async is asap;

        function Promise(resolver) {
          if (!isFunction(resolver)) {
            throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
          }

          if (!(this instanceof Promise)) {
            throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
          }

          this._subscribers = [];

          invokeResolver(resolver, this);
        }

        function invokeResolver(resolver, promise) {
          function resolvePromise(value) {
            resolve(promise, value);
          }

          function rejectPromise(reason) {
            reject(promise, reason);
          }

          try {
            resolver(resolvePromise, rejectPromise);
          } catch(e) {
            rejectPromise(e);
          }
        }

        function invokeCallback(settled, promise, callback, detail) {
          var hasCallback = isFunction(callback),
              value, error, succeeded, failed;

          if (hasCallback) {
            try {
              value = callback(detail);
              succeeded = true;
            } catch(e) {
              failed = true;
              error = e;
            }
          } else {
            value = detail;
            succeeded = true;
          }

          if (handleThenable(promise, value)) {
            return;
          } else if (hasCallback && succeeded) {
            resolve(promise, value);
          } else if (failed) {
            reject(promise, error);
          } else if (settled === FULFILLED) {
            resolve(promise, value);
          } else if (settled === REJECTED) {
            reject(promise, value);
          }
        }

        var PENDING   = void 0;
        var SEALED    = 0;
        var FULFILLED = 1;
        var REJECTED  = 2;

        function subscribe(parent, child, onFulfillment, onRejection) {
          var subscribers = parent._subscribers;
          var length = subscribers.length;

          subscribers[length] = child;
          subscribers[length + FULFILLED] = onFulfillment;
          subscribers[length + REJECTED]  = onRejection;
        }

        function publish(promise, settled) {
          var child, callback, subscribers = promise._subscribers, detail = promise._detail;

          for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];

            invokeCallback(settled, child, callback, detail);
          }

          promise._subscribers = null;
        }

        Promise.prototype = {
          constructor: Promise,

          _state: undefined,
          _detail: undefined,
          _subscribers: undefined,

          then: function(onFulfillment, onRejection) {
            var promise = this;

            var thenPromise = new this.constructor(function() {});

            if (this._state) {
              var callbacks = arguments;
              config.async(function invokePromiseCallback() {
                invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
              });
            } else {
              subscribe(this, thenPromise, onFulfillment, onRejection);
            }

            return thenPromise;
          },

          'catch': function(onRejection) {
            return this.then(null, onRejection);
          }
        };

        Promise.all = all;
        Promise.race = race;
        Promise.resolve = staticResolve;
        Promise.reject = staticReject;

        function handleThenable(promise, value) {
          var then = null,
          resolved;

          try {
            if (promise === value) {
              throw new TypeError("A promises callback cannot return that same promise.");
            }

            if (objectOrFunction(value)) {
              then = value.then;

              if (isFunction(then)) {
                then.call(value, function(val) {
                  if (resolved) { return true; }
                  resolved = true;

                  if (value !== val) {
                    resolve(promise, val);
                  } else {
                    fulfill(promise, val);
                  }
                }, function(val) {
                  if (resolved) { return true; }
                  resolved = true;

                  reject(promise, val);
                });

                return true;
              }
            }
          } catch (error) {
            if (resolved) { return true; }
            reject(promise, error);
            return true;
          }

          return false;
        }

        function resolve(promise, value) {
          if (promise === value) {
            fulfill(promise, value);
          } else if (!handleThenable(promise, value)) {
            fulfill(promise, value);
          }
        }

        function fulfill(promise, value) {
          if (promise._state !== PENDING) { return; }
          promise._state = SEALED;
          promise._detail = value;

          config.async(publishFulfillment, promise);
        }

        function reject(promise, reason) {
          if (promise._state !== PENDING) { return; }
          promise._state = SEALED;
          promise._detail = reason;

          config.async(publishRejection, promise);
        }

        function publishFulfillment(promise) {
          publish(promise, promise._state = FULFILLED);
        }

        function publishRejection(promise) {
          publish(promise, promise._state = REJECTED);
        }

        __exports__.Promise = Promise;
      });
    define("promise/race", 
      ["./utils","exports"],
      function(__dependency1__, __exports__) {
        "use strict";
        /* global toString */
        var isArray = __dependency1__.isArray;

        /**
          `RSVP.race` allows you to watch a series of promises and act as soon as the
          first promise given to the `promises` argument fulfills or rejects.

          Example:

          ```javascript
          var promise1 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 1");
            }, 200);
          });

          var promise2 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 2");
            }, 100);
          });

          RSVP.race([promise1, promise2]).then(function(result){
            // result === "promise 2" because it was resolved before promise1
            // was resolved.
          });
          ```

          `RSVP.race` is deterministic in that only the state of the first completed
          promise matters. For example, even if other promises given to the `promises`
          array argument are resolved, but the first completed promise has become
          rejected before the other promises became fulfilled, the returned promise
          will become rejected:

          ```javascript
          var promise1 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              resolve("promise 1");
            }, 200);
          });

          var promise2 = new RSVP.Promise(function(resolve, reject){
            setTimeout(function(){
              reject(new Error("promise 2"));
            }, 100);
          });

          RSVP.race([promise1, promise2]).then(function(result){
            // Code here never runs because there are rejected promises!
          }, function(reason){
            // reason.message === "promise2" because promise 2 became rejected before
            // promise 1 became fulfilled
          });
          ```

          @method race
          @for RSVP
          @param {Array} promises array of promises to observe
          @param {String} label optional string for describing the promise returned.
          Useful for tooling.
          @return {Promise} a promise that becomes fulfilled with the value the first
          completed promises is resolved with if the first completed promise was
          fulfilled, or rejected with the reason that the first completed promise
          was rejected with.
        */
        function race(promises) {
          /*jshint validthis:true */
          var Promise = this;

          if (!isArray(promises)) {
            throw new TypeError('You must pass an array to race.');
          }
          return new Promise(function(resolve, reject) {
            var results = [], promise;

            for (var i = 0; i < promises.length; i++) {
              promise = promises[i];

              if (promise && typeof promise.then === 'function') {
                promise.then(resolve, reject);
              } else {
                resolve(promise);
              }
            }
          });
        }

        __exports__.race = race;
      });
    define("promise/reject", 
      ["exports"],
      function(__exports__) {
        "use strict";
        /**
          `RSVP.reject` returns a promise that will become rejected with the passed
          `reason`. `RSVP.reject` is essentially shorthand for the following:

          ```javascript
          var promise = new RSVP.Promise(function(resolve, reject){
            reject(new Error('WHOOPS'));
          });

          promise.then(function(value){
            // Code here doesn't run because the promise is rejected!
          }, function(reason){
            // reason.message === 'WHOOPS'
          });
          ```

          Instead of writing the above, your code now simply becomes the following:

          ```javascript
          var promise = RSVP.reject(new Error('WHOOPS'));

          promise.then(function(value){
            // Code here doesn't run because the promise is rejected!
          }, function(reason){
            // reason.message === 'WHOOPS'
          });
          ```

          @method reject
          @for RSVP
          @param {Any} reason value that the returned promise will be rejected with.
          @param {String} label optional string for identifying the returned promise.
          Useful for tooling.
          @return {Promise} a promise that will become rejected with the given
          `reason`.
        */
        function reject(reason) {
          /*jshint validthis:true */
          var Promise = this;

          return new Promise(function (resolve, reject) {
            reject(reason);
          });
        }

        __exports__.reject = reject;
      });
    define("promise/resolve", 
      ["exports"],
      function(__exports__) {
        "use strict";
        function resolve(value) {
          /*jshint validthis:true */
          if (value && typeof value === 'object' && value.constructor === this) {
            return value;
          }

          var Promise = this;

          return new Promise(function(resolve) {
            resolve(value);
          });
        }

        __exports__.resolve = resolve;
      });
    define("promise/utils", 
      ["exports"],
      function(__exports__) {
        "use strict";
        function objectOrFunction(x) {
          return isFunction(x) || (typeof x === "object" && x !== null);
        }

        function isFunction(x) {
          return typeof x === "function";
        }

        function isArray(x) {
          return Object.prototype.toString.call(x) === "[object Array]";
        }

        // Date.now is not available in browsers < IE9
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
        var now = Date.now || function() { return new Date().getTime(); };


        __exports__.objectOrFunction = objectOrFunction;
        __exports__.isFunction = isFunction;
        __exports__.isArray = isArray;
        __exports__.now = now;
      });
    requireModule('promise/polyfill').polyfill();
    }());
/* lib/promise-1.0.0.js end */




/* lib/ZeroClipboard.min.js */
    /*!
    * ZeroClipboard
    * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
    * Copyright (c) 2013 Jon Rohan, James M. Greene
    * Licensed MIT
    * http://zeroclipboard.org/
    * v1.2.3
    */
    !function(){"use strict";var a,b=function(){var a=/\-([a-z])/g,b=function(a,b){return b.toUpperCase()};return function(c){return c.replace(a,b)}}(),c=function(a,c){var d,e,f,g,h,i;if(window.getComputedStyle?d=window.getComputedStyle(a,null).getPropertyValue(c):(e=b(c),d=a.currentStyle?a.currentStyle[e]:a.style[e]),"cursor"===c&&(!d||"auto"===d))for(f=a.tagName.toLowerCase(),g=["a"],h=0,i=g.length;i>h;h++)if(f===g[h])return"pointer";return d},d=function(a){if(p.prototype._singleton){a||(a=window.event);var b;this!==window?b=this:a.target?b=a.target:a.srcElement&&(b=a.srcElement),p.prototype._singleton.setCurrent(b)}},e=function(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c)},f=function(a,b,c){a.removeEventListener?a.removeEventListener(b,c,!1):a.detachEvent&&a.detachEvent("on"+b,c)},g=function(a,b){if(a.addClass)return a.addClass(b),a;if(b&&"string"==typeof b){var c=(b||"").split(/\s+/);if(1===a.nodeType)if(a.className){for(var d=" "+a.className+" ",e=a.className,f=0,g=c.length;g>f;f++)d.indexOf(" "+c[f]+" ")<0&&(e+=" "+c[f]);a.className=e.replace(/^\s+|\s+$/g,"")}else a.className=b}return a},h=function(a,b){if(a.removeClass)return a.removeClass(b),a;if(b&&"string"==typeof b||void 0===b){var c=(b||"").split(/\s+/);if(1===a.nodeType&&a.className)if(b){for(var d=(" "+a.className+" ").replace(/[\n\t]/g," "),e=0,f=c.length;f>e;e++)d=d.replace(" "+c[e]+" "," ");a.className=d.replace(/^\s+|\s+$/g,"")}else a.className=""}return a},i=function(){var a,b,c,d=1;return"function"==typeof document.body.getBoundingClientRect&&(a=document.body.getBoundingClientRect(),b=a.right-a.left,c=document.body.offsetWidth,d=Math.round(100*(b/c))/100),d},j=function(a){var b={left:0,top:0,width:0,height:0,zIndex:999999999},d=c(a,"z-index");if(d&&"auto"!==d&&(b.zIndex=parseInt(d,10)),a.getBoundingClientRect){var e,f,g,h=a.getBoundingClientRect();"pageXOffset"in window&&"pageYOffset"in window?(e=window.pageXOffset,f=window.pageYOffset):(g=i(),e=Math.round(document.documentElement.scrollLeft/g),f=Math.round(document.documentElement.scrollTop/g));var j=document.documentElement.clientLeft||0,k=document.documentElement.clientTop||0;b.left=h.left+e-j,b.top=h.top+f-k,b.width="width"in h?h.width:h.right-h.left,b.height="height"in h?h.height:h.bottom-h.top}return b},k=function(a,b){var c=!(b&&b.useNoCache===!1);return c?(-1===a.indexOf("?")?"?":"&")+"nocache="+(new Date).getTime():""},l=function(a){var b=[],c=[];return a.trustedOrigins&&("string"==typeof a.trustedOrigins?c.push(a.trustedOrigins):"object"==typeof a.trustedOrigins&&"length"in a.trustedOrigins&&(c=c.concat(a.trustedOrigins))),a.trustedDomains&&("string"==typeof a.trustedDomains?c.push(a.trustedDomains):"object"==typeof a.trustedDomains&&"length"in a.trustedDomains&&(c=c.concat(a.trustedDomains))),c.length&&b.push("trustedOrigins="+encodeURIComponent(c.join(","))),"string"==typeof a.amdModuleId&&a.amdModuleId&&b.push("amdModuleId="+encodeURIComponent(a.amdModuleId)),"string"==typeof a.cjsModuleId&&a.cjsModuleId&&b.push("cjsModuleId="+encodeURIComponent(a.cjsModuleId)),b.join("&")},m=function(a,b){if(b.indexOf)return b.indexOf(a);for(var c=0,d=b.length;d>c;c++)if(b[c]===a)return c;return-1},n=function(a){if("string"==typeof a)throw new TypeError("ZeroClipboard doesn't accept query strings.");return a.length?a:[a]},o=function(a,b,c,d,e){e?window.setTimeout(function(){a.call(b,c,d)},0):a.call(b,c,d)},p=function(a,b){if(a&&(p.prototype._singleton||this).glue(a),p.prototype._singleton)return p.prototype._singleton;p.prototype._singleton=this,this.options={};for(var c in s)this.options[c]=s[c];for(var d in b)this.options[d]=b[d];this.handlers={},p.detectFlashSupport()&&v()},q=[];p.prototype.setCurrent=function(b){a=b,this.reposition();var d=b.getAttribute("title");d&&this.setTitle(d);var e=this.options.forceHandCursor===!0||"pointer"===c(b,"cursor");return r.call(this,e),this},p.prototype.setText=function(a){return a&&""!==a&&(this.options.text=a,this.ready()&&this.flashBridge.setText(a)),this},p.prototype.setTitle=function(a){return a&&""!==a&&this.htmlBridge.setAttribute("title",a),this},p.prototype.setSize=function(a,b){return this.ready()&&this.flashBridge.setSize(a,b),this},p.prototype.setHandCursor=function(a){return a="boolean"==typeof a?a:!!a,r.call(this,a),this.options.forceHandCursor=a,this};var r=function(a){this.ready()&&this.flashBridge.setHandCursor(a)};p.version="1.2.3";var s={moviePath:"ZeroClipboard.swf",trustedOrigins:null,text:null,hoverClass:"zeroclipboard-is-hover",activeClass:"zeroclipboard-is-active",allowScriptAccess:"sameDomain",useNoCache:!0,forceHandCursor:!1};p.setDefaults=function(a){for(var b in a)s[b]=a[b]},p.destroy=function(){p.prototype._singleton.unglue(q);var a=p.prototype._singleton.htmlBridge;a.parentNode.removeChild(a),delete p.prototype._singleton},p.detectFlashSupport=function(){var a=!1;if("function"==typeof ActiveXObject)try{new ActiveXObject("ShockwaveFlash.ShockwaveFlash")&&(a=!0)}catch(b){}return!a&&navigator.mimeTypes["application/x-shockwave-flash"]&&(a=!0),a};var t=null,u=null,v=function(){var a,b,c=p.prototype._singleton,d=document.getElementById("global-zeroclipboard-html-bridge");if(!d){var e={};for(var f in c.options)e[f]=c.options[f];e.amdModuleId=t,e.cjsModuleId=u;var g=l(e),h='      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="'+c.options.moviePath+k(c.options.moviePath,c.options)+'"/>         <param name="allowScriptAccess" value="'+c.options.allowScriptAccess+'"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="'+g+'"/>         <embed src="'+c.options.moviePath+k(c.options.moviePath,c.options)+'"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="always"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="'+g+'"           scale="exactfit">         </embed>       </object>';d=document.createElement("div"),d.id="global-zeroclipboard-html-bridge",d.setAttribute("class","global-zeroclipboard-container"),d.setAttribute("data-clipboard-ready",!1),d.style.position="absolute",d.style.left="-9999px",d.style.top="-9999px",d.style.width="15px",d.style.height="15px",d.style.zIndex="9999",d.innerHTML=h,document.body.appendChild(d)}c.htmlBridge=d,a=document["global-zeroclipboard-flash-bridge"],a&&(b=a.length)&&(a=a[b-1]),c.flashBridge=a||d.children[0].lastElementChild};p.prototype.resetBridge=function(){return this.htmlBridge.style.left="-9999px",this.htmlBridge.style.top="-9999px",this.htmlBridge.removeAttribute("title"),this.htmlBridge.removeAttribute("data-clipboard-text"),h(a,this.options.activeClass),a=null,this.options.text=null,this},p.prototype.ready=function(){var a=this.htmlBridge.getAttribute("data-clipboard-ready");return"true"===a||a===!0},p.prototype.reposition=function(){if(!a)return!1;var b=j(a);return this.htmlBridge.style.top=b.top+"px",this.htmlBridge.style.left=b.left+"px",this.htmlBridge.style.width=b.width+"px",this.htmlBridge.style.height=b.height+"px",this.htmlBridge.style.zIndex=b.zIndex+1,this.setSize(b.width,b.height),this},p.dispatch=function(a,b){p.prototype._singleton.receiveEvent(a,b)},p.prototype.on=function(a,b){for(var c=a.toString().split(/\s/g),d=0;d<c.length;d++)a=c[d].toLowerCase().replace(/^on/,""),this.handlers[a]||(this.handlers[a]=b);return this.handlers.noflash&&!p.detectFlashSupport()&&this.receiveEvent("onNoFlash",null),this},p.prototype.addEventListener=p.prototype.on,p.prototype.off=function(a,b){for(var c=a.toString().split(/\s/g),d=0;d<c.length;d++){a=c[d].toLowerCase().replace(/^on/,"");for(var e in this.handlers)e===a&&this.handlers[e]===b&&delete this.handlers[e]}return this},p.prototype.removeEventListener=p.prototype.off,p.prototype.receiveEvent=function(b,c){b=b.toString().toLowerCase().replace(/^on/,"");var d=a,e=!0;switch(b){case"load":if(c&&parseFloat(c.flashVersion.replace(",",".").replace(/[^0-9\.]/gi,""))<10)return this.receiveEvent("onWrongFlash",{flashVersion:c.flashVersion}),void 0;this.htmlBridge.setAttribute("data-clipboard-ready",!0);break;case"mouseover":g(d,this.options.hoverClass);break;case"mouseout":h(d,this.options.hoverClass),this.resetBridge();break;case"mousedown":g(d,this.options.activeClass);break;case"mouseup":h(d,this.options.activeClass);break;case"datarequested":var f=d.getAttribute("data-clipboard-target"),i=f?document.getElementById(f):null;if(i){var j=i.value||i.textContent||i.innerText;j&&this.setText(j)}else{var k=d.getAttribute("data-clipboard-text");k&&this.setText(k)}e=!1;break;case"complete":this.options.text=null}if(this.handlers[b]){var l=this.handlers[b];"string"==typeof l&&"function"==typeof window[l]&&(l=window[l]),"function"==typeof l&&o(l,d,this,c,e)}},p.prototype.glue=function(a){a=n(a);for(var b=0;b<a.length;b++)-1==m(a[b],q)&&(q.push(a[b]),e(a[b],"mouseover",d));return this},p.prototype.unglue=function(a){a=n(a);for(var b=0;b<a.length;b++){f(a[b],"mouseover",d);var c=m(a[b],q);-1!=c&&q.splice(c,1)}return this},"function"==typeof define&&define.amd?define(["require","exports","module"],function(a,b,c){return t=c&&c.id||null,p}):"object"==typeof module&&module&&"object"==typeof module.exports&&module.exports?(u=module.id||null,module.exports=p):
    window.ZeroClipboard=p
    }();
/* lib/ZeroClipboard.min.js end */




/* lib/fui/dev-lib/jhtmls.min.js */
    var jhtmls="undefined"==typeof exports?jhtmls||{}:exports;void function(e){"use strict";function n(e){return String(e).replace(/["<>& ]/g,function(e){return"&"+u[e]+";"})}function t(e){var n=[];return n.push("with(this){"),n.push(e.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g,function(e){return['!#{unescape("',escape(e),'")}'].join("")}).replace(/[\r\n]+/g,"\n").replace(/^\n+|\s+$/gm,"").replace(/^([ \w\t_$]*([^&\^?|\n\w\/'"{}\[\]+\-():; \t=\.$_]|:\/\/).*$|^(?!\s*(else|do|try|finally|void|typeof\s[\w$_]*)\s*$)[^'":;{}()\n|=&\/^?]+$)\s?/gm,function(e){return e=e.replace(/&none;/g,"").replace(/["'\\]/g,"\\$&").replace(/\n/g,"\\n").replace(/(!?#)\{(.*?)\}|(!?\$)([a-z_]+\w*(?:\.[a-z_]+\w*)*)/g,function(e,n,t,r,u){if(r&&(n=r,t=u),!t)return"";t=t.replace(/\\n/g,"\n").replace(/\\([\\'"])/g,"$1");var o=/^[a-z$][\w+$]+$/i.test(t)&&!/^(true|false|NaN|null|this)$/.test(t);return["',",o?["typeof ",t,"==='undefined'?'':"].join(""):"","#"===n||"$"===n?"_encode_":"","(",t,"),'"].join("")}),e=["'",e,"'"].join("").replace(/^'',|,''$/g,""),e?["_output_.push(",e,");"].join(""):""})),n.push("}"),new Function("_output_","_encode_","helper","jhtmls",n.join(""))}function r(r,u,o){"function"==typeof r&&(r=String(r).replace(/^[^\{]*\{\s*\/\*!?[ \f\t\v]*\n?|[ \f\t\v]*\*\/[;|\s]*\}$/g,""));var i=t(r),s=function(t,r){r=r||e;var u=[];return i.call(t,u,n,r,e),u.join("")};return arguments.length<=1?s:s(u,o)}var u={'"':"quot","<":"lt",">":"gt","&":"amp"," ":"nbsp"};e.render=r}(jhtmls);
    //# sourceMappingURL=dist/jhtmls.min.js.map
/* lib/fui/dev-lib/jhtmls.min.js end */




/* lib/fui/dist/fui.all.js */
    /*!
     * ====================================================
     * Flex UI - v1.0.0 - 2014-08-14
     * https://github.com/fex-team/fui
     * GitHub: https://github.com/fex-team/fui.git 
     * Copyright (c) 2014 Baidu Kity Group; Licensed MIT
     * ====================================================
     */

    (function () {
    var _p = {
        r: function(index) {
            if (_p[index].inited) {
                return _p[index].value;
            }
            if (typeof _p[index].value === "function") {
                var module = {
                    exports: {}
                }, returnValue = _p[index].value(null, module.exports, module);
                _p[index].inited = true;
                _p[index].value = returnValue;
                if (returnValue !== undefined) {
                    return returnValue;
                } else {
                    for (var key in module.exports) {
                        if (module.exports.hasOwnProperty(key)) {
                            _p[index].inited = true;
                            _p[index].value = module.exports;
                            return module.exports;
                        }
                    }
                }
            } else {
                _p[index].inited = true;
                return _p[index].value;
            }
        }
    };

    //src/base/creator.js
    /**
     * UI构造工厂, 提供可通过参数配置项创建多个构件的机制.
     */
    _p[0] = {
        value: function(require) {
            var Creator = {}, $ = _p.r(4), FUI_NS = _p.r(11);
            $.extend(Creator, {
                parse: function(options) {
                    var pool = [];
                    if ($.isArray(options)) {
                        $.each(options, function(i, opt) {
                            pool.push(getInstance(opt));
                        });
                        return pool;
                    } else {
                        return getInstance(options);
                    }
                }
            });
            function getInstance(option) {
                var Constructor = FUI_NS[option.clazz];
                if (!Constructor) {
                    return null;
                }
                return new Constructor(option);
            }
            return Creator;
        }
    };

    //src/base/exports.js
    /**
     * 模块暴露
     */
    _p[1] = {
        value: function(require) {
            var FUI_NS = _p.r(11);
            FUI_NS.___register({
                Widget: _p.r(58),
                Icon: _p.r(42),
                Label: _p.r(48),
                Button: _p.r(37),
                ToggleButton: _p.r(57),
                Buttonset: _p.r(36),
                Separator: _p.r(54),
                Item: _p.r(46),
                Input: _p.r(45),
                InputButton: _p.r(43),
                Mask: _p.r(49),
                ColorPicker: _p.r(38),
                Tabs: _p.r(56),
                SpinButton: _p.r(55),
                Container: _p.r(39),
                Panel: _p.r(51),
                PPanel: _p.r(53),
                LabelPanel: _p.r(47),
                Menu: _p.r(50),
                InputMenu: _p.r(44),
                ButtonMenu: _p.r(34),
                DropPanel: _p.r(41),
                Popup: _p.r(52),
                Dialog: _p.r(40),
                Utils: _p.r(13),
                Creator: _p.r(0)
            });
            FUI_NS.__export();
        }
    };

    //src/base/extensions.js
    /**
     * 扩展模块暴露
     */
    _p[2] = {
        value: function(require) {
            var FUI_NS = _p.r(11);
            FUI_NS.___register({
                TablePicker: _p.r(17)
            });
        }
    };

    //src/base/jhtmls.js
    /**
     * jhtmls模板引擎
     */
    _p[3] = {
        value: function() {
            /* global jhtmls: true */
            return jhtmls;
        }
    };

    //src/base/jquery.js
    /**
     * jquery模块封装
     */
    _p[4] = {
        value: function(require) {
            return window.jQuery;
        }
    };

    //src/base/kit/class.js
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
    _p[5] = {
        value: function(require, exports) {
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
                var KityClass = eval("(function " + classname + "( __inherit__flag ) {" + "if( __inherit__flag != KITY_INHERIT_FLAG ) {" + "KityClass.__KityConstructor.apply(this, arguments);" + "}" + "this.__KityClassName = KityClass.__KityClassName;" + "})||0");
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
        }
    };

    //src/base/kit/common.js
    /**
     * 通用工具包
     */
    _p[6] = {
        value: function(require) {
            var $ = _p.r(4), __marker = "__fui__marker__" + +new Date();
            return {
                isElement: function(target) {
                    return target.nodeType === 1;
                },
                getMarker: function() {
                    return __marker;
                },
                getRect: function(node) {
                    var rect = node.getBoundingClientRect();
                    return {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right
                    };
                },
                getBound: function(node) {
                    var w = 0, h = 0;
                    if (node.tagName.toLowerCase() === "body") {
                        h = $(this.getView(node));
                        w = h.width();
                        h = h.height();
                        return {
                            top: 0,
                            left: 0,
                            bottom: h,
                            right: w,
                            width: w,
                            height: h
                        };
                    } else {
                        return this.getRect(node);
                    }
                },
                getView: function(node) {
                    return node.ownerDocument.defaultView || node.ownerDocument.parentWindow;
                }
            };
        }
    };

    //src/base/kit/compile.js
    /**
     * 模板编译器
     */
    _p[7] = {
        value: function(require) {
            var jhtmls = _p.r(3), $ = _p.r(4);
            var Helper = {
                forEach: function(arras, cb) {
                    $.each(arras, function(i, item) {
                        cb.call(null, i, item);
                    });
                }
            };
            return {
                compile: function(tpl, data) {
                    tpl = $.trim(tpl);
                    if (tpl.length === 0) {
                        return "";
                    }
                    return jhtmls.render(tpl, data, Helper);
                }
            };
        }
    };

    //src/base/kit/draggable.js
    /**
     * Draggable Lib
     */
    _p[8] = {
        value: function(require, exports) {
            var $ = _p.r(4), common = _p.r(6), DEFAULT_OPTIONS = {
                handler: null,
                target: null,
                axis: "all",
                range: null
            };
            function Draggable(options) {
                this.__options = $.extend({}, DEFAULT_OPTIONS, options);
                this.__started = false;
                this.__point = {
                    x: 0,
                    y: 0
                };
                this.__location = {
                    x: 0,
                    y: 0
                };
                this.__range = {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                };
            }
            $.extend(Draggable.prototype, {
                bind: function(target) {
                    if (target) {
                        this.__options.target = target;
                    }
                    if (!this.__options.target) {
                        throw new Error("target unset");
                    }
                    this.__target = this.__options.target;
                    this.__handler = this.__options.handler;
                    this.__rangeNode = this.__options.range;
                    this.__initOptions();
                    this.__initEnv();
                    this.__initEvent();
                },
                __initEvent: function() {
                    var handler = this.__handler, _self = this;
                    $(handler).on("mousedown", function(e) {
                        if (e.which !== 1) {
                            return;
                        }
                        var location = common.getRect(handler);
                        e.preventDefault();
                        _self.__started = true;
                        _self.__point = {
                            x: e.clientX,
                            y: e.clientY
                        };
                        _self.__location = {
                            x: location.left,
                            y: location.top
                        };
                        _self.__range = _self.__getRange();
                    });
                    $(handler.ownerDocument).on("mousemove", function(e) {
                        if (!_self.__started) {
                            return;
                        }
                        var x = e.clientX, y = e.clientY;
                        if (_self.__allowAxisX) {
                            _self.__xMove(x);
                        }
                        if (_self.__allowAxisY) {
                            _self.__yMove(y);
                        }
                    }).on("mouseup", function(e) {
                        _self.__started = false;
                    });
                },
                __xMove: function(x) {
                    var diff = x - this.__point.x;
                    diff = this.__location.x + diff;
                    if (diff < this.__range.left) {
                        diff = this.__range.left;
                    } else if (diff > this.__range.right) {
                        diff = this.__range.right;
                    }
                    this.__target.style.left = diff + "px";
                },
                __yMove: function(y) {
                    var diff = y - this.__point.y;
                    diff = this.__location.y + diff;
                    if (diff < this.__range.top) {
                        diff = this.__range.top;
                    } else if (diff > this.__range.bottom) {
                        diff = this.__range.bottom;
                    }
                    this.__target.style.top = diff + "px";
                },
                __initEnv: function() {
                    var $handler = $(this.__handler);
                    $handler.css("cursor", "move");
                },
                __initOptions: function() {
                    if (!this.__handler) {
                        this.__handler = this.__target;
                    }
                    if (!this.__rangeNode) {
                        this.__rangeNode = this.__options.target.ownerDocument.body;
                    }
                    this.__allowAxisX = this.__options.axis !== "y";
                    this.__allowAxisY = this.__options.axis !== "x";
                },
                __getRange: function() {
                    var range = this.__rangeNode, targetRect = common.getRect(this.__target);
                    if (range.tagName.toLowerCase() === "body") {
                        range = $(this.__rangeNode.ownerDocument);
                        range = {
                            top: 0,
                            left: 0,
                            bottom: range.height(),
                            right: range.width()
                        };
                    } else {
                        range = common.getRect(range);
                    }
                    return {
                        top: range.top,
                        left: range.left,
                        bottom: range.bottom - targetRect.height,
                        right: range.right - targetRect.width
                    };
                }
            });
            return function(options) {
                return new Draggable(options);
            };
        }
    };

    //src/base/kit/extend.js
    /**
     * 弥补jQuery的extend在克隆对象和数组时存在的问题
     */
    _p[9] = {
        value: function(require) {
            var $ = _p.r(4);
            function extend(target) {
                var isPlainObject = false, isArray = false, sourceObj = null;
                if (arguments.length === 1) {
                    return copy(target);
                }
                $.each([].slice.call(arguments, 1), function(i, source) {
                    for (var key in source) {
                        sourceObj = source[key];
                        if (!source.hasOwnProperty(key)) {
                            continue;
                        }
                        isPlainObject = $.isPlainObject(sourceObj);
                        isArray = $.isArray(sourceObj);
                        if (!isPlainObject && !isArray) {
                            target[key] = source[key];
                        } else if (isPlainObject) {
                            if (!$.isPlainObject(target[key])) {
                                target[key] = {};
                            }
                            target[key] = extend(target[key], sourceObj);
                        } else if (isArray) {
                            target[key] = extend(sourceObj);
                        }
                    }
                });
                return target;
            }
            function copy(target) {
                var tmp = null;
                if ($.isPlainObject(target)) {
                    return extend({}, target);
                } else if ($.isArray(target)) {
                    tmp = [];
                    $.each(target, function(index, item) {
                        if ($.isPlainObject(item) || $.isArray(item)) {
                            tmp.push(copy(item));
                        } else {
                            tmp.push(item);
                        }
                    });
                    return tmp;
                } else {
                    return target;
                }
            }
            return extend;
        }
    };

    //src/base/kit/widget.js
    /**
     * 构件相关工具方法
     */
    _p[10] = {
        value: function(require) {
            return {
                isContainer: function(widget) {
                    return widget.__widgetType === "container";
                }
            };
        }
    };

    //src/base/ns.js
    /**
     * FUI名称空间
     */
    _p[11] = {
        value: function() {
            // 容纳所有构件的实例池
            var WIDGET_POOL = {};
            return {
                widgets: WIDGET_POOL,
                /**
             * 暴露命名空间本身
             * @private
             */
                __export: function() {
                    window.FUI = this;
                },
                ___register: function(widgetName, widget) {
                    if (typeof widgetName === "string") {
                        this[widgetName] = widget;
                    } else {
                        widget = widgetName;
                        for (var key in widget) {
                            if (widget.hasOwnProperty(key)) {
                                this[key] = widget[key];
                            }
                        }
                    }
                },
                __registerInstance: function(widget) {
                    WIDGET_POOL[widget.getId()] = widget;
                }
            };
        }
    };

    //src/base/sysconf.js
    /**
     * UI系统配置
     */
    _p[12] = {
        value: function() {
            return {
                classPrefix: "fui-",
                layout: {
                    TOP: "top",
                    LEFT: "left",
                    BOTTOM: "bottom",
                    RIGHT: "right",
                    CENTER: "center",
                    MIDDLE: "middle",
                    // 内部定位
                    LEFT_TOP: "left-top",
                    RIGHT_TOP: "right-top",
                    LEFT_BOTTOM: "left-bottom",
                    RIGHT_BOTTOM: "right-bottom"
                },
                control: {
                    input: 1,
                    textarea: 1,
                    button: 1,
                    select: 1,
                    option: 1,
                    object: 1,
                    embed: 1
                }
            };
        }
    };

    //src/base/utils.js
    /**
     * utils类包， 提供常用操作的封装，补充jQuery的不足
     */
    _p[13] = {
        value: function(require) {
            var $ = _p.r(4), Utils = {
                Tpl: _p.r(7),
                Widget: _p.r(10),
                createDraggable: _p.r(8)
            };
            return $.extend(Utils, _p.r(6), _p.r(5));
        }
    };

    //src/ext/word/tpl/t-picker.js
    _p[14] = {
        value: function() {
            return '<div unselectable="on" class="fui-t-picker"></div>\n';
        }
    };

    //src/ext/word/tpl/table-picker.js
    _p[15] = {
        value: function() {
            return '<div unselectable="on" class="fui-table-picker"></div>\n';
        }
    };

    //src/ext/word/widget/t-picker.js
    /**
     * TPicker -- table 选择器
     */
    _p[16] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(14);
            return _p.r(13).createClass("TPicker", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        // 10行 10列
                        row: 10,
                        col: 10
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "TPicker";
                    this.__tpl = tpl;
                    // 背板
                    this.__backplane = null;
                },
                __render: function() {
                    this.callBase();
                    this.__backplane = this.__createBackplane();
                    this.__element.appendChild(this.__backplane);
                },
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    $(this.__backplane).delegate("td", "mousemove click", function(e) {
                        var info = e.target.getAttribute("data-index").split(",");
                        info = {
                            row: parseInt(info[0], 10),
                            col: parseInt(info[1], 10)
                        };
                        if (e.type === "click") {
                            _self.__select(info.row, info.col);
                        } else {
                            _self.__update(info.row, info.col);
                        }
                    });
                },
                __select: function(row, col) {
                    this.trigger("pickerselect", {
                        row: row,
                        col: col
                    });
                },
                __update: function(row, col) {
                    var tr = null, rowCount = this.__options.row, colCount = this.__options.col, className = CONF.classPrefix + "table-picker-hoverin";
                    for (var i = 0; i < rowCount; i++) {
                        tr = this.__backplane.rows[i];
                        for (var j = 0; j < colCount; j++) {
                            if (i <= row && j <= col) {
                                tr.cells[j].className = className;
                            } else {
                                tr.cells[j].className = "";
                            }
                        }
                    }
                    this.trigger("pickerhover", {
                        row: row,
                        col: col
                    });
                },
                __createBackplane: function() {
                    var tpl = [], tmp = null;
                    for (var i = 0, len = this.__options.row; i < len; i++) {
                        tmp = [];
                        for (var j = 0, jlen = this.__options.col; j < jlen; j++) {
                            tmp.push('<td data-index="' + i + "," + j + '"></td>');
                        }
                        tpl.push("<tr>" + tmp.join("") + "</tr>");
                    }
                    tpl = $("<table><tbody>" + tpl.join("") + "</tbody></table>");
                    tpl.addClass(CONF.classPrefix + "t-picker-table");
                    return tpl[0];
                }
            });
        }
    };

    //src/ext/word/widget/table-picker.js
    /**
     * Table选择器构件
     */
    _p[17] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(15), Label = _p.r(48), TPicker = _p.r(16), Button = _p.r(37), PPanel = _p.r(53), Mask = _p.r(49);
            return _p.r(13).createClass("TablePicker", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        button: null,
                        row: 10,
                        col: 10
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                open: function() {
                    this.__panelWidget.show();
                    this.__maskWidget.show();
                },
                close: function() {
                    this.__panelWidget.hide();
                    this.__maskWidget.hide();
                },
                // Overload
                appendTo: function(container) {
                    container.appendChild(this.__buttonWidget.getElement());
                },
                getButton: function() {
                    return this.__buttonWidget;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "TablePicker";
                    this.__tpl = tpl;
                    this.__pickerWidget = null;
                    this.__labelWidget = null;
                    this.__buttonWidget = null;
                    this.__panelWidget = null;
                    this.__maskWidget = null;
                },
                __render: function() {
                    this.callBase();
                    this.__pickerWidget = new TPicker(this.__options);
                    this.__labelWidget = new Label({
                        text: "插入表格"
                    });
                    this.__buttonWidget = new Button(this.__options.button);
                    this.__panelWidget = new PPanel({
                        className: CONF.classPrefix + "table-picker-panel",
                        column: true,
                        resize: "none"
                    });
                    this.__maskWidget = new Mask();
                    this.__panelWidget.appendWidget(this.__labelWidget);
                    this.__panelWidget.appendWidget(this.__pickerWidget);
                    this.__panelWidget.positionTo(this.__buttonWidget);
                },
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    this.__buttonWidget.on("btnclick", function(e) {
                        _self.open();
                    });
                    this.__maskWidget.on("maskclick", function(e) {
                        _self.close();
                    });
                    this.__pickerWidget.on("pickerhover", function(e, info) {
                        var row = info.row + 1, col = info.col + 1;
                        _self.__labelWidget.setText(row + "x" + col + " 表格");
                    }).on("pickerselect", function(e, info) {
                        var row = info.row + 1, col = info.col + 1;
                        _self.close();
                        _self.trigger("pickerselect", {
                            row: row,
                            col: col
                        });
                    });
                },
                __createBackplane: function() {
                    var tpl = [], tmp = null;
                    for (var i = 0, len = this.__options.row; i < len; i++) {
                        tmp = [];
                        for (var j = 0, jlen = this.__options.col; j < jlen; j++) {
                            tmp.push('<td data-index="' + i + "," + j + '"></td>');
                        }
                        tpl.push("<tr>" + tmp.join("") + "</tr>");
                    }
                    tpl = $("<table><tbody>" + tpl.join("") + "</tbody></table>");
                    tpl.addClass(CONF.classPrefix + "t-picker-table");
                    return tpl[0];
                }
            });
        }
    };

    //src/tpl/button-menu.js
    _p[18] = {
        value: function() {
            return '<div unselectable="on" class="fui-button-menu"></div>\n';
        }
    };

    //src/tpl/button.js
    _p[19] = {
        value: function() {
            return '<div unselectable="on" class="fui-button"></div>\n';
        }
    };

    //src/tpl/colorpicker.js
    _p[20] = {
        value: function() {
            return '<div unselectable="on" class="fui-colorpicker-container">\n' + '<div unselectable="on" class="fui-colorpicker-toolbar">\n' + '<div unselectable="on" class="fui-colorpicker-preview"></div>\n' + '<div unselectable="on" class="fui-colorpicker-clear">$clearText</div>\n' + "</div>\n" + '<div unselectable="on" class="fui-colorpicker-title">$commonText</div>\n' + '<div unselectable="on" class="fui-colorpicker-commoncolor">\n' + "helper.forEach( commonColor, function ( index, colors ) {\n" + '<div unselectable="on" class="fui-colorpicker-colors fui-colorpicker-colors-line$index">\n' + "helper.forEach( colors, function( i, color ) {\n" + '<span unselectable="on" class="fui-colorpicker-item" style="background-color: $color; border-color: #{color.toLowerCase() == \'#ffffff\' ? \'#eeeeee\': color};" data-color="$color"></span>\n' + "});\n" + "</div>\n" + "} );\n" + "</div>\n" + '<div unselectable="on" class="fui-colorpicker-title">$standardText</div>\n' + '<div unselectable="on" class="fui-colorpicker-standardcolor fui-colorpicker-colors">\n' + "helper.forEach( standardColor, function ( i, color ) {\n" + '<span unselectable="on" class="fui-colorpicker-item" style="background-color: $color; border-color: $color;" data-color="$color"></span>\n' + "} );\n" + "</div>\n" + "</div>\n";
        }
    };

    //src/tpl/dialog.js
    _p[21] = {
        value: function() {
            return '<div unselectable="on" class="fui-dialog-wrap">\n' + '<div unselectable="on" class="fui-dialog-head">\n' + '<h1 unselectable="on" class="fui-dialog-caption">$caption</h1>\n' + "</div>\n" + '<div unselectable="on" class="fui-dialog-body"></div>\n' + '<div unselectable="on" class="fui-dialog-foot"></div>\n' + "</div>\n";
        }
    };

    //src/tpl/drop-panel.js
    _p[22] = {
        value: function() {
            return "<div unselectable=\"on\" class=\"fui-drop-panel\"  #{ text ? 'title=\"' + m.text + '\"' : '' }></div>\n";
        }
    };

    //src/tpl/icon.js
    _p[23] = {
        value: function() {
            return '<div unselectable="on" class="fui-icon" >\n' + "if ( this.img ) {\n" + '<img unselectable="on" src="#{this.img}" >\n' + "}\n" + "</div>\n";
        }
    };

    //src/tpl/input-button.js
    _p[24] = {
        value: function() {
            return '<div unselectable="on" class="fui-input-button"></div>\n';
        }
    };

    //src/tpl/input-menu.js
    _p[25] = {
        value: function() {
            return '<div unselectable="on" class="fui-input-menu"></div>\n';
        }
    };

    //src/tpl/input.js
    _p[26] = {
        value: function() {
            return '<input unselectable="on" class="fui-input"  autocomplete="off" !#{ value ? \'value="\' + value + \'"\' : \'\'}>\n';
        }
    };

    //src/tpl/item.js
    _p[27] = {
        value: function() {
            return "<div unselectable=\"on\" class=\"fui-item!#{ selected ? ' fui-item-selected': '' }\" ></div>\n";
        }
    };

    //src/tpl/label.js
    _p[28] = {
        value: function() {
            return '<div unselectable="on" class="fui-label">$text</div>\n';
        }
    };

    //src/tpl/mask.js
    _p[29] = {
        value: function() {
            return '<div unselectable="on" class="fui-mask" style="background-color: $bgcolor; opacity: $opacity;"></div>\n';
        }
    };

    //src/tpl/panel.js
    _p[30] = {
        value: function() {
            return '<div unselectable="on" class="fui-panel"></div>\n';
        }
    };

    //src/tpl/separator.js
    _p[31] = {
        value: function() {
            return '<div unselectable="on" class="fui-separator"></div>\n';
        }
    };

    //src/tpl/spin-button.js
    _p[32] = {
        value: function() {
            return '<div unselectable="on" class="fui-spin-button"></div>\n';
        }
    };

    //src/tpl/tabs.js
    _p[33] = {
        value: function() {
            return '<div unselectable="on" class="fui-tabs">\n' + '<div unselectable="on" class="fui-tabs-button-wrap"></div>\n' + '<div unselectable="on" class="fui-tabs-panel-wrap"></div>\n' + "</div>\n";
        }
    };

    //src/widget/button-menu.js
    /**
     * Button对象
     * 通用按钮构件
     */
    _p[34] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(18), Button = _p.r(37), Menu = _p.r(50), Mask = _p.r(49), LAYOUT = CONF.layout;
            return _p.r(13).createClass("ButtonMenu", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        // item选项
                        menu: null,
                        mask: null,
                        buttons: [],
                        selected: -1,
                        layout: LAYOUT.RIGHT
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                open: function() {
                    this.__openState = true;
                    this.__maskWidget.show();
                    this.__menuWidget.show();
                    this.addClass(CONF.classPrefix + "button-active");
                },
                close: function() {
                    this.__openState = false;
                    this.__maskWidget.hide();
                    this.__menuWidget.hide();
                    this.removeClass(CONF.classPrefix + "button-active");
                },
                isOpen: function() {
                    return !!this.__openState;
                },
                getSelected: function() {
                    return this.__menuWidget.getSelected();
                },
                getSelectedItem: function() {
                    return this.__menuWidget.getSelectedItem();
                },
                getValue: function() {
                    return this.getSelectedItem().getValue();
                },
                __render: function() {
                    this.callBase();
                    this.__initButtons();
                    this.__menuWidget = new Menu(this.__options.menu);
                    this.__maskWidget = new Mask(this.__options.mask);
                    this.__menuWidget.positionTo(this.__element);
                    this.__menuWidget.appendTo(this.__element.ownerDocument.body);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "ButtonMenu";
                    this.__tpl = tpl;
                    this.__buttonWidgets = null;
                    this.__menuWidget = null;
                    this.__maskWidget = null;
                    this.__openState = false;
                    if (this.__options.selected !== -1) {
                        this.__options.menu.selected = this.__options.selected;
                    }
                },
                __initButtons: function() {
                    var buttons = [], ele = this.__element, btn = null, lastIndex = this.__options.buttons.length - 1;
                    if (this.__options.layout === LAYOUT.TOP || this.__options.layout === LAYOUT.LEFT) {
                        btn = new Button(this.__options.buttons[lastIndex]);
                        btn.appendTo(ele);
                    } else {
                        lastIndex = -1;
                    }
                    $.each(this.__options.buttons, function(index, options) {
                        if (lastIndex !== index) {
                            var button = new Button(options);
                            button.appendTo(ele);
                            buttons.push(button);
                        } else {
                            buttons.push(btn);
                        }
                    });
                    this.addClass(CONF.classPrefix + "layout-" + this.__options.layout);
                    buttons[buttons.length - 1].addClass(CONF.classPrefix + "open-btn");
                    this.__buttonWidgets = buttons;
                },
                __initEvent: function() {
                    var lastBtn = this.__buttonWidgets[this.__buttonWidgets.length - 1], _self = this;
                    this.callBase();
                    lastBtn.on("click", function(e) {
                        _self.open();
                    });
                    this.__maskWidget.on("maskclick", function() {
                        _self.close();
                    });
                    this.__menuWidget.on("select", function(e, info) {
                        e.stopPropagation();
                        _self.close();
                        _self.trigger("select", info);
                    }).on("change", function(e, info) {
                        _self.trigger("change", info);
                    });
                    this.on("btnclick", function(e) {
                        e.stopPropagation();
                        var btnIndex = $.inArray(e.widget, this.__buttonWidgets);
                        if (btnIndex > -1 && btnIndex < this.__buttonWidgets.length - 1) {
                            this.trigger("buttonclick", {
                                button: this.__buttonWidgets[btnIndex]
                            });
                        }
                    });
                }
            });
        }
    };

    //src/widget/button-set-menu.js
    /**
     * InputMenu构件
     * 可接受输入的下拉菜单构件
     */
    _p[35] = {
        value: function(require) {
            var $ = _p.r(4), tpl = _p.r(25), InputButton = _p.r(43), Menu = _p.r(50), Mask = _p.r(49), Utils = _p.r(13);
            return _p.r(13).createClass("InputMenu", {
                base: _p.r(58),
                constructor: function(options) {
                    var marker = Utils.getMarker();
                    this.callBase(marker);
                    var defaultOptions = {
                        input: null,
                        menu: null,
                        mask: null
                    };
                    this.__extendOptions(defaultOptions, options);
                    this.widgetName = "InputMenu";
                    this.__tpl = tpl;
                    // 最后输入时间
                    this.__lastTime = 0;
                    // 最后选中的记录
                    this.__lastSelect = null;
                    this.__inputWidget = null;
                    this.__menuWidget = null;
                    this.__maskWidget = null;
                    // menu状态， 记录是否已经append到dom树上
                    this.__menuState = false;
                    if (options !== marker) {
                        this.__render();
                    }
                },
                select: function(index) {
                    this.__menuWidget.select(index);
                },
                setValue: function(value) {
                    this.__inputWidget.setValue(value);
                    return this;
                },
                getValue: function() {
                    return this.__inputWidget.getValue();
                },
                __render: function() {
                    if (this.__rendered) {
                        return this;
                    }
                    this.__inputWidget = new InputButton(this.__options.input);
                    this.__menuWidget = new Menu(this.__options.menu);
                    this.__maskWidget = new Mask(this.__options.mask);
                    this.callBase();
                    this.__inputWidget.appendTo(this.__element);
                    this.__menuWidget.positionTo(this.__inputWidget);
                    this.__initInputMenuEvent();
                },
                open: function() {
                    this.__maskWidget.show();
                    this.__menuWidget.show();
                },
                close: function() {
                    this.__maskWidget.hide();
                    this.__menuWidget.hide();
                },
                __initInputMenuEvent: function() {
                    var _self = this;
                    this.on("buttonclick", function() {
                        if (!this.__menuState) {
                            this.__appendMenu();
                            this.__menuState = true;
                        }
                        this.__inputWidget.unfocus();
                        this.open();
                    });
                    this.on("keypress", function(e) {
                        this.__lastTime = new Date();
                    });
                    this.on("keyup", function(e) {
                        if (e.keyCode !== 8 && e.keyCode !== 13 && new Date() - this.__lastTime < 500) {
                            this.__update();
                        }
                    });
                    this.on("inputcomplete", function() {
                        this.__inputWidget.selectRange(99999999);
                        this.__inputComplete();
                    });
                    this.__menuWidget.on("select", function(e, info) {
                        e.stopPropagation();
                        _self.setValue(info.value);
                        _self.trigger("select", info);
                        _self.close();
                    });
                    this.__menuWidget.on("change", function(e, info) {
                        e.stopPropagation();
                        _self.trigger("change", info);
                    });
                    // 阻止input自身的select和change事件
                    this.__inputWidget.on("select change", function(e) {
                        e.stopPropagation();
                    });
                    // mask 点击关闭
                    this.__maskWidget.on("maskclick", function() {
                        _self.close();
                    });
                    // 记录最后选中的数据
                    this.on("select", function(e, info) {
                        this.__lastSelect = info;
                    });
                },
                // 更新输入框内容
                __update: function() {
                    var inputValue = this.getValue(), lowerCaseValue = inputValue.toLowerCase(), values = this.__getItemValues(), targetValue = null;
                    if (!inputValue) {
                        return;
                    }
                    $.each(values, function(i, val) {
                        if (val.toLowerCase().indexOf(lowerCaseValue) === 0) {
                            targetValue = val;
                            return false;
                        }
                    });
                    if (targetValue) {
                        this.__inputWidget.setValue(targetValue);
                        this.__inputWidget.selectRange(inputValue.length);
                    }
                },
                // 获取所有item的值列表
                __getItemValues: function() {
                    var vals = [];
                    $.each(this.__menuWidget.getWidgets(), function(index, item) {
                        vals.push(item.getValue());
                    });
                    return vals;
                },
                // 用户输入完成
                __inputComplete: function() {
                    var values = this.__getItemValues(), targetIndex = -1, inputValue = this.getValue(), lastSelect = this.__lastSelect;
                    $.each(values, function(i, val) {
                        if (val === inputValue) {
                            targetIndex = i;
                            return false;
                        }
                    });
                    this.trigger("select", {
                        index: targetIndex,
                        value: inputValue
                    });
                    if (!lastSelect || lastSelect.value !== inputValue) {
                        this.trigger("change", {
                            from: lastSelect || {
                                index: -1,
                                value: null
                            },
                            to: {
                                index: targetIndex,
                                value: inputValue
                            }
                        });
                    }
                },
                __appendMenu: function() {
                    this.__menuWidget.appendTo(this.__inputWidget.getElement().ownerDocument.body);
                }
            });
        }
    };

    //src/widget/button-set.js
    /**
     * Buttonset对象
     * 通用按钮构件
     */
    _p[36] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), ToggleButton = _p.r(57);
            return _p.r(13).createClass("Buttonset", {
                base: _p.r(51),
                constructor: function(options) {
                    var defaultOptions = {
                        // 初始选中项, -1表示不选中任何项
                        selected: -1
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getButtons: function() {
                    return this.getWidgets();
                },
                getButton: function(index) {
                    return this.getWidgets()[index] || null;
                },
                getValue: function() {
                    if (this.__currentIndex > -1) {
                        return this.__widgets[this.__currentIndex].getValue();
                    }
                    return null;
                },
                getSelectedIndex: function() {
                    return this.__currentIndex;
                },
                appendButton: function() {
                    return this.appendWidget.apply(this, arguments);
                },
                insertButton: function() {
                    return this.insertWidget.apply(this, arguments);
                },
                select: function(indexOrWidget) {
                    if (this.__options.disabled) {
                        return this;
                    }
                    if (indexOrWidget instanceof ToggleButton) {
                        indexOrWidget = $.inArray(indexOrWidget, this.__widgets);
                    }
                    if (indexOrWidget < 0) {
                        return this.clearSelect();
                    }
                    indexOrWidget = this.__widgets[indexOrWidget];
                    this.__pressButton(indexOrWidget);
                    return this;
                },
                selectByValue: function(value) {
                    var values = this.__widgets.map(function(button) {
                        return button.getValue();
                    });
                    return this.select(values.indexOf(value));
                },
                clearSelect: function() {
                    this.__pressButton(null);
                    return this;
                },
                removeButton: function() {
                    return this.removeWidget.apply(this, arguments);
                },
                insertWidget: function(index, widget) {
                    var returnValue = this.callBase(index, widget);
                    if (returnValue === null) {
                        return returnValue;
                    }
                    if (index <= this.__currentIndex) {
                        this.__currentIndex++;
                    }
                    if (index <= this.__prevIndex) {
                        this.__prevIndex++;
                    }
                    return returnValue;
                },
                removeWidget: function(widget) {
                    var index = widget;
                    if (typeof index !== "number") {
                        index = this.indexOf(widget);
                    }
                    widget = this.callBase(widget);
                    if (index === this.__currentIndex) {
                        this.__currentIndex = -1;
                    } else if (index < this.__currentIndex) {
                        this.__currentIndex--;
                    }
                    if (index === this.__prevIndex) {
                        this.__prevIndex = -1;
                    } else if (index < this.__prevIndex) {
                        this.__prevIndex--;
                    }
                    return widget;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Buttonset";
                    // 当前选中项
                    this.__currentIndex = this.__options.selected;
                    // 前一次选中项
                    this.__prevIndex = -1;
                },
                __render: function() {
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "buttonset");
                    this.__initButtons();
                    return this;
                },
                __initButtons: function() {
                    var _self = this, buttonWidget = null;
                    $.each(this.__options.buttons, function(index, buttonOption) {
                        buttonWidget = new ToggleButton($.extend({}, buttonOption, {
                            pressed: index === _self.__options.selected,
                            preventDefault: true
                        }));
                        // 切换
                        buttonWidget.__on("click", function(e) {
                            if (!_self.isDisabled()) {
                                _self.__pressButton(this);
                            }
                        });
                        buttonWidget.__on("change", function(e) {
                            // 阻止buton本身的事件向上冒泡
                            e.stopPropagation();
                        });
                        _self.appendButton(buttonWidget);
                    });
                },
                /**
             * 按下指定按钮, 该方法会更新其他按钮的状态和整个button-set的状态
             * @param button
             * @private
             */
                __pressButton: function(button) {
                    this.__prevIndex = this.__currentIndex;
                    this.__currentIndex = this.indexOf(button);
                    if (this.__currentIndex === this.__prevIndex) {
                        return;
                    }
                    if (button) {
                        button.press();
                    }
                    // 弹起其他按钮
                    $.each(this.__widgets, function(i, otherButton) {
                        if (otherButton !== button) {
                            otherButton.bounce();
                        }
                    });
                    this.trigger("change", {
                        currentIndex: this.__currentIndex,
                        prevIndex: this.__prevIndex
                    });
                },
                __valid: function(ele) {
                    return ele instanceof ToggleButton;
                }
            });
        }
    };

    //src/widget/button.js
    /**
     * Button对象
     * 通用按钮构件
     */
    _p[37] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), buttonTpl = _p.r(19), Icon = _p.r(42), Label = _p.r(48);
            return _p.r(13).createClass("Button", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        label: null,
                        text: null,
                        icon: null,
                        // label相对icon的位置
                        layout: "right"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getLabel: function() {
                    return this.__labelWidget.getText();
                },
                setLabel: function(text) {
                    return this.__labelWidget.setText(text);
                },
                __render: function() {
                    this.callBase();
                    this.__iconWidget = new Icon(this.__options.icon);
                    this.__labelWidget = new Label(this.__options.label);
                    // layout
                    switch (this.__options.layout) {
                      case "left":
                      /* falls through */
                        case "top":
                        this.__element.appendChild(this.__labelWidget.getElement());
                        this.__element.appendChild(this.__iconWidget.getElement());
                        break;

                      case "right":
                      /* falls through */
                        case "bottom":
                      /* falls through */
                        default:
                        this.__element.appendChild(this.__iconWidget.getElement());
                        this.__element.appendChild(this.__labelWidget.getElement());
                        break;
                    }
                    $(this.__element).addClass(CONF.classPrefix + "button-layout-" + this.__options.layout);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Button";
                    this.__tpl = buttonTpl;
                    this.__iconWidget = null;
                    this.__labelWidget = null;
                    if (typeof this.__options.label !== "object") {
                        this.__options.label = {
                            text: this.__options.label
                        };
                    }
                    if (typeof this.__options.icon !== "object") {
                        this.__options.icon = {
                            img: this.__options.icon
                        };
                    }
                },
                __initEvent: function() {
                    this.callBase();
                    this.on("click", function() {
                        this.__trigger("btnclick");
                    });
                }
            });
        }
    };

    //src/widget/colorpicker.js
    /**
     * 容器类： PPanel = Positioning Panel
     */
    _p[38] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Mask = _p.r(49), tpl = _p.r(20), $ = _p.r(4);
            return Utils.createClass("ColorPicker", {
                base: _p.r(53),
                constructor: function(options) {
                    var defaultOptions = {
                        clearText: "",
                        commonText: "",
                        commonColor: [ [ "#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646" ], [ "#f2f2f2", "#808080", "#ddd8c2", "#c6d9f1", "#dbe5f1", "#f2dbdb", "#eaf1dd", "#e5dfec", "#daeef3", "#fde9d9" ], [ "#d9d9d9", "#595959", "#c4bc96", "#8db3e2", "#b8cce4", "#e5b8b7", "#d6e3bc", "#ccc0d9", "#b6dde8", "#fbd4b4" ], [ "#bfbfbf", "#404040", "#938953", "#548dd4", "#95b3d7", "#d99594", "#c2d69b", "#b2a1c7", "#92cddc", "#fabf8f" ], [ "#a6a6a6", "#262626", "#4a442a", "#17365d", "#365f91", "#943634", "#76923c", "#5f497a", "#31849b", "#e36c0a" ], [ "#7f7f7f", "#0d0d0d", "#1c1a10", "#0f243e", "#243f60", "#622423", "#4e6128", "#3f3151", "#205867", "#974706" ] ],
                        standardText: "",
                        standardColor: [ "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0" ]
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                show: function() {
                    if (!this.__inDoc) {
                        this.__inDoc = true;
                        this.appendTo(this.__element.ownerDocument.body);
                    }
                    this.__maskWidget.show();
                    this.callBase();
                    return this;
                },
                hide: function() {
                    this.callBase();
                    this.__maskWidget.hide();
                    return this;
                },
                attachTo: function($obj) {
                    var _self = this;
                    $obj.on("click", function() {
                        _self.appendTo($obj.getElement().ownerDocument.body);
                        _self.positionTo($obj);
                        _self.show();
                    });
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "ColorPicker";
                    this.__contentElement = null;
                    this.__maskWidget = null;
                    this.__inDoc = false;
                },
                __render: function() {
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "colorpicker");
                    var contentHtml = Utils.Tpl.compile(tpl, this.__options);
                    this.__contentElement.appendChild($(contentHtml)[0]);
                    this.__previewElement = $(this.__contentElement).find("." + CONF.classPrefix + "colorpicker-preview");
                    this.__clearElement = $(this.__contentElement).find("." + CONF.classPrefix + "colorpicker-clear");
                    this.__maskWidget = new Mask(this.__options.mask);
                },
                // 初始化点击事件
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    this.on("click", function(e) {
                        var color, $target = $(e.target);
                        if ($target.hasClass(CONF.classPrefix + "colorpicker-item")) {
                            color = $target.attr("data-color");
                            _self.trigger("selectcolor", color);
                            _self.hide();
                        } else if ($target.hasClass(CONF.classPrefix + "colorpicker-clear")) {
                            _self.trigger("selectcolor", "");
                            _self.hide();
                        }
                    });
                    this.on("mouseover", function(e) {
                        var color, $target = $(e.target);
                        if ($target.hasClass(CONF.classPrefix + "colorpicker-item")) {
                            color = $target.attr("data-color");
                            $(_self.__element).find("." + CONF.classPrefix + "colorpicker-preview").css({
                                "background-color": color,
                                "border-color": color
                            });
                        }
                    });
                    this.__maskWidget.on("click", function() {
                        _self.hide();
                    });
                }
            });
        }
    };

    //src/widget/container.js
    /**
     * Container类， 所有容器类的父类`
     * @abstract
     */
    _p[39] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Widget = _p.r(58), Creator = _p.r(0), $ = _p.r(4);
            return Utils.createClass("Container", {
                base: Widget,
                constructor: function(options) {
                    var defaultOptions = {
                        column: false,
                        widgets: null
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                indexOf: function(widget) {
                    return $.inArray(widget, this.__widgets);
                },
                disable: function() {
                    this.callBase();
                    $.each(this.__widgets, function(index, widget) {
                        widget.disable();
                    });
                },
                enable: function() {
                    this.callBase();
                    $.each(this.__widgets, function(index, widget) {
                        widget.enable();
                    });
                },
                getWidgets: function() {
                    return this.__widgets;
                },
                getWidget: function(index) {
                    return this.__widgets[index] || null;
                },
                getWidgetByValue: function(value) {
                    var widget = null;
                    $.each(this.__widgets, function(i, wgt) {
                        if (wgt.getValue() === value) {
                            widget = wgt;
                            return false;
                        }
                    });
                    return widget;
                },
                appendWidget: function(widget) {
                    if (!this.__valid(widget)) {
                        return null;
                    }
                    if (this.__options.disabled) {
                        widget.disable();
                    }
                    this.__widgets.push(widget);
                    widget.appendTo(this.__contentElement);
                    if (this.__options.column) {
                        this.__contentElement.appendChild($('<span class="fui-column"></span>')[0]);
                        $(widget.getElement()).addClass(CONF.classPrefix + "panel-column-widget");
                    }
                    return widget;
                },
                appendWidgets: function(widgetArray) {
                    var _self = this, widgets = widgetArray;
                    if (!$.isArray(widgetArray)) {
                        widgets = arguments;
                    }
                    $.each(widgets, function(i, widget) {
                        _self.appendWidget(widget);
                    });
                    return this;
                },
                insertWidget: function(index, widget) {
                    var oldElement = null;
                    if (this.__widgets.length === 0) {
                        return this.appendWidget(widget);
                    }
                    if (!this.__valid(widget)) {
                        return null;
                    }
                    if (this.__options.disabled) {
                        widget.disable();
                    }
                    oldElement = this.__widgets[index];
                    this.__widgets.splice(index, 0, widget);
                    this.__contentElement.insertBefore(widget.getElement(), oldElement.getElement());
                    if (this.__options.column) {
                        this.__contentElement.insertBefore($('<span class="fui-column"></span>')[0], oldElement.getElement());
                        $(widget.getElement()).addClass(CONF.classPrefix + "panel-column-widget");
                    }
                    return widget;
                },
                insertWidgets: function(index, widgetArray) {
                    var _self = this, widgets = widgetArray;
                    if (!$.isArray(widgetArray)) {
                        widgets = [].slice.call(arguments, 1);
                    }
                    $.each(widgets, function(i, widget) {
                        _self.insertWidget(index, widget);
                        index++;
                    });
                    return this;
                },
                getContentElement: function() {
                    return this.__contentElement;
                },
                removeWidget: function(widget) {
                    if (typeof widget === "number") {
                        widget = this.__widgets.splice(widget, 1);
                    } else {
                        this.__widgets.splice(this.indexOf(widget), 1);
                    }
                    this.__contentElement.removeChild(widget.getElement());
                    $(widget.getElement()).removeClass(CONF.classPrefix + "panel-column-widget");
                    return widget;
                },
                __initOptions: function() {
                    this.widgetName = "Container";
                    this.__widgets = [];
                    this.__contentElement = null;
                },
                __render: function() {
                    this.callBase();
                    this.__contentElement = this.__element;
                    $(this.__element).addClass(CONF.classPrefix + "container");
                    if (this.__options.column) {
                        $(this.__element).addClass(CONF.classPrefix + "container-column");
                    }
                    return this;
                },
                // Override
                __appendChild: function(childWidget) {
                    return this.appendWidget(childWidget);
                },
                __initWidgets: function() {
                    if (!this.__options.widgets) {
                        return;
                    }
                    var widgets = Creator.parse(this.__options.widgets), _self = this;
                    if (!$.isArray(widgets)) {
                        widgets = [ widgets ];
                    }
                    $.each(widgets, function(i, widget) {
                        _self.appendWidget(widget);
                    });
                },
                /**
             * 验证元素给定元素是否可以插入当前容器中
             * @param ele 需要验证的元素
             * @returns {boolean} 允许插入返回true, 否则返回false
             * @private
             */
                __valid: function(ele) {
                    return ele instanceof Widget;
                }
            });
        }
    };

    //src/widget/dialog.js
    /**
     * 容器类： PPanel = Positioning Panel
     */
    _p[40] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Widget = _p.r(58), Mask = _p.r(49), tpl = _p.r(21), Button = _p.r(37), LAYOUT = CONF.layout, $ = _p.r(4), ACTION = {
                CANCEL: "cancel",
                OK: "ok"
            };
            return Utils.createClass("Dialog", {
                base: _p.r(53),
                constructor: function(options) {
                    var defaultOptions = {
                        layout: LAYOUT.CENTER,
                        caption: null,
                        resize: "height",
                        draggable: true,
                        // 是否包含close button
                        closeButton: true,
                        mask: {
                            color: "#000",
                            opacity: .2
                        },
                        // 底部按钮
                        buttons: [ {
                            className: CONF.classPrefix + "xdialog-ok-btn",
                            action: "ok",
                            label: "确定"
                        }, {
                            className: CONF.classPrefix + "xdialog-cancel-btn",
                            action: "cancel",
                            label: "取消"
                        } ]
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                open: function() {
                    this.__fire("open", function() {
                        this.show();
                    });
                    return this;
                },
                close: function() {
                    this.__fire("close", function() {
                        this.hide();
                    });
                    return this;
                },
                getButtons: function() {
                    return this.__buttons;
                },
                getButton: function(index) {
                    return this.__buttons[index];
                },
                appendTo: function(container) {
                    this.callBase(container);
                    this.__maskWidget.appendTo(container);
                    this.__inDoc = true;
                    return this;
                },
                show: function() {
                    if (!this.__target) {
                        this.__target = this.__element.ownerDocument.body;
                    }
                    if (!this.__inDoc) {
                        this.appendTo(this.__element.ownerDocument.body);
                    }
                    this.__maskWidget.show();
                    this.callBase();
                    this.__openState = true;
                    return this;
                },
                hide: function() {
                    this.callBase();
                    this.__maskWidget.hide();
                    this.__openState = false;
                    return this;
                },
                toggle: function() {
                    this.isOpen() ? this.close() : this.open();
                    return this;
                },
                isOpen: function() {
                    return this.__openState;
                },
                getHeadElement: function() {
                    return this.__headElement;
                },
                getBodyElement: function() {
                    return this.getContentElement();
                },
                getFootElement: function() {
                    return this.__footElement;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Dialog";
                    this.__target = this.__options.target;
                    this.__layout = this.__options.layout;
                    this.__inDoc = false;
                    this.__hinting = false;
                    this.__openState = false;
                    this.__headElement = null;
                    this.__bodyElement = null;
                    this.__footElement = null;
                    this.__maskWidget = null;
                    this.__buttons = [];
                    if (this.__target instanceof Widget) {
                        this.__target = this.__target.getElement();
                    }
                },
                __render: function() {
                    this.callBase();
                    this.__innerTpl = Utils.Tpl.compile(tpl, this.__options);
                    this.__contentElement.appendChild($(this.__innerTpl)[0]);
                    $(this.__element).addClass(CONF.classPrefix + "dialog");
                    this.__headElement = $(".fui-dialog-head", this.__contentElement)[0];
                    this.__bodyElement = $(".fui-dialog-body", this.__contentElement)[0];
                    this.__footElement = $(".fui-dialog-foot", this.__contentElement)[0];
                    this.__maskWidget = new Mask(this.__options.mask);
                    this.__contentElement = this.__bodyElement;
                    if (this.__options.draggable) {
                        this.__initDraggable();
                    }
                    if (this.__options.closeButton) {
                        this.__initCloseButton();
                    }
                    this.__initButtons();
                    this.__initMaskLint();
                },
                __action: function(type, btn) {
                    switch (type) {
                      case ACTION.OK:
                        if (this.__triggerHandler(type) !== false) {
                            this.close();
                        }
                        break;

                      case ACTION.CANCEL:
                        this.__triggerHandler(type);
                        this.close();
                        break;
                    }
                },
                __initButtons: function() {
                    var _self = this, button = null, foot = this.__footElement;
                    $.each(this.__options.buttons, function(index, buttonOption) {
                        button = new Button(buttonOption);
                        button.appendTo(foot);
                        _self.__buttons.push(button);
                    });
                },
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    $([ this.__footElement, this.__headElement ]).on("btnclick", function(e, btn) {
                        _self.__action(btn.getOptions().action, btn);
                    });
                },
                __initDraggable: function() {
                    Utils.createDraggable({
                        handler: this.__headElement,
                        target: this.__element
                    }).bind();
                },
                __initCloseButton: function() {
                    var closeButton = new Button({
                        className: "fui-close-button",
                        action: "cancel",
                        icon: {
                            className: "fui-close-button-icon"
                        }
                    });
                    closeButton.appendTo(this.__headElement);
                },
                __initMaskLint: function() {
                    var _self = this;
                    this.__maskWidget.on("click", function() {
                        _self.__hint();
                    });
                },
                __hint: function() {
                    if (this.__hinting) {
                        return;
                    }
                    this.__hinting = true;
                    var $ele = $(this.__element), _self = this, classNmae = [ CONF.classPrefix + "mask-hint", CONF.classPrefix + "mask-animate" ];
                    $ele.addClass(classNmae.join(" "));
                    window.setTimeout(function() {
                        $ele.removeClass(classNmae[0]);
                        window.setTimeout(function() {
                            $ele.removeClass(classNmae[1]);
                            _self.__hinting = false;
                        }, 200);
                    }, 200);
                }
            });
        }
    };

    //src/widget/drop-panel.js
    /**
     * DropPanel对象
     * 可接受输入的按钮构件
     */
    _p[41] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(22), Button = _p.r(37), Panel = _p.r(51), PPanel = _p.r(53), Mask = _p.r(49);
            return _p.r(13).createClass("DropPanel", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        button: null,
                        panel: null,
                        width: null,
                        height: null
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                disable: function() {
                    this.callBase();
                },
                enable: function() {
                    this.callBase();
                },
                open: function() {
                    this.__popupWidget.appendWidget(this.__panelWidget);
                    this.__maskWidget.show();
                    this.__popupWidget.show();
                    var $popup = $(this.__popupWidget.getElement());
                    $popup.css("top", parseInt($popup.css("top")) - $(this.__element).outerHeight());
                    $popup.css("min-width", $(this.__element).outerWidth());
                    $popup.css("min-height", $(this.__element).height());
                },
                close: function() {
                    this.__maskWidget.hide();
                    this.__popupWidget.hide();
                    this.__panelWidget.appendTo(this.__contentElement);
                },
                getPanelElement: function() {
                    return this.__panelWidget.getElement();
                },
                appendWidget: function(widget) {
                    this.__panelWidget.appendWidget(widget);
                },
                getWidgets: function() {
                    return this.__panelWidget.getWidgets();
                },
                getWidget: function(index) {
                    return this.__panelWidget.getWidget(index);
                },
                appendWidgets: function(widgets) {
                    this.__panelWidget.appendWidgets.apply(this, arguments);
                    return this;
                },
                insertWidget: function(index, widget) {
                    this.__panelWidget.insertWidget(index, widget);
                },
                insertWidgets: function(index, widgets) {
                    this.__panelWidget.insertWidgets.apply(this, arguments);
                    return this;
                },
                removeWidget: function(widget) {
                    return this.__panelWidget.removeWidget(widget);
                },
                __render: function() {
                    this.__initOptions();
                    this.__buttonWidget = new Button(this.__options.button);
                    this.__panelWidget = new Panel(this.__options.content);
                    this.__popupWidget = new PPanel();
                    this.__maskWidget = new Mask(this.__options.mask);
                    this.callBase();
                    this.__popupWidget.positionTo(this.__element);
                    $(this.__popupWidget.getElement()).addClass(CONF.classPrefix + "drop-panel-popup");
                    // 初始化content
                    var $content = $('<div class="' + CONF.classPrefix + 'drop-panel-content"></div>').append(this.__panelWidget.getElement());
                    this.__contentElement = $content[0];
                    // 插入按钮到element
                    $(this.__element).append($content).append(this.__buttonWidget.getElement());
                    this.__initDropPanelEvent();
                },
                __initOptions: function() {
                    this.widgetName = "DropPanel";
                    this.__tpl = tpl;
                    this.__buttonWidget = null;
                    this.__popupWidget = null;
                    this.__panelWidget = null;
                    this.__contentElement = null;
                    this.__maskWidget = null;
                    this.__popupState = false;
                    if (typeof this.__options.button !== "object") {
                        this.__options.input = {
                            icon: this.__options.button
                        };
                    }
                },
                __initDropPanelEvent: function() {
                    var _self = this;
                    this.__buttonWidget.on("click", function() {
                        if (!_self.__popupState) {
                            _self.__appendPopup();
                            _self.__popupState = true;
                        }
                        _self.trigger("buttonclick");
                        _self.open();
                    });
                    this.__panelWidget.on("click", function() {
                        _self.trigger("panelclick");
                    });
                    // mask 点击关闭
                    this.__maskWidget.on("maskclick", function() {
                        _self.close();
                    });
                },
                __appendPopup: function() {
                    this.__popupWidget.appendTo(this.__element.ownerDocument.body);
                }
            });
        }
    };

    //src/widget/icon.js
    /**
     * icon widget
     * 封装多种icon方式
     */
    _p[42] = {
        value: function(require) {
            var $ = _p.r(4), iconTpl = _p.r(23);
            return _p.r(13).createClass("Icon", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        img: null
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__options.value || this.__options.img;
                },
                setImage: function(imageSrc) {
                    if (this.__options.img === imageSrc) {
                        return this;
                    }
                    if (this.__image) {
                        this.__image.src = imageSrc;
                    }
                    this.trigger("iconchange", {
                        prevImage: this.__prevIcon,
                        currentImage: this.__currentIcon
                    });
                },
                getImage: function() {
                    return this.__currentIcon;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Icon";
                    this.__tpl = iconTpl;
                    this.__prevIcon = null;
                    this.__currentIcon = this.__options.img;
                    this.__image = null;
                },
                __render: function() {
                    this.__options.__width = this.__options.width;
                    this.__options.__height = this.__options.height;
                    this.__options.width = null;
                    this.__options.height = null;
                    this.callBase();
                    if (!this.__options.img) {
                        return;
                    }
                    this.__image = $("img", this.__element)[0];
                    if (this.__options.__width !== null) {
                        this.__image.width = this.__options.__width;
                    }
                    if (this.__options.__height !== null) {
                        this.__image.height = this.__options.__height;
                    }
                }
            });
        }
    };

    //src/widget/input-button.js
    /**
     * InputButton对象
     * 可接受输入的按钮构件
     */
    _p[43] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(24), Button = _p.r(37), Input = _p.r(45);
            return _p.r(13).createClass("InputButton", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        button: null,
                        input: null,
                        placeholder: null,
                        // label相对icon的位置
                        layout: "right"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__inputWidget.getValue();
                },
                setValue: function(value) {
                    this.__inputWidget.setValue(value);
                    return this;
                },
                reset: function() {
                    this.__inputWidget.reset();
                },
                selectAll: function() {
                    this.__inputWidget.selectAll();
                    return this;
                },
                selectRange: function(start, end) {
                    this.__inputWidget.selectRange(start, end);
                    return this;
                },
                focus: function() {
                    this.__inputWidget.focus();
                    return this;
                },
                unfocus: function() {
                    this.__inputWidget.unfocus();
                    return this;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "InputButton";
                    this.__tpl = tpl;
                    this.__inputWidget = null;
                    this.__buttonWidget = null;
                    if (typeof this.__options.input !== "object") {
                        this.__options.input = {
                            placeholder: this.__options.input
                        };
                    }
                    this.__options.input = $.extend({}, this.__options.input, {
                        placeholder: this.__options.placeholder
                    });
                    if (typeof this.__options.button !== "object") {
                        this.__options.button = {
                            icon: this.__options.button
                        };
                    }
                },
                __render: function() {
                    var _self = this;
                    this.callBase();
                    this.__buttonWidget = new Button(this.__options.button);
                    this.__inputWidget = new Input(this.__options.input);
                    // layout
                    switch (this.__options.layout) {
                      case "left":
                      /* falls through */
                        case "top":
                        this.__buttonWidget.appendTo(this.__element);
                        this.__inputWidget.appendTo(this.__element);
                        break;

                      case "right":
                      /* falls through */
                        case "bottom":
                      /* falls through */
                        default:
                        this.__inputWidget.appendTo(this.__element);
                        this.__buttonWidget.appendTo(this.__element);
                        break;
                    }
                    $(this.__element).addClass(CONF.classPrefix + "layout-" + this.__options.layout);
                    this.__buttonWidget.on("click", function() {
                        _self.trigger("buttonclick");
                    });
                }
            });
        }
    };

    //src/widget/input-menu.js
    /**
     * InputMenu构件
     * 可接受输入的下拉菜单构件
     */
    _p[44] = {
        value: function(require) {
            var $ = _p.r(4), tpl = _p.r(25), InputButton = _p.r(43), Menu = _p.r(50), Mask = _p.r(49);
            return _p.r(13).createClass("InputMenu", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        input: null,
                        menu: null,
                        mask: null,
                        selected: -1
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                select: function(index) {
                    this.__menuWidget.select(index);
                },
                selectByValue: function(value) {
                    return this.__selectBy("values", value);
                },
                selectByLabel: function(value) {
                    return this.__selectBy("labels", value);
                },
                clearSelect: function() {
                    this.__lastSelect = -1;
                    this.__menuWidget.clearSelect();
                    this.__inputWidget.reset();
                    return this;
                },
                setValue: function(value) {
                    return this;
                },
                getValue: function() {
                    return this.__menuWidget.getSelectedItem().getValue();
                },
                open: function() {
                    this.__maskWidget.show();
                    this.__menuWidget.show();
                },
                close: function() {
                    this.__maskWidget.hide();
                    this.__menuWidget.hide();
                },
                __render: function() {
                    this.__inputWidget = new InputButton(this.__options.input);
                    this.__menuWidget = new Menu(this.__options.menu);
                    this.__maskWidget = new Mask(this.__options.mask);
                    this.callBase();
                    this.__inputWidget.appendTo(this.__element);
                    this.__menuWidget.positionTo(this.__inputWidget);
                    this.__initInputValue();
                },
                __selectBy: function(type, value) {
                    var values = this.__getItemValues()[type], index = -1;
                    $.each(values, function(i, val) {
                        if (value === val) {
                            index = i;
                            return false;
                        }
                    });
                    if (index !== -1) {
                        this.select(index);
                        return this.__menuWidget.getSelectedItem();
                    }
                    return null;
                },
                __initInputValue: function() {
                    var selectedItem = this.__menuWidget.getItem(this.__options.selected);
                    if (selectedItem) {
                        this.__inputWidget.setValue(selectedItem.getLabel());
                    }
                },
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    this.on("buttonclick", function() {
                        if (!this.__menuState) {
                            this.__appendMenu();
                            this.__menuState = true;
                        }
                        this.__inputWidget.unfocus();
                        this.open();
                    });
                    this.on("keypress", function(e) {
                        this.__lastTime = new Date();
                    });
                    this.on("keyup", function(e) {
                        if (e.keyCode !== 8 && e.keyCode !== 13 && new Date() - this.__lastTime < 500) {
                            this.__update();
                        }
                    });
                    this.on("inputcomplete", function() {
                        this.__inputWidget.selectRange(99999999);
                        this.__inputComplete();
                    });
                    this.__menuWidget.on("select", function(e, info) {
                        e.stopPropagation();
                        _self.__inputWidget.setValue(info.label);
                        _self.trigger("select", info);
                        _self.close();
                    });
                    this.__menuWidget.on("change", function(e, info) {
                        e.stopPropagation();
                        _self.trigger("change", info);
                    });
                    // 阻止input自身的select和change事件
                    this.__inputWidget.on("select change", function(e) {
                        e.stopPropagation();
                    });
                    // mask 点击关闭
                    this.__maskWidget.on("maskclick", function() {
                        _self.close();
                    });
                    // 记录最后选中的数据
                    this.on("select", function(e, info) {
                        this.__lastSelect = info;
                    });
                },
                // 更新输入框内容
                __update: function() {
                    var inputValue = this.__inputWidget.getValue(), lowerCaseValue = inputValue.toLowerCase(), values = this.__getItemValues().labels, targetValue = null;
                    if (!inputValue) {
                        return;
                    }
                    $.each(values, function(i, val) {
                        if (val.toLowerCase().indexOf(lowerCaseValue) === 0) {
                            targetValue = val;
                            return false;
                        }
                    });
                    if (targetValue) {
                        this.__inputWidget.setValue(targetValue);
                        this.__inputWidget.selectRange(inputValue.length);
                    }
                },
                // 获取所有item的值列表
                __getItemValues: function() {
                    var vals = [], labels = [];
                    $.each(this.__menuWidget.getWidgets(), function(index, item) {
                        labels.push(item.getLabel());
                        vals.push(item.getValue());
                    });
                    return {
                        labels: labels,
                        values: vals
                    };
                },
                // 用户输入完成
                __inputComplete: function() {
                    var itemsInfo = this.__getItemValues(), labels = itemsInfo.labels, targetIndex = -1, inputValue = this.__inputWidget.getValue(), lastSelect = this.__lastSelect;
                    $.each(labels, function(i, label) {
                        if (label === inputValue) {
                            targetIndex = i;
                            return false;
                        }
                    });
                    this.trigger("select", {
                        index: targetIndex,
                        label: inputValue,
                        value: itemsInfo.values[targetIndex]
                    });
                    if (!lastSelect || lastSelect.value !== inputValue) {
                        this.trigger("change", {
                            from: lastSelect || {
                                index: -1,
                                label: null,
                                value: null
                            },
                            to: {
                                index: targetIndex,
                                label: inputValue,
                                value: itemsInfo.values[targetIndex]
                            }
                        });
                    }
                },
                __appendMenu: function() {
                    this.__menuWidget.appendTo(this.__inputWidget.getElement().ownerDocument.body);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "InputMenu";
                    this.__tpl = tpl;
                    // 最后输入时间
                    this.__lastTime = 0;
                    // 最后选中的记录
                    this.__lastSelect = null;
                    this.__inputWidget = null;
                    this.__menuWidget = null;
                    this.__maskWidget = null;
                    // menu状态， 记录是否已经append到dom树上
                    this.__menuState = false;
                    if (this.__options.selected !== -1) {
                        this.__options.menu.selected = this.__options.selected;
                    }
                }
            });
        }
    };

    //src/widget/input.js
    /*jshint camelcase:false*/
    /**
    * Input widget
    */
    _p[45] = {
        value: function(require) {
            var CONF = _p.r(12), $ = _p.r(4), tpl = _p.r(26);
            return _p.r(13).createClass("Input", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        placeholder: null
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__element.value;
                },
                setValue: function(value) {
                    this.__element.value = value;
                    return this;
                },
                disable: function() {
                    this.callBase();
                    this.__element.disabled = true;
                },
                enable: function() {
                    this.__element.disabled = false;
                    this.callBase();
                },
                reset: function() {
                    this.__element.value = this.__options.value || "";
                    return this;
                },
                selectAll: function() {
                    this.__element.select();
                },
                selectRange: function(startIndex, endIndex) {
                    if (!startIndex) {
                        startIndex = 0;
                    }
                    if (!endIndex) {
                        endIndex = 1e9;
                    }
                    this.__element.setSelectionRange(startIndex, endIndex);
                },
                focus: function() {
                    this.__element.focus();
                    return this;
                },
                unfocus: function() {
                    this.__element.blur();
                    return this;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Input";
                    this.__tpl = tpl;
                    // input构件允许获得焦点
                    this.__allow_focus = true;
                },
                __render: function() {
                    this.callBase();
                    this.__element.removeAttribute("unselectable");
                    if (this.__options.placeholder) {
                        this.__element.setAttribute("placeholder", this.__options.placeholder);
                    }
                    this.addClass(CONF.classPrefix + "selectable");
                },
                __initEvent: function() {
                    this.callBase();
                    this.on("keydown", function(e) {
                        if (e.keyCode === 13) {
                            this.trigger("inputcomplete", {
                                value: this.getValue()
                            });
                        }
                    });
                }
            });
        }
    };

    //src/widget/item.js
    /**
     * Label Widget
     */
    _p[46] = {
        value: function(require) {
            var Utils = _p.r(13), itemTpl = _p.r(27), Icon = _p.r(42), Label = _p.r(48), CONF = _p.r(12), $ = _p.r(4);
            return Utils.createClass("Item", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        label: "",
                        icon: null,
                        selected: false,
                        textAlign: "left"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__options.value || this.__labelWidget.getValue() || this.__iconWidget.getValue() || null;
                },
                select: function() {
                    this.__update(true);
                    return this;
                },
                unselect: function() {
                    this.__update(false);
                    return this;
                },
                isSelected: function() {
                    return this.__selectState;
                },
                setLabel: function(text) {
                    this.__labelWidget.setText(text);
                    return this;
                },
                getLabel: function() {
                    return this.__labelWidget.getText();
                },
                setIcon: function(imageSrc) {
                    this.__iconWidget.setImage(imageSrc);
                    return this;
                },
                getIcon: function() {
                    return this.__iconWidget.getImage();
                },
                __render: function() {
                    this.callBase();
                    this.__iconWidget = new Icon(this.__options.icon);
                    this.__labelWidget = new Label(this.__options.label);
                    this.__iconWidget.appendTo(this.__element);
                    this.__labelWidget.appendTo(this.__element);
                },
                __update: function(state) {
                    var fn = state ? "addClass" : "removeClass";
                    state = !!state;
                    $(this.__element)[fn](CONF.classPrefix + "item-selected");
                    this.__selectState = state;
                    this.trigger(state ? "itemselect" : "itemunselect");
                    return this;
                },
                __initEvent: function() {
                    this.callBase();
                    this.on("click", function() {
                        this.trigger("itemclick");
                    });
                },
                /**
             * 初始化模板所用的css值
             * @private
             */
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Item";
                    this.__tpl = itemTpl;
                    this.__iconWidget = null;
                    this.__labelWidget = null;
                    this.__selectState = this.__options.selected;
                    if (typeof this.__options.label !== "object") {
                        this.__options.label = {
                            text: this.__options.label
                        };
                    }
                    if (!this.__options.label.textAlign) {
                        this.__options.label.textAlign = this.__options.textAlign;
                    }
                    if (typeof this.__options.icon !== "object") {
                        this.__options.icon = {
                            img: this.__options.icon
                        };
                    }
                }
            });
        }
    };

    //src/widget/label-panel.js
    /**
     * LabelPanel Widget
     * 带标签的面板
     */
    _p[47] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Label = _p.r(48), $ = _p.r(4);
            return Utils.createClass("LabelPanel", {
                base: _p.r(51),
                constructor: function(options) {
                    var defaultOptions = {
                        layout: "bottom"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                disable: function() {
                    this.callBase();
                    this.__labelWidget.disable();
                },
                enable: function() {
                    this.callBase();
                    this.__labelWidget.enable();
                },
                __render: function() {
                    var $contentElement = null, opts = this.__options, ele = this.__element, classPrefix = CONF.classPrefix, labelClass = "fui-label-panel-content", originEle = null;
                    this.__labelWidget = new Label(opts.label);
                    this.callBase();
                    originEle = this.__contentElement;
                    $(ele).addClass(classPrefix + "label-panel");
                    $(ele).addClass(classPrefix + "layout-" + opts.layout);
                    $contentElement = $('<div class="' + labelClass + '"></div>');
                    originEle.appendChild(this.__labelWidget.getElement());
                    originEle.appendChild($contentElement[0]);
                    // 更新contentElement
                    this.__contentElement = $contentElement[0];
                    return this;
                },
                __initOptions: function() {
                    var label = this.__options.label;
                    this.callBase();
                    this.widgetName = "LabelPanel";
                    this.__labelWidget = null;
                    if (typeof label !== "object") {
                        this.__options.label = {
                            text: label
                        };
                    }
                    if (!this.__options.label.className) {
                        this.__options.label.className = "";
                    }
                    this.__options.label.className += " fui-label-panel-label";
                }
            });
        }
    };

    //src/widget/label.js
    /**
     * Label Widget
     */
    _p[48] = {
        value: function(require) {
            var Utils = _p.r(13), labelTpl = _p.r(28), $ = _p.r(4);
            return Utils.createClass("Label", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        text: "",
                        textAlign: "center"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__options.text;
                },
                setText: function(text) {
                    var oldtext = this.__options.text;
                    this.__options.text = text;
                    $(this.__element).text(text);
                    this.trigger("labelchange", {
                        currentText: text,
                        prevText: oldtext
                    });
                    return this;
                },
                getText: function() {
                    return this.__options.text;
                },
                // label 禁用title显示
                __allowShowTitle: function() {
                    return false;
                },
                /**
             * 初始化模板所用的css值
             * @private
             */
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Label";
                    this.__tpl = labelTpl;
                    this.__options.text = this.__options.text.toString();
                }
            });
        }
    };

    //src/widget/mask.js
    /*jshint camelcase:false*/
    /**
     * Mask Widget
     */
    _p[49] = {
        value: function(require) {
            var Utils = _p.r(13), tpl = _p.r(29), Widget = _p.r(58), $ = _p.r(4), __cache_inited = false, __MASK_CACHE = [];
            return Utils.createClass("Mask", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        bgcolor: "#000",
                        opacity: 0,
                        inner: true,
                        target: null,
                        // 禁止mouse scroll事件
                        scroll: false,
                        hide: true
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                maskTo: function(target) {
                    if (target) {
                        this.__target = target;
                    }
                    return this;
                },
                show: function() {
                    var docNode = null;
                    if (!this.__target) {
                        this.__target = this.__element.ownerDocument.body;
                    }
                    docNode = this.__target.ownerDocument.documentElement;
                    // 如果节点未添加到dom树， 则自动添加到文档的body节点上
                    if (!$.contains(docNode, this.__element)) {
                        this.appendTo(this.__target.ownerDocument.body);
                    }
                    this.callBase();
                    this.__position();
                    this.__resize();
                    this.__hideState = false;
                },
                hide: function() {
                    this.callBase();
                    this.__hideState = true;
                },
                isHide: function() {
                    return this.__hideState;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Mask";
                    this.__tpl = tpl;
                    this.__cacheId = __MASK_CACHE.length;
                    this.__hideState = true;
                    __MASK_CACHE.push(this);
                    this.__target = this.__options.target;
                    if (this.__target instanceof Widget) {
                        this.__target = this.__target.getElement();
                    }
                },
                __render: function() {
                    this.callBase();
                    this.__initMaskEvent();
                    if (!__cache_inited) {
                        __cache_inited = true;
                        __initCacheEvent();
                    }
                },
                __initMaskEvent: function() {
                    this.on("mousewheel", function(e) {
                        var evt = e.originalEvent;
                        e.preventDefault();
                        e.stopPropagation();
                        this.trigger("scroll", {
                            delta: evt.wheelDelta || evt.deltaY || evt.detail
                        });
                    });
                    this.on("click", function(e) {
                        e.stopPropagation();
                        if (e.target === this.__element) {
                            this.trigger("maskclick");
                        }
                    });
                },
                // 定位
                __resize: function() {
                    var targetRect = null;
                    // body特殊处理
                    if (this.__targetIsBody()) {
                        targetRect = $(Utils.getView(this.__target));
                        targetRect = {
                            width: targetRect.width(),
                            height: targetRect.height()
                        };
                    } else {
                        targetRect = Utils.getRect(this.__target);
                    }
                    this.__element.style.width = targetRect.width + "px";
                    this.__element.style.height = targetRect.height + "px";
                },
                __position: function() {
                    var location = null, targetRect = null;
                    if (this.__targetIsBody()) {
                        location = {
                            top: 0,
                            left: 0
                        };
                    } else {
                        targetRect = Utils.getRect(this.__target);
                        location = {
                            top: targetRect.top,
                            left: targetRect.left
                        };
                    }
                    $(this.__element).css("top", location.top + "px").css("left", location.left + "px");
                },
                __targetIsBody: function() {
                    return this.__target.tagName.toLowerCase() === "body";
                }
            });
            // 全局监听
            function __initCacheEvent() {
                $(window).on("resize", function() {
                    $.each(__MASK_CACHE, function(i, mask) {
                        if (mask && !mask.isHide()) {
                            mask.__resize();
                        }
                    });
                });
            }
        }
    };

    //src/widget/menu.js
    /**
     * Menu Widget
     */
    _p[50] = {
        value: function(require) {
            var Utils = _p.r(13), Item = _p.r(46), CONF = _p.r(12), $ = _p.r(4);
            return Utils.createClass("Menu", {
                base: _p.r(53),
                constructor: function(options) {
                    var defaultOptions = {
                        column: true,
                        selected: -1,
                        textAlign: "left",
                        items: []
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                select: function(index) {
                    var item = this.__widgets[index];
                    if (!item) {
                        return this;
                    }
                    this.__selectItem(item);
                    return this;
                },
                clearSelect: function() {
                    var selectedItem = this.getSelectedItem();
                    if (selectedItem) {
                        selectedItem.unselect();
                    }
                    this.__currentSelect = -1;
                    this.__prevSelect = -1;
                },
                getItems: function() {
                    return this.getWidgets.apply(this, arguments);
                },
                getItem: function() {
                    return this.getWidget.apply(this, arguments);
                },
                appendItem: function(item) {
                    return this.appendWidget.apply(this, arguments);
                },
                insertItem: function(item) {
                    return this.insertWidget.apply(this, arguments);
                },
                removeItem: function(item) {
                    return this.removeWidget.apply(this, arguments);
                },
                getSelected: function() {
                    return this.__currentSelect;
                },
                getSelectedItem: function() {
                    return this.getItem(this.__currentSelect);
                },
                insertWidget: function(index, widget) {
                    var returnValue = this.callBase(index, widget);
                    if (returnValue === null) {
                        return returnValue;
                    }
                    if (index <= this.__currentSelect) {
                        this.__currentSelect++;
                    }
                    if (index <= this.__prevSelect) {
                        this.__prevSelect++;
                    }
                    return returnValue;
                },
                removeWidget: function(widget) {
                    var index = widget;
                    if (typeof index !== "number") {
                        index = this.indexOf(widget);
                    }
                    widget = this.callBase(widget);
                    if (index === this.__currentSelect) {
                        this.__currentSelect = -1;
                    } else if (index < this.__currentSelect) {
                        this.__currentSelect--;
                    }
                    if (index === this.__prevSelect) {
                        this.__prevSelect = -1;
                    } else if (index < this.__prevSelect) {
                        this.__prevSelect--;
                    }
                    return widget;
                },
                __initOptions: function() {
                    this.callBase();
                    this.__prevSelect = -1;
                    this.__currentSelect = this.__options.selected;
                    this.widgetName = "Menu";
                },
                __render: function() {
                    var _self = this, textAlign = this.__options.textAlign, selected = this.__options.selected;
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "menu");
                    $.each(this.__options.items, function(index, itemOption) {
                        if (typeof itemOption !== "object") {
                            itemOption = {
                                label: itemOption
                            };
                        }
                        itemOption.selected = index === selected;
                        itemOption.textAlign = textAlign;
                        _self.appendItem(new Item(itemOption));
                    });
                },
                // 初始化点击事件
                __initEvent: function() {
                    this.callBase();
                    this.on("itemclick", function(e) {
                        this.__selectItem(e.widget);
                    });
                },
                __selectItem: function(item) {
                    if (this.__currentSelect > -1) {
                        this.__widgets[this.__currentSelect].unselect();
                    }
                    this.__prevSelect = this.__currentSelect;
                    this.__currentSelect = this.indexOf(item);
                    item.select();
                    this.trigger("select", {
                        index: this.__currentSelect,
                        label: item.getLabel(),
                        value: item.getValue()
                    });
                    if (this.__prevSelect !== this.__currentSelect) {
                        var fromItem = this.__widgets[this.__prevSelect] || null;
                        this.trigger("change", {
                            from: {
                                index: this.__prevSelect,
                                label: fromItem && fromItem.getLabel(),
                                value: fromItem && fromItem.getValue()
                            },
                            to: {
                                index: this.__currentSelect,
                                label: item.getLabel(),
                                value: item.getValue()
                            }
                        });
                    }
                },
                __valid: function(target) {
                    return target instanceof Item;
                }
            });
        }
    };

    //src/widget/panel.js
    /**
     * 容器类： Panel
     */
    _p[51] = {
        value: function(require) {
            var Utils = _p.r(13), panelTpl = _p.r(30), $ = _p.r(4);
            return Utils.createClass("Panel", {
                base: _p.r(39),
                constructor: function(options) {
                    var defaultOptions = {};
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                __render: function() {
                    var $content = null;
                    this.callBase();
                    $content = $('<div class="fui-panel-content"></div>');
                    this.__contentElement.appendChild($content[0]);
                    this.__contentElement = $content[0];
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Panel";
                    this.__tpl = panelTpl;
                }
            });
        }
    };

    //src/widget/popup.js
    /**
     * 容器类： PPanel = Positioning Panel
     */
    _p[52] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Widget = _p.r(58), Mask = _p.r(49), $ = _p.r(4);
            return Utils.createClass("Popup", {
                base: _p.r(53),
                constructor: function(options) {
                    var defaultOptions = {
                        mask: {}
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                open: function() {
                    this.__fire("open", function() {
                        this.show();
                    });
                    return this;
                },
                close: function() {
                    this.__fire("close", function() {
                        this.hide();
                    });
                    return this;
                },
                show: function() {
                    if (!this.__target) {
                        this.__target = this.__element.ownerDocument.body;
                    }
                    if (!this.__inDoc) {
                        this.__inDoc = true;
                        this.appendTo(this.__element.ownerDocument.body);
                    }
                    this.__maskWidget.show();
                    this.callBase();
                    this.__openState = true;
                    return this;
                },
                hide: function() {
                    this.callBase();
                    this.__maskWidget.hide();
                    this.__openState = false;
                    return this;
                },
                toggle: function() {
                    this.isOpen() ? this.close() : this.open();
                    return this;
                },
                isOpen: function() {
                    return this.__openState;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Popup";
                    this.__target = this.__options.target;
                    this.__layout = this.__options.layout;
                    this.__inDoc = false;
                    this.__openState = false;
                    this.__maskWidget = null;
                    if (this.__target instanceof Widget) {
                        this.__target = this.__target.getElement();
                    }
                },
                __render: function() {
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "popup");
                    this.__maskWidget = new Mask(this.__options.mask);
                    if (this.__options.draggable) {
                        this.__initDraggable();
                    }
                    this.__initMaskEvent();
                },
                __initMaskEvent: function() {
                    var _self = this;
                    this.__maskWidget.on("click", function() {
                        _self.close();
                    });
                }
            });
        }
    };

    //src/widget/ppanel.js
    /*jshint camelcase:false*/
    /**
     * 容器类： PPanel = Positioning Panel
     */
    _p[53] = {
        value: function(require) {
            var Utils = _p.r(13), CONF = _p.r(12), Widget = _p.r(58), LAYOUT = CONF.layout, $ = _p.r(4);
            return Utils.createClass("PPanel", {
                base: _p.r(51),
                constructor: function(options) {
                    var defaultOptions = {
                        layout: LAYOUT.BOTTOM,
                        target: null,
                        // 边界容器
                        bound: null,
                        // 和边界之间的最小距离
                        diff: 10,
                        hide: true,
                        resize: "all"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                positionTo: function(target, layout) {
                    if (target instanceof Widget) {
                        target = target.getElement();
                    }
                    this.__target = target;
                    if (layout) {
                        this.__layout = layout;
                    }
                    return this;
                },
                show: function() {
                    var docNode = null;
                    if (!this.__target) {
                        return this.callBase();
                    }
                    if (!this.__options.bound) {
                        this.__options.bound = this.__target.ownerDocument.body;
                    }
                    docNode = this.__target.ownerDocument.documentElement;
                    if (!$.contains(docNode, this.__element)) {
                        this.__target.ownerDocument.body.appendChild(this.__element);
                    }
                    if ($.contains(docNode, this.__target)) {
                        this.callBase(Utils.getMarker());
                        this.__position();
                        this.__resize();
                    }
                    return this;
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "PPanel";
                    this.__target = this.__options.target;
                    this.__layout = this.__options.layout;
                    // 记录是否已调整过高度
                    this.__height_resized = false;
                },
                __render: function() {
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "ppanel");
                },
                // 执行定位
                __position: function() {
                    var location = null, className = CONF.classPrefix + "ppanel-position";
                    $(this.__element).addClass(className);
                    location = this.__getLocation();
                    $(this.__element).css("top", location.top + "px").css("left", location.left + "px");
                },
                __resize: function() {
                    var targetRect = Utils.getBound(this.__target);
                    switch (this.__options.resize) {
                      case "all":
                        this.__resizeWidth(targetRect);
                        this.__resizeHeight();
                        break;

                      case "width":
                        this.__resizeWidth(targetRect);
                        break;

                      case "height":
                        this.__resizeHeight();
                        break;
                    }
                },
                /**
             * 在未指定宽度的情况下，执行自动宽度适配。
             * 如果构件未被指定宽度， 则添加一个最小宽度， 该最小宽度等于给定目标的宽度
             * @param targetRect 传递该参数，是出于整体性能上的考虑。
             * @private
             */
                __resizeWidth: function(targetRect) {
                    if (!this.__target) {
                        return;
                    }
                    var $ele = $(this.__element), w = $ele.outerWidth(), h = $ele.outerHeight(), minWidth = targetRect.width - w - h;
                    this.__element.style.minWidth = minWidth + "px";
                },
                /**
             * 调整panel高度，使其不超过边界范围，如果已设置高度， 则不进行调整
             * @private
             */
                __resizeHeight: function() {
                    var boundRect = null, panelRect = null, diff = 0;
                    panelRect = Utils.getRect(this.__element);
                    panelRect.height = this.__element.scrollHeight;
                    panelRect.bottom = panelRect.top + panelRect.height;
                    boundRect = this.__getBoundRect();
                    diff = panelRect.bottom - boundRect.bottom;
                    if (diff > 0) {
                        this.__height_resized = true;
                        diff = panelRect.height - diff - this.__options.diff;
                        $(this.__element).css("height", diff + "px");
                    } else if (this.__height_resized) {
                        this.__element.style.height = null;
                    }
                },
                __getLocation: function() {
                    var targetRect = Utils.getBound(this.__target);
                    switch (this.__layout) {
                      case LAYOUT.CENTER:
                      case LAYOUT.MIDDLE:
                        return this.__getCenterLayout(targetRect);

                      case LAYOUT.LEFT:
                      case LAYOUT.RIGHT:
                      case LAYOUT.BOTTOM:
                      case LAYOUT.TOP:
                        return this.__getOuterLayout(targetRect);

                      default:
                        return this.__getInnerLayout(targetRect);
                    }
                    return location;
                },
                /**
             * 居中定位的位置属性
             * @private
             */
                __getCenterLayout: function(targetRect) {
                    var location = {
                        top: 0,
                        left: 0
                    }, panelRect = Utils.getRect(this.__element), diff = 0;
                    diff = targetRect.height - panelRect.height;
                    if (diff > 0) {
                        location.top = targetRect.top + diff / 2;
                    }
                    diff = targetRect.width - panelRect.width;
                    if (diff > 0) {
                        location.left = targetRect.left + diff / 2;
                    }
                    return location;
                },
                /**
             * 获取外部布局定位属性
             * @returns {{top: number, left: number}}
             * @private
             */
                __getOuterLayout: function(targetRect) {
                    var location = {
                        top: 0,
                        left: 0
                    }, panelRect = Utils.getRect(this.__element);
                    switch (this.__layout) {
                      case LAYOUT.TOP:
                        location.left = targetRect.left;
                        location.top = targetRect.top - panelRect.height;
                        break;

                      case LAYOUT.LEFT:
                        location.top = targetRect.top;
                        location.left = targetRect.left - panelRect.width;
                        break;

                      case LAYOUT.RIGHT:
                        location.top = targetRect.top;
                        location.left = targetRect.right;
                        break;

                      case LAYOUT.BOTTOM:
                      /* falls through */
                        default:
                        location.left = targetRect.left;
                        location.top = targetRect.bottom;
                        break;
                    }
                    return location;
                },
                /**
             * 获取内部布局定位属性,并且，内部布局还拥有根据水平空间的大小，自动进行更新定位的功能
             * @private
             */
                __getInnerLayout: function(targetRect) {
                    var location = {
                        top: 0,
                        left: 0
                    }, rect = targetRect, panelRect = Utils.getRect(this.__element);
                    switch (this.__layout) {
                      case LAYOUT.LEFT_TOP:
                        location.top = rect.top;
                        location.left = rect.left;
                        break;

                      case LAYOUT.RIGHT_TOP:
                        location.top = rect.top;
                        location.left = rect.left + rect.width - panelRect.width;
                        break;

                      case LAYOUT.LEFT_BOTTOM:
                        location.top = rect.top + rect.height - panelRect.height;
                        location.left = rect.left;
                        break;

                      case LAYOUT.RIGHT_BOTTOM:
                        location.top = rect.top + rect.height - panelRect.height;
                        location.left = rect.left + rect.width - panelRect.width;
                        break;
                    }
                    return this.__correctionLocation(location);
                },
                __getBoundRect: function() {
                    var width = -1, height = -1, view = null;
                    if (this.__options.bound.tagName.toLowerCase() === "body") {
                        view = Utils.getView(this.__options.bound);
                        width = $(view).width();
                        height = $(view).height();
                        return {
                            top: 0,
                            left: 0,
                            right: width,
                            bottom: height,
                            width: width,
                            height: height
                        };
                    } else {
                        return Utils.getRect(this.__options.bound);
                    }
                },
                // 如果发生“溢出”，则修正定位
                __correctionLocation: function(location) {
                    var panelRect = Utils.getRect(this.__element), targetRect = Utils.getRect(this.__target), boundRect = this.__getBoundRect();
                    switch (this.__layout) {
                      case LAYOUT.LEFT_TOP:
                      case LAYOUT.LEFT_BOTTOM:
                        if (location.left + panelRect.width > boundRect.right) {
                            location.left += targetRect.width - panelRect.width;
                        }
                        break;

                      case LAYOUT.RIGHT_TOP:
                      case LAYOUT.RIGHT_BOTTOM:
                        if (location.left < boundRect.left) {
                            location.left = targetRect.left;
                        }
                        break;
                    }
                    return location;
                }
            });
        }
    };

    //src/widget/separator.js
    /**
     * Separator(分隔符) Widget
     */
    _p[54] = {
        value: function(require) {
            var Utils = _p.r(13), separatorTpl = _p.r(31), $ = _p.r(4);
            return Utils.createClass("Separator", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        width: 1,
                        height: "100%",
                        bgcolor: "#e1e1e1"
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Separator";
                    this.__tpl = separatorTpl;
                }
            });
        }
    };

    //src/widget/spin-button.js
    /**
     * SpinButton对象
     * 数值按钮构件
     */
    _p[55] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(32), Button = _p.r(37), Input = _p.r(45), Panel = _p.r(51);
            return _p.r(13).createClass("SpinButton", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        suffix: null,
                        selected: -1,
                        items: []
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getValue: function() {
                    return this.__options.items[this.__currentSelected] || null;
                },
                // Overload
                setValue: function(value) {},
                select: function(index) {
                    this.__update(index);
                },
                // 根据值进行选择
                selectByValue: function(value) {
                    value = value + "";
                    this.__update($.inArray(value, this.__options.items));
                },
                __render: function() {
                    this.callBase();
                    this.__buttons = [ new Button({
                        className: CONF.classPrefix + "spin-up-btn"
                    }), new Button({
                        className: CONF.classPrefix + "spin-down-btn"
                    }) ];
                    this.__inputWidget = new Input();
                    this.__panelWidget = new Panel({
                        column: true
                    });
                    this.__inputWidget.appendTo(this.__element);
                    this.__panelWidget.appendWidget(this.__buttons[0]);
                    this.__panelWidget.appendWidget(this.__buttons[1]);
                    this.__panelWidget.appendTo(this.__element);
                    this.__initSelected(this.__options.selected);
                },
                __initEvent: function() {
                    var _self = this;
                    this.callBase();
                    this.__buttons[0].on("btnclick", function() {
                        _self.__update(_self.__currentSelected - 1);
                    });
                    this.__buttons[1].on("btnclick", function() {
                        _self.__update(_self.__currentSelected + 1);
                    });
                },
                __initSelected: function(index) {
                    this.__update(index, false);
                },
                __update: function(index, isTrigger) {
                    var oldIndex = -1, value = null, toValue = null;
                    if (index < 0 || index >= this.__options.items.length) {
                        return;
                    }
                    oldIndex = this.__currentSelected;
                    this.__currentSelected = index;
                    toValue = this.__options.items[this.__currentSelected];
                    value = toValue + " " + (this.__options.suffix || "");
                    this.__inputWidget.setValue(value);
                    if (isTrigger !== false) {
                        this.trigger("change", {
                            from: this.__options.items[oldIndex] || null,
                            to: toValue
                        });
                    }
                },
                __initOptions: function() {
                    var items = this.__options.items;
                    this.callBase();
                    this.widgetName = "SpinButton";
                    this.__tpl = tpl;
                    this.__buttons = [];
                    this.__panelWidget = null;
                    this.__inputWidget = null;
                    this.__currentSelected = -1;
                    $.each(items, function(index, val) {
                        items[index] = val + "";
                    });
                }
            });
        }
    };

    //src/widget/tabs.js
    /**
     * Tabs Widget
     */
    _p[56] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12), tpl = _p.r(33), Button = _p.r(37), Panel = _p.r(51);
            return _p.r(13).createClass("Tabs", {
                base: _p.r(58),
                constructor: function(options) {
                    var defaultOptions = {
                        selected: 0,
                        buttons: [],
                        panels: null
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                getButtons: function() {
                    return this.__btns;
                },
                getButton: function(index) {
                    return this.getButtons()[index] || null;
                },
                getButtonByValue: function(value) {
                    var button = null;
                    $.each(this.__btns, function(i, btn) {
                        if (btn.getValue() === value) {
                            button = btn;
                            return false;
                        }
                    });
                    return button;
                },
                getPanels: function() {
                    return this.__panels;
                },
                getPanel: function(index) {
                    return this.getPanels()[index] || null;
                },
                getPanelByValue: function(value) {
                    var panel = null;
                    $.each(this.__panels, function(i, pan) {
                        if (pan.getValue() === value) {
                            panel = pan;
                            return false;
                        }
                    });
                    return panel;
                },
                getSelectedIndex: function() {
                    return this.__selected;
                },
                getSelected: function() {
                    var index = this.getSelectedIndex();
                    return {
                        button: this.getButton(index),
                        panel: this.getPanel(index)
                    };
                },
                /**
             * 选择接口
             * @param index 需要选中的tab页索引
             */
                select: function(index) {
                    var toInfo = null;
                    if (!this.__selectItem(index)) {
                        return this;
                    }
                    toInfo = this.__getInfo(index);
                    this.trigger("tabsselect", toInfo);
                    if (this.__prevSelected !== this.__selected) {
                        this.trigger("tabschange", {
                            from: this.__getInfo(this.__prevSelected),
                            toInfo: toInfo
                        });
                    }
                    return this;
                },
                getIndexByButton: function(btn) {
                    return $.inArray(btn, this.__btns);
                },
                /**
             * 把所有button追加到其他容器中
             */
                appendButtonTo: function(container) {
                    $.each(this.__btns, function(index, btn) {
                        btn.appendTo(container);
                    });
                },
                appendPanelTo: function(container) {
                    $.each(this.__panels, function(index, panel) {
                        panel.appendTo(container);
                    });
                },
                __render: function() {
                    var _self = this, btnWrap = null, panelWrap = null;
                    this.callBase();
                    btnWrap = $(".fui-tabs-button-wrap", this.__element)[0];
                    panelWrap = $(".fui-tabs-panel-wrap", this.__element)[0];
                    $.each(this.__options.buttons, function(index, opt) {
                        var btn = null;
                        if (typeof opt !== "object") {
                            opt = {
                                label: opt
                            };
                        }
                        btn = new Button(opt);
                        btn.on("click", function() {
                            _self.select(_self.getIndexByButton(this));
                        });
                        _self.__btns.push(btn);
                        btn.appendTo(btnWrap);
                    });
                    $.each(this.__options.panels, function(index, opt) {
                        var panel = null;
                        opt = opt || {
                            hide: true
                        };
                        opt.hide = true;
                        panel = new Panel(opt);
                        _self.__panels.push(panel);
                        panel.appendTo(panelWrap);
                    });
                    this.__selectItem(this.__options.selected);
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "Tabs";
                    this.__tpl = tpl;
                    this.__btns = [];
                    this.__panels = [];
                    this.__prevSelected = -1;
                    this.__selected = -1;
                    // panels不设置的情况下， 将根据button创建
                    if (this.__options.panels === null) {
                        this.__options.panels = [];
                        this.__options.panels.length = this.__options.buttons.length;
                    }
                },
                __selectItem: function(index) {
                    var btn = this.getButton(index), prevBtn = this.getButton(this.__selected), className = CONF.classPrefix + "selected";
                    if (!btn) {
                        return false;
                    }
                    if (prevBtn) {
                        prevBtn.removeClass(className);
                        this.getPanel(this.__selected).hide();
                    }
                    btn.addClass(className);
                    this.getPanel(index).show();
                    this.__prevSelected = this.__selected;
                    this.__selected = index;
                    return true;
                },
                // 根据给定的tab索引获取先关的信息， 这些信息将用于事件携带的参数
                __getInfo: function(index) {
                    return {
                        index: index,
                        button: this.getButton(index),
                        panel: this.getPanel(index)
                    };
                }
            });
        }
    };

    //src/widget/toggle-button.js
    /**
     * ToggleButton对象
     * 可切换按钮构件
     */
    _p[57] = {
        value: function(require) {
            var $ = _p.r(4), CONF = _p.r(12);
            return _p.r(13).createClass("ToggleButton", {
                base: _p.r(37),
                constructor: function(options) {
                    var defaultOptions = {
                        // 按钮初始时是否按下
                        pressed: false
                    };
                    options = $.extend({}, defaultOptions, options);
                    this.callBase(options);
                },
                /**
             * 当前按钮是否已按下
             */
                isPressed: function() {
                    return this.__state;
                },
                /**
             * 按下按钮
             */
                press: function() {
                    var className = CONF.classPrefix + "button-pressed";
                    $(this.__element).addClass(className);
                    this.__updateState(true);
                },
                /**
             * 弹起按钮
             */
                bounce: function() {
                    var className = CONF.classPrefix + "button-pressed";
                    $(this.__element).removeClass(className);
                    this.__updateState(false);
                },
                toggle: function() {
                    if (this.__state) {
                        this.bounce();
                    } else {
                        this.press();
                    }
                },
                __initOptions: function() {
                    this.callBase();
                    this.widgetName = "ToggleButton";
                    // 按钮当前状态
                    this.__state = false;
                },
                __render: function() {
                    this.callBase();
                    $(this.__element).addClass(CONF.classPrefix + "toggle-button");
                    this.__initButtonState();
                    return this;
                },
                __initButtonState: function() {
                    if (!this.__options.pressed) {
                        return;
                    }
                    // 不直接调用press方法， 防止初始化时事件的触发
                    $(this.__element).addClass(CONF.classPrefix + "button-pressed");
                    this.__state = true;
                },
                /**
             * 初始化事件监听, 控制状态的切换
             * @private
             */
                __initEvent: function() {
                    this.callBase();
                    this.on("click", function() {
                        this.toggle();
                    });
                },
                __updateState: function(state) {
                    state = !!state;
                    this.__state = state;
                    this.trigger("change", state, !state);
                }
            });
        }
    };

    //src/widget/widget.js
    /*jshint camelcase:false*/
    /**
     * widget对象
     * 所有的UI组件都是widget对象
     */
    _p[58] = {
        value: function(require) {
            var prefix = "_fui_", uid = 0, CONF = _p.r(12), FUI_NS = _p.r(11), $ = _p.r(4), Utils = _p.r(13);
            var Widget = _p.r(13).createClass("Widget", {
                constructor: function(options) {
                    var defaultOptions = {
                        id: null,
                        className: "",
                        disabled: false,
                        preventDefault: false,
                        text: "",
                        value: null,
                        hide: false,
                        width: null,
                        height: null
                    };
                    this.__widgetType = "widget";
                    this.__tpl = "";
                    this.__compiledTpl = "";
                    this.__options = {};
                    this.__element = null;
                    // 禁止获取焦点
                    this.__allow_focus = false;
                    this.widgetName = "Widget";
                    this.__extendOptions(defaultOptions, options);
                    this.__initOptions();
                    this.__render();
                    this.__initEvent();
                    this.__initWidgets && this.__initWidgets();
                },
                getId: function() {
                    return this.id;
                },
                getValue: function() {
                    return this.__options.value;
                },
                getOptions: function() {
                    return this.__options;
                },
                setValue: function(value) {
                    this.__options.value = value;
                    return this;
                },
                show: function() {
                    this.__show();
                    return this;
                },
                hide: function() {
                    this.__hide();
                    return this;
                },
                addClass: function(className) {
                    $(this.__element).addClass(className);
                    return this;
                },
                removeClass: function(className) {
                    $(this.__element).removeClass(className);
                    return this;
                },
                setStyle: function() {
                    $.fn.css.apply($(this.__element), arguments);
                    return this;
                },
                getStyle: function() {
                    return $.fn.css.apply($(this.__element), arguments);
                },
                /**
             * 当前构件是否是处于禁用状态
             * @returns {boolean|disabled|jsl.$.disabled|id.disabled}
             */
                isDisabled: function() {
                    return this.__options.disabled;
                },
                /**
             * 启用当前构件
             * @returns {Widget}
             */
                enable: function() {
                    this.__options.disabled = false;
                    $(this.__element).removeClass(CONF.classPrefix + "disabled");
                    return this;
                },
                /**
             * 禁用当前构件
             * @returns {Widget}
             */
                disable: function() {
                    this.__options.disabled = true;
                    $(this.__element).addClass(CONF.classPrefix + "disabled");
                    return this;
                },
                /**
             * 获取
             * @returns {null}
             */
                getElement: function() {
                    return this.__element;
                },
                appendTo: function(container) {
                    if (Utils.isElement(container)) {
                        container.appendChild(this.__element);
                    } else if (container instanceof Widget) {
                        container.__appendChild(this);
                    } else {
                        throw new Error("TypeError: Widget.appendTo()");
                    }
                    return this;
                },
                off: function(type, cb) {
                    $(this.__element).off(cb && cb.__fui_listener);
                    return this;
                },
                on: function(type, cb) {
                    if (!this.__options.preventDefault) {
                        this.__on(type, cb);
                    }
                    return this;
                },
                __initOptions: function() {},
                /**
             * 根据模板渲染构件, 如果该构件已经渲染过, 则不会进行二次渲染
             * @returns {Widget}
             */
                __render: function() {
                    var $ele = null, tpl = this.__tpl, opts = this.__options, className = null;
                    this.id = this.__id();
                    // 向NS注册自己
                    FUI_NS.__registerInstance(this);
                    this.__compiledTpl = Utils.Tpl.compile(tpl, opts);
                    this.__element = $(this.__compiledTpl)[0];
                    this.__element.setAttribute("id", this.id);
                    $ele = $(this.__element);
                    if (opts.disabled) {
                        $ele.addClass(CONF.classPrefix + "disabled");
                    }
                    $ele.addClass(CONF.classPrefix + "widget");
                    // add custom class-name
                    className = opts.className;
                    if (className.length > 0) {
                        if ($.isArray(className)) {
                            $ele.addClass(className.join(" "));
                        } else {
                            $ele.addClass(className);
                        }
                    }
                    this.__initBasicEnv();
                    if (opts.hide) {
                        this.__hide();
                    }
                    if (opts.style) {
                        this.setStyle(opts.style);
                    }
                    return this;
                },
                /**
             * 该方法将被appendTo调用， 用于根据各组件自身的规则插入节点,  子类可根据需要覆盖该方法
             * @param childWidget 将被追加的子构件对象
             */
                __appendChild: function(childWidget) {
                    return this.__element.appendChild(childWidget.getElement());
                },
                __initEvent: function() {
                    this.on("mousedown", function(e) {
                        var tagName = e.target.tagName.toLowerCase();
                        if (!CONF.control[tagName] && !this.__allowFocus()) {
                            e.preventDefault();
                        } else {
                            e.stopPropagation();
                        }
                    });
                },
                __on: function(type, cb) {
                    var _self = this;
                    cb.__fui_listener = function(e, widget) {
                        var params = [];
                        for (var i = 0, len = arguments.length; i < len; i++) {
                            if (i !== 1) {
                                params.push(arguments[i]);
                            }
                        }
                        e.widget = widget;
                        if (!_self.isDisabled()) {
                            return cb.apply(_self, params);
                        }
                    };
                    $(this.__element).on(type, cb.__fui_listener);
                    return this;
                },
                trigger: function(type, params) {
                    if (!this.__options.preventDefault) {
                        this.__trigger.apply(this, arguments);
                    }
                    return this;
                },
                __allowShowTitle: function() {
                    return true;
                },
                __allowFocus: function() {
                    return !!this.__allow_focus;
                },
                __trigger: function(type, params) {
                    var args = [].slice.call(arguments, 1);
                    $(this.__element).trigger(type, [ this ].concat(args));
                    return this;
                },
                __triggerHandler: function(type, params) {
                    var args = [ this ].concat([].slice.call(arguments, 1));
                    return $(this.__element).triggerHandler(type, args);
                },
                /**
             * 同__trigger，都触发某事件，但是该方法触发的事件会主动触发before和after，
             * 同时如果before事件返回false，则后续handler都不会执行，且后续事件也不会再触发。
             * @param type 事件类型
             * @param handler 该事件所需要执行的函数句柄， 且该函数的返回值将作为该事件的参数发送给事件监听器
             * */
                __fire: function(type, handler) {
                    var result = {
                        cancel: false
                    };
                    if (/^(before|after)/.test(type)) {
                        return this;
                    }
                    this.__trigger("before" + type, result);
                    if (result.cancel === true) {
                        return this;
                    }
                    result = handler.call(this, type);
                    this.__trigger(type);
                    this.__trigger("after" + type, result);
                    return this;
                },
                __extendOptions: function() {
                    var args = [ {}, this.__options ], params = [ true ];
                    args = args.concat([].slice.call(arguments, 0));
                    for (var i = 0, len = args.length; i < len; i++) {
                        if (typeof args[i] !== "string") {
                            params.push(args[i]);
                        }
                    }
                    this.__options = $.extend.apply($, params);
                },
                __hide: function() {
                    $(this.__element).addClass(CONF.classPrefix + "hide");
                },
                __show: function() {
                    $(this.__element).removeClass(CONF.classPrefix + "hide");
                },
                __initBasicEnv: function() {
                    if (this.__options.text && this.__allowShowTitle()) {
                        this.__element.setAttribute("title", this.__options.text);
                    }
                    if (this.__options.width) {
                        this.__element.style.width = this.__options.width + "px";
                    }
                    if (this.__options.height) {
                        this.__element.style.height = this.__options.height + "px";
                    }
                    if (this.widgetName) {
                        this.__element.setAttribute("rule", this.widgetName);
                    }
                },
                __id: function() {
                    return this.__options.id || generatorId();
                }
            });
            // 为widget生成唯一id
            function generatorId() {
                return prefix + ++uid;
            }
            return Widget;
        }
    };

    //dev-lib/exports.js
    /**
     * 模块暴露
     */
    _p[59] = {
        value: function(require) {
            _p.r(1);
            _p.r(2);
        }
    };

    var moduleMapping = {
        "fui.export": 59
    };

    function use(name) {
        _p.r([ moduleMapping[name] ]);
    }
    // 编译打包后的启动脚本
    use( 'fui.export' );})();
/* lib/fui/dist/fui.all.js end */




/* lib/fio/dist/fio.js */
    /**
     * @fileOverview
     *
     * FIO 核心代码
     *
     * @author techird, Baidu FEX.
     *
     */

    (function(Promise) {

        var fio = {
            version: '1.0'
        };

        /* 三个主要的命名空间 */
        fio.provider = {};
        fio.file = {};
        fio.user = {};


        /* IO 提供方列表 */
        var providerMap = {};

        /* FIO 当前使用的 IO 提供方 */
        var currentProvider = null;

        /* 返回值为空的 Promise */
        var noop = function() {
            return new Promise.resolve(null);
        };

        /* FIO 当前的用户系统实现 */
        var userImpl = {
            check: noop,
            login: noop,
            logout: noop
        };


        /* 数据结构：表示一个用户 */
        function User(id, username) {
            this.id = id;
            this.username = username;
        }

        /* 数据结构：表示一份数据 */
        function Data(content) {
            this.content = content;

            if (content instanceof Blob) {
                this.type = fio.file.TYPE_BLOB;
            } else if (typeof(content) == 'string') {
                this.type = fio.file.TYPE_TEXT;
            } else if (typeof(content) == 'object') {
                this.type = fio.file.TYPE_JSON;
            } else {
                this.type = fio.file.TYPE_UNKNOWN;
            }
        }

        /* 数据结构：表示一个文件或目录 */
        function File(path) {
            this.setPath(path);
            this.isDir = false;
            this.data = null;
            this.size = 0;
            this.createTime = new Date();
            this.modifyTime = new Date();
        }

        File.prototype.setPath = function(path) {
            var filename, dotpos;

            filename = path.substr(path.lastIndexOf('/') + 1);
            dotpos = filename.lastIndexOf('.');

            this.extendsion = ~dotpos ? filename.substr(dotpos) : null;
            this.name = ~dotpos ? filename.substr(0, dotpos) : filename;
            this.filename = filename;
            this.path = path;
        };

        /* 数据结构：表示一个访问控制列表记录 */
        function Acl(user, file, access) {
            this.user = user;
            this.file = file;
            this.access = access || 0;
        }

        /* 数据结构：表示一个文件操作请求 */
        function FileRequest(path, method, user) {
            this.path = path;
            this.method = method;
            this.user = user;
            this.dupPolicy = fio.file.DUP_FAIL;
            this.newPath = null;
            this.acl = null;
            this.extra = null;
        }

        /* 暴露需要的数据结构 */
        fio.user.User = User;
        fio.file.Data = Data;
        fio.file.File = File;
        fio.file.Acl = Acl;
        fio.file.FileRequest = FileRequest;

        /* 数据类型常量枚举 */
        fio.file.TYPE_TEXT = 'text';
        fio.file.TYPE_JSON = 'json';
        fio.file.TYPE_BLOB = 'blob';
        fio.file.TYPE_UNKNOWN = 'unknown';

        /* 文件操作常量枚举 */
        fio.file.METHOD_READ = 'read';
        fio.file.METHOD_WRITE = 'write';
        fio.file.METHOD_LIST = 'list';
        fio.file.METHOD_MOVE = 'move';
        fio.file.METHOD_DELETE = 'delete';
        fio.file.METHOD_MKDIR = 'mkdir';
        fio.file.METHOD_ACL_READ = 'readAcl';
        fio.file.METHOD_ACL_WRITE = 'writeAcl';

        /* 文件重复处理策略枚举 */
        fio.file.DUP_OVERWRITE = 'overwrite';
        fio.file.DUP_FAIL = 'fail';
        fio.file.DUP_RENAME = 'rename';

        /* 权限枚举 */
        fio.file.ACCESS_PUBLIC = 0x0001;
        fio.file.ACCESS_READ = 0x0002;
        fio.file.ACCESS_WRITE = 0x0004;
        fio.file.ACCESS_CREATE = 0x0008;
        fio.file.ACCESS_DELETE = 0x0010;
        fio.file.ACCESS_ACL_READ = 0x0020;
        fio.file.ACCESS_ACL_WRITE = 0x0040;
        fio.file.ACCESS_ALL = 0xfffe;

        /**
         * 注册一个 IO 提供方
         *
         * @method fio.provider.register
         *
         * @grammer fio.provider.register(name, provider)
         *
         * @param  {string} name
         *     提供方的名称
         *
         * @param  {object} provider
         *     提供方的实现
         *
         *     provider.init(opt) {function(object)}
         *         提供方的初始化方法，客户调用 fio.provider.init() 的时候会调用
         *
         *     provider.handle(request) {function(fio.file.FileRequest)}
         *         提供方处理文件请求的方法，根据 request.method 的不同取值返回不同的 Promise：
         *
         *             取值为 `fio.file.METHOD_LIST` 返回 Promise<fio.file.File[]>
         *             取值为 `fio.file.METHOD_ACL_READ` 返回 Promise<fio.file.ACL[]>
         *             取值为  `fio.file.METHOD_ACL_WRITE` 返回 Promise<fio.file.ACL[]>
         *             其他取值返回 `Promise<fio.file.File>`
         *
         * @see #fio.file.FileRequest
         *
         * @example
         *
         * fio.provider.register('netdisk', {
         *
         *     init: function(opt) {
         *         // init provider
         *     },
         *
         *     handle: function(request) {
         *         // handle request
         *     }
         *
         * });
         *
         */
        fio.provider.register = function(name, provider) {
            providerMap[name] = provider;
            if (!currentProvider) currentProvider = provider;

            // implement check
            if (typeof(provider.handle) != 'function') {
                throw new Error('Not implement: provider.handle()');
            }
        };


        /**
         * 切换 FIO 使用的默认 IO 提供方
         *
         * @method fio.provider.use
         *
         * @grammar fio.provider.use(name)
         *
         * @param  {string} name
         *     要使用的提供方的名称
         */
        fio.provider.use = function(name) {
            currentProvider = providerMap[name];
        };

        /**
         * 初始化指定的 IO 提供方
         *
         * @param  {string} name
         *     要初始化的提供方的名称
         *
         * @param  {object} opt
         *     初始化选项
         */
        fio.provider.init = function(name, opt) {
            var provider = providerMap[name];
            if (provider && typeof(provider.init) == 'function') {
                return provider.init.call(provider, opt);
            }
            return null;
        };

        /**
         * 实现 FIO 用户系统
         *
         * @method fio.user.impl
         *
         * @grammar fio.user.impl(impl)
         *
         * @param  {object} impl
         *     实现的代码，需要实现的方法包括：
         *
         *     impl.check(): fio.user.User
         *         返回当前用户
         *
         *     impl.login(): Promise<fio.user.User>
         *         进行用户的登陆
         *
         *     impl.logout(): Promise<fio.user.User>
         *         登出当前用户
         *
         */
        fio.user.impl = function(impl) {
            userImpl = impl;
        };

        ['check', 'login', 'logout'].forEach(function(operation) {
            fio.user[operation] = function() {
                return Promise.resolve(userImpl[operation].apply(userImpl, arguments));
            };
        });

        /**
         * 读取文件
         *
         * @method fio.file.read
         *
         * @grammar fio.file.read(opt)
         *
         * @param {object} opt 选项
         *
         *     opt.path {string}
         *         读取的文件的路径
         *
         * @return {Promise<fio.file.File>} 读取的文件
         *
         * @example
         *
         * ```js
         * fio.file.read({
         *     path: 'a.txt'
         * }).then(function(file) {
         *     console.log(file.data.content);
         * }).catch(function(e) {
         *     console.log(e.message);
         * });
         * ```
         */

        /**
         * 写入文件
         *
         * @method fio.file.write
         *
         * @grammar fio.file.write(opt)
         *
         * @param  {object} opt 选项
         *
         *     opt.path {string}
         *         要写入文件的位置
         *
         *     opt.content {string|object|blob}
         *         要写入的文件的内容
         *
         *     opt.ondup {Enum}
         *         存在同名文件时采取的策略
         *
         * @return {Promise<fio.file.File>} 返回已写入的文件
         *
         * @example
         *
         * ```js
         * fio.file.write({
         *     path: 'hello.txt',
         *     content: 'hello, fio!'
         * }).then(function(file) {
         *     console.log('the file size is ' + file.size);
         * }).catch(function(e) {
         *     console.log(e);
         * });
         * ```
         */

        /**
         * 列出指定目录的文件
         *
         * @method fio.file.list
         *
         * @grammar fio.file.list(opt)
         *
         * @param  {object} opt 选项
         *     opt.path {string} 要列出文件的路径
         *
         * @return {Promise<fio.file.File[]>} 列出的文件列表
         *
         * @example
         *
         * ```js
         * fio.file.list({
         *     path: '/kityminder/'
         * }).then(function(files) {
         *     console.table(files);
         * });
         * ``
         */

        /**
         * 移动指定的文件
         *
         * @method fio.file.move
         *
         * @grammar fio.file.move(opt)
         *
         * @param  {object} opt 选项
         *     opt.path {string} 要移动的文件或目录的路径
         *     opt.newPath {string} 目标位置
         *
         * @return {Promise<fio.file.File>}
         *
         * @example
         *
         * ```js
         * fio.file.move({
         *     path: '/kityminder/a.xmind',
         *     newPath: '/kityminder/b.xmind'
         * }).then(function(file) {
         *     console.log('file moved to' + file.path);
         * });
         * ``
         */


        /**
         * 删除文件
         *
         * @method fio.file.delete
         *
         * @grammar fio.file.delete(opt)
         *
         * @param {object} opt 选项
         *
         *     opt.path {string}
         *         要删除的文件的路径
         *
         * @return {Promise<fio.file.File>} 读取的文件
         *
         * @example
         *
         * ```js
         * fio.file.delete({
         *     path: 'a.txt'
         * }).then(function(file) {
         *     console.log('file deleted: ' + file.path);
         * }).catch(function(e) {
         *     console.log(e.message);
         * });
         * ```
         */


        /**
         * 创建目录
         *
         * @method fio.file.mkdir
         *
         * @grammar fio.file.mkdir(opt)
         *
         * @param {object} opt 选项
         *
         *     opt.path {string}
         *         要创建的目录的路径
         *
         * @return {Promise<fio.file.File>} 已创建的目录
         *
         * @example
         *
         * ```js
         * fio.file.mkdir({
         *     path: '/kityminder/a'
         * }).then(function(file) {
         *     console.log('dir created: ' + file.path);
         * }).catch(function(e) {
         *     console.log(e.message);
         * });
         * ```
         */


        /**
         * 读取指定路径的 ACL
         *
         * @method fio.file.readAcl
         *
         * @grammar fio.file.readAcl(opt)
         *
         * @param {object} opt 选项
         *
         *     opt.path {string}
         *         要读取 ACL 的路径
         *
         * @return {Promise<fio.file.Acl[]>} 读取的 ACL 集合
         *
         * @example
         *
         * ```js
         * fio.file.readAcl({
         *     path: 'a.txt'
         * }).then(function(acl) {
         *     console.table(acl);
         * }).catch(function(e) {
         *     console.log(e.message);
         * });
         * ```
         */


        /**
         * 写入指定路径的 ACL
         *
         * @method fio.file.writeAcl
         *
         * @grammar fio.file.write(opt)
         *
         * @param {object} opt 选项
         *
         *     opt.path {string}
         *         要写入 ACL 的路径
         *     option.acl {object}
         *         要写入的 ACL（username => access）
         *
         * @return {Promise<fio.file.Acl[]>} 写入后 ACL 后，指定路径的 ACL 集合
         *
         * @example
         *
         * ```js
         * fio.file.writeAcl({
         *     path: 'a.txt',
         *     acl: {
         *         techird: fio.file.ACCESS_READ | fio.file.ACCESS_WRITE
         *     }
         * }).then(function(acl) {
         *     console.table(acl);
         * }).catch(function(e) {
         *     console.log(e.message);
         * });
         * ```
         */
        ['read', 'write', 'list', 'move', 'delete', 'mkdir', 'readAcl', 'writeAcl'].forEach(function(operation) {

            fio.file[operation] = function(opt) {
                return fio.user.check().then(function(user) {

                    var provider = opt.provider ? providerMap[opt.provider] : currentProvider;
                    var request = new FileRequest(opt.path, operation, user);

                    if (operation == 'write') {
                        request.dupPolicy = opt.ondup;
                        request.data = new fio.file.Data(opt.content);
                        delete opt.ondup;
                    }

                    if (operation == 'move') {
                        request.newPath = opt.newPath;
                        delete opt.newPath;
                    }

                    if (operation == 'writeAcl') {
                        request.acl = opt.acl;
                        delete opt.acl;
                    }

                    delete opt.provider;
                    delete opt.path;

                    request.extra = opt;

                    // 确保返回的是一个 Promise 对象
                    return Promise.resolve(provider.handle(request));
                });
            };
        });

        // export
        window.fio = fio;
    })(Promise);
/* lib/fio/dist/fio.js end */




/* lib/fio/provider/netdisk/netdisk.js */
    /* global fio:true, jQuery: true */

    /**
     *
     * @fileOverview
     *
     * 为 FIO 提供网盘 IO 支持
     *
     * @author techird
     *
     * 使用网盘的 IO，需要：
     *
     *     1. 在 http://dev.baidu.com 上创建应用。创建应用后，就有相应的 API Key
     *     2. 设置登录回调地址为使用的页面，设置位置：其他API->安全设置
     *     3. 申请 PCS API 权限
     *
     */

    /* TODO: 脱离 jQuery 依赖 */
    (function(window, $) {
        /**
         * 保存应用的 Api Key
         */
        var apiKey;

        /**
         * 登录后会有 access_token，验证后保存的当前用户
         *
         * 因为 API 中的 access_token 都是下划线命名法，所以这里不用骆驼，免得混淆
         */
        var access_token, user;

        /**
         * 用到的 URL 地址
         */
        var urls = {
            /**
             * Baidu OAuth 2.0 授权地址
             */
            'authorize': 'https://openapi.baidu.com/oauth/2.0/authorize',

            /**
             * 用户信息查询 API
             */
            'getLoggedInUser': 'https://openapi.baidu.com/rest/2.0/passport/users/getLoggedInUser',

            /**
             * 当前 URL
             */
            'current': window.location.href,

            /**
             * PCS API 接口
             *
             * @see http://developer.baidu.com/wiki/index.php?title=docs/pcs/rest/file_data_apis_list
             */
            'file': 'https://pcs.baidu.com/rest/2.0/pcs/file',
        };

        /**
         * 提供方的初始化方法
         *
         * @param  {object} opt 选项
         *
         *     opt.apiKey {string} 应用的 api key
         *
         */
        function init(opt) {
            apiKey = opt.apiKey;
        }

        /**
         * 网络请求
         */
        function ajax(opt) {
            return Promise.resolve($.ajax(opt));
        }

        /**
         * 解析 URL 上传递的参数
         * @return {object}
         */
        function urlFragment() {
            var url = urls.current;
            var pattern = /[&\?#](\w+?)=([^&]+)/g;
            var fragment = {};
            var match;

            while ((match = pattern.exec(url))) fragment[match[1]] = match[2];

            return fragment;
        }

        /**
         * 从 Cookie 中读取应用对应的 access_key
         */
        function readAK() {
            var cookie = document.cookie;
            var pattern = new RegExp(apiKey + '_ak=(.+?);');
            var match = pattern.exec(cookie);
            return match && decodeURIComponent(match[1]) || null;
        }

        /**
         * 写入 access_key 到 cookie
         */
        function writeAK(ak, remember) {
            var cookie = apiKey + '_ak=' + encodeURIComponent(ak);
            cookie += '; max-age=' + (remember || 60);
            document.cookie = cookie;
        }

        /**
         * 清空 cookie 中对应的 ak
         */
        function clearAK() {
            document.cookie = apiKey + '_ak=';
        }

        /**
         * 检查用户登录状态
         *
         * @return {Promise<fio.user.User>}
         */
        function check() {

            var fragment = urlFragment();

            // 登录回调；会在参数上有 AK
            if (fragment.access_token) {

                // 把 AK 保存在 Cookie 里
                writeAK(fragment.access_token, fragment.state);

                // 清掉登录回调参数
                document.location.href = urls.current.substr(0, document.location.href.indexOf('#'));

            }

            // 非登录回调，读取 AK
            else {

                // 尝试从 Cookie 读取 AK
                access_token = readAK();

                // 读取失败返回
                if (!access_token) return null;
            }

            // 使用 AK 获得用户信息
            return ajax({

                url: urls.getLoggedInUser,
                data: {
                    access_token: access_token
                },
                dataType: 'jsonp'

            }).then(function(ret) {

                // 授权错误，可能是 AK 过时了
                if (ret.error) {
                    access_token = null;
                    clearAK();
                    return null;
                }

                user = new fio.user.User(ret.uid, ret.uname);

                user.smallImage = 'http://tb.himg.baidu.com/sys/portraitn/item/' + ret.portrait;
                user.largeImage = 'http://tb.himg.baidu.com/sys/portrait/item/' + ret.portrait;
                user.access_token = access_token;

                return user;
            });
        }

        /**
         * 登录，直接跳到百度授权登录页面
         *
         * @param  {Object} opt 登录选项
         *
         *     opt.force {boolean}
         *         表示是否强制显示登录面板，而不是自动登录。默认为 false
         *
         *     opt.remember {int}
         *         表示是否记住用户登录状态，值表示记住的时间（秒）
         */
        function login(opt) {
            window.location.href = urls.authorize + '?' + [
                'client_id=' + apiKey,
                'response_type=token',
                'scope=basic netdisk',
                'redirect_uri=' + urls.current, // 调回到当前页面，check 的时候就能捕获 AK
                'display=page',
                'force_login=' + (opt && opt.force ? 1 : 0),
                'state=' + opt.remember
            ].join('&');
        }

        /**
         * 注销
         * @return {[type]} [description]
         */
        function logout() {
            var logouted = user;
            user = null;
            access_token = null;
            clearAK();
            return logouted;
        }

        // 转换 PCS 的文件数据为 fio.file.File
        function pcs2file(pcs_file) {
            var file = new fio.file.File(pcs_file.path);
            file.createTime = new Date(pcs_file.ctime * 1000);
            file.modifyTime = new Date(pcs_file.mtime * 1000);
            file.size = pcs_file.size;
            file.isDir = !!pcs_file.isdir;
            return file;
        }

        function getMeta(path) {
            return ajax({
                url: urls.file,
                data: {
                    method: 'meta',
                    access_token: access_token,
                    path: path
                },
                dataType: 'json'
            });
        }

        // 根据文件请求分发处理
        function handle(request) {
            if (!access_token) throw new Error('Not Authorized');

            var param = {
                access_token: access_token
            };

            var opt = {
                url: urls.file,
                type: 'GET',
                data: param,
                dataType: 'JSON'
            };

            // 处理 path 参数
            if (request.method != fio.file.METHOD_MOVE) {
                param.path = request.path;
            } else {
                param.from = request.path;
            }

            // 处理其他参数
            switch (request.method) {

                case fio.file.METHOD_ACL_READ:
                case fio.file.METHOD_ACL_WRITE:
                    throw new Error('Not Supported File Request:' + request.method);

                case fio.file.METHOD_READ:
                    opt.dataType = 'text';
                    param.method = 'download';
                    break;

                case fio.file.METHOD_WRITE:
                    opt.type = 'POST';
                    param.method = 'upload';
                    param.file = request.data.content;
                    param.ondup = request.dupPolicy == fio.file.DUP_OVERWRITE ? 'overwrite' : 'newcopy';
                    break;

                case fio.file.METHOD_LIST:
                    param.method = 'list';
                    break;

                case fio.file.METHOD_MKDIR:
                    opt.type = 'POST';
                    param.method = 'mkdir';
                    break;

                case fio.file.METHOD_MOVE:
                    opt.type = 'POST';
                    param.method = 'move';
                    param.to = request.newPath;
                    break;

                case fio.file.METHOD_DELETE:
                    opt.type = 'POST';
                    param.method = 'delete';
                    break;
            }

            function throwError(response) {
                throw new Error([response.error_code, response.error_msg]);
            }

            return ajax(opt).then(function(response) {

                // 调用失败
                if (response.error_code) {
                    throwError(response);
                }

                // 读取操作需要抓取文件元数据后返回
                if (request.method === fio.file.METHOD_READ) {

                    return getMeta(param.path).then(function(meta) {
                        var file = pcs2file(meta.list[0]);
                        file.data = new fio.file.Data(response);
                        return file;
                    });
                }

                // 列文件返回
                if (request.method == fio.file.METHOD_LIST) {
                    return response.list.map(pcs2file);
                }

                // 移动文件返回
                if (request.method == fio.file.METHOD_MOVE) {
                    return getMeta(response.to).then(pcs2file);
                }

                // 删除文件返回
                if (request.method == fio.file.METHOD_DELETE) {
                    return new fio.file.File(request.path);
                }

                var file = pcs2file(response);

                // 写文件返回
                if (request.method === fio.file.METHOD_WRITE) {
                    file.data = request.data;
                }

                return file;

            }, function(e) {
                console.log(e);
                if (e.responseText) throwError(JSON.parse(e.responseText));
                else throw e;
            });
        }

        // 用户系统实现
        fio.user.impl({
            check: check,
            login: login,
            logout: logout
        });

        // 网盘 IO 提供实现
        fio.provider.register('netdisk', {
            init: init,
            handle: handle
        });
    })(window, jQuery);
/* lib/fio/provider/netdisk/netdisk.js end */




/* lib/jquery.xml2json.js */
    /*
     ### jQuery XML to JSON Plugin v1.3 - 2013-02-18 ###
     * http://www.fyneworks.com/ - diego@fyneworks.com
    	* Licensed under http://en.wikipedia.org/wiki/MIT_License
     ###
     Website: http://www.fyneworks.com/jquery/xml-to-json/
    *//*
     # INSPIRED BY: http://www.terracoder.com/
               AND: http://www.thomasfrank.se/xml_to_json.html
    											AND: http://www.kawa.net/works/js/xml/objtree-e.html
    *//*
     This simple script converts XML (document of code) into a JSON object. It is the combination of 2
     'xml to json' great parsers (see below) which allows for both 'simple' and 'extended' parsing modes.
    */
    // Avoid collisions
    ;if(window.jQuery) (function($){
     
     // Add function to jQuery namespace
     $.extend({
      
      // converts xml documents and xml text to json object
      xml2json: function(xml, extended) {
       if(!xml) return {}; // quick fail
       
       //### PARSER LIBRARY
       // Core function
       function parseXML(node, simple){
        if(!node) return null;
        var txt = '', obj = null, att = null;
        var nt = node.nodeType, nn = jsVar(node.localName || node.nodeName);
        var nv = node.text || node.nodeValue || '';
        /*DBG*/ //if(window.console) console.log(['x2j',nn,nt,nv.length+' bytes']);
        if(node.childNodes){
         if(node.childNodes.length>0){
          /*DBG*/ //if(window.console) console.log(['x2j',nn,'CHILDREN',node.childNodes]);
          $.each(node.childNodes, function(n,cn){
           var cnt = cn.nodeType, cnn = jsVar(cn.localName || cn.nodeName);
           var cnv = cn.text || cn.nodeValue || '';
           /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>a',cnn,cnt,cnv]);
           if(cnt == 8){
            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>b',cnn,'COMMENT (ignore)']);
            return; // ignore comment node
           }
           else if(cnt == 3 || cnt == 4 || !cnn){
            // ignore white-space in between tags
            if(cnv.match(/^\s+$/)){
             /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>c',cnn,'WHITE-SPACE (ignore)']);
             return;
            };
            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>d',cnn,'TEXT']);
            txt += cnv.replace(/^\s+/,'').replace(/\s+$/,'');
    								// make sure we ditch trailing spaces from markup
           }
           else{
            /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>e',cnn,'OBJECT']);
            obj = obj || {};
            if(obj[cnn]){
             /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>f',cnn,'ARRAY']);
             
    									// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
    									if(!obj[cnn].length) obj[cnn] = myArr(obj[cnn]);
    									obj[cnn] = myArr(obj[cnn]);
             
    									obj[cnn][ obj[cnn].length ] = parseXML(cn, true/* simple */);
             obj[cnn].length = obj[cnn].length;
            }
            else{
             /*DBG*/ //if(window.console) console.log(['x2j',nn,'node>g',cnn,'dig deeper...']);
             obj[cnn] = parseXML(cn);
            };
           };
          });
         };//node.childNodes.length>0
        };//node.childNodes
        if(node.attributes){
         if(node.attributes.length>0){
          /*DBG*/ //if(window.console) console.log(['x2j',nn,'ATTRIBUTES',node.attributes])
          att = {}; obj = obj || {};
          $.each(node.attributes, function(a,at){
           var atn = jsVar(at.name), atv = at.value;
           att[atn] = atv;
           if(obj[atn]){
            /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'ARRAY']);
            
    								// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
    								//if(!obj[atn].length) obj[atn] = myArr(obj[atn]);//[ obj[ atn ] ];
            obj[cnn] = myArr(obj[cnn]);
    								
    								obj[atn][ obj[atn].length ] = atv;
            obj[atn].length = obj[atn].length;
           }
           else{
            /*DBG*/ //if(window.console) console.log(['x2j',nn,'attr>',atn,'TEXT']);
            obj[atn] = atv;
           };
          });
          //obj['attributes'] = att;
         };//node.attributes.length>0
        };//node.attributes
        if(obj){
         obj = $.extend( (txt!='' ? new String(txt) : {}),/* {text:txt},*/ obj || {}/*, att || {}*/);
         //txt = (obj.text) ? (typeof(obj.text)=='object' ? obj.text : [obj.text || '']).concat([txt]) : txt;
         txt = (obj.text) ? ([obj.text || '']).concat([txt]) : txt;
         if(txt) obj.text = txt;
         txt = '';
        };
        var out = obj || txt;
        //console.log([extended, simple, out]);
        if(extended){
         if(txt) out = {};//new String(out);
         txt = out.text || txt || '';
         if(txt) out.text = txt;
         if(!simple) out = myArr(out);
        };
        return out;
       };// parseXML
       // Core Function End
       // Utility functions
       var jsVar = function(s){ return String(s || '').replace(/-/g,"_"); };
       
    			// NEW isNum function: 01/09/2010
    			// Thanks to Emile Grau, GigaTecnologies S.L., www.gigatransfer.com, www.mygigamail.com
    			function isNum(s){
    				// based on utility function isNum from xml2json plugin (http://www.fyneworks.com/ - diego@fyneworks.com)
    				// few bugs corrected from original function :
    				// - syntax error : regexp.test(string) instead of string.test(reg)
    				// - regexp modified to accept  comma as decimal mark (latin syntax : 25,24 )
    				// - regexp modified to reject if no number before decimal mark  : ".7" is not accepted
    				// - string is "trimmed", allowing to accept space at the beginning and end of string
    				var regexp=/^((-)?([0-9]+)(([\.\,]{0,1})([0-9]+))?$)/
    				return (typeof s == "number") || regexp.test(String((s && typeof s == "string") ? jQuery.trim(s) : ''));
    			};
    			// OLD isNum function: (for reference only)
    			//var isNum = function(s){ return (typeof s == "number") || String((s && typeof s == "string") ? s : '').test(/^((-)?([0-9]*)((\.{0,1})([0-9]+))?$)/); };
    																
       var myArr = function(o){
        
    				// http://forum.jquery.com/topic/jquery-jquery-xml2json-problems-when-siblings-of-the-same-tagname-only-have-a-textnode-as-a-child
    				//if(!o.length) o = [ o ]; o.length=o.length;
        if(!$.isArray(o)) o = [ o ]; o.length=o.length;
    				
    				// here is where you can attach additional functionality, such as searching and sorting...
        return o;
       };
       // Utility functions End
       //### PARSER LIBRARY END
       
       // Convert plain text to xml
       if(typeof xml=='string') xml = $.text2xml(xml);
       
       // Quick fail if not xml (or if this is a node)
       if(!xml.nodeType) return;
       if(xml.nodeType == 3 || xml.nodeType == 4) return xml.nodeValue;
       
       // Find xml root node
       var root = (xml.nodeType == 9) ? xml.documentElement : xml;
       
       // Convert xml to json
       var out = parseXML(root, true /* simple */);
       
       // Clean-up memory
       xml = null; root = null;
       
       // Send output
       return out;
      },
      
      // Convert text to XML DOM
      text2xml: function(str) {
       // NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
       //return $(xml)[0];
       
       /* prior to jquery 1.9 */
       /*
       var out;
       try{
        var xml = ((!$.support.opacity && !$.support.style))?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
        xml.async = false;
       }catch(e){ throw new Error("XML Parser could not be instantiated") };
       try{
        if((!$.support.opacity && !$.support.style)) out = (xml.loadXML(str))?xml:false;
        else out = xml.parseFromString(str, "text/xml");
       }catch(e){ throw new Error("Error parsing XML string") };
       return out;
       */

       /* jquery 1.9+ */
       return $.parseXML(str);
      }
    		
     }); // extend $

    })(jQuery);
/* lib/jquery.xml2json.js end */




/* lib/zip.js */
    /*
     Copyright (c) 2012 Gildas Lormeau. All rights reserved.

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions are met:

     1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in
     the documentation and/or other materials provided with the distribution.

     3. The names of the authors may not be used to endorse or promote products
     derived from this software without specific prior written permission.

     THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
     INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
     FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
     INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
     OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    (function(obj) {

    	var ERR_BAD_FORMAT = "File format is not recognized.";
    	var ERR_ENCRYPTED = "File contains encrypted entry.";
    	var ERR_ZIP64 = "File is using Zip64 (4gb+ file size).";
    	var ERR_READ = "Error while reading zip file.";
    	var ERR_WRITE = "Error while writing zip file.";
    	var ERR_WRITE_DATA = "Error while writing file data.";
    	var ERR_READ_DATA = "Error while reading file data.";
    	var ERR_DUPLICATED_NAME = "File already exists.";
    	var ERR_HTTP_RANGE = "HTTP Range not supported.";
    	var CHUNK_SIZE = 512 * 1024;

    	var INFLATE_JS = "inflate.js";
    	var DEFLATE_JS = "deflate.js";

    	var appendABViewSupported;
    	try {
    		appendABViewSupported = new Blob([ getDataHelper(0).view ]).size == 0;
    	} catch (e) {
    	}	

    	function Crc32() {
    		var crc = -1, that = this;
    		that.append = function(data) {
    			var offset, table = that.table;
    			for (offset = 0; offset < data.length; offset++)
    				crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
    		};
    		that.get = function() {
    			return ~crc;
    		};
    	}
    	Crc32.prototype.table = (function() {
    		var i, j, t, table = [];
    		for (i = 0; i < 256; i++) {
    			t = i;
    			for (j = 0; j < 8; j++)
    				if (t & 1)
    					t = (t >>> 1) ^ 0xEDB88320;
    				else
    					t = t >>> 1;
    			table[i] = t;
    		}
    		return table;
    	})();

    	function blobSlice(blob, index, length) {
    		if (blob.slice)
    			return blob.slice(index, index + length);
    		else if (blob.webkitSlice)
    			return blob.webkitSlice(index, index + length);
    		else if (blob.mozSlice)
    			return blob.mozSlice(index, index + length);
    		else if (blob.msSlice)
    			return blob.msSlice(index, index + length);
    	}

    	function getDataHelper(byteLength, bytes) {
    		var dataBuffer, dataArray;
    		dataBuffer = new ArrayBuffer(byteLength);
    		dataArray = new Uint8Array(dataBuffer);
    		if (bytes)
    			dataArray.set(bytes, 0);
    		return {
    			buffer : dataBuffer,
    			array : dataArray,
    			view : new DataView(dataBuffer)
    		};
    	}

    	// Readers
    	function Reader() {
    	}

    	function TextReader(text) {
    		var that = this, blobReader;

    		function init(callback, onerror) {
    			var blob = new Blob([ text ], {
    				type : "text/plain"
    			});
    			blobReader = new BlobReader(blob);
    			blobReader.init(function() {
    				that.size = blobReader.size;
    				callback();
    			}, onerror);
    		}

    		function readUint8Array(index, length, callback, onerror) {
    			blobReader.readUint8Array(index, length, callback, onerror);
    		}

    		that.size = 0;
    		that.init = init;
    		that.readUint8Array = readUint8Array;
    	}
    	TextReader.prototype = new Reader();
    	TextReader.prototype.constructor = TextReader;

    	function Data64URIReader(dataURI) {
    		var that = this, dataStart;

    		function init(callback) {
    			var dataEnd = dataURI.length;
    			while (dataURI.charAt(dataEnd - 1) == "=")
    				dataEnd--;
    			dataStart = dataURI.indexOf(",") + 1;
    			that.size = Math.floor((dataEnd - dataStart) * 0.75);
    			callback();
    		}

    		function readUint8Array(index, length, callback) {
    			var i, data = getDataHelper(length);
    			var start = Math.floor(index / 3) * 4;
    			var end = Math.ceil((index + length) / 3) * 4;
    			var bytes = obj.atob(dataURI.substring(start + dataStart, end + dataStart));
    			var delta = index - Math.floor(start / 4) * 3;
    			for (i = delta; i < delta + length; i++)
    				data.array[i - delta] = bytes.charCodeAt(i);
    			callback(data.array);
    		}

    		that.size = 0;
    		that.init = init;
    		that.readUint8Array = readUint8Array;
    	}
    	Data64URIReader.prototype = new Reader();
    	Data64URIReader.prototype.constructor = Data64URIReader;

    	function BlobReader(blob) {
    		var that = this;

    		function init(callback) {
    			this.size = blob.size;
    			callback();
    		}

    		function readUint8Array(index, length, callback, onerror) {
    			var reader = new FileReader();
    			reader.onload = function(e) {
    				callback(new Uint8Array(e.target.result));
    			};
    			reader.onerror = onerror;
    			reader.readAsArrayBuffer(blobSlice(blob, index, length));
    		}

    		that.size = 0;
    		that.init = init;
    		that.readUint8Array = readUint8Array;
    	}
    	BlobReader.prototype = new Reader();
    	BlobReader.prototype.constructor = BlobReader;

    	function HttpReader(url) {
    		var that = this;

    		function getData(callback, onerror) {
    			var request;
    			if (!that.data) {
    				request = new XMLHttpRequest();
    				request.addEventListener("load", function() {
    					if (!that.size)
    						that.size = Number(request.getResponseHeader("Content-Length"));
    					that.data = new Uint8Array(request.response);
    					callback();
    				}, false);
    				request.addEventListener("error", onerror, false);
    				request.open("GET", url);
    				request.responseType = "arraybuffer";
    				request.send();
    			} else
    				callback();
    		}

    		function init(callback, onerror) {
    			var request = new XMLHttpRequest();
    			request.addEventListener("load", function() {
    				that.size = Number(request.getResponseHeader("Content-Length"));
    				callback();
    			}, false);
    			request.addEventListener("error", onerror, false);
    			request.open("HEAD", url);
    			request.send();
    		}

    		function readUint8Array(index, length, callback, onerror) {
    			getData(function() {
    				callback(new Uint8Array(that.data.subarray(index, index + length)));
    			}, onerror);
    		}

    		that.size = 0;
    		that.init = init;
    		that.readUint8Array = readUint8Array;
    	}
    	HttpReader.prototype = new Reader();
    	HttpReader.prototype.constructor = HttpReader;

    	function HttpRangeReader(url) {
    		var that = this;

    		function init(callback, onerror) {
    			var request = new XMLHttpRequest();
    			request.addEventListener("load", function() {
    				that.size = Number(request.getResponseHeader("Content-Length"));
    				if (request.getResponseHeader("Accept-Ranges") == "bytes")
    					callback();
    				else
    					onerror(ERR_HTTP_RANGE);
    			}, false);
    			request.addEventListener("error", onerror, false);
    			request.open("HEAD", url);
    			request.send();
    		}

    		function readArrayBuffer(index, length, callback, onerror) {
    			var request = new XMLHttpRequest();
    			request.open("GET", url);
    			request.responseType = "arraybuffer";
    			request.setRequestHeader("Range", "bytes=" + index + "-" + (index + length - 1));
    			request.addEventListener("load", function() {
    				callback(request.response);
    			}, false);
    			request.addEventListener("error", onerror, false);
    			request.send();
    		}

    		function readUint8Array(index, length, callback, onerror) {
    			readArrayBuffer(index, length, function(arraybuffer) {
    				callback(new Uint8Array(arraybuffer));
    			}, onerror);
    		}

    		that.size = 0;
    		that.init = init;
    		that.readUint8Array = readUint8Array;
    	}
    	HttpRangeReader.prototype = new Reader();
    	HttpRangeReader.prototype.constructor = HttpRangeReader;

    	// Writers

    	function Writer() {
    	}
    	Writer.prototype.getData = function(callback) {
    		callback(this.data);
    	};

    	function TextWriter() {
    		var that = this, blob;

    		function init(callback) {
    			blob = new Blob([], {
    				type : "text/plain"
    			});
    			callback();
    		}

    		function writeUint8Array(array, callback) {
    			blob = new Blob([ blob, appendABViewSupported ? array : array.buffer ], {
    				type : "text/plain"
    			});
    			callback();
    		}

    		function getData(callback, onerror) {
    			var reader = new FileReader();
    			reader.onload = function(e) {
    				callback(e.target.result);
    			};
    			reader.onerror = onerror;
    			reader.readAsText(blob);
    		}

    		that.init = init;
    		that.writeUint8Array = writeUint8Array;
    		that.getData = getData;
    	}
    	TextWriter.prototype = new Writer();
    	TextWriter.prototype.constructor = TextWriter;

    	function Data64URIWriter(contentType) {
    		var that = this, data = "", pending = "";

    		function init(callback) {
    			data += "data:" + (contentType || "") + ";base64,";
    			callback();
    		}

    		function writeUint8Array(array, callback) {
    			var i, delta = pending.length, dataString = pending;
    			pending = "";
    			for (i = 0; i < (Math.floor((delta + array.length) / 3) * 3) - delta; i++)
    				dataString += String.fromCharCode(array[i]);
    			for (; i < array.length; i++)
    				pending += String.fromCharCode(array[i]);
    			if (dataString.length > 2)
    				data += obj.btoa(dataString);
    			else
    				pending = dataString;
    			callback();
    		}

    		function getData(callback) {
    			callback(data + obj.btoa(pending));
    		}

    		that.init = init;
    		that.writeUint8Array = writeUint8Array;
    		that.getData = getData;
    	}
    	Data64URIWriter.prototype = new Writer();
    	Data64URIWriter.prototype.constructor = Data64URIWriter;

    	function FileWriter(fileEntry, contentType) {
    		var writer, that = this;

    		function init(callback, onerror) {
    			fileEntry.createWriter(function(fileWriter) {
    				writer = fileWriter;
    				callback();
    			}, onerror);
    		}

    		function writeUint8Array(array, callback, onerror) {
    			var blob = new Blob([ appendABViewSupported ? array : array.buffer ], {
    				type : contentType
    			});
    			writer.onwrite = function() {
    				writer.onwrite = null;
    				callback();
    			};
    			writer.onerror = onerror;
    			writer.write(blob);
    		}

    		function getData(callback) {
    			fileEntry.file(callback);
    		}

    		that.init = init;
    		that.writeUint8Array = writeUint8Array;
    		that.getData = getData;
    	}
    	FileWriter.prototype = new Writer();
    	FileWriter.prototype.constructor = FileWriter;

    	function BlobWriter(contentType) {
    		var blob, that = this;

    		function init(callback) {
    			blob = new Blob([], {
    				type : contentType
    			});
    			callback();
    		}

    		function writeUint8Array(array, callback) {
    			blob = new Blob([ blob, appendABViewSupported ? array : array.buffer ], {
    				type : contentType
    			});
    			callback();
    		}

    		function getData(callback) {
    			callback(blob);
    		}

    		that.init = init;
    		that.writeUint8Array = writeUint8Array;
    		that.getData = getData;
    	}
    	BlobWriter.prototype = new Writer();
    	BlobWriter.prototype.constructor = BlobWriter;

    	// inflate/deflate core functions

    	function launchWorkerProcess(worker, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
    		var chunkIndex = 0, index, outputSize;

    		function onflush() {
    			worker.removeEventListener("message", onmessage, false);
    			onend(outputSize);
    		}

    		function onmessage(event) {
    			var message = event.data, data = message.data;

    			if (message.onappend) {
    				outputSize += data.length;
    				writer.writeUint8Array(data, function() {
    					onappend(false, data);
    					step();
    				}, onwriteerror);
    			}
    			if (message.onflush)
    				if (data) {
    					outputSize += data.length;
    					writer.writeUint8Array(data, function() {
    						onappend(false, data);
    						onflush();
    					}, onwriteerror);
    				} else
    					onflush();
    			if (message.progress && onprogress)
    				onprogress(index + message.current, size);
    		}

    		function step() {
    			index = chunkIndex * CHUNK_SIZE;
    			if (index < size)
    				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
    					worker.postMessage({
    						append : true,
    						data : array
    					});
    					chunkIndex++;
    					if (onprogress)
    						onprogress(index, size);
    					onappend(true, array);
    				}, onreaderror);
    			else
    				worker.postMessage({
    					flush : true
    				});
    		}

    		outputSize = 0;
    		worker.addEventListener("message", onmessage, false);
    		step();
    	}

    	function launchProcess(process, reader, writer, offset, size, onappend, onprogress, onend, onreaderror, onwriteerror) {
    		var chunkIndex = 0, index, outputSize = 0;

    		function step() {
    			var outputData;
    			index = chunkIndex * CHUNK_SIZE;
    			if (index < size)
    				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(inputData) {
    					var outputData = process.append(inputData, function() {
    						if (onprogress)
    							onprogress(offset + index, size);
    					});
    					outputSize += outputData.length;
    					onappend(true, inputData);
    					writer.writeUint8Array(outputData, function() {
    						onappend(false, outputData);
    						chunkIndex++;
    						setTimeout(step, 1);
    					}, onwriteerror);
    					if (onprogress)
    						onprogress(index, size);
    				}, onreaderror);
    			else {
    				outputData = process.flush();
    				if (outputData) {
    					outputSize += outputData.length;
    					writer.writeUint8Array(outputData, function() {
    						onappend(false, outputData);
    						onend(outputSize);
    					}, onwriteerror);
    				} else
    					onend(outputSize);
    			}
    		}

    		step();
    	}

    	function inflate(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
    		var worker, crc32 = new Crc32();

    		function oninflateappend(sending, array) {
    			if (computeCrc32 && !sending)
    				crc32.append(array);
    		}

    		function oninflateend(outputSize) {
    			onend(outputSize, crc32.get());
    		}

    		if (obj.zip.useWebWorkers) {
    			worker = new Worker(obj.zip.inflateJSPath || INFLATE_JS);//INFLATE_JS
    			launchWorkerProcess(worker, reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
    		} else
    			launchProcess(new obj.zip.Inflater(), reader, writer, offset, size, oninflateappend, onprogress, oninflateend, onreaderror, onwriteerror);
    		return worker;
    	}

    	function deflate(reader, writer, level, onend, onprogress, onreaderror, onwriteerror) {
    		var worker, crc32 = new Crc32();

    		function ondeflateappend(sending, array) {
    			if (sending)
    				crc32.append(array);
    		}

    		function ondeflateend(outputSize) {
    			onend(outputSize, crc32.get());
    		}

    		function onmessage() {
    			worker.removeEventListener("message", onmessage, false);
    			launchWorkerProcess(worker, reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
    		}

    		if (obj.zip.useWebWorkers) {
    			worker = new Worker(obj.zip.workerScriptsPath + DEFLATE_JS);
    			worker.addEventListener("message", onmessage, false);
    			worker.postMessage({
    				init : true,
    				level : level
    			});
    		} else
    			launchProcess(new obj.zip.Deflater(), reader, writer, 0, reader.size, ondeflateappend, onprogress, ondeflateend, onreaderror, onwriteerror);
    		return worker;
    	}

    	function copy(reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
    		var chunkIndex = 0, crc32 = new Crc32();

    		function step() {
    			var index = chunkIndex * CHUNK_SIZE;
    			if (index < size)
    				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(array) {
    					if (computeCrc32)
    						crc32.append(array);
    					if (onprogress)
    						onprogress(index, size, array);
    					writer.writeUint8Array(array, function() {
    						chunkIndex++;
    						step();
    					}, onwriteerror);
    				}, onreaderror);
    			else
    				onend(size, crc32.get());
    		}

    		step();
    	}

    	// ZipReader

    	function decodeASCII(str) {
    		var i, out = "", charCode, extendedASCII = [ '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4', '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB',
    				'\u00E8', '\u00EF', '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6', '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9',
    				'\u00FF', '\u00D6', '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1', '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1',
    				'\u00AA', '\u00BA', '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB', '\u00BB', '_', '_', '_', '\u00A6', '\u00A6',
    				'\u00C1', '\u00C2', '\u00C0', '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-', '-', '+', '-', '+', '\u00E3',
    				'\u00C3', '+', '+', '-', '-', '\u00A6', '-', '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i', '\u00CD', '\u00CE',
    				'\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_', '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5', '\u00FE',
    				'\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD', '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
    				'\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3', '\u00B2', '_', ' ' ];
    		for (i = 0; i < str.length; i++) {
    			charCode = str.charCodeAt(i) & 0xFF;
    			if (charCode > 127)
    				out += extendedASCII[charCode - 128];
    			else
    				out += String.fromCharCode(charCode);
    		}
    		return out;
    	}

    	function decodeUTF8(str_data) {
    		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;

    		str_data += '';

    		while (i < str_data.length) {
    			c1 = str_data.charCodeAt(i);
    			if (c1 < 128) {
    				tmp_arr[ac++] = String.fromCharCode(c1);
    				i++;
    			} else if (c1 > 191 && c1 < 224) {
    				c2 = str_data.charCodeAt(i + 1);
    				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
    				i += 2;
    			} else {
    				c2 = str_data.charCodeAt(i + 1);
    				c3 = str_data.charCodeAt(i + 2);
    				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    				i += 3;
    			}
    		}

    		return tmp_arr.join('');
    	}

    	function getString(bytes) {
    		var i, str = "";
    		for (i = 0; i < bytes.length; i++)
    			str += String.fromCharCode(bytes[i]);
    		return str;
    	}

    	function getDate(timeRaw) {
    		var date = (timeRaw & 0xffff0000) >> 16, time = timeRaw & 0x0000ffff;
    		try {
    			return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5,
    					(time & 0x001F) * 2, 0);
    		} catch (e) {
    		}
    	}

    	function readCommonHeader(entry, data, index, centralDirectory, onerror) {
    		entry.version = data.view.getUint16(index, true);
    		entry.bitFlag = data.view.getUint16(index + 2, true);
    		entry.compressionMethod = data.view.getUint16(index + 4, true);
    		entry.lastModDateRaw = data.view.getUint32(index + 6, true);
    		entry.lastModDate = getDate(entry.lastModDateRaw);
    		if ((entry.bitFlag & 0x01) === 0x01) {
    			onerror(ERR_ENCRYPTED);
    			return;
    		}
    		if (centralDirectory || (entry.bitFlag & 0x0008) != 0x0008) {
    			entry.crc32 = data.view.getUint32(index + 10, true);
    			entry.compressedSize = data.view.getUint32(index + 14, true);
    			entry.uncompressedSize = data.view.getUint32(index + 18, true);
    		}
    		if (entry.compressedSize === 0xFFFFFFFF || entry.uncompressedSize === 0xFFFFFFFF) {
    			onerror(ERR_ZIP64);
    			return;
    		}
    		entry.filenameLength = data.view.getUint16(index + 22, true);
    		entry.extraFieldLength = data.view.getUint16(index + 24, true);
    	}

    	function createZipReader(reader, onerror) {
    		function Entry() {
    		}

    		Entry.prototype.getData = function(writer, onend, onprogress, checkCrc32) {
    			var that = this, worker;

    			function terminate(callback, param) {
    				if (worker)
    					worker.terminate();
    				worker = null;
    				if (callback)
    					callback(param);
    			}

    			function testCrc32(crc32) {
    				var dataCrc32 = getDataHelper(4);
    				dataCrc32.view.setUint32(0, crc32);
    				return that.crc32 == dataCrc32.view.getUint32(0);
    			}

    			function getWriterData(uncompressedSize, crc32) {
    				if (checkCrc32 && !testCrc32(crc32))
    					onreaderror();
    				else
    					writer.getData(function(data) {
    						terminate(onend, data);
    					});
    			}

    			function onreaderror() {
    				terminate(onerror, ERR_READ_DATA);
    			}

    			function onwriteerror() {
    				terminate(onerror, ERR_WRITE_DATA);
    			}

    			reader.readUint8Array(that.offset, 30, function(bytes) {
    				var data = getDataHelper(bytes.length, bytes), dataOffset;
    				if (data.view.getUint32(0) != 0x504b0304) {
    					onerror(ERR_BAD_FORMAT);
    					return;
    				}
    				readCommonHeader(that, data, 4, false, function(error) {
    					onerror(error);
    					return;
    				});
    				dataOffset = that.offset + 30 + that.filenameLength + that.extraFieldLength;
    				writer.init(function() {
    					if (that.compressionMethod === 0)
    						copy(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
    					else
    						worker = inflate(reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
    				}, onwriteerror);
    			}, onreaderror);
    		};

    		function seekEOCDR(offset, entriesCallback) {
    			reader.readUint8Array(reader.size - offset, offset, function(bytes) {
    				var dataView = getDataHelper(bytes.length, bytes).view;
    				try{
    					if (dataView.getUint32(0) != 0x504b0506) {
    						seekEOCDR(offset + 1, entriesCallback);
    					} else {
    						entriesCallback(dataView);
    					}
    				}catch(e){
    					console.log(e);
    					onerror(ERR_READ);
    				}

    			}, function() {
    				onerror(ERR_READ);
    			});
    		}

    		return {
    			getEntries : function(callback) {
    				if (reader.size < 22) {
    					onerror(ERR_BAD_FORMAT);
    					return;
    				}
    				// look for End of central directory record
    				seekEOCDR(22, function(dataView) {
    					var datalength, fileslength;
    					datalength = dataView.getUint32(16, true);
    					fileslength = dataView.getUint16(8, true);
    					reader.readUint8Array(datalength, reader.size - datalength, function(bytes) {
    						var i, index = 0, entries = [], entry, filename, comment, data = getDataHelper(bytes.length, bytes);
    						for (i = 0; i < fileslength; i++) {
    							entry = new Entry();
    							if (data.view.getUint32(index) != 0x504b0102) {
    								onerror(ERR_BAD_FORMAT);
    								return;
    							}
    							readCommonHeader(entry, data, index + 6, true, function(error) {
    								onerror(error);
    								return;
    							});
    							entry.commentLength = data.view.getUint16(index + 32, true);
    							entry.directory = ((data.view.getUint8(index + 38) & 0x10) == 0x10);
    							entry.offset = data.view.getUint32(index + 42, true);
    							filename = getString(data.array.subarray(index + 46, index + 46 + entry.filenameLength));
    							entry.filename = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(filename) : decodeASCII(filename);
    							if (!entry.directory && entry.filename.charAt(entry.filename.length - 1) == "/")
    								entry.directory = true;
    							comment = getString(data.array.subarray(index + 46 + entry.filenameLength + entry.extraFieldLength, index + 46
    									+ entry.filenameLength + entry.extraFieldLength + entry.commentLength));
    							entry.comment = ((entry.bitFlag & 0x0800) === 0x0800) ? decodeUTF8(comment) : decodeASCII(comment);
    							entries.push(entry);
    							index += 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength;
    						}
    						callback(entries);
    					}, function() {
    						onerror(ERR_READ);
    					});
    				});
    			},
    			close : function(callback) {
    				if (callback)
    					callback();
    			}
    		};
    	}

    	// ZipWriter

    	function encodeUTF8(string) {
    		var n, c1, enc, utftext = [], start = 0, end = 0, stringl = string.length;
    		for (n = 0; n < stringl; n++) {
    			c1 = string.charCodeAt(n);
    			enc = null;
    			if (c1 < 128)
    				end++;
    			else if (c1 > 127 && c1 < 2048)
    				enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
    			else
    				enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
    			if (enc != null) {
    				if (end > start)
    					utftext += string.slice(start, end);
    				utftext += enc;
    				start = end = n + 1;
    			}
    		}
    		if (end > start)
    			utftext += string.slice(start, stringl);
    		return utftext;
    	}

    	function getBytes(str) {
    		var i, array = [];
    		for (i = 0; i < str.length; i++)
    			array.push(str.charCodeAt(i));
    		return array;
    	}

    	function createZipWriter(writer, onerror, dontDeflate) {
    		var worker, files = [], filenames = [], datalength = 0;

    		function terminate(callback, message) {
    			if (worker)
    				worker.terminate();
    			worker = null;
    			if (callback)
    				callback(message);
    		}

    		function onwriteerror() {
    			terminate(onerror, ERR_WRITE);
    		}

    		function onreaderror() {
    			terminate(onerror, ERR_READ_DATA);
    		}

    		return {
    			add : function(name, reader, onend, onprogress, options) {
    				var header, filename, date;

    				function writeHeader(callback) {
    					var data;
    					date = options.lastModDate || new Date();
    					header = getDataHelper(26);
    					files[name] = {
    						headerArray : header.array,
    						directory : options.directory,
    						filename : filename,
    						offset : datalength,
    						comment : getBytes(encodeUTF8(options.comment || ""))
    					};
    					header.view.setUint32(0, 0x14000808);
    					if (options.version)
    						header.view.setUint8(0, options.version);
    					if (!dontDeflate && options.level != 0 && !options.directory)
    						header.view.setUint16(4, 0x0800);
    					header.view.setUint16(6, (((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2, true);
    					header.view.setUint16(8, ((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate(), true);
    					header.view.setUint16(22, filename.length, true);
    					data = getDataHelper(30 + filename.length);
    					data.view.setUint32(0, 0x504b0304);
    					data.array.set(header.array, 4);
    					data.array.set(filename, 30);
    					datalength += data.array.length;
    					writer.writeUint8Array(data.array, callback, onwriteerror);
    				}

    				function writeFooter(compressedLength, crc32) {
    					var footer = getDataHelper(16);
    					datalength += compressedLength || 0;
    					footer.view.setUint32(0, 0x504b0708);
    					if (typeof crc32 != "undefined") {
    						header.view.setUint32(10, crc32, true);
    						footer.view.setUint32(4, crc32, true);
    					}
    					if (reader) {
    						footer.view.setUint32(8, compressedLength, true);
    						header.view.setUint32(14, compressedLength, true);
    						footer.view.setUint32(12, reader.size, true);
    						header.view.setUint32(18, reader.size, true);
    					}
    					writer.writeUint8Array(footer.array, function() {
    						datalength += 16;
    						terminate(onend);
    					}, onwriteerror);
    				}

    				function writeFile() {
    					options = options || {};
    					name = name.trim();
    					if (options.directory && name.charAt(name.length - 1) != "/")
    						name += "/";
    					if (files[name])
    						throw ERR_DUPLICATED_NAME;
    					filename = getBytes(encodeUTF8(name));
    					filenames.push(name);
    					writeHeader(function() {
    						if (reader)
    							if (dontDeflate || options.level == 0)
    								copy(reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);
    							else
    								worker = deflate(reader, writer, options.level, writeFooter, onprogress, onreaderror, onwriteerror);
    						else
    							writeFooter();
    					}, onwriteerror);
    				}

    				if (reader)
    					reader.init(writeFile, onreaderror);
    				else
    					writeFile();
    			},
    			close : function(callback) {
    				var data, length = 0, index = 0;
    				filenames.forEach(function(name) {
    					var file = files[name];
    					length += 46 + file.filename.length + file.comment.length;
    				});
    				data = getDataHelper(length + 22);
    				filenames.forEach(function(name) {
    					var file = files[name];
    					data.view.setUint32(index, 0x504b0102);
    					data.view.setUint16(index + 4, 0x1400);
    					data.array.set(file.headerArray, index + 6);
    					data.view.setUint16(index + 32, file.comment.length, true);
    					if (file.directory)
    						data.view.setUint8(index + 38, 0x10);
    					data.view.setUint32(index + 42, file.offset, true);
    					data.array.set(file.filename, index + 46);
    					data.array.set(file.comment, index + 46 + file.filename.length);
    					index += 46 + file.filename.length + file.comment.length;
    				});
    				data.view.setUint32(index, 0x504b0506);
    				data.view.setUint16(index + 8, filenames.length, true);
    				data.view.setUint16(index + 10, filenames.length, true);
    				data.view.setUint32(index + 12, length, true);
    				data.view.setUint32(index + 16, datalength, true);
    				writer.writeUint8Array(data.array, function() {
    					terminate(function() {
    						writer.getData(callback);
    					});
    				}, onwriteerror);
    			}
    		};
    	}

    	obj.zip = {
    		Reader : Reader,
    		Writer : Writer,
    		BlobReader : BlobReader,
    		HttpReader : HttpReader,
    		HttpRangeReader : HttpRangeReader,
    		Data64URIReader : Data64URIReader,
    		TextReader : TextReader,
    		BlobWriter : BlobWriter,
    		FileWriter : FileWriter,
    		Data64URIWriter : Data64URIWriter,
    		TextWriter : TextWriter,
    		createReader : function(reader, callback, onerror) {
    			reader.init(function() {
    				callback(createZipReader(reader, onerror));
    			}, onerror);
    		},
    		createWriter : function(writer, callback, onerror, dontDeflate) {
    			writer.init(function() {
    				callback(createZipWriter(writer, onerror, dontDeflate));
    			}, onerror);
    		},
    		workerScriptsPath : "",
    		inflateJSPath:"",
    		useWebWorkers : true
    	};

    })(this);

/* lib/zip.js end */




/* ui/ui.js */
    (function() {
        var uiQueue = [];

        /* 注册一个新的 UI 交互 */
        KityMinder.registerUI = function(id, deps, ui) {
            if (typeof(deps) == 'function') {
                ui = deps;
                deps = null;
            }
            uiQueue.push({
                id: id,
                ui: ui,
                deps: deps
            });
        };

        kity.extendClass(Minder, {
            /* 为实例注册 UI 交互 */
            initUI: function() {
                var ui = this._ui = {};
                var minder = this;
                uiQueue.forEach(function(uiDeal) {
                    var deps = uiDeal.deps;
                    if (deps) deps = deps.map(function(dep) {
                        return minder.getUI(dep);
                    });
                    ui[uiDeal.id] = uiDeal.ui.apply(null, [minder].concat(deps || []));
                });

                // 阻止非脑图事件冒泡
                $('#content-wrapper').delegate('#panel, #tab-container, .fui-dialog', 'click mousedown keydown keyup', function(e) {
                    e.stopPropagation();
                });

                this.fire('interactchange');
            },

            /* 获得实例的 UI 实例 */
            getUI: function(id) {
                return this._ui[id];
            }
        });

    })();
/* ui/ui.js end */




/* ui/fuix.js */
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
/* ui/fuix.js end */




/* ui/mainmenu.js */
    KityMinder.registerUI('mainmenu', function(minder) {
        var $button = new FUI.Button({
            id: 'main-menu-btn'
        });

        var $panel;

        $button.setLabel('百度脑图');
        $button.appendTo(document.getElementById('panel'));

        $button.on('click', function(e) {
            $panel.addClass('show');
        });

        $panel = $('<div id="main-menu"></div>').appendTo('body');
        $panel.click(function() {
            $panel.removeClass('show');
        });

        return $panel;
    });
/* ui/mainmenu.js end */




/* ui/commandbutton.js */
    KityMinder.registerUI('commandbutton', function(minder) {
        return {
            generate: function(command, onclick) {
                var $button = new FUI.Button({
                    label: minder.getLang('ui.' + command),
                    text: minder.getLang('ui.' + command),
                    className: ['command-widget', 'command-button', command]
                });

                $button.on('click', onclick || function() {
                    minder.execCommand(command);
                });

                $button.bindCommandState(minder, command);

                return $button;
            }
        };
    });
/* ui/commandbutton.js end */




/* ui/commandbuttonset.js */
    KityMinder.registerUI('commandbuttonset', function(minder) {
        function mapValueItem(command, valueList) {
            return valueList.map(function(value) {
                var text = minder.getLang([command, value].join('.')) || value;
                return {
                    label: text,
                    text: text,
                    value: value,
                    className: [command, value].join(' ')
                };
            });
        }

        function generate(command, valueList) {

            var $buttonset = new FUI.Buttonset({
                id: 'template-set',
                buttons: typeof(valueList[0]) == 'object' ? valueList : mapValueItem(command, valueList),
                className: ['command-widget', 'command-buttonset', command].join(' ')
            });

            $buttonset.on('change', function() {
                minder.execCommand(command, $buttonset.getValue());
            });

            $buttonset.bindCommandState(minder, command, function(value) {
                this.selectByValue(value);
            });

            return $buttonset;
        }

        return {
            generate: generate
        };
    });
/* ui/commandbuttonset.js end */




/* ui/commandinputmenu.js */
    KityMinder.registerUI('commandinputmenu', function(minder) {

        function generate(command, menuList) {

            var $menu = new FUI.InputMenu({
                menu: {
                    items: menuList
                },
                input: {
                    placeholder: minder.getLang('ui.' + command),
                },
                className: ['command-widget', 'command-inputmenu', command]
            });


            var interactFlag = false;

            $menu.bindCommandState(minder, command, function(value) {
                interactFlag = true;
                if (!$menu.selectByValue(value)) {
                    $menu.clearSelect();
                }
                interactFlag = false;
            });

            var lastIndex = -1;
            $menu.on('select', function(e, info) {
                if (interactFlag) return;
                if (~info.index) {
                    minder.execCommand(command, info.value);
                } else {
                    $menu.select(lastIndex);
                }
                lastIndex = info.index;
            });

            return $menu;
        }

        return {
            generate: generate
        };
    });
/* ui/commandinputmenu.js end */




/* ui/history.js */
    KityMinder.registerUI('history', ['commandbutton'], function(minder, $commandbutton) {
        var ret = {};

        ['undo', 'redo'].forEach(function(command) {
            ret[command] = $commandbutton.generate(command).appendTo(document.getElementById('panel'));
        });

        return ret;
    });
/* ui/history.js end */




/* ui/tabs.js */
    KityMinder.registerUI('tabs', function(minder) {
        var $tab = new FUI.Tabs({
            buttons: ['思路', '展现', '视图']
        });

        var $header = $('<div id="tab-select"></div>').appendTo('#panel');
        var $container = $('<div id="tab-container"></div>');

        $('#panel').after($container);

        $tab.appendButtonTo($header[0]);
        $tab.appendPanelTo($container[0]);

        // 隐藏效果
        var lastIndex = 0;
        $tab.on('tabsselect', function(e, info) {
            if (info.index == lastIndex) {
                $container.toggleClass('collapsed');
                $header.toggleClass('collapsed');
            } else {
                $container.removeClass('collapsed');
                $header.removeClass('collapsed');
            }
            lastIndex = info.index;
        });

        $tab.idea = $tab.getPanel(0);
        $tab.edit = $tab.getPanel(1);
        $tab.view = $tab.getPanel(2);

        return $tab;
    });
/* ui/tabs.js end */




/* ui/title.js */
    KityMinder.registerUI('title', function (minder) {
        var $title = $('<h1>').appendTo('#panel').text('百度脑图');
        return $title;
    });
/* ui/title.js end */




/* ui/account.js */
    KityMinder.registerUI('account', function(minder) {
        
    });
/* ui/account.js end */




/* ui/template.js */
    KityMinder.registerUI('template', ['tabs'], function(minder, $tabs) {

        var buttonset = minder.getUI('commandbuttonset');

        var $templatePanel = new FUI.LabelPanel({
            id: 'template-panel',
            label: minder.getLang('panels.template')
        });

        var $templateSelect = new FUI.DropPanel({
            id: 'template-select'
        });

        $tabs.edit.appendWidget($templatePanel);
        $templatePanel.appendWidget($templateSelect);

        var templateList = KityMinder.Utils.keys(KityMinder.getTemplateList());

        $templateSelect.appendWidget(buttonset.generate('template', templateList));

        return $templatePanel;
    });
/* ui/template.js end */




/* ui/theme.js */
    KityMinder.registerUI('theme', ['tabs'], function(minder, $tabs) {

        var buttonset = minder.getUI('commandbuttonset');

        var $themePanel = new FUI.LabelPanel({
            id: 'theme-panel',
            label: minder.getLang('panels.theme')
        });

        var $themeSelect = new FUI.DropPanel({
            id: 'theme-select'
        });

        $tabs.edit.appendWidget($themePanel);
        $themePanel.appendWidget($themeSelect);

        var themeList = KityMinder.Utils.keys(KityMinder.getThemeList());

        $themeSelect.appendWidget(buttonset.generate('theme', themeList.map(function(theme) {
            var style = KityMinder._themes[theme];
            return {
                label: {
                    text: minder.getLang('theme.' + theme),
                    style: {
                        background: style['root-background'],
                        color: style['root-color'],
                        borderRadius: style['root-radius'] / 2
                    }
                },
                text: minder.getLang('theme.' + theme),
                value: theme,
                className: ['theme', theme].join(' ')
            };
        })));

        return $themePanel;
    });
/* ui/theme.js end */




/* ui/layout.js */
    KityMinder.registerUI('layout', ['tabs', 'commandbuttonset', 'commandbutton'], function(minder, $tabs, $commandbuttonset, $commandbutton) {

        var $layoutPanel = new FUI.LabelPanel({
            id: 'layout-panel',
            label: minder.getLang('panels.layout')
        }).appendTo($tabs.edit);

        var $layoutSelect = new FUI.DropPanel({
            id: 'layout-select'
        }).appendTo($layoutPanel);

        var layoutList = KityMinder.Utils.keys(KityMinder.getLayoutList());

        $layoutSelect.appendWidget($commandbuttonset.generate('layout', layoutList));

        $commandbutton.generate('resetlayout').appendTo($layoutPanel).addClass('large');

        return $layoutPanel;
    });
/* ui/layout.js end */




/* ui/style.js */
    KityMinder.registerUI('style', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {

        var $stylePanel = new FUI.LabelPanel({
            label: minder.getLang('panels.style')
        }).appendTo($tabs.edit);

        $commandbutton.generate('clearstyle').addClass('large').appendTo($stylePanel);

        var $styleClipPanel = new FUI.Panel({
            column: true
        }).appendTo($stylePanel);

        $commandbutton.generate('copystyle').appendTo($styleClipPanel);
        $commandbutton.generate('pastestyle').appendTo($styleClipPanel);

        return $stylePanel;
    });
/* ui/style.js end */




/* ui/font.js */
    function fontUI(minder, $tabs, $commandInputMenu, $commandButton) {

        var $fontPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.font'),
            id: 'font-panel'
        });

        var $leftPanel = new FUI.Panel({
            column: true
        });

        var $rightPanel = new FUI.Panel({
            column: true
        });

        var $fontFamilyMenu = $commandInputMenu.generate('fontfamily', minder.getOptions('fontfamily').map(function(ff) {
            return {
                label: {
                    text: ff.name,
                    style: {
                        fontFamily: ff.val
                    }
                },
                text: ff.name,
                value: ff.val
            };
        }));

        var $fontSizeMenu = $commandInputMenu.generate('fontsize', minder.getOptions('fontsize').map(function(fs) {
            return {
                label: {
                    text: fs,
                    style: {
                        fontSize: fs
                    }
                },
                text: fs,
                value: fs
            };
        }));

        $leftPanel.appendWidgets([$fontFamilyMenu, $fontSizeMenu]);

        var $boldButton = $commandButton.generate('bold');
        var $italicButton = $commandButton.generate('italic');

        $rightPanel.appendWidgets([$boldButton, $italicButton]);

        $fontPanel.appendWidgets([$leftPanel, $rightPanel]);

        $tabs.edit.appendWidget($fontPanel);
    }

    KityMinder.registerUI('font', ['tabs', 'commandinputmenu', 'commandbutton'], fontUI);
/* ui/font.js end */




/* ui/color.js */
    function generateSerisColor() {
        return ['#e75d66', '#fac75b', '#99ca6a', '#00c5ad', '#3bbce0', '#c9ced1', '#425b71', 'white'];
    }

    KityMinder.registerUI('color', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {
        var $colorPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.color')
        }).appendTo($tabs.edit);

        var $backgroundPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.background')
        }).appendTo($tabs.edit);

        var foreColorList = generateSerisColor();

        $colorPanel.appendWidget($commandbuttonset.generate('forecolor', foreColorList.map(function(color) {
            return {
                icon: {
                    style: {
                        background: color
                    }
                },
                label: color,
                text: color,
                value: color
            };
        })).addClass('color-picker'));

        $backgroundPanel.appendWidget($commandbuttonset.generate('background', foreColorList.map(function(color) {
            return {
                icon: {
                    style: {
                        background: color
                    }
                },
                label: color,
                text: color,
                value: color
            };
        })).addClass('color-picker'));

        return {
            color: $colorPanel,
            background: $backgroundPanel
        };
    });
/* ui/color.js end */




/* ui/insertnode.js */
    KityMinder.registerUI('insertnode', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
        var $insertNodePanel = new FUI.LabelPanel({
            label: minder.getLang('panels.insert'),
            column: true
        });

        $commandbutton.generate('appendchildnode').appendTo($insertNodePanel);
        $commandbutton.generate('appendsiblingnode').appendTo($insertNodePanel);

        $tabs.idea.appendWidget($insertNodePanel);

        return $insertNodePanel;
    });
/* ui/insertnode.js end */




/* ui/arrange.js */
    KityMinder.registerUI('arrange', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
        var $arrangePanel = new FUI.LabelPanel({
            label: minder.getLang('panels.arrange'),
            column: true
        });

        $commandbutton.generate('arrangeup').appendTo($arrangePanel);
        $commandbutton.generate('arrangedown').appendTo($arrangePanel);

        $tabs.idea.appendWidget($arrangePanel);

        return $arrangePanel;
    });
/* ui/arrange.js end */




/* ui/nodeop.js */
    KityMinder.registerUI('nodeop', ['tabs', 'commandbutton'], function(minder, $tabs, $commandbutton) {
        var $opPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.nodeop'),
            column: true
        }).appendTo($tabs.idea);

        ['editnode', 'removenode'].forEach(function(cmd) {
            $commandbutton.generate(cmd).appendTo($opPanel);
        });
    });
/* ui/nodeop.js end */




/* ui/priority.js */
    KityMinder.registerUI('priority', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

        var $priorityPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.priority')
        }).appendTo($tabs.idea);

        $commandbuttonset.generate('priority', [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function(p) {
            return {
                label: p,
                text: minder.getLang('ui.priority') + p,
                value: p,
                className: ['priority', p].join('-')
            };
        })).appendTo($priorityPanel);

        return $priorityPanel;
    });
/* ui/priority.js end */




/* ui/progress.js */
    KityMinder.registerUI('progress', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

        var $progressPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.progress')
        }).appendTo($tabs.idea);

        $commandbuttonset.generate('progress', [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function(p) {
            return {
                label: p,
                text: minder.getLang('ui.progress.p' + p),
                value: p,
                className: ['progress', p].join('-')
            };
        })).appendTo($progressPanel);

        return $progressPanel;
    });
/* ui/progress.js end */




/* ui/resource.js */
    KityMinder.registerUI('resource', ['tabs', 'commandbuttonset'], function(minder, $tabs, $commandbuttonset) {

        var $resourcePanel = new FUI.LabelPanel({
            label: minder.getLang('panels.resource'),
            id: 'resource-panel'
        }).appendTo($tabs.idea);

        var $addInput = new FUI.Input().appendTo($resourcePanel);

        var $addButton = new FUI.Button({
            label: '添加'
        }).appendTo($resourcePanel);

        var $resourceDrop = new FUI.DropPanel().appendTo($resourcePanel);
        var $dropContainer = $($resourceDrop.getPanelElement());
        var $ul = $('<ul></ul>').addClass('resource-list').appendTo($dropContainer);

        function addResource() {
            var resource = $addInput.getValue();
            var origin = minder.queryCommandValue('resource');
            if (resource) {
                origin.push(resource);
                minder.execCommand('resource', origin);
            }
            $addInput.setValue(null);
            update();
            $addInput.focus();
        }

        $addInput.on('inputcomplete', function(e) {
            addResource();
        });

        $addButton.on('click', addResource);

        $dropContainer.delegate('input[type=checkbox]', 'change', function() {
            minder.execCommand('resource', $dropContainer.find('input[type=checkbox]:checked').map(function(index, chk) {
                return $(chk).data('resource');
            }).toArray());
            update();
        });

        function hash(resource, used) {
            return [resource.join(','), used.join(',')].join(';');
        }

        function changed(resource, used) {
            var currentHash = hash(resource, used);
            if (currentHash == changed.lastHash) return true;
            changed.lastHash = currentHash;
            return false;
        }

        function update() {
            var resource = minder.queryCommandValue('resource');
            var used = minder.getUsedResource();

            if (!changed(resource, used)) return;

            $ul.empty().append(used.map(function(name) {
                var $li = $('<li></li>'),
                    $label = $('<label></label>').appendTo($li),
                    $chk = $('<input type="checkbox" />')
                    .data('resource', name)
                    .prop('checked', ~resource.indexOf(name))
                    .appendTo($label);
                $label.append(name);
                var color = minder.getResourceColor(name);
                return $li.css({
                    color: color.dec('l', 60).toString(),
                    backgroundColor: ~resource.indexOf(name) ? color : color.dec('a', 0.85).toRGBA()
                });
            }));

            switch (minder.queryCommandState('resource')) {
                case 0:
                    $addInput.enable();
                    $addButton.enable();
                    $resourceDrop.enable();
                    $ul.find('input[type=checkbox]').removeProp('disabled');
                    break;
                case -1:
                    $addInput.disable();
                    $addButton.disable();
                    $resourceDrop.disable();
                    $ul.find('input[type=checkbox]').prop('disabled', 'disabled');
            }
        }

        minder.on('interactchange', update);

        return $resourcePanel;
    });
/* ui/resource.js end */




/* ui/attachment.js */
    KityMinder.registerUI('attachment', ['tabs'], function(minder, $tabs) {
        var $attachmentPanel = new FUI.LabelPanel({
            label: minder.getLang('panels.attachment'),
            coloum: true
        }).appendTo($tabs.idea);

        return $attachmentPanel;
    });
/* ui/attachment.js end */




/* ui/link.js */
    KityMinder.registerUI('link', ['attachment'], function(minder, $attachment) {

        var $linkButtonMenu = new FUI.ButtonMenu({
            id: 'link-button-menu',
            text: minder.getLang('ui.link'),
            layout: 'bottom',
            buttons: [{}, {
                label: minder.getLang('ui.link')
            }],
            menu: {
                items: [minder.getLang('ui.removelink')]
            }
        }).appendTo($attachment);

        $linkButtonMenu.bindCommandState(minder, 'hyperlink');

        var $linkDialog = new FUI.Dialog({
            width: 600,
            height: 200,
            caption: minder.getLang('ui.link')
        }).appendTo(document.getElementById('content-wrapper'));

        var $dialogBody = $($linkDialog.getBodyElement());

        $dialogBody.html([
            '<p><label>连接地址：</label><input type="url" class="link-href" /></p>',
            '<p><label>提示文本：</label><input type="text" class="link-title /"></p>'
        ].join(''));

        var $href = $dialogBody.find('.link-href');
        var $ok = $linkDialog.getButton(0);
        var $errorMsg = $('<span class="validate-error"></span>');

        function error(value) {
            if (value) {
                $href.addClass('validate-error');
                $errorMsg.text('地址格式错误');
                $ok.disable();
            } else {
                $href.removeClass('validate-error');
                $errorMsg.text('');
                $ok.enable();
            }
        }

        $href.after($errorMsg);

        $href.on('input', function() {
            var url = $href.val();
            error(!/^https?\:\/\/(\w+\.)+\w+/.test(url));
        });

        $linkButtonMenu.on('buttonclick', function() {
            $linkDialog.open();
            $href[0].focus();
        });

        $linkButtonMenu.on('select', function() {
            minder.execCommand('unhyperlink');
        });

        $linkDialog.on('ok', function() {
            minder.execCommand('hyperlink', $href.val());
        });

        $linkDialog.on('open', function() {
            $href.val(minder.queryCommandValue('hyperlink'));
            error(false);
        });

        return $linkButtonMenu;
    });
/* ui/link.js end */




/* ui/image.js */
    KityMinder.registerUI('image', ['attachment'], function (minder, $attachment) {

        var $imageButtonMenu = new FUI.ButtonMenu({
            id: 'image-button-menu',
            text: minder.getLang('ui.image'),
            layout: 'bottom',
            buttons: [{}, {
                label: minder.getLang('ui.image')
            }],
            menu: {
                items: [minder.getLang('ui.removeimage')]
            }
        }).appendTo($attachment);

        $imageButtonMenu.bindCommandState(minder, 'image');

        var $imageDialog = new FUI.Dialog({
            width: 500,
            height: 400,
            caption: minder.getLang('ui.image')
        }).appendTo(document.getElementById('content-wrapper'));

        $imageDialog.on('ok', function() {
            minder.execCommand('image', $url.val());
        });

        $imageDialog.on('open', function() {
            $url.val(minder.queryCommandValue('image'));
            $preview.attr('src', '');
            error(false);
        });

        var $dialogBody = $($imageDialog.getBodyElement());

        $dialogBody.html([
            '<p><label>图片地址：</label><input type="url" class="image-url" /></p>',
            '<p><label>提示文本：</label><input type="text" class="image-title /"></p>',
            '<img class="image-preview" src="" style="max-height: 200px;" />'
        ].join(''));

        var $url = $dialogBody.find('.image-url');
        var $preview = $dialogBody.find('.image-preview');
        var $ok = $imageDialog.getButton(0);
        var $errorMsg = $('<span class="validate-error"></span>');

        function error(value) {
            if (value) {
                $url.addClass('validate-error');
                $errorMsg.text('图片无法加载');
                $ok.disable();
            } else {
                $url.removeClass('validate-error');
                $errorMsg.text('');
                $ok.enable();
            }
            return value;
        }

        $url.after($errorMsg);

        $url.on('input', function() {
            var url = $url.val();
            if (/^https?\:\/\/(\w+\.)+\w+/.test(url)) {
                $preview.attr('src', url);
                error(false);
                $ok.disable();
                $preview.addClass('loading');
            } else {
                error(true);
            }
        });

        $preview.on('load', function() {
            error(false);
            $preview.removeClass('loading');
        }).on('error', function() {
            if($preview.attr('src')) error(true);
            $preview.removeClass('loading');
        });

        $imageButtonMenu.on('buttonclick', function() {
            $imageDialog.open();
            $url[0].focus();
        });

        $imageButtonMenu.on('select', function() {
            minder.execCommand('removeimage');
        });

        return $imageButtonMenu;
    });
/* ui/image.js end */



})(window)