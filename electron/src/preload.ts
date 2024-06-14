import { contextBridge } from 'electron'
import * as menu from './Electron/Menu/renderer/menu'
import type { menuAPI } from './Electron/Menu/renderer/menuAPI'


contextBridge.exposeInMainWorld('menuAPI', {
    openMenu: menu.openMenu,
    minimize: menu.minimize,
    maximize: menu.maximize,
    unmaximize: menu.unmaximize,
    maxUnmax: menu.maxUnmax,
    close: menu.close,
    isWindowMaximized: menu.isWindowMaximized,
} as menuAPI)
