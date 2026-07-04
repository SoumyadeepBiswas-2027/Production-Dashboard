// // const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
// const {
//   app,
//   BrowserWindow,
//   Tray,
//   Menu,
//   nativeImage,
//   ipcMain,
//   Notification,
// } = require("electron");
// const path = require("path");

// // Tells Windows "this app has its own identity" — required for native
// // notifications to actually display in dev mode. Must match the appId
// // in package.json's "build" section.
// app.setAppUserModelId("com.productivity.dashboard");

// let mainWindow;
// let tray;

// const isDev = !app.isPackaged;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     icon: path.join(__dirname, "../public/tray-icon.png"),
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, "preload.js"),
//     },
//   });

//   if (isDev) {
//     mainWindow.loadURL("http://localhost:5173");
//   } else {
//     mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
//   }

//   // Instead of closing the app, just hide the window (so tray notifications still work)
//   mainWindow.on("close", (event) => {
//     if (!app.isQuiting) {
//       event.preventDefault();
//       mainWindow.hide();
//     }
//     return false;
//   });
// }

// function createTray() {
//   const icon = nativeImage.createFromPath(
//     path.join(__dirname, "../public/tray-icon.png"),
//   );
//   tray = new Tray(icon);

//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: "Show Dashboard",
//       click: () => mainWindow.show(),
//     },
//     {
//       label: "Quit",
//       click: () => {
//         app.isQuiting = true;
//         app.quit();
//       },
//     },
//   ]);

//   tray.setToolTip("Productivity Dashboard");
//   tray.setContextMenu(contextMenu);

//   tray.on("click", () => {
//     mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
//   });
// }

// // Listens for "show-notification" messages sent from preload.js (which relays
// // them from React) and fires a real Windows-native popup.
// // Listens for "show-notification" messages sent from preload.js
// function setupNotificationListener() {
//   ipcMain.on("show-notification", (event, { title, body }) => {
//     console.log("Main process trying to show notification:", title); // Terminal log

//     const notif = new Notification({
//       title,
//       body,
//       icon: path.join(__dirname, "../public/tray-icon.png"), // Added icon requirement
//     });

//     notif.on("show", () => console.log("Windows accepted the notification!"));
//     notif.on("failed", (e, error) =>
//       console.error("Windows blocked it:", error),
//     );

//     notif.show();
//   });
// }

// app.whenReady().then(() => {
//   createWindow();
//   createTray();
//   setupNotificationListener();

//   app.on("activate", () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     // keep running in tray on Windows/Linux; don't quit
//   }
// });


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
    width: 350, // Just big enough for your card
    height: 200,
    frame: false, // No X button or title bar
    transparent: true, // Invisible background!
    alwaysOnTop: true, // Floats over VS Code
    skipTaskbar: true, // Doesn't create a messy second icon
    show: false, // Keep hidden until an alarm goes off
    resizable: false,
    backgroundMaterial: "acrylic", // 🟢 ADD THIS: Tells Windows to blur the OS behind it!
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
      const { width, height } = primaryDisplay.bounds;

      // 🟢 CHANGED: Make the invisible window cover the whole screen!
      notificationWindow.setBounds({ x: 0, y: 0, width, height });

      // notificationWindow.setPosition(x, y);

      // We pass the task text in the URL so the popup knows what to display!
      const popupUrl = isDev
        ? `http://localhost:5173?popup=true&text=${encodeURIComponent(body)}`
        : `file://${path.join(__dirname, "../dist/index.html")}?popup=true&text=${encodeURIComponent(body)}`;

      notificationWindow.loadURL(popupUrl).then(() => {
        // notificationWindow.show();

        // 🟢 CHANGED: showInactive() shows the popup without interrupting your typing!
        notificationWindow.show();
      });
    }
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
