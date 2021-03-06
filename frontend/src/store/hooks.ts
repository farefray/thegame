import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './model';

// Provide our model to the helper      👇
export const typedHooks = createTypedHooks<StoreModel>();

// 👇 export the typed hooks
export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;