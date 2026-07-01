const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");

let mainWindow;
let tray;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../public/vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    // mainWindow.webContents.openDevTools(); // uncomment if you want devtools open automatically
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Instead of closing the app, just hide the window (so tray notifications still work)
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // const icon = nativeImage.createFromPath(
  //   path.join(__dirname, "../public/vite.svg")
  // );
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "../public/tray-icon.png"),
  );
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Dashboard",
      click: () => mainWindow.show(),
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Productivity Dashboard");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // keep running in tray on Windows/Linux; don't quit
  }
});
