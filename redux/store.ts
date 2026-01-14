import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { employeesApi } from './api/employeesApi'
import { rolesApi } from './api/rolesApi'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authApi.middleware, employeesApi.middleware, rolesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch