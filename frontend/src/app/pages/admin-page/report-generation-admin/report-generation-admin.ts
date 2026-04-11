import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-generation-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-generation-admin.html',
  styleUrl: './report-generation-admin.css',
})
export class ReportGenerationAdmin {
  dateStart = '';
  dateEnd = '';
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  get dateRangeValid(): boolean {
    return !!this.dateStart && !!this.dateEnd && this.dateStart <= this.dateEnd;
  }

  generateReport(): void {
    this.errorMessage = '';

    if (!this.dateRangeValid) {
      this.errorMessage = 'Seleccione un rango de fechas válido.';
      return;
    }

    this.isLoading = true;

    const payload = {
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
    };

    this.http.post('/api/administrator/generate-report', payload, {
      responseType: 'blob' as const,
      headers: {
        Accept: 'application/pdf',
      },
    }).subscribe({
      next: (response) => {
        const fileName = 'ReporteFinal.pdf';
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.errorMessage = error?.error || 'Error al generar el reporte.';
        console.error('Report generation error:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
