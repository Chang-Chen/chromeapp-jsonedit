const container = document.getElementById('jsoneditor')
const jsonkey = 'jsonv'
const options = {
  mode: 'code',
  modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
  onChange: () => {
    try {
      localforage.setItem(jsonkey,editor.get())
    } catch (e) {}
  },
}

const search = new URLSearchParams(window.location.search)
const mode = [...search.keys()][0] || ''
const editor = new JSONEditor(container, options)
function loadText(text) {
  if (text) {
    try {
      editor.set(JSON.parse(text))
    } catch (e) {
      editor.setText(text)
    }
  } else {
    editor.setText(text)
  }
}

function readClipboard() {
  return new Promise((resolve) => {
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({}, function (response) {
        resolve(response && response.clipboard ? response.clipboard : '')
      })
      return
    }
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(resolve).catch(() => resolve(''))
      return
    }
    resolve('')
  })
}

async function init() {
  let json = ''
  try {
    try{
      // 获取url后面的json字符串
      if (search.has('text') || search.has('json')) {
        json = decodeURIComponent((search.get('text') || search.get('json') || '').replace(/\+/g, ' '))
      } else if (search.has('base64')) {
        json = atob(search.get('base64') || '')
      } else if (!mode || mode == '') {
        json = await localforage.getItem(jsonkey) || json
      } else if ('none' == mode) {
        json = ''
      } else if ('clipboard' == mode) {
        json = await readClipboard()
        loadText(json)
        return
      }
    }catch(e) {
     json = await localforage.getItem(jsonkey) || json
    }
  } catch (e) { }
  loadText(json)
}
init()

editor.focus()
// 设置JSONEditor实例
window.JSONEditorInstance = editor

//加载时设置默认字体大小
var font = parseInt(localStorage.getItem('jsonedit_fontsize'));
if (font < 0) {
	font = 15;
  localStorage.setItem('jsonedit_fontsize', font);
}
document.querySelector('.ace_editor').style.fontSize = font + 'px';
