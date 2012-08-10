var assert = assert || require("assert");


suite('pump',function(){
    suite('pump(fn)', function(){
        test('pump页面匿名模块加载(匿名模块前无资源)',function(done){
            pump(function(){
                done();
            });
        });   
    });    
    suite('pump(name,fn)', function(){
        test('pump创建模块', function(done){
            pump('pumptest',function(exports){
                done()
                var a = 100
                exports.a = a
            }); 
        });        
    });
    suite('pump.load(src,callback,type)', function(){
        test('pump页面匿名模块加载(匿名模块前存在异步串行资源)',function(done){
                pump.load('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
                pump.load('http://static.jquery.com/files/rocker/scripts/custom.js',function(){
                    done();
                },'serial');
        });   
        test('pump页面匿名模块加载(匿名模块前存在异步并行资源)',function(done){
                pump.clean();
                pump.load('http://localhost:3000/js/pumpt1.js','parallel');
                pump.load('http://static.c.aliimg.com/js/app/operation/homepage/page/home20120606/top-merge.js?t=0726',function(){
                    done();
                },'parallel');
        });
    });    
});
