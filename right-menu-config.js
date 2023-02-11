const { ipcMain } = require('electron');
const nativeImage = require('electron').nativeImage

const imgPath = __dirname + '/assets';

module.exports = [
    {
        label: 'Você não pode fazer isto aqui!',
        icon: nativeImage.createFromPath(`${imgPath}/16x16.png`).resize({ width: 16 }),
        enabled: false
    },
    { type: 'separator' },
    {
        label: 'Que sair do App?',
        icon: nativeImage.createFromPath(`${imgPath}/quit.png`).resize({ width: 16 }), 
        role: 'quit' },
]