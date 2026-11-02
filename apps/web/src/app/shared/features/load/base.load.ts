import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-base-load',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'base.load.html',
  styleUrls: ['base.load.css']
})
export class BaseLoadComponent<T> implements OnInit {
  @Input({ required: false }) service!: BaseService<T>;
  @Input({ required: false }) baseForm!: FormGroup;
  @Input({ required: true }) title: string = 'Base Load Component';
  @Input({ required: true }) description: string =
    'This is the base load component description.';

  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log('BaseLoadComponent ctor...');
  }

  ngOnInit() {
    this.fetchData();
  }

  refresh(): void {
    this.fetchData();
  }

  fetchData(): void {
    const id: string = String(this.route.snapshot.params['id']);
    if (Number(id) > 0) {
      this.service && this.service.getById(id);
    }
  }

  onSubmit(serv: BaseService<T>, frm: FormGroup): void {
    const id: string = String(this.route.snapshot.params['id']);
    const formValue = frm.getRawValue();

    if (Number(id) > 0) {
      serv.update(id, formValue);
    } else {
      serv.create(formValue);
    }
  }

  onDelete(serv: BaseService<T>) {
    const id: string = String(this.route.snapshot.params['id']);
    serv && serv.delete(id);
  }

  onUpdateBadgeName(frm: FormGroup) {
    const trimmedName = String(frm.controls['Name'].value ?? '').trim();
    frm.controls['NameWithBadge'].setValue(trimmedName ? `${trimmedName} (0)` : '');
  }
}
