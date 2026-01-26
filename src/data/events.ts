import mitt, { type Emitter } from 'mitt'

export const reloader: Emitter<any> = mitt()
export const imageReloader: Emitter<any> = mitt()
