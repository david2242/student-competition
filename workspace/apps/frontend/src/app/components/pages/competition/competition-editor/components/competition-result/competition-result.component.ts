import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-competition-result',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './competition-result.component.html',
    styleUrls: ['./competition-result.component.css']
})
export class CompetitionResultComponent {
    @Input({ required: true }) formGroup!: FormGroup;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';

    get position() {
        return this.formGroup.get('position');
    }

    get specialPrize() {
        return this.formGroup.get('specialPrize');
    }

    get compliment() {
        return this.formGroup.get('compliment');
    }

    get nextRound() {
        return this.formGroup.get('nextRound');
    }
}
