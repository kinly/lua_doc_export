## lua 标准化导出
- 基础代码来自: https://github.com/chenshao5264/lua-doc-generator
- 修改使用默认的注释方式：
``` lua
--- 获取编号字符串
---@param id number 编号
---@param fix string 编号扩展
---@return string 编号字符串
function _123:call(id, fix)
    return tostring(id) + fix
end
```
- (注释第一行的空格必须在)
- 扩展了**接口示例**的解析
    - 示例需要放在`test`目录
    - 文件名 `test_接口文件名.lua`
    - 示例函数名: `isc_test_接口文件名:接口函数`
    ``` lua
    function isc_test_123:call()
        print(_123:call(1, "_fixed"))
    end
    ```
    - 这些都可以修改为自己喜欢的规则，代码在`export_example.js`
- 扩展了**结构数据**的解析
    - 结构数据文件需要放在 `src_data` 目录
    - 最后需要留结束行(因为是以空行为终止的)
    ``` lua
    --- 测试a信息
    ---@class a_info
    ---@field public x number x
    ---@field public y number y
    ```
## 用这样的接口和结构开发lua时，vscode + lua 会自动提示
![](readme_image/lua%E6%B3%A8%E9%87%8A.png)
![](readme_image/struct%E6%B3%A8%E9%87%8A.png)

## 导出的文档效果
- 导出的结果在 `out` 目录
- 对应`src`的每一个文件
- 结构：
## 测试a信息 `a_info`

- args:

|name|type|comment|
|:--|:--|--:|
|x|number|x|
|y|number|y|
|-|-|-|


- 接口：
## 获取编号字符串 `call`

- args:

|name|type|comment|
|:--|:--|--:|
|id|number|编号|
|fix|string|编号扩展|
|-|-|-|

- ret: `string` 编号字符串

- 示例:

``` lua
function isc_test_abc:call()
    print(_123:call(1, "_fixed"))
end
```

## 额外的：gitbook
- npm install gitbook-cli -g
- gitbook -V 报错：
```
CLI version: 2.3.2
Installing GitBook 3.2.3
C:\Users\xxxxx\AppData\Roaming\npm\node_modules\gitbook-cli\node_modules\npm\node_modules\graceful-fs\polyfills.js:287
      if (cb) cb.apply(this, arguments)
                 ^

TypeError: cb.apply is not a function
    at C:\Users\xxxxx\AppData\Roaming\npm\node_modules\gitbook-cli\node_modules\npm\node_modules\graceful-fs\polyfills.js:287:18
    at FSReqCallback.oncomplete (node:fs:208:5)
```
- 打开 `polyfills.js` 注释掉了使用这个函数`statFix`的地方
```
  // fs.stat = statFix(fs.stat)
  // fs.fstat = statFix(fs.fstat)
  // fs.lstat = statFix(fs.lstat)
```
- cd out
- gitbook init
- gitbook serve
- 本地浏览器: http://localhost:4000/ 就可以看到页面版本的样子了