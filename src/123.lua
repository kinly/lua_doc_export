local _123 = {}

--- 获取编号字符串
---@param id number 编号
---@param fix string 编号扩展
---@return string 编号字符串
function _123:call(id, fix)
    return tostring(id) + fix
end


return _123