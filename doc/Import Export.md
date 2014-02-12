# 导入导出功能设计

## 名词

* 本地格式

指一种公开的脑图编码格式，如 XMind、FreeMind、MinderManager、PDF等。下文代码中，local 表示本地格式字符串或二进制流（Blob）。

* Json格式

指 KityMinder 自身使用的 JS 内存对象，是带数据的树结构。数据结构如下：

```js
// A <MinderNode> is:
{
    "data" : {...},
    "children" : [<MinderNode>, <MinderNode>, ...]
}
```

下文代码中，json 表示 json 格式字符串。

* 编码

把 Json 格式转换为一种本地格式的过程

* 解码

把一种本地格式解析回 Json 格式的过程

* 协议

协议包含名称（作为标识）、编码方法（encode）、解码方法（decode）、识别判断（recognize）。解码方法是可选项，因为对于某些协议可以只支持导出而不需支持导入（如 PDF ）。识别判断也是可选的，识别判断用于快速判断一个字符串或 Blob 是否改协议的本地数据，这个方法用于自动识别未知格式的协议。如果不提供这个方法，那么将不能把未知格式识别为该协议的格式，所以建议提供。

## 协议注册

使用 `KityMinder` 上的静态方法 `registerProtocal()` 来注册协议。

```js
KityMinder.registerProtocal( "xmind", function() {
    return {
        encode: function( json ) {
            // return local;
        },
        decode: function( local ) {
            // return json;
        },
        recognize: function( local ) {
            // return bool;
        }
    }
});
```

## 协议使用

使用 `KityMinder` 上的静态方法 `findProtocal()` 来获取协议。

```js
var pXMind = KityMinder.findProtocal( "xmind" );
if (pXMind && pXMind.encode) {
    local = pXMind.encode( json );
}
```

## 协议枚举

使用 `KityMinder` 上的静态方法 `getSupportedProtocals()` 来获取支持的协议列表。

```js
var supported = KityMinder.getSupportedProtocals();
// supported == [ 'xmind', 'txt', 'pdf', ... ]
```

## 导入导出接口

导入导出接口名称与原来架构的保持一致，只是参数有所调整。

### 导入

```js
minder.importData( local [, protocalName] );
```

导入数据需要提供读取到的本地数据，如果指明协议，则直接用指明的协议来解析；否则尝试去识别本地数据的协议格式。

### 导出

```js
var exported = minder.exportData( [protocalName] );
```

使用指定的协议来导出数据，如果不指定，则导出成 Json 格式。


