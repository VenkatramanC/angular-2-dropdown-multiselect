/*
 * Angular 2 Dropdown Multiselect for Bootstrap
 *
 * Simon Lindh
 * https://github.com/softsimon/angular-2-dropdown-multiselect
 */
import { MultiSelectSearchFilter } from './search-filter.pipe';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, IterableDiffers, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
var MULTISELECT_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return MultiselectDropdown; }),
    multi: true
};
var MultiselectDropdown = (function () {
    function MultiselectDropdown(element, differs) {
        this.element = element;
        this.disabled = false;
        this.selectionLimitReached = new EventEmitter();
        this.dropdownClosed = new EventEmitter();
        this.dropdownOpened = new EventEmitter();
        this.onAdded = new EventEmitter();
        this.onRemoved = new EventEmitter();
        this.onPageFilter = new EventEmitter();
        this.numSelected = 0;
        this.isVisible = false;
        this.searchFilterText = '';
        this.defaultSettings = {
            pullRight: false,
            enableSearch: false,
            checkedStyle: 'checkboxes',
            buttonClasses: 'btn btn-default btn-secondary',
            containerClasses: 'dropdown-inline',
            selectionLimit: 0,
            closeOnSelect: false,
            autoUnselect: false,
            showCheckAll: false,
            showUncheckAll: false,
            fixedTitle: false,
            dynamicTitleMaxItems: 3,
            maxHeight: '300px',
            totalItems: 0,
            itemsPerPage: 0,
            showPagingInfo: false,
            searchButtonClasses: 'btn btn-xs app-btn-primary',
            searchGlyphiconClasses: 'fa fa-filter',
            uncheckAllOnReload: false
        };
        this.defaultTexts = {
            checkAll: 'Check all',
            uncheckAll: 'Uncheck all',
            checked: 'checked',
            checkedPlural: 'checked',
            searchPlaceholder: 'Search...',
            defaultTitle: 'Select',
            allSelected: 'All selected',
            findHelpText: 'Use Find to locate within all records.'
        };
        this.onModelChange = function (_) { };
        this.onModelTouched = function () { };
        this.differ = differs.find([]).create(null);
    }
    MultiselectDropdown.prototype.onClick = function (target) {
        if (!this.isVisible)
            return;
        var parentFound = false;
        while (target != null && !parentFound) {
            if (target === this.element.nativeElement) {
                parentFound = true;
            }
            target = target.parentElement;
        }
        if (!parentFound) {
            this.isVisible = false;
            this.dropdownClosed.emit();
        }
    };
    MultiselectDropdown.prototype.getItemStyle = function (option) {
        if (!option.isLabel) {
            return { 'cursor': 'pointer' };
        }
    };
    MultiselectDropdown.prototype.ngOnInit = function () {
        this.settings = Object.assign(this.defaultSettings, this.settings);
        this.texts = Object.assign(this.defaultTexts, this.texts);
        this.title = this.texts.defaultTitle || '';
    };
    MultiselectDropdown.prototype.ngOnChanges = function (changes) {
        if (changes['options']) {
            this.options = this.options || [];
            this.parents = this.options
                .filter(function (option) { return typeof option.parentId === 'number'; })
                .map(function (option) { return option.parentId; });
        }
        if (changes['options'] && !changes['options'].isFirstChange()) {
            if (this.settings.uncheckAllOnReload) {
                this.uncheckAll();
            }
        }
        if (changes['texts'] && !changes['texts'].isFirstChange()) {
            this.updateTitle();
        }
    };
    MultiselectDropdown.prototype.writeValue = function (value) {
        if (value !== undefined && value !== null) {
            this.model = value;
        }
        else {
            this.model = [];
        }
    };
    MultiselectDropdown.prototype.registerOnChange = function (fn) {
        this.onModelChange = fn;
    };
    MultiselectDropdown.prototype.registerOnTouched = function (fn) {
        this.onModelTouched = fn;
    };
    MultiselectDropdown.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    MultiselectDropdown.prototype.ngDoCheck = function () {
        var changes = this.differ.diff(this.model);
        if (changes) {
            this.updateNumSelected();
            this.updateTitle();
        }
    };
    MultiselectDropdown.prototype.validate = function (_c) {
        return (this.model && this.model.length) ? null : {
            required: {
                valid: false,
            },
        };
    };
    MultiselectDropdown.prototype.registerOnValidatorChange = function (_fn) {
        throw new Error('Method not implemented.');
    };
    MultiselectDropdown.prototype.clearSearch = function (event) {
        event.stopPropagation();
        this.searchFilterText = '';
    };
    MultiselectDropdown.prototype.toggleDropdown = function () {
        this.isVisible = !this.isVisible;
        this.isVisible ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
    };
    MultiselectDropdown.prototype.isSelected = function (option) {
        return this.model && this.model.indexOf(option.id) > -1;
    };
    MultiselectDropdown.prototype.setSelected = function (_event, option) {
        var _this = this;
        _event.stopPropagation();
        if (!this.model) {
            this.model = [];
        }
        var index = this.model.indexOf(option.id);
        if (index > -1) {
            this.model.splice(index, 1);
            this.onRemoved.emit(option.id);
            var parentIndex = option.parentId && this.model.indexOf(option.parentId);
            if (parentIndex >= 0) {
                this.model.splice(parentIndex, 1);
                this.onRemoved.emit(option.parentId);
            }
            else if (this.parents.indexOf(option.id) > -1) {
                var childIds_1 = this.options.filter(function (child) { return _this.model.indexOf(child.id) > -1 && child.parentId == option.id; }).map(function (child) { return child.id; });
                this.model = this.model.filter(function (id) { return childIds_1.indexOf(id) < 0; });
                childIds_1.forEach(function (childId) { return _this.onRemoved.emit(childId); });
            }
        }
        else {
            if (this.settings.selectionLimit === 0 || (this.settings.selectionLimit && this.model.length < this.settings.selectionLimit)) {
                this.model.push(option.id);
                this.onAdded.emit(option.id);
                if (option.parentId) {
                    var children = this.options.filter(function (child) { return child.id !== option.id && child.parentId == option.parentId; });
                    if (children.every(function (child) { return _this.model.indexOf(child.id) > -1; })) {
                        this.model.push(option.parentId);
                        this.onAdded.emit(option.parentId);
                    }
                }
                else if (this.parents.indexOf(option.id) > -1) {
                    var children = this.options.filter(function (child) { return _this.model.indexOf(child.id) < 0 && child.parentId == option.id; });
                    children.forEach(function (child) {
                        _this.model.push(child.id);
                        _this.onAdded.emit(child.id);
                    });
                }
            }
            else {
                if (this.settings.autoUnselect) {
                    this.model.push(option.id);
                    this.onAdded.emit(option.id);
                    var removedOption = this.model.shift();
                    this.onRemoved.emit(removedOption);
                }
                else {
                    this.selectionLimitReached.emit(this.model.length);
                    return;
                }
            }
        }
        if (this.settings.closeOnSelect) {
            this.toggleDropdown();
        }
        this.model = this.model.slice();
        this.onModelChange(this.model);
        this.onModelTouched();
    };
    MultiselectDropdown.prototype.updateNumSelected = function () {
        var _this = this;
        this.numSelected = this.model && this.model.filter(function (id) { return _this.parents.indexOf(id) < 0; }).length || 0;
    };
    MultiselectDropdown.prototype.updateTitle = function () {
        var _this = this;
        if (this.numSelected === 0 || this.settings.fixedTitle) {
            this.title = this.texts.defaultTitle || '';
        }
        else if (this.settings.displayAllSelectedText && this.model.length === this.options.length) {
            this.title = this.texts.allSelected || '';
        }
        else if (this.settings.dynamicTitleMaxItems && this.settings.dynamicTitleMaxItems >= this.numSelected) {
            this.title = this.options
                .filter(function (option) {
                return _this.model && _this.model.indexOf(option.id) > -1;
            })
                .map(function (option) { return option.name; })
                .join(', ');
        }
        else {
            this.title = this.numSelected
                + ' '
                + (this.numSelected === 1 ? this.texts.checked : this.texts.checkedPlural);
        }
    };
    MultiselectDropdown.prototype.searchFilterApplied = function () {
        return !this.settings.showPagingInfo && this.settings.enableSearch && this.searchFilterText && this.searchFilterText.length > 0;
    };
    MultiselectDropdown.prototype.checkAll = function () {
        var _this = this;
        var checkedOptions = (!this.searchFilterApplied() ? this.options :
            (new MultiSelectSearchFilter()).transform(this.options, this.searchFilterText))
            .filter(function (option) {
            if (_this.model.indexOf(option.id) === -1) {
                _this.onAdded.emit(option.id);
                return true;
            }
            return false;
        }).map(function (option) { return option.id; });
        this.model = this.model.concat(checkedOptions);
        this.onModelChange(this.model);
        this.onModelTouched();
    };
    MultiselectDropdown.prototype.uncheckAll = function () {
        var _this = this;
        var unCheckedOptions = (!this.searchFilterApplied() ? this.model
            : (new MultiSelectSearchFilter()).transform(this.options, this.searchFilterText).map(function (option) { return option.id; }));
        this.model = this.model.filter(function (id) {
            if (unCheckedOptions.indexOf(id) < 0) {
                return true;
            }
            else {
                _this.onRemoved.emit(id);
                return false;
            }
        });
        this.onModelChange(this.model);
        this.onModelTouched();
    };
    MultiselectDropdown.prototype.preventCheckboxCheck = function (event, option) {
        if (this.settings.selectionLimit && !this.settings.autoUnselect &&
            this.model.length >= this.settings.selectionLimit &&
            this.model.indexOf(option.id) === -1) {
            event.preventDefault();
        }
    };
    MultiselectDropdown.prototype.runPagingFilter = function (event) {
        this.onPageFilter.emit(this.searchFilterText);
    };
    return MultiselectDropdown;
}());
export { MultiselectDropdown };
MultiselectDropdown.decorators = [
    { type: Component, args: [{
                selector: 'ss-multiselect-dropdown',
                template: '<div class="dropdown" [ngClass]="settings.containerClasses" [class.open]="isVisible"><button type="button" class="dropdown-toggle" [ngClass]="settings.buttonClasses" (click)="toggleDropdown()" [disabled]="disabled">{{ title }}<span class="caret"></span></button><ul *ngIf="isVisible" class="dropdown-menu" [class.pull-right]="settings.pullRight" [class.dropdown-menu-right]="settings.pullRight" [style.max-height]="settings.maxHeight" style="display: block; height: auto; overflow-y: auto"><li class="dropdown-item search" *ngIf="settings.enableSearch"><div class="input-group input-group-sm"><span class="input-group-addon" id="sizing-addon3"><i class="fa fa-search"></i></span> <input type="text" class="form-control" placeholder="{{ texts.searchPlaceholder }}" aria-describedby="sizing-addon3" [(ngModel)]="searchFilterText" [ngModelOptions]="{standalone: true}" autofocus> <span class="input-group-btn" *ngIf="searchFilterText.length > 0"><button class="btn btn-default btn-secondary" type="button" (click)="clearSearch($event)"><i class="fa fa-times"></i></button> </span><span *ngIf="settings.showPagingInfo" class="input-group-btn"><button [ngClass]="settings.searchButtonClasses" (click)="runPagingFilter()" type="submit" title="Run Filter"><span [ngClass]="settings.searchGlyphiconClasses"></span></button></span></div><h6 [ngClass]="settings.pageInfoClasses" *ngIf="settings.showPagingInfo && settings.totalItems > 0"><small><strong>{{ settings.itemsPerPage > settings.totalItems ? settings.totalItems : settings.itemsPerPage}} of {{settings.totalItems}} displayed.</strong><br>{{texts.findHelpText}} </small></h6></li><li class="dropdown-divider divider" *ngIf="settings.enableSearch"></li><li class="dropdown-item check-control check-control-check" *ngIf="settings.showCheckAll"><a href="javascript:;" role="menuitem" tabindex="-1" (click)="checkAll()"><span style="width: 16px" [ngClass]="{\'glyphicon glyphicon-ok\': settings.checkedStyle !== \'fontawesome\',\'fa fa-check\': settings.checkedStyle === \'fontawesome\'}"></span> {{ texts.checkAll }}</a></li><li class="dropdown-item check-control check-control-uncheck" *ngIf="settings.showUncheckAll"><a href="javascript:;" role="menuitem" tabindex="-1" (click)="uncheckAll()"><span style="width: 16px" [ngClass]="{\'glyphicon glyphicon-remove\': settings.checkedStyle !== \'fontawesome\',\'fa fa-times\': settings.checkedStyle === \'fontawesome\'}"></span> {{ texts.uncheckAll }}</a></li><li *ngIf="settings.showCheckAll || settings.showUncheckAll" class="dropdown-divider divider"></li><li class="dropdown-item" [ngStyle]="getItemStyle(option)" *ngFor="let option of options | searchFilter:searchFilterText" (click)="!option.isLabel && setSelected($event, option)" [class.dropdown-header]="option.isLabel"><ng-template [ngIf]="option.isLabel">{{ option.name }}</ng-template><a *ngIf="!option.isLabel" href="javascript:;" role="menuitem" tabindex="-1" [style.padding-left]="this.parents.length>0&&this.parents.indexOf(option.id)<0&&\'30px\'"><input *ngIf="settings.checkedStyle === \'checkboxes\'" type="checkbox" [checked]="isSelected(option)" (click)="preventCheckboxCheck($event, option)"> <span *ngIf="settings.checkedStyle === \'glyphicon\'" style="width: 16px" class="glyphicon" [class.glyphicon-ok]="isSelected(option)"></span> <span *ngIf="settings.checkedStyle === \'fontawesome\'" style="width: 16px;display: inline-block"><i *ngIf="isSelected(option)" class="fa fa-check" aria-hidden="true"></i> </span><span [ngClass]="settings.itemClasses" [style.font-weight]="this.parents.indexOf(option.id)>=0?\'bold\':\'normal\'">{{ option.name }}</span></a></li></ul></div>',
                styles: ['a {  outline: none !important;}.dropdown-inline {  display: inline-block;}.dropdown-toggle .caret {  margin-left: 4px;  white-space: nowrap;  display: inline-block;}'],
                providers: [MULTISELECT_VALUE_ACCESSOR]
            },] },
];
/** @nocollapse */
MultiselectDropdown.ctorParameters = function () { return [
    { type: ElementRef, },
    { type: IterableDiffers, },
]; };
MultiselectDropdown.propDecorators = {
    'options': [{ type: Input },],
    'settings': [{ type: Input },],
    'texts': [{ type: Input },],
    'disabled': [{ type: Input },],
    'selectionLimitReached': [{ type: Output },],
    'dropdownClosed': [{ type: Output },],
    'dropdownOpened': [{ type: Output },],
    'onAdded': [{ type: Output },],
    'onRemoved': [{ type: Output },],
    'onPageFilter': [{ type: Output },],
    'onClick': [{ type: HostListener, args: ['document: click', ['$event.target'],] },],
};
//# sourceMappingURL=dropdown.component.js.map