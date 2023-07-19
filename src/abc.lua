--- 获取编号字符串
---@param id number 编号
---@param fix string 编号扩展
---@return string 编号字符串
function _abc:call(id, fix)
    return tostring(id) + fix
end

--- 获取编号字符串
---@param id number 编号
---@param fix string 编号扩展
---@return a_info 结构
function _abc:call_2(id, fix)
    return tostring(id) + fix
end

