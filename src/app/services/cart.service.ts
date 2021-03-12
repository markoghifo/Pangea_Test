import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../model/cart.model';
import { Currency, PRODUCTS_QUERY } from '../model/graph-query.model';
import { Product, ProductsResponse } from '../model/product.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItemCount: number = 0;
  cartItems: Product[] = [];
  cartItems$: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  products$: Observable<Product[]> = new Observable<Product[]>();
  subject: Subject<Product[]> = new Subject();
  updateProduct = new Subject();
  productsInCart$ = new BehaviorSubject<Product[]>([]);
  selectedCurr: string = Currency[Currency.USD];

  constructor(private apollo: Apollo) {
    this.getProducts(Currency.USD);

    this.subject.subscribe((value) => {
      this.cartItems = value.filter(x => x.cartQuantity && x.cartQuantity > 0);
      this.cartItemCount = this.cartItems.length;
      console.log(this.cartItems, this.cartItemCount);
    });
  }

  getProducts(curr: Currency): Observable<Product[]> {
    this.selectedCurr = Currency[curr];
    return this.apollo.watchQuery<ProductsResponse>({ query: PRODUCTS_QUERY(`${this.selectedCurr}`) })
      .valueChanges.pipe(map((result) => {
        const resp = result.data && result.data.products;
        const finResult: any = [];
        resp.forEach((rx, i) => finResult.push({ ...rx, id: i }));
        this.updateProductPriceInCart(finResult);
        return finResult;
      }));
  }

  addToCartx(product: Product): void {
    const products = [...this.productsInCart$.value];
    const findProduct = products.find(prod => prod.id === product.id);
    if (findProduct) {
      const q: any = findProduct.cartQuantity;
      const index = products.findIndex(prod => prod.id === product.id);
      products[index] = { ...product, cartQuantity: q + 1 };
    } else {
      products.push({ ...product, cartQuantity: 1 });
    }
    this.productsInCart$.next(products);
  }

  removeFromCartx(product: Product, completely: boolean = false): void {
    let products = this.productsInCart$.value;
    const findProduct = products.find(prod => prod.id === product.id);
    if (!findProduct) { return; }

    const quantity: any = findProduct.cartQuantity;
    if (completely) {
      products = products.filter(prod => prod.id !== product.id);
    } else {
      if (quantity > 1) {
        const index = products.findIndex(prod => prod.id === product.id);
        products[index] = { ...product, cartQuantity: quantity - 1 };
      } else {
        products = products.filter(prod => prod.id !== product.id);
      }
    }
    this.productsInCart$.next(products);
  }

  updateProductPriceInCart(allProducts: Product[]): void {
    const products = this.productsInCart$.value;
    if (products.length) {
      const newProducts: Product[] = [];
      products.forEach(prod => {
        const newProd = allProducts.find(prd => prd.id === prod.id);
        const newProdPrice = newProd ? newProd.price : 0;
        newProducts.push({ ...prod, price: newProdPrice });
      });
      this.productsInCart$.next(newProducts);
    }
  }
}
