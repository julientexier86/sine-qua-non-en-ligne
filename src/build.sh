#!/bin/sh
cd /home/claude/app
cat part1_engine.js part2_model.js part3_render.js part3b_tex.js part5_extras.js part5b_win.js part4_ui.js part6_chrome.js > /tmp/bundle.js
python3 - <<'PY'
s=open('/home/claude/app/shell.html',encoding='utf8').read()
js=open('/tmp/bundle.js',encoding='utf8').read().replace('</script>','<\\/script>')
open('/home/claude/app/sinequanon.html','w',encoding='utf8').write(s.replace('/*__JS__*/',js))
PY
node --check /tmp/bundle.js && echo "syntaxe JS ok" && ls -la /home/claude/app/sinequanon.html
