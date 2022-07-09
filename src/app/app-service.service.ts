import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';	//sb-added
import { Observable, forkJoin } from 'rxjs';	//sb-added
import { map } from 'rxjs/operators';	//sb-added

const options = {
			headers: new HttpHeaders({ "Content-Type": "application/json"})
}

@Injectable({
  providedIn: 'root'
})

export class AppServiceService {

	isSearched: boolean;
	companyDescription: any;
	companyLatestPrice: any;
	companyPeers: any;
	companyNews: any;
	companyHistoricalData: any;
	companyDailyData: any;
	companySocialSentiment: any;
	companyEarnings: any;
	companyRecommendationTrends: any;
	emptyInput: boolean=false;
	@Output() search_status: EventEmitter<any> = new EventEmitter();
	@Output() ticker_status: EventEmitter<any> = new EventEmitter();
	t:string;

	constructor(private http : HttpClient) {	//sb-edited ...was "constructor() { }"
	}
	
	setNavbar(){
		this.isSearched = false;
		this.t = '';
		this.search_status.emit(this.isSearched);
		this.ticker_status.emit(this.t);

	}
	
	getTicker(ticker: string) {	// sb-added - to accept ticker from search component and push the ticker using the observable
		this.t = ticker;
	}
	
	getCompanies(inputTxt: string) {	//sb-added
		// return this.http.get('/compsearch/'+inputTxt, options);
//		return this.http.get('http://localhost:3000/compsearch/'+inputTxt, options);
		return this.http.get('https://webtech-8.wl.r.appspot.com/search/'+inputTxt);
	}
    
	getDetailsOne() {	//sb-added
		// const compDesc = this.http.get('/compdesc/'+this.t, options);
		// const compLatestPrice = this.http.get('/complatestprice/'+this.t, options);
//		const compDesc = this.http.get('http://localhost:3000/compdesc/'+this.t, options);
//		const compLatestPrice = this.http.get('http://localhost:3000/complatestprice/'+this.t, options);
		const compDesc = this.http.get('https://webtech-8.wl.r.appspot.com/stock/'+this.t);
		compDesc.toPromise().then((res) => {
			this.companyDescription = res;
		});
		const compLatestPrice = this.http.get('https://webtech-8.wl.r.appspot.com/latestprice/'+this.t);
		compLatestPrice.toPromise().then((res) => {
			this.companyLatestPrice = res;
		});
		const companyPeers = this.http.get('https://webtech-8.wl.r.appspot.com/peers/'+this.t);
		companyPeers.toPromise().then((res) => {
			this.companyPeers = res;
		});
		return forkJoin([compDesc, compLatestPrice,companyPeers]);	// , compLatestPrice
	}
	getPeers(stock){
		return this.http.get('https://webtech-8.wl.r.appspot.com/peers/'+stock);
	}
	getDetailsTwo(timestamp: string) {
		this.search_status.emit(true);
		this.ticker_status.emit(localStorage.getItem("tickerValue"));
		// const compDailyChartData = this.http.get('/compdailychartdata/'+this.t+'/'+timestamp, options);
		// const compNews = this.http.get('/compnews/'+this.t, options);
//		const compDailyChartData = this.http.get('http://localhost:3000/compdailychartdata/'+this.t+'/'+timestamp, options);
//		const compNews = this.http.get('http://localhost:3000/compnews/'+this.t, options);
		const compDailyChartData = this.http.get('https://webtech-8.wl.r.appspot.com/chartdata/'+this.t+'*'+timestamp);
		compDailyChartData.toPromise().then((res) => {
			this.companyDailyData = res;
		});
		const compNews = this.http.get('https://webtech-8.wl.r.appspot.com/news/'+this.t);
		compNews.toPromise().then((res) => {
			this.companyNews = res;
		});
		// var s_date = new Date();
		// var s_day = s_date.getDate();
		// var s_month = s_date.getMonth() + 1; // +1 because getMonth() method returns the month (from 0 to 11)
		// var s_year = s_date.getFullYear() - 2; // because we want start-year to be 2 years ago
		// var twoYrsAgo: string = s_year.toString()+"-";
		// if (s_month < 10) {twoYrsAgo = twoYrsAgo+"0"+s_month.toString()+"-";}
		// else {twoYrsAgo = twoYrsAgo+s_month.toString()+"-";}
		// if (s_day < 10) {twoYrsAgo = twoYrsAgo+"0"+s_day.toString();}
		// else {twoYrsAgo = twoYrsAgo+s_day.toString();}
		// const compHistoricalData = this.http.get('/comphistoricaldata/'+this.t+'/'+twoYrsAgo, options)
//		const compHistoricalData = this.http.get('http://localhost:3000/comphistoricaldata/'+this.t+'/'+twoYrsAgo, options)
		const compHistoricalData = this.http.get('https://webtech-8.wl.r.appspot.com/chartdata1/'+this.t)
		compHistoricalData.toPromise().then((res) => {
			this.companyHistoricalData = res;
		});
		return forkJoin([compNews, compDailyChartData, compHistoricalData]);	// compDailyChartData, 
	}

	
	
	getMultipleLP(tickers: string) {
		// return this.http.get('/complatestprice/'+tickers, options);
//		return this.http.get('http://localhost:3000/complatestprice/'+tickers, options);
		
		return this.http.get('https://webtech-8.wl.r.appspot.com/updatedprice/'+tickers);
	}
	getSocialSentiment(tickers:string) {
		const socialSentiment = this.http.get('https://webtech-8.wl.r.appspot.com/socialsentiment/'+tickers);
		socialSentiment.toPromise().then((res) => {
			this.companySocialSentiment = res;
		});
		return socialSentiment
	}

	getEarnings(tickers:string) {
		const compEarnings = this.http.get('https://webtech-8.wl.r.appspot.com/earnings/'+tickers);
		compEarnings.toPromise().then((res) => {
			this.companyEarnings = res;
		});
		return compEarnings;

	}
	getRecommendationTrends(tickers: string) {
		const compRecTrend = this.http.get('https://webtech-8.wl.r.appspot.com/recommendation/'+tickers);
		compRecTrend.toPromise().then((res) => {
			this.companyRecommendationTrends = res;
		});
		return compRecTrend;
		
	}
}