import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalCase',
  standalone: true
})
export class CapitalCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return ''; // Maneja valores nulos o vacíos
    return value.split(' ').map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
}
