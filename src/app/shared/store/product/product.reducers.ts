import { Action, createReducer, on } from '@ngrx/store';

import { ProductState } from 'src/app/shared/models/product-state';
import { changePageAction } from 'src/app/shared/store/product/actions/change-page.action';
import {
  getProductsAction,
  getProductsFailureAction,
  getProductsSuccessAction
} from 'src/app/shared/store/product/actions/get-products.actions';
import { searchProductAction } from 'src/app/shared/store/product/actions/search-product.action';

export const initialState: ProductState = {
  products: [],
  search: '',
  pageIndex: 0,
  totalNumber: 0,
  isLoading: false,
  error: null
};

const productReducer = createReducer(
  initialState,
  on(getProductsAction, (state: ProductState) => ({
    ...state,
    isLoading: true
  })),
  on(
    getProductsSuccessAction,
    (state: ProductState, { products, totalNumber }) => ({
      ...state,
      isLoading: false,
      products,
      totalNumber
    })
  ),
  on(getProductsFailureAction, (state: ProductState, { errors }) => ({
    ...state,
    isLoading: false,
    error: errors
  })),

  on(searchProductAction, (state: ProductState, { search }) => ({
    ...state,
    search
  })),

  on(changePageAction, (state: ProductState, { pageIndex }) => ({
    ...state,
    pageIndex
  }))
);

export function reducer(
  state: ProductState | undefined,
  action: Action
): ProductState {
  return productReducer(state, action);
}