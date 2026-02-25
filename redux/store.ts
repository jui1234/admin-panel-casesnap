import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { casesApi } from './api/casesApi'
import { clientsApi } from './api/clientsApi'
import { employeesApi } from './api/employeesApi'
import { notificationsApi } from './api/notificationsApi'
import { rolesApi } from './api/rolesApi'
import { userApi } from './api/userApi'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [casesApi.reducerPath]: casesApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }    ).concat(
      authApi.middleware,
      casesApi.middleware,
      clientsApi.middleware,
      employeesApi.middleware,
      notificationsApi.middleware,
      rolesApi.middleware,
      userApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch