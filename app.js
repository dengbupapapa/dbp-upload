const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, 'WEB-INF'))); //读取文件名称，名字可要靠自己去数据库搞哦哦哦哦

app.post('/upload', (req, res, next) => { //储存file
    console.log(req.body);
    console.log(req.query);
    let form = new multiparty.Form();
    let params = req.params;
    let childrenDir = path.join(__dirname, 'storage');

    if (!fs.existsSync(childrenDir)) { //有没有该目录啊大哥，没有咱自己造一个啊
        fs.mkdirSync(childrenDir);
    }

    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = path.join('storage'); //params为存储子目录名称
    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和
    form.parse(req, function(err, fields, files) {

        if (err) {
            res.json({
                code: 4000,
                success: false,
                messges: '上传失败'
            });
        }
        console.log(files);
        // let filesContent = files.file;
        // let filesInfo = filesContent.map(({
        //     originalFilename,
        //     path
        // }, i) => ({
        //     originalFilename,
        //     path: path.replace(/^storage/, '')
        // }));

        res.json({
            code: 9000,
            success: true,
            messges: '上传成功',
            // filesInfo
        });

    });

});

app.use(function(err, req, res, next) { //errer middleware
    console.log(err);
    res.send(err);
});

module.exports = app;