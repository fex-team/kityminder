Utils.extend(KityMinder, {
    
    compatibility: function(json) {

        var version = json.version || '1.1.3';

        function traverse(node, fn) {
            fn(node);
            if (node.children) node.children.forEach(function(child) {
                traverse(child, fn);
            });
        }

        /* 脑图数据升级 */
        function c_120_130(json) {
            traverse(json, function(node) {
                var data = node.data;
                delete data.layout_bottom_offset;
                delete data.layout_default_offset;
                delete data.layout_filetree_offset;
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
            case '1.2.1':
                c_120_130(json);
        }

        return json;
    }
});