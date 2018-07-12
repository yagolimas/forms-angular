import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataFormComponent } from './data-form/data-form.component';

const routes: Routes = [
  { path: 'data-form', component: DataFormComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
