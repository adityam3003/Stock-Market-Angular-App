import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms'; //sb-added - FormControl for autocomplete
import { AppServiceService } from '../app-service.service'; //sb-added
import { ActivatedRoute, Router, Params } from '@angular/router'; //sb-added
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap'; //sb-added - for modal
import * as Highcharts from 'highcharts/highstock'; //sb-added - for highcharts
import IndicatorsCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';

IndicatorsCore(Highcharts);
vbp(Highcharts);

let debounce = function (func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

@Component({
	selector: 'app-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  addInPf:boolean;
  rmInPf:boolean;
  addInWl:boolean;
  rmInWl:boolean;
	objectOptions: any;
	myFormControl = new FormControl();
	isLoaded: boolean;
	inputTxt: string = '';
	isSubmitted: boolean;
	desc: any;
	tickerValue: string = '';
	latestPrice: any;
	closedPrice: any;
	dailyChartData: any;
	historicalData: any;
	news: any;
	today: any;
	change: any;
	changeAndAll: any;
	timeDiff: any;
	mrktClsDT: any;
	isAllLoaded: boolean;
	isTValid: boolean;
	aCCrmWl: any; //alert close called for rmWl
	aCCaddWl: any; //alert close called for addWl
	aCCaddPf: any; //alert close called for addPf
	aCCrmPf: any; // //alert close called for rmPf
	alertCC: boolean; //alert close call for all alerts
	isFirstCall: boolean;
	call: any;
	peers: any;
	isClosed: boolean;
	dailyTimeStamp: any = new Date();
	datetime1: any;


	//for news
	articles: any;
	closeResult = '';
	newsModalContent: any;
	tweetURL: any;

	//Insights
	redditData: any;
	twitterData: any;
	twitterMention: any;
	twitterPositive: any;
	twitterNegative: any;
	redditMention: any;
	redditPositive: any;
	redditNegative: any;
	earningsData: any;
	recommendationData: any;
	chartsOption3: Highcharts.Options;
	buy: any;
	sell: any;
	hold: any;
	strongBuy: any;
	strongSell: any;
	period: any;
	data1: any;
	chartOptions: any;
	chartOptions3: any;

	//for watchlist
	isInWL: boolean;
	//for portfolio
	modalQty = new FormControl();
	modalMaxSellQty: any;
	modalMaxBuy: any;
	isBought: boolean;
	newQty: any;
	regex = /^\d*$/;
	modalTotal = 0.0;

	//for highcharts
	isHighcharts = typeof Highcharts === 'object';
	Highcharts: typeof Highcharts = Highcharts;
	chartConstructor: string = 'stockChart';
	date_close: any;
	chartOptions1: Highcharts.Options;
	twoYrsAgo: any;
	ohlc: any;
	volume: any;
	chartOptions2: Highcharts.Options;
	wallet: any;
	isSearched: boolean;


	constructor(
		private service: AppServiceService,
		private route: ActivatedRoute,
		private router: Router,
		private modalService: NgbModal
	) { }

	ngOnInit(): void {
    this.addInPf= false;
    this.rmInPf= false;
    this.addInWl= false;
    this.rmInWl= false;
		this.wallet = JSON.parse(localStorage.getItem("wallet"));
		this.isLoaded = false;
		this.isSubmitted = false;
		this.changeActiveClass();	//sb-added
		this.route.paramMap.subscribe((obs) => {
			this.tickerValue = obs.get('ticker');
			localStorage.setItem('tickerValue', obs.get('ticker'));
		});

		this.isTValid = true;
		this.isBought = false;
		this.isAllLoaded = false;
		this.newQty = 0;
		this.desc = this.service.companyDescription;
		if (this.desc && this.service.t == this.route.snapshot.params.ticker) {
			this.isFirstCall = false;
			this.service.isSearched = true;
			this.isSearched = this.service.isSearched;
			this.isTValid = true;
			this.desc = this.service.companyDescription;
			if (
				this.desc.hasOwnProperty('ticker') == false && this.desc.t_from_url == undefined
			) {
				this.isTValid = false;
			} else {
				this.isTValid = true;
				this.latestPrice = this.service.companyLatestPrice;
				this.peers = this.service.companyPeers;
				this.closedPrice = this.latestPrice.c;
				// var timestamp = this.latestPrice.t;
				// timestamp = timestamp.substring(0, timestamp.indexOf('T'));
				var t_date = new Date();
				var jsonTimestamp = new Date(this.latestPrice.t);
				this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
				if (this.timeDiff >= 5) {
					this.isClosed = true;
					this.dailyTimeStamp = this.latestPrice.t;
				}
				this.dailyChartData = this.service.companyDailyData;
				this.news = this.service.companyNews;
				// console.log(responseTwo)
				this.historicalData = this.service.companyHistoricalData;
				// this.articles = this.news.articles;
				this.handlingNews();
				this.handlingSummary();
				this.handlingDailyChart();
				this.handlingHistChart();
				this.isAllLoaded = true;
				this.redditData = this.service.companySocialSentiment['reddit']
				this.twitterData = this.service.companySocialSentiment['twitter']
				// console.log(this.redditData)
				// console.log(this.twitterData)
				this.handlingInsights();
				this.earningsData = this.service.companyEarnings
				// console.log(this.earningsData)
				this.getEarnings();
				this.recommendationData = this.service.companyRecommendationTrends
				// console.log(this.recommendationData)
				this.handlingRecommendationChart();
				if(!this.isClosed){
					this.call = setInterval(_ => {
						this.isFirstCall = false;
						this.service.getDetailsOne().subscribe((responseOne) => {
							// turn this back on
							this.desc = responseOne[0];
							if (
								this.desc.hasOwnProperty('ticker') == false  &&
								this.desc.ticker === ''
							) {
								this.isTValid = false;
							} else {
								this.isTValid = true;
								this.latestPrice = responseOne[1];
								this.closedPrice = this.latestPrice.c;
								// var timestamp = this.latestPrice.t;
								// timestamp = timestamp.substring(0, timestamp.indexOf('T'));
								// var t_date = new Date();
								// var jsonTimestamp = new Date(this.latestPrice.t);
								// this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
								// if (this.timeDiff >= 5) {
								// 	this.isClosed = true;
								// 	this.dailyTimeStamp = this.latestPrice.t;
								// }
								this.dailyTimeStamp = this.latestPrice.t
								this.service.getDetailsTwo(this.dailyTimeStamp).subscribe((responseTwo) => {
									this.dailyChartData = responseTwo[1];
									// console.log(responseTwo)
									this.handlingSummary();
									this.handlingDailyChart();
									this.isAllLoaded = true;
								});
							}
						});
					}, 15000);
				}
			}
		}
		else {
			this.isFirstCall = true;

			let t_frm_url = this.route.snapshot.params.ticker;

			if (!!t_frm_url) {
				//if url ticker is not undefined or such...
				this.service.getTicker(t_frm_url); //sending ticker from url to service
			}

			this.service.getDetailsOne().subscribe((responseOne) => {
				// turn this back on
				// console.log(responseOne)
				this.desc = responseOne[0];
				// console.log(this.desc.hasOwnProperty('ticker'))
				if (
					this.desc.hasOwnProperty('ticker') == false && this.desc.t_from_url == undefined
				) {
					this.isTValid = false;
				} else {
					this.isTValid = true;
					this.latestPrice = responseOne[1];
					this.peers = responseOne[2];
					this.closedPrice = this.latestPrice.c;
					// var timestamp = this.latestPrice.t;
					// timestamp = timestamp.substring(0, timestamp.indexOf('T'));
					var t_date = new Date();
					var jsonTimestamp = new Date(this.latestPrice.t);
					this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
					if (this.timeDiff >= 5) {
						this.isClosed = true;
						this.dailyTimeStamp = this.latestPrice.t;
					}
					this.service.getDetailsTwo(this.dailyTimeStamp).subscribe((responseTwo) => {
						this.dailyChartData = responseTwo[1];
						this.news = responseTwo[0];
						// console.log(responseTwo)
						this.historicalData = responseTwo[2];
						// this.articles = this.news.articles;
						this.handlingNews();
						this.handlingSummary();
						this.handlingDailyChart();
						this.handlingHistChart();
						this.isAllLoaded = true;
					});
					this.service.getSocialSentiment(t_frm_url).subscribe((responseThree) => {
						this.redditData = responseThree['reddit']
						this.twitterData = responseThree['twitter']
						// console.log(this.redditData)
						// console.log(this.twitterData)
						this.handlingInsights();
					});
					this.service.getEarnings(t_frm_url).subscribe((responseFour) => {
						this.earningsData = responseFour
						// console.log(this.earningsData)
						this.getEarnings();
					});
					this.service.getRecommendationTrends(t_frm_url).subscribe((responseFive) => {
						this.recommendationData = responseFive
						// console.log(this.recommendationData)
						this.handlingRecommendationChart();
					});
					
					if(!this.isClosed){
						this.call = setInterval(_ => {
							this.isFirstCall = false;
							this.service.getDetailsOne().subscribe((responseOne) => {
								// turn this back on
								this.desc = responseOne[0];
								if (
									this.desc.hasOwnProperty('ticker') == false &&
									this.desc.ticker === ''
								) {
									this.isTValid = false;
								} else {
									this.isTValid = true;
									// console.log(responseOne);
									this.latestPrice = responseOne[1];
									this.closedPrice = this.latestPrice.c;
									// var timestamp = this.latestPrice.t;
									// timestamp = timestamp.substring(0, timestamp.indexOf('T'));
									// var t_date = new Date();
									// var jsonTimestamp = new Date(this.latestPrice.t);
									// this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
									// if (this.timeDiff >= 5) {
									// 	this.isClosed = true;
									// 	this.dailyTimeStamp = this.latestPrice.t;
									// }
									this.dailyTimeStamp = this.latestPrice.t
									this.service.getDetailsTwo(this.dailyTimeStamp).subscribe((responseTwo) => {
										this.dailyChartData = responseTwo[1];
										// console.log(responseTwo)
										this.handlingSummary();
										this.handlingDailyChart();
										this.isAllLoaded = true;
									});
								}
							});
						}, 15000);
					}
				}
			});
		}
		// }
	}

	formDisplay(formIp) {
		return formIp ? formIp : undefined;
	}

	efficientSearch = debounce(
		(event) => {
			this.isLoaded = false;
			this.objectOptions = null;
			var options;
			var resList = [];
			this.inputTxt = event.target.value;
			if (this.inputTxt !== '') {
				this.service.getCompanies(this.inputTxt).subscribe((response) => {
					options = response;
					options = options.result;
					var len = options.length;
					for (var i = 0; i < len; i++) {
						if (
							options[i].type == 'Common Stock' &&
							!options[i].displaySymbol.includes('.')
						) {
							resList.push(options[i]);
						}
					}
					this.objectOptions = resList;
					// console.log(this.objectOptions);
					this.isLoaded = true;
					this.inputTxt = '';
				});
			}
		},
		400,
		undefined
	);

	callAutocomplete(event) {
		this.isLoaded = false;
		this.objectOptions = null;
		var options;
		var resList = [];
		this.inputTxt = event.target.value;
		if (this.inputTxt !== '') {
			this.service.getCompanies(this.inputTxt).subscribe((response) => {
				options = response;
				options = options.result;
				var len = options.length;
				for (var i = 0; i < len; i++) {
					if (
						options[i].type == 'Common Stock' &&
						!options[i].displaySymbol.includes('.')
					) {
						resList.push(options[i]);
					}
				}
				this.objectOptions = resList;
				this.isLoaded = true;
				this.inputTxt = '';
			});
		}
	}

	async updateData(ticker) {

		this.isLoaded = false;
		this.isSubmitted = false;
		this.isTValid = true;
		this.isBought = false;
		this.isAllLoaded = false;
		this.newQty = 0;

		this.service.getDetailsOne().subscribe((responseOne) => {
			// turn this back on
			this.desc = responseOne[0];
			if (this.desc.hasOwnProperty('ticker')  == false) {
				this.isTValid = false;
			} else {
				this.isTValid = true;
				this.latestPrice = responseOne[1];
				this.peers = responseOne[2];
				this.closedPrice = this.latestPrice.c;
				// var timestamp = this.latestPrice.t;
				// timestamp = timestamp.substring(0, timestamp.indexOf('T'));
				var t_date = new Date();
				var jsonTimestamp = new Date(this.latestPrice.t);
				this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
				if (this.timeDiff >= 5) {
					this.isClosed = true;
					this.dailyTimeStamp = this.latestPrice.t;
				}
				this.service.getDetailsTwo(this.dailyTimeStamp).subscribe((responseTwo) => {
					this.dailyChartData = responseTwo[1];
					this.news = responseTwo[0];
					// console.log(responseTwo)
					this.historicalData = responseTwo[2];

					this.handlingNews();
					this.handlingSummary();
					this.handlingDailyChart();
					this.handlingHistChart();

					// this.articles = this.news.articles;
					this.service.getSocialSentiment(ticker).subscribe((responseThree) => {

						this.redditData = responseThree['reddit']
						this.twitterData = responseThree['twitter']
						// console.log(this.redditData)
						// console.log(this.twitterData)
						this.service.getEarnings(ticker).subscribe((responseFour) => {

							this.earningsData = responseFour
							// console.log(this.earningsData)
							this.service.getRecommendationTrends(ticker).subscribe((responseFive) => {

								this.recommendationData = responseFive
								// console.log(this.recommendationData);
								this.handlingInsights();
								this.handlingRecommendationChart();
								this.getEarnings();

								this.isAllLoaded = true;
							});
						});
					});
				});
			}
		});
	}

	onSubmit(event: Event) {
		//sb-added	//, searchForm: NgForm
		event.preventDefault();
		if((<HTMLInputElement>(
			document.getElementById('inputticker')
		)).value == ''){
			// this.isTValid = false;
			this.service.emptyInput = true;
			this.router.navigate(['search/']);
			this.isSubmitted = true;
			document.getElementById("inputticker").blur();
			return;
		}
		var t_frm_search = (<HTMLInputElement>(
			document.getElementById('inputticker')
		)).value.toUpperCase();
		this.service.getTicker(t_frm_search);
		this.isSubmitted = true;
		localStorage.setItem("tickerValue", t_frm_search);
		this.updateData(t_frm_search).then(_ => {
			this.router.navigate(['search/' + t_frm_search], {
				relativeTo: this.route.parent,
			});
		});
	}

	reset() {
		this.router.navigate(['search/home'], {
			relativeTo: this.route.parent,
		});
	}




	ngOnDestroy(): void {
		clearInterval(this.call);
		clearInterval(this.aCCrmWl);
		clearInterval(this.aCCaddWl);
		clearInterval(this.aCCaddPf);
		clearInterval(this.aCCrmPf);
	}


	handlingSummary() {
		//star
		if (localStorage.getItem('watchlist') === null) {
			// if there is no watchlist empty star
			this.isInWL = false;
		} else {
			// if there is watchlist
			let watchlist = JSON.parse(localStorage.getItem('watchlist'));
			if (this.desc.ticker in watchlist) {
				// if ticker is in watchlist full star
				this.isInWL = true;
			} else {
				// else empty star
				this.isInWL = false;
			}
		}

		if (localStorage.getItem("pf") === null) {
			this.isBought = false;

		}
		else {
			let pf = JSON.parse(localStorage.getItem('pf'));
			if (this.desc.ticker in pf) {
				this.isBought = true;

			}
			else {
				this.isBought = false;
			}
		}

		//current time
		var t_date = new Date();
		var t_day = this.addZero(t_date.getDate());
		var t_month = this.addZero(t_date.getMonth() + 1); // +1 because getMonth() method returns the month (from 0 to 11)
		var t_year = t_date.getFullYear();
		var t_h = this.addZero(t_date.getHours());
		var t_m = this.addZero(t_date.getMinutes());
		var t_s = this.addZero(t_date.getSeconds());
		this.today =
			t_year + '-' + t_month + '-' + t_day + ' ' + t_h + ':' + t_m + ':' + t_s;

		//	change and change percentage
		if (this.latestPrice.c && this.latestPrice.pc) {
			this.change = this.latestPrice.c - this.latestPrice.pc;
			var changePercentage = (this.change * 100) / this.latestPrice.pc;
			this.changeAndAll =
				this.latestPrice.d.toFixed(2) + ' (' + this.latestPrice.dp.toFixed(2) + '%)';
		}

		// so that modalTotal stays updated even though modal is stale
		this.modalTotal = this.newQty * this.latestPrice.c;

		//market open/close
		var jsonTimestamp = new Date(this.latestPrice.t * 1000);
		this.timeDiff = (t_date.valueOf() - jsonTimestamp.valueOf()) / 60000;
		if (this.timeDiff >= 5) {
			// market closed
			this.isClosed = true;
			t_day = this.addZero(jsonTimestamp.getDate());
			t_month = this.addZero(jsonTimestamp.getMonth() + 1); // +1 because getMonth() method returns the month (from 0 to 11)
			t_year = jsonTimestamp.getFullYear();
			t_h = this.addZero(jsonTimestamp.getHours());
			t_m = this.addZero(jsonTimestamp.getMinutes());
			t_s = this.addZero(jsonTimestamp.getSeconds());
			this.mrktClsDT =
				t_year +
				'-' +
				t_month +
				'-' +
				t_day +
				' ' +
				t_h +
				':' +
				t_m +
				':' +
				t_s;
		}
	}

	handlingDailyChart() {
		this.date_close = []; // to remove previous chart data incase there is no data for next search
		var i = 0;
		var len = this.dailyChartData.c?.length;
		var chartColor = 'black';
		if (this.change < 0) {
			chartColor = 'red';
		} else if (this.change > 0) {
			chartColor = 'green';
		}
		if (len != 0) {
			// if there is chart data in current search
			while (i < len) {
				const UTC_date = this.dailyChartData.t[i] * 1000;
				var temp_close = parseFloat(this.dailyChartData.c[i].toFixed(3));
				this.date_close[i] = [UTC_date, temp_close];
				i++;
			}
			this.chartOptions1 = {
				chart: {
					height: 400,
				},
				responsive: {
					rules: [
						{
							condition: {
								maxWidth: 500,
							},
						},
					],
				},
				title: {
					text: this.desc.ticker + ' Hourly Price Variation',
					style: {
						color: 'grey',
					},
				},
				rangeSelector: {
					enabled: false,
				},
				time: {
					useUTC: false,
				},
				series: [
					{
						name: this.desc.ticker,
						data: this.date_close,
						type: 'line',
						color: chartColor,
					},
				],
				xAxis: {
					type: 'datetime',
					zoomEnabled: true,
					units: [
						['minute', [30]],
						['hour', [1]],
					],
				},
				yAxis: [
					{
						opposite: true,
						height: '100%',
						offset: 0,
					},
				],
				plotOptions: {
					series: {
						pointPlacement: 'on',
					},
				},
				navigator: {
					enabled: false,
					series: {
						type: 'area',
						fillColor: chartColor,
					},
				},
				scrollbar: {
					enabled: false
				}
			};
		}
	}

	handlingHistChart() {
		// split the data set into ohlc and volume
		this.ohlc = [];
		this.volume = [];
		var len = this.historicalData.c?.length;

		if (len > 0) {
			// if there is chart data in current search
			var i = 0;
			while (i < len) {
				const UTC_date = this.historicalData.t[i] * 1000;
				var o = this.historicalData.o[i];
				var h = this.historicalData.h[i];
				var l = this.historicalData.l[i];
				var c = this.historicalData.c[i];
				var v = this.historicalData.v[i];
				this.ohlc.push([
					UTC_date, // the date
					o, // open
					h, // high
					l, // low
					c, // close
				]);

				this.volume.push([
					UTC_date, // the date
					v, // the volume
				]);
				i++;
			}
			// create the chart
			this.chartOptions2 = {
				rangeSelector: {
					selected: 2,
				},

				title: {
					text: this.desc.ticker + ' Historical',
				},

				subtitle: {
					text: 'With SMA and Volume by Price technical indicators',
				},

				yAxis: [
					{
						startOnTick: false,
						endOnTick: false,
						labels: {
							align: 'right',
							x: -3,
						},
						title: {
							text: 'OHLC',
						},
						height: '60%',
						lineWidth: 2,
						resize: {
							enabled: true,
						},
					},
					{
						labels: {
							align: 'right',
							x: -3,
						},
						title: {
							text: 'Volume',
						},
						top: '65%',
						height: '35%',
						offset: 0,
						lineWidth: 2,
					},
				],

				tooltip: {
					split: true,
				},

				plotOptions: {
					series: {
						dataGrouping: {
							units: [
								['day', [1]],
								['week', [1]],
								//													['month', [1, 2, 3, 4, 6]]
							],
						},
					},
				},

				series: [
					{
						type: 'candlestick',
						name: this.desc.ticker,
						id: this.desc.ticker.toLowerCase(),
						zIndex: 2,
						data: this.ohlc,
					},
					{
						type: 'column',
						name: 'Volume',
						id: 'volume',
						data: this.volume,
						yAxis: 1,
					},
					{
						type: 'vbp',
						linkedTo: this.desc.ticker.toLowerCase(),
						params: {
							volumeSeriesID: 'volume',
						},
						dataLabels: {
							enabled: false,
						},
						zoneLines: {
							enabled: false,
						},
					},
					{
						type: 'sma',
						linkedTo: this.desc.ticker.toLowerCase(),
						zIndex: 1,
						marker: {
							enabled: false,
						},
					},
				],
			};
		}
	}

	handlingNews() {
		var i = 0,
			c = 0,
			len = this.news.length;
		var resNews = [];
		while (i < len) {
			let tFine =
				this.news[i].hasOwnProperty('headline') && !!this.news[i].headline; // title
			let utiFine =
				this.news[i].hasOwnProperty('image') &&
				!!this.news[i].image; // urlToImage
			let snFine =
				this.news[i].hasOwnProperty('source') &&
				!!this.news[i].source; // source.name
			let paFine =
				this.news[i].hasOwnProperty('datetime') &&
				!!this.news[i].datetime; // publishedAt

			let dFine =
				this.news[i].hasOwnProperty('summary') &&
				!!this.news[i].summary; // description
			let uFine =
				this.news[i].hasOwnProperty('url') && !!this.news[i].url; // url
			if (tFine && utiFine && snFine && paFine && dFine && uFine) {
				// this.news.splice(i, 1);
				resNews.push(this.news[i]);
				len--;
				c++;
			}
			i++;
			if (c == 20) {
				break;
			}
		}
		this.news = resNews;
	}

	setOrRemoveFrmWl() {
		let thisTicker = this.desc.ticker;
		if (localStorage.getItem('watchlist') === null) {
			// if there is no watchlist make one and add ticker to it
			let watchlist = {};
			watchlist[thisTicker] = { ticker: thisTicker, name: this.desc.name };
			localStorage.setItem('watchlist', JSON.stringify(watchlist));
			this.isInWL = true;
			this.autoDisappearAlert('addWl');
		} else {
			// if there is watchlist
			let watchlist = JSON.parse(localStorage.getItem('watchlist'));
			localStorage.removeItem('watchlist');
			if (thisTicker in watchlist) {
				// if ticker already in watchlist remove it
				if (Object.keys(watchlist).length === 1) {
					// means only one element is there and we are deleting it
					this.isInWL = false;
					this.autoDisappearAlert('rmWl');
					return;
				} else {
					delete watchlist[thisTicker];
				}
				this.isInWL = false;
				this.autoDisappearAlert('rmWl');
			} else {
				// else add ticker to watchlist
				watchlist[thisTicker] = { ticker: thisTicker, name: this.desc.name };
				this.isInWL = true;
				this.autoDisappearAlert('addWl');
				var orderedWl = {};
				Object.keys(watchlist)
					.sort()
					.forEach(function (key) {
						orderedWl[key] = watchlist[key];
					});
				watchlist = orderedWl;
			}
			localStorage.setItem('watchlist', JSON.stringify(watchlist));
		}
	}
	handlingInsights() {
    let tm=0;
    let nm = 0;
    let pm = 0;
    for(let i=0;i<this.redditData.length;i++){
      tm+=this.redditData[i].mention;
      nm+=this.redditData[i].negativeMention
      pm+=this.redditData[i].positiveMention
    }
    this.redditMention = tm
		this.redditNegative = nm
		this.redditPositive = pm
    tm=0;
    nm = 0;
    pm = 0;
    for(let i=0;i<this.twitterData.length;i++){
      tm+=this.twitterData[i].mention;
      nm+=this.twitterData[i].negativeMention
      pm+=this.twitterData[i].positiveMention
    }
    this.twitterMention = tm
		this.twitterNegative = nm
		this.twitterPositive = pm
		

	}


	// console.log('hi')


	handlingRecommendationChart() {

		let colors = ["#2d473a", "#1d8c54", "#bc8c1d", "#f4585a", "#803131"]
		this.chartOptions3 = {
			chart: {
				type: 'column',
				reflow: true,
				// zoomType:'x',
			},
			colors: colors,
			title: {
				text: `Recommendation Trends`
			},
			xAxis: {
				categories: this.recommendationData.xcateg
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Analysis'
				},
				stackLabels: {
					enabled: false,

				}
			},
			legend: {
				align: 'center',
				verticalAlign: 'bottom',
				backgroundColor:
					this.Highcharts.defaultOptions.legend.backgroundColor || 'white',
				shadow: false
			},
			tooltip: {
				headerFormat: '<b>{point.x}</b><br/>',
				pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
			},
			plotOptions: {
				column: {
					stacking: 'normal',
					dataLabels: {
						enabled: true
					}
				}
			},
			series: [{
				name: 'Strong Buy',
				data: this.recommendationData.strongBuy
			}, {
				name: 'Buy',
				data: this.recommendationData.buy
			}, {
				name: 'Hold',
				data: this.recommendationData.hold
			}, {
				name: 'Sell',
				data: this.recommendationData.sell
			}, {
				name: 'Strong Sell',
				data: this.recommendationData.strongSell
			}]
		}


	}


	getEarnings() {
		this.chartOptions = {
			chart: {
				type: 'spline',
				height: 400,
				reflow: true,
			},
			title: {
				text: 'Historical EPS Surprise'
			},
			xAxis: {
				// reversed: false,
				// title: {
				//     enabled: true,
				//     text: 'Altitude'
				// },
				// labels: {
				//     format: '{value} km'
				// },
				// accessibility: {
				//     rangeDescription: 'Range: 0 to 80 km.'
				// },
				// maxPadding: 0.05,
				// showLastLabel: true

				categories: this.earningsData.xcateg
			},
			yAxis: {
				title: {
					text: 'Quarterly EPS'
				}
			},
			legend: {
				enabled: true
			},
			tooltip: {
				shared: true,
				useHTML: true,
				headerFormat: '{point.x}<br>',
				// pointFormat: '{point.x}: {point.y}'

			},
			plotOptions: {
				spline: {
					marker: {
						enable: false
					}
				}
			},
			series: [{
				name: 'Actual',
				data: this.earningsData.actual
			}, {
				name: 'Estimate',
				data: this.earningsData.estimate
			}]

		}

	}


	buyStock(newQty, newTot, thisTicker) {
		// let thisTicker = this.desc.ticker;
		if (localStorage.getItem('pf') === null) {
			// if there is no portfolio make one and add ticker to it
			let pf = {};
			pf[thisTicker] = {
				ticker: thisTicker,
				name: this.desc.name,
				qty: newQty,
				totC: newTot,
				avgC: newTot / parseInt(newQty),
			};
			localStorage.setItem('pf', JSON.stringify(pf));
		} else {
			// if there is portfolio
			let pf = JSON.parse(localStorage.getItem('pf'));
			localStorage.removeItem('pf');
			if (thisTicker in pf) {
				// if ticker already in portfolio edit it
				pf[thisTicker].qty =
					parseInt(pf[thisTicker].qty) + parseInt(newQty);
				pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) + newTot;
				pf[thisTicker].avgC =
					parseFloat(pf[thisTicker].totC) / parseInt(pf[thisTicker].qty);
			} else {
				// else add ticker to portfolio
				pf[thisTicker] = {
					ticker: thisTicker,
					name: this.desc.name,
					qty: newQty,
					totC: newTot,
					avgC: newTot / parseInt(newQty),
				};
				var orderedPf = {};
				Object.keys(pf)
					.sort()
					.forEach(function (key) {
						orderedPf[key] = pf[key];
					});
				pf = orderedPf;
			}
			localStorage.setItem('pf', JSON.stringify(pf));
		}

		this.wallet = this.wallet - newTot;
		localStorage.setItem("wallet", this.wallet.toString())
		if (newQty > 0) {
			this.isBought = true;
		}
		document.getElementById('sell').style.display = 'inline-block';
		this.autoDisappearAlert('addPf');
	}

	openBuyModal(buycontent) {
		this.modalQty.setValue(0);
		this.modalTotal = 0.0;
		this.modalService
			.open(buycontent, { ariaLabelledBy: 'modal-title' })
			.result.then(
				(result) => {
					this.closeResult = `Closed with: ${result}`;
				},
				(reason) => {
					this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
				}
			);

		//to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById('qty')).setAttribute(
			'type',
			'text'
		);
		(<HTMLInputElement>document.getElementById('qty')).setSelectionRange(1, 1);
		(<HTMLInputElement>document.getElementById('qty')).setAttribute(
			'type',
			'number'
		);

		this.modalMaxBuy = this.wallet;

		document.getElementById('qty').addEventListener('input', (e) => {
			this.newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = this.newQty * this.latestPrice.c;
		});

		(<HTMLInputElement>document.getElementById('finalBuy')).addEventListener(
			'click',
			(e) => {
				this.buyStock(this.newQty, this.modalTotal, this.desc.ticker);
			}
		);
	}

	openSellModal(sellcontent, thisTicker) {
		this.modalQty.setValue(0);
		// this.modalContent = { 'ticker': thisTicker, 'last': this.last[thisTicker] };
		let newQty;
		this.modalService
			.open(sellcontent, { ariaLabelledBy: 'modal-title' })
			.result.then((result) => {
				this.closeResult = `Closed with: ${result}`;
			}, (reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			});

		//to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById('sellQty')).setSelectionRange(
			1,
			1
		);
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'number');

		this.modalMaxSellQty = (JSON.parse(localStorage.getItem('pf')))[thisTicker].qty;

		document.getElementById('sellQty').addEventListener('input', (e) => {
			newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = newQty * this.latestPrice.c;
		});
		(<HTMLInputElement>document.getElementById("finalSell")).addEventListener('click', (e) => {
			this.sellStock(newQty, this.modalTotal, thisTicker);
		});
	}

	sellStock(newQty, newTot, thisTicker) {
		let pf = JSON.parse(localStorage.getItem('pf'));
		localStorage.removeItem('pf');
		if (parseInt(newQty) === parseInt(pf[thisTicker].qty)) {
			// document.getElementById("pfcard" + thisTicker).style.display = "none";
			this.isBought = false;
			document.getElementById('sell').style.display = 'none';

			if (Object.keys(pf).length === 1) {
				this.wallet = this.wallet + newTot;
				localStorage.setItem("wallet", this.wallet.toString())
				// document.getElementById("nostock").style.display = "block";
        this.autoDisappearAlert('rmPf');
				return;
			}
			else {
				delete pf[thisTicker];
			}
		}
		else {
			pf[thisTicker].qty = parseInt(pf[thisTicker].qty) - parseInt(newQty);
			pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) - (parseFloat(pf[thisTicker].avgC) * parseInt(newQty));
		}
		this.wallet = this.wallet + newTot;
		localStorage.setItem("wallet", this.wallet.toString())
		localStorage.setItem('pf', JSON.stringify(pf));
		this.autoDisappearAlert('rmPf');
	}

	openNewsModal(newscontent, article) {
		this.newsModalContent = article;
		// console.log(this.newsModalContent)
		var d = new Date(this.newsModalContent.datetime * 1000);

		this.newsModalContent.datetime1 =
			d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' }) +
			', ' +
			d.toLocaleDateString('en-US', { year: 'numeric' });
		this.modalService
			.open(newscontent, { ariaLabelledBy: 'modal-basic-title' })
			.result.then(
				(result) => {
					this.closeResult = `Closed with: ${result}`;
				},
				(reason) => {
					this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
				}
			);
	}

	twitterURL() {
		this.tweetURL =
			'https://twitter.com/intent/tweet?text=' +
			encodeURIComponent(this.newsModalContent.headline) +
			'&url=' +
			encodeURIComponent(this.newsModalContent.url);
	}

	autoDisappearAlert(id) {
    if (id === 'rmWl') {
      this.rmInWl = true;
      setTimeout(() => {
        this.rmInWl = false;
      }, 5000);
    }
    if (id === 'addWl') {
      this.addInWl = true;
      setTimeout(() => {
        this.addInWl = false;
      }, 5000);
    }
    if (id === 'rmPf') {
      this.rmInPf = true;
      setTimeout(() => {
        this.rmInPf = false;
      }, 5000);
    }
    if (id === 'addPf') {
      this.addInPf = true;
      setTimeout(() => {
        this.addInPf = false;
      }, 5000);
    }
  }

  closeAlert(id) {
    if (id === 'rmWl') {
      this.rmInWl = false;
      
    }
    if (id === 'addWl') {
      this.addInWl = false;
      
    }
    if (id === 'rmPf') {
      this.rmInPf = false;
      
    }
    if (id === 'addPf') {
      this.addInPf = false;
    }
  }

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

	isEmpty(value: any) {
		return value == null || value.length === 0;
	}

	updateHTML(elmId, value) {
		var elem = document.getElementById(elmId);
		if (typeof elem !== 'undefined' && elem !== null) {
			elem.innerHTML = value;
		}
	}

	addZero(i) {
		//sb-added
		if (i < 10) {
			i = '0' + i;
		}
		return i;
	}

	//sb-added

	changeActiveClass() { //sb-added
		document.querySelectorAll('.nav-item').forEach(item => {
			item.classList.remove('active');
		});
		document.getElementById('search').classList.add('active');
	}
}
