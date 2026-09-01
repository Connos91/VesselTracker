import { configureStore } from '@reduxjs/toolkit';
import { duressReducer } from './duressSlice';

export const makeStore = () => {
  return configureStore({
    reducer: { duress: duressReducer },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
