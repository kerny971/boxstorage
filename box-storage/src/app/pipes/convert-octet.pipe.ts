import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertOctet'
})
export class ConvertOctetPipe implements PipeTransform {

  transform(value: number, decimals: number = 2): unknown {
    if (!value) return '0 octet'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']

    const i = Math.floor(Math.log(value) / Math.log(k))

    return `${parseFloat((value / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

}
