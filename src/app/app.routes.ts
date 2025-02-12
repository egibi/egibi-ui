import { Routes } from '@angular/router';
import { HomeComponent } from './main-components/home/home.component';
import { ConnectionsComponent } from './connections/connections.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent,        
    },
    {
        path: 'connections', component: ConnectionsComponent
    }
];
