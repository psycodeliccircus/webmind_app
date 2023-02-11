const { app, BrowserWindow, nativeTheme, nativeImage, ipcMain, dialog, shell, clipboard, Menu, Tray, Notification } = require("electron");
const path = require('path');
const { autoUpdater } = require("electron-updater");
const Swal = require('sweetalert2');
const MainMenuapp = require('./menu-config');
const RightMenuapp = require('./right-menu-config');
const appConfig = require('./config');

const imgPath = __dirname + '/assets';

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: appConfig.width,
    height: appConfig.height,
    minWidth: appConfig.minWidth,
    minHeight: appConfig.minHeight,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  mainWindow.maximize();
  mainWindow.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  const mainMenu = Menu.buildFromTemplate(MainMenuapp);
  Menu.setApplicationMenu(mainMenu);

  const rightMenu = Menu.buildFromTemplate(RightMenuapp);
  mainWindow.webContents.on('context-menu', (e) => {
    rightMenu.popup(mainWindow);
  });

  autoUpdater.allowPrerelease = true;
  autoUpdater.checkForUpdates();

  app.on('activate', () => {
    if (!mainWindow) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listen to update events
autoUpdater.on('update-available', info => {
  showUpdateConfirmation(info);
});

autoUpdater.on('download-progress', progressObj => {
  showDownloadProgress(progressObj);
});

autoUpdater.on('error', err => {
  showUpdateError(err);
});

autoUpdater.on('update-not-available', info => {
  showNoUpdatesAvailable();
});

autoUpdater.on('update-downloaded', info => {
  showUpdateDownloaded(info);
  autoUpdater.quitAndInstall();
});

let Toast;

function createToast() {
  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
}

function showUpdateConfirmation(info) {
  mainWindow.webContents.executeJavaScript(`
    Swal.fire({
      title: 'Atualização disponível',
      html: 'Uma nova atualização está disponível (versão ${info.version}). Deseja instalá-la agora?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Atualizar agora',
      cancelButtonText: 'Mais tarde'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!Toast) {
          createToast();
        }
        Toast.fire({
          icon: 'success',
          title: 'Estamos iniciando o download.\n(versão ${info.version}).'
        })
      }
    });
  `);
}

function showDownloadProgress(progressObj) {
  mainWindow.webContents.executeJavaScript(`
    Swal.update({
      title: 'Baixando atualização',
      html: \`Velocidade: <b>${Math.round(progressObj.bytesPerSecond / 1024)} KB/s</b> - Progresso: <b>${Math.round(progressObj.percent)}%</b> [<b>${Math.round(progressObj.transferred / 1024)} KB</b>/<b>${Math.round(progressObj.total / 1024)} KB</b>]\`,
      showConfirmButton: false,
      allowOutsideClick: false,
      showCancelButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      }
    });
  `);
}

function showUpdateError(err) {
  mainWindow.webContents.executeJavaScript(`
    Swal.fire({
      title: "Erro",
      html: \`Ocorreu um erro ao verificar ou baixar a atualização.\n ${err.toString()}\`,
      icon: "error",
      confirmButtonText: "OK",
    });
  `);
}

function showNoUpdatesAvailable() {
  mainWindow.webContents.executeJavaScript(`
    Swal.fire({
        title: 'Informação de Atualização',
        html: '<p>Não há atualizações disponíveis no momento.</p>',
        confirmButtonText: "OK",
        confirmButtonColor: '#3085d6',
        showCancelButton: false,
    });
  `);
}

function showUpdateDownloaded() {
  mainWindow.webContents.executeJavaScript(`Swal.fire({
        title: 'Reiniciando o aplicativo',
        html: 'Aguente firme, reiniciando o aplicativo para atualização!',
        allowOutsideClick: false,
        onBeforeOpen: () => {
            Swal.showLoading();
        }
    });`)
  autoUpdater.quitAndInstall();
}
