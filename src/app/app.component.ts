import { Component, OnInit } from '@angular/core';
import { Currency, PRODUCTS_QUERY } from './model/graph-query.model';
import { Apollo } from 'apollo-angular';
import { Product, ProductsResponse } from './model/product.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'pangea-test';

  defaultCur = 'USD';
  products$: Observable<Product[]>;

  constructor(private cartService: CartService) {
    const cur = Currency['USD' as keyof typeof Currency];
    this.products$ = this.cartService.getProducts(cur);
  }
  ngOnInit(): void {
    this.cartService.updateProduct.subscribe(res => {
      this.getProducts((res as any));
    });
  }
  getProducts(currecncy = this.defaultCur): void {
    const cur = Currency[currecncy as keyof typeof Currency];
    this.products$ = this.cartService.getProducts(cur);
  }

}
