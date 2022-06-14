import fs from 'fs'

const isProd: boolean = process.env.NODE_ENV == 'production'

const fileExists = (file: fs.PathLike) =>
  new Promise((resolve) => fs.access(file, fs.constants.F_OK, (err) => resolve(!err)))

const chMod = (file: fs.PathLike, mode: fs.Mode) =>
  new Promise<void>((resolve, reject) =>
    fs.chmod(file, mode, (err) => {
      if (err) reject(err)
      resolve()
    }),
  )
