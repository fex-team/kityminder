/**
 * Created with JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-10-11
 * Time: 下午5:34
 * To change this template use File | Settings | File Templates.
 */
function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(ele,cls) {
    if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(obj, cls) {
    var clsArray= cls.split( " ");
    for(var i=0;i<clsArray.length;i++){
        if (hasClass(obj, clsArray[i])) {
            var reg = new RegExp('(\\s|^)' + clsArray[i] + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }
}
function empty(obj){
    var childs = obj.childNodes;
    if(childs.length==0)return obj;
    for(var i=0;i<childs.length;i++){
        obj.removeChild(childs[i]);
    }
    return obj
}
function slideToggle(obj){
    //todo 先写个大意,待完成
    if(obj.style.display=='none'){

    }else{
        obj.style.display='block';
    }
}
var triggerEvent = function () {
    this.listeners = [];
    this.customOne = function  (type, listener) {
        this.listeners[type] = listener;
        for (var i = 0, l = this.listeners.length; i < l; i++) {
            if (this.listeners[i] === this.listeners[type]) {
                this.listeners.splice(i, 1);
                i--;
            }
        }
    },
    this.customTrigger = function (type,arguments) {
        if(this.listeners[type]){
            return this.listeners[type].apply(this, arguments);
        }
        return false;
    }
};

