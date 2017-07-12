## dbp-upload 1.0

### 目前只做了个浏览器上传兼容（并且没有亲自测，哈哈～），使用如下

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