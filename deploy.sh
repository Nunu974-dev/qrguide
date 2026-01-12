#!/bin/bash

echo "🚀 Upload des fichiers modifiés sur Hostinger..."

lftp -e "
set ftp:ssl-allow no;
open 81.16.31.200;
user u767867320.julienqrguide R598SkxkfByR#;
cd /home/u767867320/domains/qrguide.fr/public_html;
lcd /Users/julienchanewai/Desktop/QRGUIDE;

# Upload seulement les fichiers HTML, CSS, JS, PHP
mput -O . *.html;
mput -O . *.css;
mput -O . *.js;
mput -O . *.php;
mput -O . *.json;

# Upload dossiers importants
mirror --reverse --verbose --only-newer --exclude-glob img/* --exclude-glob PHPMailer/* --exclude .git --exclude .vscode --exclude .DS_Store --exclude node_modules js;
mirror --reverse --verbose --only-newer --exclude-glob img/* --exclude-glob PHPMailer/* --exclude .git --exclude .vscode --exclude .DS_Store pages;
mirror --reverse --verbose --only-newer --exclude-glob img/* --exclude-glob PHPMailer/* --exclude .git --exclude .vscode --exclude .DS_Store demo-guide;
mirror --reverse --verbose --only-newer --exclude-glob img/* --exclude-glob PHPMailer/* --exclude .git --exclude .vscode --exclude .DS_Store data;

bye
"

echo "✅ Upload terminé !"
