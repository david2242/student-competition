import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-competition-list-field',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './competition-list-field.component.html',
    styleUrls: ['./competition-list-field.component.css']
})
export class CompetitionListFieldComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) formArray!: FormArray<FormControl>;
    @Input({ required: true }) displayMode: 'show' | 'edit' = 'show';
    @Input() inputType: 'text' | 'select' = 'text';
    @Input() options: Iterable<any> = [];
    @Input() addButtonLabel = 'Hozzáadás';
    @Input() errorMessage = 'Kérem töltse ki a mezőt';
    @Input() canDeleteFirst = false;
    @Input() emptyMessage = 'Nincs megadva adat';

    @Output() add = new EventEmitter<void>();
    @Output() remove = new EventEmitter<number>();

    get controls() {
        return this.formArray.controls;
    }

    addItem() {
        this.add.emit();
    }

    removeItem(index: number) {
        this.remove.emit(index);
    }
}
