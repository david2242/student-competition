import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

type ResultFormGroup = FormGroup<{
    position: FormControl<number | null>;
    specialPrize: FormControl<boolean>;
    compliment: FormControl<boolean>;
    nextRound: FormControl<boolean>;
}>;

@Component({
  selector: 'app-competition-result',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-result.component.html',
  styleUrls: ['./competition-result.component.css']
})
export class CompetitionResultComponent {
    @Input({ required: true }) formGroup!: ResultFormGroup;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';

    get position() {
      return this.formGroup.controls.position;
    }

    get specialPrize() {
      return this.formGroup.controls.specialPrize;
    }

    get compliment() {
      return this.formGroup.controls.compliment;
    }

    get nextRound() {
      return this.formGroup.controls.nextRound;
    }
}
