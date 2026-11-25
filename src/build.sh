#!/bin/sh
# Assemble les sources en un seul fichier HTML autonome (nécessite node et python3).
cd "$(dirname "$0")"
cat part1_engine.js part2_model.js part3_render.js part3b_tex.js part5_extras.js part4_ui.js part6_chrome.js > /tmp/sqn_bundle.js
python3 - <<'PY'
s=open('shell.html',encoding='utf8').read()
js=open('/tmp/sqn_bundle.js',encoding='utf8').read().replace('</script>','<\\/script>')
open('../sinequanon.html','w',encoding='utf8').write(s.replace('/*__JS__*/',js))
PY
node --check /tmp/sqn_bundle.js && echo "OK -> ../sinequanon.html"
