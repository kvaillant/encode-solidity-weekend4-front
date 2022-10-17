import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ethers } from 'ethers';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  tokenContractAddress: string;
  tokenTotalSupply: string;
  walletAddress: string;
  wallet: ethers.Wallet | undefined;
  etherBalance: string;
  provider: ethers.providers.BaseProvider;
  claimForm = this.fb.group({
    name: ['', Validators.required],
    id: [''],
  });

  constructor(private apiAservice: ApiService, private fb: FormBuilder) {
    this.walletAddress = 'Loading...';
    this.etherBalance = 'Loading...';
    this.tokenContractAddress = '';
    this.tokenTotalSupply = 'Loading...';
    this.provider = ethers.getDefaultProvider('goerli');
  }

  ngOnInit(): void {
    this.apiAservice.getContractAddress().subscribe((response) => {
      this.tokenContractAddress = response.address;
    });
    this.apiAservice.getTotalSupply().subscribe((response) => {
      this.tokenTotalSupply = response.result + ' Tokens';
    });
    this.wallet = ethers.Wallet.createRandom();
    this.walletAddress = this.wallet.address;
    this.provider.getBalance(this.walletAddress).then((balanceBN) => {
      this.etherBalance = ethers.utils.formatEther(balanceBN) + ' ETH';
    });
  }
  async request() {
    const body = {
      name: this.claimForm.value.name,
      id: this.claimForm.value.id,
    };
    const message = JSON.stringify(body);
    const signature = await this.wallet?.signMessage(message);
    // console.info({ message, signature });
    this.apiAservice
      .requestTokens({ message, signature })
      .subscribe((result) => {
        console.info({ result });
      });
  }
}
