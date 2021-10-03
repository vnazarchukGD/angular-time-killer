import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, map, takeUntil } from 'rxjs/operators';

import { CreateProductModalFormType } from 'src/app/shared/modules/create-product-modal/create-product-modal.types';
import { ImageUrlValidator } from 'src/app/shared/modules/create-product-modal/validators/image-url.validator';

@Component({
  selector: 'tk-create-product-modal',
  templateUrl: './create-product-modal.component.html',
  styleUrls: ['./create-product-modal.component.scss']
})
export class CreateProductModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  formValues: CreateProductModalFormType;
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<CreateProductModalComponent>,
    private fb: FormBuilder,
    private imageUrlValidator: ImageUrlValidator
  ) {}

  static removeWhiteSpaces(value: string): string {
    return value.trim().replace(/(\r\n|\n|\r|\s\s+)/gm, ' ');
  }

  ngOnInit(): void {
    this.initializeForm();
    this.bindEvents();
  }

  ngOnDestroy(): void {
    this.unbindEvents();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  getErrorMessage(inputName: string): string {
    if (this.form.hasError('required', inputName)) {
      return 'You must enter a value';
    }
    switch (inputName) {
      case 'name':
        if (this.form.hasError('maxlength', inputName)) {
          return 'Name should be at most 30 characters long';
        }
        if (this.form.hasError('pattern', inputName)) {
          return 'Enter valid name';
        }
        break;
      case 'pictureUrl':
        if (this.form.hasError('url', inputName)) {
          return 'Provide valid image url';
        }
        break;
      case 'description':
        if (this.form.hasError('minlength', inputName)) {
          return 'Description should be at least 10 characters long';
        }
        if (this.form.hasError('maxlength', inputName)) {
          return 'Description should be at most 500 characters long';
        }
        if (this.form.hasError('pattern', inputName)) {
          return 'Enter valid description';
        }
        break;
      default:
        break;
    }
  }

  private initializeForm(): void {
    const textRegEx = /^[\w\n\sЁёА-я.…,:;!?()"'\/&+-]*$/;

    this.form = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.maxLength(30),
            Validators.pattern(textRegEx)
          ]
        ],
        pictureUrl: [
          '',
          [Validators.required],
          [this.imageUrlValidator.validate.bind(this.imageUrlValidator)]
        ],
        description: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(500),
            Validators.pattern(textRegEx)
          ]
        ]
      },
      { updateOn: 'blur' }
    );
  }

  private bindEvents(): void {
    this.cleanFormValues();
  }

  private cleanFormValues(): void {
    this.form.valueChanges
      .pipe(
        map((control) => ({
          name: CreateProductModalComponent.removeWhiteSpaces(control.name),
          description: CreateProductModalComponent.removeWhiteSpaces(
            control.description
          )
        })),
        takeUntil(this.destroy$)
      )
      .subscribe((sanitizedValues) => {
        this.formValues = {
          ...this.formValues,
          ...sanitizedValues
        };
      });

    this.form.statusChanges
      .pipe(
        delay(500),
        map(() => ({
          pictureUrl: !this.form.get('pictureUrl').errors
            ? this.form.value.pictureUrl
            : ''
        })),
        takeUntil(this.destroy$)
      )
      .subscribe((checkedPicUrl) => {
        this.formValues = {
          ...this.formValues,
          ...checkedPicUrl
        };
      });
  }

  private unbindEvents(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
