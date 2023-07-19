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

    let outDir = filePath.substr(__dirname.length + 'src_data/'.length);
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
    const CLASS_FORMAT = '---@class';
    const FIELD_FORMAT = '---@field';

    objReadline.on('line', (line) => {
        line = line.replace(/^\s+|\s+$/g, "");
        let begin_line = line.substr(0, BRIEF_FORMAT.length)
        if (begin_line === BRIEF_FORMAT) { // 开始
            one = [];
            start = true;
            one.push(line)
        } else if (line === '') { // 结束
            if (start) {
                start = false;
                one.push(line)

                last = true;

                if (last) { // 函数声明行
                    last = false;
                    // one.push(line)
                    docs.push(one);
                }
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
    const parserField = function (param) {
        let detail = param.substr(FIELD_FORMAT.length).replace(/^\s+|\s+$/g, "");

        // 字段
        let p4 = detail.substr(('').length).replace(/^\s+|\s+$/g, "").split(' ');
        let field = p4[1]; // 不能带空格
        let type = p4[2]; // 不能带空格
        let explain = p4[3]; // 不能带空格
        for (let i = 4; i < p4.length; ++i) {
            explain += ' ' + p4[i]
        }

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
            if (t[i].indexOf(FIELD_FORMAT) !== -1) {
                parserField(t[i])
            } else if (t[i].indexOf(CLASS_FORMAT) !== -1) {
                api.name = t[i].substr(CLASS_FORMAT.length).replace(/^\s+|\s+$/g, "");
            } else if (t[i].indexOf(BRIEF_FORMAT) !== -1) {
                api.brief = t[i].substr(BRIEF_FORMAT.length).replace(/^\s+|\s+$/g, "");
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
    }
};



