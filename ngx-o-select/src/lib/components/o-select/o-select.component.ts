import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { Subscription, BehaviorSubject, fromEvent } from 'rxjs';
import { take, distinctUntilChanged, map, filter, debounceTime } from 'rxjs/operators';

import { OSelectOptionsSource, LoadOptions, Page, SelectLocalization } from '../../models/shared.models';

@Component({
  selector: 'o-select',
  templateUrl: './o-select.component.html',
  styleUrls: ['./o-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OSelectComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSelect, { static: false }) select!: MatSelect;
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

  @Input() dataSource!: OSelectOptionsSource<any>;
  @Input() displayExpr!: string;
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() requiredMessage?: string;
  @Input() displayFunc?: Function;

  @Input() valueExpr!: string;
  @Input() groupBy!: string;
  @Input() ungroupedTranslation!: string;
  @Input() form!: NgForm; // using for displaying error - matcher
  @Input() readOnly: boolean = false;
  @Input() required: boolean = false;
  @Input() selectAll: boolean = true;
  @Input() searchEnabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() showClearButton: boolean = true;
  @Input() name!: string; // requred for commparison in base form for pendingChanges feature
  @Input() hintMessage?: string;
  @Input() appearance: MatFormFieldAppearance = 'standard';
  // @Input() open: boolean = false;
  @Input() value: any;

  @Output() valueChange = new EventEmitter<any>(); // this is for two way dataBinding, it must be named like this
  @Output() selectionChange = new EventEmitter<any>(); // returns full object

  viewValues: any = []; // for chips

  public previousValue: any;
  public page?: Page<any>;
  public groupedContent: any = []; // for displaying groups in HTML
  public hideSpinner: boolean = false;
  public showSelectedValue: boolean = false;
  public showNoData: boolean = false;
  public selectAllKey: string = 'selectAll';
  public matcher!: SelectBoxWithFormInputErrorMatcher;

  public inputSubscribtion?: Subscription;
  public loadOptionsSubscribtion?: Subscription;
  public loadOptions!: BehaviorSubject<LoadOptions>;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  private TEXT_INPUT_MIN_LENGTH: number = 2;
  private TEXT_INPUT_DEBOUNCE: number = 400;

  constructor(@Inject(SelectLocalization) public selectLocalization?: SelectLocalization) { }

  ngOnInit(): void {
    this.matcher = new SelectBoxWithFormInputErrorMatcher(this.form);
    this.loadOptions = new BehaviorSubject<LoadOptions>({ ...new LoadOptions(), column: this.displayExpr });
    this.setInitialValues();
    this.selectLocalization = new SelectLocalization(this.selectLocalization);
    this.label = this.label ?? this.name;
    this.placeholder = this.placeholder ?? this.selectLocalization.placeholder;    
  }

  ngAfterViewInit() {
    this.subscribeToSelectionChange();
    this.checkRequiredFields([this.name, this.dataSource]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.viewValues.length > 0 && typeof this.viewValues[0] === "string") {
      if (!this.multiple)
        this.getById();
      else
        this.getByIdForMultiple();
    }
  }

  private getData(loadOptions: LoadOptions) {
    this.dataSource.store.load(loadOptions)
      .pipe(take(1))
      .subscribe((value: Page<any>) => {
        let oldContent = this.page?.content;
        this.page = { ...value, content: loadOptions.value ? value.content : [...oldContent || [], ...value.content] };
        this.page.content = this.page.content.filter((item: any, index: number, self: any) => index === self.findIndex((t: any) => t[this.valueExpr] === item[this.valueExpr]));

        if(this.dataSource.paginate) {
          this.showNoData = value.totalElements === 0;
          this.hideSpinner = !this.dataSource.paginate || (value.totalPages === 1 || value.totalElements === 0 || value.last || false);
        }
        else if(!this.dataSource.paginate && this.groupBy) {
          this.groupedContent = this.prepareGroups(this.page.content);
          this.showNoData = value.content.length == 0;
          this.hideSpinner = true;
        }
        else
          this.hideSpinner = true;          
      });
  }

  prepareGroups(array: any[]) {
    let groups: any[] = [];

    array.forEach(item => {
      if (!item[this.groupBy])
        item[this.groupBy] = this.ungroupedTranslation;

      let index = groups.findIndex(group => group.group === item[this.groupBy])
      if (index > -1) {
        groups[index].items.push(item);
      } else {
        groups.push({
          group: item[this.groupBy] as string,
          items: [item]
        })
      }
    });
    
    return groups;
  }


  public getByIdForMultiple() {
    let initialViewValuesLength = this.viewValues.length;
    this.viewValues.forEach((value: string, index: number) => {
      this.dataSource.store.byKey(value)
        .pipe(take(1))
        .subscribe((response: any) => {
          this.value =  this.value ? [...this.value, response[this.valueExpr]] : [response[this.valueExpr]];
          
          if (this.page?.content) {
            this.viewValues = [...this.page.content, response];
            this.page = { content: [...this.page.content, response] };
          }
          else {
            this.viewValues = [response];
            this.page = { content: [response] };
          }

          if (index === initialViewValuesLength - 1) {
            setTimeout(() => this.valueChange.emit(this.value));
          }
        });
    })
  }

  private setInitialValues() {
    if (this.value) { // if edit
      this.viewValues.push(this.value);
      if (!this.multiple) {
        this.value = this.value[this.valueExpr];
        this.page = { content: this.viewValues };
      }
      else {
        this.viewValues = this.value;
        this.value = this.value.filter((v: any) => v[this.valueExpr] != null).map((v: any) => v[this.valueExpr]);
      }
      setTimeout(() => this.valueChange.emit(this.value)); // set form value for in model
    }
  }

  public getById() {
    this.dataSource.store.byKey(this.viewValues[0])
      .pipe(take(1))
      .subscribe((response: any) => {
        this.page = { content: [response] };
        this.value = response[this.valueExpr];
        this.viewValues = [response];
        setTimeout(() => this.valueChange.emit(this.value));
      });
  }

  private subscribeToLoadOptions() {
    if (!this.loadOptionsSubscribtion)
      this.loadOptionsSubscribtion =
        this.loadOptions
          .pipe(distinctUntilChanged())
          .subscribe((data: LoadOptions) => this.getData(data));
  }

  private focusInput() {
    setTimeout(() => {
      if (this.searchEnabled && this.searchInput)
        this.searchInput.nativeElement.focus();
    }, 100);
  }

  resetInputValue() {
    this.loadOptions.next({ ...new LoadOptions(), column: this.displayExpr });
    this.inputSubscribtion?.unsubscribe();
    this.inputSubscribtion = undefined;
  }

  public subscribeToSearchInput() {
    if (!this.searchEnabled || this.inputSubscribtion?.closed === false) return;
    setTimeout(() => {
      this.inputSubscribtion =
        fromEvent(this.searchInput?.nativeElement, 'keyup')
          .pipe(
            map((event: any) => event?.target?.value)
            , filter((res: any) => res?.length > this.TEXT_INPUT_MIN_LENGTH || res?.length === 0)
            , debounceTime(this.TEXT_INPUT_DEBOUNCE)
            , distinctUntilChanged((prev: any, curr: any) => prev == curr)
          ).subscribe((value: string) => {
            this.loadOptions.next({ ...this.loadOptions.getValue(), value, column: this.displayExpr, skip: 0 });
          })
    }, 100);
  }

  private subscribeToSelectionChange() {
    this.select.selectionChange
      .subscribe((value: MatSelectChange) => {
        this.value = value?.value?.includes(undefined) ? null : value.value;

        this.selectionChange.emit(
          this.multiple ? 
          this.page?.content.filter((item: any) => item[this.valueExpr] === value.value) : // TODO: Provjeriti za multiple je li radi kako treba
          this.page?.content.find((item: any) => item[this.valueExpr] === value.value)
        );

        if (this.multiple) {
          if(this.value) {
            this.viewValues = this.viewValues.filter((vv: any) => this.value.includes(vv[this.displayExpr]));
            this.value.forEach((e: any) => {
              if (this.viewValues.findIndex((v: any) => v[this.valueExpr] === e) != -1) return;
              this.viewValues.push(this.page?.content.find((pg: any) => pg[this.valueExpr] == e))
            });
          }
          else
            this.viewValues = [];
        }
        this.valueChange.emit(this.value);
      })

    this.select.openedChange
      .subscribe((value: boolean) => {
        if (value) {
          this.subscribeToSearchInput();
          this.focusInput();
          this.registerPanelScrollEvent()
          this.subscribeToLoadOptions();
        } else
          this.inputSubscribtion?.unsubscribe();
      })
  }

  registerPanelScrollEvent() {
    this.select.panel.nativeElement.addEventListener('scroll', (event: any) => {
      let offset = 0.4;
      let lastPage = (this.loadOptions.getValue().skip || 0) / this.dataSource.pageSize;

      if (event && event.target && this.dataSource.paginate)
        if (event.target.scrollTop > (event.target.children[2].clientHeight * this.dataSource.pageSize * (lastPage + 1) * offset)) {
          this.loadOptions.next({ ...this.loadOptions.getValue(), skip: (this.loadOptions.getValue().skip || 0) + this.dataSource.pageSize })
      }
    });
  }

  removeSelectedItem(valueExp: string) {
    this.viewValues = this.viewValues.filter(
      (i: any) => i[this.valueExpr] !== valueExp
    )
    this.value = this.value.filter(
      (i: any) => i !== valueExp
    )
    this.valueChange.emit(this.value);
  }

  checkRequiredFields(requiredInputs: any[] = []) {
    requiredInputs
      .filter(item => !item)
      .forEach(() => alert(`Required @Input/s is missing in select component`));
  }
}
class SelectBoxWithFormInputErrorMatcher implements ErrorStateMatcher {
  ngForm: NgForm;
  constructor(newForm: NgForm) {
    this.ngForm = newForm || null;
  }
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched) || (this.ngForm?.submitted && control?.invalid));
  }
}