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
## 获取编号字符串 `call_2`
- args:
|name|type|comment|
|:--|:--|--:|
|id|number|编号|
|fix|string|编号扩展|
|-|-|-|
- ret: `a_info` 结构
