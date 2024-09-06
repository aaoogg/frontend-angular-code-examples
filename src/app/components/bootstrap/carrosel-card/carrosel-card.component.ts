import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-carroselcard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrosel-card.component.html',
  styleUrls: ['./carrosel-card.component.css']
})

export class CarroselcardComponent implements OnInit, AfterViewInit {
  @Input() carouselId: string = '';
  @Input() cards: { image: string, title: string, text: string }[] = [];
  @Input() autoplay: boolean = false;

  pages: any[] = [];

  ngOnInit() {
    this.updatePages();
    window.addEventListener('resize', this.updatePages.bind(this));
  }

  ngAfterViewInit() {
    const carouselElement = document.getElementById(this.carouselId);
    if (carouselElement) {
      const carousel = new (window as any).bootstrap.Carousel(carouselElement, {
        interval: this.autoplay ? 5000 : false, // 5000 ms (5 segundos) para autoplay
        ride: this.autoplay ? 'carousel' : false // Inicia o carrossel se autoplay estiver ativado
      });
    }
  }

  updatePages() {
    const screenWidth = window.innerWidth;
    let chunkSize = 4;

    if (screenWidth <= 676) {
      chunkSize = 1;
    } else if (screenWidth <= 992) {
      chunkSize = 2;
    }

    this.pages = this.chunkArray(this.cards, chunkSize);
  }

  chunkArray(arr: any[], chunkSize: number) {
    let result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
}
