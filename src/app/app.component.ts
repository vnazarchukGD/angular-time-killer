import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ProductDetailsModalComponent } from './components/product-details-modal/product-details-modal.component';
import { Lang } from './models/lang';
import { Product } from './models/product';
import { ProductsResp } from './models/products-resp';
import { ProductService } from './services/product.service';
import * as LangActions from './store/lang/lang.actions';
import * as LangSelectors from './store/lang/lang.selectors';
import * as ProductActions from './store/product/product.actions';
import * as ProductSelectors from './store/product/product.selectors';

@Component({
  selector: 'tk-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  readonly products$: Observable<Array<Product>> = this.store.select(
    ProductSelectors.products
  );
  readonly pageIndex$: Observable<number> = this.store.select(
    ProductSelectors.pageIndex
  );
  readonly totalNumber$: Observable<number> = this.store.select(
    ProductSelectors.totalNumber
  );
  readonly topProducts$: Observable<Array<Product>> = this.store.select(
    ProductSelectors.topProducts
  );
  readonly search$: Observable<string> = this.store.select(
    ProductSelectors.search
  );
  readonly searchOptions$: Observable<Array<string>> = combineLatest([
    this.products$,
    this.topProducts$
  ]).pipe(
    map(([products, topProducts]: [Product[], Product[]]) => {
      return Array.from(
        new Set([
          ...products.map((cv) => cv.name),
          ...topProducts.map((cv) => cv.name)
        ])
      );
    })
  );
  readonly lang$: Observable<Lang> = this.store.select(
    LangSelectors.langSelector
  );
  readonly loading$ = new BehaviorSubject<boolean>(true);
  readonly globalLoading$ = new BehaviorSubject<boolean>(true);
  readonly ProductActions = ProductActions;
  readonly LangActions = LangActions;
  private readonly destroy$ = new Subject<void>();

  constructor(
    readonly store: Store,
    productService: ProductService,
    public dialog: MatDialog
  ) {
    combineLatest([this.lang$, this.pageIndex$])
      .pipe(
        tap(() => this.loading$.next(true)),
        switchMap(([lang, pageIndex]: [Lang, number]) =>
          productService.getProducts(lang, pageIndex)
        ),
        finalize(() => this.loading$.next(false)),
        takeUntil(this.destroy$)
      )
      .subscribe((resp: ProductsResp) => {
        this.store.dispatch(ProductActions.retrieveProducts(resp));
        this.loading$.next(false);
      });

    this.lang$
      .pipe(
        tap(() => this.globalLoading$.next(true)),
        switchMap((lang: Lang) => productService.getProducts(lang, 0, 5)),
        finalize(() => this.globalLoading$.next(false)),
        takeUntil(this.destroy$)
      )
      .subscribe((resp: ProductsResp) => {
        this.store.dispatch(
          ProductActions.topProducts({ products: resp.products })
        );
        this.globalLoading$.next(false);
      });
  }

  productDetails(product: Product): void {
    this.dialog.open(ProductDetailsModalComponent, {
      width: '600px',
      data: { product }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
