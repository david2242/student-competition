import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-competition-select-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './competition-select-field.component.html',
    styleUrls: ['./competition-select-field.component.css']
})
export class CompetitionSelectFieldComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) id!: string;
    @Input({ required: true }) control!: FormControl;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';
    @Input() options: { value: any, text: string }[] = [];
    @Input() placeholder = 'Válasszon!';
    @Input() errorMessage = 'Kérem válasszon egy értéket!';
}
