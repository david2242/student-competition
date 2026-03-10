import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-competition-checkbox-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './competition-checkbox-field.component.html',
    styleUrls: ['./competition-checkbox-field.component.css']
})
export class CompetitionCheckboxFieldComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) id!: string;
    @Input({ required: true }) control!: FormControl;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';

    @Output() toggle = new EventEmitter<boolean>();

    onToggle(checked: boolean) {
        this.toggle.emit(checked);
    }
}
