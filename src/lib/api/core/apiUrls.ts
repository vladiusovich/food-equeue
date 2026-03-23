export type ApiUrlType = 'foodServer' | 'foodServerSocket'

// TODO: config file?
const apiUrls: Record<ApiUrlType, string> = {
  foodServer: 'http://192.168.100.11:3002',
  foodServerSocket: 'http://192.168.100.11:3002'
}

export default apiUrls
