KityMinder.registerModule('Resource', function() {

    // String Hash
    // https://github.com/drostie/sha3-js/edit/master/blake32.min.js
    var blake32=(function(){var k,g,r,l,m,o,p,q,t,w,x;x=4*(1<<30);k=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];m=[0x243F6A88,0x85A308D3,0x13198A2E,0x03707344,0xA4093822,0x299F31D0,0x082EFA98,0xEC4E6C89,0x452821E6,0x38D01377,0xBE5466CF,0x34E90C6C,0xC0AC29B7,0xC97C50DD,0x3F84D5B5,0xB5470917];w=function(i){if(i<0){i+=x}return("00000000"+i.toString(16)).slice(-8)};o=[[16,50,84,118,152,186,220,254],[174,132,249,109,193,32,123,53],[139,12,37,223,234,99,23,73],[151,19,205,235,98,165,4,143],[9,117,66,250,30,203,134,211],[194,166,176,56,212,87,239,145],[92,241,222,164,112,54,41,184],[189,231,28,147,5,79,104,162],[246,158,59,128,44,125,65,90],[42,72,103,81,191,233,195,13]];p=function(a,b,n){var s=q[a]^q[b];q[a]=(s>>>n)|(s<<(32-n))};g=function(i,a,b,c,d){var u=l+o[r][i]%16,v=l+(o[r][i]>>4);a%=4;b=4+b%4;c=8+c%4;d=12+d%4;q[a]+=q[b]+(t[u]^m[v%16]);p(d,a,16);q[c]+=q[d];p(b,c,12);q[a]+=q[b]+(t[v]^m[u%16]);p(d,a,8);q[c]+=q[d];p(b,c,7)};return function(a,b){if(!(b instanceof Array&&b.length===4)){b=[0,0,0,0]}var c,d,e,L,f,h,j,i;d=k.slice(0);c=m.slice(0,8);for(r=0;r<4;r+=1){c[r]^=b[r]}e=a.length*16;f=(e%512>446||e%512===0)?0:e;if(e%512===432){a+="\u8001"}else{a+="\u8000";while(a.length%32!==27){a+="\u0000"}a+="\u0001"}t=[];for(i=0;i<a.length;i+=2){t.push(a.charCodeAt(i)*65536+a.charCodeAt(i+1))}t.push(0);t.push(e);h=t.length-16;j=0;for(l=0;l<t.length;l+=16){j+=512;L=(l===h)?f:Math.min(e,j);q=d.concat(c);q[12]^=L;q[13]^=L;for(r=0;r<10;r+=1){for(i=0;i<8;i+=1){if(i<4){g(i,i,i,i,i)}else{g(i,i,i+1,i+2,i+3)}}}for(i=0;i<8;i+=1){d[i]^=b[i%4]^q[i]^q[i+8]}}return d.map(w).join("")}}());

    /**
     * 自动使用的颜色序列
     */
    var RESOURCE_COLOR_SERIES = [51, 303, 75, 200, 157, 0, 26, 254].map(function(h) {
        return kity.Color.createHSL(h, 100, 85);
    });

    /**
     * 在 Minder 上拓展一些关于资源的支持接口
     */
    kity.extendClass(Minder, {
        
        /**
         * 获取字符串的哈希值
		 *
         * @param {String} str
         * @return {Number} hashCode
         */
        getHashCode: function(str) {
            str = blake32(str);
            var hash = 1315423911, i, ch;
            for (i = str.length - 1; i >= 0; i--) {
                ch = str.charCodeAt(i);
                hash ^= ((hash << 5) + ch + (hash >> 2));
            }
            return  (hash & 0x7FFFFFFF);
        },

        /**
         * 获取脑图中某个资源对应的颜色
         *
         * 如果存在同名资源，则返回已经分配给该资源的颜色，否则分配给该资源一个颜色，并且返回
         *
         * 如果资源数超过颜色序列数量，返回哈希颜色
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

            // 资源过多，找不到可用索引颜色，统一返回哈希函数得到的颜色
            return RESOURCE_COLOR_SERIES[colorMapping[resource]] || kity.Color.createHSL(Math.floor(this.getHashCode(resource) / 0x7FFFFFFF * 359), 100, 85);
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

            return new kity.Box({
                x: box.right,
                y: Math.round(-overlays[0].height / 2),
                width: x,
                height: overlays[0].height
            });
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
