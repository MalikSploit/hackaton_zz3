import { Injectable, OnDestroy } from '@angular/core';
import {
  BrowserProvider,
  JsonRpcSigner,
  JsonRpcProvider,
  Contract,
  Wallet,
  TransactionResponse,
  ethers,
} from 'ethers';

export const ISIMA_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ISIMA_ABI = [
  'function mint(uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'event Transfer(address indexed from,address indexed to,uint256 value)',
];

const LOCAL_RPC      = 'http://127.0.0.1:8545';
const FUNDER_PRIVKEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

@Injectable({ providedIn: 'root' })
export class EthersService implements OnDestroy {
  private provider?: BrowserProvider;
  private signer?:   JsonRpcSigner;
  private isima?:    Contract;
  public  userAddress: string | null = null;

  private funder?: Wallet;
  private transferListener?: (...args: any[]) => void;

  private getFunder(): Wallet {
    if (!this.funder) {
      this.funder = new Wallet(FUNDER_PRIVKEY, new JsonRpcProvider(LOCAL_RPC));
    }
    return this.funder;
  }

  async init(): Promise<void> {
    if (this.provider) return;
    const { ethereum } = window as any;
    if (!ethereum) throw new Error('MetaMask non détecté');
    this.provider    = new BrowserProvider(ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer      = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();
  }

  private async initISIMA(): Promise<void> {
    await this.init();
    if (this.isima) return;
    const code = await this.provider!.getCode(ISIMA_ADDRESS);
    if (code === '0x') throw new Error('ISIMA non déployé');
    this.isima = new Contract(ISIMA_ADDRESS, ISIMA_ABI, this.signer);
  }

  async mintISIMA(amount: bigint): Promise<TransactionResponse> {
    await this.initISIMA();
    return this.isima!['mint'](amount);
  }

  async getISIMABalance(): Promise<bigint> {
    await this.initISIMA();
    return this.isima!['balanceOf'](this.userAddress!);
  }

  async transferISIMA(to: string, amount: bigint): Promise<TransactionResponse> {
    await this.initISIMA();
    return this.isima!['transfer'](to, amount);
  }

  async watchTransfers(cb: (b: bigint) => void): Promise<() => void> {
    await this.initISIMA();
    const addr = this.userAddress!.toLowerCase();
    cb(await this.getISIMABalance());
    this.transferListener = async (from: string, to: string) => {
      if (from.toLowerCase() === addr || to.toLowerCase() === addr) {
        cb(await this.getISIMABalance());
      }
    };
    await this.isima!.on('Transfer', this.transferListener);
    return () => this.isima?.off('Transfer', this.transferListener!);
  }

  async faucetNativeIfEmpty(addr: string, amountEth = '100'): Promise<void> {
    await this.init();
    const bal = await this.provider!.getBalance(addr);
    if (bal === 0n) {
      await this.getFunder().sendTransaction({
        to: addr,
        value: ethers.parseEther(amountEth),
      });
    }
  }

  ngOnDestroy() {
    if (this.isima && this.transferListener) {
      this.isima.off('Transfer', this.transferListener);
    }
  }
}
