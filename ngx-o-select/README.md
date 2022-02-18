### Info

Tested with angular 12, 13
required @angular/material > 12

### Presentation
![Gif presentation](https://s10.gifyu.com/images/Animation23e7afe21ef7792b7.gif)

## complex angular select component

> multi-values, paginated, searchable, required validation, hint, server side dataSource
> required @angular/material: ^12.2.7 - tested with it
## Install

```
npm i ngx-o-select --save
```


## Usage

### 1. Import NgxOSelectModule in Your module

### 2. In Ts
```
public oSelectDataSource!: OSelectOptionsSource<YourClass>;
```
```
 this.oSelectDataSource: OSelectOptionsSource<YourClass> = {
      paginate: true,
      pageSize: 15,
      store: {
        key: 'id;,
        load: (loadOptions: LoadOptions) => { ... return Observable<Page<YourClass>> },
        byKey: (id: string) => { ... return Observable<YourClass> }
      }
 }
```

### 3. In HTML
```
<o-select [label]="'Type'" displayExpr="name" valueExpr="id" name="type"
  [required]="true" [selectAll]="false" [searchEnabled]="true"
  [form]="ngForm" [(value)]="formData.type" [dataSource]="oSelectDataSource">
</o-select>
```
### 4. Result from "Presentation"

## For any suggestions/help You could ask me on andigvozdjar@gmail.com
## Localization

Default global localization

```
class SelectLocalization {
  placeholder: string = '';
  selectAll: string = 'Select all';
  clearSelection: string = 'Clear selection';
  search: string = 'Search';
  noData: string = 'No data';
  required: string = 'This field is required';
}
```

You can provide Your custom global translations with providers, in module provide SelectLocalization

example: 
```
 @NgModule({
   ...
   providers: [
     {
       provide: SelectLocalization, useValue: getSelectLocalization()
     }
     ...
   ]
   ...
 })
```
```
getSelectLocalization(): SelectLocalization {
  const local = new SelectLocalization(
    {
      clearSelection: 'clearSelection',
      noData: 'noData',
      placeholder: 'placeholder', // can be overriden with component @input
      required: 'required',
      search: 'search',
      selectAll: 'Select all'
    }
  );
  return local;
}
```

## Dynamic Localization example
```
 @NgModule({
   ...
   providers: [
    {
      provide: SelectLocalization,
      useFactory: (translate: any) => {
        const service = new OSelectIntService();
        service.injectTranslateService(translate);
        return service;
      },
      deps: [TranslateService]
    }
     ...
   ]
   ...
 })
```

```
export class OSelectIntService extends SelectLocalization {
  translate!: TranslateService;

  injectTranslateService(translate: TranslateService) {
    this.translate = translate;

    this.translate.onLangChange.subscribe(() => {
      this.translateLabels();
    });

    this.translateLabels();
  }

  translateLabels() {
    super.clearSelection = this.translate.instant('SHARED.CLEAR_SELECTION');
    super.noData = this.translate.instant('SHARED.NO_DATA');
    super.required = this.translate.instant('ERRORS.FIELD_IS_REQUIRED_ALT');
    super.search = this.translate.instant('SHARED.SEARCH');
    super.selectAll = this.translate.instant('SHARED.SELECT_ALL');
  }

}
```

## Api

| Input | required | default
| ------------- | ------------- | ------------- |
| @Input() dataSource: OSelectOptionsSource<any> | true | Data source OSelectOptionsSource |
| @Input() value: any | true | value for select |
| @Input() displayExpr: string | true | Key of T |
| @Input() placeholder: string | false | Override for SelectLocalization.placeholder |
| @Input() requiredMessage: string | false | Message in <mat-error> |
| @Input() valueExpr: string | true | key of T emitted as value |
| @Input() groupBy: string | false | key of T that groups mat option |
| @Input() ungroupedTranslation: string | false | translation of ungrouped array |
| @Input() form: string | false | For custom errorStateMatcher ( for displaying error after form is submitted and touched) |
| @Input() readOnly: boolean = false |  | Whether the component is disabled |
| @Input() required: boolean = false |  | Whether the component is required |
| @Input() selectAll: boolean = true |  | Is select all function is enabled |
| @Input() searchEnabled: boolean = false |  | Is search enabled - using for server side option |
| @Input() multiple: boolean = false |  | is value array of T[valueExpr as keyOf T] (using mat-chip-list for displaying multiple items)|
| @Input() showClearButton: boolean = true |  | is clear button available |
| @Input() name: string | false | name for input - could use for validation |
| @Input() hintMessage: string | false | message for <mat-hint> |
| @Input() appearance: MatFormFieldAppearance = 'standard' | false| appearance for mat-form-field |
| @Output() valueChange: EventEmitter<T[valueExpr as keyOf T]> | false | using for two way data binding, emits only T[valueExpr as keyOf T] |
| @Output() selectionChange: EventEmitter<T> | false | Emits full object T |

## Models
```
class SelectLocalization {
  placeholder: string = '';
  selectAll: string = 'Select all';
  clearSelection: string = 'Clear selection';
  search: string = 'Search';
  noData: string = 'No data';
  required: string = 'This field is required';
}

class OSelectOptionsSource<T> {
  paginate!: boolean;
  pageSize!: number;
  group?: string;
  store!: OSelectDataSource<T>;
}

class OSelectDataSource<T> {
  key: string; // key for getOne observable
  load: Function;
  byKey: Function;
}

Page<T> {
  content: T[];
  totalElements: number; // for hiding spinner if using pagination
  last: boolean; // for hiding spinner if using pagination
}

export class LoadOptions implements FilterInput {
  column!: string; // -> displayExpr
  value: any; // -> valueExpr
  skip?: number; // for pagination
}
```