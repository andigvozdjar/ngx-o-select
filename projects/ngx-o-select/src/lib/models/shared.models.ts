export class OSelectOptionsSource<T> {
  paginate!: boolean;
  pageSize!: number;
  group?: string;
  store!: OSelectDataSource<T>;
}

export class OSelectDataSource<T> {
  key: string;
  load: Function;
  byKey: Function;

  constructor(load: Function, byKey: Function, key: string = 'id') {
    this.key = key;
    this.load = load;
    this.byKey = byKey;
  }
}

export interface Page<T> {
    content: T[],
    last?: boolean,
    totalElements?: number
}

export class LoadOptions implements FilterInput {
  column!: string; // -> displayExpr
  value: any; // -> valueExpr
  operation!: SearchOperations;
  skip?: number;
}

export enum SearchOperations {
  EQUALITY = '::',
  NEGATION = '!!',
  GREATER_THAN = '>>',
  GREATER_THAN_OR_EQUAL = '~:',
  LESS_THAN = '<<',
  LESS_THAN_OR_EQUAL = ':~',
  LENGTH = '~;',
  LIKE = '~~',
  NOT_LIKE = '~!',
  START_WITH = '~<',
  END_WITH = '~>',
  IN = '><',
  SPLIT_JOIN_OPERATOR = '__',
  SPLIT_SINGLE_OPERATION = ';;',
  LEFT_PARENTHESES_READABLE = '((',
  RIGHT_PARENTHESES_READABLE = '))',
  KEY_AND = '-AND-',
  KEY_OR = '-OR-',
  KEY_NULL = 'NULL',
  KEY_SEARCH = 'search'
}

export class FilterInput {
  column!: string | FilterInput[];
  value!: string | FilterInput[];
  operation!: SearchOperations;

  constructor(column: string | FilterInput[], value?: string | FilterInput[], operation?: SearchOperations) {
      this.column = column;
      this.value = value ?? '';
      this.operation = operation ?? '' as SearchOperations;
  }
}

export class SelectLocalization {
  placeholder: string = '';
  selectAll: string = 'Select all';
  clearSelection: string = 'Clear selection';
  search: string = 'Search';
  noData: string = 'No data';
  required: string = 'This field is required';

  constructor(selectLocalization?: SelectLocalization) {
    let that = <any>this;
    let s = <any>selectLocalization;
    if(selectLocalization)
      Object.keys(selectLocalization).forEach((key: any) => {
        if (s[key]) {
          that[`${key}`] = s[`${key}`]
        }
      })
  }
}