fx_version 'cerulean'
game 'gta5'

author 'Peak Scripts'
description 'Modern FiveM scoreboard made with React, featuring server info, job cards, player list display & more'
version '1.0.0'
lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/*.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
    'modules/**/**.lua',
    'config.lua'
}