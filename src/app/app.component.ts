import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardSkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { CircleX, LucideAngularModule } from 'lucide-angular';
import { GradioService } from './services/gradio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ZardCardComponent,
    ZardSkeletonComponent,
    ZardInputDirective,
    ZardButtonComponent,
    LucideAngularModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  isLoading = false;
  resultImageUrl: SafeUrl | null = null;
  error: string | null = null;
  selectedGarment: File | null = null;
  selectedModels: File[] = [];
  results: { name: string; url: SafeUrl }[] = [];
  garmentPreviewUrl: SafeUrl | null = null;
  modelPreviews: { name: string; url: SafeUrl }[] = [];
  private garmentObjectUrl: string | null = null;
  private modelObjectUrls: string[] = [];
  readonly CircleX = CircleX;

  constructor(
    private gradioService: GradioService,
    private sanitizer: DomSanitizer
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      // Revoke previous garment preview URL if present
      if (this.garmentObjectUrl) {
        URL.revokeObjectURL(this.garmentObjectUrl);
        this.garmentObjectUrl = null;
      }

      this.selectedGarment = input.files[0];
      const objUrl = URL.createObjectURL(this.selectedGarment);
      this.garmentObjectUrl = objUrl;
      this.garmentPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(objUrl);
      this.error = null; // Clear previous errors
    }
  }

  onModelsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Revoke old model object URLs
      for (const u of this.modelObjectUrls) {
        URL.revokeObjectURL(u);
      }
      this.modelObjectUrls = [];
      this.modelPreviews = [];

      this.selectedModels = Array.from(input.files);
      for (const file of this.selectedModels) {
        const u = URL.createObjectURL(file);
        this.modelObjectUrls.push(u);
        this.modelPreviews.push({ name: file.name, url: this.sanitizer.bypassSecurityTrustUrl(u) });
      }
      this.error = null;
    } else {
      this.selectedModels = [];
      // Clear previews
      for (const u of this.modelObjectUrls) {
        URL.revokeObjectURL(u);
      }
      this.modelObjectUrls = [];
      this.modelPreviews = [];
    }
  }

  async startPrediction() {
    if (!this.selectedGarment) {
      this.error = 'Please select a garment image first.';
      return;
    }

    this.isLoading = true;
    this.resultImageUrl = null;
    this.results = [];
    this.error = null;

    try {
      if (this.selectedModels.length > 0) {
        // Run sequentially across all selected models and push results as they complete
        for (const model of this.selectedModels) {
          try {
            const result = await this.gradioService.predictWithBackground(
              this.selectedGarment,
              model
            );
            const url = result && result[0] && result[0].url;
            if (url) {
              this.results.push({
                name: model.name,
                url: this.sanitizer.bypassSecurityTrustUrl(url),
              });
            } else if (result && result.error) {
              this.error = result.error;
              console.error('Error for model', model.name, result.error);
            } else {
              this.error = 'Invalid response structure from Gradio API:' + result;
              console.error('Unexpected result structure:', result);
            }
          } catch (e) {
            this.error = 'Prediction failed for model' + model.name + ':' + e;
            console.error('Prediction failed for model', model.name, e);
          }
        }
      } else {
        // Fallback: single background (default)
        const result = await this.gradioService.predict(this.selectedGarment);
        if (result && result[0] && result[0].url) {
          this.resultImageUrl = this.sanitizer.bypassSecurityTrustUrl(result[0].url);
        } else if (result.error) {
          this.error = result.error;
        } else {
          this.error = 'Invalid response structure from Gradio API:' + result;
          console.error('Unexpected result structure:', result);
        }
      }
    } catch (err) {
      this.error = 'An unexpected error occurred:' + err;
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }
 
  removeGarment(): void {
    if (this.garmentObjectUrl) {
      URL.revokeObjectURL(this.garmentObjectUrl);
      this.garmentObjectUrl = null;
    }
    this.selectedGarment = null;
    this.garmentPreviewUrl = null;
    const input = document.getElementById('garmentInput') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  removeModelAt(index: number): void {
    // Validate index
    if (index < 0 || index >= this.modelObjectUrls.length) {
      return;
    }
    
    // Revoke the object URL
    const urlToRevoke = this.modelObjectUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    // Create new arrays without the removed item
    this.modelObjectUrls = [
      ...this.modelObjectUrls.slice(0, index),
      ...this.modelObjectUrls.slice(index + 1)
    ];
    
    // Update the other arrays to maintain consistency
    this.modelPreviews = this.modelPreviews.filter((_, i) => i !== index);
    this.selectedModels = this.selectedModels.filter((_, i) => i !== index);

    // Update file input with remaining files
    const input = document.getElementById('modelsInput') as HTMLInputElement;
    if (input) {
      if (this.selectedModels.length === 0) {
        // Reset if no files left
        input.value = '';
      } else {
        // Create a new DataTransfer to hold remaining files
        const dataTransfer = new DataTransfer();
        
        // Add all remaining files to the DataTransfer
        this.selectedModels.forEach(file => {
          dataTransfer.items.add(file);
        });
        
        // Update the files of the input
        input.files = dataTransfer.files;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.garmentObjectUrl) {
      URL.revokeObjectURL(this.garmentObjectUrl);
      this.garmentObjectUrl = null;
    }
    for (const u of this.modelObjectUrls) {
      URL.revokeObjectURL(u);
    }
    this.modelObjectUrls = [];
  }
}
