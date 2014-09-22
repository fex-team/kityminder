/**
 * @fileOverview
 *
 * 提供存储在 LocalStorage 中的列表
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('widget/locallist', function() {
    function LocalList(name, maxCount) {
        var list;

        maxCount = maxCount || 10;

        function load() {
            list = localStorage.getItem(name);
            if (list) {
                list = JSON.parse(list);
            } else {
                list = [];
            }
            this.length = list.length;
        }

        function save() {
            while (list.length > maxCount) list.pop();
            localStorage.setItem(name, JSON.stringify(list));
            this.length = list.length;
        }

        function get(index) {
            return list[index];
        }

        function remove(index) {
            list.splice(index, 1);
            save();
        }

        function clear() {
            list = [];
            save();
        }

        function unshift(item) {
            list.unshift(item);
            save();
        }

        function createKeyMatcher(key) {
            return function(item, value) {
                return item[key] == value;
            };
        }

        function findIndex(matcher, value) {
            if (typeof(matcher) == 'string') {
                matcher = createKeyMatcher(matcher);
            }
            for (var i = 0; i < list.length; i++) {
                if (matcher(list[i], value)) return i;
            }
            return -1;
        }

        function find(matcher, value) {
            return get(findIndex(matcher, value));
        }

        function forEach(callback) {
            list.forEach(callback);
        }

        load.call(this);

        this.get = get;
        this.remove = remove;
        this.findIndex = findIndex;
        this.find = find;
        this.forEach = forEach;
        this.unshift = unshift;
        this.clear = clear;
    }

    return {
        use: function(name) {
            return new LocalList(name);
        }
    };
});