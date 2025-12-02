const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

// Enforce GPU usage for WebGL (Chromium flags)
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("enable-webgl");
app.commandLine.appendSwitch("use-angle", "d3d11");

// Force NVIDIA GPU on Optimus systems (laptop dual-GPU)
if (process.platform === "win32") {
  console.log(
    "🎮 [Main Process] Configuring GPU settings for Windows Optimus..."
  );
  app.commandLine.appendSwitch("force-high-performance-gpu");
  // Explicitly prefer NVIDIA GPU adapter
  app.commandLine.appendSwitch("use-angle", "d3d11");
  // Additional flags for better NVIDIA GPU detection on Windows
  app.commandLine.appendSwitch("enable-features", "UseD3D11");
  // Note: --disable-gpu-sandbox is already set in package.json start script
  console.log(
    "🎮 [Main Process] GPU flags applied: force-high-performance-gpu, use-angle=d3d11"
  );
}

// Disable software rasterizer to force hardware acceleration
app.commandLine.appendSwitch("disable-software-rasterizer");

// Prüfe ob Development Mode aktiv ist
// WICHTIG: Chromium-Switches wie --enable-logging tauchen nicht zwingend in process.argv auf.
// Nutze zusätzlich app.commandLine.hasSwitch und fallback auf !app.isPackaged.
const isDev =
  process.argv.includes("--dev") ||
  (app && app.commandLine && app.commandLine.hasSwitch("enable-logging")) ||
  !app.isPackaged;

let mainWindow;

function createWindow() {
  // Basis-Konfiguration für das BrowserWindow
  const windowConfig = {
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true, // TEST: Zurück auf true für WebGL
      allowRunningInsecureContent: false, // TEST: Zurück auf false für WebGL
      devTools: isDev, // DevTools nur im Dev-Mode erlaubt
    },
  };

  // Production Mode: echtes Fullscreen, kein Frame, keine Resize
  if (!isDev) {
    windowConfig.fullscreen = true; // echtes Fullscreen
    windowConfig.frame = false; // kein OS-Rahmen, kein Close/Minimize
    windowConfig.resizable = false; // Spieler kann nicht rumziehen
    windowConfig.backgroundColor = "#000000"; // kein weißes Flackern beim Start
    windowConfig.show = false; // erst zeigen, wenn ready
  }

  mainWindow = new BrowserWindow(windowConfig);

  // Lädt dein bestehendes index.html
  mainWindow.loadFile("index.html");

  // Window erst nach ready-to-show anzeigen (nur im Production)
  if (!isDev) {
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });
  }

  // DevTools nur im Dev-Mode öffnen
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // NOTE: Removed automatic DevTools closing to allow inspection in production

  // Console-Logs in Production deaktivieren (außer wenn explizit --enable-logging gesetzt)
  if (!isDev && !(app && app.commandLine && app.commandLine.hasSwitch("enable-logging"))) {
    // Wrap in try-catch to prevent "object could not be cloned" errors
    mainWindow.webContents
      .executeJavaScript(
        `
      try {
        console.log = () => {};
        console.warn = () => {};
        console.error = () => {};
        console.info = () => {};
      } catch (e) {
        // Ignore cloning errors from executeJavaScript
      }
    `
      )
      .catch((err) => {
        // Ignore IPC cloning errors - they don't affect functionality
        console.warn("⚠️ IPC warning (can be ignored):", err.message);
      });
  }

  // Log GPU information after window is ready
  mainWindow.webContents.once("did-finish-load", () => {
    console.log(
      "🎮 [Main Process] Window loaded, querying GPU info from renderer..."
    );

    mainWindow.webContents
      .executeJavaScript(
        `
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            console.log('🎮 [Renderer] GPU Vendor:', vendor);
            console.log('🎮 [Renderer] GPU Renderer:', renderer);
          }
        } else {
          console.warn('⚠️ [Renderer] WebGL context not available');
        }
      } catch (e) {
        console.warn('⚠️ [Renderer] Could not query GPU info:', e.message);
      }
    `
      )
      .then(() => {
        console.log(
          "✅ [Main Process] GPU query completed (check DevTools console for details)"
        );
      })
      .catch((err) => {
        console.warn(
          "⚠️ [Main Process] Could not query GPU info:",
          err.message
        );
      });
  });
}

app.whenReady().then(() => {
  console.log("🚀 [Main Process] Electron app ready, creating window...");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handler for quit requests from renderer
// Wrapped in try-catch to prevent "object could not be cloned" errors
ipcMain.on("quit-app", (event, ...args) => {
  try {
    // Only accept simple messages, ignore complex objects
    app.quit();
  } catch (error) {
    console.error("⚠️ IPC error in quit-app handler:", error.message);
    // Still quit even if there's an error
    app.quit();
  }
});

// Handle IPC errors gracefully
app.on("web-contents-created", (event, contents) => {
  contents.on("ipc-message", (event, channel, ...args) => {
    // Log IPC messages in dev mode for debugging
    if (isDev) {
      console.log(`📡 IPC message: ${channel}`, args.length, "arguments");
    }
  });

  contents.on("crashed", (event, killed) => {
    console.error(
      "💥 Renderer process crashed:",
      killed ? "killed" : "crashed"
    );
  });
});
