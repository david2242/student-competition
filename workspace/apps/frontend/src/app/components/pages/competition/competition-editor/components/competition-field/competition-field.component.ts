import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-competition-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './competition-field.component.html',
    styleUrls: ['./competition-field.component.css']
})
export class CompetitionFieldComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) id!: string;
    @Input({ required: true }) control!: FormControl;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';
    @Input() type: 'text' | 'textarea' = 'text';
    @Input() errorMessage = 'Kérem töltse ki ezt a mezőt';
}
