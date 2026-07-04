// const { contextBridge, ipcRenderer } = require("electron");

// // This exposes a safe, limited function to React.
// // React will be able to call window.electronAPI.showNotification(...)
// contextBridge.exposeInMainWorld("electronAPI", {
//   showNotification: (title, body) => {
//     ipcRenderer.send("show-notification", { title, body });
//   },
// });

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 1. Triggers the floating window
  showNotification: (title, body) => {
    ipcRenderer.send("show-notification", { title, body });
  },

  // 2. DUMB POPUP -> MAIN PROCESS: "I was clicked!"
  sendActionDone: () => ipcRenderer.send("action-done"),
  sendActionSnooze: () => ipcRenderer.send("action-snooze"),

  // 3. MAIN PROCESS -> SMART DASHBOARD: "Run the Firebase code!"
  onTriggerDone: (callback) => {
    ipcRenderer.removeAllListeners("trigger-done"); // Prevents duplicate clicks
    ipcRenderer.on("trigger-done", () => callback());
  },
  onTriggerSnooze: (callback) => {
    ipcRenderer.removeAllListeners("trigger-snooze");
    ipcRenderer.on("trigger-snooze", () => callback());
  },
});