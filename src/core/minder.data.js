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
            return this.fire('parseerror');
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

        // compality for v1.1.3
        var ocs = json.data.currentstyle; // old current-style
        delete json.data.currentstyle;

        importNode(this._root, json, this);

        if (ocs == 'bottom') {
            json.template = 'structure';
            json.theme = 'snow';
        } else if (ocs == 'default') {
            json.template = 'default';
            json.theme = 'classic';
        }

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