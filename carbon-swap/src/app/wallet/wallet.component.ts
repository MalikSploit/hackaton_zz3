import { Component, OnInit } from '@angular/core';
import { EthersService } from './ethers.service';
import { parseUnits, formatUnits, isAddress } from 'ethers';

const ONE_ISIMA = 10n ** 18n; // 1 token complet

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
})
export class WalletComponent implements OnInit {
  isimaBalance   = '0';
  transferTo     = '';
  transferAmount = '';
  busy           = false;   // Empêcher les races conditions

  get userAddress(): string | null {
    return this.eth.userAddress;
  }

  constructor(private eth: EthersService) {}

  async ngOnInit() {
    await this.eth.init();
    await this.eth.watchTransfers(raw => {
      this.isimaBalance = formatUnits(raw, 18);
    });
  }

  async onMintISIMA() {
    if (this.busy) return;
    this.busy = true;
    try {
      const amount = 100n * ONE_ISIMA;
      const tx = await this.eth.mintISIMA(amount);
      await tx.wait();
      await this.refreshBalance();
    } catch (err: any) {
      console.error(err);
      alert('Erreur lors du mint : ' + (err.message || err));
    } finally {
      this.busy = false;
    }
  }

  async onTransferISIMA(to: string, amountStr: string) {
    if (this.busy) return;
    to = to.trim();
    amountStr = amountStr.trim();
    if (!to || !amountStr) {
      alert('Veuillez renseigner une adresse et un montant.');
      return;
    }
    if (!isAddress(to)) {
      alert('Adresse Ethereum invalide.');
      return;
    }
    const me = this.userAddress?.toLowerCase();
    if (me && to.toLowerCase() === me) {
      alert('Vous ne pouvez pas transférer de tokens à votre propre adresse.');
      return;
    }
    let amount: bigint;
    try {
      amount = parseUnits(amountStr, 18);
    } catch {
      alert('Le format du montant est invalide.');
      return;
    }
    if (amount <= 0n) {
      alert('Le montant doit être supérieur à zéro.');
      return;
    }
    const rawBal = await this.eth.getISIMABalance();
    if (amount > rawBal) {
      alert(`Solde insuffisant : vous avez ${formatUnits(rawBal, 18)} ISIMA.`);
      return;
    }
    this.busy = true;
    try {
      const tx = await this.eth.transferISIMA(to, amount);
      await tx.wait();
      await this.refreshBalance();
    } catch (err: any) {
      console.error(err);
      alert('Le transfert a échoué : ' + (err.message || err));
    } finally {
      this.busy = false;
    }
  }

  private async refreshBalance() {
    const raw = await this.eth.getISIMABalance();
    this.isimaBalance = formatUnits(raw, 18);
  }
}
