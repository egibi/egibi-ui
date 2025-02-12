import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'main-header',
  imports: [RouterLink, HomeComponent ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss'
})
export class MainHeaderComponent {

}
