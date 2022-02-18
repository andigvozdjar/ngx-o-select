### Info
Git repo for https://www.npmjs.com/package/ngx-o-select

### Presentation
![Gif presentation](https://raw.githubusercontent.com/andigvozdjar/ngx-o-select/master/projects/ngx-o-select/src/assets/select-presentation.gif)

## complex angular select component

> multi-values, paginated, searchable, required validation, hint, server side dataSource
> required @angular/material: ^12.2.7 - tested with it

### git https://github.com/andigvozdjar/ngx-o-select
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

### For any suggestions/help You could ask me on andigvozdjar@gmail.com