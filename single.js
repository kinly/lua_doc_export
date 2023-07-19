const path = require("path");
const fs = require("fs");
const readline = require('readline');
const moment = require('moment');
moment.locale('zh-cn');


exports.run = function (f1, f2) {
    console.log('doing ' + f1);

    let filePath = f1;
    let outFile = f2;

    if (!filePath) {
        console.error('未设置文件路径');
        return;
    }

    // 转为绝对路径
    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);
    let dirName = path.dirname(filePath);

    // 设置输出路径
    if (!outFile) {
        outFile = path.dirname(filePath);
        outFile = path.resolve(outFile);
    }

    let outDir = filePath.substr(__dirname.length + 'src/'.length);
    outDir = __dirname + '/out' + path.dirname(outDir);


    // 判断目录是否存在
    if (fs.existsSync(outDir) === false) {
        fs.mkdirSync(outDir);
    }

    outFile = outDir + '/' + fileName + '.md'

    let apis = [];

    let api = {
        brief: '',
        params: [],
        return: null,
        //return: {type: '', explain: ''},
    };

    let content = '';

    const fRead = fs.createReadStream(filePath);
    let objReadline = readline.createInterface({
        input: fRead
    });

    let docs = [];
    let one = [];
    let start = false;
    let last = false;

    const BRIEF_FORMAT = '--- ';
    const PARAM_FORMAT = '---@param';
    const RETURN_FORMAT = '---@return';
    const END_FUNCTION = 'function ';

    objReadline.on('line', (line) => {
        line = line.replace(/^\s+|\s+$/g, "");
        let begin_line = line.substr(0, BRIEF_FORMAT.length)
        let end_line = line.substr(0, END_FUNCTION.length)
        if (begin_line === BRIEF_FORMAT) { // 开始
            one = [];
            start = true;
            one.push(line)
        } else if (end_line === END_FUNCTION) { // 结束
            if (start) {
                start = false;
                one.push(line)

                last = true;
            }
        } else {
            if (start) {
                one.push(line)
            }
            if (last) { // 函数声明行
                last = false;
                // one.push(line)
                docs.push(one);
            }
        }
    });

    objReadline.on('close', () => {

        for (let i = 0; i < docs.length; ++i) {
            parserAPI(docs[i]);
        }

        // content += '修改日期: ' + moment().format('YYYY-MM-DD HH:mm:ss') + '\n\r';
        // content += '### 0. 索引\n\r'
        // for (let i = 0; i < apis.length; ++i) {
        //     content += '[' + (i + 1) + '. ' + apis[i].name + ']' + '(#' + (i + 1) + ')\n\n'
        // }
        // content += '\n\r';
        // content += '---\n\r'

        for (let i = 0; i < apis.length; ++i) {
            appendContent(apis[i], i + 1);
        }

        fs.writeFileSync(outFile, content, { encoding: 'utf8', flag: 'w' });
    });

    const type_reg = /^{.*?}/
    const parserParam = function (param) {
        let detail = param.substr(PARAM_FORMAT.length).replace(/^\s+|\s+$/g, "");
        // // 类型
        // let type = detail.match(type_reg);
        // if (type == null) {
        //     return;
        // }

        // 字段
        let p3 = detail.substr(('').length).replace(/^\s+|\s+$/g, "").split(' ');
        let field = p3[0]; // 不能带空格
        let type = p3[1]; // 不能带空格
        let explain = p3[2]; // 不能带空格
        for (let i = 3; i < p3.length; ++i) {
            explain += ' ' + p3[i]
        }

        p3.splice(0, 3)
        let remark = p3.join(''); // 防止备注中有空格

        // type = type[0];
        let canNull = false;
        if (type.indexOf('null') === -1) {
            type = type.substr(0, type.length);
            if (type === '*') {
                type = 'any';
            }
        } else {
            canNull = true;

            let s = type.indexOf('|')
            if (s > 0) {
                type = type.substr(1, s - 1).replace(/^\s+|\s+$/g, "");
            }
        }

        api.params.push({
            type: type,
            canNull: canNull,
            field: field,
            explain: explain,
            remark: remark,
        })
    }

    const parserAPI = function (t) {
        api = {
            name: '',
            brief: '',
            params: [],
            return: null,
            is_table: false,
        };

        for (let i = 0; i < t.length; ++i) {
            if (t[i].indexOf(PARAM_FORMAT) !== -1) {
                parserParam(t[i])
            } else if (t[i].indexOf(RETURN_FORMAT) !== -1) {
                let result = t[i].substr(RETURN_FORMAT.length).replace(/^\s+|\s+$/g, "");
                // 类型
                let presult = result.substr(('').length).replace(/^\s+|\s+$/g, "").split(' ');
                if (presult.length >= 2) {
                    api.return = []
                    api.return.type = presult[0]
                    api.return.explain = presult[1]

                    for (let x = 2; x < presult.length; ++x) {
                        api.return.explain += ' ' + presult[x]
                    }
                }

            } else if (t[i].indexOf(BRIEF_FORMAT) !== -1) {
                api.brief = t[i].substr(BRIEF_FORMAT.length).replace(/^\s+|\s+$/g, "");
            } else if (t[i].indexOf(END_FUNCTION) !== -1) {

                let last = t[i];
                let s = last.match(/:.*\(/);
                if (s) {
                    api.name = s[0].substr(1, s[0].length - 2);
                } else {
                    s = last.match(/\..*\(/);
                    if (s) {
                        api.name = s[0].substr(1, s[0].length - 2);
                    } else {
                        s = last.match(/ .*\(/);
                        if (s) {
                            api.name = s[0].substr(1, s[0].length - 2);
                        } else {
                            s = last.match(/.* =/);
                            api.name = s[0].substr(0, s[0].length - 2);
                            api.is_table = true;
                        }
                    }
                }
            }
        }

        if (api.name !== '')
            apis.push(api);
    }

    const appendContent = function (api, idx) {
        // content += '<h3><span id =' + idx + '>'
        // content += idx + '. ' + api.name
        // content += '</span></h3>\n\r'
        content += '## ' + api.brief + ' `' + api.name + '`';
        content += '\n\r';
        if (!api.is_table) {
            content += '- args:\n\r';
        }
        content += '|name|type|comment|\n'
        content += '|:--|:--|--:|\n'
        if (api.params.length === 0) {
            content += '|-|-|-|\n'
        } else {
            for (let i = 0; i < api.params.length; ++i) {
                let param = api.params[i];
                content += '|' + param.field
                content += '|' + param.type
                // if (param.canNull) {
                //     content += '|' + '否'
                // } else {
                //     content += '|' + '是'
                // }
                content += '|' + param.explain
                // content += '|' + param.remark
                content += '|\n'
            }
            content += '|-|-|-|'
        }
        content += '\n\r';

        if (api.return) {
            // content += '|类型|说明|\n'
            // content += '|:--|:--|\n'
            // content += '|' + api.return.type
            // content += '|' + api.return.explain
            // content += '|\n\r'
            content += '- ret: `' + api.return.type + '` ' + api.return.explain + '\n\r'
        } else {
            if (!api.is_table) {
                content += '- ret: 无\n\r'
            }
        }

        // content += '\n'
    }
};



