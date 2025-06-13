import { Component, OnInit } from '@angular/core';
import { EthersService } from './ethers.service';
import { parseUnits, formatUnits, isAddress } from 'ethers';
import { faWallet, faAddressCard, faCoins, faPaperPlane, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
})
export class WalletComponent implements OnInit {
  isimaBalance = '0';
  transferTo = '';
  transferAmount = '';
  busy = false;
  errorMessage: string | null = null;

  faWallet = faWallet;
  faAddressCard = faAddressCard;
  faCoins = faCoins;
  faPaperPlane = faPaperPlane;
  faExclamationTriangle = faExclamationTriangle;

  constructor(private eth: EthersService) {}

  get userAddress() {
    return this.eth.userAddress;
  }

  async ngOnInit() {
    await this.eth.init();
    await this.eth.faucetNativeIfEmpty(this.eth.userAddress!);
    await this.eth.watchTransfers(b => (this.isimaBalance = formatUnits(b, 18)));
  }

  async onTransferISIMA(to: string, amountStr: string) {
    if (this.busy) return;
    to = to.trim();
    amountStr = amountStr.trim();
    if (!to || !amountStr) return this.showError('Adresse et montant requis.');
    if (!isAddress(to)) return this.showError('Adresse Ethereum invalide.');
    if (to.toLowerCase() === this.userAddress?.toLowerCase())
      return this.showError('Impossible de transférer vers soi-même.');

    let amount: bigint;
    try {
      amount = parseUnits(amountStr, 18);
    } catch {
      return this.showError('Montant invalide.');
    }
    if (amount <= 0n) return this.showError('Montant > 0 requis.');

    const bal = await this.eth.getISIMABalance();
    if (amount > bal)
      return this.showError(`Solde insuffisant : ${formatUnits(bal, 18)} ISIMA`);

    this.busy = true;
    try {
      const tx = await this.eth.transferISIMA(to, amount);
      await tx.wait();
      await this.refreshBalance();
    } catch (e: any) {
      this.showError('Transfert échoué : ' + (e.message || e));
    } finally {
      this.busy = false;
    }
  }

  private async refreshBalance() {
    const raw = await this.eth.getISIMABalance();
    this.isimaBalance = formatUnits(raw, 18);
  }

  showError(msg: string) {
    this.errorMessage = msg;
  }
  closeError() {
    this.errorMessage = null;
  }
}
