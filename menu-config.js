const { app, ipcMain } = require('electron');
const appConfig = require('./config');
const { autoUpdater } = require('electron-updater');
const nativeImage = require('electron').nativeImage

const imgPath = __dirname + '/assets';

module.exports = [
    {
        label: appConfig['appName'],
        submenu: [
            { 
                label: 'Sair', 
                icon: nativeImage.createFromPath(`${imgPath}/quit.png`).resize({ width: 16 }),  
                role: 'quit' 
            },
            {
                label: "Dev",
                role: "toggleDevTools"
            }
        ]
    },
    {
        label: 'Atualização',
        submenu: [
            {
                label: 'Verificar atualizações',
                icon: nativeImage.createFromPath(`${imgPath}/update.png`).resize({ width: 16 }),
                click: () => {
                        autoUpdater.checkForUpdatesAndNotify()
                },
            }
        ]
    },
]
