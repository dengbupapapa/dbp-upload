## ~~dbp-upload 1.0~~

### ~~目前只做了个浏览器上传兼容（并且没有亲自测，哈哈～），使用如下~~
## 调用方法已废除，请参照1.2以后

	var up = new DbpUpload({
    	url: '/upload',
    	trigger: 'MyUpDemo',
    	onSuccess: function(res, trigger, event) {
        	console.log(res);
    	},
    	onError: function(a, b, c) {

    	}
	});

## dbp-upload 1.1

### 检查了ie8，果然有兼容问题，坑爹的ie8。不过都解决啦

## dbp-upload 1.2
### 新增功能：是否多文件上传、是否限制单位大小、是否限制多文件总大小、上传前回调。
### 修改功能：初始化使用init。
	var up = new DbpUpload();
		up.init({
    	url: '/upload',
    	trigger: 'MyUpDemo',
    	multiple: true,
    	multipleSize: '300kb',
    	accept: 'image/png,image/gif,image/jpg',
    	size: '300kb',
    	onBeforeUpLoad: function(res) {
        	console.log(res)
    	},
    	onSuccess: function(res, trigger, event) {
        	console.log(res);
    	},
    	onError: function(a, b, c) {
        	console.log(a, b, c);
    	}
	})
	
## dbp-upload 1.3
### 检查ie8，果然又有问题。。我擦，获取文件大小这么炒蛋，还不能多文件上传。目前解决方案就是ie89？没有多文件上传，文件大小限制需要用户自己动手去降低浏览器的安全性。不过移动端大多都ok吧？毕竟webkit占大头，移动端需要的是轻量哦