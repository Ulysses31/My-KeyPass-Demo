import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-load',
  templateUrl: 'base.load.html',
  styleUrls: ['base.load.css']
})
export class BaseLoadComponent<T> implements OnInit {
  constructor() {
    console.log('BaseLoadComponent ctor...');
  }

  ngOnInit() {}
}
