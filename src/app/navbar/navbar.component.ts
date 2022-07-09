import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppServiceService } from '../app-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() isSearched: any;
  @Input() tickerValue: any;
  public isCollapsed: boolean = true;
  constructor(private route: ActivatedRoute, private router: Router, private service: AppServiceService) { }

  ngOnInit(): void {
  }

  setIsCollapsedTrue(pageName: string, event: Event) { //sb-added
    event.preventDefault();
    this.router.navigate([pageName], {relativeTo: this.route});
    this.isCollapsed = true;
  }
}
