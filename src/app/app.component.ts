import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutHeaderMainComponent } from "./_layout/layout-header-main/layout-header-main.component";
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutHeaderMainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'egibi-ui';
}
