import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http'; //sb-added
import { SearchBarComponent } from './search-bar/search-bar.component'; //sb-added
import { WatchlistComponent } from './watchlist/watchlist.component'; //sb-added
import { PortfolioComponent } from './portfolio/portfolio.component'; //sb-added
import { DetailsComponent} from './details/details.component';
// FormsModule is here because I have used ngForm in SearchComponent
// and SeachComponent is in this module
import { MatButtonModule } from '@angular/material/button'; //sb-added
import { MatIconModule } from '@angular/material/icon'; //sb-added
import { MatTabsModule } from '@angular/material/tabs'; //sb-added
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; //sb-added
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //sb-added - ReactiveFormsModule is for autocomplete
import { CommonModule } from '@angular/common'; //sb-added - for ngFor, ngIf
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; //sb-added
import { MatAutocompleteModule } from '@angular/material/autocomplete'; //sb-added

import { HighchartsChartModule } from 'highcharts-angular';
import {MatPaginatorModule} from '@angular/material/paginator';
import { NavbarComponent } from './navbar/navbar.component'
const routes: Routes = [
  {
    path: 'search/home',
    pathMatch: 'full',
    component: SearchBarComponent,
  },
  {
    path: 'watchlist',
    component: WatchlistComponent,
  },
  {
    path: 'portfolio',
    component: PortfolioComponent,
  },
  {
    path: 'search/:ticker',
    component: DetailsComponent,
  },
  {
    path: '**',
    redirectTo: '/search/home',
  },
];

@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    PortfolioComponent,
    WatchlistComponent,
    DetailsComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    FormsModule, //sb-added
    ReactiveFormsModule, //sb-added
    HttpClientModule, //sb-added
    MatButtonModule, //sb-added
    MatIconModule, //sb-added
    MatTabsModule, //sb-added
    MatProgressSpinnerModule, //sb-added
    CommonModule, //sb-added
    NgbModule, //sb-added
    MatAutocompleteModule, //sb-added
    HighchartsChartModule,
    MatPaginatorModule
     //sb-added
  ],
  exports: [RouterModule, ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
