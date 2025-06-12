import { Component, OnInit } from '@angular/core';
import { EthersService } from '../wallet/ethers.service';
import { parseUnits } from 'ethers';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

interface EcoItem {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  priceISIMA: number;
}

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
})
export class MarketplaceComponent implements OnInit {
  faCart = faShoppingCart;
  items: EcoItem[] = [];
  buyingId: number | null = null;
  confirmItem: EcoItem | null = null;
  errorMessage: string | null = null;

  constructor(private eth: EthersService) {}

  ngOnInit(): void {
    this.items = [
      { id: 1, name: 'Plantation d’un arbre', description: 'Aidez à compenser du CO₂ en finançant un arbre.', imageUrl: 'assets/plantation_arbre.png', priceISIMA: 10 },
      { id: 2, name: 'Sac réutilisable',       description: 'Un sac en toile bio pour réduire le plastique.', imageUrl: 'assets/sac_reutilisable.webp', priceISIMA: 2 },
      { id: 3, name: 'Lampe solaire',           description: 'Lampe LED solaire pour l’éclairage écologique.', imageUrl: 'assets/lampe_eco.webp', priceISIMA: 50 },
      { id: 4, name: 'Bouteille réutilisable',  description: 'Bouteille en acier inoxydable pour remplacer le plastique.', imageUrl: 'assets/bouteille_eau_reutilisable.webp', priceISIMA: 8 },
      { id: 5, name: 'Chaussures écologiques',  description: 'Fabriquées à partir de matériaux recyclés.', imageUrl: 'assets/chaussures_eco.jpg', priceISIMA: 40 },
      { id: 6, name: 'T-shirt bio',             description: 'Coton biologique certifié, production éthique.', imageUrl: 'assets/tshirt_bio.webp', priceISIMA: 12 },
      { id: 7, name: 'Short en chanvre',        description: 'Respirant et durable, idéal pour l’été.', imageUrl: 'assets/short_chanvre.jpg', priceISIMA: 15 }
    ];
  }

  promptBuy(item: EcoItem) {
    this.confirmItem = item;
  }

  async confirmBuy() {
    if (!this.confirmItem) return;
    this.buyingId = this.confirmItem.id;
    const item = this.confirmItem;
    this.confirmItem = null;
    try {
      const to = '0x000000000000000000000000000000000000dEaD';
      const amount = parseUnits(item.priceISIMA.toString(), 18);
      const tx = await this.eth.transferISIMA(to, amount);
      await tx.wait();
      this.errorMessage = null;
      this.buyingId = null;
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Erreur lors de l’achat : ' + (err.message || err);
      this.buyingId = null;
    }
  }

  cancelBuy() {
    this.confirmItem = null;
  }

  closeError() {
    this.errorMessage = null;
  }
}
