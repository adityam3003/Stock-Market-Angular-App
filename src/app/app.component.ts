import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppServiceService } from './app-service.service';
import {ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Stock Search';
  isSearched: boolean=false;
  tickerValue: string;
  t: string;

  constructor(private route: ActivatedRoute, private router: Router, private service: AppServiceService, private cdr: ChangeDetectorRef) { }  //sb-added
	
	ngOnInit(): void {
    this.service.search_status.subscribe((data) => {
      this.isSearched = data;
    });
    this.service.ticker_status.subscribe((data) => {
      this.tickerValue = data;
    });
    if(!localStorage.getItem("wallet")){
      localStorage.setItem("wallet", (25000.00).toString());
    }
  }


  ngAfterContentChecked() {

    this.cdr.detectChanges();

  }
}