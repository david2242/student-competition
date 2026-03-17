import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from "@/app/models/current-user";

@Component({
    selector: 'app-competition-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './competition-header.component.html',
    styleUrl: './competition-header.component.css'
})
export class CompetitionHeaderComponent {
    @Input() location: 'top' | 'bottom' = 'top';
    @Input() mode: 'show' | 'edit' = 'show';
    @Input() id: number | null = null;
    @Input() userRole: Role = Role.VIEWER;
    @Input() isDeletable: boolean = false;
    @Input() isEditable: boolean = false;
    @Input() isLoading: boolean = false;

    @Output() delete = new EventEmitter<void>();
    @Output() edit = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();

    protected readonly Role = Role;
}
