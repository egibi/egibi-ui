import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { ExchangesService } from "./exchanges.service";
import { Exchange } from "../_models/exchange.model";

@Component({
  selector: "exchanges",
  imports: [EgibiTableComponent],
  templateUrl: "./exchanges.component.html",
  styleUrl: "./exchanges.component.scss",
})
export class ExchangesComponent implements OnInit {
  exchanges: any[] = [];

  tableName: string = "Exchange Table";
  columns: string[] = ["Name", "Description"];

  constructor(private exchangesService: ExchangesService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.exchangesService.getExchanges().subscribe((res) => {
      console.log(res);
      this.exchanges = res.responseData;
      console.log('res data:');
      console.log(res.responseData);
    });
  }

  public addExchange(): void {
    this.router.navigate([`exchanges/exchange`]);
  }

  public onRowSelected(exchange:Exchange):void{
    const id = exchange.id;

    this.router.navigate([`exchanges/exchange/${id}`]);

  }
}
