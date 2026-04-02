import { app, BrowserWindow, ipcMain, safeStorage } from 'electron'
import { join } from 'node:path'
import fs from 'node:fs'
import { PosPrinter } from 'electron-pos-printer'


// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: join(process.env.VITE_PUBLIC as string, 'favicon.ico'),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  // --- Auth Storage Handlers ---
  const authPath = join(app.getPath('userData'), 'auth.dat')

  ipcMain.handle('auth:store-token', (_, token: string, outletId: string) => {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(JSON.stringify({ token, outletId }))
        fs.writeFileSync(authPath, encrypted)
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to store token', e)
      return false
    }
  })

  ipcMain.handle('auth:get-token', () => {
    try {
      if (fs.existsSync(authPath) && safeStorage.isEncryptionAvailable()) {
        const encrypted = fs.readFileSync(authPath)
        const decrypted = safeStorage.decryptString(encrypted)
        return JSON.parse(decrypted) // { token, outletId }
      }
      return null
    } catch (e) {
      console.error('Failed to read token', e)
      return null
    }
  })

  ipcMain.handle('auth:clear-token', () => {
    if (fs.existsSync(authPath)) fs.unlinkSync(authPath)
    return true
  })

  // --- Printing Handlers ---
  ipcMain.handle('print:kot', async (_, printerName: string, data: any[]) => {
    try {
      await PosPrinter.print(data, {
        printerName,
        preview: false,
        width: '80mm',
        margin: '0 0 0 0',
        copies: 1,
        timeOutPerLine: 400,
        silent: true,
        boolean: true // fixing rogue type error from package
      } as any)
      return { success: true }
    } catch (error: any) {
      console.error("Print Error:", error)
      return { success: false, error: error.toString() }
    }
  })
})
