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
    return this.apollo.watchQuery<ProductsResponse>({query: PRODUCTS_QUERY(`${this.selectedCurr}`)})
      .valueChanges.pipe(map((result) => {
        const resp = result.data && result.data.products;
        const finResult: any = [];
        resp.forEach((rx, i) => finResult.push({...rx, id: i}));
        this.updateProductPriceInCart(finResult);
        return finResult;
      }));
    // this.products$.subscribe(products => this.subject.next(products));
  }

  addToCartx(product: Product): void {
    const products = [...this.productsInCart$.value];
    const findProduct = products.find(prod => prod.id === product.id);
    if (findProduct) {
      const q: any = findProduct.cartQuantity;
      const index = products.findIndex(prod => prod.id === product.id);
      products[index] = {...product, cartQuantity: q + 1};
    } else {
      products.push({...product, cartQuantity: 1});
    }
    this.productsInCart$.next(products);
  }
  removeFromCartx(product: Product): void {
    let products = this.productsInCart$.value;
    const findProduct = products.find(prod => prod.id === product.id);
    if (!findProduct) { return; }

    const quantity: any = findProduct.cartQuantity;
    if (quantity > 1) {
      const index = products.findIndex(prod => prod.id === product.id);
      products[index] = {...product, cartQuantity: quantity - 1};
    } else {
      products = products.filter(prod => prod.id !== product.id);
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
        newProducts.push({...prod, price: newProdPrice});
      });
      this.productsInCart$.next(newProducts);
    }
  }

  addToCart(product: Product) {
    var productsModified: Product[] = [];
    this.products$.subscribe(products => {
      products.map(x => {
        if (x.id == product.id) {
          productsModified.push({ id: x.id, image_url: x.image_url, price: x.price, title: x.title, cartQuantity: !x.cartQuantity ? 1 : x.cartQuantity++ })
        } else {
          productsModified.push(x);
        }
      })

      // var prods = products.map((prod) => ({
      //   ...prod,
      //   cartQuantity: (product.id == prod.id) ? (!prod.cartQuantity ? 1 : prod.cartQuantity++) : prod.cartQuantity
      // }))
      // console.log(productsModified)
      this.subject.next(productsModified);
      // this.subject.next(Object.assign({}, products));
    })
    // var cartItems = this.cartItems$.getValue();
    // if (!cartItems) {
    //   cartItems = [];
    // }
    // var index = cartItems.findIndex(x => x.id == product.id)
    // if (index > -1) {
    //   cartItems[index].quantity++;
    // } else {
    //   cartItems.push({ id: product.id, image_url: product.image_url, price: product.price, quantity: 1, title: product.title })
    // }
    // this.cartItems$.next(cartItems);
  }

  removeFromCart(product: Product) {
    this.products$.pipe(map(products => {
      var prods = products.map(x => {
        if (x.id == product.id) {
          x.cartQuantity = !x.cartQuantity ? x.cartQuantity : (x.cartQuantity > 0 ? x.cartQuantity-- : undefined);
        }
        return x;
      })
      this.subject.next(prods);
    })
    )
    // var cartItems = this.cartItems$.getValue();
    // if (cartItems) {
    //   var index = cartItems.findIndex(x => x.id == product.id);
    //   if (index > -1) {
    //     if (cartItems[index].quantity < 2) {
    //       cartItems = cartItems.splice(index, 1);
    //     }
    //     else {
    //       cartItems[index].quantity--;
    //     }
    //   }
    // }
    // this.cartItems$.next(cartItems);
  }
}
