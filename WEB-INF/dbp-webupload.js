var DbpUpload = (function() {

    function DbpUpload(opts) {

        this.opts = {
            url: '' || opts.url,
            trigger: '' || document.getElementById(opts.trigger),
            iframeSignPrefix: 'dbp-uploader-' || opts.iframeSignPrefix,
            onSuccess: opts.onSuccess || null,
            prevFill: null
        }

        this.init();

    }

    DbpUpload.prototype = {

        init: function() {

            var _self = this;

            addEvent(this.opts.trigger, 'click', function(e) { //为触发按钮添加事件

                hasUseFormDate.call(_self, this);

            });

            // listenerIframe(this); //监视iframe操作你的主人有没有下定决心啊

        },

    }

    var hasUseFormDate = (function() { //判断是否支持h5 FormDate

        // if (window.FormData) {

        //     return function(trigger) {

        //         var _seed = createSeed();
        //         createFileInput.call(this, this.opts.iframeSignPrefix + 'input-' + _seed, trigger) //创建iframe

        //     }

        // } else {

        return function(trigger) {

            var _seed = createSeed();
            createIframe(this.opts.iframeSignPrefix + 'iframe-' + _seed, trigger, this) //创建iframe

        }

        // }

    })()

    function createSeed() { //创建随机值

        return Math.floor(Math.random() * 1000);

    }

    function createFileInput(inputSeed, trigger) {

        removePrve(this.opts.prevFill); //在做正事之前咱先收拾干干净净好吧

        var _fileInputDom = createFileInputDom.call(this, inputSeed); //创建fileinput

        this.opts.prevFill = _fileInputDom; //记录新创建的inputDom
        insertAfter(_fileInputDom, trigger); //插到目标按钮之后
        addFileInputEvents.call(this, inputSeed); //为添加file事件集合

    }

    function createFileInputDom(inputSeed) { //创建fileinput

        var inputDom;

        try {
            inputDom = document.createElement('<input type="file" id="' + inputSeed + '" name="' + inputSeed + '" style="display:none;">');
        } catch (e) {
            inputDom = document.createElement('input');
            inputDom.type = 'file';
            inputDom.name = inputSeed;
            inputDom.id = inputSeed;
            inputDom.style.display = 'none';
        }

        return inputDom
    }

    function addFileInputEvents(inputSeed) { //file事件集合

        var _self = this;
        var fileInputDom = document.getElementById(inputSeed);

        dispatchEvent(fileInputDom, 'click'); //触发file
        addEvent(fileInputDom, 'change', function(e) { //上传filevalue改变监听

            var file = this.files[0];
            var xhr = new XMLHttpRequest();
            var fd = new window.FormData();

            requestFileInputEvent.call(_self, xhr, this, file);

            fd.append(inputSeed, file);
            xhr.open('POST', _self.opts.url);
            xhr.send(fd);

        });

    }

    function requestFileInputEvent(xhr, fileInputDom, file) { //inputfile上传文件事件监听集合

        var _self = this;

        xhr.onload = function(res) {
            _self.opts.onSuccess(res.currentTarget.response, _self.opts.trigger, file);
            _self.opts.prevFill = null;
            deleteElement(fileInputDom); //删除iframe
        }

        xhr.onerror = function(a, b, c) {
            _self.onError(a, b, c);
            _self.opts.prevFill = null;
            deleteElement(fileInputDom); //删除iframe
        }

    }

    function removePrve(prevFill) {

        if (prevFill) { //如果存在之前未清理的iframe，先打扫干净
            deleteElement(prevFill);
        }

    }

    function createIframe(iframeSeed, trigger, selfArg) {

        removePrve(selfArg.opts.prevFill); //在做正事之前咱先收拾干干净净好吧

        var _iframeDom = createIframeDom(iframeSeed); //创建iframeDom

        insertAfter(_iframeDom, trigger); //插到目标按钮之后

        if (iframeShouldNeedLoad.call(selfArg, iframeSeed)) { //判断iframe 是否需要加载

            addEvent(_iframeDom, 'load', function(e) { //iframe加载成功之后

                removeEvent(_iframeDom, 'load', null); //加载完之后就移除该事件，以免和上传后load事件有兼容问题出现

                iframeDomInsertAfterLater.call(selfArg, _iframeDom, iframeSeed);

            });

        } else {

            iframeDomInsertAfterLater.call(selfArg, _iframeDom, iframeSeed);

        }

        // return _iframeDom

    }

    function iframeShouldNeedLoad(iframeSeed) { //新鲜的iframe需要加载吗亲？

        var _iframeDoc = getIframeDocment(iframeSeed);

        return _iframeDoc.body ? false : true;

    }

    function iframeDomInsertAfterLater(iframeDom, iframeSeed) { //插入iframe到document之后

        var _iframeDoc = getIframeDocment(iframeSeed); //获取iframe下的文档

        this.opts.prevFill = iframeDom; //记录新创建的iframe
        addIframeMainContent(_iframeDoc, iframeSeed, this); //为iframe下的文档添加提交内容
        addIframeDocumentsEvents(_iframeDoc, iframeSeed); //为iframe下的文档添加事件集合
        addIframeEvents(_iframeDoc, iframeDom, iframeSeed, this); //为iframe添加事件集合

    }

    function createIframeDom(iframeSeed) { //创建为兼容低版本上传iframe

        var iframe;

        try {
            iframe = document.createElement('<iframe id="' + iframeSeed + '" name="' + iframeSeed + '" style="display:none;"></iframe>');
        } catch (e) {
            iframe = document.createElement('iframe');
            iframe.name = iframeSeed;
            iframe.id = iframeSeed;
            iframe.style.display = 'none';
        }

        return iframe
    }

    function getIframeDocment(id) { //获取iframe下的docment

        var doc = document.getElementById(id).contentDocument || document.frames[id].document;

        return doc;

    }

    function addIframeMainContent(iframeDocment, iframeSeed, selfArg) {

        var _hostname = location.hostname;
        var _port = location.port;
        var _protocol = location.protocol;

        iframeDocment.body.innerHTML = [
            '<form action="' + _protocol + '//' + _hostname + (_port ? ':' + _port : '') + selfArg.opts.url + '" enctype="multipart/form-data" method="post">',
            '<input type="file" name="' + iframeSeed + '" id="' + iframeSeed + '">',
            '</form>'
        ].join('');

    }

    function addIframeDocumentsEvents(iframeDocment, iframeSeed) { //iframe下documents事件集合

        addEvent(iframeDocment.getElementById(iframeSeed), 'change', function(e) { //上传filevalue改变监听
            iframeDocment.getElementsByTagName('form')[0].submit();
        });

        dispatchEvent(iframeDocment.getElementById(iframeSeed), 'click'); //触发file

    }

    function addIframeEvents(iframeDocment, iframeDom, iframeSeed, selfArg) { //iframe事件集合

        addEvent(iframeDom, 'load', function(e) { //上传成功监听事件

            var _onSuccess = selfArg.opts.onSuccess;

            if (_onSuccess && typeof _onSuccess == 'function') {
                _onSuccess(filterResult(getIframeDocment(iframeSeed).body.innerText), selfArg.opts.trigger, e);
            }

            // removeEvent(iframeDom, 'load', null); //移除事件
            // removeEvent(iframeDocment.getElementById(iframeSeed), 'change', null); //移除事件
            deleteElement(iframeDom); //删除iframe
            selfArg.opts.prevFill = null; //因为顺利删除所以清空记录

        });

        addEvent(iframeDom, 'error', function(e) { //上传失败监听事件

            var _onErrors = selfArg.opts.onErrors;

            if (_onErrors && typeof _onErrors == 'function') {
                _onErrors(filterResult(getIframeDocment(iframeSeed).body.innerText), selfArg.opts.trigger, e);
            }

            // removeEvent(iframeDom, 'load', null); //移除事件
            // removeEvent(iframeDocment.getElementById(iframeSeed), 'change', null); //移除事件
            deleteElement(iframeDom); //删除iframe
            selfArg.opts.prevFill = null; //因为顺利删除所以清空记录

        });

    }

    function listenerIframe(selfArg) { //我是一个iframe偷窥狂

        addEvent(document, 'stop', function(e) { //file弹窗的取消无事件监听，顾使用mouseover监听document，曲线救国啊啊啊啊
            // removePrveIframe(selfArg.opts.prevFill);
        });

    }

    var addEvent = (function() { //事件兼容

        if (document.addEventListener) {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                } else {
                    el.addEventListener(type, fn, false);
                }
            };
        } else if (document.attachEvent) {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                } else {
                    el.attachEvent('on' + type, function() {
                        return fn.call(el, window.event);
                    });
                }
            };
        } else {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                } else {
                    el['on' + type] = fn;
                }
            }
        }
    })();

    var removeEvent = (function() { //事件兼容

        if (document.removeEventListener) {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        removeEvent(el[i], type, fn);
                    }
                } else {
                    el.removeEventListener(type, fn, false);
                }
            };
        } else if (document.deattachEvent) {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        removeEvent(el[i], type, fn);
                    }
                } else {
                    el.deattachEvent('on' + type, function() {
                        return fn.call(el, window.event);
                    });
                }
            };
        } else {
            return function(el, type, fn) {
                if (el.length) {
                    for (var i = 0; i < el.length; i++) {
                        removeEvent(el[i], type, fn);
                    }
                } else {
                    el['on' + type] = null;
                }
            }
        }
    })();

    var dispatchEvent = (function() { //模拟事件触发

        if (document.all) { // IE
            return function(el, type) {
                el[type]();
            }
        } else { // 其它浏览器
            return function(el, type) {
                var e = document.createEvent('MouseEvents');
                e.initEvent(type, true, true);
                el.dispatchEvent(e);
            }
        }

    })();

    function filterResult(res) { //过滤响应结果

        if (typeof res == 'string') {
            try {
                return JSON.parse(res);
            } catch (e) {
                return res;
            }
        } else {
            return res;
        }

    }

    function insertAfter(newEl, targetEl) { //在某元素之后插入节点

        var parentEl = targetEl.parentNode;

        if (parentEl.lastChild == targetEl) {
            parentEl.appendChild(newEl);
        } else {
            parentEl.insertBefore(newEl, targetEl.nextSibling);
        }

    }

    function deleteElement(targetEl) { //删除元素

        var parentEl = targetEl.parentNode;

        parentEl.removeChild(targetEl);

    }

    return DbpUpload;

}())