import { Component, OnInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';  //sb-added
import { Router} from '@angular/router';  //sb-added	//, NavigationEnd 
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';	//sb-added - for modal
import { FormControl } from '@angular/forms'; //sb-added

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  moneyinWallet:any;
	pf: any;
	latestPrice: any;
	last: any = {};
	change: any = {};
	marketVal: any = {};
  isExceeding= false;
  isExceedingS= false;
  modalQty = new FormControl();
  modalQtyS = new FormControl();
  newQty: any;
  newQtyS:any;
	regex = /^\d*$/;
	modalTotal = 0.00;
  modalTotalSell = 0.00;
	modalMaxSellQty: any;
	modalContent: any;
	closeResult = '';
	isPFinLS: boolean;
	addInPf:string;
  rmInPf:string;
  constructor (
		private service : AppServiceService,
		private router: Router,
		private modalService: NgbModal
	) { }

  ngOnInit(): void {
	this.addInPf= '';
    this.rmInPf= '';
    if (localStorage.getItem('wallet')!==null){
      this.moneyinWallet = JSON.parse(localStorage.getItem("wallet"));
    }
    else{
      this.moneyinWallet = 25000.00
	  localStorage.setItem("wallet", (25000.00).toString());
    }
  	this.changeActiveClass();	//sb-added
  	if (localStorage.getItem('pf') === null) {
  		this.isPFinLS = false;
  		
  	}
  	else {
  		this.isPFinLS = true;
  	}
		if (localStorage.getItem('pf') !== null) { //portfolio exists in local storage
			
			var portfolio = Object.entries(JSON.parse(localStorage.getItem('pf')));
			let str:string;
			if(portfolio.length === 1) {
				str = portfolio[0][0];
			}
			else {
				str = portfolio[0][0];
				for(var i=1; i<portfolio.length; i++) {
					str = str+','+portfolio[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayPf(portfolio);
			});
		}
  }

  refreshPg() {
  	if (localStorage.getItem('pf') === null) {
  		this.isPFinLS = false;	
  	}
  	else {
  		this.isPFinLS = true;
  	}
  	if (localStorage.getItem('pf') !== null) { //portfolio exists in local storage
			var portfolio = Object.entries(JSON.parse(localStorage.getItem('pf')));
			let str:string;
			if(portfolio.length === 1) {
				str = portfolio[0][0];
			}
			else {
				str = portfolio[0][0];
				for(var i=1; i<portfolio.length; i++) {
					str = str+','+portfolio[i][0];
				}
			}
			this.service.getMultipleLP(str).subscribe((response) => {
				this.latestPrice = response;
				this.displayPf(portfolio);
			});
		}
  }
	
	displayPf(portfolio) {
		for(var i=0; i<this.latestPrice.length; i++) {
			var thisT = this.latestPrice[i].ticker;
			if(!(this.latestPrice[i].l)) {
				this.last[thisT] = ' -';
				this.change[thisT] = ' -';
				this.marketVal[thisT] = ' -';
			}
			else {
				this.last[thisT] = this.latestPrice[i].c;
			}
		}
		for(var i=0; i<portfolio.length; i++) {
			var thisT = portfolio[i][0];
			if(this.last[thisT]!==' -') {
				this.change[thisT] = (parseFloat(this.last[thisT]) - parseFloat(portfolio[i][1].avgC)).toFixed(2);
				this.marketVal[thisT] = (parseFloat(this.last[thisT]) * parseInt(portfolio[i][1].qty)).toFixed(2);
				this.last[thisT] = this.last[thisT].toFixed(2);
			}
		}
		this.pf = portfolio;
	}

	openDetails(ticker) {
		this.router.navigate(['search/'+ticker]); // , {relativeTo: this.route}
	}

	openBuyModal(buycontent, thisTicker) {
		this.modalQty.setValue(0);
		this.modalContent = { 'ticker': thisTicker, 'last': this.last[thisTicker] };
		
		this.modalService.open(buycontent, {ariaLabelledBy: 'modal-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    //to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("buyQty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById("buyQty")).setSelectionRange(1,1); 
		(<HTMLInputElement>document.getElementById("buyQty")).setAttribute('type', 'number');
		
		document.getElementById('buyQty').addEventListener('input', (e) => {
			this.newQty = (<HTMLTextAreaElement>e.target).value;
			this.modalTotal = Math.round((parseFloat(this.newQty) * parseFloat(this.last[thisTicker]))*100)/100;
      if(this.modalTotal>this.moneyinWallet){
        this.isExceeding = true;
      }
      else{
        this.isExceeding = false;
      }
		});
		(<HTMLInputElement>document.getElementById("finalBuy")).addEventListener('click', (e) => {
			this.buyStock(this.modalTotal,thisTicker);
		});
	}

	openSellModal(sellcontent, thisTicker) {
		this.modalQtyS.setValue(0);
		this.modalContent = { 'ticker': thisTicker, 'last': this.last[thisTicker] };
		
		this.modalService.open(sellcontent, {ariaLabelledBy: 'modal-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    //to put cursor at the end of default value 0
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'text');
		(<HTMLInputElement>document.getElementById("sellQty")).setSelectionRange(1,1); 
		(<HTMLInputElement>document.getElementById("sellQty")).setAttribute('type', 'number');

		this.modalMaxSellQty = (JSON.parse(localStorage.getItem('pf')))[thisTicker].qty;
		
		document.getElementById('sellQty').addEventListener('input', (e) => {
			this.newQtyS = (<HTMLTextAreaElement>e.target).value;
			this.modalTotalSell = Math.round((parseFloat(this.newQtyS) * parseFloat(this.last[thisTicker]))*100)/100;
			if(parseFloat(this.newQtyS)>parseFloat(this.modalMaxSellQty)){
				this.isExceedingS = true;
			  }
			  else{
				this.isExceedingS = false;
			  }
		});
		(<HTMLInputElement>document.getElementById("finalSell")).addEventListener('click', (e) => {
			this.sellStock(thisTicker);
		});
	}

	buyStock(newTot,thisTicker) {
		this.moneyinWallet -= this.modalTotal;
		let pf = JSON.parse(localStorage.getItem('pf'));
		localStorage.removeItem('pf');
		pf[thisTicker].qty = parseInt(pf[thisTicker].qty) + parseInt(this.newQty);
		pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) + parseFloat(newTot);
		pf[thisTicker].avgC = (parseFloat(pf[thisTicker].totC)/parseInt(pf[thisTicker].qty));
		localStorage.setItem('pf', JSON.stringify(pf));
		localStorage.setItem('wallet',this.moneyinWallet.toString());
		this.autoDisappearAlert('addPf',thisTicker)
		this.refreshPg();
	}

	sellStock(thisTicker) {
		let pf = JSON.parse(localStorage.getItem('pf'));
    this.moneyinWallet += (parseFloat(pf[thisTicker].avgC) * parseInt(this.newQtyS));;
		
		localStorage.removeItem('pf');
		if(parseInt(this.newQtyS) === parseInt(pf[thisTicker].qty)) {
			document.getElementById("pfcard"+thisTicker).style.display = "none";
			if(Object.keys(pf).length === 1) {
				this.isPFinLS = false;
				localStorage.setItem('wallet',this.moneyinWallet.toString());
				this.autoDisappearAlert('rmPf',thisTicker);
				return;
			}
			else {
				delete pf[thisTicker];
			}
		}
		else {
			pf[thisTicker].qty = parseInt(pf[thisTicker].qty) - parseInt(this.newQtyS);
			pf[thisTicker].totC = parseFloat(pf[thisTicker].totC) - (parseFloat(pf[thisTicker].avgC) * parseInt(this.newQtyS));
		}
		localStorage.setItem('pf', JSON.stringify(pf));
		localStorage.setItem('wallet',this.moneyinWallet.toString());
		this.autoDisappearAlert('rmPf',thisTicker);
		this.refreshPg();
	}
	autoDisappearAlert(id,ticker) {
		
		if (id === 'rmPf') {
		  this.rmInPf = ticker;
		  setTimeout(() => {
			this.rmInPf = '';
		  }, 5000);
		}
		if (id === 'addPf') {
		  this.addInPf = ticker;
		  setTimeout(() => {
			this.addInPf = '';
		  }, 5000);
		}
	  }
	
	  closeAlert(id) {
		
		if (id === 'rmPf') {
		  this.rmInPf = '';
		  
		}
		if (id === 'addPf') {
		  this.addInPf = '';
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

  changeActiveClass() { //sb-added
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById('portfolio').classList.add('active');
  }

}
