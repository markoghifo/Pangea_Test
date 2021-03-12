import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { Observable } from 'rxjs';
import { SideNavDirection } from './cat-list.model';
import { CartService } from '../services/cart.service';
import { CartItem } from '../model/cart.model';
import { Apollo } from 'apollo-angular';
import { Currency, CURRENCY_QUERY } from '../model/graph-query.model';
import { map } from 'rxjs/operators';
import { CurrenciesReponse, Product } from '../model/product.model';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {

  showSideNav: Observable<boolean>;

  @Input() sidenavTemplateRef: any;
  @Input() duration: number = 0.25;
  @Input() navWidth: number = window.innerWidth;
  @Input() direction: SideNavDirection = SideNavDirection.Right;

  productsInCart$: Observable<Product[]>;
  selectedCurrency: string;

  cartItems: Product[] = [];
  currencies: Observable<string[]>;

  constructor(private navService: NavigationService, private cartService: CartService, private apollo: Apollo) {
    this.showSideNav = this.navService.getShowNav();
    this.cartItems = this.cartService.cartItems;
    this.productsInCart$ = this.cartService.productsInCart$;
    this.currencies = this.apollo.watchQuery<CurrenciesReponse>({
      query: CURRENCY_QUERY
    }).valueChanges.pipe(map(result => result.data && result.data.currency));
    this.selectedCurrency = this.cartService.selectedCurr;
  }

  ngOnInit(): void {
  }

  onSidebarClose() {
    this.navService.setShowNav(false);
  }

  getSideNavBarStyle() {
    let navBarStyle: any = {};

    navBarStyle.transition = this.direction + ' ' + this.duration + 's, visibility ' + this.duration + 's';
    navBarStyle.width = this.navWidth + '%';
    this.showSideNav.subscribe(
      dt => {
        if (dt) {
          navBarStyle[this.direction] = 0 + '%';
        }
        else {
          navBarStyle[this.direction] = (this.navWidth * -1) + '%';
        }
      }
    )

    return navBarStyle;
  }

  addToCart(product: Product): void {
    this.cartService.addToCartx(product);
  }


  removeFromCart(product: Product, completely: boolean = false): void {
    this.cartService.removeFromCartx(product, completely);
  }

  changePrices(curr: string): void {
    this.selectedCurrency = curr;
    this.cartService.updateProduct.next(curr);
  }

  subTotal(productsInCart: Product[]): number {
    const total = productsInCart.map(prod => {
      const sum = (prod.cartQuantity || 1) * prod.price;
      return sum;
    }).reduce((prev, cur) => prev + cur, 0);
    return total;
  }
}
