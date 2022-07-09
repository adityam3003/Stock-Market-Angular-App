import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms'; //sb-added - FormControl for autocomplete
import { AppServiceService } from '../app-service.service'; //sb-added
import { ActivatedRoute, Router } from '@angular/router'; //sb-added

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
	selector: 'app-search',
	templateUrl: './search-bar.component.html',
	styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
	//	options: string[] = ['aapl', 'amd', 'amzn', 'eric', 'ed', 'ge', 'googl', 'nvda', 'wmg', 'wdc'];
	objectOptions: any;
	myFormControl = new FormControl();
	isLoaded: boolean;
	inputTxt: string = '';
	isSubmitted: boolean;
	@Input() tickerValue: string;

	constructor(
		private service: AppServiceService,
		private route: ActivatedRoute,
		private router: Router
	) {
		//sb-edited ...was constructor() {}
	}

	ngOnInit(): void {
		// this.changeActiveClass(); //sb-added
		this.service.isSearched = false;
		this.service.companyDescription = undefined;
		this.service.companyLatestPrice = undefined;
		this.service.companyPeers = undefined;
		this.service.companyNews = undefined;
		this.service.companyHistoricalData = undefined;
		this.service.companyDailyData = undefined;
		this.service.companySocialSentiment = undefined;
		this.service.companyEarnings = undefined;
		this.service.companyRecommendationTrends = undefined;
		this.service.setNavbar();
		localStorage.removeItem('tickerValue');
		this.isLoaded = false;
		this.isSubmitted = false;
		document.getElementById("s-invalid-ticker").style.display = "none";
		if(this.service.emptyInput){
			document.getElementById("s-invalid-ticker").style.display = "block";	
		}
		document
			.getElementById('inputticker')
			.addEventListener('input', this.efficientSearch);
		this.removeActiveClass();
	}

	formDisplay(formIp) {
		return formIp ? formIp.toUpperCase() : undefined;
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
					this.isLoaded = true;
					this.inputTxt = '';
				});
			}
		},
		400,
		undefined
	);

	clearInvalidDiv(){
		document.getElementById("s-invalid-ticker").style.display = "none";
	}

	callAutocomplete(event) {
		document.getElementById("s-invalid-ticker").style.display = "none";
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

	onSubmit(event: Event) {
		//sb-added	//, searchForm: NgForm
		event.preventDefault();
		if((<HTMLInputElement>(
			document.getElementById('inputticker')
		)).value == ''){
			document.getElementById("s-invalid-ticker").style.display = "block";
			this.isSubmitted = true;
			document.getElementById("inputticker").blur();
			return;
		}
		var t_frm_search = (<HTMLInputElement>(
			document.getElementById('inputticker')
		)).value.toUpperCase();
		this.service.getTicker(t_frm_search);
		this.isSubmitted = true;
		localStorage.setItem('tickerValue', t_frm_search);
		this.router.navigate(['search/' + t_frm_search], {
			relativeTo: this.route.parent,
		});
	}

	//sb-added
	removeActiveClass() {
		document.querySelectorAll('.nav-item').forEach((item) => {
			item.classList.remove('active');
		});
	}
}
