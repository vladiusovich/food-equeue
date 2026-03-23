import { ACCESS_TOKEN } from '$lib/const/authConstans'

type InterceptorFuncType = (value: any) => Promise<any>

export const attachToken: InterceptorFuncType = (value: any) => {
  const token = localStorage.getItem(ACCESS_TOKEN)

  if (token) {
    value.headers['Authorization'] = `Bearer ${token}`
  }

  return value
}
