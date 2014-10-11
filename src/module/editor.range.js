Minder.Range = kity.createClass('Range',function(){

    function getOffset(rng,dir){
        var node = rng[dir + 'Container'],
            offset =  rng[dir + 'Offset'],
            rOffset = 0;
        if(node.nodeType == 1){
            //默认不会出现得不到子节点的情况
            node = node.childNodes[offset];
            if(!node && rng.startContainer && rng.startContainer.nodeName == 'DIV' ) {
                rng.startContainer.innerHTML = '<p></p>';

                offset = 0;

            }else if(node.nodeType == 3){
                offset = 0;
            }
        }
        utils.each(rng.container.childNodes,function(index,n){
            if(n === node){
                if(n.nodeType == 1){
                    return false;
                }else{
                    rOffset += offset;
                    return false;
                }
            }
            rOffset += (n.nodeType == 1 ? 1 : utils.clearWhitespace(n.nodeValue).length);
        });
        return rOffset;
    }
    function setBoundary(rng,offset,dir){
        var rOffset = 0,cont = rng.container;
        utils.each(cont.childNodes,function(index,node){
            if(node.nodeType == 1){
                if(rOffset == offset){

                    rng['set' + dir](cont,index);
                    return false;
                }
                rOffset++;

                return;
            }

            var currentLength = utils.clearWhitespace(node.nodeValue).length;
            if(rOffset + currentLength  >= offset){
                rng['set' + dir](node,offset - rOffset);
                return false;
            }
            rOffset += currentLength;
        });
    }
    return {
        constructor : function(container){
            this.nativeRange = document.createRange();
            this.nativeSel = window.getSelection();
            this.startContainer =
                this.endContainer =
                    this.startOffset =
                        this.endOffset = null;
            this.collapsed = false;
            this.container = container || null;
        },
        hasNativeRange : function(){
            return this.nativeSel.rangeCount !== 0 ;
        },
        deleteContents : function(){
            this.nativeRange.deleteContents();
            return this._updateBoundary();
        },
        select:function(){

            var start = this.nativeRange.startContainer;
            if(start.nodeType == 1 && start.childNodes.length === 0){
                var char = document.createTextNode('\u200b');
                start.appendChild(char);
                this.nativeRange.setStart(char,1);
                this.nativeRange.collapse(true);
            }else if(this.collapsed && start.nodeType == 1){
                start = start.childNodes[this.startOffset];
                if(start && start.nodeType == 3 && start.nodeValue.length === 0){

                    this.nativeRange.setStart(start,1);
                    this.nativeRange.collapse(true);
                }
            }
            try{
                this.nativeSel.removeAllRanges();
            }catch(e){

            }

            this.nativeSel.addRange(this.nativeRange);
            return this;
        },
        _updateBoundary : function(){
            var nRange = this.nativeRange;
            this.startContainer = nRange.startContainer;
            this.startContainer = nRange.startContainer;
            this.endContainer = nRange.endContainer;
            this.startOffset = nRange.startOffset;
            this.endOffset = nRange.endOffset;
            this.collapsed = nRange.collapsed;
            return this;
        },
        setStartOffset:function(offset){

            setBoundary(this,offset,'Start');
            return this;
        },
        setEndOffset:function(offset){

            setBoundary(this,offset,'End');
            return this;
        },
        setStart:function(node,offset){
            this.nativeRange.setStart(node,offset);
            this._updateBoundary();
            return this;
        },
        setStartAfter:function(node){
            return this.setStart(node.parentNode,utils.getNodeIndex(node) + 1);
        },
        setStartBefore:function(node){
            return this.setStart(node.parentNode,utils.getNodeIndex(node));
        },
        setEnd:function(node,offset){
            this.nativeRange.setEnd(node,offset);
            this._updateBoundary();
            return this;
        },
        update:function(){
            this.updateNativeRange()
                ._updateBoundary();

            return  this;
        },
        getStart:function(){
            this.update();
            return {
                startContainer:this.startContainer,
                startOffset:this.startOffset
            };
        },
        getStartOffset:function(){
            return getOffset(this,'start');
        },
        getEndOffset:function(){
            return getOffset(this,'end');
        },

        collapse:function(toStart){
            this.nativeRange.collapse(toStart === true);
            this._updateBoundary();
            return this;
        },
        isCollapsed:function(){
            this._updateBoundary();
            return this.collapsed;
        },
        insertNode:function(node){
            this.nativeRange.insertNode(node);

            return this._updateBoundary();
        },
        updateNativeRange:function(){

            this.nativeRange = this.nativeSel.getRangeAt(0);
            return this;
        },
        clear : function(){
            this.nativeSel.removeAllRanges();
            return this;
        }

    };
}());