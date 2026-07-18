export interface AuthEndpoints {
  'POST /noauth/auth/password': {
    body: { username: string; password: string; stayLoggedIn: boolean }
    response: void
  }
  'POST /noauth/auth/logout': {
    response: void
  }
}
