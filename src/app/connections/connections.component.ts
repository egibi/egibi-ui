import { Component, Input, OnInit } from '@angular/core';
import { Connection } from '../models/connection.model';
import { ConnectionsService } from '../services/connections.service';

@Component({
  selector: 'connections',
  imports: [],
  templateUrl: './connections.component.html',
  styleUrl: './connections.component.scss'
})
export class ConnectionsComponent implements OnInit {
  @Input() connections: Connection[];

  ngOnInit(): void {
    // get connections
  }

  constructor(private connectionsService:ConnectionsService ){

  }


}


