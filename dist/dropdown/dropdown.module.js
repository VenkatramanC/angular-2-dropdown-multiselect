import { MultiselectDropdown } from './dropdown.component';
import { MultiSelectSearchFilter } from './search-filter.pipe';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
var MultiselectDropdownModule = (function () {
    function MultiselectDropdownModule() {
    }
    return MultiselectDropdownModule;
}());
export { MultiselectDropdownModule };
MultiselectDropdownModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, FormsModule],
                exports: [MultiselectDropdown, MultiSelectSearchFilter],
                declarations: [MultiselectDropdown, MultiSelectSearchFilter],
            },] },
];
/** @nocollapse */
MultiselectDropdownModule.ctorParameters = function () { return []; };
//# sourceMappingURL=dropdown.module.js.map