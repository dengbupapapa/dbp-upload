window.onload = function() {

    //Mydemo
    function children(curEle, tagName) {
        var nodeList = curEle.childNodes;
        var ary = [];
        if (/MSIE(6|7|8)/.test(navigator.userAgent)) {
            for (var i = 0; i < nodeList.length; i++) {
                var curNode = nodeList[i];
                if (curNode.nodeType === 1) {
                    ary[ary.length] = curNode;
                }
            }
        } else {
            ary = Array.prototype.slice.call(curEle.children);
        }

        // 获取指定子元素
        if (typeof tagName === "string") {
            for (var k = 0; k < ary.length; k++) {
                curTag = ary[k];
                if (curTag.nodeName.toLowerCase() !== tagName.toLowerCase()) {
                    ary.splice(k, 1);
                    k--;
                }
            }
        }

        return ary;
    }
}

// function previewImage(file, prvid) {
//     /* file：file控件
//      * prvid: 图片预览容器
//      */
//     var tip = "Expect jpg or png or gif!"; // 设定提示信息
//     var filters = {
//         "jpeg": "/9j/4",
//         "gif": "R0lGOD",
//         "png": "iVBORw"
//     }
//     var prvbox = document.getElementById(prvid);
//     prvbox.innerHTML = "";
//     console.log(file);
//     if (window.FileReader) { // html5方案
//         for (var i = 0, f; f = file.files[i]; i++) {
//             var fr = new FileReader();
//             fr.onload = function(e) {
//                 var src = e.target.result;
//                 if (!validateImg(src)) {
//                     alert(tip)
//                 } else {
//                     showPrvImg(src);
//                 }
//             }
//             fr.readAsDataURL(f);
//         }
//     } else { // 降级处理

//         if (!/\.jpg$|\.png$|\.gif$/i.test(file.value)) {
//             alert(tip);
//         } else {
//             showPrvImg(file.value);
//         }
//     }

//     function validateImg(data) {
//         var pos = data.indexOf(",") + 1;
//         for (var e in filters) {
//             if (data.indexOf(filters[e]) === pos) {
//                 return e;
//             }
//         }
//         return null;
//     }

//     function showPrvImg(src) {
//         var img = document.createElement("img");
//         img.src = src;
//         prvbox.appendChild(img);
//     }
// }

var up = new DbpUpload({
    url: '/upload',
    trigger: 'MyUpDemo',
    onSuccess: function(res, trigger, event) {
        console.log(res);
    }
});

var ups = new DbpUpload({
    url: '/upload',
    trigger: 'MyUpDemos',
    onSuccess: function(res, trigger, event) {
        console.log(res);
    }
});