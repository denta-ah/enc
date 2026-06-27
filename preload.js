const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFolder:   ()      => ipcRenderer.invoke('select-folder'),
  countFiles:     (opts)  => ipcRenderer.invoke('count-files', opts),
  runOperation:   (opts)  => ipcRenderer.invoke('run-operation', opts),
  onProgress:     (cb)    => ipcRenderer.on('progress', (_e, data) => cb(data)),
  removeProgress: ()      => ipcRenderer.removeAllListeners('progress'),
  minimize:       ()      => ipcRenderer.send('window-minimize'),
  maximize:       ()      => ipcRenderer.send('window-maximize'),
  close:          ()      => ipcRenderer.send('window-close'),
});
