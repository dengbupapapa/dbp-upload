var DbpUpload = (function() {

    function DbpUpload() {

        this.opts = {
            signPrefix: 'dbp-uploader-',
            onSuccess: null,
            onError: null,
            onBeforeUpLoad: null,
            prevFill: null,
            accept: '',
            multiple: false,
            size: '',
            multipleSize: '',
            alreadyUpLoadTotalNumber: 0,
            alreadyUpLoadTotalSize: 0
        }

    }

    DbpUpload.prototype = {

        init: function(opts) {

            if (opts.size && !fileSizeParseBit(opts.size)) throw (new Error('size format error! \n example:1kb、1mb、1b')); //size格式错误
            if (opts.multipleSize && !fileSizeParseBit(opts.multipleSize)) throw (new Error('multipleSize format error! \n example:1kb、1mb、1b')); //size格式错误
            if (!!!opts.url) throw (new Error('url required!'));
            if (!!!opts.trigger) throw (new Error('trigger required!'));

            this.opts = {
                url: opts.url,
                trigger: document.getElementById(opts.trigger),
                signPrefix: opts.signPrefix || this.opts.signPrefix,
                onSuccess: opts.onSuccess || this.opts.onSuccess,
                onError: opts.onError || this.opts.onError,
                onBeforeUpLoad: opts.onBeforeUpLoad || this.opts.onBeforeUpLoad,
                accept: opts.accept || this.opts.accept,
                multiple: opts.multiple || this.opts.multiple,
                size: opts.size || this.opts.size,
                sizeParseBit: opts.size && fileSizeParseBit(opts.size),
                multipleSize: opts.multipleSize || this.opts.multipleSize,
                multipleSizeParseBit: opts.multipleSize && fileSizeParseBit(opts.multipleSize),
            }

            var _self = this;

            addEvent(this.opts.trigger, 'click', function(e) { //为触发按钮添加事件

                hasUseFormDate.call(_self, this);

            });

            // listenerIframe(this); //监视iframe操作你的主人有没有下定决心啊

        },
        setOnSuccess: function(cb) {
            return this.opts.onSuccess = cb;
        },
        setOnError: function(cb) {
            return this.opts.onError = cb;
        },
        setOnBeforeUpLoad: function(cb) {
            return this.opts.onBeforeUpLoad = cb;
        },
        setAccept: function(val) {
            return this.opts.accept = val;
        },
        setMultiple: function(val) {
            return this.opts.multiple = val;
        },
        setSize: function(size) {
            if (opts.size && !fileSizeParseBit(opts.size)) throw (new Error('size format error! \n example:1kb、1mb、1b')); //size格式错误
            return this.opts.size = val;
        },
        setMultipleSize: function(multipleSize) {
            if (opts.multipleSize && !fileSizeParseBit(opts.multipleSize)) throw (new Error('multipleSize format error! \n example:1kb、1mb、1b')); //size格式错误
            return this.opts.multipleSize = val;
        },
        getAlreadyUpLoadTotalNumber: function() {
            return this.opts.alreadyUpLoadTotalNumber;
        },
        getAlreadyUpLoadTotalSize: function() {
            return this.opts.alreadyUpLoadTotalSize;
        }

    }

    var hasUseFormDate = (function() { //判断是否支持h5 FormDate

        if (window.FormData) {

            return function(trigger) {

                var _seed = createSeed();
                createFileInput.call(this, this.opts.signPrefix + 'input-' + _seed, trigger) //创建iframe

            }

        } else {

            return function(trigger) {

                var _seed = createSeed();
                createIframe(this.opts.signPrefix + 'iframe-' + _seed, trigger, this) //创建iframe

            }

        }

    })()

    function createSeed() { //创建随机值

        return Math.floor(Math.random() * 1000);

    }

    function fileSizeParseBit(size) { //文件大小限制转换成bit

        var _size = size || this.opts.size;
        var _numSize = _size.match(/[\d\.]+/)[0];

        return (new RegExp(/^(([1-9]\d*)|[0])(\.\d+)?MB$/, 'i').test(_size) && _numSize * 1000 * 1000) || (new RegExp(/^(([1-9]\d*)|[0])(\.\d+)?KB$/, 'i').test(_size) && _numSize * 1000) || (new RegExp(/^(([1-9]\d*)|[0])(\.\d+)?B$/, 'i').test(_size) && _numSize);
    }

    function fileSizeValidate(file) { //文件大小验证

        var _limitSize = this.opts.sizeParseBit;
        var _fileSize = file.size;

        return _limitSize > _fileSize;

    }

    function emitterDataBefore(fileList, inputSeed, fd) { //发送数据前验证文件大小

        var uploadFileMultipleSize = 0;
        var _onBeforeUpLoad = this.opts.onBeforeUpLoad;

        for (var i in fileList) {

            if (fileList[i].size) { //过滤文件实例

                if (this.opts.size && !fileSizeValidate.call(this, fileList[i])) { //大小是否合适

                    if (_onBeforeUpLoad && typeof _onBeforeUpLoad == 'function') { //上传前反馈
                        _onBeforeUpLoad({
                            code: 'sizeOverflow',
                            message: '单个文件大小超出' + this.opts.size,
                            limit: this.opts.size
                        });
                    }

                    return false;

                }

                uploadFileMultipleSize += fileList[i].size;

                if (this.opts.multiple && this.opts.multipleSize && (uploadFileMultipleSize > this.opts.multipleSizeParseBit)) { //验证多张图片总大小是否超标

                    if (_onBeforeUpLoad && typeof _onBeforeUpLoad == 'function') { //上传前反馈
                        _onBeforeUpLoad({
                            code: 'sizeOverflow',
                            message: '多个文件总大小超出' + this.opts.multipleSize,
                            limit: this.opts.multipleSize
                        });
                    }

                    return false;

                }

                this.opts.alreadyUpLoadTotalNumber++;
                this.opts.alreadyUpLoadTotalSize += fileList[i].size;

                if (fd) {
                    fd.append(inputSeed + createSeed() * createSeed(), fileList[i])
                }

            }

        }

        return true;

    }

    /*
        html5版本，功能包括：
        创建fileinput
        创建fileinput事件
        发送xhr
        文件大小限制
        是否可多文件
        可上传的类型
    */
    function createFileInput(inputSeed, trigger) {

        removePrve(this.opts.prevFill); //在做正事之前咱先收拾干干净净好吧

        var _fileInputDom = createFileInputDom.call(this, inputSeed); //创建fileinput

        this.opts.prevFill = _fileInputDom; //记录新创建的inputDom
        insertAfter(_fileInputDom, trigger); //插到目标按钮之后
        addFileInputEvents.call(this, inputSeed); //为添加file事件集合

    }

    function createFileInputDom(inputSeed) { //创建fileinput

        var inputDom;
        var _multiple = (this.opts.multiple == true) ? 'multiple' : '';
        var _accept = this.opts.accept;

        try {
            inputDom = document.createElement('<input type="file" id="' + inputSeed + '" name="' + inputSeed + '" accept="' + _accept + '" ' + _multiple + ' style="display:none;">');
        } catch (e) {
            inputDom = document.createElement('input');
            inputDom.type = 'file';
            inputDom.name = inputSeed;
            inputDom.id = inputSeed;
            inputDom.style.display = 'none';
            inputDom.accept = _accept;
            inputDom.multiple = _multiple;
        }

        return inputDom
    }

    function addFileInputEvents(inputSeed) { //file事件集合

        var _self = this;
        var fileInputDom = document.getElementById(inputSeed);

        dispatchEvent(fileInputDom, 'click'); //触发file
        addEvent(fileInputDom, 'change', function(e) { //上传filevalue改变监听

            var fileList = this.files;
            var fd = new window.FormData();

            if (!emitterDataBefore.call(_self, fileList, inputSeed, fd)) return false;

            var xhr = new XMLHttpRequest();

            requestFileInputEvent.call(_self, xhr, this, fileList);

            xhr.open('POST', _self.opts.url);
            xhr.send(fd);

        });

    }

    function requestFileInputEvent(xhr, fileInputDom, file) { //inputfile上传文件事件监听集合

        var _self = this;

        xhr.onload = function(res) {

            var _onSuccess = _self.opts.onSuccess;

            if (_onSuccess && typeof _onSuccess == 'function') {
                _self.opts.onSuccess(res.currentTarget.response, _self.opts.trigger, file);
                _self.opts.prevFill = null;
            }

            deleteElement(fileInputDom); //删除iframe

        }

        xhr.onerror = function(a, b, c) {

            var _onErrors = _self.opts.onErrors;

            if (_onErrors && typeof _onErrors == 'function') {
                _self.onError(a, b, c);
                _self.opts.prevFill = null;
            }

            deleteElement(fileInputDom); //删除iframe

        }

    }

    function removePrve(prevFill) {

        if (prevFill) { //如果存在之前未清理的iframe，先打扫干净
            deleteElement(prevFill);
        }

    }

    /*
        兼容版本，功能包括：
        创建iframe
        创建iframe事件
        移除iframe
        文件大小限制
        是否可多文件
        可上传的类型
    */
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
        addIframeDocumentsEvents.call(this, _iframeDoc, iframeSeed); //为iframe下的文档添加事件集合
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
        var _multiple = (selfArg.opts.multiple == true) ? 'multiple' : '';
        var _accept = selfArg.opts.accept;

        iframeDocment.body.innerHTML = [
            '<form action="' + _protocol + '//' + _hostname + (_port ? ':' + _port : '') + selfArg.opts.url + '" enctype="multipart/form-data" method="post">',
            '<input type="file" name="' + iframeSeed + '" id="' + iframeSeed + '" ' + _multiple + ' accept="' + _accept + '">',
            '</form>'
        ].join('');

    }

    function addIframeDocumentsEvents(iframeDocment, iframeSeed) { //iframe下documents事件集合

        var _self = this;

        addEvent(iframeDocment.getElementById(iframeSeed), 'change', function(e) { //上传filevalue改变监听

            var fileList = this.files;
            var filePath = this.value;
            var _size = this.opts.size;
            var fileSystem;

            var file = fileSystem.GetFile(filePath);
            var fileSize = file.Size;

            if (_size && _size < fileSize) { //大小是否合适

                try {

                    fileSystem = new ActiveXObject('Scripting.FileSystemObject');

                } catch (e) {

                    if (_onBeforeUpLoad && typeof _onBeforeUpLoad == 'function') { //上传前反馈
                        _onBeforeUpLoad({
                            code: 'getSizeIeAuthorityLimit',
                            message: '如果你用的是ie8 请将安全级别调低！',
                        });
                    }

                    return false;

                }

                if (_onBeforeUpLoad && typeof _onBeforeUpLoad == 'function') { //上传前反馈
                    _onBeforeUpLoad({
                        code: 'sizeOverflow',
                        message: '单个文件大小超出' + this.opts.size,
                        limit: this.opts.size
                    });
                }

                return false;

            }

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

    /*
        公共兼容属性
    */
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