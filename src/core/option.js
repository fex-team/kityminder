/**
 * @fileOverview
 *
 * 提供脑图选项支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
kity.extendClass(Minder, {

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
    }
});