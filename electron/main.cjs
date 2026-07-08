const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen, // 🟢 CHANGED: Imported 'screen' to calculate monitor size
} = require("electron");
const path = require("path");

app.setAppUserModelId("com.productivity.dashboard");

let mainWindow;
let notificationWindow; // NEW: The floating popup window
let tray;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "../public/tray-icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

// NEW FUNCTION: Creates the floating, transparent window
function createNotificationWindow() {
  notificationWindow = new BrowserWindow({
    width: 350,
    height: 200,
    frame: false,
    transparent: true,
    // backgroundColor: "#111111",
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "../public/tray-icon.png"),
  );
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "Show Dashboard", click: () => mainWindow.show() },
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

// UPDATED: Now handles our new Remote Control logic
function setupNotificationListener() {
  // When alarm triggers, load the React UI into the floating window and show it
  ipcMain.on("show-notification", (event, { title, body }) => {
    if (notificationWindow) {
      // 🟢 CHANGED: Get the exact size of the ENTIRE monitor
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.bounds;

      const popupWidth = 350;
      const popupHeight = 200;
      const margin = 20;

      notificationWindow.setBounds({
        x: screenWidth - popupWidth - margin,
        y: margin,
        width: popupWidth,
        height: popupHeight,
      });

      // We pass the task text in the URL so the popup knows what to display!
      const popupUrl = isDev
        ? `http://localhost:5173?popup=true&text=${encodeURIComponent(body)}`
        : `file://${path.join(__dirname, "../dist/index.html")}?popup=true&text=${encodeURIComponent(body)}`;

      notificationWindow.loadURL(popupUrl).then(() => {
        // 🟢 CHANGED: showInactive() shows the popup without interrupting your typing!
        notificationWindow.show();
      });
    }
  });

  // When the reminder auto-snoozes without user input, hide the popup
  ipcMain.on("hide-popup", () => {
    if (notificationWindow) notificationWindow.hide();
  });
  // When 'Done' is clicked on the floating popup...
  ipcMain.on("action-done", () => {
    if (notificationWindow) notificationWindow.hide(); // 1. Hide the popup
    if (mainWindow) mainWindow.webContents.send("trigger-done"); // 2. Tell Dashboard to update Firebase
  });

  // When 'Snooze' is clicked on the floating popup...
  ipcMain.on("action-snooze", () => {
    if (notificationWindow) notificationWindow.hide(); // 1. Hide the popup
    if (mainWindow) mainWindow.webContents.send("trigger-snooze"); // 2. Tell Dashboard to update Firebase
  });
}

app.whenReady().then(() => {
  createWindow();
  createNotificationWindow(); // Make sure this runs!
  createTray();
  setupNotificationListener();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
  }
});
