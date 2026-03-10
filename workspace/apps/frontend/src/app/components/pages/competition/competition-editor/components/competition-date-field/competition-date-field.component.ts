import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrDirective, provideFlatpickrDefaults } from 'angularx-flatpickr';
import { Hungarian } from 'flatpickr/dist/l10n/hu.js';

@Component({
    selector: 'app-competition-date-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FlatpickrDirective],
    templateUrl: './competition-date-field.component.html',
    styleUrls: ['./competition-date-field.component.css'],
    providers: [provideFlatpickrDefaults({
        altFormat: 'Y.m.d.',
        allowInput: true,
        locale: Hungarian
    })]
})
export class CompetitionDateFieldComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) id!: string;
    @Input({ required: true }) control!: FormControl;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';
    @Input() placeholder = 'ÉÉÉÉ.HH.NN';
}
