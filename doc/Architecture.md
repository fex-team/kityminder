# Kity Minder 目标设定

## 第一期目标

* 架构搭建
* 自动布局
* 双击节点文字编辑
* 节点之间的连线（子节点向父节点）
* 导入和导出（JSON格式）
* 基本键盘导航：基于位置的选择导航；Tab插入子级；Enter插入同级
* 上述功能的撤销操作

## 第二期目标

* 自由布局
* 拖动修改子级
* 子节点展开/收起
* 思路连接线
* 外观模板支持

## 第三期目标

* 协同操作
* 云存储
* 应用推广


# Kity Minder 整体设计

整体设计脑图地址：[Architecture.mmap](Architecture.mmap)


## `abstract` Command
表示一条在 KityMinder 上执行的命令，以及其相关的查询接口

### `method` execute(Minder minder [,args...] )
命令执行，如果该命令可撤销，应自行保存需要的状态

### `method` revert()
撤销命令的执行



## `abstract` Module
Module定义一个模块，表示控制脑图中一个功能的模块（布局、渲染、输入文字、图标叠加等）

### `method` load(Minder minder) : this
模块装载的时候被调用，此时应该绑定需要的事件，根据事件来触发命令，达到对 Minder 的控制。

### `method` destroy() : this
模块卸载时被调用，此时可以回收模块资源。



## MinderNode

MinderNode 是 Kity Minder 需要展示和控制的树的一个节点。节点上提供了*树遍历*和*数据存取*的功能。并且提供对节点对应的渲染容器（Kity.Group）的访问

节点上提供公开字段，任何模块可以读取和修改，这些字段会提供给 KityMinder 作为渲染的依据。

公开的字段和存放的数据都会在导出、保存现场的时候被保留。

MinderTreeNode 维护的树关系和数据只是作为一个脑图的结构和数据，不具有任何渲染和交互的能力。

### 树遍历

通过 6 个接口来进行树的访问和修改操作

`node.getParent()` 返回当前节点的父节点

`node.getChildren()` 返回当前节点的子节点

`node.getIndex()` 返回当前节点在父节点中的位置，如果没有父节点，返回 -1

`node.insertChild( node, index )` 插入一个子节点到当前节点上，插入的位置为 index

`node.removeChild( node | index )` 移除一个子节点或指定位置的子节点

`node.getChild( index )` 获得指定位置的子节点

### 数据存取

`node.getData(name)` 获得指定字段的数据

`node.setData(name, value)` 设定指定字段的数据

### 公开字段

`node.setData( "x", value )` 设置节点的 x 坐标

`node.setData( "y", value )` 设置节点的 y 坐标

`node.getData( "x", value )` 获取节点的 x 坐标

`node.getData( "y", value )` 获取节点的 y 坐标

`node.setData( "text", value )` 设置节点的文本

`node.getData( "text", value )` 获取节点的文本

### 渲染容器

`node.getRenderContainer()` 返回当前节点的渲染容器


## KityMinder

脑图使用类

### 构造函数

`constructor` KityMinder(id, option)

创建脑图画布。KityMinder 实例化的时候，会从模块池中取出模块，并且实例化这些模块，然后加载。

`id` 实例的 id

`option` 其他选项（当前没有）

### 公开接口

`.getRoot() : MinderNode` 

获取脑图根节点

`.execCommand( name [, params...] ) : this`

执行指定的命令。该方法执行的时候，会实例化指定类型的命令，并且把命令参数传给命令执行

`.update(MinderNode node) : this`

更新指定节点及其子树的呈现，如果不指定节点，则更新跟节点的呈现（整棵树）

`.export() : object`

以导出节点以及所有子树的数据（data上所有的字段会被导出）

`.import(object data) : this`

导入节点数据，会节点以及所有子树结构以及子树数据

`.getSelectedNodes() : MinderNode[]`

`.select(MinderNode[] nodes | MinderNode node) : this`

添加一个或多个节点到节点选择列表中

`.unselect(MinderNode[] nodes | MinderNode node) : this`

从节点选择列表中移除一个或多个节点

`.clearSelection() : this`

清除节点选中列表

### 事件机制

#### 事件分类

KityMinder 的事件分为：

* 交互事件: `click`, `dblclick`, `mousedown`, `mousemove`, `mouseup`, `keydown`, `keyup`, `keypress`, `touchstart`, `touchend`, `touchmove`

* Command 事件: `beforecommand`, `precommand`, `aftercommand`

* 交互事件：`selectionchange`, `contentchange`, `interactchange`

* 模块事件：模块自行触发与上述不同名的事件

#### 事件接口

`.on(event, callback)` 侦听指定事件

`.once(event, callback)` 侦听指定事件一次，当 callback 被调用之后，后面再发生该事件不再被调用

`.off(event, callback)` 取消对事件的侦听

`.fire(event, params)` 触发指定的事件，params 是自定义的 JSON 数据，会合并到事件对象


#### 回调函数接口

回调函数接收唯一的参数 e

对于交互事件，e 是原生 event 对象的一个拓展；对于需要坐标的事件，用 e.getPosition() 可以获得在 Kity Paper 上的坐标值

对 command 事件：

* `e.commandName` 获取执行的命令的类型
* `e.commandArgs` 获取命令执行的参数列表

对 import 事件：

* `e.importData` 获取导入的数据

对 selectionchange 事件：

* `e.currentSelection` 获取当前选择的节点列表
* `e.additionNodes` 添加到选择节点列表的那部分节点
* `e.removalNodes` 从选择节点列表移除的那部分节点

#### 事件触发时机

`command` 事件只在顶级 command 执行的时候触发（Command 里调用 Command 不触发）

`contentchange` 事件在顶级 command 之后会查询是否发生了内容的变化，如果发生了变化，则会触发；

`selectionchange` 事件在顶级 command 之后会查询是否发生了选区的变化，如果发生了变化，则会触发

`interactchange` 事件会在所有的鼠标、键盘、触摸操作后发生，并且会进行稀释；command 可以手动触发该事件，此时不会被稀释