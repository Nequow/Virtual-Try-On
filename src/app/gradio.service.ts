import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client } from '@gradio/client';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GradioService {
  private client: any;
  private readonly gradioUrl = 'https://ffe05d90ebf57db702.gradio.live';

  constructor(private http: HttpClient) {
    this.initializeClient();
  }

  public async predictWithBackground(
    garmentImage: Blob,
    backgroundImage: Blob
  ): Promise<any> {
    if (!this.client) {
      console.error('Gradio client not initialized');
      await this.initializeClient();
      if (!this.client) {
        return { error: 'Could not connect to Gradio client' };
      }
    }

    try {
      const result = await this.client.predict('/tryon', {
        dict: {
          background: backgroundImage,
          layers: [],
          composite: null,
        },
        garm_img: garmentImage,
        garment_des: 'Hello!!',
        is_checked: true,
        is_checked_crop: true,
        denoise_steps: 20,
        seed: -1,
      });

      return result.data;
    } catch (error) {
      console.error('Prediction failed:', error);
      return { error: 'Prediction failed' };
    }
  }

  private async initializeClient() {
    try {
      this.client = await Client.connect(this.gradioUrl);
      console.log('Gradio client connected');
    } catch (error) {
      console.error('Failed to connect to Gradio client:', error);
    }
  }

  public async predict(garmentImage: Blob): Promise<any> {
    if (!this.client) {
      console.error('Gradio client not initialized');
      await this.initializeClient(); // Retry connection
      if (!this.client) {
        return { error: 'Could not connect to Gradio client' };
      }
    }

    try {
      const backgroundBlob = await firstValueFrom(
        this.http.get('assets/IMG_6943.png', { responseType: 'blob' })
      );

      console.log('Sending prediction request...');
      const result = await this.client.predict('/tryon', {
        dict: {
          background: backgroundBlob,
          layers: [],
          composite: null,
        },
        garm_img: garmentImage,
        garment_des: 'Hello!!',
        is_checked: true,
        is_checked_crop: true,
        denoise_steps: 20,
        seed: -1,
      });

      console.log('Prediction result:', result.data);
      return result.data;
    } catch (error) {
      console.error('Prediction failed:', error);
      return { error: 'Prediction failed' };
    }
  }
}

