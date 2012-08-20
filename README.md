#pump

pump是一个轻量的异步加载资源与模块的库

pump 的特点是会让异步并行的脚本按照页面或脚本中位置的先后顺序执行，不需要依靠文件依赖来维护执行顺序，行为类似于script标签在页面中的表现；此外pump还可以加载样式和图片。

##如何使用?

###引入pump

在head中引入`pump-min.js` ，`<script src="pump-min.js"></script>`

或者直接将 `pump-min.js` 的代码拷贝在head中，所有外联样式(link中的css)之上，可避免阻塞外联css的加载。

###使用方法

####加载
pump 可异步并行加载js，并能加载css,img

`pump.load(src[, callback[, type]])`

src : 需要加载的js，css，img 

callback[可选]: 回调  

type[可选]: 执行类型，默认为pump.config.type 中定义的类型，默认设置为并行加载 `order`。  
1. `now` : 下载完后立刻执行，不依赖于任何脚本的执行，声明即加载，加载后立刻执行，无关执行顺序。    
2. `order` : 会按照html或script中位置的顺序执行。  


Example:
	
	//加载脚本
	pump.load('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
	
	//并行加载回调执行
	pump.load('http://pump.test/js/pumpt-m1.js',function(){
		console.log('success!!');
	});
	
	//异步无顺序加载
	pump.load('http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js','now')

####模块系统
`pump(name, fn)`: 定义模块  
`pump(fn)`: 定义匿名模块  
`pump(name)`:获取模块

#####模块的定义  
允许通过 `exports` 输出api

Example:

	//定义一个模块 module-1
	pump('module-1',function(exports){
        var a = 100
        exports.a = a
    });
    //定义匿名模块
    pump(function(){
    	console.log('hello world')
    })
    // 在m2中通过pump(name)的方式获取到模块
    pump('m2',function(){
    	console.log(pump('module-1').a)
    });

注：如果pump声明在两个pump.load中间，仍然会按照html或script中位置的顺序执行，async除外。

####Domready后执行

`pump.ready([name,] fn)`  

name[可选]: 模块名
fn: 回调，无name则为匿名模块

Example:

	pump.ready('mymodule',function(){
		console.log('ready')
	});
	pump.ready(function(){
		console.log('ready')
	});
	
注：如果所有的脚本在domready后执行完，ready中的模块则会在所有脚本执行完之后执行，否则在domready后执行(ready同样遵循按照html或script的位置顺序执行的原则，domready即文档的最后，所以会在所有load的文件执行完后执行)；

####清除
`pump.clean()`
清除之前的加载，执行队列以及所有模块

####配置

`pump.config`

`charset` : 文件编码  
`type`: 默认执行类型 `now`，`order`  



##License
Copyright (c) ianva






