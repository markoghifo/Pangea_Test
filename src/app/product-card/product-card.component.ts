import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../model/product.model';
import { CartService } from '../services/cart.service';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input("product") product: Product | null;
  selectedCurr: string

  constructor(private cartService: CartService, private navService: NavigationService) {
    this.product = null;
    this.selectedCurr = this.cartService.selectedCurr;
  }

  ngOnInit(): void {
  }
  
  addToCartx(): void {
    if (this.product) {
      this.cartService.addToCartx(this.product);
      this.navService.setShowNav(true);
    }
  }
}
