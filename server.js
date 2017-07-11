const app = require('./app.js');

app.set('port', '8888');
app.listen(app.get('port'), () => {
    console.log('Server started: http://localhost:' + app.get('port'));
})