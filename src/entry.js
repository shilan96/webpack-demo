// 使用相对路径
import css from './css/index.css'
import less from './css/common.less'

const name = 'ali biu biu biu'
document.getElementById("index_wrap").innerHTML = name

const json = require('../config.json')
alert(json.name + json.age + json.sex)