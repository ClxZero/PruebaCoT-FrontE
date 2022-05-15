import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vity Analytics';
  saludo:string = "Elija el rango de tiempo de los datos que necesita analizar";
}
