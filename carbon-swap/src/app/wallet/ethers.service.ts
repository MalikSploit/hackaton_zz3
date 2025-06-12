import { Injectable, OnDestroy } from '@angular/core';
import {
  BrowserProvider,
  Contract,
  JsonRpcSigner,
  TransactionResponse,
} from 'ethers';

// Adresse & ABI du token ISIMA
export const ISIMA_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const ISIMA_ABI = [
  'function mint(uint256 amount)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event   Transfer(address indexed from, address indexed to, uint256 value)',
];

@Injectable({ providedIn: 'root' })
export class EthersService implements OnDestroy {
  private provider?: BrowserProvider;
  private signer?: JsonRpcSigner;
  private isima?: Contract;
  public  userAddress: string | null = null;

  private transferListener?: (...args: any[]) => void;

  async init(): Promise<void> {
    if (this.provider) return;

    const { ethereum } = window as any;
    if (!ethereum) throw new Error('MetaMask non détecté');

    this.provider = new BrowserProvider(ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();
  }

  private async initISIMA(): Promise<void> {
    await this.init();
    if (this.isima) return;

    const code = await this.provider!.getCode(ISIMA_ADDRESS);
    if (code === '0x') {
      throw new Error('ISIMA not deployed at ' + ISIMA_ADDRESS);
    }
    this.isima = new Contract(ISIMA_ADDRESS, ISIMA_ABI, this.signer);
  }

  async mintISIMA(amount: bigint): Promise<TransactionResponse> {
    await this.initISIMA();
    try {
      return await this.isima!['mint'](amount);
    } catch (e: any) {
      throw new Error('mintISIMA failed: ' + e.message);
    }
  }

  async getISIMABalance(): Promise<bigint> {
    await this.initISIMA();
    if (!this.userAddress) {
      throw new Error('Aucun compte connecté');
    }
    try {
      return await this.isima!['balanceOf'](this.userAddress);
    } catch (e: any) {
      throw new Error('getISIMABalance failed: ' + e.message);
    }
  }

  async transferISIMA(
    to: string,
    amount: bigint
  ): Promise<TransactionResponse> {
    await this.initISIMA();
    try {
      return await this.isima!['transfer'](to, amount);
    } catch (e: any) {
      throw new Error('transferISIMA failed: ' + e.message);
    }
  }

  async watchTransfers(cb: (newBal: bigint) => void): Promise<() => void> {
    await this.initISIMA();
    const addr = this.userAddress!.toLowerCase();

    // fetch initial
    cb(await this.getISIMABalance());

    // subscribe
    this.transferListener = async (from: string, to: string, value: bigint) => {
      if (from.toLowerCase() === addr || to.toLowerCase() === addr) {
        cb(await this.getISIMABalance());
      }
    };
    await this.isima!.on('Transfer', this.transferListener);

    // on renvoie la fonction pour se désabonner
    return () => {
      if (this.isima && this.transferListener) {
        this.isima.off('Transfer', this.transferListener);
      }
    };
  }

  ngOnDestroy(): void {
    if (this.isima && this.transferListener) {
      this.isima.off('Transfer', this.transferListener);
    }
  }
}
