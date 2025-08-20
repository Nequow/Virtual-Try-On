import { Component } from '@angular/core';
import { TryonComponent } from './tryon/tryon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TryonComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'gradio-app';
}
