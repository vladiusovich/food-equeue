// import SocketApiListner, { SocketEventHandlersType } from './SocketApiListner'
// import { runtimeDataStore } from '../../store/initStore'
// import appConfig from '../../config/appConfig'
// import { io } from 'socket.io-client'

// const socketEventHandlers: SocketEventHandlersType = {
//   'customer.orders.updated': data =>
//     runtimeDataStore.setData('ordersStatus', data),
//   'customer.orders.executionTimeChanged': data =>
//     runtimeDataStore.setData('executionTime', data)
// }

// const socket = io(appConfig.api.socketUrl)

// new SocketApiListner(socket, socketEventHandlers)
