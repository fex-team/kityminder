var Minder = KityMinder.Minder = kity.createClass('KityMinder', {
    constructor: function(options) {
        this._options = Utils.extend(window.KITYMINDER_CONFIG || {}, options);

        this.setDefaultOptions(KM.defaultOptions); // @see option.js

        this._initEvents(options);      // @see event.js
        this._initStatus(options);      // @see status.js
        this._initPaper(options);       // @see paper.js
        this._initSelection(options);   // @see select.js
        this._initShortcutKey(options); // @see key.js
        this._initContextMenu(options); // @see contextmenu.js
        this._initModules(options);     // @see module.js
        this._initProtocols(options);   // @see data.js

        if (this.getOptions('readOnly') === true) {
            this.setDisabled();         // @see readonly.js
        }
        this.refresh();                 // @see layout.js
        this.setTheme();                // @see theme.js
        this.fire('ready');
    }
});