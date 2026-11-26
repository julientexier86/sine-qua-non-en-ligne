#!/bin/sh
# Régénère ../sinequanon.html à partir des fichiers de src/ (nécessite Node.js et Python 3)
cd "$(dirname "$0")" || exit 1
B=$(mktemp /tmp/sqnXXXXXX.js)
cat part1_engine.js part2_model.js part2b_sqnwrite.js part3_render.js part3b_tex.js part5_extras.js part5c_schema.js part5b_win.js part4_ui.js part6_chrome.js part7_examples.js part7_files.js > "$B"
python3 - "$B" <<'PY'
import sys
s=open('shell.html',encoding='utf8').read()
js=open(sys.argv[1],encoding='utf8').read().replace('</script>','<\\/script>')
open('../sinequanon.html','w',encoding='utf8').write(s.replace('/*__JS__*/',js))
PY
node --check "$B" && echo "syntaxe JS ok" && ls -la ../sinequanon.html
rm -f "$B"
